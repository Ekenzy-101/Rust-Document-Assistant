use langchain_rust::schemas::{Document, MessageType};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentInfo {
    pub id: String,
    pub name: String,
    pub kind: String,
    pub timestamp: String,
    pub size: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub content: String,
    pub role: MessageType,
    pub sources: Vec<Document>,
    pub timestamp: String,
}
