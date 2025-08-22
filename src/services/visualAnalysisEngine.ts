/**
 * 基礎視覺分析引擎
 * 智能分析圖片內容，識別UI組件、佈局結構和設計模式
 */

export interface VisualAnalysisResult {
  layout: LayoutAnalysis;
  components: ComponentAnalysis[];
  patterns: DesignPattern[];
  structure: StructureAnalysis;
  accessibility: AccessibilityAnalysis;
  responsiveness: ResponsivenessAnalysis;
  confidence: number;
}

export interface LayoutAnalysis {
  type: LayoutType;
  grid: GridInfo;
  hierarchy: VisualHierarchy;
  spacing: SpacingAnalysis;
  alignment: AlignmentInfo;
}

export type LayoutType = 'grid' | 'flexbox' | 'absolute' | 'float' | 'table' | 'masonry' | 'unknown';

export interface GridInfo {
  columns: number;
  rows: number;
  gaps: { horizontal: number; vertical: number };
  gutters: { left: number; right: number };
}

export interface VisualHierarchy {
  primary: BoundingBox[];
  secondary: BoundingBox[];
  tertiary: BoundingBox[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface SpacingAnalysis {
  margins: number[];
  paddings: number[];
  gaps: number[];
  consistency: number; // 0-1
}

export interface AlignmentInfo {
  horizontal: AlignmentType[];
  vertical: AlignmentType[];
  baseline: BoundingBox[];
}

export type AlignmentType = 'left' | 'center' | 'right' | 'justify' | 'top' | 'middle' | 'bottom' | 'baseline';

export interface ComponentAnalysis {
  type: ComponentType;
  boundingBox: BoundingBox;
  properties: ComponentProperties;
  states: ComponentState[];
  interactions: InteractionType[];
  semanticRole: SemanticRole;
}

export type ComponentType = 
  | 'button' | 'input' | 'select' | 'checkbox' | 'radio' | 'switch' | 'slider'
  | 'card' | 'modal' | 'tooltip' | 'dropdown' | 'accordion' | 'tabs' | 'carousel'
  | 'navigation' | 'sidebar' | 'header' | 'footer' | 'breadcrumb' | 'pagination'
  | 'table' | 'list' | 'grid' | 'calendar' | 'chart' | 'progress' | 'badge'
  | 'avatar' | 'icon' | 'image' | 'video' | 'text' | 'heading' | 'paragraph'
  | 'form' | 'search' | 'filter' | 'toolbar' | 'statusbar' | 'unknown';

export interface ComponentProperties {
  size: ComponentSize;
  color: ComponentColor;
  typography: ComponentTypography;
  spacing: ComponentSpacing;
  borders: ComponentBorder;
  effects: ComponentEffect;
  state: ComponentState;
}

export interface ComponentSize {
  width: number;
  height: number;
  scale: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface ComponentColor {
  background: string;
  foreground: string;
  border: string;
  accent: string;
}

export interface ComponentTypography {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: string;
}

export interface ComponentSpacing {
  padding: { top: number; right: number; bottom: number; left: number };
  margin: { top: number; right: number; bottom: number; left: number };
}

export interface ComponentBorder {
  width: number;
  style: string;
  radius: number;
  color: string;
}

export interface ComponentEffect {
  shadow: string;
  blur: number;
  opacity: number;
  transform: string;
}

export type ComponentState = 'default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading' | 'error' | 'success';

export type InteractionType = 'click' | 'hover' | 'focus' | 'drag' | 'scroll' | 'pinch' | 'swipe' | 'none';

export type SemanticRole = 'button' | 'link' | 'heading' | 'text' | 'image' | 'form' | 'navigation' | 'main' | 'aside' | 'header' | 'footer' | 'section' | 'article' | 'list' | 'listitem' | 'table' | 'row' | 'cell' | 'dialog' | 'alert' | 'status' | 'progressbar' | 'slider' | 'spinbutton' | 'textbox' | 'combobox' | 'checkbox' | 'radio' | 'switch' | 'tab' | 'tabpanel' | 'menubar' | 'menu' | 'menuitem' | 'tooltip' | 'generic';

export interface DesignPattern {
  name: string;
  type: PatternType;
  elements: BoundingBox[];
  description: string;
  commonUsage: string;
  confidence: number;
}

export type PatternType = 'layout' | 'navigation' | 'content' | 'interaction' | 'feedback' | 'data-display' | 'form' | 'media';

export interface StructureAnalysis {
  sections: StructureSection[];
  flow: ContentFlow;
  relationships: ElementRelationship[];
}

export interface StructureSection {
  type: SectionType;
  boundingBox: BoundingBox;
  components: ComponentAnalysis[];
  importance: number; // 0-1
}

export type SectionType = 'header' | 'navigation' | 'main' | 'sidebar' | 'footer' | 'hero' | 'content' | 'aside' | 'modal' | 'overlay';

export interface ContentFlow {
  direction: 'ltr' | 'rtl' | 'ttb' | 'btt';
  readingPattern: 'z' | 'f' | 'gutenberg' | 'layer-cake' | 'custom';
  visualPath: BoundingBox[];
}

export interface ElementRelationship {
  parent: BoundingBox;
  children: BoundingBox[];
  siblings: BoundingBox[];
  type: RelationshipType;
}

export type RelationshipType = 'container' | 'group' | 'list' | 'table' | 'form' | 'navigation' | 'hierarchy';

export interface AccessibilityAnalysis {
  colorContrast: ContrastAnalysis;
  textReadability: ReadabilityAnalysis;
  focusOrder: FocusOrderAnalysis;
  semanticStructure: SemanticStructureAnalysis;
  issues: AccessibilityIssue[];
}

export interface ContrastAnalysis {
  ratios: ContrastRatio[];
  compliance: 'AA' | 'AAA' | 'fail';
  issues: string[];
}

export interface ContrastRatio {
  foreground: string;
  background: string;
  ratio: number;
  level: 'normal' | 'large';
}

export interface ReadabilityAnalysis {
  fontSize: number[];
  lineHeight: number[];
  lineLength: number[];
  issues: string[];
}

export interface FocusOrderAnalysis {
  tabOrder: BoundingBox[];
  logicalFlow: boolean;
  issues: string[];
}

export interface SemanticStructureAnalysis {
  headingStructure: HeadingLevel[];
  landmarks: SemanticLandmark[];
  issues: string[];
}

export interface HeadingLevel {
  level: number;
  text: string;
  boundingBox: BoundingBox;
}

export interface SemanticLandmark {
  role: SemanticRole;
  boundingBox: BoundingBox;
  label?: string;
}

export interface AccessibilityIssue {
  type: 'contrast' | 'focus' | 'semantic' | 'text' | 'structure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  element: BoundingBox;
  suggestion: string;
}

export interface ResponsivenessAnalysis {
  breakpoints: BreakpointAnalysis[];
  adaptiveElements: AdaptiveElement[];
  scalability: ScalabilityAnalysis;
}

export interface BreakpointAnalysis {
  width: number;
  layout: LayoutType;
  changes: LayoutChange[];
}

export interface LayoutChange {
  element: BoundingBox;
  property: string;
  oldValue: string;
  newValue: string;
}

export interface AdaptiveElement {
  element: BoundingBox;
  behaviors: AdaptiveBehavior[];
}

export interface AdaptiveBehavior {
  property: string;
  values: Record<string, string>; // breakpoint -> value
}

export interface ScalabilityAnalysis {
  textScaling: boolean;
  imageScaling: boolean;
  layoutFlexibility: number; // 0-1
  issues: string[];
}

export class VisualAnalysisEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * 分析圖片的視覺結構
   */
  async analyzeImage(imageFile: File): Promise<VisualAnalysisResult> {
    const imageElement = await this.loadImage(imageFile);
    const imageData = this.getImageData(imageElement);
    
    const layout = await this.analyzeLayout(imageData);
    const components = await this.analyzeComponents(imageData);
    const patterns = await this.analyzeDesignPatterns(imageData, components);
    const structure = await this.analyzeStructure(components);
    const accessibility = await this.analyzeAccessibility(imageData, components);
    const responsiveness = await this.analyzeResponsiveness(imageData, components);
    
    const confidence = this.calculateOverallConfidence([
      layout.grid.columns > 0 ? 0.8 : 0.3,
      components.length > 0 ? 0.9 : 0.2,
      patterns.length > 0 ? 0.7 : 0.4
    ]);

    return {
      layout,
      components,
      patterns,
      structure,
      accessibility,
      responsiveness,
      confidence
    };
  }

  /**
   * 載入圖片
   */
  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 獲取圖片數據
   */
  private getImageData(img: HTMLImageElement): ImageData {
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.ctx.drawImage(img, 0, 0);
    return this.ctx.getImageData(0, 0, img.width, img.height);
  }

  /**
   * 分析佈局結構
   */
  private async analyzeLayout(imageData: ImageData): Promise<LayoutAnalysis> {
    const edges = this.detectEdges(imageData);
    const grid = this.detectGrid(edges);
    const hierarchy = this.analyzeVisualHierarchy(imageData);
    const spacing = this.analyzeSpacing(edges);
    const alignment = this.analyzeAlignment(edges);

    return {
      type: this.inferLayoutType(grid, edges),
      grid,
      hierarchy,
      spacing,
      alignment
    };
  }

  /**
   * 分析組件
   */
  private async analyzeComponents(imageData: ImageData): Promise<ComponentAnalysis[]> {
    const regions = this.segmentRegions(imageData);
    const components: ComponentAnalysis[] = [];

    for (const region of regions) {
      const component = await this.analyzeRegionAsComponent(region, imageData);
      if (component) {
        components.push(component);
      }
    }

    return components.sort((a, b) => b.boundingBox.confidence - a.boundingBox.confidence);
  }

  /**
   * 分析設計模式
   */
  private async analyzeDesignPatterns(imageData: ImageData, components: ComponentAnalysis[]): Promise<DesignPattern[]> {
    const patterns: DesignPattern[] = [];

    // 檢測常見設計模式
    patterns.push(...this.detectNavigationPatterns(components));
    patterns.push(...this.detectLayoutPatterns(components));
    patterns.push(...this.detectContentPatterns(components));
    patterns.push(...this.detectInteractionPatterns(components));

    return patterns.filter(pattern => pattern.confidence > 0.5);
  }

  /**
   * 分析結構
   */
  private async analyzeStructure(components: ComponentAnalysis[]): Promise<StructureAnalysis> {
    const sections = this.identifyStructureSections(components);
    const flow = this.analyzeContentFlow(components);
    const relationships = this.analyzeElementRelationships(components);

    return {
      sections,
      flow,
      relationships
    };
  }

  /**
   * 分析無障礙性
   */
  private async analyzeAccessibility(imageData: ImageData, components: ComponentAnalysis[]): Promise<AccessibilityAnalysis> {
    const colorContrast = this.analyzeColorContrast(imageData, components);
    const textReadability = this.analyzeTextReadability(components);
    const focusOrder = this.analyzeFocusOrder(components);
    const semanticStructure = this.analyzeSemanticStructure(components);
    
    const issues = this.identifyAccessibilityIssues(colorContrast, textReadability, focusOrder, semanticStructure);

    return {
      colorContrast,
      textReadability,
      focusOrder,
      semanticStructure,
      issues
    };
  }

  /**
   * 分析響應式設計
   */
  private async analyzeResponsiveness(imageData: ImageData, components: ComponentAnalysis[]): Promise<ResponsivenessAnalysis> {
    const breakpoints = this.inferBreakpoints(imageData.width);
    const adaptiveElements = this.identifyAdaptiveElements(components);
    const scalability = this.analyzeScalability(components);

    return {
      breakpoints,
      adaptiveElements,
      scalability
    };
  }

  /**
   * 邊緣檢測
   */
  private detectEdges(imageData: ImageData): BoundingBox[] {
    // Sobel 邊緣檢測算法的簡化實現
    const edges: BoundingBox[] = [];
    const { data, width, height } = imageData;
    
    const threshold = 50; // 邊緣閾值
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        
        // 計算梯度
        const gx = this.calculateGradientX(data, i, width);
        const gy = this.calculateGradientY(data, i, width);
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        if (magnitude > threshold) {
          edges.push({
            x,
            y,
            width: 1,
            height: 1,
            confidence: Math.min(magnitude / 255, 1)
          });
        }
      }
    }
    
    return this.groupNearbyEdges(edges);
  }

  /**
   * 計算 X 方向梯度
   */
  private calculateGradientX(data: Uint8ClampedArray, i: number, width: number): number {
    const left = this.getGrayscale(data, i - 4);
    const right = this.getGrayscale(data, i + 4);
    return right - left;
  }

  /**
   * 計算 Y 方向梯度
   */
  private calculateGradientY(data: Uint8ClampedArray, i: number, width: number): number {
    const top = this.getGrayscale(data, i - width * 4);
    const bottom = this.getGrayscale(data, i + width * 4);
    return bottom - top;
  }

  /**
   * 獲取灰度值
   */
  private getGrayscale(data: Uint8ClampedArray, i: number): number {
    return (data[i] + data[i + 1] + data[i + 2]) / 3;
  }

  /**
   * 群組附近的邊緣
   */
  private groupNearbyEdges(edges: BoundingBox[]): BoundingBox[] {
    // 使用簡化的群組算法
    const grouped: BoundingBox[] = [];
    const visited = new Set<number>();
    
    for (let i = 0; i < edges.length; i++) {
      if (visited.has(i)) continue;
      
      const group = [edges[i]];
      visited.add(i);
      
      for (let j = i + 1; j < edges.length; j++) {
        if (visited.has(j)) continue;
        
        if (this.areNearby(edges[i], edges[j], 5)) {
          group.push(edges[j]);
          visited.add(j);
        }
      }
      
      if (group.length > 1) {
        grouped.push(this.mergeBoundingBoxes(group));
      }
    }
    
    return grouped;
  }

  /**
   * 檢查兩個邊界框是否相近
   */
  private areNearby(a: BoundingBox, b: BoundingBox, threshold: number): boolean {
    const distance = Math.sqrt(
      Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)
    );
    return distance <= threshold;
  }

  /**
   * 合併邊界框
   */
  private mergeBoundingBoxes(boxes: BoundingBox[]): BoundingBox {
    const minX = Math.min(...boxes.map(b => b.x));
    const minY = Math.min(...boxes.map(b => b.y));
    const maxX = Math.max(...boxes.map(b => b.x + b.width));
    const maxY = Math.max(...boxes.map(b => b.y + b.height));
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      confidence: boxes.reduce((sum, b) => sum + b.confidence, 0) / boxes.length
    };
  }

  /**
   * 檢測網格
   */
  private detectGrid(edges: BoundingBox[]): GridInfo {
    // 分析水平和垂直線條來推斷網格
    const horizontalLines = edges.filter(edge => edge.width > edge.height * 3);
    const verticalLines = edges.filter(edge => edge.height > edge.width * 3);
    
    const columns = this.countGridLines(verticalLines, 'x');
    const rows = this.countGridLines(horizontalLines, 'y');
    
    return {
      columns: columns + 1,
      rows: rows + 1,
      gaps: this.calculateGridGaps(verticalLines, horizontalLines),
      gutters: this.calculateGutters(verticalLines)
    };
  }

  /**
   * 計算網格線數量
   */
  private countGridLines(lines: BoundingBox[], axis: 'x' | 'y'): number {
    if (lines.length === 0) return 0;
    
    const positions = lines.map(line => line[axis]).sort((a, b) => a - b);
    const threshold = 20; // 最小間距閾值
    
    let count = 1;
    for (let i = 1; i < positions.length; i++) {
      if (positions[i] - positions[i - 1] > threshold) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * 計算網格間距
   */
  private calculateGridGaps(verticalLines: BoundingBox[], horizontalLines: BoundingBox[]): { horizontal: number; vertical: number } {
    const horizontalGap = this.calculateAverageGap(verticalLines, 'x');
    const verticalGap = this.calculateAverageGap(horizontalLines, 'y');
    
    return {
      horizontal: horizontalGap,
      vertical: verticalGap
    };
  }

  /**
   * 計算平均間距
   */
  private calculateAverageGap(lines: BoundingBox[], axis: 'x' | 'y'): number {
    if (lines.length < 2) return 0;
    
    const positions = lines.map(line => line[axis]).sort((a, b) => a - b);
    const gaps = [];
    
    for (let i = 1; i < positions.length; i++) {
      gaps.push(positions[i] - positions[i - 1]);
    }
    
    return gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  }

  /**
   * 計算邊距
   */
  private calculateGutters(verticalLines: BoundingBox[]): { left: number; right: number } {
    if (verticalLines.length === 0) return { left: 0, right: 0 };
    
    const leftmost = Math.min(...verticalLines.map(line => line.x));
    const rightmost = Math.max(...verticalLines.map(line => line.x));
    
    return {
      left: leftmost,
      right: this.canvas.width - rightmost
    };
  }

  /**
   * 分析視覺層次
   */
  private analyzeVisualHierarchy(imageData: ImageData): VisualHierarchy {
    const regions = this.segmentRegions(imageData);
    
    // 根據大小、位置、對比度等因素排序
    const sortedRegions = regions.sort((a, b) => {
      const aScore = this.calculateHierarchyScore(a, imageData);
      const bScore = this.calculateHierarchyScore(b, imageData);
      return bScore - aScore;
    });
    
    const total = sortedRegions.length;
    const primaryCount = Math.ceil(total * 0.2);
    const secondaryCount = Math.ceil(total * 0.3);
    
    return {
      primary: sortedRegions.slice(0, primaryCount),
      secondary: sortedRegions.slice(primaryCount, primaryCount + secondaryCount),
      tertiary: sortedRegions.slice(primaryCount + secondaryCount)
    };
  }

  /**
   * 計算層次分數
   */
  private calculateHierarchyScore(region: BoundingBox, imageData: ImageData): number {
    let score = 0;
    
    // 大小權重
    const area = region.width * region.height;
    const totalArea = imageData.width * imageData.height;
    score += (area / totalArea) * 100;
    
    // 位置權重（上方和左上角優先）
    const yPosition = region.y / imageData.height;
    const xPosition = region.x / imageData.width;
    score += (1 - yPosition) * 50;
    score += (1 - xPosition) * 20;
    
    // 置信度權重
    score += region.confidence * 30;
    
    return score;
  }

  /**
   * 區域分割
   */
  private segmentRegions(imageData: ImageData): BoundingBox[] {
    // 簡化的區域分割算法
    const regions: BoundingBox[] = [];
    const { data, width, height } = imageData;
    const visited = new Array(width * height).fill(false);
    
    for (let y = 0; y < height; y += 10) { // 取樣間隔
      for (let x = 0; x < width; x += 10) {
        const i = y * width + x;
        if (visited[i]) continue;
        
        const region = this.floodFill(data, width, height, x, y, visited);
        if (region && region.width > 20 && region.height > 20) {
          regions.push(region);
        }
      }
    }
    
    return regions;
  }

  /**
   * 洪水填充算法
   */
  private floodFill(
    data: Uint8ClampedArray, 
    width: number, 
    height: number, 
    startX: number, 
    startY: number, 
    visited: boolean[]
  ): BoundingBox | null {
    const stack = [{ x: startX, y: startY }];
    const targetColor = this.getPixelColor(data, startX, startY, width);
    const tolerance = 50;
    
    let minX = startX, maxX = startX;
    let minY = startY, maxY = startY;
    let pixelCount = 0;
    
    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      
      const i = y * width + x;
      if (visited[i]) continue;
      
      const currentColor = this.getPixelColor(data, x, y, width);
      if (!this.colorsMatch(targetColor, currentColor, tolerance)) continue;
      
      visited[i] = true;
      pixelCount++;
      
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      
      // 添加相鄰像素
      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }
    
    if (pixelCount < 100) return null; // 過濾小區域
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      confidence: Math.min(pixelCount / 1000, 1)
    };
  }

  /**
   * 獲取像素顏色
   */
  private getPixelColor(data: Uint8ClampedArray, x: number, y: number, width: number): [number, number, number] {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  }

  /**
   * 檢查顏色是否匹配
   */
  private colorsMatch(color1: [number, number, number], color2: [number, number, number], tolerance: number): boolean {
    return Math.abs(color1[0] - color2[0]) <= tolerance &&
           Math.abs(color1[1] - color2[1]) <= tolerance &&
           Math.abs(color1[2] - color2[2]) <= tolerance;
  }

  /**
   * 分析間距
   */
  private analyzeSpacing(edges: BoundingBox[]): SpacingAnalysis {
    const margins: number[] = [];
    const paddings: number[] = [];
    const gaps: number[] = [];
    
    // 分析邊緣之間的距離來推斷間距
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        const distance = this.calculateDistance(edges[i], edges[j]);
        if (distance < 100) { // 只考慮相近的元素
          gaps.push(distance);
        }
      }
    }
    
    const consistency = this.calculateSpacingConsistency(gaps);
    
    return {
      margins,
      paddings,
      gaps: gaps.sort((a, b) => a - b),
      consistency
    };
  }

  /**
   * 計算距離
   */
  private calculateDistance(a: BoundingBox, b: BoundingBox): number {
    const centerA = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
    const centerB = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    
    return Math.sqrt(
      Math.pow(centerB.x - centerA.x, 2) + Math.pow(centerB.y - centerA.y, 2)
    );
  }

  /**
   * 計算間距一致性
   */
  private calculateSpacingConsistency(gaps: number[]): number {
    if (gaps.length === 0) return 0;
    
    const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - average, 2), 0) / gaps.length;
    const standardDeviation = Math.sqrt(variance);
    
    // 標準差越小，一致性越高
    return Math.max(0, 1 - (standardDeviation / average));
  }

  /**
   * 分析對齊
   */
  private analyzeAlignment(edges: BoundingBox[]): AlignmentInfo {
    const horizontal: AlignmentType[] = [];
    const vertical: AlignmentType[] = [];
    const baseline: BoundingBox[] = [];
    
    // 檢測水平對齊
    const leftAligned = this.findAlignedElements(edges, 'x');
    const centerAligned = this.findAlignedElements(edges, 'centerX');
    const rightAligned = this.findAlignedElements(edges, 'rightX');
    
    if (leftAligned.length > 1) horizontal.push('left');
    if (centerAligned.length > 1) horizontal.push('center');
    if (rightAligned.length > 1) horizontal.push('right');
    
    // 檢測垂直對齊
    const topAligned = this.findAlignedElements(edges, 'y');
    const middleAligned = this.findAlignedElements(edges, 'centerY');
    const bottomAligned = this.findAlignedElements(edges, 'bottomY');
    
    if (topAligned.length > 1) vertical.push('top');
    if (middleAligned.length > 1) vertical.push('middle');
    if (bottomAligned.length > 1) vertical.push('bottom');
    
    return {
      horizontal,
      vertical,
      baseline
    };
  }

  /**
   * 尋找對齊的元素
   */
  private findAlignedElements(elements: BoundingBox[], alignmentType: string): BoundingBox[] {
    const tolerance = 5;
    const groups: BoundingBox[][] = [];
    
    for (const element of elements) {
      const alignmentValue = this.getAlignmentValue(element, alignmentType);
      let foundGroup = false;
      
      for (const group of groups) {
        const groupValue = this.getAlignmentValue(group[0], alignmentType);
        if (Math.abs(alignmentValue - groupValue) <= tolerance) {
          group.push(element);
          foundGroup = true;
          break;
        }
      }
      
      if (!foundGroup) {
        groups.push([element]);
      }
    }
    
    // 返回最大的對齊組
    return groups.reduce((largest, current) => 
      current.length > largest.length ? current : largest, []
    );
  }

  /**
   * 獲取對齊值
   */
  private getAlignmentValue(element: BoundingBox, alignmentType: string): number {
    switch (alignmentType) {
      case 'x': return element.x;
      case 'centerX': return element.x + element.width / 2;
      case 'rightX': return element.x + element.width;
      case 'y': return element.y;
      case 'centerY': return element.y + element.height / 2;
      case 'bottomY': return element.y + element.height;
      default: return 0;
    }
  }

  /**
   * 推斷佈局類型
   */
  private inferLayoutType(grid: GridInfo, edges: BoundingBox[]): LayoutType {
    if (grid.columns > 2 && grid.rows > 2) {
      return 'grid';
    }
    
    // 檢測是否為 flexbox 佈局
    const horizontallyAligned = this.findAlignedElements(edges, 'y');
    const verticallyAligned = this.findAlignedElements(edges, 'x');
    
    if (horizontallyAligned.length > 2 || verticallyAligned.length > 2) {
      return 'flexbox';
    }
    
    return 'unknown';
  }

  /**
   * 分析區域為組件
   */
  private async analyzeRegionAsComponent(region: BoundingBox, imageData: ImageData): Promise<ComponentAnalysis | null> {
    const type = this.inferComponentType(region, imageData);
    if (type === 'unknown') return null;
    
    const properties = this.extractComponentProperties(region, imageData);
    const states = this.inferComponentStates(region, imageData);
    const interactions = this.inferInteractionTypes(type);
    const semanticRole = this.mapToSemanticRole(type);
    
    return {
      type,
      boundingBox: region,
      properties,
      states,
      interactions,
      semanticRole
    };
  }

  /**
   * 推斷組件類型
   */
  private inferComponentType(region: BoundingBox, imageData: ImageData): ComponentType {
    const aspectRatio = region.width / region.height;
    const area = region.width * region.height;
    
    // 基於尺寸和比例的啟發式規則
    if (aspectRatio > 2 && region.height < 50) {
      return 'button';
    }
    
    if (aspectRatio > 3 && region.height < 40) {
      return 'input';
    }
    
    if (area > 10000 && aspectRatio > 0.5 && aspectRatio < 2) {
      return 'card';
    }
    
    if (region.width > imageData.width * 0.8 && region.height < 100) {
      return 'header';
    }
    
    if (region.height > imageData.height * 0.8 && region.width < 200) {
      return 'sidebar';
    }
    
    return 'unknown';
  }

  /**
   * 提取組件屬性
   */
  private extractComponentProperties(region: BoundingBox, imageData: ImageData): ComponentProperties {
    const colors = this.extractRegionColors(region, imageData);
    
    return {
      size: {
        width: region.width,
        height: region.height,
        scale: this.inferComponentScale(region)
      },
      color: colors,
      typography: this.extractTypography(region, imageData),
      spacing: this.extractSpacing(region),
      borders: this.extractBorders(region, imageData),
      effects: this.extractEffects(region, imageData),
      state: 'default'
    };
  }

  /**
   * 提取區域顏色
   */
  private extractRegionColors(region: BoundingBox, imageData: ImageData): ComponentColor {
    // 從區域中採樣顏色
    const colors = this.sampleRegionColors(region, imageData);
    
    return {
      background: colors[0] || '#ffffff',
      foreground: colors[1] || '#000000',
      border: colors[2] || '#cccccc',
      accent: colors[3] || '#3b82f6'
    };
  }

  /**
   * 採樣區域顏色
   */
  private sampleRegionColors(region: BoundingBox, imageData: ImageData): string[] {
    const { data, width } = imageData;
    const colors: Record<string, number> = {};
    const sampleSize = 10; // 採樣間隔
    
    for (let y = region.y; y < region.y + region.height; y += sampleSize) {
      for (let x = region.x; x < region.x + region.width; x += sampleSize) {
        if (x >= 0 && x < width && y >= 0 && y < imageData.height) {
          const i = (y * width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          colors[hex] = (colors[hex] || 0) + 1;
        }
      }
    }
    
    return Object.entries(colors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([color]) => color);
  }

  /**
   * 推斷組件尺寸等級
   */
  private inferComponentScale(region: BoundingBox): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
    const area = region.width * region.height;
    
    if (area < 1000) return 'xs';
    if (area < 5000) return 'sm';
    if (area < 15000) return 'md';
    if (area < 50000) return 'lg';
    return 'xl';
  }

  /**
   * 提取字體資訊
   */
  private extractTypography(region: BoundingBox, imageData: ImageData): ComponentTypography {
    // 簡化的字體分析
    return {
      fontSize: Math.max(12, Math.min(region.height / 3, 24)),
      fontWeight: 400,
      lineHeight: region.height,
      letterSpacing: 0,
      textAlign: 'left'
    };
  }

  /**
   * 提取間距資訊
   */
  private extractSpacing(region: BoundingBox): ComponentSpacing {
    const padding = Math.max(4, Math.min(region.width, region.height) * 0.1);
    
    return {
      padding: { top: padding, right: padding, bottom: padding, left: padding },
      margin: { top: 4, right: 4, bottom: 4, left: 4 }
    };
  }

  /**
   * 提取邊框資訊
   */
  private extractBorders(region: BoundingBox, imageData: ImageData): ComponentBorder {
    return {
      width: 1,
      style: 'solid',
      radius: region.height < 40 ? 4 : 8,
      color: '#cccccc'
    };
  }

  /**
   * 提取效果資訊
   */
  private extractEffects(region: BoundingBox, imageData: ImageData): ComponentEffect {
    return {
      shadow: '0 2px 4px rgba(0,0,0,0.1)',
      blur: 0,
      opacity: 1,
      transform: 'none'
    };
  }

  /**
   * 推斷組件狀態
   */
  private inferComponentStates(region: BoundingBox, imageData: ImageData): ComponentState[] {
    return ['default']; // 簡化實現
  }

  /**
   * 推斷交互類型
   */
  private inferInteractionTypes(componentType: ComponentType): InteractionType[] {
    switch (componentType) {
      case 'button':
        return ['click', 'hover', 'focus'];
      case 'input':
        return ['click', 'focus'];
      case 'card':
        return ['click', 'hover'];
      default:
        return ['none'];
    }
  }

  /**
   * 映射到語義角色
   */
  private mapToSemanticRole(componentType: ComponentType): SemanticRole {
    switch (componentType) {
      case 'button': return 'button';
      case 'input': return 'textbox';
      case 'card': return 'article';
      case 'header': return 'header';
      case 'footer': return 'footer';
      case 'navigation': return 'navigation';
      case 'sidebar': return 'aside';
      default: return 'generic';
    }
  }

  /**
   * 檢測導航模式
   */
  private detectNavigationPatterns(components: ComponentAnalysis[]): DesignPattern[] {
    const patterns: DesignPattern[] = [];
    
    // 檢測水平導航欄
    const topComponents = components.filter(c => c.boundingBox.y < 100);
    if (topComponents.length > 2) {
      const navigationElements = topComponents.filter(c => 
        c.boundingBox.width < 150 && c.boundingBox.height < 50
      );
      
      if (navigationElements.length > 2) {
        patterns.push({
          name: 'Horizontal Navigation',
          type: 'navigation',
          elements: navigationElements.map(c => c.boundingBox),
          description: '水平導航欄，包含多個導航項目',
          commonUsage: '網站頂部主導航',
          confidence: 0.8
        });
      }
    }
    
    return patterns;
  }

  /**
   * 檢測佈局模式
   */
  private detectLayoutPatterns(components: ComponentAnalysis[]): DesignPattern[] {
    const patterns: DesignPattern[] = [];
    
    // 檢測卡片網格
    const cards = components.filter(c => c.type === 'card');
    if (cards.length >= 4) {
      const cardsByRow = this.groupComponentsByRow(cards);
      if (cardsByRow.length > 1 && cardsByRow.every(row => row.length > 1)) {
        patterns.push({
          name: 'Card Grid',
          type: 'layout',
          elements: cards.map(c => c.boundingBox),
          description: '卡片網格佈局',
          commonUsage: '產品展示、內容瀏覽',
          confidence: 0.9
        });
      }
    }
    
    return patterns;
  }

  /**
   * 按行分組組件
   */
  private groupComponentsByRow(components: ComponentAnalysis[]): ComponentAnalysis[][] {
    const tolerance = 20;
    const rows: ComponentAnalysis[][] = [];
    
    const sortedComponents = components.sort((a, b) => a.boundingBox.y - b.boundingBox.y);
    
    for (const component of sortedComponents) {
      let foundRow = false;
      
      for (const row of rows) {
        const rowY = row[0].boundingBox.y;
        if (Math.abs(component.boundingBox.y - rowY) <= tolerance) {
          row.push(component);
          foundRow = true;
          break;
        }
      }
      
      if (!foundRow) {
        rows.push([component]);
      }
    }
    
    return rows;
  }

  /**
   * 檢測內容模式
   */
  private detectContentPatterns(components: ComponentAnalysis[]): DesignPattern[] {
    // 簡化實現
    return [];
  }

  /**
   * 檢測交互模式
   */
  private detectInteractionPatterns(_components: ComponentAnalysis[]): DesignPattern[] {
    // 簡化實現
    return [];
  }

  /**
   * 識別結構區段
   */
  private identifyStructureSections(components: ComponentAnalysis[]): StructureSection[] {
    const sections: StructureSection[] = [];
    
    // 識別頭部
    const headerComponents = components.filter(c => 
      c.boundingBox.y < 100 && c.boundingBox.width > 200
    );
    if (headerComponents.length > 0) {
      sections.push({
        type: 'header',
        boundingBox: this.mergeBoundingBoxes(headerComponents.map(c => c.boundingBox)),
        components: headerComponents,
        importance: 1.0
      });
    }
    
    // 識別主內容區
    const mainComponents = components.filter(c => 
      c.boundingBox.y > 100 && c.boundingBox.y < this.canvas.height - 100
    );
    if (mainComponents.length > 0) {
      sections.push({
        type: 'main',
        boundingBox: this.mergeBoundingBoxes(mainComponents.map(c => c.boundingBox)),
        components: mainComponents,
        importance: 0.9
      });
    }
    
    return sections;
  }

  /**
   * 分析內容流
   */
  private analyzeContentFlow(components: ComponentAnalysis[]): ContentFlow {
    // 簡化實現
    return {
      direction: 'ltr',
      readingPattern: 'z',
      visualPath: components.map(c => c.boundingBox)
    };
  }

  /**
   * 分析元素關係
   */
  private analyzeElementRelationships(_components: ComponentAnalysis[]): ElementRelationship[] {
    // 簡化實現
    return [];
  }

  /**
   * 分析顏色對比度
   */
  private analyzeColorContrast(_imageData: ImageData, components: ComponentAnalysis[]): ContrastAnalysis {
    const ratios: ContrastRatio[] = [];
    
    components.forEach(component => {
      const { background, foreground } = component.properties.color;
      const ratio = this.calculateContrastRatio(background, foreground);
      
      ratios.push({
        foreground,
        background,
        ratio,
        level: component.properties.typography.fontSize > 18 ? 'large' : 'normal'
      });
    });
    
    const compliance = this.determineComplianceLevel(ratios);
    const issues = this.identifyContrastIssues(ratios);
    
    return {
      ratios,
      compliance,
      issues
    };
  }

  /**
   * 計算對比度比率
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    const lum1 = this.calculateLuminance(color1);
    const lum2 = this.calculateLuminance(color2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * 計算亮度
   */
  private calculateLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Hex 轉 RGB
   */
  private hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }

  /**
   * 確定合規等級
   */
  private determineComplianceLevel(ratios: ContrastRatio[]): 'AA' | 'AAA' | 'fail' {
    const aaCompliant = ratios.every(ratio => 
      ratio.level === 'large' ? ratio.ratio >= 3 : ratio.ratio >= 4.5
    );
    
    const aaaCompliant = ratios.every(ratio => 
      ratio.level === 'large' ? ratio.ratio >= 4.5 : ratio.ratio >= 7
    );
    
    if (aaaCompliant) return 'AAA';
    if (aaCompliant) return 'AA';
    return 'fail';
  }

  /**
   * 識別對比度問題
   */
  private identifyContrastIssues(ratios: ContrastRatio[]): string[] {
    const issues: string[] = [];
    
    ratios.forEach(ratio => {
      const minRatio = ratio.level === 'large' ? 3 : 4.5;
      if (ratio.ratio < minRatio) {
        issues.push(`對比度不足: ${ratio.ratio.toFixed(2)} < ${minRatio}`);
      }
    });
    
    return issues;
  }

  /**
   * 分析文字可讀性
   */
  private analyzeTextReadability(components: ComponentAnalysis[]): ReadabilityAnalysis {
    const fontSize: number[] = [];
    const lineHeight: number[] = [];
    const lineLength: number[] = [];
    const issues: string[] = [];
    
    components.forEach(component => {
      const typo = component.properties.typography;
      fontSize.push(typo.fontSize);
      lineHeight.push(typo.lineHeight);
      
      // 估算行長度（字符數）
      const estimatedChars = component.boundingBox.width / (typo.fontSize * 0.6);
      lineLength.push(estimatedChars);
      
      // 檢查可讀性問題
      if (typo.fontSize < 12) {
        issues.push('字體過小，可能影響可讀性');
      }
      
      if (estimatedChars > 80) {
        issues.push('行長度過長，可能影響閱讀');
      }
    });
    
    return {
      fontSize,
      lineHeight,
      lineLength,
      issues
    };
  }

  /**
   * 分析焦點順序
   */
  private analyzeFocusOrder(components: ComponentAnalysis[]): FocusOrderAnalysis {
    const interactiveComponents = components.filter(c => 
      c.interactions.includes('focus') || c.interactions.includes('click')
    );
    
    // 按閱讀順序排序（從左到右，從上到下）
    const tabOrder = interactiveComponents
      .sort((a, b) => {
        if (Math.abs(a.boundingBox.y - b.boundingBox.y) < 20) {
          return a.boundingBox.x - b.boundingBox.x;
        }
        return a.boundingBox.y - b.boundingBox.y;
      })
      .map(c => c.boundingBox);
    
    const logicalFlow = this.validateFocusFlow(tabOrder);
    const issues = logicalFlow ? [] : ['焦點順序不符合邏輯流程'];
    
    return {
      tabOrder,
      logicalFlow,
      issues
    };
  }

  /**
   * 驗證焦點流
   */
  private validateFocusFlow(tabOrder: BoundingBox[]): boolean {
    // 簡化的流程驗證
    for (let i = 1; i < tabOrder.length; i++) {
      const prev = tabOrder[i - 1];
      const curr = tabOrder[i];
      
      // 檢查是否符合從左到右、從上到下的順序
      if (curr.y < prev.y - 50) {
        return false; // 不應該向上跳
      }
    }
    
    return true;
  }

  /**
   * 分析語義結構
   */
  private analyzeSemanticStructure(components: ComponentAnalysis[]): SemanticStructureAnalysis {
    const headingStructure: HeadingLevel[] = [];
    const landmarks: SemanticLandmark[] = [];
    const issues: string[] = [];
    
    components.forEach(component => {
      if (component.semanticRole === 'heading') {
        const level = this.inferHeadingLevel(component);
        headingStructure.push({
          level,
          text: '', // 實際應該從 OCR 獲取
          boundingBox: component.boundingBox
        });
      }
      
      if (this.isLandmarkRole(component.semanticRole)) {
        landmarks.push({
          role: component.semanticRole,
          boundingBox: component.boundingBox
        });
      }
    });
    
    // 檢查標題結構
    if (headingStructure.length === 0) {
      issues.push('缺少標題結構');
    }
    
    return {
      headingStructure,
      landmarks,
      issues
    };
  }

  /**
   * 推斷標題等級
   */
  private inferHeadingLevel(component: ComponentAnalysis): number {
    const fontSize = component.properties.typography.fontSize;
    
    if (fontSize >= 32) return 1;
    if (fontSize >= 24) return 2;
    if (fontSize >= 20) return 3;
    if (fontSize >= 18) return 4;
    if (fontSize >= 16) return 5;
    return 6;
  }

  /**
   * 檢查是否為地標角色
   */
  private isLandmarkRole(role: SemanticRole): boolean {
    return ['header', 'footer', 'navigation', 'main', 'aside'].includes(role);
  }

  /**
   * 識別無障礙問題
   */
  private identifyAccessibilityIssues(
    colorContrast: ContrastAnalysis,
    textReadability: ReadabilityAnalysis,
    _focusOrder: FocusOrderAnalysis,
    _semanticStructure: SemanticStructureAnalysis
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // 對比度問題
    if (colorContrast.compliance === 'fail') {
      issues.push({
        type: 'contrast',
        severity: 'high',
        description: '顏色對比度不符合 WCAG 標準',
        element: { x: 0, y: 0, width: 0, height: 0, confidence: 1 },
        suggestion: '增加前景色與背景色的對比度'
      });
    }
    
    // 文字可讀性問題
    if (textReadability.issues.length > 0) {
      issues.push({
        type: 'text',
        severity: 'medium',
        description: textReadability.issues.join(', '),
        element: { x: 0, y: 0, width: 0, height: 0, confidence: 1 },
        suggestion: '調整字體大小和行長度'
      });
    }
    
    return issues;
  }

  /**
   * 推斷斷點
   */
  private inferBreakpoints(width: number): BreakpointAnalysis[] {
    const breakpoints: BreakpointAnalysis[] = [];
    
    // 基於常見斷點推斷
    const commonBreakpoints = [320, 768, 1024, 1280, 1920];
    
    commonBreakpoints.forEach(bp => {
      if (width >= bp) {
        breakpoints.push({
          width: bp,
          layout: 'flexbox',
          changes: []
        });
      }
    });
    
    return breakpoints;
  }

  /**
   * 識別自適應元素
   */
  private identifyAdaptiveElements(components: ComponentAnalysis[]): AdaptiveElement[] {
    return components.map(component => ({
      element: component.boundingBox,
      behaviors: [
        {
          property: 'width',
          values: {
            'mobile': '100%',
            'tablet': '50%',
            'desktop': '33.333%'
          }
        }
      ]
    }));
  }

  /**
   * 分析可縮放性
   */
  private analyzeScalability(_components: ComponentAnalysis[]): ScalabilityAnalysis {
    return {
      textScaling: true,
      imageScaling: true,
      layoutFlexibility: 0.8,
      issues: []
    };
  }

  /**
   * 計算整體信心度
   */
  private calculateOverallConfidence(scores: number[]): number {
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }
}