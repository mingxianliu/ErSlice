export interface FileValidationResult {
  isValid: boolean
  errors: FileValidationError[]
  warnings: FileValidationWarning[]
  metadata: FileMetadata
  security: SecurityScanResult
  integrity: IntegrityCheckResult
}

export interface FileValidationError {
  code: string
  message: string
  severity: 'error' | 'warning'
  field: string
  suggestion?: string
}

export interface FileValidationWarning {
  code: string
  message: string
  suggestion: string
}

export interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: Date
  dimensions?: { width: number; height: number }
  format: string
  compression?: number
  quality?: number
}

export interface SecurityScanResult {
  isSafe: boolean
  threats: SecurityThreat[]
  scanTime: Date
  scanVersion: string
}

export interface SecurityThreat {
  type: 'malware' | 'suspicious_code' | 'oversized' | 'invalid_format'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendation: string
}

export interface IntegrityCheckResult {
  checksum: string
  algorithm: 'MD5' | 'SHA1' | 'SHA256'
  isValid: boolean
  corruptionDetected: boolean
  repairPossible: boolean
}

export interface FileProcessingOptions {
  maxSize: number
  allowedFormats: string[]
  enableCompression: boolean
  enableSecurityScan: boolean
  enableIntegrityCheck: boolean
  compressionQuality: number
}

export class FileValidationService {
  private defaultOptions: FileProcessingOptions = {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedFormats: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'application/zip'],
    enableCompression: true,
    enableSecurityScan: true,
    enableIntegrityCheck: true,
    compressionQuality: 0.8
  }

  /**
   * 驗證檔案
   */
  async validateFile(file: File, options?: Partial<FileProcessingOptions>): Promise<FileValidationResult> {
    const config = { ...this.defaultOptions, ...options }
    const result: FileValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      metadata: {} as FileMetadata,
      security: { isSafe: true, threats: [], scanTime: new Date(), scanVersion: '1.0.0' },
      integrity: { checksum: '', algorithm: 'SHA256', isValid: true, corruptionDetected: false, repairPossible: false }
    }

    try {
      // 1. 基礎檔案驗證
      const basicValidation = this.validateBasicFile(file, config)
      if (!basicValidation.isValid) {
        result.errors.push(...basicValidation.errors)
        result.isValid = false
      }

      // 2. 提取檔案元資料
      result.metadata = await this.extractFileMetadata(file)

      // 3. 安全性掃描
      if (config.enableSecurityScan) {
        result.security = await this.performSecurityScan(file, config)
        if (!result.security.isSafe) {
          result.isValid = false
        }
      }

      // 4. 完整性檢查
      if (config.enableIntegrityCheck) {
        result.integrity = await this.performIntegrityCheck(file)
        if (!result.integrity.isValid) {
          result.isValid = false
        }
      }

      // 5. 檔案格式驗證
      const formatValidation = this.validateFileFormat(file, config)
      if (!formatValidation.isValid) {
        result.errors.push(...formatValidation.errors)
        result.isValid = false
      }

      // 6. 檔案大小優化建議
      if (file.size > 10 * 1024 * 1024) { // 10MB
        result.warnings.push({
          code: 'LARGE_FILE',
          message: '檔案較大，建議進行壓縮優化',
          suggestion: '啟用檔案壓縮功能以減少檔案大小'
        })
      }

    } catch (error) {
      result.errors.push({
        code: 'VALIDATION_ERROR',
        message: `檔案驗證過程中發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`,
        severity: 'error',
        field: 'general'
      })
      result.isValid = false
    }

    return result
  }

  /**
   * 基礎檔案驗證
   */
  private validateBasicFile(file: File, config: FileProcessingOptions): { isValid: boolean; errors: FileValidationError[] } {
    const errors: FileValidationError[] = []

    // 檢查檔案大小
    if (file.size > config.maxSize) {
      errors.push({
        code: 'FILE_TOO_LARGE',
        message: `檔案大小超過限制: ${this.formatFileSize(file.size)} > ${this.formatFileSize(config.maxSize)}`,
        severity: 'error',
        field: 'size',
        suggestion: '請選擇較小的檔案或聯繫管理員調整大小限制'
      })
    }

    // 檢查檔案名稱
    if (!file.name || file.name.trim().length === 0) {
      errors.push({
        code: 'INVALID_FILENAME',
        message: '檔案名稱無效',
        severity: 'error',
        field: 'name',
        suggestion: '請提供有效的檔案名稱'
      })
    }

    // 檢查檔案類型
    if (!file.type || file.type.trim().length === 0) {
      errors.push({
        code: 'INVALID_FILE_TYPE',
        message: '檔案類型無法識別',
        severity: 'error',
        field: 'type',
        suggestion: '請選擇支援的檔案格式'
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 提取檔案元資料
   */
  private async extractFileMetadata(file: File): Promise<FileMetadata> {
    const metadata: FileMetadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      format: this.detectFileFormat(file),
      compression: this.estimateCompression(file),
      quality: this.assessFileQuality(file)
    }

    // 如果是圖片檔案，提取尺寸信息
    if (file.type.startsWith('image/')) {
      try {
        const dimensions = await this.extractImageDimensions(file)
        metadata.dimensions = dimensions
      } catch (error) {
        console.warn('無法提取圖片尺寸:', error)
      }
    }

    return metadata
  }

  /**
   * 執行安全性掃描
   */
  private async performSecurityScan(file: File, config: FileProcessingOptions): Promise<SecurityScanResult> {
    const threats: SecurityThreat[] = []

    // 檢查檔案大小異常
    if (file.size > 50 * 1024 * 1024) { // 50MB
      threats.push({
        type: 'oversized',
        severity: 'medium',
        description: '檔案大小異常，可能存在安全風險',
        recommendation: '檢查檔案內容，確認檔案來源可信'
      })
    }

    // 檢查檔案類型與副檔名是否匹配
    const extension = this.getFileExtension(file.name)
    const mimeType = file.type
    if (!this.isMimeTypeExtensionMatch(mimeType, extension)) {
      threats.push({
        type: 'suspicious_code',
        severity: 'high',
        description: '檔案類型與副檔名不匹配，可能存在偽裝風險',
        recommendation: '重新檢查檔案，確認檔案來源和內容'
      })
    }

    // 檢查檔案名稱中的可疑字符
    if (this.containsSuspiciousCharacters(file.name)) {
      threats.push({
        type: 'suspicious_code',
        severity: 'medium',
        description: '檔案名稱包含可疑字符',
        recommendation: '使用標準的檔案命名規範'
      })
    }

    return {
      isSafe: threats.length === 0,
      threats,
      scanTime: new Date(),
      scanVersion: '1.0.0'
    }
  }

  /**
   * 執行完整性檢查
   */
  private async performIntegrityCheck(file: File): Promise<IntegrityCheckResult> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const checksum = await this.calculateChecksum(arrayBuffer, 'SHA256')
      
      // 檢查檔案是否損壞
      const isCorrupted = this.detectFileCorruption(arrayBuffer, file.type)
      
      return {
        checksum,
        algorithm: 'SHA256',
        isValid: !isCorrupted,
        corruptionDetected: isCorrupted,
        repairPossible: this.isRepairPossible(file.type, isCorrupted)
      }
    } catch (error) {
      return {
        checksum: '',
        algorithm: 'SHA256',
        isValid: false,
        corruptionDetected: true,
        repairPossible: false
      }
    }
  }

  /**
   * 驗證檔案格式
   */
  private validateFileFormat(file: File, config: FileProcessingOptions): { isValid: boolean; errors: FileValidationError[] } {
    const errors: FileValidationError[] = []

    if (!config.allowedFormats.includes(file.type)) {
      errors.push({
        code: 'UNSUPPORTED_FORMAT',
        message: `不支援的檔案格式: ${file.type}`,
        severity: 'error',
        field: 'type',
        suggestion: `支援的格式: ${config.allowedFormats.join(', ')}`
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 檔案預處理
   */
  async preprocessFile(file: File, options?: Partial<FileProcessingOptions>): Promise<{ processedFile: File; optimizations: string[] }> {
    const config = { ...this.defaultOptions, ...options }
    const optimizations: string[] = []
    let processedFile = file

    try {
      // 1. 檔案壓縮
      if (config.enableCompression && file.size > 5 * 1024 * 1024) { // 5MB
        const compressedFile = await this.compressFile(file, config.compressionQuality)
        if (compressedFile.size < file.size) {
          processedFile = compressedFile
          optimizations.push(`檔案壓縮: ${this.formatFileSize(file.size)} → ${this.formatFileSize(compressedFile.size)}`)
        }
      }

      // 2. 圖片優化
      if (file.type.startsWith('image/')) {
        const optimizedFile = await this.optimizeImage(file, config)
        if (optimizedFile.size < processedFile.size) {
          processedFile = optimizedFile
          optimizations.push('圖片優化完成')
        }
      }

      // 3. 格式轉換（如果需要）
      if (this.shouldConvertFormat(file.type)) {
        const convertedFile = await this.convertFileFormat(file)
        processedFile = convertedFile
        optimizations.push(`格式轉換: ${file.type} → ${convertedFile.type}`)
      }

    } catch (error) {
      console.warn('檔案預處理失敗:', error)
      // 預處理失敗時返回原始檔案
    }

    return { processedFile, optimizations }
  }

  /**
   * 檔案壓縮
   */
  private async compressFile(file: File, quality: number): Promise<File> {
    // 這裡實現檔案壓縮邏輯
    // 目前返回原始檔案作為佔位符
    return file
  }

  /**
   * 圖片優化
   */
  private async optimizeImage(file: File, config: FileProcessingOptions): Promise<File> {
    // 這裡實現圖片優化邏輯
    // 目前返回原始檔案作為佔位符
    return file
  }

  /**
   * 格式轉換
   */
  private async convertFileFormat(file: File): Promise<File> {
    // 這裡實現格式轉換邏輯
    // 目前返回原始檔案作為佔位符
    return file
  }

  /**
   * 輔助方法
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private detectFileFormat(file: File): string {
    return file.type || this.inferFormatFromExtension(file.name)
  }

  private inferFormatFromExtension(filename: string): string {
    const extension = this.getFileExtension(filename).toLowerCase()
    const formatMap: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'zip': 'application/zip'
    }
    return formatMap[extension] || 'application/octet-stream'
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || ''
  }

  private estimateCompression(file: File): number {
    // 簡單的壓縮率估算
    if (file.type.startsWith('image/')) {
      return 0.7 // 圖片通常可以壓縮到 70%
    }
    if (file.type === 'application/zip') {
      return 0.9 // ZIP 檔案已經壓縮過
    }
    return 0.8 // 其他檔案類型
  }

  private assessFileQuality(file: File): number {
    // 簡單的檔案質量評估
    if (file.size < 1024 * 1024) return 0.9 // 小檔案
    if (file.size < 10 * 1024 * 1024) return 0.7 // 中等檔案
    return 0.5 // 大檔案
  }

  private async extractImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  private async calculateChecksum(data: ArrayBuffer, algorithm: string): Promise<string> {
    // 這裡實現 checksum 計算
    // 目前返回簡單的 hash 作為佔位符
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  private detectFileCorruption(data: ArrayBuffer, mimeType: string): boolean {
    // 這裡實現檔案損壞檢測
    // 目前返回 false 作為佔位符
    return false
  }

  private isRepairPossible(mimeType: string, isCorrupted: boolean): boolean {
    // 這裡實現修復可能性判斷
    // 目前返回 false 作為佔位符
    return false
  }

  private isMimeTypeExtensionMatch(mimeType: string, extension: string): boolean {
    // 檢查 MIME 類型與副檔名是否匹配
    const extensionMap: Record<string, string[]> = {
      'image/png': ['png'],
      'image/jpeg': ['jpg', 'jpeg'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'image/svg+xml': ['svg'],
      'application/zip': ['zip']
    }
    
    const allowedExtensions = extensionMap[mimeType] || []
    return allowedExtensions.includes(extension.toLowerCase())
  }

  private containsSuspiciousCharacters(filename: string): boolean {
    // 檢查檔案名稱是否包含可疑字符
    const suspiciousPatterns = [
      /[<>:"/\\|?*]/, // Windows 不允許的字符
      /\.\./, // 路徑遍歷攻擊
      /\.\.\//, // 路徑遍歷攻擊
      /\.\.\\/, // 路徑遍歷攻擊
      /\.\.$/, // 路徑遍歷攻擊
      /^\.\./, // 路徑遍歷攻擊
    ]
    
    return suspiciousPatterns.some(pattern => pattern.test(filename))
  }

  private shouldConvertFormat(mimeType: string): boolean {
    // 判斷是否需要格式轉換
    const convertableFormats = ['image/jpeg', 'image/png']
    return convertableFormats.includes(mimeType)
  }
}

// 創建單例實例
export const fileValidationService = new FileValidationService()
