import React from 'react'
import { 
  FolderIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

// 統計卡片介面
interface StatCard {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

// 統計卡片數據
const statCards: StatCard[] = [
  {
    title: '設計資產',
    value: 12,
    description: '已管理的設計模組',
    icon: FolderIcon,
    color: 'bg-blue-500'
  },
  {
    title: '生成模板',
    value: 8,
    description: '已生成的 HTML/CSS 模板',
    icon: DocumentTextIcon,
    color: 'bg-green-500'
  },
  {
    title: 'AI 規格',
    value: 5,
    description: '已生成的切版說明',
    icon: SparklesIcon,
    color: 'bg-purple-500'
  },
  {
    title: '完成率',
    value: '85%',
    description: '專案完成進度',
    icon: ChartBarIcon,
    color: 'bg-orange-500'
  }
]

// 最近活動介面
interface RecentActivity {
  id: string
  action: string
  module: string
  timestamp: string
  status: 'success' | 'warning' | 'error'
}

// 最近活動數據
const recentActivities: RecentActivity[] = [
  {
    id: '1',
    action: '新增設計資產',
    module: '用戶管理模組',
    timestamp: '2 小時前',
    status: 'success'
  },
  {
    id: '2',
    action: '生成 HTML 模板',
    module: '訂單管理模組',
    timestamp: '4 小時前',
    status: 'success'
  },
  {
    id: '3',
    action: '更新 CSS 樣式',
    module: '產品管理模組',
    timestamp: '6 小時前',
    status: 'warning'
  },
  {
    id: '4',
    action: '生成 AI 切版說明',
    module: '系統設定模組',
    timestamp: '1 天前',
    status: 'success'
  }
]

// ErSlice 儀表板頁面 - 專案概覽和統計
const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          儀表板
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          歡迎使用 ErSlice 前端切版說明包生成器
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

      {/* 最近活動 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            最近活動
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.module}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          快速操作
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-center">
            <FolderIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              新增設計資產
            </p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors text-center">
            <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              生成模板
            </p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors text-center">
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
