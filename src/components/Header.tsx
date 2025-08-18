import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { 
  SunIcon, 
  MoonIcon,
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { useEffect } from 'react'
import { useProjectStore } from '@/stores/project'
import { generateProjectMermaidHtml } from '@/utils/tauriCommands'

// ErSlice 頂部導航欄組件 - 包含主題切換和用戶功能
const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const project = useProjectStore((s) => s.project)
  const tauri = useProjectStore((s) => s.tauri)
  const initProject = useProjectStore((s) => s.init)

  useEffect(() => {
    initProject().catch(() => {})
  }, [initProject])

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
      {/* 左側：頁面標題 */}
      <div className="flex items-center space-x-4">
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">前端切版說明包生成器</div>
          {project && (
            <div className="text-xs text-gray-600 dark:text-gray-300">
              專案：<span className="font-medium">{project.name}</span> <span className="text-gray-400">({project.slug})</span>
            </div>
          )}
        </div>
        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
          ErSlice v1.0
        </div>
      </div>

      {/* 右側：功能按鈕和用戶選單 */}
      <div className="flex items-center space-x-4">
        {/* 專案（唯讀占位）*/}
        {project && (
          <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-200" title="專案切換即將推出">
            {project.name}
          </div>
        )}
        {/* 站點圖 HTML 預覽 */}
        <button
          onClick={async () => {
            if (!tauri) return
            try {
              const path = await generateProjectMermaidHtml()
              const { open } = await import('@tauri-apps/plugin-shell')
              await open(path)
            } catch (e) {
              console.error(e)
            }
          }}
          disabled={!tauri}
          className="px-3 py-1.5 text-xs rounded bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800/50 disabled:opacity-50"
          title={tauri ? '生成並預覽站點圖 HTML（ai-docs/project-sitemap.html）' : '需在 Tauri 環境使用'}
        >
          站點圖 HTML 預覽
        </button>
        {/* 主題切換按鈕 */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={theme === 'light' ? '切換到深色主題' : '切換到淺色主題'}
        >
          {theme === 'light' ? (
            <MoonIcon className="h-5 w-5" />
          ) : (
            <SunIcon className="h-5 w-5" />
          )}
        </button>

        {/* 通知按鈕 */}
        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
          <BellIcon className="h-5 w-5" />
          {/* 通知徽章 */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* 用戶選單 */}
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <UserCircleIcon className="h-6 w-6" />
            <span className="text-sm font-medium">開發者</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
