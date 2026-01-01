import React, { useState } from "react";
import { Container, Grid, Box, Alert, Button } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { Chat, DocumentList, FileUploader } from "../components";
import { useBackend } from "../hooks";

export const HomePage: React.FC = () => {
  const { isRunning, error } = useBackend();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDocumentDeleted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!isRunning) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <h1>Kenzy Docs</h1>
          <p>Upload documents and ask questions</p>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => setRefreshKey((prev) => prev + 1)}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FileUploader onUploadSuccess={handleUploadSuccess} />
          <Box sx={{ mt: 3 }}>
            <DocumentList
              key={refreshKey}
              onDocumentDeleted={handleDocumentDeleted}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ height: "calc(100vh - 200px)", minHeight: 600 }}>
            <Chat />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
