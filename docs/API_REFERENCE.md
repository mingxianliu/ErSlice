# ErSlice API 參考文檔

> 本文檔詳細說明 ErSlice 的所有 API 端點、請求/響應格式、錯誤處理和認證方式。

## 📋 目錄

- [概述](#概述)
- [認證與授權](#認證與授權)
- [錯誤處理](#錯誤處理)
- [設計資產 API](#設計資產-api)
- [模板 API](#模板-api)
- [AI 說明 API](#ai-說明-api)
- [系統 API](#系統-api)
- [WebSocket 事件](#websocket-事件)

---

## 概述

### 基礎資訊
- **基礎 URL**: `http://localhost:1420/api` (開發環境)
- **API 版本**: v1
- **內容類型**: `application/json`
- **字符編碼**: UTF-8

### 通用響應格式
```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    details?: any
  }
  timestamp: string
  requestId: string
}
```

### 分頁響應格式
```typescript
interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    pagination: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
  }
  message?: string
}
```

---

## 認證與授權

### 認證方式
目前 ErSlice 使用本地存儲認證，無需額外的認證頭。

### 權限控制
- **公開端點**: 無需認證
- **受保護端點**: 需要有效的用戶會話
- **管理端點**: 需要管理員權限

---

## 錯誤處理

### 錯誤代碼
| 錯誤代碼 | HTTP 狀態碼 | 說明 |
|----------|-------------|------|
| `VALIDATION_ERROR` | 400 | 請求參數驗證失敗 |
| `UNAUTHORIZED` | 401 | 未授權訪問 |
| `FORBIDDEN` | 403 | 禁止訪問 |
| `NOT_FOUND` | 404 | 資源不存在 |
| `CONFLICT` | 409 | 資源衝突 |
| `INTERNAL_ERROR` | 500 | 內部服務器錯誤 |
| `SERVICE_UNAVAILABLE` | 503 | 服務不可用 |

### 錯誤響應示例
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "name",
      "message": "名稱不能為空"
    }
  },
  "message": "請求參數驗證失敗",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

---

## 設計資產 API

### 1. 取得設計資產列表

#### 端點
```
GET /api/design-assets
```

#### 查詢參數
| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `page` | number | 否 | 頁碼，預設 1 |
| `pageSize` | number | 否 | 每頁數量，預設 20 |
| `category` | string | 否 | 分類篩選 |
| `tags` | string[] | 否 | 標籤篩選 |
| `status` | string | 否 | 狀態篩選 |
| `search` | string | 否 | 搜尋關鍵字 |
| `sortBy` | string | 否 | 排序欄位 |
| `sortOrder` | 'asc' \| 'desc' | 否 | 排序順序 |

#### 請求示例
```bash
GET /api/design-assets?page=1&pageSize=10&category=ui&tags=button,form&search=login
```

#### 響應示例
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "asset_123",
        "name": "登入表單設計",
        "description": "現代化的登入表單設計稿",
        "type": "mockup",
        "category": "ui",
        "tags": ["button", "form", "login"],
        "filePath": "/uploads/login-form.sketch",
        "thumbnailPath": "/thumbnails/login-form.png",
        "metadata": {
          "width": 1200,
          "height": 800,
          "fileSize": 2048576,
          "lastModified": "2024-01-15T10:30:00Z"
        },
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 25,
      "totalPages": 3
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

### 2. 創建設計資產

#### 端點
```
POST /api/design-assets
```

#### 請求體
```typescript
interface CreateDesignAssetRequest {
  name: string
  description?: string
  type: 'image' | 'document' | 'mockup' | 'prototype'
  category: string
  tags?: string[]
  file: File
}
```

#### 請求示例
```json
{
  "name": "用戶頭像組件",
  "description": "可重用的用戶頭像組件設計",
  "type": "component",
  "category": "ui",
  "tags": ["avatar", "user", "component"]
}
```

#### 響應示例
```json
{
  "success": true,
  "data": {
    "id": "asset_124",
    "name": "用戶頭像組件",
    "description": "可重用的用戶頭像組件設計",
    "type": "component",
    "category": "ui",
    "tags": ["avatar", "user", "component"],
    "filePath": "/uploads/user-avatar.sketch",
    "thumbnailPath": "/thumbnails/user-avatar.png",
    "metadata": {
      "width": 800,
      "height": 600,
      "fileSize": 1048576,
      "lastModified": "2024-01-15T10:35:00Z"
    },
    "status": "active",
    "createdAt": "2024-01-15T10:35:00Z",
    "updatedAt": "2024-01-15T10:35:00Z"
  },
  "message": "設計資產創建成功",
  "timestamp": "2024-01-15T10:35:00Z",
  "requestId": "req_123456790"
}
```

### 3. 更新設計資產

#### 端點
```
PUT /api/design-assets/:id
```

#### 請求體
```typescript
interface UpdateDesignAssetRequest {
  name?: string
  description?: string
  category?: string
  tags?: string[]
  status?: 'active' | 'archived' | 'draft'
}
```

#### 響應示例
```json
{
  "success": true,
  "data": {
    "id": "asset_123",
    "name": "登入表單設計 (更新版)",
    "description": "現代化的登入表單設計稿，包含深色模式",
    "type": "mockup",
    "category": "ui",
    "tags": ["button", "form", "login", "dark-mode"],
    "status": "active",
    "updatedAt": "2024-01-15T10:40:00Z"
  },
  "message": "設計資產更新成功",
  "timestamp": "2024-01-15T10:40:00Z",
  "requestId": "req_123456791"
}
```

### 4. 刪除設計資產

#### 端點
```
DELETE /api/design-assets/:id
```

#### 響應示例
```json
{
  "success": true,
  "message": "設計資產刪除成功",
  "timestamp": "2024-01-15T10:45:00Z",
  "requestId": "req_123456792"
}
```

### 5. 上傳設計資產檔案

#### 端點
```
POST /api/design-assets/upload
```

#### 請求體
使用 `multipart/form-data` 格式：

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `file` | File | 是 | 設計資產檔案 |
| `name` | string | 是 | 資產名稱 |
| `description` | string | 否 | 資產描述 |
| `type` | string | 是 | 資產類型 |
| `category` | string | 是 | 資產分類 |
| `tags` | string | 否 | 標籤，逗號分隔 |

#### 響應示例
```json
{
  "success": true,
  "data": {
    "uploadedFiles": [
      {
        "id": "asset_125",
        "name": "導航欄設計",
        "filePath": "/uploads/navigation-bar.sketch",
        "thumbnailPath": "/thumbnails/navigation-bar.png"
      }
    ],
    "message": "檔案上傳成功"
  },
  "timestamp": "2024-01-15T10:50:00Z",
  "requestId": "req_123456793"
}
```

---

## 模板 API

### 1. 取得模板列表

#### 端點
```
GET /api/templates
```

#### 查詢參數
| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `category` | string | 否 | 模板分類 |
| `complexity` | string | 否 | 複雜度篩選 |
| `search` | string | 否 | 搜尋關鍵字 |

#### 響應示例
```json
{
  "success": true,
  "data": [
    {
      "id": "template_001",
      "name": "數據表格模板",
      "category": "data-display",
      "complexity": "medium",
      "description": "響應式數據表格，支援排序、篩選、分頁",
      "features": ["排序", "篩選", "分頁", "響應式"],
      "previewImage": "/previews/data-table.png",
      "configSchema": {
        "columns": ["array", "string"],
        "dataSource": ["string", "object"],
        "pagination": "boolean",
        "sorting": "boolean"
      }
    }
  ],
  "timestamp": "2024-01-15T11:00:00Z",
  "requestId": "req_123456794"
}
```

### 2. 生成模板

#### 端點
```
POST /api/templates/generate
```

#### 請求體
```typescript
interface GenerateTemplateRequest {
  templateId: string
  designAssetIds: string[]
  outputOptions: {
    html: boolean
    css: boolean
    responsive: boolean
    javascript: boolean
  }
  customizations?: Record<string, any>
}
```

#### 響應示例
```json
{
  "success": true,
  "data": {
    "id": "generation_001",
    "templateId": "template_001",
    "status": "completed",
    "outputs": {
      "html": "/outputs/data-table.html",
      "css": "/outputs/data-table.css",
      "javascript": "/outputs/data-table.js"
    },
    "previewUrl": "/previews/generated-data-table.html",
    "downloadUrl": "/downloads/data-table-package.zip",
    "generatedAt": "2024-01-15T11:05:00Z"
  },
  "message": "模板生成成功",
  "timestamp": "2024-01-15T11:05:00Z",
  "requestId": "req_123456795"
}
```

---

## AI 說明 API

### 1. 生成 AI 說明

#### 端點
```
POST /api/ai-specs/generate
```

#### 請求體
```typescript
interface GenerateAISpecRequest {
  type: AISpecType
  complexity: AISpecComplexity
  designAssetIds: string[]
  templateId?: string
  outputFormats: AISpecFormat[]
  additionalContext?: string
}
```

#### 響應示例
```json
{
  "success": true,
  "data": {
    "id": "aispec_001",
    "type": "responsive-design",
    "complexity": "medium",
    "title": "響應式登入表單開發指南",
    "content": {
      "overview": "本指南將幫助您創建一個完全響應式的登入表單...",
      "requirements": [
        "支援桌面、平板、手機三種設備",
        "表單驗證和錯誤提示",
        "無障礙設計支援"
      ],
      "steps": [
        {
          "step": 1,
          "title": "HTML 結構設計",
          "description": "創建語義化的 HTML 結構...",
          "code": "<form class=\"login-form\">..."
        }
      ]
    },
    "outputFormats": ["markdown", "html", "yaml"],
    "generatedAt": "2024-01-15T11:10:00Z"
  },
  "message": "AI 說明生成成功",
  "timestamp": "2024-01-15T11:10:00Z",
  "requestId": "req_123456796"
}
```

### 2. 下載 AI 說明

#### 端點
```
GET /api/ai-specs/:id/download/:format
```

#### 路徑參數
| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | string | 是 | AI 說明 ID |
| `format` | string | 是 | 下載格式 (markdown, html, yaml, json) |

#### 響應
返回對應格式的檔案內容，Content-Type 根據格式設定。

---

## 系統 API

### 1. 系統狀態

#### 端點
```
GET /api/system/status
```

#### 響應示例
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "status": "running",
    "uptime": 3600,
    "memory": {
      "used": 512,
      "total": 2048
    },
    "disk": {
      "used": 1024,
      "total": 10000
    }
  },
  "timestamp": "2024-01-15T11:15:00Z",
  "requestId": "req_123456797"
}
```

### 2. 系統設定

#### 端點
```
GET /api/system/settings
```

#### 響應示例
```json
{
  "success": true,
  "data": {
    "maxFileSize": 10485760,
    "allowedFileTypes": ["sketch", "fig", "psd", "ai", "svg", "png", "jpg"],
    "thumbnailSize": {
      "width": 300,
      "height": 200
    },
    "outputFormats": ["html", "css", "javascript", "markdown", "yaml"]
  },
  "timestamp": "2024-01-15T11:20:00Z",
  "requestId": "req_123456798"
}
```

---

## WebSocket 事件

### 連接
```
ws://localhost:1420/ws
```

### 事件類型

#### 1. 資產上傳進度
```json
{
  "type": "upload_progress",
  "data": {
    "assetId": "asset_123",
    "progress": 75,
    "status": "uploading"
  }
}
```

#### 2. 模板生成狀態
```json
{
  "type": "template_generation_status",
  "data": {
    "generationId": "generation_001",
    "status": "processing",
    "progress": 60,
    "message": "正在生成 CSS 樣式..."
  }
}
```

#### 3. AI 說明生成狀態
```json
{
  "type": "ai_spec_generation_status",
  "data": {
    "specId": "aispec_001",
    "status": "completed",
    "message": "AI 說明生成完成"
  }
}
```

---

## 速率限制

### 限制規則
- **一般請求**: 100 次/分鐘
- **檔案上傳**: 10 次/分鐘
- **模板生成**: 5 次/分鐘
- **AI 說明生成**: 3 次/分鐘

### 超出限制響應
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "details": {
      "limit": 100,
      "resetTime": "2024-01-15T12:00:00Z"
    }
  },
  "message": "請求頻率過高，請稍後再試",
  "timestamp": "2024-01-15T11:25:00Z",
  "requestId": "req_123456799"
}
```

---

## 測試端點

### 健康檢查
```
GET /api/health
```

### 測試響應
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T11:30:00Z",
    "version": "1.0.0"
  }
}
```

---

## 更新日誌

### v1.0.0 (2024-01-15)
- 初始 API 設計
- 設計資產管理端點
- 模板生成端點
- AI 說明生成端點
- 系統狀態端點

---

**文檔版本**: v1.0.0  
**最後更新**: 2024-01-15  
**維護者**: ErSlice 開發團隊
