/**
 * Sketch 生成器頁面
 * 提供 UI 介面來測試和配置 Sketch 檔案生成功能
 */

import React, { useState } from 'react'
import { 
  DocumentTextIcon, 
  CogIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import SketchGenerator, { 
  GeneratorConfig, 
  Theme, 
  LayoutConfig,
  DesignModule 
} from '@/services/sketchGenerator/SketchGenerator'

const SketchGeneratorPage: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast()
  const [generator, setGenerator] = useState<SketchGenerator | null>(null)
  const [config, setConfig] = useState<GeneratorConfig>({
    theme: 'default',
    layout: { type: 'grid', columns: 12, gutter: 16 },
    exportOptions: { format: 'sketch' }
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationResult, setGenerationResult] = useState<any>(null)
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false)

  /**
   * 初始化生成器
   */
  const initializeGenerator = () => {
    try {
      const newGenerator = new SketchGenerator(config)
      setGenerator(newGenerator)
      showSuccess('Sketch 生成器初始化成功！')
    } catch (error) {
      showError('初始化失敗', error instanceof Error ? error.message : '未知錯誤')
    }
  }

  /**
   * 更新配置
   */
  const updateConfig = (updates: Partial<GeneratorConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  /**
   * 更新佈局配置
   */
  const updateLayout = (updates: Partial<LayoutConfig>) => {
    setConfig(prev => ({
      ...prev,
      layout: { ...prev.layout, ...updates }
    }))
  }

  /**
   * 建立測試設計模組
   */
  const createTestModule = (): DesignModule => {
    return {
      id: `test-module-${Date.now()}`,
      name: '測試設計模組',
      description: '這是一個用於測試 Sketch 生成功能的設計模組',
      components: [
        {
          id: 'button-001',
          name: '主要按鈕',
          type: 'button',
          props: {
            text: '點擊我',
            size: 'md',
            variant: 'primary'
          },
          styles: {
            colors: {
              backgroundColor: '#007AFF',
              textColor: '#FFFFFF'
            },
            spacing: {
              padding: { top: 12, right: 24, bottom: 12, left: 24 }
            }
          },
          layout: {
            x: 100,
            y: 100,
            width: 120,
            height: 48
          }
        },
        {
          id: 'input-001',
          name: '搜尋輸入框',
          type: 'input',
          props: {
            placeholder: '輸入搜尋關鍵字...',
            size: 'lg'
          },
          styles: {
            colors: {
              backgroundColor: '#FFFFFF',
              borderColor: '#E0E0E0',
              textColor: '#333333'
            },
            spacing: {
              padding: { top: 16, right: 20, bottom: 16, left: 20 }
            }
          },
          layout: {
            x: 100,
            y: 200,
            width: 300,
            height: 56
          }
        },
        {
          id: 'card-001',
          name: '資訊卡片',
          type: 'card',
          props: {
            title: '標題',
            content: '這是一個資訊卡片的內容'
          },
          styles: {
            colors: {
              backgroundColor: '#F8F9FA',
              textColor: '#212529'
            },
            spacing: {
              padding: { top: 24, right: 24, bottom: 24, left: 24 }
            }
          },
          layout: {
            x: 100,
            y: 300,
            width: 300,
            height: 120
          }
        }
      ],
      styles: {
        colors: {
          primary: '#007AFF',
          secondary: '#5856D6',
          success: '#34C759',
          warning: '#FF9500',
          danger: '#FF3B30',
          neutral: ['#FFFFFF', '#F2F2F7', '#8E8E93', '#3A3A3C', '#000000']
        },
        typography: {
          fontFamily: 'SF Pro Text',
          fontSizes: [12, 14, 16, 18, 20, 24, 28, 32, 36, 48],
          fontWeights: ['regular', 'medium', 'semibold', 'bold'],
          lineHeights: [16, 20, 24, 28, 32, 36, 40, 44, 48, 64]
        },
        spacing: {
          base: 4,
          scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128]
        },
        shadows: {
          small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
          large: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
        }
      },
      layout: config.layout
    }
  }

  /**
   * 生成 Sketch 檔案
   */
  const generateSketch = async () => {
    if (!generator) {
      showError('請先初始化生成器')
      return
    }

    setIsGenerating(true)
    try {
      showInfo('正在生成 Sketch 檔案...')
      
      const testModule = createTestModule()
      const result = await generator.generateFromModule(testModule)
      
      setGenerationResult(result)
      showSuccess('Sketch 檔案生成成功！')
      
    } catch (error) {
      showError('生成失敗', error instanceof Error ? error.message : '未知錯誤')
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * 匯出 Sketch 檔案
   */
  const exportSketch = async () => {
    if (!generator || !generationResult) {
      showError('請先生成 Sketch 檔案')
      return
    }

    try {
      showInfo('正在匯出 Sketch 檔案...')
      
      // 嘗試匯出為 Buffer
      const buffer = await generator.exportToBuffer()
      console.log('生成的 Buffer 大小:', buffer.length, 'bytes')
      
      // 建立下載連結
      const blob = new Blob([buffer], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `erslice-sketch-${Date.now()}.sketch`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showSuccess('Sketch 檔案下載成功！')
      
    } catch (error) {
      showError('匯出失敗', error instanceof Error ? error.message : '未知錯誤')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ErSlice Sketch 生成器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            將 ErSlice 設計模組轉換為標準的 .sketch 檔案，支援 Figma 直接匯入
          </p>
        </div>

        {/* 配置區域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <CogIcon className="h-5 w-5 inline mr-2" />
              生成器配置
            </h2>
            <Button
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
              variant="secondary"
              size="sm"
            >
              {showAdvancedConfig ? '隱藏' : '顯示'} 進階配置
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 基本配置 */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">基本配置</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    佈局類型
                  </label>
                  <select
                    value={config.layout?.type || 'grid'}
                    onChange={(e) => updateLayout({ type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    aria-label="佈局類型"
                    title="選擇佈局類型"
                  >
                    <option value="grid">網格佈局</option>
                    <option value="flexbox">Flexbox 佈局</option>
                    <option value="absolute">絕對定位</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    列數
                  </label>
                  <input
                    type="number"
                    value={config.layout?.columns || 12}
                    onChange={(e) => updateLayout({ columns: parseInt(e.target.value) })}
                    min="1"
                    max="24"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    aria-label="列數"
                    title="設置網格列數"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    間距
                  </label>
                  <input
                    type="number"
                    value={config.layout?.gutter || 16}
                    onChange={(e) => updateLayout({ gutter: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    aria-label="間距"
                    title="設置組件間距"
                  />
                </div>
              </div>
            </div>

            {/* 進階配置 */}
            {showAdvancedConfig && (
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">進階配置</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      響應式支援
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.responsive?.enabled || false}
                        onChange={(e) => updateConfig({
                          responsive: {
                            enabled: e.target.checked,
                            breakpoints: [
                              { name: 'mobile', width: 375, height: 667 },
                              { name: 'tablet', width: 768, height: 1024 },
                              { name: 'desktop', width: 1440, height: 900 }
                            ]
                          }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        啟用多設備支援
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      命名規範
                    </label>
                    <select
                      value={config.naming?.components || 'PascalCase'}
                      onChange={(e) => updateConfig({
                        naming: {
                          files: 'kebab-case',
                          components: e.target.value as any,
                          layers: 'kebab-case'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      aria-label="命名規範"
                      title="選擇組件命名規範"
                    >
                      <option value="PascalCase">PascalCase</option>
                      <option value="camelCase">camelCase</option>
                      <option value="kebab-case">kebab-case</option>
                      <option value="snake_case">snake_case</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button
              onClick={initializeGenerator}
              variant="primary"
              size="md"
              disabled={isGenerating}
            >
              <CogIcon className="h-5 w-5 mr-2" />
              初始化生成器
            </Button>
          </div>
        </div>

        {/* 操作區域 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            <PlayIcon className="h-5 w-5 inline mr-2" />
            生成操作
          </h2>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={generateSketch}
                variant="primary"
                size="lg"
                disabled={!generator || isGenerating}
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                {isGenerating ? '生成中...' : '生成 Sketch 檔案'}
              </Button>

              {generationResult && (
                <Button
                  onClick={exportSketch}
                  variant="success"
                  size="lg"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  下載 Sketch 檔案
                </Button>
              )}
            </div>

            {!generator && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 dark:text-yellow-200">
                    請先初始化生成器，然後點擊「生成 Sketch 檔案」按鈕
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 生成結果 */}
        {generationResult && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              <EyeIcon className="h-5 w-5 inline mr-2" />
              生成結果
            </h2>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Sketch 檔案生成成功！
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">檔案資訊</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>頁面數量: {generationResult.pages?.length || 0}</p>
                  <p>畫板數量: {generationResult.pages?.[0]?.artboards?.length || 0}</p>
                  <p>組件數量: {generationResult.pages?.[0]?.artboards?.[0]?.layers?.length || 0}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">配置摘要</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>佈局類型: {config.layout?.type}</p>
                  <p>列數: {config.layout?.columns}</p>
                  <p>間距: {config.layout?.gutter}px</p>
                  <p>響應式: {config.responsive?.enabled ? '啟用' : '停用'}</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button
                onClick={exportSketch}
                variant="success"
                size="md"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                下載 Sketch 檔案
              </Button>
            </div>
          </div>
        )}

        {/* 功能說明 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            功能特色
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                標準格式
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                生成標準的 .sketch 檔案，完全相容 Figma 匯入
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <CogIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                靈活配置
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                支援多種佈局類型和響應式配置
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                即時下載
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                生成完成後可直接下載使用
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SketchGeneratorPage
