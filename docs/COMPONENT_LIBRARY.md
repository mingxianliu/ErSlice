# ErSlice 組件庫

> 本文檔詳細說明 ErSlice 專案中所有可用的 React 組件，包括 Props、使用示例和最佳實踐。

## 📋 目錄

- [概述](#概述)
- [佈局組件](#佈局組件)
- [基礎 UI 組件](#基礎-ui-組件)
- [表單組件](#表單組件)
- [數據展示組件](#數據展示組件)
- [業務組件](#業務組件)
- [工具組件](#工具組件)
- [組件開發指南](#組件開發指南)

---

## 概述

### 組件設計原則
- **一致性**: 統一的設計語言和交互模式
- **可重用性**: 高度可配置和可組合的組件
- **可訪問性**: 支援無障礙設計和鍵盤導航
- **性能**: 優化渲染性能和包大小

### 技術棧
- **框架**: React 18 + TypeScript
- **樣式**: TailwindCSS
- **圖標**: Heroicons
- **動畫**: Framer Motion
- **狀態管理**: Zustand

---

## 佈局組件

### MainLayout

主佈局容器，管理側邊欄和內容區域。

#### Props
```typescript
interface MainLayoutProps {
  className?: string
}
```

#### 使用示例
```tsx
import { MainLayout } from '@/components/layout/MainLayout'

function App() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
```

### Sidebar

左側導航欄，包含 Logo、導航項目、用戶資訊。

#### Props
```typescript
interface SidebarProps {
  collapsed: boolean
  width: number
  onToggle: () => void
}
```

#### 使用示例
```tsx
import { Sidebar } from '@/components/layout/Sidebar'

function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  
  return (
    <Sidebar
      collapsed={collapsed}
      width={collapsed ? 64 : 280}
      onToggle={() => setCollapsed(!collapsed)}
    />
  )
}
```

### Header

頂部導航欄，包含麵包屑、搜尋、用戶操作。

#### Props
```typescript
interface HeaderProps {
  onSidebarToggle: () => void
  sidebarCollapsed: boolean
}
```

#### 使用示例
```tsx
import { Header } from '@/components/layout/Header'

function Layout() {
  return (
    <Header
      onSidebarToggle={handleSidebarToggle}
      sidebarCollapsed={sidebarCollapsed}
    />
  )
}
```

### ResponsiveContainer

響應式容器，支援不同最大寬度。

#### Props
```typescript
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}
```

#### 使用示例
```tsx
import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer'

function Page() {
  return (
    <ResponsiveContainer maxWidth="xl">
      <div className="space-y-6">
        <h1>頁面標題</h1>
        <p>頁面內容...</p>
      </div>
    </ResponsiveContainer>
  )
}
```

### ResponsiveGrid

響應式網格，根據斷點調整列數。

#### Props
```typescript
interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: Record<string, number>
  gap?: number
  className?: string
}
```

#### 使用示例
```tsx
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid'

function AssetGrid() {
  return (
    <ResponsiveGrid 
      columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
      gap={6}
    >
      {assets.map(asset => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </ResponsiveGrid>
  )
}
```

---

## 基礎 UI 組件

### Button

按鈕組件，支援多種樣式和狀態。

#### Props
```typescript
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}
```

#### 使用示例
```tsx
import { Button } from '@/components/ui/Button'

function Actions() {
  return (
    <div className="space-x-2">
      <Button variant="primary" onClick={handleSave}>
        保存
      </Button>
      <Button variant="outline" onClick={handleCancel}>
        取消
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        刪除
      </Button>
    </div>
  )
}
```

### Card

卡片組件，用於內容分組和展示。

#### Props
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}
```

#### 使用示例
```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'

function AssetCard({ asset }) {
  return (
    <Card hoverable>
      <CardHeader>
        <h3 className="text-lg font-medium">{asset.name}</h3>
        <p className="text-gray-600">{asset.description}</p>
      </CardHeader>
      
      <CardContent>
        <img src={asset.thumbnail} alt={asset.name} />
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" size="sm">查看詳情</Button>
        <Button variant="primary" size="sm">編輯</Button>
      </CardFooter>
    </Card>
  )
}
```

### StatusBadge

狀態徽章，用於顯示狀態信息。

#### Props
```typescript
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'error'
  children?: React.ReactNode
  className?: string
}
```

#### 使用示例
```tsx
import { StatusBadge } from '@/components/ui/StatusBadge'

function AssetStatus({ asset }) {
  return (
    <div className="flex items-center space-x-2">
      <span>狀態:</span>
      <StatusBadge status={asset.status}>
        {asset.status === 'active' ? '啟用' : '停用'}
      </StatusBadge>
    </div>
  )
}
```

---

## 表單組件

### Form

表單容器組件。

#### Props
```typescript
interface FormProps {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  className?: string
}
```

#### 使用示例
```tsx
import { Form, FormSection, FormField, FormActions } from '@/components/ui/Form'

function AssetForm({ asset, onSubmit }) {
  return (
    <Form onSubmit={onSubmit}>
      <FormSection title="基本信息">
        <FormField name="name" label="名稱" required>
          <Input 
            defaultValue={asset?.name}
            placeholder="輸入資產名稱"
          />
        </FormField>
        
        <FormField name="description" label="描述">
          <Textarea 
            defaultValue={asset?.description}
            placeholder="輸入資產描述"
            rows={3}
          />
        </FormField>
      </FormSection>
      
      <FormActions>
        <Button type="submit" variant="primary">保存</Button>
        <Button type="button" variant="secondary">取消</Button>
      </FormActions>
    </Form>
  )
}
```

### Input

輸入框組件。

#### Props
```typescript
interface InputProps {
  id?: string
  name?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  disabled?: boolean
  error?: string
}
```

#### 使用示例
```tsx
import { Input } from '@/components/ui/FormInputs'

function SearchInput({ value, onChange }) {
  return (
    <Input
      type="search"
      placeholder="搜尋設計資產..."
      value={value}
      onChange={onChange}
      className="w-full max-w-md"
    />
  )
}
```

### Select

下拉選擇組件。

#### Props
```typescript
interface SelectProps {
  id?: string
  name?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}
```

#### 使用示例
```tsx
import { Select } from '@/components/ui/FormInputs'

function CategorySelect({ value, onChange }) {
  return (
    <Select value={value} onChange={onChange}>
      <option value="">選擇分類</option>
      <option value="ui">UI 組件</option>
      <option value="icon">圖標</option>
      <option value="illustration">插圖</option>
    </Select>
  )
}
```

---

## 數據展示組件

### DataTable

數據表格組件，支援排序、篩選、分頁。

#### Props
```typescript
interface DataTableProps {
  children: React.ReactNode
  className?: string
}
```

#### 使用示例
```tsx
import { 
  DataTable, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/DataTable'

function AssetsTable({ assets }) {
  return (
    <DataTable>
      <TableHeader>
        <TableRow>
          <TableHead>名稱</TableHead>
          <TableHead>類型</TableHead>
          <TableHead>分類</TableHead>
          <TableHead>狀態</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      
      <TableBody>
        {assets.map(asset => (
          <TableRow key={asset.id}>
            <TableCell>{asset.name}</TableCell>
            <TableCell>{asset.type}</TableCell>
            <TableCell>{asset.category}</TableCell>
            <TableCell>
              <StatusBadge status={asset.status} />
            </TableCell>
            <TableCell>
              <ActionMenu asset={asset} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  )
}
```

### Pagination

分頁組件。

#### Props
```typescript
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}
```

#### 使用示例
```tsx
import { Pagination } from '@/components/ui/TableFeatures'

function AssetsList({ assets, pagination }) {
  return (
    <div className="space-y-4">
      <DataTable>
        {/* 表格內容 */}
      </DataTable>
      
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
```

---

## 業務組件

### DesignAssetCard

設計資產卡片組件。

#### Props
```typescript
interface DesignAssetCardProps {
  asset: DesignAsset
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onPreview: (id: string) => void
  className?: string
}
```

#### 使用示例
```tsx
import { DesignAssetCard } from '@/components/business/DesignAssetCard'

function AssetsGrid({ assets }) {
  const handleEdit = (id: string) => {
    // 處理編輯邏輯
  }
  
  const handleDelete = (id: string) => {
    // 處理刪除邏輯
  }
  
  const handlePreview = (id: string) => {
    // 處理預覽邏輯
  }
  
  return (
    <ResponsiveGrid>
      {assets.map(asset => (
        <DesignAssetCard
          key={asset.id}
          asset={asset}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPreview={handlePreview}
        />
      ))}
    </ResponsiveGrid>
  )
}
```

### TemplateCard

模板卡片組件。

#### Props
```typescript
interface TemplateCardProps {
  template: Template
  onGenerate: (config: TemplateConfig) => void
  onPreview: (id: string) => void
  className?: string
}
```

#### 使用示例
```tsx
import { TemplateCard } from '@/components/business/TemplateCard'

function TemplatesGrid({ templates }) {
  const handleGenerate = (config: TemplateConfig) => {
    // 處理模板生成邏輯
  }
  
  const handlePreview = (id: string) => {
    // 處理預覽邏輯
  }
  
  return (
    <ResponsiveGrid>
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          onGenerate={handleGenerate}
          onPreview={handlePreview}
        />
      ))}
    </ResponsiveGrid>
  )
}
```

### AISpecCard

AI 說明卡片組件。

#### Props
```typescript
interface AISpecCardProps {
  aiSpec: AISpec
  onEdit: (id: string) => void
  onDownload: (format: string) => void
  onShare: (id: string) => void
  className?: string
}
```

#### 使用示例
```tsx
import { AISpecCard } from '@/components/business/AISpecCard'

function AISpecsGrid({ aiSpecs }) {
  const handleEdit = (id: string) => {
    // 處理編輯邏輯
  }
  
  const handleDownload = (format: string) => {
    // 處理下載邏輯
  }
  
  const handleShare = (id: string) => {
    // 處理分享邏輯
  }
  
  return (
    <ResponsiveGrid>
      {aiSpecs.map(aiSpec => (
        <AISpecCard
          key={aiSpec.id}
          aiSpec={aiSpec}
          onEdit={handleEdit}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      ))}
    </ResponsiveGrid>
  )
}
```

---

## 工具組件

### ActionMenu

操作選單組件。

#### Props
```typescript
interface ActionMenuProps {
  item: any
  actions: Array<{
    label: string
    onClick: (item: any) => void
    variant?: 'default' | 'danger'
    icon?: React.ComponentType<{ className?: string }>
  }>
  className?: string
}
```

#### 使用示例
```tsx
import { ActionMenu } from '@/components/ui/ActionMenu'

function AssetActions({ asset }) {
  const actions = [
    {
      label: '編輯',
      onClick: (item) => handleEdit(item.id),
      icon: PencilIcon
    },
    {
      label: '刪除',
      onClick: (item) => handleDelete(item.id),
      variant: 'danger',
      icon: TrashIcon
    }
  ]
  
  return (
    <ActionMenu item={asset} actions={actions} />
  )
}
```

### Toast

通知組件。

#### Props
```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose?: () => void
}
```

#### 使用示例
```tsx
import { useToast } from '@/components/ui/Toast'

function AssetForm({ onSubmit }) {
  const { showToast } = useToast()
  
  const handleSubmit = async (data) => {
    try {
      await onSubmit(data)
      showToast({
        type: 'success',
        title: '成功',
        message: '資產保存成功'
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: '錯誤',
        message: '保存失敗，請重試'
      })
    }
  }
  
  return (
    <Form onSubmit={handleSubmit}>
      {/* 表單內容 */}
    </Form>
  )
}
```

---

## 組件開發指南

### 創建新組件

#### 1. 組件結構
```tsx
// src/components/ui/NewComponent.tsx
import React from 'react'
import { cn } from '@/utils/cn'

interface NewComponentProps {
  children: React.ReactNode
  className?: string
  // 其他 props
}

export const NewComponent: React.FC<NewComponentProps> = ({ 
  children, 
  className,
  // 其他 props
}) => {
  return (
    <div className={cn('base-classes', className)}>
      {children}
    </div>
  )
}
```

#### 2. 組件測試
```tsx
// src/components/ui/__tests__/NewComponent.test.tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { NewComponent } from '../NewComponent'

describe('NewComponent', () => {
  it('應該正確渲染子元素', () => {
    render(<NewComponent>測試內容</NewComponent>)
    expect(screen.getByText('測試內容')).toBeInTheDocument()
  })
  
  it('應該支援自定義 className', () => {
    render(<NewComponent className="custom-class">內容</NewComponent>)
    expect(screen.getByText('內容').closest('div')).toHaveClass('custom-class')
  })
})
```

#### 3. 組件文檔
```tsx
// 在組件頂部添加 JSDoc 註解
/**
 * 新組件
 * 
 * @example
 * ```tsx
 * <NewComponent className="custom-class">
 *   組件內容
 * </NewComponent>
 * ```
 */
export const NewComponent: React.FC<NewComponentProps> = ({ ... }) => {
  // 組件實現
}
```

### 組件最佳實踐

#### 1. Props 設計
- 使用 TypeScript 介面定義 Props
- 提供合理的預設值
- 支援 className 自定義
- 使用 children 支援內容插槽

#### 2. 樣式設計
- 使用 TailwindCSS 類名
- 支援深色模式
- 響應式設計
- 無障礙支援

#### 3. 性能優化
- 使用 React.memo 避免不必要的重渲染
- 使用 useCallback 和 useMemo 優化回調
- 支援虛擬滾動（大型列表）

#### 4. 可訪問性
- 添加 ARIA 標籤
- 支援鍵盤導航
- 提供替代文字
- 色彩對比符合標準

---

## 組件狀態

| 組件名稱 | 狀態 | 最後更新 | 維護者 |
|---------|------|----------|--------|
| MainLayout | ✅ 完成 | 2024-01-15 | AI Assistant |
| Sidebar | ✅ 完成 | 2024-01-15 | AI Assistant |
| Header | ✅ 完成 | 2024-01-15 | AI Assistant |
| ResponsiveContainer | ✅ 完成 | 2024-01-15 | AI Assistant |
| ResponsiveGrid | ✅ 完成 | 2024-01-15 | AI Assistant |
| Button | ✅ 完成 | 2024-01-15 | AI Assistant |
| Card | ✅ 完成 | 2024-01-15 | AI Assistant |
| StatusBadge | ✅ 完成 | 2024-01-15 | AI Assistant |
| Form | ✅ 完成 | 2024-01-15 | AI Assistant |
| Input | ✅ 完成 | 2024-01-15 | AI Assistant |
| Select | ✅ 完成 | 2024-01-15 | AI Assistant |
| DataTable | ✅ 完成 | 2024-01-15 | AI Assistant |
| Pagination | ✅ 完成 | 2024-01-15 | AI Assistant |
| DesignAssetCard | 🔄 進行中 | - | - |
| TemplateCard | 🔄 進行中 | - | - |
| AISpecCard | 🔄 進行中 | - | - |
| ActionMenu | ✅ 完成 | 2024-01-15 | AI Assistant |
| Toast | ✅ 完成 | 2024-01-15 | AI Assistant |

**狀態說明**: ✅ 完成 | 🔄 進行中 | ⏳ 計劃中 | ❌ 需要更新

---

## 下一步行動

### 立即需要完成的組件
1. **DesignAssetCard** - 設計資產卡片組件
2. **TemplateCard** - 模板卡片組件  
3. **AISpecCard** - AI 說明卡片組件

### 組件優化建議
1. 添加更多動畫效果
2. 完善深色模式支援
3. 增加更多自定義選項
4. 提升組件性能

---

**文檔版本**: v1.0.0  
**最後更新**: 2024-01-15  
**維護者**: ErSlice 開發團隊
