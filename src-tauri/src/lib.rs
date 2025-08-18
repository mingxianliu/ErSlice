mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![
      commands::create_design_module,
      commands::get_design_modules,
      commands::get_archived_design_modules,
      commands::upload_design_asset,
      commands::generate_slice_package,
      commands::generate_all_slice_packages,
      commands::generate_selected_slice_packages,
      commands::list_assets,
      commands::delete_design_asset,
      commands::archive_design_module,
      commands::delete_design_module,
      commands::unarchive_design_module,
      commands::generate_unified_slice_package,
      commands::get_or_init_default_project,
      commands::update_default_project,
      commands::get_module_pages,
      commands::create_module_page,
      commands::delete_module_page,
      commands::rename_module_page,
      commands::get_module_tree,
      commands::create_subpage,
      commands::delete_subpage,
      commands::rename_subpage,
      commands::set_page_order,
      commands::set_subpage_order,
      commands::generate_project_mermaid,
      commands::generate_project_mermaid_html,
    ])
    .setup(|app| {
      // 設置 ErSlice 應用程式
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      // 初始化 ErSlice 核心功能
      setup_erslice(app)?;
      
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// ErSlice 核心功能設置
fn setup_erslice(_app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
  log::info!("ErSlice 前端切版說明包生成器啟動中...");
  
        // 設置應用程式資訊 (在 Tauri 2.0 中需要通過其他方式設置)
      log::info!("ErSlice 前端切版說明包生成器啟動");
  
  // 初始化設計資產目錄
  init_design_assets_directory()?;
  
  log::info!("ErSlice 初始化完成");
  Ok(())
}

// 初始化設計資產目錄
fn init_design_assets_directory() -> Result<(), Box<dyn std::error::Error>> {
  use std::fs;
  use std::path::Path;
  
  let design_assets_dir = Path::new("design-assets");
  if !design_assets_dir.exists() {
    fs::create_dir_all(design_assets_dir)?;
    log::info!("創建設計資產目錄: {:?}", design_assets_dir);
  }
  
  Ok(())
}
