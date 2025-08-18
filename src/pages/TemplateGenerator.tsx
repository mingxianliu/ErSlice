import React from 'react'
import { DocumentTextIcon, CodeBracketIcon, EyeIcon } from '@heroicons/react/24/outline'

// 模板類型介面
interface TemplateType {
  id: string
  name: string
  description: string
  category: string
  complexity: 'simple' | 'medium' | 'complex'
  estimatedTime: string
}

// 模板類型數據
const templateTypes: TemplateType[] = [
  {
    id: '1',
    name: '列表頁面模板',
    description: '包含搜尋、篩選、分頁的數據列表頁面',
    category: '數據展示',
    complexity: 'medium',
    estimatedTime: '2-3 小時'
  },
  {
    id: '2',
    name: '表單頁面模板',
    description: '包含驗證、提交、錯誤處理的表單頁面',
    category: '數據輸入',
    complexity: 'medium',
    estimatedTime: '3-4 小時'
  },
  {
    id: '3',
    name: '詳情頁面模板',
    description: '包含標籤頁、相關資訊、操作按鈕的詳情頁面',
    category: '數據展示',
    complexity: 'complex',
    estimatedTime: '4-5 小時'
  },
  {
    id: '4',
    name: '儀表板模板',
    description: '包含圖表、統計卡片、快速操作的儀表板頁面',
    category: '數據可視化',
    complexity: 'complex',
    estimatedTime: '5-6 小時'
  }
]

// ErSlice 模板生成器頁面
const TemplateGenerator: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 頁面標題和說明 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          模板生成器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          從設計資產自動生成標準化的 HTML/CSS 模板
        </p>
      </div>

      {/* 生成選項 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側：模板類型選擇 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            選擇模板類型
          </h2>
          <div className="space-y-3">
            {templateTypes.map((template) => (
              <div key={template.id} className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {template.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        {template.category}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        template.complexity === 'simple' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        template.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {template.complexity === 'simple' ? '簡單' :
                         template.complexity === 'medium' ? '中等' : '複雜'}
                      </span>
                      <span>預計時間: {template.estimatedTime}</span>
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
                <span className="text-gray-900 dark:text-white">生成 HTML 結構</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="text-blue-600 rounded" defaultChecked />
                <span className="text-gray-900 dark:text-white">生成 CSS 樣式</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="text-blue-600 rounded" defaultChecked />
                <span className="text-gray-900 dark:text-white">包含響應式設計</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="text-blue-600 rounded" />
                <span className="text-gray-900 dark:text-white">生成 JavaScript 互動</span>
              </label>
            </div>
          </div>

          {/* 生成按鈕 */}
          <button className="w-full btn-primary py-3 text-lg">
            <DocumentTextIcon className="h-5 w-5 inline mr-2" />
            生成模板
          </button>
        </div>
      </div>

      {/* 最近生成的模板 */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            最近生成的模板
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <CodeBracketIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">用戶列表模板</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                基於用戶管理模組生成的列表頁面模板
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
                <CodeBracketIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">訂單表單模板</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                基於訂單管理模組生成的表單頁面模板
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
    </div>
  )
}

export default TemplateGenerator
