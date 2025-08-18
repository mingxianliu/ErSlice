import React, { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/Toast'
import { useProjectStore } from '@/stores/project'
import { Link } from 'react-router-dom'
import { listProjects, createProject, deleteProject, switchProject } from '@/utils/tauriCommands'

const Projects: React.FC = () => {
  const { showError, showSuccess } = useToast()
  const { tauri, init } = useProjectStore()
  const project = useProjectStore((s) => s.project)
  const [items, setItems] = useState<Array<{ slug: string; name: string }>>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">專案管理</h1>
          <p className="text-gray-600 dark:text-gray-400">建立、刪除與切換專案</p>
        </div>
        <Link to="/design-assets" className="btn-secondary">返回設計資產</Link>
      </div>

      {!tauri && (
        <div className="text-sm text-red-600">需要在 Tauri 環境管理專案</div>
      )}

      <div className="card p-6 space-y-4">
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

      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">專案列表</h2>
          <button className="btn-secondary" onClick={refresh} disabled={!tauri || loading}>重新整理</button>
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
    </div>
  )
}

export default Projects
