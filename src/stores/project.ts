import { create } from 'zustand'
import { checkTauriAvailable } from '@/utils/tauriCommands'

export interface ProjectConfig {
  name: string
  slug: string
  designAssetsRoot?: string
  aiDocFrontendInstructions?: string
  aiDocUiFriendly?: string
  zipDefault: boolean
  includeBoneDefault: boolean
  includeSpecsDefault: boolean
  overwriteStrategyDefault?: 'overwrite' | 'skip' | 'rename'
}

interface ProjectState {
  project: ProjectConfig | null
  loading: boolean
  tauri: boolean | null
  init: () => Promise<void>
  setLocal: (cfg: ProjectConfig) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: null,
  loading: false,
  tauri: null,
  init: async () => {
    set({ loading: true })
    try {
      const ok = await checkTauriAvailable()
      set({ tauri: ok })
      if (ok) {
        const { getDefaultProject } = await import('@/utils/tauriCommands')
        const cfg = await getDefaultProject()
        set({ project: {
          name: cfg.name,
          slug: cfg.slug,
          designAssetsRoot: cfg.design_assets_root || undefined,
          aiDocFrontendInstructions: cfg.ai_doc_frontend_instructions || undefined,
          aiDocUiFriendly: cfg.ai_doc_ui_friendly || undefined,
          zipDefault: cfg.zip_default,
          includeBoneDefault: cfg.include_bone_default,
          includeSpecsDefault: cfg.include_specs_default,
          overwriteStrategyDefault: cfg.overwrite_strategy_default || 'overwrite',
        } })
      } else {
        // fallback to localStorage
        const raw = localStorage.getItem('erslice.project.default')
        if (raw) {
          set({ project: JSON.parse(raw) })
        } else {
          const def: ProjectConfig = {
            name: 'Default Project', slug: 'default', zipDefault: true, includeBoneDefault: false, includeSpecsDefault: false, overwriteStrategyDefault: 'overwrite',
          }
          set({ project: def })
          localStorage.setItem('erslice.project.default', JSON.stringify(def))
        }
      }
    } finally {
      set({ loading: false })
    }
  },
  setLocal: (cfg) => {
    set({ project: cfg })
    localStorage.setItem('erslice.project.default', JSON.stringify(cfg))
  }
}))
