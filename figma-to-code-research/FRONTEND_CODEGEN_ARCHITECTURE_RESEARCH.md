# 前端代碼生成架構研究報告

## 研究目標

為 ErSlice 設計一個能夠從設計稿資產生成多框架前端代碼的架構系統，支援 Vue、React、Angular、React Native、Flutter、SwiftUI、Kotlin 以及純 HTML 等多種輸出格式。

---

## 核心架構模式研究

### 1. 抽象語法樹 (AST) 轉換模式

#### 概念
設計稿 → 中間抽象表示 → 目標代碼

#### 核心要素
- **統一中間表示層**：將視覺設計抽象為與框架無關的數據結構
- **轉換器系統**：針對每個目標框架的專門轉換邏輯
- **組件化思維**：以組件為基本生成單位

#### 架構分層
```
輸入層 (Figma Assets) 
    ↓
解析層 (Visual Parser)
    ↓ 
抽象層 (Universal Interface Description)
    ↓
生成層 (Framework Generators)
    ↓
輸出層 (Target Code Files)
```

### 2. 插件化生成系統

#### 概念
模組化的代碼生成管道，每個環節都可以插拔替換

#### 核心要素
- **管道式處理**：輸入 → 插件1 → 插件2 → ... → 輸出
- **插件註冊機制**：動態載入和配置不同的處理插件
- **鉤子系統**：在生成過程中的關鍵節點允許自定義邏輯

#### 管道架構
```
Input → Parser Plugin → Transform Plugin → Style Plugin → Output Plugin → Result
```

### 3. 模板驅動生成模式

#### 概念
使用可配置的模板系統來生成不同框架的代碼結構

#### 核心要素
- **模板引擎**：支援條件邏輯、循環、變數替換的模板系統
- **模板庫**：針對不同框架和組件類型的模板集合
- **數據綁定**：將解析後的設計數據綁定到模板變數

#### 模板系統
```
設計數據 + 框架模板 → 模板引擎 → 生成代碼
```

---

## 技術實現策略研究

### 1. 視覺元素解析策略

#### SVG 轉換處理
- **SVG AST 解析**：將 SVG 元素解析為抽象語法樹
- **屬性標準化**：統一不同設計工具的屬性命名
- **優化處理**：移除冗餘屬性、優化路徑數據
- **組件化封裝**：將 SVG 封裝為可重用的組件

#### 樣式提取與轉換
- **CSS 屬性抽取**：從設計稿中提取顏色、字體、間距等
- **響應式適配**：根據不同螢幕尺寸生成相應的樣式規則
- **樣式系統統一**：建立統一的樣式表示格式
- **框架適配**：轉換為各框架的樣式系統（CSS-in-JS、Styled Components 等）

### 2. 組件生成策略

#### 組件抽象模型
```typescript
interface UniversalComponent {
  name: string
  type: 'container' | 'element' | 'text' | 'image'
  properties: Record<string, any>
  styles: StyleDefinition
  children: UniversalComponent[]
  events: EventHandler[]
  states: StateDefinition[]
}
```

#### 層級關係處理
- **巢狀結構**：正確處理組件的父子關係
- **佈局系統**：支援 Flexbox、Grid 等現代佈局方式
- **定位邏輯**：處理絕對定位、相對定位等複雜佈局

### 3. 多框架適配策略

#### 框架差異抽象
- **生命週期統一**：抽象不同框架的生命週期概念
- **狀態管理統一**：統一狀態變數的宣告和更新模式
- **事件處理統一**：統一事件綁定和處理的語法差異

#### 語法轉換映射
```typescript
// 統一的事件表示
interface UniversalEvent {
  type: 'click' | 'change' | 'submit'
  handler: string
  params?: string[]
}

// 轉換為不同框架語法
const reactSyntax = `onClick={${event.handler}}`
const vueSyntax = `@click="${event.handler}"`
const angularSyntax = `(click)="${event.handler}()"`
```

---

## 代碼生成管道設計

### 1. 解析階段 (Parsing Phase)

#### 輸入處理
- **多格式支援**：支援 PNG、SVG、JSON 等多種輸入格式
- **元數據提取**：從檔案名稱、目錄結構中提取組織資訊
- **設計令牌識別**：自動識別顏色、字體、間距等設計令牌

#### 結構分析
- **視覺層級分析**：分析視覺元素的層級關係
- **佈局模式識別**：識別常見的佈局模式（列表、卡片、表單等）
- **組件邊界檢測**：自動檢測可重用的組件邊界

### 2. 轉換階段 (Transformation Phase)

#### 數據標準化
- **尺寸單位統一**：統一使用相對單位或響應式單位
- **命名規範化**：轉換為符合編程慣例的命名
- **類型推斷**：推斷組件的類型和所需的屬性

#### 邏輯注入
- **互動邏輯生成**：根據設計稿推斷可能的互動邏輯
- **狀態管理注入**：為動態組件注入狀態管理邏輯
- **校驗規則生成**：為表單組件生成基本的校驗規則

### 3. 生成階段 (Generation Phase)

#### 代碼結構生成
- **檔案結構規劃**：生成符合框架慣例的檔案結構
- **依賴管理**：自動生成必要的 import/export 語句
- **類型定義**：為 TypeScript 項目生成類型定義

#### 程式碼品質保證
- **語法校驗**：確保生成的代碼語法正確
- **格式化處理**：使用 Prettier 等工具格式化代碼
- **最佳實踐應用**：應用框架的最佳實踐和慣例

---

## 輸出格式策略

### 1. Web 框架支援

#### React 系列
- **標準 React**：使用 Hooks 和函數組件
- **React Native**：移動端適配，使用原生組件映射
- **Next.js**：支援 SSR/SSG 特性

#### Vue 系列
- **Vue 3 Composition API**：使用現代 Vue 語法
- **Nuxt.js**：支援全棧框架特性
- **Vue 2 Options API**：向後相容支援

#### Angular
- **Angular 組件**：使用 TypeScript 和裝飾器語法
- **Angular Material**：整合 Material Design 組件

### 2. 原生移動端支援

#### Flutter
- **Widget 結構**：轉換為 Flutter Widget 樹
- **Material/Cupertino**：支援不同的設計語言
- **響應式佈局**：使用 Flutter 的響應式佈局組件

#### 原生平台
- **SwiftUI**：iOS 原生開發
- **Kotlin Compose**：Android 原生開發
- **平台特性適配**：利用各平台的特有功能

### 3. 標準 Web 技術

#### 純 HTML/CSS
- **語義化 HTML**：生成語義化的 HTML 結構
- **現代 CSS**：使用 Flexbox、Grid、CSS Variables
- **漸進增強**：確保基本功能在所有瀏覽器中可用

---

## 可擴展性設計

### 1. 插件系統架構

#### 插件接口定義
```typescript
interface CodeGenPlugin {
  name: string
  version: string
  execute(input: any, config: any): Promise<any>
  validate(input: any): boolean
}
```

#### 插件類型
- **解析插件**：擴展輸入格式支援
- **轉換插件**：添加新的轉換邏輯
- **生成插件**：支援新的輸出框架
- **後處理插件**：代碼優化和格式化

### 2. 配置系統

#### 分層配置
- **全域配置**：影響整個生成過程的設定
- **框架配置**：特定框架的客製化設定
- **項目配置**：單一項目的特殊需求

#### 配置項目
```typescript
interface GenerationConfig {
  target: Framework[]
  styleSystem: 'css' | 'css-in-js' | 'styled-components'
  naming: 'camelCase' | 'kebab-case' | 'PascalCase'
  typescript: boolean
  responsive: boolean
  optimization: boolean
}
```

---

## 實現建議

### 1. 開發優先級

#### 第一階段：核心架構
1. 建立統一的中間表示格式
2. 實現基礎的解析和生成管道
3. 支援 React 和 Vue 兩個主要框架

#### 第二階段：功能擴展
1. 添加樣式系統支援
2. 實現響應式佈局生成
3. 支援更多框架 (Angular, React Native)

#### 第三階段：高級特性
1. 智能組件識別
2. 互動邏輯推斷
3. 原生移動端支援

### 2. 技術選型建議

#### 核心技術棧
- **解析引擎**：基於 AST 的解析器
- **模板引擎**：支援條件和循環的模板系統
- **插件系統**：基於事件驅動的插件架構
- **配置管理**：分層的配置系統

#### 外部依賴
- **代碼格式化**：整合 Prettier
- **語法校驗**：整合 ESLint/TSLint
- **型別檢查**：整合 TypeScript

---

## 總結

透過研究業界成熟的代碼生成工具，我們可以歸納出以下關鍵成功因素：

1. **抽象層設計**：統一的中間表示是多框架支援的基礎
2. **插件化架構**：模組化設計確保系統的可擴展性
3. **模板驅動**：靈活的模板系統降低維護成本
4. **代碼品質**：自動化的格式化和校驗確保輸出品質
5. **框架適配**：深度理解各框架特性並適當抽象

這些原則將指導我們設計出一個強大、靈活且易於維護的 ErSlice 代碼生成系統。