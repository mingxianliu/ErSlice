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

// 視覺切版工廠儀表板頁面 - 專案概覽和統計
const Dashboard: React.FC = () => {
  const store = useDesignModulesStore()
  const navigate = useNavigate()
  const { showError } = useToast()
  const [analytics, setAnalytics] = useState<SitemapAnalytics | null>(null)
  const [loading, setLoading] = useState(false)

  // 載入真實數據
  useEffect(() => {
    const loadData = async () => {
      try {
        // 初始化 store
        store.init()
      } catch (error) {
        console.warn('初始化失敗:', error)
      }
    }

    loadData()
  }, [])

  // 從真實數據計算統計 - 使用默認值避免錯誤
  const totalModules = store.modules?.length || 0
  const activeModules = store.modules?.filter(m => m.status === 'active')?.length || 0
  const totalAssets = store.modules?.reduce((sum, m) => sum + (m.asset_count ?? 0), 0) || 0
  const completionRate = totalModules ? Math.round((activeModules / totalModules) * 100) : 0

  const statCards: StatCard[] = [
    {
      title: '總模組數',
      value: totalModules,
      description: '專案中的設計模組總數',
      icon: FolderIcon,
      color: 'bg-blue-500'
    },
    {
      title: '活躍模組',
      value: activeModules,
      description: '目前活躍的設計模組',
      icon: DocumentTextIcon,
      color: 'bg-green-500'
    },
    {
      title: '總資產數',
      value: totalAssets,
      description: '所有模組的設計資產總和',
      icon: SparklesIcon,
      color: 'bg-purple-500'
    },
    {
      title: '完成率',
      value: `${completionRate}%`,
      description: '活躍模組佔總模組的比例',
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
          視覺切版工廠專案概覽與統計資訊
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
              <div className="ml-4 flex-1">
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

      {/* 專案資訊 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          專案資訊
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">設計模組總數</span>
            <span className="font-semibold text-gray-900 dark:text-white">{totalModules} 個</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">活躍模組數</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{activeModules} 個</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">設計資產總數</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">{totalAssets} 個</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">專案完成度</span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">{completionRate}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">系統狀態</span>
            <span className="text-green-600 dark:text-green-400">正常運行</span>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          快速操作
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/library/assets')}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center"
          >
            <FolderIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              設計資產管理
            </p>
          </button>
          <button 
            onClick={() => navigate('/library/templates')}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors text-center"
          >
            <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              模板庫
            </p>
          </button>
          <button 
            onClick={() => navigate('/projects')}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors text-center"
          >
            <SparklesIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              專案中心
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
