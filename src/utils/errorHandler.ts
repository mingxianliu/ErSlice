// ErSlice 錯誤處理工具

// 錯誤類型定義
export interface ErSliceError {
  code: string
  message: string
  details?: string
  timestamp: Date
}

// 錯誤代碼枚舉
export enum ErrorCode {
  // 設計資產相關錯誤
  DESIGN_MODULE_NOT_FOUND = 'DESIGN_MODULE_NOT_FOUND',
  ASSET_UPLOAD_FAILED = 'ASSET_UPLOAD_FAILED',
  INVALID_ASSET_TYPE = 'INVALID_ASSET_TYPE',
  
  // 模板生成相關錯誤
  TEMPLATE_GENERATION_FAILED = 'TEMPLATE_GENERATION_FAILED',
  INVALID_TEMPLATE_TYPE = 'INVALID_TEMPLATE_TYPE',
  
  // 檔案操作相關錯誤
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  FILE_COPY_ERROR = 'FILE_COPY_ERROR',
  
  // 系統錯誤
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

// 錯誤處理器類
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: ErSliceError[] = []

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  // 創建錯誤
  createError(
    code: ErrorCode,
    message: string,
    details?: string
  ): ErSliceError {
    const error: ErSliceError = {
      code,
      message,
      details,
      timestamp: new Date()
    }
    
    this.logError(error)
    return error
  }

  // 記錄錯誤
  private logError(error: ErSliceError): void {
    this.errorLog.push(error)
    console.error('ErSlice Error:', error)
    
    // 在開發模式下顯示詳細錯誤
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Details')
      console.log('Code:', error.code)
      console.log('Message:', error.message)
      console.log('Details:', error.details)
      console.log('Timestamp:', error.timestamp)
      console.groupEnd()
    }
  }

  // 獲取錯誤日誌
  getErrorLog(): ErSliceError[] {
    return [...this.errorLog]
  }

  // 清除錯誤日誌
  clearErrorLog(): void {
    this.errorLog = []
  }

  // 處理 Tauri 錯誤
  handleTauriError(error: any): ErSliceError {
    let errorCode = ErrorCode.SYSTEM_ERROR
    let errorMessage = '未知錯誤'
    let errorDetails = ''

    if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object') {
      errorMessage = error.message || error.toString()
      errorDetails = error.details || JSON.stringify(error)
    }

    // 根據錯誤訊息判斷錯誤類型
    if (errorMessage.includes('設計模組不存在')) {
      errorCode = ErrorCode.DESIGN_MODULE_NOT_FOUND
    } else if (errorMessage.includes('上傳失敗')) {
      errorCode = ErrorCode.ASSET_UPLOAD_FAILED
    } else if (errorMessage.includes('複製檔案失敗')) {
      errorCode = ErrorCode.FILE_COPY_ERROR
    }

    return this.createError(errorCode, errorMessage, errorDetails)
  }

  // 顯示用戶友好的錯誤訊息
  getUserFriendlyMessage(error: ErSliceError): string {
    const messageMap: Record<ErrorCode, string> = {
      [ErrorCode.DESIGN_MODULE_NOT_FOUND]: '找不到指定的設計模組，請檢查模組名稱是否正確',
      [ErrorCode.ASSET_UPLOAD_FAILED]: '資產上傳失敗，請檢查檔案格式和大小',
      [ErrorCode.INVALID_ASSET_TYPE]: '不支援的資產類型，請選擇正確的檔案類型',
      [ErrorCode.TEMPLATE_GENERATION_FAILED]: '模板生成失敗，請檢查設計資產是否完整',
      [ErrorCode.INVALID_TEMPLATE_TYPE]: '無效的模板類型，請選擇支援的模板',
      [ErrorCode.FILE_READ_ERROR]: '檔案讀取失敗，請檢查檔案是否存在且可讀取',
      [ErrorCode.FILE_WRITE_ERROR]: '檔案寫入失敗，請檢查磁碟空間和權限',
      [ErrorCode.FILE_COPY_ERROR]: '檔案複製失敗，請檢查目標路徑是否可寫入',
      [ErrorCode.SYSTEM_ERROR]: '系統錯誤，請稍後再試或聯繫技術支援',
      [ErrorCode.NETWORK_ERROR]: '網路錯誤，請檢查網路連線',
      [ErrorCode.PERMISSION_ERROR]: '權限不足，請檢查檔案和目錄權限'
    }

    return messageMap[error.code as ErrorCode] || error.message
  }

  // 檢查是否為可恢復的錯誤
  isRecoverableError(error: ErSliceError): boolean {
    const recoverableCodes = [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.FILE_READ_ERROR,
      ErrorCode.PERMISSION_ERROR
    ]
    
    return recoverableCodes.includes(error.code as ErrorCode)
  }
}

// 導出單例實例
export const errorHandler = ErrorHandler.getInstance()

// 工具函數
export const createError = (code: ErrorCode, message: string, details?: string) => 
  errorHandler.createError(code, message, details)

export const handleTauriError = (error: any) => 
  errorHandler.handleTauriError(error)

export const getUserFriendlyMessage = (error: ErSliceError) => 
  errorHandler.getUserFriendlyMessage(error)
