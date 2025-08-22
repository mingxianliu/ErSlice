import React, { useState, useEffect } from 'react'
import { 
  Cog6ToothIcon, 
  CpuChipIcon,
  MemoryChipIcon,
  ServerIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { 
  OptimizationConfig, 
  PerformanceMetrics, 
  largeFileProcessor 
} from '@/services/largeFileProcessor'

interface PerformanceOptimizationPanelProps {
  onConfigChange: (config: OptimizationConfig) => void
  onStartMonitoring: () => void
  onStopMonitoring: () => void
}

const PerformanceOptimizationPanel: React.FC<PerformanceOptimizationPanelProps> = ({
  onConfigChange,
  onStartMonitoring,
  onStopMonitoring
}) => {
  const [config, setConfig] = useState<OptimizationConfig>(largeFileProcessor['config'] as any)
  const [performanceReport, setPerformanceReport] = useState<any>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [activeTab, setActiveTab] = useState<'chunking' | 'memory' | 'parallel' | 'caching' | 'monitoring'>('chunking')

  useEffect(() => {
    // 定期更新性能報告
    const interval = setInterval(() => {
      if (isMonitoring) {
        const report = largeFileProcessor.getPerformanceReport()
        setPerformanceReport(report)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const updateConfig = (path: string, value: any) => {
    const newConfig = { ...config }
    const keys = path.split('.')
    let current: any = newConfig
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    setConfig(newConfig)
    onConfigChange(newConfig)
    
    // 更新處理器配置
    largeFileProcessor.updateConfig(newConfig)
  }

  const handleStartMonitoring = () => {
    setIsMonitoring(true)
    onStartMonitoring()
  }

  const handleStopMonitoring = () => {
    setIsMonitoring(false)
    onStopMonitoring()
  }

  const renderChunkingTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          分塊大小 (bytes)
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={config.chunkSize}
            onChange={(e) => updateConfig('chunkSize', parseInt(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="1024"
            max="10485760"
            step="1024"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(config.chunkSize / 1024)} KB
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          建議值：1MB (1048576 bytes) 用於一般檔案，較大檔案可使用 2-5MB
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          最大並發分塊數
        </label>
        <input
          type="number"
          value={config.maxConcurrentChunks}
          onChange={(e) => updateConfig('maxConcurrentChunks', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          min="1"
          max="16"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          建議值：4-8，根據 CPU 核心數和記憶體容量調整
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          重疊大小 (bytes)
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={config.overlapSize}
            onChange={(e) => updateConfig('overlapSize', parseInt(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="0"
            max="10240"
            step="1024"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(config.overlapSize / 1024)} KB
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          用於確保分塊邊界的完整性，通常設置為 1KB
        </p>
      </div>
    </div>
  )

  const renderMemoryTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          最大記憶體使用量 (MB)
        </label>
        <input
          type="number"
          value={config.maxMemoryUsage}
          onChange={(e) => updateConfig('maxMemoryUsage', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          min="64"
          max="4096"
          step="64"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          建議值：512MB-2GB，根據系統可用記憶體調整
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          記憶體清理閾值 (%)
        </label>
        <input
          type="number"
          value={config.memoryCleanupThreshold}
          onChange={(e) => updateConfig('memoryCleanupThreshold', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          min="50"
          max="95"
          step="5"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          當記憶體使用量達到此百分比時觸發清理
        </p>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.enableGarbageCollection}
            onChange={(e) => updateConfig('enableGarbageCollection', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">啟用垃圾回收</span>
        </label>
      </div>
    </div>
  )

  const renderParallelTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Worker 線程數
        </label>
        <input
          type="number"
          value={config.workerThreads}
          onChange={(e) => updateConfig('workerThreads', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          min="1"
          max="16"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          建議值：CPU 核心數，當前系統：{navigator.hardwareConcurrency || '未知'}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.enableWebWorkers}
            onChange={(e) => updateConfig('enableWebWorkers', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">啟用 Web Workers</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          任務隊列大小
        </label>
        <input
          type="number"
          value={config.taskQueueSize}
          onChange={(e) => updateConfig('taskQueueSize', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          min="10"
          max="1000"
          step="10"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          控制同時排隊的任務數量
        </p>
      </div>
    </div>
  )

  const renderCachingTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.enableCaching}
            onChange={(e) => updateConfig('enableCaching', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">啟用快取</span>
        </label>
      </div>

      {config.enableCaching && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              快取大小 (MB)
            </label>
            <input
              type="number"
              value={config.cacheSize}
              onChange={(e) => updateConfig('cacheSize', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="10"
              max="1000"
              step="10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              快取過期時間 (秒)
            </label>
            <input
              type="number"
              value={config.cacheExpiration}
              onChange={(e) => updateConfig('cacheExpiration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="60"
              max="86400"
              step="60"
            />
          </div>
        </>
      )}
    </div>
  )

  const renderMonitoringTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.enablePerformanceMonitoring}
            onChange={(e) => updateConfig('enablePerformanceMonitoring', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">啟用性能監控</span>
        </label>
      </div>

      {config.enablePerformanceMonitoring && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              指標收集間隔 (毫秒)
            </label>
            <input
              type="number"
              value={config.metricsCollectionInterval}
              onChange={(e) => updateConfig('metricsCollectionInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              min="100"
              max="10000"
              step="100"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">性能閾值</h4>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                最大處理時間 (秒)
              </label>
              <input
                type="number"
                value={config.performanceThresholds.maxProcessingTime}
                onChange={(e) => updateConfig('performanceThresholds.maxProcessingTime', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                min="60"
                max="1800"
                step="60"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                最大記憶體使用量 (MB)
              </label>
              <input
                type="number"
                value={config.performanceThresholds.maxMemoryUsage}
                onChange={(e) => updateConfig('performanceThresholds.maxMemoryUsage', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                min="256"
                max="4096"
                step="256"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                最小吞吐量 (bytes/s)
              </label>
              <input
                type="number"
                value={config.performanceThresholds.minThroughput}
                onChange={(e) => updateConfig('performanceThresholds.minThroughput', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                min="1024"
                max="10485760"
                step="1024"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderPerformanceMetrics = () => {
    if (!performanceReport) return null

    const { currentMetrics, recommendations } = performanceReport

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">實時性能指標</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {Math.round(currentMetrics.memoryUsage)} MB
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">記憶體使用</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {Math.round(currentMetrics.throughput / 1024)} KB/s
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">吞吐量</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {Math.round(currentMetrics.chunkEfficiency)}%
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">分塊效率</div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {Math.round(currentMetrics.cpuUsage)}%
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">CPU 使用</div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">優化建議</h5>
            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index}>• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  const tabs = [
    { id: 'chunking', name: '分塊設定', icon: CpuChipIcon },
    { id: 'memory', name: '記憶體管理', icon: MemoryChipIcon },
    { id: 'parallel', name: '並行處理', icon: ServerIcon },
    { id: 'caching', name: '快取設定', icon: ChartBarIcon },
    { id: 'monitoring', name: '性能監控', icon: ChartBarIcon }
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* 標題欄 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">性能優化配置</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleStartMonitoring}
            disabled={isMonitoring}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <PlayIcon className="h-4 w-4" />
            <span>開始監控</span>
          </button>
          
          <button
            onClick={handleStopMonitoring}
            disabled={!isMonitoring}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <StopIcon className="h-4 w-4" />
            <span>停止監控</span>
          </button>
        </div>
      </div>

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 配置選項 */}
          <div>
            {activeTab === 'chunking' && renderChunkingTab()}
            {activeTab === 'memory' && renderMemoryTab()}
            {activeTab === 'parallel' && renderParallelTab()}
            {activeTab === 'caching' && renderCachingTab()}
            {activeTab === 'monitoring' && renderMonitoringTab()}
          </div>

          {/* 性能指標 */}
          <div className="lg:border-l lg:border-gray-200 dark:lg:border-gray-700 lg:pl-6">
            {renderPerformanceMetrics()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceOptimizationPanel
