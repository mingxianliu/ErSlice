/**
 * React 代碼生成器
 * 從 ErComponent 生成 React 組件代碼
 */

import {
  ErComponent,
  FrameworkImplementation,
  ComponentProps,
  LayoutProperties,
  StylingProperties,
  TypographyProperties,
  InteractionPattern
} from '../../types/erComponent';

export interface ReactGenerationOptions {
  useTypeScript?: boolean;
  useHooks?: boolean;
  styleFormat?: 'css' | 'scss' | 'styled-components' | 'emotion' | 'tailwind';
  stateManagement?: 'useState' | 'useReducer' | 'zustand' | 'redux' | 'context';
  generateTests?: boolean;
  generateStories?: boolean;
  exportStyle?: 'named' | 'default';
  propsValidation?: 'propTypes' | 'typescript' | 'none';
  cssModules?: boolean;
}

export interface ReactCodeOutput {
  componentCode: string;
  styleCode: string;
  typeDefinitions?: string;
  testCode?: string;
  storyCode?: string;
  hookCode?: string;
  dependencies: string[];
  imports: string[];
}

export class ReactCodeGenerator {
  /**
   * 從 ErComponent 生成 React 組件代碼
   */
  static generateReactComponent(
    component: ErComponent,
    options: ReactGenerationOptions = {}
  ): ReactCodeOutput {
    const opts = this.mergeOptions(options);
    
    const componentCode = this.generateComponentCode(component, opts);
    const styleCode = this.generateStyleCode(component, opts);
    const typeDefinitions = opts.useTypeScript ? 
      this.generateTypeDefinitions(component) : undefined;
    const testCode = opts.generateTests ? 
      this.generateTestCode(component, opts) : undefined;
    const storyCode = opts.generateStories ? 
      this.generateStoryCode(component, opts) : undefined;
    const hookCode = this.generateCustomHooks(component, opts);
    
    const dependencies = this.extractDependencies(component, opts);
    const imports = this.generateImports(component, opts);
    
    return {
      componentCode,
      styleCode,
      typeDefinitions,
      testCode,
      storyCode,
      hookCode,
      dependencies,
      imports
    };
  }

  /**
   * 合併選項
   */
  private static mergeOptions(options: ReactGenerationOptions): Required<ReactGenerationOptions> {
    return {
      useTypeScript: true,
      useHooks: true,
      styleFormat: 'scss',
      stateManagement: 'useState',
      generateTests: true,
      generateStories: true,
      exportStyle: 'named',
      propsValidation: 'typescript',
      cssModules: true,
      ...options
    };
  }

  /**
   * 生成組件代碼
   */
  private static generateComponentCode(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const imports = this.generateReactImports(component, options);
    const typeDefinitions = options.useTypeScript ? 
      this.generateInlineTypes(component) : '';
    const propsInterface = options.useTypeScript ?
      this.generatePropsInterface(component) : '';
    const componentBody = options.useHooks ?
      this.generateHooksComponent(component, options) :
      this.generateClassComponent(component, options);
    const exports = this.generateExports(component, options);
    
    return `${imports}

${typeDefinitions}

${propsInterface}

${componentBody}

${exports}`.trim();
  }

  /**
   * 生成 React 導入
   */
  private static generateReactImports(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const imports = [];
    
    // React 核心導入
    if (options.useHooks) {
      const reactImports = ['React'];
      
      // 根據組件功能添加 hooks
      if (component.implementation.stateManagement.approach !== 'props') {
        reactImports.push('useState');
        
        if (component.implementation.stateManagement.effects?.length) {
          reactImports.push('useEffect');
        }
        
        if (component.implementation.stateManagement.computed?.length) {
          reactImports.push('useMemo', 'useCallback');
        }
      }
      
      if (component.implementation.componentApi.methods && 
          Object.keys(component.implementation.componentApi.methods).length > 0) {
        reactImports.push('useImperativeHandle', 'forwardRef');
      }
      
      imports.push(`import ${reactImports.join(', ')} from 'react'`);
    } else {
      imports.push("import React, { Component } from 'react'");
    }
    
    // 樣式導入
    if (options.styleFormat === 'styled-components') {
      imports.push("import styled from 'styled-components'");
    } else if (options.styleFormat === 'emotion') {
      imports.push("import styled from '@emotion/styled'");
      imports.push("import { css } from '@emotion/react'");
    } else if (options.cssModules) {
      imports.push(`import styles from './${this.formatFileName(component.name)}.module.scss'`);
    } else {
      imports.push(`import './${this.formatFileName(component.name)}.scss'`);
    }
    
    // PropTypes (如果不使用 TypeScript)
    if (!options.useTypeScript && options.propsValidation === 'propTypes') {
      imports.push("import PropTypes from 'prop-types'");
    }
    
    // 狀態管理導入
    if (options.stateManagement === 'zustand') {
      imports.push("import { create } from 'zustand'");
    } else if (options.stateManagement === 'redux') {
      imports.push("import { useSelector, useDispatch } from 'react-redux'");
    }
    
    // 外部依賴導入
    component.implementation.dependencies.external.forEach(dep => {
      if (dep !== 'react' && dep !== 'react-dom') {
        imports.push(`import ${dep} from '${dep}'`);
      }
    });
    
    return imports.join('\n');
  }

  /**
   * 生成內聯類型定義
   */
  private static generateInlineTypes(component: ErComponent): string {
    if (component.semantic.contentModel?.structure) {
      const structure = component.semantic.contentModel.structure;
      const fields = Object.entries(structure)
        .map(([key, type]) => `  ${key}: ${this.mapTypeToTypeScript(type)}`)
        .join('\n');
      
      return `interface ${component.name}Data {
${fields}
}`;
    }
    
    return '';
  }

  /**
   * 生成 Props 介面
   */
  private static generatePropsInterface(component: ErComponent): string {
    const props = component.implementation.componentApi.props;
    const events = component.implementation.componentApi.events;
    
    const propFields = Object.entries(props)
      .map(([name, prop]) => {
        const optional = prop.required ? '' : '?';
        return `  ${name}${optional}: ${this.mapTypeToTypeScript(prop.type)}`;
      })
      .join('\n');
    
    const eventFields = events ? Object.entries(events)
      .map(([name, event]) => {
        const params = Object.entries(event.parameters)
          .map(([paramName, paramType]) => `${paramName}: ${paramType}`)
          .join(', ');
        return `  on${this.capitalize(name)}?: (${params}) => void`;
      })
      .join('\n') : '';
    
    const allFields = [propFields, eventFields].filter(Boolean).join('\n');
    
    return `interface ${component.name}Props {
${allFields}
}`;
  }

  /**
   * 生成 Hooks 組件
   */
  private static generateHooksComponent(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const componentName = this.formatComponentName(component.name);
    const forwardRef = this.needsForwardRef(component);
    
    const stateDeclarations = this.generateStateDeclarations(component, options);
    const effectsHooks = this.generateEffectsHooks(component, options);
    const computedValues = this.generateComputedValues(component, options);
    const eventHandlers = this.generateEventHandlers(component, options);
    const imperativeHandle = this.generateImperativeHandle(component, options);
    const componentJSX = this.generateComponentJSX(component, options);
    
    const componentBody = `${stateDeclarations}

${effectsHooks}

${computedValues}

${eventHandlers}

${imperativeHandle}

  return (
${this.indentCode(componentJSX, 2)}
  )`;
    
    if (forwardRef) {
      return `const ${componentName} = React.forwardRef<HTMLDivElement, ${componentName}Props>((props, ref) => {
${this.indentCode(componentBody, 1)}
})

${componentName}.displayName = '${componentName}'`;
    }
    
    return `const ${componentName}: React.FC<${componentName}Props> = (props) => {
${this.indentCode(componentBody, 1)}
}`;
  }

  /**
   * 生成 Class 組件
   */
  private static generateClassComponent(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const componentName = this.formatComponentName(component.name);
    const stateInterface = this.generateStateInterface(component);
    const constructor = this.generateConstructor(component, options);
    const lifecycle = this.generateLifecycleMethods(component, options);
    const methods = this.generateClassMethods(component, options);
    const render = this.generateRenderMethod(component, options);
    const propTypes = this.generatePropTypes(component, options);
    
    return `${stateInterface}

class ${componentName} extends React.Component<${componentName}Props, ${componentName}State> {
${constructor}

${lifecycle}

${methods}

${render}
}

${propTypes}`;
  }

  /**
   * 生成狀態聲明 (Hooks)
   */
  private static generateStateDeclarations(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const stateManagement = component.implementation.stateManagement;
    
    if (stateManagement.approach === 'props') {
      return '';
    }
    
    const declarations = [];
    
    if (stateManagement.stateShape) {
      Object.entries(stateManagement.stateShape).forEach(([key, type]) => {
        const defaultValue = this.getDefaultValueForType(type);
        const tsType = options.useTypeScript ? 
          `<${this.mapTypeToTypeScript(type)}>` : '';
        
        declarations.push(
          `const [${key}, set${this.capitalize(key)}] = useState${tsType}(${JSON.stringify(defaultValue)})`
        );
      });
    }
    
    return declarations.join('\n  ');
  }

  /**
   * 生成 Effects Hooks
   */
  private static generateEffectsHooks(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const effects = [];
    
    // 組件掛載時的副作用
    if (component.semantic.componentRole === 'content' || component.semantic.dataBinding) {
      effects.push(`useEffect(() => {
    // 載入初始數據或初始化組件狀態
  }, [])`);
    }
    
    // 根據狀態管理的 effects 生成
    const stateEffects = component.implementation.stateManagement.effects;
    if (stateEffects && stateEffects.length > 0) {
      stateEffects.forEach(effect => {
        effects.push(`useEffect(() => {
    // 實現 ${effect} 副作用邏輯
  }, [/* dependencies */])`);
      });
    }
    
    return effects.join('\n\n  ');
  }

  /**
   * 生成計算值 (useMemo/useCallback)
   */
  private static generateComputedValues(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const computed = component.implementation.stateManagement.computed;
    
    if (!computed || computed.length === 0) {
      return '';
    }
    
    const memoizedValues = computed.map(name => {
      return `const ${name} = useMemo(() => {
    // 計算屬性：${name} 的邏輯實現
    return null
  }, [/* dependencies */])`;
    }).join('\n\n  ');
    
    return memoizedValues;
  }

  /**
   * 生成事件處理器
   */
  private static generateEventHandlers(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const handlers = [];
    
    // 從用戶交互生成處理器
    component.semantic.userInteractions.forEach(interaction => {
      const handlerName = `handle${this.capitalize(interaction.trigger)}`;
      const params = this.generateHandlerParams(interaction);
      
      const handler = `const ${handlerName} = useCallback((${params}) => {
    // 事件處理：${interaction.trigger} 邏輯實現
    ${this.generateInteractionLogic(interaction, component)}
  }, [])`;
      
      handlers.push(handler);
    });
    
    return handlers.join('\n\n  ');
  }

  /**
   * 生成 useImperativeHandle
   */
  private static generateImperativeHandle(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const methods = component.implementation.componentApi.methods;
    
    if (!methods || Object.keys(methods).length === 0) {
      return '';
    }
    
    const exposedMethods = Object.keys(methods)
      .map(methodName => `    ${methodName}: () => {
      // 方法實現：${methodName} 業務邏輯
    }`)
      .join(',\n');
    
    return `useImperativeHandle(ref, () => ({
${exposedMethods}
  }), [])`;
  }

  /**
   * 生成組件 JSX
   */
  private static generateComponentJSX(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const role = component.semantic.componentRole;
    
    switch (role) {
      case 'input':
        return this.generateInputJSX(component, options);
      case 'content':
        return this.generateContentJSX(component, options);
      case 'navigation':
        return this.generateNavigationJSX(component, options);
      case 'layout':
        return this.generateLayoutJSX(component, options);
      case 'feedback':
        return this.generateFeedbackJSX(component, options);
      default:
        return this.generateGenericJSX(component, options);
    }
  }

  /**
   * 生成輸入組件 JSX
   */
  private static generateInputJSX(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const className = this.generateCSSClass(component, options);
    const props = component.implementation.componentApi.props;
    
    const hasLabel = 'label' in props;
    const hasError = 'error' in props;
    
    return `<div className={${className}}>
  ${hasLabel ? '{props.label && <label htmlFor={inputId}>{props.label}</label>}' : ''}
  <input
    id={inputId}
    type={props.type || 'text'}
    value={value}
    placeholder={props.placeholder}
    disabled={props.disabled}
    required={props.required}
    onChange={handleChange}
    onFocus={handleFocus}
    onBlur={handleBlur}
  />
  ${hasError ? '{props.error && <span className="error">{props.error}</span>}' : ''}
</div>`;
  }

  /**
   * 生成內容組件 JSX
   */
  private static generateContentJSX(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const className = this.generateCSSClass(component, options);
    const contentModel = component.semantic.contentModel;
    
    if (contentModel?.type === 'dynamic' && contentModel.structure) {
      const fields = Object.keys(contentModel.structure);
      const content = fields.map(field => 
        `<div className="${field}">{props.data?.${field}}</div>`
      ).join('\n  ');
      
      return `<div className={${className}}>
  ${content}
</div>`;
    }
    
    return `<div className={${className}}>
  {props.children || props.content || 'Default content'}
</div>`;
  }

  /**
   * 生成導航組件 JSX
   */
  private static generateNavigationJSX(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const className = this.generateCSSClass(component, options);
    
    return `<nav className={${className}}>
  {props.items ? (
    <ul className="nav-list">
      {props.items.map((item, index) => (
        <li key={item.id || index} className="nav-item">
          <a
            href={item.href}
            className={item.active ? 'active' : ''}
            onClick={(e) => handleNavClick(item, e)}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  ) : (
    props.children || <a href="#" onClick={handleNavClick}>Navigation Item</a>
  )}
</nav>`;
  }

  /**
   * 生成佈局組件 JSX
   */
  private static generateLayoutJSX(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const className = this.generateCSSClass(component, options);
    const layout = component.design.visualProperties.layout;
    
    if (layout.display === 'grid') {
      return `<div className={${className}}>
  {props.header && <div className="header">{props.header}</div>}
  {props.sidebar && <div className="sidebar">{props.sidebar}</div>}
  <div className="main">{props.children}</div>
  {props.footer && <div className="footer">{props.footer}</div>}
</div>`;
    }
    
    return `<div className={${className}}>
  {props.children}
</div>`;
  }

  /**
   * 生成反饋組件 JSX
   */
  private static generateFeedbackJSX(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const className = this.generateCSSClass(component, options);
    
    return `{visible && (
  <div
    className={\`${className.replace(/[{}]/g, '')} \${props.type || ''} \${props.dismissible ? 'dismissible' : ''}\`}
  >
    <div className="content">
      {props.icon && <div className="icon">{props.icon}</div>}
      <div className="message">
        {props.children || props.message}
      </div>
    </div>
    {props.dismissible && (
      <button
        className="close-btn"
        onClick={handleClose}
        aria-label="Close"
      >
        ×
      </button>
    )}
  </div>
)}`;
  }

  /**
   * 生成通用組件 JSX
   */
  private static generateGenericJSX(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const className = this.generateCSSClass(component, options);
    
    return `<div className={${className}}>
  {props.children}
</div>`;
  }

  /**
   * 生成樣式代碼
   */
  private static generateStyleCode(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    if (options.styleFormat === 'styled-components') {
      return this.generateStyledComponents(component);
    } else if (options.styleFormat === 'emotion') {
      return this.generateEmotionStyles(component);
    } else if (options.styleFormat === 'tailwind') {
      return this.generateTailwindClasses(component);
    } else {
      return this.generateCSSStyles(component, options);
    }
  }

  /**
   * 生成 CSS 樣式
   */
  private static generateCSSStyles(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const className = this.generateClassName(component);
    const styles = this.extractStyles(component);
    
    let css = `.${className} {
${this.formatStyles(styles)}
}`;
    
    // 添加響應式樣式
    const responsive = component.design.responsiveBehavior;
    if (responsive.breakpoints.length > 0) {
      responsive.breakpoints.forEach(breakpoint => {
        const mediaQuery = `@media (min-width: ${breakpoint.minWidth}px)`;
        const responsiveStyles = this.formatStyles(breakpoint.properties);
        
        if (responsiveStyles.trim()) {
          css += `\n\n${mediaQuery} {
  .${className} {
${responsiveStyles}
  }
}`;
        }
      });
    }
    
    // 添加狀態樣式
    component.design.stateVariants.forEach(variant => {
      if (variant.state !== 'default') {
        const stateStyles = this.formatStyles(variant.properties);
        if (stateStyles.trim()) {
          css += `\n\n.${className}--${variant.state} {
${stateStyles}
}`;
        }
      }
    });
    
    return css;
  }

  /**
   * 生成 Styled Components
   */
  private static generateStyledComponents(component: ErComponent): string {
    const styles = this.extractStyles(component);
    const componentName = this.formatComponentName(component.name);
    
    const styledComponentStyles = Object.entries(styles)
      .map(([property, value]) => `  ${this.camelToKebab(property)}: ${value};`)
      .join('\n');
    
    return `export const Styled${componentName} = styled.div\`
${styledComponentStyles}
\``;
  }

  /**
   * 生成 Emotion 樣式
   */
  private static generateEmotionStyles(component: ErComponent): string {
    const styles = this.extractStyles(component);
    const componentName = this.formatComponentName(component.name);
    
    const emotionStyles = Object.entries(styles)
      .map(([property, value]) => `  ${this.camelToKebab(property)}: '${value}'`)
      .join(',\n');
    
    return `export const ${component.name.toLowerCase()}Styles = css({
${emotionStyles}
})`;
  }

  /**
   * 生成 Tailwind 類名
   */
  private static generateTailwindClasses(component: ErComponent): string {
    const styles = this.extractStyles(component);
    const classes = [];
    
    // 將樣式轉換為 Tailwind 類名
    if (styles.display === 'flex') classes.push('flex');
    if (styles.flexDirection === 'column') classes.push('flex-col');
    if (styles.justifyContent === 'center') classes.push('justify-center');
    if (styles.alignItems === 'center') classes.push('items-center');
    if (styles.padding) classes.push('p-4');
    if (styles.margin) classes.push('m-4');
    if (styles.backgroundColor) classes.push('bg-gray-100');
    if (styles.borderRadius) classes.push('rounded');
    
    return `// Tailwind classes: ${classes.join(' ')}`;
  }

  /**
   * 生成類型定義
   */
  private static generateTypeDefinitions(component: ErComponent): string {
    const props = component.implementation.componentApi.props;
    const events = component.implementation.componentApi.events;
    const methods = component.implementation.componentApi.methods;
    
    let types = `// Type definitions for ${component.name}\n\n`;
    
    // Props 接口
    const propsFields = Object.entries(props)
      .map(([name, prop]) => {
        const optional = prop.required ? '' : '?';
        return `  ${name}${optional}: ${this.mapTypeToTypeScript(prop.type)}`;
      })
      .join('\n');
    
    const eventFields = events ? Object.entries(events)
      .map(([name, event]) => {
        const params = Object.entries(event.parameters)
          .map(([paramName, paramType]) => `${paramName}: ${paramType}`)
          .join(', ');
        return `  on${this.capitalize(name)}?: (${params}) => void`;
      })
      .join('\n') : '';
    
    const allFields = [propsFields, eventFields].filter(Boolean).join('\n');
    
    types += `export interface ${component.name}Props {
${allFields}
}\n\n`;
    
    // Methods 接口 (如果有的話)
    if (methods && Object.keys(methods).length > 0) {
      const methodFields = Object.entries(methods)
        .map(([name, method]) => {
          const params = Object.entries(method.parameters)
            .map(([paramName, paramType]) => `${paramName}: ${paramType}`)
            .join(', ');
          return `  ${name}: (${params}) => ${method.returnType}`;
        })
        .join('\n');
      
      types += `export interface ${component.name}Ref {
${methodFields}
}\n`;
    }
    
    return types;
  }

  /**
   * 生成測試代碼
   */
  private static generateTestCode(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const componentName = this.formatComponentName(component.name);
    const fileName = this.formatFileName(component.name);
    
    return `import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ${componentName} from './${fileName}'

describe('${componentName}', () => {
  test('renders without crashing', () => {
    render(<${componentName} />)
    expect(screen.getByRole('${this.inferARIARole(component)}')).toBeInTheDocument()
  })

  test('displays correct content', () => {
    const testProps = {
      // Add test props here
    }
    render(<${componentName} {...testProps} />)
    
    // Add assertions here
    expect(screen.getByText(/expected content/i)).toBeInTheDocument()
  })

  ${this.generateInteractionTests(component, componentName)}
})`;
  }

  /**
   * 生成 Storybook 代碼
   */
  private static generateStoryCode(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const componentName = this.formatComponentName(component.name);
    const fileName = this.formatFileName(component.name);
    
    return `import type { Meta, StoryObj } from '@storybook/react'
import ${componentName} from './${fileName}'

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    docs: {
      description: {
        component: '${component.semantic.businessPurpose}'
      }
    }
  },
  argTypes: {
    ${this.generateArgTypes(component)}
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ${this.generateDefaultArgs(component)}
  }
}

${this.generateVariantStories(component)}`;
  }

  /**
   * 生成自定義 Hooks
   */
  private static generateCustomHooks(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const stateManagement = component.implementation.stateManagement;
    
    if (stateManagement.approach === 'props') {
      return '';
    }
    
    const hookName = `use${component.name}`;
    const stateShape = stateManagement.stateShape || {};
    
    const stateDeclarations = Object.entries(stateShape)
      .map(([key, type]) => {
        const defaultValue = this.getDefaultValueForType(type);
        return `  const [${key}, set${this.capitalize(key)}] = useState(${JSON.stringify(defaultValue)})`;
      })
      .join('\n');
    
    const returnObject = Object.keys(stateShape)
      .map(key => `    ${key},\n    set${this.capitalize(key)}`)
      .join(',\n');
    
    return `export const ${hookName} = () => {
${stateDeclarations}

  return {
${returnObject}
  }
}`;
  }

  // ===== 輔助方法 =====

  private static formatComponentName(name: string): string {
    return name.replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\s/g, '');
  }

  private static formatFileName(name: string): string {
    return name.replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }

  private static generateClassName(component: ErComponent): string {
    return component.name.replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  }

  private static generateCSSClass(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const className = this.generateClassName(component);
    
    if (options.cssModules) {
      return `styles.${className.replace(/-/g, '_')}`;
    } else if (options.styleFormat === 'styled-components') {
      return 'className';
    } else {
      return `"${className}"`;
    }
  }

  private static needsForwardRef(component: ErComponent): boolean {
    const methods = component.implementation.componentApi.methods;
    return methods && Object.keys(methods).length > 0;
  }

  private static generateStateInterface(component: ErComponent): string {
    const stateManagement = component.implementation.stateManagement;
    
    if (stateManagement.approach === 'props') {
      return '';
    }
    
    const stateFields = stateManagement.stateShape ? 
      Object.entries(stateManagement.stateShape)
        .map(([key, type]) => `  ${key}: ${this.mapTypeToTypeScript(type)}`)
        .join('\n') : '';
    
    return `interface ${this.formatComponentName(component.name)}State {
${stateFields}
}`;
  }

  private static generateConstructor(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const stateManagement = component.implementation.stateManagement;
    
    if (stateManagement.approach === 'props') {
      return '';
    }
    
    const initialState = stateManagement.stateShape ? 
      Object.entries(stateManagement.stateShape)
        .map(([key, type]) => `      ${key}: ${JSON.stringify(this.getDefaultValueForType(type))}`)
        .join(',\n') : '';
    
    return `  constructor(props: ${this.formatComponentName(component.name)}Props) {
    super(props)
    this.state = {
${initialState}
    }
  }`;
  }

  private static generateLifecycleMethods(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const methods = [];
    
    if (component.semantic.componentRole === 'content' || component.semantic.dataBinding) {
      methods.push(`  componentDidMount() {
    // 載入初始數據或初始化組件狀態
  }`);
    }
    
    return methods.join('\n\n');
  }

  private static generateClassMethods(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const methods = [];
    
    component.semantic.userInteractions.forEach(interaction => {
      const methodName = `handle${this.capitalize(interaction.trigger)}`;
      const params = this.generateHandlerParams(interaction);
      
      methods.push(`  ${methodName} = (${params}) => {
    // 事件處理：${interaction.trigger} 邏輯實現
    ${this.generateInteractionLogic(interaction, component)}
  }`);
    });
    
    return methods.join('\n\n');
  }

  private static generateRenderMethod(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const jsx = this.generateComponentJSX(component, options);
    
    return `  render() {
    return (
${this.indentCode(jsx, 3)}
    )
  }`;
  }

  private static generatePropTypes(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    if (options.useTypeScript || options.propsValidation !== 'propTypes') {
      return '';
    }
    
    const props = component.implementation.componentApi.props;
    const propTypes = Object.entries(props)
      .map(([name, prop]) => {
        const type = this.mapTypeToPropTypes(prop.type);
        const required = prop.required ? '.isRequired' : '';
        return `  ${name}: PropTypes.${type}${required}`;
      })
      .join(',\n');
    
    return `${this.formatComponentName(component.name)}.propTypes = {
${propTypes}
}`;
  }

  private static generateExports(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string {
    const componentName = this.formatComponentName(component.name);
    
    if (options.exportStyle === 'default') {
      return `export default ${componentName}`;
    } else {
      return `export { ${componentName} }
export default ${componentName}`;
    }
  }

  private static indentCode(code: string, level: number): string {
    const indent = '  '.repeat(level);
    return code.split('\n')
      .map(line => line ? indent + line : line)
      .join('\n');
  }

  private static extractStyles(component: ErComponent): Record<string, any> {
    const visual = component.design.visualProperties;
    const styles: Record<string, any> = {};
    
    // 佈局樣式
    const layout = visual.layout;
    if (layout.display) styles.display = layout.display;
    if (layout.flexDirection) styles.flexDirection = layout.flexDirection;
    if (layout.justifyContent) styles.justifyContent = layout.justifyContent;
    if (layout.alignItems) styles.alignItems = layout.alignItems;
    if (layout.gap) styles.gap = `${layout.gap}px`;
    if (layout.width) styles.width = typeof layout.width === 'number' ? `${layout.width}px` : layout.width;
    if (layout.height) styles.height = typeof layout.height === 'number' ? `${layout.height}px` : layout.height;
    
    // 樣式屬性
    const styling = visual.styling;
    if (styling.backgroundColor) styles.backgroundColor = styling.backgroundColor;
    if (styling.borderRadius) styles.borderRadius = `${styling.borderRadius}px`;
    if (styling.opacity) styles.opacity = styling.opacity;
    
    // 邊距和內距
    if (layout.padding) {
      const p = layout.padding;
      styles.padding = `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
    }
    if (layout.margin) {
      const m = layout.margin;
      styles.margin = `${m.top}px ${m.right}px ${m.bottom}px ${m.left}px`;
    }
    
    return styles;
  }

  private static formatStyles(styles: Record<string, any>): string {
    return Object.entries(styles)
      .map(([property, value]) => `  ${this.camelToKebab(property)}: ${value};`)
      .join('\n');
  }

  private static camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  private static mapTypeToTypeScript(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'object': 'Record<string, any>',
      'array': 'any[]',
      'function': '(...args: any[]) => any'
    };
    return typeMap[type] || 'any';
  }

  private static mapTypeToPropTypes(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'bool',
      'object': 'object',
      'array': 'array',
      'function': 'func'
    };
    return typeMap[type] || 'any';
  }

  private static getDefaultValueForType(type: string): any {
    const defaultMap: Record<string, any> = {
      'string': '',
      'number': 0,
      'boolean': false,
      'object': {},
      'array': []
    };
    return defaultMap[type] || null;
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private static generateHandlerParams(interaction: InteractionPattern): string {
    if (interaction.trigger === 'input') return 'event: React.ChangeEvent<HTMLInputElement>';
    if (interaction.trigger === 'click') return 'event: React.MouseEvent<HTMLElement>';
    if (interaction.trigger === 'focus') return 'event: React.FocusEvent<HTMLElement>';
    if (interaction.trigger === 'hover') return 'event: React.MouseEvent<HTMLElement>';
    return 'event: React.SyntheticEvent';
  }

  private static generateInteractionLogic(
    interaction: InteractionPattern,
    component: ErComponent
  ): string {
    if (interaction.trigger === 'click') {
      return `props.onClick?.(event)`;
    }
    if (interaction.trigger === 'input') {
      return `props.onChange?.(event.target.value)`;
    }
    return `props.on${this.capitalize(interaction.trigger)}?.(event)`;
  }

  private static generateInteractionTests(
    component: ErComponent,
    componentName: string
  ): string {
    const tests = component.semantic.userInteractions.map(interaction => {
      const eventName = interaction.trigger;
      return `
  test('handles ${eventName} interaction', async () => {
    const handle${this.capitalize(eventName)} = jest.fn()
    render(<${componentName} on${this.capitalize(eventName)}={handle${this.capitalize(eventName)}} />)
    
    // Trigger ${eventName} event
    fireEvent.${eventName}(screen.getByRole('${this.inferARIARole(component)}'))
    
    // Assert expected behavior
    expect(handle${this.capitalize(eventName)}).toHaveBeenCalled()
  })`;
    }).join('');
    
    return tests;
  }

  private static inferARIARole(component: ErComponent): string {
    const role = component.semantic.componentRole;
    const roleMap: Record<string, string> = {
      'input': 'textbox',
      'navigation': 'navigation',
      'content': 'main',
      'layout': 'generic',
      'feedback': 'alert',
      'interactive': 'button'
    };
    return roleMap[role] || 'generic';
  }

  private static generateArgTypes(component: ErComponent): string {
    const props = component.implementation.componentApi.props;
    return Object.entries(props)
      .map(([name, prop]) => {
        const control = prop.type === 'boolean' ? 'boolean' : 
                      prop.type === 'number' ? 'number' : 'text';
        return `${name}: { control: '${control}' }`;
      })
      .join(',\n    ');
  }

  private static generateDefaultArgs(component: ErComponent): string {
    const props = component.implementation.componentApi.props;
    return Object.entries(props)
      .filter(([, prop]) => prop.defaultValue !== undefined)
      .map(([name, prop]) => `${name}: ${JSON.stringify(prop.defaultValue)}`)
      .join(',\n    ');
  }

  private static generateVariantStories(component: ErComponent): string {
    return component.design.stateVariants
      .filter(variant => variant.state !== 'default')
      .map(variant => `
export const ${this.capitalize(variant.state)}: Story = {
  args: {
    ...Default.args,
    // Add ${variant.state} specific props
  }
}`)
      .join('');
  }

  private static extractDependencies(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string[] {
    const deps = ['react'];
    
    if (!options.useTypeScript && options.propsValidation === 'propTypes') {
      deps.push('prop-types');
    }
    
    if (options.styleFormat === 'styled-components') {
      deps.push('styled-components');
    } else if (options.styleFormat === 'emotion') {
      deps.push('@emotion/react', '@emotion/styled');
    }
    
    if (options.stateManagement === 'zustand') {
      deps.push('zustand');
    } else if (options.stateManagement === 'redux') {
      deps.push('react-redux', '@reduxjs/toolkit');
    }
    
    if (options.generateTests) {
      deps.push('@testing-library/react', '@testing-library/jest-dom', 'jest');
    }
    
    if (options.generateStories) {
      deps.push('@storybook/react');
    }
    
    return [...deps, ...component.implementation.dependencies.external];
  }

  private static generateImports(
    component: ErComponent,
    options: Required<ReactGenerationOptions>
  ): string[] {
    const imports = [];
    
    if (options.useHooks) {
      imports.push("import React, { useState, useEffect, useMemo, useCallback } from 'react'");
    } else {
      imports.push("import React, { Component } from 'react'");
    }
    
    return imports;
  }
}

export default ReactCodeGenerator;