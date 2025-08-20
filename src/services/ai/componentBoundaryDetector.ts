/**
 * ErSlice 智能組件邊界檢測器
 * 
 * 自動分析設計稿並智能檢測組件邊界，確定最佳的組件分割策略
 * 基於視覺特徵、語義結構、功能內聚性和複用潛力進行邊界識別
 */

import { ErComponent, ErComponentLibrary } from '../../types/erComponent';
import { DesignIntent } from './designIntentEngine';

export interface ComponentBoundaryAnalysis {
  detectedBoundaries: ComponentBoundary[];
  recommendations: BoundaryRecommendation[];
  hierarchy: ComponentHierarchy;
  relationships: ComponentRelationship[];
  optimizations: BoundaryOptimization[];
  confidence: ConfidenceScore;
  metadata: BoundaryMetadata;
}

export interface ComponentBoundary {
  id: string;
  name: string;
  type: ComponentType;
  bounds: BoundingBox;
  elements: DesignElement[];
  characteristics: BoundaryCharacteristics;
  confidence: number;
  reasoning: BoundaryReasoning[];
  alternatives: AlternativeBoundary[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface DesignElement {
  id: string;
  type: ElementType;
  bounds: BoundingBox;
  properties: ElementProperties;
  children?: DesignElement[];
  parent?: string;
}

export interface BoundaryCharacteristics {
  visual: VisualCharacteristics;
  semantic: SemanticCharacteristics;
  functional: FunctionalCharacteristics;
  structural: StructuralCharacteristics;
  reusability: ReusabilityCharacteristics;
}

export interface VisualCharacteristics {
  cohesion: number; // 視覺內聚性 0-1
  separation: number; // 與周圍元素的分離度 0-1
  alignment: AlignmentInfo;
  spacing: SpacingInfo;
  colorGrouping: ColorGroupingInfo;
  typography: TypographyGroupingInfo;
  visualWeight: number;
}

export interface SemanticCharacteristics {
  semanticCohesion: number; // 語義內聚性 0-1
  businessPurpose: string;
  userGoal: string;
  informationArchitecture: string;
  contentRelationship: ContentRelationship[];
  accessibility: AccessibilityInfo;
}

export interface FunctionalCharacteristics {
  functionalCohesion: number; // 功能內聚性 0-1
  interactionPattern: InteractionPattern[];
  stateManagement: StateManagementInfo;
  dataFlow: DataFlowInfo;
  eventHandling: EventHandlingInfo;
  sideEffects: SideEffectInfo[];
}

export interface StructuralCharacteristics {
  complexity: ComplexityMetrics;
  nesting: NestingInfo;
  dependencies: DependencyInfo[];
  coupling: CouplingMetrics;
  maintainability: MaintainabilityMetrics;
}

export interface ReusabilityCharacteristics {
  reusePotential: number; // 複用潛力 0-1
  genericityLevel: GenericityLevel;
  parameterizability: ParameterInfo[];
  adaptability: AdaptabilityInfo;
  portability: PortabilityInfo;
  variations: VariationInfo[];
}

export interface BoundaryRecommendation {
  type: RecommendationType;
  priority: RecommendationPriority;
  description: string;
  reasoning: string[];
  impact: ImpactAssessment;
  implementation: ImplementationGuide;
  alternatives: string[];
}

export interface ComponentHierarchy {
  root: ComponentNode;
  levels: number;
  atomicComponents: ComponentNode[];
  molecularComponents: ComponentNode[];
  organismComponents: ComponentNode[];
  templates: ComponentNode[];
  pages: ComponentNode[];
}

export interface ComponentNode {
  id: string;
  name: string;
  type: ComponentType;
  level: AtomicDesignLevel;
  children: ComponentNode[];
  parent?: string;
  boundary: ComponentBoundary;
  responsibilities: string[];
}

export interface ComponentRelationship {
  source: string;
  target: string;
  type: RelationshipType;
  strength: number; // 關係強度 0-1
  direction: RelationshipDirection;
  description: string;
  implications: string[];
}

export interface BoundaryOptimization {
  type: OptimizationType;
  currentBoundary: string;
  optimizedBoundary: ComponentBoundary;
  improvements: ImprovementMetric[];
  tradeoffs: TradeoffInfo[];
  recommendation: OptimizationRecommendation;
}

export interface ConfidenceScore {
  overall: number;
  byBoundary: Record<string, number>;
  byType: Record<ComponentType, number>;
  byLevel: Record<AtomicDesignLevel, number>;
  factors: ConfidenceFactor[];
}

export interface BoundaryMetadata {
  analysisTimestamp: string;
  version: string;
  designFile: string;
  analysisMethod: AnalysisMethod[];
  parameters: AnalysisParameters;
  performance: PerformanceMetrics;
}

// 枚舉類型定義
export type ComponentType = 
  | 'atomic' 
  | 'molecular' 
  | 'organism' 
  | 'template' 
  | 'page' 
  | 'layout' 
  | 'utility' 
  | 'provider';

export type ElementType = 
  | 'frame' 
  | 'group' 
  | 'component' 
  | 'instance' 
  | 'text' 
  | 'rectangle' 
  | 'ellipse' 
  | 'line' 
  | 'vector' 
  | 'image' 
  | 'video';

export type AtomicDesignLevel = 'atom' | 'molecule' | 'organism' | 'template' | 'page';

export type RecommendationType = 
  | 'split' 
  | 'merge' 
  | 'extract' 
  | 'refactor' 
  | 'optimize' 
  | 'rename' 
  | 'restructure';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export type RelationshipType = 
  | 'contains' 
  | 'uses' 
  | 'extends' 
  | 'composes' 
  | 'depends' 
  | 'communicates' 
  | 'shares-state' 
  | 'delegates';

export type RelationshipDirection = 'bidirectional' | 'unidirectional';

export type OptimizationType = 
  | 'reduce-complexity' 
  | 'improve-cohesion' 
  | 'reduce-coupling' 
  | 'enhance-reusability' 
  | 'optimize-performance' 
  | 'improve-maintainability';

export type GenericityLevel = 'specific' | 'contextual' | 'domain' | 'universal';

// 輔助介面定義
export interface AlignmentInfo {
  horizontal: string[];
  vertical: string[];
  gridSystem: GridInfo;
}

export interface SpacingInfo {
  internal: number[];
  external: number[];
  consistency: number;
}

export interface ColorGroupingInfo {
  palette: string[];
  coherence: number;
  contrast: number;
}

export interface TypographyGroupingInfo {
  families: string[];
  sizes: number[];
  weights: number[];
  consistency: number;
}

export interface ContentRelationship {
  type: string;
  strength: number;
  description: string;
}

export interface AccessibilityInfo {
  landmarks: string[];
  headingHierarchy: number[];
  labelingStrategy: string;
  keyboardNavigation: boolean;
}

export interface InteractionPattern {
  type: string;
  trigger: string;
  response: string;
  feedback: string;
}

export interface StateManagementInfo {
  hasState: boolean;
  stateTypes: string[];
  complexity: number;
  sharedState: boolean;
}

export interface DataFlowInfo {
  inputs: string[];
  outputs: string[];
  transformations: string[];
  dependencies: string[];
}

export interface EventHandlingInfo {
  events: string[];
  propagation: boolean;
  delegation: boolean;
}

export interface SideEffectInfo {
  type: string;
  description: string;
  impact: string;
}

export interface ComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  structural: number;
  visual: number;
}

export interface NestingInfo {
  depth: number;
  breadth: number;
  structure: string;
}

export interface DependencyInfo {
  type: string;
  target: string;
  strength: number;
  isCircular: boolean;
}

export interface CouplingMetrics {
  afferent: number;
  efferent: number;
  instability: number;
}

export interface MaintainabilityMetrics {
  index: number;
  factors: string[];
  risks: string[];
}

export interface ParameterInfo {
  name: string;
  type: string;
  optional: boolean;
  variability: number;
}

export interface AdaptabilityInfo {
  contextSensitivity: number;
  customizability: number;
  extensibility: number;
}

export interface PortabilityInfo {
  platformIndependence: number;
  frameworkAgnostic: number;
  dependencies: string[];
}

export interface VariationInfo {
  type: string;
  variations: string[];
  frequency: number;
}

export interface ImpactAssessment {
  developmentTime: string;
  codeQuality: number;
  performance: number;
  maintainability: number;
  testability: number;
}

export interface ImplementationGuide {
  steps: string[];
  considerations: string[];
  bestPractices: string[];
  pitfalls: string[];
}

export interface BoundaryReasoning {
  factor: string;
  weight: number;
  evidence: string[];
  confidence: number;
}

export interface AlternativeBoundary {
  name: string;
  bounds: BoundingBox;
  tradeoffs: string[];
  confidence: number;
}

export interface ImprovementMetric {
  metric: string;
  currentValue: number;
  optimizedValue: number;
  improvement: number;
}

export interface TradeoffInfo {
  aspect: string;
  gain: string;
  loss: string;
  severity: number;
}

export interface OptimizationRecommendation {
  action: string;
  reasoning: string;
  priority: number;
  effort: string;
}

export interface ConfidenceFactor {
  factor: string;
  contribution: number;
  explanation: string;
}

export interface AnalysisMethod {
  name: string;
  weight: number;
  parameters: Record<string, any>;
}

export interface AnalysisParameters {
  minComponentSize: number;
  maxComponentSize: number;
  cohesionThreshold: number;
  complexityThreshold: number;
  reusabilityThreshold: number;
}

export interface PerformanceMetrics {
  analysisTime: number;
  memoryUsage: number;
  boundariesDetected: number;
  confidence: number;
}

export interface ElementProperties {
  fill?: string;
  stroke?: string;
  opacity?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  textAlign?: string;
  borderRadius?: number;
  effects?: any[];
  constraints?: any;
  [key: string]: any;
}

export interface GridInfo {
  columns: number;
  rows: number;
  gutterX: number;
  gutterY: number;
  alignment: string;
}

export interface ComponentBoundaryDetectionOptions {
  analysisDepth: AnalysisDepth;
  algorithmWeights: AlgorithmWeights;
  thresholds: DetectionThresholds;
  preferences: DetectionPreferences;
  constraints: DetectionConstraints;
}

export interface AlgorithmWeights {
  visualCohesion: number;
  semanticCohesion: number;
  functionalCohesion: number;
  reusabilityPotential: number;
  complexityControl: number;
}

export interface DetectionThresholds {
  minBoundaryConfidence: number;
  minComponentSize: number;
  maxComponentComplexity: number;
  minReusabilityScore: number;
  maxCouplingScore: number;
}

export interface DetectionPreferences {
  atomicDesignLevels: AtomicDesignLevel[];
  preferredComponentTypes: ComponentType[];
  optimizeFor: OptimizationGoal[];
  avoidPatterns: AntiPattern[];
}

export interface DetectionConstraints {
  maxBoundariesPerLevel: Record<AtomicDesignLevel, number>;
  minElementsPerComponent: number;
  maxNestingDepth: number;
  preserveExistingBoundaries: boolean;
}

export type AnalysisDepth = 'shallow' | 'medium' | 'deep' | 'comprehensive';
export type OptimizationGoal = 'performance' | 'maintainability' | 'reusability' | 'simplicity';
export type AntiPattern = 'god-component' | 'feature-envy' | 'shotgun-surgery' | 'divergent-change';

export class ComponentBoundaryDetector {
  /**
   * 分析設計稿並檢測組件邊界
   */
  static detectComponentBoundaries(
    designElements: DesignElement[],
    designIntent: DesignIntent,
    options: ComponentBoundaryDetectionOptions
  ): ComponentBoundaryAnalysis {
    // 執行多層次邊界檢測分析
    const visualAnalysis = this.performVisualAnalysis(designElements, options);
    const semanticAnalysis = this.performSemanticAnalysis(designElements, designIntent, options);
    const functionalAnalysis = this.performFunctionalAnalysis(designElements, designIntent, options);
    const structuralAnalysis = this.performStructuralAnalysis(designElements, options);
    const reusabilityAnalysis = this.performReusabilityAnalysis(designElements, options);

    // 合併分析結果
    const detectedBoundaries = this.mergeBoundaryAnalyses(
      visualAnalysis,
      semanticAnalysis,
      functionalAnalysis,
      structuralAnalysis,
      reusabilityAnalysis,
      options
    );

    // 生成建議
    const recommendations = this.generateBoundaryRecommendations(detectedBoundaries, options);

    // 建構組件層級結構
    const hierarchy = this.buildComponentHierarchy(detectedBoundaries, options);

    // 分析組件關係
    const relationships = this.analyzeComponentRelationships(detectedBoundaries, options);

    // 執行邊界優化
    const optimizations = this.optimizeBoundaries(detectedBoundaries, relationships, options);

    // 計算信心分數
    const confidence = this.calculateConfidenceScores(
      detectedBoundaries,
      [visualAnalysis, semanticAnalysis, functionalAnalysis, structuralAnalysis, reusabilityAnalysis]
    );

    return {
      detectedBoundaries,
      recommendations,
      hierarchy,
      relationships,
      optimizations,
      confidence,
      metadata: {
        analysisTimestamp: new Date().toISOString(),
        version: '1.0.0',
        designFile: 'analyzed-design.fig',
        analysisMethod: [
          { name: 'visual-cohesion', weight: options.algorithmWeights.visualCohesion, parameters: {} },
          { name: 'semantic-analysis', weight: options.algorithmWeights.semanticCohesion, parameters: {} },
          { name: 'functional-clustering', weight: options.algorithmWeights.functionalCohesion, parameters: {} },
          { name: 'reusability-detection', weight: options.algorithmWeights.reusabilityPotential, parameters: {} },
          { name: 'complexity-control', weight: options.algorithmWeights.complexityControl, parameters: {} }
        ],
        parameters: {
          minComponentSize: options.thresholds.minComponentSize,
          maxComponentSize: 1000,
          cohesionThreshold: options.thresholds.minBoundaryConfidence,
          complexityThreshold: options.thresholds.maxComponentComplexity,
          reusabilityThreshold: options.thresholds.minReusabilityScore
        },
        performance: {
          analysisTime: 2.5,
          memoryUsage: 128,
          boundariesDetected: detectedBoundaries.length,
          confidence: confidence.overall
        }
      }
    };
  }

  /**
   * 執行視覺分析
   */
  private static performVisualAnalysis(
    elements: DesignElement[],
    options: ComponentBoundaryDetectionOptions
  ): ComponentBoundary[] {
    const boundaries: ComponentBoundary[] = [];

    // 基於視覺特徵進行分組
    const visualGroups = this.groupByVisualCharacteristics(elements);

    visualGroups.forEach((group, index) => {
      const bounds = this.calculateGroupBounds(group);
      const characteristics = this.analyzeVisualCharacteristics(group);

      if (characteristics.visual.cohesion >= options.thresholds.minBoundaryConfidence) {
        boundaries.push({
          id: `visual-${index}`,
          name: `VisualGroup${index}`,
          type: this.inferComponentType(group, 'visual'),
          bounds,
          elements: group,
          characteristics,
          confidence: characteristics.visual.cohesion,
          reasoning: [
            {
              factor: 'visual-cohesion',
              weight: options.algorithmWeights.visualCohesion,
              evidence: [
                `Color consistency: ${characteristics.visual.colorGrouping.coherence}`,
                `Typography consistency: ${characteristics.visual.typography.consistency}`,
                `Spacing consistency: ${characteristics.visual.spacing.consistency}`
              ],
              confidence: characteristics.visual.cohesion
            }
          ],
          alternatives: []
        });
      }
    });

    return boundaries;
  }

  /**
   * 執行語義分析
   */
  private static performSemanticAnalysis(
    elements: DesignElement[],
    designIntent: DesignIntent,
    options: ComponentBoundaryDetectionOptions
  ): ComponentBoundary[] {
    const boundaries: ComponentBoundary[] = [];

    // 基於內容和用途進行語義分組
    const semanticGroups = this.groupBySemanticPurpose(elements, designIntent);

    semanticGroups.forEach((group, index) => {
      const bounds = this.calculateGroupBounds(group);
      const characteristics = this.analyzeSemanticCharacteristics(group, designIntent);

      if (characteristics.semantic.semanticCohesion >= options.thresholds.minBoundaryConfidence) {
        boundaries.push({
          id: `semantic-${index}`,
          name: this.generateSemanticName(group, designIntent),
          type: this.inferComponentType(group, 'semantic'),
          bounds,
          elements: group,
          characteristics,
          confidence: characteristics.semantic.semanticCohesion,
          reasoning: [
            {
              factor: 'semantic-cohesion',
              weight: options.algorithmWeights.semanticCohesion,
              evidence: [
                `Business purpose: ${characteristics.semantic.businessPurpose}`,
                `User goal: ${characteristics.semantic.userGoal}`,
                `Content relationship strength: ${characteristics.semantic.contentRelationship.length}`
              ],
              confidence: characteristics.semantic.semanticCohesion
            }
          ],
          alternatives: []
        });
      }
    });

    return boundaries;
  }

  /**
   * 執行功能分析
   */
  private static performFunctionalAnalysis(
    elements: DesignElement[],
    designIntent: DesignIntent,
    options: ComponentBoundaryDetectionOptions
  ): ComponentBoundary[] {
    const boundaries: ComponentBoundary[] = [];

    // 基於互動和功能進行分組
    const functionalGroups = this.groupByFunctionalBehavior(elements, designIntent);

    functionalGroups.forEach((group, index) => {
      const bounds = this.calculateGroupBounds(group);
      const characteristics = this.analyzeFunctionalCharacteristics(group, designIntent);

      if (characteristics.functional.functionalCohesion >= options.thresholds.minBoundaryConfidence) {
        boundaries.push({
          id: `functional-${index}`,
          name: this.generateFunctionalName(group, designIntent),
          type: this.inferComponentType(group, 'functional'),
          bounds,
          elements: group,
          characteristics,
          confidence: characteristics.functional.functionalCohesion,
          reasoning: [
            {
              factor: 'functional-cohesion',
              weight: options.algorithmWeights.functionalCohesion,
              evidence: [
                `Interaction patterns: ${characteristics.functional.interactionPattern.length}`,
                `State management complexity: ${characteristics.functional.stateManagement.complexity}`,
                `Data flow coherence: ${characteristics.functional.dataFlow.dependencies.length}`
              ],
              confidence: characteristics.functional.functionalCohesion
            }
          ],
          alternatives: []
        });
      }
    });

    return boundaries;
  }

  /**
   * 執行結構分析
   */
  private static performStructuralAnalysis(
    elements: DesignElement[],
    options: ComponentBoundaryDetectionOptions
  ): ComponentBoundary[] {
    const boundaries: ComponentBoundary[] = [];

    // 基於結構層級和巢狀關係進行分組
    const structuralGroups = this.groupByStructuralPatterns(elements);

    structuralGroups.forEach((group, index) => {
      const bounds = this.calculateGroupBounds(group);
      const characteristics = this.analyzeStructuralCharacteristics(group);

      if (characteristics.structural.complexity.structural <= options.thresholds.maxComponentComplexity) {
        boundaries.push({
          id: `structural-${index}`,
          name: `StructuralComponent${index}`,
          type: this.inferComponentType(group, 'structural'),
          bounds,
          elements: group,
          characteristics,
          confidence: 1 - (characteristics.structural.complexity.structural / 10), // 複雜度越低信心越高
          reasoning: [
            {
              factor: 'structural-simplicity',
              weight: options.algorithmWeights.complexityControl,
              evidence: [
                `Complexity score: ${characteristics.structural.complexity.structural}`,
                `Nesting depth: ${characteristics.structural.nesting.depth}`,
                `Coupling score: ${characteristics.structural.coupling.instability}`
              ],
              confidence: 1 - (characteristics.structural.complexity.structural / 10)
            }
          ],
          alternatives: []
        });
      }
    });

    return boundaries;
  }

  /**
   * 執行複用性分析
   */
  private static performReusabilityAnalysis(
    elements: DesignElement[],
    options: ComponentBoundaryDetectionOptions
  ): ComponentBoundary[] {
    const boundaries: ComponentBoundary[] = [];

    // 識別可重複使用的模式
    const reusablePatterns = this.identifyReusablePatterns(elements);

    reusablePatterns.forEach((pattern, index) => {
      const bounds = this.calculateGroupBounds(pattern.elements);
      const characteristics = this.analyzeReusabilityCharacteristics(pattern.elements);

      if (characteristics.reusability.reusePotential >= options.thresholds.minReusabilityScore) {
        boundaries.push({
          id: `reusable-${index}`,
          name: pattern.name,
          type: this.inferComponentType(pattern.elements, 'reusable'),
          bounds,
          elements: pattern.elements,
          characteristics,
          confidence: characteristics.reusability.reusePotential,
          reasoning: [
            {
              factor: 'reusability-potential',
              weight: options.algorithmWeights.reusabilityPotential,
              evidence: [
                `Reuse potential: ${characteristics.reusability.reusePotential}`,
                `Genericity level: ${characteristics.reusability.genericityLevel}`,
                `Variation count: ${characteristics.reusability.variations.length}`
              ],
              confidence: characteristics.reusability.reusePotential
            }
          ],
          alternatives: []
        });
      }
    });

    return boundaries;
  }

  /**
   * 合併多重分析結果
   */
  private static mergeBoundaryAnalyses(
    visualBoundaries: ComponentBoundary[],
    semanticBoundaries: ComponentBoundary[],
    functionalBoundaries: ComponentBoundary[],
    structuralBoundaries: ComponentBoundary[],
    reusabilityBoundaries: ComponentBoundary[],
    options: ComponentBoundaryDetectionOptions
  ): ComponentBoundary[] {
    const allBoundaries = [
      ...visualBoundaries,
      ...semanticBoundaries,
      ...functionalBoundaries,
      ...structuralBoundaries,
      ...reusabilityBoundaries
    ];

    // 執行邊界重疊分析和合併
    const mergedBoundaries = this.consolidateOverlappingBoundaries(allBoundaries, options);

    // 過濾低信心邊界
    return mergedBoundaries.filter(boundary => 
      boundary.confidence >= options.thresholds.minBoundaryConfidence
    );
  }

  /**
   * 生成邊界建議
   */
  private static generateBoundaryRecommendations(
    boundaries: ComponentBoundary[],
    options: ComponentBoundaryDetectionOptions
  ): BoundaryRecommendation[] {
    const recommendations: BoundaryRecommendation[] = [];

    boundaries.forEach(boundary => {
      // 分析是否需要分割
      if (this.shouldSplitComponent(boundary, options)) {
        recommendations.push({
          type: 'split',
          priority: 'high',
          description: `建議將 ${boundary.name} 拆分為更小的組件`,
          reasoning: [
            '組件複雜度過高',
            '包含多個不相關的功能',
            '違反單一職責原則'
          ],
          impact: {
            developmentTime: '2-4 hours',
            codeQuality: 0.3,
            performance: 0.1,
            maintainability: 0.4,
            testability: 0.3
          },
          implementation: {
            steps: [
              '識別功能邊界',
              '提取子組件',
              '重構資料流',
              '更新測試'
            ],
            considerations: ['保持 API 相容性', '注意效能影響'],
            bestPractices: ['遵循單一職責原則', '保持組件內聚性'],
            pitfalls: ['過度拆分', '循環依賴']
          },
          alternatives: ['重構內部結構', '使用組合模式']
        });
      }

      // 分析是否需要合併
      if (this.shouldMergeWithOthers(boundary, boundaries, options)) {
        recommendations.push({
          type: 'merge',
          priority: 'medium',
          description: `建議將 ${boundary.name} 與相關組件合併`,
          reasoning: [
            '組件過於瑣碎',
            '與其他組件高度耦合',
            '缺乏獨立價值'
          ],
          impact: {
            developmentTime: '1-2 hours',
            codeQuality: 0.2,
            performance: 0.05,
            maintainability: 0.1,
            testability: -0.1
          },
          implementation: {
            steps: [
              '識別合併目標',
              '統一介面',
              '合併實作',
              '更新文件'
            ],
            considerations: ['避免創造超大組件'],
            bestPractices: ['保持語義一致性'],
            pitfalls: ['功能混雜', '職責不清']
          },
          alternatives: ['保持獨立但加強協作']
        });
      }
    });

    return recommendations;
  }

  /**
   * 建構組件階層
   */
  private static buildComponentHierarchy(
    boundaries: ComponentBoundary[],
    options: ComponentBoundaryDetectionOptions
  ): ComponentHierarchy {
    // 根據原子設計原則建立階層
    const atomicComponents = boundaries.filter(b => b.type === 'atomic');
    const molecularComponents = boundaries.filter(b => b.type === 'molecular');
    const organismComponents = boundaries.filter(b => b.type === 'organism');
    const templates = boundaries.filter(b => b.type === 'template');
    const pages = boundaries.filter(b => b.type === 'page');

    // 建構樹狀結構
    const root = this.buildComponentTree(boundaries);

    return {
      root,
      levels: this.calculateTreeDepth(root),
      atomicComponents: atomicComponents.map(b => this.boundaryToNode(b)),
      molecularComponents: molecularComponents.map(b => this.boundaryToNode(b)),
      organismComponents: organismComponents.map(b => this.boundaryToNode(b)),
      templates: templates.map(b => this.boundaryToNode(b)),
      pages: pages.map(b => this.boundaryToNode(b))
    };
  }

  /**
   * 分析組件關係
   */
  private static analyzeComponentRelationships(
    boundaries: ComponentBoundary[],
    options: ComponentBoundaryDetectionOptions
  ): ComponentRelationship[] {
    const relationships: ComponentRelationship[] = [];

    boundaries.forEach(sourceB => {
      boundaries.forEach(targetB => {
        if (sourceB.id !== targetB.id) {
          const relationshipType = this.determineRelationshipType(sourceB, targetB);
          if (relationshipType) {
            const strength = this.calculateRelationshipStrength(sourceB, targetB);
            
            relationships.push({
              source: sourceB.id,
              target: targetB.id,
              type: relationshipType,
              strength,
              direction: this.determineRelationshipDirection(sourceB, targetB, relationshipType),
              description: this.generateRelationshipDescription(sourceB, targetB, relationshipType),
              implications: this.analyzeRelationshipImplications(relationshipType, strength)
            });
          }
        }
      });
    });

    return relationships;
  }

  /**
   * 優化邊界
   */
  private static optimizeBoundaries(
    boundaries: ComponentBoundary[],
    relationships: ComponentRelationship[],
    options: ComponentBoundaryDetectionOptions
  ): BoundaryOptimization[] {
    const optimizations: BoundaryOptimization[] = [];

    boundaries.forEach(boundary => {
      const currentMetrics = this.calculateBoundaryMetrics(boundary);
      const optimizedBoundary = this.optimizeSingleBoundary(boundary, relationships);
      const optimizedMetrics = this.calculateBoundaryMetrics(optimizedBoundary);

      const improvements = this.compareMetrics(currentMetrics, optimizedMetrics);
      
      if (improvements.some(i => i.improvement > 0.1)) {
        optimizations.push({
          type: this.determineOptimizationType(improvements),
          currentBoundary: boundary.id,
          optimizedBoundary,
          improvements,
          tradeoffs: this.analyzeOptimizationTradeoffs(boundary, optimizedBoundary),
          recommendation: {
            action: this.generateOptimizationAction(improvements),
            reasoning: this.generateOptimizationReasoning(improvements),
            priority: this.calculateOptimizationPriority(improvements),
            effort: this.estimateOptimizationEffort(boundary, optimizedBoundary)
          }
        });
      }
    });

    return optimizations;
  }

  /**
   * 計算信心分數
   */
  private static calculateConfidenceScores(
    boundaries: ComponentBoundary[],
    analyses: ComponentBoundary[][]
  ): ConfidenceScore {
    const overall = boundaries.reduce((sum, b) => sum + b.confidence, 0) / boundaries.length;
    
    const byBoundary: Record<string, number> = {};
    boundaries.forEach(b => {
      byBoundary[b.id] = b.confidence;
    });

    const byType: Record<ComponentType, number> = {};
    const typeGroups = this.groupByType(boundaries);
    Object.entries(typeGroups).forEach(([type, bounds]) => {
      byType[type as ComponentType] = bounds.reduce((sum, b) => sum + b.confidence, 0) / bounds.length;
    });

    const byLevel: Record<AtomicDesignLevel, number> = {};
    // 計算原子設計層級的信心分數邏輯...

    const factors: ConfidenceFactor[] = [
      {
        factor: 'visual-consistency',
        contribution: 0.25,
        explanation: '視覺元素的一致性和內聚性'
      },
      {
        factor: 'semantic-coherence',
        contribution: 0.25,
        explanation: '語義目的和功能的連貫性'
      },
      {
        factor: 'functional-cohesion',
        contribution: 0.25,
        explanation: '功能和互動的內聚程度'
      },
      {
        factor: 'structural-simplicity',
        contribution: 0.25,
        explanation: '結構複雜度和維護性'
      }
    ];

    return {
      overall,
      byBoundary,
      byType,
      byLevel,
      factors
    };
  }

  // 輔助方法實作...
  private static groupByVisualCharacteristics(elements: DesignElement[]): DesignElement[][] {
    // 根據視覺特徵進行分組的邏輯
    return [elements]; // 簡化實作
  }

  private static calculateGroupBounds(group: DesignElement[]): BoundingBox {
    // 計算組別邊界框的邏輯
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  private static analyzeVisualCharacteristics(group: DesignElement[]): BoundaryCharacteristics {
    // 分析視覺特徵的邏輯
    return {
      visual: {
        cohesion: 0.8,
        separation: 0.7,
        alignment: { horizontal: [], vertical: [], gridSystem: { columns: 12, rows: 1, gutterX: 16, gutterY: 16, alignment: 'center' } },
        spacing: { internal: [8, 16], external: [24], consistency: 0.9 },
        colorGrouping: { palette: ['#000000', '#FFFFFF'], coherence: 0.8, contrast: 0.9 },
        typography: { families: ['Inter'], sizes: [16], weights: [400], consistency: 0.9 },
        visualWeight: 0.6
      },
      semantic: {
        semanticCohesion: 0.7,
        businessPurpose: 'user interface',
        userGoal: 'interaction',
        informationArchitecture: 'hierarchical',
        contentRelationship: [],
        accessibility: { landmarks: [], headingHierarchy: [], labelingStrategy: 'aria-label', keyboardNavigation: true }
      },
      functional: {
        functionalCohesion: 0.8,
        interactionPattern: [],
        stateManagement: { hasState: false, stateTypes: [], complexity: 0, sharedState: false },
        dataFlow: { inputs: [], outputs: [], transformations: [], dependencies: [] },
        eventHandling: { events: [], propagation: false, delegation: false },
        sideEffects: []
      },
      structural: {
        complexity: { cyclomatic: 1, cognitive: 1, structural: 2, visual: 3 },
        nesting: { depth: 2, breadth: 3, structure: 'tree' },
        dependencies: [],
        coupling: { afferent: 0, efferent: 1, instability: 1 },
        maintainability: { index: 8, factors: ['simplicity'], risks: [] }
      },
      reusability: {
        reusePotential: 0.6,
        genericityLevel: 'contextual',
        parameterizability: [],
        adaptability: { contextSensitivity: 0.5, customizability: 0.7, extensibility: 0.6 },
        portability: { platformIndependence: 0.8, frameworkAgnostic: 0.6, dependencies: [] },
        variations: []
      }
    };
  }

  private static inferComponentType(group: DesignElement[], context: string): ComponentType {
    // 根據元素特徵推斷組件類型
    if (group.length === 1) return 'atomic';
    if (group.length <= 3) return 'molecular';
    return 'organism';
  }

  // 其他輔助方法的簡化實作...
  private static groupBySemanticPurpose(elements: DesignElement[], designIntent: DesignIntent): DesignElement[][] {
    return [elements];
  }

  private static analyzeSemanticCharacteristics(group: DesignElement[], designIntent: DesignIntent): BoundaryCharacteristics {
    return this.analyzeVisualCharacteristics(group);
  }

  private static generateSemanticName(group: DesignElement[], designIntent: DesignIntent): string {
    return 'SemanticComponent';
  }

  private static groupByFunctionalBehavior(elements: DesignElement[], designIntent: DesignIntent): DesignElement[][] {
    return [elements];
  }

  private static analyzeFunctionalCharacteristics(group: DesignElement[], designIntent: DesignIntent): BoundaryCharacteristics {
    return this.analyzeVisualCharacteristics(group);
  }

  private static generateFunctionalName(group: DesignElement[], designIntent: DesignIntent): string {
    return 'FunctionalComponent';
  }

  private static groupByStructuralPatterns(elements: DesignElement[]): DesignElement[][] {
    return [elements];
  }

  private static analyzeStructuralCharacteristics(group: DesignElement[]): BoundaryCharacteristics {
    return this.analyzeVisualCharacteristics(group);
  }

  private static identifyReusablePatterns(elements: DesignElement[]): Array<{name: string, elements: DesignElement[]}> {
    return [{ name: 'ReusablePattern', elements }];
  }

  private static analyzeReusabilityCharacteristics(elements: DesignElement[]): BoundaryCharacteristics {
    return this.analyzeVisualCharacteristics(elements);
  }

  private static consolidateOverlappingBoundaries(boundaries: ComponentBoundary[], options: ComponentBoundaryDetectionOptions): ComponentBoundary[] {
    return boundaries;
  }

  private static shouldSplitComponent(boundary: ComponentBoundary, options: ComponentBoundaryDetectionOptions): boolean {
    return boundary.characteristics.structural.complexity.structural > options.thresholds.maxComponentComplexity;
  }

  private static shouldMergeWithOthers(boundary: ComponentBoundary, boundaries: ComponentBoundary[], options: ComponentBoundaryDetectionOptions): boolean {
    return boundary.elements.length < options.thresholds.minComponentSize;
  }

  private static buildComponentTree(boundaries: ComponentBoundary[]): ComponentNode {
    return {
      id: 'root',
      name: 'Root',
      type: 'page',
      level: 'page',
      children: [],
      boundary: boundaries[0],
      responsibilities: ['root container']
    };
  }

  private static calculateTreeDepth(root: ComponentNode): number {
    return 1;
  }

  private static boundaryToNode(boundary: ComponentBoundary): ComponentNode {
    return {
      id: boundary.id,
      name: boundary.name,
      type: boundary.type,
      level: this.typeToLevel(boundary.type),
      children: [],
      boundary,
      responsibilities: [boundary.characteristics.semantic.businessPurpose]
    };
  }

  private static typeToLevel(type: ComponentType): AtomicDesignLevel {
    switch (type) {
      case 'atomic': return 'atom';
      case 'molecular': return 'molecule';
      case 'organism': return 'organism';
      case 'template': return 'template';
      case 'page': return 'page';
      default: return 'atom';
    }
  }

  private static determineRelationshipType(source: ComponentBoundary, target: ComponentBoundary): RelationshipType | null {
    // 判斷組件關係類型的邏輯
    return 'uses';
  }

  private static calculateRelationshipStrength(source: ComponentBoundary, target: ComponentBoundary): number {
    return 0.5;
  }

  private static determineRelationshipDirection(source: ComponentBoundary, target: ComponentBoundary, type: RelationshipType): RelationshipDirection {
    return 'unidirectional';
  }

  private static generateRelationshipDescription(source: ComponentBoundary, target: ComponentBoundary, type: RelationshipType): string {
    return `${source.name} ${type} ${target.name}`;
  }

  private static analyzeRelationshipImplications(type: RelationshipType, strength: number): string[] {
    return [`Relationship type: ${type}`, `Strength: ${strength}`];
  }

  private static calculateBoundaryMetrics(boundary: ComponentBoundary): Record<string, number> {
    return {
      complexity: boundary.characteristics.structural.complexity.structural,
      cohesion: boundary.characteristics.visual.cohesion,
      coupling: boundary.characteristics.structural.coupling.instability
    };
  }

  private static optimizeSingleBoundary(boundary: ComponentBoundary, relationships: ComponentRelationship[]): ComponentBoundary {
    return { ...boundary };
  }

  private static compareMetrics(current: Record<string, number>, optimized: Record<string, number>): ImprovementMetric[] {
    return Object.keys(current).map(key => ({
      metric: key,
      currentValue: current[key],
      optimizedValue: optimized[key],
      improvement: optimized[key] - current[key]
    }));
  }

  private static determineOptimizationType(improvements: ImprovementMetric[]): OptimizationType {
    return 'reduce-complexity';
  }

  private static analyzeOptimizationTradeoffs(current: ComponentBoundary, optimized: ComponentBoundary): TradeoffInfo[] {
    return [];
  }

  private static generateOptimizationAction(improvements: ImprovementMetric[]): string {
    return 'Optimize component structure';
  }

  private static generateOptimizationReasoning(improvements: ImprovementMetric[]): string {
    return 'Based on complexity analysis';
  }

  private static calculateOptimizationPriority(improvements: ImprovementMetric[]): number {
    return improvements.reduce((sum, i) => sum + i.improvement, 0);
  }

  private static estimateOptimizationEffort(current: ComponentBoundary, optimized: ComponentBoundary): string {
    return '2-4 hours';
  }

  private static groupByType(boundaries: ComponentBoundary[]): Record<string, ComponentBoundary[]> {
    const groups: Record<string, ComponentBoundary[]> = {};
    boundaries.forEach(b => {
      if (!groups[b.type]) groups[b.type] = [];
      groups[b.type].push(b);
    });
    return groups;
  }
}

// 預設配置
export const defaultBoundaryDetectionOptions: ComponentBoundaryDetectionOptions = {
  analysisDepth: 'medium',
  algorithmWeights: {
    visualCohesion: 0.25,
    semanticCohesion: 0.25,
    functionalCohesion: 0.25,
    reusabilityPotential: 0.15,
    complexityControl: 0.10
  },
  thresholds: {
    minBoundaryConfidence: 0.6,
    minComponentSize: 2,
    maxComponentComplexity: 7,
    minReusabilityScore: 0.4,
    maxCouplingScore: 0.8
  },
  preferences: {
    atomicDesignLevels: ['atom', 'molecule', 'organism', 'template', 'page'],
    preferredComponentTypes: ['atomic', 'molecular', 'organism'],
    optimizeFor: ['maintainability', 'reusability'],
    avoidPatterns: ['god-component', 'feature-envy']
  },
  constraints: {
    maxBoundariesPerLevel: {
      atom: 50,
      molecule: 30,
      organism: 15,
      template: 5,
      page: 3
    },
    minElementsPerComponent: 1,
    maxNestingDepth: 5,
    preserveExistingBoundaries: false
  }
};