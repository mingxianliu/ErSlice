import { DesignModuleData, ModuleUpdateData, ModuleSearchCriteria } from './designModuleManager'
import { validationService } from './validationService'
import { errorHandler } from './errorHandler'

export interface BatchOperation {
  id: string
  type: 'create' | 'read' | 'update' | 'delete'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  items: BatchOperationItem[]
  totalItems: number
  processedItems: number
  successfulItems: number
  failedItems: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  progress: number // 0-100
  errors: BatchOperationError[]
  metadata?: Record<string, any>
}

export interface BatchOperationItem {
  id: string
  originalData?: any
  processedData?: any
  status: 'pending' | 'processing' | 'success' | 'failed' | 'skipped'
  error?: string
  result?: any
  processingTime?: number
}

export interface BatchOperationError {
  itemId: string
  error: string
  code: string
  details?: any
}

export interface BatchCreateOperation {
  template: Partial<DesignModuleData>
  count: number
  namingPattern: string
  variations: Record<string, string[]>
}

export interface BatchUpdateOperation {
  criteria: ModuleSearchCriteria
  updates: ModuleUpdateData
  dryRun?: boolean
}

export interface BatchDeleteOperation {
  criteria: ModuleSearchCriteria
  permanent?: boolean
  backupBeforeDelete?: boolean
}

export interface BatchOperationResult {
  operation: BatchOperation
  summary: {
    total: number
    success: number
    failed: number
    skipped: number
    duration: number
  }
  details: {
    successful: BatchOperationItem[]
    failed: BatchOperationItem[]
    skipped: BatchOperationItem[]
  }
  recommendations: string[]
}

export class BatchOperationService {
  private operations: Map<string, BatchOperation> = new Map()
  private operationQueue: string[] = []
  private isProcessing: boolean = false
  private maxConcurrentOperations: number = 3
  private activeOperations: Set<string> = new Set()

  constructor() {
    this.loadOperationsFromStorage()
  }

  /**
   * 創建批量創建操作
   */
  async createBatchCreateOperation(operation: BatchCreateOperation): Promise<string> {
    const batchOp: BatchOperation = {
      id: this.generateOperationId(),
      type: 'create',
      status: 'pending',
      items: [],
      totalItems: operation.count,
      processedItems: 0,
      successfulItems: 0,
      failedItems: 0,
      createdAt: new Date(),
      progress: 0,
      errors: [],
      metadata: { operation }
    }

    // 生成批量項目
    for (let i = 0; i < operation.count; i++) {
      const itemData = this.generateVariationData(operation.template, operation.variations, i)
      const itemName = this.generateItemName(operation.namingPattern, i, itemData)
      
      batchOp.items.push({
        id: `item_${i}_${Date.now()}`,
        originalData: { ...itemData, name: itemName },
        status: 'pending'
      })
    }

    this.operations.set(batchOp.id, batchOp)
    this.operationQueue.push(batchOp.id)
    this.saveOperationsToStorage()

    console.log(`📦 批量創建操作已創建: ${batchOp.id}，共 ${operation.count} 個項目`)
    return batchOp.id
  }

  /**
   * 創建批量更新操作
   */
  async createBatchUpdateOperation(operation: BatchUpdateOperation): Promise<string> {
    // 先搜尋符合條件的模組
    const modules = await this.searchModules(operation.criteria)
    
    const batchOp: BatchOperation = {
      id: this.generateOperationId(),
      type: 'update',
      status: 'pending',
      items: [],
      totalItems: modules.length,
      processedItems: 0,
      successfulItems: 0,
      failedItems: 0,
      createdAt: new Date(),
      progress: 0,
      errors: [],
      metadata: { operation }
    }

    // 創建更新項目
    modules.forEach(module => {
      batchOp.items.push({
        id: module.id,
        originalData: module,
        status: 'pending'
      })
    })

    this.operations.set(batchOp.id, batchOp)
    this.operationQueue.push(batchOp.id)
    this.saveOperationsToStorage()

    console.log(`📦 批量更新操作已創建: ${batchOp.id}，共 ${modules.length} 個項目`)
    return batchOp.id
  }

  /**
   * 創建批量刪除操作
   */
  async createBatchDeleteOperation(operation: BatchDeleteOperation): Promise<string> {
    // 先搜尋符合條件的模組
    const modules = await this.searchModules(operation.criteria)
    
    const batchOp: BatchOperation = {
      id: this.generateOperationId(),
      type: 'delete',
      status: 'pending',
      items: [],
      totalItems: modules.length,
      processedItems: 0,
      successfulItems: 0,
      failedItems: 0,
      createdAt: new Date(),
      progress: 0,
      errors: [],
      metadata: { operation }
    }

    // 創建刪除項目
    modules.forEach(module => {
      batchOp.items.push({
        id: module.id,
        originalData: module,
        status: 'pending'
      })
    })

    this.operations.set(batchOp.id, batchOp)
    this.operationQueue.push(batchOp.id)
    this.saveOperationsToStorage()

    console.log(`📦 批量刪除操作已創建: ${batchOp.id}，共 ${modules.length} 個項目`)
    return batchOp.id
  }

  /**
   * 執行批量操作
   */
  async executeBatchOperation(operationId: string): Promise<BatchOperationResult> {
    const operation = this.operations.get(operationId)
    if (!operation) {
      throw new Error(`批量操作不存在: ${operationId}`)
    }

    if (operation.status !== 'pending') {
      throw new Error(`批量操作狀態不正確: ${operation.status}`)
    }

    // 檢查並發限制
    if (this.activeOperations.size >= this.maxConcurrentOperations) {
      throw new Error('已達到最大並發操作限制，請稍後重試')
    }

    try {
      // 開始執行
      operation.status = 'processing'
      operation.startedAt = new Date()
      this.activeOperations.add(operationId)
      this.updateOperationProgress(operationId, 0)

      console.log(`🚀 開始執行批量操作: ${operationId}`)

      let result: BatchOperationResult

      switch (operation.type) {
        case 'create':
          result = await this.executeBatchCreate(operation)
          break
        case 'update':
          result = await this.executeBatchUpdate(operation)
          break
        case 'delete':
          result = await this.executeBatchDelete(operation)
          break
        default:
          throw new Error(`不支援的操作類型: ${operation.type}`)
      }

      // 完成操作
      operation.status = 'completed'
      operation.completedAt = new Date()
      operation.progress = 100
      this.activeOperations.delete(operationId)

      this.saveOperationsToStorage()
      console.log(`✅ 批量操作完成: ${operationId}`)

      return result
    } catch (error) {
      // 操作失敗
      operation.status = 'failed'
      operation.completedAt = new Date()
      this.activeOperations.delete(operationId)
      
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'
      operation.errors.push({
        itemId: 'operation',
        error: errorMessage,
        code: 'OPERATION_FAILED'
      })

      this.saveOperationsToStorage()
      console.error(`❌ 批量操作失敗: ${operationId}`, error)

      throw error
    }
  }

  /**
   * 執行批量創建
   */
  private async executeBatchCreate(operation: BatchOperation): Promise<BatchOperationResult> {
    const startTime = Date.now()
    const createOperation = operation.metadata!.operation as BatchCreateOperation

    for (let i = 0; i < operation.items.length; i++) {
      const item = operation.items[i]
      
      try {
        item.status = 'processing'
        const startItemTime = Date.now()

        // 驗證數據
        const validationResult = validationService.validate(item.originalData, 'designModule')
        if (!validationResult.isValid) {
          throw new Error(`數據驗證失敗: ${validationResult.errors.map(e => e.message).join(', ')}`)
        }

        // 創建模組
        const createdModule = await this.createModule(item.originalData)
        
        item.status = 'success'
        item.processedData = createdModule
        item.result = createdModule
        item.processingTime = Date.now() - startItemTime

        operation.successfulItems++
        operation.processedItems++
        
        // 更新進度
        this.updateOperationProgress(operation.id, (operation.processedItems / operation.totalItems) * 100)
        
        // 添加延遲以避免過度負載
        await this.delay(100)
        
      } catch (error) {
        item.status = 'failed'
        item.error = error instanceof Error ? error.message : '未知錯誤'
        item.processingTime = Date.now() - startItemTime

        operation.failedItems++
        operation.processedItems++
        operation.errors.push({
          itemId: item.id,
          error: item.error,
          code: 'CREATE_FAILED'
        })
      }
    }

    return this.generateOperationResult(operation, Date.now() - startTime)
  }

  /**
   * 執行批量更新
   */
  private async executeBatchUpdate(operation: BatchOperation): Promise<BatchOperationResult> {
    const startTime = Date.now()
    const updateOperation = operation.metadata!.operation as BatchUpdateOperation

    for (let i = 0; i < operation.items.length; i++) {
      const item = operation.items[i]
      
      try {
        item.status = 'processing'
        const startItemTime = Date.now()

        // 如果是乾運行，只驗證不實際更新
        if (updateOperation.dryRun) {
          item.status = 'success'
          item.result = { dryRun: true, wouldUpdate: true }
          item.processingTime = Date.now() - startItemTime
          operation.successfulItems++
        } else {
          // 實際更新
          const updatedModule = await this.updateModule(item.id, updateOperation.updates)
          
          item.status = 'success'
          item.processedData = updatedModule
          item.result = updatedModule
          item.processingTime = Date.now() - startItemTime
          operation.successfulItems++
        }

        operation.processedItems++
        this.updateOperationProgress(operation.id, (operation.processedItems / operation.totalItems) * 100)
        
        await this.delay(100)
        
      } catch (error) {
        item.status = 'failed'
        item.error = error instanceof Error ? error.message : '未知錯誤'
        item.processingTime = Date.now() - startItemTime

        operation.failedItems++
        operation.processedItems++
        operation.errors.push({
          itemId: item.id,
          error: item.error,
          code: 'UPDATE_FAILED'
        })
      }
    }

    return this.generateOperationResult(operation, Date.now() - startTime)
  }

  /**
   * 執行批量刪除
   */
  private async executeBatchDelete(operation: BatchOperation): Promise<BatchOperationResult> {
    const startTime = Date.now()
    const deleteOperation = operation.metadata!.operation as BatchDeleteOperation

    for (let i = 0; i < operation.items.length; i++) {
      const item = operation.items[i]
      
      try {
        item.status = 'processing'
        const startItemTime = Date.now()

        // 備份（如果需要）
        if (deleteOperation.backupBeforeDelete) {
          await this.backupModule(item.id)
        }

        // 刪除模組
        const deleted = await this.deleteModule(item.id, deleteOperation.permanent)
        
        item.status = 'success'
        item.result = { deleted, permanent: deleteOperation.permanent }
        item.processingTime = Date.now() - startItemTime
        operation.successfulItems++

        operation.processedItems++
        this.updateOperationProgress(operation.id, (operation.processedItems / operation.totalItems) * 100)
        
        await this.delay(100)
        
      } catch (error) {
        item.status = 'failed'
        item.error = error instanceof Error ? error.message : '未知錯誤'
        item.processingTime = Date.now() - startItemTime

        operation.failedItems++
        operation.processedItems++
        operation.errors.push({
          itemId: item.id,
          error: item.error,
          code: 'DELETE_FAILED'
        })
      }
    }

    return this.generateOperationResult(operation, Date.now() - startTime)
  }

  /**
   * 生成操作結果
   */
  private generateOperationResult(operation: BatchOperation, duration: number): BatchOperationResult {
    const successful = operation.items.filter(item => item.status === 'success')
    const failed = operation.items.filter(item => item.status === 'failed')
    const skipped = operation.items.filter(item => item.status === 'skipped')

    const recommendations: string[] = []
    
    if (failed.length > 0) {
      recommendations.push(`檢查 ${failed.length} 個失敗項目的錯誤信息`)
    }
    
    if (operation.errors.length > 0) {
      recommendations.push('查看詳細錯誤日誌以了解失敗原因')
    }
    
    if (successful.length > 0) {
      recommendations.push(`${successful.length} 個項目處理成功`)
    }

    return {
      operation,
      summary: {
        total: operation.totalItems,
        success: operation.successfulItems,
        failed: operation.failedItems,
        skipped: skipped.length,
        duration
      },
      details: {
        successful,
        failed,
        skipped
      },
      recommendations
    }
  }

  /**
   * 取消批量操作
   */
  cancelBatchOperation(operationId: string): boolean {
    const operation = this.operations.get(operationId)
    if (!operation || operation.status !== 'pending') {
      return false
    }

    operation.status = 'cancelled'
    operation.completedAt = new Date()
    
    // 從隊列中移除
    const index = this.operationQueue.indexOf(operationId)
    if (index > -1) {
      this.operationQueue.splice(index, 1)
    }

    this.saveOperationsToStorage()
    console.log(`❌ 批量操作已取消: ${operationId}`)
    return true
  }

  /**
   * 重試失敗的項目
   */
  async retryFailedItems(operationId: string): Promise<boolean> {
    const operation = this.operations.get(operationId)
    if (!operation || operation.status !== 'completed') {
      return false
    }

    const failedItems = operation.items.filter(item => item.status === 'failed')
    if (failedItems.length === 0) {
      return false
    }

    // 創建新的重試操作
    const retryOperation: BatchOperation = {
      id: this.generateOperationId(),
      type: operation.type,
      status: 'pending',
      items: failedItems.map(item => ({
        ...item,
        status: 'pending' as const,
        error: undefined,
        result: undefined,
        processingTime: undefined
      })),
      totalItems: failedItems.length,
      processedItems: 0,
      successfulItems: 0,
      failedItems: 0,
      createdAt: new Date(),
      progress: 0,
      errors: [],
      metadata: { ...operation.metadata, isRetry: true, originalOperation: operationId }
    }

    this.operations.set(retryOperation.id, retryOperation)
    this.operationQueue.push(retryOperation.id)
    this.saveOperationsToStorage()

    console.log(`🔄 重試操作已創建: ${retryOperation.id}，共 ${failedItems.length} 個失敗項目`)
    return true
  }

  /**
   * 獲取批量操作
   */
  getBatchOperation(operationId: string): BatchOperation | undefined {
    return this.operations.get(operationId)
  }

  /**
   * 獲取所有批量操作
   */
  getAllBatchOperations(): BatchOperation[] {
    return Array.from(this.operations.values())
  }

  /**
   * 獲取待處理的批量操作
   */
  getPendingBatchOperations(): BatchOperation[] {
    return Array.from(this.operations.values()).filter(op => op.status === 'pending')
  }

  /**
   * 獲取正在執行的批量操作
   */
  getProcessingBatchOperations(): BatchOperation[] {
    return Array.from(this.operations.values()).filter(op => op.status === 'processing')
  }

  /**
   * 清理已完成的批量操作
   */
  cleanupCompletedOperations(daysToKeep: number = 7): number {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    
    let cleanedCount = 0
    
    for (const [id, operation] of this.operations.entries()) {
      if (operation.completedAt && operation.completedAt < cutoffDate) {
        this.operations.delete(id)
        cleanedCount++
      }
    }

    console.log(`🧹 已清理 ${cleanedCount} 個已完成的批量操作`)
    return cleanedCount
  }

  /**
   * 更新操作進度
   */
  private updateOperationProgress(operationId: string, progress: number): void {
    const operation = this.operations.get(operationId)
    if (operation) {
      operation.progress = Math.min(100, Math.max(0, progress))
    }
  }

  /**
   * 生成變體數據
   */
  private generateVariationData(template: Partial<DesignModuleData>, variations: Record<string, string[]>, index: number): Partial<DesignModuleData> {
    const data = { ...template }
    
    Object.keys(variations).forEach(key => {
      const values = variations[key]
      if (values && values.length > 0) {
        (data as any)[key] = values[index % values.length]
      }
    })
    
    return data
  }

  /**
   * 生成項目名稱
   */
  private generateItemName(pattern: string, index: number, data: any): string {
    return pattern
      .replace(/{index}/g, (index + 1).toString())
      .replace(/{name}/g, data.name || 'Module')
      .replace(/{timestamp}/g, Date.now().toString())
  }

  /**
   * 延遲函數
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 生成操作 ID
   */
  private generateOperationId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 從本地存儲載入操作
   */
  private loadOperationsFromStorage(): void {
    try {
      const operationsJson = localStorage.getItem('erslice-batch-operations')
      if (operationsJson) {
        const operationsData = JSON.parse(operationsJson)
        operationsData.forEach((operation: BatchOperation) => {
          // 恢復日期對象
          operation.createdAt = new Date(operation.createdAt)
          if (operation.startedAt) operation.startedAt = new Date(operation.startedAt)
          if (operation.completedAt) operation.completedAt = new Date(operation.completedAt)
          
          operation.items.forEach(item => {
            if (item.originalData?.created_at) {
              item.originalData.created_at = new Date(item.originalData.created_at)
            }
            if (item.originalData?.updated_at) {
              item.originalData.updated_at = new Date(item.originalData.updated_at)
            }
          })
          
          this.operations.set(operation.id, operation)
        })
      }
    } catch (error) {
      console.warn('從本地存儲載入批量操作失敗:', error)
    }
  }

  /**
   * 保存操作到本地存儲
   */
  private saveOperationsToStorage(): void {
    try {
      const operationsData = Array.from(this.operations.values())
      localStorage.setItem('erslice-batch-operations', JSON.stringify(operationsData))
    } catch (error) {
      console.error('保存批量操作到本地存儲失敗:', error)
    }
  }

  // 模擬外部服務調用（實際實現中需要替換為真實的服務調用）
  private async searchModules(criteria: ModuleSearchCriteria): Promise<DesignModuleData[]> {
    // 這裡應該調用真實的模組搜尋服務
    return []
  }

  private async createModule(data: any): Promise<DesignModuleData> {
    // 這裡應該調用真實的模組創建服務
    return data as DesignModuleData
  }

  private async updateModule(id: string, updates: ModuleUpdateData): Promise<DesignModuleData | null> {
    // 這裡應該調用真實的模組更新服務
    return null
  }

  private async deleteModule(id: string, permanent: boolean): Promise<boolean> {
    // 這裡應該調用真實的模組刪除服務
    return true
  }

  private async backupModule(id: string): Promise<void> {
    // 這裡應該調用真實的模組備份服務
  }
}

// 創建單例實例
export const batchOperationService = new BatchOperationService()
