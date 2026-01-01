// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod core;
mod models;

fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::health_check,
            commands::delete_document,
            commands::upload_document,
            commands::list_documents,
            commands::chat_with_documents,
        ])
        .setup(|_| {
            tauri::async_runtime::spawn(async move {
                if let Err(e) = core::vector_store::vector_store().await {
                    tracing::error!(e);
                } else {
                    tracing::info!("Vector store initialized successfully");
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
