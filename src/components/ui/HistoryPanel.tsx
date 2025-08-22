import React, { useState, useMemo } from 'react'
import { 
  ClockIcon, 
  DocumentTextIcon,
  FolderIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  SearchIcon
} from '@heroicons/react/24/outline'

export interface HistoryRecord {
  id: string
  type: 'import' | 'export' | 'analysis' | 'generation' | 'conversion'
  operation: string
  description: string
  status: 'success' | 'error' | 'warning' | 'info'
  startTime: string
  endTime?: string
  duration?: number
  fileCount?: number
  fileSize?: number
  result?: {
    modules?: number
    pages?: number
    assets?: number
    errors?: string[]
    warnings?: string[]
  }
  metadata?: {
    projectName?: string
    sourceType?: string
    targetType?: string
    config?: any
    tags?: string[]
  }
  error?: string
  stackTrace?: string
}

interface HistoryPanelProps {
  records: HistoryRecord[]
  onViewDetails: (record: HistoryRecord) => void
  onRetry: (record: HistoryRecord) => void
  onDelete: (recordId: string) => void
  onExport: (record: HistoryRecord) => void
  onClearHistory: () => void
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  records,
  onViewDetails,
  onRetry,
  onDelete,
  onExport,
  onClearHistory
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<HistoryRecord['status'] | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<HistoryRecord['type'] | 'all'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [sortBy, setSortBy] = useState<'time' | 'type' | 'status' | 'duration'>('time')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // 過濾和排序記錄
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records.filter(record => {
      // 搜索過濾
      if (searchQuery && !record.operation.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !record.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // 狀態過濾
      if (statusFilter !== 'all' && record.status !== statusFilter) {
        return false
      }
      
      // 類型過濾
      if (typeFilter !== 'all' && record.type !== typeFilter) {
        return false
      }
      
      // 日期過濾
      if (dateFilter !== 'all') {
        const recordDate = new Date(record.startTime)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - recordDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        switch (dateFilter) {
          case 'today':
            if (diffDays > 1) return false
            break
          case 'week':
            if (diffDays > 7) return false
            break
          case 'month':
            if (diffDays > 30) return false
            break
        }
      }
      
      return true
    })
    
    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'time':
          aValue = new Date(a.startTime).getTime()
          bValue = new Date(b.startTime).getTime()
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'duration':
          aValue = a.duration || 0
          bValue = b.duration || 0
          break
        default:
          aValue = new Date(a.startTime).getTime()
          bValue = new Date(b.startTime).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    return filtered
  }, [records, searchQuery, statusFilter, typeFilter, dateFilter, sortBy, sortOrder])

  const getStatusIcon = (status: HistoryRecord['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getTypeIcon = (type: HistoryRecord['type']) => {
    switch (type) {
      case 'import':
        return <FolderIcon className="h-4 w-4 text-blue-500" />
      case 'export':
        return <DownloadIcon className="h-4 w-4 text-green-500" />
      case 'analysis':
        return <DocumentTextIcon className="h-4 w-4 text-purple-500" />
      case 'generation':
        return <DocumentTextIcon className="h-4 w-4 text-orange-500" />
      case 'conversion':
        return <DocumentTextIcon className="h-4 w-4 text-indigo-500" />
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: HistoryRecord['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return '--'
    
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '--'
    
    const sizes = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < sizes.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${sizes[unitIndex]}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays < 7) {
      return `${diffDays} 天前`
    } else {
      return date.toLocaleDateString('zh-TW') + ' ' + date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getStats = () => {
    const total = records.length
    const success = records.filter(r => r.status === 'success').length
    const error = records.filter(r => r.status === 'error').length
    const warning = records.filter(r => r.status === 'warning').length
    
    return { total, success, error, warning }
  }

  const stats = getStats()

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* 標題欄 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">操作歷史</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onClearHistory}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            清空歷史
          </button>
        </div>
      </div>

      {/* 統計信息 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">總記錄</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.success}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">成功</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.error}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">失敗</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.warning}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">警告</div>
          </div>
        </div>
      </div>

      {/* 過濾和搜索 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        {/* 搜索 */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索操作或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        {/* 過濾器 */}
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">所有狀態</option>
            <option value="success">成功</option>
            <option value="error">失敗</option>
            <option value="warning">警告</option>
            <option value="info">信息</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">所有類型</option>
            <option value="import">匯入</option>
            <option value="export">匯出</option>
            <option value="analysis">分析</option>
            <option value="generation">生成</option>
            <option value="conversion">轉換</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">所有時間</option>
            <option value="today">今天</option>
            <option value="week">本週</option>
            <option value="month">本月</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="time">按時間</option>
            <option value="type">按類型</option>
            <option value="status">按狀態</option>
            <option value="duration">按時長</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* 記錄列表 */}
      <div className="max-h-96 overflow-y-auto">
        {filteredAndSortedRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>暫無歷史記錄</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedRecords.map((record) => (
              <div key={record.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(record.status)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getTypeIcon(record.type)}
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {record.operation}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {record.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(record.startTime)}</span>
                        {record.duration && <span>耗時: {formatDuration(record.duration)}</span>}
                        {record.fileCount && <span>檔案: {record.fileCount}</span>}
                        {record.fileSize && <span>大小: {formatFileSize(record.fileSize)}</span>}
                        {record.result?.modules && <span>模組: {record.result.modules}</span>}
                        {record.result?.pages && <span>頁面: {record.result.pages}</span>}
                        {record.result?.assets && <span>資產: {record.result.assets}</span>}
                      </div>
                      
                      {record.error && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-800 dark:text-red-200">
                          <strong>錯誤:</strong> {record.error}
                        </div>
                      )}
                      
                      {record.metadata?.tags && record.metadata.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {record.metadata.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 操作按鈕 */}
                  <div className="flex items-center space-x-1 ml-4">
                    <button
                      onClick={() => onViewDetails(record)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="查看詳情"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    {record.status === 'error' && (
                      <button
                        onClick={() => onRetry(record)}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="重試"
                      >
                        <ClockIcon className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => onExport(record)}
                      className="p-1 text-purple-600 hover:text-purple-800"
                      title="導出"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => onDelete(record.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="刪除"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPanel
