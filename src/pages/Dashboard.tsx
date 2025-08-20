import React, { useEffect, useState } from 'react'
import { 
  FolderIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useDesignModulesStore } from '../stores/designModules'
import { useToast } from '../components/ui/Toast'
import { useNavigate } from 'react-router-dom'
import { analyzeSitemap, SitemapAnalytics } from '../utils/tauriCommands'

// 統計卡片介面
interface StatCard {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

// ErSlice 儀表板頁面 - 專案概覽和統計
const Dashboard: React.FC = () => {
  const store = useDesignModulesStore()
  const navigate = useNavigate()
  const { showError } = useToast()
  const [analytics, setAnalytics] = useState<SitemapAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  // 載入真實數據
  useEffect(() => {
    const loadData = async () => {
      if (!store.tauriAvailable) return
      
      try {
        // 載入設計模組數據
        await store.refreshModules()
        
        // 載入站點圖分析數據
        const analyticsData = await analyzeSitemap()
        setAnalytics(analyticsData)
      } catch (error) {
        showError('載入數據失敗', error instanceof Error ? error.message : '未知錯誤')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [store.tauriAvailable])

  // 從真實數據計算統計
  const stats = {
    modules: store.modules.length,
    pages: analytics?.total_pages || 0,
    subpages: analytics?.total_subpages || 0,
    completion: analytics?.coverage_metrics.completion_percentage || 0
  }

  const statCards: StatCard[] = [
    {
      title: '設計模組',
      value: stats.modules,
      description: '已管理的設計模組',
      icon: FolderIcon,
      color: 'bg-blue-500'
    },
    {
      title: '頁面數量',
      value: stats.pages,
      description: '專案中的頁面總數',
      icon: DocumentTextIcon,
      color: 'bg-green-500'
    },
    {
      title: '子頁面',
      value: stats.subpages,
      description: '包含的子頁面數量',
      icon: SparklesIcon,
      color: 'bg-purple-500'
    },
    {
      title: '完成度',
      value: `${stats.completion.toFixed(1)}%`,
      description: '專案整體完成進度',
      icon: ChartBarIcon,
      color: 'bg-orange-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 min-h-full bg-gray-50 dark:bg-gray-900">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          專案儀表板
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          ErSlice 前端切版說明包生成器專案概覽
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* 模組完成度詳情 */}
      {analytics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              模組完成度
            </h2>
          </div>
          <div className="p-6">
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
      )}

      {/* 快速操作 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          快速操作
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/design-assets')}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center"
          >
            <FolderIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              管理設計資產
            </p>
          </button>
          <button 
            onClick={() => navigate('/template-generator')}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors text-center"
          >
            <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              生成模板
            </p>
          </button>
          <button 
            onClick={() => navigate('/ai-spec-generator')}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors text-center"
          >
            <SparklesIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              生成 AI 規格
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
