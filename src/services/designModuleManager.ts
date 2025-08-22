import { DesignModuleTemplate, SlicePackage } from './figmaImportWorkflow'

export interface DesignModuleData {
  id: string
  name: string
  description: string
  status: 'active' | 'archived' | 'deleted'
  asset_count: number
  project_slugs: string[]
  primary_project: string
  created_from: string
  created_at: string
  updated_at: string
  metadata?: any
}

export interface ModuleSearchCriteria {
  query?: string
  status?: string
  project?: string
  createdFrom?: string
  dateRange?: {
    start: string
    end: string
  }
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'asset_count'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface ModuleUpdateData {
  name?: string
  description?: string
  status?: string
  project_slugs?: string[]
  primary_project?: string
  metadata?: any
}

export class DesignModuleManager {
  private modules: Map<string, DesignModuleData> = new Map()
  private slicePackages: Map<string, SlicePackage> = new Map()
  private searchIndex: Map<string, string[]> = new Map()

  constructor() {
    this.loadFromLocalStorage()
    this.buildSearchIndex()
  }

  /**
   * 創建設計模組
   */
  async createModule(module: DesignModuleTemplate): Promise<DesignModuleData> {
    try {
      const moduleData: DesignModuleData = {
        id: module.id,
        name: module.name,
        description: module.description,
        status: 'active',
        asset_count: module.assets.length,
        project_slugs: ['figma-import'],
        primary_project: 'figma-import',
        created_from: 'figma-import',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          complexity: module.complexity,
          estimatedTime: module.estimatedTime,
          analysis: module.analysis
        }
      }

      this.modules.set(module.id, moduleData)
      this.updateSearchIndex(moduleData)
      this.saveToLocalStorage()

      console.log('✅ 設計模組創建成功:', module.name)
      return moduleData
    } catch (error) {
      console.error('❌ 創建設計模組失敗:', error)
      throw new Error(`Failed to create design module: ${error}`)
    }
  }

  /**
   * 讀取設計模組
   */
  async getModule(id: string): Promise<DesignModuleData | null> {
    try {
      const module = this.modules.get(id)
      if (!module) {
        console.warn('⚠️ 設計模組不存在:', id)
        return null
      }

      return module
    } catch (error) {
      console.error('❌ 讀取設計模組失敗:', error)
      throw new Error(`Failed to read design module: ${error}`)
    }
  }

  /**
   * 更新設計模組
   */
  async updateModule(id: string, updateData: ModuleUpdateData): Promise<DesignModuleData | null> {
    try {
      const module = this.modules.get(id)
      if (!module) {
        console.warn('⚠️ 設計模組不存在，無法更新:', id)
        return null
      }

      // 更新模組數據
      const updatedModule: DesignModuleData = {
        ...module,
        ...updateData,
        updated_at: new Date().toISOString()
      }

      this.modules.set(id, updatedModule)
      this.updateSearchIndex(updatedModule)
      this.saveToLocalStorage()

      console.log('✅ 設計模組更新成功:', module.name)
      return updatedModule
    } catch (error) {
      console.error('❌ 更新設計模組失敗:', error)
      throw new Error(`Failed to update design module: ${error}`)
    }
  }

  /**
   * 刪除設計模組
   */
  async deleteModule(id: string, permanent: boolean = false): Promise<boolean> {
    try {
      const module = this.modules.get(id)
      if (!module) {
        console.warn('⚠️ 設計模組不存在，無法刪除:', id)
        return false
      }

      if (permanent) {
        // 永久刪除
        this.modules.delete(id)
        this.removeFromSearchIndex(id)
        console.log('🗑️ 設計模組永久刪除:', module.name)
      } else {
        // 軟刪除（標記為已刪除）
        module.status = 'deleted'
        module.updated_at = new Date().toISOString()
        this.modules.set(id, module)
        this.updateSearchIndex(module)
        console.log('🗑️ 設計模組標記為已刪除:', module.name)
      }

      this.saveToLocalStorage()
      return true
    } catch (error) {
      console.error('❌ 刪除設計模組失敗:', error)
      throw new Error(`Failed to delete design module: ${error}`)
    }
  }

  /**
   * 搜尋設計模組
   */
  async searchModules(criteria: ModuleSearchCriteria): Promise<DesignModuleData[]> {
    try {
      let results = Array.from(this.modules.values())

      // 應用搜尋條件
      if (criteria.query) {
        results = this.filterByQuery(results, criteria.query)
      }

      if (criteria.status) {
        results = results.filter(module => module.status === criteria.status)
      }

      if (criteria.project) {
        results = results.filter(module => 
          module.project_slugs.includes(criteria.project!) || 
          module.primary_project === criteria.project
        )
      }

      if (criteria.createdFrom) {
        results = results.filter(module => module.created_from === criteria.createdFrom)
      }

      if (criteria.dateRange) {
        results = this.filterByDateRange(results, criteria.dateRange)
      }

      // 排序
      if (criteria.sortBy) {
        results = this.sortResults(results, criteria.sortBy, criteria.sortOrder || 'desc')
      }

      // 分頁
      if (criteria.limit || criteria.offset) {
        const offset = criteria.offset || 0
        const limit = criteria.limit || results.length
        results = results.slice(offset, offset + limit)
      }

      console.log(`🔍 搜尋完成，找到 ${results.length} 個模組`)
      return results
    } catch (error) {
      console.error('❌ 搜尋設計模組失敗:', error)
      throw new Error(`Failed to search design modules: ${error}`)
    }
  }

  /**
   * 獲取所有模組
   */
  async getAllModules(): Promise<DesignModuleData[]> {
    try {
      const modules = Array.from(this.modules.values())
      console.log(`📋 獲取所有模組，共 ${modules.length} 個`)
      return modules
    } catch (error) {
      console.error('❌ 獲取所有模組失敗:', error)
      throw new Error(`Failed to get all modules: ${error}`)
    }
  }

  /**
   * 獲取活躍模組
   */
  async getActiveModules(): Promise<DesignModuleData[]> {
    try {
      const activeModules = Array.from(this.modules.values())
        .filter(module => module.status === 'active')
      
      console.log(`✅ 獲取活躍模組，共 ${activeModules.length} 個`)
      return activeModules
    } catch (error) {
      console.error('❌ 獲取活躍模組失敗:', error)
      throw new Error(`Failed to get active modules: ${error}`)
    }
  }

  /**
   * 創建切版包
   */
  async createSlicePackage(packageData: SlicePackage): Promise<string> {
    try {
      this.slicePackages.set(packageData.id, packageData)
      this.saveToLocalStorage()
      
      console.log('✅ 切版包創建成功:', packageData.name)
      return packageData.id
    } catch (error) {
      console.error('❌ 創建切版包失敗:', error)
      throw new Error(`Failed to create slice package: ${error}`)
    }
  }

  /**
   * 獲取切版包
   */
  async getSlicePackage(id: string): Promise<SlicePackage | null> {
    try {
      const slicePackage = this.slicePackages.get(id)
      if (!slicePackage) {
        console.warn('⚠️ 切版包不存在:', id)
        return null
      }

      return slicePackage
    } catch (error) {
      console.error('❌ 獲取切版包失敗:', error)
      throw new Error(`Failed to get slice package: ${error}`)
    }
  }

  /**
   * 刪除切版包
   */
  async deleteSlicePackage(id: string): Promise<boolean> {
    try {
      const slicePackage = this.slicePackages.get(id)
      if (!slicePackage) {
        console.warn('⚠️ 切版包不存在，無法刪除:', id)
        return false
      }

      this.slicePackages.delete(id)
      this.saveToLocalStorage()
      
      console.log('🗑️ 切版包刪除成功:', slicePackage.name)
      return true
    } catch (error) {
      console.error('❌ 刪除切版包失敗:', error)
      throw new Error(`Failed to delete slice package: ${error}`)
    }
  }

  /**
   * 獲取模組統計
   */
  async getModuleStats(): Promise<{
    total: number
    active: number
    archived: number
    deleted: number
    byProject: Record<string, number>
    byStatus: Record<string, number>
  }> {
    try {
      const modules = Array.from(this.modules.values())
      
      const stats = {
        total: modules.length,
        active: modules.filter(m => m.status === 'active').length,
        archived: modules.filter(m => m.status === 'archived').length,
        deleted: modules.filter(m => m.status === 'deleted').length,
        byProject: {} as Record<string, number>,
        byStatus: {} as Record<string, number>
      }

      // 按專案統計
      modules.forEach(module => {
        module.project_slugs.forEach(project => {
          stats.byProject[project] = (stats.byProject[project] || 0) + 1
        })
      })

      // 按狀態統計
      modules.forEach(module => {
        stats.byStatus[module.status] = (stats.byStatus[module.status] || 0) + 1
      })

      console.log('📊 模組統計獲取成功')
      return stats
    } catch (error) {
      console.error('❌ 獲取模組統計失敗:', error)
      throw new Error(`Failed to get module stats: ${error}`)
    }
  }

  /**
   * 備份模組數據
   */
  async backupModules(): Promise<string> {
    try {
      const backupData = {
        modules: Array.from(this.modules.values()),
        slicePackages: Array.from(this.slicePackages.values()),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }

      const backupJson = JSON.stringify(backupData, null, 2)
      console.log('💾 模組數據備份成功')
      return backupJson
    } catch (error) {
      console.error('❌ 備份模組數據失敗:', error)
      throw new Error(`Failed to backup modules: ${error}`)
    }
  }

  /**
   * 恢復模組數據
   */
  async restoreModules(backupJson: string): Promise<boolean> {
    try {
      const backupData = JSON.parse(backupJson)
      
      if (!backupData.modules || !backupData.slicePackages) {
        throw new Error('無效的備份數據格式')
      }

      // 清空現有數據
      this.modules.clear()
      this.slicePackages.clear()

      // 恢復模組數據
      backupData.modules.forEach((module: DesignModuleData) => {
        this.modules.set(module.id, module)
      })

      // 恢復切版包數據
      backupData.slicePackages.forEach((slicePackage: SlicePackage) => {
        this.slicePackages.set(slicePackage.id, slicePackage)
      })

      // 重建搜尋索引
      this.buildSearchIndex()
      
      // 保存到本地存儲
      this.saveToLocalStorage()

      console.log('🔄 模組數據恢復成功')
      return true
    } catch (error) {
      console.error('❌ 恢復模組數據失敗:', error)
      throw new Error(`Failed to restore modules: ${error}`)
    }
  }

  /**
   * 根據查詢過濾模組
   */
  private filterByQuery(modules: DesignModuleData[], query: string): DesignModuleData[] {
    const queryLower = query.toLowerCase()
    
    return modules.filter(module => {
      // 搜尋名稱
      if (module.name.toLowerCase().includes(queryLower)) return true
      
      // 搜尋描述
      if (module.description.toLowerCase().includes(queryLower)) return true
      
      // 搜尋專案標籤
      if (module.project_slugs.some(tag => tag.toLowerCase().includes(queryLower))) return true
      
      // 搜尋創建來源
      if (module.created_from.toLowerCase().includes(queryLower)) return true
      
      return false
    })
  }

  /**
   * 根據日期範圍過濾模組
   */
  private filterByDateRange(modules: DesignModuleData[], dateRange: { start: string; end: string }): DesignModuleData[] {
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    
    return modules.filter(module => {
      const createdDate = new Date(module.created_at)
      return createdDate >= startDate && createdDate <= endDate
    })
  }

  /**
   * 排序結果
   */
  private sortResults(modules: DesignModuleData[], sortBy: string, sortOrder: 'asc' | 'desc'): DesignModuleData[] {
    const sorted = [...modules].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'updated_at':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
        case 'asset_count':
          comparison = a.asset_count - b.asset_count
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return sorted
  }

  /**
   * 更新搜尋索引
   */
  private updateSearchIndex(module: DesignModuleData): void {
    const searchTerms = [
      module.name,
      module.description,
      ...module.project_slugs,
      module.created_from,
      module.status
    ].map(term => term.toLowerCase())
    
    this.searchIndex.set(module.id, searchTerms)
  }

  /**
   * 從搜尋索引移除
   */
  private removeFromSearchIndex(moduleId: string): void {
    this.searchIndex.delete(moduleId)
  }

  /**
   * 構建搜尋索引
   */
  private buildSearchIndex(): void {
    this.searchIndex.clear()
    this.modules.forEach(module => {
      this.updateSearchIndex(module)
    })
  }

  /**
   * 從本地存儲載入
   */
  private loadFromLocalStorage(): void {
    try {
      // 載入模組數據
      const modulesJson = localStorage.getItem('erslice-design-modules')
      if (modulesJson) {
        const modulesData = JSON.parse(modulesJson)
        modulesData.forEach((module: DesignModuleData) => {
          this.modules.set(module.id, module)
        })
      }

      // 載入切版包數據
      const packagesJson = localStorage.getItem('erslice-slice-packages')
      if (packagesJson) {
        const packagesData = JSON.parse(packagesJson)
        packagesData.forEach((slicePackage: SlicePackage) => {
          this.slicePackages.set(slicePackage.id, slicePackage)
        })
      }

      console.log('📱 從本地存儲載入數據成功')
    } catch (error) {
      console.warn('⚠️ 從本地存儲載入數據失敗:', error)
    }
  }

  /**
   * 保存到本地存儲
   */
  private saveToLocalStorage(): void {
    try {
      // 保存模組數據
      const modulesData = Array.from(this.modules.values())
      localStorage.setItem('erslice-design-modules', JSON.stringify(modulesData))

      // 保存切版包數據
      const packagesData = Array.from(this.slicePackages.values())
      localStorage.setItem('erslice-slice-packages', JSON.stringify(packagesData))

      console.log('💾 數據保存到本地存儲成功')
    } catch (error) {
      console.error('❌ 保存到本地存儲失敗:', error)
    }
  }
}

// 創建單例實例
export const designModuleManager = new DesignModuleManager()
