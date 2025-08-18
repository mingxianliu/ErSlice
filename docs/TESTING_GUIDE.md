# ErSlice 測試指南

> 本文檔詳細說明 ErSlice 專案的測試策略、測試用例編寫方法、測試覆蓋率要求和最佳實踐。

## 📋 目錄

- [概述](#概述)
- [測試策略](#測試策略)
- [測試環境配置](#測試環境配置)
- [單元測試](#單元測試)
- [組件測試](#組件測試)
- [整合測試](#整合測試)
- [E2E 測試](#e2e-測試)
- [測試最佳實踐](#測試最佳實踐)
- [測試覆蓋率](#測試覆蓋率)
- [故障排除](#故障排除)

---

## 概述

### 測試目標
- **品質保證**: 確保代碼品質和功能正確性
- **回歸測試**: 防止新功能破壞現有功能
- **文檔**: 測試用例作為活文檔
- **重構信心**: 支援安全的重構和優化

### 測試金字塔
```
    /\
   /  \     E2E 測試 (少量)
  /____\    
 /      \  整合測試 (適量)
/________\ 單元測試 (大量)
```

### 技術棧
- **測試框架**: Vitest
- **測試環境**: jsdom
- **組件測試**: React Testing Library
- **E2E 測試**: Playwright
- **覆蓋率**: @vitest/coverage-v8

---

## 測試策略

### 1. 測試優先級

#### 高優先級 (必須測試)
- 核心業務邏輯
- 用戶交互功能
- 數據處理和驗證
- 錯誤處理機制

#### 中優先級 (建議測試)
- 工具函數
- 狀態管理
- API 整合
- 組件渲染

#### 低優先級 (可選測試)
- 靜態組件
- 樣式相關
- 第三方庫整合

### 2. 測試類型分配

| 測試類型 | 比例 | 說明 |
|---------|------|------|
| 單元測試 | 70% | 函數、組件、工具 |
| 整合測試 | 20% | 組件互動、API 調用 |
| E2E 測試 | 10% | 完整用戶流程 |

### 3. 測試環境

#### 開發環境
- 快速反饋
- 增量測試
- 調試友好

#### CI/CD 環境
- 完整測試套件
- 覆蓋率報告
- 自動化執行

---

## 測試環境配置

### 1. Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### 2. 測試設置文件

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Tauri API
global.__TAURI__ = {
  invoke: vi.fn(),
  event: {
    listen: vi.fn(),
    emit: vi.fn()
  }
}

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))
```

### 3. 測試工具函數

```typescript
// src/test/utils.tsx
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'

const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

---

## 單元測試

### 1. 工具函數測試

```typescript
// src/utils/__tests__/cn.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from '../cn'

describe('cn 工具函數', () => {
  it('應該正確合併 class 名稱', () => {
    const result = cn('base-class', 'additional-class', 'another-class')
    expect(result).toBe('base-class additional-class another-class')
  })

  it('應該過濾 falsy 值', () => {
    const result = cn('base-class', false && 'hidden-class', null, undefined, 'visible-class')
    expect(result).toBe('base-class visible-class')
  })

  it('應該處理條件類名', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class active-class')
  })

  it('應該處理對象條件類名', () => {
    const result = cn('base-class', {
      'active-class': true,
      'disabled-class': false,
      'error-class': true
    })
    expect(result).toBe('base-class active-class error-class')
  })
})
```

### 2. 服務層測試

```typescript
// src/services/__tests__/aiSpecGenerator.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AISpecGenerator } from '../aiSpecGenerator'
import type { AISpecConfig, AISpecType } from '@/types/aiSpec'

describe('AISpecGenerator', () => {
  let generator: AISpecGenerator

  beforeEach(() => {
    generator = new AISpecGenerator()
  })

  describe('generateAISpec', () => {
    it('應該根據配置生成正確的 AI 說明', () => {
      const config: AISpecConfig = {
        type: 'basic' as AISpecType,
        complexity: 'simple',
        designAssetIds: ['asset1', 'asset2'],
        outputFormats: ['markdown'],
        additionalContext: '測試上下文'
      }

      const result = generator.generateAISpec(config)

      expect(result).toBeDefined()
      expect(result.type).toBe('basic')
      expect(result.complexity).toBe('simple')
      expect(result.content.overview).toContain('測試上下文')
    })

    it('應該處理複雜度為 medium 的配置', () => {
      const config: AISpecConfig = {
        type: 'responsive-design' as AISpecType,
        complexity: 'medium',
        designAssetIds: ['asset1'],
        outputFormats: ['markdown', 'html']
      }

      const result = generator.generateAISpec(config)

      expect(result.content.steps).toHaveLength(5)
      expect(result.content.requirements).toHaveLength(3)
      expect(result.outputFormats).toEqual(['markdown', 'html'])
    })

    it('應該處理複雜度為 complex 的配置', () => {
      const config: AISpecConfig = {
        type: 'full-guide' as AISpecType,
        complexity: 'complex',
        designAssetIds: ['asset1', 'asset2', 'asset3'],
        outputFormats: ['markdown', 'html', 'yaml']
      }

      const result = generator.generateAISpec(config)

      expect(result.content.steps).toHaveLength(8)
      expect(result.content.codeExamples).toHaveLength(5)
      expect(result.content.bestPractices).toHaveLength(4)
    })
  })

  describe('錯誤處理', () => {
    it('應該在無效配置時拋出錯誤', () => {
      const invalidConfig = {
        type: 'invalid-type' as AISpecType,
        complexity: 'simple',
        designAssetIds: [],
        outputFormats: []
      }

      expect(() => {
        generator.generateAISpec(invalidConfig)
      }).toThrow('不支援的 AI 說明類型')
    })
  })
})
```

---

## 組件測試

### 1. 基礎組件測試

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button 組件', () => {
  it('應該正確渲染按鈕文字', () => {
    render(<Button>點擊我</Button>)
    expect(screen.getByRole('button', { name: '點擊我' })).toBeInTheDocument()
  })

  it('應該在點擊時調用 onClick 回調', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>點擊我</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('應該支援不同的變體樣式', () => {
    const { rerender } = render(<Button variant="primary">主要按鈕</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-purple-600')

    rerender(<Button variant="secondary">次要按鈕</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-gray-600')

    rerender(<Button variant="danger">危險按鈕</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-600')
  })

  it('應該支援不同的尺寸', () => {
    const { rerender } = render(<Button size="sm">小按鈕</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3 py-1.5 text-sm')

    rerender(<Button size="lg">大按鈕</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-6 py-3 text-lg')
  })

  it('應該在禁用狀態下不響應點擊', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>禁用按鈕</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('應該支援自定義 className', () => {
    render(<Button className="custom-class">自定義按鈕</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})
```

### 2. 複雜組件測試

```typescript
// src/components/business/__tests__/DesignAssetCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DesignAssetCard } from '../DesignAssetCard'
import type { DesignAsset } from '@/types/designAssets'

const mockAsset: DesignAsset = {
  id: 'asset_123',
  name: '測試設計資產',
  description: '這是一個測試用的設計資產',
  type: 'mockup',
  category: 'ui',
  tags: ['button', 'form'],
  filePath: '/uploads/test.sketch',
  thumbnailPath: '/thumbnails/test.png',
  metadata: {
    width: 1200,
    height: 800,
    fileSize: 2048576,
    lastModified: new Date('2024-01-15')
  },
  status: 'active',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15')
}

describe('DesignAssetCard 組件', () => {
  const defaultProps = {
    asset: mockAsset,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onPreview: vi.fn()
  }

  it('應該正確顯示資產信息', () => {
    render(<DesignAssetCard {...defaultProps} />)
    
    expect(screen.getByText('測試設計資產')).toBeInTheDocument()
    expect(screen.getByText('這是一個測試用的設計資產')).toBeInTheDocument()
    expect(screen.getByText('ui')).toBeInTheDocument()
    expect(screen.getByText('button')).toBeInTheDocument()
    expect(screen.getByText('form')).toBeInTheDocument()
  })

  it('應該顯示縮略圖', () => {
    render(<DesignAssetCard {...defaultProps} />)
    
    const thumbnail = screen.getByAltText('測試設計資產')
    expect(thumbnail).toBeInTheDocument()
    expect(thumbnail).toHaveAttribute('src', '/thumbnails/test.png')
  })

  it('應該在點擊編輯按鈕時調用 onEdit', () => {
    render(<DesignAssetCard {...defaultProps} />)
    
    fireEvent.click(screen.getByText('編輯'))
    expect(defaultProps.onEdit).toHaveBeenCalledWith('asset_123')
  })

  it('應該在點擊刪除按鈕時調用 onDelete', () => {
    render(<DesignAssetCard {...defaultProps} />)
    
    fireEvent.click(screen.getByText('刪除'))
    expect(defaultProps.onDelete).toHaveBeenCalledWith('asset_123')
  })

  it('應該在點擊預覽按鈕時調用 onPreview', () => {
    render(<DesignAssetCard {...defaultProps} />)
    
    fireEvent.click(screen.getByText('預覽'))
    expect(defaultProps.onPreview).toHaveBeenCalledWith('asset_123')
  })

  it('應該根據狀態顯示正確的狀態徽章', () => {
    render(<DesignAssetCard {...defaultProps} />)
    
    const statusBadge = screen.getByText('啟用')
    expect(statusBadge).toBeInTheDocument()
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('應該支援自定義 className', () => {
    render(<DesignAssetCard {...defaultProps} className="custom-card" />)
    
    const card = screen.getByText('測試設計資產').closest('.custom-card')
    expect(card).toBeInTheDocument()
  })
})
```

---

## 整合測試

### 1. 頁面組件測試

```typescript
// src/pages/__tests__/DesignAssets.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DesignAssets } from '../DesignAssets'
import { useDesignAssets } from '@/store/designAssets'

// Mock store
vi.mock('@/store/designAssets', () => ({
  useDesignAssets: vi.fn()
}))

describe('DesignAssets 頁面', () => {
  const mockAssets = [
    {
      id: 'asset_1',
      name: '資產 1',
      description: '描述 1',
      type: 'mockup',
      category: 'ui',
      status: 'active'
    },
    {
      id: 'asset_2',
      name: '資產 2',
      description: '描述 2',
      type: 'icon',
      category: 'icon',
      status: 'draft'
    }
  ]

  const mockStore = {
    assets: mockAssets,
    loading: false,
    error: null,
    fetchAssets: vi.fn(),
    addAsset: vi.fn(),
    updateAsset: vi.fn(),
    deleteAsset: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useDesignAssets as any).mockReturnValue(mockStore)
  })

  it('應該在載入時顯示資產列表', () => {
    render(<DesignAssets />)
    
    expect(screen.getByText('資產 1')).toBeInTheDocument()
    expect(screen.getByText('資產 2')).toBeInTheDocument()
  })

  it('應該在點擊新增按鈕時顯示表單', async () => {
    render(<DesignAssets />)
    
    fireEvent.click(screen.getByText('新增資產'))
    
    await waitFor(() => {
      expect(screen.getByText('創建設計資產')).toBeInTheDocument()
    })
  })

  it('應該支援搜尋功能', () => {
    render(<DesignAssets />)
    
    const searchInput = screen.getByPlaceholderText('搜尋設計資產...')
    fireEvent.change(searchInput, { target: { value: '資產 1' } })
    
    expect(screen.getByText('資產 1')).toBeInTheDocument()
    expect(screen.queryByText('資產 2')).not.toBeInTheDocument()
  })

  it('應該支援分類篩選', () => {
    render(<DesignAssets />)
    
    const categorySelect = screen.getByLabelText('分類')
    fireEvent.change(categorySelect, { target: { value: 'ui' } })
    
    expect(screen.getByText('資產 1')).toBeInTheDocument()
    expect(screen.queryByText('資產 2')).not.toBeInTheDocument()
  })

  it('應該在刪除資產時顯示確認對話框', async () => {
    render(<DesignAssets />)
    
    const deleteButtons = screen.getAllByText('刪除')
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(screen.getByText('確認刪除')).toBeInTheDocument()
      expect(screen.getByText('確定要刪除這個設計資產嗎？')).toBeInTheDocument()
    })
  })
})
```

### 2. 狀態管理測試

```typescript
// src/store/__tests__/designAssets.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDesignAssets } from '../designAssets'
import { createDesignAssetsStore } from '../designAssets'

describe('設計資產 Store', () => {
  let store: ReturnType<typeof createDesignAssetsStore>

  beforeEach(() => {
    store = createDesignAssetsStore()
    vi.clearAllMocks()
  })

  it('應該初始化為空狀態', () => {
    const { result } = renderHook(() => useDesignAssets())
    
    expect(result.current.assets).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('應該能夠添加資產', async () => {
    const { result } = renderHook(() => useDesignAssets())
    
    const newAsset = {
      name: '新資產',
      description: '新描述',
      type: 'mockup' as const,
      category: 'ui',
      tags: ['button']
    }

    await act(async () => {
      await result.current.addAsset(newAsset)
    })

    expect(result.current.assets).toHaveLength(1)
    expect(result.current.assets[0].name).toBe('新資產')
    expect(result.current.assets[0].id).toBeDefined()
  })

  it('應該能夠更新資產', async () => {
    const { result } = renderHook(() => useDesignAssets())
    
    // 先添加資產
    const newAsset = {
      name: '原資產',
      description: '原描述',
      type: 'mockup' as const,
      category: 'ui',
      tags: []
    }

    await act(async () => {
      await result.current.addAsset(newAsset)
    })

    const assetId = result.current.assets[0].id

    // 更新資產
    await act(async () => {
      await result.current.updateAsset(assetId, {
        name: '更新後的資產',
        description: '更新後的描述'
      })
    })

    expect(result.current.assets[0].name).toBe('更新後的資產')
    expect(result.current.assets[0].description).toBe('更新後的描述')
  })

  it('應該能夠刪除資產', async () => {
    const { result } = renderHook(() => useDesignAssets())
    
    // 先添加資產
    const newAsset = {
      name: '要刪除的資產',
      description: '描述',
      type: 'mockup' as const,
      category: 'ui',
      tags: []
    }

    await act(async () => {
      await result.current.addAsset(newAsset)
    })

    expect(result.current.assets).toHaveLength(1)

    const assetId = result.current.assets[0].id

    // 刪除資產
    await act(async () => {
      await result.current.deleteAsset(assetId)
    })

    expect(result.current.assets).toHaveLength(0)
  })

  it('應該能夠更新篩選條件', () => {
    const { result } = renderHook(() => useDesignAssets())
    
    act(() => {
      result.current.updateFilters({
        category: 'ui',
        search: '按鈕',
        tags: ['button']
      })
    })

    expect(result.current.filters.category).toBe('ui')
    expect(result.current.filters.search).toBe('按鈕')
    expect(result.current.filters.tags).toEqual(['button'])
  })
})
```

---

## E2E 測試

### 1. Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:1420',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run tauri:dev',
    url: 'http://localhost:1420',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
```

### 2. E2E 測試用例

```typescript
// tests/e2e/design-assets.spec.ts
import { test, expect } from '@playwright/test'

test.describe('設計資產管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/design-assets')
  })

  test('應該能夠瀏覽設計資產列表', async ({ page }) => {
    // 檢查頁面標題
    await expect(page.getByRole('heading', { name: '設計資產管理' })).toBeVisible()
    
    // 檢查新增按鈕
    await expect(page.getByRole('button', { name: '新增資產' })).toBeVisible()
    
    // 檢查搜尋框
    await expect(page.getByPlaceholder('搜尋設計資產...')).toBeVisible()
  })

  test('應該能夠創建新的設計資產', async ({ page }) => {
    // 點擊新增按鈕
    await page.getByRole('button', { name: '新增資產' }).click()
    
    // 填寫表單
    await page.getByLabel('名稱').fill('測試設計資產')
    await page.getByLabel('描述').fill('這是一個測試用的設計資產')
    await page.getByLabel('類型').selectOption('mockup')
    await page.getByLabel('分類').selectOption('ui')
    await page.getByLabel('標籤').fill('button,form,test')
    
    // 上傳檔案
    await page.setInputFiles('input[type="file"]', {
      name: 'test.sketch',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('test file content')
    })
    
    // 提交表單
    await page.getByRole('button', { name: '創建' }).click()
    
    // 檢查成功消息
    await expect(page.getByText('設計資產創建成功')).toBeVisible()
    
    // 檢查資產是否出現在列表中
    await expect(page.getByText('測試設計資產')).toBeVisible()
  })

  test('應該能夠編輯設計資產', async ({ page }) => {
    // 假設已經有一個資產
    const editButton = page.getByRole('button', { name: '編輯' }).first()
    await editButton.click()
    
    // 修改名稱
    await page.getByLabel('名稱').fill('更新後的資產名稱')
    
    // 保存
    await page.getByRole('button', { name: '保存' }).click()
    
    // 檢查成功消息
    await expect(page.getByText('設計資產更新成功')).toBeVisible()
    
    // 檢查名稱是否更新
    await expect(page.getByText('更新後的資產名稱')).toBeVisible()
  })

  test('應該能夠刪除設計資產', async ({ page }) => {
    // 假設已經有一個資產
    const deleteButton = page.getByRole('button', { name: '刪除' }).first()
    await deleteButton.click()
    
    // 確認刪除
    await page.getByRole('button', { name: '確認刪除' }).click()
    
    // 檢查成功消息
    await expect(page.getByText('設計資產刪除成功')).toBeVisible()
  })

  test('應該能夠搜尋和篩選資產', async ({ page }) => {
    // 搜尋
    await page.getByPlaceholder('搜尋設計資產...').fill('按鈕')
    await page.keyboard.press('Enter')
    
    // 檢查搜尋結果
    await expect(page.getByText('按鈕組件')).toBeVisible()
    
    // 分類篩選
    await page.getByLabel('分類').selectOption('ui')
    
    // 檢查篩選結果
    await expect(page.getByText('UI 組件')).toBeVisible()
  })
})
```

---

## 測試最佳實踐

### 1. 測試命名規範

```typescript
// 好的測試命名
describe('Button 組件', () => {
  it('應該在點擊時調用 onClick 回調')
  it('應該支援不同的變體樣式')
  it('應該在禁用狀態下不響應點擊')
})

// 不好的測試命名
describe('Button', () => {
  it('works')
  it('renders correctly')
  it('handles click')
})
```

### 2. 測試結構

```typescript
describe('組件名稱', () => {
  // 準備階段
  beforeEach(() => {
    // 設置測試環境
  })

  // 測試用例
  describe('功能描述', () => {
    it('應該在正常情況下...', () => {
      // 準備
      // 執行
      // 驗證
    })

    it('應該在異常情況下...', () => {
      // 準備
      // 執行
      // 驗證
    })
  })

  // 清理階段
  afterEach(() => {
    // 清理測試環境
  })
})
```

### 3. 測試數據管理

```typescript
// 使用工廠函數創建測試數據
const createMockAsset = (overrides: Partial<DesignAsset> = {}): DesignAsset => ({
  id: 'asset_123',
  name: '測試資產',
  description: '測試描述',
  type: 'mockup',
  category: 'ui',
  tags: ['test'],
  filePath: '/uploads/test.sketch',
  thumbnailPath: '/thumbnails/test.png',
  metadata: {
    width: 1200,
    height: 800,
    fileSize: 2048576,
    lastModified: new Date('2024-01-15')
  },
  status: 'active',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  ...overrides
})

// 在測試中使用
it('應該顯示資產信息', () => {
  const asset = createMockAsset({ name: '自定義名稱' })
  render(<DesignAssetCard asset={asset} />)
  
  expect(screen.getByText('自定義名稱')).toBeInTheDocument()
})
```

---

## 測試覆蓋率

### 1. 覆蓋率目標

| 類型 | 目標 | 說明 |
|------|------|------|
| 語句覆蓋率 | 80%+ | 代碼執行路徑 |
| 分支覆蓋率 | 75%+ | 條件分支覆蓋 |
| 函數覆蓋率 | 85%+ | 函數調用覆蓋 |
| 行覆蓋率 | 80%+ | 代碼行覆蓋 |

### 2. 覆蓋率報告

```bash
# 運行測試並生成覆蓋率報告
npm run test:coverage

# 查看 HTML 報告
open coverage/index.html
```

### 3. 覆蓋率配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.tsx',
        'src/App.tsx'
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 85,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

---

## 故障排除

### 1. 常見問題

#### 測試環境問題
```bash
# 清理測試快取
npm run test:clear

# 重新安裝依賴
rm -rf node_modules package-lock.json
npm install
```

#### 組件渲染問題
```typescript
// 檢查是否正確 mock 了依賴
vi.mock('@/store/designAssets', () => ({
  useDesignAssets: vi.fn()
}))

// 檢查測試環境設置
import '@testing-library/jest-dom'
```

#### 異步測試問題
```typescript
// 使用 waitFor 等待異步操作
await waitFor(() => {
  expect(screen.getByText('加載完成')).toBeInTheDocument()
})

// 使用 act 包裝狀態更新
await act(async () => {
  await result.current.fetchAssets()
})
```

### 2. 調試技巧

```typescript
// 在測試中添加調試信息
it('應該正確渲染', () => {
  const { debug } = render(<Component />)
  debug() // 輸出 DOM 結構
  
  // 或者使用 screen.debug()
  screen.debug()
})
```

---

## 測試腳本

### 1. package.json 腳本

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:clear": "vitest --clearCache",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

### 2. CI/CD 配置

```yaml
# .github/workflows/test.yml
name: 測試

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: 設置 Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: 安裝依賴
      run: npm ci
    
    - name: 運行測試
      run: npm run test:run
    
    - name: 生成覆蓋率報告
      run: npm run test:coverage
    
    - name: 上傳覆蓋率報告
      uses: codecov/codecov-action@v3
```

---

## 下一步行動

### 立即需要完成的測試
1. **組件測試**: 完成所有 UI 組件的測試
2. **業務邏輯測試**: 測試服務層和狀態管理
3. **整合測試**: 測試頁面組件和用戶流程
4. **E2E 測試**: 設置 Playwright 和關鍵流程測試

### 測試優化建議
1. 提高測試覆蓋率到目標水平
2. 優化測試執行速度
3. 添加性能測試
4. 完善錯誤處理測試

---

**文檔版本**: v1.0.0  
**最後更新**: 2024-01-15  
**維護者**: ErSlice 開發團隊
