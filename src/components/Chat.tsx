import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Send, Person, SmartToy } from "@mui/icons-material";
import { api, ChatMessage } from "../services";

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      content: input.trim(),
      role: "human",
      sources: [],
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const assistantMessage = await api.chatWithDocuments({
        message: userMessage.content,
        history: messages,
        top_k: 5,
      });

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err || "Failed to get response");
      const errorMessage: ChatMessage = {
        content: "Sorry, I encountered an error. Please try again.",
        role: "ai",

        sources: [],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6">Chat with Documents</Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {messages.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Ask questions about your uploaded documents
            </Typography>
          </Box>
        ) : (
          <List>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  flexDirection:
                    message.role === "human" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor:
                      message.role === "human"
                        ? "primary.main"
                        : "secondary.main",
                    mx: 1,
                  }}
                >
                  {message.role === "human" ? <Person /> : <SmartToy />}
                </Avatar>
                <Box sx={{ maxWidth: "70%" }}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor:
                        message.role === "human" ? "primary.light" : "grey.100",
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                      {message.content}
                    </Typography>
                    {message.sources && message.sources.length > 0 && (
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        {message.sources.map((source, idx) => (
                          <Chip
                            key={idx}
                            label={`Source ${idx + 1}`}
                            size="small"
                            variant="outlined"
                            title={source.page_content.substring(0, 100)}
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Box>
              </ListItem>
            ))}
            {loading && (
              <ListItem>
                <CircularProgress size={24} sx={{ ml: 4 }} />
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask a question about your documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};
