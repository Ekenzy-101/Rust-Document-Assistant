import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  LinearProgress,
  Alert,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { api, DocumentInfo } from "../services";

interface FileUploaderProps {
  onUploadSuccess?: (document: DocumentInfo) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadSuccess,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const fileType = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "docx", "txt"].includes(fileType || "")) {
        setError(
          "Unsupported file type. Please upload PDF, DOCX, or TXT files."
        );
        return;
      }

      setError(null);
      setUploading(true);
      setProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        const document = await api.uploadDocument(file);
        clearInterval(progressInterval);
        setProgress(100);

        if (onUploadSuccess) {
          onUploadSuccess(document);
        }

        // Reset after success
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
          if (event.target) {
            event.target.value = "";
          }
        }, 1000);
      } catch (err: any) {
        clearInterval(progressInterval);
        setError(err || "Failed to upload document");
        setUploading(false);
        setProgress(0);
      }
    },
    [onUploadSuccess]
  );

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Document
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Supported formats: PDF, DOCX, TXT
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUpload />}
          disabled={uploading}
          fullWidth
        >
          {uploading ? "Uploading..." : "Choose File"}
          <input
            type="file"
            hidden
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </Button>

        {uploading && (
          <Box>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {progress}% - Processing document...
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};
