import React, { useState } from 'react'
import { 
  DocumentTextIcon, 
  CogIcon, 
  DocumentDuplicateIcon,
  SparklesIcon,
  EyeIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { templates } from '../data/templates'
import { createAISpecGenerator } from '../services/aiSpecGenerator'
import { AISpecType, AISpecFormat, AISpecConfig } from '../types/aiSpec'
import { useToast } from '../components/ui/Toast'

// AI 說明類型選項
const aiSpecTypes = [
  { 
    id: AISpecType.BASIC, 
    name: '基礎說明', 
    description: '提供基礎的開發指導和實現步驟',
    icon: DocumentTextIcon,
    color: 'bg-blue-500'
  },
  { 
    id: AISpecType.INTERACTIVE, 
    name: '互動說明', 
    description: '詳細說明互動功能實現和狀態管理',
    icon: CogIcon,
    color: 'bg-green-500'
  },
  { 
    id: AISpecType.RESPONSIVE, 
    name: '響應式說明', 
    description: '詳細說明響應式設計實現和佈局策略',
    icon: EyeIcon,
    color: 'bg-purple-500'
  },
  { 
    id: AISpecType.FULL_GUIDE, 
    name: '完整指南', 
    description: '提供從設計到部署的完整開發指南',
    icon: DocumentDuplicateIcon,
    color: 'bg-orange-500'
  },
  { 
    id: AISpecType.COMPONENT_SPEC, 
    name: '組件規格', 
    description: '詳細的組件 API 規格和實現指南',
    icon: CpuChipIcon,
    color: 'bg-indigo-500'
  },
  { 
    id: AISpecType.ACCESSIBILITY, 
    name: '無障礙說明', 
    description: '詳細說明無障礙設計實現和 WCAG 指南',
    icon: ShieldCheckIcon,
    color: 'bg-teal-500'
  },
  { 
    id: AISpecType.PERFORMANCE, 
    name: '性能說明', 
    description: '詳細說明性能優化策略和監控方法',
    icon: ChartBarIcon,
    color: 'bg-pink-500'
  },
  { 
    id: AISpecType.TESTING, 
    name: '測試說明', 
    description: '詳細說明測試策略和實現方法',
    icon: BeakerIcon,
    color: 'bg-yellow-500'
  }
]

// 輸出格式選項
const outputFormats = [
  { id: AISpecFormat.MARKDOWN, name: 'Markdown', description: '結構化的 Markdown 文檔' },
  { id: AISpecFormat.HTML, name: 'HTML', description: '格式化的 HTML 文檔' },
  { id: AISpecFormat.JSON, name: 'JSON', description: '結構化數據格式' },
  { id: AISpecFormat.YAML, name: 'YAML', description: '易讀的配置格式' },
  { id: AISpecFormat.CODE_SNIPPETS, name: '代碼片段', description: '實用的代碼示例' }
]

// 最近生成的 AI 說明
const recentAISpecs = [
  {
    id: '1',
    title: '基礎數據表格 - 基礎開發說明',
    type: '基礎說明',
    template: '基礎數據表格',
    generatedAt: '2024-01-15 14:30',
    status: 'completed'
  },
  {
    id: '2',
    title: '進階表單 - 互動功能開發說明',
    type: '互動說明',
    template: '進階表單',
    generatedAt: '2024-01-15 13:45',
    status: 'completed'
  },
  {
    id: '3',
    title: '響應式佈局 - 響應式設計說明',
    type: '響應式說明',
    template: '響應式佈局',
    generatedAt: '2024-01-15 12:20',
    status: 'completed'
  }
]

const AISpecGenerator: React.FC = () => {
  const { showSuccess, showError } = useToast()
  const [selectedType, setSelectedType] = useState<AISpecType>(AISpecType.BASIC)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedFormat, setSelectedFormat] = useState<AISpecFormat>(AISpecFormat.MARKDOWN)
  const [additionalContext, setAdditionalContext] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSpec, setGeneratedSpec] = useState<any>(null)

  // 生成 AI 說明
  const handleGenerate = async () => {
    if (!selectedTemplate) {
      showError('請選擇設計模板', '請先選擇一個設計模板來生成 AI 說明')
      return
    }

    setIsGenerating(true)
    
    try {
      // 獲取選中的模板
      const template = templates.find(t => t.id === selectedTemplate)
      if (!template) {
        throw new Error('找不到選中的模板')
      }

      // 創建 AI 說明生成器
      const config: AISpecConfig = {
        includeExamples: true,
        includeCodeSnippets: true,
        includeDiagrams: true,
        includeBestPractices: true,
        includeCommonMistakes: true,
        includePerformanceTips: true,
        includeAccessibilityGuidelines: true,
        language: 'zh-TW',
        framework: 'vanilla',
        cssFramework: 'tailwind'
      }

      const generator = createAISpecGenerator(config)
      
      // 生成 AI 說明
      const spec = await generator.generateAISpec(
        selectedType,
        template,
        additionalContext
      )

      setGeneratedSpec(spec)
      showSuccess('AI 說明生成成功', `已成功生成 ${spec.title}`)
      
      // 顯示生成結果
      console.log('生成的 AI 說明:', spec)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'
      showError('生成失敗', `生成 AI 說明時發生錯誤: ${errorMessage}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // 下載生成的說明
  const handleDownload = (format: AISpecFormat) => {
    if (!generatedSpec) return

    let content = ''
    let filename = ''
    let mimeType = ''

    switch (format) {
      case AISpecFormat.MARKDOWN:
        content = generateMarkdownContent(generatedSpec)
        filename = `${generatedSpec.title}.md`
        mimeType = 'text/markdown'
        break
      case AISpecFormat.HTML:
        content = generateHTMLContent(generatedSpec)
        filename = `${generatedSpec.title}.html`
        mimeType = 'text/html'
        break
      case AISpecFormat.JSON:
        content = JSON.stringify(generatedSpec, null, 2)
        filename = `${generatedSpec.title}.json`
        mimeType = 'application/json'
        break
      case AISpecFormat.YAML:
        content = generateYAMLContent(generatedSpec)
        filename = `${generatedSpec.title}.yml`
        mimeType = 'text/yaml'
        break
      default:
        content = generateMarkdownContent(generatedSpec)
        filename = `${generatedSpec.title}.md`
        mimeType = 'text/markdown'
    }

    // 創建下載連結
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showSuccess('下載成功', `已下載 ${filename}`)
  }

  // 生成 Markdown 內容
  const generateMarkdownContent = (spec: any): string => {
    let content = `# ${spec.title}\n\n`
    content += `${spec.description}\n\n`
    content += `## 基本信息\n\n`
    content += `- **類型**: ${spec.type}\n`
    content += `- **複雜度**: ${spec.complexity}\n`
    content += `- **格式**: ${spec.format}\n`
    content += `- **預估時間**: ${spec.estimatedTime}\n`
    content += `- **標籤**: ${spec.tags.join(', ')}\n\n`
    
    if (spec.content.overview) {
      content += `## 概述\n\n${spec.content.overview}\n\n`
    }

    if (spec.content.requirements) {
      content += `## 前置要求\n\n`
      spec.content.requirements.forEach((req: string) => {
        content += `- ${req}\n`
      })
      content += `\n`
    }

    if (spec.content.steps) {
      content += `## 實現步驟\n\n`
      spec.content.steps.forEach((step: string, index: number) => {
        content += `${index + 1}. ${step}\n`
      })
      content += `\n`
    }

    if (spec.content.notes) {
      content += `## 注意事項\n\n`
      spec.content.notes.forEach((note: string) => {
        content += `- ${note}\n`
      })
      content += `\n`
    }

    return content
  }

  // 生成 HTML 內容
  const generateHTMLContent = (spec: any): string => {
    let content = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${spec.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 30px; }
        .meta { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .meta-item { margin: 5px 0; }
        .tag { display: inline-block; background: #e5e7eb; padding: 2px 8px; border-radius: 12px; margin: 2px; font-size: 12px; }
        ul { padding-left: 20px; }
        li { margin: 5px 0; }
    </style>
</head>
<body>
    <h1>${spec.title}</h1>
    <p>${spec.description}</p>
    
    <div class="meta">
        <div class="meta-item"><strong>類型:</strong> ${spec.type}</div>
        <div class="meta-item"><strong>複雜度:</strong> ${spec.complexity}</div>
        <div class="meta-item"><strong>預估時間:</strong> ${spec.estimatedTime}</div>
        <div class="meta-item"><strong>標籤:</strong> ${spec.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join(' ')}</div>
    </div>`

    if (spec.content.overview) {
      content += `
    <h2>概述</h2>
    <p>${spec.content.overview}</p>`
    }

    if (spec.content.requirements) {
      content += `
    <h2>前置要求</h2>
    <ul>
        ${spec.content.requirements.map((req: string) => `<li>${req}</li>`).join('')}
    </ul>`
    }

    if (spec.content.steps) {
      content += `
    <h2>實現步驟</h2>
    <ol>
        ${spec.content.steps.map((step: string) => `<li>${step}</li>`).join('')}
    </ol>`
    }

    if (spec.content.notes) {
      content += `
    <h2>注意事項</h2>
    <ul>
        ${spec.content.notes.map((note: string) => `<li>${note}</li>`).join('')}
    </ul>`
    }

    content += `
</body>
</html>`

    return content
  }

  // 生成 YAML 內容
  const generateYAMLContent = (spec: any): string => {
    let content = `title: "${spec.title}"
description: "${spec.description}"
type: ${spec.type}
complexity: ${spec.complexity}
format: ${spec.format}
estimatedTime: "${spec.estimatedTime}"
tags:
${spec.tags.map((tag: string) => `  - ${tag}`).join('\n')}
createdAt: "${spec.createdAt}"
updatedAt: "${spec.updatedAt}"

content:
  overview: |
    ${spec.content.overview || ''}`

    if (spec.content.requirements) {
      content += `
  requirements:
${spec.content.requirements.map((req: string) => `    - ${req}`).join('\n')}`
    }

    if (spec.content.steps) {
      content += `
  steps:
${spec.content.steps.map((step: string) => `    - ${step}`).join('\n')}`
    }

    if (spec.content.notes) {
      content += `
  notes:
${spec.content.notes.map((note: string) => `    - ${note}`).join('\n')}`
    }

    return content
  }

  return (
    <div className="p-6 space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center space-x-3">
        <SparklesIcon className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI 說明生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            為設計模板生成詳細的 AI 開發指導說明
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：配置面板 */}
        <div className="lg:col-span-1 space-y-6">
          {/* AI 說明類型選擇 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              選擇 AI 說明類型
            </h3>
            <div className="space-y-3">
              {aiSpecTypes.map((type) => (
                <label
                  key={type.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedType === type.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="aiSpecType"
                    value={type.id}
                    checked={selectedType === type.id}
                    onChange={(e) => setSelectedType(e.target.value as AISpecType)}
                    className="mt-1 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <type.icon className={`h-5 w-5 ${type.color} text-white rounded p-1`} />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {type.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {type.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 設計模板選擇 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              選擇設計模板
            </h3>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              aria-label="選擇設計模板"
              title="選擇設計模板"
            >
              <option value="">請選擇模板</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </select>
          </div>

          {/* 輸出格式選擇 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              輸出格式
            </h3>
            <div className="space-y-2">
              {outputFormats.map((format) => (
                <label
                  key={format.id}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="outputFormat"
                    value={format.id}
                    checked={selectedFormat === format.id}
                    onChange={(e) => setSelectedFormat(e.target.value as AISpecFormat)}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {format.name}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 額外需求 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              額外需求（可選）
            </h3>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="描述額外的功能需求、設計偏好或特殊要求..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          {/* 生成按鈕 */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedTemplate}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>生成中...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                <span>生成 AI 說明</span>
              </>
            )}
          </button>
        </div>

        {/* 右側：結果顯示 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 生成結果 */}
          {generatedSpec && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  生成結果
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(selectedFormat)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    下載 {selectedFormat}
                  </button>
                  <button
                    onClick={() => setGeneratedSpec(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    清除
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {generatedSpec.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {generatedSpec.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">類型:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{generatedSpec.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">複雜度:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{generatedSpec.complexity}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">預估時間:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{generatedSpec.estimatedTime}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">標籤:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{generatedSpec.tags.join(', ')}</span>
                  </div>
                </div>

                {generatedSpec.content.overview && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">概述</h5>
                    <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
                      {generatedSpec.content.overview}
                    </p>
                  </div>
                )}

                {generatedSpec.content.requirements && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">前置要求</h5>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm space-y-1">
                      {generatedSpec.content.requirements.map((req: string, index: number) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedSpec.content.steps && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">實現步驟</h5>
                    <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 text-sm space-y-1">
                      {generatedSpec.content.steps.map((step: string, index: number) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 最近生成的 AI 說明 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              最近生成的 AI 說明
            </h3>
            <div className="space-y-3">
              {recentAISpecs.map((spec) => (
                <div
                  key={spec.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {spec.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>{spec.type}</span>
                      <span>•</span>
                      <span>{spec.template}</span>
                      <span>•</span>
                      <span>{spec.generatedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      spec.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {spec.status === 'completed' ? '已完成' : '處理中'}
                    </span>
                    <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                      查看
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AISpecGenerator
