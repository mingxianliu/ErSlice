import React, { useEffect, useMemo, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { AISpecFormat, AISpecType } from '@/types/aiSpec'
import { defaultSettings, ErSliceSettings, loadSettings, saveSettings, trySyncSettingsToDisk } from '@/utils/settings'
import { useToast } from '@/components/ui/Toast'
import { checkTauriAvailable } from '@/utils/tauriCommands'

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const { showSuccess, showError } = useToast()
  const [settings, setSettings] = useState<ErSliceSettings>(defaultSettings)
  const [tauriAvailable, setTauriAvailable] = useState<boolean>(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
    // 檢查 Tauri 環境
    checkTauriAvailable().then(setTauriAvailable).catch(() => setTauriAvailable(false))
  }, [])

  const update = <K extends keyof ErSliceSettings>(key: K, value: ErSliceSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveAll = async () => {
    try {
      setSaving(true)
      saveSettings(settings)
      await trySyncSettingsToDisk(settings)
      showSuccess('設定已儲存')
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('儲存失敗', m)
    } finally {
      setSaving(false)
    }
  }

  const reset = async () => {
    setSettings(defaultSettings)
    // 主題回復預設（跟隨 defaultSettings 語意，以淺色為例）
    setTheme('light')
    await saveAll()
  }

  const canOpenFolders = useMemo(() => tauriAvailable, [tauriAvailable])

  const openFolder = async (relative: string) => {
    if (!canOpenFolders) return
    try {
      const { open } = await import('@tauri-apps/plugin-shell')
      await open(relative)
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e)
      showError('開啟資料夾失敗', m)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">設定</h1>
        <p className="text-gray-600 dark:text-gray-400">調整應用偏好與預設行為</p>
      </div>

      {/* 外觀與語言 */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">外觀與語言</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">主題</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="light">淺色</option>
              <option value="dark">深色</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">語言</label>
            <select
              value={settings.language}
              onChange={(e) => update('language', e.target.value as ErSliceSettings['language'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="zh-TW">繁體中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => update('notifications', e.target.checked)}
          />
          啟用系統通知
        </label>
      </div>

      {/* 模板預設 */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">模板生成預設</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.templateDefaults.includeHtml}
              onChange={(e) => update('templateDefaults', { ...settings.templateDefaults, includeHtml: e.target.checked })}
            /> 生成 HTML
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.templateDefaults.includeCss}
              onChange={(e) => update('templateDefaults', { ...settings.templateDefaults, includeCss: e.target.checked })}
            /> 生成 CSS
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.templateDefaults.includeResponsive}
              onChange={(e) => update('templateDefaults', { ...settings.templateDefaults, includeResponsive: e.target.checked })}
            /> 包含響應式
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.templateDefaults.includeJs}
              onChange={(e) => update('templateDefaults', { ...settings.templateDefaults, includeJs: e.target.checked })}
            /> 生成 JavaScript 互動
          </label>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">提示：目前後端產包 API 以 HTML/CSS/Responsive 為主，JS 互動可做為前端補強。</p>
      </div>

      {/* AI 說明預設 */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI 說明預設</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">類型</label>
            <select
              value={settings.aiDefaults.type}
              onChange={(e) => update('aiDefaults', { ...settings.aiDefaults, type: e.target.value as AISpecType })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              {Object.values(AISpecType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">輸出格式</label>
            <select
              value={settings.aiDefaults.format}
              onChange={(e) => update('aiDefaults', { ...settings.aiDefaults, format: e.target.value as AISpecFormat })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              {Object.values(AISpecFormat).map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.aiDefaults.writeToOutput}
            onChange={(e) => update('aiDefaults', { ...settings.aiDefaults, writeToOutput: e.target.checked })}
          />
          生成後寫入 output/&lt;module&gt;/ai-spec.*
        </label>
      </div>

      {/* 外部來源與 AI 文件路徑 */}
      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">外部設計資產與 AI 文件</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">外部設計資產根目錄（可選）</label>
            <input
              value={settings.externalDesignAssetsRoot ?? ''}
              onChange={(e) => update('externalDesignAssetsRoot', e.target.value)}
              placeholder="/Users/.../frontend-development-guide/design-assets"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI 前端開發指引（ai-frontend-development-instructions.md）</label>
            <input
              value={settings.aiDocFrontendInstructionsPath ?? ''}
              onChange={(e) => update('aiDocFrontendInstructionsPath', e.target.value)}
              placeholder="/Users/.../frontend-development-guide/ai-frontend-development-instructions.md"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI UI 路徑/說明（ai-ui-friendly-documentation-dev.md）</label>
            <input
              value={settings.aiDocUiFriendlyPath ?? ''}
              onChange={(e) => update('aiDocUiFriendlyPath', e.target.value)}
              placeholder="/Users/.../frontend-development-guide/ai-ui-friendly-documentation-dev.md"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 工作區（唯讀概覽） */}
      <div className="card p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">工作區</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">目前版本使用固定相對路徑：</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: '設計資產', path: 'design-assets' },
            { label: '封存資產', path: 'design-assets-archived' },
            { label: '輸出目錄', path: 'output' },
          ].map((item) => (
            <div key={item.path} className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded px-3 py-2">
              <div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.path}</div>
              </div>
              <button
                className="btn-secondary text-xs px-2 py-1"
                onClick={() => openFolder(item.path)}
                disabled={!canOpenFolders}
                title={canOpenFolders ? '使用系統開啟' : '需在 Tauri 環境使用'}
              >
                開啟
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 動作 */}
      <div className="flex items-center gap-3">
        <button className="btn-secondary" onClick={reset} disabled={saving}>還原預設</button>
        <button className="btn-primary" onClick={saveAll} disabled={saving}>{saving ? '儲存中...' : '儲存設定'}</button>
      </div>
    </div>
  )
}

export default Settings
