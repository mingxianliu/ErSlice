export interface ErrorInfo {
  id: string
  type: ErrorType
  severity: ErrorSeverity
  message: string
  details?: string
  stack?: string
  timestamp: Date
  context?: ErrorContext
  recoverable: boolean
  retryCount: number
  maxRetries: number
  suggestions: string[]
}

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  sessionId?: string
  browser?: string
  os?: string
  url?: string
  userAgent?: string
}

export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'skip' | 'restart' | 'manual'
  description: string
  action: () => Promise<boolean>
  maxAttempts: number
  delay?: number
}

export type ErrorType = 
  | 'validation' 
  | 'network' 
  | 'file' 
  | 'permission' 
  | 'resource' 
  | 'timeout' 
  | 'unknown'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export class ErrorHandler {
  private errors: Map<string, ErrorInfo> = new Map()
  private recoveryStrategies: Map<ErrorType, RecoveryStrategy[]> = new Map()
  private errorPatterns: Map<string, ErrorPattern> = new Map()
  private autoRecoveryEnabled: boolean = true
  private maxErrorHistory: number = 1000

  constructor() {
    this.initializeErrorPatterns()
    this.initializeRecoveryStrategies()
    this.setupGlobalErrorHandling()
  }

  /**
   * 初始化錯誤模式識別
   */
  private initializeErrorPatterns(): void {
    // 驗證錯誤模式
    this.errorPatterns.set('validation', {
      patterns: [
        /required/i,
        /invalid/i,
        /missing/i,
        /format/i,
        /type/i
      ],
      type: 'validation',
      severity: 'low',
      recoverable: true,
      suggestions: [
        '檢查輸入格式是否正確',
        '確保所有必填欄位都已填寫',
        '驗證數據類型是否匹配'
      ]
    })

    // 網路錯誤模式
    this.errorPatterns.set('network', {
      patterns: [
        /network/i,
        /fetch/i,
        /timeout/i,
        /connection/i,
        /offline/i
      ],
      type: 'network',
      severity: 'medium',
      recoverable: true,
      suggestions: [
        '檢查網路連接狀態',
        '稍後重試操作',
        '檢查伺服器狀態'
      ]
    })

    // 檔案錯誤模式
    this.errorPatterns.set('file', {
      patterns: [
        /file/i,
        /upload/i,
        /download/i,
        /permission/i,
        /not found/i
      ],
      type: 'file',
      severity: 'medium',
      recoverable: true,
      suggestions: [
        '檢查檔案是否存在',
        '確認檔案權限',
        '檢查磁碟空間'
      ]
    })

    // 權限錯誤模式
    this.errorPatterns.set('permission', {
      patterns: [
        /permission/i,
        /access/i,
        /unauthorized/i,
        /forbidden/i,
        /denied/i
      ],
      type: 'permission',
      severity: 'high',
      recoverable: false,
      suggestions: [
        '檢查用戶權限設定',
        '聯繫管理員獲取權限',
        '重新登入系統'
      ]
    })

    // 資源錯誤模式
    this.errorPatterns.set('resource', {
      patterns: [
        /memory/i,
        /disk/i,
        /quota/i,
        /limit/i,
        /out of/i
      ],
      type: 'resource',
      severity: 'high',
      recoverable: true,
      suggestions: [
        '清理不必要的檔案',
        '重啟應用程式',
        '檢查系統資源'
      ]
    })

    // 超時錯誤模式
    this.errorPatterns.set('timeout', {
      patterns: [
        /timeout/i,
        /timed out/i,
        /too long/i,
        /slow/i
      ],
      type: 'timeout',
      severity: 'medium',
      recoverable: true,
      suggestions: [
        '稍後重試操作',
        '檢查網路速度',
        '減少操作複雜度'
      ]
    })
  }

  /**
   * 初始化恢復策略
   */
  private initializeRecoveryStrategies(): void {
    // 驗證錯誤恢復策略
    this.recoveryStrategies.set('validation', [
      {
        type: 'retry',
        description: '重新驗證輸入',
        action: async () => {
          // 實現重新驗證邏輯
          return true
        },
        maxAttempts: 3
      }
    ])

    // 網路錯誤恢復策略
    this.recoveryStrategies.set('network', [
      {
        type: 'retry',
        description: '重試網路請求',
        action: async () => {
          // 實現重試邏輯
          return true
        },
        maxAttempts: 5,
        delay: 1000
      },
      {
        type: 'fallback',
        description: '使用離線模式',
        action: async () => {
          // 實現離線模式邏輯
          return true
        },
        maxAttempts: 1
      }
    ])

    // 檔案錯誤恢復策略
    this.recoveryStrategies.set('file', [
      {
        type: 'retry',
        description: '重新嘗試檔案操作',
        action: async () => {
          // 實現重試邏輯
          return true
        },
        maxAttempts: 3
      },
      {
        type: 'skip',
        description: '跳過當前檔案',
        action: async () => {
          // 實現跳過邏輯
          return true
        },
        maxAttempts: 1
      }
    ])

    // 資源錯誤恢復策略
    this.recoveryStrategies.set('resource', [
      {
        type: 'restart',
        description: '重啟應用程式',
        action: async () => {
          // 實現重啟邏輯
          return true
        },
        maxAttempts: 1
      },
      {
        type: 'fallback',
        description: '使用精簡模式',
        action: async () => {
          // 實現精簡模式邏輯
          return true
        },
        maxAttempts: 1
      }
    ])

    // 超時錯誤恢復策略
    this.recoveryStrategies.set('timeout', [
      {
        type: 'retry',
        description: '重試操作',
        action: async () => {
          // 實現重試邏輯
          return true
        },
        maxAttempts: 3,
        delay: 2000
      },
      {
        type: 'fallback',
        description: '使用快速模式',
        action: async () => {
          // 實現快速模式邏輯
          return true
        },
        maxAttempts: 1
      }
    ])
  }

  /**
   * 設置全域錯誤處理
   */
  private setupGlobalErrorHandling(): void {
    // 捕獲未處理的 Promise 拒絕
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        component: 'global',
        action: 'unhandled-rejection'
      })
    })

    // 捕獲全域錯誤
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        component: 'global',
        action: 'global-error',
        url: event.filename,
        line: event.lineno,
        column: event.colno
      })
    })
  }

  /**
   * 處理錯誤
   */
  handleError(error: Error | string, context?: ErrorContext): ErrorInfo {
    try {
      const errorMessage = typeof error === 'string' ? error : error.message
      const errorStack = error instanceof Error ? error.stack : undefined

      // 分析錯誤類型
      const analysis = this.analyzeError(errorMessage, errorStack)
      
      // 創建錯誤信息
      const errorInfo: ErrorInfo = {
        id: this.generateErrorId(),
        type: analysis.type,
        severity: analysis.severity,
        message: this.formatErrorMessage(errorMessage, analysis),
        details: errorStack,
        stack: errorStack,
        timestamp: new Date(),
        context: context || {},
        recoverable: analysis.recoverable,
        retryCount: 0,
        maxRetries: analysis.maxRetries || 3,
        suggestions: analysis.suggestions
      }

      // 記錄錯誤
      this.recordError(errorInfo)

      // 嘗試自動恢復
      if (this.autoRecoveryEnabled && analysis.recoverable) {
        this.attemptAutoRecovery(errorInfo)
      }

      // 觸發錯誤事件
      this.triggerErrorEvent(errorInfo)

      return errorInfo
    } catch (handlingError) {
      console.error('錯誤處理失敗:', handlingError)
      // 返回基本錯誤信息
      return {
        id: this.generateErrorId(),
        type: 'unknown',
        severity: 'critical',
        message: '錯誤處理系統故障',
        timestamp: new Date(),
        recoverable: false,
        retryCount: 0,
        maxRetries: 0,
        suggestions: ['聯繫技術支援']
      }
    }
  }

  /**
   * 分析錯誤
   */
  private analyzeError(message: string, stack?: string): {
    type: ErrorType
    severity: ErrorSeverity
    recoverable: boolean
    maxRetries?: number
    suggestions: string[]
  } {
    const messageLower = message.toLowerCase()
    const stackLower = stack?.toLowerCase() || ''

    // 檢查錯誤模式
    for (const [key, pattern] of this.errorPatterns.entries()) {
      if (pattern.patterns.some(p => p.test(messageLower) || p.test(stackLower))) {
        return {
          type: pattern.type,
          severity: pattern.severity,
          recoverable: pattern.recoverable,
          maxRetries: pattern.recoverable ? 3 : 0,
          suggestions: pattern.suggestions
        }
      }
    }

    // 默認錯誤分析
    return {
      type: 'unknown',
      severity: 'medium',
      recoverable: true,
      maxRetries: 3,
      suggestions: [
        '檢查操作步驟',
        '重新嘗試操作',
        '聯繫技術支援'
      ]
    }
  }

  /**
   * 格式化錯誤訊息
   */
  private formatErrorMessage(message: string, analysis: any): string {
    // 根據錯誤類型優化訊息
    switch (analysis.type) {
      case 'validation':
        return `驗證錯誤: ${message}`
      case 'network':
        return `網路錯誤: ${message}`
      case 'file':
        return `檔案錯誤: ${message}`
      case 'permission':
        return `權限錯誤: ${message}`
      case 'resource':
        return `資源錯誤: ${message}`
      case 'timeout':
        return `操作超時: ${message}`
      default:
        return message
    }
  }

  /**
   * 記錄錯誤
   */
  private recordError(errorInfo: ErrorInfo): void {
    this.errors.set(errorInfo.id, errorInfo)

    // 限制錯誤歷史數量
    if (this.errors.size > this.maxErrorHistory) {
      const oldestKey = this.errors.keys().next().value
      this.errors.delete(oldestKey)
    }

    // 記錄到控制台
    console.error(`[${errorInfo.type.toUpperCase()}] ${errorInfo.message}`, errorInfo)
  }

  /**
   * 嘗試自動恢復
   */
  private async attemptAutoRecovery(errorInfo: ErrorInfo): Promise<void> {
    const strategies = this.recoveryStrategies.get(errorInfo.type) || []
    
    for (const strategy of strategies) {
      if (errorInfo.retryCount < strategy.maxAttempts) {
        try {
          console.log(`🔄 嘗試自動恢復: ${strategy.description}`)
          
          if (strategy.delay) {
            await this.delay(strategy.delay)
          }
          
          const success = await strategy.action()
          if (success) {
            console.log(`✅ 自動恢復成功: ${strategy.description}`)
            return
          }
        } catch (recoveryError) {
          console.warn(`⚠️ 自動恢復失敗: ${strategy.description}`, recoveryError)
        }
      }
    }

    console.log('❌ 所有自動恢復策略都失敗了')
  }

  /**
   * 延遲函數
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 觸發錯誤事件
   */
  private triggerErrorEvent(errorInfo: ErrorInfo): void {
    const event = new CustomEvent('erslice-error', {
      detail: errorInfo
    })
    window.dispatchEvent(event)
  }

  /**
   * 手動重試錯誤
   */
  async retryError(errorId: string): Promise<boolean> {
    const errorInfo = this.errors.get(errorId)
    if (!errorInfo) {
      console.warn('錯誤不存在:', errorId)
      return false
    }

    if (errorInfo.retryCount >= errorInfo.maxRetries) {
      console.warn('重試次數已達上限:', errorId)
      return false
    }

    try {
      errorInfo.retryCount++
      console.log(`🔄 手動重試錯誤 (${errorInfo.retryCount}/${errorInfo.maxRetries}):`, errorInfo.message)

      // 嘗試自動恢復
      await this.attemptAutoRecovery(errorInfo)

      return true
    } catch (error) {
      console.error('手動重試失敗:', error)
      return false
    }
  }

  /**
   * 獲取錯誤信息
   */
  getError(errorId: string): ErrorInfo | undefined {
    return this.errors.get(errorId)
  }

  /**
   * 獲取所有錯誤
   */
  getAllErrors(): ErrorInfo[] {
    return Array.from(this.errors.values())
  }

  /**
   * 獲取錯誤統計
   */
  getErrorStats(): {
    total: number
    byType: Record<ErrorType, number>
    bySeverity: Record<ErrorSeverity, number>
    recoverable: number
    unrecoverable: number
  } {
    const errors = Array.from(this.errors.values())
    
    const stats = {
      total: errors.length,
      byType: {} as Record<ErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      recoverable: errors.filter(e => e.recoverable).length,
      unrecoverable: errors.filter(e => !e.recoverable).length
    }

    // 按類型統計
    errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
    })

    // 按嚴重程度統計
    errors.forEach(error => {
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
    })

    return stats
  }

  /**
   * 清理錯誤歷史
   */
  clearErrorHistory(): void {
    this.errors.clear()
    console.log('🧹 錯誤歷史已清理')
  }

  /**
   * 設置自動恢復
   */
  setAutoRecovery(enabled: boolean): void {
    this.autoRecoveryEnabled = enabled
    console.log(`🔄 自動恢復已${enabled ? '啟用' : '停用'}`)
  }

  /**
   * 生成錯誤 ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 獲取恢復策略
   */
  getRecoveryStrategies(errorType: ErrorType): RecoveryStrategy[] {
    return this.recoveryStrategies.get(errorType) || []
  }

  /**
   * 添加自定義恢復策略
   */
  addRecoveryStrategy(errorType: ErrorType, strategy: RecoveryStrategy): void {
    if (!this.recoveryStrategies.has(errorType)) {
      this.recoveryStrategies.set(errorType, [])
    }
    
    this.recoveryStrategies.get(errorType)!.push(strategy)
    console.log(`➕ 已添加恢復策略: ${errorType} - ${strategy.description}`)
  }

  /**
   * 移除恢復策略
   */
  removeRecoveryStrategy(errorType: ErrorType, description: string): boolean {
    const strategies = this.recoveryStrategies.get(errorType)
    if (!strategies) return false

    const index = strategies.findIndex(s => s.description === description)
    if (index === -1) return false

    strategies.splice(index, 1)
    console.log(`➖ 已移除恢復策略: ${errorType} - ${description}`)
    return true
  }
}

interface ErrorPattern {
  patterns: RegExp[]
  type: ErrorType
  severity: ErrorSeverity
  recoverable: boolean
  suggestions: string[]
}

// 創建單例實例
export const errorHandler = new ErrorHandler()
