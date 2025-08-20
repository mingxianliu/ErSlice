/**
 * 設計令牌自動提取器
 * 從 Figma 產出物中智能提取設計系統令牌
 */

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  effects: EffectTokens;
  sizing: SizingTokens;
  borders: BorderTokens;
  animations: AnimationTokens;
}

export interface ColorTokens {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  semantic: SemanticColors;
  gradients: GradientToken[];
  custom: Record<string, string>;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // 主色
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  onBackground: string;
  onSurface: string;
}

export interface TypographyTokens {
  fontFamilies: Record<string, string>;
  fontWeights: Record<string, number>;
  fontSizes: Record<string, string>;
  lineHeights: Record<string, string>;
  letterSpacing: Record<string, string>;
  textStyles: Record<string, TextStyle>;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing?: string;
  textTransform?: string;
}

export interface SpacingTokens {
  base: number;
  scale: Record<string, string>;
  components: ComponentSpacing;
}

export interface ComponentSpacing {
  button: { padding: string; margin: string };
  card: { padding: string; margin: string };
  input: { padding: string; margin: string };
  modal: { padding: string; margin: string };
}

export interface EffectTokens {
  shadows: Record<string, string>;
  blurs: Record<string, string>;
  overlays: Record<string, string>;
}

export interface SizingTokens {
  breakpoints: Record<string, string>;
  containers: Record<string, string>;
  components: Record<string, ComponentSize>;
}

export interface ComponentSize {
  width: string;
  height: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
}

export interface BorderTokens {
  widths: Record<string, string>;
  styles: Record<string, string>;
  radii: Record<string, string>;
}

export interface AnimationTokens {
  durations: Record<string, string>;
  easings: Record<string, string>;
  transitions: Record<string, string>;
}

export interface GradientToken {
  name: string;
  type: 'linear' | 'radial' | 'conic';
  stops: Array<{ color: string; position: number }>;
  angle?: number;
}

export class DesignTokenExtractor {
  /**
   * 從 Figma JSON 數據中提取設計令牌
   */
  extractFromFigmaJson(figmaData: any): DesignTokens {
    return {
      colors: this.extractColors(figmaData),
      typography: this.extractTypography(figmaData),
      spacing: this.extractSpacing(figmaData),
      effects: this.extractEffects(figmaData),
      sizing: this.extractSizing(figmaData),
      borders: this.extractBorders(figmaData),
      animations: this.extractAnimations(figmaData)
    };
  }

  /**
   * 從 CSS 文件中提取設計令牌
   */
  extractFromCss(cssContent: string): Partial<DesignTokens> {
    const cssRules = this.parseCssRules(cssContent);
    const cssVariables = this.extractCssVariables(cssContent);

    return {
      colors: this.extractColorsFromCss(cssVariables, cssRules),
      typography: this.extractTypographyFromCss(cssVariables, cssRules),
      spacing: this.extractSpacingFromCss(cssVariables, cssRules),
      effects: this.extractEffectsFromCss(cssVariables, cssRules),
      borders: this.extractBordersFromCss(cssVariables, cssRules)
    };
  }

  /**
   * 從圖片中提取色彩令牌
   */
  extractColorsFromImage(_imageData: globalThis.ImageData, dominantColors: string[]): Partial<ColorTokens> {
    // const colorAnalysis = this.analyzeImageColors(imageData);
    
    return {
      custom: {
        'dominant-1': dominantColors[0] || '#000000',
        'dominant-2': dominantColors[1] || '#333333',
        'dominant-3': dominantColors[2] || '#666666',
        'dominant-4': dominantColors[3] || '#999999',
        'dominant-5': dominantColors[4] || '#cccccc',
      },
      primary: this.generateColorScale(dominantColors[0] || '#3b82f6'),
      neutral: this.generateColorScale('#64748b')
    };
  }

  /**
   * 從 SVG 中提取設計令牌
   */
  extractFromSvg(svgData: any): Partial<DesignTokens> {
    const colors = this.extractSvgColors(svgData);
    const spacing = this.extractSvgSpacing(svgData);
    const effects = this.extractSvgEffects(svgData);

    return { colors, spacing, effects };
  }

  /**
   * 提取顏色令牌
   */
  private extractColors(_figmaData: any): ColorTokens {
    const colors: ColorTokens = {
      primary: this.generateColorScale('#3b82f6'),
      secondary: this.generateColorScale('#8b5cf6'),
      neutral: this.generateColorScale('#64748b'),
      semantic: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        background: '#ffffff',
        surface: '#f8fafc',
        onBackground: '#1e293b',
        onSurface: '#334155'
      },
      gradients: [],
      custom: {}
    };

    // 從 Figma styles 中提取顏色
    if (figmaData.styles) {
      Object.entries(figmaData.styles).forEach(([key, style]: [string, any]) => {
        if (style.styleType === 'FILL') {
          const color = this.convertFigmaColorToHex(style);
          if (color) {
            colors.custom[this.sanitizeTokenName(style.name || key)] = color;
          }
        }
      });
    }

    return colors;
  }

  /**
   * 提取字體令牌
   */
  private extractTypography(_figmaData: any): TypographyTokens {
    const typography: TypographyTokens = {
      fontFamilies: {
        sans: 'Inter, system-ui, sans-serif',
        serif: 'Georgia, serif',
        mono: 'JetBrains Mono, monospace'
      },
      fontWeights: {
        thin: 100,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900
      },
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem'
      },
      lineHeights: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2'
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em'
      },
      textStyles: {}
    };

    // 從 Figma text styles 中提取
    if (figmaData.styles) {
      Object.entries(figmaData.styles).forEach(([key, style]: [string, any]) => {
        if (style.styleType === 'TEXT') {
          const textStyle = this.convertFigmaTextStyle(style);
          if (textStyle) {
            typography.textStyles[this.sanitizeTokenName(style.name || key)] = textStyle;
          }
        }
      });
    }

    return typography;
  }

  /**
   * 提取間距令牌
   */
  private extractSpacing(_figmaData: any): SpacingTokens {
    return {
      base: 4,
      scale: {
        0: '0px',
        px: '1px',
        0.5: '0.125rem',
        1: '0.25rem',
        1.5: '0.375rem',
        2: '0.5rem',
        2.5: '0.625rem',
        3: '0.75rem',
        3.5: '0.875rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
        11: '2.75rem',
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        28: '7rem',
        32: '8rem',
        36: '9rem',
        40: '10rem',
        44: '11rem',
        48: '12rem',
        52: '13rem',
        56: '14rem',
        60: '15rem',
        64: '16rem',
        72: '18rem',
        80: '20rem',
        96: '24rem'
      },
      components: {
        button: { padding: '0.5rem 1rem', margin: '0.25rem' },
        card: { padding: '1.5rem', margin: '1rem' },
        input: { padding: '0.75rem', margin: '0.5rem' },
        modal: { padding: '2rem', margin: '2rem' }
      }
    };
  }

  /**
   * 提取效果令牌
   */
  private extractEffects(_figmaData: any): EffectTokens {
    return {
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: '0 0 #0000'
      },
      blurs: {
        none: '0',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px'
      },
      overlays: {
        light: 'rgba(255, 255, 255, 0.9)',
        dark: 'rgba(0, 0, 0, 0.5)',
        modal: 'rgba(0, 0, 0, 0.75)'
      }
    };
  }

  /**
   * 提取尺寸令牌
   */
  private extractSizing(_figmaData: any): SizingTokens {
    return {
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      containers: {
        xs: '20rem',
        sm: '24rem',
        md: '28rem',
        lg: '32rem',
        xl: '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
        full: '100%'
      },
      components: {
        button: {
          width: 'auto',
          height: '2.5rem',
          minWidth: '4rem'
        },
        input: {
          width: '100%',
          height: '2.5rem',
          minWidth: '8rem'
        },
        card: {
          width: '100%',
          height: 'auto',
          minHeight: '8rem'
        }
      }
    };
  }

  /**
   * 提取邊框令牌
   */
  private extractBorders(_figmaData: any): BorderTokens {
    return {
      widths: {
        0: '0px',
        DEFAULT: '1px',
        2: '2px',
        4: '4px',
        8: '8px'
      },
      styles: {
        solid: 'solid',
        dashed: 'dashed',
        dotted: 'dotted',
        double: 'double',
        none: 'none'
      },
      radii: {
        none: '0px',
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      }
    };
  }

  /**
   * 提取動畫令牌
   */
  private extractAnimations(_figmaData: any): AnimationTokens {
    return {
      durations: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms'
      },
      easings: {
        linear: 'linear',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      transitions: {
        none: 'none',
        all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        colors: 'color, background-color, border-color, text-decoration-color, fill, stroke 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        shadow: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)'
      }
    };
  }

  /**
   * 生成色彩階層
   */
  private generateColorScale(baseColor: string): ColorScale {
    // 這是一個簡化的色彩階層生成器
    // 實際使用中可以使用更複雜的色彩理論算法
    return {
      50: this.lightenColor(baseColor, 0.95),
      100: this.lightenColor(baseColor, 0.9),
      200: this.lightenColor(baseColor, 0.8),
      300: this.lightenColor(baseColor, 0.6),
      400: this.lightenColor(baseColor, 0.4),
      500: baseColor,
      600: this.darkenColor(baseColor, 0.1),
      700: this.darkenColor(baseColor, 0.2),
      800: this.darkenColor(baseColor, 0.3),
      900: this.darkenColor(baseColor, 0.4),
      950: this.darkenColor(baseColor, 0.5)
    };
  }

  /**
   * 淡化顏色
   */
  private lightenColor(color: string, amount: number): string {
    // 簡化的顏色淡化實作
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.floor((num >> 16) + ((255 - (num >> 16)) * amount)));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + ((255 - ((num >> 8) & 0x00FF)) * amount)));
    const b = Math.min(255, Math.floor((num & 0x0000FF) + ((255 - (num & 0x0000FF)) * amount)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  /**
   * 加深顏色
   */
  private darkenColor(color: string, amount: number): string {
    // 簡化的顏色加深實作
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
    const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  /**
   * 轉換 Figma 顏色為 Hex
   */
  private convertFigmaColorToHex(style: any): string | null {
    // Figma 顏色轉換邏輯
    if (style.fills && style.fills[0]) {
      const fill = style.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        const { r, g, b } = fill.color;
        const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      }
    }
    return null;
  }

  /**
   * 轉換 Figma 文字樣式
   */
  private convertFigmaTextStyle(style: any): TextStyle | null {
    if (style.style) {
      return {
        fontFamily: style.style.fontFamily || 'Inter',
        fontSize: `${style.style.fontSize || 16}px`,
        fontWeight: style.style.fontWeight || 400,
        lineHeight: style.style.lineHeightPercent ? `${style.style.lineHeightPercent}%` : 'normal',
        letterSpacing: style.style.letterSpacing ? `${style.style.letterSpacing}px` : undefined
      };
    }
    return null;
  }

  /**
   * 清理令牌名稱
   */
  private sanitizeTokenName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * 解析 CSS 規則
   */
  private parseCssRules(cssContent: string): Record<string, Record<string, string>> {
    const rules: Record<string, Record<string, string>> = {};
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

      rules[selector.trim()] = properties;
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
   * 從 CSS 中提取顏色
   */
  private extractColorsFromCss(variables: Record<string, string>, rules: Record<string, Record<string, string>>): Partial<ColorTokens> {
    const colors: Record<string, string> = {};
    
    // 從 CSS 變數中提取顏色
    Object.entries(variables).forEach(([name, value]) => {
      if (this.isColorValue(value)) {
        colors[this.sanitizeTokenName(name.replace('--', ''))] = value;
      }
    });

    return { custom: colors };
  }

  /**
   * 從 CSS 中提取字體
   */
  private extractTypographyFromCss(variables: Record<string, string>, rules: Record<string, Record<string, string>>): Partial<TypographyTokens> {
    const typography: Partial<TypographyTokens> = {
      fontFamilies: {},
      fontSizes: {},
      fontWeights: {},
      lineHeights: {}
    };

    // 從 CSS 變數和規則中提取字體相關令牌
    Object.entries(variables).forEach(([name, value]) => {
      const cleanName = this.sanitizeTokenName(name.replace('--', ''));
      
      if (name.includes('font-family')) {
        typography.fontFamilies![cleanName] = value;
      } else if (name.includes('font-size')) {
        typography.fontSizes![cleanName] = value;
      } else if (name.includes('font-weight')) {
        typography.fontWeights![cleanName] = parseInt(value) || 400;
      } else if (name.includes('line-height')) {
        typography.lineHeights![cleanName] = value;
      }
    });

    return typography;
  }

  /**
   * 從 CSS 中提取間距
   */
  private extractSpacingFromCss(variables: Record<string, string>, rules: Record<string, Record<string, string>>): Partial<SpacingTokens> {
    const spacing: Record<string, string> = {};

    Object.entries(variables).forEach(([name, value]) => {
      if (name.includes('spacing') || name.includes('margin') || name.includes('padding')) {
        spacing[this.sanitizeTokenName(name.replace('--', ''))] = value;
      }
    });

    return {
      scale: spacing
    };
  }

  /**
   * 從 CSS 中提取效果
   */
  private extractEffectsFromCss(variables: Record<string, string>, rules: Record<string, Record<string, string>>): Partial<EffectTokens> {
    const effects: Partial<EffectTokens> = {
      shadows: {},
      blurs: {}
    };

    Object.entries(variables).forEach(([name, value]) => {
      const cleanName = this.sanitizeTokenName(name.replace('--', ''));
      
      if (name.includes('shadow')) {
        effects.shadows![cleanName] = value;
      } else if (name.includes('blur')) {
        effects.blurs![cleanName] = value;
      }
    });

    return effects;
  }

  /**
   * 從 CSS 中提取邊框
   */
  private extractBordersFromCss(variables: Record<string, string>, rules: Record<string, Record<string, string>>): Partial<BorderTokens> {
    const borders: Partial<BorderTokens> = {
      widths: {},
      radii: {}
    };

    Object.entries(variables).forEach(([name, value]) => {
      const cleanName = this.sanitizeTokenName(name.replace('--', ''));
      
      if (name.includes('border-width')) {
        borders.widths![cleanName] = value;
      } else if (name.includes('border-radius') || name.includes('radius')) {
        borders.radii![cleanName] = value;
      }
    });

    return borders;
  }

  /**
   * 從 SVG 中提取顏色
   */
  private extractSvgColors(svgData: any): Partial<ColorTokens> {
    const colors: Record<string, string> = {};
    
    // 從 SVG 元素中提取顏色
    if (svgData.elements) {
      svgData.elements.forEach((element: any, index: number) => {
        if (element.attributes.fill && element.attributes.fill !== 'none') {
          colors[`svg-fill-${index}`] = element.attributes.fill;
        }
        if (element.attributes.stroke && element.attributes.stroke !== 'none') {
          colors[`svg-stroke-${index}`] = element.attributes.stroke;
        }
      });
    }

    return { custom: colors };
  }

  /**
   * 從 SVG 中提取間距
   */
  private extractSvgSpacing(svgData: any): Partial<SpacingTokens> {
    // SVG 間距提取邏輯
    return {
      scale: {}
    };
  }

  /**
   * 從 SVG 中提取效果
   */
  private extractSvgEffects(svgData: any): Partial<EffectTokens> {
    // SVG 效果提取邏輯
    return {
      shadows: {},
      blurs: {}
    };
  }

  /**
   * 分析圖片顏色
   */
  private analyzeImageColors(imageData: ImageData): any {
    // 圖片顏色分析邏輯
    return {};
  }

  /**
   * 檢查是否為顏色值
   */
  private isColorValue(value: string): boolean {
    return /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\()/i.test(value.trim());
  }
}