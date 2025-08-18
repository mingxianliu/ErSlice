
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { useToast, ToastContainer } from './components/ui/Toast'
import Layout from './components/Layout'
import DesignAssets from './pages/DesignAssets'
import TemplateGenerator from './pages/TemplateGenerator'
import AISpecGenerator from './pages/AISpecGenerator'
import DesignModuleDetail from './pages/DesignModuleDetail'
import Settings from './pages/Settings'
import Projects from './pages/Projects'

// ErSlice 主應用組件 - 前端切版說明包生成器
function App() {
  const { toasts, removeToast } = useToast()

  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            {/* 主頁面預設導向設計資產 */}
            <Route path="/" element={<Navigate to="/design-assets" replace />} />
            <Route path="/design-assets" element={<DesignAssets />} />
            <Route path="/design-assets/:name" element={<DesignModuleDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/template-generator" element={<TemplateGenerator />} />
            <Route path="/ai-spec-generator" element={<AISpecGenerator />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        
        {/* Toast 通知系統 */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Router>
    </ThemeProvider>
  )
}

export default App
