mod commands;
mod database;

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
      commands::apply_crud_subpages,
      commands::list_projects,
      commands::create_project,
      commands::delete_project,
      commands::switch_project,
      commands::update_page_meta,
      commands::update_subpage_meta,
      commands::generate_module_mermaid_html,
      commands::generate_module_crud_mermaid_html,
      commands::generate_page_mermaid_html,
      // 新增的數據庫命令
      commands::init_database,
      commands::get_database_stats,
      commands::backup_database,
      commands::restore_database,
      commands::get_design_modules_from_db,
      commands::get_design_modules_by_status_from_db,
      commands::create_design_module_in_db,
      commands::update_design_module_in_db,
      commands::delete_design_module_from_db,
      commands::get_templates_from_db,
      commands::create_template_in_db,
      commands::update_template_in_db,
      commands::delete_template_from_db,
      commands::get_ai_specs_from_db,
      commands::create_ai_spec_in_db,
      commands::update_ai_spec_in_db,
      commands::delete_ai_spec_from_db,
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
  
  // 初始化數據庫
  match crate::database::init_database() {
    Ok(_) => log::info!("數據庫初始化成功"),
    Err(e) => log::warn!("數據庫初始化失敗: {}", e),
  }
  
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
