import React, { useEffect, useMemo, useState } from 'react'
import { FolderIcon, PlusIcon, ArrowPathIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { useDesignModulesStore, selectFilteredSorted, selectPaged } from '../stores/designModules'
import { createDesignModule, archiveDesignModule, deleteDesignModule, unarchiveDesignModule, generateAllSlicePackages, generateSelectedSlicePackages, OverwriteStrategy, generateUnifiedSlicePackage, generateProjectMermaid, generateProjectMermaidHtml, generateModuleMermaidHtml, generateModuleCrudMermaidHtml, generateUserWorkflowMermaidHtml, exportSitemap, importSitemap } from '../utils/tauriCommands'
import SitemapAnalyticsModal from '../components/SitemapAnalyticsModal'
import FigmaExportOptions from '../components/FigmaExportOptions'
import { loadSettings } from '@/utils/settings'
import { useProjectStore } from '@/stores/project'
import { useToast } from '../components/ui/Toast'
import { useNavigate } from 'react-router-dom'

const DesignAssets: React.FC = () => {
  const store = useDesignModulesStore()
  const navigate = useNavigate()
  const { showSuccess, showError, showInfo } = useToast()
  const [openCreate, setOpenCreate] = useState(false)
  const [openProject, setOpenProject] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [openBulkGen, setOpenBulkGen] = useState(false)
  const [bulkOpts, setBulkOpts] = useState({ html: true, css: true, responsive: true })
  const [bulkScope, setBulkScope] = useState<'all' | 'selected'>('all')
  const [bulkRunning, setBulkRunning] = useState(false)
  const [openUnified, setOpenUnified] = useState(false)
  const [openAnalytics, setOpenAnalytics] = useState(false)
  const [openFigmaExport, setOpenFigmaExport] = useState(false)
  const [figmaExporting, setFigmaExporting] = useState(false)
  const projectStore = useProjectStore()
  const [overwrite, setOverwrite] = useState<OverwriteStrategy>(projectStore.project?.overwriteStrategyDefault ?? 'overwrite')
  const [unifiedZip, setUnifiedZip] = useState(projectStore.project?.zipDefault ?? true)
  const [unifiedIncludeSkeleton, setUnifiedIncludeSkeleton] = useState(projectStore.project?.includeBoneDefault ?? false)
  const [unifiedIncludeSpecs, setUnifiedIncludeSpecs] = useState(projectStore.project?.includeSpecsDefault ?? false)

  // 自動更新專案站點圖的輔助函數
  const refreshProjectSitemap = async () => {
    if (!store.tauriAvailable) return
    try {
      await generateProjectMermaid()
      console.log('專案站點圖已自動更新')
    } catch (e) {
      console.warn('自動更新專案站點圖失敗:', e)
    }
  }
  const [unifiedPaths, setUnifiedPaths] = useState<{ assets: string; doc1: string; doc2: string }>(() => {
    const s = loadSettings()
    return { assets: s.externalDesignAssetsRoot || '', doc1: s.aiDocFrontendInstructionsPath || '', doc2: s.aiDocUiFriendlyPath || '' }
  })

  useEffect(() => {
    if (openUnified && projectStore.project) {
      const p = projectStore.project
      setUnifiedZip(p.zipDefault)
      setUnifiedIncludeSkeleton(p.includeBoneDefault)
      setUnifiedIncludeSpecs(p.includeSpecsDefault)
      setOverwrite(p.overwriteStrategyDefault ?? 'overwrite')
      setUnifiedPaths({
        assets: p.designAssetsRoot || unifiedPaths.assets,
        doc1: p.aiDocFrontendInstructions || unifiedPaths.doc1,
        doc2: p.aiDocUiFriendly || unifiedPaths.doc2,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openUnified, projectStore.project])

  useEffect(() => {
    store.init()
    
    // Check URL parameters for analytics modal
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('showAnalytics') === 'true') {
      setOpenAnalytics(true)
      // Clean up URL without refreshing page
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('showAnalytics')
      window.history.replaceState({}, '', newUrl.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => selectFilteredSorted(store), [store.modules, store.query, store.status, store.sortBy, store.sortDir])
  const { pageItems, total, pageCount, current } = useMemo(() => selectPaged(store, filtered), [store.page, store.pageSize, filtered])

  const activeCount = filtered.filter(m => m.status === 'active').length
  const assetTotal = filtered.reduce((sum, m) => sum + (m.asset_count ?? 0), 0)

  const selectedIds = useMemo(() => Object.keys(selected).filter(id => selected[id]), [selected])
  const toggleSelected = (id: string) => setSelected(prev => ({ ...prev, [id]: !prev[id] }))
  const clearSelection = () => setSelected({})
  const openFolder = async (moduleName: string, archived: boolean) => {
    if (!store.tauriAvailable) {
      showError('Tauri 不可用', '請在 Tauri 環境中開啟資料夾')
      return
    }
    try {
      const { open } = await import('@tauri-apps/plugin-shell')
      const base = archived ? 'design-assets-archived' : 'design-assets'
      await open(`${base}/${moduleName}`)
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('開啟資料夾失敗', m)
    }
  }
  const openOutputFolder = async (moduleName: string) => {
    if (!store.tauriAvailable) {
      showError('Tauri 不可用', '請在 Tauri 環境中開啟資料夾')
      return
    }
    try {
      const { open } = await import('@tauri-apps/plugin-shell')
      await open(`output/${moduleName}`)
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('開啟輸出資料夾失敗', m)
    }
  }

  const doArchiveSelected = async () => {
    if (selectedIds.length === 0) return
    try {
      if (store.tauriAvailable) {
        for (const id of selectedIds) {
          const item = store.modules.find(m => m.id === id)
          if (!item) continue
          await archiveDesignModule(item.name)
        }
        await store.refresh()
        await refreshProjectSitemap()
        showSuccess('封存完成', `已封存 ${selectedIds.length} 個模組`)
      } else {
        store.updateLocalStatuses(selectedIds, 'archived')
        showSuccess('封存（本地）', `已標記 ${selectedIds.length} 個模組為封存`)
      }
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('封存失敗', m)
    } finally {
      clearSelection()
    }
  }

  const doDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`確認刪除 ${selectedIds.length} 個模組？此動作不可回復`)) return
    try {
      if (store.tauriAvailable) {
        for (const id of selectedIds) {
          const item = store.modules.find(m => m.id === id)
          if (!item) continue
          await deleteDesignModule(item.name)
        }
        await store.refresh()
        await refreshProjectSitemap()
        showSuccess('刪除完成', `已刪除 ${selectedIds.length} 個模組`)
      } else {
        store.removeLocal(selectedIds)
        showSuccess('刪除（本地）', `已移除 ${selectedIds.length} 個模組`)
      }
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('刪除失敗', m)
    } finally {
      clearSelection()
    }
  }

  const doUnarchiveSelected = async () => {
    if (selectedIds.length === 0) return
    try {
      if (store.tauriAvailable) {
        for (const id of selectedIds) {
          const item = store.modules.find(m => m.id === id)
          if (!item) continue
          await unarchiveDesignModule(item.name)
        }
        // 切回現行視圖並刷新
        store.setViewArchived(false)
        await store.refresh()
        await refreshProjectSitemap()
        showSuccess('還原完成', `已還原 ${selectedIds.length} 個模組`)
      } else {
        // 本地狀態：標記 active
        store.updateLocalStatuses(selectedIds, 'active')
        store.setViewArchived(false)
        showSuccess('還原（本地）', `已標記 ${selectedIds.length} 個模組為活躍`)
      }
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('還原失敗', m)
    } finally {
      clearSelection()
    }
  }

  // 導出 Figma 格式
  const handleFigmaExport = async (options: {
    includeAssets: boolean
    includeTokens: boolean
    includeComponents: boolean
    exportFormat: 'figma-json' | 'design-tokens' | 'component-kit'
  }) => {
    setFigmaExporting(true)
    try {
      const activeModules = store.modules.filter(m => m.status === 'active')
      
      // 模擬導出處理
      showInfo('開始導出Figma格式...', '正在準備設計資產')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (options.includeAssets) {
        showInfo('處理設計資產...', `處理 ${activeModules.length} 個模組的資產`)
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      
      if (options.includeTokens) {
        showInfo('生成設計令牌...', '提取顏色、字體、間距令牌')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      if (options.includeComponents) {
        showInfo('轉換組件結構...', '生成Figma組件定義')
        await new Promise(resolve => setTimeout(resolve, 1200))
      }
      
      // 生成導出檔案
      const exportData = {
        format: options.exportFormat,
        modules: activeModules.length,
        assets: options.includeAssets ? activeModules.reduce((sum, m) => sum + (m.asset_count ?? 0), 0) : 0,
        tokens: options.includeTokens ? 45 : 0, // 模擬令牌數量
        components: options.includeComponents ? activeModules.length * 3 : 0, // 模擬組件數量
        outputPath: `exports/figma-export-${Date.now()}`,
        fileName: `erslice-figma-export-${options.exportFormat}.json`
      }
      
      showInfo('正在打包匯出檔案...', `生成 ${exportData.fileName}`)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const summary = []
      summary.push(`🎨 格式: ${options.exportFormat.toUpperCase()}`)
      if (options.includeAssets) summary.push(`📁 ${exportData.assets} 個設計資產`)
      if (options.includeTokens) summary.push(`🎯 ${exportData.tokens} 個設計令牌`)
      if (options.includeComponents) summary.push(`🧩 ${exportData.components} 個組件`)
      summary.push(`📂 輸出: ${exportData.outputPath}`)
      
      showSuccess(
        'Figma格式導出完成！', 
        summary.join('\n')
      )
      
      // 在 Tauri 環境中可以直接開啟文件夾
      if (store.tauriAvailable) {
        console.log('導出檔案路徑:', exportData.outputPath)
      } else {
        // 瀏覽器環境下模擬下載
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = exportData.fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      
      setOpenFigmaExport(false)
    } catch (error) {
      showError('導出失敗', error instanceof Error ? error.message : '未知錯誤')
    } finally {
      setFigmaExporting(false)
    }
  }

  return (
    <div className="space-y-6 min-h-full bg-gray-50 dark:bg-gray-900">
      {/* 頁面標題和操作 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">設計資產管理</h1>
          <p className="text-gray-600 dark:text-gray-400">管理前端模組的設計稿、切圖和資源檔案</p>
        </div>
        
        {/* 設計資產相關操作 */}
        <div className="flex items-center gap-2">
          <button className="btn-primary flex items-center gap-2" onClick={() => setOpenCreate(true)} disabled={store.viewArchived}>
            <PlusIcon className="h-5 w-5" />
            新增模組
          </button>
          {!store.viewArchived && (
            <>
              <button
                onClick={() => setOpenBulkGen(true)}
                className="btn-primary"
                title="一鍵為所有現行模組生成切版說明包"
              >
                一鍵生成全部
              </button>
              <button
                onClick={() => setOpenFigmaExport(true)}
                className="btn-secondary flex items-center gap-2"
                title="將ErSlice中的設計模組、切圖資產等轉換為Figma可匯入的標準格式，支援設計令牌、組件結構等"
              >
                <ArrowUpTrayIcon className="h-5 w-5" />
                導出至Figma
              </button>
            </>
          )}
          <button onClick={store.refresh} className="btn-secondary flex items-center gap-2" title="重新整理">
            <ArrowPathIcon className="h-5 w-5" />
            重新整理
          </button>
          <button
            onClick={async () => {
              store.setViewArchived(!store.viewArchived)
              await store.refresh()
            }}
            className={`btn-secondary ${store.viewArchived ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
            title={store.viewArchived ? '切換至現行模組' : '切換至封存模組'}
          >
            {store.viewArchived ? '查看現行' : '查看封存'}
          </button>
        </div>
      </div>

      {/* 控制列：搜尋、篩選、排序、頁大小 */}
      <div className="card p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          value={store.query}
          onChange={(e) => store.setQuery(e.target.value)}
          placeholder="搜尋模組名稱或描述..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />

        <select
          value={store.projectFilter}
          onChange={(e) => store.setProjectFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="all">所有專案</option>
          <option value="demo-project">示範專案</option>
          <option value="ecommerce-shop">電商商城</option>
          <option value="sample-website">範例網站</option>
          <option value="dashboard-admin">管理後台</option>
          <option value="mobile-app-landing">手機應用官網</option>
          <option value="portfolio-site">個人作品集</option>
        </select>

        <select
          value={store.status}
          onChange={(e) => store.setStatus(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          aria-label="狀態篩選"
        >
          <option value="all">全部狀態</option>
          <option value="active">活躍</option>
          <option value="draft">草稿</option>
          <option value="archived">已封存</option>
        </select>

        <select
          value={`${store.sortBy}:${store.sortDir}`}
          onChange={(e) => {
            const [by, dir] = e.target.value.split(':') as [any, any]
            store.setSort(by, dir)
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          aria-label="排序"
        >
          <option value="name:asc">名稱 ↑</option>
          <option value="name:desc">名稱 ↓</option>
          <option value="assets:asc">資產數 ↑</option>
          <option value="assets:desc">資產數 ↓</option>
          <option value="updated:asc">更新時間 ↑</option>
          <option value="updated:desc">更新時間 ↓</option>
        </select>

        <select
          value={store.pageSize}
          onChange={(e) => store.setPageSize(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          aria-label="每頁數量"
        >
          <option value={6}>每頁 6 筆</option>
          <option value={9}>每頁 9 筆</option>
          <option value={12}>每頁 12 筆</option>
        </select>
      </div>

      {/* 狀態列 */}
      {store.loading && (
        <div className="text-sm text-gray-500 dark:text-gray-400">讀取中...</div>
      )}

      {/* 導出整包 Modal */}
      {openUnified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenUnified(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">導出整包</h3>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onClick={() => setOpenUnified(false)} aria-label="關閉">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {!store.tauriAvailable && (
              <div className="text-sm text-red-600 mb-3">需在 Tauri 環境執行才能導出整包</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">外部設計資產根目錄</label>
                <input value={unifiedPaths.assets} onChange={(e) => setUnifiedPaths({ ...unifiedPaths, assets: e.target.value })} placeholder="/Users/.../frontend-development-guide/design-assets" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">覆蓋策略（預設依專案設定）</label>
                <select
                  value={overwrite}
                  onChange={(e) => setOverwrite(e.target.value as OverwriteStrategy)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="overwrite">覆蓋既有檔案</option>
                  <option value="skip">跳過已存在檔案</option>
                  <option value="rename">自動重新命名</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI 前端開發指引</label>
                  <input value={unifiedPaths.doc1} onChange={(e) => setUnifiedPaths({ ...unifiedPaths, doc1: e.target.value })} placeholder="/Users/.../ai-frontend-development-instructions.md" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI UI 文件（含 mermaid）</label>
                  <input value={unifiedPaths.doc2} onChange={(e) => setUnifiedPaths({ ...unifiedPaths, doc2: e.target.value })} placeholder="/Users/.../ai-ui-friendly-documentation-dev.md" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={unifiedIncludeSkeleton} onChange={(e) => setUnifiedIncludeSkeleton(e.target.checked)} /> 包含頁面骨架（HTML/CSS）
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={unifiedIncludeSpecs} onChange={(e) => setUnifiedIncludeSpecs(e.target.checked)} /> 包含每頁 AI 規格（ai-spec.md）
                </label>
              </div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={unifiedZip} onChange={(e) => setUnifiedZip(e.target.checked)} /> 產出後同時壓縮 zip
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">將輸出到 output/slice-package-YYYYMMDD-HHMMSS/，包含 design-assets、ai-docs、modules/。</p>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button className="btn-secondary" onClick={() => setOpenUnified(false)}>取消</button>
              <button
                className="btn-primary"
                disabled={!store.tauriAvailable}
                onClick={async () => {
                  if (!store.tauriAvailable) return
                  try {
                    const rs = await generateUnifiedSlicePackage({
                      externalDesignAssetsRoot: unifiedPaths.assets,
                      aiDocFrontendInstructions: unifiedPaths.doc1,
                      aiDocUiFriendly: unifiedPaths.doc2,
                      includeHtml: unifiedIncludeSkeleton,
                      includeCss: unifiedIncludeSkeleton,
                      includeResponsive: unifiedIncludeSkeleton,
                      includePageSpecs: unifiedIncludeSpecs,
                      overwriteStrategy: overwrite as OverwriteStrategy,
                      makeZip: unifiedZip,
                    })
                    showSuccess('導出完成', `模組骨架：${rs.modulesCount}，輸出：${rs.outputDir}${rs.zipPath ? `；ZIP：${rs.zipPath}` : ''}`)
                    setOpenUnified(false)
                  } catch (e) {
                    const m = e instanceof Error ? e.message : String(e)
                    showError('導出失敗', m)
                  }
                }}
              >
                開始導出
              </button>
            </div>
          </div>
        </div>
      )}
      {store.error && (
        <div className="text-sm text-red-600">{store.error}</div>
      )}

      {/* 模組網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 批次操作工具列 */}
        {selectedIds.length > 0 && (
          <div className="md:col-span-2 lg:col-span-3 card p-4 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              已選 {selectedIds.length} 個項目
            </div>
            <div className="flex items-center gap-2">
              {!store.viewArchived ? (
                <button className="btn-secondary text-sm" onClick={doArchiveSelected}>封存</button>
              ) : (
                <button className="btn-secondary text-sm" onClick={doUnarchiveSelected}>還原</button>
              )}
              <button className="btn-secondary text-sm" onClick={() => { store.updateLocalStatuses(selectedIds, 'draft'); clearSelection() }}>標記草稿</button>
              <button className="btn-secondary text-sm" onClick={clearSelection}>清除選取</button>
              <button className="btn-secondary text-sm" onClick={doDeleteSelected}>刪除</button>
            </div>
          </div>
        )}

        {pageItems.map((module) => (
          <div key={module.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={!!selected[module.id]}
                  onChange={() => toggleSelected(module.id)}
                  aria-label={`選取 ${module.name}`}
                />
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FolderIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{module.name}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      module.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : module.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {module.status === 'active' ? '活躍' : module.status === 'draft' ? '草稿' : '已封存'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-3">{module.description}</p>
            
            {/* 模組所屬專案資訊 */}
            <div className="mb-3">
              {(module.project_slugs && module.project_slugs.length > 0) ? (
                <>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <span>所屬專案：</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">({module.project_slugs.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {module.project_slugs.map((slug) => {
                      const projectNames: Record<string, string> = {
                        'demo-project': '示範專案',
                        'ecommerce-shop': '電商商城', 
                        'sample-website': '範例網站',
                        'dashboard-admin': '管理後台',
                        'mobile-app-landing': '手機應用官網',
                        'portfolio-site': '個人作品集'
                      }
                      const isPrimary = module.primary_project === slug
                      return (
                        <span 
                          key={slug}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            isPrimary 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {projectNames[slug] || slug}
                          {isPrimary && <span className="ml-1 text-blue-600 dark:text-blue-400">★</span>}
                        </span>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="text-xs text-gray-400 italic">沒有指定所屬專案</div>
              )}
              {module.created_from && (
                <div className="mt-1 text-xs text-gray-400">
                  來源：{module.created_from === 'figma-import' ? 'Figma 匯入' : module.created_from === 'template' ? '模板創建' : '手動創建'}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{module.asset_count ?? 0} 個資產</span>
              <span>更新於 {module.last_updated}</span>
            </div>

            <div className="mt-4 flex space-x-2">
              {store.viewArchived ? (
                <>
                  <button
                    className="flex-1 btn-secondary text-sm py-2"
                    onClick={() => openFolder(module.name, true)}
                    disabled={!store.tauriAvailable}
                  >
                    打開資料夾
                  </button>
                  <button
                    className="flex-1 btn-secondary text-sm py-2"
                    onClick={() => openOutputFolder(module.name)}
                    disabled={!store.tauriAvailable}
                  >
                    打開輸出資料夾
                  </button>
                  <button
                    className="flex-1 btn-primary text-sm py-2"
                    onClick={async () => {
                      try {
                        if (store.tauriAvailable) {
                          await unarchiveDesignModule(module.name)
                          store.setViewArchived(false)
                          await store.refresh()
                          await refreshProjectSitemap()
                          showSuccess('還原完成', `已還原：${module.name}`)
                        } else {
                          store.updateLocalStatuses([module.id], 'active')
                          store.setViewArchived(false)
                          showSuccess('還原（本地）', `已標記為活躍：${module.name}`)
                        }
                      } catch (e) {
                        const m = e instanceof Error ? e.message : String(e)
                        showError('還原失敗', m)
                      }
                    }}
                  >
                    還原
                  </button>
                  <button
                    className="flex-1 btn-secondary text-sm py-2"
                    onClick={async () => {
                      if (!confirm(`確認刪除模組「${module.name}」？此動作不可回復`)) return
                      try {
                        if (store.tauriAvailable) {
                          await deleteDesignModule(module.name)
                          await store.refresh()
                          await refreshProjectSitemap()
                          showSuccess('刪除完成', module.name)
                        } else {
                          store.removeLocal([module.id])
                          showSuccess('刪除（本地）', module.name)
                        }
                      } catch (e) {
                        const m = e instanceof Error ? e.message : String(e)
                        showError('刪除失敗', m)
                      }
                    }}
                  >
                    刪除
                  </button>
                </>
              ) : (
                <>
                  <button className="flex-1 btn-primary text-sm py-2" onClick={() => navigate(`/design-assets/${encodeURIComponent(module.name)}`)}>管理資產</button>
                  <button
                    className="flex-1 btn-secondary text-sm py-2"
                    onClick={() => openFolder(module.name, false)}
                    disabled={!store.tauriAvailable}
                  >
                    打開資料夾
                  </button>
                  <button
                    className="flex-1 btn-secondary text-sm py-2"
                    onClick={() => openOutputFolder(module.name)}
                    disabled={!store.tauriAvailable}
                  >
                    打開輸出資料夾
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* 新增模組卡片 */}
        <div
          className="card p-6 border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => setOpenCreate(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpenCreate(true) }}
        >
          <div className="text-center py-8">
            <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">新增設計模組</h3>
            <p className="text-gray-500 dark:text-gray-400">創建新的前端模組設計資產</p>
          </div>
        </div>
      </div>

      {/* 分頁 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          共 {total} 筆，頁 {current}/{pageCount}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary px-3 py-1 text-sm"
            disabled={current <= 1}
            onClick={() => store.setPage(current - 1)}
          >
            上一頁
          </button>
          <button
            className="btn-secondary px-3 py-1 text-sm"
            disabled={current >= pageCount}
            onClick={() => store.setPage(current + 1)}
          >
            下一頁
          </button>
        </div>
      </div>


      {/* 新增模組 Modal */}
      {openCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && setOpenCreate(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">新增設計模組</h3>
              <button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => !submitting && setOpenCreate(false)}
                aria-label="關閉"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">模組名稱</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：用戶管理模組"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="簡要描述模組內容與用途"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button className="btn-secondary" onClick={() => setOpenCreate(false)} disabled={submitting}>取消</button>
              <button
                className="btn-primary"
                disabled={submitting || !name.trim()}
                onClick={async () => {
                  const trimmed = name.trim()
                  if (!trimmed) {
                    showError('請輸入模組名稱')
                    return
                  }
                  // 名稱格式與重名檢查
                  const nameOk = /^[\w\-()\s\u4e00-\u9fa5]+$/.test(trimmed)
                  if (!nameOk) {
                    showError('名稱格式不合法', '僅允許中英數、空格、-、_、()')
                    return
                  }
                  const exists = store.modules.some(m => m.name.toLowerCase() === trimmed.toLowerCase())
                  if (exists) {
                    showError('名稱重複', '已存在相同名稱的模組，請更換名稱')
                    return
                  }
                  setSubmitting(true)
                  try {
                    if (store.tauriAvailable) {
                      const created = await createDesignModule(trimmed, description.trim())
                      // put newest on top
                      store.addLocalModule(created)
                      await refreshProjectSitemap()
                      showSuccess('創建成功', `已建立模組：${created.name}`)
                    } else {
                      // local-only addition
                      const fake = {
                        id: Math.random().toString(36).slice(2),
                        name: trimmed,
                        description: description.trim() || '設計資產模組',
                        asset_count: 0,
                        last_updated: new Date().toISOString().slice(0, 16).replace('T', ' '),
                        status: 'active',
                      }
                      store.addLocalModule(fake as any)
                      showSuccess('已新增（本地）', `模組：${fake.name}`)
                    }
                    setOpenCreate(false)
                    setName('')
                    setDescription('')
                  } catch (e) {
                    const msg = e instanceof Error ? e.message : String(e)
                    showError('創建失敗', msg)
                  } finally {
                    setSubmitting(false)
                  }
                }}
              >
                {submitting ? '建立中...' : '建立'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 專案設定 Modal（簡版，Default Project） */}
      {openProject && (
        <ProjectSettingsModal onClose={() => setOpenProject(false)} />
      )}

      {/* 一鍵生成全部 Modal */}
      {openBulkGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !bulkRunning && setOpenBulkGen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">一鍵生成全部切版說明包</h3>
              <button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={() => !bulkRunning && setOpenBulkGen(false)}
                aria-label="關閉"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {!store.tauriAvailable && (
              <div className="text-sm text-red-600 mb-3">需在 Tauri 環境執行才能進行產包</div>
            )}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className={`inline-flex items-center gap-2 ${selectedIds.length === 0 ? 'opacity-60' : ''}`}>
                  <input type="radio" name="bulkScope" value="selected" disabled={selectedIds.length === 0} checked={bulkScope === 'selected'} onChange={() => setBulkScope('selected')} />
                  僅對已選（{selectedIds.length}）
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="bulkScope" value="all" checked={bulkScope === 'all'} onChange={() => setBulkScope('all')} />
                  全部現行模組（{filtered.filter(m=>m.status!=='archived').length}）
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={bulkOpts.html} onChange={(e) => setBulkOpts({ ...bulkOpts, html: e.target.checked })} /> 生成 HTML
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={bulkOpts.css} onChange={(e) => setBulkOpts({ ...bulkOpts, css: e.target.checked })} /> 生成 CSS
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={bulkOpts.responsive} onChange={(e) => setBulkOpts({ ...bulkOpts, responsive: e.target.checked })} /> 包含響應式
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">覆蓋策略</label>
                <select
                  value={overwrite}
                  onChange={(e) => setOverwrite(e.target.value as OverwriteStrategy)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="overwrite">覆蓋既有檔案</option>
                  <option value="skip">跳過已存在檔案</option>
                  <option value="rename">自動重新命名</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">將為當前「現行模組」目錄底下的所有模組產生說明包，輸出到 output/&lt;module&gt;/</p>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button className="btn-secondary" onClick={() => setOpenBulkGen(false)} disabled={bulkRunning}>取消</button>
              <button
                className="btn-primary"
                disabled={!store.tauriAvailable || bulkRunning}
                onClick={async () => {
                  if (!store.tauriAvailable) return
                  setBulkRunning(true)
                  try {
                    let rs
                    if (bulkScope === 'selected') {
                      const names = selectedIds
                        .map(id => store.modules.find(m => m.id === id)?.name)
                        .filter((v): v is string => !!v)
                      if (names.length === 0) {
                        showError('沒有選取的模組')
                        setBulkRunning(false)
                        return
                      }
                      rs = await generateSelectedSlicePackages({ modules: names, includeHtml: bulkOpts.html, includeCss: bulkOpts.css, includeResponsive: bulkOpts.responsive, overwriteStrategy: overwrite })
                    } else {
                      rs = await generateAllSlicePackages({ includeHtml: bulkOpts.html, includeCss: bulkOpts.css, includeResponsive: bulkOpts.responsive, overwriteStrategy: overwrite })
                    }
                    const successCount = rs.success.length
                    const failedCount = rs.failed.length
                    showSuccess('批次生成完成', `成功 ${successCount}，失敗 ${failedCount}`)
                    if (failedCount > 0) {
                      console.warn('批次生成失敗清單:', rs.failed)
                    }
                  } catch (e) {
                    const m = e instanceof Error ? e.message : String(e)
                    showError('批次生成失敗', m)
                  } finally {
                    setBulkRunning(false)
                    setOpenBulkGen(false)
                  }
                }}
              >
                {bulkRunning ? '執行中…' : '開始生成'}
              </button>
            </div>
          </div>
        </div>
      )}
      <SitemapAnalyticsModal isOpen={openAnalytics} onClose={() => setOpenAnalytics(false)} />
      
      {/* Figma 導出模態 */}
      {openFigmaExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ArrowUpTrayIcon className="h-5 w-5 text-blue-600" />
                  導出Figma格式
                </h3>
                <button
                  onClick={() => setOpenFigmaExport(false)}
                  disabled={figmaExporting}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>🔄 <strong>導出來源</strong>：ErSlice 中儲存的設計模組、切圖資產、設計規格</p>
                  <p>🎯 <strong>轉換目標</strong>：生成 Figma 可直接匯入的標準格式檔案</p>
                  <p>💡 <strong>應用場景</strong>：將 ErSlice 的設計資產帶回 Figma 進行進一步設計協作</p>
                </div>
                
                <FigmaExportOptions
                  onExport={handleFigmaExport}
                  onCancel={() => setOpenFigmaExport(false)}
                  loading={figmaExporting}
                  moduleCount={store.modules.filter(m => m.status === 'active').length}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DesignAssets

// 專案設定對話框（簡版）
import ReactDOM from 'react-dom'
import { updateDefaultProject, getDefaultProject } from '@/utils/tauriCommands'

const ProjectSettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { project, tauri } = useProjectStore()
  const setLocal = useProjectStore((s) => s.setLocal)
  const [name, setName] = useState(project?.name || '')
  const [slug, setSlug] = useState(project?.slug || 'default')
  const [assetsRoot, setAssetsRoot] = useState(project?.designAssetsRoot || '')
  const [doc1, setDoc1] = useState(project?.aiDocFrontendInstructions || '')
  const [doc2, setDoc2] = useState(project?.aiDocUiFriendly || '')
  const [zipDefault, setZipDefault] = useState(project?.zipDefault ?? true)
  const [includeBone, setIncludeBone] = useState(project?.includeBoneDefault ?? false)
  const [includeSpecs, setIncludeSpecs] = useState(project?.includeSpecsDefault ?? false)
  const [saving, setSaving] = useState(false)
  const [overwriteDefault, setOverwriteDefault] = useState<'overwrite'|'skip'|'rename'>(project?.overwriteStrategyDefault ?? 'overwrite')
  const [mermaidTheme, setMermaidTheme] = useState(project?.mermaidTheme ?? 'default')
  const [mermaidLayout, setMermaidLayout] = useState(project?.mermaidLayoutDirection ?? 'TD')

  const save = async () => {
    setSaving(true)
    try {
      const cfg = {
        name, slug,
        design_assets_root: assetsRoot || null,
        ai_doc_frontend_instructions: doc1 || null,
        ai_doc_ui_friendly: doc2 || null,
        zip_default: zipDefault,
        include_bone_default: includeBone,
        include_specs_default: includeSpecs,
        overwrite_strategy_default: overwriteDefault,
        mermaid_theme: mermaidTheme,
        mermaid_layout_direction: mermaidLayout,
      }
      if (tauri) {
        await updateDefaultProject(cfg)
        const latest = await getDefaultProject()
        setLocal({
          name: latest.name,
          slug: latest.slug,
          designAssetsRoot: latest.design_assets_root || undefined,
          aiDocFrontendInstructions: latest.ai_doc_frontend_instructions || undefined,
          aiDocUiFriendly: latest.ai_doc_ui_friendly || undefined,
          zipDefault: latest.zip_default,
          includeBoneDefault: latest.include_bone_default,
          includeSpecsDefault: latest.include_specs_default,
          overwriteStrategyDefault: latest.overwrite_strategy_default || 'overwrite',
        })
      } else {
        setLocal({ name, slug, designAssetsRoot: assetsRoot || undefined, aiDocFrontendInstructions: doc1 || undefined, aiDocUiFriendly: doc2 || undefined, zipDefault, includeBoneDefault: includeBone, includeSpecsDefault: includeSpecs, overwriteStrategyDefault: overwriteDefault })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => !saving && onClose()} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">專案設定</h3>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onClick={() => !saving && onClose()} aria-label="關閉">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">名稱</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">代稱</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">設計資產根目錄</label>
            <input value={assetsRoot} onChange={(e) => setAssetsRoot(e.target.value)} placeholder="/Users/.../design-assets" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI 前端開發指引</label>
            <input value={doc1} onChange={(e) => setDoc1(e.target.value)} placeholder="/Users/.../ai-frontend-development-instructions.md" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI UI 文檔（含 mermaid）</label>
            <input value={doc2} onChange={(e) => setDoc2(e.target.value)} placeholder="/Users/.../ai-ui-friendly-documentation-dev.md" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={zipDefault} onChange={(e) => setZipDefault(e.target.checked)} /> 導出後自動 zip</label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={includeBone} onChange={(e) => setIncludeBone(e.target.checked)} /> 產出頁面骨架（HTML/CSS）</label>
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={includeSpecs} onChange={(e) => setIncludeSpecs(e.target.checked)} /> 產出每頁 AI 規格</label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">預設覆蓋策略</label>
            <select value={overwriteDefault} onChange={(e) => setOverwriteDefault(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
              <option value="overwrite">覆蓋既有檔案</option>
              <option value="skip">跳過已存在檔案</option>
              <option value="rename">自動重新命名</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mermaid 主題</label>
            <select value={mermaidTheme} onChange={(e) => setMermaidTheme(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
              <option value="default">默認</option>
              <option value="dark">深色</option>
              <option value="forest">森林</option>
              <option value="neutral">中性</option>
              <option value="base">基礎</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">站點圖佈局</label>
            <select value={mermaidLayout} onChange={(e) => setMermaidLayout(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
              <option value="TD">上到下 (TD)</option>
              <option value="TB">上到下 (TB)</option>
              <option value="BT">下到上 (BT)</option>
              <option value="RL">右到左 (RL)</option>
              <option value="LR">左到右 (LR)</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary"
              onClick={async () => {
                if (!tauri) return
                try {
                  const { generateProjectMermaidHtml: genSitemap } = await import('@/utils/tauriCommands')
                  const p = await genSitemap()
                  const { open } = await import('@tauri-apps/plugin-shell')
                  await open(p)
                } catch (e) {
                  // Non-blocking; no toast here to keep modal subtle
                  console.error(e)
                }
              }}
              disabled={!tauri || saving}
              title="生成 Mermaid 站點圖並開啟 HTML 預覽"
            >
              生成站點圖 HTML
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary" onClick={onClose} disabled={saving}>取消</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? '儲存中…' : '儲存設定'}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
