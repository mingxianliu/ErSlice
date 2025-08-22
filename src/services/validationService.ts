export interface ValidationRule {
  field: string
  type: 'required' | 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'custom'
  required?: boolean
  minLength?: number
  maxLength?: number
  minValue?: number
  maxValue?: number
  pattern?: RegExp
  customValidator?: (value: any) => boolean | string
  message?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  fieldResults: Record<string, FieldValidationResult>
}

export interface ValidationError {
  field: string
  message: string
  code: string
  severity: 'error' | 'warning'
  value?: any
  expected?: any
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
  suggestion?: string
}

export interface FieldValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface SchemaDefinition {
  [key: string]: ValidationRule
}

export class ValidationService {
  private schemas: Map<string, SchemaDefinition> = new Map()
  private customValidators: Map<string, (value: any) => boolean | string> = new Map()

  constructor() {
    this.initializeDefaultSchemas()
    this.initializeCustomValidators()
  }

  /**
   * 初始化預設驗證模式
   */
  private initializeDefaultSchemas(): void {
    // 設計模組驗證模式
    this.schemas.set('designModule', {
      id: {
        field: 'id',
        type: 'string',
        required: true,
        minLength: 1,
        message: '模組 ID 不能為空'
      },
      name: {
        field: 'name',
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100,
        message: '模組名稱長度必須在 1-100 字符之間'
      },
      description: {
        field: 'description',
        type: 'string',
        required: false,
        maxLength: 500,
        message: '模組描述不能超過 500 字符'
      },
      structure: {
        field: 'structure',
        type: 'object',
        required: true,
        message: '模組結構不能為空'
      },
      assets: {
        field: 'assets',
        type: 'array',
        required: true,
        message: '模組資產不能為空'
      },
      analysis: {
        field: 'analysis',
        type: 'object',
        required: true,
        message: '分析結果不能為空'
      }
    })

    // 切版包驗證模式
    this.schemas.set('slicePackage', {
      id: {
        field: 'id',
        type: 'string',
        required: true,
        minLength: 1,
        message: '切版包 ID 不能為空'
      },
      name: {
        field: 'name',
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 100,
        message: '切版包名稱長度必須在 1-100 字符之間'
      },
      files: {
        field: 'files',
        type: 'array',
        required: true,
        message: '切版包檔案不能為空'
      },
      structure: {
        field: 'structure',
        type: 'object',
        required: true,
        message: '切版包結構不能為空'
      }
    })

    // 組件驗證模式
    this.schemas.set('component', {
      id: {
        field: 'id',
        type: 'string',
        required: true,
        minLength: 1,
        message: '組件 ID 不能為空'
      },
      name: {
        field: 'name',
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 50,
        message: '組件名稱長度必須在 1-50 字符之間'
      },
      type: {
        field: 'type',
        type: 'string',
        required: true,
        pattern: /^(button|text|image|container|input|card|navigation|form|list|grid)$/,
        message: '組件類型必須是有效的類型'
      },
      props: {
        field: 'props',
        type: 'object',
        required: false,
        message: '組件屬性必須是對象'
      },
      styles: {
        field: 'styles',
        type: 'object',
        required: false,
        message: '組件樣式必須是對象'
      }
    })

    // 檔案驗證模式
    this.schemas.set('file', {
      name: {
        field: 'name',
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 255,
        message: '檔案名稱長度必須在 1-255 字符之間'
      },
      size: {
        field: 'size',
        type: 'number',
        required: true,
        minValue: 0,
        maxValue: 100 * 1024 * 1024, // 100MB
        message: '檔案大小必須在 0-100MB 之間'
      },
      type: {
        field: 'type',
        type: 'string',
        required: true,
        pattern: /^(image\/(png|jpeg|gif|webp)|text\/plain|application\/json)$/,
        message: '檔案類型必須是支援的格式'
      }
    })
  }

  /**
   * 初始化自定義驗證器
   */
  private initializeCustomValidators(): void {
    // 檔案名稱驗證器
    this.customValidators.set('validFileName', (value: string) => {
      const invalidChars = /[<>:"/\\|?*]/
      if (invalidChars.test(value)) {
        return '檔案名稱包含無效字符'
      }
      if (value.length > 255) {
        return '檔案名稱過長'
      }
      return true
    })

    // 檔案大小驗證器
    this.customValidators.set('validFileSize', (value: number) => {
      if (value <= 0) {
        return '檔案大小必須大於 0'
      }
      if (value > 100 * 1024 * 1024) {
        return '檔案大小不能超過 100MB'
      }
      return true
    })

    // 顏色值驗證器
    this.customValidators.set('validColor', (value: string) => {
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/
      if (!colorRegex.test(value)) {
        return '顏色值格式無效'
      }
      return true
    })

    // 字體大小驗證器
    this.customValidators.set('validFontSize', (value: number) => {
      if (value < 8 || value > 200) {
        return '字體大小必須在 8-200px 之間'
      }
      return true
    })
  }

  /**
   * 驗證數據
   */
  validate(data: any, schemaName: string): ValidationResult {
    const schema = this.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`驗證模式不存在: ${schemaName}`)
    }

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fieldResults: {}
    }

    // 驗證每個欄位
    Object.keys(schema).forEach(fieldName => {
      const rule = schema[fieldName]
      const fieldResult = this.validateField(data[fieldName], rule, fieldName)
      
      result.fieldResults[fieldName] = fieldResult
      
      if (!fieldResult.isValid) {
        result.isValid = false
        result.errors.push(...fieldResult.errors)
      }
      
      if (fieldResult.warnings.length > 0) {
        result.warnings.push(...fieldResult.warnings)
      }
    })

    // 檢查必填欄位
    this.validateRequiredFields(data, schema, result)

    // 執行跨欄位驗證
    this.validateCrossFieldRules(data, schema, result)

    return result
  }

  /**
   * 驗證單個欄位
   */
  private validateField(value: any, rule: ValidationRule, fieldName: string): FieldValidationResult {
    const result: FieldValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    }

    // 檢查必填
    if (rule.required && (value === undefined || value === null || value === '')) {
      result.errors.push({
        field: fieldName,
        message: rule.message || `${fieldName} 是必填欄位`,
        code: 'REQUIRED_FIELD',
        severity: 'error',
        value,
        expected: '非空值'
      })
      result.isValid = false
      return result
    }

    // 如果值為空且非必填，跳過其他驗證
    if (value === undefined || value === null || value === '') {
      return result
    }

    // 類型驗證
    const typeValidation = this.validateType(value, rule, fieldName)
    if (!typeValidation.isValid) {
      result.errors.push(typeValidation.error!)
      result.isValid = false
      return result
    }

    // 長度驗證
    if (rule.type === 'string' && typeof value === 'string') {
      const lengthValidation = this.validateLength(value, rule, fieldName)
      if (!lengthValidation.isValid) {
        result.errors.push(lengthValidation.error!)
        result.isValid = false
      }
    }

    // 數值範圍驗證
    if (rule.type === 'number' && typeof value === 'number') {
      const rangeValidation = this.validateRange(value, rule, fieldName)
      if (!rangeValidation.isValid) {
        result.errors.push(rangeValidation.error!)
        result.isValid = false
      }
    }

    // 模式驗證
    if (rule.pattern && typeof value === 'string') {
      const patternValidation = this.validatePattern(value, rule, fieldName)
      if (!patternValidation.isValid) {
        result.errors.push(patternValidation.error!)
        result.isValid = false
      }
    }

    // 自定義驗證
    if (rule.customValidator) {
      const customValidation = this.validateCustom(value, rule, fieldName)
      if (!customValidation.isValid) {
        result.errors.push(customValidation.error!)
        result.isValid = false
      }
    }

    return result
  }

  /**
   * 驗證類型
   */
  private validateType(value: any, rule: ValidationRule, fieldName: string): { isValid: boolean; error?: ValidationError } {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'array': 'object',
      'object': 'object'
    }

    const expectedType = typeMap[rule.type]
    if (!expectedType) {
      return { isValid: true } // 跳過未知類型
    }

    let actualType = typeof value
    if (Array.isArray(value)) {
      actualType = 'object'
    }

    if (actualType !== expectedType) {
      return {
        isValid: false,
        error: {
          field: fieldName,
          message: rule.message || `${fieldName} 類型錯誤，期望 ${expectedType}，實際 ${actualType}`,
          code: 'TYPE_MISMATCH',
          severity: 'error',
          value,
          expected: expectedType
        }
      }
    }

    return { isValid: true }
  }

  /**
   * 驗證長度
   */
  private validateLength(value: string, rule: ValidationRule, fieldName: string): { isValid: boolean; error?: ValidationError } {
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      return {
        isValid: false,
        error: {
          field: fieldName,
          message: rule.message || `${fieldName} 長度不能少於 ${rule.minLength} 字符`,
          code: 'MIN_LENGTH',
          severity: 'error',
          value: value.length,
          expected: rule.minLength
        }
      }
    }

    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      return {
        isValid: false,
        error: {
          field: fieldName,
          message: rule.message || `${fieldName} 長度不能超過 ${rule.maxLength} 字符`,
          code: 'MAX_LENGTH',
          severity: 'error',
          value: value.length,
          expected: rule.maxLength
        }
      }
    }

    return { isValid: true }
  }

  /**
   * 驗證數值範圍
   */
  private validateRange(value: number, rule: ValidationRule, fieldName: string): { isValid: boolean; error?: ValidationError } {
    if (rule.minValue !== undefined && value < rule.minValue) {
      return {
        isValid: false,
        error: {
          field: fieldName,
          message: rule.message || `${fieldName} 值不能小於 ${rule.minValue}`,
          code: 'MIN_VALUE',
          severity: 'error',
          value,
          expected: rule.minValue
        }
      }
    }

    if (rule.maxValue !== undefined && value > rule.maxValue) {
      return {
        isValid: false,
        error: {
          field: fieldName,
          message: rule.message || `${fieldName} 值不能大於 ${rule.maxValue}`,
          code: 'MAX_VALUE',
          severity: 'error',
          value,
          expected: rule.maxValue
        }
      }
    }

    return { isValid: true }
  }

  /**
   * 驗證模式
   */
  private validatePattern(value: string, rule: ValidationRule, fieldName: string): { isValid: boolean; error?: ValidationError } {
    if (!rule.pattern!.test(value)) {
      return {
        isValid: false,
        error: {
          field: fieldName,
          message: rule.message || `${fieldName} 格式不正確`,
          code: 'PATTERN_MISMATCH',
          severity: 'error',
          value,
          expected: '符合模式的值'
        }
      }
    }

    return { isValid: true }
  }

  /**
   * 自定義驗證
   */
  private validateCustom(value: any, rule: ValidationRule, fieldName: string): { isValid: boolean; error?: ValidationError } {
    try {
      const result = rule.customValidator!(value)
      if (result === true) {
        return { isValid: true }
      }

      return {
        isValid: false,
        error: {
          field: fieldName,
          message: typeof result === 'string' ? result : rule.message || `${fieldName} 驗證失敗`,
          code: 'CUSTOM_VALIDATION',
          severity: 'error',
          value
        }
      }
    } catch (error) {
      return {
        isValid: false,
        error: {
          field: fieldName,
          message: `自定義驗證器執行失敗: ${error}`,
          code: 'CUSTOM_VALIDATION_ERROR',
          severity: 'error',
          value
        }
      }
    }
  }

  /**
   * 驗證必填欄位
   */
  private validateRequiredFields(data: any, schema: SchemaDefinition, result: ValidationResult): void {
    Object.keys(schema).forEach(fieldName => {
      const rule = schema[fieldName]
      if (rule.required && (data[fieldName] === undefined || data[fieldName] === null || data[fieldName] === '')) {
        result.errors.push({
          field: fieldName,
          message: rule.message || `${fieldName} 是必填欄位`,
          code: 'REQUIRED_FIELD',
          severity: 'error',
          value: data[fieldName],
          expected: '非空值'
        })
        result.isValid = false
      }
    })
  }

  /**
   * 跨欄位驗證規則
   */
  private validateCrossFieldRules(data: any, schema: SchemaDefinition, result: ValidationResult): void {
    // 檢查檔案大小與類型的關係
    if (data.size && data.type) {
      if (data.type.startsWith('image/') && data.size > 10 * 1024 * 1024) {
        result.warnings.push({
          field: 'size',
          message: '圖片檔案過大，建議壓縮',
          code: 'LARGE_IMAGE_FILE',
          suggestion: '使用圖片壓縮工具減少檔案大小'
        })
      }
    }

    // 檢查組件名稱與類型的關係
    if (data.name && data.type) {
      const nameLower = data.name.toLowerCase()
      if (data.type === 'button' && !nameLower.includes('button') && !nameLower.includes('btn')) {
        result.warnings.push({
          field: 'name',
          message: '按鈕組件名稱建議包含 "button" 或 "btn"',
          code: 'BUTTON_NAMING_CONVENTION',
          suggestion: '使用更具描述性的名稱，如 "SubmitButton" 或 "LoginBtn"'
        })
      }
    }
  }

  /**
   * 添加自定義驗證模式
   */
  addSchema(name: string, schema: SchemaDefinition): void {
    this.schemas.set(name, schema)
  }

  /**
   * 添加自定義驗證器
   */
  addCustomValidator(name: string, validator: (value: any) => boolean | string): void {
    this.customValidators.set(name, validator)
  }

  /**
   * 獲取驗證模式
   */
  getSchema(name: string): SchemaDefinition | undefined {
    return this.schemas.get(name)
  }

  /**
   * 獲取所有驗證模式名稱
   */
  getSchemaNames(): string[] {
    return Array.from(this.schemas.keys())
  }

  /**
   * 移除驗證模式
   */
  removeSchema(name: string): boolean {
    return this.schemas.delete(name)
  }

  /**
   * 清理驗證結果
   */
  clearValidationResult(result: ValidationResult): void {
    result.errors = []
    result.warnings = []
    result.isValid = true
    Object.keys(result.fieldResults).forEach(field => {
      result.fieldResults[field] = {
        isValid: true,
        errors: [],
        warnings: []
      }
    })
  }
}

// 創建單例實例
export const validationService = new ValidationService()
