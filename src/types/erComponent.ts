/**
 * ErComponent - ErSlice 統一組件中間表示格式
 * 這是 ErSlice 的核心創新：設計感知型的統一組件抽象層
 * 
 * 設計理念：
 * - 保留原始設計意圖和視覺屬性
 * - 理解組件的業務意圖和功能目的
 * - 支援多框架代碼生成
 * - 提供完整的開發協作信息
 */

// ===== 基礎類型定義 =====

export type Framework = 'react' | 'vue' | 'angular' | 'react-native' | 'flutter';
export type ComponentRole = 'navigation' | 'content' | 'input' | 'feedback' | 'layout' | 'display' | 'interactive';
export type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'universal';
export type StateType = 'default' | 'hover' | 'active' | 'disabled' | 'loading' | 'error' | 'success';

// ===== 設計層相關類型 =====

export interface LayoutProperties {
  display: 'flex' | 'grid' | 'block' | 'inline' | 'inline-block';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: number;
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  width?: number | string;
  height?: number | string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
}

export interface StylingProperties {
  backgroundColor?: string;
  borderRadius?: number;
  border?: {
    width: number;
    style: 'solid' | 'dashed' | 'dotted' | 'none';
    color: string;
  };
  boxShadow?: {
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    spreadRadius: number;
    color: string;
  }[];
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
}

export interface TypographyProperties {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  color?: string;
}

export interface EffectProperties {
  filters?: {
    blur?: number;
    brightness?: number;
    contrast?: number;
    saturate?: number;
    hueRotate?: number;
  };
  transform?: {
    translateX?: number;
    translateY?: number;
    scaleX?: number;
    scaleY?: number;
    rotate?: number;
    skewX?: number;
    skewY?: number;
  };
  transition?: {
    property: string;
    duration: number;
    timingFunction: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
    delay?: number;
  }[];
}

export interface DesignTokenReference {
  tokenName: string;
  tokenValue: string | number;
  tokenCategory: 'color' | 'typography' | 'spacing' | 'shadow' | 'border' | 'animation';
  usage: 'primary' | 'secondary' | 'accent' | 'neutral' | 'semantic';
}

export interface ResponsiveBehavior {
  breakpoints: {
    device: DeviceType;
    minWidth: number;
    properties: Partial<LayoutProperties & StylingProperties>;
  }[];
  adaptationStrategy: 'mobile-first' | 'desktop-first' | 'container-queries';
  flexibleContent: boolean;
  hiddenOnDevices?: DeviceType[];
}

// ===== 語義層相關類型 =====

export interface InteractionPattern {
  trigger: 'click' | 'hover' | 'focus' | 'input' | 'scroll' | 'resize' | 'load';
  action: string;
  target?: string;
  parameters?: Record<string, any>;
  animation?: AnimationSpec;
}

export interface AnimationSpec {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'custom';
  duration: number;
  easing: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'custom';
  delay?: number;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

export interface A11ySpecification {
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
  keyboardNavigation?: {
    focusable: boolean;
    shortcuts?: { key: string; action: string }[];
  };
  screenReader?: {
    announcements?: string[];
    liveRegion?: 'off' | 'polite' | 'assertive';
  };
  colorContrast?: {
    ratio: number;
    wcagLevel: 'AA' | 'AAA';
  };
}

export interface DataBindingSpec {
  dataSource?: string;
  dataType?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customRules?: string[];
  };
  formatters?: {
    input?: string;
    output?: string;
  };
}

// ===== 實現層相關類型 =====

export interface FrameworkImplementation {
  framework: Framework;
  componentCode: string;
  styleCode: string;
  dependencies: string[];
  imports: string[];
  exports: string[];
  props?: ComponentProps;
}

export interface ComponentProps {
  [propName: string]: {
    type: string;
    required: boolean;
    defaultValue?: any;
    description?: string;
  };
}

export interface ComponentAPI {
  props: ComponentProps;
  events?: {
    [eventName: string]: {
      parameters: Record<string, string>;
      description: string;
    };
  };
  methods?: {
    [methodName: string]: {
      parameters: Record<string, string>;
      returnType: string;
      description: string;
    };
  };
  slots?: {
    [slotName: string]: {
      description: string;
      props?: Record<string, string>;
    };
  };
}

export interface StateManagementStrategy {
  approach: 'local' | 'context' | 'store' | 'props';
  stateShape?: Record<string, string>;
  actions?: string[];
  computed?: string[];
  effects?: string[];
}

export interface PerformanceOptimization {
  type: 'memoization' | 'lazy-loading' | 'virtualization' | 'code-splitting' | 'bundling';
  config: Record<string, any>;
  impact: 'high' | 'medium' | 'low';
  implementation: string;
}

export interface TestingSpecification {
  unitTests: {
    framework: 'jest' | 'vitest' | 'mocha';
    scenarios: TestScenario[];
  };
  integrationTests?: {
    framework: 'testing-library' | 'enzyme' | 'cypress';
    scenarios: TestScenario[];
  };
  visualTests?: {
    framework: 'storybook' | 'chromatic' | 'percy';
    scenarios: TestScenario[];
  };
}

export interface TestScenario {
  name: string;
  description: string;
  setup: string;
  assertion: string;
  mockData?: Record<string, any>;
}

// ===== 協作層相關類型 =====

export interface ComponentDocumentation {
  summary: string;
  description: string;
  usage: string;
  examples: CodeExample[];
  bestPractices: string[];
  troubleshooting: { issue: string; solution: string }[];
}

export interface CodeExample {
  title: string;
  description: string;
  code: string;
  framework: Framework;
}

export interface DesignerNote {
  author: string;
  timestamp: Date;
  note: string;
  attachments?: string[];
  status: 'info' | 'warning' | 'important';
}

export interface DeveloperNote {
  author: string;
  timestamp: Date;
  note: string;
  relatedCode?: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
}

export interface ChangeHistory {
  version: string;
  timestamp: Date;
  author: string;
  changes: string[];
  breaking: boolean;
  migration?: string;
}

// ===== 主要 ErComponent 介面 =====

export interface ErComponent {
  // 元數據
  id: string;
  name: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  
  // 設計層：保留原始設計意圖和視覺屬性
  design: {
    figmaNodeId?: string;
    originalName: string;
    figmaUrl?: string;
    visualProperties: {
      layout: LayoutProperties;
      styling: StylingProperties;
      typography?: TypographyProperties;
      effects?: EffectProperties;
    };
    designTokens: DesignTokenReference[];
    responsiveBehavior: ResponsiveBehavior;
    deviceVariants: {
      device: DeviceType;
      properties: Partial<LayoutProperties & StylingProperties>;
    }[];
    stateVariants: {
      state: StateType;
      properties: Partial<LayoutProperties & StylingProperties>;
    }[];
  };
  
  // 語義層：理解組件的業務意圖和功能目的
  semantic: {
    componentRole: ComponentRole;
    businessPurpose: string;
    userStories: string[];
    userInteractions: InteractionPattern[];
    accessibilitySpecs: A11ySpecification;
    dataBinding?: DataBindingSpec;
    contentModel?: {
      type: 'static' | 'dynamic' | 'user-generated';
      structure: Record<string, string>;
    };
  };
  
  // 實現層：技術實現的具體方案
  implementation: {
    targetFrameworks: FrameworkImplementation[];
    componentApi: ComponentAPI;
    stateManagement: StateManagementStrategy;
    performanceOptimizations: PerformanceOptimization[];
    testingSpecs: TestingSpecification;
    dependencies: {
      external: string[];
      internal: string[];
      peerDependencies: string[];
    };
  };
  
  // 協作層：團隊協作和文檔化
  collaboration: {
    documentation: ComponentDocumentation;
    designerNotes: DesignerNote[];
    developerNotes: DeveloperNote[];
    changeHistory: ChangeHistory[];
    reviewStatus: 'draft' | 'review' | 'approved' | 'deprecated';
    tags: string[];
  };
  
  // 關係層：組件間的依賴和組合關係
  relationships: {
    parent?: string;
    children: string[];
    siblings: string[];
    dependencies: string[];
    variants: string[];
    compositions: {
      name: string;
      components: string[];
      layout: LayoutProperties;
    }[];
  };
}

// ===== 組件集合管理 =====

export interface ErComponentLibrary {
  id: string;
  name: string;
  version: string;
  description: string;
  components: ErComponent[];
  designSystem: {
    tokens: DesignTokenReference[];
    patterns: DesignPattern[];
    guidelines: string[];
  };
  metadata: {
    figmaFileId?: string;
    framework: Framework[];
    lastSync?: Date;
  };
}

export interface DesignPattern {
  id: string;
  name: string;
  description: string;
  category: 'layout' | 'navigation' | 'input' | 'feedback' | 'content';
  components: string[];
  usage: string;
  examples: string[];
}

// 移除重複的導出聲明，因為這些類型已經在文件開頭導出