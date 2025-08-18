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
        if let Err(e) = generate_html_template(&module_name, &output_dir) {
            return Err(format!("生成 HTML 模板失敗: {}", e));
        }
    }
    
    // 生成 CSS 樣式
    if include_css {
        if let Err(e) = generate_css_styles(&module_name, &output_dir, include_responsive) {
            return Err(format!("生成 CSS 樣式失敗: {}", e));
        }
    }
    
    // 生成 AI 切版說明
    if let Err(e) = generate_ai_spec(&module_name, &output_dir) {
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
