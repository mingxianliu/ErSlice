import React, { useEffect, useState } from 'react'
import { useProjectStore } from '../stores/project'
import { useToast } from '../components/ui/Toast'
import { createProject, deleteProject, switchProject, listProjects, getDefaultProject } from '../utils/tauriCommands'
import { ArrowPathIcon, XMarkIcon, FolderIcon, ArchiveBoxIcon, PaintBrushIcon } from '@heroicons/react/24/outline'
import { Button } from '../components/ui/Button'
import { useDesignModulesStore } from '@/stores/designModules'

const Projects: React.FC = () => {
  const { showError, showSuccess } = useToast()
  const { tauri, init } = useProjectStore()
  const project = useProjectStore((s) => s.project)
  const store = useDesignModulesStore()
  const [items, setItems] = useState<Array<{ slug: string; name: string }>>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [openProjectSettings, setOpenProjectSettings] = useState(false)
  const [openAnalytics, setOpenAnalytics] = useState(false)
  const [openUnified, setOpenUnified] = useState(false)

  const refresh = async () => {
    if (!tauri) return
    setLoading(true)
    try {
      const list = await listProjects()
      setItems(list)
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('讀取專案失敗', m)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [tauri])

  const toSlug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">專案中心</h1>
          <p className="text-gray-600 dark:text-gray-400">建立、管理專案與專案級工具</p>
        </div>
        
        {/* 右上角快速按鈕 */}
        <div className="flex gap-3">
          <Link 
            to="/library" 
            className="bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px]"
          >
            資源庫
          </Link>
          <button 
            onClick={() => setOpenProjectSettings(true)}
            className="bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px]"
          >
            ⚙️ 專案設定
          </button>
        </div>
      </div>
      
      {/* 專案工具區塊 */}
      <div className="flex flex-col gap-4 min-w-0">
          {/* 站點圖工具區塊 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">站點圖工具</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  if (!tauri) { 
                    showError('功能限制', '此功能需要在 Tauri 桌面應用中執行，瀏覽器版本不支援檔案操作')
                    return 
                  }
                  try {
                    const path = await generateProjectMermaidHtml()
                    const { open } = await import('@tauri-apps/plugin-shell')
                    await open(path)
                    showSuccess('專案站點圖已生成並開啟')
                  } catch (e) {
                    const m = e instanceof Error ? e.message : String(e)
                    showError('站點圖預覽失敗', m)
                  }
                }}
                disabled={!tauri}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  tauri ? 'btn-secondary' : 'btn-secondary opacity-50 cursor-not-allowed'
                }`}
                title={tauri ? "生成專案站點圖並開啟 HTML 預覽" : "此功能需要 Tauri 桌面版本"}
              >
                HTML 預覽
              </button>
              <button
                onClick={async () => {
                  if (!tauri) { showError('Tauri 不可用', '請在 Tauri 環境中執行'); return }
                  try {
                    const res = await generateProjectMermaid()
                    showSuccess('站點圖已生成', `模組 ${res.modules}，頁面 ${res.pages}，子頁 ${res.subpages}，輸出：${res.mmd_path}`)
                  } catch (e) {
                    const m = e instanceof Error ? e.message : String(e)
                    showError('生成站點圖失敗', m)
                  }
                }}
                className="btn-secondary px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-2"
                title="生成專案級 Mermaid 站點圖（ai-docs/project-sitemap.mmd）"
              >
                生成站點圖
              </button>
              <button
                onClick={() => setOpenAnalytics(true)}
                className="btn-secondary px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-2"
                title="查看站點圖分析報告"
              >
                📈 站點圖分析
              </button>
              <button
                onClick={async () => {
                  if (!tauri) { showError('Tauri 不可用', '請在 Tauri 環境中執行'); return }
                  try {
                    const filePath = await exportSitemap()
                    const { open } = await import('@tauri-apps/plugin-shell')
                    await open(filePath)
                    showSuccess('站點圖數據導出完成', `已導出至：${filePath}`)
                  } catch (e) {
                    const m = e instanceof Error ? e.message : String(e)
                    showError('導出站點圖失敗', m)
                  }
                }}
                className="btn-secondary px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-2"
                title="將整個專案結構導出為 JSON 檔案"
              >
                📤 導出站點圖
              </button>
              <button
                onClick={async () => {
                  if (!tauri) { showError('Tauri 不可用', '請在 Tauri 環境中執行'); return }
                  try {
                    const { open } = await import('@tauri-apps/plugin-dialog')
                    const filePath = await open({
                      title: '選擇站點圖 JSON 檔案',
                      filters: [{ name: 'JSON', extensions: ['json'] }]
                    })
                    if (filePath) {
                      const result = await importSitemap(filePath as string)
                      showSuccess('站點圖數據導入完成', result)
                    }
                  } catch (e) {
                    const m = e instanceof Error ? e.message : String(e)
                    showError('導入站點圖失敗', m)
                  }
                }}
                className="btn-secondary px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-2"
                title="從 JSON 檔案導入專案結構"
              >
                📥 導入站點圖
              </button>
            </div>
          </div>

          {/* 進階工具區塊 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">進階工具</h3>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setOpenProjectSettings(true)} 
                className="btn-secondary px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-2" 
                title="專案設定"
              >
                ⚙️ 專案設定
              </button>
              <button
                onClick={async () => {
                  if (!tauri) { showError('Tauri 不可用', '請在 Tauri 環境中執行'); return }
                  try {
                    showSuccess('開始批次生成所有模組站點圖...')
                    const modules = store.modules
                    let successCount = 0
                    let failCount = 0
                    
                    for (const module of modules) {
                      try {
                        await generateModuleMermaidHtml(module.name)
                        await generateModuleCrudMermaidHtml(module.name)
                        await generateUserWorkflowMermaidHtml(module.name)
                        successCount++
                      } catch (e) {
                        console.error(`模組 ${module.name} 站點圖生成失敗:`, e)
                        failCount++
                      }
                    }
                    
                    showSuccess(`批次生成完成：成功 ${successCount} 個，失敗 ${failCount} 個`)
                  } catch (e) {
                    const m = e instanceof Error ? e.message : String(e)
                    showError('批次生成站點圖失敗', m)
                  }
                }}
                className="btn-secondary px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-2"
                title="為所有模組批次生成站點圖和 CRUD 圖"
              >
                <ArrowPathIcon className="h-4 w-4" />
                批次生成站點圖
              </button>
              <button
                onClick={() => setOpenUnified(true)}
                className="btn-secondary px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-2"
                title="導出整包（design-assets + AI 文件 + 模組骨架）"
              >
                <ArchiveBoxIcon className="h-4 w-4" />
                導出整包
              </button>
              <button
                onClick={async () => {
                  if (!tauri) { showError('Tauri 不可用'); return }
                  try {
                    const { open } = await import('@tauri-apps/plugin-shell')
                    await open('ai-docs')
                  } catch (e) {
                    const m = e instanceof Error ? e.message : String(e)
                    showError('開啟 ai-docs 失敗', m)
                  }
                }}
                className="btn-secondary px-4 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-2"
                title="開啟 ai-docs 資料夾"
              >
                <FolderIcon className="h-4 w-4" />
                開啟 ai-docs
              </button>
              <Link to="/design-assets" className="btn-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-center flex items-center gap-2">
                <PaintBrushIcon className="h-4 w-4" />
                設計資產管理
              </Link>
            </div>
          </div>
        </div>
      </div>

      {!tauri && (
        <div className="text-sm text-red-600">需要在 Tauri 環境管理專案</div>
      )}

      {/* 專案列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">專案列表</h2>
          <Button onClick={refresh} disabled={!tauri || loading} size="sm">重新整理</Button>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">讀取中...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">尚無專案</div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.slug} className="flex items-center justify-between border rounded px-3 py-2 dark:border-gray-700">
                <div className="text-sm">
                  <span className="font-medium">{it.name}</span> <span className="text-gray-500">({it.slug})</span>
                  {project?.slug === it.slug && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded dark:bg-green-900/30 dark:text-green-200">目前使用</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary text-sm" disabled={!tauri || project?.slug === it.slug} onClick={async () => {
                    try {
                      await switchProject(it.slug)
                      await init()
                      await refresh()
                      showSuccess('已切換專案')
                    } catch (e) {
                      const m = e instanceof Error ? e.message : String(e)
                      showError('切換失敗', m)
                    }
                  }}>切換</button>
                  <button className="btn-secondary text-sm" disabled={!tauri} onClick={async () => {
                    if (!confirm(`刪除專案 ${it.slug}？`)) return
                    try {
                      await deleteProject(it.slug)
                      await init(); await refresh()
                      showSuccess('已刪除')
                    } catch (e) {
                      const m = e instanceof Error ? e.message : String(e)
                      showError('刪除失敗', m)
                    }
                  }}>刪除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold">建立專案</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="專案名稱" className="px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
          <input value={slug} onChange={(e) => setSlug(toSlug(e.target.value))} placeholder="slug (可留空自動)" className="px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
          <button className="btn-primary" disabled={!tauri || !name.trim()} onClick={async () => {
            try {
              const s = slug || toSlug(name)
              await createProject(s, name.trim())
              setName(''); setSlug('')
              await refresh()
              showSuccess('已建立專案')
            } catch (e) {
              const m = e instanceof Error ? e.message : String(e)
              showError('建立失敗', m)
            }
          }}>建立</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">專案列表</h2>
          <Button onClick={refresh} disabled={!tauri || loading} size="sm">重新整理</Button>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">讀取中...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">尚無專案</div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.slug} className="flex items-center justify-between border rounded px-3 py-2 dark:border-gray-700">
                <div className="text-sm">
                  <span className="font-medium">{it.name}</span> <span className="text-gray-500">({it.slug})</span>
                  {project?.slug === it.slug && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded dark:bg-green-900/30 dark:text-green-200">目前使用</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary text-sm" disabled={!tauri || project?.slug === it.slug} onClick={async () => {
                    try {
                      await switchProject(it.slug)
                      await init()
                      await refresh()
                      showSuccess('已切換專案')
                    } catch (e) {
                      const m = e instanceof Error ? e.message : String(e)
                      showError('切換失敗', m)
                    }
                  }}>切換</button>
                  <button className="btn-secondary text-sm" disabled={!tauri} onClick={async () => {
                    if (!confirm(`刪除專案 ${it.slug}？`)) return
                    try {
                      await deleteProject(it.slug)
                      await init(); await refresh()
                      showSuccess('已刪除')
                    } catch (e) {
                      const m = e instanceof Error ? e.message : String(e)
                      showError('刪除失敗', m)
                    }
                  }}>刪除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 專案設定模態框 */}
      {openProjectSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">專案設定</h3>
              <button
                onClick={() => setOpenProjectSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  專案名稱
                </label>
                <input
                  type="text"
                  value={project?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="專案名稱"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  專案識別碼
                </label>
                <input
                  type="text"
                  value={project?.slug || ''}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                  placeholder="專案識別碼"
                  readOnly
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setOpenProjectSettings(false)}
                  className="flex-1 btn-secondary"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects
