// ErSlice Tauri 命令調用工具

import { handleTauriError, getUserFriendlyMessage } from './errorHandler'

// 動態導入 Tauri API 以支援瀏覽器環境
let invoke: any = null

try {
  // 嘗試導入 Tauri API
  import('@tauri-apps/api/core').then(({ invoke: tauriInvoke }) => {
    invoke = tauriInvoke
  })
} catch (error) {
  console.log('Tauri API 不可用，運行在瀏覽器環境')
}

// 類型安全的 invoke 包裝函數
function typedInvoke<T>(command: string, args?: any): Promise<T> {
  if (!invoke) {
    throw new Error('Tauri API 不可用')
  }
  return invoke(command, args)
}

// 檢查是否在 Tauri 環境中
export const isTauriEnvironment = () => {
  return typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined
}

// 設計模組介面
export interface DesignModule {
  id: string
  name: string
  description: string
  asset_count: number
  last_updated: string
  status: string
  // 新增專案相關字段
  project_slugs?: string[] // 使用這個模組的專案列表
  primary_project?: string // 主要所屬專案
  created_from?: 'manual' | 'figma-import' | 'template' // 模組來源
}

// 資產清單介面
export interface AssetList {
  screenshots: string[]
  html: string[]
  css: string[]
}

// 列出資產
export async function listAssets(assetPath: string): Promise<AssetList> {
  try {
    const result = await typedInvoke<AssetList>('list_assets', { assetPath })
    return result
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 刪除資產
export async function deleteDesignAsset(
  assetPath: string,
  assetType: 'screenshots' | 'html' | 'css',
  fileName: string
): Promise<string> {
  try {
    return await typedInvoke<string>('delete_design_asset', { assetPath, assetType, fileName })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 封存模組
export async function archiveDesignModule(moduleName: string): Promise<string> {
  try {
    return await typedInvoke<string>('archive_design_module', { moduleName })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 刪除模組
export async function deleteDesignModule(moduleName: string): Promise<string> {
  try {
    return await typedInvoke<string>('delete_design_module', { moduleName })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 還原封存模組
export async function unarchiveDesignModule(moduleName: string): Promise<string> {
  try {
    return await typedInvoke<string>('unarchive_design_module', { moduleName })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 創建設計模組
export async function createDesignModule(
  name: string,
  description: string
): Promise<DesignModule> {
  try {
    const result = await typedInvoke<DesignModule>('create_design_module', {
      name,
      description
    })
    return result
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 獲取設計模組列表
export async function getDesignModules(): Promise<DesignModule[]> {
  try {
    const result = await typedInvoke<DesignModule[]>('get_design_modules')
    return result
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 獲取封存的設計模組列表
export async function getArchivedDesignModules(): Promise<DesignModule[]> {
  try {
    const result = await typedInvoke<DesignModule[]>('get_archived_design_modules')
    return result
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 上傳設計資產
export async function uploadDesignAsset(
  assetPath: string,
  assetType: 'screenshots' | 'html' | 'css',
  filePath: string
): Promise<string> {
  try {
    const result = await typedInvoke<string>('upload_design_asset', {
      assetPath,
      assetType,
      filePath
    })
    return result
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 生成切版說明包
export async function generateSlicePackage(
  moduleName: string,
  options: {
    includeHtml: boolean
    includeCss: boolean
    includeResponsive: boolean
  }
): Promise<string> {
  try {
    const result = await typedInvoke<string>('generate_slice_package', {
      moduleName,
      includeHtml: options.includeHtml,
      includeCss: options.includeCss,
      includeResponsive: options.includeResponsive
    })
    return result
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 批量生成切版說明包
export interface BulkGenerationResult {
  total: number
  success: string[]
  failed: string[]
}

export type OverwriteStrategy = 'overwrite' | 'skip' | 'rename'

export async function generateAllSlicePackages(options: {
  includeHtml: boolean
  includeCss: boolean
  includeResponsive: boolean
  overwriteStrategy?: OverwriteStrategy
}): Promise<BulkGenerationResult> {
  try {
    const result = await typedInvoke<BulkGenerationResult>('generate_all_slice_packages', {
      includeHtml: options.includeHtml,
      includeCss: options.includeCss,
      includeResponsive: options.includeResponsive,
      overwriteStrategy: options.overwriteStrategy ?? 'overwrite'
    })
    return result
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function generateSelectedSlicePackages(params: {
  modules: string[]
  includeHtml: boolean
  includeCss: boolean
  includeResponsive: boolean
  overwriteStrategy?: OverwriteStrategy
}): Promise<BulkGenerationResult> {
  try {
    const result = await typedInvoke<BulkGenerationResult>('generate_selected_slice_packages', {
      modules: params.modules,
      includeHtml: params.includeHtml,
      includeCss: params.includeCss,
      includeResponsive: params.includeResponsive,
      overwriteStrategy: params.overwriteStrategy ?? 'overwrite'
    })
    return result
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 檢查 Tauri 是否可用
let __tauriAvailableCache: boolean | null = null
export async function checkTauriAvailable(): Promise<boolean> {
  if (typeof __tauriAvailableCache === 'boolean') return __tauriAvailableCache
  try {
    // 嘗試調用一個簡單的命令來檢查 Tauri 是否可用
    await invoke('get_design_modules')
    __tauriAvailableCache = true
    return true
  } catch (error) {
    console.warn('Tauri 不可用:', error)
    __tauriAvailableCache = false
    return false
  }
}

// 批量操作工具
export class BatchOperationManager {
  private operations: Array<() => Promise<void>> = []
  private results: Array<{ success: boolean; error?: string }> = []

  // 添加操作
  addOperation(operation: () => Promise<void>): void {
    this.operations.push(operation)
  }

  // 執行所有操作
  async executeAll(): Promise<Array<{ success: boolean; error?: string }>> {
    this.results = []
    
    for (const operation of this.operations) {
      try {
        await operation()
        this.results.push({ success: true })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        this.results.push({ success: false, error: errorMessage })
      }
    }
    
    return this.results
  }

  // 獲取成功和失敗的數量
  getSummary(): { total: number; success: number; failed: number } {
    const total = this.results.length
    const success = this.results.filter(r => r.success).length
    const failed = total - success
    
    return { total, success, failed }
  }

  // 清除操作列表
  clear(): void {
    this.operations = []
    this.results = []
  }
}

// 導出批量操作管理器
export const batchOperationManager = new BatchOperationManager()

// 導出整包
export interface UnifiedPackageResult {
  outputDir: string
  zipPath?: string | null
  modulesCount: number
}

// Mermaid sitemap
export interface MermaidResult {
  mmd_path: string
  modules: number
  pages: number
  subpages: number
}

export async function generateProjectMermaid(): Promise<MermaidResult> {
  try {
    return await typedInvoke<MermaidResult>('generate_project_mermaid')
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function generateProjectMermaidHtml(): Promise<string> {
  try {
    return await typedInvoke<string>('generate_project_mermaid_html')
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function generateModuleMermaidHtml(module: string): Promise<string> {
  try {
    return await typedInvoke<string>('generate_module_mermaid_html', { module })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function generateModuleCrudMermaidHtml(module: string): Promise<string> {
  try {
    return await typedInvoke<string>('generate_module_crud_mermaid_html', { module })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function generatePageMermaidHtml(module: string, page: string): Promise<string> {
  try {
    return await typedInvoke<string>('generate_page_mermaid_html', { module, page })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function generateUnifiedSlicePackage(params: {
  externalDesignAssetsRoot: string
  aiDocFrontendInstructions: string
  aiDocUiFriendly: string
  includeHtml: boolean
  includeCss: boolean
  includeResponsive: boolean
  includePageSpecs?: boolean
  overwriteStrategy?: OverwriteStrategy
  makeZip?: boolean
}): Promise<UnifiedPackageResult> {
  try {
    const res = await typedInvoke<any>('generate_unified_slice_package', {
      externalDesignAssetsRoot: params.externalDesignAssetsRoot,
      aiDocFrontendInstructions: params.aiDocFrontendInstructions,
      aiDocUiFriendly: params.aiDocUiFriendly,
      includeHtml: params.includeHtml,
      includeCss: params.includeCss,
      includeResponsive: params.includeResponsive,
      includeSpecs: params.includePageSpecs ?? false,
      overwriteStrategy: params.overwriteStrategy ?? 'overwrite',
      makeZip: params.makeZip ?? true,
    })
    return {
      outputDir: res.output_dir,
      zipPath: res.zip_path ?? null,
      modulesCount: res.modules_count,
    }
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// Project APIs
export interface TauriProjectConfig {
  name: string
  slug: string
  design_assets_root?: string | null
  ai_doc_frontend_instructions?: string | null
  ai_doc_ui_friendly?: string | null
  zip_default: boolean
  include_bone_default: boolean
  include_specs_default: boolean
  overwrite_strategy_default?: 'overwrite' | 'skip' | 'rename' | null
  mermaid_theme?: string | null
  mermaid_layout_direction?: string | null
}

export async function getDefaultProject(): Promise<TauriProjectConfig> {
  try {
    return await typedInvoke<TauriProjectConfig>('get_or_init_default_project')
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function updateDefaultProject(cfg: TauriProjectConfig): Promise<TauriProjectConfig> {
  try {
    return await typedInvoke<TauriProjectConfig>('update_default_project', { config: cfg })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// Pages APIs (Phase 1: top-level only)
export interface PageInfo { slug: string; path: string }
export interface LinkMeta { to: string; label?: string }
export interface PageNode { slug: string; path: string; title?: string; status?: string; route?: string; notes?: string; domain?: string; area?: string; component?: string; action?: string; class?: string; links?: LinkMeta[]; children: PageNode[] }

export async function getModulePages(moduleName: string): Promise<PageInfo[]> {
  try {
    return await typedInvoke<PageInfo[]>('get_module_pages', { moduleName })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function getModuleTree(moduleName: string): Promise<PageNode[]> {
  try {
    return await typedInvoke<PageNode[]>('get_module_tree', { moduleName })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function setPageOrder(moduleName: string, order: string[]): Promise<string> {
  try {
    return await typedInvoke<string>('set_page_order', { moduleName, order })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function setSubpageOrder(moduleName: string, parentSlug: string, order: string[]): Promise<string> {
  try {
    return await typedInvoke<string>('set_subpage_order', { moduleName, parentSlug, order })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function createModulePage(moduleName: string, slug: string): Promise<PageInfo> {
  try {
    return await typedInvoke<PageInfo>('create_module_page', { moduleName, slug })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function deleteModulePage(moduleName: string, slug: string): Promise<string> {
  try {
    return await typedInvoke<string>('delete_module_page', { moduleName, slug })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function renameModulePage(moduleName: string, fromSlug: string, toSlug: string): Promise<PageInfo> {
  try {
    return await typedInvoke<PageInfo>('rename_module_page', { moduleName, fromSlug, toSlug })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function createSubpage(moduleName: string, parentSlug: string, slug: string): Promise<PageInfo> {
  try {
    return await typedInvoke<PageInfo>('create_subpage', { moduleName, parentSlug, slug })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function deleteSubpage(moduleName: string, parentSlug: string, slug: string): Promise<string> {
  try {
    return await typedInvoke<string>('delete_subpage', { moduleName, parentSlug, slug })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function renameSubpage(moduleName: string, parentSlug: string, fromSlug: string, toSlug: string): Promise<PageInfo> {
  try {
    return await typedInvoke<PageInfo>('rename_subpage', { moduleName, parentSlug, fromSlug, toSlug })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function applyCrudSubpages(moduleName: string, parentSlug: string): Promise<string[]> {
  try {
    return await typedInvoke<string[]>('apply_crud_subpages', { moduleName, parentSlug })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// Project list/switch APIs
export interface ProjectListItem { slug: string; name: string }

export async function listProjects(): Promise<ProjectListItem[]> {
  if (!isTauriEnvironment()) {
    console.log('瀏覽器環境 - 返回模擬專案列表')
    // 在瀏覽器環境中返回模擬數據
    return [
      { slug: 'demo-project', name: '示範專案' },
      { slug: 'sample-website', name: '範例網站' }
    ]
  }
  
  if (!invoke) {
    throw new Error('Tauri API 尚未初始化')
  }
  
  try {
    return await typedInvoke<ProjectListItem[]>('list_projects')
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function createProject(slug: string, name: string): Promise<TauriProjectConfig> {
  if (!isTauriEnvironment()) {
    console.log('瀏覽器環境 - 模擬創建專案:', { slug, name })
    // 在瀏覽器環境中返回模擬結果
    await new Promise(resolve => setTimeout(resolve, 500)) // 模擬延遲
    return {
      name,
      slug,
      root_path: `/mock/projects/${slug}`,
      created_at: new Date().toISOString()
    } as TauriProjectConfig
  }
  
  if (!invoke) {
    throw new Error('Tauri API 尚未初始化')
  }
  
  try {
    return await typedInvoke<TauriProjectConfig>('create_project', { slug, name })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function deleteProject(slug: string): Promise<string> {
  if (!isTauriEnvironment()) {
    console.log('瀏覽器環境 - 模擬刪除專案:', slug)
    await new Promise(resolve => setTimeout(resolve, 300)) // 模擬延遲
    return `專案 ${slug} 已刪除（模擬）`
  }
  
  if (!invoke) {
    throw new Error('Tauri API 尚未初始化')
  }
  
  try {
    return await typedInvoke<string>('delete_project', { slug })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function switchProject(slug: string): Promise<TauriProjectConfig> {
  if (!isTauriEnvironment()) {
    console.log('瀏覽器環境 - 模擬切換專案:', slug)
    await new Promise(resolve => setTimeout(resolve, 300)) // 模擬延遲
    return {
      name: slug === 'demo-project' ? '示範專案' : '範例網站',
      slug,
      root_path: `/mock/projects/${slug}`,
      created_at: new Date().toISOString()
    } as TauriProjectConfig
  }
  
  if (!invoke) {
    throw new Error('Tauri API 尚未初始化')
  }
  
  try {
    return await typedInvoke<TauriProjectConfig>('switch_project', { slug })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// Page meta updates
export interface PageMetaUpdate { title?: string; status?: string; route?: string; notes?: string; path?: string; domain?: string; area?: string; component?: string; action?: string; class?: string; links?: LinkMeta[] }

export async function updatePageMeta(moduleName: string, slug: string, meta: PageMetaUpdate): Promise<string> {
  try {
    return await typedInvoke<string>('update_page_meta', { moduleName, slug, meta })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function updateSubpageMeta(moduleName: string, parentSlug: string, slug: string, meta: PageMetaUpdate): Promise<string> {
  try {
    return await typedInvoke<string>('update_subpage_meta', { moduleName, parentSlug, slug, meta })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// Mermaid customization
export interface MermaidOptions {
  theme: string
  layout_direction: string
}

export async function getMermaidOptions(): Promise<MermaidOptions> {
  try {
    const project = await getDefaultProject()
    return {
      theme: project.mermaid_theme || 'default',
      layout_direction: project.mermaid_layout_direction || 'TD'
    }
  } catch (error) {
    return {
      theme: 'default',
      layout_direction: 'TD'
    }
  }
}

export async function updateMermaidOptions(options: Partial<MermaidOptions>): Promise<TauriProjectConfig> {
  try {
    const project = await getDefaultProject()
    const updatedProject = {
      ...project,
      mermaid_theme: options.theme || project.mermaid_theme,
      mermaid_layout_direction: options.layout_direction || project.mermaid_layout_direction
    }
    return await updateDefaultProject(updatedProject)
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// Sitemap export/import
export interface SitemapExport {
  project_name: string
  export_timestamp: string
  modules: ModuleExport[]
}

export interface ModuleExport {
  name: string
  description: string
  pages: PageExport[]
}

export interface PageExport {
  slug: string
  title?: string
  status?: string
  route?: string
  notes?: string
  subpages: SubpageExport[]
}

export interface SubpageExport {
  slug: string
  title?: string
  status?: string
  route?: string
  notes?: string
}

export async function exportSitemap(): Promise<string> {
  try {
    return await typedInvoke<string>('export_sitemap')
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function importSitemap(filePath: string): Promise<string> {
  try {
    return await typedInvoke<string>('import_sitemap', { filePath })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// Sitemap analytics
export interface SitemapAnalytics {
  project_name: string
  total_modules: number
  total_pages: number
  total_subpages: number
  average_pages_per_module: number
  modules_with_deep_structure: string[]
  orphaned_pages: string[]
  status_distribution: Record<string, number>
  deepest_module?: string
  max_depth: number
  coverage_metrics: CoverageMetrics
}

export interface CoverageMetrics {
  pages_with_screenshots: number
  pages_with_html: number
  pages_with_css: number
  completion_percentage: number
  modules_completion: Record<string, ModuleCompletion>
}

export interface ModuleCompletion {
  total_pages: number
  pages_with_assets: number
  completion_rate: number
}

export async function analyzeSitemap(): Promise<SitemapAnalytics> {
  try {
    return await typedInvoke<SitemapAnalytics>('analyze_sitemap')
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// Performance optimization APIs
export async function clearSitemapCache(): Promise<string> {
  try {
    return await typedInvoke<string>('clear_sitemap_cache')
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function getCacheStats(): Promise<any> {
  try {
    return await typedInvoke<any>('get_cache_stats')
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function preloadModuleCache(moduleName: string): Promise<string> {
  try {
    return await typedInvoke<string>('preload_module_cache', { moduleName })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

export async function preloadAllModulesCache(): Promise<string> {
  try {
    return await typedInvoke<string>('preload_all_modules_cache')
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// Enhanced detailed workflow generation
export async function generateUserWorkflowMermaidHtml(module: string): Promise<string> {
  try {
    return await typedInvoke<string>('generate_user_workflow_mermaid_html', { module })
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}
