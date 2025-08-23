/**
 * Figma 匯入完整工作流程服務
 * 實現一鍵完成：匯入 → 分析 → 建立模組 → 生成切版包
 */

import { FigmaAnalysisController, ComprehensiveAnalysisResult } from './figmaAnalysisController'
import { FigmaFileProcessor, FigmaImportResult } from './figmaFileProcessor'
import { FigmaAssetParser, ParsedAssetInfo } from './figmaParser'
// 使用統一的 Tauri 導入處理
import { typedInvoke } from '../utils/tauriCommands'

export interface FolderStructure {
  name: string
  type: 'module' | 'page' | 'subpage' | 'asset'
  path: string
  children: FolderStructure[]
  assets: string[]
  metadata: {
    description?: string
    device?: string
    state?: string
    complexity?: number
  }
}

export interface DesignModuleTemplate {
  id: string
  name: string
  description: string
  structure: FolderStructure
  assets: string[]
  analysis: ComprehensiveAnalysisResult
  estimatedTime: string
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise'
}

export interface SlicePackage {
  id: string
  name: string
  description: string
  structure: FolderStructure
  files: GeneratedFile[]
  documentation: Documentation
  createdAt: string
}

export interface GeneratedFile {
  path: string
  content: string
  type: 'folder' | 'file'
  metadata?: any
}

export interface Documentation {
  readme: string
  mermaidDiagram: string
  componentSpecs: string
  developmentGuide: string
}

export interface WorkflowProgress {
  stage: 'file-processing' | 'analysis' | 'structure-parsing' | 'module-creation' | 'package-generation'
  progress: number // 0-100
  message: string
  details?: any
}

export interface WorkflowProgressCallback {
  (progress: WorkflowProgress): void
}

export class FigmaImportWorkflow {
  private analysisController: FigmaAnalysisController
  private fileProcessor: FigmaFileProcessor
  private assetParser: FigmaAssetParser
  private progressCallback?: WorkflowProgressCallback

  constructor() {
    this.analysisController = new FigmaAnalysisController()
    this.fileProcessor = new FigmaFileProcessor()
    this.assetParser = new FigmaAssetParser()
  }

  /**
   * 設置進度回調函數
   */
  setProgressCallback(callback: WorkflowProgressCallback): void {
    this.progressCallback = callback
  }

  /**
   * 更新進度
   */
  private updateProgress(stage: WorkflowProgress['stage'], progress: number, message: string, details?: any): void {
    if (this.progressCallback) {
      this.progressCallback({
        stage,
        progress,
        message,
        details
      })
    }
  }

  /**
   * 一鍵完成 Figma 匯入工作流程
   */
  async executeCompleteWorkflow(files: File[]): Promise<{
    module: DesignModuleTemplate
    slicePackage: SlicePackage
    success: boolean
    message: string
  }> {
    try {
      console.log('🚀 開始執行完整的 Figma 匯入工作流程...')
      this.updateProgress('file-processing', 0, '開始處理檔案...', { totalFiles: files.length })

      // 步驟 1: 處理檔案並分析
      this.updateProgress('file-processing', 20, '正在處理檔案...', { processedFiles: 0, totalFiles: files.length })
      const importResult = await this.fileProcessor.processFiles(files)
      this.updateProgress('file-processing', 40, '檔案處理完成，開始分析...', { processedFiles: files.length, totalFiles: files.length })
      
      this.updateProgress('analysis', 50, '正在執行智能分析...', { stage: '四維分析' })
      const analysis = await this.analysisController.analyzeComplete(files)
      this.updateProgress('analysis', 70, '智能分析完成', { analysisResult: analysis })

      // 步驟 2: 解析資料夾結構
      this.updateProgress('structure-parsing', 75, '正在解析資料夾結構...', { stage: '結構分析' })
      const folderStructure = this.parseFolderStructure(files, importResult)
      this.updateProgress('structure-parsing', 80, '資料夾結構解析完成', { structure: folderStructure })

      // 步驟 3: 建立設計模組
      this.updateProgress('module-creation', 85, '正在建立設計模組...', { stage: '模組建立' })
      const designModule = await this.createDesignModule(folderStructure, analysis)
      this.updateProgress('module-creation', 90, '設計模組建立完成', { module: designModule })

      // 步驟 4: 生成切版包
      this.updateProgress('package-generation', 95, '正在生成切版包...', { stage: '切版包生成' })
      const slicePackage = await this.generateSlicePackage(designModule, folderStructure)
      this.updateProgress('package-generation', 100, '切版包生成完成', { package: slicePackage })

      console.log('✅ Figma 匯入工作流程完成！')

      return {
        module: designModule,
        slicePackage,
        success: true,
        message: '成功完成 Figma 匯入工作流程'
      }

    } catch (error) {
      console.error('❌ Figma 匯入工作流程失敗:', error)
      // 更新失敗進度
      this.updateProgress('package-generation', 0, '工作流程執行失敗', { error: error instanceof Error ? error.message : '未知錯誤' })
      
      return {
        module: {} as DesignModuleTemplate,
        slicePackage: {} as SlicePackage,
        success: false,
        message: error instanceof Error ? error.message : '未知錯誤'
      }
    }
  }

  /**
   * 解析資料夾結構
   */
  private parseFolderStructure(files: File[], importResult: FigmaImportResult): FolderStructure {
    console.log('📁 開始解析資料夾結構...')

    // 從檔案路徑推斷資料夾結構
    const folderMap = new Map<string, FolderStructure>()
    const rootStructure: FolderStructure = {
      name: 'root',
      type: 'module',
      path: '/',
      children: [],
      assets: [],
      metadata: {}
    }

    // 分析每個檔案的資料夾路徑
    files.forEach(file => {
      const pathParts = this.extractPathParts(file.name)
      this.buildFolderHierarchy(pathParts, file.name, folderMap, rootStructure)
    })

    // 優化資料夾結構
    this.optimizeFolderStructure(rootStructure)

    console.log('📁 資料夾結構解析完成:', rootStructure)
    return rootStructure
  }

  /**
   * 從檔案名稱提取路徑部分
   */
  private extractPathParts(fileName: string): string[] {
    // 支援多種命名格式：
    // "全域管理/Page/預設畫面.png" -> ["全域管理", "Page", "預設畫面"]
    // "全域管理/Dialog/安全掃描.png" -> ["全域管理", "Dialog", "安全掃描"]
    // "全域管理/Toast/清除快取/Success.png" -> ["全域管理", "Toast", "清除快取", "Success"]
    // "Desktop_UserMgmt_List_Default@2x.png" -> ["Desktop", "UserMgmt", "List", "Default"]
    
    if (fileName.includes('/') || fileName.includes('\\')) {
      // 資料夾分隔符格式
      return fileName.split(/[\/\\]/).map(part => part.trim()).filter(Boolean)
    } else {
      // 下劃線分隔格式
      return fileName.split('_').map(part => part.trim()).filter(Boolean)
    }
  }

  /**
   * 建立資料夾層級結構
   */
  private buildFolderHierarchy(
    pathParts: string[], 
    fileName: string, 
    folderMap: Map<string, FolderStructure>,
    parent: FolderStructure
  ) {
    let currentPath = parent.path
    let currentParent = parent

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i]
      const fullPath = `${currentPath}${part}/`
      
      if (!folderMap.has(fullPath)) {
        const folder: FolderStructure = {
          name: part,
          type: this.determineFolderType(part, i, pathParts),
          path: fullPath,
          children: [],
          assets: [],
          metadata: this.extractFolderMetadata(part, i, pathParts)
        }
        
        folderMap.set(fullPath, folder)
        currentParent.children.push(folder)
      }
      
      currentParent = folderMap.get(fullPath)!
      currentPath = fullPath
    }

    // 最後一個部分是檔案，添加到當前資料夾的資產列表
    const fileNameWithoutExt = pathParts[pathParts.length - 1].split('.')[0]
    currentParent.assets.push(fileNameWithoutExt)
  }

  /**
   * 判斷資料夾類型
   */
  private determineFolderType(part: string, index: number, allParts: string[]): 'module' | 'page' | 'subpage' | 'asset' {
    const partLower = part.toLowerCase()
    
    // 根據位置和名稱判斷類型
    if (index === 0) {
      // 第一層通常是模組
      if (partLower.includes('管理') || partLower.includes('management')) return 'module'
      if (partLower.includes('系統') || partLower.includes('system')) return 'module'
      return 'module'
    } else if (index === 1) {
      // 第二層通常是頁面組件類型
      if (partLower.includes('page') || partLower.includes('頁面')) return 'page'
      if (partLower.includes('dialog') || partLower.includes('對話')) return 'page'
      if (partLower.includes('toast') || partLower.includes('提示')) return 'page'
      if (partLower.includes('drawer') || partLower.includes('抽屜')) return 'page'
      return 'page'
    } else if (index === 2) {
      // 第三層通常是子頁面或狀態
      if (partLower.includes('success') || partLower.includes('成功')) return 'subpage'
      if (partLower.includes('error') || partLower.includes('錯誤')) return 'subpage'
      if (partLower.includes('loading') || partLower.includes('載入')) return 'subpage'
      return 'subpage'
    }
    
    return 'asset'
  }

  /**
   * 提取資料夾元數據
   */
  private extractFolderMetadata(part: string, index: number, allParts: string[]): any {
    const metadata: any = {}
    
    // 根據資料夾名稱提取元數據
    if (part.includes('成功') || part.includes('Success')) {
      metadata.state = 'success'
      metadata.description = '成功狀態提示'
    } else if (part.includes('錯誤') || part.includes('Error')) {
      metadata.state = 'error'
      metadata.description = '錯誤狀態提示'
    } else if (part.includes('載入') || part.includes('Loading')) {
      metadata.state = 'loading'
      metadata.description = '載入狀態'
    }
    
    // 根據資料夾類型判斷複雜度和描述
    if (index === 0) {
      // 模組層級
      metadata.complexity = 'moderate'
      if (part.includes('系統')) {
        metadata.description = '系統管理模組'
        metadata.category = 'system-management'
      } else if (part.includes('全域')) {
        metadata.description = '全域管理功能'
        metadata.category = 'global-management'
      }
    } else if (index === 1) {
      // 頁面組件層級
      metadata.complexity = 'simple'
      if (part.includes('Dialog')) {
        metadata.description = '對話框組件'
        metadata.componentType = 'dialog'
      } else if (part.includes('Toast')) {
        metadata.description = '提示訊息組件'
        metadata.componentType = 'toast'
      } else if (part.includes('Page')) {
        metadata.description = '頁面組件'
        metadata.componentType = 'page'
      } else if (part.includes('Drawer')) {
        metadata.description = '抽屜組件'
        metadata.componentType = 'drawer'
      }
    } else if (index === 2) {
      // 狀態層級
      metadata.complexity = 'simple'
      metadata.description = `${metadata.state || '狀態'} 組件`
    }
    
    return metadata
  }

  /**
   * 優化資料夾結構
   */
  private optimizeFolderStructure(structure: FolderStructure) {
    // 移除空的資料夾
    structure.children = structure.children.filter(child => 
      child.children.length > 0 || child.assets.length > 0
    )
    
    // 遞歸優化子資料夾
    structure.children.forEach(child => this.optimizeFolderStructure(child))
    
    // 合併相似的資料夾
    this.mergeSimilarFolders(structure)
  }

  /**
   * 合併相似的資料夾
   */
  private mergeSimilarFolders(structure: FolderStructure) {
    const similarGroups = new Map<string, FolderStructure[]>()
    
    structure.children.forEach(child => {
      const key = this.getSimilarityKey(child)
      if (!similarGroups.has(key)) {
        similarGroups.set(key, [])
      }
      similarGroups.get(key)!.push(child)
    })
    
    // 合併相似組
    similarGroups.forEach((group, key) => {
      if (group.length > 1) {
        const merged = this.mergeFolders(group)
        structure.children = structure.children.filter(child => !group.includes(child))
        structure.children.push(merged)
      }
    })
  }

  /**
   * 獲取資料夾相似性鍵值
   */
  private getSimilarityKey(folder: FolderStructure): string {
    return `${folder.type}_${folder.metadata.state || 'default'}`
  }

  /**
   * 合併資料夾
   */
  private mergeFolders(folders: FolderStructure[]): FolderStructure {
    const merged: FolderStructure = {
      name: folders[0].name,
      type: folders[0].type,
      path: folders[0].path,
      children: [],
      assets: [],
      metadata: { ...folders[0].metadata }
    }
    
    folders.forEach(folder => {
      merged.children.push(...folder.children)
      merged.assets.push(...folder.assets)
    })
    
    return merged
  }

  /**
   * 建立設計模組
   */
  private async createDesignModule(
    folderStructure: FolderStructure, 
    analysis: ComprehensiveAnalysisResult
  ): Promise<DesignModuleTemplate> {
    console.log('🏗️ 開始建立設計模組...')

    const moduleName = this.extractModuleName(folderStructure)
    const moduleId = `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const designModule: DesignModuleTemplate = {
      id: moduleId,
      name: moduleName,
      description: this.generateModuleDescription(folderStructure, analysis),
      structure: folderStructure,
      assets: this.collectAllAssets(folderStructure),
      analysis,
      estimatedTime: analysis.overview.estimatedDevelopmentTime,
      complexity: analysis.overview.designComplexity
    }

    // 嘗試保存到資料庫
    try {
      await this.saveDesignModuleToDatabase(designModule)
      console.log('💾 設計模組已保存到資料庫')
    } catch (error) {
      console.warn('⚠️ 保存到資料庫失敗，使用本地存儲:', error)
      this.saveDesignModuleToLocal(designModule)
    }

    console.log('🏗️ 設計模組建立完成:', designModule)
    return designModule
  }

  /**
   * 提取模組名稱
   */
  private extractModuleName(structure: FolderStructure): string {
    // 從根資料夾名稱提取模組名稱
    if (structure.children.length > 0) {
      const firstChild = structure.children[0]
      // 根據實際資料夾結構，第一層是「全域管理」，第二層才是具體組件
      if (firstChild.name === '全域管理') {
        return '系統管理模組'
      }
      return firstChild.name || '未命名模組'
    }
    return structure.name || '未命名模組'
  }

  /**
   * 生成模組描述
   */
  private generateModuleDescription(structure: FolderStructure, analysis: ComprehensiveAnalysisResult): string {
    const moduleCount = structure.children.length
    const assetCount = this.collectAllAssets(structure).length
    
    return `基於 Figma 設計稿自動生成的設計模組，包含 ${moduleCount} 個主要功能區域，共 ${assetCount} 個設計資產。支援 ${analysis.overview.primaryDevices.join('、')} 等設備，預計開發時間 ${analysis.overview.estimatedDevelopmentTime}。`
  }

  /**
   * 收集所有資產
   */
  private collectAllAssets(structure: FolderStructure): string[] {
    const assets: string[] = []
    
    const collectRecursive = (node: FolderStructure) => {
      assets.push(...node.assets)
      node.children.forEach(child => collectRecursive(child))
    }
    
    collectRecursive(structure)
    return assets
  }

  /**
   * 保存設計模組到資料庫
   */
  private async saveDesignModuleToDatabase(module: DesignModuleTemplate): Promise<void> {
    try {
      if (typedInvoke) {
        await typedInvoke('create_design_module_in_db', {
          module: {
            id: module.id,
            name: module.name,
            description: module.description,
            status: 'active',
            asset_count: module.assets.length,
            project_slugs: JSON.stringify(['figma-import']),
            primary_project: 'figma-import',
            created_from: 'figma-import',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        })
      } else {
        console.log('Tauri API 不可用，使用本地存儲')
        throw new Error('Tauri API 不可用')
      }
    } catch (error) {
      throw new Error(`保存到資料庫失敗: ${error}`)
    }
  }

  /**
   * 保存設計模組到本地存儲
   */
  private saveDesignModuleToLocal(module: DesignModuleTemplate): void {
    try {
      const existingModules = JSON.parse(localStorage.getItem('erslice-design-modules') || '[]')
      existingModules.push(module)
      localStorage.setItem('erslice-design-modules', JSON.stringify(existingModules))
    } catch (error) {
      console.warn('保存到本地存儲失敗:', error)
    }
  }

  /**
   * 生成切版包
   */
  private async generateSlicePackage(
    designModule: DesignModuleTemplate, 
    folderStructure: FolderStructure
  ): Promise<SlicePackage> {
    console.log('📦 開始生成切版包...')

    const packageId = `package_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 生成檔案結構
    const files = this.generateFileStructure(folderStructure)
    
    // 生成文檔
    const documentation = this.generateDocumentation(designModule, folderStructure)
    
    const slicePackage: SlicePackage = {
      id: packageId,
      name: `${designModule.name} 切版包`,
      description: `基於 ${designModule.name} 設計模組生成的完整切版包，包含所有必要的檔案和文檔。`,
      structure: folderStructure,
      files,
      documentation,
      createdAt: new Date().toISOString()
    }

    console.log('📦 切版包生成完成:', slicePackage)
    return slicePackage
  }

  /**
   * 生成檔案結構
   */
  private generateFileStructure(structure: FolderStructure): GeneratedFile[] {
    const files: GeneratedFile[] = []
    
    const generateRecursive = (node: FolderStructure, currentPath: string) => {
      // 建立資料夾
      if (node.children.length > 0 || node.assets.length > 0) {
        files.push({
          path: currentPath,
          content: '',
          type: 'folder',
          metadata: {
            name: node.name,
            type: node.type,
            description: node.metadata.description
          }
        })
      }
      
      // 處理子資料夾
      node.children.forEach(child => {
        const childPath = `${currentPath}${child.name}/`
        generateRecursive(child, childPath)
      })
      
      // 處理資產檔案
      node.assets.forEach(asset => {
        files.push({
          path: `${currentPath}${asset}.html`,
          content: this.generateHTMLTemplate(asset, node),
          type: 'file',
          metadata: {
            name: asset,
            type: 'html',
            description: `${asset} 頁面的 HTML 模板`
          }
        })
        
        files.push({
          path: `${currentPath}${asset}.css`,
          content: this.generateCSSTemplate(asset, node),
          type: 'file',
          metadata: {
            name: asset,
            type: 'css',
            description: `${asset} 頁面的 CSS 樣式`
          }
        })
      })
    }
    
    generateRecursive(structure, '')
    return files
  }

  /**
   * 生成 HTML 模板
   */
  private generateHTMLTemplate(assetName: string, node: FolderStructure): string {
    const title = this.formatAssetName(assetName)
    const device = node.metadata.device || 'desktop'
    
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="${assetName}.css">
</head>
<body>
    <div class="container ${device}">
        <header class="header">
            <h1>${title}</h1>
        </header>
        
        <main class="main-content">
            <!-- 主要內容區域 -->
            <div class="content-wrapper">
                <h2>${title} 內容</h2>
                <p>這是基於 Figma 設計稿自動生成的 ${title} 頁面。</p>
            </div>
        </main>
        
        <footer class="footer">
            <p>&copy; 2024 ${title}</p>
        </footer>
    </div>
</body>
</html>`
  }

  /**
   * 生成 CSS 模板
   */
  private generateCSSTemplate(assetName: string, node: FolderStructure): string {
    const device = node.metadata.device || 'desktop'
    
    return `/* ${assetName} 頁面樣式 */
/* 基於 Figma 設計稿自動生成 */

/* 響應式斷點 */
@media (max-width: 768px) {
    .container { padding: 1rem; }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .container { padding: 2rem; }
}

@media (min-width: 1025px) {
    .container { padding: 3rem; }
}

/* 基礎樣式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    background-color: #fff;
    padding: 1rem 0;
    border-bottom: 1px solid #e0e0e0;
    text-align: center;
}

.header h1 {
    color: #2c3e50;
    font-size: 2rem;
    font-weight: 600;
}

.main-content {
    flex: 1;
    padding: 2rem 0;
}

.content-wrapper {
    background-color: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.content-wrapper h2 {
    color: #34495e;
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.content-wrapper p {
    color: #7f8c8d;
    line-height: 1.8;
}

.footer {
    background-color: #2c3e50;
    color: #fff;
    text-align: center;
    padding: 1rem 0;
    margin-top: auto;
}

/* 設備特定樣式 */
.${device} .container {
    /* ${device} 特定樣式 */
}

/* 狀態樣式 */
.${node.metadata.state || 'default'} {
    /* ${node.metadata.state || 'default'} 狀態樣式 */
}`
  }

  /**
   * 格式化資產名稱
   */
  private formatAssetName(assetName: string): string {
    // 將下劃線或連字符轉換為空格，並首字母大寫
    return assetName
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * 生成文檔
   */
  private generateDocumentation(designModule: DesignModuleTemplate, structure: FolderStructure): Documentation {
    return {
      readme: this.generateReadme(designModule, structure),
      mermaidDiagram: this.generateMermaidDiagram(structure),
      componentSpecs: this.generateComponentSpecs(designModule, structure),
      developmentGuide: this.generateDevelopmentGuide(designModule, structure)
    }
  }

  /**
   * 生成 README 文檔
   */
  private generateReadme(designModule: DesignModuleTemplate, structure: FolderStructure): string {
    return `# ${designModule.name} 切版包

## 概述

這是基於 Figma 設計稿自動生成的 ${designModule.name} 切版包，包含完整的頁面結構、樣式和文檔。

## 專案資訊

- **模組名稱**: ${designModule.name}
- **複雜度**: ${designModule.complexity}
- **預計開發時間**: ${designModule.estimatedTime}
- **支援設備**: ${designModule.analysis.overview.primaryDevices.join(', ')}
- **總資產數**: ${designModule.analysis.overview.totalAssets}

## 檔案結構

\`\`\`
${this.generateFileTree(structure)}
\`\`\`

## 快速開始

1. 解壓縮切版包到您的專案目錄
2. 根據需要修改 HTML 和 CSS 檔案
3. 整合到您的開發框架中

## 技術規格

- **響應式設計**: 支援桌面、平板、手機
- **無障礙**: 符合 WCAG 2.1 AA 標準
- **瀏覽器支援**: 現代瀏覽器 (Chrome 90+, Firefox 88+, Safari 14+)

## 開發指南

詳細的開發指南請參考 \`development-guide.md\` 檔案。

## 授權

本切版包僅供學習和開發使用。
`
  }

  /**
   * 生成檔案樹結構
   */
  private generateFileTree(structure: FolderStructure, indent: string = ''): string {
    let tree = ''
    
    if (structure.children.length > 0 || structure.assets.length > 0) {
      tree += `${indent}${structure.name}/\n`
      
      // 子資料夾
      structure.children.forEach(child => {
        tree += this.generateFileTree(child, indent + '  ')
      })
      
      // 資產檔案
      structure.assets.forEach(asset => {
        tree += `${indent}  ├── ${asset}.html\n`
        tree += `${indent}  └── ${asset}.css\n`
      })
    }
    
    return tree
  }

  /**
   * 生成 Mermaid 圖表
   */
  private generateMermaidDiagram(structure: FolderStructure): string {
    return `graph TD
    A[${structure.name}] --> B[模組層級]
    
    ${this.generateMermaidNodes(structure, 'B')}
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0`
  }

  /**
   * 生成 Mermaid 節點
   */
  private generateMermaidNodes(structure: FolderStructure, parentId: string, level: number = 0): string {
    if (level > 3) return '' // 限制層級深度
    
    let nodes = ''
    let nodeCounter = 0
    
    structure.children.forEach(child => {
      const childId = `${parentId}_${nodeCounter++}`
      const nodeType = this.getNodeType(child.type)
      
      nodes += `    ${parentId} --> ${childId}[${child.name}<br/>${nodeType}]\n`
      
      if (child.children.length > 0) {
        nodes += this.generateMermaidNodes(child, childId, level + 1)
      }
    })
    
    return nodes
  }

  /**
   * 獲取節點類型標籤
   */
  private getNodeType(type: string): string {
    const typeMap: Record<string, string> = {
      'module': '模組',
      'page': '頁面',
      'subpage': '子頁面',
      'asset': '資產'
    }
    return typeMap[type] || type
  }

  /**
   * 生成組件規格
   */
  private generateComponentSpecs(designModule: DesignModuleTemplate, structure: FolderStructure): string {
    return `# ${designModule.name} 組件規格

## 組件概述

本模組包含以下主要組件類型：

${this.generateComponentList(structure)}

## 設計令牌

### 顏色系統
${this.generateColorTokens(designModule)}

### 字體系統
${this.generateTypographyTokens(designModule)}

### 間距系統
${this.generateSpacingTokens(designModule)}

## 響應式斷點

- **手機**: 375px - 767px
- **平板**: 768px - 1023px
- **桌面**: 1024px+

## 無障礙要求

- 顏色對比度: 4.5:1 (AA 標準)
- 鍵盤導航支援
- 螢幕閱讀器相容
- 焦點指示器清晰可見
`
  }

  /**
   * 生成組件列表
   */
  private generateComponentList(structure: FolderStructure): string {
    let list = ''
    
    const generateListRecursive = (node: FolderStructure, level: number = 0) => {
      const indent = '  '.repeat(level)
      list += `${indent}- **${node.name}** (${node.type})\n`
      
      if (node.assets.length > 0) {
        list += `${indent}  - 資產: ${node.assets.join(', ')}\n`
      }
      
      node.children.forEach(child => generateListRecursive(child, level + 1))
    }
    
    generateListRecursive(structure)
    return list
  }

  /**
   * 生成顏色令牌
   */
  private generateColorTokens(designModule: DesignModuleTemplate): string {
    const colors = designModule.analysis.designSystem?.tokens?.colors
    if (!colors) return '未檢測到顏色令牌'
    
    return `- **主色**: ${Object.keys(colors.primary || {}).join(', ') || '未定義'}
- **輔助色**: ${Object.keys(colors.secondary || {}).join(', ') || '未定義'}
- **中性色**: ${Object.keys(colors.neutral || {}).join(', ') || '未定義'}
- **語義色**: ${Object.keys(colors.semantic || {}).join(', ') || '未定義'}`
  }

  /**
   * 生成字體令牌
   */
  private generateTypographyTokens(designModule: DesignModuleTemplate): string {
    const typography = designModule.analysis.designSystem?.tokens?.typography
    if (!typography) return '未檢測到字體令牌'
    
    return `- **字體族**: ${Object.keys(typography.fontFamilies || {}).join(', ') || '未定義'}
- **字重**: ${Object.keys(typography.fontWeights || {}).join(', ') || '未定義'}
- **字體大小**: ${Object.keys(typography.fontSizes || {}).join(', ') || '未定義'}`
  }

  /**
   * 生成間距令牌
   */
  private generateSpacingTokens(designModule: DesignModuleTemplate): string {
    const spacing = designModule.analysis.designSystem?.tokens?.spacing
    if (!spacing) return '未檢測到間距令牌'
    
    return `- **基準間距**: ${spacing.base || 4}px
- **間距比例**: ${Object.keys(spacing.scale || {}).join(', ') || '未定義'}`
  }

  /**
   * 生成開發指南
   */
  private generateDevelopmentGuide(designModule: DesignModuleTemplate, structure: FolderStructure): string {
    return `# ${designModule.name} 開發指南

## 開發環境設置

### 必要工具
- Node.js 16+
- 現代瀏覽器
- 程式碼編輯器 (VS Code 推薦)

### 專案結構
\`\`\`
${this.generateFileTree(structure)}
\`\`\`

## 開發流程

### 1. 頁面開發
1. 從 HTML 模板開始
2. 根據設計稿調整 CSS 樣式
3. 實現響應式佈局
4. 添加交互功能

### 2. 組件開發
1. 識別可重用組件
2. 建立組件庫
3. 實現組件變體
4. 編寫組件文檔

### 3. 測試與優化
1. 跨瀏覽器測試
2. 響應式測試
3. 無障礙測試
4. 性能優化

## 最佳實踐

### CSS 組織
- 使用 BEM 命名規範
- 建立設計令牌系統
- 實現響應式設計
- 優化選擇器性能

### HTML 語義化
- 使用適當的語義標籤
- 實現無障礙功能
- 優化 SEO 結構
- 保持代碼整潔

### JavaScript 功能
- 使用現代 ES6+ 語法
- 實現漸進增強
- 處理錯誤情況
- 優化用戶體驗

## 部署指南

### 生產環境
1. 壓縮 CSS 和 JavaScript
2. 優化圖片資源
3. 啟用 Gzip 壓縮
4. 設置快取策略

### 性能監控
1. 使用 Lighthouse 測試
2. 監控 Core Web Vitals
3. 分析用戶行為
4. 持續優化

## 故障排除

### 常見問題
1. **樣式不生效**: 檢查 CSS 選擇器優先級
2. **響應式問題**: 驗證媒體查詢斷點
3. **無障礙錯誤**: 使用 axe-core 檢查
4. **性能問題**: 分析資源載入時間

### 調試工具
- 瀏覽器開發者工具
- CSS 驗證器
- HTML 驗證器
- 無障礙檢查工具

## 支援與維護

### 文檔更新
- 保持文檔與代碼同步
- 記錄 API 變更
- 更新使用範例
- 維護故障排除指南

### 版本管理
- 使用語義化版本號
- 記錄變更日誌
- 標記重要更新
- 維護向後相容性
`
  }
}

export default FigmaImportWorkflow
