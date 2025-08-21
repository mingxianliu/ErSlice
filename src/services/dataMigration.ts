// ErSlice 數據遷移服務
// 用於從 localStorage 遷移到 SQLite 數據庫

import { invoke } from '@tauri-apps/api/tauri'
import {
  DatabaseDesignModule,
  DatabaseTemplate,
  DatabaseAISpec,
  DatabaseResult
} from '../types/database'
import { DesignModule } from '../stores/designModules'
import { Template } from '../types/templates'
import { AISpec } from '../types/aiSpec'

// ==================== 遷移狀態類型 ====================

export interface MigrationStatus {
  total: number
  completed: number
  failed: number
  current: string
  errors: string[]
}

export interface MigrationResult {
  success: boolean
  status: MigrationStatus
  message: string
  details?: {
    modules: number
    templates: number
    specs: number
    assets: number
  }
}

// ==================== 數據驗證類型 ====================

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'critical'
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion: string
}

// ==================== 數據遷移服務 ====================

/**
 * 檢查是否有需要遷移的數據
 */
export async function checkMigrationNeeded(): Promise<{
  hasLocalData: boolean
  localDataCount: {
    modules: number
    templates: number
    specs: number
  }
}> {
  try {
    // 檢查 localStorage 中的數據
    const localModules = localStorage.getItem('erslice-design-modules')
    const localTemplates = localStorage.getItem('erslice-templates')
    const localSpecs = localStorage.getItem('erslice-ai-specs')
    
    const modules = localModules ? JSON.parse(localModules) : []
    const templates = localTemplates ? JSON.parse(localTemplates) : []
    const specs = localSpecs ? JSON.parse(localSpecs) : []
    
    const hasLocalData = modules.length > 0 || templates.length > 0 || specs.length > 0
    
    return {
      hasLocalData,
      localDataCount: {
        modules: modules.length,
        templates: templates.length,
        specs: specs.length
      }
    }
  } catch (error) {
    console.error('檢查遷移需求失敗:', error)
    return {
      hasLocalData: false,
      localDataCount: { modules: 0, templates: 0, specs: 0 }
    }
  }
}

/**
 * 開始數據遷移
 */
export async function startDataMigration(
  onProgress?: (status: MigrationStatus) => void
): Promise<MigrationResult> {
  try {
    const status: MigrationStatus = {
      total: 0,
      completed: 0,
      failed: 0,
      current: '準備遷移...',
      errors: []
    }
    
    // 獲取本地數據
    const localData = await getLocalData()
    status.total = localData.modules.length + localData.templates.length + localData.specs.length
    
    if (status.total === 0) {
      return {
        success: true,
        status,
        message: '沒有需要遷移的數據'
      }
    }
    
    // 遷移設計模組
    status.current = '遷移設計模組...'
    onProgress?.(status)
    
    const moduleResults = await migrateModules(localData.modules, (progress) => {
      status.completed = progress
      onProgress?.(status)
    })
    
    // 遷移模板
    status.current = '遷移模板...'
    onProgress?.(status)
    
    const templateResults = await migrateTemplates(localData.templates, (progress) => {
      status.completed = progress
      onProgress?.(status)
    })
    
    // 遷移 AI 規格
    status.current = '遷移 AI 規格...'
    onProgress?.(status)
    
    const specResults = await migrateAISpecs(localData.specs, (progress) => {
      status.completed = progress
      onProgress?.(status)
    })
    
    // 計算結果
    const totalCompleted = moduleResults.success.length + templateResults.success.length + specResults.success.length
    const totalFailed = moduleResults.failed.length + templateResults.failed.length + specResults.failed.length
    
    status.completed = totalCompleted
    status.failed = totalFailed
    status.current = '遷移完成'
    
    // 記錄錯誤
    status.errors = [
      ...moduleResults.failed.map(f => `模組 ${f.name}: ${f.error}`),
      ...templateResults.failed.map(f => `模板 ${f.name}: ${f.error}`),
      ...specResults.failed.map(f => `規格 ${f.title}: ${f.error}`)
    ]
    
    return {
      success: totalFailed === 0,
      status,
      message: `遷移完成: ${totalCompleted} 成功, ${totalFailed} 失敗`,
      details: {
        modules: moduleResults.success.length,
        templates: templateResults.success.length,
        specs: specResults.success.length,
        assets: 0 // 資產遷移需要特殊處理
      }
    }
    
  } catch (error) {
    return {
      success: false,
      status: {
        total: 0,
        completed: 0,
        failed: 1,
        current: '遷移失敗',
        errors: [error instanceof Error ? error.message : '未知錯誤']
      },
      message: '數據遷移過程中發生錯誤'
    }
  }
}

/**
 * 獲取本地數據
 */
async function getLocalData(): Promise<{
  modules: DesignModule[]
  templates: Template[]
  specs: AISpec[]
}> {
  try {
    const modules = JSON.parse(localStorage.getItem('erslice-design-modules') || '[]')
    const templates = JSON.parse(localStorage.getItem('erslice-templates') || '[]')
    const specs = JSON.parse(localStorage.getItem('erslice-ai-specs') || '[]')
    
    return { modules, templates, specs }
  } catch (error) {
    console.error('獲取本地數據失敗:', error)
    return { modules: [], templates: [], specs: [] }
  }
}

/**
 * 遷移設計模組
 */
async function migrateModules(
  modules: DesignModule[],
  onProgress?: (completed: number) => void
): Promise<{ success: any[], failed: any[] }> {
  const success: any[] = []
  const failed: any[] = []
  
  for (let i = 0; i < modules.length; i++) {
    try {
      const module = modules[i]
      
      // 驗證數據
      const validation = validateDesignModule(module)
      if (!validation.valid) {
        failed.push({
          name: module.name,
          error: validation.errors.map(e => e.message).join(', ')
        })
        continue
      }
      
      // 轉換為數據庫格式
      const dbModule: DatabaseDesignModule = {
        id: module.id,
        name: module.name,
        description: module.description,
        status: module.status || 'active',
        asset_count: module.assets?.length || 0,
        project_slugs: module.projectSlugs ? JSON.stringify(module.projectSlugs) : undefined,
        primary_project: module.primaryProject,
        created_from: module.createdFrom,
        created_at: module.createdAt || new Date().toISOString(),
        updated_at: module.updatedAt || new Date().toISOString()
      }
      
      // 調用 Tauri 命令創建
      await invoke('create_design_module_in_db', { module: dbModule })
      
      success.push(module)
      onProgress?.(i + 1)
      
    } catch (error) {
      failed.push({
        name: modules[i].name,
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  }
  
  return { success, failed }
}

/**
 * 遷移模板
 */
async function migrateTemplates(
  templates: Template[],
  onProgress?: (completed: number) => void
): Promise<{ success: any[], failed: any[] }> {
  const success: any[] = []
  const failed: any[] = []
  
  for (let i = 0; i < templates.length; i++) {
    try {
      const template = templates[i]
      
      // 驗證數據
      const validation = validateTemplate(template)
      if (!validation.valid) {
        failed.push({
          name: template.name,
          error: validation.errors.map(e => e.message).join(', ')
        })
        continue
      }
      
      // 轉換為數據庫格式
      const dbTemplate: DatabaseTemplate = {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        complexity: template.complexity,
        estimated_time: template.estimatedTime,
        tags: template.tags ? JSON.stringify(template.tags) : undefined,
        content_data: template.contentData ? JSON.stringify(template.contentData) : undefined,
        created_at: template.createdAt || new Date().toISOString(),
        updated_at: template.updatedAt || new Date().toISOString()
      }
      
      // 調用 Tauri 命令創建
      await invoke('create_template_in_db', { template: dbTemplate })
      
      success.push(template)
      onProgress?.(i + 1)
      
    } catch (error) {
      failed.push({
        name: templates[i].name,
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  }
  
  return { success, failed }
}

/**
 * 遷移 AI 規格
 */
async function migrateAISpecs(
  specs: AISpec[],
  onProgress?: (completed: number) => void
): Promise<{ success: any[], failed: any[] }> {
  const success: any[] = []
  const failed: any[] = []
  
  for (let i = 0; i < specs.length; i++) {
    try {
      const spec = specs[i]
      
      // 驗證數據
      const validation = validateAISpec(spec)
      if (!validation.valid) {
        failed.push({
          title: spec.title,
          error: validation.errors.map(e => e.message).join(', ')
        })
        continue
      }
      
      // 轉換為數據庫格式
      const dbSpec: DatabaseAISpec = {
        id: spec.id,
        title: spec.title,
        description: spec.description,
        type: spec.type,
        complexity: spec.complexity,
        format: spec.format,
        estimated_time: spec.estimatedTime,
        tags: spec.tags ? JSON.stringify(spec.tags) : undefined,
        content_data: spec.contentData ? JSON.stringify(spec.contentData) : undefined,
        created_at: spec.createdAt || new Date().toISOString(),
        updated_at: spec.updatedAt || new Date().toISOString()
      }
      
      // 調用 Tauri 命令創建
      await invoke('create_ai_spec_in_db', { spec: dbSpec })
      
      success.push(spec)
      onProgress?.(i + 1)
      
    } catch (error) {
      failed.push({
        title: specs[i].title,
        error: error instanceof Error ? error.message : '未知錯誤'
      })
    }
  }
  
  return { success, failed }
}

// ==================== 數據驗證服務 ====================

/**
 * 驗證設計模組數據
 */
export function validateDesignModule(module: DesignModule): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // 必填字段驗證
  if (!module.id || module.id.trim() === '') {
    errors.push({
      field: 'id',
      message: '模組 ID 不能為空',
      severity: 'critical'
    })
  }
  
  if (!module.name || module.name.trim() === '') {
    errors.push({
      field: 'name',
      message: '模組名稱不能為空',
      severity: 'critical'
    })
  }
  
  // 數據格式驗證
  if (module.id && module.id.length > 100) {
    errors.push({
      field: 'id',
      message: '模組 ID 長度不能超過 100 字符',
      severity: 'error'
    })
  }
  
  if (module.name && module.name.length > 200) {
    errors.push({
      field: 'name',
      message: '模組名稱長度不能超過 200 字符',
      severity: 'error'
    })
  }
  
  if (module.description && module.description.length > 1000) {
    warnings.push({
      field: 'description',
      message: '模組描述較長，建議縮短',
      suggestion: '建議將描述控制在 1000 字符以內'
    })
  }
  
  // 狀態驗證
  if (module.status && !['active', 'draft', 'archived'].includes(module.status)) {
    errors.push({
      field: 'status',
      message: '模組狀態必須是 active、draft 或 archived',
      severity: 'error'
    })
  }
  
  // 日期驗證
  if (module.createdAt && isNaN(Date.parse(module.createdAt))) {
    errors.push({
      field: 'createdAt',
      message: '創建日期格式無效',
      severity: 'error'
    })
  }
  
  if (module.updatedAt && isNaN(Date.parse(module.updatedAt))) {
    errors.push({
      field: 'updatedAt',
      message: '更新日期格式無效',
      severity: 'error'
    })
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 驗證模板數據
 */
export function validateTemplate(template: Template): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // 必填字段驗證
  if (!template.id || template.id.trim() === '') {
    errors.push({
      field: 'id',
      message: '模板 ID 不能為空',
      severity: 'critical'
    })
  }
  
  if (!template.name || template.name.trim() === '') {
    errors.push({
      field: 'name',
      message: '模板名稱不能為空',
      severity: 'critical'
    })
  }
  
  // 數據格式驗證
  if (template.id && template.id.length > 100) {
    errors.push({
      field: 'id',
      message: '模板 ID 長度不能超過 100 字符',
      severity: 'error'
    })
  }
  
  if (template.name && template.name.length > 200) {
    errors.push({
      field: 'name',
      message: '模板名稱長度不能超過 200 字符',
      severity: 'error'
    })
  }
  
  // 複雜度驗證
  if (template.complexity && !['simple', 'medium', 'complex'].includes(template.complexity)) {
    errors.push({
      field: 'complexity',
      message: '複雜度必須是 simple、medium 或 complex',
      severity: 'error'
    })
  }
  
  // 分類驗證
  if (template.category && !['ui', 'layout', 'form', 'navigation', 'data', 'other'].includes(template.category)) {
    warnings.push({
      field: 'category',
      message: '模板分類不在預定義範圍內',
      suggestion: '建議使用預定義的分類：ui、layout、form、navigation、data、other'
    })
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 驗證 AI 規格數據
 */
export function validateAISpec(spec: AISpec): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  
  // 必填字段驗證
  if (!spec.id || spec.id.trim() === '') {
    errors.push({
      field: 'id',
      message: '規格 ID 不能為空',
      severity: 'critical'
    })
  }
  
  if (!spec.title || spec.title.trim() === '') {
    errors.push({
      field: 'title',
      message: '規格標題不能為空',
      severity: 'critical'
    })
  }
  
  // 數據格式驗證
  if (spec.id && spec.id.length > 100) {
    errors.push({
      field: 'id',
      message: '規格 ID 長度不能超過 100 字符',
      severity: 'error'
    })
  }
  
  if (spec.title && spec.title.length > 200) {
    errors.push({
      field: 'title',
      message: '規格標題長度不能超過 200 字符',
      severity: 'error'
    })
  }
  
  // 類型驗證
  if (spec.type && !['guide', 'specification', 'tutorial', 'reference', 'full-guide'].includes(spec.type)) {
    warnings.push({
      field: 'type',
      message: '規格類型不在預定義範圍內',
      suggestion: '建議使用預定義的類型：guide、specification、tutorial、reference、full-guide'
    })
  }
  
  // 複雜度驗證
  if (spec.complexity && !['beginner', 'intermediate', 'advanced', 'expert'].includes(spec.complexity)) {
    errors.push({
      field: 'complexity',
      message: '複雜度必須是 beginner、intermediate、advanced 或 expert',
      severity: 'error'
    })
  }
  
  // 格式驗證
  if (spec.format && !['markdown', 'html', 'pdf', 'json', 'yaml'].includes(spec.format)) {
    warnings.push({
      field: 'format',
      message: '格式不在預定義範圍內',
      suggestion: '建議使用預定義的格式：markdown、html、pdf、json、yaml'
    })
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 批量驗證數據
 */
export function validateAllData(data: {
  modules: DesignModule[]
  templates: Template[]
  specs: AISpec[]
}): {
  modules: { valid: DesignModule[], invalid: { module: DesignModule, errors: ValidationError[] }[] }
  templates: { valid: Template[], invalid: { template: Template, errors: ValidationError[] }[] }
  specs: { valid: AISpec[], invalid: { spec: AISpec, errors: ValidationError[] }[] }
  summary: {
    total: number
    valid: number
    invalid: number
    criticalErrors: number
  }
} {
  const modules = data.modules.map(module => ({
    module,
    validation: validateDesignModule(module)
  }))
  
  const templates = data.templates.map(template => ({
    template,
    validation: validateTemplate(template)
  }))
  
  const specs = data.specs.map(spec => ({
    spec,
    validation: validateAISpec(spec)
  }))
  
  const validModules = modules.filter(m => m.validation.valid).map(m => m.module)
  const invalidModules = modules.filter(m => !m.validation.valid).map(m => ({
    module: m.module,
    errors: m.validation.errors
  }))
  
  const validTemplates = templates.filter(t => t.validation.valid).map(t => t.template)
  const invalidTemplates = templates.filter(t => !t.validation.valid).map(t => ({
    template: t.template,
    errors: t.validation.errors
  }))
  
  const validSpecs = specs.filter(s => s.validation.valid).map(s => s.spec)
  const invalidSpecs = specs.filter(s => !s.validation.valid).map(s => ({
    spec: s.spec,
    errors: s.validation.errors
  }))
  
  const total = data.modules.length + data.templates.length + data.specs.length
  const valid = validModules.length + validTemplates.length + validSpecs.length
  const invalid = invalidModules.length + invalidTemplates.length + invalidSpecs.length
  
  const criticalErrors = [
    ...invalidModules,
    ...invalidTemplates,
    ...invalidSpecs
  ].reduce((count, item) => {
    return count + (item.errors?.filter(e => e.severity === 'critical').length || 0)
  }, 0)
  
  return {
    modules: { valid: validModules, invalid: invalidModules },
    templates: { valid: validTemplates, invalid: invalidTemplates },
    specs: { valid: validSpecs, invalid: invalidSpecs },
    summary: { total, valid, invalid, criticalErrors }
  }
}
