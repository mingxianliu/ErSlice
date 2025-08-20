// Figma 匯入器
export interface FigmaAsset {
  id: string
  name: string
  device: 'desktop' | 'tablet' | 'mobile'
  module: string
  page: string
  state?: string
  imageUrl: string
  scale: '1x' | '2x' | '3x'
  dimensions: { width: number; height: number }
}

export interface FigmaImportPackage {
  project: {
    name: string
    figmaFileId?: string
    figmaUrl?: string
    createdAt: string
  }
  assets: FigmaAsset[]
  sitemap?: {
    modules: string[]
    pages: Record<string, string[]>
    interactions: Array<{
      from: string
      to: string
      type: 'navigate' | 'modal' | 'state'
    }>
  }
}

export class FigmaImporter {
  // 解析 Figma Frame 命名
  static parseFrameName(name: string) {
    // 格式：Desktop_UserMgmt_List_Default
    const parts = name.split('_')
    
    return {
      device: parts[0]?.toLowerCase() as 'desktop' | 'tablet' | 'mobile',
      module: parts[1] || 'unknown',
      page: parts[2] || 'unknown', 
      state: parts[3] || 'default'
    }
  }

  // 從檔案名稱解析資產資訊
  static parseFileName(fileName: string) {
    // 支援格式：
    // desktop_usermgmt_list@2x.png
    // UserMgmt_List_Default@1x.png
    
    const withoutExt = fileName.replace(/\.(png|jpg|svg)$/i, '')
    const [namePart, scalePart] = withoutExt.split('@')
    
    const scale = scalePart || '1x'
    const parsed = this.parseFrameName(namePart.replace(/-/g, '_'))
    
    return { ...parsed, scale }
  }

  // 處理批量檔案匯入
  static async processBatchUpload(files: File[]): Promise<FigmaImportPackage> {
    const assets: FigmaAsset[] = []
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      
      const parsed = this.parseFileName(file.name)
      const imageUrl = URL.createObjectURL(file)
      
      // 獲取圖片尺寸
      const dimensions = await this.getImageDimensions(imageUrl)
      
      assets.push({
        id: `${parsed.device}_${parsed.module}_${parsed.page}_${parsed.state}`,
        name: `${parsed.module} - ${parsed.page}`,
        device: parsed.device,
        module: parsed.module,
        page: parsed.page,
        state: parsed.state,
        imageUrl,
        scale: parsed.scale as '1x' | '2x' | '3x',
        dimensions
      })
    }

    // 自動生成專案結構
    const modules = [...new Set(assets.map(a => a.module))]
    const pages: Record<string, string[]> = {}
    
    modules.forEach(module => {
      pages[module] = [...new Set(
        assets
          .filter(a => a.module === module)
          .map(a => a.page)
      )]
    })

    return {
      project: {
        name: `Figma Import ${new Date().toLocaleDateString()}`,
        createdAt: new Date().toISOString()
      },
      assets,
      sitemap: {
        modules,
        pages,
        interactions: [] // 需要手動補充或從命名規則推導
      }
    }
  }

  // 獲取圖片尺寸
  static getImageDimensions(imageUrl: string): Promise<{width: number, height: number}> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
        URL.revokeObjectURL(imageUrl)
      }
      img.src = imageUrl
    })
  }

  // 處理 ZIP 檔案匯入
  static async processZipUpload(zipFile: File): Promise<FigmaImportPackage> {
    // 使用 JSZip 處理 ZIP 檔案
    const JSZip = await import('jszip')
    const zip = new JSZip.default()
    const zipData = await zip.loadAsync(zipFile)
    
    const assets: FigmaAsset[] = []
    let metadata: any = null

    // 檢查是否有 metadata.json
    const metadataFile = zipData.file('metadata.json')
    if (metadataFile) {
      const metadataText = await metadataFile.async('text')
      metadata = JSON.parse(metadataText)
    }

    // 處理圖片檔案
    for (const [path, file] of Object.entries(zipData.files)) {
      if (file.dir || !path.match(/\.(png|jpg|svg)$/i)) continue
      
      const blob = await file.async('blob')
      const imageUrl = URL.createObjectURL(blob)
      const fileName = path.split('/').pop() || ''
      
      const parsed = this.parseFileName(fileName)
      const dimensions = await this.getImageDimensions(imageUrl)
      
      assets.push({
        id: `${parsed.device}_${parsed.module}_${parsed.page}_${parsed.state}`,
        name: `${parsed.module} - ${parsed.page}`,
        device: parsed.device,
        module: parsed.module,
        page: parsed.page,
        state: parsed.state,
        imageUrl,
        scale: parsed.scale as '1x' | '2x' | '3x',
        dimensions
      })
    }

    return {
      project: metadata?.project || {
        name: zipFile.name.replace('.zip', ''),
        createdAt: new Date().toISOString()
      },
      assets,
      sitemap: metadata?.sitemap
    }
  }

  // 生成站點圖 Mermaid 程式碼
  static generateSitemapMermaid(importPackage: FigmaImportPackage): string {
    const { sitemap } = importPackage
    if (!sitemap) return ''

    let mermaid = 'graph TD\n'
    
    // 生成模組節點
    sitemap.modules.forEach(module => {
      mermaid += `    ${module}[${module}]\n`
      
      // 生成頁面節點
      sitemap.pages[module]?.forEach(page => {
        const pageId = `${module}_${page}`
        mermaid += `    ${pageId}[${page}]\n`
        mermaid += `    ${module} --> ${pageId}\n`
      })
    })

    // 生成互動關係
    sitemap.interactions?.forEach(interaction => {
      const arrow = interaction.type === 'modal' ? '-.->': '-->'
      mermaid += `    ${interaction.from} ${arrow} ${interaction.to}\n`
    })

    return mermaid
  }
}

// Figma API 客戶端 (需要 Access Token)
export class FigmaAPIClient {
  constructor(private accessToken: string) {}

  async importFromFigmaFile(fileId: string): Promise<FigmaImportPackage> {
    try {
      // 獲取檔案資訊
      const fileData = await this.getFile(fileId)
      
      // 提取 Frame 資訊
      const frames = this.extractFrames(fileData.document)
      
      // 獲取圖片
      const nodeIds = frames.map(f => f.id)
      const images = await this.getFileImages(fileId, nodeIds)
      
      // 組合資料
      const assets: FigmaAsset[] = frames.map(frame => {
        const parsed = FigmaImporter.parseFrameName(frame.name)
        return {
          id: frame.id,
          name: frame.name,
          device: parsed.device,
          module: parsed.module,
          page: parsed.page,
          state: parsed.state,
          imageUrl: images.images[frame.id] || '',
          scale: '1x',
          dimensions: {
            width: frame.absoluteBoundingBox?.width || 0,
            height: frame.absoluteBoundingBox?.height || 0
          }
        }
      })

      return {
        project: {
          name: fileData.name,
          figmaFileId: fileId,
          figmaUrl: `https://www.figma.com/file/${fileId}`,
          createdAt: new Date().toISOString()
        },
        assets
      }
    } catch (error) {
      throw new Error(`Figma API 匯入失敗: ${error}`)
    }
  }

  private async getFile(fileId: string) {
    const response = await fetch(`https://api.figma.com/v1/files/${fileId}`, {
      headers: { 'X-Figma-Token': this.accessToken }
    })
    return response.json()
  }

  private async getFileImages(fileId: string, nodeIds: string[]) {
    const params = new URLSearchParams({
      ids: nodeIds.join(','),
      format: 'png',
      scale: '2'
    })
    
    const response = await fetch(
      `https://api.figma.com/v1/images/${fileId}?${params}`,
      { headers: { 'X-Figma-Token': this.accessToken }}
    )
    return response.json()
  }

  private extractFrames(node: any): any[] {
    const frames: any[] = []
    
    if (node.type === 'FRAME' && node.name.includes('_')) {
      frames.push(node)
    }
    
    if (node.children) {
      for (const child of node.children) {
        frames.push(...this.extractFrames(child))
      }
    }
    
    return frames
  }
}