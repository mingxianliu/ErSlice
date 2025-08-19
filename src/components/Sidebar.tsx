import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  HomeIcon, 
  FolderIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

// 導航項目介面
interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  enabled?: boolean
}

// 導航項目列表
const navigation: NavItem[] = [
  {
    name: '儀表板',
    href: '/',
    icon: HomeIcon,
    description: '專案概覽和統計',
    enabled: false,
  },
  {
    name: '設計資產',
    href: '/design-assets',
    icon: FolderIcon,
    description: '管理設計稿和資源',
    enabled: true,
  },
  {
    name: '專案管理',
    href: '/projects',
    icon: Cog6ToothIcon,
    description: '建立與切換專案',
    enabled: true,
  },
  {
    name: '模板生成器',
    href: '/template-generator',
    icon: DocumentTextIcon,
    description: '生成 HTML/CSS 模板',
    enabled: false,
  },
  {
    name: 'AI 規格生成',
    href: '/ai-spec-generator',
    icon: SparklesIcon,
    description: '生成 AI 切版說明',
    enabled: false,
  },
  {
    name: '設定',
    href: '/settings',
    icon: Cog6ToothIcon,
    description: '系統設定和偏好',
    enabled: true,
  }
]

// ErSlice 側邊欄組件 - 主要導航選單
const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo 區域 */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img src="/favicon.svg" alt="App Logo" className="h-8 w-8 rounded" onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none'}} />
          <span className="text-xl font-bold text-gray-900 dark:text-white">ErSlice</span>
        </div>
      </div>

      {/* 導航選單 */}
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              {item.enabled ? (
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

      {/* 底部資訊 */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          ErSlice v1.0
          <br />
          前端切版說明包生成器
        </div>
      </div>
    </div>
  )
}

export default Sidebar
