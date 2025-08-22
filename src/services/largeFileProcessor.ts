import { AnalysisConfig } from '@/components/ui/AnalysisConfigPanel'

export interface FileChunk {
  id: string
  startByte: number
  endByte: number
  size: number
  data: ArrayBuffer
  processed: boolean
  error?: string
}

export interface ProcessingTask {
  id: string
  fileId: string
  fileName: string
  fileSize: number
  totalChunks: number
  completedChunks: number
  failedChunks: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  startTime: number
  endTime?: number
  chunks: FileChunk[]
  memoryUsage: number
  progress: number
}

export interface PerformanceMetrics {
  processingTime: number
  memoryUsage: number
  throughput: number // bytes per second
  chunkEfficiency: number
  errorRate: number
  cpuUsage: number
}

export interface OptimizationConfig {
  // 分塊設定
  chunkSize: number // bytes
  maxConcurrentChunks: number
  overlapSize: number // bytes
  
  // 記憶體管理
  maxMemoryUsage: number // MB
  memoryCleanupThreshold: number // percentage
  enableGarbageCollection: boolean
  
  // 並行處理
  workerThreads: number
  enableWebWorkers: boolean
  taskQueueSize: number
  
  // 快取設定
  enableCaching: boolean
  cacheSize: number // MB
  cacheExpiration: number // seconds
  
  // 性能監控
  enablePerformanceMonitoring: boolean
  metricsCollectionInterval: number // milliseconds
  performanceThresholds: {
    maxProcessingTime: number // seconds
    maxMemoryUsage: number // MB
    minThroughput: number // bytes per second
  }
}

export class LargeFileProcessor {
  private config: OptimizationConfig
  private activeTasks: Map<string, ProcessingTask> = new Map()
  private workerPool: Worker[] = []
  private performanceMetrics: PerformanceMetrics[] = []
  private cache: Map<string, any> = new Map()
  private isMonitoring = false

  constructor(config?: Partial<OptimizationConfig>) {
    this.config = {
      // 默認配置
      chunkSize: 1024 * 1024, // 1MB
      maxConcurrentChunks: 4,
      overlapSize: 1024, // 1KB
      maxMemoryUsage: 512, // 512MB
      memoryCleanupThreshold: 80, // 80%
      enableGarbageCollection: true,
      workerThreads: navigator.hardwareConcurrency || 4,
      enableWebWorkers: true,
      taskQueueSize: 100,
      enableCaching: true,
      cacheSize: 100, // 100MB
      cacheExpiration: 3600, // 1 hour
      enablePerformanceMonitoring: true,
      metricsCollectionInterval: 1000, // 1 second
      performanceThresholds: {
        maxProcessingTime: 300, // 5 minutes
        maxMemoryUsage: 1024, // 1GB
        minThroughput: 1024 * 1024 // 1MB/s
      },
      ...config
    }

    this.initializeWorkerPool()
    this.startPerformanceMonitoring()
  }

  /**
   * 初始化 Worker 池
   */
  private initializeWorkerPool(): void {
    if (!this.config.enableWebWorkers) return

    try {
      for (let i = 0; i < this.config.workerThreads; i++) {
        const worker = new Worker(new URL('./fileProcessingWorker.ts', import.meta.url))
        worker.onmessage = this.handleWorkerMessage.bind(this)
        worker.onerror = this.handleWorkerError.bind(this)
        this.workerPool.push(worker)
      }
    } catch (error) {
      console.warn('Web Workers 不可用，使用主線程處理:', error)
      this.config.enableWebWorkers = false
    }
  }

  /**
   * 處理大檔案
   */
  async processLargeFile(
    file: File,
    processor: (chunk: FileChunk) => Promise<any>,
    options?: {
      onProgress?: (progress: number) => void
      onChunkComplete?: (chunk: FileChunk, result: any) => void
      onError?: (error: Error) => void
    }
  ): Promise<ProcessingTask> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 創建處理任務
    const task: ProcessingTask = {
      id: taskId,
      fileId: file.name,
      fileName: file.name,
      fileSize: file.size,
      totalChunks: Math.ceil(file.size / this.config.chunkSize),
      completedChunks: 0,
      failedChunks: 0,
      status: 'pending',
      startTime: Date.now(),
      chunks: [],
      memoryUsage: 0,
      progress: 0
    }

    this.activeTasks.set(taskId, task)

    try {
      // 分塊檔案
      const chunks = await this.createFileChunks(file)
      task.chunks = chunks
      task.status = 'processing'

      // 並行處理分塊
      await this.processChunksInParallel(task, processor, options)

      task.status = 'completed'
      task.endTime = Date.now()
      task.progress = 100

      // 清理記憶體
      this.cleanupMemory()

      return task
    } catch (error) {
      task.status = 'error'
      task.endTime = Date.now()
      options?.onError?.(error as Error)
      throw error
    }
  }

  /**
   * 創建檔案分塊
   */
  private async createFileChunks(file: File): Promise<FileChunk[]> {
    const chunks: FileChunk[] = []
    const totalChunks = Math.ceil(file.size / this.config.chunkSize)

    for (let i = 0; i < totalChunks; i++) {
      const startByte = i * this.config.chunkSize
      const endByte = Math.min(startByte + this.config.chunkSize, file.size)
      const size = endByte - startByte

      // 讀取分塊數據
      const chunkData = await this.readFileChunk(file, startByte, endByte)

      chunks.push({
        id: `chunk_${i}_${Date.now()}`,
        startByte,
        endByte,
        size,
        data: chunkData,
        processed: false
      })
    }

    return chunks
  }

  /**
   * 讀取檔案分塊
   */
  private async readFileChunk(file: File, start: number, end: number): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      const blob = file.slice(start, end)

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result)
        } else {
          reject(new Error('讀取檔案分塊失敗'))
        }
      }

      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(blob)
    })
  }

  /**
   * 並行處理分塊
   */
  private async processChunksInParallel(
    task: ProcessingTask,
    processor: (chunk: FileChunk) => Promise<any>,
    options?: {
      onProgress?: (progress: number) => void
      onChunkComplete?: (chunk: FileChunk, result: any) => void
      onError?: (error: Error) => void
    }
  ): Promise<void> {
    const { maxConcurrentChunks } = this.config
    const chunks = [...task.chunks]
    const results: Map<string, any> = new Map()
    let completedCount = 0

    // 創建處理隊列
    const processChunk = async (chunk: FileChunk) => {
      try {
        // 檢查記憶體使用情況
        await this.checkMemoryUsage()

        let result: any
        if (this.config.enableWebWorkers && this.workerPool.length > 0) {
          result = await this.processChunkWithWorker(chunk, processor)
        } else {
          result = await processor(chunk)
        }

        chunk.processed = true
        results.set(chunk.id, result)
        completedCount++
        task.completedChunks = completedCount
        task.progress = (completedCount / task.totalChunks) * 100

        options?.onChunkComplete?.(chunk, result)
        options?.onProgress?.(task.progress)

        // 清理已處理的分塊數據以節省記憶體
        chunk.data = new ArrayBuffer(0)
      } catch (error) {
        chunk.processed = false
        chunk.error = error instanceof Error ? error.message : '未知錯誤'
        task.failedChunks++
        options?.onError?.(error as Error)
      }
    }

    // 使用信號量控制並發數
    const semaphore = new Semaphore(maxConcurrentChunks)
    
    const promises = chunks.map(async (chunk) => {
      await semaphore.acquire()
      try {
        await processChunk(chunk)
      } finally {
        semaphore.release()
      }
    })

    await Promise.all(promises)
  }

  /**
   * 使用 Worker 處理分塊
   */
  private async processChunkWithWorker(
    chunk: FileChunk,
    processor: (chunk: FileChunk) => Promise<any>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.getAvailableWorker()
      if (!worker) {
        // 如果沒有可用的 Worker，使用主線程
        processor(chunk).then(resolve).catch(reject)
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('Worker 處理超時'))
      }, 30000) // 30 秒超時

      worker.onmessage = (event) => {
        clearTimeout(timeout)
        if (event.data.error) {
          reject(new Error(event.data.error))
        } else {
          resolve(event.data.result)
        }
      }

      worker.postMessage({
        type: 'process_chunk',
        chunk: {
          id: chunk.id,
          startByte: chunk.startByte,
          endByte: chunk.endByte,
          size: chunk.size,
          data: chunk.data
        }
      })
    })
  }

  /**
   * 獲取可用的 Worker
   */
  private getAvailableWorker(): Worker | null {
    // 簡單的輪詢策略，實際應用中可以使用更智能的負載均衡
    return this.workerPool[Math.floor(Math.random() * this.workerPool.length)] || null
  }

  /**
   * 檢查記憶體使用情況
   */
  private async checkMemoryUsage(): Promise<void> {
    if (!this.config.enableGarbageCollection) return

    const memoryInfo = (performance as any).memory
    if (memoryInfo) {
      const usedMemoryMB = memoryInfo.usedJSHeapSize / (1024 * 1024)
      
      if (usedMemoryMB > this.config.maxMemoryUsage * (this.config.memoryCleanupThreshold / 100)) {
        await this.forceGarbageCollection()
      }
    }
  }

  /**
   * 強制垃圾回收
   */
  private async forceGarbageCollection(): Promise<void> {
    if ((globalThis as any).gc) {
      (globalThis as any).gc()
    }
    
    // 清理快取
    if (this.config.enableCaching) {
      this.cleanupCache()
    }
  }

  /**
   * 清理快取
   */
  private cleanupCache(): void {
    const now = Date.now()
    const maxAge = this.config.cacheExpiration * 1000

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key)
      }
    }

    // 如果快取大小超過限制，刪除最舊的項目
    if (this.cache.size > this.config.cacheSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toDelete = entries.slice(0, entries.length - this.config.cacheSize)
      toDelete.forEach(([key]) => this.cache.delete(key))
    }
  }

  /**
   * 清理記憶體
   */
  private cleanupMemory(): void {
    // 清理已完成的任務
    for (const [taskId, task] of this.activeTasks.entries()) {
      if (task.status === 'completed' || task.status === 'error') {
        this.activeTasks.delete(taskId)
      }
    }

    // 強制垃圾回收
    if (this.config.enableGarbageCollection) {
      this.forceGarbageCollection()
    }
  }

  /**
   * 開始性能監控
   */
  private startPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring) return

    this.isMonitoring = true
    this.monitorPerformance()
  }

  /**
   * 監控性能
   */
  private monitorPerformance(): void {
    if (!this.isMonitoring) return

    const metrics = this.collectPerformanceMetrics()
    this.performanceMetrics.push(metrics)

    // 保持最近的指標
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100)
    }

    // 檢查性能閾值
    this.checkPerformanceThresholds(metrics)

    setTimeout(() => this.monitorPerformance(), this.config.metricsCollectionInterval)
  }

  /**
   * 收集性能指標
   */
  private collectPerformanceMetrics(): PerformanceMetrics {
    const memoryInfo = (performance as any).memory
    const now = Date.now()

    return {
      processingTime: now,
      memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize / (1024 * 1024) : 0,
      throughput: this.calculateThroughput(),
      chunkEfficiency: this.calculateChunkEfficiency(),
      errorRate: this.calculateErrorRate(),
      cpuUsage: this.estimateCPUUsage()
    }
  }

  /**
   * 計算吞吐量
   */
  private calculateThroughput(): number {
    let totalBytes = 0
    let totalTime = 0

    for (const task of this.activeTasks.values()) {
      if (task.status === 'completed') {
        totalBytes += task.fileSize
        totalTime += (task.endTime || 0) - task.startTime
      }
    }

    return totalTime > 0 ? totalBytes / (totalTime / 1000) : 0
  }

  /**
   * 計算分塊效率
   */
  private calculateChunkEfficiency(): number {
    let totalChunks = 0
    let processedChunks = 0

    for (const task of this.activeTasks.values()) {
      totalChunks += task.totalChunks
      processedChunks += task.completedChunks
    }

    return totalChunks > 0 ? (processedChunks / totalChunks) * 100 : 0
  }

  /**
   * 計算錯誤率
   */
  private calculateErrorRate(): number {
    let totalChunks = 0
    let failedChunks = 0

    for (const task of this.activeTasks.values()) {
      totalChunks += task.totalChunks
      failedChunks += task.failedChunks
    }

    return totalChunks > 0 ? (failedChunks / totalChunks) * 100 : 0
  }

  /**
   * 估算 CPU 使用率
   */
  private estimateCPUUsage(): number {
    // 簡單的 CPU 使用率估算
    const activeTasks = Array.from(this.activeTasks.values()).filter(
      task => task.status === 'processing'
    )
    
    return Math.min(activeTasks.length / this.config.maxConcurrentChunks * 100, 100)
  }

  /**
   * 檢查性能閾值
   */
  private checkPerformanceThresholds(metrics: PerformanceMetrics): void {
    const { performanceThresholds } = this.config

    if (metrics.memoryUsage > performanceThresholds.maxMemoryUsage) {
      console.warn('記憶體使用量超過閾值:', metrics.memoryUsage, 'MB')
      this.cleanupMemory()
    }

    if (metrics.throughput < performanceThresholds.minThroughput) {
      console.warn('吞吐量低於閾值:', metrics.throughput, 'bytes/s')
    }
  }

  /**
   * 獲取性能報告
   */
  getPerformanceReport(): {
    currentMetrics: PerformanceMetrics
    historicalMetrics: PerformanceMetrics[]
    recommendations: string[]
  } {
    const currentMetrics = this.performanceMetrics[this.performanceMetrics.length - 1] || {
      processingTime: 0,
      memoryUsage: 0,
      throughput: 0,
      chunkEfficiency: 0,
      errorRate: 0,
      cpuUsage: 0
    }

    const recommendations: string[] = []

    if (currentMetrics.memoryUsage > this.config.maxMemoryUsage * 0.8) {
      recommendations.push('建議減少並發分塊數量以降低記憶體使用')
    }

    if (currentMetrics.errorRate > 5) {
      recommendations.push('錯誤率較高，建議檢查檔案格式和處理邏輯')
    }

    if (currentMetrics.throughput < this.config.performanceThresholds.minThroughput) {
      recommendations.push('吞吐量較低，建議優化分塊大小和並發數')
    }

    return {
      currentMetrics,
      historicalMetrics: [...this.performanceMetrics],
      recommendations
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // 重新初始化 Worker 池
    if (newConfig.workerThreads !== undefined || newConfig.enableWebWorkers !== undefined) {
      this.workerPool.forEach(worker => worker.terminate())
      this.workerPool = []
      this.initializeWorkerPool()
    }
  }

  /**
   * 停止性能監控
   */
  stopPerformanceMonitoring(): void {
    this.isMonitoring = false
  }

  /**
   * 清理資源
   */
  destroy(): void {
    this.stopPerformanceMonitoring()
    this.workerPool.forEach(worker => worker.terminate())
    this.workerPool = []
    this.activeTasks.clear()
    this.cache.clear()
    this.performanceMetrics = []
  }
}

/**
 * 信號量類，用於控制並發數
 */
class Semaphore {
  private permits: number
  private waitQueue: Array<() => void> = []

  constructor(permits: number) {
    this.permits = permits
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve)
    })
  }

  release(): void {
    this.permits++
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()!
      resolve()
    }
  }
}

// 創建單例實例
export const largeFileProcessor = new LargeFileProcessor()
