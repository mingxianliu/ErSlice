/**
 * ErIDL 生成器
 * 從 ErComponent 集合生成完整的 ErIDL 項目定義
 */

import {
  ErIDL,
  ScreenDefinition,
  ComponentDefinition,
  LayoutDefinition,
  InteractionDefinition,
  AnimationDefinition,
  DesignTokenDefinition,
  EntityDefinition,
  WorkflowDefinition,
  UserJourneyDefinition,
  BusinessRuleDefinition,
  ArchitectureDefinition,
  APIDefinition,
  StateManagementDefinition,
  RoutingDefinition,
  TestingDefinition,
  DeploymentDefinition,
  Framework,
  ScreenSize
} from '../types/erIDL';

import {
  ErComponent,
  ErComponentLibrary,
  ComponentRole
} from '../types/erComponent';

export interface ErIDLGenerationOptions {
  projectName: string;
  description?: string;
  author?: string;
  targetFrameworks: Framework[];
  figmaFileId?: string;
  figmaUrl?: string;
  includeBackend?: boolean;
  includeDeployment?: boolean;
  architecturePreset?: 'minimal' | 'standard' | 'enterprise';
}

export class ErIDLGenerator {
  /**
   * 從 ErComponent 庫生成完整的 ErIDL
   */
  static generateFromComponentLibrary(
    library: ErComponentLibrary,
    options: ErIDLGenerationOptions
  ): ErIDL {
    const erIDL: ErIDL = {
      // 元數據
      metadata: this.generateMetadata(library, options),
      
      // 設計定義
      design: this.generateDesignDefinitions(library),
      
      // 業務定義
      business: this.generateBusinessDefinitions(library),
      
      // 技術定義
      technical: this.generateTechnicalDefinitions(library, options),
      
      // 依賴關係
      dependencies: this.generateDependencies(library),
      
      // 配置
      configuration: this.generateConfiguration(options)
    };

    return erIDL;
  }

  /**
   * 生成項目元數據
   */
  private static generateMetadata(
    library: ErComponentLibrary,
    options: ErIDLGenerationOptions
  ) {
    return {
      projectName: options.projectName,
      version: '1.0.0',
      description: options.description || `ErSlice project generated from ${library.name}`,
      author: options.author || 'ErSlice Generator',
      createdAt: new Date(),
      updatedAt: new Date(),
      figmaFileId: options.figmaFileId || library.metadata.figmaFileId,
      figmaUrl: options.figmaUrl,
      targetFrameworks: options.targetFrameworks,
      designSystem: library.name
    };
  }

  /**
   * 生成設計定義
   */
  private static generateDesignDefinitions(library: ErComponentLibrary) {
    return {
      screens: this.generateScreenDefinitions(library),
      components: this.generateComponentDefinitions(library),
      layouts: this.generateLayoutDefinitions(library),
      interactions: this.generateInteractionDefinitions(library),
      animations: this.generateAnimationDefinitions(library),
      designTokens: this.convertDesignTokens(library),
      responsive: {
        breakpoints: {
          mobile: 375,
          tablet: 768,
          desktop: 1200,
          widescreen: 1920
        } as Record<ScreenSize, number>,
        strategy: 'mobile-first' as const
      }
    };
  }

  /**
   * 生成頁面定義
   */
  private static generateScreenDefinitions(library: ErComponentLibrary): ScreenDefinition[] {
    const componentsByPage = this.groupComponentsByPage(library.components);
    
    return Object.entries(componentsByPage).map(([pageName, components]) => ({
      id: this.generateId('screen', pageName),
      name: pageName,
      description: `${pageName} 頁面`,
      size: this.inferScreenSize(components),
      dimensions: this.calculateScreenDimensions(components),
      components: components.map(c => c.id),
      layout: this.inferPageLayout(components),
      interactions: this.extractPageInteractions(components),
      responsiveVariants: this.generateResponsiveVariants(components)
    }));
  }

  /**
   * 根據頁面對組件進行分組
   */
  private static groupComponentsByPage(components: ErComponent[]): Record<string, ErComponent[]> {
    const grouped: Record<string, ErComponent[]> = {};
    
    components.forEach(component => {
      const pageName = this.extractPageName(component);
      if (!grouped[pageName]) {
        grouped[pageName] = [];
      }
      grouped[pageName].push(component);
    });
    
    return grouped;
  }

  /**
   * 從組件中提取頁面名稱
   */
  private static extractPageName(component: ErComponent): string {
    // 從 Figma 名稱或組件名稱中推斷頁面名稱
    const name = component.design.originalName.toLowerCase();
    
    if (name.includes('home') || name.includes('main') || name.includes('index')) {
      return 'Home';
    } else if (name.includes('about')) {
      return 'About';
    } else if (name.includes('contact')) {
      return 'Contact';
    } else if (name.includes('product')) {
      return 'Product';
    } else if (name.includes('service')) {
      return 'Service';
    } else if (name.includes('login') || name.includes('signin')) {
      return 'Login';
    } else if (name.includes('register') || name.includes('signup')) {
      return 'Register';
    } else if (name.includes('dashboard')) {
      return 'Dashboard';
    } else if (name.includes('profile')) {
      return 'Profile';
    } else if (name.includes('setting')) {
      return 'Settings';
    } else {
      // 使用組件的業務目的作為頁面名稱
      return component.semantic.componentRole.charAt(0).toUpperCase() + 
             component.semantic.componentRole.slice(1);
    }
  }

  /**
   * 推斷螢幕尺寸
   */
  private static inferScreenSize(components: ErComponent[]): ScreenSize {
    const deviceTypes = components.map(c => c.design.deviceVariants[0]?.device);
    
    if (deviceTypes.includes('desktop')) return 'desktop';
    if (deviceTypes.includes('tablet')) return 'tablet';
    return 'mobile';
  }

  /**
   * 計算螢幕尺寸
   */
  private static calculateScreenDimensions(components: ErComponent[]) {
    // 基於組件尺寸計算頁面尺寸
    const maxWidth = Math.max(...components.map(c => 
      c.design.visualProperties.layout.width as number || 375
    ));
    const totalHeight = components.reduce((sum, c) => 
      sum + (c.design.visualProperties.layout.height as number || 100), 0
    );
    
    return {
      width: maxWidth,
      height: Math.max(totalHeight, 800)
    };
  }

  /**
   * 推斷頁面佈局
   */
  private static inferPageLayout(components: ErComponent[]): LayoutDefinition {
    // 分析組件排列模式
    const hasNavigation = components.some(c => c.semantic.componentRole === 'navigation');
    const hasContent = components.some(c => c.semantic.componentRole === 'content');
    
    if (hasNavigation && hasContent) {
      return {
        type: 'flex',
        direction: 'column',
        justify: 'start',
        align: 'stretch'
      };
    }
    
    return {
      type: 'flex',
      direction: 'column',
      justify: 'center',
      align: 'center'
    };
  }

  /**
   * 提取頁面交互
   */
  private static extractPageInteractions(components: ErComponent[]): InteractionDefinition[] {
    const interactions: InteractionDefinition[] = [];
    
    components.forEach(component => {
      component.semantic.userInteractions.forEach(interaction => {
        interactions.push({
          id: this.generateId('interaction', `${component.id}_${interaction.trigger}`),
          name: `${component.name} ${interaction.trigger}`,
          trigger: {
            type: interaction.trigger,
            target: component.id
          },
          action: {
            type: 'custom',
            parameters: interaction.parameters || {}
          },
          animation: interaction.animation ? {
            type: interaction.animation.type,
            duration: interaction.animation.duration,
            easing: interaction.animation.easing
          } : undefined
        });
      });
    });
    
    return interactions;
  }

  /**
   * 生成響應式變體
   */
  private static generateResponsiveVariants(components: ErComponent[]) {
    const variants = [];
    
    const sizes: ScreenSize[] = ['mobile', 'tablet', 'desktop'];
    
    sizes.forEach(size => {
      const adaptations = components
        .filter(c => c.design.deviceVariants.some(v => v.device === size))
        .map(c => ({
          property: 'width',
          from: '100%',
          to: size === 'mobile' ? '100%' : size === 'tablet' ? '80%' : '60%'
        }));
      
      if (adaptations.length > 0) {
        variants.push({
          size,
          adaptations
        });
      }
    });
    
    return variants;
  }

  /**
   * 生成組件定義
   */
  private static generateComponentDefinitions(library: ErComponentLibrary): ComponentDefinition[] {
    return library.components.map(component => ({
      id: this.generateId('component', component.name),
      erComponentId: component.id,
      instanceName: component.name,
      props: this.extractComponentProps(component),
      position: {
        x: 0,
        y: 0
      },
      constraints: this.convertLayoutConstraints(component),
      variations: this.generateComponentVariations(component)
    }));
  }

  /**
   * 提取組件 Props
   */
  private static extractComponentProps(component: ErComponent) {
    const props: Record<string, any> = {};
    
    // 從組件 API 中提取 props
    Object.entries(component.implementation.componentApi.props).forEach(([propName, propDef]) => {
      props[propName] = propDef.defaultValue;
    });
    
    return props;
  }

  /**
   * 轉換佈局約束
   */
  private static convertLayoutConstraints(component: ErComponent) {
    const layout = component.design.visualProperties.layout;
    
    return {
      width: {
        type: 'fixed' as const,
        value: layout.width as number
      },
      height: {
        type: 'fixed' as const,
        value: layout.height as number
      }
    };
  }

  /**
   * 生成組件變體
   */
  private static generateComponentVariations(component: ErComponent) {
    return component.design.stateVariants.map(variant => ({
      name: variant.state,
      condition: `state === "${variant.state}"`,
      props: {},
      style: variant.properties
    }));
  }

  /**
   * 生成佈局定義
   */
  private static generateLayoutDefinitions(library: ErComponentLibrary): LayoutDefinition[] {
    const layouts: LayoutDefinition[] = [];
    
    // 分析組件中的常見佈局模式
    const layoutPatterns = this.analyzeLayoutPatterns(library.components);
    
    Object.entries(layoutPatterns).forEach(([pattern, config]) => {
      layouts.push({
        type: config.type,
        direction: config.direction,
        justify: config.justify,
        align: config.align,
        gap: config.gap
      });
    });
    
    return layouts;
  }

  /**
   * 分析佈局模式
   */
  private static analyzeLayoutPatterns(components: ErComponent[]) {
    const patterns: Record<string, any> = {};
    
    components.forEach(component => {
      const layout = component.design.visualProperties.layout;
      const key = `${layout.display}_${layout.flexDirection || 'row'}`;
      
      if (!patterns[key]) {
        patterns[key] = {
          type: layout.display,
          direction: layout.flexDirection || 'row',
          justify: layout.justifyContent || 'flex-start',
          align: layout.alignItems || 'stretch',
          gap: layout.gap || 0
        };
      }
    });
    
    return patterns;
  }

  /**
   * 生成交互定義
   */
  private static generateInteractionDefinitions(library: ErComponentLibrary): InteractionDefinition[] {
    const interactions: InteractionDefinition[] = [];
    
    library.components.forEach(component => {
      component.semantic.userInteractions.forEach(interaction => {
        interactions.push({
          id: this.generateId('interaction', `${component.name}_${interaction.trigger}`),
          name: `${component.name} ${interaction.trigger} interaction`,
          trigger: {
            type: interaction.trigger,
            target: component.id
          },
          action: {
            type: 'custom',
            parameters: interaction.parameters || {}
          },
          animation: interaction.animation ? {
            type: interaction.animation.type,
            duration: interaction.animation.duration,
            easing: interaction.animation.easing
          } : undefined
        });
      });
    });
    
    return interactions;
  }

  /**
   * 生成動畫定義
   */
  private static generateAnimationDefinitions(library: ErComponentLibrary): AnimationDefinition[] {
    const animations: AnimationDefinition[] = [];
    
    library.components.forEach(component => {
      component.semantic.userInteractions.forEach(interaction => {
        if (interaction.animation) {
          animations.push({
            type: interaction.animation.type,
            duration: interaction.animation.duration,
            easing: interaction.animation.easing,
            delay: interaction.animation.delay,
            iterations: interaction.animation.iterations,
            direction: interaction.animation.direction
          });
        }
      });
    });
    
    return animations;
  }

  /**
   * 轉換設計令牌
   */
  private static convertDesignTokens(library: ErComponentLibrary): DesignTokenDefinition[] {
    const tokens: DesignTokenDefinition[] = [];
    
    library.designSystem.tokens.forEach(token => {
      tokens.push({
        id: this.generateId('token', token.tokenName),
        name: token.tokenName,
        category: token.tokenCategory,
        value: token.tokenValue,
        description: `${token.tokenCategory} token for ${token.usage} usage`,
        usage: [token.usage]
      });
    });
    
    return tokens;
  }

  /**
   * 生成業務定義
   */
  private static generateBusinessDefinitions(library: ErComponentLibrary) {
    return {
      entities: this.generateEntityDefinitions(library),
      workflows: this.generateWorkflowDefinitions(library),
      userJourneys: this.generateUserJourneyDefinitions(library),
      businessRules: this.generateBusinessRuleDefinitions(library),
      permissions: {
        roles: ['admin', 'user', 'guest'],
        policies: []
      }
    };
  }

  /**
   * 生成實體定義
   */
  private static generateEntityDefinitions(library: ErComponentLibrary): EntityDefinition[] {
    const entities: EntityDefinition[] = [];
    
    // 從組件中推斷數據實體
    const dataComponents = library.components.filter(c => 
      c.semantic.dataBinding && c.semantic.contentModel?.type === 'dynamic'
    );
    
    const entityNames = new Set<string>();
    
    dataComponents.forEach(component => {
      const entityName = this.inferEntityName(component);
      if (!entityNames.has(entityName)) {
        entityNames.add(entityName);
        
        entities.push({
          id: this.generateId('entity', entityName),
          name: entityName,
          description: `${entityName} entity inferred from ${component.name}`,
          attributes: this.inferEntityAttributes(component),
          relationships: [],
          validations: this.inferValidationRules(component),
          permissions: []
        });
      }
    });
    
    return entities;
  }

  /**
   * 推斷實體名稱
   */
  private static inferEntityName(component: ErComponent): string {
    const name = component.name.toLowerCase();
    
    if (name.includes('user')) return 'User';
    if (name.includes('product')) return 'Product';
    if (name.includes('order')) return 'Order';
    if (name.includes('article') || name.includes('post')) return 'Article';
    if (name.includes('comment')) return 'Comment';
    if (name.includes('category')) return 'Category';
    
    return component.name + 'Entity';
  }

  /**
   * 推斷實體屬性
   */
  private static inferEntityAttributes(component: ErComponent) {
    const attributes = [];
    
    if (component.semantic.contentModel?.structure) {
      Object.entries(component.semantic.contentModel.structure).forEach(([key, type]) => {
        attributes.push({
          name: key,
          type: type as any,
          required: true,
          description: `${key} attribute`
        });
      });
    }
    
    return attributes;
  }

  /**
   * 推斷驗證規則
   */
  private static inferValidationRules(component: ErComponent) {
    const rules = [];
    
    if (component.semantic.dataBinding?.validation) {
      const validation = component.semantic.dataBinding.validation;
      
      if (validation.required) {
        rules.push({
          field: 'value',
          rules: ['required'],
          message: 'This field is required'
        });
      }
      
      if (validation.minLength) {
        rules.push({
          field: 'value',
          rules: [`minLength:${validation.minLength}`],
          message: `Minimum length is ${validation.minLength}`
        });
      }
    }
    
    return rules;
  }

  /**
   * 生成工作流程定義
   */
  private static generateWorkflowDefinitions(library: ErComponentLibrary): WorkflowDefinition[] {
    // 基於組件角色和用戶故事生成基本工作流程
    const workflows: WorkflowDefinition[] = [];
    
    const hasAuth = library.components.some(c => 
      c.name.toLowerCase().includes('login') || c.name.toLowerCase().includes('auth')
    );
    
    if (hasAuth) {
      workflows.push({
        id: this.generateId('workflow', 'authentication'),
        name: 'User Authentication',
        description: 'User login and registration workflow',
        steps: [
          {
            id: 'login-form',
            name: 'Show Login Form',
            type: 'user-task',
            config: { form: 'login' },
            nextSteps: ['validate-credentials']
          },
          {
            id: 'validate-credentials',
            name: 'Validate Credentials',
            type: 'service-task',
            config: { service: 'auth' },
            nextSteps: ['redirect-dashboard']
          }
        ],
        triggers: [
          {
            type: 'manual',
            config: { button: 'login' }
          }
        ]
      });
    }
    
    return workflows;
  }

  /**
   * 生成用戶旅程定義
   */
  private static generateUserJourneyDefinitions(library: ErComponentLibrary): UserJourneyDefinition[] {
    const journeys: UserJourneyDefinition[] = [];
    
    // 基於頁面結構生成基本用戶旅程
    const pages = this.groupComponentsByPage(library.components);
    
    if (Object.keys(pages).length > 1) {
      journeys.push({
        id: this.generateId('journey', 'main-flow'),
        name: 'Main User Journey',
        description: 'Primary user journey through the application',
        persona: 'Primary User',
        goal: 'Complete primary task',
        stages: Object.keys(pages).map(pageName => ({
          id: this.generateId('stage', pageName),
          name: pageName,
          description: `User interacts with ${pageName} page`,
          actions: [`View ${pageName}`, `Interact with components`],
          emotions: ['curious', 'engaged'],
          painPoints: [],
          opportunities: ['Improve user experience'],
          screens: [this.generateId('screen', pageName)]
        })),
        touchpoints: [],
        metrics: [
          {
            name: 'Page Completion Rate',
            type: 'completion',
            target: 0.9
          }
        ]
      });
    }
    
    return journeys;
  }

  /**
   * 生成業務規則定義
   */
  private static generateBusinessRuleDefinitions(library: ErComponentLibrary): BusinessRuleDefinition[] {
    const rules: BusinessRuleDefinition[] = [];
    
    // 從組件驗證規則推斷業務規則
    library.components.forEach(component => {
      if (component.semantic.dataBinding?.validation) {
        const validation = component.semantic.dataBinding.validation;
        
        if (validation.required) {
          rules.push({
            id: this.generateId('rule', `${component.name}_required`),
            name: `${component.name} Required Validation`,
            description: `${component.name} field must be provided`,
            category: 'validation',
            condition: `${component.name}.value !== null && ${component.name}.value !== ''`,
            action: 'Allow submission',
            priority: 1,
            active: true
          });
        }
      }
    });
    
    return rules;
  }

  /**
   * 生成技術定義
   */
  private static generateTechnicalDefinitions(
    library: ErComponentLibrary,
    options: ErIDLGenerationOptions
  ) {
    return {
      architecture: this.generateArchitectureDefinition(options),
      apis: this.generateAPIDefinitions(library),
      stateManagement: this.generateStateManagementDefinition(library, options.targetFrameworks[0]),
      routing: this.generateRoutingDefinition(library),
      testing: this.generateTestingDefinition(options),
      deployment: this.generateDeploymentDefinition(options),
      security: this.generateSecurityConfiguration(),
      performance: {
        budgets: [
          {
            metric: 'bundle-size',
            target: 250000,
            warning: 200000,
            error: 300000
          }
        ],
        optimizations: ['code-splitting', 'tree-shaking', 'compression']
      }
    };
  }

  /**
   * 生成架構定義
   */
  private static generateArchitectureDefinition(options: ErIDLGenerationOptions): ArchitectureDefinition {
    const preset = options.architecturePreset || 'standard';
    
    const frontend = {
      framework: options.targetFrameworks[0],
      buildTool: 'vite' as const,
      packageManager: 'npm' as const,
      styling: 'css' as const,
      stateManagement: this.selectStateManagement(options.targetFrameworks[0]),
      routing: this.selectRouting(options.targetFrameworks[0]),
      testing: 'jest' as const,
      linting: 'eslint' as const,
      typeScript: true
    };
    
    const backend = options.includeBackend ? {
      framework: 'express' as const,
      language: 'typescript' as const,
      database: 'postgresql' as const,
      authentication: 'jwt' as const,
      apiStyle: 'rest' as const,
      caching: 'redis' as const,
      queues: 'none' as const,
      logging: 'winston' as const
    } : undefined;
    
    return {
      frontend,
      backend: backend!,
      database: {
        primary: 'postgresql',
        migrations: true,
        seeding: true,
        backup: {
          frequency: 'daily',
          retention: 30,
          location: 's3'
        },
        indexing: []
      },
      infrastructure: {
        hosting: 'vercel',
        containerization: 'docker',
        orchestration: 'none',
        cdn: 'cloudflare',
        monitoring: 'sentry',
        security: this.generateSecurityConfiguration()
      },
      integrations: []
    };
  }

  /**
   * 選擇狀態管理方案
   */
  private static selectStateManagement(framework: Framework) {
    const stateManagementMap: Record<Framework, any> = {
      'react': 'redux',
      'vue': 'pinia',
      'angular': 'ngrx',
      'react-native': 'redux',
      'flutter': 'bloc'
    };
    
    return stateManagementMap[framework] || 'context';
  }

  /**
   * 選擇路由方案
   */
  private static selectRouting(framework: Framework) {
    const routingMap: Record<Framework, any> = {
      'react': 'react-router',
      'vue': 'vue-router',
      'angular': 'angular-router',
      'react-native': 'react-navigation',
      'flutter': 'flutter-router'
    };
    
    return routingMap[framework] || 'react-router';
  }

  /**
   * 生成 API 定義
   */
  private static generateAPIDefinitions(library: ErComponentLibrary): APIDefinition[] {
    const apis: APIDefinition[] = [];
    
    // 從需要數據的組件推斷 API 需求
    const dataComponents = library.components.filter(c => 
      c.semantic.dataBinding && c.semantic.contentModel?.type === 'dynamic'
    );
    
    if (dataComponents.length > 0) {
      apis.push({
        id: this.generateId('api', 'main'),
        name: 'Main API',
        description: 'Primary API for application data',
        baseUrl: '/api/v1',
        version: '1.0.0',
        endpoints: this.generateEndpoints(dataComponents),
        authentication: {
          type: 'bearer',
          config: {}
        }
      });
    }
    
    return apis;
  }

  /**
   * 生成 API 端點
   */
  private static generateEndpoints(components: ErComponent[]) {
    const endpoints = [];
    
    const entityNames = new Set(components.map(c => this.inferEntityName(c)));
    
    entityNames.forEach(entityName => {
      const lowercaseName = entityName.toLowerCase();
      
      // CRUD 操作
      endpoints.push(
        {
          id: this.generateId('endpoint', `get-${lowercaseName}`),
          path: `/${lowercaseName}s`,
          method: 'GET' as const,
          description: `Get all ${lowercaseName}s`,
          responses: [
            {
              statusCode: 200,
              description: 'Success',
              schema: {
                type: 'array' as const,
                items: { type: 'object' as const }
              }
            }
          ]
        },
        {
          id: this.generateId('endpoint', `post-${lowercaseName}`),
          path: `/${lowercaseName}s`,
          method: 'POST' as const,
          description: `Create a new ${lowercaseName}`,
          requestBody: {
            contentType: 'application/json',
            schema: { type: 'object' as const },
            required: true
          },
          responses: [
            {
              statusCode: 201,
              description: 'Created'
            }
          ]
        }
      );
    });
    
    return endpoints;
  }

  /**
   * 生成狀態管理定義
   */
  private static generateStateManagementDefinition(
    library: ErComponentLibrary,
    framework: Framework
  ): StateManagementDefinition {
    const stores = [];
    
    // 為需要狀態管理的組件創建 store
    const statefulComponents = library.components.filter(c => 
      c.implementation.stateManagement.approach !== 'props'
    );
    
    if (statefulComponents.length > 0) {
      stores.push({
        name: 'AppStore',
        initialState: {
          user: null,
          loading: false,
          error: null
        },
        actions: [
          {
            name: 'setUser',
            payload: { type: 'object' as const },
            async: false
          },
          {
            name: 'setLoading',
            payload: { type: 'boolean' as const },
            async: false
          }
        ]
      });
    }
    
    return {
      approach: 'centralized',
      stores,
      middleware: [
        {
          name: 'logger',
          type: 'logger',
          config: { collapsed: true }
        }
      ]
    };
  }

  /**
   * 生成路由定義
   */
  private static generateRoutingDefinition(library: ErComponentLibrary): RoutingDefinition {
    const pages = this.groupComponentsByPage(library.components);
    
    const routes = Object.keys(pages).map(pageName => ({
      path: pageName === 'Home' ? '/' : `/${pageName.toLowerCase()}`,
      component: `${pageName}Page`,
      name: pageName,
      meta: {
        title: pageName,
        description: `${pageName} page`
      }
    }));
    
    return {
      type: 'client-side',
      routes,
      guards: [
        {
          name: 'auth',
          type: 'before',
          logic: 'Check if user is authenticated'
        }
      ]
    };
  }

  /**
   * 生成測試定義
   */
  private static generateTestingDefinition(options: ErIDLGenerationOptions): TestingDefinition {
    return {
      strategies: [
        {
          type: 'unit',
          framework: 'jest',
          config: {},
          patterns: ['**/*.test.{js,ts,jsx,tsx}']
        },
        {
          type: 'integration',
          framework: 'testing-library',
          config: {},
          patterns: ['**/*.integration.test.{js,ts,jsx,tsx}']
        }
      ],
      coverage: {
        threshold: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        },
        exclude: ['**/*.stories.{js,ts,jsx,tsx}'],
        reports: ['text', 'html', 'lcov']
      },
      ci: {
        provider: 'github-actions',
        triggers: ['push', 'pull_request'],
        steps: [
          {
            name: 'Install dependencies',
            command: 'npm ci'
          },
          {
            name: 'Run tests',
            command: 'npm test'
          }
        ]
      }
    };
  }

  /**
   * 生成部署定義
   */
  private static generateDeploymentDefinition(options: ErIDLGenerationOptions): DeploymentDefinition {
    return {
      environments: [
        {
          name: 'development',
          target: 'vercel',
          config: {},
          secrets: ['DATABASE_URL', 'JWT_SECRET'],
          variables: {
            NODE_ENV: 'development',
            API_URL: 'http://localhost:3000'
          }
        },
        {
          name: 'production',
          target: 'vercel',
          config: {},
          secrets: ['DATABASE_URL', 'JWT_SECRET'],
          variables: {
            NODE_ENV: 'production',
            API_URL: 'https://api.example.com'
          }
        }
      ],
      pipeline: {
        stages: [
          {
            name: 'Deploy to Development',
            environment: 'development',
            steps: ['build', 'test', 'deploy']
          },
          {
            name: 'Deploy to Production',
            environment: 'production',
            steps: ['build', 'test', 'deploy'],
            conditions: ['branch === main']
          }
        ]
      },
      rollback: {
        automatic: false,
        conditions: ['health_check_failed'],
        steps: ['restore_previous_version', 'notify_team']
      },
      monitoring: {
        metrics: [
          {
            name: 'response_time',
            type: 'histogram',
            description: 'HTTP response time'
          }
        ],
        alerts: [
          {
            name: 'High Error Rate',
            condition: 'error_rate > 0.05',
            severity: 'high',
            channels: ['slack', 'email']
          }
        ],
        dashboards: [
          {
            name: 'Application Overview',
            metrics: ['response_time', 'error_rate', 'throughput'],
            layout: 'grid'
          }
        ]
      }
    };
  }

  /**
   * 生成安全配置
   */
  private static generateSecurityConfiguration() {
    return {
      ssl: true,
      firewall: true,
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100
      },
      cors: {
        origin: ['http://localhost:3000'],
        credentials: true
      },
      helmet: true
    };
  }

  /**
   * 生成依賴關係
   */
  private static generateDependencies(library: ErComponentLibrary) {
    return {
      components: library.components.map(c => ({
        component: c.id,
        dependencies: c.relationships.dependencies,
        type: 'import' as const
      })),
      screens: [],
      apis: [],
      external: [
        {
          name: 'react',
          version: '^18.0.0',
          type: 'runtime' as const
        },
        {
          name: 'react-dom',
          version: '^18.0.0',
          type: 'runtime' as const
        }
      ]
    };
  }

  /**
   * 生成配置
   */
  private static generateConfiguration(options: ErIDLGenerationOptions) {
    return {
      build: {
        outputDir: 'dist',
        assetDir: 'assets',
        publicPath: '/',
        sourcemap: true,
        minify: true,
        target: ['es2015']
      },
      development: {
        port: 3000,
        host: 'localhost',
        hot: true,
        open: true,
        mock: false
      },
      production: {
        optimize: true,
        gzip: true,
        analyze: false,
        env: {
          NODE_ENV: 'production'
        }
      },
      feature_flags: [
        {
          name: 'new_ui',
          description: 'Enable new UI components',
          enabled: false,
          environments: ['development']
        }
      ]
    };
  }

  /**
   * 生成唯一 ID
   */
  private static generateId(prefix: string, name: string): string {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `${prefix}_${cleanName}_${Date.now()}`;
  }
}

export default ErIDLGenerator;