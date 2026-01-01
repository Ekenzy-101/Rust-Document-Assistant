# 📄 Kenzy Docs

<img src="app-icon.png" alt="Kenzy Docs" />

**AI-powered desktop application for intelligent document search, analysis, and chat.**
Built with **Rust**, **PostgreSQL + pgvector**, **React**, **Material UI** **TypeScript**, and **Tauri**.

---

## 🚀 Overview

Kenzy Docs is a **cross-platform desktop application** that allows users to upload documents (PDF, DOCX, TXT) and interact with them using **natural language**.

The app converts documents into a **semantic knowledge base** and enables:

- Meaning-based search
- AI-powered Q&A
- Document summarization
- Information extraction

---

## 🎯 Problem

Professionals often deal with large volumes of unstructured documents:

- Contracts
- Reports
- Manuals
- Research papers

Traditional keyword search is inefficient and error-prone.

---

## 💡 Solution

Kenzy Docs uses:

- **Text embeddings**
- **Vector similarity search**
- **Large Language Models**

to provide accurate, contextual answers directly from user documents — all inside a secure desktop app.

---

## ✨ Features

### 📂 Document Processing

- Upload PDF, DOCX, TXT files
- Automatic text extraction
- Chunking and metadata tagging

### 🔍 Semantic Search

- Meaning-based document retrieval
- High-performance vector search with PostgreSQL + pgvector
- Source references for transparency

### 💬 AI Chat Interface

- Ask questions about documents
- Generate summaries
- Compare multiple documents
- Extract key clauses, dates, and entities

---

## 🧠 Tech Stack

| Layer             | Technology            |
| ----------------- | --------------------- |
| Desktop Framework | Tauri (v2)            |
| Frontend          | React + Material UI   |
| Backend           | Rust + Tauri IPC      |
| Vector Database   | PostgreSQL + pgvector |
| AI / NLP          | Any LLMs              |
| Embeddings        | Any Embeddings        |

---

## 🏗️ Project Structure

```text
.
├── index.html
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
├── src
│   ├── App.tsx
│   ├── components/        # UI components (Chat, DocumentList, FileUploader)
│   ├── hooks/
│   ├── main.tsx
│   ├── pages/
│   ├── services/          # IPC calls & Utility functions
│   ├── styles/            # Global styles
│   └── vite-env.d.ts
├── src-tauri/             # Tauri backend (Rust bridge)
│   ├── src
│   │   ├── commands.rs    # IPC commands
│   │   ├── core/          # Core services
│   │   ├── main.rs        # Backend entry point
│   │   └── models/        # Data models
│   └── tauri.conf.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### Key Components

1. **Tauri IPC Commands** (`src/commands.rs`)

   - `health_check` - Check database connectivity
   - `upload_document` - Upload and process documents
   - `list_documents` - List all uploaded documents
   - `delete_document` - Delete a document
   - `chat_with_documents` - Chat with AI using documents

2. **Core Modules** (`src/core/`)

   - `mod.rs` - Configuration management
   - `document_loader.rs` - PDF, DOCX, TXT parsing
   - `vector_store.rs` - Vector store using pgvector and any embeddings

3. **Models** (`src/models/`)
   - Data structures for IPC communication

---

## 🔄 Application Flow

1. User uploads documents via UI
2. Rust backend extracts and chunks text
3. Embeddings are generated
4. Vectors stored in PostgreSQL + pgvector
5. User asks a question
6. Relevant chunks retrieved
7. AI generates contextual response
8. Answer displayed with sources

---

## 🧪 Example Use Cases

- Legal contract analysis
- Research paper exploration
- Internal company documentation search
- Compliance and audit support

---

## 🛠️ Local Development

1. **Setup:**

```bash
npm install
```

2. **Environment Configuration:**

```bash
# Copy .env.example to .env and configure
cp .env.example .env
```

3. **Run the Application:**

```bash
npm run tauri dev
```

---

## 🚧 Roadmap

- [ ] Offline local LLM support
- [ ] OCR for scanned documents
- [ ] Multi-language documents
- [ ] User profiles & indexing scopes
- [ ] Export answers as reports

---

## 📌 Why This Project

This project demonstrates:

- AI system design
- Desktop app development
- Data privacy-first architecture
- Real-world business value

Ideal for **freelancers, startups, and enterprise clients**.

---

## 📄 License

MIT License

---
