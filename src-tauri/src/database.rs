use rusqlite::{Connection, Result, params, Row};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use log::{info, warn};

// 數據庫路徑
const DB_NAME: &str = "erslice.db";

/// 獲取數據庫連接
pub fn get_connection() -> Result<Connection> {
    let db_path = get_database_path();
    let conn = Connection::open(&db_path)?;
    
    // 啟用外鍵約束
    conn.execute("PRAGMA foreign_keys = ON", [])?;
    
    // 創建表（如果不存在）
    create_tables(&conn)?;
    
    Ok(conn)
}

/// 獲取數據庫文件路徑
fn get_database_path() -> String {
    // 在用戶文檔目錄下創建 ErSlice 資料夾
    let home_dir = dirs::home_dir().unwrap_or_else(|| std::path::PathBuf::from("."));
    let erslice_dir = home_dir.join("Documents").join("ErSlice");
    
    // 確保目錄存在
    if !erslice_dir.exists() {
        std::fs::create_dir_all(&erslice_dir).unwrap_or_else(|_| {
            warn!("無法創建 ErSlice 目錄，使用當前目錄");
        });
    }
    
    erslice_dir.join(DB_NAME).to_string_lossy().to_string()
}

/// 創建數據庫表
fn create_tables(conn: &Connection) -> Result<()> {
    // 設計模組表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS design_modules (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'active',
            asset_count INTEGER DEFAULT 0,
            project_slugs TEXT,
            primary_project TEXT,
            created_from TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // 頁面表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS pages (
            id TEXT PRIMARY KEY,
            module_id TEXT NOT NULL,
            slug TEXT NOT NULL,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            meta_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (module_id) REFERENCES design_modules(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // 子頁面表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS subpages (
            id TEXT PRIMARY KEY,
            page_id TEXT NOT NULL,
            slug TEXT NOT NULL,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            meta_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // 資產表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS assets (
            id TEXT PRIMARY KEY,
            module_id TEXT NOT NULL,
            page_id TEXT,
            subpage_id TEXT,
            file_path TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER,
            mime_type TEXT,
            metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (module_id) REFERENCES design_modules(id) ON DELETE CASCADE,
            FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
            FOREIGN KEY (subpage_id) REFERENCES subpages(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // 模板庫表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS templates (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            complexity TEXT,
            estimated_time TEXT,
            tags TEXT,
            content_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // AI 規格表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ai_specs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            type TEXT,
            complexity TEXT,
            format TEXT,
            estimated_time TEXT,
            tags TEXT,
            content_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Figma 導出記錄表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS figma_exports (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            export_format TEXT NOT NULL,
            included_content TEXT,
            module_count INTEGER DEFAULT 0,
            asset_count INTEGER DEFAULT 0,
            token_count INTEGER DEFAULT 0,
            component_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'processing',
            file_size TEXT,
            download_url TEXT,
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    info!("數據庫表創建完成");
    Ok(())
}

// ==================== 設計模組 CRUD ====================

#[derive(Debug, Serialize, Deserialize)]
pub struct DesignModule {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub status: String,
    pub asset_count: i32,
    pub project_slugs: Option<String>, // JSON string
    pub primary_project: Option<String>,
    pub created_from: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl DesignModule {
    pub fn create(&self) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "INSERT INTO design_modules (id, name, description, status, asset_count, project_slugs, primary_project, created_from, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                self.id, self.name, self.description, self.status, self.asset_count,
                self.project_slugs, self.primary_project, self.created_from,
                self.created_at, self.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn read(id: &str) -> Result<Option<Self>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, name, description, status, asset_count, project_slugs, primary_project, created_from, created_at, updated_at
             FROM design_modules WHERE id = ?"
        )?;
        
        let mut rows = stmt.query(params![id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Self::from_row(row)?))
        } else {
            Ok(None)
        }
    }

    pub fn update(&self) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "UPDATE design_modules 
             SET name = ?2, description = ?3, status = ?4, asset_count = ?5, 
                 project_slugs = ?6, primary_project = ?7, updated_at = ?8
             WHERE id = ?1",
            params![
                self.id, self.name, self.description, self.status, self.asset_count,
                self.project_slugs, self.primary_project, self.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn delete(id: &str) -> Result<()> {
        let conn = get_connection()?;
        conn.execute("DELETE FROM design_modules WHERE id = ?", params![id])?;
        Ok(())
    }

    pub fn list_all() -> Result<Vec<Self>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, name, description, status, asset_count, project_slugs, primary_project, created_from, created_at, updated_at
             FROM design_modules ORDER BY updated_at DESC"
        )?;
        
        let rows = stmt.query_map([], |row| Self::from_row(row))?;
        let mut modules = Vec::new();
        for row in rows {
            modules.push(row?);
        }
        Ok(modules)
    }

    pub fn list_by_status(status: &str) -> Result<Vec<Self>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, name, description, status, asset_count, project_slugs, primary_project, created_from, created_at, updated_at
             FROM design_modules WHERE status = ? ORDER BY updated_at DESC"
        )?;
        
        let rows = stmt.query_map(params![status], |row| Self::from_row(row))?;
        let mut modules = Vec::new();
        for row in rows {
            modules.push(row?);
        }
        Ok(modules)
    }

    fn from_row(row: &Row) -> Result<Self> {
        Ok(Self {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            status: row.get(3)?,
            asset_count: row.get(4)?,
            project_slugs: row.get(5)?,
            primary_project: row.get(6)?,
            created_from: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    }
}

// ==================== 模板 CRUD ====================

#[derive(Debug, Serialize, Deserialize)]
pub struct Template {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub complexity: Option<String>,
    pub estimated_time: Option<String>,
    pub tags: Option<String>, // JSON string
    pub content_data: Option<String>, // JSON string
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Template {
    pub fn create(&self) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "INSERT INTO templates (id, name, description, category, complexity, estimated_time, tags, content_data, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                self.id, self.name, self.description, self.category, self.complexity,
                self.estimated_time, self.tags, self.content_data, self.created_at, self.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn read(id: &str) -> Result<Option<Self>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, name, description, category, complexity, estimated_time, tags, content_data, created_at, updated_at
             FROM templates WHERE id = ?"
        )?;
        
        let mut rows = stmt.query(params![id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Self::from_row(row)?))
        } else {
            Ok(None)
        }
    }

    pub fn update(&self) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "UPDATE templates 
             SET name = ?2, description = ?3, category = ?4, complexity = ?5, 
                 estimated_time = ?6, tags = ?7, content_data = ?8, updated_at = ?9
             WHERE id = ?1",
            params![
                self.id, self.name, self.description, self.category, self.complexity,
                self.estimated_time, self.tags, self.content_data, self.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn delete(id: &str) -> Result<()> {
        let conn = get_connection()?;
        conn.execute("DELETE FROM templates WHERE id = ?", params![id])?;
        Ok(())
    }

    pub fn list_all() -> Result<Vec<Self>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, name, description, category, complexity, estimated_time, tags, content_data, created_at, updated_at
             FROM templates ORDER BY updated_at DESC"
        )?;
        
        let rows = stmt.query_map([], |row| Self::from_row(row))?;
        let mut templates = Vec::new();
        for row in rows {
            templates.push(row?);
        }
        Ok(templates)
    }

    fn from_row(row: &Row) -> Result<Self> {
        Ok(Self {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            category: row.get(3)?,
            complexity: row.get(4)?,
            estimated_time: row.get(5)?,
            tags: row.get(6)?,
            content_data: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    }
}

// ==================== AI 規格 CRUD ====================

#[derive(Debug, Serialize, Deserialize)]
pub struct AISpec {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub type_: Option<String>,
    pub complexity: Option<String>,
    pub format: Option<String>,
    pub estimated_time: Option<String>,
    pub tags: Option<String>, // JSON string
    pub content_data: Option<String>, // JSON string
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl AISpec {
    pub fn create(&self) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "INSERT INTO ai_specs (id, title, description, type, complexity, format, estimated_time, tags, content_data, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![
                self.id, self.title, self.description, self.type_, self.complexity,
                self.format, self.estimated_time, self.tags, self.content_data, self.created_at, self.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn read(id: &str) -> Result<Option<Self>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, title, description, type, complexity, format, estimated_time, tags, content_data, created_at, updated_at
             FROM ai_specs WHERE id = ?"
        )?;
        
        let mut rows = stmt.query(params![id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Self::from_row(row)?))
        } else {
            Ok(None)
        }
    }

    pub fn update(&self) -> Result<()> {
        let conn = get_connection()?;
        conn.execute(
            "UPDATE ai_specs 
             SET title = ?2, description = ?3, type = ?4, complexity = ?5, 
                 format = ?6, estimated_time = ?7, tags = ?8, content_data = ?9, updated_at = ?10
             WHERE id = ?1",
            params![
                self.id, self.title, self.description, self.type_, self.complexity,
                self.format, self.estimated_time, self.tags, self.content_data, self.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn delete(id: &str) -> Result<()> {
        let conn = get_connection()?;
        conn.execute("DELETE FROM ai_specs WHERE id = ?", params![id])?;
        Ok(())
    }

    pub fn list_all() -> Result<Vec<Self>> {
        let conn = get_connection()?;
        let mut stmt = conn.prepare(
            "SELECT id, title, description, type, complexity, format, estimated_time, tags, content_data, created_at, updated_at
             FROM ai_specs ORDER BY updated_at DESC"
        )?;
        
        let rows = stmt.query_map([], |row| Self::from_row(row))?;
        let mut specs = Vec::new();
        for row in rows {
            specs.push(row?);
        }
        Ok(specs)
    }

    fn from_row(row: &Row) -> Result<Self> {
        Ok(Self {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            type_: row.get(3)?,
            complexity: row.get(4)?,
            format: row.get(5)?,
            estimated_time: row.get(6)?,
            tags: row.get(7)?,
            content_data: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    }
}

// ==================== 數據庫管理工具 ====================

/// 初始化數據庫
pub fn init_database() -> Result<()> {
    info!("初始化 ErSlice 數據庫...");
    let conn = get_connection()?;
    
    // 檢查數據庫是否為空
    let count: i32 = conn.query_row("SELECT COUNT(*) FROM design_modules", [], |row| row.get(0))?;
    
    if count == 0 {
        info!("數據庫為空，插入初始數據...");
        insert_initial_data(&conn)?;
    }
    
    info!("數據庫初始化完成");
    Ok(())
}

/// 插入初始數據
fn insert_initial_data(conn: &Connection) -> Result<()> {
    // 插入預設的設計模組
    let default_modules = vec![
        ("1", "用戶管理模組", "用戶註冊、登入、權限管理等功能", "active", 15, "demo-project"),
        ("2", "訂單管理模組", "訂單創建、查詢、狀態管理等功能", "active", 12, "ecommerce-shop"),
        ("3", "產品管理模組", "產品目錄、庫存、分類管理等功能", "active", 8, "ecommerce-shop"),
        ("4", "系統設定模組", "系統配置、參數設定、日誌管理等功能", "draft", 6, "dashboard-admin"),
    ];

    for (id, name, description, status, asset_count, primary_project) in default_modules {
        conn.execute(
            "INSERT INTO design_modules (id, name, description, status, asset_count, primary_project, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
            params![id, name, description, status, asset_count, primary_project],
        )?;
    }

    // 插入預設的 AI 規格
    let erslice_spec = AISpec {
        id: "erslice-frontend-style-guide".to_string(),
        title: "ErSlice 前端規範（可執行版）".to_string(),
        description: Some("ErSlice 前端開發規範，包含按鈕系統、顏色規範、排版系統等完整指南".to_string()),
        type_: Some("full-guide".to_string()),
        complexity: Some("intermediate".to_string()),
        format: Some("markdown".to_string()),
        estimated_time: Some("2-3 小時".to_string()),
        tags: Some("[\"前端\", \"規範\", \"UI/UX\", \"設計系統\"]".to_string()),
        content_data: Some("{}".to_string()), // 預設空內容
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };
    erslice_spec.create()?;

    Ok(())
}

/// 備份數據庫
pub fn backup_database() -> Result<String> {
    let db_path = get_database_path();
    let backup_path = format!("{}.backup.{}", db_path, chrono::Utc::now().format("%Y%m%d_%H%M%S"));
    
    std::fs::copy(&db_path, &backup_path)
        .map_err(|e| rusqlite::Error::InvalidPath(format!("備份失敗: {}", e).into()))?;
    info!("數據庫已備份到: {}", backup_path);
    
    Ok(backup_path)
}

/// 恢復數據庫
pub fn restore_database(backup_path: &str) -> Result<()> {
    let db_path = get_database_path();
    
    // 先備份當前數據庫
    let current_backup = format!("{}.restore_backup.{}", db_path, chrono::Utc::now().format("%Y%m%d_%H%M%S"));
    std::fs::copy(&db_path, &current_backup)
        .map_err(|e| rusqlite::Error::InvalidPath(format!("備份當前數據庫失敗: {}", e).into()))?;
    
    // 恢復備份
    std::fs::copy(backup_path, &db_path)
        .map_err(|e| rusqlite::Error::InvalidPath(format!("恢復備份失敗: {}", e).into()))?;
    info!("數據庫已從備份恢復: {}", backup_path);
    
    Ok(())
}

/// 獲取數據庫統計信息
pub fn get_database_stats() -> Result<serde_json::Value> {
    let conn = get_connection()?;
    
    let module_count: i32 = conn.query_row("SELECT COUNT(*) FROM design_modules", [], |row| row.get(0))?;
    let page_count: i32 = conn.query_row("SELECT COUNT(*) FROM pages", [], |row| row.get(0))?;
    let subpage_count: i32 = conn.query_row("SELECT COUNT(*) FROM subpages", [], |row| row.get(0))?;
    let asset_count: i32 = conn.query_row("SELECT COUNT(*) FROM assets", [], |row| row.get(0))?;
    let template_count: i32 = conn.query_row("SELECT COUNT(*) FROM templates", [], |row| row.get(0))?;
    let spec_count: i32 = conn.query_row("SELECT COUNT(*) FROM ai_specs", [], |row| row.get(0))?;
    
    let stats = serde_json::json!({
        "design_modules": module_count,
        "pages": page_count,
        "subpages": subpage_count,
        "assets": asset_count,
        "templates": template_count,
        "ai_specs": spec_count,
        "database_path": get_database_path(),
        "last_updated": chrono::Utc::now().to_rfc3339()
    });
    
    Ok(stats)
}
