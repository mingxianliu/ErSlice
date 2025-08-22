import { Theme, ModuleStyles, ComponentStyles, GeneratorConfig, Breakpoint } from './SketchGenerator'

export interface SketchStyle {
  fills?: Array<{
    color: string
    opacity?: number
    type?: 'solid' | 'gradient' | 'pattern'
  }>
  borders?: Array<{
    color: string
    thickness: number
    type?: 'solid' | 'dashed' | 'dotted'
  }>
  shadows?: Array<{
    color: string
    blur: number
    offsetX: number
    offsetY: number
    spread: number
  }>
  borderRadius?: number
  opacity?: number
  blendMode?: string
}

export interface StylePreset {
  id: string
  name: string
  category: 'component' | 'layout' | 'theme'
  styles: SketchStyle
  description?: string
}

export class StyleManager {
  private config: GeneratorConfig
  private theme: Theme
  private stylePresets: Map<string, StylePreset>
  private styleCache: Map<string, SketchStyle>

  constructor(config: GeneratorConfig) {
    this.config = config
    this.theme = config.theme as Theme
    this.stylePresets = new Map()
    this.styleCache = new Map()
    this.initializeDefaultPresets()
  }

  /**
   * 初始化預設樣式預設
   */
  private initializeDefaultPresets(): void {
    // 組件樣式預設
    this.registerStylePreset({
      id: 'button-primary',
      name: '主要按鈕',
      category: 'component',
      styles: {
        fills: [{ color: '#007AFF', opacity: 1 }],
        borders: [{ color: '#007AFF', thickness: 1 }],
        borderRadius: 8,
        shadows: [{ color: 'rgba(0,122,255,0.3)', blur: 8, offsetX: 0, offsetY: 4, spread: 0 }]
      },
      description: '主要操作按鈕樣式'
    })

    this.registerStylePreset({
      id: 'button-secondary',
      name: '次要按鈕',
      category: 'component',
      styles: {
        fills: [{ color: '#FFFFFF', opacity: 1 }],
        borders: [{ color: '#E0E0E0', thickness: 1 }],
        borderRadius: 8
      },
      description: '次要操作按鈕樣式'
    })

    this.registerStylePreset({
      id: 'card-default',
      name: '預設卡片',
      category: 'component',
      styles: {
        fills: [{ color: '#FFFFFF', opacity: 1 }],
        borders: [{ color: '#E0E0E0', thickness: 1 }],
        borderRadius: 8,
        shadows: [{ color: 'rgba(0,0,0,0.1)', blur: 8, offsetX: 0, offsetY: 2, spread: 0 }]
      },
      description: '預設卡片樣式'
    })

    this.registerStylePreset({
      id: 'input-default',
      name: '預設輸入框',
      category: 'component',
      styles: {
        fills: [{ color: '#FFFFFF', opacity: 1 }],
        borders: [{ color: '#E0E0E0', thickness: 1 }],
        borderRadius: 4
      },
      description: '預設輸入框樣式'
    })

    // 佈局樣式預設
    this.registerStylePreset({
      id: 'container-main',
      name: '主要容器',
      category: 'layout',
      styles: {
        fills: [{ color: '#F8F9FA', opacity: 1 }],
        borders: [{ color: '#E0E0E0', thickness: 1 }],
        borderRadius: 0
      },
      description: '主要內容容器樣式'
    })

    this.registerStylePreset({
      id: 'section-header',
      name: '區段標題',
      category: 'layout',
      styles: {
        fills: [{ color: '#FFFFFF', opacity: 1 }],
        borders: [{ color: '#E0E0E0', thickness: 0, type: 'solid' }],
        borderRadius: 0
      },
      description: '區段標題樣式'
    })
  }

  /**
   * 註冊樣式預設
   */
  registerStylePreset(preset: StylePreset): void {
    this.stylePresets.set(preset.id, preset)
  }

  /**
   * 獲取樣式預設
   */
  getStylePreset(id: string): StylePreset | undefined {
    return this.stylePresets.get(id)
  }

  /**
   * 應用模組樣式到畫板
   */
  async applyModuleStyles(artboard: any, styles: ModuleStyles): Promise<void> {
    try {
      console.log('🎨 開始應用模組樣式...')

      // 應用顏色系統
      await this.applyColorSystem(artboard, styles.colors)

      // 應用字體系統
      await this.applyTypographySystem(artboard, styles.typography)

      // 應用間距系統
      await this.applySpacingSystem(artboard, styles.spacing)

      // 應用陰影系統
      await this.applyShadowSystem(artboard, styles.shadows)

      console.log('✅ 模組樣式應用完成')
    } catch (error) {
      console.error('❌ 應用模組樣式失敗:', error)
      throw new Error(`Failed to apply module styles: ${error}`)
    }
  }

  /**
   * 應用響應式樣式
   */
  async applyResponsiveStyles(
    artboard: any, 
    styles: ModuleStyles, 
    breakpoint: Breakpoint
  ): Promise<void> {
    try {
      console.log(`🎨 開始應用響應式樣式: ${breakpoint.name}`)

      // 根據斷點調整樣式
      const responsiveStyles = this.generateResponsiveStyles(styles, breakpoint)

      // 應用調整後的樣式
      await this.applyModuleStyles(artboard, responsiveStyles)

      console.log(`✅ 響應式樣式應用完成: ${breakpoint.name}`)
    } catch (error) {
      console.error(`❌ 應用響應式樣式失敗: ${breakpoint.name}`, error)
      throw new Error(`Failed to apply responsive styles for ${breakpoint.name}: ${error}`)
    }
  }

  /**
   * 生成響應式樣式
   */
  private generateResponsiveStyles(styles: ModuleStyles, breakpoint: Breakpoint): ModuleStyles {
    const scale = this.getBreakpointScale(breakpoint)
    
    return {
      colors: { ...styles.colors },
      typography: {
        ...styles.typography,
        fontSizes: styles.typography.fontSizes.map(size => Math.round(size * scale))
      },
      spacing: {
        ...styles.spacing,
        base: Math.round(styles.spacing.base * scale),
        scale: styles.spacing.scale.map(spacing => Math.round(spacing * scale))
      },
      shadows: { ...styles.shadows }
    }
  }

  /**
   * 獲取斷點縮放比例
   */
  private getBreakpointScale(breakpoint: Breakpoint): number {
    switch (breakpoint.name) {
      case 'mobile': return 0.8
      case 'tablet': return 0.9
      case 'desktop': return 1.0
      default: return 1.0
    }
  }

  /**
   * 應用顏色系統
   */
  private async applyColorSystem(artboard: any, colors: any): Promise<void> {
    if (!colors) return

    // 創建顏色樣式
    const colorStyles = this.createColorStyles(colors)
    
    // 應用到畫板的所有圖層
    this.applyStylesToLayers(artboard, colorStyles)
  }

  /**
   * 創建顏色樣式
   */
  private createColorStyles(colors: any): SketchStyle {
    return {
      fills: [
        { color: colors.primary || '#007AFF', opacity: 1 },
        { color: colors.secondary || '#5856D6', opacity: 1 },
        { color: colors.success || '#34C759', opacity: 1 },
        { color: colors.warning || '#FF9500', opacity: 1 },
        { color: colors.danger || '#FF3B30', opacity: 1 }
      ]
    }
  }

  /**
   * 應用字體系統
   */
  private async applyTypographySystem(artboard: any, typography: any): Promise<void> {
    if (!typography) return

    // 創建字體樣式
    const typographyStyles = this.createTypographyStyles(typography)
    
    // 應用到文字圖層
    this.applyTypographyToTextLayers(artboard, typographyStyles)
  }

  /**
   * 創建字體樣式
   */
  private createTypographyStyles(typography: any): any {
    return {
      fontFamily: typography.fontFamily || 'SF Pro Text',
      fontSizes: typography.fontSizes || [12, 14, 16, 18, 20, 24, 28, 32, 36, 48],
      fontWeights: typography.fontWeights || ['regular', 'medium', 'semibold', 'bold'],
      lineHeights: typography.lineHeights || [16, 20, 24, 28, 32, 36, 40, 44, 48, 64]
    }
  }

  /**
   * 應用間距系統
   */
  private async applySpacingSystem(artboard: any, spacing: any): Promise<void> {
    if (!spacing) return

    // 創建間距樣式
    const spacingStyles = this.createSpacingStyles(spacing)
    
    // 應用到佈局
    this.applySpacingToLayout(artboard, spacingStyles)
  }

  /**
   * 創建間距樣式
   */
  private createSpacingStyles(spacing: any): any {
    return {
      base: spacing.base || 4,
      scale: spacing.scale || [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
    }
  }

  /**
   * 應用陰影系統
   */
  private async applyShadowSystem(artboard: any, shadows: any): Promise<void> {
    if (!shadows) return

    // 創建陰影樣式
    const shadowStyles = this.createShadowStyles(shadows)
    
    // 應用到圖層
    this.applyShadowsToLayers(artboard, shadowStyles)
  }

  /**
   * 創建陰影樣式
   */
  private createShadowStyles(shadows: any): SketchStyle {
    return {
      shadows: [
        { 
          color: shadows.small || 'rgba(0,0,0,0.12)', 
          blur: 3, 
          offsetX: 0, 
          offsetY: 1, 
          spread: 0 
        },
        { 
          color: shadows.medium || 'rgba(0,0,0,0.16)', 
          blur: 6, 
          offsetX: 0, 
          offsetY: 3, 
          spread: 0 
        },
        { 
          color: shadows.large || 'rgba(0,0,0,0.19)', 
          blur: 20, 
          offsetX: 0, 
          offsetY: 10, 
          spread: 0 
        }
      ]
    }
  }

  /**
   * 將樣式應用到圖層
   */
  private applyStylesToLayers(artboard: any, styles: SketchStyle): void {
    const layers = this.getAllLayers(artboard)
    
    layers.forEach(layer => {
      if (layer.style) {
        // 合併樣式
        layer.style = { ...layer.style, ...styles }
      }
    })
  }

  /**
   * 將字體樣式應用到文字圖層
   */
  private applyTypographyToTextLayers(artboard: any, typography: any): void {
    const textLayers = this.getTextLayers(artboard)
    
    textLayers.forEach(layer => {
      if (layer.style) {
        layer.style.fontName = typography.fontFamily
        layer.style.fontSize = typography.fontSizes[2] // 預設使用中等字體大小
      }
    })
  }

  /**
   * 將間距應用到佈局
   */
  private applySpacingToLayout(artboard: any, spacing: any): void {
    // 這裡可以實現更複雜的佈局間距邏輯
    // 目前主要是為將來的佈局引擎預留接口
    console.log('應用間距系統:', spacing)
  }

  /**
   * 將陰影應用到圖層
   */
  private applyShadowsToLayers(artboard: any, shadows: SketchStyle): void {
    if (!shadows.shadows) return
    
    const layers = this.getAllLayers(artboard)
    
    layers.forEach(layer => {
      if (layer.style) {
        // 根據圖層類型選擇合適的陰影
        const shadowIndex = this.selectShadowForLayer(layer)
        if (shadowIndex < shadows.shadows!.length) {
          layer.style.shadows = [shadows.shadows![shadowIndex]]
        }
      }
    })
  }

  /**
   * 為圖層選擇合適的陰影
   */
  private selectShadowForLayer(layer: any): number {
    const layerName = layer.name?.toLowerCase() || ''
    
    if (layerName.includes('card') || layerName.includes('modal')) {
      return 2 // 使用大陰影
    } else if (layerName.includes('button') || layerName.includes('input')) {
      return 1 // 使用中等陰影
    } else {
      return 0 // 使用小陰影
    }
  }

  /**
   * 獲取所有圖層
   */
  private getAllLayers(artboard: any): any[] {
    const layers: any[] = []
    
    const collectLayers = (layer: any) => {
      layers.push(layer)
      
      if (layer.layers) {
        layer.layers.forEach(collectLayers)
      }
    }
    
    collectLayers(artboard)
    return layers
  }

  /**
   * 獲取文字圖層
   */
  private getTextLayers(artboard: any): any[] {
    const allLayers = this.getAllLayers(artboard)
    return allLayers.filter(layer => layer.type === 'Text' || layer.text)
  }

  /**
   * 更新主題
   */
  updateTheme(theme: Theme): void {
    this.theme = theme
    console.log('🎨 主題已更新:', theme.name)
  }

  /**
   * 獲取當前主題
   */
  getCurrentTheme(): Theme {
    return this.theme
  }

  /**
   * 獲取所有樣式預設
   */
  getAllStylePresets(): StylePreset[] {
    return Array.from(this.stylePresets.values())
  }

  /**
   * 根據類別獲取樣式預設
   */
  getStylePresetsByCategory(category: string): StylePreset[] {
    return Array.from(this.stylePresets.values()).filter(preset => preset.category === category)
  }

  /**
   * 創建自定義樣式
   */
  createCustomStyle(styles: Partial<SketchStyle>): SketchStyle {
    return {
      fills: styles.fills || [{ color: '#FFFFFF', opacity: 1 }],
      borders: styles.borders || [{ color: '#E0E0E0', thickness: 1 }],
      shadows: styles.shadows || [],
      borderRadius: styles.borderRadius || 0,
      opacity: styles.opacity || 1,
      blendMode: styles.blendMode || 'normal'
    }
  }

  /**
   * 應用樣式預設到圖層
   */
  applyStylePresetToLayer(layer: any, presetId: string): boolean {
    const preset = this.stylePresets.get(presetId)
    if (!preset) return false
    
    if (layer.style) {
      layer.style = { ...layer.style, ...preset.styles }
      return true
    }
    
    return false
  }

  /**
   * 清理樣式快取
   */
  clearStyleCache(): void {
    this.styleCache.clear()
    console.log('🧹 樣式快取已清理')
  }

  /**
   * 匯出樣式預設
   */
  exportStylePresets(): string {
    const presets = Array.from(this.stylePresets.values())
    return JSON.stringify(presets, null, 2)
  }

  /**
   * 匯入樣式預設
   */
  importStylePresets(jsonData: string): boolean {
    try {
      const presets: StylePreset[] = JSON.parse(jsonData)
      
      presets.forEach(preset => {
        this.stylePresets.set(preset.id, preset)
      })
      
      console.log(`✅ 成功匯入 ${presets.length} 個樣式預設`)
      return true
    } catch (error) {
      console.error('❌ 匯入樣式預設失敗:', error)
      return false
    }
  }
}
