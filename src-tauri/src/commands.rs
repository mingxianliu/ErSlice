use serde::{Deserialize, Serialize};
use std::path::PathBuf;


// 設計資產模組資訊
#[derive(Debug, Serialize, Deserialize)]
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
}

#[derive(Debug, Serialize, Deserialize)]
struct ActiveProject { slug: String }

fn projects_root() -> PathBuf { PathBuf::from("projects") }

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
    module_name: String,
    asset_type: String,
    file_path: String,
) -> Result<String, String> {
    let module_dir = PathBuf::from("design-assets").join(&module_name);
    
    if !module_dir.exists() {
        return Err("設計模組不存在".to_string());
    }
    
    let target_dir = match asset_type.as_str() {
        "screenshots" => module_dir.join("screenshots"),
        "html" => module_dir.join("html"),
        "css" => module_dir.join("css"),
        _ => return Err("不支援的資產類型".to_string()),
    };
    
    let source_path = PathBuf::from(file_path);
    let file_name = source_path.file_name()
        .ok_or("無效的檔案路徑")?
        .to_str()
        .ok_or("檔案名稱包含無效字符")?;
    
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
            .arg(format!("display notification \"資產 '{}' 上傳成功到模組 '{}'\" with title \"ErSlice\"", file_name, module_name))
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
        zip_default: true, include_bone_default: false, include_specs_default: false, overwrite_strategy_default: Some("overwrite".into())
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
    use std::fs;
    let module_dir = PathBuf::from("design-assets").join(&module_name);
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
    buf.push_str("%% Auto-generated by ErSlice\n");
    buf.push_str("flowchart TD\n");
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

    let html = format!(r#"<!DOCTYPE html>
<html lang=\"zh-TW\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Project Sitemap - Mermaid</title>
  <style>body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; padding: 16px; }}</style>
  <script type=\"module\">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
    // 點擊事件：支援 file:// 連結（由 data-href 提供）
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        document.querySelectorAll('svg g.node').forEach((n) => {
          const title = n.querySelector('title');
          const id = title ? title.textContent : null;
          if (id && window.__ERSLICE_LINKS && window.__ERSLICE_LINKS[id]) {
            n.style.cursor = 'pointer';
            n.addEventListener('click', () => {
              const href = window.__ERSLICE_LINKS[id];
              if (href) window.location.href = href;
            });
          }
        });
      }, 300);
    });
  </script>
  <script>window.__ERSLICE_TS = Date.now(); window.__ERSLICE_LINKS = {};</script>
  </head>
<body>
  <h1>Project Sitemap (Mermaid)</h1>
  <div class=\"mermaid\">
{graph}
  </div>
  <script>window.__ERSLICE_LINKS = {links};</script>
</body>
</html>
"#, graph = content);

    let html_path = mmd_path.parent().unwrap_or_else(|| std::path::Path::new(".")).join("project-sitemap.html");
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
                            let sslug = spath.file_name().and_then(|s| s.to_str()).unwrap_or("");
                            let sid = format!("{}_{}", pid, sanitize_id(sslug));
                            links.insert(sid, format!("file://{}", spath.to_string_lossy().replace(' ', "%20")));
                        }
                    }
                }
            }
        }
    }
    let links_json = serde_json::to_string(&links).map_err(|e| e.to_string())?;
    let html = html.replace("{links}", &links_json);
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
    buf.push_str("flowchart TD\n");
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
    let html = format!(r#"<!DOCTYPE html>
<html lang=\"zh-TW\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Module Sitemap - {module}</title>
  <script type=\"module\">import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs'; mermaid.initialize({ startOnLoad: true, theme: 'default' });</script>
</head><body><h1>Module Sitemap - {module}</h1><div class=\"mermaid\">{graph}</div></body></html>"#, module=module, graph=content);
    let html_path = PathBuf::from("ai-docs").join(format!("module-{}-sitemap.html", sanitize_id(&module)));
    fs::write(&html_path, html).map_err(|e| e.to_string())?;
    Ok(html_path.to_string_lossy().to_string())
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
pub async fn list_assets(module_name: String) -> Result<AssetList, String> {
    let module_dir = PathBuf::from("design-assets").join(&module_name);
    if !module_dir.exists() {
        return Err("設計模組不存在".to_string());
    }

    let mut result = AssetList {
        screenshots: Vec::new(),
        html: Vec::new(),
        css: Vec::new(),
    };

    let mut read_dir = |sub: &str, vec: &mut Vec<String>| {
        let p = module_dir.join(sub);
        if let Ok(entries) = std::fs::read_dir(&p) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() {
                    if let Ok(abs) = std::fs::canonicalize(&path) {
                        if let Some(s) = abs.to_str() {
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
    module_name: String,
    asset_type: String,
    file_name: String,
) -> Result<String, String> {
    let module_dir = PathBuf::from("design-assets").join(&module_name);
    if !module_dir.exists() {
        return Err("設計模組不存在".to_string());
    }

    let target_dir = match asset_type.as_str() {
        "screenshots" => module_dir.join("screenshots"),
        "html" => module_dir.join("html"),
        "css" => module_dir.join("css"),
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
