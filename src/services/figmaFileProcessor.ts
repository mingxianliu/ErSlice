/**
 * Figma 檔案處理服務
 * 處理各種格式的 Figma 產出物，包括圖片、JSON、CSS、HTML 等
 */

import { FigmaAssetParser, FigmaJsonParser, ParsedAssetInfo, FigmaProjectData } from './figmaParser';

export interface ProcessedFigmaFile {
  file: File;
  parsedInfo: ParsedAssetInfo;
  processedData?: any;
  previewUrl?: string;
}

export interface FigmaImportResult {
  files: ProcessedFigmaFile[];
  projectData?: FigmaProjectData;
  structure: {
    byDevice: Record<string, ProcessedFigmaFile[]>;
    byModule: Record<string, ProcessedFigmaFile[]>;
    byPage: Record<string, ProcessedFigmaFile[]>;
  };
  summary: {
    totalFiles: number;
    successfulParsing: number;
    averageConfidence: number;
    supportedFormats: string[];
  };
}

export class FigmaFileProcessor {
  private assetParser: FigmaAssetParser;
  private jsonParser: FigmaJsonParser;

  constructor() {
    this.assetParser = new FigmaAssetParser();
    this.jsonParser = new FigmaJsonParser();
  }

  /**
   * 處理單個檔案
   */
  async processFile(file: File): Promise<ProcessedFigmaFile> {
    const parsedInfo = this.assetParser.parseFileName(file.name);
    const processedData = await this.processFileByType(file);
    const previewUrl = await this.generatePreviewUrl(file);

    return {
      file,
      parsedInfo,
      processedData,
      previewUrl
    };
  }

  /**
   * 批量處理檔案
   */
  async processFiles(files: File[]): Promise<FigmaImportResult> {
    const processedFiles: ProcessedFigmaFile[] = [];
    let projectData: FigmaProjectData | undefined;

    // 並行處理檔案
    for (const file of files) {
      try {
        const processed = await this.processFile(file);
        processedFiles.push(processed);

        // 如果是 JSON 檔案，嘗試解析為專案數據
        if (file.type === 'application/json' && !projectData) {
          projectData = await this.tryParseProjectJson(file);
        }
      } catch (error) {
        console.warn(`處理檔案 ${file.name} 時發生錯誤:`, error);
      }
    }

    return {
      files: processedFiles,
      projectData,
      structure: this.organizeFileStructure(processedFiles),
      summary: this.generateSummary(processedFiles)
    };
  }

  /**
   * 處理 ZIP 壓縮檔
   */
  async processZipFile(zipFile: File): Promise<FigmaImportResult> {
    const extractedFiles = await this.extractZipFiles(zipFile);
    return this.processFiles(extractedFiles);
  }

  /**
   * 根據檔案類型處理檔案內容
   */
  private async processFileByType(file: File): Promise<any> {
    switch (file.type) {
      case 'image/png':
      case 'image/jpeg':
      case 'image/jpg':
        return this.processImageFile(file);
      
      case 'image/svg+xml':
        return this.processSvgFile(file);
      
      case 'application/json':
        return this.processJsonFile(file);
      
      case 'text/css':
        return this.processCssFile(file);
      
      case 'text/html':
        return this.processHtmlFile(file);
      
      default:
        return this.processGenericFile(file);
    }
  }

  /**
   * 處理圖片檔案
   */
  private async processImageFile(file: File): Promise<ProcessedImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const imageData = ctx?.getImageData(0, 0, img.width, img.height);
        
        resolve({
          width: img.width,
          height: img.height,
          data: imageData!,
          aspectRatio: img.width / img.height,
          dominantColors: this.extractDominantColors(imageData!)
        });
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 處理 SVG 檔案
   */
  private async processSvgFile(file: File): Promise<SvgData> {
    const text = await file.text();
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(text, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    return {
      content: text,
      viewBox: svgElement.getAttribute('viewBox') || '',
      width: svgElement.getAttribute('width') || '',
      height: svgElement.getAttribute('height') || '',
      elements: this.extractSvgElements(svgElement),
      styles: this.extractSvgStyles(text)
    };
  }

  /**
   * 處理 JSON 檔案
   */
  private async processJsonFile(file: File): Promise<any> {
    const text = await file.text();
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`無法解析 JSON 檔案 ${file.name}: ${error}`);
    }
  }

  /**
   * 處理 CSS 檔案
   */
  private async processCssFile(file: File): Promise<CssData> {
    const text = await file.text();
    return {
      content: text,
      rules: this.extractCssRules(text),
      variables: this.extractCssVariables(text),
      mediaQueries: this.extractMediaQueries(text)
    };
  }

  /**
   * 處理 HTML 檔案
   */
  private async processHtmlFile(file: File): Promise<HtmlData> {
    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    return {
      content: text,
      structure: this.extractHtmlStructure(doc),
      styles: this.extractInlineStyles(doc),
      scripts: this.extractScripts(doc)
    };
  }

  /**
   * 處理通用檔案
   */
  private async processGenericFile(file: File): Promise<any> {
    if (file.type.startsWith('text/')) {
      return { content: await file.text() };
    }
    return { size: file.size, type: file.type };
  }

  /**
   * 生成檔案預覽 URL
   */
  private async generatePreviewUrl(file: File): Promise<string | undefined> {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return undefined;
  }

  /**
   * 嘗試解析專案 JSON 數據
   */
  private async tryParseProjectJson(file: File): Promise<FigmaProjectData | undefined> {
    try {
      const jsonData = await this.processJsonFile(file);
      if (this.isFigmaProjectJson(jsonData)) {
        return this.jsonParser.parseFigmaJson(jsonData);
      }
    } catch (error) {
      console.warn('無法解析為 Figma 專案 JSON:', error);
    }
    return undefined;
  }

  /**
   * 檢查是否為 Figma 專案 JSON
   */
  private isFigmaProjectJson(data: any): boolean {
    return data && 
           typeof data === 'object' && 
           (data.document || data.name || data.components || data.styles);
  }

  /**
   * 解壓 ZIP 檔案
   */
  private async extractZipFiles(_zipFile: File): Promise<File[]> {
    // 這裡需要使用 JSZip 或類似的庫來解壓檔案
    // 為了示例，我們返回空陣列
    console.warn('ZIP 檔案解壓功能尚未實現');
    return [];
  }

  /**
   * 組織檔案結構
   */
  private organizeFileStructure(files: ProcessedFigmaFile[]) {
    const byDevice: Record<string, ProcessedFigmaFile[]> = {};
    const byModule: Record<string, ProcessedFigmaFile[]> = {};
    const byPage: Record<string, ProcessedFigmaFile[]> = {};

    files.forEach(file => {
      const { device, module, page } = file.parsedInfo;

      // 按設備分組
      if (!byDevice[device]) byDevice[device] = [];
      byDevice[device].push(file);

      // 按模組分組
      if (!byModule[module]) byModule[module] = [];
      byModule[module].push(file);

      // 按頁面分組
      if (!byPage[page]) byPage[page] = [];
      byPage[page].push(file);
    });

    return { byDevice, byModule, byPage };
  }

  /**
   * 生成處理摘要
   */
  private generateSummary(files: ProcessedFigmaFile[]) {
    const totalFiles = files.length;
    const successfulParsing = files.filter(f => f.parsedInfo.confidence > 0).length;
    const averageConfidence = files.reduce((sum, f) => sum + f.parsedInfo.confidence, 0) / totalFiles;
    const supportedFormats = [...new Set(files.map(f => f.parsedInfo.format))];

    return {
      totalFiles,
      successfulParsing,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      supportedFormats
    };
  }

  /**
   * 提取圖片主色調
   */
  private extractDominantColors(imageData: globalThis.ImageData): string[] {
    // 簡化的主色調提取演算法
    const colors: Record<string, number> = {};
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 40) { // 取樣
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const color = `rgb(${r},${g},${b})`;
      colors[color] = (colors[color] || 0) + 1;
    }

    return Object.entries(colors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([color]) => color);
  }

  /**
   * 提取 SVG 元素
   */
  private extractSvgElements(svgElement: Element): any[] {
    const elements: any[] = [];
    const walk = (node: Element, depth = 0) => {
      elements.push({
        tagName: node.tagName,
        attributes: Array.from(node.attributes).reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {} as Record<string, string>),
        depth
      });

      Array.from(node.children).forEach(child => walk(child, depth + 1));
    };

    walk(svgElement);
    return elements;
  }

  /**
   * 提取 SVG 樣式
   */
  private extractSvgStyles(svgContent: string): Record<string, string> {
    const styleMatches = svgContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    const styles: Record<string, string> = {};
    
    styleMatches.forEach(match => {
      const content = match.replace(/<\/?style[^>]*>/gi, '');
      // 解析 CSS 規則
      const rules = content.match(/[^{]+\{[^}]+\}/g) || [];
      rules.forEach(rule => {
        const [selector, declarations] = rule.split('{');
        styles[selector.trim()] = declarations.replace('}', '').trim();
      });
    });

    return styles;
  }

  /**
   * 提取 CSS 規則
   */
  private extractCssRules(cssContent: string): CssRule[] {
    const rules: CssRule[] = [];
    const ruleMatches = cssContent.match(/[^{]+\{[^}]+\}/g) || [];
    
    ruleMatches.forEach(match => {
      const [selector, declarations] = match.split('{');
      const properties: Record<string, string> = {};
      
      declarations.replace('}', '').split(';').forEach(declaration => {
        const [property, value] = declaration.split(':');
        if (property && value) {
          properties[property.trim()] = value.trim();
        }
      });

      rules.push({
        selector: selector.trim(),
        properties
      });
    });

    return rules;
  }

  /**
   * 提取 CSS 變數
   */
  private extractCssVariables(cssContent: string): Record<string, string> {
    const variables: Record<string, string> = {};
    const variableMatches = cssContent.match(/--[\w-]+:\s*[^;]+/g) || [];
    
    variableMatches.forEach(match => {
      const [name, value] = match.split(':');
      variables[name.trim()] = value.trim();
    });

    return variables;
  }

  /**
   * 提取媒體查詢
   */
  private extractMediaQueries(cssContent: string): MediaQuery[] {
    const queries: MediaQuery[] = [];
    const mediaMatches = cssContent.match(/@media[^{]+\{[\s\S]*?\}\s*\}/g) || [];
    
    mediaMatches.forEach(match => {
      const conditionMatch = match.match(/@media\s*([^{]+)/);
      if (conditionMatch) {
        queries.push({
          condition: conditionMatch[1].trim(),
          content: match
        });
      }
    });

    return queries;
  }

  /**
   * 提取 HTML 結構
   */
  private extractHtmlStructure(doc: Document): HtmlElement[] {
    const elements: HtmlElement[] = [];
    
    const walk = (node: Element, depth = 0) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        elements.push({
          tagName: node.tagName.toLowerCase(),
          id: node.id || undefined,
          classes: Array.from(node.classList),
          attributes: Array.from(node.attributes).reduce((acc, attr) => {
            if (attr.name !== 'id' && attr.name !== 'class') {
              acc[attr.name] = attr.value;
            }
            return acc;
          }, {} as Record<string, string>),
          depth
        });

        Array.from(node.children).forEach(child => walk(child, depth + 1));
      }
    };

    if (doc.body) walk(doc.body);
    return elements;
  }

  /**
   * 提取內聯樣式
   */
  private extractInlineStyles(doc: Document): Record<string, Record<string, string>> {
    const styles: Record<string, Record<string, string>> = {};
    const elementsWithStyle = doc.querySelectorAll('[style]');
    
    elementsWithStyle.forEach((element, index) => {
      const style = element.getAttribute('style') || '';
      const properties: Record<string, string> = {};
      
      style.split(';').forEach(declaration => {
        const [property, value] = declaration.split(':');
        if (property && value) {
          properties[property.trim()] = value.trim();
        }
      });

      styles[`element-${index}`] = properties;
    });

    return styles;
  }

  /**
   * 提取腳本
   */
  private extractScripts(doc: Document): Script[] {
    const scripts: Script[] = [];
    const scriptElements = doc.querySelectorAll('script');
    
    scriptElements.forEach(script => {
      scripts.push({
        src: script.src || undefined,
        content: script.textContent || undefined,
        type: script.type || 'text/javascript'
      });
    });

    return scripts;
  }
}

// 介面定義
export interface ProcessedImageData {
  width: number;
  height: number;
  data: globalThis.ImageData;
  aspectRatio: number;
  dominantColors: string[];
}

export interface SvgData {
  content: string;
  viewBox: string;
  width: string;
  height: string;
  elements: any[];
  styles: Record<string, string>;
}

export interface CssData {
  content: string;
  rules: CssRule[];
  variables: Record<string, string>;
  mediaQueries: MediaQuery[];
}

export interface CssRule {
  selector: string;
  properties: Record<string, string>;
}

export interface MediaQuery {
  condition: string;
  content: string;
}

export interface HtmlData {
  content: string;
  structure: HtmlElement[];
  styles: Record<string, Record<string, string>>;
  scripts: Script[];
}

export interface HtmlElement {
  tagName: string;
  id?: string;
  classes: string[];
  attributes: Record<string, string>;
  depth: number;
}

export interface Script {
  src?: string;
  content?: string;
  type: string;
}