import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useProjectStore } from '@/stores/project';
import { generateProjectMermaidHtml } from '@/utils/tauriCommands';
// ErSlice 頂部導航欄組件 - 包含主題切換和用戶功能
const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const project = useProjectStore((s) => s.project);
    const tauri = useProjectStore((s) => s.tauri);
    const initProject = useProjectStore((s) => s.init);
    useEffect(() => {
        initProject().catch(() => { });
    }, [initProject]);
    return (_jsxs("header", { className: "h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "\u524D\u7AEF\u5207\u7248\u8AAA\u660E\u5305\u751F\u6210\u5668" }), project && (_jsxs("div", { className: "text-xs text-gray-600 dark:text-gray-300", children: ["\u5C08\u6848\uFF1A", _jsx("span", { className: "font-medium", children: project.name }), " ", _jsxs("span", { className: "text-gray-400", children: ["(", project.slug, ")"] })] }))] }), _jsx("div", { className: "px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full", children: "ErSlice v1.0" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [project && (_jsx("div", { className: "px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-200", title: "\u5C08\u6848\u5207\u63DB\u5373\u5C07\u63A8\u51FA", children: project.name })), _jsx("button", { onClick: async () => {
                            if (!tauri)
                                return;
                            try {
                                const path = await generateProjectMermaidHtml();
                                const { open } = await import('@tauri-apps/plugin-shell');
                                await open(path);
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }, disabled: !tauri, className: "px-3 py-1.5 text-xs rounded bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800/50 disabled:opacity-50", title: tauri ? '生成並預覽站點圖 HTML（ai-docs/project-sitemap.html）' : '需在 Tauri 環境使用', children: "\u7AD9\u9EDE\u5716 HTML \u9810\u89BD" }), _jsx("button", { onClick: toggleTheme, className: "p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", title: theme === 'light' ? '切換到深色主題' : '切換到淺色主題', children: theme === 'light' ? (_jsx(MoonIcon, { className: "h-5 w-5" })) : (_jsx(SunIcon, { className: "h-5 w-5" })) }), _jsxs("button", { className: "p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative", children: [_jsx(BellIcon, { className: "h-5 w-5" }), _jsx("span", { className: "absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" })] }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs("button", { className: "flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", children: [_jsx(UserCircleIcon, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm font-medium", children: "\u958B\u767C\u8005" })] }) })] })] }));
};
export default Header;
