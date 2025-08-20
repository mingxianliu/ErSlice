import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  HomeIcon, 
  FolderIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  Cog6ToothIcon,
  MapIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  BuildingLibraryIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

// 導航項目介面
interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  enabled?: boolean
  children?: NavItem[]
}

// 導航項目列表 - 重構後的架構
const navigation: NavItem[] = [
  {
    name: '專案中心',
    href: '/projects',
    icon: RocketLaunchIcon,
    description: '專案管理與切版包生成',
    enabled: true,
  },
  {
    name: '設計資產',
    href: '/design-assets',
    icon: FolderIcon,
    description: '設計稿和資源管理',
    enabled: true,
  },
  {
    name: '資源庫',
    href: '/library',
    icon: BuildingLibraryIcon,
    description: '模板與AI規格',
    enabled: true,
    children: [
      {
        name: '模板庫',
        href: '/library/templates',
        icon: DocumentTextIcon,
        description: 'HTML/CSS 模板庫',
        enabled: true,
      },
      {
        name: 'AI 規格庫',
        href: '/library/ai-specs',
        icon: SparklesIcon,
        description: 'AI 開發規格管理',
        enabled: true,
      }
    ]
  },
  {
    name: '儀表板',
    href: '/dashboard',
    icon: HomeIcon,
    description: '專案概覽和統計',
    enabled: true,
  },
  {
    name: '系統設定',
    href: '/settings',
    icon: Cog6ToothIcon,
    description: '應用程式設定',
    enabled: true,
  }
]

// 站點圖快速操作項目
interface SitemapAction {
  name: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  description: string
}

// ErSlice 側邊欄組件 - 主要導航選單
const Sidebar: React.FC = () => {
  const [sitemapLoading, setSitemapLoading] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    '設計資源庫': true // 預設展開設計資源庫
  })

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }))
  }

  // 站點圖快速操作
  const sitemapActions: SitemapAction[] = [
    {
      name: '專案站點圖',
      icon: MapIcon,
      description: '生成完整專案站點圖',
      action: async () => {
        setSitemapLoading(true)
        try {
          const { generateProjectMermaidHtml } = await import('../utils/tauriCommands')
          const path = await generateProjectMermaidHtml()
          const { open } = await import('@tauri-apps/plugin-shell')
          await open(path)
        } catch (error) {
          console.error('生成站點圖失敗:', error)
        } finally {
          setSitemapLoading(false)
        }
      }
    },
    {
      name: '站點圖分析',
      icon: ChartBarIcon,
      description: '檢視專案結構分析',
      action: () => {
        // Navigate to design assets page with analytics modal
        window.location.href = '/design-assets?showAnalytics=true'
      }
    },
    {
      name: '匯出站點圖',
      icon: ArrowDownTrayIcon,
      description: '匯出站點圖資料',
      action: async () => {
        setSitemapLoading(true)
        try {
          const { exportSitemap } = await import('../utils/tauriCommands')
          const filePath = await exportSitemap()
          const { open } = await import('@tauri-apps/plugin-shell')
          await open(filePath)
        } catch (error) {
          console.error('匯出站點圖失敗:', error)
        } finally {
          setSitemapLoading(false)
        }
      }
    }
  ]

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 relative">
      {/* Logo 區域 */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img
            src="/favicon.png"
            alt="App Logo"
            className="h-8 w-8 rounded"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement
              if (img.src.endsWith('/favicon.png')) { img.src = '/favicon.svg' } else { img.style.display = 'none' }
            }}
          />
          <span className="text-xl font-bold text-gray-900 dark:text-white">視覺切版工廠</span>
        </div>
      </div>

      {/* 導航選單 */}
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              {item.enabled ? (
                <div>
                  {/* 主選項 */}
                  {item.children ? (
                    // 有子選項的項目
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.description}
                        </div>
                      </div>
                      <svg
                        className={`h-4 w-4 transition-transform ${
                          expandedItems[item.name] ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    // 沒有子選項的項目
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`
                      }
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.description}
                        </div>
                      </div>
                    </NavLink>
                  )}

                  {/* 子選項 */}
                  {item.children && expandedItems[item.name] && (
                    <ul className="mt-2 ml-6 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.name}>
                          {child.enabled ? (
                            <NavLink
                              to={child.href}
                              className={({ isActive }) =>
                                `group flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'
                                }`
                              }
                            >
                              <child.icon className="mr-2 h-4 w-4" />
                              <span className="font-medium">{child.name}</span>
                            </NavLink>
                          ) : (
                            <div className="group flex items-center px-3 py-2 text-sm rounded-lg text-gray-400 dark:text-gray-500 cursor-not-allowed">
                              <child.icon className="mr-2 h-4 w-4" />
                              <span>{child.name}</span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div
                  className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-400 dark:text-gray-500 cursor-not-allowed select-none"
                  title="即將推出"
                  aria-disabled
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* 站點圖快速操作 */}
      <div className="mt-8 px-4">
        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
          站點圖工具
        </h3>
        <ul className="space-y-1">
          {sitemapActions.map((action) => (
            <li key={action.name}>
              <button
                onClick={action.action}
                disabled={sitemapLoading}
                className="w-full group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <action.icon className={`mr-3 h-4 w-4 ${sitemapLoading ? 'animate-spin' : ''}`} />
                <div className="flex-1 text-left">
                  <div className="font-medium text-xs">{action.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {action.description}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 底部資訊 */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          視覺切版工廠 v1.0
          <br />
          智能視覺設計切版系統
        </div>
      </div>
    </div>
  )
}

export default Sidebar
