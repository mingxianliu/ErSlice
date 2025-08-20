/**
 * 響應式行為推理系統
 * ErSlice 智能響應式設計分析和生成引擎
 * 
 * 核心創新：
 * - 從靜態設計稿推斷動態響應式行為
 * - 基於內容和佈局特性智能決策適配策略
 * - 生成符合現代響應式設計最佳實踐的代碼
 * - 考慮性能、可用性和品牌一致性
 */

import {
  ErComponent,
  DeviceType,
  ResponsiveBehavior,
  LayoutProperties
} from '../../types/erComponent';

import {
  FigmaAnalysisResult,
  VisualAnalysisResult
} from '../figmaAnalysisController';

import { DesignIntent } from './designIntentEngine';

// ===== 響應式行為類型定義 =====

export interface ResponsiveAnalysis {
  breakpointStrategy: BreakpointStrategy;
  layoutAdaptation: LayoutAdaptation;
  contentPrioritization: ContentPrioritization;
  interactionAdaptation: InteractionAdaptation;
  performanceOptimization: PerformanceOptimization;
  accessibilityConsiderations: AccessibilityConsideration[];
  recommendations: ResponsiveRecommendation[];
  confidence: number;
}

export interface BreakpointStrategy {
  approach: 'mobile-first' | 'desktop-first' | 'content-first' | 'hybrid';
  breakpoints: ResponsiveBreakpoint[];
  rationale: string;
  flexibility: 'rigid' | 'fluid' | 'adaptive' | 'container-queries';
  confidence: number;
}

export interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  targetDevices: string[];
  layoutChanges: LayoutChange[];
  contentChanges: ContentChange[];
  interactionChanges: InteractionChange[];
  priority: 'critical' | 'important' | 'optional';
  reasoning: string;
}

export interface LayoutChange {
  property: string;
  fromValue: any;
  toValue: any;
  reason: string;
  impact: 'major' | 'minor' | 'cosmetic';
  fallback?: any;
}

export interface ContentChange {
  element: string;
  changeType: 'hide' | 'show' | 'truncate' | 'reorder' | 'resize';
  condition: string;
  priority: number;
  userImpact: 'positive' | 'neutral' | 'negative';
}

export interface InteractionChange {
  interaction: string;
  adaptation: string;
  reasoning: string;
  alternatives: string[];
}

export interface LayoutAdaptation {
  containerStrategy: ContainerStrategy;
  gridAdaptation: GridAdaptation;
  typographyScaling: TypographyScaling;
  spacingAdjustment: SpacingAdjustment;
  imageOptimization: ImageOptimization;
  navigationAdaptation: NavigationAdaptation;
}

export interface ContainerStrategy {
  approach: 'fixed-width' | 'fluid' | 'hybrid' | 'container-queries';
  maxWidth: number;
  padding: ResponsivePadding;
  centeringMethod: 'margin-auto' | 'flexbox' | 'grid';
  breakoutElements: string[];
}

export interface ResponsivePadding {
  mobile: number;
  tablet: number;
  desktop: number;
  reasoning: string;
}

export interface GridAdaptation {
  columns: DeviceColumns;
  gap: DeviceSpacing;
  alignment: DeviceAlignment;
  reorderStrategy: 'none' | 'priority-based' | 'context-aware';
  collapseBehavior: 'stack' | 'hide' | 'accordion';
}

export interface DeviceColumns {
  mobile: number;
  tablet: number;
  desktop: number;
  reasoning: string;
}

export interface DeviceSpacing {
  mobile: number;
  tablet: number;
  desktop: number;
  unit: 'px' | 'rem' | '%' | 'vw';
}

export interface DeviceAlignment {
  mobile: 'start' | 'center' | 'end' | 'stretch';
  tablet: 'start' | 'center' | 'end' | 'stretch';
  desktop: 'start' | 'center' | 'end' | 'stretch';
}

export interface TypographyScaling {
  scaleRatio: number;
  baseSize: number;
  minSize: number;
  maxSize: number;
  scalingMethod: 'linear' | 'modular' | 'fluid' | 'clamp';
  readabilityOptimization: ReadabilityOptimization;
}

export interface ReadabilityOptimization {
  lineHeight: DeviceLineHeight;
  letterSpacing: DeviceLetterSpacing;
  lineLength: DeviceLineLength;
}

export interface DeviceLineHeight {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface DeviceLetterSpacing {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface DeviceLineLength {
  mobile: number;
  tablet: number;
  desktop: number;
  unit: 'ch' | 'em' | 'px';
}

export interface SpacingAdjustment {
  scalingFactor: number;
  minimumSpacing: number;
  maximumSpacing: number;
  contextualAdjustments: ContextualSpacing[];
}

export interface ContextualSpacing {
  context: string;
  adjustment: number;
  reasoning: string;
}

export interface ImageOptimization {
  sizingStrategy: 'fixed' | 'responsive' | 'adaptive' | 'art-direction';
  formatOptimization: boolean;
  lazyLoading: boolean;
  placeholderStrategy: 'blur' | 'skeleton' | 'color' | 'none';
  srcsetGeneration: boolean;
  criticalImages: string[];
}

export interface NavigationAdaptation {
  mobilePattern: 'hamburger' | 'tab-bar' | 'drawer' | 'accordion' | 'none';
  tabletPattern: 'horizontal' | 'sidebar' | 'hybrid' | 'same-as-mobile';
  desktopPattern: 'horizontal' | 'mega-menu' | 'sidebar' | 'sticky';
  transitionHandling: TransitionHandling;
}

export interface TransitionHandling {
  animation: boolean;
  duration: number;
  easing: string;
  reducedMotion: boolean;
}

export interface ContentPrioritization {
  strategy: 'progressive-disclosure' | 'content-hierarchy' | 'user-centered' | 'context-aware';
  priorityLevels: ContentPriority[];
  hidingStrategies: HidingStrategy[];
  showingStrategies: ShowingStrategy[];
  contentReordering: ContentReordering[];
}

export interface ContentPriority {
  level: number;
  elements: string[];
  visibility: DeviceVisibility;
  reasoning: string;
}

export interface DeviceVisibility {
  mobile: 'visible' | 'hidden' | 'collapsed' | 'summary';
  tablet: 'visible' | 'hidden' | 'collapsed' | 'summary';
  desktop: 'visible' | 'hidden' | 'collapsed' | 'summary';
}

export interface HidingStrategy {
  method: 'display-none' | 'visibility-hidden' | 'opacity-zero' | 'offscreen';
  condition: string;
  reversible: boolean;
  seoImpact: 'none' | 'minor' | 'major';
}

export interface ShowingStrategy {
  method: 'modal' | 'accordion' | 'tab' | 'hover' | 'click' | 'scroll';
  trigger: string;
  context: string;
  userControl: boolean;
}

export interface ContentReordering {
  elements: string[];
  mobileOrder: number[];
  tabletOrder: number[];
  desktopOrder: number[];
  reasoning: string;
}

export interface InteractionAdaptation {
  touchOptimization: TouchOptimization;
  hoverFallbacks: HoverFallback[];
  inputMethodAdaptation: InputMethodAdaptation;
  gestureSupport: GestureSupport;
  accessibilityEnhancement: AccessibilityEnhancement[];
}

export interface TouchOptimization {
  minimumTargetSize: number;
  spacing: number;
  feedbackMethod: 'visual' | 'haptic' | 'both';
  errorPrevention: ErrorPrevention;
}

export interface ErrorPrevention {
  confirmationDialogs: string[];
  undoMechanisms: string[];
  safeguards: string[];
}

export interface HoverFallback {
  originalHover: string;
  touchEquivalent: string;
  implementation: string;
  userExperience: 'equivalent' | 'enhanced' | 'simplified';
}

export interface InputMethodAdaptation {
  keyboard: KeyboardAdaptation;
  mouse: MouseAdaptation;
  touch: TouchAdaptation;
  voice: VoiceAdaptation;
}

export interface KeyboardAdaptation {
  navigation: 'tab' | 'arrow' | 'custom';
  shortcuts: KeyboardShortcut[];
  visualIndicators: boolean;
  skipLinks: boolean;
}

export interface MouseAdaptation {
  hoverStates: boolean;
  contextMenus: boolean;
  dragAndDrop: boolean;
  preciseCursors: boolean;
}

export interface TouchAdaptation {
  swipeGestures: SwipeGesture[];
  pinchZoom: boolean;
  longPress: boolean;
  multiTouch: boolean;
}

export interface VoiceAdaptation {
  voiceCommands: boolean;
  speechRecognition: boolean;
  audioFeedback: boolean;
}

export interface KeyboardShortcut {
  key: string;
  action: string;
  context: string;
  description: string;
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  action: string;
  sensitivity: number;
  visual_feedback: boolean;
}

export interface GestureSupport {
  enabled: boolean;
  gestures: SupportedGesture[];
  fallbacks: GestureFallback[];
  accessibility: boolean;
}

export interface SupportedGesture {
  type: 'swipe' | 'pinch' | 'rotate' | 'long-press' | 'double-tap';
  action: string;
  context: string;
  alternative: string;
}

export interface GestureFallback {
  gesture: string;
  fallback: string;
  method: string;
}

export interface AccessibilityEnhancement {
  feature: string;
  implementation: string;
  targetGroup: string;
  impact: 'high' | 'medium' | 'low';
}

export interface PerformanceOptimization {
  loadingStrategy: LoadingStrategy;
  renderingOptimization: RenderingOptimization;
  resourceManagement: ResourceManagement;
  cacheStrategy: CacheStrategy;
  bundleOptimization: BundleOptimization;
}

export interface LoadingStrategy {
  approach: 'eager' | 'lazy' | 'progressive' | 'adaptive';
  prioritization: string[];
  placeholder: boolean;
  skeleton: boolean;
  criticalPath: string[];
}

export interface RenderingOptimization {
  virtualScrolling: boolean;
  componentLazyLoading: boolean;
  imageOptimization: boolean;
  cssOptimization: boolean;
  jsOptimization: boolean;
}

export interface ResourceManagement {
  imageSizes: string[];
  fontLoading: 'blocking' | 'swap' | 'fallback' | 'optional';
  preloading: string[];
  prefetching: string[];
  dnsPreconnect: string[];
}

export interface CacheStrategy {
  staticAssets: 'long-term' | 'short-term' | 'no-cache';
  dynamicContent: 'stale-while-revalidate' | 'no-cache' | 'cache-first';
  apiResponses: 'cache' | 'no-cache' | 'conditional';
}

export interface BundleOptimization {
  codeSplitting: boolean;
  treeshaking: boolean;
  compression: boolean;
  minification: boolean;
  polyfillStrategy: 'modern' | 'legacy' | 'differential';
}

export interface AccessibilityConsideration {
  concern: string;
  impact: 'high' | 'medium' | 'low';
  solution: string;
  implementation: string;
  testing: string;
}

export interface ResponsiveRecommendation {
  type: 'layout' | 'content' | 'performance' | 'accessibility' | 'interaction';
  priority: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  reasoning: string;
  implementation: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

// ===== 響應式行為推理引擎 =====

export class ResponsiveIntelligence {
  /**
   * 分析組件的響應式行為
   */
  static analyzeResponsiveBehavior(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult,
    designIntent?: DesignIntent
  ): ResponsiveAnalysis {
    const breakpointStrategy = this.analyzeBreakpointStrategy(component, analysisResult, designIntent);
    const layoutAdaptation = this.analyzeLayoutAdaptation(component, analysisResult);
    const contentPrioritization = this.analyzeContentPrioritization(component, designIntent);
    const interactionAdaptation = this.analyzeInteractionAdaptation(component, designIntent);
    const performanceOptimization = this.analyzePerformanceOptimization(component, analysisResult);
    const accessibilityConsiderations = this.analyzeAccessibilityConsiderations(component);
    
    const recommendations = this.generateResponsiveRecommendations(
      component,
      { breakpointStrategy, layoutAdaptation, contentPrioritization, interactionAdaptation, performanceOptimization }
    );
    
    const confidence = this.calculateConfidence([
      breakpointStrategy.confidence,
      0.85, // layoutAdaptation
      0.8,  // contentPrioritization
      0.75, // interactionAdaptation
      0.9   // performanceOptimization
    ]);
    
    return {
      breakpointStrategy,
      layoutAdaptation,
      contentPrioritization,
      interactionAdaptation,
      performanceOptimization,
      accessibilityConsiderations,
      recommendations,
      confidence
    };
  }

  /**
   * 分析斷點策略
   */
  private static analyzeBreakpointStrategy(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult,
    designIntent?: DesignIntent
  ): BreakpointStrategy {
    const existingBehavior = component.design.responsiveBehavior;
    const layout = component.design.visualProperties.layout;
    const role = component.semantic.componentRole;
    
    // 決定響應式方法
    let approach: BreakpointStrategy['approach'] = 'mobile-first';
    let flexibility: BreakpointStrategy['flexibility'] = 'fluid';
    
    // 基於組件角色和內容複雜度決定策略
    if (role === 'navigation') {
      approach = 'mobile-first';
      flexibility = 'adaptive';
    } else if (role === 'content' && designIntent?.functional.usageScenarios.some(s => s.context === 'mobile')) {
      approach = 'content-first';
      flexibility = 'fluid';
    } else if (layout.display === 'grid') {
      approach = 'mobile-first';
      flexibility = 'container-queries';
    }
    
    // 生成智能斷點
    const breakpoints = this.generateIntelligentBreakpoints(component, approach);
    
    const rationale = this.generateBreakpointRationale(approach, role, breakpoints);
    
    return {
      approach,
      breakpoints,
      rationale,
      flexibility,
      confidence: 0.85
    };
  }

  /**
   * 生成智能斷點
   */
  private static generateIntelligentBreakpoints(
    component: ErComponent,
    approach: BreakpointStrategy['approach']
  ): ResponsiveBreakpoint[] {
    const breakpoints: ResponsiveBreakpoint[] = [];
    const role = component.semantic.componentRole;
    
    // 移動設備斷點 (375px - 768px)
    breakpoints.push({
      name: 'mobile',
      minWidth: 375,
      maxWidth: 767,
      targetDevices: ['iPhone', 'Android Phone', 'Small Tablet'],
      layoutChanges: this.generateMobileLayoutChanges(component),
      contentChanges: this.generateMobileContentChanges(component),
      interactionChanges: this.generateMobileInteractionChanges(component),
      priority: 'critical',
      reasoning: '移動設備是主要流量來源，需優先優化'
    });
    
    // 平板設備斷點 (768px - 1024px)
    breakpoints.push({
      name: 'tablet',
      minWidth: 768,
      maxWidth: 1023,
      targetDevices: ['iPad', 'Android Tablet', 'Surface'],
      layoutChanges: this.generateTabletLayoutChanges(component),
      contentChanges: this.generateTabletContentChanges(component),
      interactionChanges: this.generateTabletInteractionChanges(component),
      priority: 'important',
      reasoning: '平板設備提供中等螢幕空間，平衡內容與互動'
    });
    
    // 桌面設備斷點 (1024px+)
    breakpoints.push({
      name: 'desktop',
      minWidth: 1024,
      targetDevices: ['Desktop', 'Laptop', 'Large Display'],
      layoutChanges: this.generateDesktopLayoutChanges(component),
      contentChanges: this.generateDesktopContentChanges(component),
      interactionChanges: this.generateDesktopInteractionChanges(component),
      priority: role === 'content' ? 'critical' : 'important',
      reasoning: '桌面設備提供最大螢幕空間和精準操作'
    });
    
    // 大螢幕設備斷點 (1440px+)
    if (role === 'layout' || role === 'content') {
      breakpoints.push({
        name: 'wide',
        minWidth: 1440,
        targetDevices: ['Wide Monitor', '4K Display'],
        layoutChanges: this.generateWideLayoutChanges(component),
        contentChanges: this.generateWideContentChanges(component),
        interactionChanges: [],
        priority: 'optional',
        reasoning: '大螢幕設備需要防止內容過度拉伸'
      });
    }
    
    return breakpoints;
  }

  /**
   * 生成移動佈局變更
   */
  private static generateMobileLayoutChanges(component: ErComponent): LayoutChange[] {
    const changes: LayoutChange[] = [];
    const layout = component.design.visualProperties.layout;
    
    // 強制單列佈局
    if (layout.display === 'grid' || (layout.display === 'flex' && layout.flexDirection === 'row')) {
      changes.push({
        property: 'flex-direction',
        fromValue: 'row',
        toValue: 'column',
        reason: '移動設備垂直空間充足，水平空間有限',
        impact: 'major'
      });
    }
    
    // 調整間距
    if (layout.gap && layout.gap > 16) {
      changes.push({
        property: 'gap',
        fromValue: layout.gap,
        toValue: Math.max(8, layout.gap * 0.5),
        reason: '移動設備需要緊湊佈局節省空間',
        impact: 'minor'
      });
    }
    
    // 調整內距
    if (layout.padding) {
      changes.push({
        property: 'padding',
        fromValue: layout.padding,
        toValue: {
          top: Math.max(8, layout.padding.top * 0.75),
          right: Math.max(16, layout.padding.right * 0.75),
          bottom: Math.max(8, layout.padding.bottom * 0.75),
          left: Math.max(16, layout.padding.left * 0.75)
        },
        reason: '移動設備需要適當內距平衡內容與觸控',
        impact: 'minor'
      });
    }
    
    return changes;
  }

  /**
   * 生成移動內容變更
   */
  private static generateMobileContentChanges(component: ErComponent): ContentChange[] {
    const changes: ContentChange[] = [];
    const role = component.semantic.componentRole;
    
    if (role === 'content') {
      // 隱藏次要內容
      changes.push({
        element: 'secondary-content',
        changeType: 'hide',
        condition: 'screen width < 768px',
        priority: 3,
        userImpact: 'neutral'
      });
      
      // 截斷長文本
      changes.push({
        element: 'description',
        changeType: 'truncate',
        condition: 'text length > 100 characters',
        priority: 2,
        userImpact: 'neutral'
      });
    } else if (role === 'navigation') {
      // 重排導航項目
      changes.push({
        element: 'nav-items',
        changeType: 'reorder',
        condition: 'mobile viewport',
        priority: 1,
        userImpact: 'positive'
      });
    }
    
    return changes;
  }

  /**
   * 生成移動交互變更
   */
  private static generateMobileInteractionChanges(component: ErComponent): InteractionChange[] {
    const changes: InteractionChange[] = [];
    const interactions = component.semantic.userInteractions;
    
    interactions.forEach(interaction => {
      if (interaction.trigger === 'hover') {
        changes.push({
          interaction: 'hover',
          adaptation: '轉換為觸控長按或點擊展開',
          reasoning: '移動設備不支持懸停狀態',
          alternatives: ['touch', 'tap', 'long-press']
        });
      }
    });
    
    return changes;
  }

  /**
   * 分析佈局適配
   */
  private static analyzeLayoutAdaptation(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult
  ): LayoutAdaptation {
    const layout = component.design.visualProperties.layout;
    const role = component.semantic.componentRole;
    
    const containerStrategy = this.analyzeContainerStrategy(component);
    const gridAdaptation = this.analyzeGridAdaptation(component);
    const typographyScaling = this.analyzeTypographyScaling(component);
    const spacingAdjustment = this.analyzeSpacingAdjustment(component);
    const imageOptimization = this.analyzeImageOptimization(component);
    const navigationAdaptation = this.analyzeNavigationAdaptation(component);
    
    return {
      containerStrategy,
      gridAdaptation,
      typographyScaling,
      spacingAdjustment,
      imageOptimization,
      navigationAdaptation
    };
  }

  /**
   * 分析容器策略
   */
  private static analyzeContainerStrategy(component: ErComponent): ContainerStrategy {
    const layout = component.design.visualProperties.layout;
    const role = component.semantic.componentRole;
    
    let approach: ContainerStrategy['approach'] = 'fluid';
    let maxWidth = 1200;
    
    if (role === 'content') {
      approach = 'hybrid';
      maxWidth = 1024;
    } else if (role === 'layout') {
      approach = 'container-queries';
      maxWidth = 1440;
    }
    
    const padding: ResponsivePadding = {
      mobile: 16,
      tablet: 24,
      desktop: 32,
      reasoning: '根據設備螢幕尺寸調整邊距，確保內容不會貼邊'
    };
    
    return {
      approach,
      maxWidth,
      padding,
      centeringMethod: 'margin-auto',
      breakoutElements: role === 'layout' ? ['hero-image', 'full-width-section'] : []
    };
  }

  /**
   * 分析網格適配
   */
  private static analyzeGridAdaptation(component: ErComponent): GridAdaptation {
    const layout = component.design.visualProperties.layout;
    const role = component.semantic.componentRole;
    
    // 根據內容複雜度決定列數
    const columns: DeviceColumns = {
      mobile: 1,
      tablet: role === 'content' ? 2 : 1,
      desktop: role === 'content' ? 3 : role === 'layout' ? 12 : 2,
      reasoning: '移動優先，逐步增加複雜度'
    };
    
    const gap: DeviceSpacing = {
      mobile: 16,
      tablet: 24,
      desktop: 32,
      unit: 'px'
    };
    
    const alignment: DeviceAlignment = {
      mobile: 'stretch',
      tablet: 'start',
      desktop: 'start'
    };
    
    return {
      columns,
      gap,
      alignment,
      reorderStrategy: 'priority-based',
      collapseBehavior: role === 'navigation' ? 'accordion' : 'stack'
    };
  }

  /**
   * 分析字體縮放
   */
  private static analyzeTypographyScaling(component: ErComponent): TypographyScaling {
    const typography = component.design.visualProperties.typography;
    
    const baseSize = typography?.fontSize || 16;
    const scaleRatio = 1.25; // Major Third
    
    return {
      scaleRatio,
      baseSize,
      minSize: Math.max(14, baseSize * 0.875),
      maxSize: baseSize * 1.5,
      scalingMethod: 'clamp',
      readabilityOptimization: {
        lineHeight: {
          mobile: 1.5,
          tablet: 1.4,
          desktop: 1.3
        },
        letterSpacing: {
          mobile: 0,
          tablet: 0,
          desktop: 0.01
        },
        lineLength: {
          mobile: 45,
          tablet: 60,
          desktop: 75,
          unit: 'ch'
        }
      }
    };
  }

  /**
   * 分析間距調整
   */
  private static analyzeSpacingAdjustment(component: ErComponent): SpacingAdjustment {
    const layout = component.design.visualProperties.layout;
    
    return {
      scalingFactor: 0.8,
      minimumSpacing: 8,
      maximumSpacing: 64,
      contextualAdjustments: [
        {
          context: '組件間距',
          adjustment: 0.75,
          reasoning: '移動設備需要緊湊佈局'
        },
        {
          context: '觸控目標間距',
          adjustment: 1.5,
          reasoning: '觸控需要足夠間距防誤觸'
        }
      ]
    };
  }

  /**
   * 分析圖像優化
   */
  private static analyzeImageOptimization(component: ErComponent): ImageOptimization {
    const role = component.semantic.componentRole;
    
    return {
      sizingStrategy: 'responsive',
      formatOptimization: true,
      lazyLoading: role !== 'navigation',
      placeholderStrategy: 'blur',
      srcsetGeneration: true,
      criticalImages: role === 'content' ? ['hero-image'] : []
    };
  }

  /**
   * 分析導航適配
   */
  private static analyzeNavigationAdaptation(component: ErComponent): NavigationAdaptation {
    const role = component.semantic.componentRole;
    
    if (role !== 'navigation') {
      return {
        mobilePattern: 'none',
        tabletPattern: 'same-as-mobile',
        desktopPattern: 'horizontal',
        transitionHandling: {
          animation: false,
          duration: 0,
          easing: 'ease',
          reducedMotion: true
        }
      };
    }
    
    return {
      mobilePattern: 'hamburger',
      tabletPattern: 'horizontal',
      desktopPattern: 'horizontal',
      transitionHandling: {
        animation: true,
        duration: 300,
        easing: 'ease-out',
        reducedMotion: true
      }
    };
  }

  /**
   * 分析內容優先級
   */
  private static analyzeContentPrioritization(
    component: ErComponent,
    designIntent?: DesignIntent
  ): ContentPrioritization {
    const role = component.semantic.componentRole;
    const userGoals = designIntent?.functional.userGoals || [];
    
    let strategy: ContentPrioritization['strategy'] = 'progressive-disclosure';
    
    if (userGoals.length > 0) {
      strategy = 'user-centered';
    } else if (role === 'content') {
      strategy = 'content-hierarchy';
    }
    
    const priorityLevels = this.generateContentPriorities(component, userGoals);
    const hidingStrategies = this.generateHidingStrategies(component);
    const showingStrategies = this.generateShowingStrategies(component);
    const contentReordering = this.generateContentReordering(component);
    
    return {
      strategy,
      priorityLevels,
      hidingStrategies,
      showingStrategies,
      contentReordering
    };
  }

  /**
   * 生成內容優先級
   */
  private static generateContentPriorities(
    component: ErComponent,
    userGoals: any[]
  ): ContentPriority[] {
    const role = component.semantic.componentRole;
    const priorities: ContentPriority[] = [];
    
    // 第一優先級：核心功能
    priorities.push({
      level: 1,
      elements: [role === 'input' ? 'input-field' : 'primary-content'],
      visibility: {
        mobile: 'visible',
        tablet: 'visible',
        desktop: 'visible'
      },
      reasoning: '核心功能必須在所有設備上可見'
    });
    
    // 第二優先級：支持信息
    priorities.push({
      level: 2,
      elements: ['labels', 'descriptions', 'help-text'],
      visibility: {
        mobile: 'visible',
        tablet: 'visible',
        desktop: 'visible'
      },
      reasoning: '支持信息幫助用戶理解和使用功能'
    });
    
    // 第三優先級：次要功能
    priorities.push({
      level: 3,
      elements: ['secondary-actions', 'additional-info'],
      visibility: {
        mobile: 'collapsed',
        tablet: 'visible',
        desktop: 'visible'
      },
      reasoning: '次要功能在移動設備上可摺疊節省空間'
    });
    
    // 第四優先級：裝飾元素
    priorities.push({
      level: 4,
      elements: ['decorations', 'animations', 'background-images'],
      visibility: {
        mobile: 'hidden',
        tablet: 'summary',
        desktop: 'visible'
      },
      reasoning: '裝飾元素在小螢幕上可隱藏優化性能'
    });
    
    return priorities;
  }

  /**
   * 生成隱藏策略
   */
  private static generateHidingStrategies(component: ErComponent): HidingStrategy[] {
    return [
      {
        method: 'display-none',
        condition: 'non-essential content on mobile',
        reversible: true,
        seoImpact: 'minor'
      },
      {
        method: 'visibility-hidden',
        condition: 'temporarily hidden interactive elements',
        reversible: true,
        seoImpact: 'none'
      },
      {
        method: 'offscreen',
        condition: 'screen reader accessible but visually hidden',
        reversible: false,
        seoImpact: 'none'
      }
    ];
  }

  /**
   * 生成顯示策略
   */
  private static generateShowingStrategies(component: ErComponent): ShowingStrategy[] {
    const role = component.semantic.componentRole;
    const strategies: ShowingStrategy[] = [];
    
    if (role === 'navigation') {
      strategies.push({
        method: 'accordion',
        trigger: 'click',
        context: 'mobile navigation menu',
        userControl: true
      });
    }
    
    if (role === 'content') {
      strategies.push({
        method: 'modal',
        trigger: 'click',
        context: 'additional information',
        userControl: true
      });
    }
    
    return strategies;
  }

  /**
   * 生成內容重排
   */
  private static generateContentReordering(component: ErComponent): ContentReordering[] {
    const role = component.semantic.componentRole;
    const reordering: ContentReordering[] = [];
    
    if (role === 'input') {
      reordering.push({
        elements: ['label', 'input', 'help', 'error'],
        mobileOrder: [1, 2, 3, 4],
        tabletOrder: [1, 2, 3, 4],
        desktopOrder: [1, 2, 3, 4],
        reasoning: '表單元素順序保持一致確保可用性'
      });
    } else if (role === 'content') {
      reordering.push({
        elements: ['title', 'image', 'description', 'actions'],
        mobileOrder: [1, 2, 3, 4],
        tabletOrder: [1, 2, 3, 4],
        desktopOrder: [2, 1, 3, 4],
        reasoning: '桌面版可將圖片前置吸引注意力'
      });
    }
    
    return reordering;
  }

  /**
   * 分析交互適配
   */
  private static analyzeInteractionAdaptation(
    component: ErComponent,
    designIntent?: DesignIntent
  ): InteractionAdaptation {
    const touchOptimization = this.analyzeTouchOptimization(component);
    const hoverFallbacks = this.analyzeHoverFallbacks(component);
    const inputMethodAdaptation = this.analyzeInputMethodAdaptation(component);
    const gestureSupport = this.analyzeGestureSupport(component);
    const accessibilityEnhancement = this.analyzeAccessibilityEnhancement(component);
    
    return {
      touchOptimization,
      hoverFallbacks,
      inputMethodAdaptation,
      gestureSupport,
      accessibilityEnhancement
    };
  }

  /**
   * 分析觸控優化
   */
  private static analyzeTouchOptimization(component: ErComponent): TouchOptimization {
    const role = component.semantic.componentRole;
    
    let minimumTargetSize = 44; // Apple 建議
    if (role === 'input') {
      minimumTargetSize = 48; // Material Design 建議
    }
    
    return {
      minimumTargetSize,
      spacing: Math.max(8, minimumTargetSize * 0.2),
      feedbackMethod: 'both',
      errorPrevention: {
        confirmationDialogs: role === 'interactive' ? ['delete', 'submit'] : [],
        undoMechanisms: ['undo-last-action'],
        safeguards: ['prevent-double-tap', 'debounce-rapid-taps']
      }
    };
  }

  /**
   * 分析懸停回退
   */
  private static analyzeHoverFallbacks(component: ErComponent): HoverFallback[] {
    const interactions = component.semantic.userInteractions;
    const fallbacks: HoverFallback[] = [];
    
    interactions.forEach(interaction => {
      if (interaction.trigger === 'hover') {
        fallbacks.push({
          originalHover: 'show additional info on hover',
          touchEquivalent: 'tap to toggle info visibility',
          implementation: 'use @media (hover: hover) to detect hover capability',
          userExperience: 'equivalent'
        });
      }
    });
    
    return fallbacks;
  }

  /**
   * 分析輸入方法適配
   */
  private static analyzeInputMethodAdaptation(component: ErComponent): InputMethodAdaptation {
    const role = component.semantic.componentRole;
    
    return {
      keyboard: {
        navigation: 'tab',
        shortcuts: role === 'input' ? [
          { key: 'Enter', action: 'submit', context: 'form', description: '提交表單' },
          { key: 'Escape', action: 'cancel', context: 'form', description: '取消操作' }
        ] : [],
        visualIndicators: true,
        skipLinks: role === 'navigation'
      },
      mouse: {
        hoverStates: true,
        contextMenus: false,
        dragAndDrop: false,
        preciseCursors: role === 'input'
      },
      touch: {
        swipeGestures: role === 'content' ? [
          { direction: 'left', action: 'next', sensitivity: 0.3, visual_feedback: true },
          { direction: 'right', action: 'previous', sensitivity: 0.3, visual_feedback: true }
        ] : [],
        pinchZoom: role === 'content',
        longPress: false,
        multiTouch: false
      },
      voice: {
        voiceCommands: false,
        speechRecognition: role === 'input',
        audioFeedback: false
      }
    };
  }

  /**
   * 分析手勢支持
   */
  private static analyzeGestureSupport(component: ErComponent): GestureSupport {
    const role = component.semantic.componentRole;
    
    if (role === 'content') {
      return {
        enabled: true,
        gestures: [
          {
            type: 'swipe',
            action: 'navigate',
            context: 'content browsing',
            alternative: 'arrow buttons'
          }
        ],
        fallbacks: [
          {
            gesture: 'swipe',
            fallback: 'button navigation',
            method: 'progressive enhancement'
          }
        ],
        accessibility: true
      };
    }
    
    return {
      enabled: false,
      gestures: [],
      fallbacks: [],
      accessibility: true
    };
  }

  /**
   * 分析無障礙增強
   */
  private static analyzeAccessibilityEnhancement(component: ErComponent): AccessibilityEnhancement[] {
    const enhancements: AccessibilityEnhancement[] = [];
    
    // 觸控目標增強
    enhancements.push({
      feature: '觸控目標大小優化',
      implementation: '確保所有可點擊元素至少 44px × 44px',
      targetGroup: '運動障礙用戶',
      impact: 'high'
    });
    
    // 焦點管理增強
    enhancements.push({
      feature: '焦點管理優化',
      implementation: '可見焦點指示器和邏輯焦點順序',
      targetGroup: '鍵盤用戶',
      impact: 'high'
    });
    
    // 螢幕閱讀器增強
    enhancements.push({
      feature: '螢幕閱讀器支援',
      implementation: '語義化 HTML 和適當的 ARIA 標籤',
      targetGroup: '視覺障礙用戶',
      impact: 'high'
    });
    
    return enhancements;
  }

  /**
   * 分析性能優化
   */
  private static analyzePerformanceOptimization(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult
  ): PerformanceOptimization {
    const role = component.semantic.componentRole;
    
    const loadingStrategy: LoadingStrategy = {
      approach: role === 'navigation' ? 'eager' : 'lazy',
      prioritization: [
        'critical-css',
        'above-fold-content',
        'interactive-elements',
        'below-fold-content'
      ],
      placeholder: true,
      skeleton: role === 'content',
      criticalPath: ['fonts', 'critical-css', 'main-script']
    };
    
    const renderingOptimization: RenderingOptimization = {
      virtualScrolling: role === 'content',
      componentLazyLoading: true,
      imageOptimization: true,
      cssOptimization: true,
      jsOptimization: true
    };
    
    const resourceManagement: ResourceManagement = {
      imageSizes: ['320w', '640w', '960w', '1280w'],
      fontLoading: 'swap',
      preloading: ['critical-fonts', 'hero-images'],
      prefetching: ['next-page-resources'],
      dnsPreconnect: ['fonts.googleapis.com', 'cdn.example.com']
    };
    
    const cacheStrategy: CacheStrategy = {
      staticAssets: 'long-term',
      dynamicContent: 'stale-while-revalidate',
      apiResponses: 'cache'
    };
    
    const bundleOptimization: BundleOptimization = {
      codeSplitting: true,
      treeshaking: true,
      compression: true,
      minification: true,
      polyfillStrategy: 'differential'
    };
    
    return {
      loadingStrategy,
      renderingOptimization,
      resourceManagement,
      cacheStrategy,
      bundleOptimization
    };
  }

  /**
   * 分析無障礙考量
   */
  private static analyzeAccessibilityConsiderations(component: ErComponent): AccessibilityConsideration[] {
    const considerations: AccessibilityConsideration[] = [];
    const role = component.semantic.componentRole;
    
    // 觸控目標尺寸
    considerations.push({
      concern: '觸控目標過小導致操作困難',
      impact: 'high',
      solution: '確保最小 44px × 44px 觸控區域',
      implementation: 'CSS min-width 和 min-height 屬性',
      testing: '使用輔助技術和實際設備測試'
    });
    
    // 色彩對比
    considerations.push({
      concern: '色彩對比度不足影響閱讀',
      impact: 'high',
      solution: '確保至少 4.5:1 對比度',
      implementation: '調整前景和背景顏色',
      testing: '使用對比度檢查工具'
    });
    
    // 鍵盤導航
    if (role === 'input' || role === 'interactive') {
      considerations.push({
        concern: '鍵盤用戶無法有效導航',
        impact: 'high',
        solution: '提供完整鍵盤導航支援',
        implementation: '適當的 tabindex 和焦點管理',
        testing: '純鍵盤操作測試'
      });
    }
    
    return considerations;
  }

  /**
   * 生成響應式建議
   */
  private static generateResponsiveRecommendations(
    component: ErComponent,
    analysis: any
  ): ResponsiveRecommendation[] {
    const recommendations: ResponsiveRecommendation[] = [];
    const role = component.semantic.componentRole;
    
    // 佈局建議
    if (analysis.breakpointStrategy.flexibility !== 'container-queries') {
      recommendations.push({
        type: 'layout',
        priority: 'medium',
        recommendation: '考慮使用 Container Queries 實現更精確的響應式控制',
        reasoning: 'Container Queries 可基於容器尺寸而非視窗尺寸進行響應',
        implementation: '@container (min-width: 400px) { ... }',
        effort: 'medium',
        impact: 'high'
      });
    }
    
    // 性能建議
    recommendations.push({
      type: 'performance',
      priority: 'high',
      recommendation: '實施圖片優化和延遲載入',
      reasoning: '減少初始載入時間和數據使用量',
      implementation: '使用 loading="lazy" 和 responsive images',
      effort: 'low',
      impact: 'high'
    });
    
    // 無障礙建議
    recommendations.push({
      type: 'accessibility',
      priority: 'critical',
      recommendation: '確保觸控目標符合無障礙標準',
      reasoning: '改善運動障礙用戶的操作體驗',
      implementation: '最小 44px × 44px 觸控區域',
      effort: 'low',
      impact: 'high'
    });
    
    // 交互建議
    if (component.semantic.userInteractions.some(i => i.trigger === 'hover')) {
      recommendations.push({
        type: 'interaction',
        priority: 'high',
        recommendation: '提供懸停效果的觸控替代方案',
        reasoning: '確保移動設備用戶能獲得相同功能',
        implementation: '使用 @media (hover: hover) 檢測和適配',
        effort: 'medium',
        impact: 'high'
      });
    }
    
    return recommendations;
  }

  // ===== 輔助方法 =====

  private static generateBreakpointRationale(
    approach: BreakpointStrategy['approach'],
    role: string,
    breakpoints: ResponsiveBreakpoint[]
  ): string {
    const strategies = {
      'mobile-first': '移動優先策略確保在資源受限設備上的最佳性能',
      'desktop-first': '桌面優先策略適合複雜交互和豐富內容展示',
      'content-first': '基於內容特性決定斷點，確保最佳閱讀和交互體驗',
      'hybrid': '混合策略平衡不同設備需求和開發效率'
    };
    
    return `${strategies[approach]}。針對 ${role} 組件，設計了 ${breakpoints.length} 個關鍵斷點以優化跨設備體驗。`;
  }

  private static calculateConfidence(scores: number[]): number {
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private static generateTabletLayoutChanges(component: ErComponent): LayoutChange[] {
    return [
      {
        property: 'grid-template-columns',
        fromValue: '1fr',
        toValue: 'repeat(2, 1fr)',
        reason: '平板設備可容納兩列佈局',
        impact: 'major'
      }
    ];
  }

  private static generateDesktopLayoutChanges(component: ErComponent): LayoutChange[] {
    return [
      {
        property: 'max-width',
        fromValue: '100%',
        toValue: '1200px',
        reason: '桌面設備限制最大寬度提升可讀性',
        impact: 'minor'
      }
    ];
  }

  private static generateWideLayoutChanges(component: ErComponent): LayoutChange[] {
    return [
      {
        property: 'margin',
        fromValue: '0',
        toValue: '0 auto',
        reason: '超寬螢幕居中內容避免過度拉伸',
        impact: 'cosmetic'
      }
    ];
  }

  private static generateTabletContentChanges(component: ErComponent): ContentChange[] {
    return [
      {
        element: 'secondary-content',
        changeType: 'show',
        condition: 'screen width >= 768px',
        priority: 2,
        userImpact: 'positive'
      }
    ];
  }

  private static generateDesktopContentChanges(component: ErComponent): ContentChange[] {
    return [
      {
        element: 'all-content',
        changeType: 'show',
        condition: 'screen width >= 1024px',
        priority: 1,
        userImpact: 'positive'
      }
    ];
  }

  private static generateWideContentChanges(component: ErComponent): ContentChange[] {
    return [
      {
        element: 'sidebar-content',
        changeType: 'show',
        condition: 'screen width >= 1440px',
        priority: 3,
        userImpact: 'neutral'
      }
    ];
  }

  private static generateTabletInteractionChanges(component: ErComponent): InteractionChange[] {
    return [
      {
        interaction: 'touch',
        adaptation: '支援觸控和滑鼠雙重輸入模式',
        reasoning: '平板設備可能使用多種輸入方式',
        alternatives: ['touch', 'mouse', 'stylus']
      }
    ];
  }

  private static generateDesktopInteractionChanges(component: ErComponent): InteractionChange[] {
    return [
      {
        interaction: 'hover',
        adaptation: '啟用懸停效果和精確指標交互',
        reasoning: '桌面設備支援精確的滑鼠懸停',
        alternatives: ['hover', 'focus', 'click']
      }
    ];
  }
}

export default ResponsiveIntelligence;