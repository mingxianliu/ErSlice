import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

// 佈局組件介面
interface LayoutProps {
  children: React.ReactNode
}

// ErSlice 主要佈局組件 - 包含側邊欄和主要內容區域
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 側邊導航欄 */}
      <Sidebar />
      
      {/* 主要內容區域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 頂部導航欄 */}
        <Header />
        
        {/* 主要內容 */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
