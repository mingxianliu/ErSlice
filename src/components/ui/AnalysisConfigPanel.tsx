import React, { useState } from 'react'
import { 
  Cog6ToothIcon, 
  CpuChipIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
  SwatchIcon,
  DocumentTextIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

export interface AnalysisConfig {
  // 設備分析配置
  devices: {
    enabled: boolean
    priority: 'mobile-first' | 'desktop-first' | 'adaptive'
    breakpoints: {
      mobile: number
      tablet: number
      desktop: number
    }
  }
  
  // 模組分析配置
  modules: {
    enabled: boolean
    minComplexity: number
    maxComplexity: number
    autoGrouping: boolean
    namingConvention: 'auto' | 'manual' | 'hybrid'
  }
  
  // 頁面分析配置
  pages: {
    enabled: boolean
    autoHierarchy: boolean
    maxDepth: number
    stateDetection: boolean
  }
  
  // 狀態分析配置
  states: {
    enabled: boolean
    autoDetection: boolean
    commonStates: string[]
    customStates: string[]
  }
  
  // 設計系統分析配置
  designSystem: {
    enabled: boolean
    colorAnalysis: boolean
    typographyAnalysis: boolean
    spacingAnalysis: boolean
    componentPatterns: boolean
  }
  
  // 智能建議配置
  recommendations: {
    enabled: boolean
    maxCount: number
    priority: 'high' | 'medium' | 'low'
    categories: string[]
  }
  
  // 性能配置
  performance: {
    maxFileSize: number // MB
    maxProcessingTime: number // seconds
    enableCaching: boolean
    parallelProcessing: boolean
  }
}

interface AnalysisConfigPanelProps {
  config: AnalysisConfig
  onConfigChange: (config: AnalysisConfig) => void
  onReset: () => void
  onSaveTemplate: (name: string) => void
  onLoadTemplate: (templateId: string) => void
  availableTemplates: Array<{ id: string; name: string; description: string }>
}

const AnalysisConfigPanel: React.FC<AnalysisConfigPanelProps> = ({
  config,
  onConfigChange,
  onReset,
  onSaveTemplate,
  onLoadTemplate,
  availableTemplates
}) => {
  const [activeTab, setActiveTab] = useState<'devices' | 'modules' | 'pages' | 'states' | 'design' | 'recommendations' | 'performance'>('devices')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [templateName, setTemplateName] = useState('')

  const updateConfig = (path: string, value: any) => {
    const newConfig = { ...config }
    const keys = path.split('.')
    let current: any = newConfig
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    onConfigChange(newConfig)
  }

  const renderDevicesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.devices.enabled}
            onChange={(e) => updateConfig('devices.enabled', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">啟用設備分析</span>
        </label>
      </div>

      {config.devices.enabled && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              響應式策略
            </label>
            <select
              value={config.devices.priority}
              onChange={(e) => updateConfig('devices.priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mobile-first">Mobile First</option>
              <option value="desktop-first">Desktop First</option>
              <option value="adaptive">Adaptive</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手機斷點 (px)
              </label>
              <input
                type="number"
                value={config.devices.breakpoints.mobile}
                onChange={(e) => updateConfig('devices.breakpoints.mobile', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                平板斷點 (px)
              </label>
              <input
                type="number"
                value={config.devices.breakpoints.tablet}
                onChange={(e) => updateConfig('devices.breakpoints.tablet', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                桌面斷點 (px)
              </label>
              <input
                type="number"
                value={config.devices.breakpoints.desktop}
                onChange={(e) => updateConfig('devices.breakpoints.desktop', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderModulesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.modules.enabled}
            onChange={(e) => updateConfig('modules.enabled', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">啟用模組分析</span>
        </label>
      </div>

      {config.modules.enabled && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最小複雜度
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.modules.minComplexity}
                onChange={(e) => updateConfig('modules.minComplexity', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大複雜度
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.modules.maxComplexity}
                onChange={(e) => updateConfig('modules.maxComplexity', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.modules.autoGrouping}
                onChange={(e) => updateConfig('modules.autoGrouping', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">自動分組</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              命名規範
            </label>
            <select
              value={config.modules.namingConvention}
              onChange={(e) => updateConfig('modules.namingConvention', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="auto">自動檢測</option>
              <option value="manual">手動設定</option>
              <option value="hybrid">混合模式</option>
            </select>
          </div>
        </>
      )}
    </div>
  )

  const renderPagesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.pages.enabled}
            onChange={(e) => updateConfig('pages.enabled', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">啟用頁面分析</span>
        </label>
      </div>

      {config.pages.enabled && (
        <>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.pages.autoHierarchy}
                onChange={(e) => updateConfig('pages.autoHierarchy', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">自動層級結構</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大深度
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={config.pages.maxDepth}
              onChange={(e) => updateConfig('pages.maxDepth', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.pages.stateDetection}
                onChange={(e) => updateConfig('pages.stateDetection', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">狀態檢測</span>
            </label>
          </div>
        </>
      )}
    </div>
  )

  const renderStatesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.states.enabled}
            onChange={(e) => updateConfig('states.enabled', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">啟用狀態分析</span>
        </label>
      </div>

      {config.states.enabled && (
        <>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.states.autoDetection}
                onChange={(e) => updateConfig('states.autoDetection', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">自動狀態檢測</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              常見狀態
            </label>
            <div className="space-y-2">
              {['default', 'hover', 'active', 'disabled', 'loading', 'error', 'success'].map((state) => (
                <label key={state} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.states.commonStates.includes(state)}
                    onChange={(e) => {
                      const newStates = e.target.checked
                        ? [...config.states.commonStates, state]
                        : config.states.commonStates.filter(s => s !== state)
                      updateConfig('states.commonStates', newStates)
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{state}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自定義狀態
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="輸入新狀態名稱"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const newState = e.currentTarget.value.trim()
                    if (!config.states.customStates.includes(newState)) {
                      updateConfig('states.customStates', [...config.states.customStates, newState])
                      e.currentTarget.value = ''
                    }
                  }
                }}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {config.states.customStates.map((state, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {state}
                  <button
                    onClick={() => updateConfig('states.customStates', config.states.customStates.filter((_, i) => i !== index))}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderDesignSystemTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.designSystem.enabled}
            onChange={(e) => updateConfig('designSystem.enabled', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">啟用設計系統分析</span>
        </label>
      </div>

      {config.designSystem.enabled && (
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.designSystem.colorAnalysis}
              onChange={(e) => updateConfig('designSystem.colorAnalysis', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">顏色系統分析</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.designSystem.typographyAnalysis}
              onChange={(e) => updateConfig('designSystem.typographyAnalysis', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">字體系統分析</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.designSystem.spacingAnalysis}
              onChange={(e) => updateConfig('designSystem.spacingAnalysis', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">間距系統分析</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.designSystem.componentPatterns}
              onChange={(e) => updateConfig('designSystem.componentPatterns', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">組件模式分析</span>
          </label>
        </div>
      )}
    </div>
  )

  const renderRecommendationsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.recommendations.enabled}
            onChange={(e) => updateConfig('recommendations.enabled', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">啟用智能建議</span>
        </label>
      </div>

      {config.recommendations.enabled && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最大建議數量
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.recommendations.maxCount}
              onChange={(e) => updateConfig('recommendations.maxCount', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              建議優先級
            </label>
            <select
              value={config.recommendations.priority}
              onChange={(e) => updateConfig('recommendations.priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="high">高優先級</option>
              <option value="medium">中優先級</option>
              <option value="low">低優先級</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              建議類別
            </label>
            <div className="space-y-2">
              {['performance', 'accessibility', 'design', 'development', 'testing'].map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.recommendations.categories.includes(category)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...config.recommendations.categories, category]
                        : config.recommendations.categories.filter(c => c !== category)
                      updateConfig('recommendations.categories', newCategories)
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderPerformanceTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          最大檔案大小 (MB)
        </label>
        <input
          type="number"
          min="1"
          max="1000"
          value={config.performance.maxFileSize}
          onChange={(e) => updateConfig('performance.maxFileSize', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          最大處理時間 (秒)
        </label>
        <input
          type="number"
          min="10"
          max="300"
          value={config.performance.maxProcessingTime}
          onChange={(e) => updateConfig('performance.maxProcessingTime', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.performance.enableCaching}
            onChange={(e) => updateConfig('performance.enableCaching', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">啟用快取</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.performance.parallelProcessing}
            onChange={(e) => updateConfig('performance.parallelProcessing', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">並行處理</span>
        </label>
      </div>
    </div>
  )

  const tabs = [
    { id: 'devices', name: '設備分析', icon: DevicePhoneMobileIcon },
    { id: 'modules', name: '模組分析', icon: CpuChipIcon },
    { id: 'pages', name: '頁面分析', icon: DocumentTextIcon },
    { id: 'states', name: '狀態分析', icon: SwatchIcon },
    { id: 'design', name: '設計系統', icon: SwatchIcon },
    { id: 'recommendations', name: '智能建議', icon: BoltIcon },
    { id: 'performance', name: '性能設定', icon: Cog6ToothIcon }
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* 標題欄 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">分析配置</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onReset}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            重置
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            保存模板
          </button>
        </div>
      </div>

      {/* 模板選擇 */}
      {availableTemplates.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            載入模板
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                onLoadTemplate(e.target.value)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">選擇模板...</option>
            {availableTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 標籤切換 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-4">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* 內容區域 */}
      <div className="p-6">
        {activeTab === 'devices' && renderDevicesTab()}
        {activeTab === 'modules' && renderModulesTab()}
        {activeTab === 'pages' && renderPagesTab()}
        {activeTab === 'states' && renderStatesTab()}
        {activeTab === 'design' && renderDesignSystemTab()}
        {activeTab === 'recommendations' && renderRecommendationsTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
      </div>

      {/* 保存模板對話框 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">保存配置模板</h3>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="輸入模板名稱"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (templateName.trim()) {
                    onSaveTemplate(templateName.trim())
                    setShowSaveDialog(false)
                    setTemplateName('')
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalysisConfigPanel
