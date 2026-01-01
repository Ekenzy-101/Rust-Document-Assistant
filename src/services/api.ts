import { invoke } from "@tauri-apps/api/core";

export interface ChatMessage {
  content: string;
  role: "system" | "ai" | "human" | "tool";
  timestamp: string;
  sources: Document[];
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  top_k?: number;
}

export interface DocumentInfo {
  id: string;
  name: string;
  kind: string;
  timestamp: string;
  size: number;
}

export interface Document {
  page_content: string;
  score: number;
  metadata: Record<string, any>;
}

export const api = {
  async checkHealth(): Promise<{
    status: string;
    version: string;
  }> {
    return await invoke("health_check");
  },

  async chatWithDocuments(request: ChatRequest): Promise<ChatMessage> {
    return await invoke("chat_with_documents", { ...request });
  },

  async deleteDocument(id: string): Promise<void> {
    return await invoke("delete_document", { id });
  },

  async uploadDocument(file: File): Promise<DocumentInfo> {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = Array.from(new Uint8Array(arrayBuffer));
    return await invoke("upload_document", {
      name: file.name,
      content: bytes,
    });
  },

  async listDocuments(): Promise<DocumentInfo[]> {
    return await invoke("list_documents", { query: "", top_k: 100 });
  },
};

export default api;
