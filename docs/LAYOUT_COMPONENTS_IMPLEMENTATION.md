# ErSlice 佈局組件實現指南

## 🎯 概述

本文檔提供 ErSlice 佈局組件的具體實現代碼，包括主佈局、側邊欄、頂部導航等核心佈局組件的完整實現。

## 🏗️ 主佈局組件實現

### 1. MainLayout 組件

```tsx
// src/components/layout/MainLayout.tsx
import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useBreakpoint } from '../../hooks/useBreakpoint'

interface MainLayoutProps {
  className?: string
}

export const MainLayout: React.FC<MainLayoutProps> = ({ className }) => {
  const breakpoint = useBreakpoint()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)

  // 根據斷點自動調整側邊欄狀態
  useEffect(() => {
    if (breakpoint === 'sm' || breakpoint === 'md') {
      setSidebarCollapsed(true)
      setSidebarWidth(64)
    } else {
      setSidebarCollapsed(false)
      setSidebarWidth(280)
    }
  }, [breakpoint])

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed)
    setSidebarWidth(sidebarCollapsed ? 280 : 64)
  }

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* 側邊欄 */}
      <Sidebar
        collapsed={sidebarCollapsed}
        width={sidebarWidth}
        onToggle={handleSidebarToggle}
      />
      
      {/* 主要內容區域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 頂部導航 */}
        <Header
          onSidebarToggle={handleSidebarToggle}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        {/* 頁面內容 */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
```

### 2. 響應式斷點 Hook

```tsx
// src/hooks/useBreakpoint.ts
import { useState, useEffect } from 'react'

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg')

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      if (width < breakpoints.sm) setBreakpoint('sm')
      else if (width < breakpoints.md) setBreakpoint('md')
      else if (width < breakpoints.lg) setBreakpoint('lg')
      else if (width < breakpoints.xl) setBreakpoint('xl')
      else setBreakpoint('2xl')
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}
```

## 側邊欄組件實現

### 1. Sidebar 主組件

```tsx
// src/components/layout/Sidebar.tsx
import React from 'react'
import { SidebarHeader } from './SidebarHeader'
import { SidebarNav } from './SidebarNav'
import { SidebarFooter } from './SidebarFooter'
import { cn } from '../../utils/cn'

interface SidebarProps {
  collapsed: boolean
  width: number
  onToggle: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  width, 
  onToggle 
}) => {
  return (
    <aside
      className={cn(
        'flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
        'transition-all duration-300 ease-in-out',
        'shadow-sm'
      )}
      style={{ width: `${width}px` }}
    >
      {/* 側邊欄頭部 */}
      <SidebarHeader collapsed={collapsed} onToggle={onToggle} />
      
      {/* 側邊欄導航 */}
      <SidebarNav collapsed={collapsed} />
      
      {/* 側邊欄底部 */}
      <SidebarFooter collapsed={collapsed} />
    </aside>
  )
}
```

### 2. SidebarHeader 組件

```tsx
// src/components/layout/SidebarHeader.tsx
import React from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '../../utils/cn'

interface SidebarHeaderProps {
  collapsed: boolean
  onToggle: () => void
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  collapsed, 
  onToggle 
}) => {
  return (
    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
      {/* Logo 區域 */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">ES</span>
        </div>
        
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ErSlice
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              前端切版工具
            </span>
          </div>
        )}
      </div>
      
      {/* 切換按鈕 */}
      <button
        onClick={onToggle}
        className={cn(
          'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700',
          'transition-colors duration-200',
          'text-gray-600 dark:text-gray-300'
        )}
        aria-label={collapsed ? '展開側邊欄' : '收合側邊欄'}
      >
        {collapsed ? (
          <Bars3Icon className="w-5 h-5" />
        ) : (
          <XMarkIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}
```

### 3. SidebarNav 組件

```tsx
// src/components/layout/SidebarNav.tsx
import React from 'react'
import { NavItem } from './NavItem'
import { 
  HomeIcon, 
  FolderIcon, 
  TemplateIcon, 
  SparklesIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

interface SidebarNavProps {
  collapsed: boolean
}

const navigationItems = [
  {
    icon: HomeIcon,
    label: '儀表板',
    to: '/',
    badge: undefined
  },
  {
    icon: FolderIcon,
    label: '設計資產',
    to: '/design-assets',
    badge: 12
  },
  {
    icon: TemplateIcon,
    label: '模板生成',
    to: '/template-generator',
    badge: undefined
  },
  {
    icon: SparklesIcon,
    label: 'AI 說明',
    to: '/ai-spec-generator',
    badge: 3
  },
  {
    icon: Cog6ToothIcon,
    label: '設定',
    to: '/settings',
    badge: undefined
  }
]

export const SidebarNav: React.FC<SidebarNavProps> = ({ collapsed }) => {
  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {navigationItems.map((item) => (
        <NavItem
          key={item.to}
          icon={item.icon}
          label={item.label}
          to={item.to}
          badge={item.badge}
          collapsed={collapsed}
        />
      ))}
    </nav>
  )
}
```

### 4. NavItem 組件

```tsx
// src/components/layout/NavItem.tsx
import React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  to: string
  badge?: string | number
  collapsed: boolean
}

export const NavItem: React.FC<NavItemProps> = ({ 
  icon: Icon, 
  label, 
  to, 
  badge, 
  collapsed 
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        'group flex items-center px-3 py-2 rounded-lg text-sm font-medium',
        'transition-all duration-200',
        'hover:bg-purple-50 dark:hover:bg-purple-900/20',
        'hover:text-purple-700 dark:hover:text-purple-300',
        isActive && 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        !isActive && 'text-gray-700 dark:text-gray-300'
      )}
    >
      {/* 圖標 */}
      <Icon className={cn(
        'flex-shrink-0 w-5 h-5 mr-3',
        'transition-all duration-200'
      )} />
      
      {/* 標籤文字 */}
      {!collapsed && (
        <span className="flex-1">{label}</span>
      )}
      
      {/* 通知徽章 */}
      {!collapsed && badge && (
        <span className={cn(
          'ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
        )}>
          {badge}
        </span>
      )}
      
      {/* 工具提示 (收合狀態) */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {label}
          {badge && (
            <span className="ml-1 text-purple-300">({badge})</span>
          )}
        </div>
      )}
    </NavLink>
  )
}
```

## 🎯 頂部導航組件實現

### 1. Header 主組件

```tsx
// src/components/layout/Header.tsx
import React from 'react'
import { HeaderLeft } from './HeaderLeft'
import { HeaderCenter } from './HeaderCenter'
import { HeaderRight } from './HeaderRight'
import { cn } from '../../utils/cn'

interface HeaderProps {
  onSidebarToggle: () => void
  sidebarCollapsed: boolean
}

export const Header: React.FC<HeaderProps> = ({ 
  onSidebarToggle, 
  sidebarCollapsed 
}) => {
  return (
    <header className={cn(
      'flex items-center justify-between h-16 px-6',
      'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
      'shadow-sm'
    )}>
      {/* 左側區域 */}
      <HeaderLeft 
        onSidebarToggle={onSidebarToggle}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      {/* 中間區域 */}
      <HeaderCenter />
      
      {/* 右側區域 */}
      <HeaderRight />
    </header>
  )
}
```

### 2. HeaderLeft 組件

```tsx
// src/components/layout/HeaderLeft.tsx
import React from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { Breadcrumb } from '../ui/Breadcrumb'
import { cn } from '../../utils/cn'

interface HeaderLeftProps {
  onSidebarToggle: () => void
  sidebarCollapsed: boolean
}

export const HeaderLeft: React.FC<HeaderLeftProps> = ({ 
  onSidebarToggle, 
  sidebarCollapsed 
}) => {
  return (
    <div className="flex items-center space-x-4">
      {/* 側邊欄切換按鈕 (僅在手機版顯示) */}
      <button
        onClick={onSidebarToggle}
        className={cn(
          'lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700',
          'transition-colors duration-200',
          'text-gray-600 dark:text-gray-300'
        )}
        aria-label="切換側邊欄"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>
      
      {/* 麵包屑導航 */}
      <Breadcrumb />
    </div>
  )
}
```

### 3. HeaderCenter 組件

```tsx
// src/components/layout/HeaderCenter.tsx
import React from 'react'
import { SearchBar } from '../ui/SearchBar'
import { QuickActions } from './QuickActions'

export const HeaderCenter: React.FC = () => {
  return (
    <div className="flex-1 max-w-2xl mx-8">
      <div className="flex items-center space-x-4">
        {/* 搜尋欄 */}
        <SearchBar placeholder="搜尋設計資產、模板..." />
        
        {/* 快速操作 */}
        <QuickActions />
      </div>
    </div>
  )
}
```

### 4. HeaderRight 組件

```tsx
// src/components/layout/HeaderRight.tsx
import React from 'react'
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { NotificationMenu } from '../ui/NotificationMenu'
import { UserMenu } from '../ui/UserMenu'

export const HeaderRight: React.FC = () => {
  return (
    <div className="flex items-center space-x-4">
      {/* 通知 */}
      <NotificationMenu>
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-600 dark:text-gray-300">
          <BellIcon className="w-5 h-5" />
        </button>
      </NotificationMenu>
      
      {/* 用戶選單 */}
      <UserMenu>
        <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-600 dark:text-gray-300">
          <UserCircleIcon className="w-6 h-6" />
          <span className="hidden sm:block text-sm font-medium">用戶名稱</span>
        </button>
      </UserMenu>
    </div>
  )
}
```

## 📊 響應式佈局組件

### 1. ResponsiveContainer 組件

```tsx
// src/components/layout/ResponsiveContainer.tsx
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

### 2. ResponsiveGrid 組件

```tsx
// src/components/layout/ResponsiveGrid.tsx
import React from 'react'
import { cn } from '../../utils/cn'

interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: Record<string, number>
  gap?: number
  className?: string
}

const defaultColumns = {
  sm: 1,      // 手機版：1列
  md: 2,      // 平板版：2列
  lg: 3,      // 小桌面：3列
  xl: 4,      // 大桌面：4列
  '2xl': 5    // 超大桌面：5列
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  columns = defaultColumns,
  gap = 4,
  className
}) => {
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

## 佈局工具函數

### 1. 佈局計算工具

```tsx
// src/utils/layoutUtils.ts

/**
 * 計算響應式列數
 */
export const calculateColumns = (breakpoint: string, itemCount: number): number => {
  const columnMap = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 5
  }
  
  const columns = columnMap[breakpoint as keyof typeof columnMap] || 3
  return Math.min(columns, itemCount)
}

/**
 * 計算響應式間距
 */
export const calculateSpacing = (breakpoint: string): number => {
  const spacingMap = {
    sm: 2,    // 8px
    md: 3,    // 12px
    lg: 4,    // 16px
    xl: 6,    // 24px
    '2xl': 8  // 32px
  }
  
  return spacingMap[breakpoint as keyof typeof spacingMap] || 4
}

/**
 * 計算側邊欄寬度
 */
export const calculateSidebarWidth = (collapsed: boolean, breakpoint: string): number => {
  if (breakpoint === 'sm' || breakpoint === 'md') {
    return collapsed ? 64 : 280
  }
  
  return collapsed ? 64 : 280
}

/**
 * 計算內容區域內邊距
 */
export const calculateContentPadding = (breakpoint: string): number => {
  const paddingMap = {
    sm: 4,    // 16px
    md: 6,    // 24px
    lg: 8,    // 32px
    xl: 8,    // 32px
    '2xl': 8  // 32px
  }
  
  return paddingMap[breakpoint as keyof typeof paddingMap] || 8
}
```

### 2. 佈局 Hook

```tsx
// src/hooks/useLayout.ts
import { useState, useEffect } from 'react'
import { useBreakpoint } from './useBreakpoint'
import { 
  calculateSidebarWidth, 
  calculateContentPadding 
} from '../utils/layoutUtils'

export const useLayout = () => {
  const breakpoint = useBreakpoint()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // 計算佈局尺寸
  const sidebarWidth = calculateSidebarWidth(sidebarCollapsed, breakpoint)
  const contentPadding = calculateContentPadding(breakpoint)
  
  // 自動調整側邊欄狀態
  useEffect(() => {
    if (breakpoint === 'sm' || breakpoint === 'md') {
      setSidebarCollapsed(true)
    }
  }, [breakpoint])
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }
  
  return {
    breakpoint,
    sidebarCollapsed,
    sidebarWidth,
    contentPadding,
    toggleSidebar
  }
}
```

## 🔧 佈局組件測試

### 1. MainLayout 測試

```tsx
// src/components/layout/__tests__/MainLayout.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { MainLayout } from '../MainLayout'

// Mock useBreakpoint hook
jest.mock('../../../hooks/useBreakpoint', () => ({
  useBreakpoint: () => 'lg'
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('MainLayout', () => {
  it('應該正確渲染佈局結構', () => {
    renderWithRouter(<MainLayout />)
    
    // 檢查側邊欄是否存在
    expect(screen.getByRole('complementary')).toBeInTheDocument()
    
    // 檢查頂部導航是否存在
    expect(screen.getByRole('banner')).toBeInTheDocument()
    
    // 檢查主要內容區域是否存在
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
  
  it('應該支援自定義 className', () => {
    renderWithRouter(<MainLayout className="custom-class" />)
    
    const layout = screen.getByRole('main').closest('.flex')
    expect(layout).toHaveClass('custom-class')
  })
})
```

### 2. Sidebar 測試

```tsx
// src/components/layout/__tests__/Sidebar.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '../Sidebar'

describe('Sidebar', () => {
  const defaultProps = {
    collapsed: false,
    width: 280,
    onToggle: jest.fn()
  }
  
  it('應該根據 collapsed 狀態調整寬度', () => {
    const { rerender } = render(<Sidebar {...defaultProps} />)
    
    // 展開狀態
    let sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveStyle({ width: '280px' })
    
    // 收合狀態
    rerender(<Sidebar {...defaultProps} collapsed={true} width={64} />)
    sidebar = screen.getByRole('complementary')
    expect(sidebar).toHaveStyle({ width: '64px' })
  })
  
  it('應該在點擊切換按鈕時調用 onToggle', () => {
    const onToggle = jest.fn()
    render(<Sidebar {...defaultProps} onToggle={onToggle} />)
    
    const toggleButton = screen.getByLabelText('展開側邊欄')
    fireEvent.click(toggleButton)
    
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
```

## 📝 使用示例

### 1. 在頁面中使用佈局

```tsx
// src/pages/DesignAssets.tsx
import React from 'react'
import { ResponsiveContainer } from '../components/layout/ResponsiveContainer'
import { ResponsiveGrid } from '../components/layout/ResponsiveGrid'
import { DesignAssetCard } from '../components/DesignAssetCard'

const DesignAssets: React.FC = () => {
  const assets = [/* 設計資產數據 */]
  
  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        {/* 頁面標題 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            設計資產管理
          </h1>
          <button className="btn-primary">新增資產</button>
        </div>
        
        {/* 資產網格 */}
        <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}>
          {assets.map(asset => (
            <DesignAssetCard key={asset.id} asset={asset} />
          ))}
        </ResponsiveGrid>
      </div>
    </ResponsiveContainer>
  )
}
```

### 2. 自定義佈局配置

```tsx
// 自定義響應式網格
<ResponsiveGrid 
  columns={{ sm: 1, md: 2, lg: 4, xl: 6 }}
  gap={6}
  className="p-4"
>
  {/* 內容 */}
</ResponsiveGrid>

// 自定義容器
<ResponsiveContainer 
  maxWidth="2xl"
  className="bg-gray-50 dark:bg-gray-900"
>
  {/* 內容 */}
</ResponsiveContainer>
```

---

**文檔版本**: v1.0.0  
**最後更新**: 2024-01-15  
**維護者**: ErSlice 開發團隊
