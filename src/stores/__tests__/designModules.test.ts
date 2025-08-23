import { describe, it, expect } from 'vitest'
import { selectFilteredSorted, selectPaged } from '@/stores/designModules'
import { type DesignModule } from '@/utils/tauriCommands'

// helper to build a fake state accepted by the selectors
function makeState(partial: Partial<Record<string, unknown>> = {}, modules: DesignModule[] = []) {
  return {
    modules,
    loading: false,
    error: null,
    tauriAvailable: null,
    query: '',
    status: 'all' as const,
    sortBy: 'name',
    sortDir: 'asc',
    page: 1,
    pageSize: 9,
    viewArchived: false,
    projectFilter: 'all',
    // Mock required functions
    init: async () => {},
    refresh: async () => {},
    addLocalModule: () => {},
    updateLocalStatuses: () => {},
    removeLocal: () => {},
    setViewArchived: () => {},
    setQuery: () => {},
    setStatus: () => {},
    setSort: () => {},
    setPage: () => {},
    setPageSize: () => {},
    setProjectFilter: () => {},
    ...partial,
  }
}

const sample: DesignModule[] = [
  { id: '1', name: '用戶管理模組', description: '用戶註冊登入', asset_count: 15, last_updated: '2024-08-18 10:00', status: 'active' },
  { id: '2', name: '訂單管理模組', description: '訂單查詢', asset_count: 12, last_updated: '2024-08-17 16:20', status: 'active' },
  { id: '3', name: '產品管理模組', description: '產品目錄', asset_count: 8, last_updated: '2024-08-16 09:10', status: 'active' },
  { id: '4', name: '系統設定模組', description: '系統配置', asset_count: 6, last_updated: '2024-08-15 12:00', status: 'draft' },
  { id: '5', name: '舊版模組', description: '封存範例', asset_count: 1, last_updated: '2024-08-01 09:00', status: 'archived' },
]

describe('designModules selectors', () => {
  it('filters by status', () => {
    const all = selectFilteredSorted(makeState({}, sample))
    expect(all).toHaveLength(5)

    const active = selectFilteredSorted(makeState({ status: 'active' }, sample))
    expect(active.every((m) => m.status === 'active')).toBe(true)

    const archived = selectFilteredSorted(makeState({ status: 'archived' }, sample))
    expect(archived).toHaveLength(1)
    expect(archived[0].status).toBe('archived')
  })

  it('filters by query (name or description)', () => {
    const q1 = selectFilteredSorted(makeState({ query: '用戶' }, sample))
    expect(q1.map((m) => m.name)).toContain('用戶管理模組')

    const q2 = selectFilteredSorted(makeState({ query: '查詢' }, sample))
    expect(q2.map((m) => m.name)).toContain('訂單管理模組')
  })

  it('sorts by assets and updated time', () => {
    const byAssetsDesc = selectFilteredSorted(makeState({ sortBy: 'assets', sortDir: 'desc' }, sample))
    expect(byAssetsDesc[0].asset_count).toBe(15)
    expect(byAssetsDesc.at(-1)?.asset_count).toBe(1)

    const byUpdatedAsc = selectFilteredSorted(makeState({ sortBy: 'updated', sortDir: 'asc' }, sample))
    expect(byUpdatedAsc[0].last_updated <= byUpdatedAsc.at(-1)!.last_updated).toBe(true)
  })

  it('paginates correctly', () => {
    const list = selectFilteredSorted(makeState({}, sample))
    const { pageItems, total, pageCount, current } = selectPaged(makeState({ page: 2, pageSize: 2 }, list), list)
    expect(total).toBe(5)
    expect(pageCount).toBe(3)
    expect(current).toBe(2)
    expect(pageItems).toHaveLength(2)
  })
})

