// ErSlice Tauri 命令調用工具

import { invoke } from '@tauri-apps/api/core'
import { handleTauriError, getUserFriendlyMessage } from './errorHandler'

// 設計模組介面
export interface DesignModule {
  id: string
  name: string
  description: string
  asset_count: number
  last_updated: string
  status: string
}

// 創建設計模組
export async function createDesignModule(
  name: string,
  description: string
): Promise<DesignModule> {
  try {
    const result = await invoke<DesignModule>('create_design_module', {
      name,
      description
    })
    return result
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 獲取設計模組列表
export async function getDesignModules(): Promise<DesignModule[]> {
  try {
    const result = await invoke<DesignModule[]>('get_design_modules')
    return result
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 上傳設計資產
export async function uploadDesignAsset(
  moduleName: string,
  assetType: 'screenshots' | 'html' | 'css',
  filePath: string
): Promise<string> {
  try {
    const result = await invoke<string>('upload_design_asset', {
      moduleName,
      assetType,
      filePath
    })
    return result
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 生成切版說明包
export async function generateSlicePackage(
  moduleName: string,
  options: {
    includeHtml: boolean
    includeCss: boolean
    includeResponsive: boolean
  }
): Promise<string> {
  try {
    const result = await invoke<string>('generate_slice_package', {
      moduleName,
      includeHtml: options.includeHtml,
      includeCss: options.includeCss,
      includeResponsive: options.includeResponsive
    })
    return result
  } catch (error) {
    const ersliceError = handleTauriError(error)
    throw new Error(getUserFriendlyMessage(ersliceError))
  }
}

// 檢查 Tauri 是否可用
export async function checkTauriAvailable(): Promise<boolean> {
  try {
    // 嘗試調用一個簡單的命令來檢查 Tauri 是否可用
    await invoke('get_design_modules')
    return true
  } catch (error) {
    console.warn('Tauri 不可用:', error)
    return false
  }
}

// 批量操作工具
export class BatchOperationManager {
  private operations: Array<() => Promise<void>> = []
  private results: Array<{ success: boolean; error?: string }> = []

  // 添加操作
  addOperation(operation: () => Promise<void>): void {
    this.operations.push(operation)
  }

  // 執行所有操作
  async executeAll(): Promise<Array<{ success: boolean; error?: string }>> {
    this.results = []
    
    for (const operation of this.operations) {
      try {
        await operation()
        this.results.push({ success: true })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        this.results.push({ success: false, error: errorMessage })
      }
    }
    
    return this.results
  }

  // 獲取成功和失敗的數量
  getSummary(): { total: number; success: number; failed: number } {
    const total = this.results.length
    const success = this.results.filter(r => r.success).length
    const failed = total - success
    
    return { total, success, failed }
  }

  // 清除操作列表
  clear(): void {
    this.operations = []
    this.results = []
  }
}

// 導出批量操作管理器
export const batchOperationManager = new BatchOperationManager()
