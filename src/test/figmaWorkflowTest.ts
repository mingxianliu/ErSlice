/**
 * Figma 匯入工作流程測試
 * 測試「系統管理」資料夾結構的解析
 */

import FigmaImportWorkflow from '../services/figmaImportWorkflow'

// 模擬「系統管理」資料夾的檔案結構
const mockSystemManagementFiles = [
  // Dialog 組件
  new File([''], '全域管理/Dialog/安全掃描.png', { type: 'image/png' }),
  new File([''], '全域管理/Dialog/清除快取.png', { type: 'image/png' }),
  new File([''], '全域管理/Dialog/清除日誌.png', { type: 'image/png' }),
  new File([''], '全域管理/Dialog/系統備份.png', { type: 'image/png' }),
  new File([''], '全域管理/Dialog/系統更新.png', { type: 'image/png' }),
  new File([''], '全域管理/Dialog/重啟系統服務.png', { type: 'image/png' }),
  
  // Left Drawer 組件
  new File([''], '全域管理/Left Drawer/選單顯示.png', { type: 'image/png' }),
  
  // Page 組件
  new File([''], '全域管理/Page/預設畫面.png', { type: 'image/png' }),
  
  // Toast 組件
  new File([''], '全域管理/Toast/清除快取/Success.png', { type: 'image/png' }),
  new File([''], '全域管理/Toast/清除日誌/Success.png', { type: 'image/png' })
]

/**
 * 測試資料夾結構解析
 */
export async function testFolderStructureParsing() {
  console.log('🧪 開始測試資料夾結構解析...')
  
  const workflow = new FigmaImportWorkflow()
  
  try {
    // 測試完整的匯入工作流程
    const result = await workflow.executeCompleteWorkflow(mockSystemManagementFiles)
    
    if (result.success) {
      console.log('✅ 測試成功！')
      console.log('📊 設計模組:', result.module.name)
      console.log('📦 切版包:', result.slicePackage.name)
      
      // 驗證資料夾結構
      validateFolderStructure(result.module.structure)
      
      // 驗證生成的檔案
      validateGeneratedFiles(result.slicePackage.files)
      
      // 驗證文檔
      validateDocumentation(result.slicePackage.documentation)
      
    } else {
      console.error('❌ 測試失敗:', result.message)
    }
    
  } catch (error) {
    console.error('❌ 測試執行錯誤:', error)
  }
}

/**
 * 驗證資料夾結構
 */
function validateFolderStructure(structure: any) {
  console.log('📁 驗證資料夾結構...')
  
  // 檢查根模組
  if (structure.name !== 'root') {
    console.error('❌ 根模組名稱錯誤:', structure.name)
    return
  }
  
  // 檢查第一層：全域管理
  if (structure.children.length === 0) {
    console.error('❌ 缺少子資料夾')
    return
  }
  
  const globalManagement = structure.children[0]
  if (globalManagement.name !== '全域管理') {
    console.error('❌ 第一層資料夾名稱錯誤:', globalManagement.name)
    return
  }
  
  // 檢查第二層：Dialog, Left Drawer, Page, Toast
  const expectedComponents = ['Dialog', 'Left Drawer', 'Page', 'Toast']
  const actualComponents = globalManagement.children.map((c: any) => c.name)
  
  console.log('🔍 檢測到的組件:', actualComponents)
  
  expectedComponents.forEach(expected => {
    if (!actualComponents.includes(expected)) {
      console.warn('⚠️ 缺少組件:', expected)
    }
  })
  
  // 檢查 Dialog 組件
  const dialogComponent = globalManagement.children.find((c: any) => c.name === 'Dialog')
  if (dialogComponent) {
    console.log('✅ Dialog 組件檢測成功，包含資產:', dialogComponent.assets)
  }
  
  // 檢查 Toast 組件及其子資料夾
  const toastComponent = globalManagement.children.find((c: any) => c.name === 'Toast')
  if (toastComponent) {
    console.log('✅ Toast 組件檢測成功')
    if (toastComponent.children.length > 0) {
      console.log('📂 Toast 子資料夾:', toastComponent.children.map((c: any) => c.name))
    }
  }
  
  console.log('✅ 資料夾結構驗證完成')
}

/**
 * 驗證生成的檔案
 */
function validateGeneratedFiles(files: any[]) {
  console.log('📄 驗證生成的檔案...')
  
  const expectedFiles = [
    '全域管理/',
    '全域管理/Dialog/',
    '全域管理/Left Drawer/',
    '全域管理/Page/',
    '全域管理/Toast/',
    '全域管理/Toast/清除快取/',
    '全域管理/Toast/清除日誌/',
    '全域管理/Dialog/安全掃描.html',
    '全域管理/Dialog/安全掃描.css',
    '全域管理/Left Drawer/選單顯示.html',
    '全域管理/Left Drawer/選單顯示.css',
    '全域管理/Page/預設畫面.html',
    '全域管理/Page/預設畫面.css',
    '全域管理/Toast/清除快取/Success.html',
    '全域管理/Toast/清除快取/Success.css',
    '全域管理/Toast/清除日誌/Success.html',
    '全域管理/Toast/清除日誌/Success.css'
  ]
  
  const actualFiles = files.map(f => f.path)
  console.log('📄 實際生成的檔案數量:', actualFiles.length)
  
  expectedFiles.forEach(expected => {
    if (!actualFiles.includes(expected)) {
      console.warn('⚠️ 缺少檔案:', expected)
    }
  })
  
  console.log('✅ 檔案生成驗證完成')
}

/**
 * 驗證文檔
 */
function validateDocumentation(docs: any) {
  console.log('📚 驗證生成的文檔...')
  
  // 檢查 README
  if (!docs.readme || docs.readme.length < 100) {
    console.error('❌ README 文檔過短或缺失')
  } else {
    console.log('✅ README 文檔生成成功，長度:', docs.readme.length)
  }
  
  // 檢查 Mermaid 圖表
  if (!docs.mermaidDiagram || !docs.mermaidDiagram.includes('graph TD')) {
    console.error('❌ Mermaid 圖表生成失敗')
  } else {
    console.log('✅ Mermaid 圖表生成成功')
  }
  
  // 檢查組件規格
  if (!docs.componentSpecs || docs.componentSpecs.length < 100) {
    console.error('❌ 組件規格文檔過短或缺失')
  } else {
    console.log('✅ 組件規格文檔生成成功，長度:', docs.componentSpecs.length)
  }
  
  // 檢查開發指南
  if (!docs.developmentGuide || docs.developmentGuide.length < 100) {
    console.error('❌ 開發指南文檔過短或缺失')
  } else {
    console.log('✅ 開發指南文檔生成成功，長度:', docs.developmentGuide.length)
  }
  
  console.log('✅ 文檔生成驗證完成')
}

/**
 * 執行測試
 */
export async function runAllTests() {
  console.log('🚀 開始執行 Figma 匯入工作流程測試...')
  console.log('📁 測試資料夾結構: 系統管理/全域管理/...')
  
  await testFolderStructureParsing()
  
  console.log('🎯 所有測試完成！')
}

// 如果直接執行此檔案，則執行測試
if (typeof window !== 'undefined') {
  // 瀏覽器環境
  (window as any).runFigmaWorkflowTest = runAllTests
} else {
  // Node.js 環境
  runAllTests()
}
