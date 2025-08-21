import React, { useState, useEffect } from 'react'
import { 
  SparklesIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  CogIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { AISpecType, AISpecFormat } from '../types/aiSpec'
// 匯入本專案前端規範（摘要版）原始 Markdown 內容做為預覽來源（Vite ?raw）
// 匯入失敗時會有 fallback 至規格描述文字
import FrontendStyleGuideMd from '../../docs/FRONTEND_STYLE_GUIDE.md?raw'

// AI規格介面
interface AISpec {
  id: string
  name: string
  description: string
  type: AISpecType
  format: AISpecFormat
  category: string
  tags: string[]
  complexity: 'simple' | 'medium' | 'complex'
  createdAt: string
  updatedAt: string
  author: string
  usageCount: number
  isCustom: boolean
}

// 篩選選項
interface FilterOptions {
  type: AISpecType | 'all'
  category: string | 'all'
  complexity: 'simple' | 'medium' | 'complex' | 'all'
  isCustom: boolean | 'all'
}

// 視覺切版工廠AI規格庫頁面
const AISpecGenerator: React.FC = () => {
  // 列表狀態
  const [specList, setSpecList] = useState<AISpec[]>([])
  const [filteredSpecs, setFilteredSpecs] = useState<AISpec[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    category: 'all',
    complexity: 'all',
    isCustom: 'all'
  })
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredSpecs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSpecs = filteredSpecs.slice(startIndex, endIndex)
  
  // 模態狀態
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState<AISpec | null>(null)
  const [showManualInputModal, setShowManualInputModal] = useState(false)
  const [manualInputData, setManualInputData] = useState('')
  // 預覽狀態（顯示彈窗、目前選取規格、內容、載入中與錯誤）
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewSpec, setPreviewSpec] = useState<AISpec | null>(null)
  const [previewContent, setPreviewContent] = useState<string>('')
  const [previewLoading, setPreviewLoading] = useState<boolean>(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  
  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: AISpecType.BASIC as AISpecType,
    category: 'frontend',
    complexity: 'simple' as 'simple' | 'medium' | 'complex',
    tags: [] as string[]
  })

  // 載入AI規格數據
  const loadSpecs = async () => {
    setLoading(true)
    try {
      // 模擬示範數據
      const baseSpecs: AISpec[] = [
        {
          id: 'erslice-frontend-style-guide',
          name: 'ErSlice 前端規範（可執行版）',
          description: '字體階層、按鈕層級、表格/列表/分頁/樹狀統一樣式、ARIA 與響應式規範；已落地於 src/index.css 與 Button.tsx。',
          type: AISpecType.FULL_GUIDE,
          format: AISpecFormat.MARKDOWN,
          category: 'frontend',
          tags: ['UI','樣式系統','A11y','RWD','設計令牌'],
          complexity: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '系統預設',
          usageCount: 0,
          isCustom: false
        },
        {
          id: 'responsive-design',
          name: '響應式設計規格',
          description: 'RWD響應式網頁設計開發規範，包含斷點設置、彈性佈局、媒體查詢等詳細說明',
          type: AISpecType.RESPONSIVE,
          format: AISpecFormat.MARKDOWN,
          category: 'frontend',
          tags: ['RWD', '響應式', '佈局', 'CSS'],
          complexity: 'medium',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          author: '系統預設',
          usageCount: 156,
          isCustom: false
        },
        {
          id: 'payment-system',
          name: '支付系統整合規格',
          description: '電商支付流程開發規範，包含第三方支付、訂單處理、安全驗證等完整指南',
          type: AISpecType.FULL_GUIDE,
          format: AISpecFormat.JSON,
          category: 'backend',
          tags: ['支付', '電商', '安全', 'API'],
          complexity: 'complex',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          author: '系統預設',
          usageCount: 89,
          isCustom: false
        },
        {
          id: 'component-library',
          name: '組件庫設計規格',
          description: 'React組件庫開發規範，包含設計系統、TypeScript定義、測試策略等',
          type: AISpecType.COMPONENT_SPEC,
          format: AISpecFormat.MARKDOWN,
          category: 'frontend',
          tags: ['React', '組件', 'TypeScript', '設計系統'],
          complexity: 'complex',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          author: '自定義',
          usageCount: 234,
          isCustom: true
        },
        {
          id: 'auth-system',
          name: '認證授權系統規格',
          description: '用戶認證與授權系統開發規範，包含JWT、OAuth2.0、權限控制等',
          type: AISpecType.INTERACTIVE,
          format: AISpecFormat.JSON,
          category: 'security',
          tags: ['認證', '授權', 'JWT', 'OAuth'],
          complexity: 'complex',
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          author: '系統預設',
          usageCount: 112,
          isCustom: false
        },
        {
          id: 'database-design',
          name: '資料庫設計規格',
          description: 'MongoDB與PostgreSQL資料庫設計規範，包含Schema設計、索引優化、查詢效能等',
          type: AISpecType.BASIC,
          format: AISpecFormat.MARKDOWN,
          category: 'database',
          tags: ['資料庫', 'MongoDB', 'PostgreSQL', '效能'],
          complexity: 'medium',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          updatedAt: new Date(Date.now() - 259200000).toISOString(),
          author: '自定義',
          usageCount: 67,
          isCustom: true
        },
        {
          id: 'api-documentation',
          name: 'API文件規格',
          description: 'RESTful API文件撰寫規範，包含OpenAPI規格、請求範例、錯誤處理等',
          type: AISpecType.BASIC,
          format: AISpecFormat.JSON,
          category: 'backend',
          tags: ['API', 'REST', 'OpenAPI', '文件'],
          complexity: 'simple',
          createdAt: new Date(Date.now() - 518400000).toISOString(),
          updatedAt: new Date(Date.now() - 345600000).toISOString(),
          author: '系統預設',
          usageCount: 145,
          isCustom: false
        }
      ]
      
      setSpecList(baseSpecs)
      setFilteredSpecs(baseSpecs)
    } catch (error) {
      console.error('載入AI規格失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSpecs()
  }, [])

  // 監聽 ESC 關閉預覽彈窗
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPreviewModal(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
  
  // 搜尋和篩選
  useEffect(() => {
    let filtered = specList
    
    // 搜尋
    if (searchQuery) {
      filtered = filtered.filter(spec => 
        spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        spec.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // 類型篩選
    if (filters.type !== 'all') {
      filtered = filtered.filter(spec => spec.type === filters.type)
    }
    
    // 分類篩選
    if (filters.category !== 'all') {
      filtered = filtered.filter(spec => spec.category === filters.category)
    }
    
    // 複雜度篩選
    if (filters.complexity !== 'all') {
      filtered = filtered.filter(spec => spec.complexity === filters.complexity)
    }
    
    // 自定義篩選
    if (filters.isCustom !== 'all') {
      filtered = filtered.filter(spec => spec.isCustom === filters.isCustom)
    }
    
    setFilteredSpecs(filtered)
    setCurrentPage(1)
  }, [specList, searchQuery, filters])

  // AI規格操作
  const handleCreateSpec = () => {
    if (!formData.name.trim()) {
      alert('請輸入規格名稱')
      return
    }
    
    const newSpec: AISpec = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      description: formData.description || '自定義AI規格',
      type: formData.type,
      format: AISpecFormat.MARKDOWN,
      category: formData.category,
      tags: formData.tags,
      complexity: formData.complexity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: '目前用戶',
      usageCount: 0,
      isCustom: true
    }
    
    setSpecList(prev => [newSpec, ...prev])
    setShowCreateModal(false)
    setFormData({ 
      name: '', 
      description: '', 
      type: AISpecType.BASIC, 
      category: 'frontend', 
      complexity: 'simple', 
      tags: [] 
    })
  }
  
  const handleDeleteSpec = (spec: AISpec) => {
    if (!confirm(`刪除AI規格 ${spec.name}？`)) return
    setSpecList(prev => prev.filter(s => s.id !== spec.id))
  }
  
  // 獲取類型標籤
  const getTypeLabel = (type: AISpecType) => {
    switch (type) {
      case AISpecType.BASIC: return '基礎說明'
      case AISpecType.INTERACTIVE: return '互動說明'
      case AISpecType.RESPONSIVE: return '響應式說明'
      case AISpecType.FULL_GUIDE: return '完整指南'
      case AISpecType.COMPONENT_SPEC: return '組件規格'
      default: return type
    }
  }
  
  // 獲取分類標籤
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'frontend': return '前端開發'
      case 'backend': return '後端開發'
      case 'database': return '資料庫'
      case 'security': return '安全性'
      case 'devops': return 'DevOps'
      case 'testing': return '測試'
      default: return category
    }
  }
  
  // 獲取複雜度樣式
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'complex': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    }
  }
  
  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'simple': return '簡單'
      case 'medium': return '中等'
      case 'complex': return '複雜'
      default: return complexity
    }
  }
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW')
  }

  // 開啟預覽：根據規格 ID 載入對應內容；本專案規範使用 docs/FRONTEND_STYLE_GUIDE.md
  const openPreview = async (spec: AISpec) => {
    setPreviewSpec(spec)
    setShowPreviewModal(true)
    setPreviewLoading(true)
    setPreviewError(null)
    try {
      // 若是本專案可執行前端規範，直接使用已匯入的 Markdown 原文
      if (spec.id === 'erslice-frontend-style-guide') {
        // 使用已匯入的字串內容
        setPreviewContent(FrontendStyleGuideMd || spec.description)
      } else {
        // 其他示範規格：先以描述文字作為預覽內容
        // 未來可擴充為從伺服端或本地檔案載入對應內容
        setPreviewContent(spec.description)
      }
    } catch (err) {
      console.error('預覽內容載入失敗', err)
      setPreviewError('內容載入失敗，請稍後重試')
      setPreviewContent(spec.description)
    } finally {
      setPreviewLoading(false)
    }
  }

  return (
    <div className="space-y-6 min-h-full bg-gray-50 dark:bg-gray-900">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI規格庫
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI開發規格管理、瀏覽和使用預設的開發說明
            </p>
          </div>
        </div>
      </div>
      
      {/* 自定義AI規格功能 - 放在最上方 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <PlusIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              自定義AI規格
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              新建規格
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
          根據您的特定需求自定義AI開發規格參數，或選擇下方的預設規格進行使用。
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
              placeholder="搜尋AI規格名稱、描述、分類或標籤..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          {/* 篩選 */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as AISpecType | 'all' }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="篩選：類型"
            >
              <option value="all">所有類型</option>
              {Object.values(AISpecType).map(type => (
                <option key={type} value={type}>{getTypeLabel(type)}</option>
              ))}
            </select>
            
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="篩選：分類"
            >
              <option value="all">所有分類</option>
              <option value="frontend">前端開發</option>
              <option value="backend">後端開發</option>
              <option value="database">資料庫</option>
              <option value="security">安全性</option>
              <option value="devops">DevOps</option>
              <option value="testing">測試</option>
            </select>
            
            <select
              value={filters.complexity}
              onChange={(e) => setFilters(prev => ({ ...prev, complexity: e.target.value as 'simple' | 'medium' | 'complex' | 'all' }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="篩選：複雜度"
            >
              <option value="all">所有複雜度</option>
              <option value="simple">簡單</option>
              <option value="medium">中等</option>
              <option value="complex">複雜</option>
            </select>
            
            <select
              value={filters.isCustom === 'all' ? 'all' : filters.isCustom ? 'custom' : 'preset'}
              onChange={(e) => {
                const value = e.target.value === 'all' ? 'all' : e.target.value === 'custom' ? true : false
                setFilters(prev => ({ ...prev, isCustom: value }))
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="篩選：來源"
            >
              <option value="all">所有規格</option>
              <option value="preset">預設規格</option>
              <option value="custom">自定義規格</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI規格列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* 列表標題 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI規格列表 ({filteredSpecs.length})
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={loadSpecs}
                disabled={loading}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                重新整理
              </button>
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
          ) : filteredSpecs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="text-lg font-medium mb-2">
                {specList.length === 0 ? '尚無AI規格' : '無符合條件的AI規格'}
              </div>
              <div className="text-sm">
                {specList.length === 0 ? '點擊上方「新建規格」開始使用' : '請試著調整搜尋或篩選條件'}
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    規格資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    類型與分類
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
                {currentSpecs.map((spec) => (
                  <tr key={spec.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 h-20">
                    {/* 規格資訊 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <SparklesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {spec.name}
                            </div>
                            {spec.isCustom && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                                自定義
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">{spec.description}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {spec.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {tag}
                              </span>
                            ))}
                            {spec.tags.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                +{spec.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* 類型與分類 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {getTypeLabel(spec.type)}
                        </span>
                        <br />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {getCategoryLabel(spec.category)}
                        </span>
                        <br />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplexityColor(spec.complexity)}`}>
                          {getComplexityLabel(spec.complexity)}
                        </span>
                      </div>
                    </td>
                    
                    {/* 使用統計 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        <div>使用次數: {spec.usageCount}</div>
                        <div>作者: {spec.author}</div>
                        <div>格式: {spec.format}</div>
                      </div>
                    </td>
                    
                    {/* 時間 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          建立: {formatDate(spec.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          更新: {formatDate(spec.updatedAt)}
                        </div>
                      </div>
                    </td>
                    
                    {/* 操作 */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <button 
                          onClick={() => openPreview(spec)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40 dark:hover:text-blue-200"
                          aria-label={`預覽 ${spec.name}`}
                        >
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
                        {spec.isCustom && (
                          <>
                            <button 
                              onClick={() => {
                                setSelectedSpec(spec)
                                setFormData({
                                  name: spec.name,
                                  description: spec.description,
                                  type: spec.type,
                                  category: spec.category,
                                  complexity: spec.complexity,
                                  tags: spec.tags
                                })
                                setShowEditModal(true)
                              }}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 dark:bg-gray-600/50 dark:text-gray-300 dark:hover:bg-gray-500/60 dark:hover:text-gray-200"
                            >
                              <PencilIcon className="h-3 w-3 mr-1" />
                              編輯
                            </button>
                            <button 
                              onClick={() => handleDeleteSpec(spec)}
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
        {!loading && filteredSpecs.length > itemsPerPage && (
          <div className="px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-end gap-8">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                顯示第 {startIndex + 1} - {Math.min(endIndex, filteredSpecs.length)} 筆，共 {filteredSpecs.length} 筆AI規格
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

      {/* 建立規格模態 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">建立自定義AI規格</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      規格名稱 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="輸入規格名稱"
                      aria-label="規格名稱"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      規格類型
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AISpecType }))}
                      aria-label="規格類型"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {Object.values(AISpecType).map(type => (
                        <option key={type} value={type}>{getTypeLabel(type)}</option>
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
                    placeholder="輸入規格描述"
                    aria-label="規格描述"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      分類
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      aria-label="分類"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="frontend">前端開發</option>
                      <option value="backend">後端開發</option>
                      <option value="database">資料庫</option>
                      <option value="security">安全性</option>
                      <option value="devops">DevOps</option>
                      <option value="testing">測試</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      複雜度
                    </label>
                    <select
                      value={formData.complexity}
                      onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value as 'simple' | 'medium' | 'complex' }))}
                      aria-label="複雜度"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="simple">簡單</option>
                      <option value="medium">中等</option>
                      <option value="complex">複雜</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ name: '', description: '', type: AISpecType.BASIC, category: 'frontend', complexity: 'simple', tags: [] })
                  }}
                  className="flex-1 group relative px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-500 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 text-gray-600 dark:text-gray-200 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-500 dark:hover:to-gray-600 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateSpec}
                  disabled={!formData.name.trim()}
                  className="flex-1 group relative px-4 py-2 text-sm font-medium rounded-lg border border-blue-400 dark:border-blue-500 bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  建立
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 編輯規格模態 */}
      {showEditModal && selectedSpec && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">編輯AI規格</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      規格名稱 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      aria-label="規格名稱"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      規格類型
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AISpecType }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      aria-label="規格類型"
                    >
                      {Object.values(AISpecType).map(type => (
                        <option key={type} value={type}>{getTypeLabel(type)}</option>
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
                    aria-label="規格描述"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      分類
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      aria-label="分類"
                    >
                      <option value="frontend">前端開發</option>
                      <option value="backend">後端開發</option>
                      <option value="database">資料庫</option>
                      <option value="security">安全性</option>
                      <option value="devops">DevOps</option>
                      <option value="testing">測試</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      複雜度
                    </label>
                    <select
                      value={formData.complexity}
                      onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value as 'simple' | 'medium' | 'complex' }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      aria-label="複雜度"
                    >
                      <option value="simple">簡單</option>
                      <option value="medium">中等</option>
                      <option value="complex">複雜</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedSpec(null)
                    setFormData({ name: '', description: '', type: AISpecType.BASIC, category: 'frontend', complexity: 'simple', tags: [] })
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    // TODO: 實作更新邏輯
                    alert('更新功能尚未實作')
                  }}
                  className="flex-1 btn-primary"
                >
                  更新
                </button>
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
                手動輸入 AI 規格
              </h3>
              <button 
                onClick={() => setShowManualInputModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="關閉"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">使用說明</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    請將從 AI 工具（如 ChatGPT、Claude）獲得的規格內容貼上到下方文本框中。系統會自動解析格式並創建新的 AI 規格。
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI 規格內容
                  </label>
                  <textarea
                    value={manualInputData}
                    onChange={(e) => setManualInputData(e.target.value)}
                    placeholder="請貼上 AI 生成的規格內容...

支援的格式：
- Markdown 格式
- JSON 格式
- 純文本格式

例如：
# 響應式設計規格
## 概述
...
## 斷點設置
..."
                    className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  />
                </div>
                
                {manualInputData.trim() && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-200 mb-2">預覽資訊</h4>
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <p>內容長度: {manualInputData.length} 字符</p>
                      <p>行數: {manualInputData.split('\n').length}</p>
                      <p>格式: {manualInputData.trim().startsWith('{') ? 'JSON' : manualInputData.includes('#') ? 'Markdown' : '純文本'}</p>
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
                  // TODO: 實作解析和創建AI規格的邏輯
                  alert('解析功能開發中，將來會自動解析內容並創建AI規格')
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

      {/* 規格預覽彈窗 */}
      {showPreviewModal && previewSpec && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* 背景遮罩，點擊可關閉 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPreviewModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            {/* 標題列 */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 id="preview-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                  {previewSpec.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {previewSpec.description}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="關閉預覽"
                onClick={() => setShowPreviewModal(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* 內容區域 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {previewLoading ? (
                <div className="text-center py-12 text-gray-500">
                  <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-2" />
                  載入內容中...
                </div>
              ) : previewError ? (
                <div className="text-red-600 dark:text-red-400 text-sm">{previewError}</div>
              ) : (
                <article className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
                  {/* 以簡單方式渲染 Markdown 字串。此處先用 pre-wrap 顯示，避免 XSS；之後可導入安全的 Markdown renderer */}
                  <div className="whitespace-pre-wrap break-words">{previewContent}</div>
                </article>
              )}
            </div>

            {/* 底部操作列 */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setShowPreviewModal(false)}>
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AISpecGenerator