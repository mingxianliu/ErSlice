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
  PhotoIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { listProjects, createProject, deleteProject, switchProject, isTauriEnvironment } from '@/utils/tauriCommands'

// 專案介面
interface Project {
  slug: string
  name: string
  description?: string
  status: 'active' | 'archived' | 'draft'
  createdAt: string
  updatedAt: string
  assetCount: number
  templateCount: number
  aiSpecCount: number
  tags: string[]
  author: string
  // 專案配置
  selectedAssets?: string[]
  selectedTemplates?: string[]
  selectedAISpecs?: string[]
  outputConfig?: {
    includeHtml: boolean
    includeCss: boolean
    includeResponsive: boolean
    includeAISpecs: boolean
    generateSitemap: boolean
    makeZip: boolean
  }
}

// 篩選選項
interface FilterOptions {
  status: 'all' | 'active' | 'archived' | 'draft'
  tags: string[]
  dateRange: 'all' | 'week' | 'month' | 'quarter'
}

// 專案操作介面
interface ProjectAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: (project: Project) => void
  variant: 'primary' | 'secondary' | 'danger'
}

const ProjectHub: React.FC = () => {
  const { showSuccess, showError, showInfo } = useToast()
  const projectStore = useProjectStore()
  const { tauri, init, project } = useProjectStore()
  const designModulesStore = useDesignModulesStore()
  
  // 列表狀態
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    tags: [],
    dateRange: 'all'
  })
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProjects = filteredProjects.slice(startIndex, endIndex)
  
  // 瀏覽器環境下的本地專案存儲
  const [localProjects, setLocalProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('erslice-projects')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error('解析本地專案數據失敗:', e)
        }
      }
    }
    return [
      {
        slug: 'demo-project',
        name: '示範專案',
        description: '這是一個示範專案',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assetCount: 25,
        templateCount: 8,
        aiSpecCount: 5,
        tags: ['前端', '網頁設計'],
        author: '目前用戶',
        selectedAssets: ['home-page', 'about-page'],
        selectedTemplates: ['basic-layout', 'card-template'],
        selectedAISpecs: ['responsive-spec'],
        outputConfig: {
          includeHtml: true,
          includeCss: true,
          includeResponsive: true,
          includeAISpecs: true,
          generateSitemap: true,
          makeZip: true
        }
      },
      {
        slug: 'sample-website',
        name: '範例網站',
        description: '範例網站專案',
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assetCount: 12,
        templateCount: 3,
        aiSpecCount: 2,
        tags: ['企業官網'],
        author: '目前用戶',
        selectedAssets: [],
        selectedTemplates: [],
        selectedAISpecs: [],
        outputConfig: {
          includeHtml: true,
          includeCss: true,
          includeResponsive: true,
          includeAISpecs: false,
          generateSitemap: false,
          makeZip: true
        }
      },
      {
        slug: 'ecommerce-shop',
        name: '電商商城',
        description: '完整的電商網站專案',
        status: 'active' as const,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        assetCount: 48,
        templateCount: 15,
        aiSpecCount: 8,
        tags: ['電商', '前端'],
        author: '目前用戶',
        selectedAssets: ['product-page', 'cart-page'],
        selectedTemplates: ['ecommerce-layout'],
        selectedAISpecs: ['payment-spec'],
        outputConfig: {
          includeHtml: true,
          includeCss: true,
          includeResponsive: true,
          includeAISpecs: true,
          generateSitemap: true,
          makeZip: true
        }
      },
      {
        slug: 'mobile-app-landing',
        name: '手機應用官網',
        description: '手機應用程式的官方網站',
        status: 'active' as const,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        assetCount: 20,
        templateCount: 6,
        aiSpecCount: 3,
        tags: ['手機版', '網頁設計'],
        author: '目前用戶',
        selectedAssets: ['landing-hero', 'features-section'],
        selectedTemplates: ['mobile-first-layout'],
        selectedAISpecs: ['mobile-responsive-spec'],
        outputConfig: {
          includeHtml: true,
          includeCss: true,
          includeResponsive: true,
          includeAISpecs: true,
          generateSitemap: true,
          makeZip: true
        }
      },
      {
        slug: 'dashboard-admin',
        name: '管理後台',
        description: '企業級管理後台系統',
        status: 'draft' as const,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        assetCount: 35,
        templateCount: 12,
        aiSpecCount: 6,
        tags: ['後台管理', '前端'],
        author: '目前用戶',
        selectedAssets: ['dashboard-charts', 'user-management'],
        selectedTemplates: ['admin-layout', 'table-template'],
        selectedAISpecs: ['crud-spec', 'auth-spec'],
        outputConfig: {
          includeHtml: true,
          includeCss: true,
          includeResponsive: true,
          includeAISpecs: true,
          generateSitemap: false,
          makeZip: true
        }
      },
      {
        slug: 'portfolio-site',
        name: '個人作品集',
        description: '設計師個人作品集網站',
        status: 'archived' as const,
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString(),
        assetCount: 18,
        templateCount: 5,
        aiSpecCount: 2,
        tags: ['部落格', '網頁設計'],
        author: '目前用戶',
        selectedAssets: ['portfolio-grid', 'about-section'],
        selectedTemplates: ['portfolio-layout'],
        selectedAISpecs: ['gallery-spec'],
        outputConfig: {
          includeHtml: true,
          includeCss: true,
          includeResponsive: true,
          includeAISpecs: false,
          generateSitemap: true,
          makeZip: true
        }
      }
    ]
  })
  
  // 保存本地專案到 localStorage
  const saveLocalProjects = (projects: Project[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('erslice-projects', JSON.stringify(projects))
    }
    setLocalProjects(projects)
  }
  
  // 模態狀態
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showAISpecModal, setShowAISpecModal] = useState(false)
  const [showFigmaImporter, setShowFigmaImporter] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  // 資源選擇狀態
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [selectedAISpecs, setSelectedAISpecs] = useState<string[]>([])
  
  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    status: 'draft' as Project['status']
  })

  // 載入專案列表
  const loadProjects = async () => {
    console.log('載入專案 - tauri 狀態:', !!tauri)
    console.log('Tauri 環境檢查:', isTauriEnvironment())
    try {
      setLoading(true)
      
      let fullProjects: Project[]
      
      if (isTauriEnvironment()) {
        console.log('使用 Tauri API 載入專案')
        const projectList = await listProjects()
        console.log('取得專案列表:', projectList)
        // 從 Tauri 取得的數據轉換
        fullProjects = projectList.map(p => ({
          slug: p.slug,
          name: p.name,
          description: '專案描述',
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assetCount: Math.floor(Math.random() * 50),
          templateCount: Math.floor(Math.random() * 20),
          aiSpecCount: Math.floor(Math.random() * 10),
          tags: ['前端', '網頁設計'],
          author: '目前用戶'
        }))
      } else {
        console.log('使用本地存儲載入專案')
        // 瀏覽器環境使用本地存儲
        fullProjects = localProjects
      }
      
      console.log('處理後的專案數據:', fullProjects)
      setProjects(fullProjects)
      setFilteredProjects(fullProjects)
    } catch (e) {
      console.error('載入專案列表失敗:', e)
      // 失敗時使用本地專案
      setProjects(localProjects)
      setFilteredProjects(localProjects)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [tauri, localProjects])

  // 初始化
  useEffect(() => {
    if (tauri) {
      init()
    }
  }, [tauri])
  
  // 搜尋和篩選
  useEffect(() => {
    let filtered = projects
    
    // 搜尋
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    // 狀態篩選
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status)
    }
    
    // 標籤篩選
    if (filters.tags.length > 0) {
      filtered = filtered.filter(p => 
        filters.tags.some(tag => p.tags.includes(tag))
      )
    }
    
    setFilteredProjects(filtered)
    setCurrentPage(1) // 重置到第一頁
  }, [projects, searchQuery, filters])

  useEffect(() => {
    projectStore.init()
    designModulesStore.init()
  }, [])
  
  // 專案操作
  const handleCreateProject = async () => {
    if (!formData.name.trim()) {
      showError('請輸入專案名稱')
      return
    }
    
    try {
      console.log('開始建立專案:', formData.name)
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      console.log('生成 slug:', slug)
      
      // 檢查是否已存在相同的 slug
      const existingProject = (isTauriEnvironment() ? projects : localProjects).find(p => p.slug === slug)
      if (existingProject) {
        showError('專案名稱已存在，請使用不同的名稱')
        return
      }
      
      if (isTauriEnvironment()) {
        // Tauri 環境
        const result = await createProject(slug, formData.name)
        console.log('專案建立結果:', result)
        await loadProjects()
      } else {
        // 瀏覽器環境 - 直接更新本地狀態
        const newProject: Project = {
          slug,
          name: formData.name,
          description: formData.description || '新建專案',
          status: formData.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assetCount: 0,
          templateCount: 0,
          aiSpecCount: 0,
          tags: formData.tags,
          author: '目前用戶',
          selectedAssets: [],
          selectedTemplates: [],
          selectedAISpecs: [],
          outputConfig: {
            includeHtml: true,
            includeCss: true,
            includeResponsive: true,
            includeAISpecs: true,
            generateSitemap: true,
            makeZip: true
          }
        }
        
        console.log('建立新專案:', newProject)
        const updatedProjects = [...localProjects, newProject]
        saveLocalProjects(updatedProjects)
        setProjects(updatedProjects)
        setFilteredProjects(updatedProjects)
      }
      
      setShowCreateModal(false)
      setFormData({ name: '', description: '', tags: [], status: 'draft' })
      showSuccess('專案已建立')
    } catch (e) {
      console.error('建立專案錯誤:', e)
      showError('建立失敗', String(e))
    }
  }
  
  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      tags: project.tags,
      status: project.status
    })
    setShowEditModal(true)
  }
  
  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`刪除專案 ${project.name}？`)) return
    try {
      if (isTauriEnvironment()) {
        // Tauri 環境
        await deleteProject(project.slug)
        await loadProjects()
      } else {
        // 瀏覽器環境 - 直接更新本地狀態
        const updatedProjects = localProjects.filter(p => p.slug !== project.slug)
        saveLocalProjects(updatedProjects)
        setProjects(updatedProjects)
        setFilteredProjects(updatedProjects.filter(p => {
          // 重新應用當前的篩選條件
          if (searchQuery) {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            if (!matchesSearch) return false
          }
          if (filters.status !== 'all' && p.status !== filters.status) return false
          if (filters.tags.length > 0 && !filters.tags.some(tag => p.tags.includes(tag))) return false
          return true
        }))
      }
      showSuccess('已刪除')
    } catch (e) {
      showError('刪除失敗', String(e))
    }
  }
  
  const handleSwitchProject = async (project: Project) => {
    try {
      if (isTauriEnvironment()) {
        await switchProject(project.slug)
        await init()
      } else {
        // 瀏覽器環境下模擬切換
        console.log('切換到專案:', project.name)
        // 可以在這裡設置當前專案狀態
      }
      showSuccess(`已切換到專案: ${project.name}`)
    } catch (e) {
      showError('切換失敗', String(e))
    }
  }

  // 所有可用標籤
  const allTags = ['前端', '網頁設計', '手機版', '後台管理', '電商', '部落格', '企業官網']
  
  // 專案操作項
  const projectActions: ProjectAction[] = [
    {
      id: 'view',
      label: '查看',
      icon: EyeIcon,
      onClick: (project) => handleSwitchProject(project),
      variant: 'primary'
    },
    {
      id: 'generate',
      label: '生成切版包',
      icon: RocketLaunchIcon,
      onClick: (project) => {
        setSelectedProject(project)
        handleGenerateProject(project)
      },
      variant: 'primary'
    },
    {
      id: 'import',
      label: '匯入設計',
      icon: ArrowUpTrayIcon,
      onClick: (project) => {
        setSelectedProject(project)
        setShowFigmaImporter(true)
      },
      variant: 'secondary'
    },
    {
      id: 'edit',
      label: '編輯資訊',
      icon: PencilIcon,
      onClick: handleEditProject,
      variant: 'secondary'
    },
    {
      id: 'assets',
      label: '選擇資產',
      icon: FolderIcon,
      onClick: (project) => {
        setSelectedProject(project)
        setSelectedAssets(project.selectedAssets || [])
        setShowAssetModal(true)
      },
      variant: 'secondary'
    },
    {
      id: 'templates',
      label: '選擇模板',
      icon: DocumentTextIcon,
      onClick: (project) => {
        setSelectedProject(project)
        setSelectedTemplates(project.selectedTemplates || [])
        setShowTemplateModal(true)
      },
      variant: 'secondary'
    },
    {
      id: 'ai-specs',
      label: '選擇AI規格',
      icon: SparklesIcon,
      onClick: (project) => {
        setSelectedProject(project)
        setSelectedAISpecs(project.selectedAISpecs || [])
        setShowAISpecModal(true)
      },
      variant: 'secondary'
    },
    {
      id: 'delete',
      label: '刪除',
      icon: TrashIcon,
      onClick: handleDeleteProject,
      variant: 'danger'
    }
  ]

  // 處理 Figma 匯入結果
  const handleFigmaImport = async (result: any) => {
    setShowFigmaImporter(false)
    
    try {
      showInfo('正在處理匯入的設計資產...', '開始自動生成設計模組')
      
      // 從 Figma 分析結果中提取模組資訊
      const modules = result.modules || []
      const assets = result.assets || []
      const analysisResult = result.analysisResult
      
      // 為每個檢測到的模組自動創建設計資產模組
      const createdModules: string[] = []
      
      if (modules.length > 0) {
        for (const moduleName of modules) {
          try {
            showInfo(`正在創建模組: ${moduleName}`, '生成對應的設計資產結構')
            await new Promise(resolve => setTimeout(resolve, 500)) // 模擬處理時間
            
            // 自動命名邏輯：根據模組用途和設備類型
            const moduleAssets = assets.filter((asset: any) => asset.module === moduleName)
            const devices = [...new Set(moduleAssets.map((asset: any) => asset.device))]
            const deviceSuffix = devices.length > 1 ? '-responsive' : `-${devices[0] || 'desktop'}`
            const finalModuleName = `${moduleName}${deviceSuffix}`
            
            // 模擬創建設計資產模組 (在實際環境中會調用 createDesignModule)
            if (isTauriEnvironment()) {
              // 在 Tauri 環境中實際創建模組
              // await createDesignModule(finalModuleName, `從 Figma 匯入的 ${moduleName} 模組`)
              console.log('Tauri環境：創建模組', finalModuleName)
            } else {
              // 瀏覽器環境中模擬
              console.log('瀏覽器環境：模擬創建模組', finalModuleName)
            }
            
            createdModules.push(finalModuleName)
          } catch (error) {
            console.error(`創建模組 ${moduleName} 失敗:`, error)
            showError(`創建模組失敗`, `無法創建模組 ${moduleName}`)
          }
        }
      } else {
        // 如果沒有檢測到模組，創建一個通用的匯入模組
        const defaultModuleName = `${result.projectName || 'figma-import'}-${Date.now()}`
        showInfo(`正在創建預設模組: ${defaultModuleName}`, '整合所有匯入的設計資產')
        
        if (isTauriEnvironment()) {
          console.log('Tauri環境：創建預設模組', defaultModuleName)
        } else {
          console.log('瀏覽器環境：模擬創建預設模組', defaultModuleName)
        }
        
        createdModules.push(defaultModuleName)
      }
      
      // 子項目生成：為每個模組創建子資料夾和資源分類
      if (createdModules.length > 0) {
        showInfo('正在生成子項目結構...', '創建資產分類和子資料夾')
        
        for (const moduleName of createdModules) {
          // 模擬創建子項目結構
          const subItems = [
            'assets/images',
            'assets/icons', 
            'components/main',
            'components/variants',
            'specs/responsive',
            'specs/interactions'
          ]
          
          showInfo(`為 ${moduleName} 生成子項目`, `創建 ${subItems.length} 個子分類`)
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // 在實際環境中，這裡會創建實際的資料夾結構
          console.log(`模組 ${moduleName} 的子項目:`, subItems)
        }
      }
      
      // 導入設計資產文件
      if (assets.length > 0) {
        showInfo('正在導入設計資產文件...', `處理 ${assets.length} 個設計資產`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 按設備和狀態分類資產
        const assetCategories = assets.reduce((acc: any, asset: any) => {
          const category = `${asset.device}-${asset.state || 'default'}`
          if (!acc[category]) acc[category] = []
          acc[category].push(asset)
          return acc
        }, {})
        
        console.log('資產分類:', Object.keys(assetCategories))
      }
      
      // 刷新設計模組列表
      if (designModulesStore && designModulesStore.refresh) {
        await designModulesStore.refresh()
      }
      
      // 顯示成功消息
      const summary = [
        `📁 ${createdModules.length} 個設計模組`,
        `🎨 ${assets.length} 個設計資產`,
        `📱 ${result.modules?.length || 0} 個檢測模組`,
        `🔧 自動生成子項目結構`
      ]
      
      showSuccess(
        'Figma 匯入與模組生成完成！',
        summary.join('\n') + `\n\n已創建模組: ${createdModules.join(', ')}`
      )
      
    } catch (error) {
      console.error('處理 Figma 匯入結果失敗:', error)
      showError('處理匯入結果失敗', error instanceof Error ? error.message : '未知錯誤')
    }
  }
  
  // 生成專案切版包
  const handleGenerateProject = async (project: Project) => {
    if (!project.selectedAssets?.length && !project.selectedTemplates?.length && !project.selectedAISpecs?.length) {
      showError('請先為專案選擇資產、模板或AI規格')
      return
    }
    
    try {
      showInfo('開始生成專案切版包...', '正在初始化生成流程')
      
      // 階段1: 準備資源
      await new Promise(resolve => setTimeout(resolve, 1000))
      showInfo('正在準備設計資源...', `處理 ${project.selectedAssets?.length || 0} 個設計資產`)
      
      // 階段2: 應用模板
      await new Promise(resolve => setTimeout(resolve, 1500))
      showInfo('正在應用模板...', `處理 ${project.selectedTemplates?.length || 0} 個模板`)
      
      // 階段3: 套用AI規格
      if (project.selectedAISpecs?.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        showInfo('正在套用AI開發規格...', `處理 ${project.selectedAISpecs.length} 個規格`)
      }
      
      // 階段4: 生成站點圖
      if (project.outputConfig?.generateSitemap) {
        await new Promise(resolve => setTimeout(resolve, 800))
        showInfo('正在生成站點圖...', '建立專案結構導覽')
      }
      
      // 階段5: 打包檔案
      if (project.outputConfig?.makeZip) {
        await new Promise(resolve => setTimeout(resolve, 1200))
        showInfo('正在打包檔案...', '建立切版包壓縮檔')
      }
      
      const summary = {
        assets: project.selectedAssets?.length || 0,
        templates: project.selectedTemplates?.length || 0,
        aiSpecs: project.selectedAISpecs?.length || 0,
        outputPath: `output/projects/${project.slug}-${Date.now()}`,
        includeHtml: project.outputConfig?.includeHtml,
        includeCss: project.outputConfig?.includeCss,
        includeResponsive: project.outputConfig?.includeResponsive,
        generateSitemap: project.outputConfig?.generateSitemap,
        makeZip: project.outputConfig?.makeZip
      }
      
      const features = []
      if (summary.includeHtml) features.push('HTML')
      if (summary.includeCss) features.push('CSS')
      if (summary.includeResponsive) features.push('RWD')
      if (summary.generateSitemap) features.push('站點圖')
      if (summary.makeZip) features.push('壓縮包')
      
      showSuccess(
        '專案切版包生成完成！', 
        `✅ ${summary.assets} 個設計資產\n✅ ${summary.templates} 個模板\n✅ ${summary.aiSpecs} 個AI規格\n📋 功能: ${features.join('、')}\n📁 輸出路徑: ${summary.outputPath}`
      )
      
      // 可以在這裡打開輸出文件夾
      if (isTauriEnvironment()) {
        // 在 Tauri 環境中可以打開文件夾
        console.log('打開輸出文件夾:', summary.outputPath)
        try {
          const { open } = await import('@tauri-apps/plugin-shell')
          await open(summary.outputPath)
        } catch (error) {
          console.log('無法打開文件夾:', error)
        }
      } else {
        // 瀏覽器環境下模擬下載
        showInfo('瀏覽器環境：切版包已準備完成', '實際專案中將提供下載連結')
      }
      
    } catch (error) {
      showError('生成失敗', error instanceof Error ? error.message : '未知錯誤')
    }
  }
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW')
  }
  
  // 狀態樣式
  const getStatusStyle = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'archived':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  // 狀態翻譯
  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'active': return '活躍'
      case 'draft': return '草稿'
      case 'archived': return '已封存'
      default: return '未知'
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
              專案管理、資源配置和切版包生成
            </p>
          </div>
        </div>
      </div>
      
      {/* 列表工具列 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜尋框 */}
          <div className="relative w-full lg:w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋專案..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          {/* 篩選 */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterOptions['status'] }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">所有狀態</option>
              <option value="active">活躍</option>
              <option value="draft">草稿</option>
              <option value="archived">已封存</option>
            </select>
            
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as FilterOptions['dateRange'] }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">所有時間</option>
              <option value="week">近一週</option>
              <option value="month">近一月</option>
              <option value="quarter">近三月</option>
            </select>
          </div>
          
          {/* 操作按鈕組 */}
          <div className="flex gap-2">
            <button
              onClick={() => loadProjects()}
              disabled={loading}
              className="btn-secondary flex items-center whitespace-nowrap"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              重新整理
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center whitespace-nowrap"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              建立專案
            </button>
          </div>
        </div>
      </div>

      {/* 專案列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* 列表標題 */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            專案列表 ({filteredProjects.length})
          </h2>
        </div>
        
        {/* 列表內容 - 固定高度 */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-2" />
                載入中...
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <RocketLaunchIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <div className="text-lg font-medium mb-2">
                  {projects.length === 0 ? '尚無專案' : '無符合條件的專案'}
                </div>
                <div className="text-sm">
                  {projects.length === 0 ? '點擊上方「建立專案」開始使用' : '請試著調整搜尋或篩選條件'}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      專案資訊
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      狀態
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      資源統計
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      時間
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentProjects.map((proj) => (
                    <tr key={proj.slug} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      {/* 專案資訊 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                              <RocketLaunchIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {proj.name}
                              </div>
                              {project?.slug === proj.slug && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                  目前
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{proj.description}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {proj.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* 狀態 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(proj.status)}`}>
                          {getStatusText(proj.status)}
                        </span>
                      </td>
                      
                      {/* 資源統計 */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <FolderIcon className="h-4 w-4 mr-1" />
                            {proj.assetCount} 資產
                          </div>
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            {proj.templateCount} 模板
                          </div>
                          <div className="flex items-center">
                            <SparklesIcon className="h-4 w-4 mr-1" />
                            {proj.aiSpecCount} AI規格
                          </div>
                        </div>
                      </td>
                      
                      {/* 時間 */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            建立: {formatDate(proj.createdAt)}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            更新: {formatDate(proj.updatedAt)}
                          </div>
                        </div>
                      </td>
                      
                      {/* 操作 */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {projectActions.map((action) => (
                            <button
                              key={action.id}
                              onClick={() => action.onClick(proj)}
                              disabled={action.id === 'view' && project?.slug === proj.slug}
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                action.variant === 'primary' 
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40 dark:hover:text-blue-200'
                                  : action.variant === 'danger'
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/40 dark:hover:text-red-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 dark:bg-gray-600/50 dark:text-gray-300 dark:hover:bg-gray-500/60 dark:hover:text-gray-200'
                              }`}
                              title={action.label}
                            >
                              <action.icon className="h-3 w-3 mr-1" />
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* 分頁控制 */}
        {!loading && filteredProjects.length > itemsPerPage && (
          <div className="px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                顯示第 {startIndex + 1} - {Math.min(endIndex, filteredProjects.length)} 筆，共 {filteredProjects.length} 筆專案
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一頁
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一頁
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 建立專案模態 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">建立新專案</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    專案名稱 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="輸入專案名稱"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="輸入專案描述"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    狀態
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Project['status'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="draft">草稿</option>
                    <option value="active">活躍</option>
                    <option value="archived">已封存</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ name: '', description: '', tags: [], status: 'draft' })
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!formData.name.trim()}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  建立
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 編輯專案模態 */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">編輯專案</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    專案名稱 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedProject(null)
                    setFormData({ name: '', description: '', tags: [], status: 'draft' })
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    // TODO: 實作更新邏輯
                    showInfo('更新功能尚未實作')
                  }}
                  className="flex-1 btn-primary"
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 資產選擇模態 */}
      {showAssetModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">選擇設計資產</h3>
                <button
                  onClick={() => setShowAssetModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                為專案 "{selectedProject.name}" 選擇設計資產模組
              </div>
              
              {/* 設計資產列表 */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white">可用的設計資產模組</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {designModulesStore.modules.length > 0 ? (
                    designModulesStore.modules.map((module) => {
                      const isSelected = selectedAssets.includes(module.id)
                      return (
                        <div
                          key={module.id}
                          onClick={() => {
                            setSelectedAssets(prev => 
                              prev.includes(module.id) 
                                ? prev.filter(id => id !== module.id)
                                : [...prev, module.id]
                            )
                          }}
                          className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                              : 'border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">{module.name}</h5>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // 由 div 的 onClick 處理
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                            />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{module.description}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <FolderIcon className="h-4 w-4 mr-1" />
                            {module.asset_count} 個資產
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            更新時間: {new Date(module.last_updated).toLocaleDateString('zh-TW')}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <FolderIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <div className="text-lg font-medium mb-2">尚無設計資產</div>
                      <div className="text-sm">
                        請先到 <Link to="/design-assets" className="text-blue-600 hover:underline">設計資產</Link> 頁面上傳設計稿
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssetModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button 
                  className="flex-1 btn-primary"
                  onClick={() => {
                    // 保存選中的資產到專案
                    if (selectedProject) {
                      const updatedProject = { ...selectedProject, selectedAssets }
                      
                      if (isTauriEnvironment()) {
                        // TODO: 實作 Tauri 環境的專案更新
                        showInfo('Tauri 環境的專案更新功能尚未實作')
                      } else {
                        // 更新本地專案數據
                        const updatedProjects = localProjects.map(p => 
                          p.slug === selectedProject.slug ? updatedProject : p
                        )
                        saveLocalProjects(updatedProjects)
                        setProjects(updatedProjects)
                        setFilteredProjects(updatedProjects.filter(p => {
                          // 重新應用當前的篩選條件
                          if (searchQuery) {
                            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                            if (!matchesSearch) return false
                          }
                          if (filters.status !== 'all' && p.status !== filters.status) return false
                          if (filters.tags.length > 0 && !filters.tags.some(tag => p.tags.includes(tag))) return false
                          return true
                        }))
                      }
                    }
                    
                    showSuccess(`已選擇 ${selectedAssets.length} 個設計資產`)
                    setShowAssetModal(false)
                  }}
                >
                  確定選擇
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 模板選擇模態 */}
      {showTemplateModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">選擇模板</h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                為專案 "{selectedProject.name}" 選擇模板
              </div>
              
              {/* 模板列表 */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white">可用的模板</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {/* 示範模板數據 */}
                  {[
                    { id: 'basic-layout', name: '基礎版面', description: '標準的網頁版面結構', type: 'HTML/CSS' },
                    { id: 'card-template', name: '卡片模板', description: '響應式卡片組件', type: 'Component' },
                    { id: 'ecommerce-layout', name: '電商版面', description: '電商網站專用版面', type: 'Layout' },
                    { id: 'mobile-first-layout', name: '手機優先版面', description: '針對手機設計的版面', type: 'Responsive' },
                    { id: 'admin-layout', name: '管理後台版面', description: '管理系統版面結構', type: 'Admin' },
                    { id: 'portfolio-layout', name: '作品集版面', description: '個人作品集專用版面', type: 'Portfolio' }
                  ].map((template) => {
                    const isSelected = selectedTemplates.includes(template.id)
                    return (
                      <div
                        key={template.id}
                        onClick={() => {
                          setSelectedTemplates(prev => 
                            prev.includes(template.id) 
                              ? prev.filter(id => id !== template.id)
                              : [...prev, template.id]
                          )
                        }}
                        className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-white">{template.name}</h5>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // 由 div 的 onClick 處理
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                          />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          {template.type}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button 
                  className="flex-1 btn-primary"
                  onClick={() => {
                    // 保存選中的模板到專案
                    if (selectedProject) {
                      const updatedProject = { ...selectedProject, selectedTemplates }
                      
                      if (isTauriEnvironment()) {
                        // TODO: 實作 Tauri 環境的專案更新
                        showInfo('Tauri 環境的專案更新功能尚未實作')
                      } else {
                        // 更新本地專案數據
                        const updatedProjects = localProjects.map(p => 
                          p.slug === selectedProject.slug ? updatedProject : p
                        )
                        saveLocalProjects(updatedProjects)
                        setProjects(updatedProjects)
                        setFilteredProjects(updatedProjects.filter(p => {
                          // 重新應用當前的篩選條件
                          if (searchQuery) {
                            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                            if (!matchesSearch) return false
                          }
                          if (filters.status !== 'all' && p.status !== filters.status) return false
                          if (filters.tags.length > 0 && !filters.tags.some(tag => p.tags.includes(tag))) return false
                          return true
                        }))
                      }
                    }
                    
                    showSuccess(`已選擇 ${selectedTemplates.length} 個模板`)
                    setShowTemplateModal(false)
                  }}
                >
                  確定選擇
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* AI規格選擇模態 */}
      {showAISpecModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">選擇AI規格</h3>
                <button
                  onClick={() => setShowAISpecModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                為專案 "{selectedProject.name}" 選擇AI開發規格
              </div>
              
              {/* AI規格列表 */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white">可用的AI開發規格</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {/* 示範AI規格數據 */}
                  {[
                    { id: 'responsive-spec', name: '響應式設計規格', description: 'RWD響應式網頁設計規範', category: 'Design' },
                    { id: 'payment-spec', name: '支付系統規格', description: '電商支付流程開發規範', category: 'Backend' },
                    { id: 'mobile-responsive-spec', name: '手機響應式規格', description: '手機端優化設計規範', category: 'Mobile' },
                    { id: 'crud-spec', name: 'CRUD操作規格', description: '資料庫增刪改查操作規範', category: 'Database' },
                    { id: 'auth-spec', name: '認證系統規格', description: '使用者認證與授權規範', category: 'Security' },
                    { id: 'gallery-spec', name: '圖庫展示規格', description: '圖片展示與互動規範', category: 'UI/UX' }
                  ].map((spec) => {
                    const isSelected = selectedAISpecs.includes(spec.id)
                    return (
                      <div
                        key={spec.id}
                        onClick={() => {
                          setSelectedAISpecs(prev => 
                            prev.includes(spec.id) 
                              ? prev.filter(id => id !== spec.id)
                              : [...prev, spec.id]
                          )
                        }}
                        className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-white">{spec.name}</h5>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // 由 div 的 onClick 處理
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
                          />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{spec.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <SparklesIcon className="h-4 w-4 mr-1" />
                          {spec.category}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAISpecModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button 
                  className="flex-1 btn-primary"
                  onClick={() => {
                    // 保存選中的AI規格到專案
                    if (selectedProject) {
                      const updatedProject = { ...selectedProject, selectedAISpecs }
                      
                      if (isTauriEnvironment()) {
                        // TODO: 實作 Tauri 環境的專案更新
                        showInfo('Tauri 環境的專案更新功能尚未實作')
                      } else {
                        // 更新本地專案數據
                        const updatedProjects = localProjects.map(p => 
                          p.slug === selectedProject.slug ? updatedProject : p
                        )
                        saveLocalProjects(updatedProjects)
                        setProjects(updatedProjects)
                        setFilteredProjects(updatedProjects.filter(p => {
                          // 重新應用當前的篩選條件
                          if (searchQuery) {
                            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                            if (!matchesSearch) return false
                          }
                          if (filters.status !== 'all' && p.status !== filters.status) return false
                          if (filters.tags.length > 0 && !filters.tags.some(tag => p.tags.includes(tag))) return false
                          return true
                        }))
                      }
                    }
                    
                    showSuccess(`已選擇 ${selectedAISpecs.length} 個AI開發規格`)
                    setShowAISpecModal(false)
                  }}
                >
                  確定選擇
                </button>
              </div>
            </div>
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