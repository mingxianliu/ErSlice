// Web Worker 檔案處理器
// 用於在後台線程中處理檔案分塊，避免阻塞主線程

interface WorkerMessage {
  type: string
  chunk?: {
    id: string
    startByte: number
    endByte: number
    size: number
    data: ArrayBuffer
  }
  config?: any
}

interface WorkerResponse {
  type: string
  chunkId?: string
  result?: any
  error?: string
  progress?: number
}

// 監聽主線程消息
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, chunk, config } = event.data

  try {
    switch (type) {
      case 'process_chunk':
        if (chunk) {
          const result = await processFileChunk(chunk, config)
          const response: WorkerResponse = {
            type: 'chunk_complete',
            chunkId: chunk.id,
            result
          }
          self.postMessage(response)
        }
        break

      case 'analyze_chunk':
        if (chunk) {
          const analysis = await analyzeFileChunk(chunk, config)
          const response: WorkerResponse = {
            type: 'analysis_complete',
            chunkId: chunk.id,
            result: analysis
          }
          self.postMessage(response)
        }
        break

      case 'validate_chunk':
        if (chunk) {
          const validation = await validateFileChunk(chunk, config)
          const response: WorkerResponse = {
            type: 'validation_complete',
            chunkId: chunk.id,
            result: validation
          }
          self.postMessage(response)
        }
        break

      case 'transform_chunk':
        if (chunk) {
          const transformed = await transformFileChunk(chunk, config)
          const response: WorkerResponse = {
            type: 'transformation_complete',
            chunkId: chunk.id,
            result: transformed
          }
          self.postMessage(response)
        }
        break

      default:
        throw new Error(`未知的消息類型: ${type}`)
    }
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      chunkId: chunk?.id,
      error: error instanceof Error ? error.message : '未知錯誤'
    }
    self.postMessage(response)
  }
}

/**
 * 處理檔案分塊
 */
async function processFileChunk(chunk: any, config?: any): Promise<any> {
  // 模擬處理時間
  await simulateProcessing(chunk.size)
  
  // 根據分塊大小和配置進行處理
  const result = {
    processed: true,
    size: chunk.size,
    startByte: chunk.startByte,
    endByte: chunk.endByte,
    metadata: extractMetadata(chunk.data),
    checksum: calculateChecksum(chunk.data),
    timestamp: Date.now()
  }

  return result
}

/**
 * 分析檔案分塊
 */
async function analyzeFileChunk(chunk: any, config?: any): Promise<any> {
  await simulateProcessing(chunk.size * 0.5) // 分析通常比處理快

  const analysis = {
    type: detectFileType(chunk.data),
    size: chunk.size,
    compression: estimateCompression(chunk.data),
    quality: assessQuality(chunk.data),
    features: extractFeatures(chunk.data)
  }

  return analysis
}

/**
 * 驗證檔案分塊
 */
async function validateFileChunk(chunk: any, config?: any): Promise<any> {
  await simulateProcessing(chunk.size * 0.1) // 驗證通常很快

  const validation = {
    valid: true,
    errors: [],
    warnings: [],
    integrity: checkIntegrity(chunk.data),
    format: validateFormat(chunk.data)
  }

  return validation
}

/**
 * 轉換檔案分塊
 */
async function transformFileChunk(chunk: any, config?: any): Promise<any> {
  await simulateProcessing(chunk.size * 0.8)

  const transformed = {
    originalSize: chunk.size,
    transformedSize: chunk.size, // 實際應用中會根據轉換結果計算
    format: config?.targetFormat || 'unknown',
    quality: config?.quality || 'high',
    metadata: extractMetadata(chunk.data)
  }

  return transformed
}

/**
 * 模擬處理時間
 */
function simulateProcessing(size: number): Promise<void> {
  // 根據檔案大小模擬處理時間
  const processingTime = Math.max(10, Math.min(1000, size / 1024)) // 10ms - 1000ms
  return new Promise(resolve => setTimeout(resolve, processingTime))
}

/**
 * 提取元數據
 */
function extractMetadata(data: ArrayBuffer): any {
  try {
    // 簡單的元數據提取
    const view = new Uint8Array(data)
    const header = view.slice(0, Math.min(64, view.length))
    
    return {
      headerSize: header.length,
      hasHeader: header.length > 0,
      firstBytes: Array.from(header.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ')
    }
  } catch (error) {
    return { error: '無法提取元數據' }
  }
}

/**
 * 計算校驗和
 */
function calculateChecksum(data: ArrayBuffer): string {
  try {
    const view = new Uint8Array(data)
    let checksum = 0
    
    for (let i = 0; i < view.length; i++) {
      checksum = (checksum + view[i]) & 0xFFFFFFFF
    }
    
    return checksum.toString(16).padStart(8, '0')
  } catch (error) {
    return '00000000'
  }
}

/**
 * 檢測檔案類型
 */
function detectFileType(data: ArrayBuffer): string {
  try {
    const view = new Uint8Array(data)
    const header = view.slice(0, 8)
    
    // 檢測常見檔案格式的魔術數字
    if (header[0] === 0xFF && header[1] === 0xD8) return 'JPEG'
    if (header[0] === 0x89 && header[1] === 0x50) return 'PNG'
    if (header[0] === 0x47 && header[1] === 0x49) return 'GIF'
    if (header[0] === 0x52 && header[1] === 0x49) return 'RIFF'
    if (header[0] === 0x25 && header[1] === 0x50) return 'PDF'
    
    return 'unknown'
  } catch (error) {
    return 'unknown'
  }
}

/**
 * 估算壓縮率
 */
function estimateCompression(data: ArrayBuffer): number {
  try {
    const view = new Uint8Array(data)
    let entropy = 0
    const byteCounts = new Array(256).fill(0)
    
    // 計算字節頻率
    for (let i = 0; i < view.length; i++) {
      byteCounts[view[i]]++
    }
    
    // 計算熵
    for (let i = 0; i < 256; i++) {
      if (byteCounts[i] > 0) {
        const p = byteCounts[i] / view.length
        entropy -= p * Math.log2(p)
      }
    }
    
    // 估算壓縮率 (熵越低，壓縮率越高)
    return Math.max(0, Math.min(1, (8 - entropy) / 8))
  } catch (error) {
    return 0.5
  }
}

/**
 * 評估質量
 */
function assessQuality(data: ArrayBuffer): string {
  try {
    const size = data.byteLength
    
    if (size < 1024) return 'low'
    if (size < 1024 * 1024) return 'medium'
    if (size < 10 * 1024 * 1024) return 'high'
    return 'very_high'
  } catch (error) {
    return 'unknown'
  }
}

/**
 * 提取特徵
 */
function extractFeatures(data: ArrayBuffer): any {
  try {
    const view = new Uint8Array(data)
    const features = {
      size: data.byteLength,
      hasNullBytes: false,
      byteDistribution: new Array(256).fill(0),
      patterns: []
    }
    
    // 分析字節分佈
    for (let i = 0; i < view.length; i++) {
      features.byteDistribution[view[i]]++
      if (view[i] === 0) features.hasNullBytes = true
    }
    
    // 檢測簡單模式
    for (let i = 0; i < view.length - 3; i++) {
      if (view[i] === view[i + 1] && view[i + 1] === view[i + 2]) {
        features.patterns.push(`repeated_${view[i].toString(16)}`)
        break
      }
    }
    
    return features
  } catch (error) {
    return { error: '無法提取特徵' }
  }
}

/**
 * 檢查完整性
 */
function checkIntegrity(data: ArrayBuffer): boolean {
  try {
    // 簡單的完整性檢查
    const view = new Uint8Array(data)
    return view.length > 0 && view.length <= 100 * 1024 * 1024 // 最大 100MB
  } catch (error) {
    return false
  }
}

/**
 * 驗證格式
 */
function validateFormat(data: ArrayBuffer): boolean {
  try {
    const fileType = detectFileType(data)
    if (fileType === 'unknown') return false
    
    // 根據檔案類型進行基本驗證
    const view = new Uint8Array(data)
    const minSize = 100 // 最小檔案大小
    
    return view.length >= minSize
  } catch (error) {
    return false
  }
}

/**
 * 錯誤處理
 */
self.onerror = (error: ErrorEvent) => {
  const response: WorkerResponse = {
    type: 'error',
    error: error.message || 'Worker 錯誤'
  }
  self.postMessage(response)
}

/**
 * 未處理的 Promise 拒絕
 */
self.onunhandledrejection = (event: PromiseRejectionEvent) => {
  const response: WorkerResponse = {
    type: 'error',
    error: event.reason?.message || '未處理的 Promise 拒絕'
  }
  self.postMessage(response)
}

// 通知主線程 Worker 已準備就緒
self.postMessage({ type: 'worker_ready' })
