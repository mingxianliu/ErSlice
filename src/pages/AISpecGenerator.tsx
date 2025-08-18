import React from 'react'
import { SparklesIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline'

// AI 規格類型介面
interface AISpecType {
  id: string
  name: string
  description: string
  category: string
  complexity: 'simple' | 'medium' | 'complex'
  estimatedTime: string
}

// AI 規格類型數據
const aiSpecTypes: AISpecType[] = [
  {
    id: '1',
    name: '基礎切版說明',
    description: '包含佈局、組件、樣式的基本切版指南',
    category: '基礎規格',
    complexity: 'simple',
    estimatedTime: '1-2 小時'
  },
  {
    id: '2',
    name: '互動邏輯說明',
    description: '包含事件處理、狀態管理、用戶互動的詳細說明',
    category: '互動規格',
    complexity: 'medium',
    estimatedTime: '2-3 小時'
  },
  {
    id: '3',
    name: '響應式設計說明',
    description: '包含斷點、適配、移動端優化的響應式指南',
    category: '響應式規格',
    complexity: 'medium',
    estimatedTime: '2-3 小時'
  },
  {
    id: '4',
    name: '完整開發指南',
    description: '包含所有切版細節、最佳實踐、注意事項的完整指南',
    category: '完整規格',
    complexity: 'complex',
    estimatedTime: '4-5 小時'
  }
]

// ErSlice AI 規格生成器頁面
const AISpecGenerator: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 頁面標題和說明 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI 規格生成器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          生成 AI 可依循的詳細前端切版說明和開發指南
        </p>
      </div>

      {/* 生成選項 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側：規格類型選擇 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            選擇規格類型
          </h2>
          <div className="space-y-3">
            {aiSpecTypes.map((spec) => (
              <div key={spec.id} className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {spec.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {spec.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {spec.category}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        spec.complexity === 'simple' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        spec.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {spec.complexity === 'simple' ? '簡單' :
                         spec.complexity === 'medium' ? '中等' : '複雜'}
                      </span>
                      <span>預計時間: {spec.estimatedTime}</span>
                    </div>
                  </div>
                  <button className="btn-primary text-sm px-3 py-1">
                    選擇
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側：生成配置 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            生成配置
          </h2>
          
          {/* 設計資產選擇 */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              選擇設計資產
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input type="radio" name="asset" id="asset1" className="text-blue-600" />
                <label htmlFor="asset1" className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">用戶管理模組</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">包含 15 個設計資產</div>
                </label>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input type="radio" name="asset" id="asset2" className="text-blue-600" />
                <label htmlFor="asset2" className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">訂單管理模組</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">包含 12 個設計資產</div>
                </label>
              </div>
            </div>
          </div>

          {/* 輸出選項 */}
          <div className="card p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              輸出選項
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="text-blue-600 rounded" defaultChecked />
                <span className="text-gray-900 dark:text-white">生成 Markdown 說明</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="text-blue-600 rounded" defaultChecked />
                <span className="text-gray-900 dark:text-white">包含程式碼片段</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="text-blue-600 rounded" defaultChecked />
                <span className="text-gray-900 dark:text-white">包含最佳實踐建議</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="text-blue-600 rounded" />
                <span className="text-gray-900 dark:text-white">生成測試案例</span>
              </label>
            </div>
          </div>

          {/* 生成按鈕 */}
          <button className="w-full btn-primary py-3 text-lg">
            <SparklesIcon className="h-5 w-5 inline mr-2" />
            生成 AI 規格
          </button>
        </div>
      </div>

      {/* 最近生成的 AI 規格 */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            最近生成的 AI 規格
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">用戶列表切版說明</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                包含佈局、組件、樣式的完整切版指南
              </p>
              <div className="flex space-x-2">
                <button className="btn-secondary text-sm px-3 py-1">
                  <EyeIcon className="h-4 w-4 inline mr-1" />
                  預覽
                </button>
                <button className="btn-primary text-sm px-3 py-1">
                  下載
                </button>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <DocumentTextIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">訂單表單互動說明</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                包含事件處理、驗證邏輯的互動指南
              </p>
              <div className="flex space-x-2">
                <button className="btn-secondary text-sm px-3 py-1">
                  <EyeIcon className="h-4 w-4 inline mr-1" />
                  預覽
                </button>
                <button className="btn-primary text-sm px-3 py-1">
                  下載
                </button>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">響應式設計指南</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                包含斷點、適配的響應式設計說明
              </p>
              <div className="flex space-x-2">
                <button className="btn-secondary text-sm px-3 py-1">
                  <EyeIcon className="h-4 w-4 inline mr-1" />
                  預覽
                </button>
                <button className="btn-primary text-sm px-3 py-1">
                  下載
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 切版說明範例 */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI 切版說明範例
          </h2>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              用戶列表頁面切版說明
            </h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>佈局結構：</strong>使用 Flexbox 佈局，頂部搜尋區域，中間操作按鈕，底部數據表格</p>
              <p><strong>組件構成：</strong>搜尋輸入框、篩選下拉選單、新增按鈕、數據表格、分頁組件</p>
              <p><strong>響應式設計：</strong>桌面版 3 列佈局，平板版 2 列，手機版 1 列</p>
              <p><strong>互動邏輯：</strong>搜尋即時過濾、篩選條件組合、表格排序、分頁導航</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISpecGenerator
