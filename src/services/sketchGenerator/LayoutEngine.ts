import { LayoutConfig, Breakpoint, GeneratorConfig } from './SketchGenerator'

export interface LayoutConstraints {
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  aspectRatio?: number
}

export interface LayoutGrid {
  columns: number
  rows: number
  gutter: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface AlignmentGuide {
  type: 'horizontal' | 'vertical'
  position: number
  strength: number
  targets: string[]
}

export class LayoutEngine {
  private config: GeneratorConfig
  private grid: LayoutGrid
  private constraints: Map<string, LayoutConstraints>
  private alignmentGuides: AlignmentGuide[]

  constructor(config: GeneratorConfig) {
    this.config = config
    this.grid = this.initializeGrid(config.layout)
    this.constraints = new Map()
    this.alignmentGuides = []
  }

  /**
   * 初始化網格系統
   */
  private initializeGrid(layout: LayoutConfig): LayoutGrid {
    return {
      columns: layout.columns || 12,
      rows: layout.rows || 1,
      gutter: layout.gutter || 16,
      margin: {
        top: layout.margin?.top || 24,
        right: layout.margin?.right || 24,
        bottom: layout.margin?.bottom || 24,
        left: layout.margin?.left || 24
      }
    }
  }

  /**
   * 計算佈局
   */
  calculateLayout(artboard: any, layout: LayoutConfig): void {
    try {
      console.log('📐 開始計算佈局...')

      // 根據佈局類型選擇計算方法
      switch (layout.type) {
        case 'grid':
          this.calculateGridLayout(artboard, layout)
          break
        case 'flexbox':
          this.calculateFlexboxLayout(artboard, layout)
          break
        case 'absolute':
          this.calculateAbsoluteLayout(artboard, layout)
          break
        default:
          this.calculateGridLayout(artboard, layout)
      }

      // 應用對齊指南
      this.applyAlignmentGuides(artboard)

      // 優化佈局
      this.optimizeLayout(artboard)

      console.log('✅ 佈局計算完成')
    } catch (error) {
      console.error('❌ 佈局計算失敗:', error)
      throw new Error(`Failed to calculate layout: ${error}`)
    }
  }

  /**
   * 計算網格佈局
   */
  private calculateGridLayout(artboard: any, layout: LayoutConfig): void {
    const layers = this.getLayersForLayout(artboard)
    const gridConfig = this.getGridConfig(layout)
    
    // 計算網格單元尺寸
    const cellWidth = (artboard.frame.width - gridConfig.margin.left - gridConfig.margin.right - 
      (gridConfig.columns - 1) * gridConfig.gutter) / gridConfig.columns
    const cellHeight = (artboard.frame.height - gridConfig.margin.top - gridConfig.margin.bottom - 
      (gridConfig.rows - 1) * gridConfig.gutter) / gridConfig.rows

    let currentColumn = 0
    let currentRow = 0

    layers.forEach((layer, index) => {
      // 計算網格位置
      const gridX = gridConfig.margin.left + currentColumn * (cellWidth + gridConfig.gutter)
      const gridY = gridConfig.margin.top + currentRow * (cellHeight + gridConfig.gutter)

      // 設置圖層位置和尺寸
      layer.frame.x = gridX
      layer.frame.y = gridY
      layer.frame.width = cellWidth
      layer.frame.height = cellHeight

      // 更新網格位置
      currentColumn++
      if (currentColumn >= gridConfig.columns) {
        currentColumn = 0
        currentRow++
      }
    })
  }

  /**
   * 計算 Flexbox 佈局
   */
  private calculateFlexboxLayout(artboard: any, layout: LayoutConfig): void {
    const layers = this.getLayersForLayout(artboard)
    const direction = layout.direction || 'row'
    const justifyContent = layout.justifyContent || 'flex-start'
    const alignItems = layout.alignItems || 'stretch'
    const flexWrap = layout.flexWrap || 'nowrap'

    if (direction === 'row') {
      this.calculateRowFlexboxLayout(layers, justifyContent, alignItems, flexWrap)
    } else {
      this.calculateColumnFlexboxLayout(layers, justifyContent, alignItems, flexWrap)
    }
  }

  /**
   * 計算行 Flexbox 佈局
   */
  private calculateRowFlexboxLayout(
    layers: any[], 
    justifyContent: string, 
    alignItems: string, 
    flexWrap: string
  ): void {
    const containerWidth = this.getContainerWidth(layers)
    const totalWidth = layers.reduce((sum, layer) => sum + layer.frame.width, 0)
    const availableSpace = containerWidth - totalWidth

    let currentX = 0
    let currentY = 0
    let maxHeightInRow = 0

    layers.forEach((layer, index) => {
      // 計算水平位置
      switch (justifyContent) {
        case 'flex-start':
          layer.frame.x = currentX
          break
        case 'center':
          layer.frame.x = currentX + availableSpace / 2
          break
        case 'flex-end':
          layer.frame.x = currentX + availableSpace
          break
        case 'space-between':
          if (index === 0) {
            layer.frame.x = currentX
          } else {
            layer.frame.x = currentX + (availableSpace / (layers.length - 1)) * index
          }
          break
        case 'space-around':
          layer.frame.x = currentX + (availableSpace / layers.length) * (index + 0.5)
          break
        default:
          layer.frame.x = currentX
      }

      // 計算垂直位置
      switch (alignItems) {
        case 'flex-start':
          layer.frame.y = currentY
          break
        case 'center':
          layer.frame.y = currentY + (maxHeightInRow - layer.frame.height) / 2
          break
        case 'flex-end':
          layer.frame.y = currentY + maxHeightInRow - layer.frame.height
          break
        case 'stretch':
          layer.frame.height = maxHeightInRow
          layer.frame.y = currentY
          break
        default:
          layer.frame.y = currentY
      }

      // 更新位置
      currentX += layer.frame.width + this.grid.gutter
      maxHeightInRow = Math.max(maxHeightInRow, layer.frame.height)

      // 處理換行
      if (flexWrap === 'wrap' && currentX + layer.frame.width > containerWidth) {
        currentX = 0
        currentY += maxHeightInRow + this.grid.gutter
        maxHeightInRow = 0
      }
    })
  }

  /**
   * 計算列 Flexbox 佈局
   */
  private calculateColumnFlexboxLayout(
    layers: any[], 
    justifyContent: string, 
    alignItems: string, 
    flexWrap: string
  ): void {
    const containerHeight = this.getContainerHeight(layers)
    const totalHeight = layers.reduce((sum, layer) => sum + layer.frame.height, 0)
    const availableSpace = containerHeight - totalHeight

    let currentX = 0
    let currentY = 0
    let maxWidthInColumn = 0

    layers.forEach((layer, index) => {
      // 計算垂直位置
      switch (justifyContent) {
        case 'flex-start':
          layer.frame.y = currentY
          break
        case 'center':
          layer.frame.y = currentY + availableSpace / 2
          break
        case 'flex-end':
          layer.frame.y = currentY + availableSpace
          break
        case 'space-between':
          if (index === 0) {
            layer.frame.y = currentY
          } else {
            layer.frame.y = currentY + (availableSpace / (layers.length - 1)) * index
          }
          break
        case 'space-around':
          layer.frame.y = currentY + (availableSpace / layers.length) * (index + 0.5)
          break
        default:
          layer.frame.y = currentY
      }

      // 計算水平位置
      switch (alignItems) {
        case 'flex-start':
          layer.frame.x = currentX
          break
        case 'center':
          layer.frame.x = currentX + (maxWidthInColumn - layer.frame.width) / 2
          break
        case 'flex-end':
          layer.frame.x = currentX + maxWidthInColumn - layer.frame.width
          break
        case 'stretch':
          layer.frame.width = maxWidthInColumn
          layer.frame.x = currentX
          break
        default:
          layer.frame.x = currentX
      }

      // 更新位置
      currentY += layer.frame.height + this.grid.gutter
      maxWidthInColumn = Math.max(maxWidthInColumn, layer.frame.width)

      // 處理換行
      if (flexWrap === 'wrap' && currentY + layer.frame.height > containerHeight) {
        currentY = 0
        currentX += maxWidthInColumn + this.grid.gutter
        maxWidthInColumn = 0
      }
    })
  }

  /**
   * 計算絕對佈局
   */
  private calculateAbsoluteLayout(artboard: any, layout: LayoutConfig): void {
    const layers = this.getLayersForLayout(artboard)
    
    layers.forEach((layer, index) => {
      // 使用圖層的原始位置，但確保在畫板範圍內
      layer.frame.x = Math.max(0, Math.min(layer.frame.x, artboard.frame.width - layer.frame.width))
      layer.frame.y = Math.max(0, Math.min(layer.frame.y, artboard.frame.height - layer.frame.height))
    })
  }

  /**
   * 計算響應式佈局
   */
  calculateResponsiveLayout(artboard: any, layout: LayoutConfig, breakpoint: Breakpoint): void {
    try {
      console.log(`📐 開始計算響應式佈局: ${breakpoint.name}`)

      // 調整佈局配置以適應斷點
      const responsiveLayout = this.adjustLayoutForBreakpoint(layout, breakpoint)

      // 重新計算佈局
      this.calculateLayout(artboard, responsiveLayout)

      // 調整圖層尺寸
      this.adjustLayersForBreakpoint(artboard, breakpoint)

      console.log(`✅ 響應式佈局計算完成: ${breakpoint.name}`)
    } catch (error) {
      console.error(`❌ 響應式佈局計算失敗: ${breakpoint.name}`, error)
      throw new Error(`Failed to calculate responsive layout for ${breakpoint.name}: ${error}`)
    }
  }

  /**
   * 調整佈局以適應斷點
   */
  private adjustLayoutForBreakpoint(layout: LayoutConfig, breakpoint: Breakpoint): LayoutConfig {
    const scale = this.getBreakpointScale(breakpoint)
    
    return {
      ...layout,
      columns: Math.max(1, Math.round((layout.columns || 12) * scale)),
      gutter: Math.round((layout.gutter || 16) * scale),
      margin: {
        top: Math.round((layout.margin?.top || 24) * scale),
        right: Math.round((layout.margin?.right || 24) * scale),
        bottom: Math.round((layout.margin?.bottom || 24) * scale),
        left: Math.round((layout.margin?.left || 24) * scale)
      }
    }
  }

  /**
   * 調整圖層以適應斷點
   */
  private adjustLayersForBreakpoint(artboard: any, breakpoint: Breakpoint): void {
    const scale = this.getBreakpointScale(breakpoint)
    const layers = this.getAllLayers(artboard)
    
    layers.forEach(layer => {
      if (layer.frame) {
        layer.frame.x = Math.round(layer.frame.x * scale)
        layer.frame.y = Math.round(layer.frame.y * scale)
        layer.frame.width = Math.round(layer.frame.width * scale)
        layer.frame.height = Math.round(layer.frame.height * scale)
      }
    })
  }

  /**
   * 獲取斷點縮放比例
   */
  private getBreakpointScale(breakpoint: Breakpoint): number {
    switch (breakpoint.name) {
      case 'mobile': return 0.6
      case 'tablet': return 0.8
      case 'desktop': return 1.0
      default: return 1.0
    }
  }

  /**
   * 應用對齊指南
   */
  private applyAlignmentGuides(artboard: any): void {
    const layers = this.getAllLayers(artboard)
    
    // 創建對齊指南
    this.createAlignmentGuides(layers)
    
    // 應用對齊
    this.applyAlignment(layers)
  }

  /**
   * 創建對齊指南
   */
  private createAlignmentGuides(layers: any[]): void {
    this.alignmentGuides = []
    
    // 水平對齊指南
    const horizontalPositions = new Set<number>()
    layers.forEach(layer => {
      horizontalPositions.add(layer.frame.x) // 左邊緣
      horizontalPositions.add(layer.frame.x + layer.frame.width / 2) // 中心
      horizontalPositions.add(layer.frame.x + layer.frame.width) // 右邊緣
    })

    horizontalPositions.forEach(position => {
      this.alignmentGuides.push({
        type: 'vertical',
        position,
        strength: 1,
        targets: layers
          .filter(layer => 
            Math.abs(layer.frame.x - position) < 5 ||
            Math.abs(layer.frame.x + layer.frame.width / 2 - position) < 5 ||
            Math.abs(layer.frame.x + layer.frame.width - position) < 5
          )
          .map(layer => layer.name)
      })
    })

    // 垂直對齊指南
    const verticalPositions = new Set<number>()
    layers.forEach(layer => {
      verticalPositions.add(layer.frame.y) // 頂邊緣
      verticalPositions.add(layer.frame.y + layer.frame.height / 2) // 中心
      verticalPositions.add(layer.frame.y + layer.frame.height) // 底邊緣
    })

    verticalPositions.forEach(position => {
      this.alignmentGuides.push({
        type: 'horizontal',
        position,
        strength: 1,
        targets: layers
          .filter(layer => 
            Math.abs(layer.frame.y - position) < 5 ||
            Math.abs(layer.frame.y + layer.frame.height / 2 - position) < 5 ||
            Math.abs(layer.frame.y + layer.frame.height - position) < 5
          )
          .map(layer => layer.name)
      })
    })
  }

  /**
   * 應用對齊
   */
  private applyAlignment(layers: any[]): void {
    this.alignmentGuides.forEach(guide => {
      const targetLayers = layers.filter(layer => guide.targets.includes(layer.name))
      
      targetLayers.forEach(layer => {
        if (guide.type === 'vertical') {
          // 垂直對齊（調整 x 位置）
          if (Math.abs(layer.frame.x - guide.position) < 5) {
            layer.frame.x = guide.position
          } else if (Math.abs(layer.frame.x + layer.frame.width / 2 - guide.position) < 5) {
            layer.frame.x = guide.position - layer.frame.width / 2
          } else if (Math.abs(layer.frame.x + layer.frame.width - guide.position) < 5) {
            layer.frame.x = guide.position - layer.frame.width
          }
        } else {
          // 水平對齊（調整 y 位置）
          if (Math.abs(layer.frame.y - guide.position) < 5) {
            layer.frame.y = guide.position
          } else if (Math.abs(layer.frame.y + layer.frame.height / 2 - guide.position) < 5) {
            layer.frame.y = guide.position - layer.frame.height / 2
          } else if (Math.abs(layer.frame.y + layer.frame.height - guide.position) < 5) {
            layer.frame.y = guide.position - layer.frame.height
          }
        }
      })
    })
  }

  /**
   * 優化佈局
   */
  private optimizeLayout(artboard: any): void {
    const layers = this.getAllLayers(artboard)
    
    // 移除重疊
    this.removeOverlaps(layers)
    
    // 優化間距
    this.optimizeSpacing(layers)
    
    // 清理空閒空間
    this.cleanupEmptySpace(layers)
  }

  /**
   * 移除重疊
   */
  private removeOverlaps(layers: any[]): void {
    for (let i = 0; i < layers.length; i++) {
      for (let j = i + 1; j < layers.length; j++) {
        const layer1 = layers[i]
        const layer2 = layers[j]
        
        if (this.isOverlapping(layer1, layer2)) {
          // 調整第二個圖層的位置
          layer2.frame.x = layer1.frame.x + layer1.frame.width + this.grid.gutter
        }
      }
    }
  }

  /**
   * 檢查重疊
   */
  private isOverlapping(layer1: any, layer2: any): boolean {
    return !(
      layer1.frame.x + layer1.frame.width <= layer2.frame.x ||
      layer2.frame.x + layer2.frame.width <= layer1.frame.x ||
      layer1.frame.y + layer1.frame.height <= layer2.frame.y ||
      layer2.frame.y + layer2.frame.height <= layer1.frame.y
    )
  }

  /**
   * 優化間距
   */
  private optimizeSpacing(layers: any[]): void {
    // 按 x 位置排序
    const sortedLayers = [...layers].sort((a, b) => a.frame.x - b.frame.x)
    
    for (let i = 0; i < sortedLayers.length - 1; i++) {
      const current = sortedLayers[i]
      const next = sortedLayers[i + 1]
      
      const currentSpace = next.frame.x - (current.frame.x + current.frame.width)
      if (currentSpace > this.grid.gutter * 2) {
        // 減少過大的間距
        next.frame.x = current.frame.x + current.frame.width + this.grid.gutter
      }
    }
  }

  /**
   * 清理空閒空間
   */
  private cleanupEmptySpace(layers: any[]): void {
    // 找到所有圖層的邊界
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    
    layers.forEach(layer => {
      minX = Math.min(minX, layer.frame.x)
      minY = Math.min(minY, layer.frame.y)
      maxX = Math.max(maxX, layer.frame.x + layer.frame.width)
      maxY = Math.max(maxY, layer.frame.y + layer.frame.height)
    })
    
    // 調整畫板尺寸
    if (layers.length > 0) {
      const container = layers[0].parent || layers[0]
      if (container.frame) {
        container.frame.width = maxX + this.grid.margin.right
        container.frame.height = maxY + this.grid.margin.bottom
      }
    }
  }

  /**
   * 獲取佈局用的圖層
   */
  private getLayersForLayout(artboard: any): any[] {
    const allLayers = this.getAllLayers(artboard)
    return allLayers.filter(layer => 
      layer.frame && 
      layer.frame.width > 0 && 
      layer.frame.height > 0
    )
  }

  /**
   * 獲取所有圖層
   */
  private getAllLayers(layer: any): any[] {
    const layers: any[] = []
    
    const collectLayers = (currentLayer: any) => {
      if (currentLayer.frame) {
        layers.push(currentLayer)
      }
      
      if (currentLayer.layers) {
        currentLayer.layers.forEach(collectLayers)
      }
    }
    
    collectLayers(layer)
    return layers
  }

  /**
   * 獲取容器寬度
   */
  private getContainerWidth(layers: any[]): number {
    if (layers.length === 0) return 1200
    
    const container = layers[0].parent || layers[0]
    return container.frame?.width || 1200
  }

  /**
   * 獲取容器高度
   */
  private getContainerHeight(layers: any[]): number {
    if (layers.length === 0) return 800
    
    const container = layers[0].parent || layers[0]
    return container.frame?.height || 800
  }

  /**
   * 獲取網格配置
   */
  private getGridConfig(layout: LayoutConfig): LayoutGrid {
    return {
      columns: layout.columns || this.grid.columns,
      rows: layout.rows || this.grid.rows,
      gutter: layout.gutter || this.grid.gutter,
      margin: {
        top: layout.margin?.top || this.grid.margin.top,
        right: layout.margin?.right || this.grid.margin.right,
        bottom: layout.margin?.bottom || this.grid.margin.bottom,
        left: layout.margin?.left || this.grid.margin.left
      }
    }
  }

  /**
   * 更新佈局配置
   */
  updateLayout(layout: LayoutConfig): void {
    this.grid = this.initializeGrid(layout)
    console.log('📐 佈局配置已更新')
  }

  /**
   * 獲取對齊指南
   */
  getAlignmentGuides(): AlignmentGuide[] {
    return [...this.alignmentGuides]
  }

  /**
   * 清除對齊指南
   */
  clearAlignmentGuides(): void {
    this.alignmentGuides = []
  }

  /**
   * 設置佈局約束
   */
  setLayoutConstraints(layerId: string, constraints: LayoutConstraints): void {
    this.constraints.set(layerId, constraints)
  }

  /**
   * 獲取佈局約束
   */
  getLayoutConstraints(layerId: string): LayoutConstraints | undefined {
    return this.constraints.get(layerId)
  }

  /**
   * 清除佈局約束
   */
  clearLayoutConstraints(): void {
    this.constraints.clear()
  }
}
