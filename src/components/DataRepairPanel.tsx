import React, { useState } from 'react'
import { 
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { Button } from './ui/Button'
import { 
  autoRepairAllData,
  getAllRepairRules,
  needsRepair,
  getRepairSuggestions,
  RepairResult,
  RepairDetail,
  RepairRule
} from '../services/dataRepair'
import { DesignModule } from '../utils/tauriCommands'
import { Template } from '../types/templates'
import { AISpec } from '../types/aiSpec'

interface DataRepairPanelProps {
  data: {
    modules: DesignModule[]
    templates: Template[]
    specs: AISpec[]
  }
  onRepairComplete?: (result: RepairResult) => void
  className?: string
}

export default function DataRepairPanel({ data, onRepairComplete, className = '' }: DataRepairPanelProps) {
  const [isRepairing, setIsRepairing] = useState(false)
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null)
  const [expandedSections, setExpandedSections] = useState<{
    modules: boolean
    templates: boolean
    specs: boolean
  }>({
    modules: false,
    templates: false,
    specs: false
  })
  const [repairRules, setRepairRules] = useState<{
    modules: RepairRule[]
    templates: RepairRule[]
    specs: RepairRule[]
  } | null>(null)

  // 獲取修復規則
  React.useEffect(() => {
    setRepairRules(getAllRepairRules())
  }, [])

  // 執行數據修復
  const handleRepair = async () => {
    setIsRepairing(true)
    
    try {
      const result = autoRepairAllData(data)
      setRepairResult(result)
      onRepairComplete?.(result)
    } catch (error) {
      console.error('數據修復失敗:', error)
    } finally {
      setIsRepairing(false)
    }
  }

  // 切換展開狀態
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // 檢查數據是否需要修復
  const checkRepairNeeds = () => {
    const allItems = [...data.modules, ...data.templates, ...data.specs]
    const needsRepairItems = allItems.filter(item => needsRepair(item).needsRepair)
    
    return {
      total: allItems.length,
      needsRepair: needsRepairItems.length,
      items: needsRepairItems
    }
  }

  const repairNeeds = checkRepairNeeds()

  // 渲染修復規則列表
  const renderRepairRules = () => {
    if (!repairRules) return null

    return (
      <div className="space-y-4">
        {/* 設計模組修復規則 */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('modules')}
            className="w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between"
          >
            <span className="font-medium text-blue-900">
              設計模組修復規則 ({repairRules.modules.length})
            </span>
            <span className="text-blue-600">
              {expandedSections.modules ? '收起' : '展開'}
            </span>
          </button>
          
          {expandedSections.modules && (
            <div className="p-4 border-t">
              <div className="space-y-3">
                {repairRules.modules.map((rule) => (
                  <div key={rule.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      rule.severity === 'critical' ? 'bg-red-500' :
                      rule.severity === 'error' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{rule.name}</div>
                      <div className="text-sm text-gray-600">{rule.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        嚴重程度: {rule.severity === 'critical' ? '嚴重' : rule.severity === 'error' ? '錯誤' : '警告'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 模板修復規則 */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('templates')}
            className="w-full px-4 py-3 text-left bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-between"
          >
            <span className="font-medium text-green-900">
              模板修復規則 ({repairRules.templates.length})
            </span>
            <span className="text-green-600">
              {expandedSections.templates ? '收起' : '展開'}
            </span>
          </button>
          
          {expandedSections.templates && (
            <div className="p-4 border-t">
              <div className="space-y-3">
                {repairRules.templates.map((rule) => (
                  <div key={rule.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      rule.severity === 'critical' ? 'bg-red-500' :
                      rule.severity === 'error' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{rule.name}</div>
                      <div className="text-sm text-gray-600">{rule.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        嚴重程度: {rule.severity === 'critical' ? '嚴重' : rule.severity === 'error' ? '錯誤' : '警告'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI 規格修復規則 */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('specs')}
            className="w-full px-4 py-3 text-left bg-purple-50 hover:bg-purple-100 transition-colors flex items-center justify-between"
          >
            <span className="font-medium text-purple-900">
              AI 規格修復規則 ({repairRules.specs.length})
            </span>
            <span className="text-purple-600">
              {expandedSections.specs ? '收起' : '展開'}
            </span>
          </button>
          
          {expandedSections.specs && (
            <div className="p-4 border-t">
              <div className="space-y-3">
                {repairRules.specs.map((rule) => (
                  <div key={rule.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      rule.severity === 'critical' ? 'bg-red-500' :
                      rule.severity === 'error' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{rule.name}</div>
                      <div className="text-sm text-gray-600">{rule.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        嚴重程度: {rule.severity === 'critical' ? '嚴重' : rule.severity === 'error' ? '錯誤' : '警告'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 渲染修復結果
  const renderRepairResult = () => {
    if (!repairResult) return null

    return (
      <div className="space-y-4">
        {/* 修復摘要 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">修復結果摘要</h4>
          
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {repairResult.processed}
              </div>
              <div className="text-sm text-gray-600">處理項目</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {repairResult.repaired}
              </div>
              <div className="text-sm text-green-600">修復成功</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {repairResult.failed}
              </div>
              <div className="text-sm text-red-600">修復失敗</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {repairResult.details.modules.length + repairResult.details.templates.length + repairResult.details.specs.length}
              </div>
              <div className="text-sm text-blue-600">修復後項目</div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className={`inline-flex items-center ${
              repairResult.success ? 'text-green-600' : 'text-orange-600'
            }`}>
              {repairResult.success ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              )}
              <span className="font-medium">{repairResult.summary}</span>
            </div>
          </div>
        </div>

        {/* 詳細修復結果 */}
        <div className="space-y-4">
          {/* 設計模組修復結果 */}
          {repairResult.details.modules.length > 0 && (
            <div className="border rounded-lg">
              <h5 className="px-4 py-3 bg-blue-50 font-medium text-blue-900">
                設計模組修復結果 ({repairResult.details.modules.length})
              </h5>
              <div className="p-4 space-y-3">
                {repairResult.details.modules.map((module, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded">
                    <div className="font-medium text-blue-900">{module.name}</div>
                    <div className="text-sm text-blue-700">ID: {module.id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 模板修復結果 */}
          {repairResult.details.templates.length > 0 && (
            <div className="border rounded-lg">
              <h5 className="px-4 py-3 bg-green-50 font-medium text-green-900">
                模板修復結果 ({repairResult.details.templates.length})
              </h5>
              <div className="p-4 space-y-3">
                {repairResult.details.templates.map((template, index) => (
                  <div key={index} className="bg-green-50 p-3 rounded">
                    <div className="font-medium text-green-900">{template.name}</div>
                    <div className="text-sm text-green-700">ID: {template.id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI 規格修復結果 */}
          {repairResult.details.specs.length > 0 && (
            <div className="border rounded-lg">
              <h5 className="px-4 py-3 bg-purple-50 font-medium text-purple-900">
                AI 規格修復結果 ({repairResult.details.specs.length})
              </h5>
              <div className="p-4 space-y-3">
                {repairResult.details.specs.map((spec, index) => (
                  <div key={index} className="bg-purple-50 p-3 rounded">
                    <div className="font-medium text-purple-900">{spec.title}</div>
                    <div className="text-sm text-purple-700">ID: {spec.id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 標題欄 */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <WrenchScrewdriverIcon className="h-5 w-5 mr-2 text-blue-600" />
          數據修復工具
        </h2>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            {repairNeeds.needsRepair > 0 ? (
              <span className="text-orange-600 font-medium">
                發現 {repairNeeds.needsRepair} 個需要修復的項目
              </span>
            ) : (
              <span className="text-green-600 font-medium">
                所有數據都正常
              </span>
            )}
          </div>
          
          <Button
            onClick={handleRepair}
            disabled={isRepairing || repairNeeds.needsRepair === 0}
            variant="primary"
            size="sm"
          >
            {isRepairing ? (
              <>
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                修復中...
              </>
            ) : (
              <>
                <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
                自動修復
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="p-4">
        {/* 修復需求檢查 */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-3">修復需求檢查</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{repairNeeds.total}</div>
              <div className="text-sm text-blue-600">總項目數</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{repairNeeds.needsRepair}</div>
              <div className="text-sm text-orange-600">需要修復</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{repairNeeds.total - repairNeeds.needsRepair}</div>
              <div className="text-sm text-green-600">無需修復</div>
            </div>
          </div>
        </div>

        {/* 修復規則說明 */}
        {!repairResult && (
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">修復規則說明</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">自動修復功能</p>
                  <p className="mt-1">
                    系統將自動檢測並修復常見的數據問題，包括空 ID、無效狀態、日期格式錯誤等。
                    修復過程會保留原始數據的備份，確保數據安全。
                  </p>
                </div>
              </div>
            </div>
            {renderRepairRules()}
          </div>
        )}

        {/* 修復結果 */}
        {repairResult && renderRepairResult()}

        {/* 修復建議 */}
        {repairNeeds.needsRepair > 0 && !repairResult && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">修復建議</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              {repairNeeds.items.slice(0, 3).map((item, index) => {
                const suggestions = getRepairSuggestions(item)
                return (
                  <div key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <div>
                      <span className="font-medium">
                        {('name' in item ? item.name : 'title' in item ? item.title : '未知項目')}:
                      </span>
                      {suggestions.slice(0, 2).join(', ')}
                    </div>
                  </div>
                )
              })}
              {repairNeeds.needsRepair > 3 && (
                <div className="text-yellow-600 text-sm">
                  還有 {repairNeeds.needsRepair - 3} 個項目需要修復...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
