import { AISpecFormat, AISpecType } from '@/types/aiSpec'

export type Language = 'zh-TW' | 'en-US'

export interface TemplateDefaults {
  includeHtml: boolean
  includeCss: boolean
  includeResponsive: boolean
  includeJs: boolean
}

export interface AIDefaults {
  type: AISpecType
  format: AISpecFormat
  writeToOutput: boolean
}

export interface ErSliceSettings {
  language: Language
  notifications: boolean
  templateDefaults: TemplateDefaults
  aiDefaults: AIDefaults
  // 外部來源與 AI 文件（用於導出整包）
  externalDesignAssetsRoot?: string
  aiDocFrontendInstructionsPath?: string
  aiDocUiFriendlyPath?: string
}

const STORAGE_KEY = 'erslice.settings'

export const defaultSettings: ErSliceSettings = {
  language: 'zh-TW',
  notifications: true,
  templateDefaults: {
    includeHtml: true,
    includeCss: true,
    includeResponsive: true,
    includeJs: false,
  },
  aiDefaults: {
    type: AISpecType.BASIC,
    format: AISpecFormat.MARKDOWN,
    writeToOutput: true,
  },
  externalDesignAssetsRoot: '',
  aiDocFrontendInstructionsPath: '',
  aiDocUiFriendlyPath: '',
}

export function loadSettings(): ErSliceSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings
    const parsed = JSON.parse(raw)
    return { ...defaultSettings, ...parsed }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: ErSliceSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

// 可選：在 Tauri 環境同步成 JSON 檔（失敗時靜默略過）
export async function trySyncSettingsToDisk(settings: ErSliceSettings) {
  try {
    // 動態載入避免 Web 環境報錯
    const { writeTextFile } = await import('@tauri-apps/plugin-fs')
    const { appLocalDataDir } = await import('@tauri-apps/api/path')
    const dir = await appLocalDataDir()
    const filePath = dir.endsWith('/') ? `${dir}erslice-settings.json` : `${dir}/erslice-settings.json`
    await writeTextFile(filePath, JSON.stringify(settings, null, 2))
  } catch {
    // no-op
  }
}
