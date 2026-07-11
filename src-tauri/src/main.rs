#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod update;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![update::latest_release])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application")
}
