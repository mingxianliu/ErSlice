
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { useToast, ToastContainer } from './components/ui/Toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ProjectHub from './pages/ProjectHub'
import DesignAssets from './pages/DesignAssets'
import TemplateGenerator from './pages/TemplateGenerator'
import AISpecGenerator from './pages/AISpecGenerator'
import FigmaExports from './pages/FigmaExports'
import DesignModuleDetail from './pages/DesignModuleDetail'
import Settings from './pages/Settings'

// ErSlice 主應用組件 - 前端切版說明包生成器
function App() {
  const { toasts, removeToast } = useToast()

  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            {/* 主頁面預設導向專案中心 */}
            <Route path="/" element={<Navigate to="/projects" replace />} />
            
            {/* 專案中心 - 新的主要工作流程入口 */}
            <Route path="/projects" element={<ProjectHub />} />
            
            {/* 設計資源庫 */}
            <Route path="/library" element={<Navigate to="/library/assets" replace />} />
            <Route path="/library/assets" element={<DesignAssets />} />
            <Route path="/library/assets/:name" element={<DesignModuleDetail />} />
            <Route path="/library/templates" element={<TemplateGenerator />} />
            <Route path="/library/ai-specs" element={<AISpecGenerator />} />
            <Route path="/library/figma-exports" element={<FigmaExports />} />
            
            {/* 其他頁面 */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* 向後相容的舊路由 */}
            <Route path="/design-assets" element={<Navigate to="/library/assets" replace />} />
            <Route path="/design-assets/:name" element={<Navigate to="/library/assets/:name" replace />} />
            <Route path="/template-generator" element={<Navigate to="/library/templates" replace />} />
            <Route path="/ai-spec-generator" element={<Navigate to="/library/ai-specs" replace />} />
          </Routes>
        </Layout>
        
        {/* Toast 通知系統 */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Router>
    </ThemeProvider>
  )
}

export default App
