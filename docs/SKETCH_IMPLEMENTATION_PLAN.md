# ErSlice Sketch 生成器技術實現規劃

## 🎯 實現目標

### 主要功能
1. **將 ErSlice 設計模組轉換為 .sketch 檔案**
2. **支援 Figma 直接匯入**
3. **保持設計系統的一致性**
4. **支援批量生成和自定義配置**

### 技術優勢
- 使用 Apache 2.0 開源的 sketch-constructor
- 完全合規，無第三方授權問題
- 支援 Node.js 環境，無需安裝 Sketch
- 可整合到 CI/CD 流程

## 🏗️ 技術架構詳解

### 核心架構圖
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   ErSlice      │    │   Sketch         │    │   Output       │
│   Design       │───▶│   Generator      │───▶│   .sketch      │
│   Module       │    │   Engine         │    │   File         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Component      │
                       │   Renderer       │
                       └──────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Style          │
                       │   Manager        │
                       └──────────────────┘
```

### 資料流程
1. **輸入**: ErSlice 設計模組 (JSON/TypeScript 物件)
2. **處理**: 組件解析 → 樣式轉換 → 佈局計算 → Sketch 元素生成
3. **輸出**: 標準 .sketch 檔案 (ZIP 格式)

## 🔧 核心實現

### 1. SketchGenerator 主類別

```typescript
import { Sketch, Page, Artboard } from 'sketch-constructor'

export class SketchGenerator {
  private sketch: Sketch
  private config: GeneratorConfig
  private componentRenderer: ComponentRenderer
  private styleManager: StyleManager
  private layoutEngine: LayoutEngine

  constructor(config: GeneratorConfig) {
    this.config = config
    this.sketch = new Sketch()
    this.componentRenderer = new ComponentRenderer(config)
    this.styleManager = new StyleManager(config)
    this.layoutEngine = new LayoutEngine(config)
  }

  /**
   * 從設計模組生成 Sketch 檔案
   */
  async generateFromModule(module: DesignModule): Promise<Sketch> {
    try {
      // 1. 建立頁面
      const page = new Page({ name: module.name })
      
      // 2. 建立畫板
      const artboard = new Artboard({
        name: `${module.name} - Main`,
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
      
      return this.sketch
    } catch (error) {
      throw new SketchGenerationError('Failed to generate sketch from module', error)
    }
  }

  /**
   * 匯出為 .sketch 檔案
   */
  async exportToFile(filePath: string): Promise<void> {
    try {
      await this.sketch.build(filePath)
    } catch (error) {
      throw new SketchExportError('Failed to export sketch file', error)
    }
  }

  /**
   * 匯出為 Buffer
   */
  async exportToBuffer(): Promise<Buffer> {
    try {
      // 使用臨時檔案然後讀取為 Buffer
      const tempPath = `/tmp/erslice_sketch_${Date.now()}.sketch`
      await this.sketch.build(tempPath)
      const buffer = await fs.readFile(tempPath)
      await fs.unlink(tempPath)
      return buffer
    } catch (error) {
      throw new SketchExportError('Failed to export sketch to buffer', error)
    }
  }
}
```

### 2. ComponentRenderer 組件渲染器

```typescript
export class ComponentRenderer {
  private config: GeneratorConfig
  private renderers: Map<string, ComponentRendererFunction>

  constructor(config: GeneratorConfig) {
    this.config = config
    this.renderers = new Map()
    this.initializeDefaultRenderers()
  }

  /**
   * 初始化預設渲染器
   */
  private initializeDefaultRenderers() {
    this.registerRenderer('button', this.renderButton.bind(this))
    this.registerRenderer('input', this.renderInput.bind(this))
    this.registerRenderer('card', this.renderCard.bind(this))
    this.registerRenderer('text', this.renderText.bind(this))
    this.registerRenderer('image', this.renderImage.bind(this))
    this.registerRenderer('icon', this.renderIcon.bind(this))
  }

  /**
   * 註冊自定義渲染器
   */
  registerRenderer(type: string, renderer: ComponentRendererFunction) {
    this.renderers.set(type, renderer)
  }

  /**
   * 渲染組件
   */
  async renderComponents(components: Component[]): Promise<SketchElement[]> {
    const renderedComponents: SketchElement[] = []
    
    for (const component of components) {
      const renderer = this.renderers.get(component.type)
      if (renderer) {
        const element = await renderer(component)
        renderedComponents.push(element)
      } else {
        console.warn(`No renderer found for component type: ${component.type}`)
      }
    }
    
    return renderedComponents
  }

  /**
   * 渲染按鈕組件
   */
  private renderButton(component: ButtonComponent): SketchElement {
    const { Rectangle, Text } = require('sketch-constructor')
    
    // 建立按鈕背景
    const buttonRect = new Rectangle({
      name: `${component.name} - Background`,
      frame: this.calculateButtonFrame(component),
      style: this.createButtonStyle(component)
    })
    
    // 建立按鈕文字
    const buttonText = new Text({
      name: `${component.name} - Text`,
      text: component.text || 'Button',
      frame: this.calculateTextFrame(component),
      style: this.createTextStyle(component)
    })
    
    // 建立按鈕組
    const buttonGroup = new Group({
      name: component.name,
      layers: [buttonRect, buttonText]
    })
    
    return buttonGroup
  }

  /**
   * 渲染輸入框組件
   */
  private renderInput(component: InputComponent): SketchElement {
    const { Rectangle, Text } = require('sketch-constructor')
    
    // 建立輸入框背景
    const inputRect = new Rectangle({
      name: `${component.name} - Background`,
      frame: this.calculateInputFrame(component),
      style: this.createInputStyle(component)
    })
    
    // 建立佔位符文字
    const placeholderText = new Text({
      name: `${component.name} - Placeholder`,
      text: component.placeholder || 'Enter text...',
      frame: this.calculatePlaceholderFrame(component),
      style: this.createPlaceholderStyle(component)
    })
    
    // 建立輸入框組
    const inputGroup = new Group({
      name: component.name,
      layers: [inputRect, placeholderText]
    })
    
    return inputGroup
  }
}
```

### 3. StyleManager 樣式管理器

```typescript
export class StyleManager {
  private config: GeneratorConfig
  private sharedStyles: Map<string, SharedStyle>
  private colorPalette: Map<string, Color>
  private typographyStyles: Map<string, TextStyle>

  constructor(config: GeneratorConfig) {
    this.config = config
    this.sharedStyles = new Map()
    this.colorPalette = new Map()
    this.typographyStyles = new Map()
    this.initializeDefaultStyles()
  }

  /**
   * 初始化預設樣式
   */
  private initializeDefaultStyles() {
    // 初始化顏色調色板
    this.initializeColorPalette()
    
    // 初始化字體樣式
    this.initializeTypographyStyles()
    
    // 初始化共享樣式
    this.initializeSharedStyles()
  }

  /**
   * 初始化顏色調色板
   */
  private initializeColorPalette() {
    const { Color } = require('sketch-constructor')
    
    // 主色調
    this.colorPalette.set('primary', new Color({ red: 0, green: 122, blue: 255, alpha: 1 }))
    this.colorPalette.set('secondary', new Color({ red: 88, green: 86, blue: 214, alpha: 1 }))
    this.colorPalette.set('success', new Color({ red: 52, green: 199, blue: 89, alpha: 1 }))
    this.colorPalette.set('warning', new Color({ red: 255, green: 149, blue: 0, alpha: 1 }))
    this.colorPalette.set('danger', new Color({ red: 255, green: 59, blue: 48, alpha: 1 }))
    
    // 中性色調
    this.colorPalette.set('white', new Color({ red: 255, green: 255, blue: 255, alpha: 1 }))
    this.colorPalette.set('lightGray', new Color({ red: 242, green: 242, blue: 247, alpha: 1 }))
    this.colorPalette.set('gray', new Color({ red: 142, green: 142, blue: 147, alpha: 1 }))
    this.colorPalette.set('darkGray', new Color({ red: 58, green: 58, blue: 60, alpha: 1 }))
    this.colorPalette.set('black', new Color({ red: 0, green: 0, blue: 0, alpha: 1 }))
  }

  /**
   * 轉換 ErSlice 設計令牌為 Sketch 樣式
   */
  convertDesignToken(token: DesignToken): any {
    switch (token.type) {
      case 'color':
        return this.convertColorToken(token)
      case 'typography':
        return this.convertTypographyToken(token)
      case 'spacing':
        return this.convertSpacingToken(token)
      case 'shadow':
        return this.convertShadowToken(token)
      default:
        throw new Error(`Unsupported token type: ${token.type}`)
    }
  }

  /**
   * 轉換顏色令牌
   */
  private convertColorToken(token: ColorToken): Color {
    const { Color } = require('sketch-constructor')
    
    if (token.value.startsWith('#')) {
      // HEX 顏色
      const hex = token.value.substring(1)
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      
      return new Color({ red: r, green: g, blue: b, alpha: 1 })
    } else if (token.value.startsWith('rgb')) {
      // RGB 顏色
      const match = token.value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
      if (match) {
        const [, r, g, b, a] = match
        return new Color({
          red: parseInt(r),
          green: parseInt(g),
          blue: parseInt(b),
          alpha: a ? parseFloat(a) : 1
        })
      }
    }
    
    // 預設顏色
    return this.colorPalette.get('primary') || new Color({ red: 0, green: 122, blue: 255, alpha: 1 })
  }

  /**
   * 轉換字體令牌
   */
  private convertTypographyToken(token: TypographyToken): TextStyle {
    const { TextStyle } = require('sketch-constructor')
    
    return new TextStyle({
      fontFamily: token.fontFamily || 'SF Pro Text',
      fontSize: token.fontSize || 16,
      fontWeight: token.fontWeight || 'regular',
      lineHeight: token.lineHeight || token.fontSize || 16,
      letterSpacing: token.letterSpacing || 0,
      textAlign: token.textAlign || 'left',
      color: this.convertColorToken(token.color)
    })
  }
}
```

### 4. LayoutEngine 佈局引擎

```typescript
export class LayoutEngine {
  private config: GeneratorConfig
  private gridSystem: GridSystem
  private flexboxSystem: FlexboxSystem

  constructor(config: GeneratorConfig) {
    this.config = config
    this.gridSystem = new GridSystem(config)
    this.flexboxSystem = new FlexboxSystem(config)
  }

  /**
   * 計算佈局
   */
  calculateLayout(artboard: Artboard, layout: LayoutConfig): void {
    switch (layout.type) {
      case 'grid':
        this.gridSystem.applyGridLayout(artboard, layout)
        break
      case 'flexbox':
        this.flexboxSystem.applyFlexboxLayout(artboard, layout)
        break
      case 'absolute':
        this.applyAbsoluteLayout(artboard, layout)
        break
      default:
        throw new Error(`Unsupported layout type: ${layout.type}`)
    }
  }

  /**
   * 應用網格佈局
   */
  private applyGridLayout(artboard: Artboard, layout: GridLayout): void {
    const { columns, gutter, margin } = layout
    const layers = artboard.layers || []
    
    // 計算網格尺寸
    const artboardWidth = artboard.frame.width
    const availableWidth = artboardWidth - (margin.left + margin.right)
    const columnWidth = (availableWidth - (gutter * (columns - 1))) / columns
    
    // 應用網格佈局
    layers.forEach((layer, index) => {
      const column = index % columns
      const row = Math.floor(index / columns)
      
      const x = margin.left + (column * (columnWidth + gutter))
      const y = margin.top + (row * (layer.frame.height + gutter))
      
      layer.frame.x = x
      layer.frame.y = y
    })
  }

  /**
   * 應用 Flexbox 佈局
   */
  private applyFlexboxLayout(artboard: Artboard, layout: FlexboxLayout): void {
    const { direction, justifyContent, alignItems, gap } = layout
    const layers = artboard.layers || []
    
    if (direction === 'row') {
      this.applyHorizontalFlexbox(layers, justifyContent, alignItems, gap)
    } else {
      this.applyVerticalFlexbox(layers, justifyContent, alignItems, gap)
    }
  }

  /**
   * 應用水平 Flexbox 佈局
   */
  private applyHorizontalFlexbox(
    layers: SketchElement[],
    justifyContent: string,
    alignItems: string,
    gap: number
  ): void {
    let currentX = 0
    
    layers.forEach((layer, index) => {
      if (index > 0) {
        currentX += gap
      }
      
      layer.frame.x = currentX
      
      // 垂直對齊
      switch (alignItems) {
        case 'center':
          layer.frame.y = (artboard.frame.height - layer.frame.height) / 2
          break
        case 'flex-end':
          layer.frame.y = artboard.frame.height - layer.frame.height
          break
        default: // flex-start
          layer.frame.y = 0
      }
      
      currentX += layer.frame.width
    })
    
    // 水平對齊調整
    if (justifyContent === 'center') {
      const totalWidth = currentX - gap
      const offset = (artboard.frame.width - totalWidth) / 2
      layers.forEach(layer => {
        layer.frame.x += offset
      })
    }
  }
}
```

## 📦 依賴管理

### package.json 新增依賴

```json
{
  "dependencies": {
    "sketch-constructor": "^0.0.0-development",
    "jszip": "^3.4.0",
    "fs-extra": "^9.0.1"
  },
  "devDependencies": {
    "@types/fs-extra": "^9.0.1",
    "@types/jszip": "^3.4.0"
  }
}
```

### 安裝指令

```bash
npm install sketch-constructor jszip fs-extra
npm install --save-dev @types/fs-extra @types/jszip
```

## 🧪 測試策略

### 單元測試

```typescript
// __tests__/SketchGenerator.test.ts
import { SketchGenerator } from '../src/services/sketchGenerator/SketchGenerator'

describe('SketchGenerator', () => {
  let generator: SketchGenerator

  beforeEach(() => {
    generator = new SketchGenerator({
      theme: 'default',
      layout: { type: 'grid', columns: 12, gutter: 16 }
    })
  })

  test('should generate sketch from design module', async () => {
    const module = createMockDesignModule()
    const sketch = await generator.generateFromModule(module)
    
    expect(sketch).toBeDefined()
    expect(sketch.pages).toHaveLength(1)
    expect(sketch.pages[0].artboards).toHaveLength(1)
  })

  test('should export sketch to file', async () => {
    const module = createMockDesignModule()
    const sketch = await generator.generateFromModule(module)
    
    const tempPath = '/tmp/test.sketch'
    await expect(generator.exportToFile(tempPath)).resolves.not.toThrow()
    
    // 清理測試檔案
    await fs.unlink(tempPath)
  })
})
```

### 整合測試

```typescript
// __tests__/integration/SketchGeneration.test.ts
import { SketchGenerator } from '../../src/services/sketchGenerator/SketchGenerator'
import { createRealDesignModule } from '../helpers/designModuleHelper'

describe('Sketch Generation Integration', () => {
  test('should generate complete sketch file from real design module', async () => {
    const generator = new SketchGenerator({
      theme: 'default',
      layout: { type: 'responsive', breakpoints: ['mobile', 'tablet', 'desktop'] }
    })
    
    const module = createRealDesignModule()
    const sketch = await generator.generateFromModule(module)
    
    // 驗證生成的檔案結構
    expect(sketch.pages).toHaveLength(1)
    expect(sketch.pages[0].artboards).toHaveLength(3) // 三個斷點
    
    // 驗證組件數量
    const totalComponents = sketch.pages[0].artboards.reduce(
      (total, artboard) => total + (artboard.layers?.length || 0), 0
    )
    expect(totalComponents).toBeGreaterThan(0)
  })
})
```

## 🚀 部署與整合

### 1. Tauri 整合

```rust
// src-tauri/src/commands.rs
#[tauri::command]
pub async fn generate_sketch_from_module(
    module_data: String,
    output_path: String
) -> Result<String, String> {
    use crate::sketch_generator;
    
    match sketch_generator::generate_sketch(module_data, output_path).await {
        Ok(_) => Ok("Sketch 檔案生成成功".to_string()),
        Err(e) => Err(format!("Sketch 檔案生成失敗: {}", e))
    }
}
```

### 2. 前端整合

```typescript
// src/services/sketchGenerator/index.ts
export async function generateSketchFromModule(
  module: DesignModule,
  options: SketchGenerationOptions
): Promise<string> {
  try {
    const result = await invoke('generate_sketch_from_module', {
      moduleData: JSON.stringify(module),
      outputPath: options.outputPath
    })
    
    return result
  } catch (error) {
    throw new Error(`Sketch 生成失敗: ${error}`)
  }
}
```

### 3. UI 整合

```typescript
// src/pages/SketchGenerator.tsx
import { generateSketchFromModule } from '@/services/sketchGenerator'

const SketchGeneratorPage: React.FC = () => {
  const handleGenerateSketch = async () => {
    try {
      const result = await generateSketchFromModule(designModule, {
        outputPath: './output.sketch',
        theme: 'default',
        layout: 'responsive'
      })
      
      showSuccess('Sketch 檔案生成成功！')
    } catch (error) {
      showError('生成失敗', error.message)
    }
  }
  
  return (
    <div>
      <Button onClick={handleGenerateSketch}>
        生成 Sketch 檔案
      </Button>
    </div>
  )
}
```

## 📈 效能優化

### 1. 記憶體管理

```typescript
export class SketchGenerator {
  private objectPool: Map<string, any[]> = new Map()
  
  private getFromPool<T>(type: string): T | null {
    const pool = this.objectPool.get(type) || []
    return pool.pop() || null
  }
  
  private returnToPool(type: string, obj: any): void {
    if (!this.objectPool.has(type)) {
      this.objectPool.set(type, [])
    }
    this.objectPool.get(type)!.push(obj)
  }
}
```

### 2. 批次處理

```typescript
export class BatchSketchGenerator {
  async generateMultipleSketches(
    modules: DesignModule[],
    options: BatchGenerationOptions
  ): Promise<SketchGenerationResult[]> {
    const results: SketchGenerationResult[] = []
    const batchSize = options.batchSize || 5
    
    for (let i = 0; i < modules.length; i += batchSize) {
      const batch = modules.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(module => this.generateSingleSketch(module, options))
      )
      results.push(...batchResults)
    }
    
    return results
  }
}
```

## 🔒 安全性考量

### 1. 檔案路徑驗證

```typescript
export class SketchGenerator {
  private validateOutputPath(path: string): boolean {
    // 防止路徑遍歷攻擊
    const normalizedPath = path.normalize()
    const allowedDir = process.cwd()
    
    return normalizedPath.startsWith(allowedDir) && 
           !normalizedPath.includes('..')
  }
}
```

### 2. 輸入驗證

```typescript
export class SketchGenerator {
  private validateModule(module: any): boolean {
    // 驗證模組結構
    if (!module || typeof module !== 'object') {
      return false
    }
    
    if (!module.name || typeof module.name !== 'string') {
      return false
    }
    
    // 驗證組件數量限制
    if (module.components && module.components.length > 1000) {
      return false
    }
    
    return true
  }
}
```

---

**版本**: 1.0.0  
**更新日期**: 2024-08-22  
**作者**: ErSlice 開發團隊  
**授權**: Apache 2.0
