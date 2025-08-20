/**
 * ErComponent 工廠類
 * 負責從 Figma 分析結果創建 ErComponent 實例
 */

import {
  ErComponent,
  Framework,
  ComponentRole,
  DeviceType,
  StateType,
  LayoutProperties,
  StylingProperties,
  TypographyProperties,
  EffectProperties,
  DesignTokenReference,
  ResponsiveBehavior,
  InteractionPattern,
  A11ySpecification
} from '../types/erComponent';

import {
  FigmaAnalysisResult,
  ParsedAssetInfo,
  VisualAnalysisResult,
  ExtractedDesignTokens
} from './figmaAnalysisController';

export class ErComponentFactory {
  /**
   * 從 Figma 分析結果創建 ErComponent
   */
  static createFromFigmaAnalysis(
    analysis: FigmaAnalysisResult,
    figmaUrl?: string
  ): ErComponent {
    const component: ErComponent = {
      // 元數據
      id: this.generateComponentId(analysis.assetInfo.originalName),
      name: this.generateComponentName(analysis.assetInfo.originalName),
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // 設計層
      design: {
        figmaNodeId: analysis.figmaData?.id,
        originalName: analysis.assetInfo.originalName,
        figmaUrl,
        visualProperties: this.extractVisualProperties(analysis),
        designTokens: this.convertDesignTokens(analysis.designTokens),
        responsiveBehavior: this.inferResponsiveBehavior(analysis),
        deviceVariants: this.extractDeviceVariants(analysis),
        stateVariants: this.extractStateVariants(analysis)
      },
      
      // 語義層
      semantic: {
        componentRole: this.inferComponentRole(analysis),
        businessPurpose: this.generateBusinessPurpose(analysis),
        userStories: this.generateUserStories(analysis),
        userInteractions: this.extractInteractions(analysis),
        accessibilitySpecs: this.generateA11ySpecs(analysis),
        dataBinding: this.inferDataBinding(analysis),
        contentModel: this.inferContentModel(analysis)
      },
      
      // 實現層
      implementation: {
        targetFrameworks: [], // 將由代碼生成器填充
        componentApi: this.generateComponentAPI(analysis),
        stateManagement: this.inferStateManagement(analysis),
        performanceOptimizations: this.suggestOptimizations(analysis),
        testingSpecs: this.generateTestingSpecs(analysis),
        dependencies: this.inferDependencies(analysis)
      },
      
      // 協作層
      collaboration: {
        documentation: this.generateDocumentation(analysis),
        designerNotes: [],
        developerNotes: [],
        changeHistory: [{
          version: '1.0.0',
          timestamp: new Date(),
          author: 'ErSlice System',
          changes: ['Initial component creation from Figma analysis'],
          breaking: false
        }],
        reviewStatus: 'draft',
        tags: this.generateTags(analysis)
      },
      
      // 關係層
      relationships: {
        children: [],
        siblings: [],
        dependencies: [],
        variants: [],
        compositions: []
      }
    };

    return component;
  }

  /**
   * 生成唯一的組件 ID
   */
  private static generateComponentId(originalName: string): string {
    const timestamp = Date.now();
    const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, '');
    return `er_${cleanName}_${timestamp}`;
  }

  /**
   * 生成組件名稱
   */
  private static generateComponentName(originalName: string): string {
    // 將 kebab-case 或 snake_case 轉換為 PascalCase
    return originalName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\s/g, '');
  }

  /**
   * 提取視覺屬性
   */
  private static extractVisualProperties(analysis: FigmaAnalysisResult) {
    const layout: LayoutProperties = {
      display: analysis.visualAnalysis?.layout?.type === 'flex' ? 'flex' : 'block',
      width: analysis.figmaData?.absoluteBoundingBox?.width,
      height: analysis.figmaData?.absoluteBoundingBox?.height,
      position: 'relative'
    };

    const styling: StylingProperties = {
      backgroundColor: analysis.figmaData?.backgroundColor ? 
        this.rgbaToHex(analysis.figmaData.backgroundColor) : undefined,
      borderRadius: analysis.figmaData?.cornerRadius,
      opacity: analysis.figmaData?.opacity
    };

    const typography: TypographyProperties = analysis.figmaData?.style ? {
      fontFamily: analysis.figmaData.style.fontFamily,
      fontSize: analysis.figmaData.style.fontSize,
      fontWeight: analysis.figmaData.style.fontWeight,
      lineHeight: analysis.figmaData.style.lineHeightPx,
      letterSpacing: analysis.figmaData.style.letterSpacing,
      textAlign: analysis.figmaData.style.textAlignHorizontal?.toLowerCase() as any,
      color: analysis.figmaData.fills?.[0]?.color ? 
        this.rgbaToHex(analysis.figmaData.fills[0].color) : undefined
    } : undefined;

    const effects: EffectProperties = analysis.figmaData?.effects?.length ? {
      transition: analysis.figmaData.effects.map(effect => ({
        property: 'all',
        duration: 300,
        timingFunction: 'ease'
      }))
    } : undefined;

    return { layout, styling, typography, effects };
  }

  /**
   * 轉換設計令牌
   */
  private static convertDesignTokens(tokens: ExtractedDesignTokens): DesignTokenReference[] {
    const designTokens: DesignTokenReference[] = [];

    Object.entries(tokens.colors).forEach(([name, value]) => {
      designTokens.push({
        tokenName: `color-${name}`,
        tokenValue: value,
        tokenCategory: 'color',
        usage: name.includes('primary') ? 'primary' : 'neutral'
      });
    });

    Object.entries(tokens.typography).forEach(([name, value]) => {
      designTokens.push({
        tokenName: `typography-${name}`,
        tokenValue: value,
        tokenCategory: 'typography',
        usage: 'primary'
      });
    });

    Object.entries(tokens.spacing).forEach(([name, value]) => {
      designTokens.push({
        tokenName: `spacing-${name}`,
        tokenValue: value,
        tokenCategory: 'spacing',
        usage: 'primary'
      });
    });

    return designTokens;
  }

  /**
   * 推斷響應式行為
   */
  private static inferResponsiveBehavior(analysis: FigmaAnalysisResult): ResponsiveBehavior {
    const deviceType = analysis.assetInfo.device;
    
    return {
      breakpoints: [
        {
          device: 'mobile',
          minWidth: 375,
          properties: { width: '100%' }
        },
        {
          device: 'tablet',
          minWidth: 768,
          properties: { width: deviceType === 'tablet' ? '100%' : '80%' }
        },
        {
          device: 'desktop',
          minWidth: 1200,
          properties: { width: deviceType === 'desktop' ? '100%' : '60%' }
        }
      ],
      adaptationStrategy: 'mobile-first',
      flexibleContent: true
    };
  }

  /**
   * 提取設備變體
   */
  private static extractDeviceVariants(analysis: FigmaAnalysisResult) {
    const device = analysis.assetInfo.device;
    return [{
      device,
      properties: {
        width: device === 'mobile' ? '100%' : device === 'tablet' ? '80%' : '60%'
      }
    }];
  }

  /**
   * 提取狀態變體
   */
  private static extractStateVariants(analysis: FigmaAnalysisResult) {
    const state = analysis.assetInfo.state;
    const variants = [{ state: 'default' as StateType, properties: {} }];
    
    if (state !== 'default') {
      variants.push({
        state,
        properties: {
          opacity: state === 'disabled' ? 0.5 : state === 'hover' ? 0.8 : 1
        }
      });
    }
    
    return variants;
  }

  /**
   * 推斷組件角色
   */
  private static inferComponentRole(analysis: FigmaAnalysisResult): ComponentRole {
    const name = analysis.assetInfo.originalName.toLowerCase();
    
    if (name.includes('nav') || name.includes('menu') || name.includes('header')) {
      return 'navigation';
    } else if (name.includes('input') || name.includes('form') || name.includes('button')) {
      return 'input';
    } else if (name.includes('alert') || name.includes('toast') || name.includes('modal')) {
      return 'feedback';
    } else if (name.includes('layout') || name.includes('container') || name.includes('grid')) {
      return 'layout';
    } else if (name.includes('card') || name.includes('item') || name.includes('list')) {
      return 'content';
    } else {
      return 'display';
    }
  }

  /**
   * 生成業務目的描述
   */
  private static generateBusinessPurpose(analysis: FigmaAnalysisResult): string {
    const role = this.inferComponentRole(analysis);
    const name = analysis.assetInfo.originalName;
    
    const purposeMap: Record<ComponentRole, string> = {
      navigation: `${name} 組件用於網站導航，幫助用戶在應用中移動`,
      input: `${name} 組件用於收集用戶輸入，實現用戶與系統的交互`,
      feedback: `${name} 組件用於向用戶提供反饋信息，改善用戶體驗`,
      layout: `${name} 組件用於頁面佈局，組織和結構化內容`,
      content: `${name} 組件用於顯示內容，向用戶展示信息`,
      display: `${name} 組件用於視覺展示，提供豐富的用戶界面`,
      interactive: `${name} 組件提供交互功能，增強用戶參與度`
    };
    
    return purposeMap[role];
  }

  /**
   * 生成用戶故事
   */
  private static generateUserStories(analysis: FigmaAnalysisResult): string[] {
    const role = this.inferComponentRole(analysis);
    const name = analysis.assetInfo.originalName;
    
    const stories: Record<ComponentRole, string[]> = {
      navigation: [
        `作為用戶，我希望能夠快速找到${name}，以便導航到我需要的頁面`,
        `作為用戶，我希望${name}在不同設備上都能正常工作`
      ],
      input: [
        `作為用戶，我希望能夠輕鬆使用${name}輸入信息`,
        `作為用戶，我希望在輸入錯誤時能得到清晰的提示`
      ],
      feedback: [
        `作為用戶，我希望能夠及時收到${name}的反饋信息`,
        `作為用戶，我希望反饋信息清晰易懂`
      ],
      layout: [
        `作為用戶，我希望${name}能夠適應不同螢幕尺寸`,
        `作為用戶，我希望內容在${name}中排列整齊`
      ],
      content: [
        `作為用戶，我希望能夠清楚地看到${name}中的內容`,
        `作為用戶，我希望內容載入速度快`
      ],
      display: [
        `作為用戶，我希望${name}視覺上吸引人`,
        `作為用戶，我希望${name}在各種設備上都能正確顯示`
      ],
      interactive: [
        `作為用戶，我希望能夠與${name}進行互動`,
        `作為用戶，我希望互動回應迅速且直觀`
      ]
    };
    
    return stories[role] || [`作為用戶，我希望${name}能夠滿足我的需求`];
  }

  /**
   * 提取交互模式
   */
  private static extractInteractions(analysis: FigmaAnalysisResult): InteractionPattern[] {
    const role = this.inferComponentRole(analysis);
    const interactions: InteractionPattern[] = [];
    
    if (role === 'input' || role === 'interactive') {
      interactions.push({
        trigger: 'click',
        action: 'activate',
        animation: {
          type: 'scale',
          duration: 200,
          easing: 'ease-out'
        }
      });
    }
    
    if (role === 'navigation') {
      interactions.push({
        trigger: 'hover',
        action: 'highlight',
        animation: {
          type: 'fade',
          duration: 150,
          easing: 'ease'
        }
      });
    }
    
    return interactions;
  }

  /**
   * 生成無障礙性規格
   */
  private static generateA11ySpecs(analysis: FigmaAnalysisResult): A11ySpecification {
    const role = this.inferComponentRole(analysis);
    const name = analysis.assetInfo.originalName;
    
    const specs: A11ySpecification = {
      ariaLabel: name,
      tabIndex: role === 'input' || role === 'interactive' ? 0 : undefined,
      keyboardNavigation: {
        focusable: role === 'input' || role === 'interactive',
        shortcuts: role === 'input' ? [
          { key: 'Enter', action: 'submit' },
          { key: 'Escape', action: 'cancel' }
        ] : undefined
      },
      screenReader: {
        announcements: [`${name} 組件已載入`],
        liveRegion: role === 'feedback' ? 'polite' : 'off'
      }
    };
    
    return specs;
  }

  /**
   * 推斷數據綁定
   */
  private static inferDataBinding(analysis: FigmaAnalysisResult) {
    const role = this.inferComponentRole(analysis);
    
    if (role === 'input') {
      return {
        dataType: 'string' as const,
        validation: {
          required: true
        }
      };
    }
    
    if (role === 'content' || role === 'display') {
      return {
        dataType: 'object' as const
      };
    }
    
    return undefined;
  }

  /**
   * 推斷內容模型
   */
  private static inferContentModel(analysis: FigmaAnalysisResult) {
    const role = this.inferComponentRole(analysis);
    
    if (role === 'content') {
      return {
        type: 'dynamic' as const,
        structure: {
          title: 'string',
          description: 'string',
          image: 'string'
        }
      };
    }
    
    if (role === 'input') {
      return {
        type: 'user-generated' as const,
        structure: {
          value: 'string'
        }
      };
    }
    
    return {
      type: 'static' as const,
      structure: {}
    };
  }

  /**
   * 生成組件 API
   */
  private static generateComponentAPI(analysis: FigmaAnalysisResult) {
    const role = this.inferComponentRole(analysis);
    const props: any = {};
    
    if (role === 'input') {
      props.value = {
        type: 'string',
        required: false,
        description: '組件的值'
      };
      props.onChange = {
        type: 'function',
        required: false,
        description: '值變更時的回調函數'
      };
    }
    
    if (role === 'content' || role === 'display') {
      props.data = {
        type: 'object',
        required: false,
        description: '要顯示的數據'
      };
    }
    
    props.className = {
      type: 'string',
      required: false,
      description: '額外的 CSS 類名'
    };
    
    return {
      props,
      events: role === 'input' ? {
        change: {
          parameters: { value: 'string' },
          description: '值變更事件'
        }
      } : undefined
    };
  }

  /**
   * 推斷狀態管理策略
   */
  private static inferStateManagement(analysis: FigmaAnalysisResult) {
    const role = this.inferComponentRole(analysis);
    
    if (role === 'input') {
      return {
        approach: 'local' as const,
        stateShape: {
          value: 'string',
          isValid: 'boolean',
          isFocused: 'boolean'
        },
        actions: ['setValue', 'setValid', 'setFocused']
      };
    }
    
    return {
      approach: 'props' as const
    };
  }

  /**
   * 建議性能優化
   */
  private static suggestOptimizations(analysis: FigmaAnalysisResult) {
    const optimizations = [];
    
    if (analysis.visualAnalysis?.components && analysis.visualAnalysis.components.length > 5) {
      optimizations.push({
        type: 'virtualization' as const,
        config: { threshold: 10 },
        impact: 'high' as const,
        implementation: 'React.memo() 或 Vue 的 KeepAlive'
      });
    }
    
    optimizations.push({
      type: 'memoization' as const,
      config: { dependencies: ['props'] },
      impact: 'medium' as const,
      implementation: 'React.memo() 或 computed properties'
    });
    
    return optimizations;
  }

  /**
   * 生成測試規格
   */
  private static generateTestingSpecs(analysis: FigmaAnalysisResult) {
    const role = this.inferComponentRole(analysis);
    const name = analysis.assetInfo.originalName;
    
    return {
      unitTests: {
        framework: 'jest' as const,
        scenarios: [
          {
            name: `${name} 渲染測試`,
            description: '確保組件能正確渲染',
            setup: 'render(<Component />)',
            assertion: 'expect(component).toBeInTheDocument()'
          },
          ...(role === 'input' ? [{
            name: `${name} 交互測試`,
            description: '測試用戶輸入交互',
            setup: 'render(<Component />)',
            assertion: 'expect(onChange).toHaveBeenCalled()'
          }] : [])
        ]
      }
    };
  }

  /**
   * 推斷依賴關係
   */
  private static inferDependencies(analysis: FigmaAnalysisResult) {
    const role = this.inferComponentRole(analysis);
    
    return {
      external: role === 'input' ? ['react', 'classnames'] : ['react'],
      internal: [],
      peerDependencies: ['react', 'react-dom']
    };
  }

  /**
   * 生成文檔
   */
  private static generateDocumentation(analysis: FigmaAnalysisResult) {
    const name = analysis.assetInfo.originalName;
    const role = this.inferComponentRole(analysis);
    
    return {
      summary: `${name} 是一個 ${role} 組件`,
      description: `這是從 Figma 設計稿自動生成的 ${name} 組件，專門用於 ${role} 相關功能。`,
      usage: `導入並使用 <${this.generateComponentName(name)} /> 組件`,
      examples: [],
      bestPractices: [
        '確保組件在不同設備上都能正常顯示',
        '遵循無障礙性最佳實踐',
        '保持組件的純粹性和可重用性'
      ],
      troubleshooting: []
    };
  }

  /**
   * 生成標籤
   */
  private static generateTags(analysis: FigmaAnalysisResult): string[] {
    const tags = [
      analysis.assetInfo.device,
      analysis.assetInfo.module,
      analysis.assetInfo.page,
      analysis.assetInfo.state,
      this.inferComponentRole(analysis)
    ];
    
    return tags.filter(Boolean);
  }

  /**
   * RGBA 轉 HEX
   */
  private static rgbaToHex(rgba: { r: number; g: number; b: number; a?: number }): string {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
  }
}

export default ErComponentFactory;