pub mod document_loader;
pub use document_loader::*;
pub mod vector_store;
pub use vector_store::*;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub app_name: String,
    pub app_version: String,
    pub log_level: String,

    // Chunk processing
    pub chunk_size: usize,
    pub chunk_overlap: usize,

    // Database
    pub database_url: String,

    // OpenAI
    pub openai_api_key: String,
    pub openai_api_url: String,
    pub openai_chat_model: String,
    pub openai_embedding_model: String,
}

impl Config {
    pub fn load() -> anyhow::Result<Self> {
        dotenv::dotenv().ok();

        Ok(Config {
            app_name: std::env::var("APP_NAME").unwrap_or_default(),
            app_version: std::env::var("APP_VERSION").unwrap_or_else(|_| "1.0.0".to_string()),
            log_level: std::env::var("LOG_LEVEL").unwrap_or_else(|_| "INFO".to_string()),
            database_url: std::env::var("DATABASE_URL").unwrap_or_default(),
            openai_api_key: std::env::var("OPENAI_API_KEY").unwrap_or_default(),
            openai_api_url: std::env::var("OPENAI_API_URL").unwrap_or_default(),
            openai_chat_model: std::env::var("OPENAI_CHAT_MODEL").unwrap_or_default(),
            openai_embedding_model: std::env::var("OPENAI_EMBEDDING_MODEL").unwrap_or_default(),
            chunk_size: std::env::var("CHUNK_SIZE")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(5000),
            chunk_overlap: std::env::var("CHUNK_OVERLAP")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(200),
        })
    }
}

lazy_static::lazy_static! {
    pub static ref CONFIG: Config = Config::load().expect("Failed to load configuration");
}
