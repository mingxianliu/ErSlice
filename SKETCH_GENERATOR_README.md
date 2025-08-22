# ErSlice Sketch 生成器

## 概述

ErSlice Sketch 生成器是一個強大的工具，可以將 ErSlice 設計模組轉換為標準的 `.sketch` 檔案，這些檔案可以直接匯入到 Figma 中進行進一步的設計和協作。

## 功能特色

### 🎯 核心功能
- **設計模組轉換**: 將 ErSlice 設計模組轉換為 Sketch 檔案
- **標準格式**: 生成完全相容 Figma 的 .sketch 檔案
- **響應式支援**: 支援多設備斷點（桌面、平板、手機）
- **靈活配置**: 可自定義佈局、主題和命名規範

### 🎨 設計支援
- **多種佈局**: 支援網格、Flexbox 和絕對定位佈局
- **主題系統**: 內建設計系統和自定義主題支援
- **組件庫**: 支援按鈕、輸入框、卡片等常見 UI 組件
- **樣式管理**: 完整的顏色、字體、間距和陰影系統

### ⚙️ 技術特性
- **基於 sketch-constructor**: 使用成熟的 Apache 2.0 授權庫
- **TypeScript 支援**: 完整的型別定義和錯誤處理
- **模組化架構**: 清晰的組件渲染器、樣式管理和佈局引擎
- **錯誤處理**: 完善的錯誤處理和用戶回饋

## 快速開始

### 1. 安裝依賴

```bash
npm install sketch-constructor
npm install --save-dev @types/fs-extra @types/jszip
```

### 2. 基本使用

```typescript
import SketchGenerator from '@/services/sketchGenerator/SketchGenerator'

// 建立生成器實例
const generator = new SketchGenerator({
  theme: 'default',
  layout: { type: 'grid', columns: 12, gutter: 16 },
  exportOptions: { format: 'sketch' }
})

// 生成 Sketch 檔案
const sketch = await generator.generateFromModule(designModule)

// 匯出為檔案
await generator.exportToFile('./output.sketch')

// 或匯出為 Buffer
const buffer = await generator.exportToBuffer()
```

### 3. 配置選項

```typescript
const config: GeneratorConfig = {
  theme: 'default', // 或自定義主題
  layout: {
    type: 'grid', // 'grid' | 'flexbox' | 'absolute'
    columns: 12,
    gutter: 16,
    margin: { top: 24, right: 24, bottom: 24, left: 24 }
  },
  exportOptions: {
    format: 'sketch',
    includePreview: true,
    compression: true
  },
  responsive: {
    enabled: true,
    breakpoints: [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 }
    ]
  },
  naming: {
    files: 'kebab-case',
    components: 'PascalCase',
    layers: 'kebab-case'
  }
}
```

## 設計模組結構

### 基本結構

```typescript
interface DesignModule {
  id: string
  name: string
  description?: string
  components: Component[]
  styles: ModuleStyles
  layout: LayoutConfig
  metadata?: any
}
```

### 組件定義

```typescript
interface Component {
  id: string
  name: string
  type: string // 'button', 'input', 'card', etc.
  props: ComponentProps
  styles: ComponentStyles
  children?: Component[]
  layout?: ComponentLayout
}
```

### 樣式系統

```typescript
interface ModuleStyles {
  colors: ColorPalette
  typography: TypographyPalette
  spacing: SpacingPalette
  shadows: ShadowPalette
}
```

## 支援的組件類型

### 基礎組件
- **Button**: 按鈕組件，支援多種變體和尺寸
- **Input**: 輸入框組件，支援文字、數字、搜尋等類型
- **Card**: 卡片組件，支援標題、內容和操作區域

### 佈局組件
- **Container**: 容器組件，支援網格和 Flexbox 佈局
- **Grid**: 網格佈局組件，支援響應式列數
- **Stack**: 堆疊佈局組件，支援垂直和水平排列

### 導航組件
- **Navigation**: 導航組件，支援多級選單
- **Breadcrumb**: 麵包屑導航組件
- **Pagination**: 分頁組件

## 主題系統

### 預設主題

```typescript
const defaultTheme: Theme = {
  name: 'default',
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    danger: '#FF3B30',
    neutral: ['#FFFFFF', '#F2F2F7', '#8E8E93', '#3A3A3C', '#000000']
  },
  typography: {
    fontFamily: 'SF Pro Text',
    fontSizes: [12, 14, 16, 18, 20, 24, 28, 32, 36, 48],
    fontWeights: ['regular', 'medium', 'semibold', 'bold'],
    lineHeights: [16, 20, 24, 28, 32, 36, 40, 44, 48, 64]
  },
  spacing: {
    base: 4,
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    large: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
  }
}
```

### 自定義主題

```typescript
const customTheme: Theme = {
  name: 'custom',
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    success: '#45B7D1',
    warning: '#96CEB4',
    danger: '#FFEAA7',
    neutral: ['#FFFFFF', '#F8F9FA', '#E9ECEF', '#6C757D', '#000000']
  },
  // ... 其他樣式配置
}

generator.setTheme(customTheme)
```

## 響應式設計

### 斷點配置

```typescript
const responsiveConfig: ResponsiveConfig = {
  enabled: true,
  breakpoints: [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 }
  ]
}
```

### 響應式組件

```typescript
// 組件會根據斷點自動調整尺寸和佈局
const responsiveComponent: Component = {
  // ... 基本屬性
  responsive: {
    mobile: { width: 300, height: 40 },
    tablet: { width: 400, height: 48 },
    desktop: { width: 500, height: 56 }
  }
}
```

## 錯誤處理

### 錯誤類型

```typescript
// 生成錯誤
class SketchGenerationError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'SketchGenerationError'
  }
}

// 匯出錯誤
class SketchExportError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'SketchExportError'
  }
}
```

### 錯誤處理範例

```typescript
try {
  const sketch = await generator.generateFromModule(module)
  await generator.exportToFile('./output.sketch')
} catch (error) {
  if (error instanceof SketchGenerationError) {
    console.error('生成失敗:', error.message)
    console.error('原始錯誤:', error.originalError)
  } else if (error instanceof SketchExportError) {
    console.error('匯出失敗:', error.message)
  } else {
    console.error('未知錯誤:', error)
  }
}
```

## 測試

### 執行測試

```bash
# 執行所有測試
npm run test:sketch

# 執行特定測試
npm run test:sketch:basic
npm run test:sketch:responsive
```

### 測試內容

- **基礎功能測試**: 測試生成器初始化、配置和基本生成
- **響應式功能測試**: 測試多斷點畫板生成
- **組件渲染測試**: 測試各種組件類型的渲染
- **樣式應用測試**: 測試主題和樣式系統
- **佈局計算測試**: 測試網格和 Flexbox 佈局

## 開發指南

### 架構概覽

```
SketchGenerator/
├── SketchGenerator.ts          # 核心生成器類別
├── ComponentRenderer.ts        # 組件渲染器
├── StyleManager.ts            # 樣式管理器
├── LayoutEngine.ts            # 佈局引擎
└── types/                     # 型別定義
    ├── components.ts          # 組件相關型別
    ├── styles.ts              # 樣式相關型別
    └── layout.ts              # 佈局相關型別
```

### 擴展組件

```typescript
// 1. 定義新的組件類型
interface CustomComponent extends Component {
  type: 'custom'
  customProps: CustomProps
}

// 2. 實現渲染邏輯
class CustomComponentRenderer {
  render(component: CustomComponent): any {
    // 實現自定義渲染邏輯
    return new CustomSketchElement(component)
  }
}

// 3. 註冊到組件庫
componentLibrary.register('custom', new CustomComponentRenderer())
```

### 擴展樣式

```typescript
// 1. 定義新的樣式屬性
interface ExtendedStyles extends ComponentStyles {
  customEffect: CustomEffect
}

// 2. 實現樣式應用邏輯
class ExtendedStyleManager extends StyleManager {
  applyCustomEffect(element: any, effect: CustomEffect): void {
    // 實現自定義樣式應用
  }
}
```

## 常見問題

### Q: 生成的 Sketch 檔案無法在 Figma 中開啟？

**A**: 確保使用最新版本的 sketch-constructor，並檢查檔案格式是否正確。如果仍有問題，可以嘗試：
1. 檢查 Figma 版本是否支援該 Sketch 檔案格式
2. 使用較簡單的組件結構進行測試
3. 檢查是否有特殊字符或過長的名稱

### Q: 如何處理複雜的響應式佈局？

**A**: 建議使用以下策略：
1. 為每個斷點定義明確的組件尺寸
2. 使用相對單位和比例計算
3. 實現自定義的響應式佈局算法
4. 測試多個斷點下的顯示效果

### Q: 可以匯出為其他格式嗎？

**A**: 目前主要支援 .sketch 格式。如果需要其他格式，可以：
1. 先匯出為 .sketch，然後使用其他工具轉換
2. 擴展生成器支援其他格式
3. 使用第三方轉換工具

## 更新日誌

### v1.0.0 (2024-12-19)
- 🎉 初始版本發布
- ✨ 支援基本的設計模組轉換
- ✨ 實現響應式佈局支援
- ✨ 建立完整的樣式系統
- ✨ 提供靈活的配置選項

## 授權

本專案基於 Apache 2.0 授權條款，與 sketch-constructor 保持一致。

## 貢獻

歡迎提交 Issue 和 Pull Request！請確保：
1. 遵循現有的程式碼風格
2. 添加適當的測試
3. 更新相關文檔
4. 遵循 Apache 2.0 授權條款

## 聯絡方式

如有問題或建議，請：
1. 在 GitHub 上提交 Issue
2. 發送郵件至專案維護者
3. 參與社群討論

---

**注意**: 這是一個開發中的功能，某些特性可能仍在實現中。請查看 TODO 清單了解開發進度。
