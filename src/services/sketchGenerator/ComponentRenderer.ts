import { Component, ComponentProps, ComponentStyles, ComponentLayout } from './SketchGenerator'
import { GeneratorConfig, Breakpoint } from './SketchGenerator'

export interface RenderedComponent {
  id: string
  name: string
  type: string
  frame: {
    x: number
    y: number
    width: number
    height: number
  }
  style: any
  children?: RenderedComponent[]
}

export class ComponentRenderer {
  private config: GeneratorConfig
  private componentRegistry: Map<string, ComponentRendererFunction>

  constructor(config: GeneratorConfig) {
    this.config = config
    this.componentRegistry = new Map()
    this.initializeDefaultRenderers()
  }

  /**
   * 初始化預設渲染器
   */
  private initializeDefaultRenderers(): void {
    // 註冊基礎組件渲染器
    this.registerRenderer('button', this.renderButton.bind(this))
    this.registerRenderer('text', this.renderText.bind(this))
    this.registerRenderer('image', this.renderImage.bind(this))
    this.registerRenderer('container', this.renderContainer.bind(this))
    this.registerRenderer('input', this.renderInput.bind(this))
    this.registerRenderer('card', this.renderCard.bind(this))
    this.registerRenderer('navigation', this.renderNavigation.bind(this))
    this.registerRenderer('form', this.renderForm.bind(this))
    this.registerRenderer('list', this.renderList.bind(this))
    this.registerRenderer('grid', this.renderGrid.bind(this))
  }

  /**
   * 註冊組件渲染器
   */
  registerRenderer(componentType: string, renderer: ComponentRendererFunction): void {
    this.componentRegistry.set(componentType, renderer)
  }

  /**
   * 渲染組件
   */
  async renderComponents(components: Component[]): Promise<any[]> {
    const renderedComponents: any[] = []
    
    for (const component of components) {
      try {
        const rendered = await this.renderComponent(component)
        if (rendered) {
          renderedComponents.push(rendered)
        }
      } catch (error) {
        console.warn(`組件渲染失敗: ${component.name}`, error)
        // 使用預設渲染器作為後備
        const fallback = await this.renderFallbackComponent(component)
        if (fallback) {
          renderedComponents.push(fallback)
        }
      }
    }
    
    return renderedComponents
  }

  /**
   * 渲染單個組件
   */
  private async renderComponent(component: Component): Promise<any> {
    const renderer = this.componentRegistry.get(component.type)
    
    if (renderer) {
      return await renderer(component, this.config)
    }
    
    // 如果沒有找到特定渲染器，使用通用渲染器
    return await this.renderGenericComponent(component)
  }

  /**
   * 渲染按鈕組件
   */
  private async renderButton(component: Component, config: GeneratorConfig): Promise<any> {
    const { Rectangle, Text } = await import('sketch-constructor')
    
    const frame = this.calculateComponentFrame(component)
    const styles = this.applyComponentStyles(component.styles, config)
    
    // 創建按鈕背景
    const buttonRect = new Rectangle({
      name: `${component.name} - Background`,
      frame,
      style: {
        fills: [{ color: styles.backgroundColor || '#007AFF' }],
        borders: [{ color: styles.borderColor || '#007AFF', thickness: 1 }],
        borderRadius: styles.borderRadius || 8
      }
    })
    
    // 創建按鈕文字
    const textFrame = this.calculateTextFrame(frame, component.props.text || 'Button')
    const buttonText = new Text({
      name: `${component.name} - Text`,
      frame: textFrame,
      text: component.props.text || 'Button',
      style: {
        fontName: styles.fontFamily || 'SF Pro Text',
        fontSize: styles.fontSize || 16,
        fontColor: styles.textColor || '#FFFFFF',
        textAlign: 'center'
      }
    })
    
    // 創建組件組
    const buttonGroup = new (await import('sketch-constructor')).Group({
      name: component.name,
      frame,
      layers: [buttonRect, buttonText]
    })
    
    return buttonGroup
  }

  /**
   * 渲染文字組件
   */
  private async renderText(component: Component, config: GeneratorConfig): Promise<any> {
    const { Text } = await import('sketch-constructor')
    
    const frame = this.calculateComponentFrame(component)
    const styles = this.applyComponentStyles(component.styles, config)
    
    const textComponent = new Text({
      name: component.name,
      frame,
      text: component.props.text || 'Text',
      style: {
        fontName: styles.fontFamily || 'SF Pro Text',
        fontSize: styles.fontSize || 16,
        fontColor: styles.textColor || '#000000',
        textAlign: this.getTextAlign(component.props.align),
        lineHeight: styles.lineHeight || 1.2
      }
    })
    
    return textComponent
  }

  /**
   * 渲染圖片組件
   */
  private async renderImage(component: Component, config: GeneratorConfig): Promise<any> {
    const { Image } = await import('sketch-constructor')
    
    const frame = this.calculateComponentFrame(component)
    const styles = this.applyComponentStyles(component.styles, config)
    
    const imageComponent = new Image({
      name: component.name,
      frame,
      image: component.props.src || '',
      style: {
        borderRadius: styles.borderRadius || 0,
        opacity: styles.opacity || 1
      }
    })
    
    return imageComponent
  }

  /**
   * 渲染容器組件
   */
  private async renderContainer(component: Component, config: GeneratorConfig): Promise<any> {
    const { Rectangle, Group } = await import('sketch-constructor')
    
    const frame = this.calculateComponentFrame(component)
    const styles = this.applyComponentStyles(component.styles, config)
    
    // 創建容器背景
    const containerRect = new Rectangle({
      name: `${component.name} - Background`,
      frame,
      style: {
        fills: [{ color: styles.backgroundColor || '#FFFFFF' }],
        borders: [{ color: styles.borderColor || '#E0E0E0', thickness: 1 }],
        borderRadius: styles.borderRadius || 0
      }
    })
    
    // 創建組件組
    const containerGroup = new Group({
      name: component.name,
      frame,
      layers: [containerRect]
    })
    
    // 如果有子組件，遞歸渲染
    if (component.children && component.children.length > 0) {
      const childComponents = await this.renderComponents(component.children)
      childComponents.forEach(child => containerGroup.addLayer(child))
    }
    
    return containerGroup
  }

  /**
   * 渲染輸入框組件
   */
  private async renderInput(component: Component, config: GeneratorConfig): Promise<any> {
    const { Rectangle, Text } = await import('sketch-constructor')
    
    const frame = this.calculateComponentFrame(component)
    const styles = this.applyComponentStyles(component.styles, config)
    
    // 創建輸入框背景
    const inputRect = new Rectangle({
      name: `${component.name} - Background`,
      frame,
      style: {
        fills: [{ color: styles.backgroundColor || '#FFFFFF' }],
        borders: [{ color: styles.borderColor || '#E0E0E0', thickness: 1 }],
        borderRadius: styles.borderRadius || 4
      }
    })
    
    // 創建佔位符文字
    const placeholderFrame = this.calculateTextFrame(frame, component.props.placeholder || 'Input')
    const placeholderText = new Text({
      name: `${component.name} - Placeholder`,
      frame: placeholderFrame,
      text: component.props.placeholder || 'Input',
      style: {
        fontName: styles.fontFamily || 'SF Pro Text',
        fontSize: styles.fontSize || 16,
        fontColor: styles.placeholderColor || '#999999',
        textAlign: 'left'
      }
    })
    
    // 創建組件組
    const inputGroup = new (await import('sketch-constructor')).Group({
      name: component.name,
      frame,
      layers: [inputRect, placeholderText]
    })
    
    return inputGroup
  }

  /**
   * 渲染卡片組件
   */
  private async renderCard(component: Component, config: GeneratorConfig): Promise<any> {
    const { Rectangle, Group } = await import('sketch-constructor')
    
    const frame = this.calculateComponentFrame(component)
    const styles = this.applyComponentStyles(component.styles, config)
    
    // 創建卡片背景
    const cardRect = new Rectangle({
      name: `${component.name} - Background`,
      frame,
      style: {
        fills: [{ color: styles.backgroundColor || '#FFFFFF' }],
        borders: [{ color: styles.borderColor || '#E0E0E0', thickness: 1 }],
        borderRadius: styles.borderRadius || 8,
        shadows: [styles.shadow || '0 2px 8px rgba(0,0,0,0.1)']
      }
    })
    
    // 創建組件組
    const cardGroup = new Group({
      name: component.name,
      frame,
      layers: [cardRect]
    })
    
    // 如果有子組件，遞歸渲染
    if (component.children && component.children.length > 0) {
      const childComponents = await this.renderComponents(component.children)
      childComponents.forEach(child => cardGroup.addLayer(child))
    }
    
    return cardGroup
  }

  /**
   * 渲染導航組件
   */
  private async renderNavigation(component: Component, config: GeneratorConfig): Promise<any> {
    const { Rectangle, Text, Group } = await import('sketch-constructor')
    
    const frame = this.calculateComponentFrame(component)
    const styles = this.applyComponentStyles(component.styles, config)
    
    // 創建導航背景
    const navRect = new Rectangle({
      name: `${component.name} - Background`,
      frame,
      style: {
        fills: [{ color: styles.backgroundColor || '#FFFFFF' }],
        borders: [{ color: styles.borderColor || '#E0E0E0', thickness: 1 }]
      }
    })
    
    // 創建導航項目
    const navItems = component.props.items || ['Home', 'About', 'Contact']
    const navLayers = [navRect]
    
    navItems.forEach((item, index) => {
      const itemFrame = {
        x: frame.x + 20 + (index * 100),
        y: frame.y + 10,
        width: 80,
        height: frame.height - 20
      }
      
      const navItem = new Text({
        name: `${component.name} - ${item}`,
        frame: itemFrame,
        text: item,
        style: {
          fontName: styles.fontFamily || 'SF Pro Text',
          fontSize: styles.fontSize || 16,
          fontColor: styles.textColor || '#000000',
          textAlign: 'center'
        }
      })
      
      navLayers.push(navItem)
    })
    
    // 創建組件組
    const navGroup = new Group({
      name: component.name,
      frame,
      layers: navLayers
    })
    
    return navGroup
  }

  /**
   * 渲染表單組件
   */
  private async renderForm(component: Component, config: GeneratorConfig): Promise<any> {
    const { Rectangle, Group } = await import('sketch-constructor')
    
    const frame = this.calculateComponentFrame(component)
    const styles = this.applyComponentStyles(component.styles, config)
    
    // 創建表單背景
    const formRect = new Rectangle({
      name: `${component.name} - Background`,
      frame,
      style: {
        fills: [{ color: styles.backgroundColor || '#F8F9FA' }],
        borders: [{ color: styles.borderColor || '#E0E0E0', thickness: 1 }],
        borderRadius: styles.borderRadius || 8
      }
    })
    
    // 創建組件組
    const formGroup = new Group({
      name: component.name,
      frame,
      layers: [formRect]
    })
    
    // 如果有子組件，遞歸渲染
    if (component.children && component.children.length > 0) {
      const childComponents = await this.renderComponents(component.children)
      childComponents.forEach(child => formGroup.addLayer(child))
    }
    
    return formGroup
  }

  /**
   * 渲染列表組件
   */
  private async renderList(component: Component, config: GeneratorConfig): Promise<any> {
    const { Rectangle, Group } = await import('sketch-constructor')
    
    const frame = this.calculateComponentFrame(component)
    const styles = this.applyComponentStyles(component.styles, config)
    
    // 創建列表背景
    const listRect = new Rectangle({
      name: `${component.name} - Background`,
      frame,
      style: {
        fills: [{ color: styles.backgroundColor || '#FFFFFF' }],
        borders: [{ color: styles.borderColor || '#E0E0E0', thickness: 1 }],
        borderRadius: styles.borderRadius || 4
      }
    })
    
    // 創建組件組
    const listGroup = new Group({
      name: component.name,
      frame,
      layers: [listRect]
    })
    
    // 如果有子組件，遞歸渲染
    if (component.children && component.children.length > 0) {
      const childComponents = await this.renderComponents(component.children)
      childComponents.forEach(child => listGroup.addLayer(child))
    }
    
    return listGroup
  }

  /**
   * 渲染網格組件
   */
  private async renderGrid(component: Component, config: GeneratorConfig): Promise<any> {
    const { Rectangle, Group } = await import('sketch-constructor')
    
    const frame = this.calculateComponentFrame(component)
    const styles = this.applyComponentStyles(component.styles, config)
    
    // 創建網格背景
    const gridRect = new Rectangle({
      name: `${component.name} - Background`,
      frame,
      style: {
        fills: [{ color: styles.backgroundColor || '#FFFFFF' }],
        borders: [{ color: styles.borderColor || '#E0E0E0', thickness: 1 }]
      }
    })
    
    // 創建組件組
    const gridGroup = new Group({
      name: component.name,
      frame,
      layers: [gridRect]
    })
    
    // 如果有子組件，遞歸渲染
    if (component.children && component.children.length > 0) {
      const childComponents = await this.renderComponents(component.children)
      childComponents.forEach(child => gridGroup.addLayer(child))
    }
    
    return gridGroup
  }

  /**
   * 渲染通用組件
   */
  private async renderGenericComponent(component: Component): Promise<any> {
    const { Rectangle, Group } = await import('sketch-constructor')
    
    const frame = this.calculateComponentFrame(component)
    
    // 創建通用背景
    const genericRect = new Rectangle({
      name: `${component.name} - Generic`,
      frame,
      style: {
        fills: [{ color: '#F0F0F0' }],
        borders: [{ color: '#CCCCCC', thickness: 1 }],
        borderRadius: 4
      }
    })
    
    // 創建組件組
    const genericGroup = new Group({
      name: component.name,
      frame,
      layers: [genericRect]
    })
    
    // 如果有子組件，遞歸渲染
    if (component.children && component.children.length > 0) {
      const childComponents = await this.renderComponents(component.children)
      childComponents.forEach(child => genericGroup.addLayer(child))
    }
    
    return genericGroup
  }

  /**
   * 渲染後備組件
   */
  private async renderFallbackComponent(component: Component): Promise<any> {
    console.warn(`使用後備渲染器渲染組件: ${component.name} (${component.type})`)
    return await this.renderGenericComponent(component)
  }

  /**
   * 為特定斷點渲染組件
   */
  async renderComponentsForBreakpoint(
    components: Component[], 
    breakpoint: Breakpoint
  ): Promise<any[]> {
    // 調整組件尺寸以適應斷點
    const adjustedComponents = components.map(component => ({
      ...component,
      layout: this.adjustLayoutForBreakpoint(component.layout, breakpoint)
    }))
    
    return await this.renderComponents(adjustedComponents)
  }

  /**
   * 調整佈局以適應斷點
   */
  private adjustLayoutForBreakpoint(
    layout: ComponentLayout | undefined, 
    breakpoint: Breakpoint
  ): ComponentLayout | undefined {
    if (!layout) return layout
    
    const scale = this.getBreakpointScale(breakpoint)
    
    return {
      x: layout.x * scale,
      y: layout.y * scale,
      width: layout.width * scale,
      height: layout.height * scale
    }
  }

  /**
   * 獲取斷點縮放比例
   */
  private getBreakpointScale(breakpoint: Breakpoint): number {
    switch (breakpoint.name) {
      case 'mobile': return 0.5
      case 'tablet': return 0.75
      case 'desktop': return 1.0
      default: return 1.0
    }
  }

  /**
   * 計算組件框架
   */
  private calculateComponentFrame(component: Component): any {
    if (component.layout) {
      return {
        x: component.layout.x,
        y: component.layout.y,
        width: component.layout.width,
        height: component.layout.height
      }
    }
    
    // 預設框架
    return {
      x: 0,
      y: 0,
      width: 200,
      height: 100
    }
  }

  /**
   * 計算文字框架
   */
  private calculateTextFrame(parentFrame: any, text: string): any {
    // 簡單的文字尺寸估算
    const fontSize = 16
    const charWidth = fontSize * 0.6
    const textWidth = text.length * charWidth
    
    return {
      x: parentFrame.x + (parentFrame.width - textWidth) / 2,
      y: parentFrame.y + (parentFrame.height - fontSize) / 2,
      width: textWidth,
      height: fontSize
    }
  }

  /**
   * 應用組件樣式
   */
  private applyComponentStyles(styles: ComponentStyles, config: GeneratorConfig): any {
    const theme = config.theme as any
    
    return {
      backgroundColor: styles.colors?.backgroundColor || theme?.colors?.primary || '#007AFF',
      textColor: styles.colors?.textColor || theme?.colors?.neutral?.[3] || '#000000',
      borderColor: styles.colors?.borderColor || theme?.colors?.neutral?.[1] || '#E0E0E0',
      fontFamily: styles.typography?.fontFamily || theme?.typography?.fontFamily || 'SF Pro Text',
      fontSize: styles.typography?.fontSize || theme?.typography?.fontSizes?.[2] || 16,
      lineHeight: styles.typography?.lineHeight || theme?.typography?.lineHeights?.[2] || 1.2,
      borderRadius: styles.effects?.borderRadius || 0,
      opacity: styles.effects?.opacity || 1,
      shadow: styles.effects?.shadow || 'none'
    }
  }

  /**
   * 獲取文字對齊方式
   */
  private getTextAlign(align?: string): string {
    switch (align) {
      case 'left': return 'left'
      case 'center': return 'center'
      case 'right': return 'right'
      default: return 'left'
    }
  }
}

export type ComponentRendererFunction = (
  component: Component, 
  config: GeneratorConfig
) => Promise<any>
