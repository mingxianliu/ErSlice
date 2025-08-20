/**
 * 設計意圖理解引擎
 * ErSlice 的核心 AI 創新：理解設計師的真實意圖
 * 
 * 核心理念：
 * - 不僅轉換視覺元素，更重要的是理解設計背後的意圖
 * - 從視覺、功能、交互、業務四個維度分析設計意圖
 * - 基於意圖生成更智能的代碼和體驗優化建議
 */

import {
  ErComponent,
  ComponentRole,
  DeviceType,
  InteractionPattern
} from '../../types/erComponent';

import {
  FigmaAnalysisResult,
  VisualAnalysisResult
} from '../figmaAnalysisController';

// ===== 設計意圖類型定義 =====

export interface DesignIntent {
  visual: VisualIntent;
  functional: FunctionalIntent;
  interaction: InteractionIntent;
  business: BusinessIntent;
  confidence: number;
  insights: IntentInsight[];
  recommendations: IntentRecommendation[];
}

export interface VisualIntent {
  brandExpression: BrandExpression;
  emotionalTone: EmotionalTone;
  visualHierarchy: VisualHierarchy;
  aestheticStyle: AestheticStyle;
  designPrinciples: DesignPrinciple[];
  confidence: number;
}

export interface FunctionalIntent {
  userGoals: UserGoal[];
  businessObjectives: BusinessObjective[];
  usageScenarios: UsageScenario[];
  performanceRequirements: PerformanceRequirement[];
  accessibilityNeeds: AccessibilityNeed[];
  confidence: number;
}

export interface InteractionIntent {
  userFlows: UserFlow[];
  feedbackMechanisms: FeedbackMechanism[];
  guidanceStrategies: GuidanceStrategy[];
  errorHandling: ErrorHandling[];
  microInteractions: MicroInteraction[];
  confidence: number;
}

export interface BusinessIntent {
  conversionGoals: ConversionGoal[];
  engagementStrategy: EngagementStrategy;
  userRetention: RetentionStrategy;
  brandPositioning: BrandPositioning;
  competitiveDifferentiation: CompetitiveDifferentiation[];
  confidence: number;
}

// ===== 具體意圖類型 =====

export interface BrandExpression {
  personality: 'professional' | 'friendly' | 'innovative' | 'trustworthy' | 'playful' | 'luxurious';
  voice: 'formal' | 'casual' | 'authoritative' | 'conversational' | 'technical';
  values: string[];
  colorPsychology: ColorPsychology;
  confidence: number;
}

export interface ColorPsychology {
  primary: string;
  emotional_impact: 'calm' | 'energetic' | 'trustworthy' | 'creative' | 'urgent' | 'premium';
  cultural_context: string;
  accessibility_score: number;
}

export interface EmotionalTone {
  primary: 'confident' | 'welcoming' | 'urgent' | 'peaceful' | 'exciting' | 'sophisticated';
  secondary?: string;
  emotional_journey: EmotionalState[];
  confidence: number;
}

export interface EmotionalState {
  stage: 'initial' | 'interaction' | 'completion' | 'error';
  emotion: string;
  triggers: string[];
}

export interface VisualHierarchy {
  primary_focus: string;
  secondary_elements: string[];
  information_flow: 'linear' | 'grid' | 'scattered' | 'layered';
  attention_guidance: AttentionGuidance[];
  confidence: number;
}

export interface AttentionGuidance {
  element: string;
  priority: number;
  guidance_method: 'size' | 'color' | 'position' | 'contrast' | 'animation';
}

export interface AestheticStyle {
  style: 'minimal' | 'modern' | 'classic' | 'playful' | 'industrial' | 'organic';
  influences: string[];
  consistency_score: number;
  innovation_level: 'conservative' | 'moderate' | 'bold';
  confidence: number;
}

export interface DesignPrinciple {
  principle: 'balance' | 'contrast' | 'emphasis' | 'rhythm' | 'unity' | 'proportion';
  application: string;
  effectiveness: number;
}

export interface UserGoal {
  goal: string;
  priority: 'primary' | 'secondary' | 'tertiary';
  user_type: string;
  success_criteria: string[];
  obstacles: string[];
}

export interface BusinessObjective {
  objective: string;
  kpi: string;
  target_value: number;
  measurement_method: string;
  timeline: string;
}

export interface UsageScenario {
  scenario: string;
  context: 'desktop' | 'mobile' | 'tablet' | 'multi-device';
  frequency: 'daily' | 'weekly' | 'occasional' | 'one-time';
  user_state: 'focused' | 'distracted' | 'rushed' | 'exploratory';
  environment: string;
}

export interface PerformanceRequirement {
  metric: 'load_time' | 'interaction_delay' | 'animation_smoothness' | 'battery_usage';
  target: number;
  priority: 'critical' | 'important' | 'nice-to-have';
  reasoning: string;
}

export interface AccessibilityNeed {
  need: string;
  target_group: string;
  implementation: string;
  priority: 'critical' | 'important' | 'nice-to-have';
}

export interface UserFlow {
  flow_name: string;
  steps: FlowStep[];
  decision_points: DecisionPoint[];
  exit_points: ExitPoint[];
  success_rate: number;
}

export interface FlowStep {
  step: string;
  user_action: string;
  system_response: string;
  potential_issues: string[];
}

export interface DecisionPoint {
  point: string;
  options: string[];
  default_choice: string;
  reasoning: string;
}

export interface ExitPoint {
  point: string;
  reason: string;
  recovery_action?: string;
}

export interface FeedbackMechanism {
  type: 'visual' | 'auditory' | 'haptic' | 'textual';
  trigger: string;
  response: string;
  timing: 'immediate' | 'delayed' | 'on-completion';
  purpose: 'confirmation' | 'guidance' | 'error' | 'progress';
}

export interface GuidanceStrategy {
  strategy: 'progressive_disclosure' | 'affordances' | 'signifiers' | 'constraints' | 'mappings';
  implementation: string;
  target_behavior: string;
  effectiveness: number;
}

export interface ErrorHandling {
  error_type: string;
  prevention_strategy: string;
  recovery_strategy: string;
  user_communication: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface MicroInteraction {
  trigger: string;
  feedback: string;
  purpose: 'delight' | 'guidance' | 'feedback' | 'branding';
  timing: number;
  easing: string;
}

export interface ConversionGoal {
  goal: string;
  funnel_stage: 'awareness' | 'interest' | 'consideration' | 'purchase' | 'retention';
  conversion_trigger: string;
  barriers: string[];
  optimization_opportunities: string[];
}

export interface EngagementStrategy {
  primary_hook: string;
  engagement_loops: EngagementLoop[];
  personalization_level: 'none' | 'basic' | 'adaptive' | 'ai-driven';
  content_strategy: string;
}

export interface EngagementLoop {
  trigger: string;
  action: string;
  reward: string;
  investment: string;
}

export interface RetentionStrategy {
  strategy: 'habit_formation' | 'value_demonstration' | 'community_building' | 'personalization';
  tactics: string[];
  measurement: string;
}

export interface BrandPositioning {
  position: string;
  differentiators: string[];
  target_perception: string;
  competitive_advantages: string[];
}

export interface CompetitiveDifferentiation {
  feature: string;
  advantage: string;
  evidence: string;
  sustainability: 'low' | 'medium' | 'high';
}

export interface IntentInsight {
  insight: string;
  category: 'visual' | 'functional' | 'interaction' | 'business';
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export interface IntentRecommendation {
  recommendation: string;
  category: 'design' | 'development' | 'content' | 'strategy';
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  implementation: string;
}

// ===== 設計意圖理解引擎 =====

export class DesignIntentEngine {
  /**
   * 分析組件的設計意圖
   */
  static analyzeDesignIntent(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult
  ): DesignIntent {
    const visual = this.analyzeVisualIntent(component, analysisResult);
    const functional = this.analyzeFunctionalIntent(component, analysisResult);
    const interaction = this.analyzeInteractionIntent(component, analysisResult);
    const business = this.analyzeBusinessIntent(component, analysisResult);
    
    const overallConfidence = (
      visual.confidence + functional.confidence + 
      interaction.confidence + business.confidence
    ) / 4;
    
    const insights = this.generateInsights(visual, functional, interaction, business);
    const recommendations = this.generateRecommendations(component, {
      visual, functional, interaction, business
    });
    
    return {
      visual,
      functional,
      interaction,
      business,
      confidence: overallConfidence,
      insights,
      recommendations
    };
  }

  /**
   * 分析視覺意圖
   */
  private static analyzeVisualIntent(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult
  ): VisualIntent {
    const brandExpression = this.analyzeBrandExpression(component, analysisResult);
    const emotionalTone = this.analyzeEmotionalTone(component, analysisResult);
    const visualHierarchy = this.analyzeVisualHierarchy(component, analysisResult);
    const aestheticStyle = this.analyzeAestheticStyle(component, analysisResult);
    const designPrinciples = this.analyzeDesignPrinciples(component, analysisResult);
    
    const confidence = (
      brandExpression.confidence + emotionalTone.confidence + 
      visualHierarchy.confidence + aestheticStyle.confidence
    ) / 4;
    
    return {
      brandExpression,
      emotionalTone,
      visualHierarchy,
      aestheticStyle,
      designPrinciples,
      confidence
    };
  }

  /**
   * 分析品牌表達
   */
  private static analyzeBrandExpression(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult
  ): BrandExpression {
    const colors = this.extractColors(component);
    const typography = this.extractTypography(component);
    const layout = component.design.visualProperties.layout;
    
    // 基於視覺元素推斷品牌個性
    let personality: BrandExpression['personality'] = 'professional';
    let voice: BrandExpression['voice'] = 'formal';
    
    // 顏色心理學分析
    const colorPsychology = this.analyzeColorPsychology(colors);
    
    // 根據顏色和佈局推斷個性
    if (colorPsychology.emotional_impact === 'playful') {
      personality = 'playful';
      voice = 'casual';
    } else if (colorPsychology.emotional_impact === 'premium') {
      personality = 'luxurious';
      voice = 'authoritative';
    } else if (colorPsychology.emotional_impact === 'creative') {
      personality = 'innovative';
      voice = 'conversational';
    } else if (colorPsychology.emotional_impact === 'trustworthy') {
      personality = 'trustworthy';
      voice = 'formal';
    }
    
    // 根據佈局推斷個性
    if (layout.display === 'flex' && layout.justifyContent === 'center') {
      personality = 'friendly';
    }
    
    const values = this.inferBrandValues(personality, colorPsychology);
    
    return {
      personality,
      voice,
      values,
      colorPsychology,
      confidence: 0.8
    };
  }

  /**
   * 分析顏色心理學
   */
  private static analyzeColorPsychology(colors: string[]): ColorPsychology {
    const primary = colors[0] || '#000000';
    
    // 簡化的顏色心理學分析
    let emotional_impact: ColorPsychology['emotional_impact'] = 'trustworthy';
    
    const hue = this.getHue(primary);
    if (hue >= 0 && hue < 30) emotional_impact = 'energetic'; // 紅色系
    else if (hue >= 30 && hue < 60) emotional_impact = 'creative'; // 橙黃色系
    else if (hue >= 120 && hue < 180) emotional_impact = 'calm'; // 綠色系
    else if (hue >= 180 && hue < 240) emotional_impact = 'trustworthy'; // 藍色系
    else if (hue >= 240 && hue < 300) emotional_impact = 'premium'; // 紫色系
    
    const lightness = this.getLightness(primary);
    const accessibility_score = this.calculateAccessibilityScore(primary, '#ffffff');
    
    return {
      primary,
      emotional_impact,
      cultural_context: 'universal',
      accessibility_score
    };
  }

  /**
   * 推斷品牌價值觀
   */
  private static inferBrandValues(
    personality: BrandExpression['personality'],
    colorPsychology: ColorPsychology
  ): string[] {
    const valueMap: Record<string, string[]> = {
      professional: ['可靠性', '專業性', '效率'],
      friendly: ['親和力', '包容性', '溫暖'],
      innovative: ['創新', '前瞻性', '創造力'],
      trustworthy: ['信任', '透明', '安全'],
      playful: ['樂趣', '創意', '活力'],
      luxurious: ['品質', '獨特性', '精緻']
    };
    
    return valueMap[personality] || ['品質', '用戶體驗'];
  }

  /**
   * 分析情感基調
   */
  private static analyzeEmotionalTone(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult
  ): EmotionalTone {
    const colors = this.extractColors(component);
    const role = component.semantic.componentRole;
    
    let primary: EmotionalTone['primary'] = 'confident';
    
    // 根據組件角色推斷情感基調
    if (role === 'input') {
      primary = 'welcoming';
    } else if (role === 'feedback') {
      primary = 'urgent';
    } else if (role === 'content') {
      primary = 'peaceful';
    } else if (role === 'interactive') {
      primary = 'exciting';
    } else if (role === 'navigation') {
      primary = 'confident';
    }
    
    // 根據顏色調整情感基調
    const colorPsychology = this.analyzeColorPsychology(colors);
    if (colorPsychology.emotional_impact === 'premium') {
      primary = 'sophisticated';
    } else if (colorPsychology.emotional_impact === 'energetic') {
      primary = 'exciting';
    }
    
    const emotional_journey = this.buildEmotionalJourney(primary, role);
    
    return {
      primary,
      secondary: undefined,
      emotional_journey,
      confidence: 0.75
    };
  }

  /**
   * 構建情感旅程
   */
  private static buildEmotionalJourney(
    primary: EmotionalTone['primary'],
    role: ComponentRole
  ): EmotionalState[] {
    const baseJourney: EmotionalState[] = [
      {
        stage: 'initial',
        emotion: primary,
        triggers: ['首次接觸', '視覺印象']
      }
    ];
    
    if (role === 'input') {
      baseJourney.push({
        stage: 'interaction',
        emotion: 'focused',
        triggers: ['輸入開始', '反饋接收']
      });
      baseJourney.push({
        stage: 'completion',
        emotion: 'satisfied',
        triggers: ['輸入完成', '驗證通過']
      });
    } else if (role === 'interactive') {
      baseJourney.push({
        stage: 'interaction',
        emotion: 'engaged',
        triggers: ['點擊', '懸停']
      });
    }
    
    baseJourney.push({
      stage: 'error',
      emotion: 'frustrated',
      triggers: ['錯誤發生', '無法操作']
    });
    
    return baseJourney;
  }

  /**
   * 分析視覺層次
   */
  private static analyzeVisualHierarchy(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult
  ): VisualHierarchy {
    const layout = component.design.visualProperties.layout;
    const role = component.semantic.componentRole;
    
    let primary_focus = component.name;
    let secondary_elements: string[] = [];
    let information_flow: VisualHierarchy['information_flow'] = 'linear';
    
    // 根據佈局推斷資訊流
    if (layout.display === 'grid') {
      information_flow = 'grid';
    } else if (layout.display === 'flex') {
      if (layout.flexDirection === 'column') {
        information_flow = 'linear';
      } else {
        information_flow = 'layered';
      }
    }
    
    // 生成注意力引導
    const attention_guidance = this.generateAttentionGuidance(component);
    
    return {
      primary_focus,
      secondary_elements,
      information_flow,
      attention_guidance,
      confidence: 0.8
    };
  }

  /**
   * 生成注意力引導
   */
  private static generateAttentionGuidance(component: ErComponent): AttentionGuidance[] {
    const guidance: AttentionGuidance[] = [];
    const role = component.semantic.componentRole;
    
    if (role === 'input') {
      guidance.push({
        element: 'input_field',
        priority: 1,
        guidance_method: 'contrast'
      });
      guidance.push({
        element: 'label',
        priority: 2,
        guidance_method: 'position'
      });
    } else if (role === 'interactive') {
      guidance.push({
        element: 'action_button',
        priority: 1,
        guidance_method: 'color'
      });
    } else if (role === 'content') {
      guidance.push({
        element: 'title',
        priority: 1,
        guidance_method: 'size'
      });
      guidance.push({
        element: 'content',
        priority: 2,
        guidance_method: 'contrast'
      });
    }
    
    return guidance;
  }

  /**
   * 分析美學風格
   */
  private static analyzeAestheticStyle(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult
  ): AestheticStyle {
    const visual = component.design.visualProperties;
    const styling = visual.styling;
    
    let style: AestheticStyle['style'] = 'modern';
    let influences: string[] = [];
    let innovation_level: AestheticStyle['innovation_level'] = 'moderate';
    
    // 根據視覺元素推斷風格
    if (styling.borderRadius && styling.borderRadius > 10) {
      style = 'modern';
      influences.push('Material Design');
    } else if (styling.borderRadius === 0) {
      style = 'minimal';
      influences.push('Bauhaus');
    }
    
    // 根據佈局推斷風格
    if (visual.layout.display === 'grid') {
      style = 'modern';
      influences.push('Swiss Design');
    }
    
    // 評估一致性分數
    const consistency_score = this.evaluateConsistency(component);
    
    // 評估創新程度
    if (component.semantic.userInteractions.length > 2) {
      innovation_level = 'bold';
    } else if (component.semantic.userInteractions.length > 0) {
      innovation_level = 'moderate';
    } else {
      innovation_level = 'conservative';
    }
    
    return {
      style,
      influences,
      consistency_score,
      innovation_level,
      confidence: 0.7
    };
  }

  /**
   * 評估設計一致性
   */
  private static evaluateConsistency(component: ErComponent): number {
    let score = 0.8; // 基礎分數
    
    // 檢查設計令牌使用
    if (component.design.designTokens.length > 0) {
      score += 0.1;
    }
    
    // 檢查響應式設計
    if (component.design.responsiveBehavior.breakpoints.length > 1) {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * 分析設計原則
   */
  private static analyzeDesignPrinciples(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult
  ): DesignPrinciple[] {
    const principles: DesignPrinciple[] = [];
    const layout = component.design.visualProperties.layout;
    
    // 平衡原則
    if (layout.justifyContent === 'center' || layout.alignItems === 'center') {
      principles.push({
        principle: 'balance',
        application: '置中對齊實現視覺平衡',
        effectiveness: 0.8
      });
    }
    
    // 對比原則
    if (this.hasGoodContrast(component)) {
      principles.push({
        principle: 'contrast',
        application: '顏色對比增強可讀性',
        effectiveness: 0.9
      });
    }
    
    // 強調原則
    if (component.semantic.componentRole === 'interactive') {
      principles.push({
        principle: 'emphasis',
        application: '交互元素突出顯示',
        effectiveness: 0.8
      });
    }
    
    // 統一原則
    if (component.design.designTokens.length > 0) {
      principles.push({
        principle: 'unity',
        application: '設計令牌確保一致性',
        effectiveness: 0.9
      });
    }
    
    return principles;
  }

  /**
   * 分析功能意圖
   */
  private static analyzeFunctionalIntent(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult
  ): FunctionalIntent {
    const userGoals = this.identifyUserGoals(component);
    const businessObjectives = this.identifyBusinessObjectives(component);
    const usageScenarios = this.identifyUsageScenarios(component);
    const performanceRequirements = this.identifyPerformanceRequirements(component);
    const accessibilityNeeds = this.identifyAccessibilityNeeds(component);
    
    return {
      userGoals,
      businessObjectives,
      usageScenarios,
      performanceRequirements,
      accessibilityNeeds,
      confidence: 0.8
    };
  }

  /**
   * 識別用戶目標
   */
  private static identifyUserGoals(component: ErComponent): UserGoal[] {
    const role = component.semantic.componentRole;
    const goals: UserGoal[] = [];
    
    switch (role) {
      case 'input':
        goals.push({
          goal: '快速準確地輸入資訊',
          priority: 'primary',
          user_type: 'active_user',
          success_criteria: ['輸入無錯誤', '操作效率高', '反饋及時'],
          obstacles: ['驗證錯誤', '輸入格式不明', '無清除功能']
        });
        break;
      
      case 'navigation':
        goals.push({
          goal: '快速找到目標頁面',
          priority: 'primary',
          user_type: 'all_users',
          success_criteria: ['導航清晰', '結構合理', '響應快速'],
          obstacles: ['層級過深', '標籤不明', '載入緩慢']
        });
        break;
      
      case 'content':
        goals.push({
          goal: '高效獲取所需資訊',
          priority: 'primary',
          user_type: 'information_seeker',
          success_criteria: ['內容易讀', '結構清晰', '搜尋方便'],
          obstacles: ['資訊過載', '排版混亂', '載入緩慢']
        });
        break;
      
      case 'feedback':
        goals.push({
          goal: '及時了解系統狀態',
          priority: 'secondary',
          user_type: 'active_user',
          success_criteria: ['反饋及時', '資訊明確', '行動指引'],
          obstacles: ['反饋延遲', '資訊不明', '無解決方案']
        });
        break;
    }
    
    return goals;
  }

  /**
   * 識別商業目標
   */
  private static identifyBusinessObjectives(component: ErComponent): BusinessObjective[] {
    const role = component.semantic.componentRole;
    const objectives: BusinessObjective[] = [];
    
    if (role === 'input') {
      objectives.push({
        objective: '提高表單完成率',
        kpi: 'form_completion_rate',
        target_value: 0.85,
        measurement_method: 'analytics_tracking',
        timeline: '3_months'
      });
    } else if (role === 'interactive') {
      objectives.push({
        objective: '增加用戶互動',
        kpi: 'click_through_rate',
        target_value: 0.15,
        measurement_method: 'event_tracking',
        timeline: '1_month'
      });
    } else if (role === 'content') {
      objectives.push({
        objective: '提升內容參與度',
        kpi: 'time_on_content',
        target_value: 180,
        measurement_method: 'time_tracking',
        timeline: '2_months'
      });
    }
    
    return objectives;
  }

  /**
   * 識別使用場景
   */
  private static identifyUsageScenarios(component: ErComponent): UsageScenario[] {
    const deviceVariants = component.design.deviceVariants;
    const role = component.semantic.componentRole;
    const scenarios: UsageScenario[] = [];
    
    deviceVariants.forEach(variant => {
      let frequency: UsageScenario['frequency'] = 'occasional';
      let user_state: UsageScenario['user_state'] = 'focused';
      let environment = '辦公環境';
      
      if (variant.device === 'mobile') {
        frequency = 'daily';
        user_state = 'distracted';
        environment = '移動環境';
      } else if (variant.device === 'desktop') {
        frequency = 'weekly';
        user_state = 'focused';
        environment = '辦公環境';
      }
      
      if (role === 'input') {
        frequency = 'daily';
        user_state = 'focused';
      } else if (role === 'navigation') {
        frequency = 'daily';
        user_state = 'rushed';
      }
      
      scenarios.push({
        scenario: `${variant.device} 設備上的 ${role} 操作`,
        context: variant.device,
        frequency,
        user_state,
        environment
      });
    });
    
    return scenarios;
  }

  /**
   * 識別性能需求
   */
  private static identifyPerformanceRequirements(component: ErComponent): PerformanceRequirement[] {
    const role = component.semantic.componentRole;
    const requirements: PerformanceRequirement[] = [];
    
    // 基礎性能需求
    requirements.push({
      metric: 'load_time',
      target: 100,
      priority: 'important',
      reasoning: '快速載入提升用戶體驗'
    });
    
    if (role === 'input') {
      requirements.push({
        metric: 'interaction_delay',
        target: 16,
        priority: 'critical',
        reasoning: '輸入反饋需要即時響應'
      });
    } else if (role === 'interactive') {
      requirements.push({
        metric: 'animation_smoothness',
        target: 60,
        priority: 'important',
        reasoning: '流暢動畫提升互動體驗'
      });
    }
    
    // 移動設備特殊需求
    const hasMobile = component.design.deviceVariants.some(v => v.device === 'mobile');
    if (hasMobile) {
      requirements.push({
        metric: 'battery_usage',
        target: 5,
        priority: 'nice-to-have',
        reasoning: '節能延長設備使用時間'
      });
    }
    
    return requirements;
  }

  /**
   * 識別無障礙需求
   */
  private static identifyAccessibilityNeeds(component: ErComponent): AccessibilityNeed[] {
    const needs: AccessibilityNeed[] = [];
    const role = component.semantic.componentRole;
    const a11ySpecs = component.semantic.accessibilitySpecs;
    
    // 基礎無障礙需求
    needs.push({
      need: '鍵盤導航支援',
      target_group: '鍵盤用戶',
      implementation: 'tabindex 和 focus 管理',
      priority: 'critical'
    });
    
    needs.push({
      need: '螢幕閱讀器相容',
      target_group: '視覺障礙用戶',
      implementation: 'ARIA 標籤和語意化 HTML',
      priority: 'critical'
    });
    
    if (role === 'input') {
      needs.push({
        need: '表單標籤關聯',
        target_group: '所有輔助技術用戶',
        implementation: 'label 元素和 aria-describedby',
        priority: 'critical'
      });
    }
    
    if (role === 'interactive') {
      needs.push({
        need: '按鈕狀態公告',
        target_group: '螢幕閱讀器用戶',
        implementation: 'aria-pressed 和狀態變更通知',
        priority: 'important'
      });
    }
    
    // 色彩對比需求
    if (!this.hasGoodContrast(component)) {
      needs.push({
        need: '色彩對比增強',
        target_group: '視覺障礙用戶',
        implementation: '調整前景背景色對比度',
        priority: 'critical'
      });
    }
    
    return needs;
  }

  /**
   * 分析交互意圖
   */
  private static analyzeInteractionIntent(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult
  ): InteractionIntent {
    const userFlows = this.identifyUserFlows(component);
    const feedbackMechanisms = this.identifyFeedbackMechanisms(component);
    const guidanceStrategies = this.identifyGuidanceStrategies(component);
    const errorHandling = this.identifyErrorHandling(component);
    const microInteractions = this.identifyMicroInteractions(component);
    
    return {
      userFlows,
      feedbackMechanisms,
      guidanceStrategies,
      errorHandling,
      microInteractions,
      confidence: 0.85
    };
  }

  /**
   * 識別用戶流程
   */
  private static identifyUserFlows(component: ErComponent): UserFlow[] {
    const role = component.semantic.componentRole;
    const interactions = component.semantic.userInteractions;
    const flows: UserFlow[] = [];
    
    if (role === 'input') {
      flows.push({
        flow_name: '數據輸入流程',
        steps: [
          {
            step: '聚焦輸入框',
            user_action: '點擊或 Tab 到輸入框',
            system_response: '顯示游標和焦點樣式',
            potential_issues: ['焦點不明顯', '點擊區域過小']
          },
          {
            step: '輸入數據',
            user_action: '鍵盤輸入內容',
            system_response: '即時顯示輸入內容',
            potential_issues: ['輸入延遲', '格式限制不明']
          },
          {
            step: '驗證數據',
            user_action: '失去焦點或提交',
            system_response: '顯示驗證結果',
            potential_issues: ['驗證錯誤不明', '錯誤位置不清']
          }
        ],
        decision_points: [
          {
            point: '數據驗證',
            options: ['通過驗證', '驗證失敗'],
            default_choice: '通過驗證',
            reasoning: '大部分輸入應該是有效的'
          }
        ],
        exit_points: [
          {
            point: '驗證失敗',
            reason: '數據格式錯誤',
            recovery_action: '顯示錯誤提示並保持焦點'
          }
        ],
        success_rate: 0.85
      });
    }
    
    return flows;
  }

  /**
   * 識別反饋機制
   */
  private static identifyFeedbackMechanisms(component: ErComponent): FeedbackMechanism[] {
    const role = component.semantic.componentRole;
    const mechanisms: FeedbackMechanism[] = [];
    
    // 視覺反饋
    mechanisms.push({
      type: 'visual',
      trigger: 'user_interaction',
      response: '視覺狀態變化',
      timing: 'immediate',
      purpose: 'confirmation'
    });
    
    if (role === 'input') {
      mechanisms.push({
        type: 'visual',
        trigger: 'validation_error',
        response: '錯誤樣式和訊息',
        timing: 'immediate',
        purpose: 'error'
      });
      
      mechanisms.push({
        type: 'textual',
        trigger: 'successful_input',
        response: '成功確認訊息',
        timing: 'on-completion',
        purpose: 'confirmation'
      });
    }
    
    if (role === 'interactive') {
      mechanisms.push({
        type: 'visual',
        trigger: 'hover',
        response: '懸停狀態樣式',
        timing: 'immediate',
        purpose: 'guidance'
      });
    }
    
    return mechanisms;
  }

  /**
   * 識別引導策略
   */
  private static identifyGuidanceStrategies(component: ErComponent): GuidanceStrategy[] {
    const role = component.semantic.componentRole;
    const strategies: GuidanceStrategy[] = [];
    
    if (role === 'input') {
      strategies.push({
        strategy: 'affordances',
        implementation: '輸入框視覺樣式暗示可輸入',
        target_behavior: '用戶識別並使用輸入功能',
        effectiveness: 0.9
      });
      
      strategies.push({
        strategy: 'signifiers',
        implementation: '標籤和占位符提供輸入指引',
        target_behavior: '用戶理解輸入要求',
        effectiveness: 0.85
      });
    }
    
    if (role === 'interactive') {
      strategies.push({
        strategy: 'constraints',
        implementation: '按鈕狀態限制無效操作',
        target_behavior: '防止錯誤操作',
        effectiveness: 0.8
      });
    }
    
    if (role === 'navigation') {
      strategies.push({
        strategy: 'mappings',
        implementation: '導航結構映射網站結構',
        target_behavior: '用戶理解網站架構',
        effectiveness: 0.75
      });
    }
    
    return strategies;
  }

  /**
   * 識別錯誤處理
   */
  private static identifyErrorHandling(component: ErComponent): ErrorHandling[] {
    const role = component.semantic.componentRole;
    const errorHandling: ErrorHandling[] = [];
    
    if (role === 'input') {
      errorHandling.push({
        error_type: '格式錯誤',
        prevention_strategy: '即時格式驗證和提示',
        recovery_strategy: '保留用戶輸入，僅標示錯誤部分',
        user_communication: '清楚說明正確格式要求',
        severity: 'medium'
      });
      
      errorHandling.push({
        error_type: '必填欄位空白',
        prevention_strategy: '視覺標示必填欄位',
        recovery_strategy: '聚焦到第一個空白必填欄位',
        user_communication: '明確指出哪些欄位必填',
        severity: 'high'
      });
    }
    
    if (role === 'interactive') {
      errorHandling.push({
        error_type: '操作無效',
        prevention_strategy: '根據狀態禁用無效操作',
        recovery_strategy: '解釋為何操作無效',
        user_communication: '提供替代操作建議',
        severity: 'low'
      });
    }
    
    return errorHandling;
  }

  /**
   * 識別微交互
   */
  private static identifyMicroInteractions(component: ErComponent): MicroInteraction[] {
    const interactions = component.semantic.userInteractions;
    const microInteractions: MicroInteraction[] = [];
    
    interactions.forEach(interaction => {
      if (interaction.animation) {
        microInteractions.push({
          trigger: interaction.trigger,
          feedback: `${interaction.animation.type} 動畫`,
          purpose: 'feedback',
          timing: interaction.animation.duration,
          easing: interaction.animation.easing
        });
      }
    });
    
    // 添加常見微交互
    if (component.semantic.componentRole === 'interactive') {
      microInteractions.push({
        trigger: 'hover',
        feedback: '輕微縮放或顏色變化',
        purpose: 'delight',
        timing: 200,
        easing: 'ease-out'
      });
    }
    
    return microInteractions;
  }

  /**
   * 分析商業意圖
   */
  private static analyzeBusinessIntent(
    component: ErComponent,
    analysisResult: FigmaAnalysisResult
  ): BusinessIntent {
    const conversionGoals = this.identifyConversionGoals(component);
    const engagementStrategy = this.identifyEngagementStrategy(component);
    const userRetention = this.identifyRetentionStrategy(component);
    const brandPositioning = this.identifyBrandPositioning(component);
    const competitiveDifferentiation = this.identifyCompetitiveDifferentiation(component);
    
    return {
      conversionGoals,
      engagementStrategy,
      userRetention,
      brandPositioning,
      competitiveDifferentiation,
      confidence: 0.7
    };
  }

  /**
   * 識別轉換目標
   */
  private static identifyConversionGoals(component: ErComponent): ConversionGoal[] {
    const role = component.semantic.componentRole;
    const goals: ConversionGoal[] = [];
    
    if (role === 'input') {
      goals.push({
        goal: '完成表單提交',
        funnel_stage: 'consideration',
        conversion_trigger: '提交按鈕點擊',
        barriers: ['表單過長', '驗證複雜', '隱私擔憂'],
        optimization_opportunities: ['簡化流程', '增加信任標誌', '提供進度指示']
      });
    } else if (role === 'interactive') {
      goals.push({
        goal: '促進用戶行動',
        funnel_stage: 'interest',
        conversion_trigger: '按鈕或連結點擊',
        barriers: ['價值不明', '風險感知', '選擇過多'],
        optimization_opportunities: ['明確價值主張', '降低感知風險', '簡化選擇']
      });
    }
    
    return goals;
  }

  /**
   * 識別參與策略
   */
  private static identifyEngagementStrategy(component: ErComponent): EngagementStrategy {
    const role = component.semantic.componentRole;
    
    let primary_hook = '功能價值';
    let personalization_level: EngagementStrategy['personalization_level'] = 'basic';
    let content_strategy = '資訊導向';
    
    if (role === 'content') {
      primary_hook = '內容價值';
      content_strategy = '內容行銷';
    } else if (role === 'interactive') {
      primary_hook = '互動樂趣';
      personalization_level = 'adaptive';
      content_strategy = '互動體驗';
    }
    
    const engagement_loops: EngagementLoop[] = [];
    
    if (role === 'input') {
      engagement_loops.push({
        trigger: '數據輸入需求',
        action: '填寫表單',
        reward: '功能解鎖或資訊獲得',
        investment: '個人資料提供'
      });
    }
    
    return {
      primary_hook,
      engagement_loops,
      personalization_level,
      content_strategy
    };
  }

  /**
   * 識別留存策略
   */
  private static identifyRetentionStrategy(component: ErComponent): RetentionStrategy {
    const role = component.semantic.componentRole;
    
    let strategy: RetentionStrategy['strategy'] = 'value_demonstration';
    let tactics: string[] = [];
    let measurement = 'return_usage_rate';
    
    if (role === 'input') {
      strategy = 'habit_formation';
      tactics = ['簡化重複操作', '記憶用戶偏好', '提供快速填寫'];
      measurement = 'form_completion_frequency';
    } else if (role === 'content') {
      strategy = 'value_demonstration';
      tactics = ['相關內容推薦', '個性化展示', '價值量化顯示'];
      measurement = 'content_engagement_duration';
    } else if (role === 'interactive') {
      strategy = 'personalization';
      tactics = ['互動結果記憶', '偏好學習', '體驗客製化'];
      measurement = 'interaction_frequency';
    }
    
    return {
      strategy,
      tactics,
      measurement
    };
  }

  /**
   * 識別品牌定位
   */
  private static identifyBrandPositioning(component: ErComponent): BrandPositioning {
    const brandExpression = this.analyzeBrandExpression(component, {} as any);
    
    let position = '專業可靠的解決方案提供者';
    let differentiators = ['用戶體驗優先', '技術專業', '服務品質'];
    let target_perception = '值得信賴的合作夥伴';
    let competitive_advantages = ['易用性', '可靠性', '響應速度'];
    
    if (brandExpression.personality === 'innovative') {
      position = '創新技術的領導者';
      differentiators = ['前沿技術', '創新思維', '未來願景'];
      target_perception = '行業創新標杆';
      competitive_advantages = ['技術領先', '創新能力', '適應性強'];
    } else if (brandExpression.personality === 'friendly') {
      position = '貼心的用戶服務專家';
      differentiators = ['用戶關懷', '服務體驗', '易用性'];
      target_perception = '最懂用戶需求的品牌';
      competitive_advantages = ['用戶體驗', '服務品質', '親和力'];
    }
    
    return {
      position,
      differentiators,
      target_perception,
      competitive_advantages
    };
  }

  /**
   * 識別競爭差異化
   */
  private static identifyCompetitiveDifferentiation(component: ErComponent): CompetitiveDifferentiation[] {
    const role = component.semantic.componentRole;
    const differentiations: CompetitiveDifferentiation[] = [];
    
    // 無障礙性差異化
    if (component.semantic.accessibilitySpecs.keyboardNavigation?.focusable) {
      differentiations.push({
        feature: '完整無障礙支援',
        advantage: '覆蓋更廣泛的用戶群體',
        evidence: '通過 WCAG 2.1 AA 標準',
        sustainability: 'high'
      });
    }
    
    // 響應式設計差異化
    if (component.design.responsiveBehavior.breakpoints.length > 2) {
      differentiations.push({
        feature: '全設備響應式體驗',
        advantage: '任何設備都有最佳體驗',
        evidence: '支援 3+ 種設備尺寸',
        sustainability: 'medium'
      });
    }
    
    // 性能優化差異化
    if (role === 'interactive' && component.semantic.userInteractions.length > 0) {
      differentiations.push({
        feature: '高性能互動體驗',
        advantage: '更流暢的用戶操作感受',
        evidence: '16ms 內響應用戶操作',
        sustainability: 'high'
      });
    }
    
    return differentiations;
  }

  /**
   * 生成洞察
   */
  private static generateInsights(
    visual: VisualIntent,
    functional: FunctionalIntent,
    interaction: InteractionIntent,
    business: BusinessIntent
  ): IntentInsight[] {
    const insights: IntentInsight[] = [];
    
    // 視覺洞察
    if (visual.brandExpression.confidence > 0.8) {
      insights.push({
        insight: `品牌個性為 ${visual.brandExpression.personality}，建議在交互設計中強化這一特質`,
        category: 'visual',
        confidence: visual.brandExpression.confidence,
        impact: 'high',
        actionable: true
      });
    }
    
    // 功能洞察
    const highPriorityGoals = functional.userGoals.filter(g => g.priority === 'primary');
    if (highPriorityGoals.length > 0) {
      insights.push({
        insight: `主要用戶目標聚焦在 ${highPriorityGoals[0].goal}，需優先優化相關體驗`,
        category: 'functional',
        confidence: 0.9,
        impact: 'high',
        actionable: true
      });
    }
    
    // 交互洞察
    if (interaction.microInteractions.length === 0) {
      insights.push({
        insight: '缺少微交互設計，建議添加適當的動畫反饋提升用戶體驗',
        category: 'interaction',
        confidence: 0.8,
        impact: 'medium',
        actionable: true
      });
    }
    
    // 商業洞察
    if (business.conversionGoals.length > 0) {
      const goal = business.conversionGoals[0];
      insights.push({
        insight: `轉換目標為 ${goal.goal}，當前主要障礙是 ${goal.barriers.join('、')}`,
        category: 'business',
        confidence: 0.75,
        impact: 'high',
        actionable: true
      });
    }
    
    return insights;
  }

  /**
   * 生成建議
   */
  private static generateRecommendations(
    component: ErComponent,
    intents: {
      visual: VisualIntent;
      functional: FunctionalIntent;
      interaction: InteractionIntent;
      business: BusinessIntent;
    }
  ): IntentRecommendation[] {
    const recommendations: IntentRecommendation[] = [];
    
    // 視覺改進建議
    if (intents.visual.aestheticStyle.consistency_score < 0.8) {
      recommendations.push({
        recommendation: '提升設計一致性，建立完整的設計系統',
        category: 'design',
        priority: 'high',
        effort: 'medium',
        impact: 'high',
        implementation: '制定設計令牌規範，統一組件樣式'
      });
    }
    
    // 無障礙性建議
    const criticalA11yNeeds = intents.functional.accessibilityNeeds.filter(n => n.priority === 'critical');
    if (criticalA11yNeeds.length > 0) {
      recommendations.push({
        recommendation: `改善無障礙性：${criticalA11yNeeds[0].need}`,
        category: 'development',
        priority: 'critical',
        effort: 'low',
        impact: 'high',
        implementation: criticalA11yNeeds[0].implementation
      });
    }
    
    // 性能優化建議
    const criticalPerf = intents.functional.performanceRequirements.filter(r => r.priority === 'critical');
    if (criticalPerf.length > 0) {
      recommendations.push({
        recommendation: `優化 ${criticalPerf[0].metric}，目標 ${criticalPerf[0].target}ms`,
        category: 'development',
        priority: 'high',
        effort: 'medium',
        impact: 'high',
        implementation: '實施性能監控和優化策略'
      });
    }
    
    // 用戶體驗建議
    if (intents.interaction.microInteractions.length === 0) {
      recommendations.push({
        recommendation: '添加微交互動畫提升用戶體驗',
        category: 'design',
        priority: 'medium',
        effort: 'low',
        impact: 'medium',
        implementation: '為懸停、點擊等操作添加適當的視覺反饋'
      });
    }
    
    // 商業價值建議
    const barriers = intents.business.conversionGoals.flatMap(g => g.barriers);
    if (barriers.length > 0) {
      recommendations.push({
        recommendation: `移除轉換障礙：${barriers[0]}`,
        category: 'strategy',
        priority: 'high',
        effort: 'medium',
        impact: 'high',
        implementation: '分析並優化用戶轉換路徑'
      });
    }
    
    return recommendations;
  }

  // ===== 輔助方法 =====

  private static extractColors(component: ErComponent): string[] {
    const colors: string[] = [];
    
    if (component.design.visualProperties.styling.backgroundColor) {
      colors.push(component.design.visualProperties.styling.backgroundColor);
    }
    
    // 從設計令牌中提取顏色
    component.design.designTokens
      .filter(token => token.tokenCategory === 'color')
      .forEach(token => {
        if (typeof token.tokenValue === 'string') {
          colors.push(token.tokenValue);
        }
      });
    
    return colors;
  }

  private static extractTypography(component: ErComponent): any {
    return component.design.visualProperties.typography;
  }

  private static getHue(color: string): number {
    // 簡化的色調計算
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    if (diff === 0) return 0;
    
    let hue: number;
    if (max === r) {
      hue = ((g - b) / diff) % 6;
    } else if (max === g) {
      hue = (b - r) / diff + 2;
    } else {
      hue = (r - g) / diff + 4;
    }
    
    return Math.round(hue * 60);
  }

  private static getLightness(color: string): number {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return (Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 255;
  }

  private static calculateAccessibilityScore(foreground: string, background: string): number {
    // 簡化的對比度計算
    const fLum = this.getLightness(foreground);
    const bLum = this.getLightness(background);
    
    const lighter = Math.max(fLum, bLum);
    const darker = Math.min(fLum, bLum);
    
    const contrast = (lighter + 0.05) / (darker + 0.05);
    return Math.min(contrast / 4.5, 1); // 標準化到 0-1
  }

  private static hasGoodContrast(component: ErComponent): boolean {
    const bgColor = component.design.visualProperties.styling.backgroundColor;
    if (!bgColor) return true;
    
    const score = this.calculateAccessibilityScore(bgColor, '#ffffff');
    return score >= 0.8;
  }
}

export default DesignIntentEngine;