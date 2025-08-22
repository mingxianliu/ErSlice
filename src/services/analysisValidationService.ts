import { ComprehensiveAnalysisResult } from './figmaAnalysisController'
import { validationService } from './validationService'

export interface AnalysisValidationResult {
  isValid: boolean
  score: number // 0-100
  errors: AnalysisValidationError[]
  warnings: AnalysisValidationWarning[]
  consistency: ConsistencyCheckResult
  quality: QualityAssessmentResult
  recommendations: string[]
  metadata: ValidationMetadata
}

export interface AnalysisValidationError {
  code: string
  message: string
  severity: 'error' | 'warning'
  field: string
  expected: any
  actual: any
  suggestion: string
}

export interface AnalysisValidationWarning {
  code: string
  message: string
  suggestion: string
  impact: 'low' | 'medium' | 'high'
}

export interface ConsistencyCheckResult {
  isConsistent: boolean
  inconsistencies: Inconsistency[]
  overallConsistency: number // 0-100
}

export interface Inconsistency {
  type: 'data_mismatch' | 'format_inconsistency' | 'logic_conflict' | 'missing_data'
  description: string
  affectedFields: string[]
  severity: 'low' | 'medium' | 'high'
  suggestion: string
}

export interface QualityAssessmentResult {
  overallQuality: number // 0-100
  completeness: number // 0-100
  accuracy: number // 0-100
  reliability: number // 0-100
  details: QualityMetric[]
}

export interface QualityMetric {
  name: string
  score: number // 0-100
  weight: number
  description: string
  issues: string[]
}

export interface ValidationMetadata {
  validationTime: Date
  validationVersion: string
  totalChecks: number
  passedChecks: number
  failedChecks: number
  warningChecks: number
  processingTime: number
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  field: string
  condition: (value: any) => boolean
  errorMessage: string
  suggestion: string
  weight: number
}

export class AnalysisValidationService {
  private validationRules: Map<string, ValidationRule> = new Map()
  private qualityMetrics: Map<string, QualityMetric> = new Map()

  constructor() {
    this.initializeValidationRules()
    this.initializeQualityMetrics()
  }

  /**
   * 驗證分析結果
   */
  async validateAnalysisResult(analysis: ComprehensiveAnalysisResult): Promise<AnalysisValidationResult> {
    const startTime = Date.now()
    
    const result: AnalysisValidationResult = {
      isValid: true,
      score: 0,
      errors: [],
      warnings: [],
      consistency: { isConsistent: true, inconsistencies: [], overallConsistency: 100 },
      quality: { overallQuality: 0, completeness: 0, accuracy: 0, reliability: 0, details: [] },
      recommendations: [],
      metadata: {
        validationTime: new Date(),
        validationVersion: '1.0.0',
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        warningChecks: 0,
        processingTime: 0
      }
    }

    try {
      // 1. 基礎數據驗證
      const basicValidation = this.validateBasicData(analysis)
      result.errors.push(...basicValidation.errors)
      result.warnings.push(...basicValidation.warnings)

      // 2. 一致性檢查
      result.consistency = await this.checkConsistency(analysis)

      // 3. 質量評估
      result.quality = this.assessQuality(analysis)

      // 4. 規則驗證
      const ruleValidation = this.validateWithRules(analysis)
      result.errors.push(...ruleValidation.errors)
      result.warnings.push(...ruleValidation.warnings)

      // 5. 計算總分
      result.score = this.calculateOverallScore(result)

      // 6. 生成建議
      result.recommendations = this.generateRecommendations(result)

      // 7. 更新元資料
      result.metadata.processingTime = Date.now() - startTime
      result.metadata.totalChecks = this.validationRules.size
      result.metadata.passedChecks = this.validationRules.size - result.errors.length
      result.metadata.failedChecks = result.errors.length
      result.metadata.warningChecks = result.warnings.length

      // 8. 確定整體有效性
      result.isValid = result.errors.length === 0 && result.score >= 70

    } catch (error) {
      result.errors.push({
        code: 'VALIDATION_ERROR',
        message: `驗證過程中發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`,
        severity: 'error',
        field: 'general',
        expected: '正常驗證流程',
        actual: '驗證失敗',
        suggestion: '檢查驗證服務狀態，重新執行驗證'
      })
      result.isValid = false
    }

    return result
  }

  /**
   * 初始化驗證規則
   */
  private initializeValidationRules(): void {
    // 概述驗證規則
    this.validationRules.set('overview_completeness', {
      id: 'overview_completeness',
      name: '概述完整性檢查',
      description: '檢查分析概述是否包含必要信息',
      field: 'overview',
      condition: (value: any) => value && typeof value === 'object' && Object.keys(value).length >= 3,
      errorMessage: '分析概述信息不完整',
      suggestion: '確保概述包含項目名稱、描述、狀態等基本信息',
      weight: 10
    })

    // 維度分析驗證規則
    this.validationRules.set('dimensions_structure', {
      id: 'dimensions_structure',
      name: '維度分析結構檢查',
      description: '檢查四維分析結果的結構完整性',
      field: 'dimensions',
      condition: (value: any) => {
        if (!value || typeof value !== 'object') return false
        const requiredKeys = ['device', 'module', 'page', 'state']
        return requiredKeys.every(key => value[key] && Array.isArray(value[key]))
      },
      errorMessage: '四維分析結構不完整',
      suggestion: '確保包含 Device、Module、Page、State 四個維度的分析結果',
      weight: 15
    })

    // 資產分析驗證規則
    this.validationRules.set('assets_validation', {
      id: 'assets_validation',
      name: '資產分析驗證',
      description: '檢查資產分析結果的有效性',
      field: 'assets',
      condition: (value: any) => Array.isArray(value) && value.length > 0 && value.every(asset => 
        asset && typeof asset === 'object' && asset.id && asset.name
      ),
      errorMessage: '資產分析結果無效',
      suggestion: '確保每個資產都有有效的 ID 和名稱',
      weight: 12
    })

    // 設計系統驗證規則
    this.validationRules.set('design_system_validation', {
      id: 'design_system_validation',
      name: '設計系統驗證',
      description: '檢查設計系統分析結果的完整性',
      field: 'designSystem',
      condition: (value: any) => {
        if (!value || typeof value !== 'object') return false
        const requiredKeys = ['colors', 'typography', 'spacing', 'shadows']
        return requiredKeys.every(key => value[key] && Array.isArray(value[key]))
      },
      errorMessage: '設計系統分析不完整',
      suggestion: '確保包含顏色、字體、間距、陰影等設計 tokens',
      weight: 13
    })

    // 代碼生成計劃驗證規則
    this.validationRules.set('code_generation_validation', {
      id: 'code_generation_validation',
      name: '代碼生成計劃驗證',
      description: '檢查代碼生成計劃的合理性',
      field: 'codeGeneration',
      condition: (value: any) => {
        if (!value || typeof value !== 'object') return false
        return value.framework && value.components && value.styles
      },
      errorMessage: '代碼生成計劃不完整',
      suggestion: '確保包含框架選擇、組件結構、樣式策略等信息',
      weight: 11
    })

    // 智能建議驗證規則
    this.validationRules.set('recommendations_validation', {
      id: 'recommendations_validation',
      name: '智能建議驗證',
      description: '檢查智能建議的質量和數量',
      field: 'recommendations',
      condition: (value: any) => Array.isArray(value) && value.length >= 3 && value.every(rec => 
        typeof rec === 'string' && rec.length > 10
      ),
      errorMessage: '智能建議數量不足或質量較低',
      suggestion: '確保提供至少 3 個有價值的建議',
      weight: 8
    })

    // 信心度驗證規則
    this.validationRules.set('confidence_validation', {
      id: 'confidence_validation',
      name: '信心度驗證',
      description: '檢查分析結果的信心度',
      field: 'confidence',
      condition: (value: any) => {
        if (!value || typeof value !== 'object') return false
        return value.overall >= 0.6 && value.overall <= 1.0
      },
      errorMessage: '分析信心度異常',
      suggestion: '信心度應在 0.6-1.0 之間，過低需要重新分析',
      weight: 9
    })
  }

  /**
   * 初始化質量指標
   */
  private initializeQualityMetrics(): void {
    this.qualityMetrics.set('completeness', {
      name: '完整性',
      score: 0,
      weight: 0.25,
      description: '分析結果的完整程度',
      issues: []
    })

    this.qualityMetrics.set('accuracy', {
      name: '準確性',
      score: 0,
      weight: 0.30,
      description: '分析結果的準確程度',
      issues: []
    })

    this.qualityMetrics.set('reliability', {
      name: '可靠性',
      score: 0,
      weight: 0.25,
      description: '分析結果的可靠程度',
      issues: []
    })

    this.qualityMetrics.set('consistency', {
      name: '一致性',
      score: 0,
      weight: 0.20,
      description: '分析結果的一致程度',
      issues: []
    })
  }

  /**
   * 基礎數據驗證
   */
  private validateBasicData(analysis: ComprehensiveAnalysisResult): { errors: AnalysisValidationError[]; warnings: AnalysisValidationWarning[] } {
    const errors: AnalysisValidationError[] = []
    const warnings: AnalysisValidationWarning[] = []

    // 檢查必要字段
    if (!analysis.overview) {
      errors.push({
        code: 'MISSING_OVERVIEW',
        message: '缺少分析概述',
        severity: 'error',
        field: 'overview',
        expected: '分析概述對象',
        actual: 'undefined',
        suggestion: '添加分析概述信息'
      })
    }

    if (!analysis.dimensions) {
      errors.push({
        code: 'MISSING_DIMENSIONS',
        message: '缺少四維分析結果',
        severity: 'error',
        field: 'dimensions',
        expected: '四維分析對象',
        actual: 'undefined',
        suggestion: '執行四維智能分析'
      })
    }

    if (!analysis.assets || analysis.assets.length === 0) {
      warnings.push({
        code: 'NO_ASSETS',
        message: '沒有分析到任何資產',
        suggestion: '檢查上傳的檔案，確保包含有效的設計資產',
        impact: 'medium'
      })
    }

    if (!analysis.designSystem) {
      warnings.push({
        code: 'NO_DESIGN_SYSTEM',
        message: '沒有提取到設計系統信息',
        suggestion: '檢查設計稿是否包含設計系統元素',
        impact: 'low'
      })
    }

    return { errors, warnings }
  }

  /**
   * 一致性檢查
   */
  private async checkConsistency(analysis: ComprehensiveAnalysisResult): Promise<ConsistencyCheckResult> {
    const inconsistencies: Inconsistency[] = []

    // 檢查維度分析與資產分析的一致性
    if (analysis.dimensions && analysis.assets) {
      const moduleCount = analysis.dimensions.module?.length || 0
      const assetCount = analysis.assets.length
      
      if (moduleCount > 0 && assetCount > 0) {
        const avgAssetsPerModule = assetCount / moduleCount
        if (avgAssetsPerModule < 1) {
          inconsistencies.push({
            type: 'data_mismatch',
            description: '模組數量與資產數量不匹配',
            affectedFields: ['dimensions.module', 'assets'],
            severity: 'medium',
            suggestion: '重新檢查模組分類邏輯'
          })
        }
      }
    }

    // 檢查設計系統與資產的一致性
    if (analysis.designSystem && analysis.assets) {
      const colorCount = analysis.designSystem.colors?.length || 0
      const assetCount = analysis.assets.length
      
      if (colorCount > 0 && assetCount > 0) {
        // 簡單的一致性檢查：顏色數量應該與資產數量有一定比例關係
        const colorToAssetRatio = colorCount / assetCount
        if (colorToAssetRatio > 0.5) {
          inconsistencies.push({
            type: 'logic_conflict',
            description: '顏色數量異常多，可能存在重複或無效顏色',
            affectedFields: ['designSystem.colors'],
            severity: 'low',
            suggestion: '檢查顏色提取邏輯，去除重複顏色'
          })
        }
      }
    }

    // 檢查信心度與分析結果的一致性
    if (analysis.confidence && analysis.assets) {
      const confidence = analysis.confidence.overall
      const assetCount = analysis.assets.length
      
      if (confidence > 0.8 && assetCount === 0) {
        inconsistencies.push({
          type: 'logic_conflict',
          description: '高信心度但沒有資產，邏輯矛盾',
          affectedFields: ['confidence.overall', 'assets'],
          severity: 'high',
          suggestion: '重新評估分析算法或檢查輸入數據'
        })
      }
    }

    const overallConsistency = Math.max(0, 100 - (inconsistencies.length * 20))
    
    return {
      isConsistent: inconsistencies.length === 0,
      inconsistencies,
      overallConsistency
    }
  }

  /**
   * 質量評估
   */
  private assessQuality(analysis: ComprehensiveAnalysisResult): QualityAssessmentResult {
    const details: QualityMetric[] = []

    // 完整性評估
    const completeness = this.assessCompleteness(analysis)
    details.push(completeness)

    // 準確性評估
    const accuracy = this.assessAccuracy(analysis)
    details.push(accuracy)

    // 可靠性評估
    const reliability = this.assessReliability(analysis)
    details.push(reliability)

    // 一致性評估
    const consistency = this.assessConsistency(analysis)
    details.push(consistency)

    // 計算加權總分
    const overallQuality = details.reduce((total, metric) => {
      return total + (metric.score * metric.weight)
    }, 0)

    return {
      overallQuality: Math.round(overallQuality),
      completeness: completeness.score,
      accuracy: accuracy.score,
      reliability: reliability.score,
      details
    }
  }

  /**
   * 評估完整性
   */
  private assessCompleteness(analysis: ComprehensiveAnalysisResult): QualityMetric {
    const metric = this.qualityMetrics.get('completeness')!
    let score = 100
    const issues: string[] = []

    // 檢查必要字段
    if (!analysis.overview) { score -= 20; issues.push('缺少分析概述') }
    if (!analysis.dimensions) { score -= 25; issues.push('缺少四維分析') }
    if (!analysis.assets || analysis.assets.length === 0) { score -= 20; issues.push('沒有資產分析') }
    if (!analysis.designSystem) { score -= 15; issues.push('缺少設計系統') }
    if (!analysis.codeGeneration) { score -= 10; issues.push('缺少代碼生成計劃') }
    if (!analysis.recommendations || analysis.recommendations.length === 0) { score -= 10; issues.push('缺少智能建議') }

    metric.score = Math.max(0, score)
    metric.issues = issues

    return metric
  }

  /**
   * 評估準確性
   */
  private assessAccuracy(analysis: ComprehensiveAnalysisResult): QualityMetric {
    const metric = this.qualityMetrics.get('accuracy')!
    let score = 100
    const issues: string[] = []

    // 檢查數據格式
    if (analysis.assets) {
      const invalidAssets = analysis.assets.filter(asset => !asset.id || !asset.name)
      if (invalidAssets.length > 0) {
        score -= Math.min(30, invalidAssets.length * 5)
        issues.push(`${invalidAssets.length} 個資產數據格式不正確`)
      }
    }

    // 檢查設計系統數據
    if (analysis.designSystem) {
      if (analysis.designSystem.colors) {
        const invalidColors = analysis.designSystem.colors.filter(color => !color || typeof color !== 'string')
        if (invalidColors.length > 0) {
          score -= Math.min(20, invalidColors.length * 2)
          issues.push(`${invalidColors.length} 個顏色值格式不正確`)
        }
      }
    }

    // 檢查信心度合理性
    if (analysis.confidence) {
      const confidence = analysis.confidence.overall
      if (confidence < 0 || confidence > 1) {
        score -= 25
        issues.push('信心度值超出合理範圍')
      }
    }

    metric.score = Math.max(0, score)
    metric.issues = issues

    return metric
  }

  /**
   * 評估可靠性
   */
  private assessReliability(analysis: ComprehensiveAnalysisResult): QualityMetric {
    const metric = this.qualityMetrics.get('reliability')!
    let score = 100
    const issues: string[] = []

    // 檢查數據一致性
    if (analysis.assets && analysis.dimensions) {
      const moduleCount = analysis.dimensions.module?.length || 0
      const assetCount = analysis.assets.length
      
      if (moduleCount > 0 && assetCount > 0) {
        const avgAssetsPerModule = assetCount / moduleCount
        if (avgAssetsPerModule < 0.5) {
          score -= 20
          issues.push('模組與資產數量比例異常')
        }
      }
    }

    // 檢查建議質量
    if (analysis.recommendations) {
      const shortRecommendations = analysis.recommendations.filter(rec => rec.length < 10)
      if (shortRecommendations.length > 0) {
        score -= Math.min(15, shortRecommendations.length * 3)
        issues.push(`${shortRecommendations.length} 個建議內容過短`)
      }
    }

    metric.score = Math.max(0, score)
    metric.issues = issues

    return metric
  }

  /**
   * 評估一致性
   */
  private assessConsistency(analysis: ComprehensiveAnalysisResult): QualityMetric {
    const metric = this.qualityMetrics.get('consistency')!
    let score = 100
    const issues: string[] = []

    // 檢查命名一致性
    if (analysis.assets) {
      const namingPatterns = new Set<string>()
      analysis.assets.forEach(asset => {
        if (asset.name) {
          const pattern = this.extractNamingPattern(asset.name)
          namingPatterns.add(pattern)
        }
      })
      
      if (namingPatterns.size > 3) {
        score -= 15
        issues.push('資產命名模式不一致')
      }
    }

    // 檢查數據結構一致性
    if (analysis.assets && analysis.assets.length > 1) {
      const firstAsset = analysis.assets[0]
      const inconsistentAssets = analysis.assets.filter(asset => 
        Object.keys(asset).length !== Object.keys(firstAsset).length
      )
      
      if (inconsistentAssets.length > 0) {
        score -= 20
        issues.push(`${inconsistentAssets.length} 個資產數據結構不一致`)
      }
    }

    metric.score = Math.max(0, score)
    metric.issues = issues

    return metric
  }

  /**
   * 規則驗證
   */
  private validateWithRules(analysis: ComprehensiveAnalysisResult): { errors: AnalysisValidationError[]; warnings: AnalysisValidationWarning[] } {
    const errors: AnalysisValidationError[] = []
    const warnings: AnalysisValidationWarning[] = []

    for (const rule of this.validationRules.values()) {
      const fieldValue = this.getNestedValue(analysis, rule.field)
      const isValid = rule.condition(fieldValue)

      if (!isValid) {
        errors.push({
          code: rule.id,
          message: rule.errorMessage,
          severity: 'error',
          field: rule.field,
          expected: '符合規則條件',
          actual: '不符合規則條件',
          suggestion: rule.suggestion
        })
      }
    }

    return { errors, warnings }
  }

  /**
   * 計算總分
   */
  private calculateOverallScore(result: AnalysisValidationResult): number {
    let score = 100

    // 錯誤扣分
    score -= result.errors.length * 10

    // 警告扣分
    score -= result.warnings.length * 3

    // 一致性扣分
    score -= (100 - result.consistency.overallConsistency) * 0.3

    // 質量扣分
    score -= (100 - result.quality.overallQuality) * 0.2

    return Math.max(0, Math.round(score))
  }

  /**
   * 生成建議
   */
  private generateRecommendations(result: AnalysisValidationResult): string[] {
    const recommendations: string[] = []

    // 基於錯誤生成建議
    if (result.errors.length > 0) {
      recommendations.push(`修復 ${result.errors.length} 個驗證錯誤以提高分析質量`)
    }

    // 基於一致性生成建議
    if (result.consistency.inconsistencies.length > 0) {
      recommendations.push('檢查數據一致性問題，確保分析結果的邏輯性')
    }

    // 基於質量生成建議
    if (result.quality.overallQuality < 80) {
      recommendations.push('分析質量有待提升，建議重新檢查輸入數據和分析邏輯')
    }

    // 基於分數生成建議
    if (result.score < 70) {
      recommendations.push('整體驗證分數較低，建議全面檢查分析流程')
    } else if (result.score < 85) {
      recommendations.push('分析結果基本合格，但仍有改進空間')
    } else {
      recommendations.push('分析結果質量優秀，可以進行下一步操作')
    }

    return recommendations
  }

  /**
   * 輔助方法
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private extractNamingPattern(name: string): string {
    // 簡單的命名模式提取
    if (/^[A-Z][a-z]+$/.test(name)) return 'PascalCase'
    if (/^[a-z]+_[a-z]+$/.test(name)) return 'snake_case'
    if (/^[a-z]+-[a-z]+$/.test(name)) return 'kebab-case'
    if (/^[a-z]+$/.test(name)) return 'lowercase'
    return 'mixed'
  }

  /**
   * 添加自定義驗證規則
   */
  addValidationRule(rule: ValidationRule): void {
    this.validationRules.set(rule.id, rule)
  }

  /**
   * 移除驗證規則
   */
  removeValidationRule(ruleId: string): boolean {
    return this.validationRules.delete(ruleId)
  }

  /**
   * 獲取所有驗證規則
   */
  getValidationRules(): ValidationRule[] {
    return Array.from(this.validationRules.values())
  }

  /**
   * 獲取質量指標
   */
  getQualityMetrics(): QualityMetric[] {
    return Array.from(this.qualityMetrics.values())
  }
}

// 創建單例實例
export const analysisValidationService = new AnalysisValidationService()
