// ErSlice 數據庫服務
// 提供與 Tauri 後端數據庫通信的函數

import { typedInvoke } from '../utils/tauriCommands'
import {
  DatabaseDesignModule,
  DatabaseTemplate,
  DatabaseAISpec,
  DatabaseStats,
  DatabaseResult
} from '../types/database'

// ==================== 數據庫管理服務 ====================

/**
 * 初始化數據庫
 */
export async function initDatabase(): Promise<DatabaseResult<string>> {
  try {
    const result = await typedInvoke<string>('init_database')
    return {
      success: true,
      data: result,
      message: '數據庫初始化成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '數據庫初始化失敗'
    }
  }
}

/**
 * 獲取數據庫統計信息
 */
export async function getDatabaseStats(): Promise<DatabaseResult<DatabaseStats>> {
  try {
    const result = await typedInvoke<DatabaseStats>('get_database_stats')
    return {
      success: true,
      data: result,
      message: '獲取數據庫統計成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '獲取數據庫統計失敗'
    }
  }
}

/**
 * 備份數據庫
 */
export async function backupDatabase(): Promise<DatabaseResult<string>> {
  try {
    const result = await typedInvoke<string>('backup_database')
    return {
      success: true,
      data: result,
      message: '數據庫備份成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '數據庫備份失敗'
    }
  }
}

/**
 * 恢復數據庫
 */
export async function restoreDatabase(backupPath: string): Promise<DatabaseResult<string>> {
  try {
    const result = await typedInvoke<string>('restore_database', { backupPath })
    return {
      success: true,
      data: result,
      message: '數據庫恢復成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '數據庫恢復失敗'
    }
  }
}

// ==================== 設計模組數據庫服務 ====================

/**
 * 從數據庫獲取設計模組列表
 */
export async function getDesignModulesFromDB(): Promise<DatabaseResult<DatabaseDesignModule[]>> {
  try {
    const result = await typedInvoke<DatabaseDesignModule[]>('get_design_modules_from_db')
    return {
      success: true,
      data: result,
      message: '獲取設計模組成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '獲取設計模組失敗'
    }
  }
}

/**
 * 從數據庫獲取指定狀態的設計模組
 */
export async function getDesignModulesByStatusFromDB(status: string): Promise<DatabaseResult<DatabaseDesignModule[]>> {
  try {
    const result = await typedInvoke<DatabaseDesignModule[]>('get_design_modules_by_status_from_db', { status })
    return {
      success: true,
      data: result,
      message: '獲取設計模組成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '獲取設計模組失敗'
    }
  }
}

/**
 * 創建設計模組到數據庫
 */
export async function createDesignModuleInDB(module: DatabaseDesignModule): Promise<DatabaseResult<string>> {
  try {
    const result = await typedInvoke<string>('create_design_module_in_db', { module })
    return {
      success: true,
      data: result,
      message: '創建設計模組成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '創建設計模組失敗'
    }
  }
}

/**
 * 更新設計模組到數據庫
 */
export async function updateDesignModuleInDB(module: DatabaseDesignModule): Promise<DatabaseResult<string>> {
  try {
    const result = await typedInvoke<string>('update_design_module_in_db', { module })
    return {
      success: true,
      data: result,
      message: '更新設計模組成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '更新設計模組失敗'
    }
  }
}

/**
 * 從數據庫刪除設計模組
 */
export async function deleteDesignModuleFromDB(id: string): Promise<DatabaseResult<string>> {
  try {
    const result = await typedInvoke<string>('delete_design_module_from_db', { id })
    return {
      success: true,
      data: result,
      message: '刪除設計模組成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '刪除設計模組失敗'
    }
  }
}

// ==================== 模板數據庫服務 ====================

/**
 * 從數據庫獲取模板列表
 */
export async function getTemplatesFromDB(): Promise<DatabaseResult<DatabaseTemplate[]>> {
  try {
    const result = await typedInvoke<DatabaseTemplate[]>('get_templates_from_db')
    return {
      success: true,
      data: result,
      message: '獲取模板成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '獲取模板失敗'
    }
  }
}

/**
 * 創建模板到數據庫
 */
export async function createTemplateInDB(template: DatabaseTemplate): Promise<DatabaseResult<string>> {
  try {
    const result = await typedInvoke<string>('create_template_in_db', { template })
    return {
      success: true,
      data: result,
      message: '創建模板成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '創建模板失敗'
    }
  }
}

/**
 * 更新模板到數據庫
 */
export async function updateTemplateInDB(template: DatabaseTemplate): Promise<DatabaseResult<string>> {
  try {
    const result = await typedInvoke<string>('update_template_in_db', { template })
    return {
      success: true,
      data: result,
      message: '更新模板成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '更新模板失敗'
    }
  }
}

/**
 * 從數據庫刪除模板
 */
export async function deleteTemplateFromDB(id: string): Promise<DatabaseResult<string>> {
  try {
    const result = await typedInvoke<string>('delete_template_from_db', { id })
    return {
      success: true,
      data: result,
      message: '刪除模板成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '刪除模板失敗'
    }
  }
}

// ==================== AI 規格數據庫服務 ====================

/**
 * 從數據庫獲取 AI 規格列表
 */
export async function getAISpecsFromDB(): Promise<DatabaseResult<DatabaseAISpec[]>> {
  try {
    const result = await typedInvoke<DatabaseAISpec[]>('get_ai_specs_from_db')
    return {
      success: true,
      data: result,
      message: '獲取 AI 規格成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '獲取 AI 規格失敗'
    }
  }
}

/**
 * 創建 AI 規格到數據庫
 */
export async function createAISpecInDB(spec: DatabaseAISpec): Promise<DatabaseResult<string>> {
  try {
    const result = await typedInvoke<string>('create_ai_spec_in_db', { spec })
    return {
      success: true,
      data: result,
      message: '創建 AI 規格成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '創建 AI 規格失敗'
    }
  }
}

/**
 * 更新 AI 規格到數據庫
 */
export async function updateAISpecInDB(spec: DatabaseAISpec): Promise<DatabaseResult<string>> {
  try {
    const result = await typedInvoke<string>('update_ai_spec_in_db', { spec })
    return {
      success: true,
      data: result,
      message: '更新 AI 規格成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '更新 AI 規格失敗'
    }
  }
}

/**
 * 從數據庫刪除 AI 規格
 */
export async function deleteAISpecFromDB(id: string): Promise<DatabaseResult<string>> {
  try {
    const result = await typedInvoke<string>('delete_ai_spec_from_db', { id })
    return {
      success: true,
      data: result,
      message: '刪除 AI 規格成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '刪除 AI 規格失敗'
    }
  }
}

// ==================== 數據庫同步服務 ====================

/**
 * 同步本地數據到數據庫
 */
export async function syncLocalDataToDatabase(): Promise<DatabaseResult<{
  modules: number
  templates: number
  specs: number
}>> {
  try {
    // 這裡可以實現從 localStorage 或其他本地存儲同步到數據庫的邏輯
    const result = {
      modules: 0,
      templates: 0,
      specs: 0
    }
    
    return {
      success: true,
      data: result,
      message: '數據同步成功'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '數據同步失敗'
    }
  }
}

/**
 * 檢查數據庫連接狀態
 */
export async function checkDatabaseConnection(): Promise<DatabaseResult<{
  connected: boolean
  database_path: string
}>> {
  try {
    const stats = await getDatabaseStats()
    if (stats.success && stats.data) {
      return {
        success: true,
        data: {
          connected: true,
          database_path: stats.data.database_path
        },
        message: '數據庫連接正常'
      }
    } else {
      return {
        success: false,
        data: {
          connected: false,
          database_path: ''
        },
        message: '數據庫連接失敗'
      }
    }
  } catch (error) {
    return {
      success: false,
      data: {
        connected: false,
        database_path: ''
      },
      error: error instanceof Error ? error.message : '未知錯誤',
      message: '檢查數據庫連接失敗'
    }
  }
}
