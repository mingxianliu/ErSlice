#!/usr/bin/env node

import { spawn } from 'child_process'
import { writeFileSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

/**
 * 動態端口分配開發服務器
 * 自動尋找可用端口，更新 Tauri 配置，啟動開發環境
 */

let viteProcess = null
let tauriProcess = null
let currentPort = null

// 清理函數
function cleanup() {
  console.log('\n🧹 清理進程...')
  if (viteProcess) {
    viteProcess.kill('SIGTERM')
    viteProcess = null
  }
  if (tauriProcess) {
    tauriProcess.kill('SIGTERM')
    tauriProcess = null
  }
  process.exit(0)
}

// 註冊清理事件
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('exit', cleanup)

/**
 * 更新 Tauri 配置文件中的 devUrl
 */
function updateTauriConfig(port) {
  const configPath = path.join(projectRoot, 'src-tauri', 'tauri.conf.json')
  
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    const newDevUrl = `http://127.0.0.1:${port}`
    
    if (config.build && config.build.devUrl !== newDevUrl) {
      config.build.devUrl = newDevUrl
      writeFileSync(configPath, JSON.stringify(config, null, 2))
      console.log(`✅ 已更新 Tauri 配置: devUrl = ${newDevUrl}`)
    }
    
    return true
  } catch (error) {
    console.error('❌ 更新 Tauri 配置失敗:', error.message)
    return false
  }
}

/**
 * 啟動 Vite 開發服務器
 */
function startViteServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 啟動 Vite 開發服務器...')
    
    const viteArgs = ['--host', '127.0.0.1']
    
    // 如果指定了 PORT 環境變數，使用該端口
    if (process.env.PORT) {
      viteArgs.push('--port', process.env.PORT)
    }
    
    viteProcess = spawn('npx', ['vite', ...viteArgs], {
      cwd: projectRoot,
      stdio: ['inherit', 'pipe', 'pipe']
    })
    
    let output = ''
    
    viteProcess.stdout.on('data', (data) => {
      const text = data.toString()
      output += text
      process.stdout.write(text)
      
      // 偵測端口信息
      const portMatch = text.match(/Local:\s+http:\/\/127\.0\.0\.1:(\d+)/)
      if (portMatch && !currentPort) {
        currentPort = parseInt(portMatch[1])
        console.log(`\n✅ Vite 服務器已啟動，端口: ${currentPort}`)
        resolve(currentPort)
      }
    })
    
    viteProcess.stderr.on('data', (data) => {
      const text = data.toString()
      process.stderr.write(text)
      
      // 檢查端口衝突錯誤
      if (text.includes('EADDRINUSE') || text.includes('Port') && text.includes('already in use')) {
        console.log('⚠️  端口被佔用，Vite 將嘗試下一個可用端口...')
      }
    })
    
    viteProcess.on('error', (error) => {
      console.error('❌ Vite 進程錯誤:', error.message)
      reject(error)
    })
    
    viteProcess.on('close', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`❌ Vite 進程退出，代碼: ${code}`)
        reject(new Error(`Vite process exited with code ${code}`))
      }
    })
    
    // 超時檢查
    setTimeout(() => {
      if (!currentPort) {
        reject(new Error('等待 Vite 服務器啟動超時'))
      }
    }, 30000)
  })
}

/**
 * 啟動 Tauri 開發環境
 */
function startTauriDev() {
  return new Promise((resolve) => {
    console.log('🦀 啟動 Tauri 開發環境...')
    
    tauriProcess = spawn('npx', ['tauri', 'dev', '--no-dev-server'], {
      cwd: projectRoot,
      stdio: 'inherit'
    })
    
    tauriProcess.on('error', (error) => {
      console.error('❌ Tauri 進程錯誤:', error.message)
    })
    
    tauriProcess.on('close', (code) => {
      console.log(`\n🦀 Tauri 進程退出，代碼: ${code}`)
      cleanup()
    })
    
    // Tauri 啟動不需要等待特定輸出，直接 resolve
    setTimeout(resolve, 1000)
  })
}

/**
 * 創建端口配置 API 端點
 */
function createPortConfigEndpoint(port) {
  const configContent = `// 自動生成的端口配置
export const DEV_SERVER_CONFIG = {
  port: ${port},
  baseUrl: 'http://127.0.0.1:${port}',
  timestamp: '${new Date().toISOString()}'
}

// 兼容性函數
export function getDevServerPort() {
  return ${port}
}

export function getDevServerBaseUrl() {
  return 'http://127.0.0.1:${port}'
}
`
  
  const configPath = path.join(projectRoot, 'src', 'config', 'dev-server.js')
  
  try {
    writeFileSync(configPath, configContent)
    console.log(`✅ 已創建端口配置文件: src/config/dev-server.js`)
  } catch (error) {
    console.log(`ℹ️  無法創建配置文件 (${error.message})，但這不影響正常運行`)
  }
}

/**
 * 主函數
 */
async function main() {
  console.log('🎯 ErSlice 動態端口開發服務器啟動中...\n')
  
  try {
    // 1. 啟動 Vite 服務器並獲取端口
    const port = await startViteServer()
    
    // 2. 更新 Tauri 配置
    updateTauriConfig(port)
    
    // 3. 創建端口配置文件
    createPortConfigEndpoint(port)
    
    // 4. 等待一段時間確保 Vite 完全啟動
    console.log('⏳ 等待 Vite 服務器完全啟動...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 5. 啟動 Tauri
    await startTauriDev()
    
    console.log(`\n🎉 開發環境已啟動`)
    console.log(`前端服務器: http://127.0.0.1:${port}`)
    console.log(`🦀 Tauri 應用已連接`)
    console.log(`\n按 Ctrl+C 停止開發服務器`)
    
  } catch (error) {
    console.error('\n❌ 啟動失敗:', error.message)
    cleanup()
    process.exit(1)
  }
}

// 執行主函數
main().catch(console.error)