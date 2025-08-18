import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, DocumentArrowDownIcon, ArrowPathIcon, CloudArrowUpIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useDesignModulesStore } from '../stores/designModules'
import { generateSlicePackage, uploadDesignAsset, listAssets, deleteDesignAsset, getModuleTree, createModulePage, deleteModulePage, renameModulePage, createSubpage, deleteSubpage, renameSubpage, setPageOrder, setSubpageOrder, applyCrudSubpages, type PageNode } from '../utils/tauriCommands'
import { useToast } from '../components/ui/Toast'
import { convertFileSrc } from '@tauri-apps/api/core'

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
  const [tree, setTree] = useState<PageNode[]>([])
  const [newPageSlug, setNewPageSlug] = useState('')
  const [pageLoading, setPageLoading] = useState(false)
  const [renaming, setRenaming] = useState<{ slug: string; to: string } | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [newSubSlug, setNewSubSlug] = useState<Record<string, string>>({})
  const [drag, setDrag] = useState<{ kind: 'page' | 'sub'; parent?: string; slug: string } | null>(null)

  const reorder = <T,>(arr: T[], from: number, to: number): T[] => {
    const a = arr.slice()
    const [item] = a.splice(from, 1)
    a.splice(to, 0, item)
    return a
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

  // 頁面樹渲染（避免深層巢狀三元造成 JSX 解析問題）
  const renderPageSection = () => {
    if (pageLoading) return <div className="text-sm text-gray-500 dark:text-gray-400">讀取中...</div>
    if (tree.length === 0) return <div className="text-sm text-gray-500 dark:text-gray-400">尚無頁面，先新增一個吧</div>
    return (
          <div className="space-y-3">
            {tree.map((p, idx) => (
              <div
                key={p.slug}
                className="border border-gray-200 dark:border-gray-700 rounded"
                draggable
                onDragStart={() => setDrag({ kind: 'page', slug: p.slug })}
                onDragOver={(e) => e.preventDefault()}
                onDrop={async () => {
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
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <button
                      className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700"
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
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                    />
                    <button className="btn-primary text-sm" onClick={async () => {
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
                    }}>確定</button>
                    <button className="btn-secondary text-sm" onClick={() => setRenaming(null)}>取消</button>
                  </>
                ) : (
                  <>
                    <button className="btn-secondary text-sm" onClick={() => setRenaming({ slug: p.slug, to: p.slug })}>重新命名</button>
                    <button className="btn-secondary text-sm" onClick={async () => {
                      if (!confirm(`刪除頁面 ${p.slug}？`)) return
                      try {
                        await deleteModulePage(moduleName, p.slug)
                        await refreshPages()
                        showSuccess('已刪除')
                      } catch (e) {
                        const m = e instanceof Error ? e.message : String(e)
                        showError('刪除失敗', m)
                      }
                    }}>刪除</button>
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
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                  />
                  <button className="btn-primary text-sm" onClick={async () => {
                    const slug = (newSubSlug[p.slug] || '').trim()
                    if (!slug) return
                    const list = slug.split(',').map(s => s.trim()).filter(Boolean)
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
                  }}>新增子頁</button>
                  <button className="btn-secondary text-sm" onClick={async () => {
                    try {
                      const created = await applyCrudSubpages(moduleName, p.slug)
                      await refreshPages()
                      showSuccess(`已套用 CRUD（新增 ${created.length} 個子頁）`)
                    } catch (e) {
                      const m = e instanceof Error ? e.message : String(e)
                      showError('套用 CRUD 失敗', m)
                    }
                  }}>套用 CRUD 子頁</button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">可用逗號分隔批次新增，例如：list,edit,review</div>
                    <div className="space-y-1">
                      {p.children.length === 0 ? (
                        <div className="text-xs text-gray-500 dark:text-gray-400">尚無子頁</div>
                      ) : (
                        p.children.map((c, cidx) => (
                          <div
                            key={c.slug}
                            className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded px-3 py-1.5"
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
                        <div className="text-sm text-gray-800 dark:text-gray-200">{c.slug} <span className="text-gray-500">({c.path})</span></div>
                        <div className="flex items-center gap-2">
                          {renaming?.slug === `${p.slug}/${c.slug}` ? (
                            <>
                              <input
                                value={renaming.to}
                                onChange={(e) => setRenaming({ slug: `${p.slug}/${c.slug}`, to: e.target.value })}
                                className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                              />
                              <button className="btn-primary text-sm" onClick={async () => {
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
                              <button className="btn-secondary text-sm" onClick={() => setRenaming(null)}>取消</button>
                            </>
                          ) : (
                            <>
                              <button className="btn-secondary text-sm" onClick={() => setRenaming({ slug: `${p.slug}/${c.slug}`, to: c.slug })}>重新命名</button>
                              <button className="btn-secondary text-sm" onClick={async () => {
                                if (!confirm(`刪除子頁 ${c.slug}？`)) return
                                try {
                                  await deleteSubpage(moduleName, p.slug, c.slug)
                                  await refreshPages()
                                  showSuccess('已刪除')
                                } catch (e) {
                                  const m = e instanceof Error ? e.message : String(e)
                                  showError('刪除失敗', m)
                                }
                              }}>刪除</button>
                            </>
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
          <Link to="/design-assets" className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeftIcon className="h-5 w-5" /> 返回
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{moduleName}</h1>
            <p className="text-gray-600 dark:text-gray-400">模組詳情與資產管理</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary"
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
          >
            {store.viewArchived ? '打開封存資料夾' : '打開模組資料夾'}
          </button>
          <button className="btn-secondary" onClick={doArchiveModule} disabled={!store.tauriAvailable}>封存模組</button>
          <button
            className="btn-secondary"
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
          </button>
          <button className="btn-secondary" onClick={doDeleteModule} disabled={!store.tauriAvailable}>刪除模組</button>
        </div>
      </div>

      {/* 頁面管理（Phase 2：一層子頁） */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">頁面</h2>
          <div className="flex items-center gap-2">
            <input
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(e.target.value)}
              placeholder="new-page-slug"
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white text-sm"
            />
            <button
              className="btn-primary text-sm"
              disabled={!store.tauriAvailable || !newPageSlug.trim()}
              onClick={async () => {
                const list = newPageSlug.split(',').map(s => s.trim()).filter(Boolean)
                if (list.length === 0) return
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
                }
              }}
            >
              新增頁面
            </button>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">可用逗號分隔批次新增，例如：list,detail,create</div>
        </div>
        {renderPageSection()}
      </div>

      {/* 產生切版說明包 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">一鍵產生切版說明包</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={genOptions.html} onChange={(e) => setGenOptions({ ...genOptions, html: e.target.checked })} />
            生成 HTML
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={genOptions.css} onChange={(e) => setGenOptions({ ...genOptions, css: e.target.checked })} />
            生成 CSS
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={genOptions.responsive} onChange={(e) => setGenOptions({ ...genOptions, responsive: e.target.checked })} />
            包含響應式
          </label>
          <div className="flex md:justify-end gap-2">
            <button
              className="btn-secondary"
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
            <button className="btn-primary flex items-center gap-2" onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <DocumentArrowDownIcon className="h-5 w-5" />
              )}
              {generating ? '生成中...' : '生成切版說明包'}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">輸出位置：專案根目錄的 output/&lt;moduleName&gt;</p>
      </div>

      {/* 上傳資產 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">上傳資產</h2>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input type="radio" name="atype" checked={assetType === 'screenshots'} onChange={() => setAssetType('screenshots')} /> 截圖（screenshots）
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="atype" checked={assetType === 'html'} onChange={() => setAssetType('html')} /> HTML
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="atype" checked={assetType === 'css'} onChange={() => setAssetType('css')} /> CSS
            </label>
          </div>
          <button className="btn-secondary flex items-center gap-2" onClick={handleUpload} disabled={uploading}>
            <CloudArrowUpIcon className="h-5 w-5" /> {uploading ? '上傳中...' : '選擇檔案並上傳'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Tauri 環境下會開啟系統檔案選擇器。</p>
      </div>

      {/* 資產清單 */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">資產清單</h2>
          <button className="btn-secondary flex items-center gap-2" onClick={refreshAssets} disabled={!store.tauriAvailable}>
            <ArrowPathIcon className="h-5 w-5" /> 重新整理
          </button>
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
    </div>
  )
}

export default DesignModuleDetail
