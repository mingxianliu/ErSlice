import React, { useState } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { FileValidationResult } from '@/services/fileValidationService'
import { AnalysisValidationResult } from '@/services/analysisValidationService'

interface ValidationResultPanelProps {
  fileValidationResults: Map<string, FileValidationResult>
  analysisValidationResult: AnalysisValidationResult | null
  onClose: () => void
}

const ValidationResultPanel: React.FC<ValidationResultPanelProps> = ({
  fileValidationResults,
  analysisValidationResult,
  onClose
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']))
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
      default:
        return <InformationCircleIcon className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200 dark:border-red-800'
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:border-yellow-800'
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:border-blue-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalFiles = fileValidationResults.size
  const validFiles = Array.from(fileValidationResults.values()).filter(r => r.isValid).length
  const invalidFiles = totalFiles - validFiles
  const totalErrors = Array.from(fileValidationResults.values()).reduce((sum, r) => sum + r.errors.length, 0)
  const totalWarnings = Array.from(fileValidationResults.values()).reduce((sum, r) => sum + r.warnings.length, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              驗證結果詳情
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* 摘要統計 */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('summary')}
              className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white mb-3"
            >
              {expandedSections.has('summary') ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
              <span>驗證摘要</span>
            </button>
            
            {expandedSections.has('summary') && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{validFiles}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">驗證通過</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{invalidFiles}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">驗證失敗</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totalErrors}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">錯誤總數</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalWarnings}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">警告總數</div>
                </div>
              </div>
            )}
          </div>

          {/* 檔案驗證結果 */}
          <div className="mb-6">
            <button
              onClick={() => toggleSection('files')}
              className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white mb-3"
            >
              {expandedSections.has('files') ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
              <span>檔案驗證結果 ({totalFiles})</span>
            </button>
            
            {expandedSections.has('files') && (
              <div className="space-y-3">
                {Array.from(fileValidationResults.entries()).map(([fileName, result]) => (
                  <div
                    key={fileName}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      result.isValid 
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    }`}
                    onClick={() => setSelectedFile(selectedFile === fileName ? null : fileName)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {result.isValid ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">{fileName}</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(result.metadata.size)}
                      </div>
                    </div>
                    
                    {selectedFile === fileName && (
                      <div className="mt-3 space-y-3">
                        {/* 檔案元資料 */}
                        <div className="bg-white dark:bg-gray-700 rounded p-3">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">檔案信息</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>類型: {result.metadata.type}</div>
                            <div>格式: {result.metadata.format}</div>
                            <div>大小: {formatFileSize(result.metadata.size)}</div>
                            <div>修改時間: {result.metadata.lastModified.toLocaleString()}</div>
                          </div>
                        </div>

                        {/* 錯誤列表 */}
                        {result.errors.length > 0 && (
                          <div className="bg-red-50 dark:bg-red-900/20 rounded p-3">
                            <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">驗證錯誤</h4>
                            <div className="space-y-2">
                              {result.errors.map((error, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  {getSeverityIcon(error.severity)}
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-red-900 dark:text-red-100">
                                      {error.message}
                                    </div>
                                    {error.suggestion && (
                                      <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                                        建議: {error.suggestion}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 警告列表 */}
                        {result.warnings.length > 0 && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-3">
                            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">驗證警告</h4>
                            <div className="space-y-2">
                              {result.warnings.map((warning, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                      {warning.message}
                                    </div>
                                    <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                      建議: {warning.suggestion}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 安全性掃描結果 */}
                        {result.security.threats.length > 0 && (
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-3">
                            <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">安全威脅</h4>
                            <div className="space-y-2">
                              {result.security.threats.map((threat, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <ExclamationTriangleIcon className="h-4 w-4 text-orange-500 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                      {threat.description}
                                    </div>
                                    <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                                      建議: {threat.recommendation}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 分析結果驗證 */}
          {analysisValidationResult && (
            <div className="mb-6">
              <button
                onClick={() => toggleSection('analysis')}
                className="flex items-center space-x-2 text-lg font-medium text-gray-900 dark:text-white mb-3"
              >
                {expandedSections.has('analysis') ? (
                  <ChevronDownIcon className="h-5 w-5" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5" />
                )}
                <span>分析結果驗證</span>
              </button>
              
              {expandedSections.has('analysis') && (
                <div className="space-y-4">
                  {/* 質量評分 */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">質量評分</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {analysisValidationResult.score}/100
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">總分</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {analysisValidationResult.quality.completeness}/100
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">完整性</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {analysisValidationResult.quality.accuracy}/100
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">準確性</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {analysisValidationResult.consistency.overallConsistency}/100
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">一致性</div>
                      </div>
                    </div>
                  </div>

                  {/* 驗證錯誤 */}
                  {analysisValidationResult.errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 dark:text-red-100 mb-3">驗證錯誤</h4>
                      <div className="space-y-2">
                        {analysisValidationResult.errors.map((error, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            {getSeverityIcon(error.severity)}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-red-900 dark:text-red-100">
                                {error.message}
                              </div>
                              <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                                建議: {error.suggestion}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 改進建議 */}
                  {analysisValidationResult.recommendations.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">改進建議</h4>
                      <div className="space-y-2">
                        {analysisValidationResult.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <InformationCircleIcon className="h-4 w-4 text-green-500 mt-0.5" />
                            <div className="text-sm text-green-900 dark:text-green-100">
                              {recommendation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end space-x-3">
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
  )
}

export default ValidationResultPanel
