import React, { useEffect, useState } from 'react'
import { XMarkIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { analyzeSitemap, SitemapAnalytics } from '../utils/tauriCommands.ts'
import { useToast } from './ui/Toast'

interface SitemapAnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SitemapAnalyticsModal: React.FC<SitemapAnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState<SitemapAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const { showError } = useToast()

  useEffect(() => {
    if (isOpen && !analytics) {
      loadAnalytics()
    }
  }, [isOpen])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const data = await analyzeSitemap()
      setAnalytics(data)
    } catch (error) {
      showError('分析站點圖失敗', error instanceof Error ? error.message : '未知錯誤')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">站點圖分析報告</h2>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            onClick={onClose}
            aria-label="關閉"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">正在分析站點圖結構...</p>
              </div>
            </div>
          ) : analytics ? (
            <div className="space-y-8">
              {/* Project Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">專案概覽</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analytics.total_modules}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">模組數量</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.total_pages}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">頁面數量</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analytics.total_subpages}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">子頁數量</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analytics.average_pages_per_module.toFixed(1)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">平均頁面/模組</div>
                  </div>
                </div>
              </div>

              {/* Structure Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">結構分析</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">最大深度</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{analytics.max_depth} 層</span>
                      </div>
                      {analytics.deepest_module && (
                        <div className="text-xs text-gray-500">最深模組: {analytics.deepest_module}</div>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">複雜結構模組</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{analytics.modules_with_deep_structure.length}</span>
                      </div>
                      {analytics.modules_with_deep_structure.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {analytics.modules_with_deep_structure.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">完成度指標</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">總完成度</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {analytics.coverage_metrics.completion_percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${analytics.coverage_metrics.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{analytics.coverage_metrics.pages_with_screenshots}</div>
                        <div className="text-xs text-gray-500">截圖</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">{analytics.coverage_metrics.pages_with_html}</div>
                        <div className="text-xs text-gray-500">HTML</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">{analytics.coverage_metrics.pages_with_css}</div>
                        <div className="text-xs text-gray-500">CSS</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">狀態分布</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(analytics.status_distribution).map(([status, count]) => (
                    <div key={status} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{count}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {status === 'active' ? '活躍' : 
                         status === 'draft' ? '草稿' : 
                         status === 'archived' ? '已封存' : 
                         status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orphaned Pages */}
              {analytics.orphaned_pages.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                    需要關注的頁面 ({analytics.orphaned_pages.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {analytics.orphaned_pages.map((page, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{page}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    這些頁面可能缺少必要的 meta 資訊或路由設定，建議檢查修正。
                  </div>
                </div>
              )}

              {/* Module Completion Details */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">模組完成度詳情</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {Object.entries(analytics.coverage_metrics.modules_completion)
                    .sort(([,a], [,b]) => b.completion_rate - a.completion_rate)
                    .map(([moduleName, completion]) => (
                    <div key={moduleName} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{moduleName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {completion.pages_with_assets} / {completion.total_pages} 頁面有資產
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${completion.completion_rate}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[3rem] text-right">
                          {completion.completion_rate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">無法載入分析數據</p>
              <button 
                className="group relative px-4 py-2 text-sm font-medium rounded-lg border border-blue-400 dark:border-blue-500 bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-200 shadow-md hover:shadow-lg mt-4" 
                onClick={loadAnalytics}
              >
                重新分析
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button className="group relative px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-500 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 text-gray-600 dark:text-gray-200 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-500 dark:hover:to-gray-600 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md" onClick={onClose}>關閉</button>
          {analytics && (
            <button 
              className="group relative px-4 py-2 text-sm font-medium rounded-lg border border-blue-400 dark:border-blue-500 bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-200 shadow-md hover:shadow-md" 
              onClick={loadAnalytics}
              disabled={loading}
            >
              重新分析
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SitemapAnalyticsModal