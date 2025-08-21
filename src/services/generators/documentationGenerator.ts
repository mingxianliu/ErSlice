/**
 * 文檔生成器
 * 從 ErComponent 和 ErIDL 生成完整的項目文檔
 */

import {
  ErComponent,
  ErComponentLibrary,
  ComponentRole
} from '../../types/erComponent';

import {
  ErIDL,
  ScreenDefinition,
  ComponentDefinition,
  APIDefinition
} from '../../types/erIDL';

export interface DocumentationOptions {
  includeAPIReference?: boolean;
  includeComponentLibrary?: boolean;
  includeDesignSystem?: boolean;
  includeUserGuides?: boolean;
  includeDeveloperGuides?: boolean;
  includeDeploymentGuides?: boolean;
  format?: 'markdown' | 'html' | 'pdf';
  language?: 'en' | 'zh-TW' | 'zh-CN' | 'ja';
  includeInteractive?: boolean;
  generateSitemap?: boolean;
}

export interface DocumentationOutput {
  readme: string;
  componentDocs: ComponentDocumentationFile[];
  apiDocs: string;
  designSystemDocs: string;
  userGuide: string;
  developerGuide: string;
  deploymentGuide: string;
  changelog: string;
  contributingGuide: string;
  sitemap?: string;
  storybook?: string;
}

export interface ComponentDocumentationFile {
  componentName: string;
  fileName: string;
  content: string;
  examples: CodeExample[];
  props: PropDocumentation[];
  events: EventDocumentation[];
  methods: MethodDocumentation[];
}

export interface CodeExample {
  title: string;
  description: string;
  code: string;
  framework: string;
  interactive?: boolean;
}

export interface PropDocumentation {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
  examples: string[];
}

export interface EventDocumentation {
  name: string;
  parameters: { name: string; type: string; description: string }[];
  description: string;
  examples: string[];
}

export interface MethodDocumentation {
  name: string;
  parameters: { name: string; type: string; description: string }[];
  returnType: string;
  description: string;
  examples: string[];
}

export class DocumentationGenerator {
  /**
   * 從 ErIDL 生成完整的項目文檔
   */
  static generateProjectDocumentation(
    erIDL: ErIDL,
    componentLibrary: ErComponentLibrary,
    options: DocumentationOptions = {}
  ): DocumentationOutput {
    const opts = this.mergeOptions(options);
    
    return {
      readme: this.generateREADME(erIDL, opts),
      componentDocs: this.generateComponentDocs(componentLibrary, opts),
      apiDocs: this.generateAPIDocs(erIDL, opts),
      designSystemDocs: this.generateDesignSystemDocs(componentLibrary, opts),
      userGuide: this.generateUserGuide(erIDL, opts),
      developerGuide: this.generateDeveloperGuide(erIDL, componentLibrary, opts),
      deploymentGuide: this.generateDeploymentGuide(erIDL, opts),
      changelog: this.generateChangelog(erIDL, opts),
      contributingGuide: this.generateContributingGuide(erIDL, opts),
      sitemap: opts.generateSitemap ? this.generateSitemap(erIDL, opts) : undefined,
      storybook: opts.includeInteractive ? this.generateStorybookConfig(componentLibrary, opts) : undefined
    };
  }

  /**
   * 合併選項
   */
  private static mergeOptions(options: DocumentationOptions): Required<DocumentationOptions> {
    return {
      includeAPIReference: true,
      includeComponentLibrary: true,
      includeDesignSystem: true,
      includeUserGuides: true,
      includeDeveloperGuides: true,
      includeDeploymentGuides: true,
      format: 'markdown',
      language: 'zh-TW',
      includeInteractive: true,
      generateSitemap: true,
      ...options
    };
  }

  /**
   * 生成 README.md
   */
  private static generateREADME(
    erIDL: ErIDL,
    options: Required<DocumentationOptions>
  ): string {
    const lang = options.language;
    const texts = this.getLocalizedTexts(lang);
    
    return `# ${erIDL.metadata.projectName}

> ${erIDL.metadata.description}

${this.generateBadges(erIDL)}

## ${texts.overview}

${this.generateProjectOverview(erIDL, texts)}

## ${texts.features}

${this.generateFeatureList(erIDL, texts)}

## ${texts.quickStart}

\`\`\`bash
# ${texts.install}
npm install

# ${texts.development}
npm run dev

# ${texts.build}
npm run build

# ${texts.test}
npm test
\`\`\`

## ${texts.projectStructure}

${this.generateProjectStructure(erIDL, texts)}

## ${texts.documentation}

- 📖 [${texts.userGuide}](./docs/user-guide.md)
- 🔧 [${texts.developerGuide}](./docs/developer-guide.md)
- 📋 [${texts.apiReference}](./docs/api-reference.md)
- 🎨 [${texts.designSystem}](./docs/design-system.md)
- 🚀 [${texts.deploymentGuide}](./docs/deployment-guide.md)

## ${texts.techStack}

${this.generateTechStack(erIDL, texts)}

## ${texts.browser}

${this.generateBrowserSupport(erIDL, texts)}

## ${texts.contributing}

${texts.seeContributingGuide} [${texts.contributingGuide}](./CONTRIBUTING.md)${texts.contributingDetails}

## ${texts.license}

${texts.licenseText}

## ${texts.generated}

${texts.generatedByErSlice}

---

*${texts.lastUpdated}: ${new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-TW')}*`;
  }

  /**
   * 生成組件文檔
   */
  private static generateComponentDocs(
    library: ErComponentLibrary,
    options: Required<DocumentationOptions>
  ): ComponentDocumentationFile[] {
    return library.components.map(component => ({
      componentName: component.name,
      fileName: `${this.formatFileName(component.name)}.md`,
      content: this.generateComponentDocContent(component, options),
      examples: this.generateComponentExamples(component, options),
      props: this.generatePropsDocumentation(component, options),
      events: this.generateEventsDocumentation(component, options),
      methods: this.generateMethodsDocumentation(component, options)
    }));
  }

  /**
   * 生成組件文檔內容
   */
  private static generateComponentDocContent(
    component: ErComponent,
    options: Required<DocumentationOptions>
  ): string {
    const texts = this.getLocalizedTexts(options.language);
    
    return `# ${component.name}

> ${component.semantic.businessPurpose}

## ${texts.overview}

${component.collaboration.documentation.description}

### ${texts.componentRole}
- **${texts.role}**: ${component.semantic.componentRole}
- **${texts.category}**: ${this.getCategoryName(component.semantic.componentRole, options.language)}

## ${texts.usage}

### ${texts.basicUsage}

${this.generateUsageExamples(component, options)}

## ${texts.props}

${this.generatePropsTable(component, options)}

## ${texts.events}

${this.generateEventsTable(component, options)}

## ${texts.examples}

${this.generateExamplesSection(component, options)}

## ${texts.designSpecs}

${this.generateDesignSpecs(component, options)}

## ${texts.accessibility}

${this.generateAccessibilityInfo(component, options)}

## ${texts.bestPractices}

${component.collaboration.documentation.bestPractices.map(practice => `- ${practice}`).join('\n')}

## ${texts.troubleshooting}

${this.generateTroubleshootingSection(component, options)}

---

*${texts.generatedFrom}: ${component.design.figmaUrl || 'Figma'} | ${texts.lastUpdated}: ${component.updatedAt.toLocaleDateString()}*`;
  }

  /**
   * 生成 API 文檔
   */
  private static generateAPIDocs(
    erIDL: ErIDL,
    options: Required<DocumentationOptions>
  ): string {
    if (!options.includeAPIReference) {
      return '';
    }
    
    const texts = this.getLocalizedTexts(options.language);
    
    let docs = `# ${texts.apiReference}

${texts.apiOverview}

## ${texts.baseURL}

\`\`\`
${erIDL.technical.apis[0]?.baseUrl || '/api/v1'}
\`\`\`

## ${texts.authentication}

${this.generateAuthenticationDocs(erIDL, texts)}

## ${texts.endpoints}

`;
    
    erIDL.technical.apis.forEach(api => {
      docs += this.generateAPIEndpointDocs(api, texts);
    });
    
    docs += `
## ${texts.errorHandling}

${this.generateErrorHandlingDocs(erIDL, texts)}

## ${texts.rateLimit}

${this.generateRateLimitDocs(erIDL, texts)}`;
    
    return docs;
  }

  /**
   * 生成設計系統文檔
   */
  private static generateDesignSystemDocs(
    library: ErComponentLibrary,
    options: Required<DocumentationOptions>
  ): string {
    if (!options.includeDesignSystem) {
      return '';
    }
    
    const texts = this.getLocalizedTexts(options.language);
    
    return `# ${texts.designSystem}

${texts.designSystemOverview}

## ${texts.designTokens}

${this.generateDesignTokensDocs(library, texts)}

## ${texts.colorPalette}

${this.generateColorPaletteDocs(library, texts)}

## ${texts.typography}

${this.generateTypographyDocs(library, texts)}

## ${texts.spacing}

${this.generateSpacingDocs(library, texts)}

## ${texts.componentLibrary}

${this.generateComponentLibraryDocs(library, texts)}

## ${texts.designPatterns}

${this.generateDesignPatternsDocs(library, texts)}

## ${texts.guidelines}

${library.designSystem.guidelines.map(guideline => `- ${guideline}`).join('\n')}`;
  }

  /**
   * 生成用戶指南
   */
  private static generateUserGuide(
    erIDL: ErIDL,
    options: Required<DocumentationOptions>
  ): string {
    if (!options.includeUserGuides) {
      return '';
    }
    
    const texts = this.getLocalizedTexts(options.language);
    
    return `# ${texts.userGuide}

${texts.userGuideIntro}

## ${texts.gettingStarted}

### ${texts.systemRequirements}

${this.generateSystemRequirements(erIDL, texts)}

### ${texts.installation}

${this.generateInstallationSteps(erIDL, texts)}

## ${texts.userJourneys}

${erIDL.business.userJourneys.map(journey => 
  this.generateUserJourneyDocs(journey, texts)
).join('\n\n')}

## ${texts.features}

${this.generateFeatureGuides(erIDL, texts)}

## ${texts.faqs}

${this.generateFAQs(erIDL, texts)}

## ${texts.support}

${texts.supportInfo}`;
  }

  /**
   * 生成開發者指南
   */
  private static generateDeveloperGuide(
    erIDL: ErIDL,
    library: ErComponentLibrary,
    options: Required<DocumentationOptions>
  ): string {
    if (!options.includeDeveloperGuides) {
      return '';
    }
    
    const texts = this.getLocalizedTexts(options.language);
    
    return `# ${texts.developerGuide}

${texts.developerGuideIntro}

## ${texts.architecture}

${this.generateArchitectureDocs(erIDL, texts)}

## ${texts.developmentSetup}

${this.generateDevelopmentSetup(erIDL, texts)}

## ${texts.codeStructure}

${this.generateCodeStructure(erIDL, texts)}

## ${texts.stateManagement}

${this.generateStateManagementDocs(erIDL, texts)}

## ${texts.testing}

${this.generateTestingDocs(erIDL, texts)}

## ${texts.codeStyle}

${this.generateCodeStyleDocs(erIDL, texts)}

## ${texts.ci_cd}

${this.generateCICDDocs(erIDL, texts)}

## ${texts.performance}

${this.generatePerformanceDocs(erIDL, texts)}`;
  }

  /**
   * 生成部署指南
   */
  private static generateDeploymentGuide(
    erIDL: ErIDL,
    options: Required<DocumentationOptions>
  ): string {
    if (!options.includeDeploymentGuides) {
      return '';
    }
    
    const texts = this.getLocalizedTexts(options.language);
    
    return `# ${texts.deploymentGuide}

${texts.deploymentIntro}

## ${texts.environments}

${erIDL.technical.deployment.environments.map(env => 
  this.generateEnvironmentDocs(env, texts)
).join('\n\n')}

## ${texts.buildProcess}

${this.generateBuildProcessDocs(erIDL, texts)}

## ${texts.deploymentPipeline}

${this.generatePipelineDocs(erIDL, texts)}

## ${texts.monitoring}

${this.generateMonitoringDocs(erIDL, texts)}

## ${texts.troubleshooting}

${this.generateDeploymentTroubleshooting(erIDL, texts)}`;
  }

  /**
   * 生成變更日誌
   */
  private static generateChangelog(
    erIDL: ErIDL,
    options: Required<DocumentationOptions>
  ): string {
    const texts = this.getLocalizedTexts(options.language);
    
    return `# ${texts.changelog}

${texts.changelogIntro}

## [${erIDL.metadata.version}] - ${new Date().toISOString().split('T')[0]}

### ${texts.added}
- ${texts.initialRelease}
- ${texts.ersliceGenerated}

### ${texts.features}
- ${texts.componentLibrary}: ${erIDL.design.components.length} ${texts.components}
- ${texts.designSystem}: ${erIDL.design.designTokens.length} ${texts.designTokens}
- ${texts.apiEndpoints}: ${erIDL.technical.apis.reduce((sum, api) => sum + api.endpoints.length, 0)} ${texts.endpoints}

### ${texts.technical}
- ${texts.framework}: ${erIDL.metadata.targetFrameworks.join(', ')}
- ${texts.architecture}: ${erIDL.technical.architecture.frontend.framework}
- ${texts.testing}: ${erIDL.technical.testing.strategies.map(s => s.type).join(', ')}

---

${texts.changelogFooter}`;
  }

  /**
   * 生成貢獻指南
   */
  private static generateContributingGuide(
    erIDL: ErIDL,
    options: Required<DocumentationOptions>
  ): string {
    const texts = this.getLocalizedTexts(options.language);
    
    return `# ${texts.contributingGuide}

${texts.contributingIntro}

## ${texts.developmentProcess}

### ${texts.setup}

1. ${texts.forkRepo}
2. ${texts.cloneRepo}
3. ${texts.installDeps}

\`\`\`bash
npm install
\`\`\`

### ${texts.workflow}

1. ${texts.createBranch}
2. ${texts.makeChanges}
3. ${texts.runTests}
4. ${texts.commitChanges}
5. ${texts.pushBranch}
6. ${texts.createPR}

## ${texts.codeStandards}

${this.generateCodeStandards(erIDL, texts)}

## ${texts.testingGuidelines}

${this.generateTestingGuidelines(erIDL, texts)}

## ${texts.documentation}

${texts.documentationGuidelines}

## ${texts.issueReporting}

${texts.issueReportingGuidelines}

## ${texts.pullRequests}

${texts.pullRequestGuidelines}`;
  }

  /**
   * 生成站點地圖
   */
  private static generateSitemap(
    erIDL: ErIDL,
    options: Required<DocumentationOptions>
  ): string {
    const screens = erIDL.design.screens;
    
    let sitemap = `# ${options.language === 'en' ? 'Sitemap' : '站點地圖'}

## ${options.language === 'en' ? 'Pages' : '頁面結構'}

\`\`\`mermaid
graph TD
`;
    
    screens.forEach((screen, index) => {
      const screenId = `S${index + 1}[${screen.name}]`;
      sitemap += `    ${screenId}\n`;
    });
    
    sitemap += `\`\`\`

## ${options.language === 'en' ? 'Page Details' : '頁面詳情'}

`;
    
    screens.forEach(screen => {
      sitemap += `### ${screen.name}
- **${options.language === 'en' ? 'Description' : '描述'}**: ${screen.description}
- **${options.language === 'en' ? 'Components' : '組件數量'}**: ${screen.components.length}
- **${options.language === 'en' ? 'Interactions' : '交互數量'}**: ${screen.interactions.length}

`;
    });
    
    return sitemap;
  }

  /**
   * 生成 Storybook 配置
   */
  private static generateStorybookConfig(
    library: ErComponentLibrary,
    options: Required<DocumentationOptions>
  ): string {
    return `// Storybook Configuration
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-controls',
    '@storybook/addon-docs',
    '@storybook/addon-a11y'
  ],
  framework: '${library.metadata.framework[0] === 'react' ? '@storybook/react' : '@storybook/vue3'}',
  features: {
    buildStoriesJson: true
  }
}`;
  }

  // ===== 輔助方法 =====

  private static formatFileName(name: string): string {
    return name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  private static getLocalizedTexts(language: string): Record<string, string> {
    const texts = {
      'zh-TW': {
        overview: '概覽',
        features: '功能特性',
        quickStart: '快速開始',
        install: '安裝依賴',
        development: '開發模式',
        build: '建構項目',
        test: '執行測試',
        projectStructure: '專案結構',
        documentation: '文檔',
        userGuide: '用戶指南',
        developerGuide: '開發者指南',
        apiReference: 'API 參考',
        designSystem: '設計系統',
        deploymentGuide: '部署指南',
        techStack: '技術棧',
        browser: '瀏覽器支援',
        contributing: '貢獻',
        license: '授權',
        generated: '生成說明',
        lastUpdated: '最後更新',
        seeContributingGuide: '請參閱',
        contributingDetails: '了解如何貢獻到這個專案。',
        contributingGuide: '貢獻指南',
        licenseText: '本專案採用 MIT 授權。',
        generatedByErSlice: '本專案由 ErSlice 自動生成，基於 Figma 設計稿。',
        componentRole: '組件角色',
        role: '角色',
        category: '類別',
        usage: '使用方式',
        basicUsage: '基本用法',
        props: '屬性',
        events: '事件',
        examples: '範例',
        designSpecs: '設計規格',
        accessibility: '無障礙性',
        bestPractices: '最佳實踐',
        troubleshooting: '問題排除',
        generatedFrom: '生成來源',
        apiOverview: 'API 概覽和基本使用說明。',
        baseURL: '基礎 URL',
        authentication: '身份驗證',
        endpoints: '端點',
        errorHandling: '錯誤處理',
        rateLimit: '速率限制',
        designSystemOverview: '設計系統文檔和指南。',
        designTokens: '設計令牌',
        colorPalette: '色彩調色板',
        typography: '字體排版',
        spacing: '間距系統',
        componentLibrary: '組件庫',
        designPatterns: '設計模式',
        guidelines: '設計指南',
        userGuideIntro: '用戶指南和操作說明。',
        gettingStarted: '開始使用',
        systemRequirements: '系統需求',
        installation: '安裝步驟',
        userJourneys: '用戶旅程',
        faqs: '常見問題',
        support: '技術支援',
        supportInfo: '如需技術支援，請聯繫開發團隊。',
        developerGuideIntro: '開發者指南和技術文檔。',
        architecture: '架構設計',
        developmentSetup: '開發環境設置',
        codeStructure: '代碼結構',
        stateManagement: '狀態管理',
        testing: '測試',
        codeStyle: '代碼風格',
        ci_cd: 'CI/CD',
        performance: '性能優化',
        deploymentIntro: '部署指南和環境配置。',
        environments: '環境配置',
        buildProcess: '構建流程',
        deploymentPipeline: '部署管道',
        monitoring: '監控',
        changelog: '變更日誌',
        changelogIntro: '專案版本歷史和變更記錄。',
        added: '新增',
        initialRelease: '初始版本發布',
        ersliceGenerated: 'ErSlice 生成的完整專案',
        components: '組件',
        endpoints: '端點',
        framework: '框架',
        technical: '技術規格',
        changelogFooter: '所有重要變更都會記錄在此文件中。',
        contributingIntro: '感謝您對本專案的貢獻！',
        developmentProcess: '開發流程',
        setup: '環境設置',
        forkRepo: 'Fork 此儲存庫',
        cloneRepo: 'Clone 到本地',
        installDeps: '安裝依賴',
        workflow: '工作流程',
        createBranch: '創建功能分支',
        makeChanges: '進行代碼變更',
        runTests: '執行測試',
        commitChanges: '提交變更',
        pushBranch: '推送分支',
        createPR: '創建 Pull Request',
        codeStandards: '代碼標準',
        testingGuidelines: '測試指南',
        documentationGuidelines: '請確保為新功能添加適當的文檔。',
        issueReporting: '問題回報',
        issueReportingGuidelines: '請使用 GitHub Issues 回報問題。',
        pullRequests: 'Pull Requests',
        pullRequestGuidelines: '請確保 PR 包含清晰的描述和測試。'
      },
      'en': {
        overview: 'Overview',
        features: 'Features',
        quickStart: 'Quick Start',
        install: 'Install dependencies',
        development: 'Development mode',
        build: 'Build project',
        test: 'Run tests',
        projectStructure: 'Project Structure',
        documentation: 'Documentation',
        userGuide: 'User Guide',
        developerGuide: 'Developer Guide',
        apiReference: 'API Reference',
        designSystem: 'Design System',
        deploymentGuide: 'Deployment Guide',
        techStack: 'Tech Stack',
        browser: 'Browser Support',
        contributing: 'Contributing',
        license: 'License',
        generated: 'Generated',
        lastUpdated: 'Last Updated',
        seeContributingGuide: 'Please see the',
        contributingDetails: 'for details on how to contribute to this project.',
        contributingGuide: 'Contributing Guide',
        licenseText: 'This project is licensed under the MIT License.',
        generatedByErSlice: 'This project was automatically generated by ErSlice from Figma designs.',
        // ... 其他英文翻譯
      }
    };
    
    return texts[language] || texts['en'];
  }

  private static generateBadges(erIDL: ErIDL): string {
    const framework = erIDL.metadata.targetFrameworks[0];
    const version = erIDL.metadata.version;
    
    return `![Version](https://img.shields.io/badge/version-${version}-blue)
![Framework](https://img.shields.io/badge/framework-${framework}-green)
![ErSlice](https://img.shields.io/badge/generated--by-ErSlice-purple)
![License](https://img.shields.io/badge/license-MIT-blue)`;
  }

  private static generateProjectOverview(erIDL: ErIDL, texts: Record<string, string>): string {
    return `本專案包含 ${erIDL.design.components.length} 個組件，支援 ${erIDL.metadata.targetFrameworks.join('、')} 等框架。專案採用 ${erIDL.technical.architecture.frontend.framework} 架構，整合了現代化的開發工具鏈。`;
  }

  private static generateFeatureList(erIDL: ErIDL, texts: Record<string, string>): string {
    const features = [
      `✨ ${erIDL.design.components.length} 個高品質組件`,
      `完整的設計系統支援`,
      `響應式設計`,
      `♿ 無障礙性支援`,
      `🧪 完整的測試覆蓋`,
      `📚 詳細的文檔`,
      `🚀 自動化部署`
    ];
    
    return features.join('\n');
  }

  private static generateProjectStructure(erIDL: ErIDL, texts: Record<string, string>): string {
    return `\`\`\`
${erIDL.metadata.projectName}/
├── src/
│   ├── components/          # 組件庫
│   ├── pages/              # 頁面組件
│   ├── hooks/              # 自定義 Hooks
│   ├── utils/              # 工具函數
│   ├── services/           # 服務層
│   ├── types/              # TypeScript 類型
│   └── styles/             # 樣式文件
├── docs/                   # 文檔
├── tests/                  # 測試文件
└── storybook/              # Storybook 配置
\`\`\``;
  }

  private static generateTechStack(erIDL: ErIDL, texts: Record<string, string>): string {
    const arch = erIDL.technical.architecture.frontend;
    
    return `- **${texts.framework}**: ${arch.framework}
- **構建工具**: ${arch.buildTool}
- **樣式**: ${arch.styling}
- **狀態管理**: ${arch.stateManagement}
- **路由**: ${arch.routing}
- **測試**: ${arch.testing}
- **TypeScript**: ${arch.typeScript ? '✅' : '❌'}`;
  }

  private static generateBrowserSupport(erIDL: ErIDL, texts: Record<string, string>): string {
    return `| 瀏覽器 | 版本 |
|--------|------|
| Chrome | ≥ 88 |
| Firefox | ≥ 85 |
| Safari | ≥ 14 |
| Edge | ≥ 88 |`;
  }

  private static getCategoryName(role: ComponentRole, language: string): string {
    const categories = {
      'zh-TW': {
        navigation: '導航組件',
        content: '內容組件',
        input: '輸入組件',
        feedback: '反饋組件',
        layout: '佈局組件',
        display: '展示組件',
        interactive: '交互組件'
      },
      'en': {
        navigation: 'Navigation Component',
        content: 'Content Component',
        input: 'Input Component',
        feedback: 'Feedback Component',
        layout: 'Layout Component',
        display: 'Display Component',
        interactive: 'Interactive Component'
      }
    };
    
    return categories[language]?.[role] || role;
  }

  private static generateUsageExamples(
    component: ErComponent,
    options: Required<DocumentationOptions>
  ): string {
    const framework = 'React'; // 預設顯示 React 範例
    const componentName = component.name;
    
    return `\`\`\`jsx
import { ${componentName} } from './components'

function App() {
  return (
    <${componentName}
      // 基本屬性
      ${Object.keys(component.implementation.componentApi.props)
        .slice(0, 3)
        .map(prop => `${prop}={/* 值 */}`)
        .join('\n      ')}
    />
  )
}
\`\`\``;
  }

  private static generatePropsTable(
    component: ErComponent,
    options: Required<DocumentationOptions>
  ): string {
    const props = component.implementation.componentApi.props;
    
    let table = `| 屬性名 | 類型 | 必填 | 預設值 | 說明 |
|--------|------|------|--------|------|
`;
    
    Object.entries(props).forEach(([name, prop]) => {
      table += `| ${name} | \`${prop.type}\` | ${prop.required ? '✅' : '❌'} | \`${prop.defaultValue || '-'}\` | ${prop.description || '-'} |\n`;
    });
    
    return table;
  }

  private static generateEventsTable(
    component: ErComponent,
    options: Required<DocumentationOptions>
  ): string {
    const events = component.implementation.componentApi.events;
    
    if (!events || Object.keys(events).length === 0) {
      return '此組件不觸發任何事件。';
    }
    
    let table = `| 事件名 | 參數 | 說明 |
|--------|------|------|
`;
    
    Object.entries(events).forEach(([name, event]) => {
      const params = Object.entries(event.parameters)
        .map(([paramName, paramType]) => `${paramName}: ${paramType}`)
        .join(', ');
      table += `| ${name} | \`${params}\` | ${event.description} |\n`;
    });
    
    return table;
  }

  private static generateExamplesSection(
    component: ErComponent,
    options: Required<DocumentationOptions>
  ): string {
    const examples = component.collaboration.documentation.examples;
    
    if (examples.length === 0) {
      return '暫無範例。';
    }
    
    return examples.map(example => `### ${example.title}

${example.description}

\`\`\`${example.framework.toLowerCase()}
${example.code}
\`\`\``).join('\n\n');
  }

  private static generateDesignSpecs(
    component: ErComponent,
    options: Required<DocumentationOptions>
  ): string {
    const visual = component.design.visualProperties;
    
    return `- **寬度**: ${visual.layout.width || 'auto'}
- **高度**: ${visual.layout.height || 'auto'}
- **顯示**: ${visual.layout.display}
- **背景色**: ${visual.styling.backgroundColor || 'transparent'}
- **圓角**: ${visual.styling.borderRadius || 0}px`;
  }

  private static generateAccessibilityInfo(
    component: ErComponent,
    options: Required<DocumentationOptions>
  ): string {
    const a11y = component.semantic.accessibilitySpecs;
    
    return `- **ARIA 標籤**: ${a11y.ariaLabel || '無'}
- **鍵盤導航**: ${a11y.keyboardNavigation?.focusable ? '支援' : '不支援'}
- **螢幕閱讀器**: ${a11y.screenReader?.announcements?.length ? '支援' : '無特殊支援'}
- **色彩對比**: ${a11y.colorContrast?.wcagLevel || '未指定'}`;
  }

  private static generateTroubleshootingSection(
    component: ErComponent,
    options: Required<DocumentationOptions>
  ): string {
    const troubleshooting = component.collaboration.documentation.troubleshooting;
    
    if (troubleshooting.length === 0) {
      return '暫無常見問題。';
    }
    
    return troubleshooting.map(item => `### ${item.issue}

${item.solution}`).join('\n\n');
  }

  private static generateComponentExamples(
    component: ErComponent,
    options: Required<DocumentationOptions>
  ): CodeExample[] {
    // 生成基本範例
    return [{
      title: '基本用法',
      description: `${component.name} 組件的基本使用方式`,
      code: `<${component.name} />`,
      framework: 'React'
    }];
  }

  private static generatePropsDocumentation(
    component: ErComponent,
    options: Required<DocumentationOptions>
  ): PropDocumentation[] {
    const props = component.implementation.componentApi.props;
    
    return Object.entries(props).map(([name, prop]) => ({
      name,
      type: prop.type,
      required: prop.required,
      defaultValue: prop.defaultValue,
      description: prop.description || `${name} 屬性`,
      examples: [prop.defaultValue ? String(prop.defaultValue) : ''].filter(Boolean)
    }));
  }

  private static generateEventsDocumentation(
    component: ErComponent,
    options: Required<DocumentationOptions>
  ): EventDocumentation[] {
    const events = component.implementation.componentApi.events;
    
    if (!events) return [];
    
    return Object.entries(events).map(([name, event]) => ({
      name,
      parameters: Object.entries(event.parameters).map(([paramName, paramType]) => ({
        name: paramName,
        type: paramType,
        description: `${paramName} 參數`
      })),
      description: event.description,
      examples: [`on${name.charAt(0).toUpperCase() + name.slice(1)}={(event) => console.log(event)}`]
    }));
  }

  private static generateMethodsDocumentation(
    component: ErComponent,
    options: Required<DocumentationOptions>
  ): MethodDocumentation[] {
    const methods = component.implementation.componentApi.methods;
    
    if (!methods) return [];
    
    return Object.entries(methods).map(([name, method]) => ({
      name,
      parameters: Object.entries(method.parameters).map(([paramName, paramType]) => ({
        name: paramName,
        type: paramType,
        description: `${paramName} 參數`
      })),
      returnType: method.returnType,
      description: method.description,
      examples: [`componentRef.current?.${name}()`]
    }));
  }

  // 更多輔助方法...
  private static generateAuthenticationDocs(erIDL: ErIDL, texts: Record<string, string>): string {
    const auth = erIDL.technical.apis[0]?.authentication;
    if (!auth || auth.type === 'none') {
      return '此 API 不需要身份驗證。';
    }
    
    return `認證方式：${auth.type}

\`\`\`javascript
// 範例請求
fetch('/api/endpoint', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
\`\`\``;
  }

  private static generateAPIEndpointDocs(api: APIDefinition, texts: Record<string, string>): string {
    let docs = `### ${api.name}\n\n`;
    
    api.endpoints.forEach(endpoint => {
      docs += `#### ${endpoint.method} ${endpoint.path}

${endpoint.description}

**參數：**
${endpoint.parameters?.map(param => 
  `- \`${param.name}\` (${param.type}): ${param.description}`
).join('\n') || '無'}

**回應：**
${endpoint.responses.map(response => 
  `- ${response.statusCode}: ${response.description}`
).join('\n')}

`;
    });
    
    return docs;
  }

  private static generateErrorHandlingDocs(erIDL: ErIDL, texts: Record<string, string>): string {
    return `API 使用標準 HTTP 狀態碼：

- 200: 成功
- 400: 請求錯誤
- 401: 未授權
- 403: 禁止存取
- 404: 資源不存在
- 500: 伺服器錯誤`;
  }

  private static generateRateLimitDocs(erIDL: ErIDL, texts: Record<string, string>): string {
    return `速率限制：每 15 分鐘 100 次請求

超過限制時會回傳 429 狀態碼。`;
  }

  private static generateDesignTokensDocs(library: ErComponentLibrary, texts: Record<string, string>): string {
    const tokens = library.designSystem.tokens;
    
    return `設計令牌總數：${tokens.length}

${tokens.slice(0, 5).map(token => 
  `- **${token.tokenName}**: ${token.tokenValue} (${token.tokenCategory})`
).join('\n')}`;
  }

  private static generateColorPaletteDocs(library: ErComponentLibrary, texts: Record<string, string>): string {
    const colorTokens = library.designSystem.tokens.filter(t => t.tokenCategory === 'color');
    
    return colorTokens.slice(0, 8).map(token => 
      `- **${token.tokenName}**: \`${token.tokenValue}\``
    ).join('\n');
  }

  private static generateTypographyDocs(library: ErComponentLibrary, texts: Record<string, string>): string {
    const typographyTokens = library.designSystem.tokens.filter(t => t.tokenCategory === 'typography');
    
    return typographyTokens.slice(0, 5).map(token => 
      `- **${token.tokenName}**: \`${token.tokenValue}\``
    ).join('\n');
  }

  private static generateSpacingDocs(library: ErComponentLibrary, texts: Record<string, string>): string {
    const spacingTokens = library.designSystem.tokens.filter(t => t.tokenCategory === 'spacing');
    
    return spacingTokens.slice(0, 6).map(token => 
      `- **${token.tokenName}**: \`${token.tokenValue}\``
    ).join('\n');
  }

  private static generateComponentLibraryDocs(library: ErComponentLibrary, texts: Record<string, string>): string {
    const componentsByRole = library.components.reduce((acc, component) => {
      const role = component.semantic.componentRole;
      if (!acc[role]) acc[role] = [];
      acc[role].push(component);
      return acc;
    }, {} as Record<string, ErComponent[]>);
    
    return Object.entries(componentsByRole)
      .map(([role, components]) => 
        `### ${role}\n${components.map(c => `- ${c.name}`).join('\n')}`
      ).join('\n\n');
  }

  private static generateDesignPatternsDocs(library: ErComponentLibrary, texts: Record<string, string>): string {
    const patterns = library.designSystem.patterns;
    
    return patterns.map(pattern => 
      `### ${pattern.name}\n${pattern.description}\n\n**使用組件**: ${pattern.components.join(', ')}`
    ).join('\n\n');
  }

  private static generateSystemRequirements(erIDL: ErIDL, texts: Record<string, string>): string {
    return `- Node.js ≥ 16.0.0
- npm ≥ 7.0.0
- 現代瀏覽器支援 ES2015+`;
  }

  private static generateInstallationSteps(erIDL: ErIDL, texts: Record<string, string>): string {
    return `1. 下載專案檔案
2. 執行 \`npm install\`
3. 啟動開發伺服器 \`npm run dev\`
4. 開啟瀏覽器訪問 http://localhost:3000`;
  }

  private static generateUserJourneyDocs(journey: any, texts: Record<string, string>): string {
    return `### ${journey.name}

**目標**: ${journey.goal}
**角色**: ${journey.persona}

**階段**:
${journey.stages.map((stage: any) => `- ${stage.name}: ${stage.description}`).join('\n')}`;
  }

  private static generateFeatureGuides(erIDL: ErIDL, texts: Record<string, string>): string {
    return `### 主要功能

${erIDL.design.screens.map(screen => 
  `#### ${screen.name}\n${screen.description}`
).join('\n\n')}`;
  }

  private static generateFAQs(erIDL: ErIDL, texts: Record<string, string>): string {
    return `### 如何開始使用？
請參考快速開始部分的說明。

### 如何自定義組件？
請參考開發者指南中的組件自定義部分。

### 如何部署到生產環境？
請參考部署指南的詳細說明。`;
  }

  private static generateArchitectureDocs(erIDL: ErIDL, texts: Record<string, string>): string {
    const arch = erIDL.technical.architecture;
    
    return `### 前端架構
- 框架：${arch.frontend.framework}
- 構建工具：${arch.frontend.buildTool}
- 狀態管理：${arch.frontend.stateManagement}

### 後端架構
- 框架：${arch.backend?.framework || 'N/A'}
- 資料庫：${arch.backend?.database || 'N/A'}
- 認證：${arch.backend?.authentication || 'N/A'}`;
  }

  private static generateDevelopmentSetup(erIDL: ErIDL, texts: Record<string, string>): string {
    return `\`\`\`bash
# 克隆專案
git clone <repository-url>

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 執行測試
npm test

# 建構專案
npm run build
\`\`\``;
  }

  private static generateCodeStructure(erIDL: ErIDL, texts: Record<string, string>): string {
    return `代碼組織遵循模組化原則：

- **組件**: 可重用的 UI 組件
- **頁面**: 路由對應的頁面組件
- **服務**: API 調用和業務邏輯
- **工具**: 通用工具函數
- **類型**: TypeScript 類型定義`;
  }

  private static generateStateManagementDocs(erIDL: ErIDL, texts: Record<string, string>): string {
    const stateManagement = erIDL.technical.stateManagement;
    
    return `狀態管理採用 ${stateManagement.approach} 方式。

主要 Store：
${stateManagement.stores.map(store => `- ${store.name}`).join('\n')}`;
  }

  private static generateTestingDocs(erIDL: ErIDL, texts: Record<string, string>): string {
    const testing = erIDL.technical.testing;
    
    return `測試策略：
${testing.strategies.map(strategy => `- ${strategy.type}: ${strategy.framework}`).join('\n')}

測試覆蓋率要求：
- 語句覆蓋率: ${testing.coverage.threshold.statements}%
- 分支覆蓋率: ${testing.coverage.threshold.branches}%
- 函數覆蓋率: ${testing.coverage.threshold.functions}%`;
  }

  private static generateCodeStyleDocs(erIDL: ErIDL, texts: Record<string, string>): string {
    return `代碼風格規範：
- 使用 ESLint 進行代碼檢查
- 使用 Prettier 進行代碼格式化
- 遵循 TypeScript 最佳實踐
- 組件命名使用 PascalCase
- 檔案命名使用 kebab-case`;
  }

  private static generateCICDDocs(erIDL: ErIDL, texts: Record<string, string>): string {
    const ci = erIDL.technical.testing.ci;
    
    return `CI/CD 配置：
- 平台：${ci.provider}
- 觸發條件：${ci.triggers.join(', ')}
- 構建步驟：${ci.steps.map(step => step.name).join(', ')}`;
  }

  private static generatePerformanceDocs(erIDL: ErIDL, texts: Record<string, string>): string {
    const performance = erIDL.technical.performance;
    
    return `性能預算：
${performance.budgets.map(budget => 
  `- ${budget.metric}: 目標 ${budget.target}, 警告 ${budget.warning}, 錯誤 ${budget.error}`
).join('\n')}

優化策略：
${performance.optimizations.map(opt => `- ${opt}`).join('\n')}`;
  }

  private static generateEnvironmentDocs(env: any, texts: Record<string, string>): string {
    return `### ${env.name}

- **部署目標**: ${env.target}
- **環境變數**: ${Object.keys(env.variables || {}).length} 個
- **密鑰**: ${env.secrets?.length || 0} 個`;
  }

  private static generateBuildProcessDocs(erIDL: ErIDL, texts: Record<string, string>): string {
    return `建構流程包括：
1. 代碼編譯
2. 資源優化
3. 打包壓縮
4. 靜態文件生成

建構命令：\`npm run build\``;
  }

  private static generatePipelineDocs(erIDL: ErIDL, texts: Record<string, string>): string {
    const pipeline = erIDL.technical.deployment.pipeline;
    
    return `部署管道：
${pipeline.stages.map(stage => `- ${stage.name}: ${stage.steps.join(', ')}`).join('\n')}`;
  }

  private static generateMonitoringDocs(erIDL: ErIDL, texts: Record<string, string>): string {
    const monitoring = erIDL.technical.deployment.monitoring;
    
    return `監控配置：
- 指標：${monitoring.metrics.map(m => m.name).join(', ')}
- 警報：${monitoring.alerts.map(a => a.name).join(', ')}
- 儀表板：${monitoring.dashboards.map(d => d.name).join(', ')}`;
  }

  private static generateDeploymentTroubleshooting(erIDL: ErIDL, texts: Record<string, string>): string {
    return `### 常見問題

**部署失敗**
- 檢查環境變數配置
- 驗證依賴版本相容性

**性能問題**
- 檢查資源載入時間
- 分析 bundle 大小

**網路問題**
- 驗證 API 端點可達性
- 檢查 CORS 配置`;
  }

  private static generateCodeStandards(erIDL: ErIDL, texts: Record<string, string>): string {
    return `### 代碼規範
- 使用 TypeScript
- 遵循 ESLint 規則
- 使用 Prettier 格式化
- 組件使用 PascalCase
- 函數使用 camelCase
- 常數使用 UPPER_SNAKE_CASE`;
  }

  private static generateTestingGuidelines(erIDL: ErIDL, texts: Record<string, string>): string {
    return `### 測試指南
- 新功能必須包含測試
- 維持 80% 以上覆蓋率
- 使用描述性的測試名稱
- 遵循 AAA 模式 (Arrange, Act, Assert)
- 模擬外部依賴`;
  }
}

export default DocumentationGenerator;