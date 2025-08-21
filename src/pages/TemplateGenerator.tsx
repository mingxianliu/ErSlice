import React, { useState, useEffect, useMemo } from 'react'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowPathIcon, 
  BuildingLibraryIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline'
import { Button } from '../components/ui/Button'
import { templates } from '../data/templates'
import { TemplateCategory, TemplateComplexity } from '../types/templates'

// 模板介面
interface Template {
  id: string
  name: string
  description: string
  category: TemplateCategory
  complexity: TemplateComplexity
  tags: string[]
  estimatedTime: string
  createdAt: string
  updatedAt: string
  author: string
  usageCount: number
  isCustom: boolean
}

// 篩選選項
interface FilterOptions {
  category: TemplateCategory | 'all'
  complexity: TemplateComplexity | 'all'
  isCustom: boolean | 'all'
}

// 視覺切版工廠模板庫頁面
const TemplateGenerator: React.FC = () => {
  // 列表狀態
  const [templateList, setTemplateList] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    complexity: 'all',
    isCustom: 'all'
  })
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTemplates = filteredTemplates.slice(startIndex, endIndex)
  
  // 模態狀態
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showManualInputModal, setShowManualInputModal] = useState(false)
  const [manualInputData, setManualInputData] = useState('')
  
  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: TemplateCategory.LAYOUT as TemplateCategory,
    complexity: TemplateComplexity.SIMPLE as TemplateComplexity,
    tags: [] as string[],
    features: [] as string[]
  })

  // 載入模板數據
  const loadTemplates = async () => {
    setLoading(true)
    try {
      // 模擬從API載入或從本地存儲載入
      const baseTemplates: Template[] = templates.map((template, index) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        complexity: template.complexity,
        tags: template.tags,
        estimatedTime: template.estimatedTime,
        createdAt: new Date(Date.now() - index * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - index * 3600000).toISOString(),
        author: index % 3 === 0 ? '系統預設' : '自定義',
        usageCount: Math.floor(Math.random() * 100),
        isCustom: index % 3 === 0 ? false : true
      }))
      
      setTemplateList(baseTemplates)
      setFilteredTemplates(baseTemplates)
    } catch (error) {
      console.error('載入模板失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])
  
  // 搜尋和篩選
  useEffect(() => {
    let filtered = templateList
    
    // 搜尋
    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    // 類別篩選
    if (filters.category !== 'all') {
      filtered = filtered.filter(template => template.category === filters.category)
    }
    
    // 複雜度篩選
    if (filters.complexity !== 'all') {
      filtered = filtered.filter(template => template.complexity === filters.complexity)
    }
    
    // 自定義篩選
    if (filters.isCustom !== 'all') {
      filtered = filtered.filter(template => template.isCustom === filters.isCustom)
    }
    
    setFilteredTemplates(filtered)
    setCurrentPage(1) // 重置到第一頁
  }, [templateList, searchQuery, filters])

  // 模板操作
  const handleCreateTemplate = () => {
    if (!formData.name.trim()) {
      alert('請輸入模板名稱')
      return
    }
    
    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      description: formData.description || '自定義模板',
      category: formData.category,
      complexity: formData.complexity,
      tags: formData.tags,
      estimatedTime: '30 分鐘',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: '目前用戶',
      usageCount: 0,
      isCustom: true
    }
    
    setTemplateList(prev => [newTemplate, ...prev])
    setShowCreateModal(false)
    setFormData({ name: '', description: '', category: TemplateCategory.LAYOUT, complexity: TemplateComplexity.SIMPLE, tags: [], features: [] })
  }
  
  // 處理模板更新
  const handleUpdateTemplate = () => {
    if (!selectedTemplate) return
    
    // 驗證必填欄位
    if (!formData.name.trim()) {
      alert('請輸入模板名稱')
      return
    }
    
    // 更新模板資料
    const updatedTemplate = {
      ...selectedTemplate,
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      complexity: formData.complexity,
      tags: formData.tags,
      updatedAt: new Date().toISOString()
    }
    
    // 更新本地狀態
    setTemplateList(prev => prev.map(t => 
      t.id === selectedTemplate.id ? updatedTemplate : t
    ))
    
    // 關閉模態框並重置狀態
    setShowEditModal(false)
    setSelectedTemplate(null)
    setFormData({ name: '', description: '', category: TemplateCategory.LAYOUT, complexity: TemplateComplexity.SIMPLE, tags: [], features: [] })
    
    // 顯示成功訊息
    alert('模板更新成功！')
  }

  // 處理模板刪除
  const handleDeleteTemplate = (template: Template) => {
    if (!confirm(`確定要刪除模板「${template.name}」嗎？此操作不可回復。`)) return
    
    // 從本地狀態中移除
    setTemplateList(prev => prev.filter(t => t.id !== template.id))
    
    // 顯示成功訊息
    alert('模板刪除成功！')
  }
  
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
      case TemplateComplexity.SIMPLE: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case TemplateComplexity.MEDIUM: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case TemplateComplexity.COMPLEX: return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW')
  }

  return (
    <div className="space-y-6 min-h-full bg-gray-50 dark:bg-gray-900">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BuildingLibraryIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              模板庫
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              模板管理、瀏覽和使用預設的 HTML/CSS 模板
            </p>
          </div>
        </div>
      </div>
      
      {/* 自定義模板功能 - 放在最上方 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <PlusIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              自定義模板
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              新建模板
            </button>
            <button
              onClick={() => setShowManualInputModal(true)}
              className="btn-secondary flex items-center"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              手動輸入
            </button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          根據您的特定需求自定義模板參數，或選擇下方的預設模板進行使用。
        </p>
      </div>

      {/* 列表工具列 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜尋 */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋模板名稱、描述或標籤..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          {/* 篩選 */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as TemplateCategory | 'all' }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="類別篩選"
            >
              <option value="all">所有類別</option>
              {Object.values(TemplateCategory).map(category => (
                <option key={category} value={category}>{getCategoryLabel(category)}</option>
              ))}
            </select>
            
            <select
              value={filters.complexity}
              onChange={(e) => setFilters(prev => ({ ...prev, complexity: e.target.value as TemplateComplexity | 'all' }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="複雜度篩選"
            >
              <option value="all">所有複雜度</option>
              {Object.values(TemplateComplexity).map(complexity => (
                <option key={complexity} value={complexity}>{getComplexityLabel(complexity)}</option>
              ))}
            </select>
            
            <select
              value={filters.isCustom === 'all' ? 'all' : filters.isCustom ? 'custom' : 'preset'}
              onChange={(e) => {
                const value = e.target.value === 'all' ? 'all' : e.target.value === 'custom' ? true : false
                setFilters(prev => ({ ...prev, isCustom: value }))
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="模板類型篩選"
            >
              <option value="all">所有模板</option>
              <option value="preset">預設模板</option>
              <option value="custom">自定義模板</option>
            </select>
          </div>
        </div>
      </div>

      {/* 模板列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* 列表標題 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              模板列表 ({filteredTemplates.length})
            </h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={loadTemplates}
                disabled={loading}
                variant="secondary"
                size="sm"
              >
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                重新整理
              </Button>
            </div>
          </div>
        </div>
        
        {/* 列表內容 */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-2" />
              載入中...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BuildingLibraryIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="text-lg font-medium mb-2">
                {templateList.length === 0 ? '尚無模板' : '無符合條件的模板'}
              </div>
              <div className="text-sm">
                {templateList.length === 0 ? '點擊上方「新建模板」開始使用' : '請試著調整搜尋或篩選條件'}
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    模板資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    類別與複雜度
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    使用統計
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    時間
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 h-20">
                    {/* 模板資訊 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {template.name}
                            </div>
                            {template.isCustom && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                                自定義
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{template.description}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {tag}
                              </span>
                            ))}
                            {template.tags.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                +{template.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* 類別與複雜度 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {getCategoryLabel(template.category)}
                        </span>
                        <br />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplexityColor(template.complexity)}`}>
                          {getComplexityLabel(template.complexity)}
                        </span>
                      </div>
                    </td>
                    
                    {/* 使用統計 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        <div>使用次數: {template.usageCount}</div>
                        <div>作者: {template.author}</div>
                        <div>預估時間: {template.estimatedTime}</div>
                      </div>
                    </td>
                    
                    {/* 時間 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          建立: {formatDate(template.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          更新: {formatDate(template.updatedAt)}
                        </div>
                      </div>
                    </td>
                    
                    {/* 操作 */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <button className="inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40 dark:hover:text-blue-200">
                          <EyeIcon className="h-3 w-3 mr-1" />
                          預覽
                        </button>
                        <button 
                          disabled
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-600/30 dark:text-gray-400"
                          title="功能開發中，暫時停用"
                        >
                          <CodeBracketIcon className="h-3 w-3 mr-1" />
                          生成
                        </button>
                        {template.isCustom && (
                          <>
                            <button 
                              onClick={() => {
                                setSelectedTemplate(template)
                                setFormData({
                                  name: template.name,
                                  description: template.description,
                                  category: template.category,
                                  complexity: template.complexity,
                                  tags: template.tags,
                                  features: []
                                })
                                setShowEditModal(true)
                              }}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 dark:bg-gray-600/50 dark:text-gray-300 dark:hover:bg-gray-500/60 dark:hover:text-gray-200"
                            >
                              <PencilIcon className="h-3 w-3 mr-1" />
                              編輯
                            </button>
                            <button 
                              onClick={() => handleDeleteTemplate(template)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/40 dark:hover:text-red-200"
                            >
                              <TrashIcon className="h-3 w-3 mr-1" />
                              刪除
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* 分頁控制 */}
        {!loading && filteredTemplates.length > itemsPerPage && (
          <div className="px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-end gap-8">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                顯示第 {startIndex + 1} - {Math.min(endIndex, filteredTemplates.length)} 筆，共 {filteredTemplates.length} 筆模板
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一頁
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一頁
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 建立模板模態 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">建立自定義模板</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      模板名稱 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="輸入模板名稱"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      模板類型
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TemplateCategory }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      aria-label="模板類別"
                    >
                      {Object.values(TemplateCategory).map(category => (
                        <option key={category} value={category}>{getCategoryLabel(category)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="輸入模板描述"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    複雜度
                  </label>
                  <select
                    value={formData.complexity}
                    onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value as TemplateComplexity }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    aria-label="模板複雜度"
                  >
                    {Object.values(TemplateComplexity).map(complexity => (
                      <option key={complexity} value={complexity}>{getComplexityLabel(complexity)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    功能需求
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['搜尋功能', '篩選功能', '排序功能', '分頁功能', '批量操作', '導出功能', '響應式設計', '深色模式'].map((feature) => (
                      <label key={feature} className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData.features.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, features: [...prev.features, feature] }))
                            } else {
                              setFormData(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }))
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ name: '', description: '', category: TemplateCategory.LAYOUT, complexity: TemplateComplexity.SIMPLE, tags: [], features: [] })
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCreateTemplate}
                  disabled={!formData.name.trim()}
                >
                  建立
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 編輯模板模態 */}
      {showEditModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">編輯模板</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      模板名稱 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      模板類型
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TemplateCategory }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      aria-label="模板類別"
                    >
                      {Object.values(TemplateCategory).map(category => (
                        <option key={category} value={category}>{getCategoryLabel(category)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    複雜度
                  </label>
                  <select
                    value={formData.complexity}
                    onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value as TemplateComplexity }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    aria-label="模板複雜度"
                  >
                    {Object.values(TemplateComplexity).map(complexity => (
                      <option key={complexity} value={complexity}>{getComplexityLabel(complexity)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedTemplate(null)
                    setFormData({ name: '', description: '', category: TemplateCategory.LAYOUT, complexity: TemplateComplexity.SIMPLE, tags: [], features: [] })
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleUpdateTemplate}
                  disabled={!formData.name.trim()}
                >
                  更新
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 手動輸入彈窗 */}
      {showManualInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowManualInputModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                手動輸入模板
              </h3>
              <button 
                onClick={() => setShowManualInputModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">使用說明</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    請將從 AI 工具（如 ChatGPT、Claude）獲得的模板內容貼上到下方文本框中。系統會自動解析格式並創建新的模板。
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    模板內容
                  </label>
                  <textarea
                    value={manualInputData}
                    onChange={(e) => setManualInputData(e.target.value)}
                    placeholder="請貼上 AI 生成的模板內容...

支援的格式：
- HTML/CSS 模板代碼
- React/Vue 組件代碼
- JSON 配置格式
- Markdown 說明文檔

例如：
```html
<div class='card'>
  <h2>標題</h2>
  <p>內容...</p>
</div>
```

或：
```json
{
  'name': '響應式卡片',
  'description': '...',
  'features': ['responsive', 'shadow']
}
```"
                    className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  />
                </div>
                
                {manualInputData.trim() && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-200 mb-2">預覽資訊</h4>
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <p>內容長度: {manualInputData.length} 字符</p>
                      <p>行數: {manualInputData.split('\n').length}</p>
                      <p>格式: {
                        manualInputData.trim().startsWith('{') ? 'JSON' :
                        manualInputData.includes('```') ? '代碼塊' :
                        manualInputData.includes('<') ? 'HTML' : '純文本'
                      }</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowManualInputModal(false)
                  setManualInputData('')
                }}
              >
                取消
              </button>
              <button 
                className="btn-primary"
                disabled={!manualInputData.trim()}
                onClick={() => {
                  // TODO: 實作解析和創建模板的邏輯
                  alert('解析功能開發中，將來會自動解析內容並創建模板')
                  setShowManualInputModal(false)
                  setManualInputData('')
                }}
              >
                解析並創建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateGenerator