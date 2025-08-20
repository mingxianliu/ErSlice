import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
// 創建主題上下文
const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children }) => {
    // 從 localStorage 讀取主題設定，預設為淺色主題
    const [theme, setThemeState] = useState(() => {
        const savedTheme = localStorage.getItem('erslice-theme');
        return savedTheme || 'light';
    });
    // 切換主題
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setThemeState(newTheme);
    };
    // 設定特定主題
    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };
    // 當主題變更時，更新 localStorage 和 document 屬性
    useEffect(() => {
        localStorage.setItem('erslice-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);
    const value = {
        theme,
        toggleTheme,
        setTheme
    };
    return (_jsx(ThemeContext.Provider, { value: value, children: children }));
};
// 使用主題的 Hook
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
