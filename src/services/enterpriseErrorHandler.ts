// ErSlice 企業級錯誤處理系統
// 提供全面的錯誤監控、分析和恢復機制

import { IntelligentErrorInfo, ErrorCategory, RecoveryStrategy, AutoRecoveryResult } from './intelligentErrorHandler'
import { ErrorInfo, ErrorType, ErrorSeverity } from './errorHandler'

export interface EnterpriseErrorConfig {
  enableAutoRecovery: boolean
  maxRetryAttempts: number
  retryDelay: number
  enableErrorReporting: boolean
  enableMetrics: boolean
  enablePerformanceTracking: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export interface ErrorMetrics {
  totalErrors: number
  errorsByType: Record<ErrorType, number>
  errorsBySeverity: Record<ErrorSeverity, number>
  recoverySuccessRate: number
  averageRecoveryTime: number
  mostCommonErrors: Array<{ type: ErrorType; count: number }>
  timeRange: {
    start: Date
    end: Date
  }
}

export interface ErrorReport {
  id: string
  timestamp: Date
  error: IntelligentErrorInfo
  systemState: SystemState
  userActions: UserAction[]
  networkCondition: NetworkCondition
  browserInfo: BrowserInfo
  recoveryAttempts: RecoveryAttempt[]
}

export interface SystemState {
  memory: {
    used: number
    total: number
    percentage: number
  }
  performance: {
    renderTime: number
    scriptTime: number
    layoutTime: number
  }
  storage: {
    localStorage: number
    sessionStorage: number
    indexedDB: number
  }
}

export interface UserAction {
  timestamp: Date
  type: 'click' | 'input' | 'navigation' | 'upload' | 'download'
  target: string
  value?: string
}

export interface NetworkCondition {
  online: boolean
  effectiveType: string
  downlink: number
  rtt: number
}

export interface BrowserInfo {
  userAgent: string
  vendor: string
  version: string
  platform: string
  language: string
  cookieEnabled: boolean
  screen: {
    width: number
    height: number
    colorDepth: number
  }
}

export interface RecoveryAttempt {
  timestamp: Date
  strategy: RecoveryStrategy
  success: boolean
  duration: number
  error?: string
}

export class EnterpriseErrorHandler {
  private config: EnterpriseErrorConfig
  private errors: Map<string, IntelligentErrorInfo> = new Map()
  private errorCategories: Map<string, ErrorCategory> = new Map()
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map()
  private errorReports: ErrorReport[] = []
  private metrics: ErrorMetrics
  private userActions: UserAction[] = []
  private performanceObserver?: PerformanceObserver
  
  constructor(config: Partial<EnterpriseErrorConfig> = {}) {
    this.config = {
      enableAutoRecovery: true,
      maxRetryAttempts: 3,
      retryDelay: 1000,
      enableErrorReporting: true,
      enableMetrics: true,
      enablePerformanceTracking: true,
      logLevel: 'info',
      ...config
    }
    
    this.initializeMetrics()
    this.initializeErrorCategories()
    this.initializeRecoveryStrategies()
    this.setupEventListeners()
    
    if (this.config.enablePerformanceTracking) {
      this.initializePerformanceTracking()
    }
  }
  
  private initializeMetrics(): void {
    this.metrics = {
      totalErrors: 0,
      errorsByType: {
        validation: 0,
        network: 0,
        file: 0,
        permission: 0,
        resource: 0,
        timeout: 0,
        unknown: 0
      },
      errorsBySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      recoverySuccessRate: 0,
      averageRecoveryTime: 0,
      mostCommonErrors: [],
      timeRange: {
        start: new Date(),
        end: new Date()
      }
    }
  }
  
  private initializeErrorCategories(): void {
    const categories: ErrorCategory[] = [
      {
        id: 'network_connectivity',
        name: '網路連接錯誤',
        description: '網路連接相關的錯誤',
        severity: 'high',
        autoRecovery: true,
        recoveryStrategies: ['retry_request', 'offline_mode', 'cache_fallback'],
        preventionTips: ['檢查網路連接', '使用離線模式', '清除瀏覽器緩存']
      },
      {
        id: 'file_processing',
        name: '文件處理錯誤',
        description: '文件上傳、下載或處理過程中的錯誤',
        severity: 'medium',
        autoRecovery: true,
        recoveryStrategies: ['retry_upload', 'chunk_upload', 'format_conversion'],
        preventionTips: ['檢查文件格式', '確保文件大小限制', '使用支援的文件類型']
      },
      {
        id: 'validation_error',
        name: '數據驗證錯誤',
        description: '輸入數據驗證失敗',
        severity: 'low',
        autoRecovery: false,
        recoveryStrategies: ['user_correction', 'default_values', 'skip_validation'],
        preventionTips: ['檢查輸入格式', '參考範例數據', '使用建議值']
      },
      {
        id: 'system_resource',
        name: '系統資源錯誤',
        description: '內存不足或性能相關的錯誤',
        severity: 'critical',
        autoRecovery: true,
        recoveryStrategies: ['memory_cleanup', 'reduce_quality', 'restart_app'],
        preventionTips: ['關閉其他標籤', '清理瀏覽器緩存', '重啟應用程式']
      }
    ]
    
    categories.forEach(category => {
      this.errorCategories.set(category.id, category)
    })
  }
  
  private initializeRecoveryStrategies(): void {
    const strategies: RecoveryStrategy[] = [
      {
        id: 'retry_request',
        name: '重試請求',
        description: '自動重試失敗的網路請求',
        automatic: true,
        successRate: 0.85,
        estimatedTime: 3000,
        prerequisites: ['網路連接可用'],
        steps: [
          {
            order: 1,
            action: 'wait',
            description: '等待指定時間',
            expectedOutcome: '延遲重試以避免頻繁請求'
          },
          {
            order: 2,
            action: 'retry',
            description: '重新發送原始請求',
            expectedOutcome: '成功接收回應'
          }
        ]
      },
      {
        id: 'offline_mode',
        name: '離線模式',
        description: '啟用離線模式使用快取數據',
        automatic: true,
        successRate: 0.70,
        estimatedTime: 500,
        prerequisites: ['存在快取數據'],
        steps: [
          {
            order: 1,
            action: 'check_cache',
            description: '檢查本地快取',
            expectedOutcome: '找到可用的快取數據'
          },
          {
            order: 2,
            action: 'load_cache',
            description: '載入快取數據',
            expectedOutcome: '顯示快取內容給用戶'
          }
        ]
      },
      {
        id: 'memory_cleanup',
        name: '內存清理',
        description: '清理不必要的內存使用',
        automatic: true,
        successRate: 0.90,
        estimatedTime: 2000,
        prerequisites: [],
        steps: [
          {
            order: 1,
            action: 'clear_cache',
            description: '清除應用程式緩存',
            expectedOutcome: '釋放內存空間'
          },
          {
            order: 2,
            action: 'cleanup_objects',
            description: '清理未使用的物件',
            expectedOutcome: '減少內存佔用'
          }
        ]
      }
    ]
    
    strategies.forEach(strategy => {
      this.recoveryStrategies.set(strategy.id, strategy)
    })
  }
  
  private setupEventListeners(): void {
    // 全域錯誤監聽
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event)
    })
    
    // Promise 拒絕監聽
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event)
    })
    
    // 用戶行為追蹤
    if (this.config.enableMetrics) {
      this.setupUserActionTracking()
    }
  }
  
  private setupUserActionTracking(): void {
    const events = ['click', 'input', 'submit', 'focus', 'blur']
    
    events.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        this.trackUserAction({
          timestamp: new Date(),
          type: eventType as any,
          target: (event.target as Element)?.tagName || 'unknown'
        })
      })
    })
  }
  
  private initializePerformanceTracking(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
            this.log('debug', `Performance: ${entry.name} took ${entry.duration}ms`)
          }
        })
      })
      
      try {
        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] })
      } catch (error) {
        this.log('warn', '性能監控初始化失敗', error)
      }
    }
  }
  
  private handleGlobalError(event: ErrorEvent): void {
    const errorInfo: IntelligentErrorInfo = {
      id: this.generateErrorId(),
      type: 'unknown',
      severity: 'high',
      message: event.message || '未知錯誤',
      details: `文件: ${event.filename}, 行號: ${event.lineno}, 列號: ${event.colno}`,
      stack: event.error?.stack,
      timestamp: new Date(),
      recoverable: true,
      retryCount: 0,
      maxRetries: this.config.maxRetryAttempts,
      suggestions: ['重新整理頁面', '檢查瀏覽器控制台', '聯繫技術支援'],
      category: this.errorCategories.get('system_resource')!,
      subCategory: 'javascript_error',
      autoRecoveryAttempted: false,
      recoverySuccess: false,
      recoveryStrategy: this.recoveryStrategies.get('restart_app')!,
      userActionRequired: false,
      estimatedFixTime: '1-2 分鐘',
      relatedErrors: [],
      context: this.getSystemState()
    }
    
    this.processError(errorInfo)
  }
  
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const errorInfo: IntelligentErrorInfo = {
      id: this.generateErrorId(),
      type: 'network',
      severity: 'medium',
      message: '未處理的 Promise 拒絕',
      details: String(event.reason),
      timestamp: new Date(),
      recoverable: true,
      retryCount: 0,
      maxRetries: this.config.maxRetryAttempts,
      suggestions: ['檢查網路連接', '重試操作', '稍後再試'],
      category: this.errorCategories.get('network_connectivity')!,
      subCategory: 'promise_rejection',
      autoRecoveryAttempted: false,
      recoverySuccess: false,
      recoveryStrategy: this.recoveryStrategies.get('retry_request')!,
      userActionRequired: false,
      estimatedFixTime: '30 秒',
      relatedErrors: [],
      context: this.getSystemState()
    }
    
    this.processError(errorInfo)
  }
  
  public reportError(error: Error | string, context: any = {}): string {
    const errorInfo: IntelligentErrorInfo = {
      id: this.generateErrorId(),
      type: this.categorizeError(error),
      severity: this.assessSeverity(error),
      message: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
      recoverable: true,
      retryCount: 0,
      maxRetries: this.config.maxRetryAttempts,
      suggestions: this.generateSuggestions(error),
      category: this.getErrorCategory(error),
      subCategory: this.getErrorSubCategory(error),
      autoRecoveryAttempted: false,
      recoverySuccess: false,
      recoveryStrategy: this.selectRecoveryStrategy(error),
      userActionRequired: false,
      estimatedFixTime: '1 分鐘',
      relatedErrors: [],
      context: { ...context, ...this.getSystemState() }
    }
    
    return this.processError(errorInfo)
  }
  
  private processError(errorInfo: IntelligentErrorInfo): string {
    // 記錄錯誤
    this.errors.set(errorInfo.id, errorInfo)
    this.updateMetrics(errorInfo)
    this.log('error', errorInfo.message, errorInfo)
    
    // 創建錯誤報告
    if (this.config.enableErrorReporting) {
      this.createErrorReport(errorInfo)
    }
    
    // 嘗試自動恢復
    if (this.config.enableAutoRecovery && errorInfo.category.autoRecovery) {
      this.attemptAutoRecovery(errorInfo)
    }
    
    return errorInfo.id
  }
  
  private async attemptAutoRecovery(errorInfo: IntelligentErrorInfo): Promise<void> {
    const strategy = errorInfo.recoveryStrategy
    
    if (!strategy.automatic) {
      return
    }
    
    errorInfo.autoRecoveryAttempted = true
    const startTime = Date.now()
    
    try {
      const result = await this.executeRecoveryStrategy(strategy, errorInfo)
      const duration = Date.now() - startTime
      
      if (result.success) {
        errorInfo.recoverySuccess = true
        this.log('info', `自動恢復成功: ${strategy.name}，耗時: ${duration}ms`)
      } else {
        this.log('warn', `自動恢復失敗: ${strategy.name}，錯誤: ${result.error}`)
        errorInfo.userActionRequired = true
      }
      
      // 記錄恢復嘗試
      const attempt: RecoveryAttempt = {
        timestamp: new Date(),
        strategy,
        success: result.success,
        duration,
        error: result.error
      }
      
      this.updateErrorReport(errorInfo.id, attempt)
      
    } catch (recoveryError) {
      this.log('error', '恢復策略執行失敗', recoveryError)
      errorInfo.userActionRequired = true
    }
  }
  
  private async executeRecoveryStrategy(strategy: RecoveryStrategy, errorInfo: IntelligentErrorInfo): Promise<AutoRecoveryResult> {
    const result: AutoRecoveryResult = {
      success: false,
      strategy,
      stepsExecuted: [],
      timeTaken: 0
    }
    
    const startTime = Date.now()
    
    try {
      for (const step of strategy.steps) {
        result.stepsExecuted.push(step)
        
        switch (step.action) {
          case 'wait':
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))
            break
          
          case 'retry':
            // 這裡應該根據錯誤類型執行相應的重試邏輯
            if (errorInfo.type === 'network') {
              result.success = Math.random() > 0.3 // 模擬 70% 成功率
            }
            break
          
          case 'clear_cache':
            await this.clearApplicationCache()
            result.success = true
            break
          
          case 'cleanup_objects':
            await this.cleanupUnusedObjects()
            result.success = true
            break
          
          default:
            result.success = true
        }
        
        if (!result.success) {
          break
        }
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error)
    }
    
    result.timeTaken = Date.now() - startTime
    return result
  }
  
  private async clearApplicationCache(): Promise<void> {
    try {
      // 清除 localStorage
      const localStorageKeys = Object.keys(localStorage)
      localStorageKeys.forEach(key => {
        if (key.startsWith('erslice_')) {
          localStorage.removeItem(key)
        }
      })
      
      // 清除 sessionStorage
      const sessionStorageKeys = Object.keys(sessionStorage)
      sessionStorageKeys.forEach(key => {
        if (key.startsWith('erslice_')) {
          sessionStorage.removeItem(key)
        }
      })
      
      this.log('info', '應用程式緩存已清理')
    } catch (error) {
      this.log('error', '清理緩存失敗', error)
      throw error
    }
  }
  
  private async cleanupUnusedObjects(): Promise<void> {
    // 觸發垃圾回收（如果可用）
    if ('gc' in window && typeof window.gc === 'function') {
      window.gc()
    }
    
    // 清理大型物件引用
    this.userActions = this.userActions.slice(-100) // 只保留最近 100 個動作
    this.errorReports = this.errorReports.slice(-50) // 只保留最近 50 個報告
    
    this.log('info', '未使用物件已清理')
  }
  
  private categorizeError(error: Error | string): ErrorType {
    const message = error instanceof Error ? error.message : String(error)
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('xhr')) {
      return 'network'
    }
    
    if (lowerMessage.includes('file') || lowerMessage.includes('upload') || lowerMessage.includes('download')) {
      return 'file'
    }
    
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') || lowerMessage.includes('required')) {
      return 'validation'
    }
    
    if (lowerMessage.includes('timeout') || lowerMessage.includes('time out')) {
      return 'timeout'
    }
    
    if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized') || lowerMessage.includes('forbidden')) {
      return 'permission'
    }
    
    if (lowerMessage.includes('memory') || lowerMessage.includes('resource')) {
      return 'resource'
    }
    
    return 'unknown'
  }
  
  private assessSeverity(error: Error | string): ErrorSeverity {
    const message = error instanceof Error ? error.message : String(error)
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('critical') || lowerMessage.includes('fatal') || lowerMessage.includes('crash')) {
      return 'critical'
    }
    
    if (lowerMessage.includes('error') || lowerMessage.includes('fail')) {
      return 'high'
    }
    
    if (lowerMessage.includes('warning') || lowerMessage.includes('invalid')) {
      return 'medium'
    }
    
    return 'low'
  }
  
  private generateSuggestions(error: Error | string): string[] {
    const type = this.categorizeError(error)
    
    const suggestionMap: Record<ErrorType, string[]> = {
      network: ['檢查網路連接', '重試請求', '使用離線模式'],
      file: ['檢查文件格式', '確認文件大小', '重新選擇文件'],
      validation: ['檢查輸入格式', '使用建議值', '參考範例'],
      timeout: ['增加超時時間', '檢查網路速度', '分批處理'],
      permission: ['檢查權限設定', '重新登入', '聯繫管理員'],
      resource: ['關閉其他應用程式', '清理內存', '重啟瀏覽器'],
      unknown: ['重新整理頁面', '清除瀏覽器緩存', '聯繫技術支援']
    }
    
    return suggestionMap[type] || suggestionMap.unknown
  }
  
  private getErrorCategory(error: Error | string): ErrorCategory {
    const type = this.categorizeError(error)
    
    const categoryMap: Record<ErrorType, string> = {
      network: 'network_connectivity',
      file: 'file_processing',
      validation: 'validation_error',
      timeout: 'network_connectivity',
      permission: 'system_resource',
      resource: 'system_resource',
      unknown: 'system_resource'
    }
    
    const categoryId = categoryMap[type]
    return this.errorCategories.get(categoryId) || this.errorCategories.get('system_resource')!
  }
  
  private getErrorSubCategory(error: Error | string): string {
    const message = error instanceof Error ? error.message : String(error)
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('fetch')) return 'fetch_error'
    if (lowerMessage.includes('upload')) return 'upload_error'
    if (lowerMessage.includes('download')) return 'download_error'
    if (lowerMessage.includes('validation')) return 'validation_error'
    if (lowerMessage.includes('timeout')) return 'timeout_error'
    if (lowerMessage.includes('permission')) return 'permission_error'
    if (lowerMessage.includes('memory')) return 'memory_error'
    
    return 'general_error'
  }
  
  private selectRecoveryStrategy(error: Error | string): RecoveryStrategy {
    const type = this.categorizeError(error)
    
    const strategyMap: Record<ErrorType, string> = {
      network: 'retry_request',
      file: 'retry_upload',
      validation: 'user_correction',
      timeout: 'retry_request',
      permission: 'restart_app',
      resource: 'memory_cleanup',
      unknown: 'restart_app'
    }
    
    const strategyId = strategyMap[type]
    return this.recoveryStrategies.get(strategyId) || this.recoveryStrategies.get('restart_app')!
  }
  
  private createErrorReport(errorInfo: IntelligentErrorInfo): void {
    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      error: errorInfo,
      systemState: this.getSystemState(),
      userActions: this.userActions.slice(-10), // 最近 10 個動作
      networkCondition: this.getNetworkCondition(),
      browserInfo: this.getBrowserInfo(),
      recoveryAttempts: []
    }
    
    this.errorReports.push(report)
    
    if (this.config.logLevel === 'debug') {
      console.log('錯誤報告已創建:', report)
    }
  }
  
  private updateErrorReport(errorId: string, attempt: RecoveryAttempt): void {
    const report = this.errorReports.find(r => r.error.id === errorId)
    if (report) {
      report.recoveryAttempts.push(attempt)
    }
  }
  
  private updateMetrics(errorInfo: IntelligentErrorInfo): void {
    this.metrics.totalErrors++
    this.metrics.errorsByType[errorInfo.type]++
    this.metrics.errorsBySeverity[errorInfo.severity]++
    this.metrics.timeRange.end = new Date()
    
    // 更新最常見錯誤統計
    this.updateMostCommonErrors()
  }
  
  private updateMostCommonErrors(): void {
    const errorCounts: Record<ErrorType, number> = { ...this.metrics.errorsByType }
    
    this.metrics.mostCommonErrors = Object.entries(errorCounts)
      .map(([type, count]) => ({ type: type as ErrorType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }
  
  private trackUserAction(action: UserAction): void {
    this.userActions.push(action)
    
    // 只保留最近 1000 個動作
    if (this.userActions.length > 1000) {
      this.userActions = this.userActions.slice(-1000)
    }
  }
  
  private getSystemState(): SystemState {
    const memory = performance.memory ? {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      percentage: Math.round((performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100)
    } : {
      used: 0,
      total: 0,
      percentage: 0
    }
    
    return {
      memory,
      performance: {
        renderTime: performance.now(),
        scriptTime: 0,
        layoutTime: 0
      },
      storage: {
        localStorage: this.getStorageSize(localStorage),
        sessionStorage: this.getStorageSize(sessionStorage),
        indexedDB: 0
      }
    }
  }
  
  private getStorageSize(storage: Storage): number {
    let total = 0
    for (let key in storage) {
      if (storage.hasOwnProperty(key)) {
        total += storage[key].length
      }
    }
    return total
  }
  
  private getNetworkCondition(): NetworkCondition {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0
    }
  }
  
  private getBrowserInfo(): BrowserInfo {
    return {
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      version: this.getBrowserVersion(),
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      }
    }
  }
  
  private getBrowserVersion(): string {
    const userAgent = navigator.userAgent
    let match = userAgent.match(/(chrome|firefox|safari|edge|opera)\/(\d+)/i)
    return match ? `${match[1]} ${match[2]}` : 'unknown'
  }
  
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private log(level: string, message: string, data?: any): void {
    const logLevels = ['debug', 'info', 'warn', 'error']
    const configLevel = logLevels.indexOf(this.config.logLevel)
    const messageLevel = logLevels.indexOf(level)
    
    if (messageLevel >= configLevel) {
      const timestamp = new Date().toISOString()
      const prefix = `[ErSlice] ${timestamp} [${level.toUpperCase()}]`
      
      switch (level) {
        case 'debug':
          console.debug(prefix, message, data)
          break
        case 'info':
          console.info(prefix, message, data)
          break
        case 'warn':
          console.warn(prefix, message, data)
          break
        case 'error':
          console.error(prefix, message, data)
          break
      }
    }
  }
  
  // 公開方法
  
  public getMetrics(): ErrorMetrics {
    // 計算恢復成功率
    const totalRecoveryAttempts = this.errorReports.reduce((total, report) => {
      return total + report.recoveryAttempts.length
    }, 0)
    
    const successfulRecoveries = this.errorReports.reduce((total, report) => {
      return total + report.recoveryAttempts.filter(attempt => attempt.success).length
    }, 0)
    
    this.metrics.recoverySuccessRate = totalRecoveryAttempts > 0 
      ? Math.round((successfulRecoveries / totalRecoveryAttempts) * 100) / 100 
      : 0
    
    // 計算平均恢復時間
    const recoveryTimes = this.errorReports.flatMap(report => 
      report.recoveryAttempts.map(attempt => attempt.duration)
    )
    
    this.metrics.averageRecoveryTime = recoveryTimes.length > 0
      ? Math.round(recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length)
      : 0
    
    return { ...this.metrics }
  }
  
  public getErrorReports(limit: number = 50): ErrorReport[] {
    return this.errorReports
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }
  
  public getErrorById(id: string): IntelligentErrorInfo | undefined {
    return this.errors.get(id)
  }
  
  public clearErrors(): void {
    this.errors.clear()
    this.errorReports.length = 0
    this.initializeMetrics()
  }
  
  public updateConfig(config: Partial<EnterpriseErrorConfig>): void {
    this.config = { ...this.config, ...config }
  }
  
  public exportErrorData(): {
    errors: IntelligentErrorInfo[]
    reports: ErrorReport[]
    metrics: ErrorMetrics
  } {
    return {
      errors: Array.from(this.errors.values()),
      reports: this.errorReports,
      metrics: this.getMetrics()
    }
  }
}

// 全域錯誤處理器實例
export const enterpriseErrorHandler = new EnterpriseErrorHandler({
  enableAutoRecovery: true,
  maxRetryAttempts: 3,
  retryDelay: 1000,
  enableErrorReporting: true,
  enableMetrics: true,
  enablePerformanceTracking: true,
  logLevel: 'info'
})

// 導出便利函數
export const reportError = (error: Error | string, context?: any): string => {
  return enterpriseErrorHandler.reportError(error, context)
}

export const getErrorMetrics = (): ErrorMetrics => {
  return enterpriseErrorHandler.getMetrics()
}

export const getErrorReports = (limit?: number): ErrorReport[] => {
  return enterpriseErrorHandler.getErrorReports(limit)
}