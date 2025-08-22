import React, { useState } from 'react'
import { 
  EyeIcon, 
  DocumentTextIcon, 
  FolderIcon, 
  CodeBracketIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { DesignModuleTemplate, SlicePackage } from '@/services/figmaImportWorkflow'

interface ResultPreviewProps {
  module: DesignModuleTemplate
  slicePackage: SlicePackage
  onClose: () => void
}

const ResultPreview: React.FC<ResultPreviewProps> = ({ module, slicePackage, onClose }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['module', 'package']))
  const [activeTab, setActiveTab] = useState<'module' | 'package'>('module')

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const renderModulePreview = () => (
    <div className="space-y-4">
      {/* 模組基本信息 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">模組信息</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700 dark:text-blue-300">名稱：</span>
            <span className="text-blue-900 dark:text-blue-100">{module.name}</span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">複雜度：</span>
            <span className="text-blue-900 dark:text-blue-100">{module.complexity}</span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">預估時間：</span>
            <span className="text-blue-900 dark:text-blue-100">{module.estimatedTime}</span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">資產數量：</span>
            <span className="text-blue-900 dark:text-blue-100">{module.assets.length}</span>
          </div>
        </div>
      </div>

      {/* 模組描述 */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">描述</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">{module.description}</p>
      </div>

      {/* 資料夾結構 */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">資料夾結構</h4>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {renderFolderTree(module.structure)}
        </div>
      </div>
    </div>
  )

  const renderPackagePreview = () => (
    <div className="space-y-4">
      {/* 切版包基本信息 */}
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">切版包信息</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-green-700 dark:text-green-300">名稱：</span>
            <span className="text-green-900 dark:text-green-100">{slicePackage.name}</span>
          </div>
          <div>
            <span className="text-green-700 dark:text-green-300">創建時間：</span>
            <span className="text-green-900 dark:text-green-100">
              {new Date(slicePackage.createdAt).toLocaleString('zh-TW')}
            </span>
          </div>
          <div>
            <span className="text-green-700 dark:text-green-300">檔案數量：</span>
            <span className="text-green-900 dark:text-green-100">{slicePackage.files.length}</span>
          </div>
        </div>
      </div>

      {/* 檔案列表 */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">生成檔案</h4>
        <div className="space-y-2">
          {slicePackage.files.map((file, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              {file.type === 'folder' ? (
                <FolderIcon className="h-4 w-4 text-blue-500" />
              ) : (
                <DocumentTextIcon className="h-4 w-4 text-green-500" />
              )}
              <span className="text-gray-700 dark:text-gray-300">{file.path}</span>
              {file.metadata?.description && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({file.metadata.description})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 文檔預覽 */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">文檔</h4>
        <div className="space-y-3">
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">README</h5>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
              {slicePackage.documentation.readme}
            </p>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">組件規格</h5>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
              {slicePackage.documentation.componentSpecs}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderFolderTree = (node: any, level: number = 0): React.ReactNode => {
    const indent = '  '.repeat(level)
    const icon = node.children.length > 0 ? <FolderIcon className="h-3 w-3 inline text-blue-500" /> : <DocumentTextIcon className="h-3 w-3 inline text-green-500" />
    
    return (
      <div key={node.path} className="ml-4">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">{indent}</span>
          {icon}
          <span className="text-gray-700 dark:text-gray-300">{node.name}</span>
          {node.metadata?.description && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({node.metadata.description})
            </span>
          )}
        </div>
        {node.children.map((child: any) => renderFolderTree(child, level + 1))}
        {node.assets.map((asset: string, index: number) => (
          <div key={index} className="ml-8 flex items-center space-x-1">
            <span className="text-xs text-gray-500">{indent}  </span>
            <CodeBracketIcon className="h-3 w-3 text-purple-500" />
            <span className="text-gray-700 dark:text-gray-300">{asset}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            結果預覽
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* 標籤切換 */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('module')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'module'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              設計模組
            </button>
            <button
              onClick={() => setActiveTab('package')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'package'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              切版包
            </button>
          </div>

          {/* 內容顯示 */}
          {activeTab === 'module' ? renderModulePreview() : renderPackagePreview()}
        </div>

        {/* 底部按鈕 */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            關閉
          </button>
          <button
            onClick={() => {
              // TODO: 實現下載功能
              console.log('下載切版包')
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            下載切版包
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultPreview
