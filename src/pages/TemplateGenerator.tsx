import React, { useState } from 'react'
import { DocumentTextIcon, CodeBracketIcon, EyeIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { templates } from '../data/templates'
import { TemplateCategory, TemplateComplexity } from '../types/templates'

// ErSlice 模板生成器頁面
const TemplateGenerator: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
  const [selectedComplexity, setSelectedComplexity] = useState<TemplateComplexity | 'all'>('all')

  // 篩選模板
  const filteredTemplates = templates.filter(template => {
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory
    const complexityMatch = selectedComplexity === 'all' || template.complexity === selectedComplexity
    return categoryMatch && complexityMatch
  })

  const getCategoryLabel = (category: TemplateCategory) => {
    switch (category) {
      case TemplateCategory.DATA_DISPLAY: return '數據展示'
      case TemplateCategory.DATA_INPUT: return '數據輸入'
      case TemplateCategory.DATA_VISUALIZATION: return '數據可視化'
      case TemplateCategory.NAVIGATION: return '導航菜單'
      case TemplateCategory.LAYOUT: return '版面佈局'
      case TemplateCategory.FEEDBACK: return '用戶反饋'
      default: return category
    }
  }

  const getComplexityLabel = (complexity: TemplateComplexity) => {
    switch (complexity) {
      case TemplateComplexity.SIMPLE: return '簡單'
      case TemplateComplexity.MEDIUM: return '中等'
      case TemplateComplexity.COMPLEX: return '複雜'
      default: return complexity
    }
  }

  const getComplexityColor = (complexity: TemplateComplexity) => {
    switch (complexity) {
      case TemplateComplexity.SIMPLE: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case TemplateComplexity.MEDIUM: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case TemplateComplexity.COMPLEX: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6 min-h-full bg-gray-50 dark:bg-gray-900">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          模板生成器
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          選擇預設模板來生成對應的 HTML/CSS 代碼
        </p>
      </div>

      {/* 篩選器 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">篩選模板</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              類別
            </label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
              className="input"
            >
              <option value="all">所有類別</option>
              {Object.values(TemplateCategory).map(category => (
                <option key={category} value={category}>{getCategoryLabel(category)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              複雜度
            </label>
            <select 
              value={selectedComplexity} 
              onChange={(e) => setSelectedComplexity(e.target.value as TemplateComplexity | 'all')}
              className="input"
            >
              <option value="all">所有複雜度</option>
              {Object.values(TemplateComplexity).map(complexity => (
                <option key={complexity} value={complexity}>{getComplexityLabel(complexity)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {template.description}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4 flex-wrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {getCategoryLabel(template.category)}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(template.complexity)}`}>
                    {getComplexityLabel(template.complexity)}
                  </span>
                  <span className="text-xs">{template.estimatedTime}</span>
                </div>

                {/* 標籤 */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
              <DocumentTextIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
            </div>

            <div className="flex gap-2">
              <button className="flex-1 btn-primary text-sm py-2">
                <CodeBracketIcon className="h-4 w-4 mr-1" />
                生成代碼
              </button>
              <button className="btn-secondary text-sm py-2 px-3">
                <EyeIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">沒有找到符合條件的模板</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">請調整篩選條件或重置篩選器</p>
        </div>
      )}

      {/* 自定義模板區域 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          自定義模板
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          根據您的特定需求自定義模板參數
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              模板名稱
            </label>
            <input 
              type="text" 
              className="input"
              placeholder="請輸入模板名稱"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              模板類型
            </label>
            <select className="input">
              {Object.values(TemplateCategory).map(category => (
                <option key={category} value={category}>{getCategoryLabel(category)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            功能需求
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['搜尋功能', '篩選功能', '排序功能', '分頁功能', '批量操作', '導出功能', '響應式設計', '深色模式'].map((feature) => (
              <label key={feature} className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="btn-primary">
          <CodeBracketIcon className="h-5 w-5 mr-2" />
          生成自定義模板
        </button>
      </div>
    </div>
  )
}

export default TemplateGenerator