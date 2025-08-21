// ErSlice 數據庫類型定義
// 與 Rust 後端的 database.rs 模組對應

import { TemplateCategory, TemplateComplexity } from './templates'
import { AISpecType, AISpecFormat, AISpecComplexity } from './aiSpec'

// ==================== 設計模組類型 ====================

export interface DatabaseDesignModule {
  id: string
  name: string
  description?: string
  status: 'active' | 'draft' | 'archived'
  asset_count: number
  project_slugs?: string // JSON string
  primary_project?: string
  created_from?: string
  created_at: string // ISO 8601 格式
  updated_at: string // ISO 8601 格式
}

// ==================== 頁面類型 ====================

export interface DatabasePage {
  id: string
  module_id: string
  slug: string
  name: string
  status: 'active' | 'draft' | 'archived'
  meta_data?: string // JSON string
  created_at: string
  updated_at: string
}

// ==================== 子頁面類型 ====================

export interface DatabaseSubpage {
  id: string
  page_id: string
  slug: string
  name: string
  status: 'active' | 'draft' | 'archived'
  meta_data?: string // JSON string
  created_at: string
  updated_at: string
}

// ==================== 資產類型 ====================

export interface DatabaseAsset {
  id: string
  module_id: string
  page_id?: string
  subpage_id?: string
  file_path: string
  file_type: string
  file_size?: number
  mime_type?: string
  metadata?: string // JSON string
  created_at: string
}

// ==================== 模板類型 ====================

export interface DatabaseTemplate {
  id: string
  name: string
  description?: string
  category?: TemplateCategory
  complexity?: TemplateComplexity
  estimated_time?: string
  tags?: string // JSON string
  content_data?: string // JSON string
  created_at: string
  updated_at: string
}

// ==================== AI 規格類型 ====================

export interface DatabaseAISpec {
  id: string
  title: string
  description?: string
  type?: AISpecType
  complexity?: AISpecComplexity
  format?: AISpecFormat
  estimated_time?: string
  tags?: string // JSON string
  content_data?: string // JSON string
  created_at: string
  updated_at: string
}

// ==================== Figma 導出記錄類型 ====================

export interface DatabaseFigmaExport {
  id: string
  name: string
  export_format: 'figma-json' | 'design-tokens' | 'component-kit'
  included_content?: string // JSON string
  module_count: number
  asset_count: number
  token_count: number
  component_count: number
  status: 'success' | 'failed' | 'processing'
  file_size?: string
  download_url?: string
  error_message?: string
  created_at: string
}

// ==================== 數據庫統計信息類型 ====================

export interface DatabaseStats {
  design_modules: number
  pages: number
  subpages: number
  assets: number
  templates: number
  ai_specs: number
  database_path: string
  last_updated: string
}

// ==================== 數據庫操作結果類型 ====================

export interface DatabaseResult<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ==================== 數據庫查詢參數類型 ====================

export interface DatabaseQueryParams {
  page?: number
  page_size?: number
  search?: string
  filters?: Record<string, any>
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
}

// ==================== 數據庫備份類型 ====================

export interface DatabaseBackup {
  id: string
  path: string
  size: number
  created_at: string
  description?: string
}

// ==================== 數據庫遷移類型 ====================

export interface DatabaseMigration {
  version: string
  description: string
  sql: string
  applied_at?: string
}

// ==================== 數據庫連接狀態類型 ====================

export interface DatabaseConnectionStatus {
  connected: boolean
  database_path: string
  last_connection: string
  error?: string
}

// ==================== 數據庫性能指標類型 ====================

export interface DatabasePerformanceMetrics {
  query_count: number
  average_query_time: number
  slow_queries: number
  connection_pool_size: number
  last_optimization: string
}
