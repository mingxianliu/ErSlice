import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, DocumentArrowDownIcon, ArrowPathIcon, CloudArrowUpIcon, EyeIcon, TrashIcon, ChartBarIcon, MapIcon, DocumentIcon, FolderIcon, PencilIcon, CodeBracketIcon, EllipsisVerticalIcon, PlusIcon, XMarkIcon, CheckIcon, MagnifyingGlassIcon, FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useDesignModulesStore } from '../stores/designModules'
import { generateSlicePackage, uploadDesignAsset, listAssets, deleteDesignAsset, getModuleTree, createModulePage, deleteModulePage, renameModulePage, createSubpage, deleteSubpage, renameSubpage, setPageOrder, setSubpageOrder, applyCrudSubpages, updatePageMeta, updateSubpageMeta, generateModuleMermaidHtml, generateModuleCrudMermaidHtml, generatePageMermaidHtml, generateUserWorkflowMermaidHtml, type PageNode } from '../utils/tauriCommands'
import MetaEditorModal from '../components/MetaEditorModal'
import PageAssetManager from '../components/PageAssetManager'
import { useToast } from '../components/ui/Toast'
import { convertFileSrc } from '@tauri-apps/api/core'
import { Button } from '../components/ui/Button'

const DesignModuleDetail: React.FC = () => {
  const { name: routeName } = useParams()
  const moduleName = decodeURIComponent(routeName || '')
  const navigate = useNavigate()
  const store = useDesignModulesStore()
  const { showSuccess, showError } = useToast()
  const [genOptions, setGenOptions] = useState({ html: true, css: true, responsive: true })
  const [generating, setGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [assetType, setAssetType] = useState<'screenshots' | 'html' | 'css'>('screenshots')
  const [assets, setAssets] = useState<{ screenshots: string[]; html: string[]; css: string[] }>({ screenshots: [], html: [], css: [] })
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewKind, setPreviewKind] = useState<'image' | 'text' | null>(null)
  const [previewTitle, setPreviewTitle] = useState('')
  const [previewSrc, setPreviewSrc] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [screenshotView, setScreenshotView] = useState<'grid' | 'list'>('grid')
  const [selectedPageForAssets, setSelectedPageForAssets] = useState<string | null>(null)
  const [tree, setTree] = useState<PageNode[]>([])
  const [newPageSlug, setNewPageSlug] = useState('')
  const [pageLoading, setPageLoading] = useState(false)
  const [renaming, setRenaming] = useState<{ slug: string; to: string } | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [newSubSlug, setNewSubSlug] = useState<Record<string, string>>({})
  const [drag, setDrag] = useState<{ kind: 'page' | 'sub'; parent?: string; slug: string } | null>(null)
  const [metaEditor, setMetaEditor] = useState<null | { kind: 'page'|'sub'; parent?: string; slug: string; data: Partial<PageNode> }>(null)
  const [pageFilter, setPageFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<'delete' | 'status' | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [showSlicePackageModal, setShowSlicePackageModal] = useState(false)
  const [uploadModalPage, setUploadModalPage] = useState<string | null>(null)
  const [pageMenuOpen, setPageMenuOpen] = useState<string | null>(null)

  const reorder = <T,>(arr: T[], from: number, to: number): T[] => {
    const a = arr.slice()
    const [item] = a.splice(from, 1)
    a.splice(to, 0, item)
    return a
  }

  // Filter and search helpers
  const filteredTree = tree.filter(page => {
    const matchesSearch = pageFilter === '' || 
      page.slug.toLowerCase().includes(pageFilter.toLowerCase()) ||
      (page.title && page.title.toLowerCase().includes(pageFilter.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const togglePageSelection = (slug: string) => {
    setSelectedPages(prev => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  const selectAllPages = () => {
    setSelectedPages(new Set(filteredTree.map(p => p.slug)))
  }

  const clearPageSelection = () => {
    setSelectedPages(new Set())
  }

  const bulkDeletePages = async () => {
    if (selectedPages.size === 0 || !confirm(`確認刪除 ${selectedPages.size} 個頁面？`)) return
    
    let successCount = 0
    const errors: string[] = []
    
    for (const slug of selectedPages) {
      try {
        await deleteModulePage(moduleName, slug)
        successCount++
      } catch (e) {
        const m = e instanceof Error ? e.message : String(e)
        errors.push(`${slug}: ${m}`)
      }
    }
    
    setSelectedPages(new Set())
    await refreshPages()
    
    if (errors.length > 0) {
      showError(`批次刪除部分失敗`, `成功 ${successCount} 個，失敗 ${errors.length} 個`)
    } else {
      showSuccess(`批次刪除完成`, `成功刪除 ${successCount} 個頁面`)
    }
  }

  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedPages.size === 0) return
    
    let successCount = 0
    const errors: string[] = []
    
    for (const slug of selectedPages) {
      try {
        await updatePageMeta(moduleName, slug, { status: newStatus })
        successCount++
      } catch (e) {
        const m = e instanceof Error ? e.message : String(e)
        errors.push(`${slug}: ${m}`)
      }
    }
    
    setSelectedPages(new Set())
    setBulkAction(null)
    await refreshPages()
    
    if (errors.length > 0) {
      showError(`批次更新部分失敗`, `成功 ${successCount} 個，失敗 ${errors.length} 個`)
    } else {
      showSuccess(`批次更新完成`, `成功更新 ${successCount} 個頁面狀態`)
    }
  }

  // 可擴充：可用於顯示更多模組屬性

  const handleGenerate = async () => {
    if (!moduleName) return
    if (!store.tauriAvailable) {
      showError('Tauri 不可用', '請在 Tauri 環境中執行以產生說明包')
      return
    }
    setGenerating(true)
    try {
      const msg = await generateSlicePackage(moduleName, {
        includeHtml: genOptions.html,
        includeCss: genOptions.css,
        includeResponsive: genOptions.responsive,
      })
      showSuccess('產包完成', msg)
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('產包失敗', m)
    } finally {
      setGenerating(false)
    }
  }

  const handleUpload = async () => {
    if (!moduleName) return
    if (!store.tauriAvailable) {
      showError('Tauri 不可用', '請在 Tauri 環境中執行以上傳檔案')
      return
    }
    setUploading(true)
    try {
      // 動態載入對話框插件
      const { open } = await import('@tauri-apps/plugin-dialog')
      const selected = await open({ multiple: false })
      const filePath = typeof selected === 'string' ? selected : Array.isArray(selected) ? selected[0] : null
      if (!filePath) {
        setUploading(false)
        return
      }
      const res = await uploadDesignAsset(moduleName, assetType, filePath)
      showSuccess('上傳成功', res)
      await refreshAssets()
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('上傳失敗', m)
    } finally {
      setUploading(false)
    }
  }

  const refreshAssets = async () => {
    try {
      if (!store.tauriAvailable) return
      const data = await listAssets(moduleName)
      setAssets(data)
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('讀取資產失敗', m)
    }
  }

  React.useEffect(() => {
    if (store.tauriAvailable) {
      refreshAssets()
      refreshPages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.tauriAvailable, moduleName])

  const refreshPages = async () => {
    if (!store.tauriAvailable) return
    setPageLoading(true)
    try {
      const list = await getModuleTree(moduleName)
      setTree(list)
      
      // 自動更新模組站點圖
      try {
        await generateModuleMermaidHtml(moduleName)
        await generateModuleCrudMermaidHtml(moduleName)
      } catch (e) {
        // 靜默失敗，不影響主要功能
        console.warn('自動更新站點圖失敗:', e)
      }
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('讀取頁面失敗', m)
    } finally {
      setPageLoading(false)
    }
  }

  const doPreview = async (path: string) => {
    if (!store.tauriAvailable) {
      showError('Tauri 不可用', '請在 Tauri 環境中預覽檔案')
      return
    }
    try {
      const { open } = await import('@tauri-apps/plugin-shell')
      await open(path)
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('預覽失敗', m)
    }
  }

  const openImagePreview = (path: string) => {
    if (!store.tauriAvailable) return
    const src = convertFileSrc(path)
    setPreviewKind('image')
    setPreviewTitle(path.split(/[\\/]/).pop() || '圖片預覽')
    setPreviewSrc(src)
    setPreviewOpen(true)
  }

  const openTextPreview = async (path: string) => {
    if (!store.tauriAvailable) return
    setPreviewKind('text')
    setPreviewTitle(path.split(/[\\/]/).pop() || '檔案預覽')
    setPreviewLoading(true)
    setPreviewError(null)
    setPreviewOpen(true)
    try {
      const { readTextFile } = await import('@tauri-apps/plugin-fs')
      const content = await readTextFile(path)
      setPreviewSrc(content)
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      setPreviewError(m)
    } finally {
      setPreviewLoading(false)
    }
  }

  // Get unique statuses for filter dropdown
  const uniqueStatuses = [...new Set(tree.map(p => p.status).filter(Boolean))]

  // 頁面樹渲染（避免深層巢狀三元造成 JSX 解析問題）
  const renderPageSection = () => {
    if (pageLoading) return <div className="text-sm text-gray-500 dark:text-gray-400">讀取中...</div>
    if (tree.length === 0) return <div className="text-sm text-gray-500 dark:text-gray-400">尚無頁面，先新增一個吧</div>
    
    const displayTree = filteredTree
    if (displayTree.length === 0) return <div className="text-sm text-gray-500 dark:text-gray-400">沒有符合條件的頁面</div>
    
    return (
          <div className="space-y-3">
            {displayTree.map((p, idx) => (
              <div
                key={p.slug}
                className={`border rounded transition-all ${
                  dragOver === p.slug 
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : selectedPages.has(p.slug)
                    ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                draggable
                onDragStart={() => setDrag({ kind: 'page', slug: p.slug })}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(p.slug)
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={async () => {
                  setDragOver(null)
                  if (!drag || drag.kind !== 'page') return
                  const from = tree.findIndex(x => x.slug === drag.slug)
                  const to = idx
                  if (from < 0 || from === to) return
                  const next = reorder(tree, from, to)
                  setTree(next)
                  try {
                    await setPageOrder(moduleName, next.map(x => x.slug))
                  } catch (e) {
                    const m = e instanceof Error ? e.message : String(e)
                    showError('更新順序失敗', m)
                  } finally {
                    setDrag(null)
                  }
                }}
              >
                <div className="ui-tree-row ui-tree-depth-1 min-h-[60px]">
                  <div className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPages.has(p.slug)}
                      onChange={() => togglePageSelection(p.slug)}
                      aria-label={`選擇頁面 ${p.slug}`}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <button
                      className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => setExpanded((prev) => ({ ...prev, [p.slug]: !prev[p.slug] }))}
                    >{expanded[p.slug] ? '−' : '+'}</button>
                    <span className="font-medium">{p.slug}</span>
                    <span className="text-gray-500">({p.path})</span>
                    {p.status && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] text-gray-700 dark:text-gray-300">{p.status}</span>
                    )}
                    {p.route && (
                      <span className="ml-1 text-xs text-gray-500">route: {p.route}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {renaming?.slug === p.slug ? (
                  <>
                    <input
                      value={renaming.to}
                      onChange={(e) => setRenaming({ slug: p.slug, to: e.target.value })}
                      aria-label="頁面重新命名"
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                    />
                    <Button
                      variant="success"
                      size="sm"
                      onClick={async () => {
                        if (!renaming) return
                        try {
                          await renameModulePage(moduleName, renaming.slug, renaming.to)
                          setRenaming(null)
                          await refreshPages()
                          showSuccess('已重新命名')
                        } catch (e) {
                          const m = e instanceof Error ? e.message : String(e)
                          showError('重新命名失敗', m)
                        }
                      }}
                    >
                      <CheckIcon className="h-3 w-3" />
                      確定
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setRenaming(null)}
                    >
                      <XMarkIcon className="h-3 w-3" />
                      取消
                    </Button>
                    </>
                  ) : (
                    <>
                      {/* 主要操作按鈕 */}
                      <button 
                        className="group relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200" 
                        onClick={() => setMetaEditor({ kind: 'page', slug: p.slug, data: p })}
                        title="編輯頁面設定"
                      >
                        <PencilIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      </button>
                      <button 
                        className="group relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all duration-200"
                        onClick={() => setSelectedPageForAssets(p.slug)}
                        title="管理資產"
                      >
                        <FolderIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      </button>
                      
                      {/* 更多選項下拉選單 */}
                      <div className="relative">
                        <button
                          className="group relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200"
                          onClick={() => setPageMenuOpen(pageMenuOpen === p.slug ? null : p.slug)}
                          title="更多選項"
                        >
                          <EllipsisVerticalIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                        
                        {pageMenuOpen === p.slug && (
                          <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              onClick={() => {
                                setRenaming({ slug: p.slug, to: p.slug })
                                setPageMenuOpen(null)
                              }}
                            >
                              <PencilIcon className="h-3 w-3" />
                              重新命名
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              onClick={async () => {
                                setPageMenuOpen(null)
                                if (!store.tauriAvailable) { showError('Tauri 不可用'); return }
                                try {
                                  const path = await generatePageMermaidHtml(moduleName, p.slug)
                                  const { open } = await import('@tauri-apps/plugin-shell')
                                  await open(path)
                                  showSuccess('頁面站點圖已生成並開啟')
                                } catch (e) {
                                  const m = e instanceof Error ? e.message : String(e)
                                  showError('頁面站點圖生成失敗', m)
                                }
                              }}
                            >
                              <MapIcon className="h-3 w-3" />
                              生成頁面站點圖
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              onClick={async () => {
                                setPageMenuOpen(null)
                                if (!store.tauriAvailable) { showError('Tauri 不可用'); return }
                                try {
                                  const path = await generateModuleMermaidHtml(moduleName)
                                  const { open } = await import('@tauri-apps/plugin-shell')
                                  await open(path)
                                  showSuccess('模組站點圖已生成並開啟')
                                } catch (e) {
                                  const m = e instanceof Error ? e.message : String(e)
                                  showError('模組站點圖生成失敗', m)
                                }
                              }}
                            >
                              <CodeBracketIcon className="h-3 w-3" />
                              生成模組站點圖
                            </button>
                            <div className="border-t border-gray-200 dark:border-gray-700"></div>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                              onClick={async () => {
                                setPageMenuOpen(null)
                                if (!confirm(`刪除頁面 ${p.slug}？`)) return
                                try {
                                  await deleteModulePage(moduleName, p.slug)
                                  await refreshPages()
                                  showSuccess('已刪除')
                                } catch (e) {
                                  const m = e instanceof Error ? e.message : String(e)
                                  showError('刪除失敗', m)
                                }
                              }}
                            >
                              <TrashIcon className="h-3 w-3" />
                              刪除頁面
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
            </div>
            {expanded[p.slug] && (
              <div className="px-4 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    value={newSubSlug[p.slug] || ''}
                    onChange={(e) => setNewSubSlug((prev) => ({ ...prev, [p.slug]: e.target.value }))}
                    placeholder={`${p.slug}-sub`}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 focus:border-blue-300 dark:focus:border-blue-500 transition-all duration-200"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      const slug = (newSubSlug[p.slug] || '').trim()
                      if (!slug) {
                        showError('請輸入子頁名稱')
                        return
                      }
                      const list = slug.split(',').map(s => s.trim()).filter(Boolean)
                      
                      if (!store.tauriAvailable) {
                        // Fallback for non-Tauri environment
                        const newSubpages = list.map(s => ({
                          slug: s,
                          path: `${p.path}/${s}`,
                          title: s,
                          status: 'draft',
                          children: []
                        }))
                        setTree(tree.map(node => 
                          node.slug === p.slug 
                            ? { ...node, children: [...node.children, ...newSubpages] }
                            : node
                        ))
                        setNewSubSlug((prev) => ({ ...prev, [p.slug]: '' }))
                        showSuccess(`已新增 ${list.length} 個子頁（本地模式）`)
                        return
                      }
                      
                      try {
                        for (const s of list) {
                          await createSubpage(moduleName, p.slug, s)
                        }
                        setNewSubSlug((prev) => ({ ...prev, [p.slug]: '' }))
                        await refreshPages()
                        showSuccess(`已新增 ${list.length} 個子頁`)
                      } catch (e) {
                        const m = e instanceof Error ? e.message : String(e)
                        showError('新增子頁失敗', m)
                      }
                    }}
                  >
                    新增子頁
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={async () => {
                      if (!store.tauriAvailable) {
                        // Fallback for non-Tauri environment
                        const crudPages = ['list', 'create', 'edit', 'delete'].map(action => ({
                          slug: action,
                          path: `${p.path}/${action}`,
                          title: action,
                          status: 'draft',
                          children: []
                        }))
                        setTree(tree.map(node => 
                          node.slug === p.slug 
                            ? { ...node, children: [...node.children, ...crudPages] }
                            : node
                        ))
                        showSuccess(`已套用 CRUD（新增 4 個子頁）（本地模式）`)
                        return
                      }
                      
                      try {
                        const created = await applyCrudSubpages(moduleName, p.slug)
                        await refreshPages()
                        showSuccess(`已套用 CRUD（新增 ${created.length} 個子頁）`)
                      } catch (e) {
                        const m = e instanceof Error ? e.message : String(e)
                        showError('套用 CRUD 失敗', m)
                      }
                    }}
                  >
                    套用 CRUD 子頁
                  </Button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">可用逗號分隔批次新增，例如：list,edit,review</div>
                    <div className="space-y-1">
                      {p.children.length === 0 ? (
                        <div className="text-xs text-gray-500 dark:text-gray-400">尚無子頁</div>
                      ) : (
                        p.children.map((c, cidx) => (
                          <div
                            key={c.slug}
                            className="ui-tree-row ui-tree-depth-2 bg-gray-50 dark:bg-gray-800/50"
                            draggable
                            onDragStart={() => setDrag({ kind: 'sub', parent: p.slug, slug: c.slug })}
                            onDragOver={(e) => {
                              if (drag?.kind === 'sub' && drag.parent === p.slug) e.preventDefault()
                            }}
                            onDrop={async () => {
                              if (!drag || drag.kind !== 'sub' || drag.parent !== p.slug) return
                              const from = p.children.findIndex(x => x.slug === drag.slug)
                              const to = cidx
                              if (from < 0 || from === to) return
                              const next = tree.map(node => node.slug === p.slug ? ({...node, children: reorder(node.children, from, to)}) : node)
                              setTree(next)
                              try {
                                const parentSlug = p.slug
                                const order = next.find(x => x.slug === parentSlug)!.children.map(x => x.slug)
                                await setSubpageOrder(moduleName, parentSlug, order)
                              } catch (e) {
                                const m = e instanceof Error ? e.message : String(e)
                                showError('更新子頁順序失敗', m)
                              } finally {
                                setDrag(null)
                              }
                            }}
                          >
                        <div className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <span className="text-blue-500 dark:text-blue-400">└─</span>
                          <span className="font-medium">{c.slug}</span>
                          <span className="text-gray-500 text-xs">({c.path})</span>
                          {c.status && (
                            <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[10px] text-gray-700 dark:text-gray-300">{c.status}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {renaming?.slug === `${p.slug}/${c.slug}` ? (
                            <>
                              <input
                                value={renaming.to}
                                onChange={(e) => setRenaming({ slug: `${p.slug}/${c.slug}`, to: e.target.value })}
                                aria-label="子頁重新命名"
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-500 focus:border-emerald-300 dark:focus:border-emerald-500 transition-all duration-200"
                              />
                              <button className="group relative px-3 py-2 text-sm font-medium rounded-lg border border-emerald-300 dark:border-emerald-400 bg-gradient-to-r from-emerald-300 to-emerald-400 dark:from-emerald-400 dark:to-emerald-500 text-white hover:from-emerald-400 hover:to-emerald-500 dark:hover:from-emerald-500 dark:hover:to-emerald-600 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md" onClick={async () => {
                                if (!renaming) return
                                try {
                                  await renameSubpage(moduleName, p.slug, c.slug, renaming.to)
                                  setRenaming(null)
                                  await refreshPages()
                                  showSuccess('已重新命名')
                                } catch (e) {
                                  const m = e instanceof Error ? e.message : String(e)
                                  showError('重新命名失敗', m)
                                }
                              }}>確定</button>
                              <button className="group relative px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-400 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-500 dark:to-gray-600 text-gray-700 dark:text-gray-100 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-400 dark:hover:to-gray-500 hover:border-gray-400 dark:hover:border-gray-300 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md" onClick={() => setRenaming(null)}>取消</button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button 
                                className="group relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200" 
                                onClick={() => setMetaEditor({ kind: 'sub', parent: p.slug, slug: c.slug, data: c })}
                                title="編輯子頁設定"
                              >
                                <PencilIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                              </button>
                              <button 
                                className="group relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500 transition-all duration-200"
                                onClick={() => setRenaming({ slug: `${p.slug}/${c.slug}`, to: c.slug })}
                                title="重新命名"
                              >
                                <DocumentIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                              </button>
                              <button 
                                className="group relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 transition-all duration-200"
                                onClick={async () => {
                                  if (!confirm(`刪除子頁 ${c.slug}？`)) return
                                  try {
                                    await deleteSubpage(moduleName, p.slug, c.slug)
                                    await refreshPages()
                                    showSuccess('已刪除')
                                  } catch (e) {
                                    const m = e instanceof Error ? e.message : String(e)
                                    showError('刪除失敗', m)
                                  }
                                }}
                                title="刪除子頁"
                              >
                                <TrashIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // 輕量語法上色：先轉義，再進行正則標記
  const escapeHTML = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const highlightHTML = (escaped: string) => {
    // 註解
    let out = escaped.replace(/&lt;!--[\s\S]*?--&gt;/g, (m) => `<span class='text-gray-500 italic'>${m}</span>`)
    // 屬性值（字串）
    out = out.replace(/(=)(&quot;.*?&quot;|&#39;.*?&#39;)/g, (_m, eq, val) => `${eq}<span class='text-emerald-600'>${val}</span>`)
    // 屬性名
    out = out.replace(/(\s)([A-Za-z_:][\w:.-]*)(=)/g, (_m, sp, name, eq) => `${sp}<span class='text-sky-600'>${name}</span>${eq}`)
    // 標籤名
    out = out.replace(/(&lt;\/?)([A-Za-z][A-Za-z0-9:-]*)/g, (_m, lt, tag) => `${lt}<span class='text-purple-600'>${tag}</span>`)
    return out
  }

  const highlightCSS = (escaped: string) => {
    let out = escaped
    // 註解
    out = out.replace(/\/\*[\s\S]*?\*\//g, (m) => `<span class='text-gray-500 italic'>${m}</span>`)
    // 屬性名
    out = out.replace(/(^|[\n\r\{;]\s*)([a-zA-Z-]+)(\s*:\s*)/g, (_m, pre, prop, sep) => `${pre}<span class='text-amber-600'>${prop}</span>${sep}`)
    // 值（直到分號）
    out = out.replace(/:\s*([^;\n\r\}]+)(;)/g, (_m, val, semi) => `: <span class='text-blue-600'>${val}</span>${semi}`)
    return out
  }

  const getHighlighted = (raw: string, filename: string) => {
    const escaped = escapeHTML(raw)
    const lower = filename.toLowerCase()
    if (lower.endsWith('.html') || lower.endsWith('.htm')) return highlightHTML(escaped)
    if (lower.endsWith('.css')) return highlightCSS(escaped)
    return escaped // 其他類型不處理
  }

  const doDelete = async (path: string, type: 'screenshots' | 'html' | 'css') => {
    if (!store.tauriAvailable) {
      showError('Tauri 不可用')
      return
    }
    try {
      const fileName = path.split(/[\\/]/).pop() || path
      const msg = await deleteDesignAsset(moduleName, type, fileName)
      showSuccess('刪除成功', msg)
      await refreshAssets()
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('刪除失敗', m)
    }
  }

  const doArchiveModule = async () => {
    if (!store.tauriAvailable) {
      showError('Tauri 不可用')
      return
    }
    try {
      const { archiveDesignModule } = await import('../utils/tauriCommands')
      const msg = await archiveDesignModule(moduleName)
      showSuccess('封存完成', msg)
      navigate('/design-assets')
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('封存失敗', m)
    }
  }

  const doDeleteModule = async () => {
    if (!store.tauriAvailable) {
      showError('Tauri 不可用')
      return
    }
    if (!confirm(`確認刪除模組「${moduleName}」？此動作不可回復`)) return
    try {
      const { deleteDesignModule } = await import('../utils/tauriCommands')
      const msg = await deleteDesignModule(moduleName)
      showSuccess('刪除完成', msg)
      navigate('/design-assets')
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('刪除失敗', m)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/design-assets" className="group relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md">
            <ArrowLeftIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" /> 返回
          </Link>
          <div>
            <h1 className="heading-1 text-gray-900 dark:text-white">{moduleName}</h1>
            <p className="subtitle">模組詳情與資產管理</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="secondary"
            size="md"
            onClick={async () => {
              if (!store.tauriAvailable) { showError('Tauri 不可用'); return }
              try {
                const { open } = await import('@tauri-apps/plugin-shell')
                const base = store.viewArchived ? 'design-assets-archived' : 'design-assets'
                await open(`${base}/${moduleName}`)
              } catch (e) {
                const m = e instanceof Error ? e.message : String(e)
                showError('開啟資料夾失敗', m)
              }
            }}
            disabled={!store.tauriAvailable}
            leftIcon={<FolderIcon className="h-4 w-4" />}
          >
            {store.viewArchived ? '打開封存資料夾' : '打開模組資料夾'}
          </Button>
          <Button 
            variant="warning"
            size="md"
            onClick={doArchiveModule} 
            disabled={!store.tauriAvailable}
          >
            封存模組
          </Button>
          <Button
            variant="success"
            size="md"
            onClick={async () => {
              if (!store.tauriAvailable) { showError('Tauri 不可用'); return }
              try {
                const { unarchiveDesignModule } = await import('../utils/tauriCommands')
                const msg = await unarchiveDesignModule(moduleName)
                showSuccess('還原完成', msg)
                navigate('/design-assets')
              } catch (e) {
                const m = e instanceof Error ? e.message : String(e)
                showError('還原失敗', m)
              }
            }}
            disabled={!store.tauriAvailable}
          >
            還原模組
          </Button>
          <Button 
            variant="danger"
            size="md"
            onClick={doDeleteModule} 
            disabled={!store.tauriAvailable}
          >
            刪除模組
          </Button>
        </div>
      </div>

      {/* 頁面管理（Phase 2：一層子頁） */}
      <div className="card p-6">
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="heading-2 text-gray-900 dark:text-white">
              頁面 <span className="text-sm text-gray-500 font-normal">({tree.length} 個)</span>
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  if (!store.tauriAvailable) { showError('Tauri 不可用'); return }
                  try {
                    const path = await generateModuleMermaidHtml(moduleName)
                    const { open } = await import('@tauri-apps/plugin-shell')
                    await open(path)
                    showSuccess('模組站點圖已生成並開啟')
                  } catch (e) {
                    const m = e instanceof Error ? e.message : String(e)
                    showError('生成模組站點圖失敗', m)
                  }
                }}
                disabled={!store.tauriAvailable}
                title="生成並顯示模組內所有頁面的層級結構關係圖，幫助理解頁面之間的組織架構"
                leftIcon={<MapIcon className="h-4 w-4" />}
              >
                模組站點圖
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  if (!store.tauriAvailable) { showError('Tauri 不可用'); return }
                  try {
                    const path = await generateModuleCrudMermaidHtml(moduleName)
                    const { open } = await import('@tauri-apps/plugin-shell')
                    await open(path)
                    showSuccess('模組 CRUD 圖已生成並開啟')
                  } catch (e) {
                    const m = e instanceof Error ? e.message : String(e)
                    showError('生成 CRUD 圖失敗', m)
                  }
                }}
                disabled={!store.tauriAvailable}
                title="生成顯示新增(Create)、讀取(Read)、更新(Update)、刪除(Delete)操作流程的關係圖，用於理解資料操作流程"
                leftIcon={<DocumentIcon className="h-4 w-4" />}
              >
                CRUD 圖
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  if (!store.tauriAvailable) { showError('Tauri 不可用'); return }
                  try {
                    const path = await generateUserWorkflowMermaidHtml(moduleName)
                    const { open } = await import('@tauri-apps/plugin-shell')
                    await open(path)
                    showSuccess('用戶工作流程圖已生成並開啟')
                  } catch (e) {
                    const m = e instanceof Error ? e.message : String(e)
                    showError('生成工作流程圖失敗', m)
                  }
                }}
                disabled={!store.tauriAvailable}
                title="生成用戶操作流程圖，顯示從用戶角度看系統如何運作，包含用戶動作、系統回應、資料流動等流程"
                leftIcon={<ChartBarIcon className="h-4 w-4" />}
              >
                工作流程圖
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜尋頁面"
                  aria-label="搜尋頁面"
                  value={pageFilter}
                  onChange={(e) => setPageFilter(e.target.value)}
                  className="w-48 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="篩選頁面狀態"
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200 appearance-none bg-white dark:bg-gray-700"
                >
                  <option value="all">所有狀態</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-4 w-4 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedPages.size > 0 && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800/30 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">已選 {selectedPages.size} 個頁面</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="group relative px-3 py-2 text-xs font-medium rounded-lg border border-red-200 dark:border-red-600 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 text-red-700 dark:text-red-300 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800/40 dark:hover:to-red-700/40 hover:border-red-300 dark:hover:border-red-500 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    onClick={bulkDeletePages}
                  >
                    <TrashIcon className="h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                    批次刪除
                  </button>
                  <button
                    className="group relative px-3 py-2 text-xs font-medium rounded-lg border border-yellow-200 dark:border-yellow-600 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-700 dark:text-yellow-300 hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-800/40 dark:hover:to-yellow-700/40 hover:border-yellow-300 dark:hover:border-yellow-500 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    onClick={() => setBulkAction('status')}
                  >
                    <PencilIcon className="h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                    批次更新狀態
                  </button>
                  <button
                    className="group relative px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    onClick={clearPageSelection}
                  >
                    <XMarkIcon className="h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                    取消選擇
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Page Bar */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                placeholder="輸入頁面名稱，多個用逗號分隔"
                className="w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PlusIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <button
              className="group relative px-4 py-2 text-sm font-medium rounded-lg border border-blue-500 dark:border-blue-600 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newPageSlug.trim()}
              onClick={async () => {
                const list = newPageSlug.split(',').map(s => s.trim()).filter(Boolean)
                if (list.length === 0) {
                  showError('請輸入頁面名稱')
                  return
                }
                
                // 檢查頁面名稱重複
                const existingSlugs = tree.map(p => p.slug)
                const duplicateSlugs = list.filter(slug => existingSlugs.includes(slug))
                if (duplicateSlugs.length > 0) {
                  showError('頁面名稱重複', `以下頁面名稱已存在：${duplicateSlugs.join(', ')}`)
                  return
                }
                
                // 檢查頁面名稱格式
                const invalidSlugs = list.filter(slug => !/^[a-zA-Z0-9_-]+$/.test(slug))
                if (invalidSlugs.length > 0) {
                  showError('頁面名稱格式錯誤', `以下頁面名稱包含無效字符：${invalidSlugs.join(', ')}\n只允許使用字母、數字、下劃線和連字符`)
                  return
                }
                
                if (!store.tauriAvailable) {
                  // Fallback for non-Tauri environment - add to local state
                  const newPages = list.map(slug => ({
                    slug,
                    path: `${moduleName}/${slug}`,
                    title: slug,
                    status: 'draft',
                    children: []
                  }))
                  setTree([...tree, ...newPages])
                  setNewPageSlug('')
                  showSuccess(`已新增 ${list.length} 個頁面（本地模式）`)
                  return
                }
                setPageLoading(true)
                try {
                  for (const slug of list) {
                    await createModulePage(moduleName, slug)
                  }
                  setNewPageSlug('')
                  await refreshPages()
                  showSuccess(`已新增 ${list.length} 個頁面`)
                } catch (e) {
                  const m = e instanceof Error ? e.message : String(e)
                  showError('新增頁面失敗', m)
                } finally {
                  setPageLoading(false)
                }
              }}
            >
              {pageLoading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  新增中...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  新增頁面
                </>
              )}
            </button>
            {filteredTree.length > 0 && (
              <button
                className="group relative px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                onClick={selectedPages.size === filteredTree.length ? clearPageSelection : selectAllPages}
              >
                {selectedPages.size === filteredTree.length ? (
                  <>
                    <XMarkIcon className="h-4 w-4" />
                    取消全選
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    全選
                  </>
                )}
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">可用逗號分隔批次新增，例如：list,detail,create</div>
        </div>
        {renderPageSection()}
      </div>


      {/* 資產清單 */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">資產清單</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              className="group relative px-3 py-2 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/40 dark:hover:to-blue-700/40 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md" 
              onClick={() => setShowSlicePackageModal(true)}
              disabled={generating}
            >
              <DocumentArrowDownIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              生成切版說明包
            </button>
            <button
              className="group relative px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
              onClick={async () => {
                if (!store.tauriAvailable) {
                  showError('Tauri 不可用')
                  return
                }
                try {
                  const { open } = await import('@tauri-apps/plugin-shell')
                  await open(`output/${moduleName}`)
                } catch (e) {
                  const m = e instanceof Error ? e.message : String(e)
                  showError('開啟資料夾失敗', m)
                }
              }}
              disabled={!store.tauriAvailable}
            >
              打開輸出資料夾
            </button>
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshAssets}
              disabled={!store.tauriAvailable}
            >
              <ArrowPathIcon className="h-4 w-4" /> 重新整理
            </Button>
          </div>
        </div>

        {(['screenshots','html','css'] as const).map((type) => (
          <div key={type}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{type === 'screenshots' ? '截圖' : type.toUpperCase()}</h3>
              {type === 'screenshots' && (
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
              )}
            </div>
            <div className={type === 'screenshots' && screenshotView === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'}>
              {assets[type].length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">沒有檔案</div>
              )}
              {assets[type].map((p) => {
                const fileName = p.split(/[\\/]/).pop() || p
                const isImage = type === 'screenshots' && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName)
                if (type === 'screenshots' && isImage && store.tauriAvailable && screenshotView === 'grid') {
                  return (
                    <div key={p} className="group border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                      <img
                        src={convertFileSrc(p)}
                        alt={fileName}
                        className="h-36 w-full object-cover cursor-pointer"
                        onClick={() => openImagePreview(p)}
                      />
                      <div className="p-2 flex items-center justify-between">
                        <div className="truncate text-xs text-gray-600 dark:text-gray-400" title={fileName}>{fileName}</div>
                        <div className="flex items-center gap-1">
                          <button className="btn-secondary px-2 py-0.5 text-xs" onClick={() => doPreview(p)}>
                            預覽
                          </button>
                          <button className="btn-secondary px-2 py-0.5 text-xs" onClick={() => doDelete(p, type)}>
                            刪除
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={p} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium text-gray-800 dark:text-gray-200" title={fileName}>{fileName}</div>
                        <div className="truncate text-xs text-gray-500 dark:text-gray-400" title={p}>{p}</div>
                        {isImage && store.tauriAvailable && (
                          <img
                            src={convertFileSrc(p)}
                            alt={fileName}
                            className="mt-2 h-24 w-full object-cover rounded cursor-pointer"
                            onClick={() => openImagePreview(p)}
                          />
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {type !== 'screenshots' && (
                          <button className="btn-secondary px-2 py-1 text-sm" onClick={() => openTextPreview(p)} disabled={!store.tauriAvailable}>
                            <EyeIcon className="h-4 w-4 inline" /> 查看內容
                          </button>
                        )}
                        <button className="btn-secondary px-2 py-1 text-sm" onClick={() => doPreview(p)}>
                          <EyeIcon className="h-4 w-4 inline" /> 使用系統預覽
                        </button>
                        <button className="btn-secondary px-2 py-1 text-sm" onClick={() => doDelete(p, type)}>
                          <TrashIcon className="h-4 w-4 inline" /> 刪除
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 預覽 Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{previewTitle}</h3>
              <button className="btn-secondary" onClick={() => setPreviewOpen(false)}>關閉</button>
            </div>
            {previewKind === 'image' && (
              <div className="flex justify-center">
                <img src={previewSrc} alt={previewTitle} className="max-h-[70vh] object-contain" />
              </div>
            )}
            {previewKind === 'text' && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto">
                {previewLoading ? (
                  <div className="text-sm text-gray-500">讀取中...</div>
                ) : previewError ? (
                  <div className="text-sm text-red-600">{previewError}</div>
                ) : (
                  <pre className="text-xs whitespace-pre-wrap break-words text-gray-800 dark:text-gray-200"><code dangerouslySetInnerHTML={{ __html: getHighlighted(previewSrc, previewTitle) }} /></pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {metaEditor && (
        <MetaEditorModal
          kind={metaEditor.kind}
          parent={metaEditor.parent}
          moduleName={moduleName}
          slug={metaEditor.slug}
          initial={metaEditor.data}
          onClose={() => setMetaEditor(null)}
          onSaved={async (meta) => {
            try {
              if (metaEditor.kind === 'page') {
                await updatePageMeta(moduleName, metaEditor.slug, meta)
              } else {
                await updateSubpageMeta(moduleName, metaEditor.parent!, metaEditor.slug, meta)
              }
              setMetaEditor(null)
              await refreshPages()
              showSuccess('已更新 Meta')
            } catch (e) {
              const m = e instanceof Error ? e.message : String(e)
              showError('更新 Meta 失敗', m)
            }
          }}
        />
      )}

      {/* Bulk Status Update Modal */}
      {bulkAction === 'status' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setBulkAction(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              批次更新狀態 ({selectedPages.size} 個頁面)
            </h3>
            <div className="space-y-3">
              {['active', 'draft', 'archived', 'review', 'completed'].map(status => (
                <button
                  key={status}
                  className="w-full text-left px-4 py-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => bulkUpdateStatus(status)}
                >
                  {status === 'active' ? '活躍' : 
                   status === 'draft' ? '草稿' : 
                   status === 'archived' ? '已封存' : 
                   status === 'review' ? '審查中' :
                   status === 'completed' ? '已完成' : status}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn-secondary" onClick={() => setBulkAction(null)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 生成切版說明包彈窗 */}
      {showSlicePackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSlicePackageModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                生成切版說明包
              </h3>
              <button 
                onClick={() => setShowSlicePackageModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">生成選項</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={genOptions.html} 
                      onChange={(e) => setGenOptions({ ...genOptions, html: e.target.checked })} 
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">生成 HTML</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={genOptions.css} 
                      onChange={(e) => setGenOptions({ ...genOptions, css: e.target.checked })} 
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">生成 CSS</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={genOptions.responsive} 
                      onChange={(e) => setGenOptions({ ...genOptions, responsive: e.target.checked })} 
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">包含響應式</span>
                  </label>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800/50 rounded">
                <strong>輸出位置：</strong>專案根目錄的 output/{moduleName}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                className="group relative px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-500 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 text-gray-600 dark:text-gray-200 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-500 dark:hover:to-gray-600 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                onClick={() => setShowSlicePackageModal(false)}
              >
                取消
              </button>
              <button 
                className="group relative px-4 py-2 text-sm font-medium rounded-lg border border-blue-400 dark:border-blue-500 bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 text-white hover:from-blue-500 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg" 
                onClick={async () => {
                  setShowSlicePackageModal(false)
                  await handleGenerate()
                }} 
                disabled={generating}
              >
                {generating ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <DocumentArrowDownIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                )}
                {generating ? '生成中...' : '開始生成'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 頁面資產上傳模態框 */}
      {uploadModalPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setUploadModalPage(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                上傳資產到頁面: {uploadModalPage}
              </h3>
              <button 
                onClick={() => setUploadModalPage(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">選擇資產類型</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="upload-type" 
                      checked={assetType === 'screenshots'} 
                      onChange={() => setAssetType('screenshots')} 
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">截圖 (screenshots)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="upload-type" 
                      checked={assetType === 'html'} 
                      onChange={() => setAssetType('html')} 
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">HTML 檔案</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="upload-type" 
                      checked={assetType === 'css'} 
                      onChange={() => setAssetType('css')} 
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">CSS 檔案</span>
                  </label>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800/50 rounded">
                <strong>說明：</strong>點擊上傳按鈕後，系統會開啟檔案選擇器，讓您選擇要上傳的檔案。檔案會被儲存到此頁面的專屬資料夾中。
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                className="group relative px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-400 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-500 dark:to-gray-600 text-gray-700 dark:text-gray-100 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-400 dark:hover:to-gray-500 hover:border-gray-400 dark:hover:border-gray-300 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                onClick={() => setUploadModalPage(null)}
              >
                取消
              </button>
              <button 
                className="group relative px-4 py-2 text-sm font-medium rounded-lg border border-blue-300 dark:border-blue-400 bg-gradient-to-r from-blue-300 to-blue-400 dark:from-blue-400 dark:to-blue-500 text-white hover:from-blue-400 hover:to-blue-500 dark:hover:from-blue-500 dark:hover:to-blue-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg" 
                onClick={async () => {
                  await handleUpload()
                  setUploadModalPage(null)
                }} 
                disabled={uploading || !store.tauriAvailable}
              >
                {uploading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <CloudArrowUpIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                )}
                {uploading ? '上傳中...' : '選擇檔案並上傳'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 頁面資產管理模態框 */}
      {selectedPageForAssets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedPageForAssets(null)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                頁面資產管理 - {selectedPageForAssets}
              </h2>
              <button 
                onClick={() => setSelectedPageForAssets(null)}
                className="group relative p-2 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 border border-gray-200 dark:border-gray-500 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const selectedPage = tree.find(p => p.slug === selectedPageForAssets)
                if (!selectedPage) return <div>找不到頁面</div>
                
                return (
                  <PageAssetManager
                    moduleName={moduleName}
                    pageSlug={selectedPage.slug}
                    pagePath={selectedPage.path}
                  />
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DesignModuleDetail
