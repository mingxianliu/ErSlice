/**
 * Figma 智能解析服務
 * 基於深度研究設計的四維解析系統 (Device/Module/Page/State)
 */

export interface ParsedAssetInfo {
  originalName: string;
  device: DeviceType;
  module: ModuleType;
  page: PageType;
  state: StateType;
  format: AssetFormat;
  scale: ScaleType;
  confidence: number; // 解析信心度 0-1
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'unknown';
export type ModuleType = 'user-management' | 'dashboard' | 'commerce' | 'auth' | 'content' | 'unknown';
export type PageType = 'list' | 'detail' | 'form' | 'landing' | 'unknown';
export type StateType = 'default' | 'hover' | 'active' | 'loading' | 'error' | 'success' | 'unknown';
export type AssetFormat = 'png' | 'jpg' | 'svg' | 'json' | 'css' | 'html';
export type ScaleType = '1x' | '2x' | '3x' | 'vector';

/**
 * 智能命名解析器
 * 基於模式識別和語意理解的檔名解析
 */
export class FigmaAssetParser {
  private devicePatterns = {
    desktop: [/desktop/i, /pc/i, /web/i, /1440/i, /1920/i, /\b(lg|xl)\b/i],
    tablet: [/tablet/i, /ipad/i, /768/i, /1024/i, /\bmd\b/i],
    mobile: [/mobile/i, /phone/i, /375/i, /414/i, /\b(sm|xs)\b/i]
  };

  private modulePatterns = {
    'user-management': [/user/i, /profile/i, /account/i, /member/i, /登入/i, /用戶/i],
    'dashboard': [/dashboard/i, /admin/i, /overview/i, /summary/i, /儀表板/i, /總覽/i],
    'commerce': [/shop/i, /cart/i, /product/i, /order/i, /payment/i, /商品/i, /購物/i],
    'auth': [/login/i, /register/i, /signup/i, /auth/i, /登入/i, /註冊/i],
    'content': [/article/i, /blog/i, /news/i, /content/i, /文章/i, /內容/i]
  };

  private pagePatterns = {
    list: [/list/i, /index/i, /grid/i, /catalog/i, /列表/i, /清單/i],
    detail: [/detail/i, /view/i, /show/i, /single/i, /詳情/i, /詳細/i],
    form: [/form/i, /edit/i, /create/i, /add/i, /表單/i, /編輯/i],
    landing: [/landing/i, /home/i, /intro/i, /welcome/i, /首頁/i, /歡迎/i]
  };

  private statePatterns = {
    hover: [/hover/i, /懸停/i],
    active: [/active/i, /selected/i, /激活/i, /選中/i],
    loading: [/loading/i, /spinner/i, /載入/i, /加載/i],
    error: [/error/i, /fail/i, /錯誤/i, /失敗/i],
    success: [/success/i, /done/i, /complete/i, /成功/i, /完成/i]
  };

  /**
   * 解析單個檔案名稱
   */
  parseFileName(fileName: string): ParsedAssetInfo {
    const cleanName = this.cleanFileName(fileName);
    const format = this.extractFormat(fileName);
    const scale = this.extractScale(fileName);
    
    const device = this.parseDevice(cleanName);
    const module = this.parseModule(cleanName);
    const page = this.parsePage(cleanName);
    const state = this.parseState(cleanName);
    
    const confidence = this.calculateConfidence(device, module, page, state);

    return {
      originalName: fileName,
      device,
      module,
      page,
      state,
      format,
      scale,
      confidence
    };
  }

  /**
   * 批量解析檔案名稱
   */
  parseFileNames(fileNames: string[]): ParsedAssetInfo[] {
    return fileNames.map(name => this.parseFileName(name));
  }

  /**
   * 清理檔案名稱，移除擴展名和特殊字符
   */
  private cleanFileName(fileName: string): string {
    return fileName
      .replace(/\.[^/.]+$/, '') // 移除擴展名
      .replace(/[@#$%^&*()_+=\[\]{}|\\:";'<>?,./]/g, ' ') // 替換特殊字符為空格
      .replace(/\s+/g, ' ') // 合併多個空格
      .trim()
      .toLowerCase();
  }

  /**
   * 提取檔案格式
   */
  private extractFormat(fileName: string): AssetFormat {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png': return 'png';
      case 'jpg':
      case 'jpeg': return 'jpg';
      case 'svg': return 'svg';
      case 'json': return 'json';
      case 'css': return 'css';
      case 'html':
      case 'htm': return 'html';
      default: return 'png'; // 預設
    }
  }

  /**
   * 提取縮放比例
   */
  private extractScale(fileName: string): ScaleType {
    if (fileName.includes('@3x') || fileName.includes('3x')) return '3x';
    if (fileName.includes('@2x') || fileName.includes('2x')) return '2x';
    if (fileName.includes('.svg')) return 'vector';
    return '1x';
  }

  /**
   * 解析設備類型
   */
  private parseDevice(cleanName: string): DeviceType {
    for (const [device, patterns] of Object.entries(this.devicePatterns)) {
      if (patterns.some(pattern => pattern.test(cleanName))) {
        return device as DeviceType;
      }
    }
    
    // 基於常見尺寸推斷
    const sizeMatch = cleanName.match(/(\d{3,4})/);
    if (sizeMatch) {
      const size = parseInt(sizeMatch[1]);
      if (size >= 1200) return 'desktop';
      if (size >= 768) return 'tablet';
      if (size >= 320) return 'mobile';
    }
    
    return 'unknown';
  }

  /**
   * 解析模組類型
   */
  private parseModule(cleanName: string): ModuleType {
    for (const [module, patterns] of Object.entries(this.modulePatterns)) {
      if (patterns.some(pattern => pattern.test(cleanName))) {
        return module as ModuleType;
      }
    }
    return 'unknown';
  }

  /**
   * 解析頁面類型
   */
  private parsePage(cleanName: string): PageType {
    for (const [page, patterns] of Object.entries(this.pagePatterns)) {
      if (patterns.some(pattern => pattern.test(cleanName))) {
        return page as PageType;
      }
    }
    return 'unknown';
  }

  /**
   * 解析狀態類型
   */
  private parseState(cleanName: string): StateType {
    for (const [state, patterns] of Object.entries(this.statePatterns)) {
      if (patterns.some(pattern => pattern.test(cleanName))) {
        return state as StateType;
      }
    }
    return 'default';
  }

  /**
   * 計算解析信心度
   */
  private calculateConfidence(
    device: DeviceType, 
    module: ModuleType, 
    page: PageType, 
    state: StateType
  ): number {
    let confidence = 0;
    
    // 每個維度的識別成功度
    if (device !== 'unknown') confidence += 0.25;
    if (module !== 'unknown') confidence += 0.25;
    if (page !== 'unknown') confidence += 0.25;
    if (state !== 'unknown') confidence += 0.25;
    
    return Math.round(confidence * 100) / 100;
  }

  /**
   * 生成智能建議的檔案結構
   */
  generateAssetStructure(parsedAssets: ParsedAssetInfo[]): AssetStructure {
    const structure: AssetStructure = {
      devices: {},
      modules: {},
      confidence: 0
    };

    // 按設備分組
    parsedAssets.forEach(asset => {
      if (!structure.devices[asset.device]) {
        structure.devices[asset.device] = [];
      }
      structure.devices[asset.device].push(asset);

      // 按模組分組
      if (!structure.modules[asset.module]) {
        structure.modules[asset.module] = [];
      }
      structure.modules[asset.module].push(asset);
    });

    // 計算整體信心度
    const totalConfidence = parsedAssets.reduce((sum, asset) => sum + asset.confidence, 0);
    structure.confidence = Math.round((totalConfidence / parsedAssets.length) * 100) / 100;

    return structure;
  }
}

export interface AssetStructure {
  devices: Record<DeviceType, ParsedAssetInfo[]>;
  modules: Record<ModuleType, ParsedAssetInfo[]>;
  confidence: number;
}

/**
 * Figma JSON 解析器
 * 處理從 Figma API 導出的 JSON 數據
 */
export class FigmaJsonParser {
  /**
   * 解析 Figma JSON 文件
   */
  parseFigmaJson(jsonData: any): FigmaProjectData {
    return {
      name: jsonData.name || 'Untitled Project',
      pages: this.parsePages(jsonData.document?.children || []),
      styles: this.parseStyles(jsonData.styles || {}),
      components: this.parseComponents(jsonData.componentSets || {}),
      designTokens: this.extractDesignTokens(jsonData)
    };
  }

  private parsePages(pages: any[]): FigmaPage[] {
    return pages.map(page => ({
      id: page.id,
      name: page.name,
      frames: this.parseFrames(page.children || [])
    }));
  }

  private parseFrames(frames: any[]): FigmaFrame[] {
    return frames.map(frame => ({
      id: frame.id,
      name: frame.name,
      width: frame.absoluteBoundingBox?.width || 0,
      height: frame.absoluteBoundingBox?.height || 0,
      elements: this.parseElements(frame.children || [])
    }));
  }

  private parseElements(elements: any[]): FigmaElement[] {
    return elements.map(element => ({
      id: element.id,
      name: element.name,
      type: element.type,
      styles: this.extractElementStyles(element),
      properties: this.extractElementProperties(element)
    }));
  }

  private parseStyles(styles: any): Record<string, any> {
    // 解析 Figma 樣式定義
    return styles;
  }

  private parseComponents(components: any): Record<string, any> {
    // 解析 Figma 組件定義
    return components;
  }

  private extractDesignTokens(jsonData: any): DesignTokens {
    return {
      colors: this.extractColors(jsonData),
      typography: this.extractTypography(jsonData),
      spacing: this.extractSpacing(jsonData),
      shadows: this.extractShadows(jsonData)
    };
  }

  private extractColors(jsonData: any): Record<string, string> {
    // 從 Figma JSON 中提取顏色令牌
    return {};
  }

  private extractTypography(jsonData: any): Record<string, any> {
    // 從 Figma JSON 中提取字體令牌
    return {};
  }

  private extractSpacing(jsonData: any): Record<string, number> {
    // 從 Figma JSON 中提取間距令牌
    return {};
  }

  private extractShadows(jsonData: any): Record<string, any> {
    // 從 Figma JSON 中提取陰影令牌
    return {};
  }

  private extractElementStyles(element: any): Record<string, any> {
    // 提取元素樣式
    return {};
  }

  private extractElementProperties(element: any): Record<string, any> {
    // 提取元素屬性
    return {};
  }
}

export interface FigmaProjectData {
  name: string;
  pages: FigmaPage[];
  styles: Record<string, any>;
  components: Record<string, any>;
  designTokens: DesignTokens;
}

export interface FigmaPage {
  id: string;
  name: string;
  frames: FigmaFrame[];
}

export interface FigmaFrame {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: FigmaElement[];
}

export interface FigmaElement {
  id: string;
  name: string;
  type: string;
  styles: Record<string, any>;
  properties: Record<string, any>;
}

export interface DesignTokens {
  colors: Record<string, string>;
  typography: Record<string, any>;
  spacing: Record<string, number>;
  shadows: Record<string, any>;
}