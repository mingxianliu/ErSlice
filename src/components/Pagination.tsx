import React from 'react'

// 統一的分頁組件
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
  showInfo?: boolean
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showInfo = true
}) => {
  if (totalPages <= 1) return null

  const startIndex = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endIndex = itemsPerPage && totalItems ? 
    Math.min(currentPage * itemsPerPage, totalItems) : 0

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        {/* 顯示資訊 */}
        {showInfo && totalItems && itemsPerPage && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            顯示 {startIndex}-{endIndex} / {totalItems} 筆記錄
          </div>
        )}
        
        {/* 簡化版分頁控制 */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一頁
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
            第 {currentPage} / {totalPages} 頁
          </span>
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="btn-secondary px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一頁
          </button>
        </div>
      </div>
    </div>
  )
}

export default Pagination