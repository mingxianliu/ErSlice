import { ErrorInfo, ErrorType, ErrorSeverity } from './errorHandler'

export interface IntelligentErrorInfo extends ErrorInfo {
  category: ErrorCategory
  subCategory: string
  autoRecoveryAttempted: boolean
  recoverySuccess: boolean
  recoveryStrategy: RecoveryStrategy
  userActionRequired: boolean
  estimatedFixTime: string
  relatedErrors: string[]
  context: Record<string, any>
}

export interface ErrorCategory {
  id: string
  name: string
  description: string
  severity: ErrorSeverity
  autoRecovery: boolean
  recoveryStrategies: string[] // 改為字符串數組
  preventionTips: string[]
}

export interface RecoveryStrategy {
  id: string
  name: string
  description: string
  automatic: boolean
  successRate: number
  estimatedTime: number
  prerequisites: string[]
  steps: RecoveryStep[]
}

export interface RecoveryStep {
  order: number
  action: string
  description: string
  expectedOutcome: string
  rollbackAction?: string
}

export interface AutoRecoveryResult {
  success: boolean
  strategy: RecoveryStrategy
  stepsExecuted: RecoveryStep[]
  timeTaken: number
  error?: string
  nextActions?: string[]
}

export interface ErrorPreventionTip {
  category: string
  tip: string
  priority: 'low' | 'medium' | 'high'
  implementation: string
}

export class IntelligentErrorHandler {
  private errorCategories: Map<string, ErrorCategory> = new Map()
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map()
  private errorPatterns: Map<string, RegExp> = new Map()
  private autoRecoveryEnabled: boolean = true
  private maxRecoveryAttempts: number = 3

  constructor() {
    this.initializeErrorCategories()
    this.initializeRecoveryStrategies()
    this.initializeErrorPatterns()
  }

  /**
   * 初始化錯誤分類
   */
  private initializeErrorCategories(): void {
    // 檔案相關錯誤
    this.errorCategories.set('file_operation', {
      id: 'file_operation',
      name: '檔案操作錯誤',
      description: '檔案上傳、下載、處理等操作相關錯誤',
      severity: 'medium',
      autoRecovery: true,
      recoveryStrategies: ['retry_operation', 'file_repair', 'alternative_method'],
      preventionTips: [
        '檢查檔案格式和大小',
        '確認檔案權限',
        '使用標準檔案命名規範'
      ]
    })

    // 網路相關錯誤
    this.errorCategories.set('network', {
      id: 'network',
      name: '網路錯誤',
      description: '網路連接、超時、服務不可用等錯誤',
      severity: 'medium',
      autoRecovery: true,
      recoveryStrategies: ['retry_connection', 'switch_endpoint', 'offline_mode'],
      preventionTips: [
        '檢查網路連接狀態',
        '確認服務端可用性',
        '設置適當的超時時間'
      ]
    })

    // 驗證相關錯誤
    this.errorCategories.set('validation', {
      id: 'validation',
      name: '數據驗證錯誤',
      description: '輸入數據格式、類型、範圍等驗證錯誤',
      severity: 'low',
      autoRecovery: false,
      recoveryStrategies: ['fix_input', 'show_guidance'],
      preventionTips: [
        '實現前端驗證',
        '提供清晰的錯誤提示',
        '設置合理的驗證規則'
      ]
    })

    // 權限相關錯誤
    this.errorCategories.set('permission', {
      id: 'permission',
      name: '權限錯誤',
      description: '用戶權限不足、訪問被拒絕等錯誤',
      severity: 'high',
      autoRecovery: false,
      recoveryStrategies: ['request_permission', 'escalate_access'],
      preventionTips: [
        '實現角色基礎權限控制',
        '定期檢查權限設置',
        '提供權限申請流程'
      ]
    })

    // 資源相關錯誤
    this.errorCategories.set('resource', {
      id: 'resource',
      name: '資源錯誤',
      description: '記憶體不足、磁碟空間不足、配額超限等錯誤',
      severity: 'high',
      autoRecovery: true,
      recoveryStrategies: ['cleanup_resources', 'increase_limits', 'optimize_usage'],
      preventionTips: [
        '監控資源使用情況',
        '實現資源清理機制',
        '設置資源使用警告'
      ]
    })

    // 系統相關錯誤
    this.errorCategories.set('system', {
      id: 'system',
      name: '系統錯誤',
      description: '系統崩潰、服務異常、配置錯誤等錯誤',
      severity: 'critical',
      autoRecovery: true,
      recoveryStrategies: ['restart_service', 'reset_config', 'system_recovery'],
      preventionTips: [
        '實現健康檢查機制',
        '設置自動重啟策略',
        '建立系統監控'
      ]
    })
  }

  /**
   * 初始化恢復策略
   */
  private initializeRecoveryStrategies(): void {
    // 重試操作策略
    this.recoveryStrategies.set('retry_operation', {
      id: 'retry_operation',
      name: '重試操作',
      description: '自動重試失敗的操作',
      automatic: true,
      successRate: 0.7,
      estimatedTime: 5000,
      prerequisites: ['操作可重試', '沒有副作用'],
      steps: [
        {
          order: 1,
          action: '等待短暫時間',
          description: '等待 1-3 秒後重試',
          expectedOutcome: '系統狀態恢復'
        },
        {
          order: 2,
          action: '重試操作',
          description: '重新執行失敗的操作',
          expectedOutcome: '操作成功完成'
        }
      ]
    })

    // 檔案修復策略
    this.recoveryStrategies.set('file_repair', {
      id: 'file_repair',
      name: '檔案修復',
      description: '嘗試修復損壞的檔案',
      automatic: true,
      successRate: 0.5,
      estimatedTime: 10000,
      prerequisites: ['檔案部分損壞', '有備份可用'],
      steps: [
        {
          order: 1,
          action: '檢查檔案完整性',
          description: '分析檔案損壞程度',
          expectedOutcome: '確定修復方案'
        },
        {
          order: 2,
          action: '嘗試檔案修復',
          description: '使用修復工具修復檔案',
          expectedOutcome: '檔案修復成功'
        }
      ]
    })

    // 資源清理策略
    this.recoveryStrategies.set('cleanup_resources', {
      id: 'cleanup_resources',
      name: '資源清理',
      description: '清理不必要的資源以釋放空間',
      automatic: true,
      successRate: 0.8,
      estimatedTime: 3000,
      prerequisites: ['有可清理的資源', '系統允許清理'],
      steps: [
        {
          order: 1,
          action: '識別可清理資源',
          description: '掃描系統找出可清理的資源',
          expectedOutcome: '列出可清理資源清單'
        },
        {
          order: 2,
          action: '執行資源清理',
          description: '安全地清理識別出的資源',
          expectedOutcome: '釋放系統資源'
        }
      ]
    })

    // 服務重啟策略
    this.recoveryStrategies.set('restart_service', {
      id: 'restart_service',
      name: '服務重啟',
      description: '重啟異常的服務',
      automatic: true,
      successRate: 0.9,
      estimatedTime: 15000,
      prerequisites: ['服務可重啟', '沒有進行中的操作'],
      steps: [
        {
          order: 1,
          action: '停止服務',
          description: '優雅地停止異常服務',
          expectedOutcome: '服務完全停止'
        },
        {
          order: 2,
          action: '等待冷卻時間',
          description: '等待 5-10 秒讓系統穩定',
          expectedOutcome: '系統狀態穩定'
        },
        {
          order: 3,
          action: '重啟服務',
          description: '重新啟動服務',
          expectedOutcome: '服務正常運行'
        }
      ]
    })
  }

  /**
   * 初始化錯誤模式
   */
  private initializeErrorPatterns(): void {
    this.errorPatterns.set('file_not_found', /file.*not.*found|file.*does.*not.*exist/i)
    this.errorPatterns.set('permission_denied', /permission.*denied|access.*denied|unauthorized/i)
    this.errorPatterns.set('network_timeout', /timeout|connection.*timed.*out|request.*timed.*out/i)
    this.errorPatterns.set('out_of_memory', /out.*of.*memory|insufficient.*memory/i)
    this.errorPatterns.set('disk_full', /disk.*full|no.*space.*left|quota.*exceeded/i)
    this.errorPatterns.set('invalid_format', /invalid.*format|unsupported.*format|format.*error/i)
    this.errorPatterns.set('validation_failed', /validation.*failed|invalid.*input|required.*field/i)
  }

  /**
   * 智能錯誤處理
   */
  async handleErrorIntelligently(error: Error, context?: Record<string, any>): Promise<IntelligentErrorInfo> {
    // 1. 分析錯誤
    const errorAnalysis = this.analyzeError(error, context)
    
    // 2. 分類錯誤
    const category = this.categorizeError(errorAnalysis)
    
    // 3. 選擇恢復策略
    const recoveryStrategy = this.selectRecoveryStrategy(category, errorAnalysis)
    
    // 4. 嘗試自動恢復
    let autoRecoveryResult: AutoRecoveryResult | null = null
    if (this.autoRecoveryEnabled && recoveryStrategy.automatic) {
      autoRecoveryResult = await this.attemptAutoRecovery(recoveryStrategy, errorAnalysis)
    }

    // 5. 構建智能錯誤信息
    const intelligentError: IntelligentErrorInfo = {
      ...errorAnalysis,
      category,
      subCategory: this.determineSubCategory(errorAnalysis),
      autoRecoveryAttempted: !!autoRecoveryResult,
      recoverySuccess: autoRecoveryResult?.success || false,
      recoveryStrategy,
      userActionRequired: this.determineUserActionRequired(category, autoRecoveryResult),
      estimatedFixTime: this.estimateFixTime(recoveryStrategy, autoRecoveryResult),
      relatedErrors: this.findRelatedErrors(errorAnalysis),
      context: context || {}
    }

    // 6. 記錄錯誤和恢復結果
    this.logIntelligentError(intelligentError, autoRecoveryResult)

    return intelligentError
  }

  /**
   * 分析錯誤
   */
  private analyzeError(error: Error, context?: Record<string, any>): ErrorInfo {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      type: this.determineErrorType(error),
      severity: this.determineErrorSeverity(error),
      message: error.message,
      details: error.stack || '',
      timestamp: new Date(),
      context: context || {},
      recoverable: this.isErrorRecoverable(error),
      retryCount: 0,
      maxRetries: this.getMaxRetries(error),
      suggestions: this.generateSuggestions(error)
    }

    return errorInfo
  }

  /**
   * 分類錯誤
   */
  private categorizeError(errorInfo: ErrorInfo): ErrorCategory {
    // 使用錯誤模式匹配進行分類
    for (const [patternName, pattern] of this.errorPatterns.entries()) {
      if (pattern.test(errorInfo.message) || pattern.test(errorInfo.details)) {
        // 根據模式名稱映射到分類
        const categoryMap: Record<string, string> = {
          'file_not_found': 'file_operation',
          'permission_denied': 'permission',
          'network_timeout': 'network',
          'out_of_memory': 'resource',
          'disk_full': 'resource',
          'invalid_format': 'validation',
          'validation_failed': 'validation'
        }
        
        const categoryId = categoryMap[patternName] || 'system'
        return this.errorCategories.get(categoryId) || this.errorCategories.get('system')!
      }
    }

    // 默認返回系統錯誤分類
    return this.errorCategories.get('system')!
  }

  /**
   * 選擇恢復策略
   */
  private selectRecoveryStrategy(category: ErrorCategory, errorInfo: ErrorInfo): RecoveryStrategy {
    // 根據錯誤分類選擇最適合的恢復策略
    const availableStrategies = category.recoveryStrategies
      .map(id => this.recoveryStrategies.get(id))
      .filter(Boolean) as RecoveryStrategy[]

    if (availableStrategies.length === 0) {
      // 返回默認的重試策略
      return this.recoveryStrategies.get('retry_operation')!
    }

    // 選擇成功率最高的策略
    return availableStrategies.reduce((best, current) => 
      current.successRate > best.successRate ? current : best
    )
  }

  /**
   * 嘗試自動恢復
   */
  private async attemptAutoRecovery(strategy: RecoveryStrategy, errorInfo: ErrorInfo): Promise<AutoRecoveryResult> {
    const startTime = Date.now()
    const stepsExecuted: RecoveryStep[] = []

    try {
      console.log(`🔄 嘗試自動恢復: ${strategy.name}`)

      // 檢查前置條件
      if (!this.checkPrerequisites(strategy, errorInfo)) {
        throw new Error('恢復策略前置條件不滿足')
      }

      // 執行恢復步驟
      for (const step of strategy.steps) {
        try {
          await this.executeRecoveryStep(step, errorInfo)
          stepsExecuted.push(step)
          console.log(`✅ 恢復步驟完成: ${step.action}`)
        } catch (stepError) {
          console.error(`❌ 恢復步驟失敗: ${step.action}`, stepError)
          // 嘗試回滾
          if (step.rollbackAction) {
            await this.executeRollbackAction(step.rollbackAction, errorInfo)
          }
          throw stepError
        }
      }

      const timeTaken = Date.now() - startTime
      console.log(`✅ 自動恢復成功: ${strategy.name}, 耗時: ${timeTaken}ms`)

      return {
        success: true,
        strategy,
        stepsExecuted,
        timeTaken,
        nextActions: this.generateNextActions(strategy, errorInfo)
      }

    } catch (error) {
      const timeTaken = Date.now() - startTime
      console.error(`❌ 自動恢復失敗: ${strategy.name}`, error)

      return {
        success: false,
        strategy,
        stepsExecuted,
        timeTaken,
        error: error instanceof Error ? error.message : '未知錯誤',
        nextActions: this.generateManualRecoveryActions(strategy, errorInfo)
      }
    }
  }

  /**
   * 檢查前置條件
   */
  private checkPrerequisites(strategy: RecoveryStrategy, errorInfo: ErrorInfo): boolean {
    // 這裡實現具體的前置條件檢查邏輯
    // 目前返回 true 作為佔位符
    return true
  }

  /**
   * 執行恢復步驟
   */
  private async executeRecoveryStep(step: RecoveryStep, errorInfo: ErrorInfo): Promise<void> {
    // 這裡實現具體的恢復步驟執行邏輯
    // 目前模擬執行時間作為佔位符
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  /**
   * 執行回滾操作
   */
  private async executeRollbackAction(rollbackAction: string, errorInfo: ErrorInfo): Promise<void> {
    console.log(`🔄 執行回滾操作: ${rollbackAction}`)
    // 這裡實現具體的回滾邏輯
  }

  /**
   * 生成後續操作建議
   */
  private generateNextActions(strategy: RecoveryStrategy, errorInfo: ErrorInfo): string[] {
    return [
      '監控系統狀態',
      '檢查錯誤是否完全解決',
      '記錄恢復過程'
    ]
  }

  /**
   * 生成手動恢復操作建議
   */
  private generateManualRecoveryActions(strategy: RecoveryStrategy, errorInfo: ErrorInfo): string[] {
    return [
      '檢查系統日誌',
      '聯繫技術支援',
      '嘗試手動執行恢復步驟'
    ]
  }

  /**
   * 輔助方法
   */
  private determineErrorType(error: Error): ErrorType {
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return 'network'
    }
    if (error.message.includes('file') || error.message.includes('upload')) {
      return 'file'
    }
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return 'validation'
    }
    if (error.message.includes('permission') || error.message.includes('access')) {
      return 'permission'
    }
    if (error.message.includes('memory') || error.message.includes('resource')) {
      return 'resource'
    }
    return 'unknown'
  }

  private determineErrorSeverity(error: Error): ErrorSeverity {
    if (error.message.includes('critical') || error.message.includes('fatal')) {
      return 'critical'
    }
    if (error.message.includes('error') || error.message.includes('failed')) {
      return 'high'
    }
    if (error.message.includes('warning') || error.message.includes('caution')) {
      return 'medium'
    }
    return 'low'
  }

  private isErrorRecoverable(error: Error): boolean {
    const nonRecoverablePatterns = [
      /permission.*denied/i,
      /access.*denied/i,
      /unauthorized/i,
      /invalid.*credentials/i
    ]
    
    return !nonRecoverablePatterns.some(pattern => pattern.test(error.message))
  }

  private getMaxRetries(error: Error): number {
    if (this.determineErrorType(error) === 'network') {
      return 3
    }
    if (this.determineErrorType(error) === 'file') {
      return 2
    }
    return 1
  }

  private generateSuggestions(error: Error): string[] {
    const suggestions: string[] = []
    
    if (error.message.includes('network')) {
      suggestions.push('檢查網路連接', '稍後重試', '檢查服務端狀態')
    }
    if (error.message.includes('file')) {
      suggestions.push('檢查檔案格式', '確認檔案大小', '重新上傳檔案')
    }
    if (error.message.includes('validation')) {
      suggestions.push('檢查輸入數據', '確認必填欄位', '驗證數據格式')
    }
    
    return suggestions.length > 0 ? suggestions : ['檢查錯誤日誌', '聯繫技術支援']
  }

  private determineSubCategory(errorInfo: ErrorInfo): string {
    // 根據錯誤信息確定子分類
    if (errorInfo.message.includes('upload')) return 'file_upload'
    if (errorInfo.message.includes('download')) return 'file_download'
    if (errorInfo.message.includes('timeout')) return 'connection_timeout'
    if (errorInfo.message.includes('memory')) return 'memory_insufficient'
    return 'general'
  }

  private determineUserActionRequired(category: ErrorCategory, recoveryResult: AutoRecoveryResult | null): boolean {
    if (!recoveryResult) return true
    if (!recoveryResult.success) return true
    if (category.severity === 'critical') return true
    return false
  }

  private estimateFixTime(strategy: RecoveryStrategy, recoveryResult: AutoRecoveryResult | null): string {
    if (recoveryResult?.success) {
      return '已自動修復'
    }
    
    const timeInSeconds = strategy.estimatedTime / 1000
    if (timeInSeconds < 60) {
      return `${timeInSeconds} 秒`
    } else if (timeInSeconds < 3600) {
      return `${Math.ceil(timeInSeconds / 60)} 分鐘`
    } else {
      return `${Math.ceil(timeInSeconds / 3600)} 小時`
    }
  }

  private findRelatedErrors(errorInfo: ErrorInfo): string[] {
    // 這裡實現相關錯誤查找邏輯
    // 目前返回空數組作為佔位符
    return []
  }

  private logIntelligentError(errorInfo: IntelligentErrorInfo, recoveryResult: AutoRecoveryResult | null): void {
    console.group('🧠 智能錯誤處理結果')
    console.log('錯誤分類:', errorInfo.category.name)
    console.log('恢復策略:', errorInfo.recoveryStrategy.name)
    console.log('自動恢復:', errorInfo.recoverySuccess ? '成功' : '失敗')
    console.log('用戶操作:', errorInfo.userActionRequired ? '需要' : '不需要')
    console.log('預估修復時間:', errorInfo.estimatedFixTime)
    
    if (recoveryResult) {
      console.log('恢復步驟:', recoveryResult.stepsExecuted.map(s => s.action))
      console.log('耗時:', recoveryResult.timeTaken + 'ms')
    }
    
    console.groupEnd()
  }

  private generateErrorId(): string {
    return `intelligent_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 配置自動恢復
   */
  setAutoRecoveryEnabled(enabled: boolean): void {
    this.autoRecoveryEnabled = enabled
  }

  /**
   * 設置最大恢復嘗試次數
   */
  setMaxRecoveryAttempts(attempts: number): void {
    this.maxRecoveryAttempts = attempts
  }

  /**
   * 獲取錯誤分類
   */
  getErrorCategories(): ErrorCategory[] {
    return Array.from(this.errorCategories.values())
  }

  /**
   * 獲取恢復策略
   */
  getRecoveryStrategies(): RecoveryStrategy[] {
    return Array.from(this.recoveryStrategies.values())
  }

  /**
   * 添加自定義錯誤分類
   */
  addErrorCategory(category: ErrorCategory): void {
    this.errorCategories.set(category.id, category)
  }

  /**
   * 添加自定義恢復策略
   */
  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.recoveryStrategies.set(strategy.id, strategy)
  }
}

// 創建單例實例
export const intelligentErrorHandler = new IntelligentErrorHandler()
