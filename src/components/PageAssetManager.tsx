import React, { useState, useEffect } from 'react'
import { CloudArrowUpIcon, ArrowPathIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { uploadDesignAsset, listAssets, deleteDesignAsset, AssetList } from '../utils/tauriCommands'
import { useToast } from './ui/Toast'
import { convertFileSrc } from '@tauri-apps/api/core'
import { useDesignModulesStore } from '../stores/designModules'

interface PageAssetManagerProps {
  moduleName: string
  pageSlug: string
  pagePath: string
}

type AssetType = 'screenshots' | 'html' | 'css' | 'responsive-screenshots' | 'responsive-html' | 'responsive-css'

/**
 * 頁面資產管理組件 - 支持每個頁面獨立的資產管理
 * 包含基礎版本和響應式版本的資產上傳
 */
const PageAssetManager: React.FC<PageAssetManagerProps> = ({ moduleName, pageSlug, pagePath }) => {
  const [assets, setAssets] = useState<AssetList>({ screenshots: [], html: [], css: [] })
  const [responsiveAssets, setResponsiveAssets] = useState<AssetList>({ screenshots: [], html: [], css: [] })
  const [assetType, setAssetType] = useState<AssetType>('screenshots')
  const [uploading, setUploading] = useState(false)
  const [screenshotView, setScreenshotView] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'desktop' | 'responsive'>('desktop')
  const store = useDesignModulesStore()
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    if (store.tauriAvailable) {
      refreshAssets()
    }
  }, [moduleName, pageSlug, store.tauriAvailable])

  const refreshAssets = async () => {
    if (!store.tauriAvailable) return
    try {
      // 獲取基礎版本資產
      const pageAssetPath = `${moduleName}/pages/${pageSlug}`
      const baseAssets = await listAssets(pageAssetPath)
      setAssets(baseAssets)
      
      // 獲取響應式版本資產
      const responsiveAssetPath = `${moduleName}/pages/${pageSlug}/responsive`
      try {
        const respAssets = await listAssets(responsiveAssetPath)
        setResponsiveAssets(respAssets)
      } catch (e) {
        // 響應式資料夾可能不存在，這是正常的
        setResponsiveAssets({ screenshots: [], html: [], css: [] })
      }
    } catch (e) {
      console.error('刷新資產失敗:', e)
    }
  }

  const handleUpload = async () => {
    if (!store.tauriAvailable || uploading) return
    
    setUploading(true)
    try {
      const { open } = await import('@tauri-apps/plugin-dialog')
      
      // 根據資產類型確定文件篩選器
      let filters = []
      const baseType = assetType.replace('responsive-', '') as 'screenshots' | 'html' | 'css'
      
      if (baseType === 'screenshots') {
        filters = [{ name: '圖片', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }]
      } else if (baseType === 'html') {
        filters = [{ name: 'HTML 文件', extensions: ['html', 'htm'] }]
      } else if (baseType === 'css') {
        filters = [{ name: 'CSS 文件', extensions: ['css', 'scss', 'sass', 'less'] }]
      }

      const selected = await open({
        multiple: true,
        filters,
        title: `選擇${baseType === 'screenshots' ? '截圖' : baseType.toUpperCase()}文件`
      })

      if (!selected || (Array.isArray(selected) && selected.length === 0)) return

      const files = Array.isArray(selected) ? selected : [selected]
      
      // 確定上傳路徑
      let uploadPath: string
      if (assetType.startsWith('responsive-')) {
        uploadPath = `${moduleName}/pages/${pageSlug}/responsive`
      } else {
        uploadPath = `${moduleName}/pages/${pageSlug}`
      }
      
      let successCount = 0
      for (const filePath of files) {
        try {
          await uploadDesignAsset(uploadPath, baseType, filePath)
          successCount++
        } catch (e) {
          console.error(`上傳文件 ${filePath} 失敗:`, e)
        }
      }

      if (successCount > 0) {
        showSuccess(`成功上傳 ${successCount} 個文件`)
        await refreshAssets()
      } else {
        showError('上傳失敗', '沒有文件成功上傳')
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '上傳失敗'
      showError('上傳文件失敗', message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (type: 'screenshots' | 'html' | 'css', fileName: string, isResponsive: boolean) => {
    if (!store.tauriAvailable) return

    try {
      const deletePath = isResponsive 
        ? `${moduleName}/pages/${pageSlug}/responsive`
        : `${moduleName}/pages/${pageSlug}`
      
      await deleteDesignAsset(deletePath, type, fileName)
      showSuccess('已刪除文件')
      await refreshAssets()
    } catch (e) {
      const message = e instanceof Error ? e.message : '刪除失敗'
      showError('刪除文件失敗', message)
    }
  }

  const getAssetUrl = (type: string, fileName: string, isResponsive: boolean) => {
    const basePath = isResponsive 
      ? `design-assets/${moduleName}/pages/${pageSlug}/responsive`
      : `design-assets/${moduleName}/pages/${pageSlug}`
    return convertFileSrc(`${basePath}/${type}/${fileName}`)
  }

  const renderAssetList = (type: 'screenshots' | 'html' | 'css', assetList: string[], isResponsive: boolean) => {
    if (assetList.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
          <p>尚未上傳 {type === 'screenshots' ? '截圖' : type.toUpperCase()} 文件</p>
          <p className="text-sm">點擊上方按鈕上傳文件</p>
        </div>
      )
    }

    if (type === 'screenshots' && screenshotView === 'grid') {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assetList.map((file) => (
            <div key={file} className="relative group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
              <img
                src={getAssetUrl(type, file, isResponsive)}
                alt={file}
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(getAssetUrl(type, file, isResponsive), '_blank')}
                    className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="檢視"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(type, file, isResponsive)}
                    className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600"
                    title="刪除"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={file}>{file}</p>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {assetList.map((file) => (
          <div key={file} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {type === 'screenshots' && (
                <img
                  src={getAssetUrl(type, file, isResponsive)}
                  alt={file}
                  className="w-12 h-12 object-cover rounded"
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{type === 'screenshots' ? '截圖' : type.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => window.open(getAssetUrl(type, file, isResponsive), '_blank')}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                title="檢視"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(type, file, isResponsive)}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                title="刪除"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const currentAssets = activeTab === 'responsive' ? responsiveAssets : assets
  const isResponsive = activeTab === 'responsive'

  return (
    <div className="space-y-6">
      {/* 頁面資產標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            頁面資產管理
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            頁面: <span className="font-mono font-medium">{pageSlug}</span> ({pagePath})
          </p>
        </div>
      </div>

      {/* 版本切換標籤 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="版本切換">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'desktop'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            📱 桌面版本
          </button>
          <button
            onClick={() => setActiveTab('responsive')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'responsive'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            📱 響應式版本
          </button>
        </nav>
      </div>

      {/* 上傳區域 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white">
            上傳 {activeTab === 'responsive' ? '響應式' : '桌面'} 版本資產
          </h3>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="atype" 
                checked={assetType === (isResponsive ? 'responsive-screenshots' : 'screenshots')} 
                onChange={() => setAssetType(isResponsive ? 'responsive-screenshots' : 'screenshots')} 
              /> 
              📸 截圖
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="atype" 
                checked={assetType === (isResponsive ? 'responsive-html' : 'html')} 
                onChange={() => setAssetType(isResponsive ? 'responsive-html' : 'html')} 
              /> 
              📄 HTML
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="atype" 
                checked={assetType === (isResponsive ? 'responsive-css' : 'css')} 
                onChange={() => setAssetType(isResponsive ? 'responsive-css' : 'css')} 
              /> 
              🎨 CSS
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="btn-secondary flex items-center gap-2" 
              onClick={handleUpload} 
              disabled={uploading || !store.tauriAvailable}
            >
              <CloudArrowUpIcon className="h-5 w-5" /> 
              {uploading ? '上傳中...' : '選擇文件並上傳'}
            </button>
            <button 
              className="btn-secondary flex items-center gap-2" 
              onClick={refreshAssets} 
              disabled={!store.tauriAvailable}
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {activeTab === 'responsive' 
            ? '上傳響應式版本的設計資產（手機版、平板版等）'
            : '上傳桌面版本的設計資產'
          }
        </p>
      </div>

      {/* 資產清單 */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {activeTab === 'responsive' ? '響應式' : '桌面'} 版本資產
          </h3>
          {/* 截圖檢視切換 */}
          <div className="flex items-center gap-1 text-xs">
            <button
              className={`px-2 py-1 rounded ${screenshotView === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-transparent'}`}
              onClick={() => setScreenshotView('grid')}
            >
              網格
            </button>
            <button
              className={`px-2 py-1 rounded ${screenshotView === 'list' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-transparent'}`}
              onClick={() => setScreenshotView('list')}
            >
              列表
            </button>
          </div>
        </div>

        {(['screenshots', 'html', 'css'] as const).map((type) => (
          <div key={type}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {type === 'screenshots' ? '📸 截圖' : type === 'html' ? '📄 HTML' : '🎨 CSS'} 
                {type === 'screenshots' ? '' : ' 文件'}
                <span className="ml-2 text-xs text-gray-500">({currentAssets[type].length})</span>
              </h4>
            </div>
            {renderAssetList(type, currentAssets[type], isResponsive)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PageAssetManager