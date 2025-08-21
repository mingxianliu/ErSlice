import React, { useState, useEffect } from 'react'
import { 
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentIcon,
  CodeBracketIcon,
  CalendarIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

// 切版包介面
interface SlicePackage {
  id: string
  name: string
  description: string
  type: 'project' | 'module' | 'combined'
  createdAt: string
  updatedAt: string
  size: string
  status: 'ready' | 'processing' | 'error'
  modules: string[]
  files: {
    html: number
    css: number
    js: number
    assets: number
    docs: number
  }
  author: string
}

// 切版包管理頁面
const SlicePackages: React.FC = () => {
  const [packages, setPackages] = useState<SlicePackage[]>([])
  const [filteredPackages, setFilteredPackages] = useState<SlicePackage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // 功能狀態
  const [previewPackage, setPreviewPackage] = useState<SlicePackage | null>(null)
  const [editingPackage, setEditingPackage] = useState<SlicePackage | null>(null)
  const [managingPackage, setManagingPackage] = useState<SlicePackage | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    type: 'project' as 'project' | 'module' | 'combined'
  })
  
  // 分頁相關
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPackages = filteredPackages.slice(startIndex, endIndex)

  // 載入切版包數據
  const loadPackages = async () => {
    setLoading(true)
    try {
      // 模擬從API載入切版包數據
      const mockPackages: SlicePackage[] = [
        {
          id: 'pkg-001',
          name: '電商系統完整切版包',
          description: '包含商品列表、詳情頁、購物車、結帳流程的完整電商切版包',
          type: 'project',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          size: '15.2 MB',
          status: 'ready',
          modules: ['用戶管理模組', '商品管理模組', '訂單管理模組'],
          files: { html: 12, css: 8, js: 15, assets: 24, docs: 6 },
          author: '系統生成'
        },
        {
          id: 'pkg-002',
          name: '用戶管理模組切版包',
          description: '用戶註冊、登入、個人資料管理的單模組切版包',
          type: 'module',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          size: '3.8 MB',
          status: 'ready',
          modules: ['用戶管理模組'],
          files: { html: 6, css: 4, js: 8, assets: 12, docs: 3 },
          author: '自定義'
        },
        {
          id: 'pkg-003',
          name: '響應式儀表板組合',
          description: '結合多個統計模組的響應式儀表板切版包',
          type: 'combined',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 7200000).toISOString(),
          size: '8.7 MB',
          status: 'processing',
          modules: ['統計模組', '圖表模組', '報表模組'],
          files: { html: 9, css: 6, js: 12, assets: 18, docs: 4 },
          author: '系統生成'
        }
      ]
      
      setPackages(mockPackages)
      setFilteredPackages(mockPackages)
    } catch (error) {
      console.error('載入切版包失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPackages()
  }, [])

  // 搜尋和篩選
  useEffect(() => {
    let filtered = packages

    // 搜尋
    if (searchQuery) {
      filtered = filtered.filter(pkg => 
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.modules.some(module => module.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // 類型篩選
    if (typeFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.type === typeFilter)
    }

    // 狀態篩選
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.status === statusFilter)
    }

    setFilteredPackages(filtered)
    setCurrentPage(1) // 重置到第一頁
  }, [packages, searchQuery, typeFilter, statusFilter])

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 獲取類型標籤
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project': return '專案包'
      case 'module': return '模組包'
      case 'combined': return '組合包'
      default: return type
    }
  }

  // 處理功能
  const handlePreview = (pkg: SlicePackage) => {
    setPreviewPackage(pkg)
  }

  const handleEdit = (pkg: SlicePackage) => {
    setEditingPackage(pkg)
    setEditFormData({
      name: pkg.name,
      description: pkg.description,
      type: pkg.type
    })
  }

  const handleManageFiles = (pkg: SlicePackage) => {
    setManagingPackage(pkg)
  }

  const handleDelete = async (pkg: SlicePackage) => {
    if (!confirm(`確定要刪除切版包「${pkg.name}」嗎？此操作不可復原。`)) return
    
    try {
      // TODO: 實作刪除API
      console.log('刪除切版包:', pkg.id)
      
      // 暫時從列表中移除
      setPackages(prev => prev.filter(p => p.id !== pkg.id))
      setFilteredPackages(prev => prev.filter(p => p.id !== pkg.id))
      
      alert('切版包已刪除')
    } catch (error) {
      console.error('刪除失敗:', error)
      alert('刪除失敗，請稍後再試')
    }
  }

  const handleSaveEdit = async () => {
    if (!editingPackage) return
    
    try {
      // TODO: 實作更新API
      console.log('更新切版包:', editingPackage.id, editFormData)
      
      // 暫時更新本地狀態
      const updatedPackage = {
        ...editingPackage,
        ...editFormData,
        updatedAt: new Date().toISOString()
      }
      
      setPackages(prev => prev.map(p => p.id === editingPackage.id ? updatedPackage : p))
      setFilteredPackages(prev => prev.map(p => p.id === editingPackage.id ? updatedPackage : p))
      
      setEditingPackage(null)
      alert('切版包資訊已更新')
    } catch (error) {
      console.error('更新失敗:', error)
      alert('更新失敗，請稍後再試')
    }
  }

  // 獲取狀態標籤
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">準備就緒</span>
      case 'processing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">處理中</span>
      case 'error':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">錯誤</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">{status}</span>
    }
  }

  return (
    <div className="space-y-6 min-h-full bg-gray-50 dark:bg-gray-900">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ArchiveBoxIcon className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              切版包管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              管理和編輯專案、模組及組合切版包
            </p>
          </div>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜尋 */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋切版包名稱、描述或模組..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          {/* 篩選選項 */}
          <div className="flex gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">所有類型</option>
              <option value="project">專案包</option>
              <option value="module">模組包</option>
              <option value="combined">組合包</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">所有狀態</option>
              <option value="ready">準備就緒</option>
              <option value="processing">處理中</option>
              <option value="error">錯誤</option>
            </select>
            
            <button
              onClick={loadPackages}
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              重新整理
            </button>
          </div>
        </div>
      </div>

      {/* 切版包列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* 列表標題 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            切版包列表 ({filteredPackages.length})
          </h2>
        </div>
        
        {/* 列表內容 */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-2" />
            載入中...
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ArchiveBoxIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <div className="text-lg font-medium mb-2">
              {packages.length === 0 ? '尚無切版包' : '無符合條件的切版包'}
            </div>
            <div className="text-sm">
              {packages.length === 0 ? '切版包將在生成後出現在此處' : '請試著調整搜尋或篩選條件'}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    切版包資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    類型與狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    文件統計
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    時間與大小
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 h-24">
                    {/* 切版包資訊 */}
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <ArchiveBoxIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {pkg.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {pkg.description}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {pkg.modules.map((module, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                              >
                                {module}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* 類型與狀態 */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {getTypeLabel(pkg.type)}
                        </div>
                        {getStatusBadge(pkg.status)}
                      </div>
                    </td>
                    
                    {/* 文件統計 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <DocumentIcon className="h-4 w-4 mr-1" />
                          HTML: {pkg.files.html}
                        </div>
                        <div className="flex items-center">
                          <CodeBracketIcon className="h-4 w-4 mr-1" />
                          CSS: {pkg.files.css} | JS: {pkg.files.js}
                        </div>
                        <div>資產: {pkg.files.assets} | 文檔: {pkg.files.docs}</div>
                      </div>
                    </td>
                    
                    {/* 時間與大小 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          建立: {formatDate(pkg.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          更新: {formatDate(pkg.updatedAt)}
                        </div>
                        <div>大小: {pkg.size}</div>
                      </div>
                    </td>
                    
                    {/* 操作 */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <button 
                          onClick={() => handlePreview(pkg)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40 dark:hover:text-blue-200"
                        >
                          <EyeIcon className="h-3 w-3 mr-1" />
                          預覽
                        </button>
                        <button 
                          onClick={() => handleEdit(pkg)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/40 dark:hover:text-green-200"
                        >
                          <PencilIcon className="h-3 w-3 mr-1" />
                          編輯
                        </button>
                        <button 
                          onClick={() => handleManageFiles(pkg)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-800/40 dark:hover:text-orange-200"
                        >
                          <FolderIcon className="h-3 w-3 mr-1" />
                          管理文件
                        </button>
                        <button 
                          onClick={() => handleDelete(pkg)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/40 dark:hover:text-red-200"
                        >
                          <TrashIcon className="h-3 w-3 mr-1" />
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* 分頁 */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50"
              >
                上一頁
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                下一頁
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-end sm:gap-8">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  顯示第 <span className="font-medium">{startIndex + 1}</span> 到{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredPackages.length)}</span> 項，
                  共 <span className="font-medium">{filteredPackages.length}</span> 項切版包
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === currentPage
                          ? 'z-10 bg-orange-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600'
                          : 'text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-offset-0'
                      } ${
                        page === 1 ? 'rounded-l-md' : ''
                      } ${
                        page === totalPages ? 'rounded-r-md' : ''
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 預覽彈窗 */}
      {previewPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewPackage(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                切版包預覽: {previewPackage.name}
              </h3>
              <button 
                onClick={() => setPreviewPackage(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本資訊 */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">基本資訊</h4>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">名稱</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{previewPackage.name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">描述</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{previewPackage.description}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">類型</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{getTypeLabel(previewPackage.type)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">狀態</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{getStatusBadge(previewPackage.status)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">大小</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{previewPackage.size}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">作者</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{previewPackage.author}</dd>
                    </div>
                  </dl>
                </div>

                {/* 文件統計 */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">文件統計</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{previewPackage.files.html}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">HTML 文件</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{previewPackage.files.css}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">CSS 文件</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{previewPackage.files.js}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">JS 文件</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">{previewPackage.files.assets}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">資產文件</div>
                    </div>
                  </div>
                </div>

                {/* 包含模組 */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">包含模組</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewPackage.modules.map((module, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                      >
                        {module}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 時間資訊 */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">建立時間</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{formatDate(previewPackage.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">最後更新</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{formatDate(previewPackage.updatedAt)}</dd>
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button 
                className="btn-secondary"
                onClick={() => setPreviewPackage(null)}
              >
                關閉
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  setPreviewPackage(null)
                  handleManageFiles(previewPackage)
                }}
              >
                管理文件
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯彈窗 */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditingPackage(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                編輯切版包: {editingPackage.name}
              </h3>
              <button 
                onClick={() => setEditingPackage(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    名稱
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    描述
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    類型
                  </label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="project">專案包</option>
                    <option value="module">模組包</option>
                    <option value="combined">組合包</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button 
                className="btn-secondary"
                onClick={() => setEditingPackage(null)}
              >
                取消
              </button>
              <button 
                className="btn-primary"
                onClick={handleSaveEdit}
                disabled={!editFormData.name.trim()}
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 文件管理彈窗 */}
      {managingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setManagingPackage(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                文件管理: {managingPackage.name}
              </h3>
              <button 
                onClick={() => setManagingPackage(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8 text-center">
                <FolderIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">文件管理功能</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  這裡將顯示切版包內的所有文件，支援新增、編輯、刪除等操作
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>• HTML 文件: {managingPackage.files.html} 個</p>
                  <p>• CSS 文件: {managingPackage.files.css} 個</p>
                  <p>• JS 文件: {managingPackage.files.js} 個</p>
                  <p>• 資產文件: {managingPackage.files.assets} 個</p>
                  <p>• 文檔文件: {managingPackage.files.docs} 個</p>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button 
                className="btn-secondary"
                onClick={() => setManagingPackage(null)}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SlicePackages