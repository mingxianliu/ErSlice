import React, { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { Button } from './ui/Button'
import { 
  validateAllData,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '../services/dataMigration'
import { DesignModule } from '../stores/designModules'
import { Template } from '../types/templates'
import { AISpec } from '../types/aiSpec'

interface DataValidationPanelProps {
  onValidationComplete?: (result: ValidationResult) => void
  className?: string
}

export default function DataValidationPanel({ onValidationComplete, className = '' }: DataValidationPanelProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [expandedSections, setExpandedSections] = useState<{
    modules: boolean
    templates: boolean
    specs: boolean
  }>({
    modules: false,
    templates: false,
    specs: false
  })

  // 執行數據驗證
  const runValidation = async () => {
    setIsValidating(true)
    
    try {
      // 獲取本地數據
      const localModules = JSON.parse(localStorage.getItem('erslice-design-modules') || '[]')
      const localTemplates = JSON.parse(localStorage.getItem('erslice-templates') || '[]')
      const localSpecs = JSON.parse(localStorage.getItem('erslice-ai-specs') || '[]')
      
      const result = validateAllData({
        modules: localModules,
        templates: localTemplates,
        specs: localSpecs
      })
      
      setValidationResult(result)
      onValidationComplete?.(result)
    } catch (error) {
      console.error('數據驗證失敗:', error)
    } finally {
      setIsValidating(false)
    }
  }

  // 切換展開狀態
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // 渲染驗證錯誤
  const renderValidationErrors = (errors: ValidationError[], title: string) => {
    if (errors.length === 0) return null

    const criticalErrors = errors.filter(e => e.severity === 'critical')
    const normalErrors = errors.filter(e => e.severity === 'error')

    return (
      <div className="space-y-3">
        {criticalErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="font-medium text-red-800 mb-2 flex items-center">
              <XCircleIcon className="h-4 w-4 mr-2" />
              嚴重錯誤 ({criticalErrors.length})
            </h4>
            <div className="space-y-2 text-sm text-red-700">
              {criticalErrors.map((error, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <div>
                    <span className="font-medium">{error.field}:</span> {error.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {normalErrors.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h4 className="font-medium text-orange-800 mb-2 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
              一般錯誤 ({normalErrors.length})
            </h4>
            <div className="space-y-2 text-sm text-orange-700">
              {normalErrors.map((error, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <div>
                    <span className="font-medium">{error.field}:</span> {error.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 渲染驗證警告
  const renderValidationWarnings = (warnings: ValidationWarning[], title: string) => {
    if (warnings.length === 0) return null

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
          <InformationCircleIcon className="h-4 w-4 mr-2" />
          警告 ({warnings.length})
        </h4>
        <div className="space-y-2 text-sm text-yellow-700">
          {warnings.map((warning, index) => (
            <div key={index} className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              <div>
                <span className="font-medium">{warning.field}:</span> {warning.message}
                {warning.suggestion && (
                  <div className="text-yellow-600 mt-1 italic">
                    建議: {warning.suggestion}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 渲染驗證摘要
  const renderValidationSummary = () => {
    if (!validationResult) return null

    const { summary } = validationResult
    const hasErrors = summary.invalid > 0
    const hasCriticalErrors = summary.criticalErrors > 0

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">驗證摘要</h3>
        
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            <div className="text-sm text-gray-600">總數</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{summary.valid}</div>
            <div className="text-sm text-green-600">有效</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{summary.invalid}</div>
            <div className="text-sm text-red-600">無效</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{summary.criticalErrors}</div>
            <div className="text-sm text-orange-600">嚴重錯誤</div>
          </div>
        </div>

        {/* 狀態指示器 */}
        <div className="mt-4 text-center">
          {!hasErrors ? (
            <div className="inline-flex items-center text-green-600">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">所有數據驗證通過</span>
            </div>
          ) : hasCriticalErrors ? (
            <div className="inline-flex items-center text-red-600">
              <XCircleIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">發現嚴重錯誤，需要修復</span>
            </div>
          ) : (
            <div className="inline-flex items-center text-orange-600">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">發現一般錯誤，建議修復</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 標題欄 */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">數據驗證</h2>
        <Button
          onClick={runValidation}
          disabled={isValidating}
          size="sm"
          variant="primary"
        >
          {isValidating ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              驗證中...
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              執行驗證
            </>
          )}
        </Button>
      </div>

      {/* 內容區域 */}
      <div className="p-4">
        {!validationResult ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>點擊「執行驗證」開始檢查數據完整性</p>
          </div>
        ) : (
          <div>
            {/* 驗證摘要 */}
            {renderValidationSummary()}

            {/* 詳細驗證結果 */}
            <div className="space-y-4">
              {/* 設計模組驗證結果 */}
              {validationResult.modules.invalid.length > 0 && (
                <div className="border rounded-lg">
                  <button
                    onClick={() => toggleSection('modules')}
                    className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">
                      設計模組問題 ({validationResult.modules.invalid.length})
                    </span>
                    <span className="text-gray-500">
                      {expandedSections.modules ? '收起' : '展開'}
                    </span>
                  </button>
                  
                  {expandedSections.modules && (
                    <div className="p-4 border-t">
                      {renderValidationErrors(
                        validationResult.modules.invalid.flatMap(item => item.errors),
                        '設計模組'
                      )}
                      {renderValidationWarnings(
                        validationResult.modules.invalid.flatMap(item => item.warnings || []),
                        '設計模組'
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 模板驗證結果 */}
              {validationResult.templates.invalid.length > 0 && (
                <div className="border rounded-lg">
                  <button
                    onClick={() => toggleSection('templates')}
                    className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">
                      模板問題 ({validationResult.templates.invalid.length})
                    </span>
                    <span className="text-gray-500">
                      {expandedSections.templates ? '收起' : '展開'}
                    </span>
                  </button>
                  
                  {expandedSections.templates && (
                    <div className="p-4 border-t">
                      {renderValidationErrors(
                        validationResult.templates.invalid.flatMap(item => item.errors),
                        '模板'
                      )}
                      {renderValidationWarnings(
                        validationResult.templates.invalid.flatMap(item => item.warnings || []),
                        '模板'
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* AI 規格驗證結果 */}
              {validationResult.specs.invalid.length > 0 && (
                <div className="border rounded-lg">
                  <button
                    onClick={() => toggleSection('specs')}
                    className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">
                      AI 規格問題 ({validationResult.specs.invalid.length})
                    </span>
                    <span className="text-gray-500">
                      {expandedSections.specs ? '收起' : '展開'}
                    </span>
                  </button>
                  
                  {expandedSections.specs && (
                    <div className="p-4 border-t">
                      {renderValidationErrors(
                        validationResult.specs.invalid.flatMap(item => item.errors),
                        'AI 規格'
                      )}
                      {renderValidationWarnings(
                        validationResult.specs.invalid.flatMap(item => item.warnings || []),
                        'AI 規格'
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 沒有問題時的提示 */}
              {validationResult.summary.invalid === 0 && (
                <div className="text-center py-8 text-green-600">
                  <CheckCircleIcon className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-medium">恭喜！所有數據都通過了驗證</p>
                  <p className="text-sm text-green-500 mt-1">
                    您的數據可以安全地遷移到數據庫
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
