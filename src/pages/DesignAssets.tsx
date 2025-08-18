import React from 'react'
import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline'

// 設計資產模組介面
interface DesignModule {
  id: string
  name: string
  description: string
  assetCount: number
  lastUpdated: string
  status: 'active' | 'draft' | 'archived'
}

// 設計資產模組數據
const designModules: DesignModule[] = [
  {
    id: '1',
    name: '用戶管理模組',
    description: '用戶註冊、登入、權限管理等功能',
    assetCount: 15,
    lastUpdated: '2 小時前',
    status: 'active'
  },
  {
    id: '2',
    name: '訂單管理模組',
    description: '訂單創建、查詢、狀態管理等功能',
    assetCount: 12,
    lastUpdated: '4 小時前',
    status: 'active'
  },
  {
    id: '3',
    name: '產品管理模組',
    description: '產品目錄、庫存、分類管理等功能',
    assetCount: 8,
    lastUpdated: '1 天前',
    status: 'active'
  },
  {
    id: '4',
    name: '系統設定模組',
    description: '系統配置、參數設定、日誌管理等功能',
    assetCount: 6,
    lastUpdated: '3 天前',
    status: 'draft'
  }
]

// ErSlice 設計資產管理頁面
const DesignAssets: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 頁面標題和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            設計資產管理
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            管理前端模組的設計稿、切圖和資源檔案
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>新增模組</span>
        </button>
      </div>

      {/* 模組網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {designModules.map((module) => (
          <div key={module.id} className="card p-6 hover:shadow-md transition-shadow">
            {/* 模組標題和狀態 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FolderIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {module.name}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    module.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    module.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {module.status === 'active' ? '活躍' :
                     module.status === 'draft' ? '草稿' : '已封存'}
                  </span>
                </div>
              </div>
            </div>

            {/* 模組描述 */}
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {module.description}
            </p>

            {/* 模組統計 */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{module.assetCount} 個資產</span>
              <span>更新於 {module.lastUpdated}</span>
            </div>

            {/* 操作按鈕 */}
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 btn-primary text-sm py-2">
                管理資產
              </button>
              <button className="flex-1 btn-secondary text-sm py-2">
                預覽
              </button>
            </div>
          </div>
        ))}

        {/* 新增模組卡片 */}
        <div className="card p-6 border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
          <div className="text-center py-8">
            <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              新增設計模組
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              創建新的前端模組設計資產
            </p>
          </div>
        </div>
      </div>

      {/* 統計資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {designModules.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            總模組數
          </div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {designModules.filter(m => m.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            活躍模組
          </div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {designModules.reduce((sum, m) => sum + m.assetCount, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            總資產數
          </div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {Math.round((designModules.filter(m => m.status === 'active').length / designModules.length) * 100)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            完成率
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignAssets
