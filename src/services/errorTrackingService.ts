import { ErrorInfo, ErrorType, ErrorSeverity } from './errorHandler'

export interface ErrorTracker {
  id: string
  timestamp: Date
  error: ErrorInfo
  sessionId: string
  userId?: string
  userAgent: string
  url: string
  stackTrace: string
  context: Record<string, any>
  tags: string[]
  resolved: boolean
  resolutionNote?: string
  resolvedAt?: Date
  resolvedBy?: string
}

export interface ErrorReport {
  totalErrors: number
  errorsByType: Record<ErrorType, number>
  errorsBySeverity: Record<ErrorSeverity, number>
  errorsByComponent: Record<string, number>
  errorsByTime: {
    hourly: Record<string, number>
    daily: Record<string, number>
    weekly: Record<string, number>
  }
  topErrors: ErrorTracker[]
  recentErrors: ErrorTracker[]
  errorTrends: {
    increasing: string[]
    decreasing: string[]
    stable: string[]
  }
}

export interface ErrorFilter {
  types?: ErrorType[]
  severities?: ErrorSeverity[]
  components?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
  resolved?: boolean
  searchQuery?: string
}

export interface ErrorResolution {
  errorId: string
  resolutionNote: string
  resolvedBy: string
  resolutionType: 'fixed' | 'workaround' | 'ignored' | 'investigating'
  nextSteps?: string[]
  estimatedFixTime?: string
}

export class ErrorTrackingService {
  private errorTrackers: Map<string, ErrorTracker> = new Map()
  private errorPatterns: Map<string, ErrorPattern> = new Map()
  private errorMetrics: Map<string, ErrorMetrics> = new Map()
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeErrorPatterns()
    this.setupErrorTracking()
  }

  /**
   * 初始化錯誤模式識別
   */
  private initializeErrorPatterns(): void {
    // 檔案相關錯誤模式
    this.errorPatterns.set('file_upload', {
      pattern: /file|upload|download/i,
      category: 'file_operation',
      priority: 'high',
      autoResolution: 'retry',
      suggestions: ['檢查檔案格式', '確認檔案大小', '重試上傳操作']
    })

    // 網路相關錯誤模式
    this.errorPatterns.set('network_error', {
      pattern: /network|connection|timeout/i,
      category: 'network',
      priority: 'medium',
      autoResolution: 'retry',
      suggestions: ['檢查網路連接', '稍後重試', '檢查伺服器狀態']
    })

    // 驗證相關錯誤模式
    this.errorPatterns.set('validation_error', {
      pattern: /validation|invalid|required/i,
      category: 'data_validation',
      priority: 'low',
      autoResolution: 'fix_input',
      suggestions: ['檢查輸入數據', '確認必填欄位', '驗證數據格式']
    })

    // 權限相關錯誤模式
    this.errorPatterns.set('permission_error', {
      pattern: /permission|access|unauthorized/i,
      category: 'security',
      priority: 'critical',
      autoResolution: 'manual',
      suggestions: ['檢查用戶權限', '聯繫管理員', '重新登入系統']
    })

    // 資源相關錯誤模式
    this.errorPatterns.set('resource_error', {
      pattern: /memory|disk|quota|limit/i,
      category: 'system_resource',
      priority: 'high',
      autoResolution: 'cleanup',
      suggestions: ['清理不必要的檔案', '重啟應用程式', '檢查系統資源']
    })
  }

  /**
   * 設置錯誤追蹤
   */
  private setupErrorTracking(): void {
    // 監聽全域錯誤事件
    window.addEventListener('erslice-error', (event: CustomEvent) => {
      this.trackError(event.detail)
    })

    // 監聽未處理的 Promise 拒絕
    window.addEventListener('unhandledrejection', (event) => {
      this.trackUnhandledRejection(event.reason)
    })

    // 監聽全域錯誤
    window.addEventListener('error', (event) => {
      this.trackGlobalError(event)
    })
  }

  /**
   * 追蹤錯誤
   */
  trackError(errorInfo: ErrorInfo, context?: Record<string, any>): string {
    const tracker: ErrorTracker = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      error: errorInfo,
      sessionId: this.sessionId,
      userId: this.getCurrentUserId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stackTrace: errorInfo.stack || '',
      context: context || {},
      tags: this.extractErrorTags(errorInfo),
      resolved: false
    }

    // 分析錯誤模式
    this.analyzeErrorPattern(tracker)

    // 更新錯誤指標
    this.updateErrorMetrics(tracker)

    // 存儲錯誤追蹤器
    this.errorTrackers.set(tracker.id, tracker)

    // 觸發錯誤追蹤事件
    this.triggerErrorTrackedEvent(tracker)

    console.log(`🔍 錯誤已追蹤: ${tracker.id}`, tracker)
    return tracker.id
  }

  /**
   * 追蹤未處理的 Promise 拒絕
   */
  private trackUnhandledRejection(reason: any): void {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      type: 'unknown',
      severity: 'high',
      message: '未處理的 Promise 拒絕',
      details: String(reason),
      timestamp: new Date(),
      context: { source: 'unhandled-rejection' },
      recoverable: false,
      retryCount: 0,
      maxRetries: 0,
      suggestions: ['檢查 Promise 鏈', '添加錯誤處理', '使用 try-catch']
    }

    this.trackError(errorInfo, { source: 'unhandled-rejection', reason })
  }

  /**
   * 追蹤全域錯誤
   */
  private trackGlobalError(event: ErrorEvent): void {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      type: 'unknown',
      severity: 'high',
      message: event.message || '全域錯誤',
      details: event.error?.stack || '',
      timestamp: new Date(),
      context: { 
        source: 'global-error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      recoverable: false,
      retryCount: 0,
      maxRetries: 0,
      suggestions: ['檢查代碼語法', '查看控制台錯誤', '重新載入頁面']
    }

    this.trackError(errorInfo, { 
      source: 'global-error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  }

  /**
   * 分析錯誤模式
   */
  private analyzeErrorPattern(tracker: ErrorTracker): void {
    const message = tracker.error.message.toLowerCase()
    const stack = tracker.error.stack?.toLowerCase() || ''

    for (const [patternName, pattern] of this.errorPatterns.entries()) {
      if (pattern.pattern.test(message) || pattern.pattern.test(stack)) {
        tracker.tags.push(pattern.category)
        tracker.tags.push(`priority:${pattern.priority}`)
        tracker.tags.push(`auto-resolution:${pattern.autoResolution}`)
        
        // 添加自動解析建議
        if (pattern.suggestions.length > 0) {
          tracker.context.autoResolutionSuggestions = pattern.suggestions
        }
        
        break
      }
    }
  }

  /**
   * 更新錯誤指標
   */
  private updateErrorMetrics(tracker: ErrorTracker): void {
    const date = tracker.timestamp.toISOString().split('T')[0]
    const hour = tracker.timestamp.getHours().toString().padStart(2, '0')
    const week = this.getWeekNumber(tracker.timestamp)

    // 按類型統計
    this.updateMetric('type', tracker.error.type, date)
    
    // 按嚴重程度統計
    this.updateMetric('severity', tracker.error.severity, date)
    
    // 按組件統計
    const component = tracker.context.component || 'unknown'
    this.updateMetric('component', component, date)
    
    // 按時間統計
    this.updateTimeMetric('hourly', hour, date)
    this.updateTimeMetric('daily', date, date)
    this.updateTimeMetric('weekly', week, date)
  }

  /**
   * 更新指標
   */
  private updateMetric(category: string, key: string, date: string): void {
    const metricKey = `${category}_${key}_${date}`
    const current = this.errorMetrics.get(metricKey) || { count: 0, lastOccurrence: new Date() }
    
    current.count++
    current.lastOccurrence = new Date()
    
    this.errorMetrics.set(metricKey, current)
  }

  /**
   * 更新時間指標
   */
  private updateTimeMetric(period: string, key: string, date: string): void {
    const metricKey = `time_${period}_${key}_${date}`
    const current = this.errorMetrics.get(metricKey) || { count: 0, lastOccurrence: new Date() }
    
    current.count++
    current.lastOccurrence = new Date()
    
    this.errorMetrics.set(metricKey, current)
  }

  /**
   * 提取錯誤標籤
   */
  private extractErrorTags(errorInfo: ErrorInfo): string[] {
    const tags: string[] = []
    
    // 基本標籤
    tags.push(`type:${errorInfo.type}`)
    tags.push(`severity:${errorInfo.severity}`)
    tags.push(`recoverable:${errorInfo.recoverable}`)
    
    // 組件標籤
    if (errorInfo.context.component) {
      tags.push(`component:${errorInfo.context.component}`)
    }
    
    // 操作標籤
    if (errorInfo.context.action) {
      tags.push(`action:${errorInfo.context.action}`)
    }
    
    return tags
  }

  /**
   * 獲取錯誤追蹤器
   */
  getErrorTracker(id: string): ErrorTracker | undefined {
    return this.errorTrackers.get(id)
  }

  /**
   * 獲取所有錯誤追蹤器
   */
  getAllErrorTrackers(): ErrorTracker[] {
    return Array.from(this.errorTrackers.values())
  }

  /**
   * 篩選錯誤追蹤器
   */
  filterErrorTrackers(filter: ErrorFilter): ErrorTracker[] {
    let trackers = Array.from(this.errorTrackers.values())

    // 按類型篩選
    if (filter.types && filter.types.length > 0) {
      trackers = trackers.filter(t => filter.types!.includes(t.error.type))
    }

    // 按嚴重程度篩選
    if (filter.severities && filter.severities.length > 0) {
      trackers = trackers.filter(t => filter.severities!.includes(t.error.severity))
    }

    // 按組件篩選
    if (filter.components && filter.components.length > 0) {
      trackers = trackers.filter(t => filter.components!.includes(t.context.component || 'unknown'))
    }

    // 按日期範圍篩選
    if (filter.dateRange) {
      trackers = trackers.filter(t => 
        t.timestamp >= filter.dateRange!.start && t.timestamp <= filter.dateRange!.end
      )
    }

    // 按標籤篩選
    if (filter.tags && filter.tags.length > 0) {
      trackers = trackers.filter(t => 
        filter.tags!.some(tag => t.tags.includes(tag))
      )
    }

    // 按解決狀態篩選
    if (filter.resolved !== undefined) {
      trackers = trackers.filter(t => t.resolved === filter.resolved)
    }

    // 按搜尋查詢篩選
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      trackers = trackers.filter(t => 
        t.error.message.toLowerCase().includes(query) ||
        t.error.details?.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return trackers
  }

  /**
   * 解決錯誤
   */
  resolveError(resolution: ErrorResolution): boolean {
    const tracker = this.errorTrackers.get(resolution.errorId)
    if (!tracker) {
      return false
    }

    tracker.resolved = true
    tracker.resolutionNote = resolution.resolutionNote
    tracker.resolvedAt = new Date()
    tracker.resolvedBy = resolution.resolvedBy

    // 更新標籤
    tracker.tags.push(`resolution:${resolution.resolutionType}`)
    tracker.tags.push(`resolved-by:${resolution.resolvedBy}`)

    // 觸發錯誤解決事件
    this.triggerErrorResolvedEvent(tracker, resolution)

    console.log(`✅ 錯誤已解決: ${resolution.errorId}`, resolution)
    return true
  }

  /**
   * 生成錯誤報告
   */
  generateErrorReport(filter?: ErrorFilter): ErrorReport {
    const trackers = filter ? this.filterErrorTrackers(filter) : this.getAllErrorTrackers()
    
    const report: ErrorReport = {
      totalErrors: trackers.length,
      errorsByType: {} as Record<ErrorType, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      errorsByComponent: {} as Record<string, number>,
      errorsByTime: {
        hourly: {},
        daily: {},
        weekly: {}
      },
      topErrors: [],
      recentErrors: [],
      errorTrends: {
        increasing: [],
        decreasing: [],
        stable: []
      }
    }

    // 統計錯誤分佈
    trackers.forEach(tracker => {
      // 按類型統計
      report.errorsByType[tracker.error.type] = (report.errorsByType[tracker.error.type] || 0) + 1
      
      // 按嚴重程度統計
      report.errorsBySeverity[tracker.error.severity] = (report.errorsBySeverity[tracker.error.severity] || 0) + 1
      
      // 按組件統計
      const component = tracker.context.component || 'unknown'
      report.errorsByComponent[component] = (report.errorsByComponent[component] || 0) + 1
    })

    // 獲取最近錯誤
    report.recentErrors = trackers
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)

    // 獲取最常見錯誤
    report.topErrors = this.getTopErrors(trackers)

    // 分析錯誤趨勢
    report.errorTrends = this.analyzeErrorTrends(trackers)

    return report
  }

  /**
   * 獲取最常見錯誤
   */
  private getTopErrors(trackers: ErrorTracker[]): ErrorTracker[] {
    const errorCounts = new Map<string, { tracker: ErrorTracker; count: number }>()
    
    trackers.forEach(tracker => {
      const key = `${tracker.error.type}_${tracker.error.message}`
      const existing = errorCounts.get(key)
      
      if (existing) {
        existing.count++
      } else {
        errorCounts.set(key, { tracker, count: 1 })
      }
    })

    return Array.from(errorCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => item.tracker)
  }

  /**
   * 分析錯誤趨勢
   */
  private analyzeErrorTrends(trackers: ErrorTracker[]): { increasing: string[]; decreasing: string[]; stable: string[] } {
    const trends = { increasing: [] as string[], decreasing: [] as string[], stable: [] as string[] }
    
    // 這裡可以實現更複雜的趨勢分析邏輯
    // 目前返回空數組作為佔位符
    
    return trends
  }

  /**
   * 清理舊的錯誤記錄
   */
  cleanupOldErrors(daysToKeep: number = 30): number {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    
    let cleanedCount = 0
    
    for (const [id, tracker] of this.errorTrackers.entries()) {
      if (tracker.timestamp < cutoffDate && tracker.resolved) {
        this.errorTrackers.delete(id)
        cleanedCount++
      }
    }

    console.log(`🧹 已清理 ${cleanedCount} 個舊錯誤記錄`)
    return cleanedCount
  }

  /**
   * 導出錯誤數據
   */
  exportErrorData(): string {
    const data = {
      trackers: Array.from(this.errorTrackers.values()),
      metrics: Array.from(this.errorMetrics.entries()),
      patterns: Array.from(this.errorPatterns.entries()),
      exportDate: new Date().toISOString()
    }

    return JSON.stringify(data, null, 2)
  }

  /**
   * 導入錯誤數據
   */
  importErrorData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.trackers) {
        data.trackers.forEach((tracker: ErrorTracker) => {
          this.errorTrackers.set(tracker.id, tracker)
        })
      }
      
      if (data.metrics) {
        data.metrics.forEach(([key, value]: [string, any]) => {
          this.errorMetrics.set(key, value)
        })
      }
      
      console.log('📥 錯誤數據導入成功')
      return true
    } catch (error) {
      console.error('❌ 錯誤數據導入失敗:', error)
      return false
    }
  }

  /**
   * 觸發錯誤追蹤事件
   */
  private triggerErrorTrackedEvent(tracker: ErrorTracker): void {
    const event = new CustomEvent('erslice-error-tracked', {
      detail: tracker
    })
    window.dispatchEvent(event)
  }

  /**
   * 觸發錯誤解決事件
   */
  private triggerErrorResolvedEvent(tracker: ErrorTracker, resolution: ErrorResolution): void {
    const event = new CustomEvent('erslice-error-resolved', {
      detail: { tracker, resolution }
    })
    window.dispatchEvent(event)
  }

  /**
   * 生成錯誤 ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 生成會話 ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 獲取當前用戶 ID
   */
  private getCurrentUserId(): string | undefined {
    // 這裡可以實現從認證系統獲取用戶 ID 的邏輯
    return localStorage.getItem('erslice-user-id') || undefined
  }

  /**
   * 獲取週數
   */
  private getWeekNumber(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return `${d.getUTCFullYear()}-W${Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)}`
  }
}

interface ErrorPattern {
  pattern: RegExp
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  autoResolution: 'retry' | 'fix_input' | 'cleanup' | 'manual'
  suggestions: string[]
}

interface ErrorMetrics {
  count: number
  lastOccurrence: Date
}

// 創建單例實例
export const errorTrackingService = new ErrorTrackingService()
