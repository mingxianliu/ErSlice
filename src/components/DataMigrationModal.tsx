import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Button } from './ui/Button'
import { 
  checkMigrationNeeded, 
  startDataMigration, 
  validateAllData,
  MigrationStatus,
  MigrationResult,
  ValidationResult
} from '../services/dataMigration'

interface DataMigrationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DataMigrationModal({ isOpen, onClose }: DataMigrationModalProps) {
  const [step, setStep] = useState<'check' | 'validate' | 'migrate' | 'complete'>('check')
  const [, setMigrationNeeded] = useState(false)
  const [localDataCount, setLocalDataCount] = useState({ modules: 0, templates: 0, specs: 0 })
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 檢查遷移需求
  useEffect(() => {
    if (isOpen && step === 'check') {
      checkMigrationNeeded().then(result => {
        setMigrationNeeded(result.hasLocalData)
        setLocalDataCount(result.localDataCount)
        if (result.hasLocalData) {
          setStep('validate')
        }
      }).catch(err => {
        setError('檢查遷移需求失敗: ' + err.message)
      })
    }
  }, [isOpen, step])

  // 驗證數據
  const handleValidateData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // 獲取本地數據進行驗證
      const localModules = JSON.parse(localStorage.getItem('erslice-design-modules') || '[]')
      const localTemplates = JSON.parse(localStorage.getItem('erslice-templates') || '[]')
      const localSpecs = JSON.parse(localStorage.getItem('erslice-ai-specs') || '[]')
      
      const validation = validateAllData({
        modules: localModules,
        templates: localTemplates,
        specs: localSpecs
      }) as any
      
      // 確保驗證結果包含所有必需字段
      const completeValidation: ValidationResult = {
        valid: validation?.valid || false,
        errors: validation?.errors || [],
        warnings: validation?.warnings || [],
        modules: validation?.modules,
        templates: validation?.templates,
        specs: validation?.specs,
        summary: {
          total: (validation?.modules?.valid?.length || 0) + (validation?.modules?.invalid?.length || 0) + 
                 (validation?.templates?.valid?.length || 0) + (validation?.templates?.invalid?.length || 0) +
                 (validation?.specs?.valid?.length || 0) + (validation?.specs?.invalid?.length || 0),
          totalModules: (validation?.modules?.valid?.length || 0) + (validation?.modules?.invalid?.length || 0),
          totalTemplates: (validation?.templates?.valid?.length || 0) + (validation?.templates?.invalid?.length || 0),
          totalSpecs: (validation?.specs?.valid?.length || 0) + (validation?.specs?.invalid?.length || 0),
          valid: (validation?.modules?.valid?.length || 0) + (validation?.templates?.valid?.length || 0) + (validation?.specs?.valid?.length || 0),
          validCount: (validation?.modules?.valid?.length || 0) + (validation?.templates?.valid?.length || 0) + (validation?.specs?.valid?.length || 0),
          invalid: (validation?.modules?.invalid?.length || 0) + (validation?.templates?.invalid?.length || 0) + (validation?.specs?.invalid?.length || 0),
          invalidCount: (validation?.modules?.invalid?.length || 0) + (validation?.templates?.invalid?.length || 0) + (validation?.specs?.invalid?.length || 0),
          criticalErrors: validation?.errors?.filter((e: any) => e.severity === 'critical')?.length || 0
        }
      }
      
      setValidationResult(completeValidation)
      setStep('migrate')
    } catch (err) {
      setError('數據驗證失敗: ' + (err instanceof Error ? err.message : '未知錯誤'))
    } finally {
      setIsLoading(false)
    }
  }

  // 開始遷移
  const handleStartMigration = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await startDataMigration((status) => {
        setMigrationStatus(status)
      })
      
      setMigrationResult(result)
      setStep('complete')
    } catch (err) {
      setError('數據遷移失敗: ' + (err instanceof Error ? err.message : '未知錯誤'))
    } finally {
      setIsLoading(false)
    }
  }

  // 重置模態框
  const handleReset = () => {
    setStep('check')
    setMigrationNeeded(false)
    setLocalDataCount({ modules: 0, templates: 0, specs: 0 })
    setValidationResult(null)
    setMigrationStatus(null)
    setMigrationResult(null)
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            數據遷移工具
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="關閉數據遷移工具"
            title="關閉"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-6">
          {step === 'check' && (
            <div className="text-center">
              <ArrowPathIcon className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                檢查遷移需求
              </h3>
              <p className="text-gray-600">
                正在檢查是否有需要遷移的本地數據...
              </p>
            </div>
          )}

          {step === 'validate' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  發現本地數據
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{localDataCount.modules}</div>
                    <div className="text-sm text-blue-600">設計模組</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{localDataCount.templates}</div>
                    <div className="text-sm text-green-600">模板</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{localDataCount.specs}</div>
                    <div className="text-sm text-purple-600">AI 規格</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">遷移說明</p>
                    <p className="mt-1">
                      系統將把您的本地數據遷移到 SQLite 數據庫中，以提供更好的數據持久化和性能。
                      遷移過程中會進行數據驗證，確保數據完整性。
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={onClose}>
                  取消
                </Button>
                <Button onClick={handleValidateData} disabled={isLoading}>
                  {isLoading ? '驗證中...' : '開始驗證'}
                </Button>
              </div>
            </div>
          )}

          {step === 'migrate' && validationResult && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  數據驗證結果
                </h3>
                
                {/* 驗證摘要 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {validationResult.summary?.total || 0}
                      </div>
                      <div className="text-sm text-gray-600">總數</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        {validationResult.summary?.valid || 0}
                      </div>
                      <div className="text-sm text-gray-600">有效</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-red-600">
                        {validationResult.summary?.invalid || 0}
                      </div>
                      <div className="text-sm text-gray-600">無效</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-orange-600">
                        {validationResult.summary?.criticalErrors || 0}
                      </div>
                      <div className="text-sm text-gray-600">嚴重錯誤</div>
                    </div>
                  </div>
                </div>

                {/* 詳細驗證結果 */}
                {(validationResult.summary?.invalid || 0) > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-red-800 mb-2">發現驗證問題</h4>
                    <div className="space-y-2 text-sm text-red-700">
                      {(validationResult.modules?.invalid?.length || 0) > 0 && (
                        <div>
                          <strong>設計模組:</strong> {validationResult.modules?.invalid?.length || 0} 個問題
                        </div>
                      )}
                      {(validationResult.templates?.invalid?.length || 0) > 0 && (
                        <div>
                          <strong>模板:</strong> {validationResult.templates?.invalid?.length || 0} 個問題
                        </div>
                      )}
                      {(validationResult.specs?.invalid?.length || 0) > 0 && (
                        <div>
                          <strong>AI 規格:</strong> {validationResult.specs?.invalid?.length || 0} 個問題
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(validationResult.summary?.criticalErrors || 0) > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-sm text-orange-800">
                        <p className="font-medium">嚴重錯誤警告</p>
                        <p className="mt-1">
                          發現 {validationResult.summary?.criticalErrors || 0} 個嚴重錯誤，這些數據將無法遷移。
                          建議先修復這些問題再進行遷移。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => setStep('validate')}>
                  返回
                </Button>
                <Button 
                  onClick={handleStartMigration} 
                  disabled={isLoading || validationResult.summary.criticalErrors > 0}
                  variant={validationResult.summary.criticalErrors > 0 ? 'secondary' : 'primary'}
                  title={validationResult.summary.criticalErrors > 0 ? '請先修復嚴重錯誤' : '開始數據遷移'}
                >
                  {isLoading ? '遷移中...' : '開始遷移'}
                </Button>
              </div>
            </div>
          )}

          {step === 'migrate' && migrationStatus && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                遷移進度
              </h3>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">
                    {migrationStatus.current}
                  </span>
                  <span className="text-sm text-blue-600">
                    {migrationStatus.completed} / {migrationStatus.total}
                  </span>
                </div>
                
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(migrationStatus.completed / migrationStatus.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              {migrationStatus.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">遷移錯誤</h4>
                  <div className="space-y-1 text-sm text-red-700">
                    {migrationStatus.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>{error}</span>
                      </div>
                    ))}
                    {migrationStatus.errors.length > 5 && (
                      <div className="text-red-600 text-sm">
                        還有 {migrationStatus.errors.length - 5} 個錯誤...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'complete' && migrationResult && (
            <div>
              <div className="text-center mb-6">
                {migrationResult.success ? (
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <ExclamationTriangleIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                )}
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {migrationResult.success ? '遷移完成' : '遷移部分完成'}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {migrationResult.message}
                </p>

                {migrationResult.details && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {migrationResult.details.modules}
                      </div>
                      <div className="text-sm text-green-600">模組</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {migrationResult.details.templates}
                      </div>
                      <div className="text-sm text-green-600">模板</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {migrationResult.details.specs}
                      </div>
                      <div className="text-sm text-green-600">規格</div>
                    </div>
                  </div>
                )}

                {migrationResult.status.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-red-800 mb-2">遷移失敗的項目</h4>
                    <div className="space-y-1 text-sm text-red-700 max-h-32 overflow-y-auto">
                      {migrationResult.status.errors.map((error, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={handleReset}>
                  重新開始
                </Button>
                <Button onClick={onClose}>
                  完成
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">錯誤</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
