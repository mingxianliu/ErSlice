import React, { ReactNode } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

// 搜尋和篩選統一組件
interface SearchAndFiltersProps {
  // 搜尋功能
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder?: string
  
  // 篩選器 (最多4個)
  filters?: ReactNode[]
  
  // 是否為緊湊佈局 (搜尋框較短)
  compact?: boolean
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "搜尋...",
  filters = [],
  compact = false
}) => {
  // 計算 grid 列數：搜尋 + 篩選器
  const totalCols = 1 + filters.length
  const gridCols = Math.min(totalCols, 5) // 最多5列
  
  let gridClass = 'grid gap-3 '
  if (gridCols <= 2) {
    gridClass += 'grid-cols-1 md:grid-cols-2'
  } else if (gridCols <= 3) {
    gridClass += 'grid-cols-1 md:grid-cols-3'
  } else if (gridCols <= 4) {
    gridClass += 'grid-cols-1 md:grid-cols-4'
  } else {
    gridClass += 'grid-cols-1 md:grid-cols-5'
  }

  return (
    <div className={gridClass}>
      {/* 統一的搜尋欄 */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
            compact ? 'max-w-xs' : ''
          }`}
        />
      </div>

      {/* 篩選器 */}
      {filters.map((filter, index) => (
        <div key={index}>
          {filter}
        </div>
      ))}
    </div>
  )
}

export default SearchAndFilters