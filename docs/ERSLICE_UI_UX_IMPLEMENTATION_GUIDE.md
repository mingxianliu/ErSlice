# ErSlice UI/UX 實作導引（React + Tauri）

> **重要說明**：本專案以 React + Tauri 為主，專注於前端切版說明包生成。所有元件、資料流、API、工具模組設計皆需符合 React + Tauri 技術棧。

# ErSlice 前端元件與資料流分析

## 目錄
- 專案結構
- 主要元件
- 資料流與 API
- 路由設計
- 元件設計說明
- 設計資產管理
- 模板生成系統
- AI 說明生成系統

---

## 專案架構檔案結構（React + Tauri）

```
ErSlice/
├── src/                    # React 前端源碼
│   ├── main.tsx           # React 入口
│   ├── App.tsx            # 主應用元件
│   ├── components/         # 公用元件
│   │   ├── layout/        # 佈局元件
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ResponsiveContainer.tsx
│   │   ├── ui/            # 基礎 UI 元件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── Form.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── business/      # 業務元件
│   │       ├── DesignAssetCard.tsx
│   │       ├── TemplateCard.tsx
│   │       └── AISpecCard.tsx
│   ├── pages/             # 主要頁面
│   │   ├── Dashboard.tsx
│   │   ├── DesignAssets.tsx
│   │   ├── TemplateGenerator.tsx
│   │   └── AISpecGenerator.tsx
│   ├── store/             # 狀態管理（Zustand）
│   │   ├── designAssets.ts
│   │   ├── templates.ts
│   │   └── aiSpecs.ts
│   ├── services/          # 業務邏輯服務
│   │   ├── designAssetService.ts
│   │   ├── templateService.ts
│   │   └── aiSpecGenerator.ts
│   ├── types/             # TypeScript 類型定義
│   │   ├── designAssets.ts
│   │   ├── templates.ts
│   │   └── aiSpec.ts
│   ├── utils/             # 工具模組
│   │   ├── errorHandler.ts
│   │   ├── tauriCommands.ts
│   │   └── cn.ts
│   └── hooks/             # 自定義 Hooks
│       ├── useBreakpoint.ts
│       ├── useLayout.ts
│       └── useToast.ts
├── src-tauri/             # Tauri 後端
│   ├── src/
│   │   ├── main.rs        # Rust 入口
│   │   ├── lib.rs         # 主要邏輯
│   │   └── commands.rs    # Tauri 命令
│   ├── Cargo.toml         # Rust 依賴
│   └── tauri.conf.json    # Tauri 配置
├── public/                 # 靜態資源
├── docs/                   # 文檔
├── package.json            # Node.js 依賴
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── tailwind.config.js     # TailwindCSS 配置
```

---

## 主要元件設計

### 1. 佈局元件

#### MainLayout.tsx
- **功能**: 主佈局容器，管理側邊欄和內容區域
- **Props**: `className?: string`
- **狀態**: `sidebarCollapsed`, `sidebarWidth`
- **交互**: 側邊欄收合/展開，響應式佈局調整

#### Sidebar.tsx
- **功能**: 左側導航欄，包含 Logo、導航項目、用戶資訊
- **Props**: `collapsed: boolean`, `width: number`, `onToggle: () => void`
- **狀態**: 導航項目列表、當前活動項目
- **交互**: 導航切換、收合狀態管理

#### Header.tsx
- **功能**: 頂部導航欄，包含麵包屑、搜尋、用戶操作
- **Props**: `onSidebarToggle: () => void`, `sidebarCollapsed: boolean`
- **狀態**: 當前頁面標題、搜尋關鍵字
- **交互**: 側邊欄切換、全域搜尋、用戶選單

### 2. 業務元件

#### DesignAssetCard.tsx
- **功能**: 設計資產卡片，顯示資產資訊和操作
- **Props**: `asset: DesignAsset`, `onEdit: (id: string) => void`, `onDelete: (id: string) => void`
- **狀態**: 資產詳情、操作選單狀態
- **交互**: 編輯、刪除、預覽、下載

#### TemplateCard.tsx
- **功能**: 模板卡片，顯示模板類型和配置
- **Props**: `template: Template`, `onGenerate: (config: TemplateConfig) => void`
- **狀態**: 模板配置、生成狀態
- **交互**: 配置調整、生成模板、預覽結果

#### AISpecCard.tsx
- **功能**: AI 說明卡片，顯示說明類型和內容
- **Props**: `aiSpec: AISpec`, `onEdit: (id: string) => void`, `onDownload: (format: string) => void`
- **狀態**: 說明內容、下載格式
- **交互**: 編輯內容、下載說明、分享

---

## 資料流與 API

### 1. 設計資產管理

#### 資料結構
```typescript
interface DesignAsset {
  id: string
  name: string
  description: string
  type: 'image' | 'document' | 'mockup' | 'prototype'
  category: string
  tags: string[]
  filePath: string
  thumbnailPath?: string
  metadata: {
    width?: number
    height?: number
    fileSize: number
    lastModified: Date
  }
  status: 'active' | 'archived' | 'draft'
  createdAt: Date
  updatedAt: Date
}
```

#### API 規格
- `GET /api/design-assets` - 取得所有設計資產
- `POST /api/design-assets` - 創建新設計資產
- `PUT /api/design-assets/:id` - 更新設計資產
- `DELETE /api/design-assets/:id` - 刪除設計資產
- `POST /api/design-assets/upload` - 上傳設計資產檔案

#### 前端交互流程
1. 用戶進入「設計資產」頁面，系統載入資產列表
2. 點擊「新增資產」開啟上傳表單，選擇檔案、填寫資訊
3. 上傳完成後，資產顯示於列表，支援搜尋和篩選
4. 點擊資產卡片可編輯、刪除、預覽

### 2. 模板生成系統

#### 資料結構
```typescript
interface Template {
  id: string
  name: string
  category: TemplateCategory
  complexity: TemplateComplexity
  description: string
  features: string[]
  previewImage?: string
  configSchema: TemplateConfigSchema
  examples: TemplateExample[]
  createdAt: Date
  updatedAt: Date
}

interface TemplateConfig {
  templateId: string
  designAssetIds: string[]
  outputOptions: {
    html: boolean
    css: boolean
    responsive: boolean
    javascript: boolean
  }
  customizations: Record<string, any>
}
```

#### API 規格
- `GET /api/templates` - 取得所有模板
- `GET /api/templates/:id` - 取得特定模板詳情
- `POST /api/templates/generate` - 生成模板
- `GET /api/templates/:id/preview` - 預覽模板

#### 前端交互流程
1. 用戶選擇模板類型和複雜度
2. 選擇相關設計資產
3. 配置輸出選項（HTML、CSS、響應式、JavaScript）
4. 生成模板，顯示結果和下載選項

### 3. AI 說明生成系統

#### 資料結構
```typescript
interface AISpec {
  id: string
  type: AISpecType
  complexity: AISpecComplexity
  title: string
  content: AISpecContent
  designAssetIds: string[]
  templateId?: string
  outputFormats: AISpecFormat[]
  metadata: {
    estimatedTime: string
    difficulty: string
    prerequisites: string[]
  }
  createdAt: Date
  updatedAt: Date
}

interface AISpecContent {
  overview: string
  requirements: string[]
  steps: AISpecStep[]
  codeExamples: CodeExample[]
  bestPractices: string[]
  commonIssues: string[]
  testing: string[]
}
```

#### API 規格
- `GET /api/ai-specs` - 取得所有 AI 說明
- `POST /api/ai-specs/generate` - 生成 AI 說明
- `PUT /api/ai-specs/:id` - 更新 AI 說明
- `DELETE /api/ai-specs/:id` - 刪除 AI 說明
- `GET /api/ai-specs/:id/download/:format` - 下載特定格式

#### 前端交互流程
1. 用戶選擇 AI 說明類型和複雜度
2. 選擇相關設計資產和模板
3. 配置輸出格式（Markdown、HTML、YAML、代碼片段）
4. 生成 AI 說明，支援預覽和多格式下載

---

## 路由設計

### 主要路由結構
```typescript
const routes = [
  {
    path: '/',
    element: <Dashboard />,
    meta: { title: '儀表板' }
  },
  {
    path: '/design-assets',
    element: <DesignAssets />,
    meta: { title: '設計資產' }
  },
  {
    path: '/template-generator',
    element: <TemplateGenerator />,
    meta: { title: '模板生成' }
  },
  {
    path: '/ai-spec-generator',
    element: <AISpecGenerator />,
    meta: { title: 'AI 說明生成' }
  },
  {
    path: '/settings',
    element: <Settings />,
    meta: { title: '設定' }
  }
]
```

### 路由守衛
- 身份驗證檢查
- 權限驗證
- 路由元資訊處理
- 404 錯誤處理

---

## 狀態管理（Zustand）

### 1. 設計資產 Store

```typescript
interface DesignAssetsStore {
  // 狀態
  assets: DesignAsset[]
  loading: boolean
  error: string | null
  selectedAsset: DesignAsset | null
  filters: {
    category: string
    tags: string[]
    status: string
    search: string
  }
  
  // 操作
  fetchAssets: () => Promise<void>
  addAsset: (asset: Omit<DesignAsset, 'id'>) => Promise<void>
  updateAsset: (id: string, updates: Partial<DesignAsset>) => Promise<void>
  deleteAsset: (id: string) => Promise<void>
  setSelectedAsset: (asset: DesignAsset | null) => void
  updateFilters: (filters: Partial<DesignAssetsStore['filters']>) => void
}
```

### 2. 模板 Store

```typescript
interface TemplatesStore {
  // 狀態
  templates: Template[]
  loading: boolean
  error: string | null
  selectedTemplate: Template | null
  generatedResults: TemplateGenerationResult[]
  
  // 操作
  fetchTemplates: () => Promise<void>
  selectTemplate: (template: Template) => void
  generateTemplate: (config: TemplateConfig) => Promise<TemplateGenerationResult>
  clearResults: () => void
}
```

### 3. AI 說明 Store

```typescript
interface AISpecsStore {
  // 狀態
  aiSpecs: AISpec[]
  loading: boolean
  error: string | null
  selectedSpec: AISpec | null
  generationConfig: AISpecConfig
  
  // 操作
  fetchAISpecs: () => Promise<void>
  generateAISpec: (config: AISpecConfig) => Promise<AISpec>
  updateSpec: (id: string, updates: Partial<AISpec>) => Promise<void>
  deleteSpec: (id: string) => Promise<void>
  setGenerationConfig: (config: Partial<AISpecConfig>) => void
}
```

---

## 響應式設計實現

### 1. 斷點系統
```typescript
const breakpoints = {
  sm: 640,    // 手機
  md: 768,    // 平板
  lg: 1024,   // 小桌面
  xl: 1280,   // 桌面
  '2xl': 1536 // 大桌面
}
```

### 2. 響應式佈局組件
- `ResponsiveContainer`: 自適應容器，支援不同最大寬度
- `ResponsiveGrid`: 響應式網格，根據斷點調整列數
- `ResponsiveTable`: 響應式表格，小螢幕自動隱藏次要列

### 3. 移動端優化
- 觸控友好的按鈕大小
- 手勢支援（滑動、縮放）
- 移動端專用導航（漢堡菜單）

---

## 無障礙設計

### 1. 鍵盤導航
- Tab 鍵順序優化
- 快捷鍵支援
- 焦點管理

### 2. 螢幕閱讀器支援
- ARIA 標籤
- 語義化 HTML
- 替代文字

### 3. 色彩對比
- WCAG AA 標準
- 深色模式支援
- 高對比模式

---

## 性能優化

### 1. 代碼分割
- 路由級別代碼分割
- 組件懶加載
- 動態導入

### 2. 虛擬滾動
- 大型列表優化
- 視窗化渲染
- 記憶化組件

### 3. 快取策略
- API 響應快取
- 組件狀態快取
- 圖片懶加載

---

## 測試策略

### 1. 單元測試
- 組件測試（React Testing Library）
- 工具函數測試
- Store 測試

### 2. 整合測試
- 頁面流程測試
- API 整合測試
- 用戶操作測試

### 3. E2E 測試
- 完整用戶流程
- 跨瀏覽器測試
- 性能測試

---

## 開發工作流程

### 1. 組件開發流程
1. 設計組件 API 和 Props
2. 實現組件邏輯和 UI
3. 添加 TypeScript 類型
4. 編寫測試用例
5. 文檔和示例

### 2. 功能開發流程
1. 定義資料結構和 API
2. 實現 Store 和服務
3. 創建頁面和組件
4. 整合測試和優化
5. 文檔更新

### 3. 品質保證
- 代碼審查
- 自動化測試
- 性能監控
- 無障礙檢查

---

## 文檔維護

### 1. 組件文檔
- Props 說明
- 使用示例
- 最佳實踐
- 常見問題

### 2. API 文檔
- 端點說明
- 請求/響應格式
- 錯誤處理
- 認證方式

### 3. 開發指南
- 快速開始
- 架構說明
- 貢獻指南
- 故障排除

---

## TODO

- [ ] 實現基礎佈局組件
- [ ] 創建設計資產管理頁面
- [ ] 實現模板生成系統
- [ ] 開發 AI 說明生成功能
- [ ] 添加響應式設計支援
- [ ] 實現狀態管理 Store
- [ ] 編寫測試用例
- [ ] 完善文檔系統

---

## 工作日誌

### 2024-01-15
- ✅ 完成專案架構設計
- ✅ 建立基礎組件結構
- ✅ 配置 React + TypeScript + TailwindCSS
- ✅ 實現 AI 說明生成系統
- ✅ 創建前端介面設計指南
- 🔄 規劃佈局組件實現
- 🔄 設計資料介面組件

### 下一步計劃
- 實現主佈局組件
- 創建設計資產管理介面
- 完善響應式設計
- 添加測試覆蓋

---

**文檔版本**: v1.0.0  
**最後更新**: 2024-01-15  
**維護者**: ErSlice 開發團隊
