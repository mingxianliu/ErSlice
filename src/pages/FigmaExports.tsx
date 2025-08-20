import React, { useState, useEffect, useMemo } from 'react'
import {
  ArrowUpTrayIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  FolderIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useToast } from '../components/ui/Toast'
import PageLayout from '../components/PageLayout'
import SearchAndFilters from '../components/SearchAndFilters'
import StatCard from '../components/StatCard'
import Pagination from '../components/Pagination'

// Figma 導出記錄介面
interface FigmaExportRecord {
  id: string
  name: string
  exportFormat: 'figma-json' | 'design-tokens' | 'component-kit'
  includedContent: {
    assets: boolean
    tokens: boolean
    components: boolean
  }
  moduleCount: number
  assetCount: number
  tokenCount: number
  componentCount: number
  status: 'success' | 'failed' | 'processing'
  createdAt: string
  fileSize: string
  downloadUrl?: string
  errorMessage?: string
}

// 篩選選項
interface FilterOptions {
  status: 'all' | 'success' | 'failed' | 'processing'
  format: 'all' | 'figma-json' | 'design-tokens' | 'component-kit'
  dateRange: 'all' | 'today' | 'week' | 'month'
}

const FigmaExports: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast()
  const [exportRecords, setExportRecords] = useState<FigmaExportRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    format: 'all',
    dateRange: 'all'
  })

  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  
  // 載入示範資料
  const loadExportRecords = async () => {
    setLoading(true)
    try {
      // 模擬載入延遲
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockRecords: FigmaExportRecord[] = [
        {
          id: '1',
          name: '電商網站設計系統',
          exportFormat: 'design-tokens',
          includedContent: { assets: true, tokens: true, components: false },
          moduleCount: 12,
          assetCount: 45,
          tokenCount: 28,
          componentCount: 0,
          status: 'success',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          fileSize: '2.8 MB',
          downloadUrl: '/exports/ecommerce-design-tokens.zip'
        },
        {
          id: '2', 
          name: '管理後台組件庫',
          exportFormat: 'component-kit',
          includedContent: { assets: false, tokens: true, components: true },
          moduleCount: 8,
          assetCount: 0,
          tokenCount: 15,
          componentCount: 24,
          status: 'success',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          fileSize: '1.5 MB',
          downloadUrl: '/exports/admin-component-kit.zip'
        },
        {
          id: '3',
          name: '移動端 UI 設計檔案',
          exportFormat: 'figma-json',
          includedContent: { assets: true, tokens: true, components: true },
          moduleCount: 15,
          assetCount: 67,
          tokenCount: 32,
          componentCount: 18,
          status: 'processing',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          fileSize: '處理中...'
        },
        {
          id: '4',
          name: '品牌識別系統',
          exportFormat: 'design-tokens',
          includedContent: { assets: true, tokens: true, components: false },
          moduleCount: 6,
          assetCount: 23,
          tokenCount: 41,
          componentCount: 0,
          status: 'failed',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          fileSize: '失敗',
          errorMessage: '資產檔案格式不支援'
        },
        {
          id: '5',
          name: '響應式佈局模板',
          exportFormat: 'figma-json',
          includedContent: { assets: true, tokens: false, components: true },
          moduleCount: 10,
          assetCount: 34,
          tokenCount: 0,
          componentCount: 12,
          status: 'success',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          fileSize: '4.2 MB',
          downloadUrl: '/exports/responsive-templates.zip'
        }
      ]
      
      setExportRecords(mockRecords)
    } catch (error) {
      showError('載入失敗', '無法載入 Figma 導出記錄')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExportRecords()
  }, [])

  // 篩選和搜尋邏輯
  const filteredRecords = useMemo(() => {
    let filtered = exportRecords

    // 搜尋篩選
    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.exportFormat.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 狀態篩選
    if (filters.status !== 'all') {
      filtered = filtered.filter(record => record.status === filters.status)
    }

    // 格式篩選
    if (filters.format !== 'all') {
      filtered = filtered.filter(record => record.exportFormat === filters.format)
    }

    // 日期篩選
    if (filters.dateRange !== 'all') {
      const now = Date.now()
      let timeRange: number
      
      switch (filters.dateRange) {
        case 'today':
          timeRange = 24 * 60 * 60 * 1000 // 24小時
          break
        case 'week':
          timeRange = 7 * 24 * 60 * 60 * 1000 // 7天
          break
        case 'month':
          timeRange = 30 * 24 * 60 * 60 * 1000 // 30天
          break
        default:
          timeRange = 0
      }
      
      if (timeRange > 0) {
        filtered = filtered.filter(record => 
          now - new Date(record.createdAt).getTime() <= timeRange
        )
      }
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [exportRecords, searchQuery, filters])

  // 分頁邏輯
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage)

  // 處理下載
  const handleDownload = (record: FigmaExportRecord) => {
    if (record.status !== 'success' || !record.downloadUrl) {
      showError('無法下載', '檔案不可用或處理失敗')
      return
    }

    showInfo('開始下載', `正在下載 ${record.name}`)
    // 模擬下載
    setTimeout(() => {
      showSuccess('下載完成', `${record.name} 已下載完成`)
    }, 1000)
  }

  // 處理刪除
  const handleDelete = (record: FigmaExportRecord) => {
    if (!confirm(`確認刪除「${record.name}」的導出記錄？`)) return

    setExportRecords(prev => prev.filter(r => r.id !== record.id))
    showSuccess('刪除成功', `已刪除 ${record.name} 的導出記錄`)
  }

  // 格式化時間
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return '剛剛'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小時前`
    if (diff < 2592000000) return `${Math.floor(diff / 86400000)} 天前`
    
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // 格式顯示名稱
  const getFormatDisplayName = (format: string) => {
    switch (format) {
      case 'figma-json': return 'Figma JSON'
      case 'design-tokens': return '設計令牌'
      case 'component-kit': return '組件套件'
      default: return format
    }
  }

  // 狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'failed': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      case 'processing': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  // 狀態顯示名稱
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'success': return '成功'
      case 'failed': return '失敗'
      case 'processing': return '處理中'
      default: return status
    }
  }

  const searchAndFiltersProps = (
    <SearchAndFilters
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="搜尋導出記錄..."
      filters={[
        // 狀態篩選
        <select
          key="status"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value as any})}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="all">所有狀態</option>
          <option value="success">成功</option>
          <option value="processing">處理中</option>
          <option value="failed">失敗</option>
        </select>,
        
        // 格式篩選
        <select
          key="format"
          value={filters.format}
          onChange={(e) => setFilters({...filters, format: e.target.value as any})}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="all">所有格式</option>
          <option value="figma-json">Figma JSON</option>
          <option value="design-tokens">設計令牌</option>
          <option value="component-kit">組件套件</option>
        </select>,
        
        // 日期篩選
        <select
          key="dateRange"
          value={filters.dateRange}
          onChange={(e) => setFilters({...filters, dateRange: e.target.value as any})}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="all">所有時間</option>
          <option value="today">今天</option>
          <option value="week">一週內</option>
          <option value="month">一個月內</option>
        </select>
      ]}
    />
  )

  const statsProps = (
    <>
      <StatCard
        title="總導出記錄"
        value={exportRecords.length}
        description="所有導出記錄"
        icon={FolderIcon}
        color="blue"
      />
      <StatCard
        title="成功導出"
        value={exportRecords.filter(r => r.status === 'success').length}
        description="完成的導出"
        icon={CheckCircleIcon}
        color="green"
      />
      <StatCard
        title="處理中"
        value={exportRecords.filter(r => r.status === 'processing').length}
        description="正在處理"
        icon={ClockIcon}
        color="yellow"
      />
      <StatCard
        title="失敗"
        value={exportRecords.filter(r => r.status === 'failed').length}
        description="導出失敗"
        icon={XCircleIcon}
        color="red"
      />
    </>
  )

  return (
    <PageLayout
      title="Figma 導出記錄"
      description="管理和追蹤 Figma 格式導出記錄"
      icon={ArrowUpTrayIcon}
      onRefresh={loadExportRecords}
      refreshLoading={loading}
      searchAndFilters={searchAndFiltersProps}
      stats={statsProps}
      pagination={
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredRecords.length}
          itemsPerPage={itemsPerPage}
        />
      }
    >
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600 dark:text-gray-400">載入中...</div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center">
            <ArrowUpTrayIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {exportRecords.length === 0 ? '尚無導出記錄' : '無符合條件的記錄'}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {exportRecords.length === 0 
                ? '前往設計資產頁面開始導出 Figma 格式' 
                : '請調整搜尋或篩選條件'
              }
            </div>
          </div>
        ) : (
          <>
            {/* 列表表頭 */}
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                <div className="col-span-4">導出名稱</div>
                <div className="col-span-2">格式</div>
                <div className="col-span-2">內容</div>
                <div className="col-span-2">狀態</div>
                <div className="col-span-1">時間</div>
                <div className="col-span-1">操作</div>
              </div>
            </div>

            {/* 列表內容 */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentRecords.map((record) => (
                <div key={record.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* 導出名稱 */}
                    <div className="col-span-4">
                      <div className="flex items-start gap-3">
                        <DocumentArrowDownIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {record.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {record.moduleCount} 個模組 • {record.fileSize}
                          </div>
                          {record.errorMessage && (
                            <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                              錯誤：{record.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 格式 */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {getFormatDisplayName(record.exportFormat)}
                      </span>
                    </div>

                    {/* 內容 */}
                    <div className="col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {record.includedContent.assets && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            資產
                          </span>
                        )}
                        {record.includedContent.tokens && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            令牌
                          </span>
                        )}
                        {record.includedContent.components && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                            組件
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {record.assetCount > 0 && `${record.assetCount} 資產`}
                        {record.tokenCount > 0 && ` ${record.tokenCount} 令牌`}
                        {record.componentCount > 0 && ` ${record.componentCount} 組件`}
                      </div>
                    </div>

                    {/* 狀態 */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusDisplayName(record.status)}
                      </span>
                    </div>

                    {/* 時間 */}
                    <div className="col-span-1">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(record.createdAt)}
                      </div>
                    </div>

                    {/* 操作 */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        {record.status === 'success' && record.downloadUrl && (
                          <button
                            onClick={() => handleDownload(record)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="下載"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(record)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="刪除"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </>
        )}
    </PageLayout>
  )
}

export default FigmaExports