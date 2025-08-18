// ErSlice 模板數據

import { Template, TemplateCategory, TemplateComplexity } from '../types/templates'

export const templates: Template[] = [
  // 數據展示模板
  {
    id: 'data-table-basic',
    name: '基礎數據表格',
    description: '簡單的數據表格，支援排序和分頁',
    category: TemplateCategory.DATA_DISPLAY,
    complexity: TemplateComplexity.SIMPLE,
    estimatedTime: '1-2 小時',
    tags: ['表格', '數據', '排序', '分頁'],
    features: {
      search: false,
      filter: false,
      sort: true,
      pagination: true,
      selection: false,
      export: false
    },
    dataTypes: ['text', 'number', 'date']
  },
  {
    id: 'data-table-advanced',
    name: '進階數據表格',
    description: '功能完整的數據表格，支援搜尋、篩選、排序、分頁和選擇',
    category: TemplateCategory.DATA_DISPLAY,
    complexity: TemplateComplexity.MEDIUM,
    estimatedTime: '3-4 小時',
    tags: ['表格', '數據', '搜尋', '篩選', '排序', '分頁', '選擇'],
    features: {
      search: true,
      filter: true,
      sort: true,
      pagination: true,
      selection: true,
      export: true
    },
    dataTypes: ['text', 'number', 'date', 'boolean', 'enum']
  },
  {
    id: 'data-grid',
    name: '數據網格',
    description: '靈活的數據網格，支援拖拽排序和自定義列寬',
    category: TemplateCategory.DATA_DISPLAY,
    complexity: TemplateComplexity.COMPLEX,
    estimatedTime: '5-6 小時',
    tags: ['網格', '數據', '拖拽', '自定義'],
    features: {
      search: true,
      filter: true,
      sort: true,
      pagination: true,
      selection: true,
      export: true
    },
    dataTypes: ['text', 'number', 'date', 'boolean', 'enum', 'image']
  },

  // 數據輸入模板
  {
    id: 'form-basic',
    name: '基礎表單',
    description: '簡單的表單，包含基本驗證',
    category: TemplateCategory.DATA_INPUT,
    complexity: TemplateComplexity.SIMPLE,
    estimatedTime: '1-2 小時',
    tags: ['表單', '驗證', '輸入'],
    features: {
      validation: true,
      autoSave: false,
      fileUpload: false,
      richText: false,
      multiStep: false
    },
    fieldTypes: ['text', 'email', 'password', 'select', 'checkbox']
  },
  {
    id: 'form-advanced',
    name: '進階表單',
    description: '功能豐富的表單，支援檔案上傳、富文本編輯和自動儲存',
    category: TemplateCategory.DATA_INPUT,
    complexity: TemplateComplexity.MEDIUM,
    estimatedTime: '3-4 小時',
    tags: ['表單', '驗證', '檔案上傳', '富文本', '自動儲存'],
    features: {
      validation: true,
      autoSave: true,
      fileUpload: true,
      richText: true,
      multiStep: false
    },
    fieldTypes: ['text', 'email', 'password', 'select', 'checkbox', 'file', 'richText', 'date']
  },
  {
    id: 'form-multistep',
    name: '多步驟表單',
    description: '分步驟的表單，適合複雜的數據收集流程',
    category: TemplateCategory.DATA_INPUT,
    complexity: TemplateComplexity.COMPLEX,
    estimatedTime: '4-5 小時',
    tags: ['表單', '多步驟', '進度條', '驗證'],
    features: {
      validation: true,
      autoSave: true,
      fileUpload: true,
      richText: true,
      multiStep: true
    },
    fieldTypes: ['text', 'email', 'password', 'select', 'checkbox', 'file', 'richText', 'date', 'number']
  },

  // 導航模板
  {
    id: 'navigation-sidebar',
    name: '側邊欄導航',
    description: '經典的側邊欄導航，支援多級菜單',
    category: TemplateCategory.NAVIGATION,
    complexity: TemplateComplexity.MEDIUM,
    estimatedTime: '2-3 小時',
    tags: ['導航', '側邊欄', '菜單', '多級'],
    features: {
      breadcrumb: true,
      sidebar: true,
      tabs: false,
      menu: true,
      search: false
    },
    levels: 3
  },
  {
    id: 'navigation-tabs',
    name: '標籤頁導航',
    description: '標籤頁式導航，適合內容切換',
    category: TemplateCategory.NAVIGATION,
    complexity: TemplateComplexity.SIMPLE,
    estimatedTime: '1-2 小時',
    tags: ['導航', '標籤頁', '切換'],
    features: {
      breadcrumb: false,
      sidebar: false,
      tabs: true,
      menu: false,
      search: false
    },
    levels: 1
  },

  // 佈局模板
  {
    id: 'layout-responsive',
    name: '響應式佈局',
    description: '完全響應式的佈局，支援多種螢幕尺寸',
    category: TemplateCategory.LAYOUT,
    complexity: TemplateComplexity.MEDIUM,
    estimatedTime: '3-4 小時',
    tags: ['佈局', '響應式', '網格', '斷點'],
    features: {
      responsive: true,
      grid: true,
      flexbox: true,
      darkMode: false,
      rtl: false
    },
    breakpoints: ['sm', 'md', 'lg', 'xl', '2xl']
  },
  {
    id: 'layout-dashboard',
    name: '儀表板佈局',
    description: '專業的儀表板佈局，支援小工具和圖表',
    category: TemplateCategory.LAYOUT,
    complexity: TemplateComplexity.COMPLEX,
    estimatedTime: '5-6 小時',
    tags: ['佈局', '儀表板', '小工具', '圖表'],
    features: {
      responsive: true,
      grid: true,
      flexbox: true,
      darkMode: true,
      rtl: false
    },
    breakpoints: ['sm', 'md', 'lg', 'xl', '2xl']
  },

  // 反饋模板
  {
    id: 'feedback-toast',
    name: 'Toast 通知',
    description: '輕量級的 Toast 通知系統',
    category: TemplateCategory.FEEDBACK,
    complexity: TemplateComplexity.SIMPLE,
    estimatedTime: '1 小時',
    tags: ['通知', 'Toast', '反饋'],
    features: {
      toast: true,
      modal: false,
      tooltip: false,
      progress: false,
      skeleton: false
    },
    animation: true
  },
  {
    id: 'feedback-complete',
    name: '完整反饋系統',
    description: '包含所有反饋組件的完整系統',
    category: TemplateCategory.FEEDBACK,
    complexity: TemplateComplexity.COMPLEX,
    estimatedTime: '4-5 小時',
    tags: ['通知', '模態框', '工具提示', '進度條', '骨架屏'],
    features: {
      toast: true,
      modal: true,
      tooltip: true,
      progress: true,
      skeleton: true
    },
    animation: true
  },

  // 數據可視化模板
  {
    id: 'charts-basic',
    name: '基礎圖表',
    description: '常用的圖表類型：柱狀圖、折線圖、圓餅圖',
    category: TemplateCategory.DATA_VISUALIZATION,
    complexity: TemplateComplexity.MEDIUM,
    estimatedTime: '3-4 小時',
    tags: ['圖表', '數據可視化', '柱狀圖', '折線圖', '圓餅圖'],
    features: {
      charts: true,
      graphs: false,
      maps: false,
      tables: false,
      metrics: false
    },
    chartTypes: ['bar', 'line', 'pie', 'doughnut']
  },
  {
    id: 'charts-advanced',
    name: '進階圖表',
    description: '複雜的圖表類型：散點圖、熱力圖、樹狀圖',
    category: TemplateCategory.DATA_VISUALIZATION,
    complexity: TemplateComplexity.COMPLEX,
    estimatedTime: '6-8 小時',
    tags: ['圖表', '數據可視化', '散點圖', '熱力圖', '樹狀圖'],
    features: {
      charts: true,
      graphs: true,
      maps: true,
      tables: true,
      metrics: true
    },
    chartTypes: ['scatter', 'heatmap', 'tree', 'network', 'gauge']
  },

  // 電商模板
  {
    id: 'ecommerce-product-grid',
    name: '產品網格',
    description: '電商產品展示網格，支援篩選和排序',
    category: TemplateCategory.ECOMMERCE,
    complexity: TemplateComplexity.MEDIUM,
    estimatedTime: '3-4 小時',
    tags: ['電商', '產品', '網格', '篩選', '排序'],
    features: {
      productGrid: true,
      cart: false,
      checkout: false,
      wishlist: false,
      reviews: false
    },
    paymentMethods: []
  },
  {
    id: 'ecommerce-complete',
    name: '完整電商系統',
    description: '包含購物車、結帳、願望清單和評論的完整電商系統',
    category: TemplateCategory.ECOMMERCE,
    complexity: TemplateComplexity.COMPLEX,
    estimatedTime: '8-10 小時',
    tags: ['電商', '購物車', '結帳', '願望清單', '評論'],
    features: {
      productGrid: true,
      cart: true,
      checkout: true,
      wishlist: true,
      reviews: true
    },
    paymentMethods: ['credit-card', 'paypal', 'apple-pay', 'google-pay']
  },

  // 儀表板模板
  {
    id: 'dashboard-analytics',
    name: '分析儀表板',
    description: '數據分析儀表板，包含各種圖表和指標',
    category: TemplateCategory.DASHBOARD,
    complexity: TemplateComplexity.COMPLEX,
    estimatedTime: '6-8 小時',
    tags: ['儀表板', '分析', '圖表', '指標', '數據'],
    features: {
      widgets: true,
      charts: true,
      metrics: true,
      alerts: true,
      shortcuts: true
    },
    widgetCount: 12
  },

  // 認證模板
  {
    id: 'auth-complete',
    name: '完整認證系統',
    description: '包含登入、註冊、忘記密碼和個人資料的認證系統',
    category: TemplateCategory.AUTH,
    complexity: TemplateComplexity.MEDIUM,
    estimatedTime: '4-5 小時',
    tags: ['認證', '登入', '註冊', '忘記密碼', '個人資料'],
    features: {
      login: true,
      register: true,
      forgotPassword: true,
      profile: true,
      oauth: true
    },
    authMethods: ['email', 'phone', 'google', 'facebook', 'github']
  },

  // 設定模板
  {
    id: 'settings-complete',
    name: '完整設定系統',
    description: '包含個人資料、偏好設定、安全和通知的設定系統',
    category: TemplateCategory.SETTINGS,
    complexity: TemplateComplexity.MEDIUM,
    estimatedTime: '4-5 小時',
    tags: ['設定', '個人資料', '偏好', '安全', '通知'],
    features: {
      profile: true,
      preferences: true,
      security: true,
      notifications: true,
      integrations: true
    },
    settingGroups: ['account', 'privacy', 'notifications', 'integrations', 'billing']
  }
]

// 根據分類獲取模板
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return templates.filter(template => template.category === category)
}

// 根據複雜度獲取模板
export function getTemplatesByComplexity(complexity: TemplateComplexity): Template[] {
  return templates.filter(template => template.complexity === complexity)
}

// 根據標籤搜尋模板
export function searchTemplatesByTags(tags: string[]): Template[] {
  return templates.filter(template => 
    tags.some(tag => template.tags.includes(tag))
  )
}

// 獲取推薦模板
export function getRecommendedTemplates(): Template[] {
  return templates.filter(template => 
    template.complexity === TemplateComplexity.MEDIUM
  ).slice(0, 6)
}
