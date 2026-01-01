use anyhow::Result;
use langchain_rust::{
    embedding::openai::OpenAiEmbedder,
    llm::OpenAIConfig,
    schemas::Document,
    vectorstore::{
        pgvector::{Store, StoreBuilder},
        VecStoreOptions, VectorStore as IVectorStore,
    },
};
use sqlx::{PgPool, Pool, Postgres};
use std::{error::Error, sync::Arc};
use tokio::sync::OnceCell;

use crate::core::CONFIG;

pub struct VectorStore {
    pub pool: Pool<Postgres>,
    pub store: Store,
}

impl VectorStore {
    pub async fn add_documents(
        &self,
        docs: &[Document],
        opt: &VecStoreOptions,
    ) -> Result<Vec<String>, Box<dyn Error>> {
        self.store.add_documents(docs, opt).await
    }

    pub async fn similarity_search(
        &self,
        query: &str,
        limit: usize,
        opt: &VecStoreOptions,
    ) -> Result<Vec<Document>, Box<dyn Error>> {
        self.store.similarity_search(query, limit, opt).await
    }

    pub async fn delete(&self, ids: &[String]) -> Result<bool, Box<dyn Error>> {
        // Use ANY($1) to match multiple IDs as a parameterized array (Postgres)
        let result =
            sqlx::query("DELETE FROM langchain_pg_embedding WHERE cmetadata->>'id' = ANY($1)")
                .bind(ids)
                .execute(&self.pool)
                .await?;

        Ok(result.rows_affected() > 0)
    }
}

static POOL: OnceCell<Arc<Pool<Postgres>>> = OnceCell::const_new();

pub async fn vector_store() -> anyhow::Result<Arc<VectorStore>, String> {
    let pool = POOL
        .get_or_try_init(|| async {
            tracing::info!("Initializing vector store...");
            let pool = PgPool::connect(&CONFIG.database_url)
                .await
                .map_err(|e| format!("Failed to load vector store: {}", e))?;
            Ok::<Arc<Pool<Postgres>>, String>(Arc::new(pool))
        })
        .await?;
    let pool = Arc::try_unwrap(pool.clone()).unwrap_or_else(|arc| (*arc).clone());

    let cfg = OpenAIConfig::new().with_api_base(CONFIG.openai_api_url.clone());
    let embedder = OpenAiEmbedder::default()
        .with_config(cfg)
        .with_model(CONFIG.openai_embedding_model.clone());
    let store = StoreBuilder::new()
        .embedder(embedder)
        .pool(pool.clone())
        .build()
        .await
        .map_err(|e| format!("Failed to load vector store: {}", e))?;
    let sql = "CREATE INDEX IF NOT EXISTS langchain_pg_embedding_cmetadata_id ON langchain_pg_embedding ((cmetadata->>'id'))";
    sqlx::query(sql)
        .execute(&pool)
        .await
        .map_err(|e| format!("Failed to create index: {}", e))?;

    Ok(Arc::new(VectorStore { store, pool }))
}
