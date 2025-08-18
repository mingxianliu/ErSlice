// ErSlice AI 說明類型定義

// AI 說明類型
export enum AISpecType {
  BASIC = 'basic',                    // 基礎說明
  INTERACTIVE = 'interactive',        // 互動說明
  RESPONSIVE = 'responsive',          // 響應式說明
  FULL_GUIDE = 'full-guide',          // 完整指南
  COMPONENT_SPEC = 'component-spec',  // 組件規格
  ACCESSIBILITY = 'accessibility',    // 無障礙說明
  PERFORMANCE = 'performance',        // 性能說明
  TESTING = 'testing'                 // 測試說明
}

// AI 說明複雜度
export enum AISpecComplexity {
  BEGINNER = 'beginner',      // 初學者
  INTERMEDIATE = 'intermediate', // 中級
  ADVANCED = 'advanced'       // 高級
}

// AI 說明格式
export enum AISpecFormat {
  MARKDOWN = 'markdown',      // Markdown
  HTML = 'html',              // HTML
  JSON = 'json',              // JSON
  YAML = 'yaml',              // YAML
  CODE_SNIPPETS = 'code-snippets' // 代碼片段
}

// 基礎 AI 說明介面
export interface BaseAISpec {
  id: string
  title: string
  description: string
  type: AISpecType
  complexity: AISpecComplexity
  format: AISpecFormat
  estimatedTime: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// 基礎說明
export interface BasicAISpec extends BaseAISpec {
  type: AISpecType.BASIC
  content: {
    overview: string
    requirements: string[]
    steps: string[]
    notes: string[]
  }
}

// 互動說明
export interface InteractiveAISpec extends BaseAISpec {
  type: AISpecType.INTERACTIVE
  content: {
    overview: string
    userInteractions: {
      type: string
      description: string
      implementation: string
    }[]
    stateManagement: string
    eventHandling: string[]
  }
}

// 響應式說明
export interface ResponsiveAISpec extends BaseAISpec {
  type: AISpecType.RESPONSIVE
  content: {
    overview: string
    breakpoints: {
      name: string
      width: string
      description: string
    }[]
    layoutStrategies: string[]
    mediaQueries: string[]
    flexibleUnits: string[]
  }
}

// 完整指南
export interface FullGuideAISpec extends BaseAISpec {
  type: AISpecType.FULL_GUIDE
  content: {
    overview: string
    prerequisites: string[]
    architecture: {
      description: string
      diagram: string
      components: string[]
    }
    implementation: {
      setup: string[]
      stepByStep: string[]
      bestPractices: string[]
    }
    testing: {
      unitTests: string[]
      integrationTests: string[]
      e2eTests: string[]
    }
    deployment: {
      build: string[]
      deploy: string[]
      monitoring: string[]
    }
  }
}

// 組件規格
export interface ComponentSpecAISpec extends BaseAISpec {
  type: AISpecType.COMPONENT_SPEC
  content: {
    overview: string
    props: {
      name: string
      type: string
      required: boolean
      default: string
      description: string
    }[]
    events: {
      name: string
      description: string
      payload: string
    }[]
    slots: {
      name: string
      description: string
      content: string
    }[]
    styling: {
      cssClasses: string[]
      cssVariables: string[]
      themes: string[]
    }
    accessibility: {
      ariaLabels: string[]
      keyboardNavigation: string[]
      screenReader: string[]
    }
  }
}

// 無障礙說明
export interface AccessibilityAISpec extends BaseAISpec {
  type: AISpecType.ACCESSIBILITY
  content: {
    overview: string
    wcagGuidelines: {
      level: string
      criteria: string[]
      implementation: string[]
    }[]
    semanticHTML: string[]
    ariaAttributes: {
      attribute: string
      purpose: string
      usage: string
    }[]
    keyboardNavigation: string[]
    colorContrast: string[]
    screenReader: string[]
  }
}

// 性能說明
export interface PerformanceAISpec extends BaseAISpec {
  type: AISpecType.PERFORMANCE
  content: {
    overview: string
    metrics: {
      name: string
      target: string
      measurement: string
    }[]
    optimization: {
      category: string
      techniques: string[]
      tools: string[]
    }[]
    monitoring: {
      tools: string[]
      alerts: string[]
      reporting: string[]
    }
  }
}

// 測試說明
export interface TestingAISpec extends BaseAISpec {
  type: AISpecType.TESTING
  content: {
    overview: string
    testingTypes: {
      type: string
      description: string
      tools: string[]
      examples: string[]
    }[]
    testStructure: string[]
    assertions: string[]
    mocking: string[]
    coverage: string[]
  }
}

// 聯合類型
export type AISpec = 
  | BasicAISpec
  | InteractiveAISpec
  | ResponsiveAISpec
  | FullGuideAISpec
  | ComponentSpecAISpec
  | AccessibilityAISpec
  | PerformanceAISpec
  | TestingAISpec

// AI 說明生成配置
export interface AISpecConfig {
  includeExamples: boolean
  includeCodeSnippets: boolean
  includeDiagrams: boolean
  includeBestPractices: boolean
  includeCommonMistakes: boolean
  includePerformanceTips: boolean
  includeAccessibilityGuidelines: boolean
  language: 'zh-TW' | 'en-US'
  framework: 'vanilla' | 'react' | 'vue' | 'angular'
  cssFramework: 'tailwind' | 'bootstrap' | 'material' | 'custom'
}

// AI 說明生成結果
export interface AISpecGenerationResult {
  success: boolean
  spec: AISpec
  outputPath: string
  files: string[]
  errors: string[]
  warnings: string[]
  metadata: {
    generatedAt: Date
    config: AISpecConfig
    processingTime: number
  }
}
