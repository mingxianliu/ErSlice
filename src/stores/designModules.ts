import { create } from 'zustand'
import {
  type DesignModule,
  getDesignModules,
  getArchivedDesignModules,
  checkTauriAvailable,
} from '../utils/tauriCommands'

// Re-export DesignModule type for external use
export type { DesignModule } from '../utils/tauriCommands'

type StatusFilter = 'all' | 'active' | 'draft' | 'archived'
type SortBy = 'name' | 'assets' | 'updated'
type SortDir = 'asc' | 'desc'

interface DesignModulesState {
  // data
  modules: DesignModule[]
  loading: boolean
  error: string | null
  tauriAvailable: boolean | null

  // view state
  query: string
  status: StatusFilter
  sortBy: SortBy
  sortDir: SortDir
  page: number
  pageSize: number
  viewArchived: boolean
  projectFilter: string // 新增專案過濾

  // derived helpers (selectors can compute on demand in component)

  // actions
  init: () => Promise<void>
  refresh: () => Promise<void>
  addLocalModule: (m: DesignModule) => void
  updateLocalStatuses: (ids: string[], status: 'active' | 'draft' | 'archived') => void
  removeLocal: (ids: string[]) => void
  setViewArchived: (v: boolean) => void
  setQuery: (q: string) => void
  setStatus: (s: StatusFilter) => void
  setSort: (by: SortBy, dir?: SortDir) => void
  setPage: (p: number) => void
  setPageSize: (s: number) => void
  setProjectFilter: (p: string) => void // 新增設定專案過濾
}

const fallbackModules: DesignModule[] = [
  {
    id: '1',
    name: '用戶管理模組',
    description: '用戶註冊、登入、權限管理等功能',
    asset_count: 15,
    project_slugs: ['demo-project', 'ecommerce-shop'],
    primary_project: 'demo-project',
    created_from: 'manual',
    last_updated: '2024-08-18 10:00',
    status: 'active',
  },
  {
    id: '2',
    name: '訂單管理模組',
    description: '訂單創建、查詢、狀態管理等功能',
    asset_count: 12,
    last_updated: '2024-08-17 16:20',
    status: 'active',
    project_slugs: ['ecommerce-shop'],
    primary_project: 'ecommerce-shop',
    created_from: 'manual',
  },
  {
    id: '3',
    name: '產品管理模組',
    description: '產品目錄、庫存、分類管理等功能',
    asset_count: 8,
    last_updated: '2024-08-16 09:10',
    status: 'active',
    project_slugs: ['ecommerce-shop', 'sample-website'],
    primary_project: 'ecommerce-shop',
    created_from: 'template',
  },
  {
    id: '4',
    name: '系統設定模組',
    description: '系統配置、參數設定、日誌管理等功能',
    asset_count: 6,
    last_updated: '2024-08-15 12:00',
    status: 'draft',
    project_slugs: ['dashboard-admin'],
    primary_project: 'dashboard-admin',
    created_from: 'figma-import',
  },
]

export const useDesignModulesStore = create<DesignModulesState>((set, get) => ({
  modules: [],
  loading: false,
  error: null,
  tauriAvailable: null,

  query: '',
  status: 'all',
  sortBy: 'name',
  sortDir: 'asc',
  page: 1,
  pageSize: 9,
  viewArchived: false,
  projectFilter: 'all', // 預設顯示所有專案

  init: async () => {
    if (get().loading) return
    set({ loading: true, error: null })
    try {
      const available = await checkTauriAvailable()
      set({ tauriAvailable: available })
      if (available) {
        const { viewArchived } = get()
        const list = viewArchived ? await getArchivedDesignModules() : await getDesignModules()
        set({ modules: list })
      } else {
        set({ modules: fallbackModules })
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), modules: fallbackModules })
    } finally {
      set({ loading: false })
    }
  },

  refresh: async () => {
    const { tauriAvailable } = get()
    set({ loading: true, error: null })
    try {
      if (tauriAvailable) {
        const { viewArchived } = get()
        const list = viewArchived ? await getArchivedDesignModules() : await getDesignModules()
        set({ modules: list })
      } else {
        set({ modules: fallbackModules })
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) })
    } finally {
      set({ loading: false })
    }
  },

  addLocalModule: (m) => set((state) => ({ modules: [m, ...state.modules] })),

  updateLocalStatuses: (ids, status) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        ids.includes(m.id) ? { ...m, status } : m
      ),
    })),

  removeLocal: (ids) =>
    set((state) => ({ modules: state.modules.filter((m) => !ids.includes(m.id)) })),

  setViewArchived: (v) => set({ viewArchived: v, page: 1 }),

  setQuery: (q) => set({ query: q, page: 1 }),
  setStatus: (s) => set({ status: s, page: 1 }),
  setSort: (by, dir) => set((state) => ({
    sortBy: by,
    sortDir: dir ?? (state.sortBy === by ? (state.sortDir === 'asc' ? 'desc' : 'asc') : state.sortDir),
    page: 1,
  })),
  setPage: (p) => set({ page: p }),
  setPageSize: (s) => set({ pageSize: s, page: 1 }),
  setProjectFilter: (p) => set({ projectFilter: p, page: 1 }),
}))

// Helper selectors
export function selectFilteredSorted(state: DesignModulesState): DesignModule[] {
  const { modules, query, status, sortBy, sortDir, projectFilter } = state
  const q = query.trim().toLowerCase()

  let list = modules.filter((m) => {
    const passStatus = status === 'all' ? true : m.status === status
    const passQuery = q
      ? m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
      : true
    const passProject = projectFilter === 'all' 
      ? true 
      : m.project_slugs?.includes(projectFilter) || m.primary_project === projectFilter
    return passStatus && passQuery && passProject
  })

  list.sort((a, b) => {
    let cmp = 0
    if (sortBy === 'name') {
      cmp = a.name.localeCompare(b.name)
    } else if (sortBy === 'assets') {
      cmp = (a.asset_count ?? 0) - (b.asset_count ?? 0)
    } else if (sortBy === 'updated') {
      cmp = a.last_updated.localeCompare(b.last_updated)
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  return list
}

export function selectPaged(state: DesignModulesState, list: DesignModule[]) {
  const { page, pageSize } = state
  const total = list.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(page, pageCount)
  const start = (current - 1) * pageSize
  const end = start + pageSize
  return { pageItems: list.slice(start, end), total, pageCount, current }
}
