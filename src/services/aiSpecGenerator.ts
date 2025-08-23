// ErSlice AI 說明生成器服務

import { 
  AISpec, 
  AISpecType, 
  AISpecComplexity, 
  AISpecFormat, 
  AISpecConfig,
  BasicAISpec,
  InteractiveAISpec,
  ResponsiveAISpec,
  FullGuideAISpec,
  ComponentSpecAISpec,
  AccessibilityAISpec,
  PerformanceAISpec,
  TestingAISpec
} from '../types/aiSpec'
import { Template } from '../types/templates'

// AI 說明生成器類
export class AISpecGenerator {
  constructor(config: AISpecConfig) {
    // 配置參數，未來可用於自定義生成邏輯
    console.log('AI 說明生成器配置:', config)
  }

  // 生成 AI 說明
  async generateAISpec(
    type: AISpecType,
    template: Template,
    additionalContext?: string
  ): Promise<AISpec> {
    
    try {
      let spec: AISpec

      switch (type) {
        case AISpecType.BASIC:
          spec = await this.generateBasicSpec(template, additionalContext)
          break
        case AISpecType.INTERACTIVE:
          spec = await this.generateInteractiveSpec(template, additionalContext)
          break
        case AISpecType.RESPONSIVE:
          spec = await this.generateResponsiveSpec(template, additionalContext)
          break
        case AISpecType.FULL_GUIDE:
          spec = await this.generateFullGuideSpec(template, additionalContext)
          break
        case AISpecType.COMPONENT_SPEC:
          spec = await this.generateComponentSpec(template, additionalContext)
          break
        case AISpecType.ACCESSIBILITY:
          spec = await this.generateAccessibilitySpec(template, additionalContext)
          break
        case AISpecType.PERFORMANCE:
          spec = await this.generatePerformanceSpec(template, additionalContext)
          break
        case AISpecType.TESTING:
          spec = await this.generateTestingSpec(template, additionalContext)
          break
        default:
          throw new Error(`不支援的 AI 說明類型: ${type}`)
      }

      // 更新時間戳
      spec.updatedAt = new Date()
      
      return spec
    } catch (error) {
      throw new Error(`生成 AI 說明失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  // 生成基礎說明
  private async generateBasicSpec(template: Template, context?: string): Promise<BasicAISpec> {
    const spec: BasicAISpec = {
      id: `basic-${template.id}-${Date.now()}`,
      title: `${template.name} - 基礎開發說明`,
      description: `為 ${template.name} 提供基礎的開發指導和實現步驟`,
      type: AISpecType.BASIC,
      complexity: this.getComplexityLevel(template),
      format: AISpecFormat.MARKDOWN,
      estimatedTime: template.estimatedTime,
      tags: [...template.tags, '基礎', '開發指導'],
      createdAt: new Date(),
      updatedAt: new Date(),
      content: {
        overview: this.generateOverview(template, context),
        requirements: this.generateRequirements(template),
        steps: this.generateBasicSteps(template),
        notes: this.generateBasicNotes(template)
      }
    }

    return spec
  }

  // 生成互動說明
  private async generateInteractiveSpec(template: Template, context?: string): Promise<InteractiveAISpec> {
    const spec: InteractiveAISpec = {
      id: `interactive-${template.id}-${Date.now()}`,
      title: `${template.name} - 互動功能開發說明`,
      description: `詳細說明 ${template.name} 的互動功能實現和狀態管理`,
      type: AISpecType.INTERACTIVE,
      complexity: this.getComplexityLevel(template),
      format: AISpecFormat.MARKDOWN,
      estimatedTime: template.estimatedTime,
      tags: [...template.tags, '互動', '狀態管理', '事件處理'],
      createdAt: new Date(),
      updatedAt: new Date(),
      content: {
        overview: this.generateOverview(template, context),
        userInteractions: this.generateUserInteractions(template),
        stateManagement: this.generateStateManagement(template),
        eventHandling: this.generateEventHandling(template)
      }
    }

    return spec
  }

  // 生成響應式說明
  private async generateResponsiveSpec(template: Template, context?: string): Promise<ResponsiveAISpec> {
    const spec: ResponsiveAISpec = {
      id: `responsive-${template.id}-${Date.now()}`,
      title: `${template.name} - 響應式設計說明`,
      description: `詳細說明 ${template.name} 的響應式設計實現和佈局策略`,
      type: AISpecType.RESPONSIVE,
      complexity: this.getComplexityLevel(template),
      format: AISpecFormat.MARKDOWN,
      estimatedTime: template.estimatedTime,
      tags: [...template.tags, '響應式', '佈局', '斷點'],
      createdAt: new Date(),
      updatedAt: new Date(),
      content: {
        overview: this.generateOverview(template, context),
        breakpoints: this.generateBreakpoints(template),
        layoutStrategies: this.generateLayoutStrategies(template),
        mediaQueries: this.generateMediaQueries(template),
        flexibleUnits: this.generateFlexibleUnits(template)
      }
    }

    return spec
  }

  // 生成完整指南
  private async generateFullGuideSpec(template: Template, context?: string): Promise<FullGuideAISpec> {
    const spec: FullGuideAISpec = {
      id: `full-guide-${template.id}-${Date.now()}`,
      title: `${template.name} - 完整開發指南`,
      description: `為 ${template.name} 提供從設計到部署的完整開發指南`,
      type: AISpecType.FULL_GUIDE,
      complexity: this.getComplexityLevel(template),
      format: AISpecFormat.MARKDOWN,
      estimatedTime: template.estimatedTime,
      tags: [...template.tags, '完整指南', '開發流程', '部署'],
      createdAt: new Date(),
      updatedAt: new Date(),
      content: {
        overview: this.generateOverview(template, context),
        prerequisites: this.generatePrerequisites(template),
        architecture: this.generateArchitecture(template),
        implementation: this.generateImplementation(template),
        testing: this.generateTesting(template),
        deployment: this.generateDeployment(template)
      }
    }

    return spec
  }

  // 生成組件規格
  private async generateComponentSpec(template: Template, context?: string): Promise<ComponentSpecAISpec> {
    const spec: ComponentSpecAISpec = {
      id: `component-${template.id}-${Date.now()}`,
      title: `${template.name} - 組件規格說明`,
      description: `詳細的組件 API 規格和實現指南`,
      type: AISpecType.COMPONENT_SPEC,
      complexity: this.getComplexityLevel(template),
      format: AISpecFormat.MARKDOWN,
      estimatedTime: template.estimatedTime,
      tags: [...template.tags, '組件', 'API', '規格'],
      createdAt: new Date(),
      updatedAt: new Date(),
      content: {
        overview: this.generateOverview(template, context),
        props: this.generateComponentProps(template),
        events: this.generateComponentEvents(template),
        slots: this.generateComponentSlots(template),
        styling: this.generateComponentStyling(template),
        accessibility: this.generateComponentAccessibility(template)
      }
    }

    return spec
  }

  // 生成無障礙說明
  private async generateAccessibilitySpec(template: Template, context?: string): Promise<AccessibilityAISpec> {
    const spec: AccessibilityAISpec = {
      id: `accessibility-${template.id}-${Date.now()}`,
      title: `${template.name} - 無障礙設計說明`,
      description: `詳細說明 ${template.name} 的無障礙設計實現和 WCAG 指南`,
      type: AISpecType.ACCESSIBILITY,
      complexity: this.getComplexityLevel(template),
      format: AISpecFormat.MARKDOWN,
      estimatedTime: template.estimatedTime,
      tags: [...template.tags, '無障礙', 'WCAG', '語義化'],
      createdAt: new Date(),
      updatedAt: new Date(),
      content: {
        overview: this.generateOverview(template, context),
        wcagGuidelines: this.generateWCAGGuidelines(template),
        semanticHTML: this.generateSemanticHTML(template),
        ariaAttributes: this.generateARIAttributes(template),
        keyboardNavigation: this.generateKeyboardNavigation(template),
        colorContrast: this.generateColorContrast(template),
        screenReader: this.generateScreenReader(template)
      }
    }

    return spec
  }

  // 生成性能說明
  private async generatePerformanceSpec(template: Template, context?: string): Promise<PerformanceAISpec> {
    const spec: PerformanceAISpec = {
      id: `performance-${template.id}-${Date.now()}`,
      title: `${template.name} - 性能優化說明`,
      description: `詳細說明 ${template.name} 的性能優化策略和監控方法`,
      type: AISpecType.PERFORMANCE,
      complexity: this.getComplexityLevel(template),
      format: AISpecFormat.MARKDOWN,
      estimatedTime: template.estimatedTime,
      tags: [...template.tags, '性能', '優化', '監控'],
      createdAt: new Date(),
      updatedAt: new Date(),
      content: {
        overview: this.generateOverview(template, context),
        metrics: this.generatePerformanceMetrics(template),
        optimization: this.generatePerformanceOptimization(template),
        monitoring: this.generatePerformanceMonitoring(template)
      }
    }

    return spec
  }

  // 生成測試說明
  private async generateTestingSpec(template: Template, context?: string): Promise<TestingAISpec> {
    const spec: TestingAISpec = {
      id: `testing-${template.id}-${Date.now()}`,
      title: `${template.name} - 測試策略說明`,
      description: `詳細說明 ${template.name} 的測試策略和實現方法`,
      type: AISpecType.TESTING,
      complexity: this.getComplexityLevel(template),
      format: AISpecFormat.MARKDOWN,
      estimatedTime: template.estimatedTime,
      tags: [...template.tags, '測試', '品質', '覆蓋率'],
      createdAt: new Date(),
      updatedAt: new Date(),
      content: {
        overview: this.generateOverview(template, context),
        testingTypes: this.generateTestingTypes(template),
        testStructure: this.generateTestStructure(template),
        assertions: this.generateAssertions(template),
        testData: this.generateTestDataStrategy(template),
        coverage: this.generateCoverage(template)
      }
    }

    return spec
  }

  // 輔助方法
  private getComplexityLevel(template: Template): AISpecComplexity {
    switch (template.complexity) {
      case 'simple':
        return AISpecComplexity.BEGINNER
      case 'medium':
        return AISpecComplexity.INTERMEDIATE
      case 'complex':
        return AISpecComplexity.ADVANCED
      default:
        return AISpecComplexity.INTERMEDIATE
    }
  }

  private generateOverview(template: Template, context?: string): string {
    let overview = `${template.name} 是一個 ${template.complexity} 複雜度的 ${template.category} 模板。`
    overview += `\n\n主要功能包括：`
    
    // 根據模板類型生成功能描述
    if ('features' in template) {
      const features = Object.entries(template.features)
        .filter(([_, enabled]) => enabled)
        .map(([key, _]) => this.formatFeatureName(key))
      
      features.forEach(feature => {
        overview += `\n• ${feature}`
      })
    }
    
    if (context) {
      overview += `\n\n額外需求：${context}`
    }
    
    return overview
  }

  private formatFeatureName(feature: string): string {
    const featureMap: Record<string, string> = {
      search: '搜尋功能',
      filter: '篩選功能',
      sort: '排序功能',
      pagination: '分頁功能',
      selection: '選擇功能',
      export: '匯出功能',
      validation: '表單驗證',
      autoSave: '自動儲存',
      fileUpload: '檔案上傳',
      richText: '富文本編輯',
      multiStep: '多步驟流程',
      responsive: '響應式設計',
      grid: '網格佈局',
      flexbox: '彈性佈局',
      darkMode: '深色主題',
      rtl: '右到左支援',
      toast: 'Toast 通知',
      modal: '模態框',
      tooltip: '工具提示',
      progress: '進度條',
      skeleton: '骨架屏',
      charts: '圖表',
      graphs: '圖形',
      maps: '地圖',
      tables: '表格',
      metrics: '指標',
      productGrid: '產品網格',
      cart: '購物車',
      checkout: '結帳',
      wishlist: '願望清單',
      reviews: '評論',
      widgets: '小工具',
      alerts: '警報',
      shortcuts: '快捷鍵',
      login: '登入',
      register: '註冊',
      forgotPassword: '忘記密碼',
      profile: '個人資料',
      oauth: 'OAuth 認證',
      preferences: '偏好設定',
      security: '安全設定',
      notifications: '通知設定',
      integrations: '整合設定'
    }
    
    return featureMap[feature] || feature
  }

  private generateRequirements(template: Template): string[] {
    const requirements = [
      '基本的 HTML、CSS 和 JavaScript 知識',
      '熟悉響應式設計原則',
      '了解無障礙設計基礎'
    ]
    
    if (template.complexity === 'complex') {
      requirements.push('進階的 JavaScript 框架知識')
      requirements.push('狀態管理經驗')
      requirements.push('性能優化技能')
    }
    
    return requirements
  }

  private generateBasicSteps(_template: Template): string[] {
    return [
      '分析設計需求和功能規格',
      '創建 HTML 結構和語義化標籤',
      '設計 CSS 樣式和佈局',
      '實現 JavaScript 互動功能',
      '測試響應式設計和無障礙性',
      '優化性能和用戶體驗'
    ]
  }

  private generateBasicNotes(_template: Template): string[] {
    return [
      '確保代碼的可維護性和可擴展性',
      '遵循現代 Web 開發最佳實踐',
      '考慮不同瀏覽器的兼容性',
      '重視用戶體驗和無障礙設計'
    ]
  }

  // 其他生成方法的實現...
  private generateUserInteractions(_template: Template) {
    return [
      {
        type: '點擊',
        description: '處理用戶點擊事件',
        implementation: '使用 addEventListener 或框架的事件系統'
      },
      {
        type: '輸入',
        description: '處理表單輸入和驗證',
        implementation: '實時驗證和錯誤提示'
      }
    ]
  }

  private generateStateManagement(_template: Template): string {
    return '使用適當的狀態管理方案，如 React Hooks、Vue Composition API 或原生 JavaScript 狀態管理'
  }

  private generateEventHandling(_template: Template): string[] {
    return [
      '事件委託優化性能',
      '防抖和節流處理頻繁事件',
      '清理事件監聽器避免記憶體洩漏'
    ]
  }

  private generateBreakpoints(_template: Template) {
    return [
      { name: '手機', width: '320px - 768px', description: '垂直佈局，觸控優化' },
      { name: '平板', width: '768px - 1024px', description: '混合佈局，觸控和滑鼠支援' },
      { name: '桌面', width: '1024px+', description: '水平佈局，滑鼠優化' }
    ]
  }

  private generateLayoutStrategies(_template: Template): string[] {
    return [
      '移動優先的響應式設計',
      'CSS Grid 和 Flexbox 佈局',
      '流體網格系統',
      '容器查詢（Container Queries）'
    ]
  }

  private generateMediaQueries(_template: Template): string[] {
    return [
      '@media (max-width: 768px) { /* 手機樣式 */ }',
      '@media (min-width: 769px) and (max-width: 1024px) { /* 平板樣式 */ }',
      '@media (min-width: 1025px) { /* 桌面樣式 */ }'
    ]
  }

  private generateFlexibleUnits(_template: Template): string[] {
    return [
      '使用 rem 和 em 單位',
      'CSS 變數定義設計令牌',
      'clamp() 函數限制尺寸範圍',
      'min() 和 max() 函數響應式調整'
    ]
  }

  private generatePrerequisites(_template: Template): string[] {
    return [
      'Node.js 和 npm 環境',
      '代碼編輯器（VS Code 推薦）',
      'Git 版本控制',
      '瀏覽器開發者工具'
    ]
  }

  private generateArchitecture(_template: Template) {
    return {
      description: '採用組件化架構，分離關注點，提高可維護性',
      diagram: '組件層次結構圖',
      components: ['核心組件', '業務組件', '工具組件', '樣式組件']
    }
  }

  private generateImplementation(_template: Template) {
    return {
      setup: ['初始化項目', '安裝依賴', '配置構建工具'],
      stepByStep: ['創建基礎結構', '實現核心功能', '添加樣式和互動', '測試和優化'],
      bestPractices: ['代碼規範', '性能優化', '無障礙設計', '響應式佈局']
    }
  }

  private generateTesting(_template: Template) {
    return {
      unitTests: ['組件測試', '工具函數測試', '狀態管理測試'],
      integrationTests: ['組件整合測試', 'API 整合測試'],
      e2eTests: ['用戶流程測試', '跨瀏覽器測試']
    }
  }

  private generateDeployment(_template: Template) {
    return {
      build: ['代碼壓縮', '資源優化', '環境配置'],
      deploy: ['靜態資源部署', 'CDN 配置', '監控設置'],
      monitoring: ['性能監控', '錯誤追蹤', '用戶分析']
    }
  }

  private generateComponentProps(_template: Template) {
    return [
      {
        name: 'className',
        type: 'string',
        required: false,
        default: '""',
        description: '自定義 CSS 類名'
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        default: 'false',
        description: '是否禁用組件'
      }
    ]
  }

  private generateComponentEvents(_template: Template) {
    return [
      {
        name: 'onChange',
        description: '值變更事件',
        payload: 'newValue: any'
      },
      {
        name: 'onClick',
        description: '點擊事件',
        payload: 'event: MouseEvent'
      }
    ]
  }

  private generateComponentSlots(_template: Template) {
    return [
      {
        name: 'default',
        description: '默認內容插槽',
        content: '主要內容區域'
      },
      {
        name: 'header',
        description: '標題區域插槽',
        content: '組件標題和操作按鈕'
      }
    ]
  }

  private generateComponentStyling(_template: Template) {
    return {
      cssClasses: ['component', 'component--variant', 'component--size'],
      cssVariables: ['--component-color', '--component-size', '--component-border'],
      themes: ['light', 'dark', 'high-contrast']
    }
  }

  private generateComponentAccessibility(_template: Template) {
    return {
      ariaLabels: ['aria-label', 'aria-describedby', 'aria-controls'],
      keyboardNavigation: ['Tab 鍵導航', 'Enter 鍵激活', 'Escape 鍵關閉'],
      screenReader: ['語義化標籤', 'ARIA 屬性', '焦點管理']
    }
  }

  private generateWCAGGuidelines(_template: Template) {
    return [
      {
        level: 'AA',
        criteria: ['對比度 4.5:1', '鍵盤導航', '語義化標籤'],
        implementation: ['使用足夠的顏色對比', '支援鍵盤操作', '正確使用 HTML 標籤']
      }
    ]
  }

  private generateSemanticHTML(_template: Template): string[] {
    return [
      '使用適當的 HTML5 語義化標籤',
      '正確的標題層次結構',
      '表單標籤和關聯',
      '列表和導航結構'
    ]
  }

  private generateARIAttributes(_template: Template) {
    return [
      {
        attribute: 'aria-label',
        purpose: '為無標籤元素提供描述',
        usage: 'aria-label="搜尋按鈕"'
      },
      {
        attribute: 'aria-expanded',
        purpose: '指示展開/收合狀態',
        usage: 'aria-expanded="false"'
      }
    ]
  }

  private generateKeyboardNavigation(_template: Template): string[] {
    return [
      'Tab 鍵順序邏輯',
      'Enter 和 Space 鍵激活',
      '方向鍵導航',
      'Escape 鍵關閉/返回'
    ]
  }

  private generateColorContrast(_template: Template): string[] {
    return [
      '文字對比度至少 4.5:1',
      '大文字對比度至少 3:1',
      '使用對比度檢查工具',
      '考慮色盲用戶需求'
    ]
  }

  private generateScreenReader(_template: Template): string[] {
    return [
      '語義化 HTML 結構',
      'ARIA 標籤和描述',
      '焦點指示器',
      '跳過導航鏈接'
    ]
  }

  private generatePerformanceMetrics(_template: Template) {
    return [
      {
        name: 'First Contentful Paint (FCP)',
        target: '< 1.8s',
        measurement: 'Lighthouse 或 WebPageTest'
      },
      {
        name: 'Largest Contentful Paint (LCP)',
        target: '< 2.5s',
        measurement: 'Lighthouse 或 WebPageTest'
      }
    ]
  }

  private generatePerformanceOptimization(_template: Template) {
    return [
      {
        category: '資源優化',
        techniques: ['代碼分割', '懶加載', '資源壓縮'],
        tools: ['Webpack', 'Vite', 'Rollup']
      },
      {
        category: '渲染優化',
        techniques: ['虛擬滾動', '防抖節流', 'Web Workers'],
        tools: ['React DevTools', 'Vue DevTools']
      }
    ]
  }

  private generatePerformanceMonitoring(_template: Template) {
    return {
      tools: ['Lighthouse', 'WebPageTest', 'Real User Monitoring'],
      alerts: ['性能閾值警告', '錯誤率監控', '用戶體驗指標'],
      reporting: ['性能儀表板', '趨勢分析', '改進建議']
    }
  }

  private generateTestingTypes(_template: Template) {
    return [
      {
        type: '單元測試',
        description: '測試個別組件和函數',
        tools: ['Jest', 'Vitest', 'Mocha'],
        examples: ['組件渲染測試', '事件處理測試', '狀態變更測試']
      },
      {
        type: '整合測試',
        description: '測試組件間的互動',
        tools: ['Testing Library', 'Cypress', 'Playwright'],
        examples: ['組件整合測試', 'API 整合測試', '路由測試']
      }
    ]
  }

  private generateTestStructure(_template: Template): string[] {
    return [
      '測試文件組織結構',
      '測試用例命名規範',
      '測試數據管理',
      '測試環境配置'
    ]
  }

  private generateAssertions(_template: Template): string[] {
    return [
      '元素存在性檢查',
      '屬性值驗證',
      '事件觸發測試',
      '狀態變更驗證'
    ]
  }

  private generateTestDataStrategy(_template: Template): string[] {
    return [
      '真實 API 集成測試',
      '邊界值測試數據',
      '計時器模擬',
      '模組依賴模擬'
    ]
  }

  private generateCoverage(_template: Template): string[] {
    return [
      '代碼覆蓋率目標',
      '分支覆蓋率檢查',
      '測試覆蓋率報告',
      '覆蓋率改進策略'
    ]
  }
}

// 導出生成器實例
export const createAISpecGenerator = (config: AISpecConfig) => {
  return new AISpecGenerator(config)
}
