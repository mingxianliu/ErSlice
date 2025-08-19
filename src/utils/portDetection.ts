/**
 * 開發服務器端口檢測工具
 * 支持動態端口分配環境下的前端配置
 */

// 默認端口配置
const DEFAULT_PORT = 28888
const DEFAULT_HOST = '127.0.0.1'

/**
 * 獲取當前開發服務器端口
 * 優先級：環境變量 > 動態檢測 > 默認端口
 */
export function getDevServerPort(): number {
  // 1. 檢查環境變量
  if (typeof process !== 'undefined' && process.env.PORT) {
    const envPort = parseInt(process.env.PORT)
    if (!isNaN(envPort)) {
      return envPort
    }
  }
  
  // 2. 檢查當前頁面 URL (瀏覽器環境)
  if (typeof window !== 'undefined' && window.location) {
    const currentPort = parseInt(window.location.port)
    if (!isNaN(currentPort) && currentPort > 0) {
      return currentPort
    }
  }
  
  // 3. 嘗試導入動態配置文件
  try {
    // 動態導入配置文件 (如果存在)
    // 這個文件由 dev-server.js 自動生成
    const config = require('../config/dev-server.js')
    if (config && config.DEV_SERVER_CONFIG && config.DEV_SERVER_CONFIG.port) {
      return config.DEV_SERVER_CONFIG.port
    }
  } catch (error) {
    // 配置文件不存在或導入失敗，使用默認值
  }
  
  // 4. 返回默認端口
  return DEFAULT_PORT
}

/**
 * 獲取開發服務器基礎 URL
 */
export function getDevServerBaseUrl(): string {
  const port = getDevServerPort()
  return `http://${DEFAULT_HOST}:${port}`
}

/**
 * 獲取開發服務器配置信息
 */
export function getDevServerConfig() {
  const port = getDevServerPort()
  const baseUrl = getDevServerBaseUrl()
  
  return {
    port,
    host: DEFAULT_HOST,
    baseUrl,
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
  }
}

/**
 * 檢查端口是否可用（僅在 Node.js 環境中可用）
 */
export async function checkPortAvailable(port: number): Promise<boolean> {
  // 這個函數主要用於服務器端口檢測
  // 在瀏覽器環境中直接返回 true
  if (typeof window !== 'undefined') {
    return true
  }
  
  try {
    const net = await import('net')
    
    return new Promise((resolve) => {
      const server = net.createServer()
      
      server.listen(port, DEFAULT_HOST, () => {
        server.close(() => {
          resolve(true)
        })
      })
      
      server.on('error', () => {
        resolve(false)
      })
    })
  } catch (error) {
    // 無法導入 net 模塊（非 Node.js 環境）
    return true
  }
}

/**
 * 尋找可用端口（從指定端口開始）
 */
export async function findAvailablePort(startPort: number = DEFAULT_PORT, maxTries: number = 10): Promise<number> {
  if (typeof window !== 'undefined') {
    // 瀏覽器環境，直接返回起始端口
    return startPort
  }
  
  for (let i = 0; i < maxTries; i++) {
    const port = startPort + i
    const available = await checkPortAvailable(port)
    
    if (available) {
      return port
    }
  }
  
  throw new Error(`無法在 ${startPort}-${startPort + maxTries - 1} 範圍內找到可用端口`)
}

/**
 * 端口配置管理器
 */
export class PortConfigManager {
  private static instance: PortConfigManager
  private currentConfig: ReturnType<typeof getDevServerConfig> | null = null
  
  private constructor() {}
  
  static getInstance(): PortConfigManager {
    if (!PortConfigManager.instance) {
      PortConfigManager.instance = new PortConfigManager()
    }
    return PortConfigManager.instance
  }
  
  /**
   * 獲取當前配置
   */
  getConfig() {
    if (!this.currentConfig) {
      this.currentConfig = getDevServerConfig()
    }
    return this.currentConfig
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ReturnType<typeof getDevServerConfig>>) {
    this.currentConfig = {
      ...this.getConfig(),
      ...newConfig
    }
  }
  
  /**
   * 重置配置
   */
  resetConfig() {
    this.currentConfig = null
  }
}

// 導出單例實例
export const portConfigManager = PortConfigManager.getInstance()

/**
 * React Hook 用於獲取端口配置
 */
export function usePortConfig() {
  const config = portConfigManager.getConfig()
  
  return {
    ...config,
    refresh: () => portConfigManager.resetConfig()
  }
}