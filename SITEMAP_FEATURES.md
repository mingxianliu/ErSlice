# ErSlice 站點圖功能文件

ErSlice 提供了一套完整的站點圖（Sitemap）管理系統，讓您可以有效管理專案的頁面結構、生成視覺化圖表，並進行深度分析。本文檔將詳細介紹所有站點圖相關功能。

## 目錄

1. [概述](#概述)
2. [核心功能](#核心功能)
3. [頁面管理](#頁面管理)
4. [Mermaid 圖表生成](#mermaid-圖表生成)
5. [自訂主題與布局](#自訂主題與布局)
6. [匯出與匯入](#匯出與匯入)
7. [分析與指標](#分析與指標)
8. [API 參考](#api-參考)
9. [最佳實踐](#最佳實踐)

## 概述

ErSlice 的站點圖系統支援兩層結構：
- **模組（Modules）**: 頂層組織單位，用於分類相關功能
- **頁面（Pages）**: 模組內的主要頁面
- **子頁面（Subpages）**: 頁面下的次級頁面

每個頁面都可以包含豐富的元資料，包括標題、狀態、路由、備註等，並支援自動 CRUD 操作生成。

## 核心功能

### CRUD 操作支援

ErSlice 提供完整的 CRUD（Create, Read, Update, Delete）操作：

#### Create（創建）
- `createModulePage(moduleName, slug)`: 創建新頁面
- `createSubpage(moduleName, parentSlug, slug)`: 創建子頁面
- `applyCrudSubpages(moduleName, parentSlug)`: 自動生成 CRUD 子頁面

#### Read（讀取）
- `getModulePages(moduleName)`: 獲取模組所有頁面
- `getModuleTree(moduleName)`: 獲取完整頁面樹狀結構

#### Update（更新）
- `updatePageMeta(moduleName, slug, meta)`: 更新頁面元資料
- `updateSubpageMeta(moduleName, parentSlug, slug, meta)`: 更新子頁面元資料
- `setPageOrder(moduleName, order)`: 設定頁面順序
- `setSubpageOrder(moduleName, parentSlug, order)`: 設定子頁面順序
- `renameModulePage(moduleName, fromSlug, toSlug)`: 重新命名頁面
- `renameSubpage(moduleName, parentSlug, fromSlug, toSlug)`: 重新命名子頁面

#### Delete（刪除）
- `deleteModulePage(moduleName, slug)`: 刪除頁面
- `deleteSubpage(moduleName, parentSlug, slug)`: 刪除子頁面

### 頁面元資料

每個頁面都支援以下元資料字段：

```typescript
interface PageMetaUpdate {
  title?: string      // 頁面標題
  status?: string     // 頁面狀態 (active, draft, archived, review, completed)
  route?: string      // 路由路徑
  notes?: string      // 備註
  path?: string       // 檔案路徑
  domain?: string     // 業務域
  area?: string       // 功能區域
  component?: string  // 組件名稱
  action?: string     // 操作類型
  class?: string      // CSS 類別覆蓋
  links?: LinkMeta[]  // 相關連結
}
```

## 頁面管理

### 增強的使用者介面

#### 搜尋與篩選
- **文字搜尋**: 依頁面名稱或標題搜尋
- **狀態篩選**: 依頁面狀態篩選顯示

#### 批次操作
- **多選功能**: 使用複選框選擇多個頁面
- **批次刪除**: 一次刪除多個頁面
- **批次狀態更新**: 一次更新多個頁面的狀態
- **全選/取消全選**: 快速選擇所有篩選後的頁面

#### 拖放排序
- **視覺化拖放**: 直接拖拉頁面調整順序
- **即時反饋**: 拖放過程中提供視覺化反饋
- **自動儲存**: 順序變更後自動儲存到後端

#### 快速操作
- **內聯編輯**: 直接在列表中重新命名頁面
- **一鍵生成**: 快速生成 CRUD 子頁面
- **元資料編輯**: 使用專用modal編輯詳細資訊

### 批次創建

支援使用逗號分隔的方式批次創建頁面：

```
list,detail,create,edit,delete
```

這將創建五個頁面：list、detail、create、edit、delete。

## Mermaid 圖表生成

### 支援的圖表類型

1. **專案站點圖**: 完整專案的頁面結構圖
2. **模組站點圖**: 特定模組的頁面結構圖  
3. **模組 CRUD 圖**: 模組的 CRUD 操作流程圖
4. **頁面站點圖**: 單一頁面的詳細結構圖

### 生成方式

```typescript
// 生成專案站點圖
const result = await generateProjectMermaid()

// 生成 HTML 格式的站點圖
const htmlPath = await generateProjectMermaidHtml()
const moduleHtmlPath = await generateModuleMermaidHtml('user')
const crudHtmlPath = await generateModuleCrudMermaidHtml('user')
const pageHtmlPath = await generatePageMermaidHtml('user', 'profile')
```

### 圖表特色

- **分層顯示**: 清楚顯示模組、頁面、子頁面的層級關係
- **狀態標示**: 不同顏色標示頁面狀態
- **類別樣式**: 支援自訂 CSS 類別覆蓋
- **互動式 HTML**: 生成的 HTML 圖表支援縮放和互動

## 自訂主題與布局

### 主題選項

支援多種 Mermaid 主題：
- `default`: 預設主題
- `dark`: 深色主題  
- `forest`: 森林主題
- `neutral`: 中性主題

### 布局方向

支援多種布局方向：
- `TD`: 上到下（Top-Down）
- `LR`: 左到右（Left-Right）
- `BT`: 下到上（Bottom-Top）
- `RL`: 右到左（Right-Left）

### 設定方法

```typescript
// 更新 Mermaid 選項
await updateMermaidOptions({
  theme: 'dark',
  layout_direction: 'LR'
})

// 獲取當前選項
const options = await getMermaidOptions()
```

設定會自動儲存到專案配置中，影響後續所有圖表生成。

## 匯出與匯入

### 匯出功能

將整個站點圖結構匯出為 JSON 格式：

```typescript
const exportPath = await exportSitemap()
```

匯出的檔案包含：
- 專案資訊
- 所有模組資料
- 完整頁面結構
- 元資料資訊
- 匯出時間戳記

### 匯入功能

從 JSON 檔案匯入站點圖：

```typescript
const result = await importSitemap('/path/to/sitemap.json')
```

匯入功能支援：
- 結構驗證
- 衝突處理
- 增量更新
- 錯誤回復

### 資料格式

```typescript
interface SitemapExport {
  project_name: string
  export_timestamp: string
  modules: ModuleExport[]
}

interface ModuleExport {
  name: string
  description: string
  pages: PageExport[]
}

interface PageExport {
  slug: string
  title?: string
  status?: string
  route?: string
  notes?: string
  subpages: SubpageExport[]
}
```

## 分析與指標

### 綜合分析

站點圖分析功能提供深入的專案結構洞察：

```typescript
const analytics = await analyzeSitemap()
```

### 分析指標

#### 基本統計
- 模組總數
- 頁面總數  
- 子頁面總數
- 平均每模組頁面數

#### 結構分析
- 最大深度層級
- 複雜結構模組識別
- 孤立頁面檢測
- 模組完成度分析

#### 狀態分布
- 各狀態頁面數量統計
- 完成度百分比
- 待處理項目識別

#### 資產覆蓋率
- 包含截圖的頁面數
- 包含 HTML 的頁面數
- 包含 CSS 的頁面數
- 各模組完成度評分

### 分析報告界面

分析結果通過專用的 modal 界面展示：
- **專案概覽**: 關鍵數字概覽
- **結構分析**: 深度和複雜度資訊
- **完成度指標**: 進度條和百分比
- **狀態分布**: 各狀態統計圖表
- **模組詳情**: 各模組完成度排名
- **需關注項目**: 孤立頁面和問題識別

## API 參考

### 頁面管理 API

```typescript
// 頁面創建
createModulePage(moduleName: string, slug: string): Promise<PageInfo>
createSubpage(moduleName: string, parentSlug: string, slug: string): Promise<PageInfo>

// 頁面讀取
getModulePages(moduleName: string): Promise<PageInfo[]>
getModuleTree(moduleName: string): Promise<PageNode[]>

// 頁面更新
updatePageMeta(moduleName: string, slug: string, meta: PageMetaUpdate): Promise<string>
setPageOrder(moduleName: string, order: string[]): Promise<string>

// 頁面刪除
deleteModulePage(moduleName: string, slug: string): Promise<string>
```

### Mermaid 生成 API

```typescript
// 圖表生成
generateProjectMermaid(): Promise<MermaidResult>
generateProjectMermaidHtml(): Promise<string>
generateModuleMermaidHtml(module: string): Promise<string>
generateModuleCrudMermaidHtml(module: string): Promise<string>
generatePageMermaidHtml(module: string, page: string): Promise<string>

// 主題設定
getMermaidOptions(): Promise<MermaidOptions>
updateMermaidOptions(options: Partial<MermaidOptions>): Promise<TauriProjectConfig>
```

### 匯出入 API

```typescript
// 匯出匯入
exportSitemap(): Promise<string>
importSitemap(filePath: string): Promise<string>

// 分析
analyzeSitemap(): Promise<SitemapAnalytics>
```

## 最佳實踐

### 命名規範

#### 頁面命名
- 使用 kebab-case: `user-profile`, `order-history`
- 保持簡潔明確
- 避免特殊字符

#### 狀態管理
建議使用標準狀態：
- `draft`: 草稿階段
- `active`: 活躍使用
- `review`: 審核中
- `completed`: 已完成
- `archived`: 已封存

### 結構組織

#### 模組分割
- 依功能域分割模組
- 每個模組包含 5-15 個頁面為佳
- 避免過深的巢狀結構（建議不超過 2 層）

#### 頁面組織
- 相關頁面放在同一模組
- 使用 CRUD 模式組織操作頁面
- 主要頁面優先，細節頁面放在子層級

### 元資料管理

#### 必填欄位建議
- `title`: 提供清晰的頁面標題
- `status`: 明確標示頁面狀態
- `route`: 定義前端路由

#### 選填欄位運用
- `domain`: 標示業務領域
- `component`: 記錄對應的組件名稱
- `notes`: 記錄特殊說明或待辦事項

### 工作流程建議

1. **初始設定**
   - 配置 Mermaid 主題和布局
   - 建立基本模組結構

2. **頁面創建**
   - 使用批次創建功能快速建立頁面
   - 立即設定基本元資料

3. **結構調整**
   - 使用拖放功能調整順序
   - 定期檢查和優化結構

4. **進度追蹤**
   - 定期執行分析功能
   - 根據分析結果調整工作重點

5. **備份管理**
   - 定期匯出站點圖
   - 重要變更前先備份

## 故障排除

### 常見問題

#### 圖表不顯示
- 檢查 Mermaid 主題設定
- 確認頁面結構完整性
- 檢查瀏覽器控制台錯誤

#### 匯入失敗
- 檢查 JSON 檔案格式
- 確認檔案完整性
- 檢查權限設定

#### 拖放不生效
- 確認 Tauri 環境正常
- 檢查頁面是否處於編輯模式
- 重新載入頁面後重試

### 效能優化

- 大型專案建議分模組管理
- 定期清理無用的頁面
- 避免過深的巢狀結構
- 適當使用頁面篩選功能

---

此文檔持續更新中，如有問題或建議，請聯繫開發團隊。