use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, Duration};


// 設計資產模組資訊
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DesignModule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub asset_count: usize,
    pub last_updated: String,
    pub status: String,
}

// 資產清單
#[derive(Debug, Serialize, Deserialize)]
pub struct AssetList {
    pub screenshots: Vec<String>,
    pub html: Vec<String>,
    pub css: Vec<String>,
}

// 批量生成結果摘要
#[derive(Debug, Serialize, Deserialize)]
pub struct BulkGenerationResult {
    pub total: usize,
    pub success: Vec<String>,
    pub failed: Vec<String>,
}

// 導出整包結果
#[derive(Debug, Serialize, Deserialize)]
pub struct UnifiedPackageResult {
    pub output_dir: String,
    pub zip_path: Option<String>,
    pub modules_count: usize,
}

// 專案結構（Phase 1：僅 Default）
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectConfig {
    pub name: String,
    pub slug: String,
    pub design_assets_root: Option<String>,
    pub ai_doc_frontend_instructions: Option<String>,
    pub ai_doc_ui_friendly: Option<String>,
    pub zip_default: bool,
    pub include_bone_default: bool,
    pub include_specs_default: bool,
    pub overwrite_strategy_default: Option<String>,
    pub mermaid_theme: Option<String>,
    pub mermaid_layout_direction: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MermaidOptions {
    pub theme: String,
    pub layout_direction: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ActiveProject { slug: String }

fn projects_root() -> PathBuf { PathBuf::from("projects") }

// Performance optimization: Caching system
#[derive(Debug, Clone)]
struct CachedData<T> {
    data: T,
    timestamp: SystemTime,
}

#[derive(Debug, Clone)]
struct SitemapCache {
    module_trees: HashMap<String, CachedData<Vec<PageNode>>>,
    analytics: Option<CachedData<SitemapAnalytics>>,
    design_modules: Option<CachedData<Vec<DesignModule>>>,
}

impl SitemapCache {
    fn new() -> Self {
        Self {
            module_trees: HashMap::new(),
            analytics: None,
            design_modules: None,
        }
    }

    fn is_fresh<T>(cached: &Option<CachedData<T>>, max_age: Duration) -> bool {
        cached.as_ref().map_or(false, |c| 
            c.timestamp.elapsed().unwrap_or(Duration::from_secs(0)) < max_age
        )
    }

    fn is_module_tree_fresh(&self, module_name: &str, max_age: Duration) -> bool {
        self.module_trees.get(module_name).map_or(false, |c|
            c.timestamp.elapsed().unwrap_or(Duration::from_secs(0)) < max_age
        )
    }

    fn invalidate_all(&mut self) {
        self.module_trees.clear();
        self.analytics = None;
        self.design_modules = None;
    }

    fn invalidate_module(&mut self, module_name: &str) {
        self.module_trees.remove(module_name);
        self.analytics = None; // Analytics depend on all modules
    }
}

lazy_static::lazy_static! {
    static ref SITEMAP_CACHE: Arc<Mutex<SitemapCache>> = Arc::new(Mutex::new(SitemapCache::new()));
}

// Cache configuration
const CACHE_DURATION_SHORT: Duration = Duration::from_secs(30);  // 30 seconds for frequently changing data
const CACHE_DURATION_MEDIUM: Duration = Duration::from_secs(300); // 5 minutes for module trees
const CACHE_DURATION_LONG: Duration = Duration::from_secs(600);   // 10 minutes for analytics

fn read_active_slug() -> Option<String> {
    let active = projects_root().join("active.json");
    if let Ok(text) = std::fs::read_to_string(&active) {
        if let Ok(v) = serde_json::from_str::<ActiveProject>(&text) { return Some(v.slug); }
    }
    None
}

fn write_active_slug(slug: &str) -> Result<(), String> {
    let active = projects_root().join("active.json");
    let v = ActiveProject { slug: slug.to_string() };
    std::fs::create_dir_all(projects_root()).map_err(|e| e.to_string())?;
    std::fs::write(active, serde_json::to_string_pretty(&v).unwrap()).map_err(|e| e.to_string())
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PageInfo {
    pub slug: String,
    pub path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PageNode {
    pub slug: String,
    pub path: String,
    pub title: Option<String>,
    pub status: Option<String>,
    pub route: Option<String>,
    pub notes: Option<String>,
    pub domain: Option<String>,
    pub area: Option<String>,
    pub component: Option<String>,
    pub action: Option<String>,
    pub class: Option<String>,
    pub links: Option<Vec<LinkMeta>>,
    pub children: Vec<PageNode>,
}

// 用於保存頁面與子頁順序的檔案格式
#[derive(Debug, Serialize, Deserialize, Default, Clone)]
struct OrderFile {
    pages: Vec<String>,
    subpages: std::collections::HashMap<String, Vec<String>>,
}

fn load_order(module_dir: &std::path::Path) -> OrderFile {
    use std::fs;
    let pages_dir = module_dir.join("pages");
    let order_path = pages_dir.join("_order.json");
    if let Ok(data) = fs::read_to_string(order_path) {
        if let Ok(v) = serde_json::from_str::<OrderFile>(&data) {
            return v;
        }
    }
    OrderFile::default()
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct PageMeta {
    slug: Option<String>,
    title: Option<String>,
    path: Option<String>,
    status: Option<String>,
    route: Option<String>,
    notes: Option<String>,
    domain: Option<String>,
    area: Option<String>,
    component: Option<String>,
    action: Option<String>,
    class: Option<String>,
    mermaid_id: Option<String>,
    links: Option<Vec<LinkMeta>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct LinkMeta {
    to: String,
    label: Option<String>,
}

fn read_page_meta(path: &std::path::Path) -> PageMeta {
    use std::fs;
    let p = path.join("page.json");
    if let Ok(txt) = fs::read_to_string(&p) {
        if let Ok(v) = serde_json::from_str::<PageMeta>(&txt) { return v; }
    }
    PageMeta { slug: None, title: None, path: None, status: None, route: None, notes: None, domain: None, area: None, component: None, action: None, class: None, mermaid_id: None, links: None }
}

fn save_order(module_dir: &std::path::Path, mut of: OrderFile) -> Result<(), Box<dyn std::error::Error>> {
    use std::fs;
    use std::path::Path;
    let pages_dir = module_dir.join("pages");
    if !Path::new(&pages_dir).exists() { fs::create_dir_all(&pages_dir)?; }
    // 去重
    of.pages.dedup();
    for (_k, v) in of.subpages.iter_mut() { v.dedup(); }
    let order_path = pages_dir.join("_order.json");
    fs::write(order_path, serde_json::to_string_pretty(&of)?)?;
    Ok(())
}

// 創建設計資產模組
#[tauri::command]
pub async fn create_design_module(
    name: String,
    description: String,
) -> Result<DesignModule, String> {
    let module = DesignModule {
        id: uuid::Uuid::new_v4().to_string(),
        name,
        description,
        asset_count: 0,
        last_updated: chrono::Utc::now().to_rfc3339(),
        status: "active".to_string(),
    };
    
    // 創建模組目錄
    let module_dir = PathBuf::from("design-assets").join(&module.name);
    if let Err(e) = std::fs::create_dir_all(&module_dir) {
        return Err(format!("創建模組目錄失敗: {}", e));
    }
    
    // 創建子目錄
    let subdirs = ["screenshots", "html", "css"];
    for subdir in subdirs {
        let subdir_path = module_dir.join(subdir);
        if let Err(e) = std::fs::create_dir_all(&subdir_path) {
            return Err(format!("創建子目錄 {} 失敗: {}", subdir, e));
        }
    }
    
    // 創建 README.md
    let readme_content = format!(
        "# {}\n\n{}\n\n## 設計資產\n- screenshots/: Figma 截圖\n- html/: HTML 結構檔案\n- css/: CSS 樣式檔案",
        module.name, module.description
    );
    
    let readme_path = module_dir.join("README.md");
    if let Err(e) = std::fs::write(&readme_path, readme_content) {
        return Err(format!("創建 README.md 失敗: {}", e));
    }
    
    // 使用系統通知
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let _ = Command::new("osascript")
            .arg("-e")
            .arg(format!("display notification \"設計模組 '{}' 創建成功\" with title \"ErSlice\"", module.name))
            .output();
    }
    
    Ok(module)
}

// 獲取設計資產模組列表
#[tauri::command]
pub async fn get_design_modules() -> Result<Vec<DesignModule>, String> {
    let design_assets_dir = PathBuf::from("design-assets");
    
    if !design_assets_dir.exists() {
        return Ok(Vec::new());
    }
    
    let mut modules = Vec::new();
    
    if let Ok(entries) = std::fs::read_dir(&design_assets_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                        let module = DesignModule {
                            id: name.to_string(),
                            name: name.to_string(),
                            description: "設計資產模組".to_string(),
                            asset_count: count_assets(&path),
                            last_updated: get_last_modified(&path),
                            status: "active".to_string(),
                        };
                        modules.push(module);
                    }
                }
            }
        }
    }
    
    Ok(modules)
}

// 獲取封存的設計資產模組列表
#[tauri::command]
pub async fn get_archived_design_modules() -> Result<Vec<DesignModule>, String> {
    let archived_dir = PathBuf::from("design-assets-archived");

    if !archived_dir.exists() {
        return Ok(Vec::new());
    }

    let mut modules = Vec::new();

    if let Ok(entries) = std::fs::read_dir(&archived_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                        let module = DesignModule {
                            id: name.to_string(),
                            name: name.to_string(),
                            description: "封存的設計資產模組".to_string(),
                            asset_count: count_assets(&path),
                            last_updated: get_last_modified(&path),
                            status: "archived".to_string(),
                        };
                        modules.push(module);
                    }
                }
            }
        }
    }

    Ok(modules)
}

// 計算資產數量
fn count_assets(module_dir: &PathBuf) -> usize {
    let mut count = 0;
    
    if let Ok(entries) = std::fs::read_dir(module_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_file() {
                    count += 1;
                }
            }
        }
    }
    
    count
}

// 獲取最後修改時間
fn get_last_modified(path: &PathBuf) -> String {
    if let Ok(metadata) = std::fs::metadata(path) {
        if let Ok(modified) = metadata.modified() {
            if let Ok(datetime) = modified.duration_since(std::time::UNIX_EPOCH) {
                let chrono_time = chrono::DateTime::from_timestamp(
                    datetime.as_secs() as i64,
                    datetime.subsec_nanos(),
                );
                if let Some(time) = chrono_time {
                    return time.format("%Y-%m-%d %H:%M").to_string();
                }
            }
        }
    }
    
    "未知".to_string()
}

// 上傳設計資產
#[tauri::command]
pub async fn upload_design_asset(
    asset_path: String,
    asset_type: String,
    file_path: String,
) -> Result<String, String> {
    let base_dir = PathBuf::from("design-assets").join(&asset_path);
    
    // 確保目標目錄存在
    if let Err(e) = std::fs::create_dir_all(&base_dir) {
        return Err(format!("無法建立資產目錄: {}", e));
    }
    
    let target_dir = match asset_type.as_str() {
        "screenshots" => base_dir.join("screenshots"),
        "html" => base_dir.join("html"),
        "css" => base_dir.join("css"),
        _ => return Err("不支援的資產類型".to_string()),
    };
    
    let source_path = PathBuf::from(file_path);
    let file_name = source_path.file_name()
        .ok_or("無效的檔案路徑")?
        .to_str()
        .ok_or("檔案名稱包含無效字符")?;
    
    // 確保目標資產類型目錄存在
    if let Err(e) = std::fs::create_dir_all(&target_dir) {
        return Err(format!("無法建立資產類型目錄: {}", e));
    }
    
    let target_path = target_dir.join(file_name);
    
    // 複製檔案
    if let Err(e) = std::fs::copy(&source_path, &target_path) {
        return Err(format!("複製檔案失敗: {}", e));
    }
    
    // 使用系統通知
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let _ = Command::new("osascript")
            .arg("-e")
            .arg(format!("display notification \"資產 '{}' 成功上傳至 '{}'\" with title \"ErSlice\"", file_name, asset_path))
            .output();
    }
    
    Ok(format!("資產上傳成功: {}", target_path.display()))
}

// 生成切版說明包
#[tauri::command]
pub async fn generate_slice_package(
    module_name: String,
    include_html: bool,
    include_css: bool,
    include_responsive: bool,
) -> Result<String, String> {
    let module_dir = PathBuf::from("design-assets").join(&module_name);
    
    if !module_dir.exists() {
        return Err("設計模組不存在".to_string());
    }
    
    // 創建輸出目錄
    let output_dir = PathBuf::from("output").join(&module_name);
    if let Err(e) = std::fs::create_dir_all(&output_dir) {
        return Err(format!("創建輸出目錄失敗: {}", e));
    }
    
    // 複製資產
    if let Err(e) = copy_assets(&module_dir, &output_dir) {
        return Err(format!("複製資產失敗: {}", e));
    }
    
    // 生成 HTML 模板
    if include_html {
        if let Err(e) = generate_html_template_with_strategy(&module_name, &output_dir, "overwrite") {
            return Err(format!("生成 HTML 模板失敗: {}", e));
        }
    }
    
    // 生成 CSS 樣式
    if include_css {
        if let Err(e) = generate_css_styles_with_strategy(&module_name, &output_dir, include_responsive, "overwrite") {
            return Err(format!("生成 CSS 樣式失敗: {}", e));
        }
    }
    
    // 生成 AI 切版說明
    if let Err(e) = generate_ai_spec_with_strategy(&module_name, &output_dir, "overwrite") {
        return Err(format!("生成 AI 切版說明失敗: {}", e));
    }
    
    // 使用系統通知
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let _ = Command::new("osascript")
            .arg("-e")
            .arg(format!("display notification \"切版說明包生成成功\" with title \"ErSlice\""))
            .output();
    }
    
    Ok(format!("切版說明包生成成功: {}", output_dir.display()))
}

// 批量生成：為所有設計資產模組生成切版說明包
#[tauri::command]
pub async fn generate_all_slice_packages(
    include_html: bool,
    include_css: bool,
    include_responsive: bool,
    overwrite_strategy: String,
) -> Result<BulkGenerationResult, String> {
    let root = PathBuf::from("design-assets");
    if !root.exists() {
        return Err("設計資產目錄不存在".to_string());
    }

    let mut modules: Vec<String> = Vec::new();
    if let Ok(entries) = std::fs::read_dir(&root) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    modules.push(name.to_string());
                }
            }
        }
    }

    let mut success: Vec<String> = Vec::new();
    let mut failed: Vec<String> = Vec::new();

    for module_name in modules.iter() {
        let module_dir = root.join(module_name);

        // 建立輸出目錄
        let output_dir = PathBuf::from("output").join(module_name);
        if let Err(e) = std::fs::create_dir_all(&output_dir) {
            failed.push(format!("{}: 創建輸出失敗: {}", module_name, e));
            continue;
        }

        // 複製資產
        if let Err(e) = copy_assets_with_strategy(&module_dir, &output_dir, &overwrite_strategy) {
            failed.push(format!("{}: 複製資產失敗: {}", module_name, e));
            continue;
        }

        // 生成 HTML/CSS
        if include_html {
            if let Err(e) = generate_html_template_with_strategy(module_name, &output_dir, &overwrite_strategy) {
                failed.push(format!("{}: 生成 HTML 失敗: {}", module_name, e));
                continue;
            }
        }
        if include_css {
            if let Err(e) = generate_css_styles_with_strategy(module_name, &output_dir, include_responsive, &overwrite_strategy) {
                failed.push(format!("{}: 生成 CSS 失敗: {}", module_name, e));
                continue;
            }
        }

        // 生成 AI 說明（與單項一致）
        if let Err(e) = generate_ai_spec_with_strategy(module_name, &output_dir, &overwrite_strategy) {
            failed.push(format!("{}: 生成 AI 說明失敗: {}", module_name, e));
            continue;
        }

        success.push(format!("切版說明包生成成功: {}", output_dir.display()));
    }

    Ok(BulkGenerationResult {
        total: success.len() + failed.len(),
        success,
        failed,
    })
}

// 指定模組清單之批量生成
#[tauri::command]
pub async fn generate_selected_slice_packages(
    modules: Vec<String>,
    include_html: bool,
    include_css: bool,
    include_responsive: bool,
    overwrite_strategy: String,
) -> Result<BulkGenerationResult, String> {
    let root = PathBuf::from("design-assets");
    if !root.exists() {
        return Err("設計資產目錄不存在".to_string());
    }
    let mut success: Vec<String> = Vec::new();
    let mut failed: Vec<String> = Vec::new();

    for module_name in modules.iter() {
        let module_dir = root.join(module_name);
        if !module_dir.exists() {
            failed.push(format!("{}: 模組不存在", module_name));
            continue;
        }
        let output_dir = PathBuf::from("output").join(module_name);
        if let Err(e) = std::fs::create_dir_all(&output_dir) {
            failed.push(format!("{}: 創建輸出失敗: {}", module_name, e));
            continue;
        }

        if let Err(e) = copy_assets_with_strategy(&module_dir, &output_dir, &overwrite_strategy) {
            failed.push(format!("{}: 複製資產失敗: {}", module_name, e));
            continue;
        }

        if include_html {
            if let Err(e) = generate_html_template_with_strategy(module_name, &output_dir, &overwrite_strategy) {
                failed.push(format!("{}: 生成 HTML 失敗: {}", module_name, e));
                continue;
            }
        }
        if include_css {
            if let Err(e) = generate_css_styles_with_strategy(module_name, &output_dir, include_responsive, &overwrite_strategy) {
                failed.push(format!("{}: 生成 CSS 失敗: {}", module_name, e));
                continue;
            }
        }
        if let Err(e) = generate_ai_spec_with_strategy(module_name, &output_dir, &overwrite_strategy) {
            failed.push(format!("{}: 生成 AI 說明失敗: {}", module_name, e));
            continue;
        }

        success.push(format!("切版說明包生成成功: {}", output_dir.display()));
    }

    Ok(BulkGenerationResult { total: success.len() + failed.len(), success, failed })
}

// 複製資產檔案
fn copy_assets(source_dir: &PathBuf, target_dir: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    if let Ok(entries) = std::fs::read_dir(source_dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                let target_path = target_dir.join(path.file_name().unwrap());
                
                if path.is_file() {
                    std::fs::copy(&path, &target_path)?;
                } else if path.is_dir() {
                    std::fs::create_dir_all(&target_path)?;
                    copy_assets(&path, &target_path)?;
                }
            }
        }
    }
    
    Ok(())
}

// 生成 HTML 模板
fn generate_html_template(module_name: &str, output_dir: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    let html_content = format!(
        r#"<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="{}">
        <!-- 這裡是 {} 模組的 HTML 結構 -->
        <header class="header">
            <h1>{}</h1>
        </header>
        
        <main class="main-content">
            <p>請根據設計稿完善 HTML 結構</p>
        </main>
    </div>
</body>
</html>"#,
        module_name, module_name.to_lowercase().replace(" ", "-"), module_name, module_name
    );
    
    let html_path = output_dir.join("index.html");
    std::fs::write(&html_path, html_content)?;
    
    Ok(())
}

// 生成 CSS 樣式
fn generate_css_styles(
    module_name: &str, 
    output_dir: &PathBuf, 
    include_responsive: bool
) -> Result<(), Box<dyn std::error::Error>> {
    let mut css_content = format!(
        r#"/* {} 模組樣式 */

.{} {{
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
    color: #333;
}}

.header {{
    background: #f8f9fa;
    padding: 2rem;
    text-align: center;
    border-bottom: 1px solid #e9ecef;
}}

.header h1 {{
    margin: 0;
    color: #495057;
    font-size: 2rem;
    font-weight: 600;
}}

.main-content {{
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}}

.main-content p {{
    font-size: 1.1rem;
    color: #6c757d;
    text-align: center;
}}"#,
        module_name, module_name.to_lowercase().replace(" ", "-")
    );
    
    if include_responsive {
        css_content.push_str(
            r#"

/* 響應式設計 */
@media (max-width: 768px) {
    .header {
        padding: 1rem;
    }
    
    .header h1 {
        font-size: 1.5rem;
    }
    
    .main-content {
        padding: 1rem;
    }
}

@media (max-width: 480px) {
    .header h1 {
        font-size: 1.25rem;
    }
}"#
        );
    }
    
    let css_path = output_dir.join("styles.css");
    std::fs::write(&css_path, css_content)?;
    
    Ok(())
}

// 生成 AI 切版說明
fn generate_ai_spec(module_name: &str, output_dir: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    let spec_content = format!(
        r#"# {} 模組切版說明

## 概述
這是 {} 模組的前端切版說明，AI 可以根據此說明完成前端開發。

## 檔案結構
```
{0}/
├── screenshots/     # 設計稿截圖
├── html/           # HTML 結構檔案
├── css/            # CSS 樣式檔案
├── index.html      # 主頁面模板
├── styles.css      # 樣式檔案
└── ai-spec.md      # 本說明檔案
```

## 切版要求

### 佈局結構
- 使用語義化 HTML 標籤
- 確保良好的可訪問性
- 遵循設計稿的視覺層次

### 樣式設計
- 使用 CSS Grid 或 Flexbox 佈局
- 實現響應式設計
- 保持設計一致性

### 互動功能
- 實現必要的 JavaScript 功能
- 確保良好的用戶體驗
- 添加適當的動畫效果

## 開發建議
1. 先分析設計稿的佈局結構
2. 建立 HTML 骨架
3. 實現基礎樣式
4. 添加響應式設計
5. 完善互動功能
6. 測試和優化

## 注意事項
- 確保跨瀏覽器相容性
- 優化效能和載入速度
- 遵循 Web 標準和最佳實踐
"#,
        module_name, module_name
    );
    
    let spec_path = output_dir.join("ai-spec.md");
    std::fs::write(&spec_path, spec_content)?;
    
    Ok(())
}

// ====== 策略輔助 ======
fn write_text_with_strategy(target_path: &PathBuf, content: &str, strategy: &str) -> Result<(), Box<dyn std::error::Error>> {
    match strategy {
        "skip" => {
            if target_path.exists() { return Ok(()); }
            std::fs::write(target_path, content)?;
        },
        "rename" => {
            let path = if target_path.exists() { next_available_path(target_path) } else { target_path.clone() };
            std::fs::write(path, content)?;
        },
        _ => { // overwrite
            std::fs::write(target_path, content)?;
        }
    }
    Ok(())
}

fn copy_file_with_strategy(src: &PathBuf, dest: &PathBuf, strategy: &str) -> Result<(), Box<dyn std::error::Error>> {
    match strategy {
        "skip" => {
            if dest.exists() { return Ok(()); }
            std::fs::copy(src, dest)?;
        },
        "rename" => {
            let path = if dest.exists() { next_available_path(dest) } else { dest.clone() };
            std::fs::copy(src, path)?;
        },
        _ => { // overwrite
            std::fs::copy(src, dest)?;
        }
    }
    Ok(())
}

fn copy_assets_with_strategy(source_dir: &PathBuf, target_dir: &PathBuf, strategy: &str) -> Result<(), Box<dyn std::error::Error>> {
    if let Ok(entries) = std::fs::read_dir(source_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            let target_path = target_dir.join(path.file_name().unwrap());
            if path.is_file() {
                copy_file_with_strategy(&path, &target_path, strategy)?;
            } else if path.is_dir() {
                std::fs::create_dir_all(&target_path)?;
                copy_assets_with_strategy(&path, &target_path, strategy)?;
            }
        }
    }
    Ok(())
}

fn next_available_path(original: &PathBuf) -> PathBuf {
    use std::path::Path;
    let parent = original.parent().unwrap_or(Path::new("."));
    let file_name = original.file_stem().and_then(|s| s.to_str()).unwrap_or("");
    let ext = original.extension().and_then(|s| s.to_str()).unwrap_or("");
    let mut i = 1;
    loop {
        let candidate = if ext.is_empty() {
            parent.join(format!("{}-{}", file_name, i))
        } else {
            parent.join(format!("{}-{}.{}", file_name, i, ext))
        };
        if !candidate.exists() { return candidate; }
        i += 1;
    }
}

fn generate_html_template_with_strategy(module_name: &str, output_dir: &PathBuf, strategy: &str) -> Result<(), Box<dyn std::error::Error>> {
    let html_content = format!(
        r#"<!DOCTYPE html>
<html lang=\"zh-TW\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>{}</title>
    <link rel=\"stylesheet\" href=\"styles.css\">
</head>
<body>
    <div class=\"{}\">
        <!-- 這裡是 {} 模組的 HTML 結構 -->
        <header class=\"header\">
            <h1>{}</h1>
        </header>
        
        <main class=\"main-content\">
            <p>請根據設計稿完善 HTML 結構</p>
        </main>
    </div>
</body>
</html>"#,
        module_name, module_name.to_lowercase().replace(" ", "-"), module_name, module_name
    );
    let html_path = output_dir.join("index.html");
    write_text_with_strategy(&html_path, &html_content, strategy)?;
    Ok(())
}

fn generate_css_styles_with_strategy(
    module_name: &str,
    output_dir: &PathBuf,
    include_responsive: bool,
    strategy: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut css_content = format!(
        r#"/* {} 模組樣式 */

.{} {{
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.6;
    color: #333;
}}

.header {{
    background: #f8f9fa;
    padding: 2rem;
    text-align: center;
    border-bottom: 1px solid #e9ecef;
}}

.header h1 {{
    margin: 0;
    color: #495057;
    font-size: 2rem;
    font-weight: 600;
}}

.main-content {{
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}}

.main-content p {{
    font-size: 1.1rem;
    color: #6c757d;
    text-align: center;
}}"#,
        module_name, module_name.to_lowercase().replace(" ", "-")
    );
    if include_responsive {
        css_content.push_str(
            r#"

/* 響應式設計 */
@media (max-width: 768px) {
    .header {
        padding: 1rem;
    }
    
    .header h1 {
        font-size: 1.5rem;
    }
    
    .main-content {
        padding: 1rem;
    }
}

@media (max-width: 480px) {
    .header h1 {
        font-size: 1.25rem;
    }
}"#
        );
    }
    let css_path = output_dir.join("styles.css");
    write_text_with_strategy(&css_path, &css_content, strategy)?;
    Ok(())
}

fn generate_ai_spec_with_strategy(module_name: &str, output_dir: &PathBuf, strategy: &str) -> Result<(), Box<dyn std::error::Error>> {
    let spec_content = format!(
        r#"# {} 模組切版說明

## 概述
這是 {} 模組的前端切版說明，AI 可以根據此說明完成前端開發。

## 檔案結構
```
{0}/
├── screenshots/     # 設計稿截圖
├── html/           # HTML 結構檔案
├── css/            # CSS 樣式檔案
├── index.html      # 主頁面模板
├── styles.css      # 樣式檔案
└── ai-spec.md      # 本說明檔案
```

## 切版要求

### 佈局結構
- 使用語義化 HTML 標籤
- 確保良好的可訪問性
- 遵循設計稿的視覺層次

### 樣式設計
- 使用 CSS Grid 或 Flexbox 佈局
- 實現響應式設計
- 保持設計一致性

### 互動功能
- 實現必要的 JavaScript 功能
- 確保良好的用戶體驗
- 添加適當的動畫效果

## 開發建議
1. 先分析設計稿的佈局結構
2. 建立 HTML 骨架
3. 實現基礎樣式
4. 添加響應式設計
5. 完善互動功能
6. 測試和優化

## 注意事項
- 確保跨瀏覽器相容性
- 優化效能和載入速度
- 遵循 Web 標準和最佳實踐
"#,
        module_name, module_name
    );
    let spec_path = output_dir.join("ai-spec.md");
    write_text_with_strategy(&spec_path, &spec_content, strategy)?;
    Ok(())
}

// ====== Project minimal APIs ======
#[tauri::command]
pub async fn get_or_init_default_project() -> Result<ProjectConfig, String> {
    use std::fs;
    // 若已設定 active 專案，直接回傳其設定
    if let Some(slug) = read_active_slug() {
        let pdir = projects_root().join(&slug);
        let cfg_path = pdir.join("project.json");
        if cfg_path.exists() {
            let raw = std::fs::read_to_string(&cfg_path).map_err(|e| format!("讀取 project.json 失敗: {}", e))?;
            let cfg: ProjectConfig = serde_json::from_str(&raw).map_err(|e| format!("解析 project.json 失敗: {}", e))?;
            return Ok(cfg);
        }
    }
    let projects_root = projects_root().join("default");
    if let Err(e) = fs::create_dir_all(&projects_root) {
        return Err(format!("建立 projects/default 失敗: {}", e));
    }
    let config_path = projects_root.join("project.json");
    if !config_path.exists() {
        let cfg = ProjectConfig {
            name: "Default Project".to_string(),
            slug: "default".to_string(),
            design_assets_root: None,
            ai_doc_frontend_instructions: None,
            ai_doc_ui_friendly: None,
            zip_default: true,
            include_bone_default: false,
            include_specs_default: false,
            overwrite_strategy_default: Some("overwrite".to_string()),
            mermaid_theme: Some("default".to_string()),
            mermaid_layout_direction: Some("TD".to_string()),
        };
        if let Err(e) = std::fs::write(&config_path, serde_json::to_string_pretty(&cfg).unwrap()) {
            return Err(format!("寫入 project.json 失敗: {}", e));
        }
        return Ok(cfg);
    }
    let raw = std::fs::read_to_string(&config_path).map_err(|e| format!("讀取 project.json 失敗: {}", e))?;
    let cfg: ProjectConfig = serde_json::from_str(&raw).map_err(|e| format!("解析 project.json 失敗: {}", e))?;
    Ok(cfg)
}

#[tauri::command]
pub async fn update_default_project(config: ProjectConfig) -> Result<ProjectConfig, String> {
    use std::fs;
    // 更新目前 active 專案（若存在），否則更新 default
    let slug = read_active_slug().unwrap_or_else(|| "default".to_string());
    let projects_root = projects_root().join(&slug);
    if let Err(e) = fs::create_dir_all(&projects_root) {
        return Err(format!("建立 projects/default 失敗: {}", e));
    }
    let config_path = projects_root.join("project.json");
    std::fs::write(&config_path, serde_json::to_string_pretty(&config).unwrap())
        .map_err(|e| format!("寫入 project.json 失敗: {}", e))?;
    Ok(config)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectListItem { pub slug: String, pub name: String }

#[tauri::command]
pub async fn list_projects() -> Result<Vec<ProjectListItem>, String> {
    use std::fs;
    let mut out: Vec<ProjectListItem> = Vec::new();
    let root = projects_root();
    if let Ok(entries) = fs::read_dir(&root) {
        for e in entries.flatten() {
            let p = e.path();
            if p.is_dir() {
                if let Some(slug) = p.file_name().and_then(|s| s.to_str()) {
                    let cfgp = p.join("project.json");
                    if cfgp.exists() {
                        if let Ok(raw) = std::fs::read_to_string(&cfgp) {
                            if let Ok(cfg) = serde_json::from_str::<ProjectConfig>(&raw) {
                                out.push(ProjectListItem { slug: slug.to_string(), name: cfg.name });
                            }
                        }
                    }
                }
            }
        }
    }
    // 確保 default 存在
    if out.iter().all(|i| i.slug != "default") {
        let _ = get_or_init_default_project().await; // ignore result
        out.push(ProjectListItem { slug: "default".to_string(), name: "Default Project".to_string() });
    }
    out.sort_by(|a,b| a.slug.cmp(&b.slug));
    Ok(out)
}

#[tauri::command]
pub async fn create_project(slug: String, name: String) -> Result<ProjectConfig, String> {
    if slug.trim().is_empty() { return Err("slug 不可為空".into()); }
    let dir = projects_root().join(&slug);
    if dir.exists() { return Err("slug 已存在".into()); }
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let cfg = ProjectConfig {
        name, slug: slug.clone(), design_assets_root: None, ai_doc_frontend_instructions: None, ai_doc_ui_friendly: None,
        zip_default: true, include_bone_default: false, include_specs_default: false, overwrite_strategy_default: Some("overwrite".into()),
        mermaid_theme: Some("default".to_string()), mermaid_layout_direction: Some("TD".to_string())
    };
    std::fs::write(dir.join("project.json"), serde_json::to_string_pretty(&cfg).unwrap()).map_err(|e| e.to_string())?;
    Ok(cfg)
}

#[tauri::command]
pub async fn delete_project(slug: String) -> Result<String, String> {
    let dir = projects_root().join(&slug);
    if !dir.exists() { return Err("專案不存在".into()); }
    std::fs::remove_dir_all(&dir).map_err(|e| e.to_string())?;
    // 若刪除的是 active，重設為 default
    if read_active_slug().as_deref() == Some(&slug) {
        let _ = write_active_slug("default");
    }
    Ok("已刪除專案".into())
}

#[tauri::command]
pub async fn switch_project(slug: String) -> Result<ProjectConfig, String> {
    // 驗證存在
    let dir = projects_root().join(&slug);
    let cfgp = dir.join("project.json");
    if !cfgp.exists() { return Err("專案不存在".into()); }
    write_active_slug(&slug)?;
    // 回傳新 active 設定
    let raw = std::fs::read_to_string(&cfgp).map_err(|e| e.to_string())?;
    let cfg: ProjectConfig = serde_json::from_str(&raw).map_err(|e| e.to_string())?;
    Ok(cfg)
}

// Helper function to get current Mermaid settings
fn get_mermaid_settings() -> MermaidOptions {
    // Directly read the project config file if available
    let projects_root = projects_root();
    let slug = read_active_slug().unwrap_or_else(|| "default".to_string());
    let config_path = projects_root.join(&slug).join("project.json");
    
    if let Ok(raw) = std::fs::read_to_string(&config_path) {
        if let Ok(cfg) = serde_json::from_str::<ProjectConfig>(&raw) {
            return MermaidOptions {
                theme: cfg.mermaid_theme.unwrap_or_else(|| "default".to_string()),
                layout_direction: cfg.mermaid_layout_direction.unwrap_or_else(|| "TD".to_string())
            };
        }
    }
    
    // Fallback defaults
    MermaidOptions {
        theme: "default".to_string(),
        layout_direction: "TD".to_string()
    }
}

// ====== Pages under module (top-level only, Phase 1) ======
#[tauri::command]
pub async fn get_module_pages(module_name: String) -> Result<Vec<PageInfo>, String> {
    use std::fs;
    let module_dir = PathBuf::from("design-assets").join(&module_name);
    if !module_dir.exists() {
        return Err("設計模組不存在".to_string());
    }
    let pages_dir = module_dir.join("pages");
    let mut list: Vec<PageInfo> = Vec::new();
    if let Ok(entries) = fs::read_dir(&pages_dir) {
        for entry in entries.flatten() {
            let p = entry.path();
            if p.is_dir() {
                if let Some(slug) = p.file_name().and_then(|s| s.to_str()) {
                    list.push(PageInfo { slug: slug.to_string(), path: format!("/{}/{}", module_name, slug) });
                }
            }
        }
    }
    Ok(list)
}

#[tauri::command]
pub async fn create_module_page(module_name: String, slug: String) -> Result<PageInfo, String> {
    let module_dir = PathBuf::from("design-assets").join(&module_name);
    if !module_dir.exists() { return Err("設計模組不存在".to_string()); }
    if slug.trim().is_empty() { return Err("頁面代稱不可為空".to_string()); }
    if slug.contains('/') { return Err("頁面代稱不可包含 '/'".to_string()); }
    let page_dir = module_dir.join("pages").join(&slug);
    std::fs::create_dir_all(page_dir.join("screenshots")).map_err(|e| format!("建立資料夾失敗: {}", e))?;
    std::fs::create_dir_all(page_dir.join("html")).map_err(|e| format!("建立資料夾失敗: {}", e))?;
    std::fs::create_dir_all(page_dir.join("css")).map_err(|e| format!("建立資料夾失敗: {}", e))?;
    
    // Invalidate cache
    {
        let mut cache = SITEMAP_CACHE.lock().unwrap();
        cache.invalidate_module(&module_name);
    }
    let meta = serde_json::json!({
        "slug": slug,
        "title": slug,
        "path": format!("/{}/{}", module_name, slug),
        "status": "draft",
        "route": format!("/{}/{}", module_name, slug),
        "notes": "",
        "createdAt": chrono::Utc::now().to_rfc3339(),
    });
    std::fs::write(page_dir.join("page.json"), serde_json::to_string_pretty(&meta).unwrap())
        .map_err(|e| format!("寫入 page.json 失敗: {}", e))?;
    Ok(PageInfo { slug: slug.clone(), path: format!("/{}/{}", module_name, slug) })
}

#[tauri::command]
pub async fn delete_module_page(module_name: String, slug: String) -> Result<String, String> {
    let page_dir = PathBuf::from("design-assets").join(&module_name).join("pages").join(&slug);
    if !page_dir.exists() { return Err("目標頁面不存在".to_string()); }
    std::fs::remove_dir_all(&page_dir).map_err(|e| format!("刪除頁面失敗: {}", e))?;
    Ok(format!("已刪除頁面: {}", slug))
}

#[tauri::command]
pub async fn rename_module_page(module_name: String, from_slug: String, to_slug: String) -> Result<PageInfo, String> {
    if to_slug.trim().is_empty() { return Err("新代稱不可為空".to_string()); }
    if to_slug.contains('/') { return Err("新代稱不可包含 '/'".to_string()); }
    let pages_dir = PathBuf::from("design-assets").join(&module_name).join("pages");
    let from = pages_dir.join(&from_slug);
    let to = pages_dir.join(&to_slug);
    if !from.exists() { return Err("來源頁面不存在".to_string()); }
    if to.exists() { return Err("目標代稱已存在".to_string()); }
    std::fs::rename(&from, &to).map_err(|e| format!("重新命名失敗: {}", e))?;
    Ok(PageInfo { slug: to_slug.clone(), path: format!("/{}/{}", module_name, to_slug) })
}

// ====== Subpages (one-level) ======
#[tauri::command]
pub async fn get_module_tree(module_name: String) -> Result<Vec<PageNode>, String> {
    // Check cache first
    {
        let cache = SITEMAP_CACHE.lock().unwrap();
        if cache.is_module_tree_fresh(&module_name, CACHE_DURATION_MEDIUM) {
            if let Some(cached) = cache.module_trees.get(&module_name) {
                return Ok(cached.data.clone());
            }
        }
    }

    // Build tree from filesystem
    let result = build_module_tree_uncached(&module_name)?;

    // Cache the result
    {
        let mut cache = SITEMAP_CACHE.lock().unwrap();
        cache.module_trees.insert(module_name.clone(), CachedData {
            data: result.clone(),
            timestamp: SystemTime::now(),
        });
    }

    Ok(result)
}

fn build_module_tree_uncached(module_name: &str) -> Result<Vec<PageNode>, String> {
    use std::fs;
    let module_dir = PathBuf::from("design-assets").join(module_name);
    if !module_dir.exists() { return Err("設計模組不存在".to_string()); }
    let pages_dir = module_dir.join("pages");
    let mut map_pages: std::collections::BTreeMap<String, PageNode> = std::collections::BTreeMap::new();
    if let Ok(entries) = fs::read_dir(&pages_dir) {
        for entry in entries.flatten() {
            let p = entry.path();
            if p.is_dir() {
                if let Some(slug) = p.file_name().and_then(|s| s.to_str()) {
                    // 掃描子頁
                    let mut children: Vec<PageNode> = Vec::new();
                    let sub_dir = p.join("subpages");
                    if let Ok(sub_entries) = fs::read_dir(&sub_dir) {
                        for se in sub_entries.flatten() {
                            let sp = se.path();
                            if sp.is_dir() {
                                if let Some(ss) = sp.file_name().and_then(|s| s.to_str()) {
                                    let m = read_page_meta(&sp);
                                    children.push(PageNode {
                                        slug: ss.to_string(),
                                        path: m.path.clone().unwrap_or_else(|| format!("/{}/{}/{}", module_name, slug, ss)),
                                        title: m.title.clone(),
                                        status: m.status.clone(),
                                        route: m.route.clone(),
                                        notes: m.notes.clone(),
                                        domain: m.domain.clone(),
                                        area: m.area.clone(),
                                        component: m.component.clone(),
                                        action: m.action.clone(),
                                        class: m.class.clone(),
                                        links: m.links.clone(),
                                        children: vec![],
                                    });
                                }
                            }
                        }
                    }
                    let m = read_page_meta(&p);
                    map_pages.insert(slug.to_string(), PageNode {
                        slug: slug.to_string(),
                        path: m.path.clone().unwrap_or_else(|| format!("/{}/{}", module_name, slug)),
                        title: m.title.clone(),
                        status: m.status.clone(),
                        route: m.route.clone(),
                        notes: m.notes.clone(),
                        domain: m.domain.clone(),
                        area: m.area.clone(),
                        component: m.component.clone(),
                        action: m.action.clone(),
                        class: m.class.clone(),
                        links: m.links.clone(),
                        children,
                    });
                }
            }
        }
    }
    // 依 _order.json 排序
    let order = load_order(&module_dir);
    // 頁面排序
    let mut tree: Vec<PageNode> = Vec::new();
    if !order.pages.is_empty() {
        for slug in order.pages.iter() {
            if let Some(mut node) = map_pages.remove(slug) {
                // 子頁排序
                if let Some(subo) = order.subpages.get(slug) {
                    node.children.sort_by_key(|c| subo.iter().position(|s| s == &c.slug).unwrap_or(usize::MAX));
                } else {
                    node.children.sort_by(|a,b| a.slug.to_lowercase().cmp(&b.slug.to_lowercase()));
                }
                tree.push(node);
            }
        }
    }
    // 其餘按字母序，子頁也按字母序
    let mut rest: Vec<_> = map_pages.into_values().collect();
    rest.sort_by(|a,b| a.slug.to_lowercase().cmp(&b.slug.to_lowercase()));
    for mut node in rest.into_iter() {
        node.children.sort_by(|a,b| a.slug.to_lowercase().cmp(&b.slug.to_lowercase()));
        tree.push(node);
    }
    Ok(tree)
}

#[tauri::command]
pub async fn create_subpage(module_name: String, parent_slug: String, slug: String) -> Result<PageInfo, String> {
    if slug.trim().is_empty() { return Err("子頁代稱不可為空".to_string()); }
    if slug.contains('/') { return Err("子頁代稱不可包含 '/'".to_string()); }
    let base = PathBuf::from("design-assets").join(&module_name).join("pages").join(&parent_slug).join("subpages").join(&slug);
    std::fs::create_dir_all(base.join("screenshots")).map_err(|e| format!("建立資料夾失敗: {}", e))?;
    std::fs::create_dir_all(base.join("html")).map_err(|e| format!("建立資料夾失敗: {}", e))?;
    std::fs::create_dir_all(base.join("css")).map_err(|e| format!("建立資料夾失敗: {}", e))?;
    
    // Invalidate cache
    {
        let mut cache = SITEMAP_CACHE.lock().unwrap();
        cache.invalidate_module(&module_name);
    }
    let meta = serde_json::json!({
        "slug": slug,
        "title": slug,
        "path": format!("/{}/{}/{}", module_name, parent_slug, slug),
        "status": "draft",
        "route": format!("/{}/{}/{}", module_name, parent_slug, slug),
        "notes": "",
        "createdAt": chrono::Utc::now().to_rfc3339(),
    });
    std::fs::write(base.join("page.json"), serde_json::to_string_pretty(&meta).unwrap())
        .map_err(|e| format!("寫入 page.json 失敗: {}", e))?;
    Ok(PageInfo { slug: slug.clone(), path: format!("/{}/{}/{}", module_name, parent_slug, slug) })
}

#[tauri::command]
pub async fn delete_subpage(module_name: String, parent_slug: String, slug: String) -> Result<String, String> {
    let base = PathBuf::from("design-assets").join(&module_name).join("pages").join(&parent_slug).join("subpages").join(&slug);
    if !base.exists() { return Err("子頁不存在".to_string()); }
    std::fs::remove_dir_all(&base).map_err(|e| format!("刪除子頁失敗: {}", e))?;
    Ok(format!("已刪除子頁: {}", slug))
}

#[tauri::command]
  pub async fn rename_subpage(module_name: String, parent_slug: String, from_slug: String, to_slug: String) -> Result<PageInfo, String> {
    if to_slug.trim().is_empty() { return Err("新代稱不可為空".to_string()); }
    if to_slug.contains('/') { return Err("新代稱不可包含 '/'".to_string()); }
    let sub_dir = PathBuf::from("design-assets").join(&module_name).join("pages").join(&parent_slug).join("subpages");
    let from = sub_dir.join(&from_slug);
    let to = sub_dir.join(&to_slug);
    if !from.exists() { return Err("來源子頁不存在".to_string()); }
    if to.exists() { return Err("目標代稱已存在".to_string()); }
    std::fs::rename(&from, &to).map_err(|e| format!("重新命名失敗: {}", e))?;
  Ok(PageInfo { slug: to_slug.clone(), path: format!("/{}/{}/{}", module_name, parent_slug, to_slug) })
}

// 設定頁面順序
#[tauri::command]
pub async fn set_page_order(module_name: String, order: Vec<String>) -> Result<String, String> {
    use std::path::Path;
    let module_dir = PathBuf::from("design-assets").join(&module_name);
    if !module_dir.exists() { return Err("設計模組不存在".to_string()); }
    let pages_dir = module_dir.join("pages");
    // 檢查 slug 存在
    for s in order.iter() {
        let p = pages_dir.join(s);
        if !Path::new(&p).exists() { return Err(format!("頁面不存在: {}", s)); }
    }
    let mut of = load_order(&module_dir);
    of.pages = order;
    save_order(&module_dir, of).map_err(|e| format!("寫入順序檔失敗: {}", e))?;
    Ok("已更新頁面順序".to_string())
}

// 設定子頁順序
#[tauri::command]
pub async fn set_subpage_order(module_name: String, parent_slug: String, order: Vec<String>) -> Result<String, String> {
    use std::path::Path;
    let module_dir = PathBuf::from("design-assets").join(&module_name);
    if !module_dir.exists() { return Err("設計模組不存在".to_string()); }
    let sub_dir = module_dir.join("pages").join(&parent_slug).join("subpages");
    for s in order.iter() {
        let p = sub_dir.join(s);
        if !Path::new(&p).exists() { return Err(format!("子頁不存在: {}", s)); }
    }
    let mut of = load_order(&module_dir);
    of.subpages.insert(parent_slug, order);
    save_order(&module_dir, of).map_err(|e| format!("寫入順序檔失敗: {}", e))?;
  Ok("已更新子頁順序".to_string())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MermaidResult {
    pub mmd_path: String,
    pub modules: usize,
    pub pages: usize,
    pub subpages: usize,
}

fn sanitize_id(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for ch in s.chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch);
        } else {
            out.push('_');
        }
    }
    while out.starts_with('_') { out.remove(0); }
    if out.is_empty() { out.push('n'); }
    out
}

fn resolve_link_id(lk: &LinkMeta, _m: &str, _pslug: &str) -> (Option<String>, Option<String>) {
    // 支援 to 為路徑 /module/page[/sub] 或直接 id
    let to = lk.to.trim();
    if to.starts_with('/') {
        let parts: Vec<&str> = to.trim_matches('/').split('/').collect();
        if parts.len() == 2 {
            let mid = sanitize_id(parts[0]);
            let pid = format!("{}_{}", mid, sanitize_id(parts[1]));
            return (Some(pid), lk.label.clone());
        } else if parts.len() >= 3 {
            let mid = sanitize_id(parts[0]);
            let pid = format!("{}_{}", mid, sanitize_id(parts[1]));
            let sid = format!("{}_{}", pid, sanitize_id(parts[2]));
            return (Some(sid), lk.label.clone());
        }
        (None, lk.label.clone())
    } else {
        // 當成 ID 使用
        (Some(sanitize_id(to)), lk.label.clone())
    }
}

// 生成專案級 Mermaid 站點圖，輸出到 ai-docs/project-sitemap.mmd
#[tauri::command]
pub async fn generate_project_mermaid() -> Result<MermaidResult, String> {
    use std::fs;
    use std::io::Write;
    use std::path::PathBuf;

    let root = PathBuf::from("design-assets");
    if !root.exists() { return Err("設計資產目錄不存在".into()); }

    // 掃描模組、頁面、子頁（尊重 _order.json 排序）
    let mut modules: Vec<String> = Vec::new();
    if let Ok(entries) = fs::read_dir(&root) {
        for entry in entries.flatten() {
            let p = entry.path();
            if p.is_dir() {
                if let Some(name) = p.file_name().and_then(|n| n.to_str()) {
                    modules.push(name.to_string());
                }
            }
        }
    }
    modules.sort_by(|a,b| a.to_lowercase().cmp(&b.to_lowercase()));

    let mut total_pages = 0usize;
    let mut total_subpages = 0usize;

    let mut buf = String::new();
    let mermaid_settings = get_mermaid_settings();
    buf.push_str("%% Auto-generated by ErSlice\n");
    buf.push_str(&format!("flowchart {}\n", mermaid_settings.layout_direction));
    buf.push_str("  classDef mainModule fill:#e8f5e8,stroke:#4caf50,stroke-width:3px\n");
    buf.push_str("  classDef pageLevel fill:#f1f8e9,stroke:#8bc34a,stroke-width:2px\n");
    buf.push_str("  classDef componentLevel fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px\n");
    buf.push_str("  classDef decision fill:#fff8e1,stroke:#ffc107,stroke-width:2px\n");
    buf.push_str("  classDef toolbar fill:#e3f2fd,stroke:#2196f3,stroke-width:2px\n");
    buf.push_str("  classDef form fill:#fff3e0,stroke:#ff9800,stroke-width:2px\n");
    buf.push_str("  classDef table fill:#fce4ec,stroke:#e91e63,stroke-width:2px\n");
    buf.push_str("  subgraph Modules\n");
    for m in modules.iter() {
        let mid = sanitize_id(m);
        buf.push_str(&format!("    {}[\"{}\"]\n", mid, m));
        buf.push_str(&format!("  class {} mainModule\n", mid));
    }
    buf.push_str("  end\n");

    for m in modules.iter() {
        let module_dir = root.join(m).join("pages");
        let order = load_order(&root.join(m));

        // Collect pages
        let mut page_slugs: Vec<String> = Vec::new();
        if let Ok(entries) = fs::read_dir(&module_dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if p.is_dir() {
                    if let Some(slug) = p.file_name().and_then(|s| s.to_str()) {
                        page_slugs.push(slug.to_string());
                    }
                }
            }
        }
        if !order.pages.is_empty() {
            page_slugs.sort_by_key(|s| order.pages.iter().position(|x| x == s).unwrap_or(usize::MAX));
        } else {
            page_slugs.sort_by(|a,b| a.to_lowercase().cmp(&b.to_lowercase()));
        }

        for pslug in page_slugs.iter() {
            total_pages += 1;
            let mid = sanitize_id(m);
            let pid = format!("{}_{}", mid, sanitize_id(pslug));
            let pmeta = read_page_meta(&module_dir.join(pslug));
            let p_label = if pmeta.status.is_some() || pmeta.route.is_some() {
                format!("/{}/{}{}{}",
                    m, pslug,
                    pmeta.status.as_ref().map(|s| format!(" ({})", s)).unwrap_or_default(),
                    pmeta.route.as_ref().map(|r| format!("\\n{}", r)).unwrap_or_default())
            } else { format!("/{}/{}", m, pslug) };
            buf.push_str(&format!("  {} --> {}[\"{}\"]\n", mid, pid, p_label));
            let pclazz = pmeta.class.clone().unwrap_or_else(|| "pageLevel".into());
            buf.push_str(&format!("  class {} {}\n", pid, pclazz));
            // Subpages
            let mut sub_slugs: Vec<String> = Vec::new();
            let sp_dir = module_dir.join(pslug).join("subpages");
            if let Ok(entries) = fs::read_dir(&sp_dir) {
                for entry in entries.flatten() {
                    let p = entry.path();
                    if p.is_dir() {
                        if let Some(ss) = p.file_name().and_then(|s| s.to_str()) {
                            sub_slugs.push(ss.to_string());
                        }
                    }
                }
            }
            if let Some(subo) = order.subpages.get(pslug) {
                sub_slugs.sort_by_key(|s| subo.iter().position(|x| x == s).unwrap_or(usize::MAX));
            } else {
                sub_slugs.sort_by(|a,b| a.to_lowercase().cmp(&b.to_lowercase()));
            }
            for sslug in sub_slugs.iter() {
                total_subpages += 1;
                let sid = format!("{}_{}", pid, sanitize_id(sslug));
                let smeta = read_page_meta(&sp_dir.join(sslug));
                let s_label = if smeta.status.is_some() || smeta.route.is_some() {
                    format!("/{}/{}/{}{}{}",
                        m, pslug, sslug,
                        smeta.status.as_ref().map(|s| format!(" ({})", s)).unwrap_or_default(),
                        smeta.route.as_ref().map(|r| format!("\\n{}", r)).unwrap_or_default())
                } else { format!("/{}/{}/{}", m, pslug, sslug) };
                buf.push_str(&format!("  {} --> {}[\"{}\"]\n", pid, sid, s_label));
                let sclazz = smeta.class.clone().unwrap_or_else(|| "componentLevel".into());
                buf.push_str(&format!("  class {} {}\n", sid, sclazz));
            }
        }
    }
    // 附加跨模組 links（頁面與子頁）
    for m in modules.iter() {
        let module_dir = root.join(m).join("pages");
        if let Ok(entries) = std::fs::read_dir(&module_dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if !p.is_dir() { continue; }
                let pslug = p.file_name().and_then(|s| s.to_str()).unwrap_or("");
                let mid = sanitize_id(m);
                let pid = format!("{}_{}", mid, sanitize_id(pslug));
                let pmeta = read_page_meta(&p);
                if let Some(links) = pmeta.links.clone() {
                    for lk in links.iter() {
                        let (tid, label) = resolve_link_id(lk, m, pslug);
                        if let Some(tid) = tid {
                            if let Some(label) = label { buf.push_str(&format!("  {} -.->|{}| {}\n", pid, label, tid)); }
                            else { buf.push_str(&format!("  {} -.-> {}\n", pid, tid)); }
                        }
                    }
                }
                let sp_dir = p.join("subpages");
                if let Ok(sentries) = std::fs::read_dir(&sp_dir) {
                    for se in sentries.flatten() {
                        let sp = se.path();
                        if !sp.is_dir() { continue; }
                        let sslug = sp.file_name().and_then(|s| s.to_str()).unwrap_or("");
                        let sid = format!("{}_{}", pid, sanitize_id(sslug));
                        let smeta = read_page_meta(&sp);
                        if let Some(links) = smeta.links.clone() {
                            for lk in links.iter() {
                                let (tid, label) = resolve_link_id(lk, m, pslug);
                                if let Some(tid) = tid {
                                    if let Some(label) = label { buf.push_str(&format!("  {} -.->|{}| {}\n", sid, label, tid)); }
                                    else { buf.push_str(&format!("  {} -.-> {}\n", sid, tid)); }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 寫入 ai-docs 目錄
    let ai_docs = PathBuf::from("ai-docs");
    if !ai_docs.exists() { fs::create_dir_all(&ai_docs).map_err(|e| e.to_string())?; }
    let mmd_path = ai_docs.join("project-sitemap.mmd");
    fs::write(&mmd_path, buf.as_bytes()).map_err(|e| format!("寫入 Mermaid 檔案失敗: {}", e))?;

    // 若存在專案 ai_doc_ui_friendly，則附加到該文件（以程式碼區塊)
    if let Ok(cfg) = get_or_init_default_project().await {
        if let Some(path) = cfg.ai_doc_ui_friendly {
            if !path.trim().is_empty() {
                let mut f = fs::OpenOptions::new().create(true).append(true).open(&path)
                    .map_err(|e| format!("開啟 UI 文檔失敗: {}", e))?;
                let appendix = format!("\n\n## Project Sitemap (Mermaid)\n\n```mermaid\n{}\n```\n", buf);
                f.write_all(appendix.as_bytes()).map_err(|e| format!("寫入 UI 文檔失敗: {}", e))?;
            }
        }
    }

  Ok(MermaidResult {
        mmd_path: mmd_path.to_string_lossy().to_string(),
        modules: modules.len(),
        pages: total_pages,
        subpages: total_subpages,
    })
}

// 更新頁面/子頁 meta
#[derive(Debug, Serialize, Deserialize)]
pub struct PageMetaUpdate {
  pub title: Option<String>,
  pub status: Option<String>,
  pub route: Option<String>,
  pub notes: Option<String>,
  pub path: Option<String>,
  pub domain: Option<String>,
  pub area: Option<String>,
  pub component: Option<String>,
  pub action: Option<String>,
  pub class: Option<String>,
  pub links: Option<Vec<LinkMeta>>,
}

#[tauri::command]
pub async fn update_page_meta(module_name: String, slug: String, meta: PageMetaUpdate) -> Result<String, String> {
    use std::fs;
    let page_dir = PathBuf::from("design-assets").join(&module_name).join("pages").join(&slug);
    if !page_dir.exists() { return Err("頁面不存在".into()); }
    let p = page_dir.join("page.json");
    let mut cur = read_page_meta(&page_dir);
    if let Some(v) = meta.title { cur.title = Some(v); }
    if let Some(v) = meta.status { cur.status = Some(v); }
    if let Some(v) = meta.route { cur.route = Some(v); }
    if let Some(v) = meta.notes { cur.notes = Some(v); }
    if let Some(v) = meta.path { cur.path = Some(v); }
    if let Some(v) = meta.domain { cur.domain = Some(v); }
    if let Some(v) = meta.area { cur.area = Some(v); }
    if let Some(v) = meta.component { cur.component = Some(v); }
    if let Some(v) = meta.action { cur.action = Some(v); }
    if let Some(v) = meta.class { cur.class = Some(v); }
    if let Some(v) = meta.links { cur.links = Some(v); }
    let s = serde_json::to_string_pretty(&cur).map_err(|e| e.to_string())?;
    fs::write(p, s).map_err(|e| e.to_string())?;
    Ok("已更新頁面 meta".into())
}

#[tauri::command]
pub async fn update_subpage_meta(module_name: String, parent_slug: String, slug: String, meta: PageMetaUpdate) -> Result<String, String> {
    use std::fs;
    let base = PathBuf::from("design-assets").join(&module_name).join("pages").join(&parent_slug).join("subpages").join(&slug);
    if !base.exists() { return Err("子頁不存在".into()); }
    let p = base.join("page.json");
    let mut cur = read_page_meta(&base);
    if let Some(v) = meta.title { cur.title = Some(v); }
    if let Some(v) = meta.status { cur.status = Some(v); }
    if let Some(v) = meta.route { cur.route = Some(v); }
    if let Some(v) = meta.notes { cur.notes = Some(v); }
    if let Some(v) = meta.path { cur.path = Some(v); }
    if let Some(v) = meta.domain { cur.domain = Some(v); }
    if let Some(v) = meta.area { cur.area = Some(v); }
    if let Some(v) = meta.component { cur.component = Some(v); }
    if let Some(v) = meta.action { cur.action = Some(v); }
    if let Some(v) = meta.class { cur.class = Some(v); }
    if let Some(v) = meta.links { cur.links = Some(v); }
    let s = serde_json::to_string_pretty(&cur).map_err(|e| e.to_string())?;
    fs::write(p, s).map_err(|e| e.to_string())?;
    Ok("已更新子頁 meta".into())
}

// 套用 CRUD 子頁：建立 list, create, detail, edit（若不存在）
#[tauri::command]
pub async fn apply_crud_subpages(module_name: String, parent_slug: String) -> Result<Vec<String>, String> {
    use std::fs;
    let labels = vec!["list", "create", "detail", "edit"];
    let mut created: Vec<String> = Vec::new();
    for slug in labels.iter() {
        let base = PathBuf::from("design-assets").join(&module_name).join("pages").join(&parent_slug).join("subpages").join(slug);
        if base.exists() { continue; }
        fs::create_dir_all(base.join("screenshots")).map_err(|e| format!("建立資料夾失敗: {}", e))?;
        fs::create_dir_all(base.join("html")).map_err(|e| format!("建立資料夾失敗: {}", e))?;
        fs::create_dir_all(base.join("css")).map_err(|e| format!("建立資料夾失敗: {}", e))?;
        let meta = serde_json::json!({
            "slug": slug,
            "title": format!("{} {}", parent_slug, slug),
            "path": format!("/{}/{}/{}", module_name, parent_slug, slug),
            "status": "draft",
            "route": format!("/{}/{}/{}", module_name, parent_slug, slug),
            "notes": "CRUD 預設",
            "createdAt": chrono::Utc::now().to_rfc3339(),
        });
        std::fs::write(base.join("page.json"), serde_json::to_string_pretty(&meta).unwrap())
            .map_err(|e| format!("寫入 page.json 失敗: {}", e))?;
        created.push(slug.to_string());
    }
    Ok(created)
}

// 生成 Mermaid HTML 預覽（ai-docs/project-sitemap.html），使用 CDN mermaid 腳本
#[tauri::command]
pub async fn generate_project_mermaid_html() -> Result<String, String> {
    use std::fs;
    use std::path::PathBuf;

    // 確保 mmd 存在
    let res = generate_project_mermaid().await?;
    let mmd_path = PathBuf::from(&res.mmd_path);
    let content = fs::read_to_string(&mmd_path).map_err(|e| format!("讀取 mmd 失敗: {}", e))?;
    let mermaid_settings = get_mermaid_settings();

    // 建立節點點擊對應的 file:// 連結（以資料夾為主）
    let mut links: std::collections::BTreeMap<String, String> = std::collections::BTreeMap::new();
    // 從專案目錄生成 id 與對應路徑：依生成規則 mid, pid, sid
    // 這裡簡化：同時生成 links 於此函數，以 module/page/subpage 對應資料夾
    let cwd = std::env::current_dir().map_err(|e| e.to_string())?;
    let root = cwd.join("design-assets");
    // 掃描 modules/pages/subpages 生成與 generate_project_mermaid 一致的 id
    if let Ok(entries) = std::fs::read_dir(&root) {
        for e in entries.flatten() {
            let mpath = e.path();
            if !mpath.is_dir() { continue; }
            let mname = mpath.file_name().and_then(|s| s.to_str()).unwrap_or("");
            let mid = sanitize_id(mname);
            links.insert(mid.clone(), format!("file://{}", mpath.to_string_lossy().replace(' ', "%20")));
            let pages = mpath.join("pages");
            if let Ok(pentries) = std::fs::read_dir(&pages) {
                for pe in pentries.flatten() {
                    let ppath = pe.path();
                    if !ppath.is_dir() { continue; }
                    let pslug = ppath.file_name().and_then(|s| s.to_str()).unwrap_or("").to_string();
                    let pid = format!("{}_{}", mid, sanitize_id(&pslug));
                    links.insert(pid.clone(), format!("file://{}", ppath.to_string_lossy().replace(' ', "%20")));
                    let sp = ppath.join("subpages");
                    if let Ok(sentries) = std::fs::read_dir(&sp) {
                        for se in sentries.flatten() {
                            let spath = se.path();
                            if !spath.is_dir() { continue; }
                            let sslug = spath.file_name().and_then(|s| s.to_str()).unwrap_or("").to_string();
                            let sid = format!("{}__{}", pid, sanitize_id(&sslug));
                            links.insert(sid, format!("file://{}", spath.to_string_lossy().replace(' ', "%20")));
                        }
                    }
                }
            }
        }
    }
    let links_json = serde_json::to_string(&links).unwrap_or_else(|_| "{}".to_string());

    let html = format!(r#"<!DOCTYPE html>
<html lang=\"zh-TW\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Project Sitemap - Mermaid</title>
  <style>body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; padding: 16px; }}</style>
  <script type=\"module\">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({{ startOnLoad: true, theme: '{}' }});
    // 點擊事件：支援 file:// 連結（由 data-href 提供）
    window.addEventListener('DOMContentLoaded', () => {{
      setTimeout(() => {{
        document.querySelectorAll('svg g.node').forEach((n) => {{
          const title = n.querySelector('title');
          const id = title ? title.textContent : null;
          if (id && window.__ERSLICE_LINKS && window.__ERSLICE_LINKS[id]) {{
            n.style.cursor = 'pointer';
            n.addEventListener('click', () => {{
              const href = window.__ERSLICE_LINKS[id];
              if (href) window.location.href = href;
            }});
          }}
        }});
      }}, 300);
    }});
  </script>
  <script>window.__ERSLICE_TS = Date.now(); window.__ERSLICE_LINKS = {};</script>
  </head>
<body>
  <h1>Project Sitemap (Mermaid)</h1>
  <div class=\"mermaid\">
{}
  </div>
</body>
</html>
"#, mermaid_settings.theme, links_json, content);

    let html_path = mmd_path.parent().unwrap_or_else(|| std::path::Path::new(".")).join("project-sitemap.html");
    fs::write(&html_path, html).map_err(|e| format!("寫入 HTML 檔案失敗: {}", e))?;
    Ok(html_path.to_string_lossy().to_string())
}

// 針對單一模組輸出 Mermaid（.mmd）與 HTML 預覽
#[tauri::command]
  pub async fn generate_module_mermaid_html(module: String) -> Result<String, String> {
    use std::fs;
    let root = PathBuf::from("design-assets");
    let mdir = root.join(&module).join("pages");
    if !mdir.exists() { return Err("模組不存在或沒有 pages".into()); }

    let mut buf = String::new();
    let mermaid_settings = get_mermaid_settings();
    buf.push_str(&format!("flowchart {}\n", mermaid_settings.layout_direction));
    buf.push_str("  classDef mainModule fill:#e8f5e8,stroke:#4caf50,stroke-width:3px\n");
    buf.push_str("  classDef pageLevel fill:#f1f8e9,stroke:#8bc34a,stroke-width:2px\n");
    buf.push_str("  classDef componentLevel fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px\n");
    buf.push_str("  classDef decision fill:#fff8e1,stroke:#ffc107,stroke-width:2px\n");
    buf.push_str("  classDef toolbar fill:#e3f2fd,stroke:#2196f3,stroke-width:2px\n");
    buf.push_str("  classDef form fill:#fff3e0,stroke:#ff9800,stroke-width:2px\n");
    buf.push_str("  classDef table fill:#fce4ec,stroke:#e91e63,stroke-width:2px\n");

    let mid = sanitize_id(&module);
    buf.push_str(&format!("  {}[\"{}\"]\n", mid, module));
    buf.push_str(&format!("  class {} mainModule\n", mid));

    let order = load_order(&root.join(&module));
    let mut page_slugs: Vec<String> = Vec::new();
    if let Ok(entries) = fs::read_dir(&mdir) {
        for e in entries.flatten() {
            let p = e.path(); if !p.is_dir() { continue; }
            if let Some(s) = p.file_name().and_then(|x| x.to_str()) { page_slugs.push(s.to_string()); }
        }
    }
    if !order.pages.is_empty() {
        page_slugs.sort_by_key(|s| order.pages.iter().position(|x| x == s).unwrap_or(usize::MAX));
    } else { page_slugs.sort(); }

    for pslug in page_slugs.iter() {
        let pid = format!("{}_{}", mid, sanitize_id(pslug));
        let pmeta = read_page_meta(&mdir.join(pslug));
        let p_label = if pmeta.status.is_some() || pmeta.route.is_some() {
            format!("/{}/{}{}{}", module, pslug, pmeta.status.as_ref().map(|s| format!(" ({})", s)).unwrap_or_default(), pmeta.route.as_ref().map(|r| format!("\\n{}", r)).unwrap_or_default())
        } else { format!("/{}/{}", module, pslug) };
        buf.push_str(&format!("  {} --> {}[\"{}\"]\n", mid, pid, p_label));
        let pclazz = pmeta.class.clone().unwrap_or_else(|| "pageLevel".into());
        buf.push_str(&format!("  class {} {}\n", pid, pclazz));

        let sp = mdir.join(pslug).join("subpages");
        let mut subs: Vec<String> = Vec::new();
        if let Ok(sentries) = fs::read_dir(&sp) {
            for se in sentries.flatten() {
                let spath = se.path(); if !spath.is_dir() { continue; }
                if let Some(s) = spath.file_name().and_then(|x| x.to_str()) { subs.push(s.to_string()); }
            }
        }
        if let Some(subo) = order.subpages.get(pslug) {
            subs.sort_by_key(|s| subo.iter().position(|x| x == s).unwrap_or(usize::MAX));
        } else { subs.sort(); }
        for sslug in subs.iter() {
            let sid = format!("{}_{}", pid, sanitize_id(sslug));
            let smeta = read_page_meta(&sp.join(sslug));
            let s_label = if smeta.status.is_some() || smeta.route.is_some() {
                format!("/{}/{}/{}{}{}", module, pslug, sslug, smeta.status.as_ref().map(|s| format!(" ({})", s)).unwrap_or_default(), smeta.route.as_ref().map(|r| format!("\\n{}", r)).unwrap_or_default())
            } else { format!("/{}/{}/{}", module, pslug, sslug) };
            buf.push_str(&format!("  {} --> {}[\"{}\"]\n", pid, sid, s_label));
            let sclazz = smeta.class.clone().unwrap_or_else(|| "componentLevel".into());
            buf.push_str(&format!("  class {} {}\n", sid, sclazz));
        }
  }
  
  // HTML 模板複用專案版本
    let mmd_path = PathBuf::from("ai-docs").join(format!("module-{}-sitemap.mmd", sanitize_id(&module)));
    std::fs::create_dir_all(mmd_path.parent().unwrap()).map_err(|e| e.to_string())?;
    fs::write(&mmd_path, buf).map_err(|e| e.to_string())?;
    // 重用 project html 生成功能：讀入 mmd 內容
    let content = std::fs::read_to_string(&mmd_path).map_err(|e| e.to_string())?;
    let mermaid_settings = get_mermaid_settings();
    let html = format!(r#"<!DOCTYPE html>
<html lang=\"zh-TW\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Module Sitemap - {module}</title>
  <script type=\"module\">import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs'; mermaid.initialize({{ startOnLoad: true, theme: '{}' }});</script>
</head><body><h1>Module Sitemap - {module}</h1><div class=\"mermaid\">{graph}</div></body></html>"#, mermaid_settings.theme, module=module, graph=content);
    let html_path = PathBuf::from("ai-docs").join(format!("module-{}-sitemap.html", sanitize_id(&module)));
  fs::write(&html_path, html).map_err(|e| e.to_string())?;
  Ok(html_path.to_string_lossy().to_string())
}

// 生成模組 CRUD 流程圖（.html）
#[tauri::command]
pub async fn generate_module_crud_mermaid_html(module: String) -> Result<String, String> {
    use std::fs;
    let root = std::path::PathBuf::from("design-assets");
    let mdir = root.join(&module).join("pages");
    if !mdir.exists() { return Err("模組不存在或沒有 pages".into()); }

    let safe = |s: &str| sanitize_id(s);
    let mid = safe(&module);

    // 探測 CRUD 頁面是否存在
    let has = |slug: &str| mdir.join(slug).exists();
    let has_list = has("list");
    let has_create = has("create");
    let has_edit = has("edit");
    let has_detail = has("detail");

    let mut buf = String::new();
    let mermaid_settings = get_mermaid_settings();
    buf.push_str(&format!("flowchart {}\n", mermaid_settings.layout_direction));
    buf.push_str("  classDef mainModule fill:#e8f5e8,stroke:#4caf50,stroke-width:3px\n");
    buf.push_str("  classDef pageLevel fill:#f1f8e9,stroke:#8bc34a,stroke-width:2px\n");
    buf.push_str("  classDef decision fill:#fff8e1,stroke:#ffc107,stroke-width:2px\n");
    buf.push_str("  classDef form fill:#fff3e0,stroke:#ff9800,stroke-width:2px\n");

    // 模組節點
    buf.push_str(&format!("  {}[\\\"{}\\\"]\n  class {} mainModule\n", mid, module, mid));

    // 頁面節點
    let pid_list = format!("{}_{}", mid, safe("list"));
    let pid_create = format!("{}_{}", mid, safe("create"));
    let pid_edit = format!("{}_{}", mid, safe("edit"));
    let pid_detail = format!("{}_{}", mid, safe("detail"));

    if has_list { buf.push_str(&format!("  {} --> {}[\\\"/{}/list\\\"]\n  class {} pageLevel\n", mid, pid_list, module, pid_list)); }
    if has_create { buf.push_str(&format!("  {} --> {}[\\\"/{}/create\\\"]\n  class {} pageLevel\n", mid, pid_create, module, pid_create)); }
    if has_edit { buf.push_str(&format!("  {} --> {}[\\\"/{}/edit\\\"]\n  class {} pageLevel\n", mid, pid_edit, module, pid_edit)); }
    if has_detail { buf.push_str(&format!("  {} --> {}[\\\"/{}/detail\\\"]\n  class {} pageLevel\n", mid, pid_detail, module, pid_detail)); }

    // list 流向
    if has_list && has_create {
        buf.push_str(&format!("  {} --> {}\n", pid_list, pid_create));
    }
    if has_list && has_edit {
        buf.push_str(&format!("  {} --> {}\n", pid_list, pid_edit));
    }
    if has_list && has_detail {
        buf.push_str(&format!("  {} --> {}\n", pid_list, pid_detail));
    }

    // create 流程：form → validate → submit/error
    if has_create {
        let create_form = format!("{}_create_form", pid_create);
        let create_validate = format!("{}_create_validate", pid_create);
        let create_submit = format!("{}_create_submit", pid_create);
        let create_error = format!("{}_create_error", pid_create);
        buf.push_str(&format!("  {} --> {}[\\\"create form\\\"]\n  class {} form\n", pid_create, create_form, create_form));
        buf.push_str(&format!("  {} --> {}{{\\\"create validate\\\"}}\n  class {} decision\n", create_form, create_validate, create_validate));
        buf.push_str(&format!("  {} -->|通過| {}[\\\"create submit\\\"]\n", create_validate, create_submit));
        buf.push_str(&format!("  {} -->|失敗| {}[\\\"create error\\\"]\n", create_validate, create_error));
    }

    // edit 流程：form → validate → submit/error
    if has_edit {
        let edit_form = format!("{}_edit_form", pid_edit);
        let edit_validate = format!("{}_edit_validate", pid_edit);
        let edit_submit = format!("{}_edit_submit", pid_edit);
        let edit_error = format!("{}_edit_error", pid_edit);
        buf.push_str(&format!("  {} --> {}[\\\"edit form\\\"]\n  class {} form\n", pid_edit, edit_form, edit_form));
        buf.push_str(&format!("  {} --> {}{{\\\"edit validate\\\"}}\n  class {} decision\n", edit_form, edit_validate, edit_validate));
        buf.push_str(&format!("  {} -->|通過| {}[\\\"edit submit\\\"]\n", edit_validate, edit_submit));
        buf.push_str(&format!("  {} -->|失敗| {}[\\\"edit error\\\"]\n", edit_validate, edit_error));
    }

    // 寫檔
    let mmd_path = std::path::PathBuf::from("ai-docs").join(format!("module-{}-crud.mmd", sanitize_id(&module)));
    std::fs::create_dir_all(mmd_path.parent().unwrap()).map_err(|e| e.to_string())?;
    fs::write(&mmd_path, buf).map_err(|e| e.to_string())?;
    let content = std::fs::read_to_string(&mmd_path).map_err(|e| e.to_string())?;
    let mermaid_settings = get_mermaid_settings();
    let html = format!(r#"<!DOCTYPE html>
<html lang=\"zh-TW\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Module CRUD - {module}</title>
  <script type=\"module\">import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs'; mermaid.initialize({{ startOnLoad: true, theme: '{}' }});</script>
</head><body><h1>Module CRUD - {module}</h1><div class=\"mermaid\">{graph}</div></body></html>"#, mermaid_settings.theme, module=module, graph=content);
    let html_path = std::path::PathBuf::from("ai-docs").join(format!("module-{}-crud.html", sanitize_id(&module)));
    fs::write(&html_path, html).map_err(|e| e.to_string())?;
    Ok(html_path.to_string_lossy().to_string())
}

// 生成單頁站點圖（.html）
#[tauri::command]
pub async fn generate_page_mermaid_html(module: String, page: String) -> Result<String, String> {
    generate_detailed_page_mermaid_html(module, page).await
}

// Generate detailed UI structure for a page
fn generate_detailed_page_structure(
    buf: &mut String, 
    module: &str, 
    page: &str, 
    pid: &str, 
    pmeta: &PageMeta,
    pdir: &std::path::Path
) -> Result<(), String> {
    // Main page container
    let page_title_fallback = page.to_string();
    let page_title = pmeta.title.as_ref().unwrap_or(&page_title_fallback);
    let route = pmeta.route.as_ref().map(|r| format!("\\n{}", r)).unwrap_or_default();
    let status_badge = pmeta.status.as_ref().map(|s| format!(" [{}]", s)).unwrap_or_default();
    
    buf.push_str(&format!("  {}[\\\"📄 {} Page{}{}\\\"]\n", pid, page_title, status_badge, route));
    buf.push_str(&format!("  class {} pageContainer\n", pid));
    
    // Header section with navigation and controls
    let header_id = format!("{}_header", pid);
    buf.push_str(&format!("  {} --> {}[\\\"📋 Header Section\\\"]\n", pid, header_id));
    buf.push_str(&format!("  class {} headerSection\n", header_id));
    
    // Navigation breadcrumb
    let breadcrumb_id = format!("{}_breadcrumb", header_id);
    buf.push_str(&format!("  {} --> {}[\\\"🏠 {} > {}\\\"]\n", header_id, breadcrumb_id, module, page));
    buf.push_str(&format!("  class {} navigation\n", breadcrumb_id));
    
    // Header buttons based on page type and meta
    generate_header_buttons(buf, &header_id, module, page, pmeta);
    
    // Main content section
    let content_id = format!("{}_content", pid);
    buf.push_str(&format!("  {} --> {}[\\\"📝 Main Content\\\"]\n", pid, content_id));
    buf.push_str(&format!("  class {} contentSection\n", content_id));
    
    // Generate content based on page type/action
    let page_type = detect_page_type(page, pmeta);
    generate_content_by_type(buf, &content_id, &page_type, module, page, pmeta, pdir)?;
    
    // Footer section with actions
    let footer_id = format!("{}_footer", pid);
    buf.push_str(&format!("  {} --> {}[\\\"⚡ Action Footer\\\"]\n", pid, footer_id));
    buf.push_str(&format!("  class {} footerSection\n", footer_id));
    
    generate_footer_actions(buf, &footer_id, &page_type, module, page);
    
    // Sidebar if present
    if has_sidebar(&page_type) {
        let sidebar_id = format!("{}_sidebar", pid);
        buf.push_str(&format!("  {} --> {}[\\\"📁 Sidebar\\\"]\n", pid, sidebar_id));
        buf.push_str(&format!("  class {} sidebar\n", sidebar_id));
        generate_sidebar_elements(buf, &sidebar_id, &page_type);
    }
    
    // Generate modals and overlays
    generate_modal_flows(buf, pid, &page_type, module, page);
    
    Ok(())
}

// Detect page type from slug and meta
fn detect_page_type(page: &str, pmeta: &PageMeta) -> String {
    if let Some(action) = &pmeta.action {
        return action.clone();
    }
    
    let lower_page = page.to_lowercase();
    if lower_page.contains("list") || lower_page.contains("index") { "list".to_string() }
    else if lower_page.contains("detail") || lower_page.contains("view") || lower_page.contains("show") { "detail".to_string() }
    else if lower_page.contains("create") || lower_page.contains("new") || lower_page.contains("add") { "create".to_string() }
    else if lower_page.contains("edit") || lower_page.contains("update") || lower_page.contains("modify") { "edit".to_string() }
    else if lower_page.contains("delete") || lower_page.contains("remove") { "delete".to_string() }
    else if lower_page.contains("search") || lower_page.contains("filter") { "search".to_string() }
    else if lower_page.contains("dashboard") || lower_page.contains("overview") { "dashboard".to_string() }
    else if lower_page.contains("settings") || lower_page.contains("config") { "settings".to_string() }
    else { "general".to_string() }
}

// Generate header buttons based on page context
fn generate_header_buttons(buf: &mut String, header_id: &str, module: &str, _page: &str, _pmeta: &PageMeta) {
    // Back button
    let back_btn_id = format!("{}_back_btn", header_id);
    buf.push_str(&format!("  {} --> {}[\\\"← Back to {}\\\"]\n", header_id, back_btn_id, module));
    buf.push_str(&format!("  class {} button\n", back_btn_id));
    buf.push_str(&format!("  {} -.->|navigate| {}[\\\"/{} Module List\\\"]\n", back_btn_id, format!("{}_module_list", sanitize_id(module)), module));
    
    // Refresh button
    let refresh_btn_id = format!("{}_refresh_btn", header_id);
    buf.push_str(&format!("  {} --> {}[\\\"🔄 Refresh\\\"]\n", header_id, refresh_btn_id));
    buf.push_str(&format!("  class {} button\n", refresh_btn_id));
    
    // Settings dropdown
    let settings_btn_id = format!("{}_settings_btn", header_id);
    buf.push_str(&format!("  {} --> {}[\\\"⚙️ Settings ▼\\\"]\n", header_id, settings_btn_id));
    buf.push_str(&format!("  class {} dropdown\n", settings_btn_id));
    
    // Settings dropdown options
    let settings_menu_id = format!("{}_settings_menu", settings_btn_id);
    buf.push_str(&format!("  {} --> {}[\\\"• Page Settings\\n• Export Data\\n• View History\\\"]\n", settings_btn_id, settings_menu_id));
    buf.push_str(&format!("  class {} dropdown\n", settings_menu_id));
    
    // Help button
    let help_btn_id = format!("{}_help_btn", header_id);
    buf.push_str(&format!("  {} --> {}[\\\"❓ Help\\\"]\n", header_id, help_btn_id));
    buf.push_str(&format!("  class {} button\n", help_btn_id));
}

// Generate content based on page type
fn generate_content_by_type(
    buf: &mut String, 
    content_id: &str, 
    page_type: &str, 
    module: &str, 
    page: &str,
    pmeta: &PageMeta,
    pdir: &std::path::Path
) -> Result<(), String> {
    match page_type {
        "list" => generate_list_page_content(buf, content_id, module, page),
        "detail" => generate_detail_page_content(buf, content_id, module, page, pmeta),
        "create" | "edit" => generate_form_page_content(buf, content_id, page_type, module, page),
        "delete" => generate_delete_page_content(buf, content_id, module, page),
        "search" => generate_search_page_content(buf, content_id, module, page),
        "dashboard" => generate_dashboard_page_content(buf, content_id, module, page),
        "settings" => generate_settings_page_content(buf, content_id, module, page),
        _ => generate_general_page_content(buf, content_id, module, page, pmeta),
    }
    Ok(())
}

// Generate list page content with table and filters
fn generate_list_page_content(buf: &mut String, content_id: &str, module: &str, page: &str) {
    // Search/Filter bar
    let filter_id = format!("{}_filters", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"🔍 Search & Filters\\\"]\n", content_id, filter_id));
    buf.push_str(&format!("  class {} form\n", filter_id));
    
    // Search input
    let search_input_id = format!("{}_search", filter_id);
    buf.push_str(&format!("  {} --> {}[\\\"🔎 Search Input\\\"]\n", filter_id, search_input_id));
    buf.push_str(&format!("  class {} input\n", search_input_id));
    
    // Filter dropdowns
    let status_filter_id = format!("{}_status_filter", filter_id);
    buf.push_str(&format!("  {} --> {}[\\\"📊 Status Filter ▼\\\"]\n", filter_id, status_filter_id));
    buf.push_str(&format!("  class {} dropdown\n", status_filter_id));
    
    let date_filter_id = format!("{}_date_filter", filter_id);
    buf.push_str(&format!("  {} --> {}[\\\"📅 Date Range ▼\\\"]\n", filter_id, date_filter_id));
    buf.push_str(&format!("  class {} dropdown\n", date_filter_id));
    
    // Action buttons
    let actions_id = format!("{}_actions", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"⚡ Bulk Actions\\\"]\n", content_id, actions_id));
    buf.push_str(&format!("  class {} form\n", actions_id));
    
    let create_btn_id = format!("{}_create_btn", actions_id);
    buf.push_str(&format!("  {} --> {}[\\\"➕ Create New\\\"]\n", actions_id, create_btn_id));
    buf.push_str(&format!("  class {} button\n", create_btn_id));
    let create_page_id = format!("{}_create_page", sanitize_id(module));
    buf.push_str(&format!("  {} -.->|navigate| {}[\\\"/{}/create\\\"]\n", create_btn_id, create_page_id, module));
    
    let export_btn_id = format!("{}_export_btn", actions_id);
    buf.push_str(&format!("  {} --> {}[\\\"📤 Export CSV\\\"]\n", actions_id, export_btn_id));
    buf.push_str(&format!("  class {} button\n", export_btn_id));
    
    let bulk_delete_btn_id = format!("{}_bulk_delete", actions_id);
    buf.push_str(&format!("  {} --> {}[\\\"🗑️ Delete Selected\\\"]\n", actions_id, bulk_delete_btn_id));
    buf.push_str(&format!("  class {} button\n", bulk_delete_btn_id));
    
    // Data table
    let table_id = format!("{}_table", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"📋 Data Table\\\"]\n", content_id, table_id));
    buf.push_str(&format!("  class {} table\n", table_id));
    
    // Table headers
    let headers_id = format!("{}_headers", table_id);
    buf.push_str(&format!("  {} --> {}[\\\"☑️ Select All | Name | Status | Created | Actions\\\"]\n", table_id, headers_id));
    buf.push_str(&format!("  class {} table\n", headers_id));
    
    // Table rows with actions
    let rows_id = format!("{}_rows", table_id);
    buf.push_str(&format!("  {} --> {}[\\\"📄 Data Rows\\\"]\n", table_id, rows_id));
    buf.push_str(&format!("  class {} table\n", rows_id));
    
    // Row actions
    let row_actions_id = format!("{}_row_actions", rows_id);
    buf.push_str(&format!("  {} --> {}[\\\"👁️ View | ✏️ Edit | 🗑️ Delete\\\"]\n", rows_id, row_actions_id));
    buf.push_str(&format!("  class {} button\n", row_actions_id));
    
    // Pagination
    let pagination_id = format!("{}_pagination", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"⏮️ ⏪ Page 1 of 10 ⏩ ⏭️\\\"]\n", content_id, pagination_id));
    buf.push_str(&format!("  class {} navigation\n", pagination_id));
}

// Generate form page content for create/edit
fn generate_form_page_content(buf: &mut String, content_id: &str, page_type: &str, module: &str, page: &str) {
    let action_label = if page_type == "create" { "Create New" } else { "Edit Existing" };
    
    // Form container
    let form_id = format!("{}_form", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"📝 {} Form\\\"]\n", content_id, form_id, action_label));
    buf.push_str(&format!("  class {} form\n", form_id));
    
    // Form sections
    generate_form_fields(buf, &form_id, module, page_type);
    
    // Form actions
    let form_actions_id = format!("{}_actions", form_id);
    buf.push_str(&format!("  {} --> {}[\\\"⚡ Form Actions\\\"]\n", form_id, form_actions_id));
    buf.push_str(&format!("  class {} form\n", form_actions_id));
    
    let save_btn_id = format!("{}_save_btn", form_actions_id);
    buf.push_str(&format!("  {} --> {}[\\\"💾 Save Changes\\\"]\n", form_actions_id, save_btn_id));
    buf.push_str(&format!("  class {} button\n", save_btn_id));
    
    let cancel_btn_id = format!("{}_cancel_btn", form_actions_id);
    buf.push_str(&format!("  {} --> {}[\\\"❌ Cancel\\\"]\n", form_actions_id, cancel_btn_id));
    buf.push_str(&format!("  class {} button\n", cancel_btn_id));
    
    if page_type == "edit" {
        let delete_btn_id = format!("{}_delete_btn", form_actions_id);
        buf.push_str(&format!("  {} --> {}[\\\"🗑️ Delete Record\\\"]\n", form_actions_id, delete_btn_id));
        buf.push_str(&format!("  class {} button\n", delete_btn_id));
    }
    
    // Validation messages
    let validation_id = format!("{}_validation", form_id);
    buf.push_str(&format!("  {} --> {}[\\\"⚠️ Validation Messages\\\"]\n", form_id, validation_id));
    buf.push_str(&format!("  class {} notification\n", validation_id));
}

// Generate form fields based on common patterns
fn generate_form_fields(buf: &mut String, form_id: &str, module: &str, page_type: &str) {
    // Basic info section
    let basic_section_id = format!("{}_basic", form_id);
    buf.push_str(&format!("  {} --> {}[\\\"📋 Basic Information\\\"]\n", form_id, basic_section_id));
    buf.push_str(&format!("  class {} form\n", basic_section_id));
    
    // Common fields
    let name_field_id = format!("{}_name", basic_section_id);
    buf.push_str(&format!("  {} --> {}[\\\"📝 Name/Title*\\\"]\n", basic_section_id, name_field_id));
    buf.push_str(&format!("  class {} input\n", name_field_id));
    
    let desc_field_id = format!("{}_description", basic_section_id);
    buf.push_str(&format!("  {} --> {}[\\\"📄 Description\\\"]\n", basic_section_id, desc_field_id));
    buf.push_str(&format!("  class {} input\n", desc_field_id));
    
    let status_field_id = format!("{}_status", basic_section_id);
    buf.push_str(&format!("  {} --> {}[\\\"📊 Status ▼\\\"]\n", basic_section_id, status_field_id));
    buf.push_str(&format!("  class {} dropdown\n", status_field_id));
    
    // Advanced section
    let advanced_section_id = format!("{}_advanced", form_id);
    buf.push_str(&format!("  {} --> {}[\\\"🔧 Advanced Settings\\\"]\n", form_id, advanced_section_id));
    buf.push_str(&format!("  class {} form\n", advanced_section_id));
    
    let tags_field_id = format!("{}_tags", advanced_section_id);
    buf.push_str(&format!("  {} --> {}[\\\"🏷️ Tags (comma separated)\\\"]\n", advanced_section_id, tags_field_id));
    buf.push_str(&format!("  class {} input\n", tags_field_id));
    
    let category_field_id = format!("{}_category", advanced_section_id);
    buf.push_str(&format!("  {} --> {}[\\\"📁 Category ▼\\\"]\n", advanced_section_id, category_field_id));
    buf.push_str(&format!("  class {} dropdown\n", category_field_id));
    
    // File uploads if applicable
    let upload_section_id = format!("{}_uploads", form_id);
    buf.push_str(&format!("  {} --> {}[\\\"📎 File Uploads\\\"]\n", form_id, upload_section_id));
    buf.push_str(&format!("  class {} form\n", upload_section_id));
    
    let file_input_id = format!("{}_files", upload_section_id);
    buf.push_str(&format!("  {} --> {}[\\\"📁 Choose Files... | Drag & Drop\\\"]\n", upload_section_id, file_input_id));
    buf.push_str(&format!("  class {} input\n", file_input_id));
}

// Generate detail page content
fn generate_detail_page_content(buf: &mut String, content_id: &str, module: &str, page: &str, pmeta: &PageMeta) {
    // Detail header with quick actions
    let detail_header_id = format!("{}_detail_header", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"📋 Record Details\\\"]\n", content_id, detail_header_id));
    buf.push_str(&format!("  class {} contentSection\n", detail_header_id));
    
    let quick_actions_id = format!("{}_quick_actions", detail_header_id);
    buf.push_str(&format!("  {} --> {}[\\\"✏️ Edit | 🗑️ Delete | 📤 Export\\\"]\n", detail_header_id, quick_actions_id));
    buf.push_str(&format!("  class {} button\n", quick_actions_id));
    
    // Information sections
    let info_section_id = format!("{}_info", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"📊 Information Tabs\\\"]\n", content_id, info_section_id));
    buf.push_str(&format!("  class {} navigation\n", info_section_id));
    
    // Tab contents
    let general_tab_id = format!("{}_general_tab", info_section_id);
    buf.push_str(&format!("  {} --> {}[\\\"• General Info\\n• Status & Metadata\\n• Creation Date\\n• Last Modified\\\"]\n", info_section_id, general_tab_id));
    buf.push_str(&format!("  class {} contentSection\n", general_tab_id));
    
    let related_tab_id = format!("{}_related_tab", info_section_id);
    buf.push_str(&format!("  {} --> {}[\\\"• Related Records\\n• References\\n• Dependencies\\\"]\n", info_section_id, related_tab_id));
    buf.push_str(&format!("  class {} contentSection\n", related_tab_id));
    
    let history_tab_id = format!("{}_history_tab", info_section_id);
    buf.push_str(&format!("  {} --> {}[\\\"• Change History\\n• Activity Log\\n• Version Timeline\\\"]\n", info_section_id, history_tab_id));
    buf.push_str(&format!("  class {} table\n", history_tab_id));
}

// Generate other page types (simplified for space)
fn generate_delete_page_content(buf: &mut String, content_id: &str, module: &str, page: &str) {
    let warning_id = format!("{}_warning", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"⚠️ Deletion Warning\\nThis action cannot be undone!\\\"]\n", content_id, warning_id));
    buf.push_str(&format!("  class {} notification\n", warning_id));
    
    let confirm_id = format!("{}_confirm", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"🗑️ Confirm Delete | ❌ Cancel\\\"]\n", content_id, confirm_id));
    buf.push_str(&format!("  class {} button\n", confirm_id));
}

fn generate_search_page_content(buf: &mut String, content_id: &str, module: &str, page: &str) {
    let search_form_id = format!("{}_search_form", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"🔍 Advanced Search Form\\\"]\n", content_id, search_form_id));
    buf.push_str(&format!("  class {} form\n", search_form_id));
    
    let results_id = format!("{}_results", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"📋 Search Results\\\"]\n", content_id, results_id));
    buf.push_str(&format!("  class {} table\n", results_id));
}

fn generate_dashboard_page_content(buf: &mut String, content_id: &str, _module: &str, _page: &str) {
    let widgets_id = format!("{}_widgets", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"📊 Dashboard Widgets\\\"]\n", content_id, widgets_id));
    buf.push_str(&format!("  class {} contentSection\n", widgets_id));
    
    let charts_id = format!("{}_charts", widgets_id);
    buf.push_str(&format!("  {} --> {}[\\\"📈 Charts & Graphs\\\"]\n", widgets_id, charts_id));
    buf.push_str(&format!("  class {} table\n", charts_id));
}

fn generate_settings_page_content(buf: &mut String, content_id: &str, _module: &str, _page: &str) {
    let settings_form_id = format!("{}_settings_form", content_id);
    buf.push_str(&format!("  {} --> {}[\\\"⚙️ Configuration Form\\\"]\n", content_id, settings_form_id));
    buf.push_str(&format!("  class {} form\n", settings_form_id));
}

fn generate_general_page_content(buf: &mut String, content_id: &str, _module: &str, page: &str, pmeta: &PageMeta) {
    let content_area_id = format!("{}_content_area", content_id);
    let page_desc_fallback = format!("{} content area", page);
    let page_desc = pmeta.notes.as_ref().unwrap_or(&page_desc_fallback);
    buf.push_str(&format!("  {} --> {}[\\\"📄 {}\\\"]\n", content_id, content_area_id, page_desc));
    buf.push_str(&format!("  class {} contentSection\n", content_area_id));
}

// Generate footer actions
fn generate_footer_actions(buf: &mut String, footer_id: &str, page_type: &str, _module: &str, _page: &str) {
    let actions_id = format!("{}_actions", footer_id);
    buf.push_str(&format!("  {} --> {}[\\\"⚡ Page Actions\\\"]\n", footer_id, actions_id));
    buf.push_str(&format!("  class {} button\n", actions_id));
    
    // Context-sensitive actions
    match page_type {
        "list" => {
            buf.push_str(&format!("  {} --> {}[\\\"📤 Export All | 📊 Generate Report\\\"]\n", actions_id, format!("{}_export_actions", actions_id)));
        }
        "detail" => {
            buf.push_str(&format!("  {} --> {}[\\\"📧 Share | 📋 Copy Link | 🖨️ Print\\\"]\n", actions_id, format!("{}_share_actions", actions_id)));
        }
        "create" | "edit" => {
            buf.push_str(&format!("  {} --> {}[\\\"💾 Save Draft | 🔄 Reset Form\\\"]\n", actions_id, format!("{}_form_actions", actions_id)));
        }
        _ => {
            buf.push_str(&format!("  {} --> {}[\\\"🔄 Refresh | 📊 Analytics\\\"]\n", actions_id, format!("{}_general_actions", actions_id)));
        }
    }
}

// Check if page type should have sidebar
fn has_sidebar(page_type: &str) -> bool {
    matches!(page_type, "list" | "dashboard" | "settings")
}

// Generate sidebar elements
fn generate_sidebar_elements(buf: &mut String, sidebar_id: &str, page_type: &str) {
    match page_type {
        "list" => {
            let filters_id = format!("{}_filters", sidebar_id);
            buf.push_str(&format!("  {} --> {}[\\\"🔧 Quick Filters\\n• Active Items\\n• Recent\\n• Favorites\\\"]\n", sidebar_id, filters_id));
            buf.push_str(&format!("  class {} form\n", filters_id));
        }
        "dashboard" => {
            let widgets_id = format!("{}_widget_controls", sidebar_id);
            buf.push_str(&format!("  {} --> {}[\\\"📊 Widget Controls\\n• Add Widget\\n• Layout Settings\\n• Data Sources\\\"]\n", sidebar_id, widgets_id));
            buf.push_str(&format!("  class {} form\n", widgets_id));
        }
        "settings" => {
            let nav_id = format!("{}_settings_nav", sidebar_id);
            buf.push_str(&format!("  {} --> {}[\\\"⚙️ Settings Navigation\\n• General\\n• Security\\n• Notifications\\n• Advanced\\\"]\n", sidebar_id, nav_id));
            buf.push_str(&format!("  class {} navigation\n", nav_id));
        }
        _ => {}
    }
}

// Generate detailed subpage structure
fn generate_detailed_subpage_structure(
    buf: &mut String,
    _module: &str,
    parent_page: &str,
    subpage: &str,
    sid: &str,
    smeta: &PageMeta,
    parent_id: &str
) -> Result<(), String> {
    let subpage_type = detect_page_type(subpage, smeta);
    let subpage_title_fallback = subpage.to_string();
    let subpage_title = smeta.title.as_ref().unwrap_or(&subpage_title_fallback);
    let route = smeta.route.as_ref().map(|r| format!("\\n{}", r)).unwrap_or_default();
    let status_badge = smeta.status.as_ref().map(|s| format!(" [{}]", s)).unwrap_or_default();
    
    // Subpage container with detailed info
    buf.push_str(&format!("  {} --> {}[\\\"📑 {} Subpage{}{}\\nType: {}\\\"]\n", 
        parent_id, sid, subpage_title, status_badge, route, subpage_type));
    buf.push_str(&format!("  class {} contentSection\n", sid));
    
    // Subpage specific content based on type
    match subpage_type.as_str() {
        "create" => {
            let form_id = format!("{}_create_form", sid);
            buf.push_str(&format!("  {} --> {}[\\\"📝 Create Form\\n• Input Fields\\n• Validation\\n• Submit Button\\\"]\n", sid, form_id));
            buf.push_str(&format!("  class {} form\n", form_id));
            
            let create_actions_id = format!("{}_create_actions", form_id);
            buf.push_str(&format!("  {} --> {}[\\\"💾 Save | ❌ Cancel | 🔄 Reset\\\"]\n", form_id, create_actions_id));
            buf.push_str(&format!("  class {} button\n", create_actions_id));
        }
        "edit" => {
            let edit_form_id = format!("{}_edit_form", sid);
            buf.push_str(&format!("  {} --> {}[\\\"✏️ Edit Form\\n• Pre-filled Fields\\n• Change Detection\\n• Save Button\\\"]\n", sid, edit_form_id));
            buf.push_str(&format!("  class {} form\n", edit_form_id));
            
            let edit_actions_id = format!("{}_edit_actions", edit_form_id);
            buf.push_str(&format!("  {} --> {}[\\\"💾 Update | ❌ Cancel | 🗑️ Delete\\\"]\n", edit_form_id, edit_actions_id));
            buf.push_str(&format!("  class {} button\n", edit_actions_id));
        }
        "list" => {
            let list_table_id = format!("{}_list_table", sid);
            buf.push_str(&format!("  {} --> {}[\\\"📋 Data Table\\n• Headers\\n• Sortable Columns\\n• Row Actions\\\"]\n", sid, list_table_id));
            buf.push_str(&format!("  class {} table\n", list_table_id));
            
            let list_controls_id = format!("{}_list_controls", sid);
            buf.push_str(&format!("  {} --> {}[\\\"🔍 Search | 📊 Filter | ➕ Add New\\\"]\n", sid, list_controls_id));
            buf.push_str(&format!("  class {} form\n", list_controls_id));
        }
        "detail" | "view" | "show" => {
            let detail_info_id = format!("{}_detail_info", sid);
            buf.push_str(&format!("  {} --> {}[\\\"📊 Detail View\\n• Field Labels\\n• Data Values\\n• Related Info\\\"]\n", sid, detail_info_id));
            buf.push_str(&format!("  class {} contentSection\n", detail_info_id));
            
            let detail_actions_id = format!("{}_detail_actions", sid);
            buf.push_str(&format!("  {} --> {}[\\\"✏️ Edit | 🗑️ Delete | 📤 Export | 📧 Share\\\"]\n", sid, detail_actions_id));
            buf.push_str(&format!("  class {} button\n", detail_actions_id));
        }
        "delete" => {
            let delete_warning_id = format!("{}_delete_warning", sid);
            buf.push_str(&format!("  {} --> {}[\\\"⚠️ Deletion Warning\\n• Impact Assessment\\n• Confirmation Required\\\"]\n", sid, delete_warning_id));
            buf.push_str(&format!("  class {} notification\n", delete_warning_id));
            
            let delete_confirm_id = format!("{}_delete_confirm", sid);
            buf.push_str(&format!("  {} --> {}[\\\"🗑️ Confirm Delete | ❌ Cancel\\\"]\n", sid, delete_confirm_id));
            buf.push_str(&format!("  class {} button\n", delete_confirm_id));
        }
        _ => {
            // Generic subpage content
            let generic_content_id = format!("{}_content", sid);
            buf.push_str(&format!("  {} --> {}[\\\"📄 Content Area\\n• Main Content\\n• Interactive Elements\\\"]\n", sid, generic_content_id));
            buf.push_str(&format!("  class {} contentSection\n", generic_content_id));
        }
    }
    
    // Add navigation back to parent
    let back_nav_id = format!("{}_back_nav", sid);
    buf.push_str(&format!("  {} --> {}[\\\"← Back to {}\\\"]\n", sid, back_nav_id, parent_page));
    buf.push_str(&format!("  class {} navigation\n", back_nav_id));
    buf.push_str(&format!("  {} -.->|navigate| {}\n", back_nav_id, parent_id));
    
    Ok(())
}

// Generate modal flows and interactions
fn generate_modal_flows(buf: &mut String, page_id: &str, page_type: &str, _module: &str, _page: &str) {
    match page_type {
        "list" => {
            // Bulk actions confirmation modal
            let bulk_modal_id = format!("{}_bulk_modal", page_id);
            buf.push_str(&format!("  {} -.->|bulk action| {}[\\\"❓ Bulk Action Confirmation\\nProcess N selected items?\\\"]\n", page_id, bulk_modal_id));
            buf.push_str(&format!("  class {} modal\n", bulk_modal_id));
            
            let bulk_confirm_id = format!("{}_bulk_confirm", bulk_modal_id);
            buf.push_str(&format!("  {} --> {}[\\\"✅ Confirm | ❌ Cancel\\\"]\n", bulk_modal_id, bulk_confirm_id));
            buf.push_str(&format!("  class {} button\n", bulk_confirm_id));
        }
        "create" | "edit" => {
            // Unsaved changes modal
            let unsaved_modal_id = format!("{}_unsaved_modal", page_id);
            buf.push_str(&format!("  {} -.->|navigate away| {}[\\\"⚠️ Unsaved Changes\\nYou have unsaved changes. Continue?\\\"]\n", page_id, unsaved_modal_id));
            buf.push_str(&format!("  class {} modal\n", unsaved_modal_id));
            
            let unsaved_actions_id = format!("{}_unsaved_actions", unsaved_modal_id);
            buf.push_str(&format!("  {} --> {}[\\\"💾 Save & Continue | ❌ Discard | 🔙 Stay\\\"]\n", unsaved_modal_id, unsaved_actions_id));
            buf.push_str(&format!("  class {} button\n", unsaved_actions_id));
        }
        "delete" => {
            // Final deletion confirmation
            let delete_modal_id = format!("{}_delete_modal", page_id);
            buf.push_str(&format!("  {} -.->|delete confirm| {}[\\\"🗑️ Final Confirmation\\nType 'DELETE' to confirm\\\"]\n", page_id, delete_modal_id));
            buf.push_str(&format!("  class {} modal\n", delete_modal_id));
        }
        _ => {
            // Generic loading modal
            let loading_modal_id = format!("{}_loading_modal", page_id);
            buf.push_str(&format!("  {} -.->|async action| {}[\\\"⏳ Loading...\\nPlease wait\\\"]\n", page_id, loading_modal_id));
            buf.push_str(&format!("  class {} loading\n", loading_modal_id));
        }
    }
}

// Enhanced detailed page Mermaid generation with UI elements
async fn generate_detailed_page_mermaid_html(module: String, page: String) -> Result<String, String> {
    use std::fs;
    let root = std::path::PathBuf::from("design-assets");
    let pdir = root.join(&module).join("pages").join(&page);
    if !pdir.exists() { return Err("頁面不存在".into()); }

    let mut buf = String::new();
    let mermaid_settings = get_mermaid_settings();
    buf.push_str(&format!("flowchart {}\n", mermaid_settings.layout_direction));
    
    // Enhanced class definitions for detailed UI elements
    buf.push_str("  classDef pageContainer fill:#e8f5e8,stroke:#4caf50,stroke-width:3px\n");
    buf.push_str("  classDef headerSection fill:#e3f2fd,stroke:#2196f3,stroke-width:2px\n");
    buf.push_str("  classDef contentSection fill:#f1f8e9,stroke:#8bc34a,stroke-width:2px\n");
    buf.push_str("  classDef footerSection fill:#fce4ec,stroke:#e91e63,stroke-width:2px\n");
    buf.push_str("  classDef navigation fill:#fff3e0,stroke:#ff9800,stroke-width:2px\n");
    buf.push_str("  classDef button fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px\n");
    buf.push_str("  classDef form fill:#fff8e1,stroke:#ffc107,stroke-width:2px\n");
    buf.push_str("  classDef input fill:#e8f5e8,stroke:#4caf50,stroke-width:1px\n");
    buf.push_str("  classDef modal fill:#ffebee,stroke:#f44336,stroke-width:2px\n");
    buf.push_str("  classDef table fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px\n");
    buf.push_str("  classDef sidebar fill:#f9fbe7,stroke:#827717,stroke-width:2px\n");
    buf.push_str("  classDef dropdown fill:#fff3e0,stroke:#ff5722,stroke-width:2px\n");
    buf.push_str("  classDef notification fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px\n");
    buf.push_str("  classDef loading fill:#f3e5f5,stroke:#673ab7,stroke-width:2px\n");

    let mid = sanitize_id(&module);
    let pid = format!("{}_{}", mid, sanitize_id(&page));
    let pmeta = read_page_meta(&pdir);
    
    // Generate detailed page structure
    generate_detailed_page_structure(&mut buf, &module, &page, &pid, &pmeta, &pdir)?;

    // Enhanced subpages with detailed UI elements
    let sp = pdir.join("subpages");
    if sp.exists() {
        if let Ok(sentries) = std::fs::read_dir(&sp) {
            for se in sentries.flatten() {
                let spath = se.path(); 
                if !spath.is_dir() { continue; }
                let sslug = spath.file_name().and_then(|s| s.to_str()).unwrap_or("");
                let sid = format!("{}_{}", pid, sanitize_id(sslug));
                let smeta = read_page_meta(&spath);
                
                // Generate detailed subpage structure
                generate_detailed_subpage_structure(&mut buf, &module, &page, sslug, &sid, &smeta, &pid)?;
            }
        }
    }
    
    // Enhanced navigation links with interaction details
    if let Some(links) = pmeta.links.clone() {
        for lk in links.iter() {
            let (tid, label) = resolve_link_id(lk, &module, &page);
            if let Some(tid) = tid {
                let link_label = label.unwrap_or_else(|| "Navigate".to_string());
                buf.push_str(&format!("  {} -.->|🔗 {}| {}[\\\"🎯 {}\\\"]\n", pid, link_label, tid, lk.to));
                buf.push_str(&format!("  class {} navigation\n", tid));
            }
        }
    }

    // 寫檔
    let mmd_path = std::path::PathBuf::from("ai-docs").join(format!("page-{}-{}-sitemap.mmd", sanitize_id(&module), sanitize_id(&page)));
    std::fs::create_dir_all(mmd_path.parent().unwrap()).map_err(|e| e.to_string())?;
    fs::write(&mmd_path, buf).map_err(|e| e.to_string())?;
    let content = std::fs::read_to_string(&mmd_path).map_err(|e| e.to_string())?;
    let mermaid_settings = get_mermaid_settings();
    let html = format!(r#"<!DOCTYPE html>
<html lang=\"zh-TW\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Page Sitemap - {module}/{page}</title>
  <script type=\"module\">import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs'; mermaid.initialize({{ startOnLoad: true, theme: '{}' }});</script>
</head><body><h1>Page Sitemap - {module}/{page}</h1><div class=\"mermaid\">{graph}</div></body></html>"#, mermaid_settings.theme, module=module, page=page, graph=content);
    let html_path = std::path::PathBuf::from("ai-docs").join(format!("page-{}-{}-sitemap.html", sanitize_id(&module), sanitize_id(&page)));
    fs::write(&html_path, html).map_err(|e| e.to_string())?;
    Ok(html_path.to_string_lossy().to_string())
}

// Sitemap export/import functionality
#[derive(Debug, Serialize, Deserialize)]
pub struct SitemapExport {
    pub project_name: String,
    pub export_timestamp: String,
    pub modules: Vec<ModuleExport>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModuleExport {
    pub name: String,
    pub description: String,
    pub pages: Vec<PageExport>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PageExport {
    pub slug: String,
    pub title: Option<String>,
    pub status: Option<String>,
    pub route: Option<String>,
    pub notes: Option<String>,
    pub subpages: Vec<SubpageExport>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubpageExport {
    pub slug: String,
    pub title: Option<String>,
    pub status: Option<String>,
    pub route: Option<String>,
    pub notes: Option<String>,
}

#[tauri::command]
pub async fn export_sitemap() -> Result<String, String> {
    use std::fs;
    
    let project = get_or_init_default_project().await?;
    let timestamp = chrono::Utc::now().format("%Y-%m-%d_%H-%M-%S").to_string();
    
    let root = std::path::PathBuf::from("design-assets");
    let mut modules = Vec::new();
    
    if let Ok(entries) = fs::read_dir(&root) {
        for entry in entries.flatten() {
            let module_path = entry.path();
            if !module_path.is_dir() { continue; }
            
            let module_name = module_path.file_name()
                .and_then(|s| s.to_str())
                .unwrap_or("")
                .to_string();
            
            let pages_dir = module_path.join("pages");
            let mut pages = Vec::new();
            
            if let Ok(page_entries) = fs::read_dir(&pages_dir) {
                for page_entry in page_entries.flatten() {
                    let page_path = page_entry.path();
                    if !page_path.is_dir() { continue; }
                    
                    let page_slug = page_path.file_name()
                        .and_then(|s| s.to_str())
                        .unwrap_or("")
                        .to_string();
                    
                    // Read page meta
                    let meta_path = page_path.join("meta.json");
                    let (title, status, route, notes) = if meta_path.exists() {
                        if let Ok(meta_content) = fs::read_to_string(&meta_path) {
                            if let Ok(meta) = serde_json::from_str::<serde_json::Value>(&meta_content) {
                                (
                                    meta.get("title").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                    meta.get("status").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                    meta.get("route").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                    meta.get("notes").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                )
                            } else { (None, None, None, None) }
                        } else { (None, None, None, None) }
                    } else { (None, None, None, None) };
                    
                    // Read subpages
                    let mut subpages = Vec::new();
                    let subpages_dir = page_path.join("subpages");
                    if let Ok(sub_entries) = fs::read_dir(&subpages_dir) {
                        for sub_entry in sub_entries.flatten() {
                            let sub_path = sub_entry.path();
                            if !sub_path.is_dir() { continue; }
                            
                            let sub_slug = sub_path.file_name()
                                .and_then(|s| s.to_str())
                                .unwrap_or("")
                                .to_string();
                            
                            let sub_meta_path = sub_path.join("meta.json");
                            let (sub_title, sub_status, sub_route, sub_notes) = if sub_meta_path.exists() {
                                if let Ok(sub_meta_content) = fs::read_to_string(&sub_meta_path) {
                                    if let Ok(sub_meta) = serde_json::from_str::<serde_json::Value>(&sub_meta_content) {
                                        (
                                            sub_meta.get("title").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                            sub_meta.get("status").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                            sub_meta.get("route").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                            sub_meta.get("notes").and_then(|v| v.as_str()).map(|s| s.to_string()),
                                        )
                                    } else { (None, None, None, None) }
                                } else { (None, None, None, None) }
                            } else { (None, None, None, None) };
                            
                            subpages.push(SubpageExport {
                                slug: sub_slug,
                                title: sub_title,
                                status: sub_status,
                                route: sub_route,
                                notes: sub_notes,
                            });
                        }
                    }
                    
                    pages.push(PageExport {
                        slug: page_slug,
                        title,
                        status,
                        route,
                        notes,
                        subpages,
                    });
                }
            }
            
            modules.push(ModuleExport {
                name: module_name,
                description: "Exported module".to_string(),
                pages,
            });
        }
    }
    
    let export = SitemapExport {
        project_name: project.name,
        export_timestamp: timestamp.clone(),
        modules,
    };
    
    let export_json = serde_json::to_string_pretty(&export)
        .map_err(|e| format!("序列化導出數據失敗: {}", e))?;
    
    let export_path = std::path::PathBuf::from("ai-docs").join(format!("sitemap-export-{}.json", timestamp));
    std::fs::create_dir_all(export_path.parent().unwrap()).map_err(|e| e.to_string())?;
    fs::write(&export_path, export_json).map_err(|e| format!("寫入導出檔案失敗: {}", e))?;
    
    Ok(export_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn import_sitemap(file_path: String) -> Result<String, String> {
    use std::fs;
    
    let import_content = fs::read_to_string(&file_path)
        .map_err(|e| format!("讀取導入檔案失敗: {}", e))?;
    
    let import_data: SitemapExport = serde_json::from_str(&import_content)
        .map_err(|e| format!("解析導入數據失敗: {}", e))?;
    
    let root = std::path::PathBuf::from("design-assets");
    let mut imported_modules = 0;
    let mut imported_pages = 0;
    let mut imported_subpages = 0;
    
    for module in import_data.modules {
        let module_path = root.join(&module.name);
        let pages_path = module_path.join("pages");
        
        // Create module structure
        fs::create_dir_all(&pages_path).map_err(|e| format!("創建模組目錄失敗: {}", e))?;
        imported_modules += 1;
        
        for page in module.pages {
            let page_path = pages_path.join(&page.slug);
            
            // Create page directories
            fs::create_dir_all(&page_path.join("screenshots")).map_err(|e| e.to_string())?;
            fs::create_dir_all(&page_path.join("html")).map_err(|e| e.to_string())?;
            fs::create_dir_all(&page_path.join("css")).map_err(|e| e.to_string())?;
            
            // Create page meta.json
            let page_meta = serde_json::json!({
                "slug": page.slug,
                "title": page.title.unwrap_or_else(|| page.slug.clone()),
                "status": page.status.unwrap_or_else(|| "active".to_string()),
                "route": page.route.unwrap_or_else(|| format!("/{}", page.slug)),
                "notes": page.notes.unwrap_or_default()
            });
            
            fs::write(
                page_path.join("meta.json"),
                serde_json::to_string_pretty(&page_meta).unwrap()
            ).map_err(|e| e.to_string())?;
            imported_pages += 1;
            
            // Create subpages
            if !page.subpages.is_empty() {
                let subpages_path = page_path.join("subpages");
                fs::create_dir_all(&subpages_path).map_err(|e| e.to_string())?;
                
                for subpage in page.subpages {
                    let sub_path = subpages_path.join(&subpage.slug);
                    
                    // Create subpage directories
                    fs::create_dir_all(&sub_path.join("screenshots")).map_err(|e| e.to_string())?;
                    fs::create_dir_all(&sub_path.join("html")).map_err(|e| e.to_string())?;
                    fs::create_dir_all(&sub_path.join("css")).map_err(|e| e.to_string())?;
                    
                    // Create subpage meta.json
                    let sub_meta = serde_json::json!({
                        "slug": subpage.slug,
                        "title": subpage.title.unwrap_or_else(|| subpage.slug.clone()),
                        "status": subpage.status.unwrap_or_else(|| "active".to_string()),
                        "route": subpage.route.unwrap_or_else(|| format!("/{}/{}", page.slug, subpage.slug)),
                        "notes": subpage.notes.unwrap_or_default()
                    });
                    
                    fs::write(
                        sub_path.join("meta.json"),
                        serde_json::to_string_pretty(&sub_meta).unwrap()
                    ).map_err(|e| e.to_string())?;
                    imported_subpages += 1;
                }
            }
        }
    }
    
    Ok(format!("導入完成：{} 個模組，{} 個頁面，{} 個子頁", imported_modules, imported_pages, imported_subpages))
}

// Sitemap analytics and metrics
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SitemapAnalytics {
    pub project_name: String,
    pub total_modules: usize,
    pub total_pages: usize,
    pub total_subpages: usize,
    pub average_pages_per_module: f64,
    pub modules_with_deep_structure: Vec<String>, // modules with 3+ levels
    pub orphaned_pages: Vec<String>, // pages without proper meta or routing
    pub status_distribution: std::collections::HashMap<String, usize>,
    pub deepest_module: Option<String>,
    pub max_depth: usize,
    pub coverage_metrics: CoverageMetrics,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CoverageMetrics {
    pub pages_with_screenshots: usize,
    pub pages_with_html: usize,
    pub pages_with_css: usize,
    pub completion_percentage: f64,
    pub modules_completion: std::collections::HashMap<String, ModuleCompletion>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModuleCompletion {
    pub total_pages: usize,
    pub pages_with_assets: usize,
    pub completion_rate: f64,
}

#[tauri::command]
pub async fn analyze_sitemap() -> Result<SitemapAnalytics, String> {
    // Check cache first
    {
        let cache = SITEMAP_CACHE.lock().unwrap();
        if SitemapCache::is_fresh(&cache.analytics, CACHE_DURATION_LONG) {
            if let Some(cached) = &cache.analytics {
                return Ok(cached.data.clone());
            }
        }
    }

    // Build analytics from filesystem
    let result = build_sitemap_analytics_uncached().await?;

    // Cache the result
    {
        let mut cache = SITEMAP_CACHE.lock().unwrap();
        cache.analytics = Some(CachedData {
            data: result.clone(),
            timestamp: SystemTime::now(),
        });
    }

    Ok(result)
}

async fn build_sitemap_analytics_uncached() -> Result<SitemapAnalytics, String> {
    use std::fs;
    
    let project = get_or_init_default_project().await?;
    let root = std::path::PathBuf::from("design-assets");
    
    let mut total_modules = 0;
    let mut total_pages = 0;
    let mut total_subpages = 0;
    let mut modules_with_deep_structure = Vec::new();
    let mut orphaned_pages = Vec::new();
    let mut status_distribution: std::collections::HashMap<String, usize> = std::collections::HashMap::new();
    let mut max_depth = 0;
    let mut deepest_module: Option<String> = None;
    
    let mut pages_with_screenshots = 0;
    let mut pages_with_html = 0;
    let mut pages_with_css = 0;
    let mut modules_completion: std::collections::HashMap<String, ModuleCompletion> = std::collections::HashMap::new();
    
    if let Ok(entries) = fs::read_dir(&root) {
        for entry in entries.flatten() {
            let module_path = entry.path();
            if !module_path.is_dir() { continue; }
            
            let module_name = module_path.file_name()
                .and_then(|s| s.to_str())
                .unwrap_or("")
                .to_string();
            
            total_modules += 1;
            let mut module_pages = 0;
            let mut module_pages_with_assets = 0;
            let mut module_depth = 1; // module level
            
            let pages_dir = module_path.join("pages");
            if let Ok(page_entries) = fs::read_dir(&pages_dir) {
                for page_entry in page_entries.flatten() {
                    let page_path = page_entry.path();
                    if !page_path.is_dir() { continue; }
                    
                    let page_slug = page_path.file_name()
                        .and_then(|s| s.to_str())
                        .unwrap_or("")
                        .to_string();
                    
                    total_pages += 1;
                    module_pages += 1;
                    
                    // Check for assets
                    let has_screenshots = !get_files_in_dir(&page_path.join("screenshots")).is_empty();
                    let has_html = !get_files_in_dir(&page_path.join("html")).is_empty();
                    let has_css = !get_files_in_dir(&page_path.join("css")).is_empty();
                    
                    if has_screenshots { pages_with_screenshots += 1; }
                    if has_html { pages_with_html += 1; }
                    if has_css { pages_with_css += 1; }
                    if has_screenshots || has_html || has_css { module_pages_with_assets += 1; }
                    
                    // Check meta and routing
                    let meta_path = page_path.join("meta.json");
                    if meta_path.exists() {
                        if let Ok(meta_content) = fs::read_to_string(&meta_path) {
                            if let Ok(meta) = serde_json::from_str::<serde_json::Value>(&meta_content) {
                                let status = meta.get("status")
                                    .and_then(|v| v.as_str())
                                    .unwrap_or("unknown");
                                *status_distribution.entry(status.to_string()).or_insert(0) += 1;
                                
                                // Check if route is properly defined
                                if meta.get("route").is_none() || meta.get("title").is_none() {
                                    orphaned_pages.push(format!("{}/{}", module_name, page_slug));
                                }
                            } else {
                                orphaned_pages.push(format!("{}/{} (invalid meta)", module_name, page_slug));
                            }
                        } else {
                            orphaned_pages.push(format!("{}/{} (unreadable meta)", module_name, page_slug));
                        }
                    } else {
                        orphaned_pages.push(format!("{}/{} (no meta)", module_name, page_slug));
                    }
                    
                    // Check subpages
                    let subpages_dir = page_path.join("subpages");
                    if let Ok(sub_entries) = fs::read_dir(&subpages_dir) {
                        let mut has_subpages = false;
                        for sub_entry in sub_entries.flatten() {
                            let sub_path = sub_entry.path();
                            if !sub_path.is_dir() { continue; }
                            
                            has_subpages = true;
                            total_subpages += 1;
                            
                            // Check subpage assets
                            let sub_has_screenshots = !get_files_in_dir(&sub_path.join("screenshots")).is_empty();
                            let sub_has_html = !get_files_in_dir(&sub_path.join("html")).is_empty();
                            let sub_has_css = !get_files_in_dir(&sub_path.join("css")).is_empty();
                            
                            if sub_has_screenshots { pages_with_screenshots += 1; }
                            if sub_has_html { pages_with_html += 1; }
                            if sub_has_css { pages_with_css += 1; }
                            
                            // Check subpage meta
                            let sub_meta_path = sub_path.join("meta.json");
                            if sub_meta_path.exists() {
                                if let Ok(sub_meta_content) = fs::read_to_string(&sub_meta_path) {
                                    if let Ok(sub_meta) = serde_json::from_str::<serde_json::Value>(&sub_meta_content) {
                                        let sub_status = sub_meta.get("status")
                                            .and_then(|v| v.as_str())
                                            .unwrap_or("unknown");
                                        *status_distribution.entry(sub_status.to_string()).or_insert(0) += 1;
                                    }
                                }
                            }
                        }
                        if has_subpages {
                            module_depth = module_depth.max(3); // module -> page -> subpage
                        }
                    }
                }
            }
            
            // Track module completion
            let completion_rate = if module_pages > 0 {
                (module_pages_with_assets as f64 / module_pages as f64) * 100.0
            } else {
                0.0
            };
            
            modules_completion.insert(module_name.clone(), ModuleCompletion {
                total_pages: module_pages,
                pages_with_assets: module_pages_with_assets,
                completion_rate,
            });
            
            // Track depth and complex modules
            if module_depth >= 3 {
                modules_with_deep_structure.push(module_name.clone());
            }
            
            if module_depth > max_depth {
                max_depth = module_depth;
                deepest_module = Some(module_name);
            }
        }
    }
    
    let average_pages_per_module = if total_modules > 0 {
        total_pages as f64 / total_modules as f64
    } else {
        0.0
    };
    
    let total_potential_assets = total_pages + total_subpages;
    let completion_percentage = if total_potential_assets > 0 {
        ((pages_with_screenshots + pages_with_html + pages_with_css) as f64 / (total_potential_assets * 3) as f64) * 100.0
    } else {
        0.0
    };
    
    let coverage_metrics = CoverageMetrics {
        pages_with_screenshots,
        pages_with_html,
        pages_with_css,
        completion_percentage,
        modules_completion,
    };
    
    Ok(SitemapAnalytics {
        project_name: project.name,
        total_modules,
        total_pages,
        total_subpages,
        average_pages_per_module,
        modules_with_deep_structure,
        orphaned_pages,
        status_distribution,
        deepest_module,
        max_depth,
        coverage_metrics,
    })
}

fn get_files_in_dir(dir: &std::path::Path) -> Vec<String> {
    if let Ok(entries) = std::fs::read_dir(dir) {
        entries.filter_map(|entry| {
            entry.ok().and_then(|e| {
                let path = e.path();
                if path.is_file() {
                    path.file_name().and_then(|name| name.to_str()).map(|s| s.to_string())
                } else {
                    None
                }
            })
        }).collect()
    } else {
        Vec::new()
    }
}

// 導出整包：
// - 複製 design-assets (由 external_root 指定)
// - 複製兩個 AI 說明文件到 ai-docs/
// - 為每個模組生成 modules/<module> 下的 index.html/styles.css/ai-spec.md
// - 可選 zip
#[tauri::command]
pub async fn generate_unified_slice_package(
    external_design_assets_root: String,
    ai_doc_frontend_instructions: String,
    ai_doc_ui_friendly: String,
    include_html: bool,
    include_css: bool,
    include_responsive: bool,
    include_specs: bool,
    overwrite_strategy: String,
    make_zip: bool,
) -> Result<UnifiedPackageResult, String> {
    use chrono::Local;
    use std::fs;
    let ts = Local::now().format("%Y%m%d-%H%M%S").to_string();
    let base_output = PathBuf::from("output");
    if let Err(e) = fs::create_dir_all(&base_output) { return Err(format!("建立 output 失敗: {}", e)); }
    let out_dir = base_output.join(format!("slice-package-{}", ts));
    if let Err(e) = fs::create_dir_all(&out_dir) { return Err(format!("建立輸出資料夾失敗: {}", e)); }

    // 1) 複製 design-assets
    let source_assets = PathBuf::from(&external_design_assets_root);
    if !source_assets.exists() { return Err("外部設計資產根目錄不存在".to_string()); }
    let target_assets = out_dir.join("design-assets");
    if let Err(e) = fs::create_dir_all(&target_assets) { return Err(format!("建立目標資產資料夾失敗: {}", e)); }
    if let Err(e) = copy_assets_with_strategy(&source_assets, &target_assets, &overwrite_strategy) {
        return Err(format!("複製設計資產失敗: {}", e));
    }

    // 2) 複製 AI 文件
    let ai_docs_dir = out_dir.join("ai-docs");
    if let Err(e) = fs::create_dir_all(&ai_docs_dir) { return Err(format!("建立 ai-docs 失敗: {}", e)); }
    let copy_doc = |src: &str| -> Result<(), String> {
        let src_path = PathBuf::from(src);
        if !src_path.exists() { return Err(format!("AI 文件不存在: {}", src)); }
        let file_name = src_path.file_name().and_then(|s| s.to_str()).ok_or("AI 文件檔名無效")?;
        let dest = ai_docs_dir.join(file_name);
        copy_file_with_strategy(&src_path, &dest, &overwrite_strategy).map_err(|e| format!("複製 AI 文件失敗: {}", e))
    };
    copy_doc(&ai_doc_frontend_instructions)?;
    copy_doc(&ai_doc_ui_friendly)?;

    // 3) 為每個模組生成 modules/<module>
    let modules_dir = out_dir.join("modules");
    if let Err(e) = fs::create_dir_all(&modules_dir) { return Err(format!("建立 modules 失敗: {}", e)); }
    let mut count = 0usize;
    if let Ok(entries) = fs::read_dir(&source_assets) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|s| s.to_str()) {
                    let module_out = modules_dir.join(name);
                    if let Err(e) = fs::create_dir_all(&module_out) { return Err(format!("建立模組資料夾失敗: {}", e)); }
                    if include_html {
                        if let Err(e) = generate_html_template_with_strategy(name, &module_out, &overwrite_strategy) { return Err(format!("{}: 生成 HTML 失敗: {}", name, e)); }
                    }
                    if include_css {
                        if let Err(e) = generate_css_styles_with_strategy(name, &module_out, include_responsive, &overwrite_strategy) { return Err(format!("{}: 生成 CSS 失敗: {}", name, e)); }
                    }
                    if include_specs {
                        if let Err(e) = generate_ai_spec_with_strategy(name, &module_out, &overwrite_strategy) { return Err(format!("{}: 生成 AI 說明失敗: {}", name, e)); }
                    }
                    count += 1;
                }
            }
        }
    }

    // 4) 生成 README 索引
    let readme = format!(
        "# ErSlice 切版說明包\n\n- 設計資產: ./design-assets\n- AI 說明文件: ./ai-docs/ai-frontend-development-instructions.md, ./ai-docs/ai-ui-friendly-documentation-dev.md\n- 模組骨架（每模組）: ./modules/<module>/\n\n此包可直接提供給工程師或 AI 進行切版實作。\n"
    );
    if let Err(e) = std::fs::write(out_dir.join("README.md"), readme) {
        return Err(format!("寫入 README 失敗: {}", e));
    }

    // 5) zip（可選）
    let mut zip_path: Option<String> = None;
    if make_zip {
        let zip_file = base_output.join(format!("{}.zip", out_dir.file_name().unwrap().to_string_lossy()));
        #[cfg(target_os = "macos")]
        {
            use std::process::Command;
            let cwd = base_output.clone();
            let folder_name = out_dir.file_name().unwrap().to_string_lossy().to_string();
            let status = Command::new("zip")
                .current_dir(&cwd)
                .args(["-r", "-q", zip_file.file_name().unwrap().to_str().unwrap(), &folder_name])
                .status();
            match status {
                Ok(s) if s.success() => {
                    zip_path = Some(zip_file.to_string_lossy().to_string());
                }
                Ok(s) => return Err(format!("zip 指令失敗，代碼: {}", s)),
                Err(e) => return Err(format!("執行 zip 失敗: {}", e)),
            }
        }
        #[cfg(not(target_os = "macos"))]
        {
            // 非 macOS 環境暫不壓縮，回傳資料夾成功
            zip_path = None;
        }
    }

    Ok(UnifiedPackageResult {
        output_dir: out_dir.to_string_lossy().to_string(),
        zip_path,
        modules_count: count,
    })
}

// 列出模組資產
#[tauri::command]
pub async fn list_assets(asset_path: String) -> Result<AssetList, String> {
    let base_dir = PathBuf::from("design-assets").join(&asset_path);
    // 如果目錄不存在，返回空的資產列表（而不是錯誤）
    if !base_dir.exists() {
        return Ok(AssetList {
            screenshots: Vec::new(),
            html: Vec::new(),
            css: Vec::new(),
        });
    }

    let mut result = AssetList {
        screenshots: Vec::new(),
        html: Vec::new(),
        css: Vec::new(),
    };

    let read_dir = |sub: &str, vec: &mut Vec<String>| {
        let p = base_dir.join(sub);
        if let Ok(entries) = std::fs::read_dir(&p) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() {
                    if let Some(file_name) = path.file_name() {
                        if let Some(s) = file_name.to_str() {
                            vec.push(s.to_string());
                        }
                    }
                }
            }
        }
    };

    read_dir("screenshots", &mut result.screenshots);
    read_dir("html", &mut result.html);
    read_dir("css", &mut result.css);

    Ok(result)
}

// 刪除指定資產
#[tauri::command]
pub async fn delete_design_asset(
    asset_path: String,
    asset_type: String,
    file_name: String,
) -> Result<String, String> {
    let base_dir = PathBuf::from("design-assets").join(&asset_path);
    if !base_dir.exists() {
        return Err("資產路徑不存在".to_string());
    }

    let target_dir = match asset_type.as_str() {
        "screenshots" => base_dir.join("screenshots"),
        "html" => base_dir.join("html"),
        "css" => base_dir.join("css"),
        _ => return Err("不支援的資產類型".to_string()),
    };

    let target_path = target_dir.join(&file_name);
    if !target_path.exists() {
        return Err("檔案不存在".to_string());
    }

    std::fs::remove_file(&target_path)
        .map_err(|e| format!("刪除檔案失敗: {}", e))?;

    Ok(format!("已刪除: {}", target_path.display()))
}

// 封存模組（移動至 design-assets-archived）
#[tauri::command]
pub async fn archive_design_module(module_name: String) -> Result<String, String> {
    let module_dir = PathBuf::from("design-assets").join(&module_name);
    if !module_dir.exists() {
        return Err("設計模組不存在".to_string());
    }
    let archived_root = PathBuf::from("design-assets-archived");
    if let Err(e) = std::fs::create_dir_all(&archived_root) {
        return Err(format!("創建封存目錄失敗: {}", e));
    }
    let target = archived_root.join(&module_name);
    std::fs::rename(&module_dir, &target)
        .map_err(|e| format!("封存失敗: {}", e))?;
    Ok(format!("已封存模組至: {}", target.display()))
}

// 刪除模組（遞迴刪除目錄）
#[tauri::command]
pub async fn delete_design_module(module_name: String) -> Result<String, String> {
    let module_dir = PathBuf::from("design-assets").join(&module_name);
    if !module_dir.exists() {
        return Err("設計模組不存在".to_string());
    }
    std::fs::remove_dir_all(&module_dir)
        .map_err(|e| format!("刪除模組失敗: {}", e))?;
    Ok(format!("已刪除模組: {}", module_name))
}

// 還原封存模組（從 design-assets-archived 移回 design-assets）
#[tauri::command]
pub async fn unarchive_design_module(module_name: String) -> Result<String, String> {
    let archived_root = PathBuf::from("design-assets-archived");
    let archived_path = archived_root.join(&module_name);
    if !archived_path.exists() {
        return Err("封存的模組不存在".to_string());
    }
    let active_root = PathBuf::from("design-assets");
    if let Err(e) = std::fs::create_dir_all(&active_root) {
        return Err(format!("創建目標目錄失敗: {}", e));
    }
    let target = active_root.join(&module_name);
    if target.exists() {
        return Err("目標模組已存在，無法還原（請先刪除或重新命名）".to_string());
    }
    std::fs::rename(&archived_path, &target)
        .map_err(|e| format!("還原失敗: {}", e))?;
    Ok(format!("已還原模組至: {}", target.display()))
}

// ====== Performance Optimization APIs ======

/// Clear all caches - useful for debugging or when file system changes externally
#[tauri::command]
pub async fn clear_sitemap_cache() -> Result<String, String> {
    let mut cache = SITEMAP_CACHE.lock().unwrap();
    cache.invalidate_all();
    Ok("All sitemap caches cleared".to_string())
}

/// Get cache statistics for monitoring
#[tauri::command]
pub async fn get_cache_stats() -> Result<serde_json::Value, String> {
    let cache = SITEMAP_CACHE.lock().unwrap();
    let stats = serde_json::json!({
        "module_trees_cached": cache.module_trees.len(),
        "analytics_cached": cache.analytics.is_some(),
        "design_modules_cached": cache.design_modules.is_some(),
        "cache_config": {
            "short_duration_seconds": CACHE_DURATION_SHORT.as_secs(),
            "medium_duration_seconds": CACHE_DURATION_MEDIUM.as_secs(),
            "long_duration_seconds": CACHE_DURATION_LONG.as_secs()
        }
    });
    Ok(stats)
}

/// Preload cache for a module - useful for improving perceived performance
#[tauri::command]
pub async fn preload_module_cache(module_name: String) -> Result<String, String> {
    // This will populate the cache
    get_module_tree(module_name.clone()).await?;
    Ok(format!("Module '{}' cache preloaded", module_name))
}

/// Batch preload caches for multiple modules
#[tauri::command]
pub async fn preload_all_modules_cache() -> Result<String, String> {
    let modules = get_design_modules().await?;
    let mut preloaded = 0;
    
    for module in modules {
        if let Ok(_) = get_module_tree(module.name.clone()).await {
            preloaded += 1;
        }
    }
    
    Ok(format!("Preloaded cache for {} modules", preloaded))
}

// ====== Enhanced Detailed Workflow Generation ======

/// Generate comprehensive user workflow diagram showing complete user journeys
#[tauri::command]
pub async fn generate_user_workflow_mermaid_html(module: String) -> Result<String, String> {
    use std::fs;
    let root = std::path::PathBuf::from("design-assets");
    let module_dir = root.join(&module);
    if !module_dir.exists() { return Err("模組不存在".into()); }
    
    let mut buf = String::new();
    let mermaid_settings = get_mermaid_settings();
    buf.push_str(&format!("flowchart {}\n", mermaid_settings.layout_direction));
    
    // Enhanced workflow class definitions
    buf.push_str("  classDef userEntry fill:#e8f5e8,stroke:#4caf50,stroke-width:3px\n");
    buf.push_str("  classDef userAction fill:#fff3e0,stroke:#ff9800,stroke-width:2px\n");
    buf.push_str("  classDef systemResponse fill:#e3f2fd,stroke:#2196f3,stroke-width:2px\n");
    buf.push_str("  classDef decision fill:#fff8e1,stroke:#ffc107,stroke-width:2px\n");
    buf.push_str("  classDef errorState fill:#ffebee,stroke:#f44336,stroke-width:2px\n");
    buf.push_str("  classDef successState fill:#e8f5e8,stroke:#4caf50,stroke-width:2px\n");
    buf.push_str("  classDef dataFlow fill:#f3e5f5,stroke:#9c27b0,stroke-width:1px,stroke-dasharray: 5 5\n");
    buf.push_str("  classDef apiCall fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px\n");
    
    // Generate comprehensive workflow
    generate_user_workflow_structure(&mut buf, &module)?;
    
    // Write files
    let mmd_path = std::path::PathBuf::from("ai-docs").join(format!("workflow-{}-user-journey.mmd", sanitize_id(&module)));
    std::fs::create_dir_all(mmd_path.parent().unwrap()).map_err(|e| e.to_string())?;
    fs::write(&mmd_path, buf).map_err(|e| e.to_string())?;
    let content = std::fs::read_to_string(&mmd_path).map_err(|e| e.to_string())?;
    
    let html = format!(r#"<!DOCTYPE html>
<html lang="zh-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>User Workflow - {module} Module</title>
  <script type="module">import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs'; mermaid.initialize({{ startOnLoad: true, theme: '{}', flowchart: {{ htmlLabels: true, curve: 'basis' }} }});</script>
  <style>body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }} h1 {{ color: #333; }} .mermaid {{ background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}</style>
</head><body><h1>📊 User Workflow - {module} Module</h1><p>Complete user journey and interaction flows</p><div class="mermaid">{graph}</div></body></html>"#, mermaid_settings.theme, module=module, graph=content);
    
    let html_path = std::path::PathBuf::from("ai-docs").join(format!("workflow-{}-user-journey.html", sanitize_id(&module)));
    fs::write(&html_path, html).map_err(|e| e.to_string())?;
    Ok(html_path.to_string_lossy().to_string())
}

// Generate comprehensive user workflow structure
fn generate_user_workflow_structure(buf: &mut String, module: &str) -> Result<(), String> {
    let mid = sanitize_id(module);
    
    // User entry point
    let entry_id = format!("{}_entry", mid);
    buf.push_str(&format!("  {}[\\\"🚪 User Entry Point\\n• Direct URL\\n• Navigation Menu\\n• Search Result\\\"]\n", entry_id));
    buf.push_str(&format!("  class {} userEntry\n", entry_id));
    
    // Authentication check
    let auth_check_id = format!("{}_auth_check", mid);
    buf.push_str(&format!("  {} --> {}{{\\\"🔐 Authentication\\nRequired?\\\"}} \n", entry_id, auth_check_id));
    buf.push_str(&format!("  class {} decision\n", auth_check_id));
    
    // Login flow
    let login_flow_id = format!("{}_login_flow", mid);
    buf.push_str(&format!("  {} -->|Yes| {}[\\\"🔑 Login Process\\n• Username/Email Input\\n• Password Input\\n• 2FA if enabled\\n• Remember Me Option\\\"]\n", auth_check_id, login_flow_id));
    buf.push_str(&format!("  class {} userAction\n", login_flow_id));
    
    let auth_api_id = format!("{}_auth_api", mid);
    buf.push_str(&format!("  {} --> {}[\\\"🔗 Authentication API\\n• Validate Credentials\\n• Generate Session\\n• Set Permissions\\\"]\n", login_flow_id, auth_api_id));
    buf.push_str(&format!("  class {} apiCall\n", auth_api_id));
    
    // Main module entry
    let module_entry_id = format!("{}_module_entry", mid);
    buf.push_str(&format!("  {} -->|No| {}\n", auth_check_id, module_entry_id));
    buf.push_str(&format!("  {} -->|Success| {}\n", auth_api_id, module_entry_id));
    buf.push_str(&format!("  {}[\\\"🏠 {} Module Landing\\n• Overview Dashboard\\n• Quick Actions\\n• Recent Items\\\"]\n", module_entry_id, module));
    buf.push_str(&format!("  class {} systemResponse\n", module_entry_id));
    
    // Error handling for auth failure
    let auth_error_id = format!("{}_auth_error", mid);
    buf.push_str(&format!("  {} -->|Failed| {}[\\\"❌ Authentication Failed\\n• Error Message\\n• Retry Option\\n• Forgot Password\\\"]\n", auth_api_id, auth_error_id));
    buf.push_str(&format!("  class {} errorState\n", auth_error_id));
    buf.push_str(&format!("  {} --> {}\n", auth_error_id, login_flow_id));
    
    // Main workflow branches
    generate_workflow_branches(buf, &module_entry_id, module)?;
    
    // Data loading and error handling
    generate_data_flow_patterns(buf, module)?;
    
    // User feedback and notifications
    generate_feedback_patterns(buf, module)?;
    
    Ok(())
}

// Generate main workflow branches for different user actions
fn generate_workflow_branches(buf: &mut String, entry_id: &str, module: &str) -> Result<(), String> {
    let mid = sanitize_id(module);
    
    // User action decision point
    let action_decision_id = format!("{}_action_decision", mid);
    buf.push_str(&format!("  {} --> {}{{\\\"👤 What does user\\nwant to do?\\\"}} \n", entry_id, action_decision_id));
    buf.push_str(&format!("  class {} decision\n", action_decision_id));
    
    // Browse/View workflow
    let browse_flow_id = format!("{}_browse_flow", mid);
    buf.push_str(&format!("  {} -->|Browse/View| {}[\\\"👁️ Browse Content\\n• Load List View\\n• Apply Filters\\n• Sort Options\\n• Pagination\\\"]\n", action_decision_id, browse_flow_id));
    buf.push_str(&format!("  class {} userAction\n", browse_flow_id));
    
    let view_detail_id = format!("{}_view_detail", mid);
    buf.push_str(&format!("  {} --> {}[\\\"📋 View Details\\n• Click on Item\\n• Load Full Info\\n• Related Data\\n• Action Buttons\\\"]\n", browse_flow_id, view_detail_id));
    buf.push_str(&format!("  class {} systemResponse\n", view_detail_id));
    
    // Create workflow
    let create_flow_id = format!("{}_create_flow", mid);
    buf.push_str(&format!("  {} -->|Create New| {}[\\\"➕ Create New Item\\n• Open Form\\n• Fill Required Fields\\n• Validate Input\\n• Handle Errors\\\"]\n", action_decision_id, create_flow_id));
    buf.push_str(&format!("  class {} userAction\n", create_flow_id));
    
    let create_validation_id = format!("{}_create_validation", mid);
    buf.push_str(&format!("  {} --> {}{{\\\"✅ Form Valid?\\\"}} \n", create_flow_id, create_validation_id));
    buf.push_str(&format!("  class {} decision\n", create_validation_id));
    
    let create_success_id = format!("{}_create_success", mid);
    buf.push_str(&format!("  {} -->|Yes| {}[\\\"💾 Save to Database\\n• Create Record\\n• Update Relationships\\n• Log Activity\\\"]\n", create_validation_id, create_success_id));
    buf.push_str(&format!("  class {} successState\n", create_success_id));
    
    let create_error_id = format!("{}_create_error", mid);
    buf.push_str(&format!("  {} -->|No| {}[\\\"⚠️ Validation Errors\\n• Highlight Fields\\n• Show Messages\\n• Suggest Fixes\\\"]\n", create_validation_id, create_error_id));
    buf.push_str(&format!("  class {} errorState\n", create_error_id));
    buf.push_str(&format!("  {} --> {}\n", create_error_id, create_flow_id));
    
    // Edit workflow
    let edit_flow_id = format!("{}_edit_flow", mid);
    buf.push_str(&format!("  {} -->|Edit Existing| {}[\\\"✏️ Edit Item\\n• Load Current Data\\n• Pre-fill Form\\n• Track Changes\\n• Auto-save Draft\\\"]\n", action_decision_id, edit_flow_id));
    buf.push_str(&format!("  class {} userAction\n", edit_flow_id));
    
    let edit_validation_id = format!("{}_edit_validation", mid);
    buf.push_str(&format!("  {} --> {}{{\\\"✅ Changes Valid?\\\"}} \n", edit_flow_id, edit_validation_id));
    buf.push_str(&format!("  class {} decision\n", edit_validation_id));
    
    let update_success_id = format!("{}_update_success", mid);
    buf.push_str(&format!("  {} -->|Yes| {}[\\\"🔄 Update Database\\n• Save Changes\\n• Update Timestamps\\n• Notify Related Users\\\"]\n", edit_validation_id, update_success_id));
    buf.push_str(&format!("  class {} successState\n", update_success_id));
    
    // Delete workflow
    let delete_flow_id = format!("{}_delete_flow", mid);
    buf.push_str(&format!("  {} -->|Delete| {}[\\\"🗑️ Delete Confirmation\\n• Show Impact\\n• Request Confirmation\\n• Type DELETE\\\"]\n", action_decision_id, delete_flow_id));
    buf.push_str(&format!("  class {} userAction\n", delete_flow_id));
    
    let delete_confirm_id = format!("{}_delete_confirm", mid);
    buf.push_str(&format!("  {} --> {}{{\\\"❓ Confirm Delete?\\\"}} \n", delete_flow_id, delete_confirm_id));
    buf.push_str(&format!("  class {} decision\n", delete_confirm_id));
    
    let delete_success_id = format!("{}_delete_success", mid);
    buf.push_str(&format!("  {} -->|Yes| {}[\\\"🗑️ Remove from Database\\n• Soft Delete\\n• Archive Data\\n• Update References\\\"]\n", delete_confirm_id, delete_success_id));
    buf.push_str(&format!("  class {} successState\n", delete_success_id));
    
    let delete_cancel_id = format!("{}_delete_cancel", mid);
    buf.push_str(&format!("  {} -->|No| {}[\\\"❌ Operation Cancelled\\n• Return to Previous View\\n• No Changes Made\\\"]\n", delete_confirm_id, delete_cancel_id));
    buf.push_str(&format!("  class {} systemResponse\n", delete_cancel_id));
    
    // All success paths lead back to main view
    buf.push_str(&format!("  {} --> {}\n", create_success_id, entry_id));
    buf.push_str(&format!("  {} --> {}\n", update_success_id, entry_id));
    buf.push_str(&format!("  {} --> {}\n", delete_success_id, entry_id));
    buf.push_str(&format!("  {} --> {}\n", delete_cancel_id, view_detail_id));
    
    Ok(())
}

// Generate data flow and API interaction patterns
fn generate_data_flow_patterns(buf: &mut String, module: &str) -> Result<(), String> {
    let mid = sanitize_id(module);
    
    // Data loading patterns
    let data_load_id = format!("{}_data_loading", mid);
    buf.push_str(&format!("  {}[\\\"⏳ Data Loading States\\n• Loading Spinner\\n• Skeleton UI\\n• Progress Indicators\\n• Error Boundaries\\\"]\n", data_load_id));
    buf.push_str(&format!("  class {} systemResponse\n", data_load_id));
    
    // API interaction patterns
    let api_patterns_id = format!("{}_api_patterns", mid);
    buf.push_str(&format!("  {}[\\\"🔗 API Interaction Patterns\\n• Request Headers\\n• Authentication Tokens\\n• Rate Limiting\\n• Retry Logic\\n• Timeout Handling\\\"]\n", api_patterns_id));
    buf.push_str(&format!("  class {} apiCall\n", api_patterns_id));
    
    // Caching strategies
    let cache_patterns_id = format!("{}_cache_patterns", mid);
    buf.push_str(&format!("  {}[\\\"💾 Caching Strategies\\n• Browser Cache\\n• Session Storage\\n• Local Storage\\n• IndexedDB\\n• Service Worker\\\"]\n", cache_patterns_id));
    buf.push_str(&format!("  class {} dataFlow\n", cache_patterns_id));
    
    // Connect data flow
    buf.push_str(&format!("  {} -.->|uses| {}\n", data_load_id, api_patterns_id));
    buf.push_str(&format!("  {} -.->|caches via| {}\n", api_patterns_id, cache_patterns_id));
    
    Ok(())
}

// Generate user feedback and notification patterns
fn generate_feedback_patterns(buf: &mut String, module: &str) -> Result<(), String> {
    let mid = sanitize_id(module);
    
    // Success notifications
    let success_notification_id = format!("{}_success_notifications", mid);
    buf.push_str(&format!("  {}[\\\"✅ Success Feedback\\n• Toast Messages\\n• Status Updates\\n• Progress Confirmation\\n• Visual Indicators\\\"]\n", success_notification_id));
    buf.push_str(&format!("  class {} successState\n", success_notification_id));
    
    // Error handling patterns
    let error_handling_id = format!("{}_error_handling", mid);
    buf.push_str(&format!("  {}[\\\"❌ Error Handling\\n• User-Friendly Messages\\n• Retry Mechanisms\\n• Fallback Options\\n• Support Links\\n• Error Reporting\\\"]\n", error_handling_id));
    buf.push_str(&format!("  class {} errorState\n", error_handling_id));
    
    // Loading states
    let loading_states_id = format!("{}_loading_states", mid);
    buf.push_str(&format!("  {}[\\\"⏳ Loading States\\n• Immediate Feedback\\n• Progressive Loading\\n• Optimistic Updates\\n• Cancel Options\\\"]\n", loading_states_id));
    buf.push_str(&format!("  class {} systemResponse\n", loading_states_id));
    
    // Accessibility features
    let accessibility_id = format!("{}_accessibility", mid);
    buf.push_str(&format!("  {}[\\\"♿ Accessibility Features\\n• Screen Reader Support\\n• Keyboard Navigation\\n• High Contrast Mode\\n• Focus Management\\n• ARIA Labels\\\"]\n", accessibility_id));
    buf.push_str(&format!("  class {} userAction\n", accessibility_id));
    
    Ok(())
}
