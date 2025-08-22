/**
 * ErSlice Sketch 檔案生成器
 * 基於 sketch-constructor 實現設計模組到 Sketch 檔案的轉換
 */

import { Sketch, Page, Artboard, Rectangle, Text, Group } from 'sketch-constructor'

export interface GeneratorConfig {
  theme: string | Theme
  layout: LayoutConfig
  exportOptions: ExportOptions
  componentLibrary?: ComponentLibrary
  styleLibrary?: StyleLibrary
  responsive?: ResponsiveConfig
  naming?: NamingConvention
}

export interface Theme {
  name: string
  colors: ColorPalette
  typography: TypographyPalette
  spacing: SpacingPalette
  shadows: ShadowPalette
}

export interface LayoutConfig {
  type: 'grid' | 'flexbox' | 'absolute'
  columns?: number
  gutter?: number
  margin?: Spacing
  breakpoints?: Breakpoint[]
}

export interface ExportOptions {
  format: 'sketch'
  includePreview?: boolean
  compression?: boolean
}

export interface ComponentLibrary {
  components: Map<string, ComponentDefinition>
}

export interface StyleLibrary {
  styles: Map<string, any>
}

export interface ResponsiveConfig {
  enabled: boolean
  breakpoints: Breakpoint[]
}

export interface NamingConvention {
  files: 'kebab-case' | 'snake_case' | 'camelCase' | 'PascalCase'
  components: 'kebab-case' | 'snake_case' | 'camelCase' | 'PascalCase'
  layers: 'kebab-case' | 'snake_case' | 'camelCase' | 'PascalCase'
}

export interface ColorPalette {
  primary: string
  secondary: string
  success: string
  warning: string
  danger: string
  neutral: string[]
}

export interface TypographyPalette {
  fontFamily: string
  fontSizes: number[]
  fontWeights: string[]
  lineHeights: number[]
}

export interface SpacingPalette {
  base: number
  scale: number[]
}

export interface ShadowPalette {
  small: string
  medium: string
  large: string
}

export interface Spacing {
  top: number
  right: number
  bottom: number
  left: number
}

export interface Breakpoint {
  name: string
  width: number
  height: number
}

export interface ComponentDefinition {
  type: string
  renderer: (component: any) => any
}

export interface DesignModule {
  id: string
  name: string
  description?: string
  components: Component[]
  styles: ModuleStyles
  layout: LayoutConfig
  metadata?: any
}

export interface Component {
  id: string
  name: string
  type: string
  props: ComponentProps
  styles: ComponentStyles
  children?: Component[]
  layout?: ComponentLayout
}

export interface ComponentProps {
  text?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: string
  [key: string]: any
}

export interface ComponentStyles {
  colors?: ColorStyles
  typography?: TypographyStyles
  spacing?: SpacingStyles
  effects?: EffectStyles
}

export interface ComponentLayout {
  x: number
  y: number
  width: number
  height: number
}

export interface ColorStyles {
  backgroundColor?: string
  textColor?: string
  borderColor?: string
}

export interface TypographyStyles {
  fontSize?: number
  fontWeight?: string
  fontFamily?: string
  lineHeight?: number
}

export interface SpacingStyles {
  padding?: Spacing
  margin?: Spacing
}

export interface EffectStyles {
  shadow?: string
  borderRadius?: number
  opacity?: number
}

export interface ModuleStyles {
  colors: ColorPalette
  typography: TypographyPalette
  spacing: SpacingPalette
  shadows: ShadowPalette
}

export class SketchGenerationError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'SketchGenerationError'
  }
}

export class SketchExportError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'SketchExportError'
  }
}

export class SketchGenerator {
  private sketch: Sketch
  private config: GeneratorConfig
  private componentRenderer: ComponentRenderer
  private styleManager: StyleManager
  private layoutEngine: LayoutEngine

  constructor(config: GeneratorConfig) {
    this.config = this.initializeDefaultConfig(config)
    this.sketch = new Sketch()
    this.componentRenderer = new ComponentRenderer(this.config)
    this.styleManager = new StyleManager(this.config)
    this.layoutEngine = new LayoutEngine(this.config)
  }

  /**
   * 初始化預設配置
   */
  private initializeDefaultConfig(config: GeneratorConfig): GeneratorConfig {
    return {
      theme: config.theme || this.createDefaultTheme(),
      layout: {
        type: 'grid',
        columns: 12,
        gutter: 16,
        margin: { top: 24, right: 24, bottom: 24, left: 24 },
        ...config.layout
      },
      exportOptions: {
        format: 'sketch',
        includePreview: true,
        compression: true,
        ...config.exportOptions
      },
      responsive: {
        enabled: true,
        breakpoints: [
          { name: 'mobile', width: 375, height: 667 },
          { name: 'tablet', width: 768, height: 1024 },
          { name: 'desktop', width: 1440, height: 900 }
        ],
        ...config.responsive
      },
      naming: {
        files: 'kebab-case',
        components: 'PascalCase',
        layers: 'kebab-case',
        ...config.naming
      },
      ...config
    }
  }

  /**
   * 建立預設主題
   */
  private createDefaultTheme(): Theme {
    return {
      name: 'default',
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
        success: '#34C759',
        warning: '#FF9500',
        danger: '#FF3B30',
        neutral: ['#FFFFFF', '#F2F2F7', '#8E8E93', '#3A3A3C', '#000000']
      },
      typography: {
        fontFamily: 'SF Pro Text',
        fontSizes: [12, 14, 16, 18, 20, 24, 28, 32, 36, 48],
        fontWeights: ['regular', 'medium', 'semibold', 'bold'],
        lineHeights: [16, 20, 24, 28, 32, 36, 40, 44, 48, 64]
      },
      spacing: {
        base: 4,
        scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
      },
      shadows: {
        small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
        large: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
      }
    }
  }

  /**
   * 從設計模組生成 Sketch 檔案
   */
  async generateFromModule(module: DesignModule): Promise<Sketch> {
    try {
      console.log(`🚀 開始生成 Sketch 檔案: ${module.name}`)

      // 1. 建立頁面
      const page = new Page({ name: this.formatName(module.name, this.config.naming!.components) })
      
      // 2. 建立畫板
      const artboard = new Artboard({
        name: `${this.formatName(module.name, this.config.naming!.components)} - Main`,
        frame: this.calculateArtboardFrame(module)
      })
      
      // 3. 渲染組件
      const components = await this.componentRenderer.renderComponents(module.components)
      components.forEach(component => artboard.addLayer(component))
      
      // 4. 應用樣式
      await this.styleManager.applyModuleStyles(artboard, module.styles)
      
      // 5. 計算佈局
      this.layoutEngine.calculateLayout(artboard, module.layout)
      
      // 6. 添加到頁面
      page.addArtboard(artboard)
      this.sketch.addPage(page)

      // 7. 如果啟用響應式，建立其他斷點的畫板
      if (this.config.responsive?.enabled) {
        await this.createResponsiveArtboards(page, module)
      }
      
      console.log(`✅ Sketch 檔案生成完成: ${module.name}`)
      return this.sketch
    } catch (error) {
      console.error(`❌ Sketch 檔案生成失敗: ${module.name}`, error)
      throw new SketchGenerationError(`Failed to generate sketch from module: ${module.name}`, error as Error)
    }
  }

  /**
   * 從頁面生成 Sketch 檔案
   */
  async generateFromPage(page: any): Promise<Sketch> {
    try {
      console.log(`🚀 開始生成頁面 Sketch 檔案: ${page.name}`)
      
      const module: DesignModule = {
        id: `page_${Date.now()}`,
        name: page.name,
        description: page.description,
        components: page.components || [],
        styles: page.styles || this.createDefaultTheme(),
        layout: page.layout || { type: 'grid', columns: 12, gutter: 16 }
      }
      
      return await this.generateFromModule(module)
    } catch (error) {
      throw new SketchGenerationError(`Failed to generate sketch from page: ${page.name}`, error as Error)
    }
  }

  /**
   * 從組件生成 Sketch 檔案
   */
  async generateFromComponent(component: Component): Promise<Sketch> {
    try {
      console.log(`🚀 開始生成組件 Sketch 檔案: ${component.name}`)
      
      const module: DesignModule = {
        id: `component_${Date.now()}`,
        name: component.name,
        description: `Component: ${component.name}`,
        components: [component],
        styles: this.createDefaultTheme(),
        layout: { type: 'absolute' }
      }
      
      return await this.generateFromModule(module)
    } catch (error) {
      throw new SketchGenerationError(`Failed to generate sketch from component: ${component.name}`, error as Error)
    }
  }

  /**
   * 計算畫板尺寸
   */
  private calculateArtboardFrame(module: DesignModule): any {
    const { margin } = this.config.layout!
    const components = module.components || []
    
    if (components.length === 0) {
      return { x: 0, y: 0, width: 1440, height: 900 }
    }
    
    // 計算組件總尺寸
    let maxWidth = 0
    let maxHeight = 0
    
    components.forEach(component => {
      if (component.layout) {
        maxWidth = Math.max(maxWidth, component.layout.x + component.layout.width)
        maxHeight = Math.max(maxHeight, component.layout.y + component.layout.height)
      }
    })
    
    // 加上邊距
    const width = Math.max(1440, maxWidth + margin.left + margin.right)
    const height = Math.max(900, maxHeight + margin.top + margin.bottom)
    
    return { x: 0, y: 0, width, height }
  }

  /**
   * 建立響應式畫板
   */
  private async createResponsiveArtboards(page: Page, module: DesignModule): Promise<void> {
    if (!this.config.responsive?.breakpoints) return
    
    for (const breakpoint of this.config.responsive.breakpoints) {
      if (breakpoint.name === 'desktop') continue // 跳過桌面版，因為已經建立
      
      const artboard = new Artboard({
        name: `${this.formatName(module.name, this.config.naming!.components)} - ${breakpoint.name}`,
        frame: { x: 0, y: 0, width: breakpoint.width, height: breakpoint.height }
      })
      
      // 重新渲染組件（可能需要調整尺寸）
      const components = await this.componentRenderer.renderComponentsForBreakpoint(
        module.components,
        breakpoint
      )
      
      components.forEach(component => artboard.addLayer(component))
      
      // 應用響應式樣式
      await this.styleManager.applyResponsiveStyles(artboard, module.styles, breakpoint)
      
      // 計算響應式佈局
      this.layoutEngine.calculateResponsiveLayout(artboard, module.layout, breakpoint)
      
      page.addArtboard(artboard)
    }
  }

  /**
   * 格式化名稱
   */
  private formatName(name: string, convention: string): string {
    switch (convention) {
      case 'kebab-case':
        return name.toLowerCase().replace(/\s+/g, '-')
      case 'snake_case':
        return name.toLowerCase().replace(/\s+/g, '_')
      case 'camelCase':
        return name.charAt(0).toLowerCase() + name.slice(1).replace(/\s+/g, '')
      case 'PascalCase':
        return name.replace(/\s+/g, '')
      default:
        return name
    }
  }

  /**
   * 匯出為 .sketch 檔案
   */
  async exportToFile(filePath: string): Promise<void> {
    try {
      console.log(`💾 開始匯出 Sketch 檔案: ${filePath}`)
      await this.sketch.build(filePath)
      console.log(`✅ Sketch 檔案匯出成功: ${filePath}`)
    } catch (error) {
      console.error(`❌ Sketch 檔案匯出失敗: ${filePath}`, error)
      throw new SketchExportError(`Failed to export sketch file: ${filePath}`, error as Error)
    }
  }

  /**
   * 匯出為 Buffer
   */
  async exportToBuffer(): Promise<Buffer> {
    try {
      console.log(`💾 開始匯出 Sketch 檔案為 Buffer`)
      
      // 使用臨時檔案然後讀取為 Buffer
      const tempPath = `/tmp/erslice_sketch_${Date.now()}.sketch`
      await this.sketch.build(tempPath)
      
      const fs = require('fs-extra')
      const buffer = await fs.readFile(tempPath)
      await fs.unlink(tempPath)
      
      console.log(`✅ Sketch 檔案匯出為 Buffer 成功`)
      return buffer
    } catch (error) {
      console.error(`❌ Sketch 檔案匯出為 Buffer 失敗`, error)
      throw new SketchExportError('Failed to export sketch to buffer', error as Error)
    }
  }

  /**
   * 設置主題
   */
  setTheme(theme: Theme): void {
    this.config.theme = theme
    this.styleManager.updateTheme(theme)
  }

  /**
   * 設置佈局
   */
  setLayout(layout: LayoutConfig): void {
    this.config.layout = { ...this.config.layout, ...layout }
    this.layoutEngine.updateLayout(this.config.layout)
  }

  /**
   * 設置匯出選項
   */
  setExportOptions(options: ExportOptions): void {
    this.config.exportOptions = { ...this.config.exportOptions, ...options }
  }

  /**
   * 獲取配置
   */
  getConfig(): GeneratorConfig {
    return { ...this.config }
  }

  /**
   * 獲取生成的 Sketch 實例
   */
  getSketch(): Sketch {
    return this.sketch
  }
}

// 導入新的核心邏輯類別
import { ComponentRenderer } from './ComponentRenderer'
import { StyleManager } from './StyleManager'
import { LayoutEngine } from './LayoutEngine'

export default SketchGenerator
