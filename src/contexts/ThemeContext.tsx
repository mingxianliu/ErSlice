import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// 主題類型定義
type Theme = 'light' | 'dark'

// 主題上下文介面
interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

// 創建主題上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// 主題提供者組件
interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 從 localStorage 讀取主題設定，預設為淺色主題
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('erslice-theme') as Theme
    return savedTheme || 'light'
  })

  // 切換主題
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setThemeState(newTheme)
  }

  // 設定特定主題
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  // 當主題變更時，更新 localStorage 和 document 屬性
  useEffect(() => {
    localStorage.setItem('erslice-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// 使用主題的 Hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
