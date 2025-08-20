import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { useToast, ToastContainer } from './components/ui/Toast';
import Layout from './components/Layout';
import DesignAssets from './pages/DesignAssets';
import TemplateGenerator from './pages/TemplateGenerator';
import AISpecGenerator from './pages/AISpecGenerator';
import DesignModuleDetail from './pages/DesignModuleDetail';
import Settings from './pages/Settings';
import Projects from './pages/Projects';
// ErSlice 主應用組件 - 前端切版說明包生成器
function App() {
    const { toasts, removeToast } = useToast();
    return (_jsx(ThemeProvider, { children: _jsxs(Router, { children: [_jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/design-assets", replace: true }) }), _jsx(Route, { path: "/design-assets", element: _jsx(DesignAssets, {}) }), _jsx(Route, { path: "/design-assets/:name", element: _jsx(DesignModuleDetail, {}) }), _jsx(Route, { path: "/projects", element: _jsx(Projects, {}) }), _jsx(Route, { path: "/template-generator", element: _jsx(TemplateGenerator, {}) }), _jsx(Route, { path: "/ai-spec-generator", element: _jsx(AISpecGenerator, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) })] }) }), _jsx(ToastContainer, { toasts: toasts, onRemove: removeToast })] }) }));
}
export default App;
