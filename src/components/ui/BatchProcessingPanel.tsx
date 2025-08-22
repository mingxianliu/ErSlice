import React, { useState, useEffect } from 'react'
import { 
  FolderIcon, 
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline'

export interface BatchItem {
  id: string
  name: string
  type: 'file' | 'folder' | 'project'
  status: 'pending' | 'processing' | 'completed' | 'error' | 'skipped'
  progress: number
  message: string
  error?: string
  startTime?: number
  endTime?: number
  size?: number
  metadata?: any
}

export interface BatchOperation {
  id: string
  name: string
  description: string
  totalItems: number
  completedItems: number
  failedItems: number
  skippedItems: number
  overallProgress: number
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error'
  startTime?: number
  endTime?: number
  items: BatchItem[]
}

interface BatchProcessingPanelProps {
  operations: BatchOperation[]
  onStartOperation: (operationId: string) => void
  onPauseOperation: (operationId: string) => void
  onStopOperation: (operationId: string) => void
  onRetryOperation: (operationId: string) => void
  onClearCompleted: () => void
  onRetryFailed: () => void
}

const BatchProcessingPanel: React.FC<BatchProcessingPanelProps> = ({
  operations,
  onStartOperation,
  onPauseOperation,
  onStopOperation,
  onRetryOperation,
  onClearCompleted,
  onRetryFailed
}) => {
  const [expandedOperations, setExpandedOperations] = useState<Set<string>>(new Set())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // 自動刷新進度
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // 觸發重新渲染以更新進度
      setExpandedOperations(new Set(expandedOperations))
    }, 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, expandedOperations])

  const toggleOperationExpansion = (operationId: string) => {
    const newExpanded = new Set(expandedOperations)
    if (newExpanded.has(operationId)) {
      newExpanded.delete(operationId)
    } else {
      newExpanded.add(operationId)
    }
    setExpandedOperations(newExpanded)
  }

  const getStatusIcon = (status: BatchOperation['status']) => {
    switch (status) {
      case 'running':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'paused':
        return <PauseIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getItemStatusIcon = (status: BatchItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
      case 'processing':
        return <ClockIcon className="h-4 w-4 text-blue-500 animate-spin" />
      case 'skipped':
        return <XMarkIcon className="h-4 w-4 text-gray-400" />
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: BatchOperation['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'paused':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-300'
    }
  }

  const formatDuration = (startTime?: number, endTime?: number) => {
    if (!startTime) return '--'
    
    const end = endTime || Date.now()
    const duration = end - startTime
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

  const getOverallStats = () => {
    const totalOperations = operations.length
    const runningOperations = operations.filter(op => op.status === 'running').length
    const completedOperations = operations.filter(op => op.status === 'completed').length
    const failedOperations = operations.filter(op => op.status === 'error').length
    
    const totalItems = operations.reduce((sum, op) => sum + op.totalItems, 0)
    const completedItems = operations.reduce((sum, op) => sum + op.completedItems, 0)
    const failedItems = operations.reduce((sum, op) => sum + op.failedItems, 0)
    
    return {
      totalOperations,
      runningOperations,
      completedOperations,
      failedOperations,
      totalItems,
      completedItems,
      failedItems,
      overallProgress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    }
  }

  const stats = getOverallStats()

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* 標題欄 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <FolderIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">批量處理</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">自動刷新</span>
          </label>
          
          <button
            onClick={onRetryFailed}
            disabled={stats.failedItems === 0}
            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            重試失敗項目
          </button>
          
          <button
            onClick={onClearCompleted}
            disabled={stats.completedOperations === 0}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            清理已完成
          </button>
        </div>
      </div>

      {/* 總體統計 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalOperations}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">總操作數</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completedOperations}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">已完成</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.failedOperations}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">失敗</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.overallProgress}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">總進度</div>
          </div>
        </div>
        
        {/* 總體進度條 */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>總體進度</span>
            <span>{stats.completedItems} / {stats.totalItems}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 操作列表 */}
      <div className="max-h-96 overflow-y-auto">
        {operations.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <FolderIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>暫無批量操作</p>
          </div>
        ) : (
          operations.map((operation) => (
            <div key={operation.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              {/* 操作標題 */}
              <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                   onClick={() => toggleOperationExpansion(operation.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(operation.status)}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{operation.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{operation.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {operation.completedItems} / {operation.totalItems}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDuration(operation.startTime, operation.endTime)}
                      </div>
                    </div>
                    
                    {/* 操作按鈕 */}
                    <div className="flex space-x-1">
                      {operation.status === 'idle' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStartOperation(operation.id)
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="開始"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {operation.status === 'running' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onPauseOperation(operation.id)
                          }}
                          className="p-1 text-yellow-600 hover:text-yellow-800"
                          title="暫停"
                        >
                          <PauseIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {operation.status === 'paused' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStartOperation(operation.id)
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="繼續"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {(operation.status === 'running' || operation.status === 'paused') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStopOperation(operation.id)
                          }}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="停止"
                        >
                          <StopIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {operation.status === 'error' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRetryOperation(operation.id)
                          }}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="重試"
                        >
                          <ClockIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 操作進度條 */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>進度</span>
                    <span>{operation.overallProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${getStatusColor(operation.status)}`}
                      style={{ width: `${operation.overallProgress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* 項目詳情 */}
              {expandedOperations.has(operation.id) && (
                <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-800">
                  <div className="space-y-2">
                    {operation.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded">
                        <div className="flex items-center space-x-2">
                          {getItemStatusIcon(item.status)}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.type} • {formatFileSize(item.size)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.progress}%
                          </div>
                          {item.error && (
                            <div className="text-xs text-red-500 max-w-xs truncate" title={item.error}>
                              {item.error}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default BatchProcessingPanel
