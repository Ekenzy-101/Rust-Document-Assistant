use std::collections::HashMap;
use std::sync::Arc;

use crate::core::*;
use crate::models::*;
use chrono::SecondsFormat;
use langchain_rust::fmt_message;
use langchain_rust::fmt_template;
use langchain_rust::llm::OpenAIConfig;
use langchain_rust::schemas::MessageType;
use langchain_rust::schemas::Retriever as IRetriever;
// use langchain_rust::text_splitter::{SplitterOptions, TextSplitter, TokenSplitter};
use anyhow::Result;
use chrono::Utc;
use langchain_rust::vectorstore::VectorStore;
use langchain_rust::{
    add_documents,
    chain::{Chain, ConversationalRetrieverChainBuilder},
    llm::openai::OpenAI,
    memory::SimpleMemory,
    message_formatter,
    prompt::HumanMessagePromptTemplate,
    prompt_args,
    schemas::Document,
    schemas::Message,
    similarity_search, template_jinja2,
    vectorstore::Retriever,
};
use serde_json::{json, Value};
use uuid::Uuid;

#[tauri::command(rename_all = "snake_case")]
pub async fn health_check() -> Result<serde_json::Value, String> {
    vector_store().await?;
    Ok(json!({
        "status": "healthy",
        "version": "1.0.0",
    }))
}

#[tauri::command(rename_all = "snake_case")]
pub async fn upload_document(name: String, content: Vec<u8>) -> Result<DocumentInfo, String> {
    // Extract text from document
    let text = DocumentLoader::load_document(&content, &name)
        .map_err(|e| format!("Failed to load document: {}", e))?;
    let text = text.trim();
    if text.is_empty() {
        return Err("No text could be extracted from the document".to_string());
    }

    // // Split into chunks
    // let splitter = TokenSplitter::new(SplitterOptions{
    //     chunk_overlap: CONFIG.chunk_overlap,
    //     chunk_size: CONFIG.chunk_size,
    //     model_name: CONFIG.openai_model.clone(),
    //     encoding_name: CONFIG.openai_embedding_model.clone(),
    //     trim_chunks: false,
    // });
    // let chunks = splitter.split_text(&text).await
    //     .map_err(|_| format!("Failed to create chunks from file"))?;
    // if chunks.is_empty() {
    //     return Err("Failed to create chunks from file".to_string());
    // }

    let file = DocumentInfo {
        id: Uuid::new_v4().to_string(),
        timestamp: Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true),
        kind: DocumentLoader::get_file_type(&name),
        name: name.clone(),
        size: content.len() as i64,
    };
    let mut metadata: HashMap<String, Value> = HashMap::new();
    metadata.insert("id".to_string(), json!(file.id));
    metadata.insert("name".to_string(), json!(file.name));
    metadata.insert("kind".to_string(), json!(file.kind));
    metadata.insert("size".to_string(), json!(file.size));
    metadata.insert("timestamp".to_string(), json!(file.timestamp));
    let document = Document::new(text).with_metadata(metadata);

    let store = vector_store().await?;
    add_documents!(store, &vec![document])
        .await
        .map_err(|e| format!("Failed to add document: {}", e))?;

    Ok(file)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn delete_document(id: String) -> Result<bool, String> {
    let store = vector_store().await?;
    let result = store
        .delete(&vec![id])
        .await
        .map_err(|e| format!("Failed to delete document: {}", e))?;
    Ok(result)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn list_documents(query: &str, top_k: usize) -> Result<Vec<DocumentInfo>, String> {
    let store = vector_store().await?;
    let result = similarity_search!(store, query, top_k)
        .await
        .map_err(|e| format!("Failed to query documents: {}", e))?;

    let documents: Vec<DocumentInfo> = result
        .iter()
        .map(|item| DocumentInfo {
            id: item
                .metadata
                .get("id")
                .and_then(|v| v.as_str())
                .unwrap_or_default()
                .to_string(),
            timestamp: item
                .metadata
                .get("timestamp")
                .and_then(|v| v.as_str())
                .unwrap_or_default()
                .to_string(),
            kind: item
                .metadata
                .get("kind")
                .and_then(|v| v.as_str())
                .unwrap_or_default()
                .to_string(),
            name: item
                .metadata
                .get("name")
                .and_then(|v| v.as_str())
                .unwrap_or_default()
                .to_string(),
            size: item
                .metadata
                .get("size")
                .unwrap_or_default()
                .as_i64()
                .unwrap_or_default(),
        })
        .collect();
    Ok(documents)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn chat_with_documents(
    message: String,
    history: Vec<ChatMessage>,
    top_k: usize,
) -> Result<ChatMessage, String> {
    let store = vector_store().await?;
    let store: Box<dyn VectorStore> = Arc::try_unwrap(store)
        .map_err(|_| format!("Failed to get store"))?
        .store
        .into();
    let retriever = Retriever::new(store, top_k);
    let sources = retriever
        .get_relevant_documents(&message)
        .await
        .map_err(|e| format!("Failed to retrieve relevant documents: {}", e))?;

    let cfg = OpenAIConfig::new().with_api_base(CONFIG.openai_api_url.clone());
    let llm = OpenAI::default()
        .with_config(cfg)
        .with_model(CONFIG.openai_chat_model.clone());
    let prompt = message_formatter![
                    fmt_message!(Message::new_system_message("You are a helpful assistant")),
                    fmt_template!(HumanMessagePromptTemplate::new(
                    template_jinja2!("
The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its history.

Current conversation:
{{ history }}
human: {{ message }}
ai:
", "message","history"
)))];
    let chain = ConversationalRetrieverChainBuilder::new()
        .llm(llm)
        .rephrase_question(true)
        .memory(SimpleMemory::new().into())
        .retriever(retriever)
        .prompt(prompt)
        .build()
        .map_err(|e| format!("Failed to initialize chain: {}", e))?;

    let history = history
        .iter()
        .map(|msg| format!("{}: {}\n", msg.role.to_string(), msg.content))
        .collect::<String>();
    let input_variables = prompt_args! {
        "history" => history,
        "message" => message,
    };
    let content = chain
        .invoke(input_variables)
        .await
        .map_err(|e| format!("Failed to generate chat message: {}", e))?;

    Ok(ChatMessage {
        content,
        role: MessageType::AIMessage,
        sources,
        timestamp: Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true),
    })
}
