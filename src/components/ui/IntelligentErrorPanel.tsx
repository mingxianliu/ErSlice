import React, { useState } from 'react'
import { 
  ExclamationTriangleIcon, 
  XCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  UserIcon,
  CogIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { IntelligentErrorInfo } from '@/services/intelligentErrorHandler'

interface IntelligentErrorPanelProps {
  errorInfo: IntelligentErrorInfo
  onClose: () => void
  onRetry?: () => void
  onManualRecovery?: () => void
}

const IntelligentErrorPanel: React.FC<IntelligentErrorPanelProps> = ({
  errorInfo,
  onClose,
  onRetry,
  onManualRecovery
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'low':
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
      case 'medium':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      case 'low':
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              智能錯誤處理
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="關閉錯誤詳情"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* 錯誤概覽 */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('overview')}
              className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white mb-3"
            >
              {expandedSections.has('overview') ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
              <span>錯誤概覽</span>
            </button>
            
            {expandedSections.has('overview') && (
              <div className="space-y-4">
                {/* 錯誤基本信息 */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">錯誤信息</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 dark:text-gray-400">類型:</span>
                          <span className="text-gray-900 dark:text-white">{errorInfo.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 dark:text-gray-400">嚴重程度:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(errorInfo.severity)}`}>
                            {errorInfo.severity}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 dark:text-gray-400">可恢復:</span>
                          <span className={errorInfo.recoverable ? 'text-green-600' : 'text-red-600'}>
                            {errorInfo.recoverable ? '是' : '否'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">時間信息</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400">發生時間:</span>
                          <span className="text-gray-900 dark:text-white">
                            {errorInfo.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 dark:text-gray-400">重試次數:</span>
                          <span className="text-gray-900 dark:text-white">
                            {errorInfo.retryCount}/{errorInfo.maxRetries}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 錯誤消息 */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">錯誤描述</h4>
                  <p className="text-red-800 dark:text-red-200">{errorInfo.message}</p>
                  {errorInfo.details && (
                    <details className="mt-2">
                      <summary className="text-sm text-red-700 dark:text-red-300 cursor-pointer">
                        查看詳細信息
                      </summary>
                      <pre className="mt-2 text-xs text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-auto">
                        {errorInfo.details}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 錯誤分類 */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('category')}
              className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white mb-3"
            >
              {expandedSections.has('category') ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
              <span>錯誤分類</span>
            </button>
            
            {expandedSections.has('category') && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                    {errorInfo.category.name}
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 mb-3">
                    {errorInfo.category.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">預防建議</h5>
                      <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                        {errorInfo.category.preventionTips.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-600 dark:text-blue-400">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">可用恢復策略</h5>
                      <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                        {errorInfo.category.recoveryStrategies.map((strategy, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-600 dark:text-blue-400">•</span>
                            <span>{strategy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 恢復策略 */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('recovery')}
              className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white mb-3"
            >
              {expandedSections.has('recovery') ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
              <span>恢復策略</span>
            </button>
            
            {expandedSections.has('recovery') && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-green-900 dark:text-green-100">
                      {errorInfo.recoveryStrategy.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-700 dark:text-green-300">
                        成功率: {Math.round(errorInfo.recoveryStrategy.successRate * 100)}%
                      </span>
                      <span className="text-sm text-green-700 dark:text-green-300">
                        預估時間: {errorInfo.recoveryStrategy.estimatedTime / 1000}秒
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-green-800 dark:text-green-200 mb-3">
                    {errorInfo.recoveryStrategy.description}
                  </p>

                  {/* 前置條件 */}
                  {errorInfo.recoveryStrategy.prerequisites.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">前置條件</h5>
                      <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                        {errorInfo.recoveryStrategy.prerequisites.map((prereq, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-600 dark:text-green-400">•</span>
                            <span>{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 恢復步驟 */}
                  <div>
                    <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">恢復步驟</h5>
                    <div className="space-y-2">
                      {errorInfo.recoveryStrategy.steps.map((step, index) => (
                        <div key={index} className="bg-white dark:bg-gray-700 rounded p-3">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                              {step.order}
                            </div>
                            <div className="flex-1">
                              <h6 className="font-medium text-green-900 dark:text-green-100">
                                {step.action}
                              </h6>
                              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                                {step.description}
                              </p>
                              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                預期結果: {step.expectedOutcome}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 自動恢復結果 */}
                {errorInfo.autoRecoveryAttempted && (
                  <div className={`border rounded-lg p-4 ${
                    errorInfo.recoverySuccess 
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                      : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {errorInfo.recoverySuccess ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-600" />
                      )}
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        自動恢復{errorInfo.recoverySuccess ? '成功' : '失敗'}
                      </h4>
                    </div>
                    
                    {errorInfo.recoverySuccess ? (
                      <p className="text-green-800 dark:text-green-200">
                        系統已自動修復此錯誤，無需用戶干預。
                      </p>
                    ) : (
                      <p className="text-red-800 dark:text-red-200">
                        自動恢復失敗，需要用戶手動處理。
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 用戶操作建議 */}
          {errorInfo.userActionRequired && (
            <div className="mb-6">
              <button
                onClick={() => toggleSection('actions')}
                className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white mb-3"
              >
                {expandedSections.has('actions') ? (
                  <ChevronDownIcon className="h-5 w-5" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5" />
                )}
                <span>用戶操作建議</span>
              </button>
              
              {expandedSections.has('actions') && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <UserIcon className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                      需要用戶操作
                    </h4>
                  </div>
                  
                  <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                    此錯誤無法自動恢復，需要用戶手動處理。
                  </p>

                  <div className="space-y-2">
                    {errorInfo.recoveryStrategy.steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CogIcon className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <span className="text-sm text-yellow-800 dark:text-yellow-200">
                          {step.action}: {step.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 錯誤建議 */}
          {errorInfo.suggestions.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => toggleSection('suggestions')}
                className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white mb-3"
              >
                {expandedSections.has('suggestions') ? (
                  <ChevronDownIcon className="h-5 w-5" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5" />
                )}
                <span>錯誤建議</span>
              </button>
              
              {expandedSections.has('suggestions') && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">解決建議</h4>
                  <ul className="space-y-2">
                    {errorInfo.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-sm text-blue-800 dark:text-blue-200">
                          {suggestion}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              預估修復時間: {errorInfo.estimatedFixTime}
            </div>
            <div className="flex space-x-3">
              {onRetry && errorInfo.recoverable && errorInfo.retryCount < errorInfo.maxRetries && (
                <button
                  onClick={onRetry}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>重試</span>
                </button>
              )}
              {onManualRecovery && errorInfo.userActionRequired && (
                <button
                  onClick={onManualRecovery}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  手動修復
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntelligentErrorPanel
