// ErSlice 數據修復服務
// 自動修復常見的數據問題

import { 
  ValidationResult, 
  ValidationError, 
  ValidationWarning 
} from './dataMigration'
import { DesignModule } from '../utils/tauriCommands'
import { Template } from '../types/templates'
import { AISpec } from '../types/aiSpec'

// ==================== 修復結果類型 ====================

export interface RepairResult {
  success: boolean
  repaired: number
  failed: number
  processed: number
  details: {
    modules: RepairDetail[]
    templates: RepairDetail[]
    specs: RepairDetail[]
  }
  summary: string
}

export interface RepairDetail {
  id: string
  name: string
  title: string
  type: 'module' | 'template' | 'spec'
  original: any
  repaired: any
  fixes: string[]
  errors?: string[]
}

export interface RepairRule {
  id: string
  name: string
  description: string
  severity: 'critical' | 'error' | 'warning'
  autoFixable: boolean
  fixFunction: (data: any) => any
}

// ==================== 修復規則定義 ====================

// 設計模組修復規則
const moduleRepairRules: RepairRule[] = [
  {
    id: 'empty-id',
    name: '空 ID 修復',
    description: '自動生成缺失的模組 ID',
    severity: 'critical',
    autoFixable: true,
    fixFunction: (module: DesignModule) => {
      if (!module.id || module.id.trim() === '') {
        module.id = `module_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      return module
    }
  },
  {
    id: 'empty-name',
    name: '空名稱修復',
    description: '為缺失名稱的模組設置默認名稱',
    severity: 'critical',
    autoFixable: true,
    fixFunction: (module: DesignModule) => {
      if (!module.name || module.name.trim() === '') {
        module.name = `未命名模組_${Date.now()}`
      }
      return module
    }
  },
  {
    id: 'invalid-status',
    name: '無效狀態修復',
    description: '修復無效的模組狀態值',
    severity: 'error',
    autoFixable: true,
    fixFunction: (module: DesignModule) => {
      const validStatuses = ['active', 'draft', 'archived']
      if (module.status && !validStatuses.includes(module.status)) {
        module.status = 'active'
      }
      return module
    }
  },
  {
    id: 'long-description',
    name: '描述長度修復',
    description: '截斷過長的模組描述',
    severity: 'warning',
    autoFixable: true,
    fixFunction: (module: DesignModule) => {
      if (module.description && module.description.length > 1000) {
        module.description = module.description.substring(0, 1000) + '...'
      }
      return module
    }
  },
  {
    id: 'invalid-dates',
    name: '日期格式修復',
    description: '修復無效的日期格式',
    severity: 'error',
    autoFixable: true,
    fixFunction: (module: DesignModule) => {
      const now = new Date().toISOString()
      
      if (module.createdAt && isNaN(Date.parse(module.createdAt))) {
        module.createdAt = now
      }
      
      if (module.updatedAt && isNaN(Date.parse(module.updatedAt))) {
        module.updatedAt = now
      }
      
      return module
    }
  },
  {
    id: 'missing-dates',
    name: '缺失日期修復',
    description: '為缺失的日期字段設置當前時間',
    severity: 'warning',
    autoFixable: true,
    fixFunction: (module: DesignModule) => {
      const now = new Date().toISOString()
      
      if (!module.createdAt) {
        module.createdAt = now
      }
      
      if (!module.updatedAt) {
        module.updatedAt = now
      }
      
      return module
    }
  }
]

// 模板修復規則
const templateRepairRules: RepairRule[] = [
  {
    id: 'empty-id',
    name: '空 ID 修復',
    description: '自動生成缺失的模板 ID',
    severity: 'critical',
    autoFixable: true,
    fixFunction: (template: Template) => {
      if (!template.id || template.id.trim() === '') {
        template.id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      return template
    }
  },
  {
    id: 'empty-name',
    name: '空名稱修復',
    description: '為缺失名稱的模板設置默認名稱',
    severity: 'critical',
    autoFixable: true,
    fixFunction: (template: Template) => {
      if (!template.name || template.name.trim() === '') {
        template.name = `未命名模板_${Date.now()}`
      }
      return template
    }
  },
  {
    id: 'invalid-complexity',
    name: '無效複雜度修復',
    description: '修復無效的複雜度值',
    severity: 'error',
    autoFixable: true,
    fixFunction: (template: Template) => {
      const validComplexities = ['simple', 'medium', 'complex']
      if (template.complexity && !validComplexities.includes(template.complexity)) {
        template.complexity = 'medium'
      }
      return template
    }
  },
  {
    id: 'invalid-category',
    name: '無效分類修復',
    description: '修復無效的分類值',
    severity: 'warning',
    autoFixable: true,
    fixFunction: (template: Template) => {
      const validCategories = ['ui', 'layout', 'form', 'navigation', 'data', 'other']
      if (template.category && !validCategories.includes(template.category)) {
        template.category = 'other'
      }
      return template
    }
  },
  {
    id: 'missing-dates',
    name: '缺失日期修復',
    description: '為缺失的日期字段設置當前時間',
    severity: 'warning',
    autoFixable: true,
    fixFunction: (template: Template) => {
      const now = new Date().toISOString()
      
      if (!template.createdAt) {
        template.createdAt = now
      }
      
      if (!template.updatedAt) {
        template.updatedAt = now
      }
      
      return template
    }
  }
]

// AI 規格修復規則
const specRepairRules: RepairRule[] = [
  {
    id: 'empty-id',
    name: '空 ID 修復',
    description: '自動生成缺失的規格 ID',
    severity: 'critical',
    autoFixable: true,
    fixFunction: (spec: AISpec) => {
      if (!spec.id || spec.id.trim() === '') {
        spec.id = `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      return spec
    }
  },
  {
    id: 'empty-title',
    name: '空標題修復',
    description: '為缺失標題的規格設置默認標題',
    severity: 'critical',
    autoFixable: true,
    fixFunction: (spec: AISpec) => {
      if (!spec.title || spec.title.trim() === '') {
        spec.title = `未命名規格_${Date.now()}`
      }
      return spec
    }
  },
  {
    id: 'invalid-type',
    name: '無效類型修復',
    description: '修復無效的規格類型值',
    severity: 'warning',
    autoFixable: true,
    fixFunction: (spec: AISpec) => {
      const validTypes = ['guide', 'specification', 'tutorial', 'reference', 'full-guide']
      if (spec.type && !validTypes.includes(spec.type)) {
        spec.type = 'guide'
      }
      return spec
    }
  },
  {
    id: 'invalid-complexity',
    name: '無效複雜度修復',
    description: '修復無效的複雜度值',
    severity: 'error',
    autoFixable: true,
    fixFunction: (spec: AISpec) => {
      const validComplexities = ['beginner', 'intermediate', 'advanced', 'expert']
      if (spec.complexity && !validComplexities.includes(spec.complexity)) {
        spec.complexity = 'intermediate'
      }
      return spec
    }
  },
  {
    id: 'invalid-format',
    name: '無效格式修復',
    description: '修復無效的格式值',
    severity: 'warning',
    autoFixable: true,
    fixFunction: (spec: AISpec) => {
      const validFormats = ['markdown', 'html', 'pdf', 'json', 'yaml']
      if (spec.format && !validFormats.includes(spec.format)) {
        spec.format = 'markdown'
      }
      return spec
    }
  },
  {
    id: 'missing-dates',
    name: '缺失日期修復',
    description: '為缺失的日期字段設置當前時間',
    severity: 'warning',
    autoFixable: true,
    fixFunction: (spec: AISpec) => {
      const now = new Date().toISOString()
      
      if (!spec.createdAt) {
        spec.createdAt = now
      }
      
      if (!spec.updatedAt) {
        spec.updatedAt = now
      }
      
      return spec
    }
  }
]

// ==================== 數據修復服務 ====================

/**
 * 自動修復設計模組數據
 */
export function autoRepairModule(module: DesignModule): RepairDetail {
  const original = { ...module }
  const fixes: string[] = []
  const errors: string[] = []
  
  try {
    let repairedModule = { ...module }
    
    // 應用所有修復規則
    for (const rule of moduleRepairRules) {
      try {
        const before = JSON.stringify(repairedModule)
        repairedModule = rule.fixFunction(repairedModule)
        const after = JSON.stringify(repairedModule)
        
        if (before !== after) {
          fixes.push(`${rule.name}: ${rule.description}`)
        }
      } catch (error) {
        errors.push(`規則 ${rule.name} 執行失敗: ${error}`)
      }
    }
    
    return {
      id: repairedModule.id,
      name: repairedModule.name,
      type: 'module',
      original,
      repaired: repairedModule,
      fixes,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    return {
      id: module.id || 'unknown',
      name: module.name || 'unknown',
      type: 'module',
      original,
      repaired: module,
      fixes: [],
      errors: [`修復過程失敗: ${error}`]
    }
  }
}

/**
 * 自動修復模板數據
 */
export function autoRepairTemplate(template: Template): RepairDetail {
  const original = { ...template }
  const fixes: string[] = []
  const errors: string[] = []
  
  try {
    let repairedTemplate = { ...template }
    
    // 應用所有修復規則
    for (const rule of templateRepairRules) {
      try {
        const before = JSON.stringify(repairedTemplate)
        repairedTemplate = rule.fixFunction(repairedTemplate)
        const after = JSON.stringify(repairedTemplate)
        
        if (before !== after) {
          fixes.push(`${rule.name}: ${rule.description}`)
        }
      } catch (error) {
        errors.push(`規則 ${rule.name} 執行失敗: ${error}`)
      }
    }
    
    return {
      id: repairedTemplate.id,
      name: repairedTemplate.name,
      type: 'template',
      original,
      repaired: repairedTemplate,
      fixes,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    return {
      id: template.id || 'unknown',
      name: template.name || 'unknown',
      type: 'template',
      original,
      repaired: template,
      fixes: [],
      errors: [`修復過程失敗: ${error}`]
    }
  }
}

/**
 * 自動修復 AI 規格數據
 */
export function autoRepairSpec(spec: AISpec): RepairDetail {
  const original = { ...spec }
  const fixes: string[] = []
  const errors: string[] = []
  
  try {
    let repairedSpec = { ...spec }
    
    // 應用所有修復規則
    for (const rule of specRepairRules) {
      try {
        const before = JSON.stringify(repairedSpec)
        repairedSpec = rule.fixFunction(repairedSpec)
        const after = JSON.stringify(repairedSpec)
        
        if (before !== after) {
          fixes.push(`${rule.name}: ${rule.description}`)
        }
      } catch (error) {
        errors.push(`規則 ${rule.name} 執行失敗: ${error}`)
      }
    }
    
    return {
      id: repairedSpec.id,
      name: repairedSpec.title,
      type: 'spec',
      original,
      repaired: repairedSpec,
      fixes,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    return {
      id: spec.id || 'unknown',
      name: spec.title || 'unknown',
      type: 'spec',
      original,
      repaired: spec,
      fixes: [],
      errors: [`修復過程失敗: ${error}`]
    }
  }
}

/**
 * 批量修復所有數據
 */
export function autoRepairAllData(data: {
  modules: DesignModule[]
  templates: Template[]
  specs: AISpec[]
}): RepairResult {
  const moduleRepairs = data.modules.map(autoRepairModule)
  const templateRepairs = data.templates.map(autoRepairTemplate)
  const specRepairs = data.specs.map(autoRepairSpec)
  
  const allRepairs = [...moduleRepairs, ...templateRepairs, ...specRepairs]
  const successfulRepairs = allRepairs.filter(r => r.errors === undefined || r.errors.length === 0)
  const failedRepairs = allRepairs.filter(r => r.errors && r.errors.length > 0)
  
  const totalFixed = successfulRepairs.reduce((sum, r) => sum + r.fixes.length, 0)
  
  return {
    success: failedRepairs.length === 0,
    repaired: successfulRepairs.length,
    failed: failedRepairs.length,
    details: {
      modules: moduleRepairs,
      templates: templateRepairs,
      specs: specRepairs
    },
    summary: `修復完成: ${successfulRepairs.length} 個項目成功, ${failedRepairs.length} 個項目失敗, 共修復 ${totalFixed} 個問題`
  }
}

/**
 * 獲取所有修復規則
 */
export function getAllRepairRules(): {
  modules: RepairRule[]
  templates: RepairRule[]
  specs: RepairRule[]
} {
  return {
    modules: moduleRepairRules,
    templates: templateRepairRules,
    specs: specRepairs
  }
}

/**
 * 檢查項目是否需要修復
 */
export function needsRepair(item: DesignModule | Template | AISpec): {
  needsRepair: boolean
  issues: string[]
  autoFixable: boolean
} {
  let issues: string[] = []
  let autoFixable = true
  
  if ('name' in item) {
    // 設計模組或模板
    if (!item.id || item.id.trim() === '') {
      issues.push('ID 為空')
    }
    if (!item.name || item.name.trim() === '') {
      issues.push('名稱為空')
    }
  } else if ('title' in item) {
    // AI 規格
    if (!item.id || item.id.trim() === '') {
      issues.push('ID 為空')
    }
    if (!item.title || item.title.trim() === '') {
      issues.push('標題為空')
    }
  }
  
  return {
    needsRepair: issues.length > 0,
    issues,
    autoFixable
  }
}

/**
 * 獲取修復建議
 */
export function getRepairSuggestions(item: DesignModule | Template | AISpec): string[] {
  const suggestions: string[] = []
  
  if ('name' in item) {
    // 設計模組或模板
    if (!item.id || item.id.trim() === '') {
      suggestions.push('建議: 為項目生成唯一的 ID')
    }
    if (!item.name || item.name.trim() === '') {
      suggestions.push('建議: 為項目設置描述性名稱')
    }
    if (item.name && item.name.length > 200) {
      suggestions.push('建議: 將名稱縮短到 200 字符以內')
    }
  } else if ('title' in item) {
    // AI 規格
    if (!item.id || item.id.trim() === '') {
      suggestions.push('建議: 為規格生成唯一的 ID')
    }
    if (!item.title || item.title.trim() === '') {
      suggestions.push('建議: 為規格設置描述性標題')
    }
    if (item.title && item.title.length > 200) {
      suggestions.push('建議: 將標題縮短到 200 字符以內')
    }
  }
  
  return suggestions
}
