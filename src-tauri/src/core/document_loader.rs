use anyhow::{Context, Result};
use std::path::Path;

pub struct DocumentLoader;

impl DocumentLoader {
    pub fn load_pdf(content: &[u8]) -> Result<String> {
        pdf_extract::extract_text_from_mem(content)
            .context("Failed to extract text from PDF")
    }

    pub fn load_docx(content: &[u8]) -> Result<String> {
        let docx = docx_rs::read_docx(content)
            .context("Failed to read DOCX file")?;
        
        let mut text_parts = Vec::new();
        for child in docx.document.children {
            if let docx_rs::DocumentChild::Paragraph(paragraph) = child {
                for run_child in paragraph.children {
                    if let docx_rs::ParagraphChild::Run(run) = run_child {
                        for rc in run.children {
                            if let docx_rs::RunChild::Text(text) = rc {
                                text_parts.push(text.text);
                            }
                        }
                    }
                }
            }
        }
        
        Ok(text_parts.join("\n\n"))
    }

    pub fn load_txt(content: &[u8]) -> Result<String> {
        // Try UTF-8 first
        match std::str::from_utf8(content) {
            Ok(text) => Ok(text.to_string()),
            Err(_) => {
                // Fallback to latin-1
                let (cow, _, _) = encoding_rs::WINDOWS_1252.decode(content);
                Ok(cow.to_string())
            }
        }
    }

    pub fn load_document(content: &[u8], filename: &str) -> Result<String> {
        let path = Path::new(filename);
        let extension = path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_lowercase();

        match extension.as_str() {
            "pdf" => Self::load_pdf(content),
            "docx" => Self::load_docx(content),
            "txt" => Self::load_txt(content),
            _ => Err(anyhow::anyhow!("Unsupported file type: {}", extension)),
        }
    }

    pub fn get_file_type(filename: &str) -> String {
        Path::new(filename)
            .extension()
            .and_then(|ext| ext.to_str())
            .map(|s| s.to_lowercase())
            .unwrap_or_default()
    }
}

