import React, { ReactNode } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

// 頁面佈局統一規範組件
interface PageLayoutProps {
  // 標題區域
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  
  // 操作按鈕區域
  actions?: ReactNode
  showRefreshButton?: boolean
  onRefresh?: () => void
  refreshLoading?: boolean
  
  // 搜尋和篩選區域
  searchAndFilters?: ReactNode
  
  // 統計區域
  stats?: ReactNode
  
  // 主要內容區域
  children: ReactNode
  
  // 分頁區域
  pagination?: ReactNode
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  icon: Icon,
  actions,
  showRefreshButton = true,
  onRefresh,
  refreshLoading = false,
  searchAndFilters,
  stats,
  children,
  pagination
}) => {
  return (
    <div className="space-y-6 min-h-full bg-gray-50 dark:bg-gray-900">
      {/* 統一的頁面標題區域 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {Icon && <Icon className="h-8 w-8 text-blue-600" />}
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        
        {/* 統一的操作按鈕區域 */}
        <div className="flex items-center gap-3">
          {actions}
          {showRefreshButton && onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshLoading}
              className="btn-secondary flex items-center gap-2"
              title="重新整理"
            >
              <ArrowPathIcon className={`h-5 w-5 ${refreshLoading ? 'animate-spin' : ''}`} />
              重新整理
            </button>
          )}
        </div>
      </div>

      {/* 統一的搜尋和篩選區域 */}
      {searchAndFilters && (
        <div className="card p-4">
          {searchAndFilters}
        </div>
      )}

      {/* 統計資訊區域 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats}
        </div>
      )}

      {/* 主要內容區域 */}
      <div className="card">
        {children}
      </div>

      {/* 統一的分頁區域 */}
      {pagination && (
        <div className="flex justify-center">
          {pagination}
        </div>
      )}
    </div>
  )
}

export default PageLayout