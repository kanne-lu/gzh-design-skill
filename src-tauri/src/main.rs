#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod update;
mod ai;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![update::latest_release, ai::optimize_article])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application")
}
