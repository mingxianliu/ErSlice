import React, { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/Toast'
import { 
  CloudArrowUpIcon, 
  PhotoIcon,
  FolderIcon,
  CheckCircleIcon,
  CpuChipIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  DevicePhoneMobileIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { 
  FigmaAnalysisController, 
  ComprehensiveAnalysisResult 
} from '@/services/figmaAnalysisController'

// Figma 資產介面
interface FigmaAsset {
  id: string
  name: string
  device: 'desktop' | 'tablet' | 'mobile'
  module: string
  page: string
  state?: string
  imageUrl: string
  scale: '1x' | '2x' | '3x'
  dimensions: { width: number; height: number }
  file?: File
}

interface FigmaImportResult {
  projectName: string
  assets: FigmaAsset[]
  modules: string[]
  pages: Record<string, string[]>
  analysisResult?: ComprehensiveAnalysisResult
}

interface Props {
  onImportComplete: (result: FigmaImportResult) => void
  onCancel: () => void
}

const FigmaImporter: React.FC<Props> = ({ onImportComplete, onCancel }) => {
  const { showSuccess, showError, showInfo } = useToast()
  const [importMethod, setImportMethod] = useState<'files' | 'zip' | 'api'>('files')
  const [dragActive, setDragActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [previewAssets, setPreviewAssets] = useState<FigmaAsset[]>([])
  const [projectName, setProjectName] = useState('')
  const [analysisResult, setAnalysisResult] = useState<ComprehensiveAnalysisResult>()
  const [enableAdvancedAnalysis, setEnableAdvancedAnalysis] = useState(true)
  
  // 初始化分析控制器
  const analysisController = new FigmaAnalysisController()

  // 解析 Figma Frame 命名規則
  const parseFrameName = (name: string) => {
    // 支援多種命名格式：
    // Desktop_UserMgmt_List_Default
    // Desktop - User Management - List
    // 1440_UserManagement_List_Active
    
    // 清理名稱並分割
    const cleanName = name
      .replace(/[-\s]+/g, '_')
      .replace(/[()]/g, '')
      .replace(/\d+x\d+/g, '') // 移除解析度
    
    const parts = cleanName.split('_').filter(p => p)
    
    // 嘗試識別設備類型
    const deviceKeywords = {
      desktop: ['desktop', 'web', '1440', '1920', '1366'],
      tablet: ['tablet', 'ipad', '768', '1024'],
      mobile: ['mobile', 'phone', 'iphone', '375', '414']
    }
    
    let device: 'desktop' | 'tablet' | 'mobile' = 'desktop'
    let remainingParts = [...parts]
    
    // 檢查第一個部分是否為設備類型
    const firstPart = parts[0]?.toLowerCase()
    for (const [deviceType, keywords] of Object.entries(deviceKeywords)) {
      if (keywords.some(keyword => firstPart?.includes(keyword))) {
        device = deviceType as 'desktop' | 'tablet' | 'mobile'
        remainingParts = parts.slice(1)
        break
      }
    }
    
    // 解析模組和頁面
    const module = remainingParts[0] || 'Unknown'
    const page = remainingParts[1] || 'Main'
    const state = remainingParts[2] || 'Default'
    
    return { device, module, page, state }
  }

  // 解析檔案名稱
  const parseFileName = (fileName: string) => {
    const withoutExt = fileName.replace(/\.(png|jpg|jpeg|svg)$/i, '')
    const [namePart, scalePart] = withoutExt.split('@')
    const scale = (scalePart || '1x') as '1x' | '2x' | '3x'
    
    const parsed = parseFrameName(namePart)
    return { ...parsed, scale }
  }

  // 獲取圖片尺寸
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
        URL.revokeObjectURL(url)
      }
      img.src = url
    })
  }

  // 處理檔案上傳
  const handleFiles = async (files: FileList | File[]) => {
    setProcessing(true)
    
    try {
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/') || file.name.endsWith('.json') || file.name.endsWith('.css') || file.name.endsWith('.html')
      )
      
      if (imageFiles.length === 0) {
        showError('沒有找到支援的檔案', '請上傳圖片、JSON、CSS 或 HTML 檔案')
        return
      }
      
      showInfo(`正在處理 ${imageFiles.length} 個檔案...`)
      
      const assets: FigmaAsset[] = []
      
      // 處理圖片檔案
      for (const file of imageFiles.filter(f => f.type.startsWith('image/'))) {
        const parsed = parseFileName(file.name)
        const dimensions = await getImageDimensions(file)
        const imageUrl = URL.createObjectURL(file)
        
        assets.push({
          id: `${parsed.device}_${parsed.module}_${parsed.page}_${parsed.state}`,
          name: `${parsed.module} - ${parsed.page}`,
          device: parsed.device,
          module: parsed.module,
          page: parsed.page,
          state: parsed.state,
          imageUrl,
          scale: parsed.scale,
          dimensions,
          file
        })
      }
      
      // 按模組分組預覽
      setPreviewAssets(assets)
      
      // 自動生成專案名稱
      if (!projectName) {
        const modules = [...new Set(assets.map(a => a.module))]
        setProjectName(`Figma Import - ${modules.join(', ')}`)
      }
      
      // 執行高級分析（如果啟用）
      if (enableAdvancedAnalysis && imageFiles.length > 0) {
        await performAdvancedAnalysis(imageFiles)
      }
      
      showSuccess(`成功解析 ${assets.length} 個資產`)
      
    } catch (error) {
      showError('檔案處理失敗', error instanceof Error ? error.message : '未知錯誤')
    } finally {
      setProcessing(false)
    }
  }
  
  // 執行高級分析
  const performAdvancedAnalysis = async (files: File[]) => {
    try {
      setAnalyzing(true)
      showInfo('正在執行四維智能分析...')
      
      const result = await analysisController.analyzeComplete(files)
      setAnalysisResult(result)
      
      showSuccess(`分析完成！檢測到 ${result.overview.mainModules.length} 個模組，${result.overview.primaryDevices.length} 種設備`)
      
    } catch (error) {
      console.warn('高級分析失敗:', error)
      showError('高級分析失敗', '基礎匯入功能仍然可用')
    } finally {
      setAnalyzing(false)
    }
  }

  // 處理拖放
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  // 處理檔案選擇
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  // 完成匯入
  const handleImportComplete = () => {
    if (previewAssets.length === 0) {
      showError('沒有可匯入的資產')
      return
    }
    
    const modules = [...new Set(previewAssets.map(a => a.module))]
    const pages: Record<string, string[]> = {}
    
    modules.forEach(module => {
      pages[module] = [...new Set(
        previewAssets
          .filter(a => a.module === module)
          .map(a => a.page)
      )]
    })
    
    onImportComplete({
      projectName: projectName || 'Figma Import',
      assets: previewAssets,
      modules,
      pages,
      analysisResult
    })
  }

  // 獲取設備圖示
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <ComputerDesktopIcon className="h-4 w-4" />
      case 'tablet': return <DeviceTabletIcon className="h-4 w-4" />
      case 'mobile': return <DevicePhoneMobileIcon className="h-4 w-4" />
      default: return <ComputerDesktopIcon className="h-4 w-4" />
    }
  }

  // 按模組分組的資產
  const assetsByModule = previewAssets.reduce((groups, asset) => {
    const key = asset.module
    if (!groups[key]) groups[key] = []
    groups[key].push(asset)
    return groups
  }, {} as Record<string, FigmaAsset[]>)

  return (
    <div className="space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Figma 資產匯入器
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          從 Figma 匯入設計稿，自動解析為 ErSlice 專案資產
        </p>
      </div>

      {/* 匯入方式選擇 */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setImportMethod('files')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            importMethod === 'files'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          <PhotoIcon className="h-5 w-5 inline mr-2" />
          檔案上傳
        </button>
        <button
          onClick={() => setImportMethod('zip')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            importMethod === 'zip'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          <FolderIcon className="h-5 w-5 inline mr-2" />
          ZIP 檔案
        </button>
        <button
          onClick={() => setImportMethod('api')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            importMethod === 'api'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}
          disabled
        >
          <CloudArrowUpIcon className="h-5 w-5 inline mr-2" />
          Figma API (即將推出)
        </button>
      </div>

      {/* 高級分析設定 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CpuChipIcon className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="font-medium text-purple-900 dark:text-purple-200">
                四維智能分析
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                啟用 Device/Module/Page/State 智能解析系統
              </p>
            </div>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enableAdvancedAnalysis}
              onChange={(e) => setEnableAdvancedAnalysis(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
          </label>
        </div>
        
        {enableAdvancedAnalysis && (
          <div className="mt-3 text-sm text-purple-600 dark:text-purple-400">
            將自動執行：視覺分析、設計令牌提取、響應式檢測、無障礙分析
          </div>
        )}
      </div>

      {/* 檔案上傳區域 */}
      {importMethod === 'files' && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                點擊上傳檔案
              </span>{' '}
              或拖放檔案到此處
            </p>
            <p className="text-xs text-gray-500">
              支援 PNG、JPG、SVG 格式
            </p>
          </label>
        </div>
      )}

      {/* 命名規則說明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
          📋 檔案命名規則
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <p><strong>建議格式：</strong> Device_Module_Page_State@Scale.png</p>
          <p><strong>範例：</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Desktop_UserMgmt_List_Default@2x.png</li>
            <li>Mobile_Dashboard_Main@1x.png</li>
            <li>Tablet_Orders_Detail_Loading.png</li>
          </ul>
          <p className="text-xs mt-2">
            系統會自動解析檔案名稱並分類到對應的模組和頁面
          </p>
        </div>
      </div>

      {/* 專案名稱設定 */}
      {previewAssets.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            專案名稱
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="輸入專案名稱"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
      )}

      {/* 智能分析結果 */}
      {analysisResult && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg space-y-4">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-200">
              四維智能分析結果
            </h3>
            <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
              信心度: {Math.round(analysisResult.confidence.overall * 100)}%
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {analysisResult.overview.totalAssets}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">總資產數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {analysisResult.overview.mainModules.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">檢測模組</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {analysisResult.overview.primaryDevices.length}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">支援設備</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {analysisResult.overview.designComplexity}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">複雜度</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">預估開發時間</h4>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {analysisResult.overview.estimatedDevelopmentTime}
            </p>
          </div>
          
          {analysisResult.recommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">智能建議</h4>
              <div className="space-y-2">
                {analysisResult.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className={`inline-block w-2 h-2 rounded-full mt-2 ${
                      rec.impact === 'high' ? 'bg-red-500' :
                      rec.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {rec.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 資產預覽 */}
      {previewAssets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            資產預覽 ({previewAssets.length} 個檔案)
          </h3>
          
          {Object.entries(assetsByModule).map(([module, assets]) => (
            <div key={module} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {module} ({assets.length} 個檔案)
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {assets.map((asset) => (
                  <div key={asset.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <img
                      src={asset.imageUrl}
                      alt={asset.name}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                    <div className="text-xs space-y-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getDeviceIcon(asset.device)} {asset.page}
                      </div>
                      <div className="text-gray-500">
                        {asset.state} ({asset.scale})
                      </div>
                      <div className="text-gray-400">
                        {asset.dimensions.width}×{asset.dimensions.height}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 處理中狀態 */}
      {(processing || analyzing) && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {analyzing ? '正在執行智能分析...' : '正在處理檔案...'}
          </p>
          {analyzing && (
            <div className="mt-4 max-w-md mx-auto">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Device/Module/Page/State 四維解析</span>
                <BoltIcon className="h-4 w-4" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 操作按鈕 */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="group relative px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-500 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 text-gray-600 dark:text-gray-200 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-500 dark:hover:to-gray-600 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
          disabled={processing || analyzing}
        >
          取消
        </button>
        {previewAssets.length > 0 && (
          <button
            onClick={handleImportComplete}
            className="group relative px-4 py-2 text-sm font-medium rounded-lg border border-blue-400 dark:border-blue-500 bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-md"
            disabled={processing || analyzing || !projectName.trim()}
          >
            <CheckCircleIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
            匯入 {previewAssets.length} 個資產
            {analysisResult && (
              <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                +智能分析
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default FigmaImporter