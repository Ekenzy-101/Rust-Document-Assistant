import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Delete, Description } from "@mui/icons-material";
import { api, formatDate, formatFileSize, DocumentInfo } from "../services";

interface DocumentListProps {
  onDocumentDeleted?: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  onDocumentDeleted,
}) => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await api.listDocuments();
      setDocuments(docs);
    } catch (err: any) {
      setError(err || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await api.deleteDocument(documentId);
      await loadDocuments();
      if (onDocumentDeleted) {
        onDocumentDeleted();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.message || "Failed to delete document"
      );
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Documents ({documents.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {documents.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ py: 3, textAlign: "center" }}
        >
          No documents uploaded yet
        </Typography>
      ) : (
        <List>
          {documents.map((doc) => (
            <ListItem
              key={doc.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(doc.id)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              }
            >
              <Description sx={{ mr: 2, color: "text.secondary" }} />
              <ListItemText
                primary={doc.name}
                secondary={
                  <Box
                    sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}
                  >
                    <Chip label={doc.kind.toUpperCase()} size="small" />
                    <Chip label={doc.id} size="small" variant="outlined" />
                    <Chip
                      label={formatFileSize(doc.size)}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(doc.timestamp)}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};
