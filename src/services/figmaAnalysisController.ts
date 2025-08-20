/**
 * Figma 分析控制器
 * 整合四維解析系統 (Device/Module/Page/State) 的統一控制器
 */

import { FigmaAssetParser, FigmaJsonParser, ParsedAssetInfo } from './figmaParser';
import { FigmaFileProcessor, FigmaImportResult, ProcessedFigmaFile } from './figmaFileProcessor';
import { DesignTokenExtractor, DesignTokens } from './designTokenExtractor';
import { VisualAnalysisEngine, VisualAnalysisResult } from './visualAnalysisEngine';

export interface ComprehensiveAnalysisResult {
  overview: AnalysisOverview;
  dimensions: DimensionalAnalysis;
  assets: ProcessedAssetAnalysis[];
  designSystem: DesignSystemAnalysis;
  codeGeneration: CodeGenerationPlan;
  recommendations: SmartRecommendation[];
  confidence: OverallConfidence;
}

export interface AnalysisOverview {
  projectName: string;
  totalAssets: number;
  detectedFrameworks: string[];
  primaryDevices: string[];
  mainModules: string[];
  designComplexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  estimatedDevelopmentTime: string;
}

export interface DimensionalAnalysis {
  device: DeviceAnalysis;
  module: ModuleAnalysis;
  page: PageAnalysis;
  state: StateAnalysis;
}

export interface DeviceAnalysis {
  distribution: Record<string, number>;
  responsiveStrategy: ResponsiveStrategy;
  breakpoints: BreakpointSuggestion[];
  compatibility: DeviceCompatibility;
}

export interface ResponsiveStrategy {
  approach: 'mobile-first' | 'desktop-first' | 'adaptive' | 'hybrid';
  reasoning: string;
  recommendations: string[];
}

export interface BreakpointSuggestion {
  device: string;
  width: number;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface DeviceCompatibility {
  modern: boolean;
  legacy: boolean;
  touch: boolean;
  voice: boolean;
  issues: string[];
}

export interface ModuleAnalysis {
  modules: ModuleStructure[];
  dependencies: ModuleDependency[];
  architecture: ArchitecturePattern;
  scalability: ScalabilityAssessment;
}

export interface ModuleStructure {
  name: string;
  type: string;
  components: ComponentCount;
  complexity: number;
  priority: number;
  estimatedHours: number;
}

export interface ComponentCount {
  total: number;
  byType: Record<string, number>;
  unique: number;
  reusable: number;
}

export interface ModuleDependency {
  from: string;
  to: string;
  type: 'shared-component' | 'data-flow' | 'navigation' | 'styling';
  strength: number;
}

export interface ArchitecturePattern {
  primary: string;
  supporting: string[];
  suitability: number;
  recommendations: string[];
}

export interface ScalabilityAssessment {
  componentReusability: number;
  moduleIndependence: number;
  maintainability: number;
  testability: number;
  issues: string[];
}

export interface PageAnalysis {
  pages: PageStructure[];
  flows: UserFlow[];
  navigation: NavigationPattern;
  content: ContentStrategy;
}

export interface PageStructure {
  name: string;
  type: string;
  layout: string;
  sections: PageSection[];
  interactions: InteractionPattern[];
  complexity: number;
}

export interface PageSection {
  name: string;
  purpose: string;
  components: string[];
  priority: number;
}

export interface UserFlow {
  name: string;
  steps: FlowStep[];
  complexity: number;
  importance: number;
}

export interface FlowStep {
  page: string;
  action: string;
  next: string[];
}

export interface NavigationPattern {
  type: string;
  levels: number;
  structure: NavigationStructure;
}

export interface NavigationStructure {
  primary: string[];
  secondary: Record<string, string[]>;
  utility: string[];
}

export interface ContentStrategy {
  types: ContentType[];
  hierarchy: ContentHierarchy;
  accessibility: ContentAccessibility;
}

export interface ContentType {
  name: string;
  count: number;
  priority: number;
  treatment: string;
}

export interface ContentHierarchy {
  levels: number;
  consistency: number;
  clarity: number;
}

export interface ContentAccessibility {
  compliance: string;
  issues: string[];
  improvements: string[];
}

export interface StateAnalysis {
  states: StatePattern[];
  transitions: StateTransition[];
  management: StateManagementStrategy;
  testing: StateTestingPlan;
}

export interface StatePattern {
  name: string;
  components: string[];
  complexity: number;
  frequency: number;
}

export interface StateTransition {
  from: string;
  to: string;
  trigger: string;
  animation: string;
}

export interface StateManagementStrategy {
  approach: string;
  tools: string[];
  complexity: number;
  recommendations: string[];
}

export interface StateTestingPlan {
  strategies: string[];
  coverage: number;
  tools: string[];
}

export interface ProcessedAssetAnalysis {
  file: ProcessedFigmaFile;
  visualAnalysis: VisualAnalysisResult;
  semanticAnalysis: SemanticAnalysis;
  technicalSpecs: TechnicalSpecification;
  implementationNotes: ImplementationNote[];
}

export interface SemanticAnalysis {
  purpose: string;
  userJourney: string;
  businessValue: number;
  technicalDebt: number;
  maintainabilityScore: number;
}

export interface TechnicalSpecification {
  estimatedComplexity: number;
  requiredSkills: string[];
  dependencies: string[];
  performance: PerformanceSpec;
  accessibility: AccessibilitySpec;
}

export interface PerformanceSpec {
  loadTime: number;
  interactionLatency: number;
  memoryUsage: string;
  optimizations: string[];
}

export interface AccessibilitySpec {
  level: string;
  requirements: string[];
  testing: string[];
}

export interface ImplementationNote {
  type: 'warning' | 'tip' | 'requirement' | 'optimization';
  message: string;
  priority: number;
  frameworks: string[];
}

export interface DesignSystemAnalysis {
  tokens: DesignTokens;
  components: ComponentLibrary;
  patterns: DesignPatternLibrary;
  guidelines: DesignGuidelines;
}

export interface ComponentLibrary {
  atomic: AtomicComponent[];
  molecular: MolecularComponent[];
  organisms: OrganismComponent[];
  templates: TemplateComponent[];
}

export interface AtomicComponent {
  name: string;
  type: string;
  variants: ComponentVariant[];
  usage: UsagePattern;
}

export interface ComponentVariant {
  name: string;
  properties: Record<string, any>;
  preview: string;
}

export interface UsagePattern {
  frequency: number;
  contexts: string[];
  examples: string[];
}

export interface MolecularComponent {
  name: string;
  atoms: string[];
  functionality: string;
  patterns: string[];
}

export interface OrganismComponent {
  name: string;
  molecules: string[];
  atoms: string[];
  purpose: string;
  layout: string;
}

export interface TemplateComponent {
  name: string;
  organisms: string[];
  layout: string;
  pages: string[];
}

export interface DesignPatternLibrary {
  interaction: InteractionPattern[];
  layout: LayoutPattern[];
  navigation: NavigationPatternDetail[];
  feedback: FeedbackPattern[];
}

export interface InteractionPattern {
  name: string;
  description: string;
  components: string[];
  states: string[];
  animations: AnimationSpec[];
}

export interface LayoutPattern {
  name: string;
  structure: string;
  responsive: boolean;
  usage: string[];
}

export interface NavigationPatternDetail {
  name: string;
  type: string;
  hierarchy: number;
  responsive: boolean;
}

export interface FeedbackPattern {
  name: string;
  triggers: string[];
  presentation: string;
  duration: number;
}

export interface AnimationSpec {
  name: string;
  duration: number;
  easing: string;
  properties: string[];
}

export interface DesignGuidelines {
  spacing: SpacingGuideline;
  typography: TypographyGuideline;
  color: ColorGuideline;
  accessibility: AccessibilityGuideline;
}

export interface SpacingGuideline {
  system: string;
  rules: string[];
  examples: string[];
}

export interface TypographyGuideline {
  scale: string;
  hierarchy: string[];
  pairing: string[];
}

export interface ColorGuideline {
  palette: string;
  usage: Record<string, string>;
  accessibility: string[];
}

export interface AccessibilityGuideline {
  standards: string[];
  requirements: string[];
  testing: string[];
}

export interface CodeGenerationPlan {
  frameworks: FrameworkPlan[];
  architecture: ArchitecturePlan;
  timeline: DevelopmentTimeline;
  resources: ResourceRequirement[];
}

export interface FrameworkPlan {
  name: string;
  priority: number;
  complexity: number;
  features: FrameworkFeature[];
  dependencies: string[];
  timeline: string;
}

export interface FrameworkFeature {
  name: string;
  status: 'planned' | 'in-progress' | 'completed';
  effort: number;
  dependencies: string[];
}

export interface ArchitecturePlan {
  pattern: string;
  structure: ProjectStructure;
  conventions: CodingConvention[];
  tooling: ToolingSetup;
}

export interface ProjectStructure {
  directories: DirectoryStructure[];
  files: FileStructure[];
  naming: NamingConvention;
}

export interface DirectoryStructure {
  path: string;
  purpose: string;
  contents: string[];
}

export interface FileStructure {
  name: string;
  purpose: string;
  template: string;
}

export interface NamingConvention {
  files: string;
  components: string;
  variables: string;
  functions: string;
}

export interface CodingConvention {
  category: string;
  rules: string[];
  examples: string[];
}

export interface ToolingSetup {
  bundler: string;
  testing: string[];
  linting: string[];
  formatting: string[];
}

export interface DevelopmentTimeline {
  phases: DevelopmentPhase[];
  milestones: Milestone[];
  totalDuration: string;
}

export interface DevelopmentPhase {
  name: string;
  duration: string;
  tasks: Task[];
  deliverables: string[];
}

export interface Task {
  name: string;
  effort: number;
  skills: string[];
  dependencies: string[];
}

export interface Milestone {
  name: string;
  date: string;
  deliverables: string[];
  criteria: string[];
}

export interface ResourceRequirement {
  type: 'human' | 'tool' | 'service' | 'hardware';
  name: string;
  quantity: number;
  duration: string;
  cost: string;
}

export interface SmartRecommendation {
  type: 'optimization' | 'best-practice' | 'warning' | 'enhancement';
  category: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  frameworks: string[];
  actions: RecommendationAction[];
}

export interface RecommendationAction {
  description: string;
  code?: string;
  resources?: string[];
}

export interface OverallConfidence {
  parsing: number;
  analysis: number;
  recommendations: number;
  codeGeneration: number;
  overall: number;
  factors: ConfidenceFactor[];
}

export interface ConfidenceFactor {
  name: string;
  score: number;
  reasoning: string;
}

export class FigmaAnalysisController {
  private assetParser: FigmaAssetParser;
  private fileProcessor: FigmaFileProcessor;
  private tokenExtractor: DesignTokenExtractor;
  private visualEngine: VisualAnalysisEngine;

  constructor() {
    this.assetParser = new FigmaAssetParser();
    this.fileProcessor = new FigmaFileProcessor();
    this.tokenExtractor = new DesignTokenExtractor();
    this.visualEngine = new VisualAnalysisEngine();
  }

  /**
   * 執行完整的 Figma 分析
   */
  async analyzeComplete(files: File[]): Promise<ComprehensiveAnalysisResult> {
    console.log('🚀 開始 Figma 完整分析...');
    
    // Phase 1: 基礎檔案處理和解析
    const importResult = await this.fileProcessor.processFiles(files);
    console.log(`📁 處理了 ${importResult.files.length} 個檔案`);
    
    // Phase 2: 四維分析
    const dimensions = await this.analyzeDimensions(importResult);
    console.log('📊 完成四維分析 (Device/Module/Page/State)');
    
    // Phase 3: 深度資產分析
    const processedAssets = await this.analyzeAssetsInDepth(importResult.files);
    console.log(`🔍 完成 ${processedAssets.length} 個資產的深度分析`);
    
    // Phase 4: 設計系統分析
    const designSystem = await this.analyzeDesignSystem(importResult, processedAssets);
    console.log('🎨 完成設計系統分析');
    
    // Phase 5: 代碼生成計劃
    const codeGeneration = await this.planCodeGeneration(dimensions, designSystem);
    console.log('⚡ 完成代碼生成計劃');
    
    // Phase 6: 智能建議
    const recommendations = await this.generateRecommendations(
      dimensions, processedAssets, designSystem, codeGeneration
    );
    console.log(`💡 生成了 ${recommendations.length} 個智能建議`);
    
    // Phase 7: 整合結果
    const overview = this.generateOverview(importResult, dimensions, designSystem);
    const confidence = this.calculateOverallConfidence(
      importResult, dimensions, processedAssets, designSystem
    );
    
    console.log('✅ 分析完成，整體信心度:', confidence.overall);
    
    return {
      overview,
      dimensions,
      assets: processedAssets,
      designSystem,
      codeGeneration,
      recommendations,
      confidence
    };
  }

  /**
   * 四維分析 (Device/Module/Page/State)
   */
  private async analyzeDimensions(importResult: FigmaImportResult): Promise<DimensionalAnalysis> {
    const parsedAssets = importResult.files.map(f => f.parsedInfo);
    
    return {
      device: await this.analyzeDeviceDimension(parsedAssets),
      module: await this.analyzeModuleDimension(parsedAssets),
      page: await this.analyzePageDimension(parsedAssets),
      state: await this.analyzeStateDimension(parsedAssets)
    };
  }

  /**
   * 分析設備維度
   */
  private async analyzeDeviceDimension(assets: ParsedAssetInfo[]): Promise<DeviceAnalysis> {
    const deviceCounts: Record<string, number> = {};
    assets.forEach(asset => {
      deviceCounts[asset.device] = (deviceCounts[asset.device] || 0) + 1;
    });

    const distribution = this.normalizeDistribution(deviceCounts);
    const responsiveStrategy = this.determineResponsiveStrategy(distribution);
    const breakpoints = this.suggestBreakpoints(distribution);
    const compatibility = this.assessDeviceCompatibility(assets);

    return {
      distribution,
      responsiveStrategy,
      breakpoints,
      compatibility
    };
  }

  /**
   * 分析模組維度
   */
  private async analyzeModuleDimension(assets: ParsedAssetInfo[]): Promise<ModuleAnalysis> {
    const moduleGroups = this.groupAssetsByModule(assets);
    const modules = await this.analyzeModuleStructures(moduleGroups);
    const dependencies = this.identifyModuleDependencies(modules);
    const architecture = this.suggestArchitecturePattern(modules);
    const scalability = this.assessScalability(modules);

    return {
      modules,
      dependencies,
      architecture,
      scalability
    };
  }

  /**
   * 分析頁面維度
   */
  private async analyzePageDimension(assets: ParsedAssetInfo[]): Promise<PageAnalysis> {
    const pageGroups = this.groupAssetsByPage(assets);
    const pages = await this.analyzePageStructures(pageGroups);
    const flows = this.identifyUserFlows(pages);
    const navigation = this.analyzeNavigationPattern(pages);
    const content = this.analyzeContentStrategy(pages);

    return {
      pages,
      flows,
      navigation,
      content
    };
  }

  /**
   * 分析狀態維度
   */
  private async analyzeStateDimension(assets: ParsedAssetInfo[]): Promise<StateAnalysis> {
    const stateGroups = this.groupAssetsByState(assets);
    const states = this.identifyStatePatterns(stateGroups);
    const transitions = this.mapStateTransitions(states);
    const management = this.suggestStateManagement(states);
    const testing = this.planStateTesting(states);

    return {
      states,
      transitions,
      management,
      testing
    };
  }

  /**
   * 深度資產分析
   */
  private async analyzeAssetsInDepth(files: ProcessedFigmaFile[]): Promise<ProcessedAssetAnalysis[]> {
    const results: ProcessedAssetAnalysis[] = [];

    for (const file of files) {
      if (file.file.type.startsWith('image/')) {
        try {
          const visualAnalysis = await this.visualEngine.analyzeImage(file.file);
          const semanticAnalysis = this.analyzeSemanticMeaning(file, visualAnalysis);
          const technicalSpecs = this.generateTechnicalSpecs(file, visualAnalysis);
          const implementationNotes = this.generateImplementationNotes(file, visualAnalysis);

          results.push({
            file,
            visualAnalysis,
            semanticAnalysis,
            technicalSpecs,
            implementationNotes
          });
        } catch (error) {
          console.warn(`分析檔案 ${file.file.name} 時發生錯誤:`, error);
        }
      }
    }

    return results;
  }

  /**
   * 設計系統分析
   */
  private async analyzeDesignSystem(
    importResult: FigmaImportResult, 
    processedAssets: ProcessedAssetAnalysis[]
  ): Promise<DesignSystemAnalysis> {
    // 提取設計令牌
    let tokens: DesignTokens = {
      colors: { primary: {} as any, secondary: {} as any, neutral: {} as any, semantic: {} as any, gradients: [], custom: {} },
      typography: { fontFamilies: {}, fontWeights: {}, fontSizes: {}, lineHeights: {}, letterSpacing: {}, textStyles: {} },
      spacing: { base: 4, scale: {}, components: {} as any },
      effects: { shadows: {}, blurs: {}, overlays: {} },
      sizing: { breakpoints: {}, containers: {}, components: {} },
      borders: { widths: {}, styles: {}, radii: {} },
      animations: { durations: {}, easings: {}, transitions: {} }
    };

    // 從 JSON 檔案提取
    if (importResult.projectData) {
      tokens = this.tokenExtractor.extractFromFigmaJson(importResult.projectData);
    }

    // 從圖片資產補充
    for (const asset of processedAssets) {
      if (asset.file.processedData && typeof asset.file.processedData === 'object' && 'dominantColors' in asset.file.processedData) {
        const imageTokens = this.tokenExtractor.extractColorsFromImage(
          asset.file.processedData as any,
          asset.file.processedData.dominantColors
        );
        Object.assign(tokens.colors.custom, imageTokens.custom || {});
      }
    }

    const components = this.buildComponentLibrary(processedAssets);
    const patterns = this.identifyDesignPatterns(processedAssets);
    const guidelines = this.generateDesignGuidelines(tokens, components, patterns);

    return {
      tokens,
      components,
      patterns,
      guidelines
    };
  }

  /**
   * 代碼生成計劃
   */
  private async planCodeGeneration(
    dimensions: DimensionalAnalysis, 
    designSystem: DesignSystemAnalysis
  ): Promise<CodeGenerationPlan> {
    const frameworks = this.planFrameworks(dimensions, designSystem);
    const architecture = this.planArchitecture(dimensions, frameworks);
    const timeline = this.createTimeline(frameworks, architecture);
    const resources = this.calculateResources(frameworks, timeline);

    return {
      frameworks,
      architecture,
      timeline,
      resources
    };
  }

  /**
   * 智能建議生成
   */
  private async generateRecommendations(
    dimensions: DimensionalAnalysis,
    assets: ProcessedAssetAnalysis[],
    designSystem: DesignSystemAnalysis,
    codeGeneration: CodeGenerationPlan
  ): Promise<SmartRecommendation[]> {
    const recommendations: SmartRecommendation[] = [];

    // 性能優化建議
    recommendations.push(...this.generatePerformanceRecommendations(assets));
    
    // 無障礙建議
    recommendations.push(...this.generateAccessibilityRecommendations(assets));
    
    // 代碼質量建議
    recommendations.push(...this.generateCodeQualityRecommendations(codeGeneration));
    
    // 設計系統建議
    recommendations.push(...this.generateDesignSystemRecommendations(designSystem));
    
    // 維護性建議
    recommendations.push(...this.generateMaintainabilityRecommendations(dimensions));

    return recommendations.sort((a, b) => {
      const impactOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  // ===== 輔助方法 =====

  private normalizeDistribution(counts: Record<string, number>): Record<string, number> {
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const normalized: Record<string, number> = {};
    
    Object.entries(counts).forEach(([key, count]) => {
      normalized[key] = Math.round((count / total) * 100) / 100;
    });
    
    return normalized;
  }

  private determineResponsiveStrategy(distribution: Record<string, number>): ResponsiveStrategy {
    const mobileRatio = distribution.mobile || 0;
    const desktopRatio = distribution.desktop || 0;
    
    if (mobileRatio > 0.6) {
      return {
        approach: 'mobile-first',
        reasoning: '移動端資產佔多數，建議採用移動優先策略',
        recommendations: [
          '從最小螢幕開始設計',
          '使用漸進增強方式',
          '優化觸控交互'
        ]
      };
    } else if (desktopRatio > 0.6) {
      return {
        approach: 'desktop-first',
        reasoning: '桌面端資產佔多數，建議採用桌面優先策略',
        recommendations: [
          '從大螢幕開始設計',
          '使用優雅降級方式',
          '優化鍵盤導航'
        ]
      };
    } else {
      return {
        approach: 'adaptive',
        reasoning: '多設備資產分佈均勻，建議採用自適應策略',
        recommendations: [
          '針對不同設備定制體驗',
          '使用容器查詢',
          '實現漸進式Web應用'
        ]
      };
    }
  }

  private suggestBreakpoints(distribution: Record<string, number>): BreakpointSuggestion[] {
    const suggestions: BreakpointSuggestion[] = [];
    
    if (distribution.mobile > 0) {
      suggestions.push({
        device: 'mobile',
        width: 375,
        priority: 'high',
        reasoning: '主流移動設備寬度'
      });
    }
    
    if (distribution.tablet > 0) {
      suggestions.push({
        device: 'tablet',
        width: 768,
        priority: 'medium',
        reasoning: '平板設備標準寬度'
      });
    }
    
    if (distribution.desktop > 0) {
      suggestions.push({
        device: 'desktop',
        width: 1024,
        priority: 'high',
        reasoning: '桌面設備最小寬度'
      });
    }
    
    return suggestions;
  }

  private assessDeviceCompatibility(assets: ParsedAssetInfo[]): DeviceCompatibility {
    const hasModernFeatures = assets.some(asset => 
      asset.format === 'svg' || asset.confidence > 0.8
    );
    
    return {
      modern: hasModernFeatures,
      legacy: !hasModernFeatures,
      touch: assets.some(asset => asset.device === 'mobile' || asset.device === 'tablet'),
      voice: false, // 需要更深入的分析
      issues: hasModernFeatures ? [] : ['部分資產可能不支援舊瀏覽器']
    };
  }

  private groupAssetsByModule(assets: ParsedAssetInfo[]): Record<string, ParsedAssetInfo[]> {
    const groups: Record<string, ParsedAssetInfo[]> = {};
    
    assets.forEach(asset => {
      if (!groups[asset.module]) {
        groups[asset.module] = [];
      }
      groups[asset.module].push(asset);
    });
    
    return groups;
  }

  private async analyzeModuleStructures(moduleGroups: Record<string, ParsedAssetInfo[]>): Promise<ModuleStructure[]> {
    const modules: ModuleStructure[] = [];
    
    Object.entries(moduleGroups).forEach(([moduleName, assets]) => {
      const componentCounts = this.countComponentTypes(assets);
      
      modules.push({
        name: moduleName,
        type: this.inferModuleType(moduleName, assets),
        components: componentCounts,
        complexity: this.calculateModuleComplexity(assets),
        priority: this.calculateModulePriority(moduleName, assets),
        estimatedHours: this.estimateModuleHours(componentCounts)
      });
    });
    
    return modules;
  }

  private countComponentTypes(assets: ParsedAssetInfo[]): ComponentCount {
    const byType: Record<string, number> = {};
    
    assets.forEach(asset => {
      const type = this.inferComponentType(asset);
      byType[type] = (byType[type] || 0) + 1;
    });
    
    return {
      total: assets.length,
      byType,
      unique: Object.keys(byType).length,
      reusable: Math.floor(assets.length * 0.3) // 估算可重用組件數
    };
  }

  private inferModuleType(moduleName: string, assets: ParsedAssetInfo[]): string {
    if (moduleName.includes('auth') || moduleName.includes('login')) return 'authentication';
    if (moduleName.includes('dashboard')) return 'analytics';
    if (moduleName.includes('user')) return 'user-management';
    if (moduleName.includes('commerce')) return 'e-commerce';
    return 'general';
  }

  private calculateModuleComplexity(assets: ParsedAssetInfo[]): number {
    let complexity = 0;
    
    // 基於資產數量
    complexity += Math.min(assets.length / 10, 1) * 0.3;
    
    // 基於狀態數量
    const states = new Set(assets.map(a => a.state));
    complexity += Math.min(states.size / 5, 1) * 0.3;
    
    // 基於設備支援
    const devices = new Set(assets.map(a => a.device));
    complexity += Math.min(devices.size / 3, 1) * 0.4;
    
    return Math.round(complexity * 100) / 100;
  }

  private calculateModulePriority(moduleName: string, assets: ParsedAssetInfo[]): number {
    let priority = 0.5; // 基礎優先級
    
    // 核心模組
    if (['auth', 'dashboard', 'user'].some(core => moduleName.includes(core))) {
      priority += 0.3;
    }
    
    // 資產數量影響
    priority += Math.min(assets.length / 20, 0.2);
    
    return Math.min(priority, 1);
  }

  private estimateModuleHours(componentCounts: ComponentCount): number {
    const baseHours = 2; // 每個組件的基礎時間
    const complexityMultiplier = 1 + (componentCounts.unique / componentCounts.total);
    
    return Math.round(componentCounts.total * baseHours * complexityMultiplier);
  }

  private inferComponentType(asset: ParsedAssetInfo): string {
    if (asset.page === 'form') return 'form-component';
    if (asset.page === 'list') return 'list-component';
    if (asset.state === 'loading') return 'loading-component';
    if (asset.module === 'navigation') return 'navigation-component';
    return 'generic-component';
  }

  private identifyModuleDependencies(modules: ModuleStructure[]): ModuleDependency[] {
    const dependencies: ModuleDependency[] = [];
    
    // 簡化的依賴識別邏輯
    modules.forEach(module => {
      if (module.name === 'auth') {
        modules.forEach(other => {
          if (other.name !== 'auth') {
            dependencies.push({
              from: other.name,
              to: 'auth',
              type: 'data-flow',
              strength: 0.8
            });
          }
        });
      }
    });
    
    return dependencies;
  }

  private suggestArchitecturePattern(modules: ModuleStructure[]): ArchitecturePattern {
    const moduleCount = modules.length;
    const avgComplexity = modules.reduce((sum, m) => sum + m.complexity, 0) / moduleCount;
    
    if (moduleCount > 10 && avgComplexity > 0.7) {
      return {
        primary: 'Micro-frontend',
        supporting: ['Module Federation', 'Domain-driven Design'],
        suitability: 0.9,
        recommendations: [
          '使用模組聯邦實現獨立部署',
          '建立清晰的模組邊界',
          '實現跨模組通訊機制'
        ]
      };
    } else if (moduleCount > 5) {
      return {
        primary: 'Feature-based',
        supporting: ['Barrel Exports', 'Lazy Loading'],
        suitability: 0.8,
        recommendations: [
          '按功能組織代碼結構',
          '使用懶加載優化性能',
          '建立共享組件庫'
        ]
      };
    } else {
      return {
        primary: 'Monolithic',
        supporting: ['Component Library', 'Design System'],
        suitability: 0.7,
        recommendations: [
          '建立統一的設計系統',
          '實現組件重用',
          '保持代碼結構清晰'
        ]
      };
    }
  }

  private assessScalability(modules: ModuleStructure[]): ScalabilityAssessment {
    const totalReusable = modules.reduce((sum, m) => sum + m.components.reusable, 0);
    const totalComponents = modules.reduce((sum, m) => sum + m.components.total, 0);
    
    const componentReusability = totalReusable / totalComponents;
    const moduleIndependence = this.calculateModuleIndependence(modules);
    const maintainability = this.calculateMaintainability(modules);
    const testability = this.calculateTestability(modules);
    
    return {
      componentReusability,
      moduleIndependence,
      maintainability,
      testability,
      issues: this.identifyScalabilityIssues(modules)
    };
  }

  private calculateModuleIndependence(modules: ModuleStructure[]): number {
    // 簡化計算：模組數量越多，獨立性越高
    return Math.min(modules.length / 10, 1);
  }

  private calculateMaintainability(modules: ModuleStructure[]): number {
    const avgComplexity = modules.reduce((sum, m) => sum + m.complexity, 0) / modules.length;
    return Math.max(0, 1 - avgComplexity);
  }

  private calculateTestability(modules: ModuleStructure[]): number {
    // 基於組件重用性推算可測試性
    const reusabilityAvg = modules.reduce((sum, m) => 
      sum + (m.components.reusable / m.components.total), 0
    ) / modules.length;
    
    return reusabilityAvg;
  }

  private identifyScalabilityIssues(modules: ModuleStructure[]): string[] {
    const issues: string[] = [];
    
    const highComplexityModules = modules.filter(m => m.complexity > 0.8);
    if (highComplexityModules.length > 0) {
      issues.push(`${highComplexityModules.length} 個模組複雜度過高`);
    }
    
    const lowReusabilityModules = modules.filter(m => 
      m.components.reusable / m.components.total < 0.2
    );
    if (lowReusabilityModules.length > 0) {
      issues.push(`${lowReusabilityModules.length} 個模組重用性較低`);
    }
    
    return issues;
  }

  private groupAssetsByPage(assets: ParsedAssetInfo[]): Record<string, ParsedAssetInfo[]> {
    const groups: Record<string, ParsedAssetInfo[]> = {};
    
    assets.forEach(asset => {
      if (!groups[asset.page]) {
        groups[asset.page] = [];
      }
      groups[asset.page].push(asset);
    });
    
    return groups;
  }

  private async analyzePageStructures(pageGroups: Record<string, ParsedAssetInfo[]>): Promise<PageStructure[]> {
    const pages: PageStructure[] = [];
    
    Object.entries(pageGroups).forEach(([pageName, assets]) => {
      pages.push({
        name: pageName,
        type: this.inferPageType(pageName),
        layout: this.inferLayoutType(assets),
        sections: this.identifyPageSections(assets),
        interactions: this.identifyPageInteractions(assets),
        complexity: this.calculatePageComplexity(assets)
      });
    });
    
    return pages;
  }

  private inferPageType(pageName: string): string {
    const typeMap: Record<string, string> = {
      'list': 'listing',
      'detail': 'detail',
      'form': 'form',
      'landing': 'landing'
    };
    
    return typeMap[pageName] || 'content';
  }

  private inferLayoutType(assets: ParsedAssetInfo[]): string {
    const devices = new Set(assets.map(a => a.device));
    
    if (devices.size > 2) return 'responsive-grid';
    if (devices.has('mobile')) return 'mobile-first';
    return 'desktop-standard';
  }

  private identifyPageSections(assets: ParsedAssetInfo[]): PageSection[] {
    const sections: PageSection[] = [];
    
    // 基於資產分佈推斷頁面區段
    const modules = new Set(assets.map(a => a.module));
    
    modules.forEach(module => {
      sections.push({
        name: module,
        purpose: this.inferSectionPurpose(module),
        components: assets.filter(a => a.module === module).map(a => a.originalName),
        priority: this.calculateSectionPriority(module)
      });
    });
    
    return sections;
  }

  private inferSectionPurpose(module: string): string {
    const purposeMap: Record<string, string> = {
      'user-management': '用戶相關功能',
      'dashboard': '數據展示',
      'commerce': '商務交易',
      'auth': '身份驗證',
      'content': '內容展示'
    };
    
    return purposeMap[module] || '通用功能';
  }

  private calculateSectionPriority(module: string): number {
    const priorityMap: Record<string, number> = {
      'auth': 1.0,
      'dashboard': 0.9,
      'user-management': 0.8,
      'commerce': 0.7,
      'content': 0.6
    };
    
    return priorityMap[module] || 0.5;
  }

  private identifyPageInteractions(assets: ParsedAssetInfo[]): InteractionPattern[] {
    const interactions: InteractionPattern[] = [];
    
    const states = new Set(assets.map(a => a.state));
    
    if (states.has('hover')) {
      interactions.push({
        name: 'hover-effect',
        description: '懸停效果',
        components: assets.filter(a => a.state === 'hover').map(a => a.originalName),
        states: ['default', 'hover'],
        animations: [{
          name: 'hover-transition',
          duration: 200,
          easing: 'ease-in-out',
          properties: ['opacity', 'transform']
        }]
      });
    }
    
    return interactions;
  }

  private calculatePageComplexity(assets: ParsedAssetInfo[]): number {
    let complexity = 0;
    
    // 資產數量
    complexity += Math.min(assets.length / 15, 1) * 0.4;
    
    // 狀態數量
    const states = new Set(assets.map(a => a.state));
    complexity += Math.min(states.size / 6, 1) * 0.3;
    
    // 模組數量
    const modules = new Set(assets.map(a => a.module));
    complexity += Math.min(modules.size / 4, 1) * 0.3;
    
    return Math.round(complexity * 100) / 100;
  }

  private identifyUserFlows(pages: PageStructure[]): UserFlow[] {
    const flows: UserFlow[] = [];
    
    // 簡化的用戶流程識別
    const authPages = pages.filter(p => p.name.includes('auth') || p.type === 'form');
    if (authPages.length > 0) {
      flows.push({
        name: 'authentication-flow',
        steps: [
          { page: 'login', action: 'submit-credentials', next: ['dashboard', 'profile'] },
          { page: 'dashboard', action: 'view-overview', next: ['detail-pages'] }
        ],
        complexity: 2,
        importance: 1.0
      });
    }
    
    return flows;
  }

  private analyzeNavigationPattern(pages: PageStructure[]): NavigationPattern {
    const pageNames = pages.map(p => p.name);
    
    return {
      type: this.inferNavigationType(pageNames),
      levels: this.calculateNavigationLevels(pages),
      structure: {
        primary: pageNames.slice(0, 5),
        secondary: {},
        utility: ['search', 'settings', 'help']
      }
    };
  }

  private inferNavigationType(pageNames: string[]): string {
    if (pageNames.includes('dashboard')) return 'dashboard-centric';
    if (pageNames.includes('landing')) return 'marketing-site';
    return 'application';
  }

  private calculateNavigationLevels(pages: PageStructure[]): number {
    // 基於頁面複雜度推算導航層級
    const avgComplexity = pages.reduce((sum, p) => sum + p.complexity, 0) / pages.length;
    return Math.ceil(avgComplexity * 3) + 1;
  }

  private analyzeContentStrategy(pages: PageStructure[]): ContentStrategy {
    const types = this.identifyContentTypes(pages);
    const hierarchy = this.analyzeContentHierarchy(pages);
    const accessibility = this.assessContentAccessibility(pages);
    
    return {
      types,
      hierarchy,
      accessibility
    };
  }

  private identifyContentTypes(pages: PageStructure[]): ContentType[] {
    const types: ContentType[] = [];
    
    const typeMap = new Map<string, number>();
    pages.forEach(page => {
      typeMap.set(page.type, (typeMap.get(page.type) || 0) + 1);
    });
    
    typeMap.forEach((count, type) => {
      types.push({
        name: type,
        count,
        priority: this.calculateContentTypePriority(type),
        treatment: this.suggestContentTreatment(type)
      });
    });
    
    return types;
  }

  private calculateContentTypePriority(type: string): number {
    const priorityMap: Record<string, number> = {
      'landing': 1.0,
      'form': 0.9,
      'detail': 0.8,
      'listing': 0.7,
      'content': 0.6
    };
    
    return priorityMap[type] || 0.5;
  }

  private suggestContentTreatment(type: string): string {
    const treatmentMap: Record<string, string> = {
      'landing': 'hero-focused',
      'form': 'progressive-disclosure',
      'detail': 'scannable-content',
      'listing': 'grid-layout',
      'content': 'readable-typography'
    };
    
    return treatmentMap[type] || 'standard';
  }

  private analyzeContentHierarchy(pages: PageStructure[]): ContentHierarchy {
    const avgSections = pages.reduce((sum, p) => sum + p.sections.length, 0) / pages.length;
    
    return {
      levels: Math.ceil(avgSections / 2),
      consistency: this.calculateHierarchyConsistency(pages),
      clarity: this.calculateHierarchyClarity(pages)
    };
  }

  private calculateHierarchyConsistency(pages: PageStructure[]): number {
    const sectionCounts = pages.map(p => p.sections.length);
    const avg = sectionCounts.reduce((sum, count) => sum + count, 0) / sectionCounts.length;
    const variance = sectionCounts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / sectionCounts.length;
    
    return Math.max(0, 1 - Math.sqrt(variance) / avg);
  }

  private calculateHierarchyClarity(pages: PageStructure[]): number {
    // 基於頁面複雜度的反比
    const avgComplexity = pages.reduce((sum, p) => sum + p.complexity, 0) / pages.length;
    return Math.max(0, 1 - avgComplexity);
  }

  private assessContentAccessibility(pages: PageStructure[]): ContentAccessibility {
    const hasComplexPages = pages.some(p => p.complexity > 0.7);
    
    return {
      compliance: hasComplexPages ? 'AA' : 'AAA',
      issues: hasComplexPages ? ['複雜頁面可能存在導航困難'] : [],
      improvements: [
        '添加跳轉連結',
        '使用語義化標籤',
        '提供替代文字'
      ]
    };
  }

  private groupAssetsByState(assets: ParsedAssetInfo[]): Record<string, ParsedAssetInfo[]> {
    const groups: Record<string, ParsedAssetInfo[]> = {};
    
    assets.forEach(asset => {
      if (!groups[asset.state]) {
        groups[asset.state] = [];
      }
      groups[asset.state].push(asset);
    });
    
    return groups;
  }

  private identifyStatePatterns(stateGroups: Record<string, ParsedAssetInfo[]>): StatePattern[] {
    const patterns: StatePattern[] = [];
    
    Object.entries(stateGroups).forEach(([stateName, assets]) => {
      if (stateName !== 'default') {
        patterns.push({
          name: stateName,
          components: assets.map(a => a.originalName),
          complexity: this.calculateStateComplexity(assets),
          frequency: this.calculateStateFrequency(stateName, assets)
        });
      }
    });
    
    return patterns;
  }

  private calculateStateComplexity(assets: ParsedAssetInfo[]): number {
    const devices = new Set(assets.map(a => a.device));
    const modules = new Set(assets.map(a => a.module));
    
    return Math.min((devices.size * modules.size) / 10, 1);
  }

  private calculateStateFrequency(stateName: string, assets: ParsedAssetInfo[]): number {
    const frequencyMap: Record<string, number> = {
      'hover': 0.8,
      'active': 0.6,
      'loading': 0.4,
      'error': 0.2,
      'success': 0.3
    };
    
    return frequencyMap[stateName] || 0.1;
  }

  private mapStateTransitions(states: StatePattern[]): StateTransition[] {
    const transitions: StateTransition[] = [];
    
    // 常見的狀態轉換
    if (states.some(s => s.name === 'loading')) {
      transitions.push({
        from: 'default',
        to: 'loading',
        trigger: 'user-action',
        animation: 'fade-in'
      });
      
      if (states.some(s => s.name === 'success')) {
        transitions.push({
          from: 'loading',
          to: 'success',
          trigger: 'data-loaded',
          animation: 'slide-up'
        });
      }
    }
    
    return transitions;
  }

  private suggestStateManagement(states: StatePattern[]): StateManagementStrategy {
    const complexity = states.reduce((sum, s) => sum + s.complexity, 0) / states.length;
    
    if (complexity > 0.7) {
      return {
        approach: 'centralized',
        tools: ['Redux', 'Zustand', 'Valtio'],
        complexity,
        recommendations: [
          '使用狀態管理庫',
          '實現時間旅行除錯',
          '建立狀態正規化'
        ]
      };
    } else {
      return {
        approach: 'local',
        tools: ['useState', 'useReducer', 'SWR'],
        complexity,
        recommendations: [
          '使用本地狀態管理',
          '合理提升狀態',
          '使用資料獲取庫'
        ]
      };
    }
  }

  private planStateTesting(states: StatePattern[]): StateTestingPlan {
    return {
      strategies: ['unit-testing', 'integration-testing', 'visual-regression'],
      coverage: Math.min(states.length * 20, 100),
      tools: ['Jest', 'React Testing Library', 'Playwright']
    };
  }

  private analyzeSemanticMeaning(
    file: ProcessedFigmaFile, 
    visualAnalysis: VisualAnalysisResult
  ): SemanticAnalysis {
    return {
      purpose: this.inferPurpose(file.parsedInfo, visualAnalysis),
      userJourney: this.inferUserJourney(file.parsedInfo),
      businessValue: this.calculateBusinessValue(file.parsedInfo),
      technicalDebt: this.calculateTechnicalDebt(visualAnalysis),
      maintainabilityScore: this.calculateMaintainabilityScore(visualAnalysis)
    };
  }

  private inferPurpose(parsedInfo: ParsedAssetInfo, visualAnalysis: VisualAnalysisResult): string {
    const purposeMap: Record<string, string> = {
      'form': '數據收集和處理',
      'list': '信息瀏覽和篩選',
      'detail': '詳細信息展示',
      'landing': '產品介紹和轉換'
    };
    
    return purposeMap[parsedInfo.page] || '通用界面組件';
  }

  private inferUserJourney(parsedInfo: ParsedAssetInfo): string {
    const journeyMap: Record<string, string> = {
      'auth': '用戶身份驗證流程',
      'dashboard': '數據監控和分析',
      'commerce': '購買決策流程',
      'user-management': '個人資料管理'
    };
    
    return journeyMap[parsedInfo.module] || '基礎用戶交互';
  }

  private calculateBusinessValue(parsedInfo: ParsedAssetInfo): number {
    let value = 0.5; // 基礎值
    
    // 模組重要性
    const moduleValues: Record<string, number> = {
      'commerce': 0.9,
      'auth': 0.8,
      'dashboard': 0.7,
      'user-management': 0.6
    };
    
    value += (moduleValues[parsedInfo.module] || 0.3) * 0.5;
    
    return Math.min(value, 1);
  }

  private calculateTechnicalDebt(visualAnalysis: VisualAnalysisResult): number {
    let debt = 0;
    
    // 無障礙問題
    debt += visualAnalysis.accessibility.issues.length * 0.1;
    
    // 設計一致性問題
    if (visualAnalysis.layout.spacing.consistency < 0.7) {
      debt += 0.2;
    }
    
    return Math.min(debt, 1);
  }

  private calculateMaintainabilityScore(visualAnalysis: VisualAnalysisResult): number {
    let score = 1;
    
    // 組件複雜度
    const avgComplexity = visualAnalysis.components.length > 0 
      ? visualAnalysis.components.reduce((sum, c) => sum + (c.boundingBox.confidence || 0), 0) / visualAnalysis.components.length
      : 0.5;
    
    score -= (1 - avgComplexity) * 0.3;
    
    // 設計模式清晰度
    score -= (1 - visualAnalysis.confidence) * 0.2;
    
    return Math.max(score, 0);
  }

  private generateTechnicalSpecs(
    file: ProcessedFigmaFile, 
    visualAnalysis: VisualAnalysisResult
  ): TechnicalSpecification {
    return {
      estimatedComplexity: this.estimateImplementationComplexity(visualAnalysis),
      requiredSkills: this.identifyRequiredSkills(visualAnalysis),
      dependencies: this.identifyDependencies(visualAnalysis),
      performance: this.generatePerformanceSpec(visualAnalysis),
      accessibility: this.generateAccessibilitySpec(visualAnalysis)
    };
  }

  private estimateImplementationComplexity(visualAnalysis: VisualAnalysisResult): number {
    let complexity = 0;
    
    // 組件數量
    complexity += Math.min(visualAnalysis.components.length / 10, 1) * 0.4;
    
    // 交互複雜度
    const interactiveComponents = visualAnalysis.components.filter(c => 
      c.interactions.length > 0
    );
    complexity += Math.min(interactiveComponents.length / 5, 1) * 0.3;
    
    // 響應式複雜度
    complexity += Math.min(visualAnalysis.responsiveness.breakpoints.length / 3, 1) * 0.3;
    
    return Math.round(complexity * 100) / 100;
  }

  private identifyRequiredSkills(visualAnalysis: VisualAnalysisResult): string[] {
    const skills = ['HTML', 'CSS', 'JavaScript'];
    
    if (visualAnalysis.components.some(c => c.interactions.length > 1)) {
      skills.push('Advanced JavaScript');
    }
    
    if (visualAnalysis.responsiveness.breakpoints.length > 2) {
      skills.push('Responsive Design');
    }
    
    if (visualAnalysis.accessibility.issues.length > 0) {
      skills.push('Accessibility');
    }
    
    return skills;
  }

  private identifyDependencies(visualAnalysis: VisualAnalysisResult): string[] {
    const dependencies: string[] = [];
    
    if (visualAnalysis.components.some(c => c.type === 'chart')) {
      dependencies.push('charting-library');
    }
    
    if (visualAnalysis.components.some(c => c.interactions.includes('drag'))) {
      dependencies.push('drag-and-drop-library');
    }
    
    return dependencies;
  }

  private generatePerformanceSpec(visualAnalysis: VisualAnalysisResult): PerformanceSpec {
    const componentCount = visualAnalysis.components.length;
    
    return {
      loadTime: Math.max(1, componentCount * 0.1),
      interactionLatency: Math.min(100, componentCount * 10),
      memoryUsage: `${Math.max(10, componentCount * 2)}MB`,
      optimizations: this.suggestOptimizations(visualAnalysis)
    };
  }

  private suggestOptimizations(visualAnalysis: VisualAnalysisResult): string[] {
    const optimizations: string[] = [];
    
    if (visualAnalysis.components.length > 10) {
      optimizations.push('組件懶加載');
    }
    
    if (visualAnalysis.components.some(c => c.type === 'image')) {
      optimizations.push('圖片優化');
    }
    
    return optimizations;
  }

  private generateAccessibilitySpec(visualAnalysis: VisualAnalysisResult): AccessibilitySpec {
    return {
      level: visualAnalysis.accessibility.colorContrast.compliance,
      requirements: [
        '顏色對比度符合WCAG標準',
        '鍵盤導航支援',
        '螢幕閱讀器相容'
      ],
      testing: ['axe-core', 'WAVE', 'manual-testing']
    };
  }

  private generateImplementationNotes(
    file: ProcessedFigmaFile, 
    visualAnalysis: VisualAnalysisResult
  ): ImplementationNote[] {
    const notes: ImplementationNote[] = [];
    
    // 無障礙警告
    if (visualAnalysis.accessibility.issues.length > 0) {
      notes.push({
        type: 'warning',
        message: `發現 ${visualAnalysis.accessibility.issues.length} 個無障礙問題`,
        priority: 0.8,
        frameworks: ['all']
      });
    }
    
    // 性能提示
    if (visualAnalysis.components.length > 15) {
      notes.push({
        type: 'tip',
        message: '考慮使用虛擬化技術優化大量組件渲染',
        priority: 0.6,
        frameworks: ['react', 'vue']
      });
    }
    
    return notes;
  }

  private buildComponentLibrary(assets: ProcessedAssetAnalysis[]): ComponentLibrary {
    const atomic: AtomicComponent[] = [];
    const molecular: MolecularComponent[] = [];
    const organisms: OrganismComponent[] = [];
    const templates: TemplateComponent[] = [];
    
    // 從視覺分析中提取組件
    assets.forEach(asset => {
      asset.visualAnalysis.components.forEach(component => {
        if (this.isAtomicComponent(component.type)) {
          atomic.push(this.createAtomicComponent(component));
        }
      });
    });
    
    return {
      atomic,
      molecular,
      organisms,
      templates
    };
  }

  private isAtomicComponent(type: string): boolean {
    const atomicTypes = ['button', 'input', 'icon', 'text', 'image'];
    return atomicTypes.includes(type);
  }

  private createAtomicComponent(component: any): AtomicComponent {
    return {
      name: component.type,
      type: 'atomic',
      variants: [{
        name: 'default',
        properties: component.properties,
        preview: ''
      }],
      usage: {
        frequency: 0.8,
        contexts: ['forms', 'navigation', 'content'],
        examples: ['登入按鈕', '搜尋輸入框']
      }
    };
  }

  private identifyDesignPatterns(assets: ProcessedAssetAnalysis[]): DesignPatternLibrary {
    const interaction: InteractionPattern[] = [];
    const layout: LayoutPattern[] = [];
    const navigation: NavigationPatternDetail[] = [];
    const feedback: FeedbackPattern[] = [];
    
    // 從視覺分析中提取模式
    assets.forEach(asset => {
      asset.visualAnalysis.patterns.forEach(pattern => {
        if (pattern.type === 'interaction') {
          interaction.push({
            name: pattern.name,
            description: pattern.description,
            components: [],
            states: ['default', 'active'],
            animations: []
          });
        }
      });
    });
    
    return {
      interaction,
      layout,
      navigation,
      feedback
    };
  }

  private generateDesignGuidelines(
    tokens: DesignTokens,
    components: ComponentLibrary,
    patterns: DesignPatternLibrary
  ): DesignGuidelines {
    return {
      spacing: {
        system: 'modular-scale',
        rules: ['使用8px基準網格', '保持垂直韻律', '組件間距一致'],
        examples: ['按鈕內邊距: 12px 24px', '卡片間距: 16px']
      },
      typography: {
        scale: 'minor-third',
        hierarchy: ['h1: 32px', 'h2: 24px', 'h3: 20px', 'body: 16px'],
        pairing: ['Inter + JetBrains Mono']
      },
      color: {
        palette: 'semantic-driven',
        usage: {
          'primary': '主要行動按鈕',
          'secondary': '次要行動按鈕',
          'neutral': '文字和邊框'
        },
        accessibility: ['確保4.5:1對比度', '不依賴顏色傳達信息']
      },
      accessibility: {
        standards: ['WCAG 2.1 AA'],
        requirements: ['鍵盤導航', '螢幕閱讀器', '顏色對比度'],
        testing: ['自動化測試', '手動測試', '用戶測試']
      }
    };
  }

  private planFrameworks(
    dimensions: DimensionalAnalysis,
    designSystem: DesignSystemAnalysis
  ): FrameworkPlan[] {
    const frameworks: FrameworkPlan[] = [];
    
    // Vue
    frameworks.push({
      name: 'Vue',
      priority: 1,
      complexity: this.calculateFrameworkComplexity('vue', dimensions),
      features: [
        { name: 'Component Library', status: 'planned', effort: 40, dependencies: [] },
        { name: 'Design System', status: 'planned', effort: 30, dependencies: ['Component Library'] },
        { name: 'Responsive Layout', status: 'planned', effort: 25, dependencies: [] }
      ],
      dependencies: ['vue', 'vuex', 'vue-router'],
      timeline: '8-10 週'
    });
    
    // React
    frameworks.push({
      name: 'React',
      priority: 2,
      complexity: this.calculateFrameworkComplexity('react', dimensions),
      features: [
        { name: 'Component Library', status: 'planned', effort: 35, dependencies: [] },
        { name: 'State Management', status: 'planned', effort: 20, dependencies: [] },
        { name: 'Responsive Design', status: 'planned', effort: 25, dependencies: [] }
      ],
      dependencies: ['react', 'react-dom', 'styled-components'],
      timeline: '7-9 週'
    });
    
    return frameworks;
  }

  private calculateFrameworkComplexity(framework: string, dimensions: DimensionalAnalysis): number {
    let complexity = 0;
    
    // 模組複雜度
    complexity += dimensions.module.modules.reduce((sum, m) => sum + m.complexity, 0) / dimensions.module.modules.length;
    
    // 響應式複雜度
    complexity += Math.min(dimensions.device.breakpoints.length / 4, 1) * 0.3;
    
    // 狀態管理複雜度
    complexity += dimensions.state.management.complexity * 0.4;
    
    return Math.round(complexity * 100) / 100;
  }

  private planArchitecture(dimensions: DimensionalAnalysis, frameworks: FrameworkPlan[]): ArchitecturePlan {
    return {
      pattern: dimensions.module.architecture.primary,
      structure: {
        directories: [
          { path: 'src/components', purpose: '可重用組件', contents: ['atoms', 'molecules', 'organisms'] },
          { path: 'src/pages', purpose: '頁面組件', contents: ['Home', 'Dashboard', 'Profile'] },
          { path: 'src/assets', purpose: '靜態資源', contents: ['images', 'icons', 'fonts'] }
        ],
        files: [
          { name: 'main.js', purpose: '應用入口點', template: 'vue-app-entry' },
          { name: 'App.vue', purpose: '根組件', template: 'vue-root-component' }
        ],
        naming: {
          files: 'kebab-case',
          components: 'PascalCase',
          variables: 'camelCase',
          functions: 'camelCase'
        }
      },
      conventions: [
        {
          category: 'component',
          rules: ['單一職責原則', 'props向下，事件向上', '使用TypeScript'],
          examples: ['<BaseButton type="primary">', 'emit("update:value", newValue)']
        }
      ],
      tooling: {
        bundler: 'Vite',
        testing: ['Vitest', 'Cypress'],
        linting: ['ESLint', 'Prettier'],
        formatting: ['Prettier', 'EditorConfig']
      }
    };
  }

  private createTimeline(frameworks: FrameworkPlan[], architecture: ArchitecturePlan): DevelopmentTimeline {
    const phases: DevelopmentPhase[] = [
      {
        name: 'Setup & Architecture',
        duration: '1-2 週',
        tasks: [
          { name: '專案初始化', effort: 8, skills: ['Frontend'], dependencies: [] },
          { name: '工具鏈配置', effort: 12, skills: ['DevOps'], dependencies: ['專案初始化'] }
        ],
        deliverables: ['專案結構', '開發環境', 'CI/CD配置']
      },
      {
        name: 'Core Components',
        duration: '3-4 週',
        tasks: [
          { name: '基礎組件開發', effort: 40, skills: ['Frontend', 'Design'], dependencies: [] },
          { name: '設計系統實現', effort: 30, skills: ['Frontend'], dependencies: ['基礎組件開發'] }
        ],
        deliverables: ['組件庫', '設計令牌', 'Storybook']
      }
    ];
    
    const milestones: Milestone[] = [
      {
        name: 'MVP完成',
        date: '第6週',
        deliverables: ['核心功能', '基礎組件', '響應式佈局'],
        criteria: ['所有測試通過', '無障礙檢查', '性能基準達標']
      }
    ];
    
    return {
      phases,
      milestones,
      totalDuration: '8-12 週'
    };
  }

  private calculateResources(frameworks: FrameworkPlan[], timeline: DevelopmentTimeline): ResourceRequirement[] {
    return [
      {
        type: 'human',
        name: '前端開發工程師',
        quantity: 2,
        duration: '8-12 週',
        cost: 'NT$ 600,000 - 900,000'
      },
      {
        type: 'human',
        name: 'UI/UX 設計師',
        quantity: 1,
        duration: '4-6 週',
        cost: 'NT$ 200,000 - 300,000'
      },
      {
        type: 'tool',
        name: '設計工具授權',
        quantity: 1,
        duration: '12 個月',
        cost: 'NT$ 36,000'
      }
    ];
  }

  private generatePerformanceRecommendations(assets: ProcessedAssetAnalysis[]): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    const largeImages = assets.filter(asset => 
      asset.file.file.size > 1024 * 1024 // 1MB
    );
    
    if (largeImages.length > 0) {
      recommendations.push({
        type: 'optimization',
        category: 'performance',
        title: '圖片優化',
        description: `發現 ${largeImages.length} 個大尺寸圖片，建議進行優化`,
        impact: 'high',
        effort: 'medium',
        frameworks: ['all'],
        actions: [
          { description: '使用 WebP 格式', code: '<img src="image.webp" alt="..." />' },
          { description: '實現懶加載', code: 'loading="lazy"' }
        ]
      });
    }
    
    return recommendations;
  }

  private generateAccessibilityRecommendations(assets: ProcessedAssetAnalysis[]): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    const accessibilityIssues = assets.reduce((total, asset) => 
      total + asset.visualAnalysis.accessibility.issues.length, 0
    );
    
    if (accessibilityIssues > 0) {
      recommendations.push({
        type: 'best-practice',
        category: 'accessibility',
        title: '無障礙改善',
        description: `總共發現 ${accessibilityIssues} 個無障礙問題`,
        impact: 'high',
        effort: 'medium',
        frameworks: ['all'],
        actions: [
          { description: '增加 alt 屬性', code: '<img alt="描述性文字" />' },
          { description: '使用語義化標籤', code: '<button> instead of <div>' }
        ]
      });
    }
    
    return recommendations;
  }

  private generateCodeQualityRecommendations(codeGeneration: CodeGenerationPlan): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    recommendations.push({
      type: 'best-practice',
      category: 'code-quality',
      title: '代碼規範',
      description: '建立一致的代碼風格和規範',
      impact: 'medium',
      effort: 'low',
      frameworks: ['all'],
      actions: [
        { description: '配置 ESLint', resources: ['eslint-config'] },
        { description: '使用 Prettier', resources: ['prettier-config'] }
      ]
    });
    
    return recommendations;
  }

  private generateDesignSystemRecommendations(designSystem: DesignSystemAnalysis): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    if (Object.keys(designSystem.tokens.colors.custom).length > 20) {
      recommendations.push({
        type: 'warning',
        category: 'design-system',
        title: '顏色令牌過多',
        description: '建議整理並減少顏色令牌數量',
        impact: 'medium',
        effort: 'high',
        frameworks: ['all'],
        actions: [
          { description: '建立顏色語義系統' },
          { description: '移除重複顏色' }
        ]
      });
    }
    
    return recommendations;
  }

  private generateMaintainabilityRecommendations(dimensions: DimensionalAnalysis): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    
    if (dimensions.module.scalability.maintainability < 0.7) {
      recommendations.push({
        type: 'enhancement',
        category: 'maintainability',
        title: '提高可維護性',
        description: '當前架構的可維護性評分較低',
        impact: 'high',
        effort: 'high',
        frameworks: ['all'],
        actions: [
          { description: '重構大型組件' },
          { description: '增加單元測試覆蓋率' }
        ]
      });
    }
    
    return recommendations;
  }

  private generateOverview(
    importResult: FigmaImportResult,
    dimensions: DimensionalAnalysis,
    designSystem: DesignSystemAnalysis
  ): AnalysisOverview {
    return {
      projectName: this.inferProjectName(importResult),
      totalAssets: importResult.files.length,
      detectedFrameworks: ['Vue', 'React', 'React Native', 'Flutter'],
      primaryDevices: Object.keys(dimensions.device.distribution),
      mainModules: dimensions.module.modules.map(m => m.name),
      designComplexity: this.assessDesignComplexity(dimensions),
      estimatedDevelopmentTime: this.estimateDevelopmentTime(dimensions)
    };
  }

  private inferProjectName(importResult: FigmaImportResult): string {
    if (importResult.projectData?.name) {
      return importResult.projectData.name;
    }
    
    const firstFile = importResult.files[0];
    if (firstFile) {
      return firstFile.file.name.split('.')[0] || 'Untitled Project';
    }
    
    return 'Figma Import Project';
  }

  private assessDesignComplexity(dimensions: DimensionalAnalysis): 'simple' | 'moderate' | 'complex' | 'enterprise' {
    const moduleCount = dimensions.module.modules.length;
    const avgComplexity = dimensions.module.modules.reduce((sum, m) => sum + m.complexity, 0) / moduleCount;
    
    if (moduleCount > 15 && avgComplexity > 0.8) return 'enterprise';
    if (moduleCount > 8 && avgComplexity > 0.6) return 'complex';
    if (moduleCount > 4 && avgComplexity > 0.4) return 'moderate';
    return 'simple';
  }

  private estimateDevelopmentTime(dimensions: DimensionalAnalysis): string {
    const totalHours = dimensions.module.modules.reduce((sum, m) => sum + m.estimatedHours, 0);
    const weeks = Math.ceil(totalHours / 40); // 假設每週40小時
    
    return `${weeks}-${weeks + 2} 週`;
  }

  private calculateOverallConfidence(
    importResult: FigmaImportResult,
    dimensions: DimensionalAnalysis,
    assets: ProcessedAssetAnalysis[],
    designSystem: DesignSystemAnalysis
  ): OverallConfidence {
    const parsing = importResult.summary.averageConfidence;
    const analysis = assets.reduce((sum, a) => sum + a.visualAnalysis.confidence, 0) / assets.length;
    const recommendations = 0.8; // 基於建議質量的固定值
    const codeGeneration = dimensions.module.architecture.suitability;
    
    const overall = (parsing + analysis + recommendations + codeGeneration) / 4;
    
    return {
      parsing,
      analysis,
      recommendations,
      codeGeneration,
      overall: Math.round(overall * 100) / 100,
      factors: [
        { name: '檔案解析準確度', score: parsing, reasoning: '基於檔名智能解析的成功率' },
        { name: '視覺分析可信度', score: analysis, reasoning: '組件識別和佈局分析的準確性' },
        { name: '建議相關性', score: recommendations, reasoning: '智能建議的實用性和可行性' },
        { name: '代碼生成可行性', score: codeGeneration, reasoning: '架構建議的適用性' }
      ]
    };
  }
}