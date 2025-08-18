import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DesignAssets from './pages/DesignAssets'
import TemplateGenerator from './pages/TemplateGenerator'
import AISpecGenerator from './pages/AISpecGenerator'

// ErSlice 主應用組件 - 前端切版說明包生成器
function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            {/* 主頁面路由 */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/design-assets" element={<DesignAssets />} />
            <Route path="/template-generator" element={<TemplateGenerator />} />
            <Route path="/ai-spec-generator" element={<AISpecGenerator />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
