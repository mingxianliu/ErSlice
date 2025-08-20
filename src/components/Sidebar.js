import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { HomeIcon, FolderIcon, DocumentTextIcon, SparklesIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
// 導航項目列表
const navigation = [
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
];
// ErSlice 側邊欄組件 - 主要導航選單
const Sidebar = () => {
    return (_jsxs("div", { className: "w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700", children: [_jsx("div", { className: "h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("img", { src: "/favicon.png", alt: "App Logo", className: "h-8 w-8 rounded", onError: (e) => {
                                const img = e.currentTarget;
                                if (img.src.endsWith('/favicon.png')) {
                                    img.src = '/favicon.svg';
                                }
                                else {
                                    img.style.display = 'none';
                                }
                            } }), _jsx("span", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "ErSlice" })] }) }), _jsx("nav", { className: "mt-6 px-4", children: _jsx("ul", { className: "space-y-2", children: navigation.map((item) => (_jsx("li", { children: item.enabled ? (_jsxs(NavLink, { to: item.href, className: ({ isActive }) => `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`, children: [_jsx(item.icon, { className: "mr-3 h-5 w-5" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: item.name }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: item.description })] })] })) : (_jsxs("div", { className: "group flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-400 dark:text-gray-500 cursor-not-allowed select-none", title: "\u5373\u5C07\u63A8\u51FA", "aria-disabled": true, children: [_jsx(item.icon, { className: "mr-3 h-5 w-5" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: item.name }), _jsx("div", { className: "text-xs text-gray-400 dark:text-gray-500", children: item.description })] })] })) }, item.name))) }) }), _jsx("div", { className: "absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400 text-center", children: ["ErSlice v1.0", _jsx("br", {}), "\u524D\u7AEF\u5207\u7248\u8AAA\u660E\u5305\u751F\u6210\u5668"] }) })] }));
};
export default Sidebar;
