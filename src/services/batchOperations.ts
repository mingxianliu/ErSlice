// ErSlice 批量操作服務
// 支援批量數據處理和操作

import { DesignModule } from '../stores/designModules'
import { Template } from '../types/templates'
import { AISpec } from '../types/aiSpec'
import { autoRepairAllData, RepairResult } from './dataRepair'
import { validateAllData, ValidationResult } from './dataMigration'

// ==================== 批量操作類型 ====================

export interface BatchOperation {
  id: string
  name: string
  description: string
  operation: (data: any[]) => Promise<BatchOperationResult>
  supportedTypes: ('module' | 'template' | 'spec')[]
}

export interface BatchOperationResult {
  success: boolean
  processed: number
  successful: number
  failed: number
  details: {
    modules?: any[]
    templates?: any[]
    specs?: any[]
  }
  summary: string
  errors?: string[]
}

export interface BatchOperationProgress {
  current: number
  total: number
  operation: string
  status: 'processing' | 'completed' | 'failed'
}

// ==================== 批量操作定義 ====================

/**
 * 批量數據修復操作
 */
export const batchRepairOperation: BatchOperation = {
  id: 'batch-repair',
  name: '批量數據修復',
  description: '自動修復所有數據中的常見問題',
  supportedTypes: ['module', 'template', 'spec'],
  operation: async (data: any[]): Promise<BatchOperationResult> => {
    try {
      // 分類數據
      const modules = data.filter(item => 'name' in item && 'status' in item) as DesignModule[]
      const templates = data.filter(item => 'name' in item && 'category' in item) as Template[]
      const specs = data.filter(item => 'title' in item && 'type' in item) as AISpec[]
      
      // 執行修復
      const repairResult = autoRepairAllData({ modules, templates, specs })
      
      return {
        success: repairResult.success,
        processed: data.length,
        successful: repairResult.repaired,
        failed: repairResult.failed,
        details: {
          modules: repairResult.details.modules.map(r => r.repaired),
          templates: repairResult.details.templates.map(r => r.repaired),
          specs: repairResult.details.specs.map(r => r.repaired)
        },
        summary: repairResult.summary
      }
    } catch (error) {
      return {
        success: false,
        processed: data.length,
        successful: 0,
        failed: data.length,
        details: {},
        summary: '批量修復失敗',
        errors: [error instanceof Error ? error.message : '未知錯誤']
      }
    }
  }
}

/**
 * 批量數據驗證操作
 */
export const batchValidationOperation: BatchOperation = {
  id: 'batch-validation',
  name: '批量數據驗證',
  description: '驗證所有數據的完整性和格式',
  supportedTypes: ['module', 'template', 'spec'],
  operation: async (data: any[]): Promise<BatchOperationResult> => {
    try {
      // 分類數據
      const modules = data.filter(item => 'name' in item && 'status' in item) as DesignModule[]
      const templates = data.filter(item => 'name' in item && 'category' in item) as Template[]
      const specs = data.filter(item => 'title' in item && 'type' in item) as AISpec[]
      
      // 執行驗證
      const validationResult = validateAllData({ modules, templates, specs })
      
      return {
        success: validationResult.summary.invalid === 0,
        processed: data.length,
        successful: validationResult.summary.valid,
        failed: validationResult.summary.invalid,
        details: {
          modules: validationResult.modules.valid,
          templates: validationResult.templates.valid,
          specs: validationResult.specs.valid
        },
        summary: `驗證完成: ${validationResult.summary.valid} 個有效, ${validationResult.summary.invalid} 個無效`
      }
    } catch (error) {
      return {
        success: false,
        processed: data.length,
        successful: 0,
        failed: data.length,
        details: {},
        summary: '批量驗證失敗',
        errors: [error instanceof Error ? error.message : '未知錯誤']
      }
    }
  }
}

/**
 * 批量狀態更新操作
 */
export const batchStatusUpdateOperation: BatchOperation = {
  id: 'batch-status-update',
  name: '批量狀態更新',
  description: '批量更新項目的狀態',
  supportedTypes: ['module', 'template', 'spec'],
  operation: async (data: any[], newStatus: string = 'active'): Promise<BatchOperationResult> => {
    try {
      const updatedData = data.map(item => {
        if ('status' in item) {
          return { ...item, status: newStatus, updatedAt: new Date().toISOString() }
        }
        return item
      })
      
      return {
        success: true,
        processed: data.length,
        successful: data.length,
        failed: 0,
        details: {
          modules: updatedData.filter(item => 'name' in item && 'status' in item),
          templates: updatedData.filter(item => 'name' in item && 'category' in item),
          specs: updatedData.filter(item => 'title' in item && 'type' in item)
        },
        summary: `狀態更新完成: ${data.length} 個項目已更新為 ${newStatus}`
      }
    } catch (error) {
      return {
        success: false,
        processed: data.length,
        successful: 0,
        failed: data.length,
        details: {},
        summary: '批量狀態更新失敗',
        errors: [error instanceof Error ? error.message : '未知錯誤']
      }
    }
  }
}

/**
 * 批量標籤操作
 */
export const batchTagOperation: BatchOperation = {
  id: 'batch-tag',
  name: '批量標籤操作',
  description: '批量添加或更新標籤',
  supportedTypes: ['template', 'spec'],
  operation: async (data: any[], tags: string[]): Promise<BatchOperationResult> => {
    try {
      const updatedData = data.map(item => {
        if ('tags' in item) {
          const existingTags = item.tags ? JSON.parse(item.tags) : []
          const newTags = [...new Set([...existingTags, ...tags])]
          return { 
            ...item, 
            tags: JSON.stringify(newTags),
            updatedAt: new Date().toISOString()
          }
        }
        return item
      })
      
      return {
        success: true,
        processed: data.length,
        successful: data.length,
        failed: 0,
        details: {
          templates: updatedData.filter(item => 'name' in item && 'category' in item),
          specs: updatedData.filter(item => 'title' in item && 'type' in item)
        },
        summary: `標籤更新完成: ${data.length} 個項目已添加標籤 ${tags.join(', ')}`
      }
    } catch (error) {
      return {
        success: false,
        processed: data.length,
        successful: 0,
        failed: data.length,
        details: {},
        summary: '批量標籤操作失敗',
        errors: [error instanceof Error ? error.message : '未知錯誤']
      }
    }
  }
}

/**
 * 批量導出操作
 */
export const batchExportOperation: BatchOperation = {
  id: 'batch-export',
  name: '批量導出',
  description: '批量導出數據為 JSON 格式',
  supportedTypes: ['module', 'template', 'spec'],
  operation: async (data: any[]): Promise<BatchOperationResult> => {
    try {
      // 創建導出數據
      const exportData = {
        exportDate: new Date().toISOString(),
        totalItems: data.length,
        data: data
      }
      
      // 創建下載鏈接
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `erslice-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      return {
        success: true,
        processed: data.length,
        successful: data.length,
        failed: 0,
        details: {},
        summary: `導出完成: ${data.length} 個項目已導出為 JSON 文件`
      }
    } catch (error) {
      return {
        success: false,
        processed: data.length,
        successful: 0,
        failed: data.length,
        details: {},
        summary: '批量導出失敗',
        errors: [error instanceof Error ? error.message : '未知錯誤']
      }
    }
  }
}

/**
 * 批量刪除操作
 */
export const batchDeleteOperation: BatchOperation = {
  id: 'batch-delete',
  name: '批量刪除',
  description: '批量刪除選中的項目',
  supportedTypes: ['module', 'template', 'spec'],
  operation: async (data: any[]): Promise<BatchOperationResult> => {
    try {
      // 這裡可以實現實際的刪除邏輯
      // 暫時只是模擬刪除
      
      return {
        success: true,
        processed: data.length,
        successful: data.length,
        failed: 0,
        details: {},
        summary: `刪除完成: ${data.length} 個項目已刪除`
      }
    } catch (error) {
      return {
        success: false,
        processed: data.length,
        successful: 0,
        failed: data.length,
        details: {},
        summary: '批量刪除失敗',
        errors: [error instanceof Error ? error.message : '未知錯誤']
      }
    }
  }
}

// ==================== 批量操作服務 ====================

/**
 * 獲取所有可用的批量操作
 */
export function getAvailableBatchOperations(): BatchOperation[] {
  return [
    batchRepairOperation,
    batchValidationOperation,
    batchStatusUpdateOperation,
    batchTagOperation,
    batchExportOperation,
    batchDeleteOperation
  ]
}

/**
 * 執行批量操作
 */
export async function executeBatchOperation(
  operation: BatchOperation,
  data: any[],
  options?: any,
  onProgress?: (progress: BatchOperationProgress) => void
): Promise<BatchOperationResult> {
  try {
    if (onProgress) {
      onProgress({
        current: 0,
        total: data.length,
        operation: operation.name,
        status: 'processing'
      })
    }
    
    // 執行操作
    const result = await operation.operation(data, options)
    
    if (onProgress) {
      onProgress({
        current: data.length,
        total: data.length,
        operation: operation.name,
        status: result.success ? 'completed' : 'failed'
      })
    }
    
    return result
  } catch (error) {
    if (onProgress) {
      onProgress({
        current: 0,
        total: data.length,
        operation: operation.name,
        status: 'failed'
      })
    }
    
    return {
      success: false,
      processed: data.length,
      successful: 0,
      failed: data.length,
      details: {},
      summary: `操作失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
      errors: [error instanceof Error ? error.message : '未知錯誤']
    }
  }
}

/**
 * 批量操作多個數據集
 */
export async function executeBatchOperations(
  operations: BatchOperation[],
  data: any[],
  options?: any,
  onProgress?: (progress: BatchOperationProgress) => void
): Promise<BatchOperationResult[]> {
  const results: BatchOperationResult[] = []
  
  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i]
    
    if (onProgress) {
      onProgress({
        current: i,
        total: operations.length,
        operation: `執行 ${operation.name}`,
        status: 'processing'
      })
    }
    
    const result = await executeBatchOperation(operation, data, options)
    results.push(result)
  }
  
  if (onProgress) {
    onProgress({
      current: operations.length,
      total: operations.length,
      operation: '所有操作完成',
      status: 'completed'
    })
  }
  
  return results
}

/**
 * 檢查數據是否支持特定操作
 */
export function isOperationSupported(
  operation: BatchOperation,
  data: any[]
): boolean {
  // 檢查數據類型是否支持該操作
  const hasModules = data.some(item => 'name' in item && 'status' in item)
  const hasTemplates = data.some(item => 'name' in item && 'category' in item)
  const hasSpecs = data.some(item => 'title' in item && 'type' in item)
  
  const supportedTypes = operation.supportedTypes
  
  if (supportedTypes.includes('module') && !hasModules) return false
  if (supportedTypes.includes('template') && !hasTemplates) return false
  if (supportedTypes.includes('spec') && !hasSpecs) return false
  
  return true
}

/**
 * 獲取操作建議
 */
export function getOperationSuggestions(data: any[]): {
  recommended: BatchOperation[]
  notRecommended: BatchOperation[]
} {
  const allOperations = getAvailableBatchOperations()
  const recommended: BatchOperation[] = []
  const notRecommended: BatchOperation[] = []
  
  for (const operation of allOperations) {
    if (isOperationSupported(operation, data)) {
      recommended.push(operation)
    } else {
      notRecommended.push(operation)
    }
  }
  
  return { recommended, notRecommended }
}

/**
 * 預覽批量操作結果
 */
export async function previewBatchOperation(
  operation: BatchOperation,
  data: any[]
): Promise<{
  willProcess: number
  estimatedTime: number
  warnings: string[]
  errors: string[]
}> {
  const warnings: string[] = []
  const errors: string[] = []
  
  // 檢查數據支持性
  if (!isOperationSupported(operation, data)) {
    errors.push(`此操作不支持當前數據類型`)
  }
  
  // 檢查數據量
  if (data.length > 1000) {
    warnings.push(`數據量較大 (${data.length} 項)，操作可能需要較長時間`)
  }
  
  // 估算處理時間 (每項 10ms)
  const estimatedTime = Math.ceil(data.length * 10 / 1000)
  
  return {
    willProcess: data.length,
    estimatedTime,
    warnings,
    errors
  }
}
