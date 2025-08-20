import React, { useState } from 'react'
import { 
  ArrowUpTrayIcon, 
  SwatchIcon, 
  CubeIcon, 
  PhotoIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface FigmaExportOptionsProps {
  onExport: (options: {
    includeAssets: boolean
    includeTokens: boolean
    includeComponents: boolean
    exportFormat: 'figma-json' | 'design-tokens' | 'component-kit'
  }) => void
  onCancel: () => void
  loading: boolean
  moduleCount: number
}

const FigmaExportOptions: React.FC<FigmaExportOptionsProps> = ({
  onExport,
  onCancel,
  loading,
  moduleCount
}) => {
  const [includeAssets, setIncludeAssets] = useState(true)
  const [includeTokens, setIncludeTokens] = useState(true)
  const [includeComponents, setIncludeComponents] = useState(true)
  const [exportFormat, setExportFormat] = useState<'figma-json' | 'design-tokens' | 'component-kit'>('figma-json')

  const handleExport = () => {
    onExport({
      includeAssets,
      includeTokens,
      includeComponents,
      exportFormat
    })
  }

  const formatOptions = [
    {
      id: 'figma-json' as const,
      name: 'Figma JSON',
      description: '標準 Figma API 格式，包含完整設計資訊',
      icon: CubeIcon
    },
    {
      id: 'design-tokens' as const,
      name: '設計令牌',
      description: 'Design Tokens 格式，適用於設計系統',
      icon: SwatchIcon
    },
    {
      id: 'component-kit' as const,
      name: '組件套件',
      description: '組件庫格式，適用於 UI 框架匯入',
      icon: PhotoIcon
    }
  ]

  return (
    <div className="space-y-6">
      {/* 導出格式選擇 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          導出格式
        </label>
        <div className="space-y-2">
          {formatOptions.map((format) => (
            <label key={format.id} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="format"
                value={format.id}
                checked={exportFormat === format.id}
                onChange={(e) => setExportFormat(e.target.value as any)}
                disabled={loading}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <format.icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {format.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {format.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 包含內容選項 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          包含內容
        </label>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAssets}
              onChange={(e) => setIncludeAssets(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <div className="flex items-center gap-2">
              <PhotoIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-900 dark:text-white">設計資產</span>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                圖片、切圖、向量圖
              </span>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeTokens}
              onChange={(e) => setIncludeTokens(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <div className="flex items-center gap-2">
              <SwatchIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-900 dark:text-white">設計令牌</span>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                顏色、字體、間距
              </span>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeComponents}
              onChange={(e) => setIncludeComponents(e.target.checked)}
              disabled={loading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <div className="flex items-center gap-2">
              <CubeIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-900 dark:text-white">組件結構</span>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                組件定義、屬性
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 統計資訊 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-sm">
          <CheckIcon className="h-4 w-4" />
          <span className="font-medium">將導出 {moduleCount} 個活躍模組</span>
        </div>
        <p className="text-blue-700 dark:text-blue-300 text-xs mt-1 space-y-1">
          <span className="block">🔄 <strong>轉換源</strong>：ErSlice 設計模組與資產</span>
          <span className="block">🎨 <strong>輸出為</strong>：Figma 可直接匯入的設計檔案</span>
          <span className="block">🛠️ <strong>用途</strong>：在 Figma 中繼續設計或協作</span>
        </p>
      </div>

      {/* 操作按鈕 */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 btn-secondary disabled:opacity-50"
        >
          取消
        </button>
        <button
          onClick={handleExport}
          disabled={loading || (!includeAssets && !includeTokens && !includeComponents)}
          className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              導出中...
            </>
          ) : (
            <>
              <ArrowUpTrayIcon className="h-4 w-4" />
              開始導出
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default FigmaExportOptions