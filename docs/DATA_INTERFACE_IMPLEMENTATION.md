# ErSlice 資料介面組件實現指南

## 🎯 概述

本文檔提供 ErSlice 資料介面組件的核心實現，包括數據表格、表單、卡片佈局等組件的設計原則和實現代碼。

## 📊 數據表格組件

### 1. DataTable 主組件

```tsx
// src/components/ui/DataTable.tsx
import React from 'react'
import { cn } from '../../utils/cn'

interface DataTableProps {
  children: React.ReactNode
  className?: string
}

export const DataTable: React.FC<DataTableProps> = ({ children, className }) => {
  return (
    <div className={cn('w-full overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg', className)}>
      {children}
    </div>
  )
}

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
)

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
)

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <tr className={cn('hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors', className)}>{children}</tr>
)

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th className={cn('px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider', className)}>
    {children}
  </th>
)

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100', className)}>
    {children}
  </td>
)
```

### 2. 表格功能組件

```tsx
// src/components/ui/TableFeatures.tsx
import React from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

// 排序組件
export const SortableHeader: React.FC<{
  children: React.ReactNode
  sortKey: string
  currentSort: { key: string; direction: 'asc' | 'desc' }
  onSort: (key: string) => void
}> = ({ children, sortKey, currentSort, onSort }) => (
  <button
    onClick={() => onSort(sortKey)}
    className="group flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300"
  >
    <span>{children}</span>
    {currentSort.key === sortKey && (
      currentSort.direction === 'asc' ? 
        <ChevronUpIcon className="w-4 h-4" /> : 
        <ChevronDownIcon className="w-4 h-4" />
    )}
  </button>
)

// 分頁組件
export const Pagination: React.FC<{
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}> = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-800">
    <div className="text-sm text-gray-700 dark:text-gray-300">
      第 {currentPage} 頁，共 {totalPages} 頁
    </div>
    <div className="flex space-x-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            'px-3 py-1 rounded-md text-sm',
            page === currentPage
              ? 'bg-purple-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          {page}
        </button>
      ))}
    </div>
  </div>
)
```

## 📝 表單組件

### 1. 基礎表單組件

```tsx
// src/components/ui/Form.tsx
import React from 'react'
import { cn } from '../../utils/cn'

export const Form: React.FC<{
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  className?: string
}> = ({ children, onSubmit, className }) => (
  <form onSubmit={onSubmit} className={cn('space-y-6', className)}>
    {children}
  </form>
)

export const FormSection: React.FC<{
  title: string
  children: React.ReactNode
  className?: string
}> = ({ title, children, className }) => (
  <div className={cn('space-y-4', className)}>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
)

export const FormField: React.FC<{
  name: string
  label: string
  required?: boolean
  children: React.ReactNode
  error?: string
}> = ({ name, label, required, children, error }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
)

export const FormActions: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
    {children}
  </div>
)
```

### 2. 表單輸入組件

```tsx
// src/components/ui/FormInputs.tsx
import React from 'react'
import { cn } from '../../utils/cn'

export const Input: React.FC<{
  id?: string
  name?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  disabled?: boolean
}> = ({ className, ...props }) => (
  <input
    className={cn(
      'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md',
      'text-gray-900 dark:text-white bg-white dark:bg-gray-800',
      'focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )}
    {...props}
  />
)

export const Textarea: React.FC<{
  id?: string
  name?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
  className?: string
}> = ({ className, ...props }) => (
  <textarea
    className={cn(
      'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md',
      'text-gray-900 dark:text-white bg-white dark:bg-gray-800',
      'focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
      'resize-vertical',
      className
    )}
    {...props}
  />
)

export const Select: React.FC<{
  id?: string
  name?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
  className?: string
}> = ({ className, ...props }) => (
  <select
    className={cn(
      'block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md',
      'text-gray-900 dark:text-white bg-white dark:bg-gray-800',
      'focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
      className
    )}
    {...props}
  >
    {props.children}
  </select>
)
```

## 🎴 卡片佈局組件

### 1. 卡片組件

```tsx
// src/components/ui/Card.tsx
import React from 'react'
import { cn } from '../../utils/cn'

export const Card: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <div className={cn(
    'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
    'shadow-sm hover:shadow-md transition-shadow duration-200',
    className
  )}>
    {children}
  </div>
)

export const CardHeader: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}>
    {children}
  </div>
)

export const CardContent: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
)

export const CardFooter: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t border-gray-200 dark:border-gray-700', className)}>
    {children}
  </div>
)
```

### 2. 卡片網格佈局

```tsx
// src/components/ui/CardGrid.tsx
import React from 'react'
import { cn } from '../../utils/cn'

export const CardGrid: React.FC<{
  children: React.ReactNode
  columns?: Record<string, number>
  gap?: number
  className?: string
}> = ({ children, columns = { sm: 1, md: 2, lg: 3, xl: 4 }, gap = 4, className }) => {
  const gridClasses = Object.entries(columns).map(([breakpoint, cols) => {
    return `${breakpoint}:grid-cols-${cols}`
  }).join(' ')
  
  return (
    <div className={cn(
      'grid gap-4',
      gridClasses,
      className
    )}>
      {children}
    </div>
  )
}
```

## 🔧 實用工具組件

### 1. 狀態徽章

```tsx
// src/components/ui/StatusBadge.tsx
import React from 'react'
import { cn } from '../../utils/cn'

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'error'
  children?: React.ReactNode
}

const statusConfig = {
  active: { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-900/30', darkText: 'dark:text-green-300' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-800', darkBg: 'dark:bg-gray-900/30', darkText: 'dark:text-gray-300' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-900/30', darkText: 'dark:text-yellow-300' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-300' },
  error: { bg: 'bg-red-100', text: 'text-red-800', darkBg: 'dark:bg-red-900/30', darkText: 'dark:text-red-300' }
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const config = statusConfig[status]
  
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      config.bg, config.text, config.darkBg, config.darkText
    )}>
      {children || status}
    </span>
  )
}
```

### 2. 操作選單

```tsx
// src/components/ui/ActionMenu.tsx
import React from 'react'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'

interface ActionMenuProps {
  item: any
  actions: Array<{
    label: string
    onClick: (item: any) => void
    variant?: 'default' | 'danger'
  }>
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ item, actions }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <EllipsisVerticalIcon className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick(item)
                setIsOpen(false)
              }}
              className={cn(
                'block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700',
                action.variant === 'danger' && 'text-red-600 hover:text-red-700'
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

## 響應式設計實現

### 1. 響應式容器

```tsx
// src/components/ui/ResponsiveContainer.tsx
import React from 'react'
import { cn } from '../../utils/cn'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const maxWidthClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full'
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className,
  maxWidth = 'xl'
}) => {
  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      maxWidthClasses[maxWidth],
      className
    )}>
      {children}
    </div>
  )
}
```

## 使用示例

### 1. 完整表格示例

```tsx
// 使用 DataTable 組件
<DataTable>
  <TableHeader>
    <TableRow>
      <TableHead>名稱</TableHead>
      <TableHead>類型</TableHead>
      <TableHead>狀態</TableHead>
      <TableHead>操作</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.type}</TableCell>
        <TableCell>
          <StatusBadge status={item.status} />
        </TableCell>
        <TableCell>
          <ActionMenu
            item={item}
            actions={[
              { label: '編輯', onClick: handleEdit },
              { label: '刪除', onClick: handleDelete, variant: 'danger' }
            ]}
          />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</DataTable>
```

### 2. 表單示例

```tsx
// 使用表單組件
<Form onSubmit={handleSubmit}>
  <FormSection title="基本信息">
    <FormField name="name" label="名稱" required>
      <Input placeholder="輸入名稱" />
    </FormField>
    
    <FormField name="description" label="描述">
      <Textarea placeholder="輸入描述" rows={3} />
    </FormField>
  </FormSection>
  
  <FormActions>
    <Button type="submit" variant="primary">保存</Button>
    <Button type="button" variant="secondary">取消</Button>
  </FormActions>
</Form>
```

### 3. 卡片佈局示例

```tsx
// 使用卡片組件
<CardGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}>
  {items.map(item => (
    <Card key={item.id}>
      <CardHeader>
        <h3 className="text-lg font-medium">{item.name}</h3>
        <StatusBadge status={item.status} />
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" size="sm">查看詳情</Button>
        <Button variant="primary" size="sm">編輯</Button>
      </CardFooter>
    </Card>
  ))}
</CardGrid>
```

---

**文檔版本**: v1.0.0  
**最後更新**: 2024-01-15  
**維護者**: ErSlice 開發團隊
