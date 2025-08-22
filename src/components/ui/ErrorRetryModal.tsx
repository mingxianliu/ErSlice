import React, { useState } from 'react'
import { 
  ExclamationTriangleIcon, 
  ArrowPathIcon, 
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ErrorRetryModalProps {
  isOpen: boolean
  error: Error | string
  onRetry: () => void
  onClose: () => void
  onSkip?: () => void
  retryCount?: number
  maxRetries?: number
}

const ErrorRetryModal: React.FC<ErrorRetryModalProps> = ({
  isOpen,
  error,
  onRetry,
  onClose,
  onSkip,
  retryCount = 0,
  maxRetries = 3
}) => {
  const [isRetrying, setIsRetrying] = useState(false)

  if (!isOpen) return null

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  const errorMessage = error instanceof Error ? error.message : error
  const canRetry = retryCount < maxRetries
  const remainingRetries = maxRetries - retryCount

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              執行錯誤
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="關閉"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-6">
          {/* 錯誤信息 */}
          <div className="mb-6">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  發生以下錯誤：
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 重試信息 */}
          {canRetry && (
            <div className="mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <ArrowPathIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    還可重試 {remainingRetries} 次
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  重試可能會解決臨時性問題
                </p>
              </div>
            </div>
          )}

          {/* 重試次數顯示 */}
          {retryCount > 0 && (
            <div className="mb-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  已重試 {retryCount} 次
                </p>
              </div>
            </div>
          )}

          {/* 建議 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">建議解決方案：</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• 檢查網路連接是否穩定</li>
              <li>• 確認檔案格式是否正確</li>
              <li>• 嘗試重新上傳檔案</li>
              <li>• 檢查系統資源是否充足</li>
            </ul>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            關閉
          </button>
          
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/20 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
            >
              跳過此步驟
            </button>
          )}
          
          {canRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isRetrying ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  <span>重試中...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>重試</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorRetryModal
