/**
 * Vue 代碼生成器
 * 從 ErComponent 生成 Vue 3 組件代碼
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

export interface VueGenerationOptions {
  useCompositionAPI?: boolean;
  useTypeScript?: boolean;
  styleFormat?: 'css' | 'scss' | 'styled-components';
  importStyle?: 'named' | 'default' | 'namespace';
  generateTests?: boolean;
  generateStories?: boolean;
}

export interface VueCodeOutput {
  componentCode: string;
  styleCode: string;
  typeDefinitions?: string;
  testCode?: string;
  storyCode?: string;
  dependencies: string[];
  imports: string[];
}

export class VueCodeGenerator {
  /**
   * 從 ErComponent 生成 Vue 組件代碼
   */
  static generateVueComponent(
    component: ErComponent,
    options: VueGenerationOptions = {}
  ): VueCodeOutput {
    const opts = this.mergeOptions(options);
    
    const componentCode = this.generateComponentTemplate(component, opts);
    const styleCode = this.generateStyleCode(component, opts);
    const typeDefinitions = opts.useTypeScript ? 
      this.generateTypeDefinitions(component) : undefined;
    const testCode = opts.generateTests ? 
      this.generateTestCode(component, opts) : undefined;
    const storyCode = opts.generateStories ? 
      this.generateStoryCode(component, opts) : undefined;
    
    const dependencies = this.extractDependencies(component, opts);
    const imports = this.generateImports(component, opts);
    
    return {
      componentCode,
      styleCode,
      typeDefinitions,
      testCode,
      storyCode,
      dependencies,
      imports
    };
  }

  /**
   * 合併選項
   */
  private static mergeOptions(options: VueGenerationOptions): Required<VueGenerationOptions> {
    return {
      useCompositionAPI: true,
      useTypeScript: true,
      styleFormat: 'scss',
      importStyle: 'named',
      generateTests: true,
      generateStories: true,
      ...options
    };
  }

  /**
   * 生成組件模板
   */
  private static generateComponentTemplate(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const scriptSection = this.generateScriptSection(component, options);
    const templateSection = this.generateTemplateSection(component);
    const styleSection = this.generateStyleSection(component, options);
    
    return `${scriptSection}

${templateSection}

${styleSection}`.trim();
  }

  /**
   * 生成 Script 部分
   */
  private static generateScriptSection(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const lang = options.useTypeScript ? ' lang="ts"' : '';
    const setup = options.useCompositionAPI ? ' setup' : '';
    
    if (options.useCompositionAPI) {
      return this.generateCompositionAPIScript(component, options, lang, setup);
    } else {
      return this.generateOptionsAPIScript(component, options, lang);
    }
  }

  /**
   * 生成 Composition API Script
   */
  private static generateCompositionAPIScript(
    component: ErComponent,
    options: Required<VueGenerationOptions>,
    lang: string,
    setup: string
  ): string {
    const imports = this.generateVueImports(component, options);
    const props = this.generatePropsDefinition(component, options);
    const emits = this.generateEmitsDefinition(component, options);
    const state = this.generateStateDefinition(component, options);
    const computed = this.generateComputedDefinition(component, options);
    const methods = this.generateMethodsDefinition(component, options);
    const lifecycle = this.generateLifecycleHooks(component, options);
    const exposed = this.generateExposeDefinition(component, options);
    
    return `<script${setup}${lang}>
${imports}

${props}

${emits}

${state}

${computed}

${methods}

${lifecycle}

${exposed}
</script>`;
  }

  /**
   * 生成 Options API Script
   */
  private static generateOptionsAPIScript(
    component: ErComponent,
    options: Required<VueGenerationOptions>,
    lang: string
  ): string {
    const imports = this.generateVueImports(component, options);
    const componentName = this.formatComponentName(component.name);
    const props = this.generateOptionsAPIProps(component, options);
    const emits = this.generateOptionsAPIEmits(component, options);
    const data = this.generateDataFunction(component, options);
    const computed = this.generateOptionsAPIComputed(component, options);
    const methods = this.generateOptionsAPIMethods(component, options);
    const lifecycle = this.generateOptionsAPILifecycle(component, options);
    
    return `<script${lang}>
${imports}

export default {
  name: '${componentName}',
${props}
${emits}
${data}
${computed}
${methods}
${lifecycle}
}
</script>`;
  }

  /**
   * 生成 Vue 導入
   */
  private static generateVueImports(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const imports = [];
    
    if (options.useCompositionAPI) {
      const compositionImports = ['ref', 'computed', 'onMounted'];
      
      // 根據組件功能添加所需的導入
      if (component.semantic.userInteractions.length > 0) {
        compositionImports.push('watch');
      }
      
      if (component.implementation.stateManagement.approach !== 'props') {
        compositionImports.push('reactive');
      }
      
      imports.push(`import { ${compositionImports.join(', ')} } from 'vue'`);
    }
    
    // 添加其他依賴
    const dependencies = component.implementation.dependencies;
    dependencies.external.forEach(dep => {
      if (dep !== 'vue') {
        imports.push(`import ${dep} from '${dep}'`);
      }
    });
    
    return imports.join('\n');
  }

  /**
   * 生成 Props 定義 (Composition API)
   */
  private static generatePropsDefinition(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const props = component.implementation.componentApi.props;
    
    if (Object.keys(props).length === 0) {
      return '';
    }
    
    if (options.useTypeScript) {
      return this.generateTypeScriptPropsDefinition(props);
    } else {
      return this.generateJavaScriptPropsDefinition(props);
    }
  }

  /**
   * 生成 TypeScript Props 定義
   */
  private static generateTypeScriptPropsDefinition(props: ComponentProps): string {
    const propsInterface = Object.entries(props)
      .map(([name, prop]) => {
        const optional = prop.required ? '' : '?';
        return `  ${name}${optional}: ${this.mapTypeToTypeScript(prop.type)}`;
      })
      .join('\n');
    
    const propsWithDefaults = Object.entries(props)
      .filter(([, prop]) => prop.defaultValue !== undefined)
      .map(([name, prop]) => `  ${name}: ${JSON.stringify(prop.defaultValue)}`)
      .join(',\n');
    
    const interfaceDefinition = `interface Props {
${propsInterface}
}`;
    
    const propsDefinition = `const props = withDefaults(defineProps<Props>(), {
${propsWithDefaults}
})`;
    
    return propsWithDefaults ? 
      `${interfaceDefinition}\n\n${propsDefinition}` : 
      `${interfaceDefinition}\n\nconst props = defineProps<Props>()`;
  }

  /**
   * 生成 JavaScript Props 定義
   */
  private static generateJavaScriptPropsDefinition(props: ComponentProps): string {
    const propDefinitions = Object.entries(props)
      .map(([name, prop]) => {
        const def = {
          type: this.mapTypeToVueType(prop.type),
          required: prop.required
        };
        
        if (prop.defaultValue !== undefined) {
          def['default'] = prop.defaultValue;
        }
        
        return `  ${name}: ${JSON.stringify(def, null, 2).replace(/\n/g, '\n  ')}`;
      })
      .join(',\n');
    
    return `const props = defineProps({
${propDefinitions}
})`;
  }

  /**
   * 生成 Emits 定義
   */
  private static generateEmitsDefinition(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const events = component.implementation.componentApi.events;
    
    if (!events || Object.keys(events).length === 0) {
      return '';
    }
    
    if (options.useTypeScript) {
      const eventTypes = Object.entries(events)
        .map(([name, event]) => {
          const params = Object.entries(event.parameters)
            .map(([paramName, paramType]) => `${paramName}: ${paramType}`)
            .join(', ');
          return `  ${name}: [${params}]`;
        })
        .join('\n');
      
      return `const emit = defineEmits<{
${eventTypes}
}>()`;
    } else {
      const eventNames = Object.keys(events).map(name => `'${name}'`).join(', ');
      return `const emit = defineEmits([${eventNames}])`;
    }
  }

  /**
   * 生成狀態定義
   */
  private static generateStateDefinition(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const stateManagement = component.implementation.stateManagement;
    
    if (stateManagement.approach === 'props') {
      return '';
    }
    
    const stateEntries = [];
    
    if (stateManagement.stateShape) {
      Object.entries(stateManagement.stateShape).forEach(([key, type]) => {
        const defaultValue = this.getDefaultValueForType(type);
        if (type === 'object' || type === 'array') {
          stateEntries.push(`const ${key} = reactive(${JSON.stringify(defaultValue)})`);
        } else {
          stateEntries.push(`const ${key} = ref(${JSON.stringify(defaultValue)})`);
        }
      });
    }
    
    return stateEntries.join('\n');
  }

  /**
   * 生成 Computed 定義
   */
  private static generateComputedDefinition(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const computed = component.implementation.stateManagement.computed;
    
    if (!computed || computed.length === 0) {
      return '';
    }
    
    const computedDefinitions = computed.map(name => {
      return `const ${name} = computed(() => {
  // TODO: Implement ${name} logic
  return null
})`;
    }).join('\n\n');
    
    return computedDefinitions;
  }

  /**
   * 生成方法定義
   */
  private static generateMethodsDefinition(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const methods = [];
    
    // 從用戶交互生成方法
    component.semantic.userInteractions.forEach(interaction => {
      const methodName = `handle${this.capitalize(interaction.trigger)}`;
      const method = `const ${methodName} = (${this.generateEventParams(interaction)}) => {
  // TODO: Implement ${interaction.trigger} logic
  ${this.generateInteractionLogic(interaction)}
}`;
      methods.push(method);
    });
    
    // 從狀態管理操作生成方法
    const actions = component.implementation.stateManagement.actions;
    if (actions) {
      actions.forEach(action => {
        const method = `const ${action} = (payload) => {
  // TODO: Implement ${action} logic
}`;
        methods.push(method);
      });
    }
    
    return methods.join('\n\n');
  }

  /**
   * 生成生命週期鉤子
   */
  private static generateLifecycleHooks(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const hooks = [];
    
    // 根據組件角色添加適當的生命週期鉤子
    if (component.semantic.componentRole === 'content' || component.semantic.dataBinding) {
      hooks.push(`onMounted(() => {
  // TODO: Load data or initialize component
})`);
    }
    
    return hooks.join('\n\n');
  }

  /**
   * 生成 Expose 定義
   */
  private static generateExposeDefinition(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const api = component.implementation.componentApi;
    
    if (!api.methods || Object.keys(api.methods).length === 0) {
      return '';
    }
    
    const exposedMethods = Object.keys(api.methods).join(', ');
    return `defineExpose({
  ${exposedMethods}
})`;
  }

  /**
   * 生成模板部分
   */
  private static generateTemplateSection(component: ErComponent): string {
    const template = this.generateComponentTemplate(component);
    
    return `<template>
${this.indentTemplate(template)}
</template>`;
  }

  /**
   * 生成組件模板內容
   */
  private static generateComponentTemplate(component: ErComponent): string {
    const role = component.semantic.componentRole;
    const layout = component.design.visualProperties.layout;
    
    // 根據組件角色生成不同的模板
    switch (role) {
      case 'input':
        return this.generateInputTemplate(component);
      case 'content':
        return this.generateContentTemplate(component);
      case 'navigation':
        return this.generateNavigationTemplate(component);
      case 'layout':
        return this.generateLayoutTemplate(component);
      case 'feedback':
        return this.generateFeedbackTemplate(component);
      default:
        return this.generateGenericTemplate(component);
    }
  }

  /**
   * 生成輸入組件模板
   */
  private static generateInputTemplate(component: ErComponent): string {
    const props = component.implementation.componentApi.props;
    const hasLabel = 'label' in props;
    const hasError = 'error' in props;
    
    return `<div class="${this.generateClassName(component)}">
  ${hasLabel ? '<label v-if="label" :for="inputId">{{ label }}</label>' : ''}
  <input
    :id="inputId"
    v-model="value"
    :type="type || 'text'"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
  />
  ${hasError ? '<span v-if="error" class="error">{{ error }}</span>' : ''}
</div>`;
  }

  /**
   * 生成內容組件模板
   */
  private static generateContentTemplate(component: ErComponent): string {
    const contentModel = component.semantic.contentModel;
    
    if (contentModel?.type === 'dynamic') {
      const fields = Object.keys(contentModel.structure);
      const content = fields.map(field => 
        `<div class="${field}">{{ data?.${field} }}</div>`
      ).join('\n  ');
      
      return `<div class="${this.generateClassName(component)}">
  ${content}
</div>`;
    }
    
    return `<div class="${this.generateClassName(component)}">
  <slot>
    <p>{{ content || 'Default content' }}</p>
  </slot>
</div>`;
  }

  /**
   * 生成導航組件模板
   */
  private static generateNavigationTemplate(component: ErComponent): string {
    return `<nav class="${this.generateClassName(component)}">
  <ul v-if="items" class="nav-list">
    <li
      v-for="item in items"
      :key="item.id || item.label"
      class="nav-item"
    >
      <a
        :href="item.href"
        :class="{ active: item.active }"
        @click="handleNavClick(item, $event)"
      >
        {{ item.label }}
      </a>
    </li>
  </ul>
  <slot v-else name="default">
    <a href="#" @click="handleNavClick">Navigation Item</a>
  </slot>
</nav>`;
  }

  /**
   * 生成佈局組件模板
   */
  private static generateLayoutTemplate(component: ErComponent): string {
    const layout = component.design.visualProperties.layout;
    
    if (layout.display === 'grid') {
      return `<div class="${this.generateClassName(component)} grid-layout">
  <slot name="header" />
  <slot name="sidebar" />
  <slot name="main" />
  <slot name="footer" />
</div>`;
    }
    
    return `<div class="${this.generateClassName(component)}">
  <slot />
</div>`;
  }

  /**
   * 生成反饋組件模板
   */
  private static generateFeedbackTemplate(component: ErComponent): string {
    return `<div
  v-if="visible"
  :class="[
    '${this.generateClassName(component)}',
    type && \`\${type}\`,
    { dismissible }
  ]"
>
  <div class="content">
    <slot name="icon" />
    <div class="message">
      <slot>{{ message }}</slot>
    </div>
  </div>
  <button
    v-if="dismissible"
    class="close-btn"
    @click="handleClose"
    aria-label="Close"
  >
    ×
  </button>
</div>`;
  }

  /**
   * 生成通用組件模板
   */
  private static generateGenericTemplate(component: ErComponent): string {
    return `<div class="${this.generateClassName(component)}">
  <slot />
</div>`;
  }

  /**
   * 生成樣式部分
   */
  private static generateStyleSection(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const scoped = ' scoped';
    const lang = options.styleFormat === 'scss' ? ' lang="scss"' : '';
    
    return `<style${scoped}${lang}>
${this.generateStyleCode(component, options)}
</style>`;
  }

  /**
   * 生成樣式代碼
   */
  private static generateStyleCode(
    component: ErComponent,
    options: Required<VueGenerationOptions>
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
          css += `\n\n.${className}.${variant.state} {
${stateStyles}
}`;
        }
      }
    });
    
    return css;
  }

  /**
   * 生成類型定義
   */
  private static generateTypeDefinitions(component: ErComponent): string {
    const props = component.implementation.componentApi.props;
    const events = component.implementation.componentApi.events;
    
    let types = `// Type definitions for ${component.name}\n\n`;
    
    // Props 接口
    const propsInterface = Object.entries(props)
      .map(([name, prop]) => {
        const optional = prop.required ? '' : '?';
        return `  ${name}${optional}: ${this.mapTypeToTypeScript(prop.type)}`;
      })
      .join('\n');
    
    types += `export interface ${component.name}Props {
${propsInterface}
}\n\n`;
    
    // Events 接口
    if (events && Object.keys(events).length > 0) {
      const eventsInterface = Object.entries(events)
        .map(([name, event]) => {
          const params = Object.entries(event.parameters)
            .map(([paramName, paramType]) => `${paramName}: ${paramType}`)
            .join(', ');
          return `  ${name}: (${params}) => void`;
        })
        .join('\n');
      
      types += `export interface ${component.name}Events {
${eventsInterface}
}\n`;
    }
    
    return types;
  }

  /**
   * 生成測試代碼
   */
  private static generateTestCode(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const componentName = this.formatComponentName(component.name);
    const fileName = this.formatFileName(component.name);
    
    return `import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ${componentName} from './${fileName}.vue'

describe('${componentName}', () => {
  it('renders properly', () => {
    const wrapper = mount(${componentName})
    expect(wrapper.exists()).toBe(true)
  })

  it('displays correct content', () => {
    const wrapper = mount(${componentName}, {
      props: {
        // Add test props here
      }
    })
    
    // Add assertions here
    expect(wrapper.text()).toContain('Expected content')
  })

  ${this.generateInteractionTests(component)}
})`;
  }

  /**
   * 生成 Storybook 代碼
   */
  private static generateStoryCode(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const componentName = this.formatComponentName(component.name);
    const fileName = this.formatFileName(component.name);
    
    return `import type { Meta, StoryObj } from '@storybook/vue3'
import ${componentName} from './${fileName}.vue'

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

  private static indentTemplate(template: string, level: number = 1): string {
    const indent = '  '.repeat(level);
    return template.split('\n')
      .map(line => line ? indent + line : line)
      .join('\n');
  }

  private static extractStyles(component: ErComponent): Record<string, any> {
    const visual = component.design.visualProperties;
    const styles: Record<string, any> = {};
    
    // 佈局樣式
    const layout = visual.layout;
    if (layout.display) styles.display = layout.display;
    if (layout.flexDirection) styles['flex-direction'] = layout.flexDirection;
    if (layout.justifyContent) styles['justify-content'] = layout.justifyContent;
    if (layout.alignItems) styles['align-items'] = layout.alignItems;
    if (layout.gap) styles.gap = `${layout.gap}px`;
    if (layout.width) styles.width = typeof layout.width === 'number' ? `${layout.width}px` : layout.width;
    if (layout.height) styles.height = typeof layout.height === 'number' ? `${layout.height}px` : layout.height;
    
    // 樣式屬性
    const styling = visual.styling;
    if (styling.backgroundColor) styles['background-color'] = styling.backgroundColor;
    if (styling.borderRadius) styles['border-radius'] = `${styling.borderRadius}px`;
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
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');
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

  private static mapTypeToVueType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'String',
      'number': 'Number',
      'boolean': 'Boolean',
      'object': 'Object',
      'array': 'Array',
      'function': 'Function'
    };
    return typeMap[type] || 'String';
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

  private static generateEventParams(interaction: InteractionPattern): string {
    if (interaction.trigger === 'input') return 'event';
    if (interaction.trigger === 'click') return 'event';
    return 'event';
  }

  private static generateInteractionLogic(interaction: InteractionPattern): string {
    if (interaction.trigger === 'click') {
      return `emit('${interaction.trigger}', event)`;
    }
    if (interaction.trigger === 'input') {
      return `emit('input', event.target.value)`;
    }
    return `emit('${interaction.trigger}', event)`;
  }

  private static generateInteractionTests(component: ErComponent): string {
    const tests = component.semantic.userInteractions.map(interaction => {
      const eventName = interaction.trigger;
      return `
  it('handles ${eventName} interaction', async () => {
    const wrapper = mount(${this.formatComponentName(component.name)})
    
    // Trigger ${eventName} event
    await wrapper.trigger('${eventName}')
    
    // Assert expected behavior
    expect(wrapper.emitted('${eventName}')).toBeTruthy()
  })`;
    }).join('');
    
    return tests;
  }

  private static generateArgTypes(component: ErComponent): string {
    const props = component.implementation.componentApi.props;
    return Object.entries(props)
      .map(([name, prop]) => `${name}: { control: 'text' }`)
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
    options: Required<VueGenerationOptions>
  ): string[] {
    const deps = ['vue'];
    
    if (options.generateTests) {
      deps.push('@vue/test-utils', 'vitest');
    }
    
    if (options.generateStories) {
      deps.push('@storybook/vue3');
    }
    
    return [...deps, ...component.implementation.dependencies.external];
  }

  private static generateImports(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string[] {
    const imports = [];
    
    if (options.useCompositionAPI) {
      imports.push("import { ref, computed, onMounted } from 'vue'");
    }
    
    return imports;
  }

  // Options API 相關方法
  private static generateOptionsAPIProps(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const props = component.implementation.componentApi.props;
    
    if (Object.keys(props).length === 0) {
      return '';
    }
    
    const propDefinitions = Object.entries(props)
      .map(([name, prop]) => {
        const def: any = {
          type: this.mapTypeToVueType(prop.type),
          required: prop.required
        };
        
        if (prop.defaultValue !== undefined) {
          def.default = prop.defaultValue;
        }
        
        return `    ${name}: ${JSON.stringify(def, null, 4).replace(/\n/g, '\n    ')}`;
      })
      .join(',\n');
    
    return `  props: {
${propDefinitions}
  },`;
  }

  private static generateOptionsAPIEmits(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const events = component.implementation.componentApi.events;
    
    if (!events || Object.keys(events).length === 0) {
      return '';
    }
    
    const eventNames = Object.keys(events).map(name => `'${name}'`).join(', ');
    return `  emits: [${eventNames}],`;
  }

  private static generateDataFunction(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const stateManagement = component.implementation.stateManagement;
    
    if (stateManagement.approach === 'props') {
      return '';
    }
    
    const dataEntries: Record<string, any> = {};
    
    if (stateManagement.stateShape) {
      Object.entries(stateManagement.stateShape).forEach(([key, type]) => {
        dataEntries[key] = this.getDefaultValueForType(type);
      });
    }
    
    return `  data() {
    return ${JSON.stringify(dataEntries, null, 6).replace(/\n/g, '\n    ')}
  },`;
  }

  private static generateOptionsAPIComputed(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const computed = component.implementation.stateManagement.computed;
    
    if (!computed || computed.length === 0) {
      return '';
    }
    
    const computedDefinitions = computed.map(name => {
      return `    ${name}() {
      // TODO: Implement ${name} logic
      return null
    }`;
    }).join(',\n');
    
    return `  computed: {
${computedDefinitions}
  },`;
  }

  private static generateOptionsAPIMethods(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const methods = [];
    
    // 從用戶交互生成方法
    component.semantic.userInteractions.forEach(interaction => {
      const methodName = `handle${this.capitalize(interaction.trigger)}`;
      methods.push(`    ${methodName}(${this.generateEventParams(interaction)}) {
      // TODO: Implement ${interaction.trigger} logic
      ${this.generateInteractionLogic(interaction)}
    }`);
    });
    
    if (methods.length === 0) {
      return '';
    }
    
    return `  methods: {
${methods.join(',\n')}
  },`;
  }

  private static generateOptionsAPILifecycle(
    component: ErComponent,
    options: Required<VueGenerationOptions>
  ): string {
    const hooks = [];
    
    // 根據組件角色添加適當的生命週期鉤子
    if (component.semantic.componentRole === 'content' || component.semantic.dataBinding) {
      hooks.push(`  mounted() {
    // TODO: Load data or initialize component
  }`);
    }
    
    return hooks.join(',\n');
  }
}

export default VueCodeGenerator;