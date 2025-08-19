import React, { useState } from 'react'
import type { LinkMeta, PageMetaUpdate } from '@/utils/tauriCommands'

interface Props {
  kind: 'page' | 'sub'
  parent?: string
  moduleName: string
  slug: string
  initial: Partial<{
    title: string
    status: string
    route: string
    notes: string
    domain: string
    area: string
    component: string
    action: string
    class: string
    links: LinkMeta[]
  }>
  onClose: () => void
  onSaved: (meta: PageMetaUpdate) => void
}

const MetaEditorModal: React.FC<Props> = ({ kind, initial, onClose, onSaved }) => {
  const [title, setTitle] = useState(initial.title || '')
  const [status, setStatus] = useState(initial.status || '')
  const [route, setRoute] = useState(initial.route || '')
  const [notes, setNotes] = useState(initial.notes || '')
  const [domain, setDomain] = useState(initial.domain || '')
  const [area, setArea] = useState(initial.area || '')
  const [component, setComponent] = useState(initial.component || '')
  const [action, setAction] = useState(initial.action || '')
  const [klass, setKlass] = useState(initial.class || '')
  const [links, setLinks] = useState<LinkMeta[]>(initial.links || [])
  const [saving, setSaving] = useState(false)

  const addLink = () => setLinks((prev) => [...prev, { to: '', label: '' }])
  const setLink = (i: number, k: keyof LinkMeta, v: string) => setLinks(prev => prev.map((it, idx) => idx===i ? { ...it, [k]: v } : it))
  const removeLink = (i: number) => setLinks(prev => prev.filter((_, idx) => idx!==i))
  const routeValid = route === '' || route.startsWith('/')

  const save = async () => {
    setSaving(true)
    try {
      const meta: PageMetaUpdate = { title, status, route, notes, domain, area, component, action, class: klass, links }
      onSaved(meta)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => !saving && onClose()} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">編輯 Meta（{kind === 'page' ? '頁面' : '子頁'}）</h3>
          <button className="btn-secondary" onClick={onClose} disabled={saving}>關閉</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">標題</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1">狀態（draft/ready/...）</label>
            <input value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1">路由（以 / 開頭）</label>
            <input value={route} onChange={(e)=>setRoute(e.target.value)} className={'w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white' + (routeValid ? '' : ' border-red-500')} />
          </div>
          <div>
            <label className="block text-sm mb-1">類別（pageLevel/componentLevel/decision/toolbar/form/table）</label>
            <input value={klass} onChange={(e)=>setKlass(e.target.value)} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1">Domain</label>
            <input value={domain} onChange={(e)=>setDomain(e.target.value)} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1">Area</label>
            <input value={area} onChange={(e)=>setArea(e.target.value)} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1">Component</label>
            <input value={component} onChange={(e)=>setComponent(e.target.value)} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm mb-1">Action</label>
            <input value={action} onChange={(e)=>setAction(e.target.value)} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">備註</label>
            <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm">連結（links）</label>
              <button className="btn-secondary text-sm" onClick={addLink} type="button">新增連結</button>
            </div>
            <div className="space-y-2">
              {links.map((l, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <input value={l.to} onChange={(e)=>setLink(i,'to',e.target.value)} placeholder="/orders/list 或 module_id/page_id" className="md:col-span-6 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
                  <input value={l.label || ''} onChange={(e)=>setLink(i,'label',e.target.value)} placeholder="標籤（可空）" className="md:col-span-5 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" />
                  <button className="btn-secondary" onClick={()=>removeLink(i)} type="button">刪除</button>
                </div>
              ))}
              {links.length === 0 && <div className="text-xs text-gray-500">尚無連結</div>}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>取消</button>
          <button className="btn-primary" onClick={save} disabled={saving || !routeValid}>{saving ? '儲存中…' : '儲存'}</button>
        </div>
      </div>
    </div>
  )
}

export default MetaEditorModal
