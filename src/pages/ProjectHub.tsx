import React, { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'
import { useProjectStore } from '@/stores/project'
import { useDesignModulesStore } from '@/stores/designModules'
import FigmaImporter from '@/components/FigmaImporter'
import { 
  RocketLaunchIcon, 
  FolderIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BuildingLibraryIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

// 專案配置介面
interface ProjectConfiguration {
  name: string
  description: string
  selectedAssets: string[]       // 選中的設計資產模組
  selectedTemplates: string[]    // 選中的模板
  selectedAISpecs: string[]      // 選中的AI規格
  outputConfig: {
    includeHtml: boolean
    includeCss: boolean
    includeResponsive: boolean
    includeAISpecs: boolean
    makeZip: boolean
  }
}

// 資源卡片介面
interface ResourceCard {
  id: string
  name: string
  description: string
  type: 'asset' | 'template' | 'aispec'
  status: 'available' | 'selected' | 'disabled'
  previewImage?: string
}

const ProjectHub: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast()
  const projectStore = useProjectStore()
  const designModulesStore = useDesignModulesStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [showFigmaImporter, setShowFigmaImporter] = useState(false)
  const [projectConfig, setProjectConfig] = useState<ProjectConfiguration>({
    name: '',
    description: '',
    selectedAssets: [],
    selectedTemplates: [],
    selectedAISpecs: [],
    outputConfig: {
      includeHtml: true,
      includeCss: true,
      includeResponsive: true,
      includeAISpecs: true,
      makeZip: true
    }
  })

  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    projectStore.init()
    designModulesStore.init()
  }, [])

  // 步驟配置
  const steps = [
    { id: 1, name: '專案設定', description: '配置專案基本資訊' },
    { id: 2, name: '選擇資源', description: '選擇設計資產、模板和規格' },
    { id: 3, name: '輸出配置', description: '配置生成選項' },
    { id: 4, name: '生成切版包', description: '生成最終的前端切版包' }
  ]

  // 模擬的資源數據
  const mockTemplates: ResourceCard[] = [
    { id: 'table-basic', name: '基礎表格', description: '響應式數據表格模板', type: 'template', status: 'available' },
    { id: 'form-advanced', name: '進階表單', description: '多步驟表單模板', type: 'template', status: 'available' },
    { id: 'dashboard-layout', name: '儀表板佈局', description: '管理後台佈局模板', type: 'template', status: 'available' }
  ]

  const mockAISpecs: ResourceCard[] = [
    { id: 'crud-spec', name: 'CRUD 操作規格', description: '標準增刪改查操作說明', type: 'aispec', status: 'available' },
    { id: 'responsive-spec', name: '響應式設計規格', description: '多螢幕適配設計規範', type: 'aispec', status: 'available' },
    { id: 'component-spec', name: '組件開發規格', description: 'React 組件開發指南', type: 'aispec', status: 'available' }
  ]

  // 處理資源選擇
  const toggleResourceSelection = (resourceId: string, type: 'asset' | 'template' | 'aispec') => {
    setProjectConfig(prev => {
      const key = type === 'asset' ? 'selectedAssets' : 
                   type === 'template' ? 'selectedTemplates' : 'selectedAISpecs'
      
      const currentSelected = prev[key]
      const isSelected = currentSelected.includes(resourceId)
      
      return {
        ...prev,
        [key]: isSelected 
          ? currentSelected.filter(id => id !== resourceId)
          : [...currentSelected, resourceId]
      }
    })
  }

  // 處理 Figma 匯入結果
  const handleFigmaImport = (result: any) => {
    // 更新專案配置
    setProjectConfig(prev => ({
      ...prev,
      name: result.projectName,
      description: `從 Figma 匯入的專案，包含 ${result.modules.length} 個模組`,
      selectedAssets: result.modules // 將 Figma 模組對應到設計資產
    }))
    
    // 關閉匯入器，跳到下一步
    setShowFigmaImporter(false)
    setCurrentStep(2)
    
    showSuccess(
      'Figma 資產匯入成功！', 
      `已匯入 ${result.assets.length} 個設計稿，涵蓋 ${result.modules.length} 個模組`
    )
  }

  // 生成專案切版包
  const generateProject = async () => {
    if (!projectConfig.name.trim()) {
      showError('請輸入專案名稱')
      return
    }

    setGenerating(true)
    try {
      // 模擬生成過程
      showInfo('開始生成專案切版包...')
      
      // 這裡將會調用實際的生成邏輯
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const summary = {
        assets: projectConfig.selectedAssets.length,
        templates: projectConfig.selectedTemplates.length,
        aiSpecs: projectConfig.selectedAISpecs.length,
        outputPath: `output/projects/${projectConfig.name}-${Date.now()}`
      }
      
      showSuccess(
        '專案切版包生成完成！', 
        `包含 ${summary.assets} 個設計資產、${summary.templates} 個模板、${summary.aiSpecs} 個AI規格`
      )
      
      // 重置配置
      setProjectConfig({
        name: '',
        description: '',
        selectedAssets: [],
        selectedTemplates: [],
        selectedAISpecs: [],
        outputConfig: {
          includeHtml: true,
          includeCss: true,
          includeResponsive: true,
          includeAISpecs: true,
          makeZip: true
        }
      })
      setCurrentStep(1)
      
    } catch (error) {
      showError('生成失敗', error instanceof Error ? error.message : '未知錯誤')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6 min-h-full bg-gray-50 dark:bg-gray-900">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <RocketLaunchIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              專案中心
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              建立專案，選擇設計資源，生成完整的前端切版包
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link to="/library" className="btn-secondary">
            <BuildingLibraryIcon className="h-5 w-5 mr-2" />
            設計資源庫
          </Link>
          <Link to="/settings" className="btn-secondary">
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            專案設定
          </Link>
        </div>
      </div>

      {/* 步驟指示器 */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center space-x-3 ${
                index < steps.length - 1 ? 'flex-1' : ''
              }`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRightIcon className="h-5 w-5 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 步驟內容 */}
      <div className="card p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              專案基本資訊
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  專案名稱 *
                </label>
                <input
                  type="text"
                  value={projectConfig.name}
                  onChange={(e) => setProjectConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如：電商網站前端"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  專案描述
                </label>
                <textarea
                  value={projectConfig.description}
                  onChange={(e) => setProjectConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="簡要描述專案內容與目標"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!projectConfig.name.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步：選擇資源
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              選擇設計資源
            </h3>
            
            {/* 設計資產 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                  <FolderIcon className="h-5 w-5 mr-2" />
                  設計資產 ({projectConfig.selectedAssets.length} 已選)
                </h4>
                <Link to="/library/assets" className="text-blue-600 hover:text-blue-700 text-sm">
                  管理設計資產 →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {designModulesStore.modules.slice(0, 6).map((module) => (
                  <div
                    key={module.id}
                    onClick={() => toggleResourceSelection(module.id, 'asset')}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      projectConfig.selectedAssets.includes(module.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">{module.name}</h5>
                      {projectConfig.selectedAssets.includes(module.id) && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{module.asset_count} 個資產</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 模板庫 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  模板庫 ({projectConfig.selectedTemplates.length} 已選)
                </h4>
                <Link to="/library/templates" className="text-blue-600 hover:text-blue-700 text-sm">
                  管理模板庫 →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => toggleResourceSelection(template.id, 'template')}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      projectConfig.selectedTemplates.includes(template.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">{template.name}</h5>
                      {projectConfig.selectedTemplates.includes(template.id) && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI 規格庫 */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  AI 規格庫 ({projectConfig.selectedAISpecs.length} 已選)
                </h4>
                <Link to="/library/ai-specs" className="text-blue-600 hover:text-blue-700 text-sm">
                  管理AI規格 →
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockAISpecs.map((spec) => (
                  <div
                    key={spec.id}
                    onClick={() => toggleResourceSelection(spec.id, 'aispec')}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      projectConfig.selectedAISpecs.includes(spec.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">{spec.name}</h5>
                      {projectConfig.selectedAISpecs.includes(spec.id) && (
                        <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{spec.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="btn-secondary"
              >
                上一步
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="btn-primary"
              >
                下一步：輸出配置
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              輸出配置
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">包含內容</h4>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={projectConfig.outputConfig.includeHtml}
                      onChange={(e) => setProjectConfig(prev => ({
                        ...prev,
                        outputConfig: { ...prev.outputConfig, includeHtml: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">生成 HTML 結構</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={projectConfig.outputConfig.includeCss}
                      onChange={(e) => setProjectConfig(prev => ({
                        ...prev,
                        outputConfig: { ...prev.outputConfig, includeCss: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">生成 CSS 樣式</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={projectConfig.outputConfig.includeResponsive}
                      onChange={(e) => setProjectConfig(prev => ({
                        ...prev,
                        outputConfig: { ...prev.outputConfig, includeResponsive: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">包含響應式設計</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={projectConfig.outputConfig.includeAISpecs}
                      onChange={(e) => setProjectConfig(prev => ({
                        ...prev,
                        outputConfig: { ...prev.outputConfig, includeAISpecs: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">包含 AI 開發規格</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={projectConfig.outputConfig.makeZip}
                      onChange={(e) => setProjectConfig(prev => ({
                        ...prev,
                        outputConfig: { ...prev.outputConfig, makeZip: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">產出後自動打包 ZIP</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">專案摘要</h4>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                  <p className="text-sm"><span className="font-medium">專案名稱：</span>{projectConfig.name}</p>
                  <p className="text-sm"><span className="font-medium">設計資產：</span>{projectConfig.selectedAssets.length} 個模組</p>
                  <p className="text-sm"><span className="font-medium">模板：</span>{projectConfig.selectedTemplates.length} 個</p>
                  <p className="text-sm"><span className="font-medium">AI規格：</span>{projectConfig.selectedAISpecs.length} 個</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="btn-secondary"
              >
                上一步
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="btn-primary"
              >
                下一步：生成專案
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <RocketLaunchIcon className="h-16 w-16 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                準備生成專案切版包
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                系統將根據您的選擇生成完整的前端切版包，包含所有選中的設計資產、模板和AI規格。
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg max-w-md mx-auto">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">生成內容預覽</h4>
              <div className="space-y-2 text-sm text-left">
                <div className="flex justify-between">
                  <span>設計資產模組：</span>
                  <span className="font-medium">{projectConfig.selectedAssets.length} 個</span>
                </div>
                <div className="flex justify-between">
                  <span>HTML/CSS 模板：</span>
                  <span className="font-medium">{projectConfig.selectedTemplates.length} 個</span>
                </div>
                <div className="flex justify-between">
                  <span>AI 開發規格：</span>
                  <span className="font-medium">{projectConfig.selectedAISpecs.length} 個</span>
                </div>
                <hr className="my-3 border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between font-medium">
                  <span>預估輸出檔案：</span>
                  <span>50+ 個檔案</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="btn-secondary"
                disabled={generating}
              >
                返回修改
              </button>
              <button
                onClick={generateProject}
                disabled={generating}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="h-5 w-5 mr-2" />
                    開始生成專案切版包
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 快速開始區域 */}
      {currentStep === 1 && !showFigmaImporter && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            快速開始
          </h3>
          
          {/* Figma 快速匯入 */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">
                  🎨 從 Figma 快速開始
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  直接匯入 Figma 設計稿，自動解析為 ErSlice 專案資產
                </p>
              </div>
              <button
                onClick={() => setShowFigmaImporter(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <PhotoIcon className="h-5 w-5 mr-2" />
                匯入 Figma
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/library/assets"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors group"
            >
              <FolderIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-3" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">管理設計資產</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                上傳和管理您的設計稿、資源檔案
              </p>
            </Link>
            
            <Link
              to="/library/templates"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors group"
            >
              <DocumentTextIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-3" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">建立模板</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                創建可重複使用的 HTML/CSS 模板
              </p>
            </Link>
            
            <Link
              to="/library/ai-specs"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors group"
            >
              <SparklesIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mb-3" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">生成AI規格</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                創建AI可依循的開發規格文檔
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* Figma 匯入器 Modal */}
      {showFigmaImporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <FigmaImporter
                onImportComplete={handleFigmaImport}
                onCancel={() => setShowFigmaImporter(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectHub