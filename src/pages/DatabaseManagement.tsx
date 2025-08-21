import React, { useState, useEffect } from 'react'
import { 
  DatabaseIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { Button } from '../components/ui/Button'
import DataMigrationModal from '../components/DataMigrationModal'
import DataValidationPanel from '../components/DataValidationPanel'
import DataRepairPanel from '../components/DataRepairPanel'
import BatchOperationsPanel from '../components/BatchOperationsPanel'
import { useDesignModulesStore } from '../stores/designModules'
import { getTemplatesFromDB, getAISpecsFromDB } from '../services/database'
import { 
  getDatabaseStats, 
  backupDatabase, 
  restoreDatabase,
  checkDatabaseConnection,
  DatabaseStats
} from '../services/database'
import { checkMigrationNeeded } from '../services/dataMigration'

export default function DatabaseManagement() {
  // 從 store 取得模組資料（Tauri/瀏覽器自動切換）
  const { modules, init } = useDesignModulesStore()
  const [showMigrationModal, setShowMigrationModal] = useState(false)
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    database_path: string
  } | null>(null)
  const [migrationNeeded, setMigrationNeeded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 檢查數據庫狀態
  useEffect(() => {
    // 初始化設計模組資料
    init()
    checkDatabaseStatus()
    checkMigrationStatus()
  }, [])

  // 承載模板與 AI 規格（從 DB）
  const [templates, setTemplates] = useState<any[]>([])
  const [specs, setSpecs] = useState<any[]>([])
  useEffect(() => {
    ;(async () => {
      const t = await getTemplatesFromDB()
      const s = await getAISpecsFromDB()
      if (t.success && t.data) setTemplates(t.data)
      if (s.success && s.data) setSpecs(s.data)
    })()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      const [statsResult, connectionResult] = await Promise.all([
        getDatabaseStats(),
        checkDatabaseConnection()
      ])

      if (statsResult.success && statsResult.data) {
        setDbStats(statsResult.data)
      }

      if (connectionResult.success && connectionResult.data) {
        setConnectionStatus(connectionResult.data)
      }
    } catch (err) {
      setError('檢查數據庫狀態失敗: ' + (err instanceof Error ? err.message : '未知錯誤'))
    }
  }

  const checkMigrationStatus = async () => {
    try {
      const result = await checkMigrationNeeded()
      setMigrationNeeded(result.hasLocalData)
    } catch (err) {
      console.error('檢查遷移狀態失敗:', err)
    }
  }

  // 備份數據庫
  const handleBackup = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await backupDatabase()
      if (result.success) {
        setSuccess(result.message)
        // 重新檢查狀態
        await checkDatabaseStatus()
      } else {
        setError(result.error || '備份失敗')
      }
    } catch (err) {
      setError('備份數據庫失敗: ' + (err instanceof Error ? err.message : '未知錯誤'))
    } finally {
      setIsLoading(false)
    }
  }

  // 恢復數據庫
  const handleRestore = async () => {
    // 這裡可以實現文件選擇器來選擇備份文件
    // 暫時使用提示
    setError('恢復功能需要選擇備份文件，請使用 Tauri 的文件選擇器')
  }

  // 重新整理
  const handleRefresh = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await checkDatabaseStatus()
      await checkMigrationStatus()
      setSuccess('數據庫狀態已更新')
    } catch (err) {
      setError('重新整理失敗: ' + (err instanceof Error ? err.message : '未知錯誤'))
    } finally {
      setIsLoading(false)
    }
  }

  // 清除消息
  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <DatabaseIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">數據庫管理</h1>
                <p className="text-gray-600">管理 SQLite 數據庫、數據遷移和驗證</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 消息提示 */}
        {(error || success) && (
          <div className="mb-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <button
                  onClick={clearMessages}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  aria-label="關閉錯誤消息"
                >
                  ×
                </button>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
                <button
                  onClick={clearMessages}
                  className="text-green-400 hover:text-green-600 transition-colors"
                  aria-label="關閉成功消息"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：數據庫狀態和操作 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 數據庫狀態卡片 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DatabaseIcon className="h-5 w-5 mr-2 text-blue-600" />
                數據庫狀態
              </h3>

              {connectionStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">連接狀態</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      connectionStatus.connected 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {connectionStatus.connected ? '已連接' : '未連接'}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">數據庫路徑:</span>
                    <p className="text-gray-900 font-mono text-xs mt-1 break-all">
                      {connectionStatus.database_path}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <ArrowPathIcon className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>檢查連接狀態中...</p>
                </div>
              )}
            </div>

            {/* 數據庫操作 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">數據庫操作</h3>
              
              <div className="space-y-3">
                <Button
                  onClick={handleBackup}
                  disabled={isLoading}
                  variant="primary"
                  className="w-full"
                >
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  {isLoading ? '備份中...' : '備份數據庫'}
                </Button>

                <Button
                  onClick={handleRestore}
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full"
                >
                  <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                  恢復數據庫
                </Button>

                <Button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  重新整理
                </Button>
              </div>
            </div>

            {/* 數據遷移提示 */}
            {migrationNeeded && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">發現本地數據</p>
                    <p className="mt-1">
                      檢測到 localStorage 中有數據，建議遷移到數據庫以獲得更好的性能和持久化。
                    </p>
                    <Button
                      onClick={() => setShowMigrationModal(true)}
                      variant="primary"
                      size="sm"
                      className="mt-3"
                    >
                      開始遷移
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右側：統計、驗證、修復、批量操作 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 數據庫統計 */}
            {dbStats && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                  數據庫統計
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{dbStats.design_modules}</div>
                    <div className="text-sm text-blue-600">設計模組</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{dbStats.pages}</div>
                    <div className="text-sm text-green-600">頁面</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{dbStats.templates}</div>
                    <div className="text-sm text-purple-600">模板</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{dbStats.ai_specs}</div>
                    <div className="text-sm text-orange-600">AI 規格</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">子頁面:</span>
                      <span className="ml-2 font-medium">{dbStats.subpages}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">資產:</span>
                      <span className="ml-2 font-medium">{dbStats.assets}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">最後更新:</span>
                      <span className="ml-2 font-medium">
                        {new Date(dbStats.last_updated).toLocaleString('zh-TW')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 數據驗證面板 */}
            <DataValidationPanel 
              onValidationComplete={(result) => {
                console.log('驗證完成:', result)
              }}
            />

            {/* 數據修復面板 */}
            <DataRepairPanel
              data={{
                modules: modules || [],
                templates: templates as any[],
                specs: specs as any[]
              }}
              onRepairComplete={(result) => {
                console.log('修復完成:', result)
              }}
            />

            {/* 批量操作面板 */}
            <BatchOperationsPanel
              data={{
                modules: modules || [],
                templates: templates as any[],
                specs: specs as any[]
              }}
              onOperationComplete={(result) => {
                console.log('批量操作完成:', result)
              }}
            />
          </div>
        </div>
      </div>

      {/* 數據遷移模態框 */}
      <DataMigrationModal
        isOpen={showMigrationModal}
        onClose={() => {
          setShowMigrationModal(false)
          // 遷移完成後重新檢查狀態
          checkMigrationStatus()
          checkDatabaseStatus()
        }}
      />
    </div>
  )
}
