import { AnalysisConfig } from '@/components/ui/AnalysisConfigPanel'

export interface ConfigTemplate {
  id: string
  name: string
  description: string
  config: AnalysisConfig
  category: 'default' | 'custom' | 'shared'
  tags: string[]
  createdAt: string
  updatedAt: string
  usageCount: number
  isPublic: boolean
  author: string
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  icon: string
  templates: ConfigTemplate[]
}

export class TemplateManager {
  private readonly STORAGE_KEY = 'erslice-analysis-templates'
  private readonly DEFAULT_TEMPLATES_KEY = 'erslice-default-templates'

  constructor() {
    this.initializeDefaultTemplates()
  }

  /**
   * 初始化默認模板
   */
  private initializeDefaultTemplates(): void {
    const existingDefaults = this.getDefaultTemplates()
    if (existingDefaults.length === 0) {
      const defaultTemplates = this.createDefaultTemplates()
      this.saveDefaultTemplates(defaultTemplates)
    }
  }

  /**
   * 創建默認模板
   */
  private createDefaultTemplates(): ConfigTemplate[] {
    const now = new Date().toISOString()
    
    return [
      {
        id: 'default-mobile-first',
        name: 'Mobile First 響應式設計',
        description: '專注於移動設備優先的響應式設計分析配置',
        config: {
          devices: {
            enabled: true,
            priority: 'mobile-first',
            breakpoints: { mobile: 375, tablet: 768, desktop: 1024 }
          },
          modules: {
            enabled: true,
            minComplexity: 1,
            maxComplexity: 8,
            autoGrouping: true,
            namingConvention: 'auto'
          },
          pages: {
            enabled: true,
            autoHierarchy: true,
            maxDepth: 5,
            stateDetection: true
          },
          states: {
            enabled: true,
            autoDetection: true,
            commonStates: ['default', 'hover', 'active', 'disabled'],
            customStates: []
          },
          designSystem: {
            enabled: true,
            colorAnalysis: true,
            typographyAnalysis: true,
            spacingAnalysis: true,
            componentPatterns: true
          },
          recommendations: {
            enabled: true,
            maxCount: 10,
            priority: 'high',
            categories: ['performance', 'accessibility', 'design']
          },
          performance: {
            maxFileSize: 100,
            maxProcessingTime: 120,
            enableCaching: true,
            parallelProcessing: true
          }
        },
        category: 'default',
        tags: ['mobile-first', 'responsive', 'performance'],
        createdAt: now,
        updatedAt: now,
        usageCount: 0,
        isPublic: true,
        author: 'ErSlice System'
      },
      {
        id: 'default-enterprise',
        name: '企業級應用分析',
        description: '適用於複雜企業應用的高級分析配置',
        config: {
          devices: {
            enabled: true,
            priority: 'adaptive',
            breakpoints: { mobile: 320, tablet: 768, desktop: 1440 }
          },
          modules: {
            enabled: true,
            minComplexity: 3,
            maxComplexity: 10,
            autoGrouping: true,
            namingConvention: 'hybrid'
          },
          pages: {
            enabled: true,
            autoHierarchy: true,
            maxDepth: 8,
            stateDetection: true
          },
          states: {
            enabled: true,
            autoDetection: true,
            commonStates: ['default', 'hover', 'active', 'disabled', 'loading', 'error', 'success'],
            customStates: ['validating', 'submitting', 'expanded', 'collapsed']
          },
          designSystem: {
            enabled: true,
            colorAnalysis: true,
            typographyAnalysis: true,
            spacingAnalysis: true,
            componentPatterns: true
          },
          recommendations: {
            enabled: true,
            maxCount: 15,
            priority: 'high',
            categories: ['performance', 'accessibility', 'design', 'development', 'testing']
          },
          performance: {
            maxFileSize: 500,
            maxProcessingTime: 300,
            enableCaching: true,
            parallelProcessing: true
          }
        },
        category: 'default',
        tags: ['enterprise', 'complex', 'comprehensive'],
        createdAt: now,
        updatedAt: now,
        usageCount: 0,
        isPublic: true,
        author: 'ErSlice System'
      },
      {
        id: 'default-rapid-prototyping',
        name: '快速原型設計',
        description: '專注於快速原型開發的精簡分析配置',
        config: {
          devices: {
            enabled: true,
            priority: 'desktop-first',
            breakpoints: { mobile: 375, tablet: 768, desktop: 1024 }
          },
          modules: {
            enabled: true,
            minComplexity: 1,
            maxComplexity: 5,
            autoGrouping: false,
            namingConvention: 'manual'
          },
          pages: {
            enabled: true,
            autoHierarchy: false,
            maxDepth: 3,
            stateDetection: false
          },
          states: {
            enabled: false,
            autoDetection: false,
            commonStates: ['default'],
            customStates: []
          },
          designSystem: {
            enabled: false,
            colorAnalysis: false,
            typographyAnalysis: false,
            spacingAnalysis: false,
            componentPatterns: false
          },
          recommendations: {
            enabled: false,
            maxCount: 0,
            priority: 'low',
            categories: []
          },
          performance: {
            maxFileSize: 50,
            maxProcessingTime: 60,
            enableCaching: false,
            parallelProcessing: false
          }
        },
        category: 'default',
        tags: ['rapid', 'prototype', 'simple'],
        createdAt: now,
        updatedAt: now,
        usageCount: 0,
        isPublic: true,
        author: 'ErSlice System'
      }
    ]
  }

  /**
   * 獲取所有模板
   */
  getAllTemplates(): ConfigTemplate[] {
    const customTemplates = this.getCustomTemplates()
    const defaultTemplates = this.getDefaultTemplates()
    return [...defaultTemplates, ...customTemplates]
  }

  /**
   * 獲取默認模板
   */
  getDefaultTemplates(): ConfigTemplate[] {
    try {
      const stored = localStorage.getItem(this.DEFAULT_TEMPLATES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('讀取默認模板失敗:', error)
      return []
    }
  }

  /**
   * 獲取自定義模板
   */
  getCustomTemplates(): ConfigTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('讀取自定義模板失敗:', error)
      return []
    }
  }

  /**
   * 根據 ID 獲取模板
   */
  getTemplateById(id: string): ConfigTemplate | null {
    const allTemplates = this.getAllTemplates()
    return allTemplates.find(template => template.id === id) || null
  }

  /**
   * 根據類別獲取模板
   */
  getTemplatesByCategory(category: ConfigTemplate['category']): ConfigTemplate[] {
    const allTemplates = this.getAllTemplates()
    return allTemplates.filter(template => template.category === category)
  }

  /**
   * 根據標籤獲取模板
   */
  getTemplatesByTag(tag: string): ConfigTemplate[] {
    const allTemplates = this.getAllTemplates()
    return allTemplates.filter(template => template.tags.includes(tag))
  }

  /**
   * 搜索模板
   */
  searchTemplates(query: string): ConfigTemplate[] {
    const allTemplates = this.getAllTemplates()
    const lowerQuery = query.toLowerCase()
    
    return allTemplates.filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * 保存自定義模板
   */
  saveCustomTemplate(template: Omit<ConfigTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): string {
    const customTemplates = this.getCustomTemplates()
    
    const newTemplate: ConfigTemplate = {
      ...template,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    }
    
    customTemplates.push(newTemplate)
    this.saveCustomTemplates(customTemplates)
    
    return newTemplate.id
  }

  /**
   * 更新自定義模板
   */
  updateCustomTemplate(id: string, updates: Partial<ConfigTemplate>): boolean {
    const customTemplates = this.getCustomTemplates()
    const index = customTemplates.findIndex(template => template.id === id)
    
    if (index === -1) return false
    
    customTemplates[index] = {
      ...customTemplates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.saveCustomTemplates(customTemplates)
    return true
  }

  /**
   * 刪除自定義模板
   */
  deleteCustomTemplate(id: string): boolean {
    const customTemplates = this.getCustomTemplates()
    const filtered = customTemplates.filter(template => template.id !== id)
    
    if (filtered.length === customTemplates.length) return false
    
    this.saveCustomTemplates(filtered)
    return true
  }

  /**
   * 增加模板使用次數
   */
  incrementTemplateUsage(id: string): void {
    const allTemplates = this.getAllTemplates()
    const template = allTemplates.find(t => t.id === id)
    
    if (!template) return
    
    if (template.category === 'custom') {
      const customTemplates = this.getCustomTemplates()
      const index = customTemplates.findIndex(t => t.id === id)
      if (index !== -1) {
        customTemplates[index].usageCount++
        customTemplates[index].updatedAt = new Date().toISOString()
        this.saveCustomTemplates(customTemplates)
      }
    } else {
      // 更新默認模板使用次數
      const defaultTemplates = this.getDefaultTemplates()
      const index = defaultTemplates.findIndex(t => t.id === id)
      if (index !== -1) {
        defaultTemplates[index].usageCount++
        defaultTemplates[index].updatedAt = new Date().toISOString()
        this.saveDefaultTemplates(defaultTemplates)
      }
    }
  }

  /**
   * 獲取最常用的模板
   */
  getMostUsedTemplates(limit: number = 5): ConfigTemplate[] {
    const allTemplates = this.getAllTemplates()
    return allTemplates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  }

  /**
   * 獲取最近創建的模板
   */
  getRecentlyCreatedTemplates(limit: number = 5): ConfigTemplate[] {
    const allTemplates = this.getAllTemplates()
    return allTemplates
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  /**
   * 導出模板
   */
  exportTemplate(id: string): string | null {
    const template = this.getTemplateById(id)
    if (!template) return null
    
    return JSON.stringify(template, null, 2)
  }

  /**
   * 導入模板
   */
  importTemplate(templateData: string): string | null {
    try {
      const template: ConfigTemplate = JSON.parse(templateData)
      
      // 驗證模板數據
      if (!this.validateTemplate(template)) {
        throw new Error('模板數據格式無效')
      }
      
      // 生成新的 ID 和時間戳
      const newTemplate: ConfigTemplate = {
        ...template,
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        category: 'custom',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        isPublic: false,
        author: 'Imported'
      }
      
      const customTemplates = this.getCustomTemplates()
      customTemplates.push(newTemplate)
      this.saveCustomTemplates(customTemplates)
      
      return newTemplate.id
    } catch (error) {
      console.error('導入模板失敗:', error)
      return null
    }
  }

  /**
   * 驗證模板數據
   */
  private validateTemplate(template: any): template is ConfigTemplate {
    return (
      template &&
      typeof template.name === 'string' &&
      typeof template.description === 'string' &&
      template.config &&
      typeof template.category === 'string' &&
      Array.isArray(template.tags)
    )
  }

  /**
   * 保存自定義模板到本地存儲
   */
  private saveCustomTemplates(templates: ConfigTemplate[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates))
    } catch (error) {
      console.error('保存自定義模板失敗:', error)
    }
  }

  /**
   * 保存默認模板到本地存儲
   */
  private saveDefaultTemplates(templates: ConfigTemplate[]): void {
    try {
      localStorage.setItem(this.DEFAULT_TEMPLATES_KEY, JSON.stringify(templates))
    } catch (error) {
      console.error('保存默認模板失敗:', error)
    }
  }

  /**
   * 清理未使用的模板
   */
  cleanupUnusedTemplates(): number {
    const customTemplates = this.getCustomTemplates()
    const usedTemplates = customTemplates.filter(template => template.usageCount > 0)
    const unusedCount = customTemplates.length - usedTemplates.length
    
    this.saveCustomTemplates(usedTemplates)
    return unusedCount
  }

  /**
   * 獲取模板統計信息
   */
  getTemplateStats(): {
    total: number
    custom: number
    default: number
    shared: number
    totalUsage: number
    averageUsage: number
  } {
    const allTemplates = this.getAllTemplates()
    const customTemplates = this.getCustomTemplates()
    const defaultTemplates = this.getDefaultTemplates()
    
    const totalUsage = allTemplates.reduce((sum, template) => sum + template.usageCount, 0)
    const averageUsage = allTemplates.length > 0 ? totalUsage / allTemplates.length : 0
    
    return {
      total: allTemplates.length,
      custom: customTemplates.length,
      default: defaultTemplates.length,
      shared: allTemplates.filter(t => t.category === 'shared').length,
      totalUsage,
      averageUsage: Math.round(averageUsage * 100) / 100
    }
  }
}

// 創建單例實例
export const templateManager = new TemplateManager()
