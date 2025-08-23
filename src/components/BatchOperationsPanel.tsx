import { useState, useEffect } from 'react'
import { 
  CogIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline'
import { Button } from './ui/Button'
import { 
  getAvailableBatchOperations,
  executeBatchOperations,
  getOperationSuggestions,
  previewBatchOperation,
  BatchOperation,
  BatchOperationResult,
  BatchOperationProgress
} from '../services/batchOperations'
import { DesignModule } from '../utils/tauriCommands'
import { Template } from '../types/templates'
import { AISpec } from '../types/aiSpec'

interface BatchOperationsPanelProps {
  data: {
    modules: DesignModule[]
    templates: Template[]
    specs: AISpec[]
  }
  onOperationComplete?: (result: BatchOperationResult) => void
  className?: string
}

export default function BatchOperationsPanel({ data, onOperationComplete, className = '' }: BatchOperationsPanelProps) {
  const [availableOperations, setAvailableOperations] = useState<BatchOperation[]>([])
  const [selectedOperations, setSelectedOperations] = useState<string[]>([])
  const [operationResults, setOperationResults] = useState<BatchOperationResult[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [progress, setProgress] = useState<BatchOperationProgress | null>(null)
  const [operationSuggestions, setOperationSuggestions] = useState<{
    recommended: BatchOperation[]
    notRecommended: BatchOperation[]
  } | null>(null)
  const [previewData, setPreviewData] = useState<{
    operation: BatchOperation | null
    preview: any
  } | null>(null)

  // 獲取可用操作
  useEffect(() => {
    setAvailableOperations(getAvailableBatchOperations())
  }, [])

  // 獲取操作建議
  useEffect(() => {
    const allData = [...data.modules, ...data.templates, ...data.specs]
    if (allData.length > 0) {
      setOperationSuggestions(getOperationSuggestions(allData))
    }
  }, [data])

  // 選擇操作
  const handleOperationSelect = (operationId: string, checked: boolean) => {
    if (checked) {
      setSelectedOperations(prev => [...prev, operationId])
    } else {
      setSelectedOperations(prev => prev.filter(id => id !== operationId))
    }
  }

  // 選擇所有推薦操作
  const handleSelectAllRecommended = () => {
    if (operationSuggestions) {
      setSelectedOperations(operationSuggestions.recommended.map(op => op.id))
    }
  }

  // 清除所有選擇
  const handleClearSelection = () => {
    setSelectedOperations([])
  }

  // 預覽操作
  const handlePreviewOperation = async (operation: BatchOperation) => {
    const allData = [...data.modules, ...data.templates, ...data.specs]
    const preview = await previewBatchOperation(operation, allData)
    
    setPreviewData({
      operation,
      preview
    })
  }

  // 執行選中的操作
  const handleExecuteOperations = async () => {
    if (selectedOperations.length === 0) return

    setIsExecuting(true)
    setProgress(null)
    setOperationResults([])

    try {
      const allData = [...data.modules, ...data.templates, ...data.specs]
      const operationsToExecute = availableOperations.filter(op => 
        selectedOperations.includes(op.id)
      )

      const results = await executeBatchOperations(
        operationsToExecute,
        allData,
        {},
        (progress) => {
          setProgress(progress)
        }
      )

      setOperationResults(results)
      
      // 調用回調
      results.forEach(result => {
        onOperationComplete?.(result)
      })

    } catch (error) {
      console.error('批量操作執行失敗:', error)
    } finally {
      setIsExecuting(false)
      setProgress(null)
    }
  }

  // 停止執行
  const handleStopExecution = () => {
    setIsExecuting(false)
    setProgress(null)
  }

  // 渲染操作列表
  const renderOperationsList = () => {
    if (!operationSuggestions) return null

    return (
      <div className="space-y-4">
        {/* 推薦操作 */}
        {operationSuggestions.recommended.length > 0 && (
          <div>
            <h4 className="font-medium text-green-700 mb-3 flex items-center">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              推薦操作 ({operationSuggestions.recommended.length})
            </h4>
            <div className="space-y-2">
              {operationSuggestions.recommended.map((operation) => (
                <div key={operation.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <input
                    type="checkbox"
                    id={operation.id}
                    checked={selectedOperations.includes(operation.id)}
                    onChange={(e) => handleOperationSelect(operation.id, e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <label htmlFor={operation.id} className="font-medium text-green-900 cursor-pointer">
                      {operation.name}
                    </label>
                    <p className="text-sm text-green-700">{operation.description}</p>
                  </div>
                  <Button
                    onClick={() => handlePreviewOperation(operation)}
                    variant="secondary"
                    size="sm"
                  >
                    預覽
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 不推薦操作 */}
        {operationSuggestions.notRecommended.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-600 mb-3 flex items-center">
              <InformationCircleIcon className="h-4 w-4 mr-2" />
              其他操作 ({operationSuggestions.notRecommended.length})
            </h4>
            <div className="space-y-2">
              {operationSuggestions.notRecommended.map((operation) => (
                <div key={operation.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id={operation.id}
                    checked={selectedOperations.includes(operation.id)}
                    onChange={(e) => handleOperationSelect(operation.id, e.target.checked)}
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                    disabled
                  />
                  <div className="flex-1">
                    <label htmlFor={operation.id} className="font-medium text-gray-500 cursor-not-allowed">
                      {operation.name}
                    </label>
                    <p className="text-sm text-gray-500">{operation.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      不支援當前數據類型
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 渲染操作預覽
  const renderOperationPreview = () => {
    if (!previewData) return null

    const { operation, preview } = previewData

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-blue-900 mb-3">
          操作預覽: {operation?.name || '未知操作'}
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">將處理項目:</span>
            <span className="ml-2 font-medium">{preview.willProcess}</span>
          </div>
          <div>
            <span className="text-blue-700">預計時間:</span>
            <span className="ml-2 font-medium">{preview.estimatedTime} 秒</span>
          </div>
        </div>

        {preview.warnings.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded">
            <div className="text-sm text-yellow-800">
              <strong>警告:</strong>
              <ul className="mt-1 space-y-1">
                {preview.warnings.map((warning: string, index: number) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {preview.errors.length > 0 && (
          <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded">
            <div className="text-sm text-red-800">
              <strong>錯誤:</strong>
              <ul className="mt-1 space-y-1">
                {preview.errors.map((error: string, index: number) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <Button
            onClick={() => setPreviewData(null)}
            variant="secondary"
            size="sm"
          >
            關閉預覽
          </Button>
        </div>
      </div>
    )
  }

  // 渲染執行進度
  const renderProgress = () => {
    if (!progress) return null

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-blue-900 mb-3">執行進度</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">{progress.operation}</span>
            <span className="text-blue-600">
              {progress.current} / {progress.total}
            </span>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              progress.status === 'completed' ? 'bg-green-100 text-green-800' :
              progress.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {progress.status === 'completed' ? '已完成' :
               progress.status === 'failed' ? '失敗' : '執行中'}
            </span>
            
            {progress.status === 'processing' && (
              <ArrowPathIcon className="h-4 w-4 text-blue-600 animate-spin" />
            )}
          </div>
        </div>
      </div>
    )
  }

  // 渲染操作結果
  const renderOperationResults = () => {
    if (operationResults.length === 0) return null

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">操作結果</h4>
        
        {operationResults.map((result, index) => (
          <div key={index} className="border rounded-lg">
            <div className={`px-4 py-3 font-medium ${
              result.success ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
            }`}>
              {result.success ? (
                <CheckCircleIcon className="h-4 w-4 inline mr-2" />
              ) : (
                <XCircleIcon className="h-4 w-4 inline mr-2" />
              )}
              操作 {index + 1}: {result.summary}
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">處理項目:</span>
                  <span className="ml-2 font-medium">{result.processed}</span>
                </div>
                <div>
                  <span className="text-gray-600">成功:</span>
                  <span className="ml-2 font-medium text-green-600">{result.successful}</span>
                </div>
                <div>
                  <span className="text-gray-600">失敗:</span>
                  <span className="ml-2 font-medium text-red-600">{result.failed}</span>
                </div>
              </div>
              
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded">
                  <div className="text-sm text-red-800">
                    <strong>錯誤:</strong>
                    <ul className="mt-1 space-y-1">
                      {result.errors.map((error, errorIndex) => (
                        <li key={errorIndex}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 標題欄 */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <CogIcon className="h-5 w-5 mr-2 text-blue-600" />
          批量操作工具
        </h2>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            已選擇 {selectedOperations.length} 個操作
          </div>
          
          {!isExecuting ? (
            <Button
              onClick={handleExecuteOperations}
              disabled={selectedOperations.length === 0}
              variant="primary"
              size="sm"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              執行操作
            </Button>
          ) : (
            <Button
              onClick={handleStopExecution}
              variant="danger"
              size="sm"
            >
              <StopIcon className="h-4 w-4 mr-2" />
              停止執行
            </Button>
          )}
        </div>
      </div>

      {/* 內容區域 */}
      <div className="p-4">
        {/* 操作選擇控制 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-medium text-gray-900">選擇操作</h3>
            <div className="flex space-x-2">
              <Button
                onClick={handleSelectAllRecommended}
                variant="secondary"
                size="sm"
              >
                選擇推薦
              </Button>
              <Button
                onClick={handleClearSelection}
                variant="secondary"
                size="sm"
              >
                清除選擇
              </Button>
            </div>
          </div>
          
          {renderOperationsList()}
        </div>

        {/* 操作預覽 */}
        {renderOperationPreview()}

        {/* 執行進度 */}
        {renderProgress()}

        {/* 操作結果 */}
        {renderOperationResults()}

        {/* 使用說明 */}
        {!isExecuting && operationResults.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium">批量操作說明</p>
                <p className="mt-1">
                  選擇需要執行的操作，系統會自動檢測數據類型並推薦適合的操作。
                  執行前可以預覽操作結果，確保操作符合預期。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
