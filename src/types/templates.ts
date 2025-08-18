// ErSlice 模板類型定義

// 基礎模板類型
export interface BaseTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  complexity: TemplateComplexity
  estimatedTime: string
  tags: string[]
  preview?: string
}

// 模板分類
export enum TemplateCategory {
  DATA_DISPLAY = 'data-display',      // 數據展示
  DATA_INPUT = 'data-input',          // 數據輸入
  NAVIGATION = 'navigation',          // 導航
  LAYOUT = 'layout',                  // 佈局
  FEEDBACK = 'feedback',              // 反饋
  DATA_VISUALIZATION = 'data-viz',    // 數據可視化
  ECOMMERCE = 'ecommerce',            // 電商
  DASHBOARD = 'dashboard',            // 儀表板
  AUTH = 'auth',                      // 認證
  SETTINGS = 'settings'               // 設定
}

// 模板複雜度
export enum TemplateComplexity {
  SIMPLE = 'simple',      // 簡單
  MEDIUM = 'medium',      // 中等
  COMPLEX = 'complex'     // 複雜
}

// 具體模板類型
export interface DataDisplayTemplate extends BaseTemplate {
  category: TemplateCategory.DATA_DISPLAY
  features: {
    search: boolean
    filter: boolean
    sort: boolean
    pagination: boolean
    selection: boolean
    export: boolean
  }
  dataTypes: string[]
}

export interface DataInputTemplate extends BaseTemplate {
  category: TemplateCategory.DATA_INPUT
  features: {
    validation: boolean
    autoSave: boolean
    fileUpload: boolean
    richText: boolean
    multiStep: boolean
  }
  fieldTypes: string[]
}

export interface NavigationTemplate extends BaseTemplate {
  category: TemplateCategory.NAVIGATION
  features: {
    breadcrumb: boolean
    sidebar: boolean
    tabs: boolean
    menu: boolean
    search: boolean
  }
  levels: number
}

export interface LayoutTemplate extends BaseTemplate {
  category: TemplateCategory.LAYOUT
  features: {
    responsive: boolean
    grid: boolean
    flexbox: boolean
    darkMode: boolean
    rtl: boolean
  }
  breakpoints: string[]
}

export interface FeedbackTemplate extends BaseTemplate {
  category: TemplateCategory.FEEDBACK
  features: {
    toast: boolean
    modal: boolean
    tooltip: boolean
    progress: boolean
    skeleton: boolean
  }
  animation: boolean
}

export interface DataVisualizationTemplate extends BaseTemplate {
  category: TemplateCategory.DATA_VISUALIZATION
  features: {
    charts: boolean
    graphs: boolean
    maps: boolean
    tables: boolean
    metrics: boolean
  }
  chartTypes: string[]
}

export interface EcommerceTemplate extends BaseTemplate {
  category: TemplateCategory.ECOMMERCE
  features: {
    productGrid: boolean
    cart: boolean
    checkout: boolean
    wishlist: boolean
    reviews: boolean
  }
  paymentMethods: string[]
}

export interface DashboardTemplate extends BaseTemplate {
  category: TemplateCategory.DASHBOARD
  features: {
    widgets: boolean
    charts: boolean
    metrics: boolean
    alerts: boolean
    shortcuts: boolean
  }
  widgetCount: number
}

export interface AuthTemplate extends BaseTemplate {
  category: TemplateCategory.AUTH
  features: {
    login: boolean
    register: boolean
    forgotPassword: boolean
    profile: boolean
    oauth: boolean
  }
  authMethods: string[]
}

export interface SettingsTemplate extends BaseTemplate {
  category: TemplateCategory.SETTINGS
  features: {
    profile: boolean
    preferences: boolean
    security: boolean
    notifications: boolean
    integrations: boolean
  }
  settingGroups: string[]
}

// 聯合類型
export type Template = 
  | DataDisplayTemplate
  | DataInputTemplate
  | NavigationTemplate
  | LayoutTemplate
  | FeedbackTemplate
  | DataVisualizationTemplate
  | EcommerceTemplate
  | DashboardTemplate
  | AuthTemplate
  | SettingsTemplate

// 模板配置選項
export interface TemplateConfig {
  includeHtml: boolean
  includeCss: boolean
  includeJs: boolean
  includeResponsive: boolean
  includeDarkMode: boolean
  includeAnimations: boolean
  includeAccessibility: boolean
  includeTests: boolean
  framework: 'vanilla' | 'react' | 'vue' | 'angular'
  cssFramework: 'tailwind' | 'bootstrap' | 'material' | 'custom'
}

// 模板生成結果
export interface TemplateGenerationResult {
  success: boolean
  outputPath: string
  files: string[]
  errors: string[]
  warnings: string[]
  metadata: {
    generatedAt: Date
    templateType: string
    config: TemplateConfig
  }
}
