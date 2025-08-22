import React from 'react'
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export interface ProgressStage {
  id: string
  name: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  progress: number
  message: string
  details?: any
}

interface ProgressBarProps {
  stages: ProgressStage[]
  currentStage: string
  overallProgress: number
  isComplete: boolean
  hasError: boolean
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  stages,
  currentStage,
  overallProgress,
  isComplete,
  hasError
}) => {
  const getStageIcon = (stage: ProgressStage) => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'in-progress':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStageStatusColor = (stage: ProgressStage) => {
    switch (stage.status) {
      case 'completed':
        return 'bg-green-500'
      case 'in-progress':
        return 'bg-blue-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* 整體進度條 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">整體進度</span>
          <span className="text-sm text-gray-500">{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              hasError ? 'bg-red-500' : isComplete ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* 階段進度 */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="space-y-2">
            <div className="flex items-center space-x-3">
              {getStageIcon(stage)}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                  <span className="text-xs text-gray-500">{stage.progress}%</span>
                </div>
                <p className="text-xs text-gray-500">{stage.message}</p>
              </div>
            </div>
            
            {/* 階段進度條 */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${getStageStatusColor(stage)}`}
                style={{ width: `${stage.progress}%` }}
              />
            </div>
            
            {/* 階段詳情 */}
            {stage.details && (
              <div className="ml-8 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <pre className="whitespace-pre-wrap">{JSON.stringify(stage.details, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 狀態指示器 */}
      <div className="flex items-center justify-center space-x-2">
        {isComplete && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">工作流程完成！</span>
          </div>
        )}
        {hasError && (
          <div className="flex items-center space-x-2 text-red-600">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">執行過程中發生錯誤</span>
          </div>
        )}
        {!isComplete && !hasError && (
          <div className="flex items-center space-x-2 text-blue-600">
            <ClockIcon className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">正在執行中...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressBar
