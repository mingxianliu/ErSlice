import React from 'react'
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export type ConfirmType = 'danger' | 'warning' | 'info'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  type?: ConfirmType
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  onClose?: () => void
  details?: string
  showDetails?: boolean
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  onClose,
  details,
  showDetails = false
}) => {
  if (!isOpen) return null

  const getTypeConfig = (type: ConfirmType) => {
    switch (type) {
      case 'danger':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          confirmButtonColor: 'bg-red-600 hover:bg-red-700',
          titleColor: 'text-red-900 dark:text-red-100'
        }
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          confirmButtonColor: 'bg-yellow-600 hover:bg-yellow-700',
          titleColor: 'text-yellow-900 dark:text-yellow-100'
        }
      case 'info':
      default:
        return {
          icon: InformationCircleIcon,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          confirmButtonColor: 'bg-blue-600 hover:bg-blue-700',
          titleColor: 'text-blue-900 dark:text-blue-100'
        }
    }
  }

  const config = getTypeConfig(type)
  const IconComponent = config.icon

  const defaultTexts = {
    danger: { confirm: '確認刪除', cancel: '取消' },
    warning: { confirm: '確認操作', cancel: '取消' },
    info: { confirm: '確認', cancel: '取消' }
  }

  const texts = {
    confirm: confirmText || defaultTexts[type].confirm,
    cancel: cancelText || defaultTexts[type].cancel
  }

  const handleConfirm = () => {
    onConfirm()
    if (onClose) onClose()
  }

  const handleCancel = () => {
    onCancel()
    if (onClose) onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 標題欄 */}
        <div className={`flex items-center justify-between p-6 border-b ${config.borderColor}`}>
          <div className="flex items-center space-x-3">
            <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
            <h2 className={`text-xl font-semibold ${config.titleColor}`}>
              {title}
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="關閉"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* 內容區域 */}
        <div className="p-6">
          {/* 主要消息 */}
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300">{message}</p>
          </div>

          {/* 詳細信息 */}
          {details && showDetails && (
            <div className="mb-4">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                  查看詳細信息
                </summary>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {details}
                  </pre>
                </div>
              </details>
            </div>
          )}

          {/* 警告提示 */}
          {type === 'danger' && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    此操作無法撤銷
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                    請確認您要執行此操作，因為它可能會導致數據丟失
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 建議 */}
          {type === 'warning' && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <QuestionMarkCircleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    建議在執行前備份相關數據
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {texts.cancel}
          </button>
          
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${config.confirmButtonColor}`}
          >
            {texts.confirm}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
