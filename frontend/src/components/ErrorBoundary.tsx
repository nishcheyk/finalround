import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { Error as ErrorIcon } from "@mui/icons-material";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/* This code defines an `ErrorBoundary` component in TypeScript React. The `ErrorBoundary` component is
used to catch errors that occur within its child components and display a fallback UI when an error
is caught. */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          p={2}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 500,
              width: "90vw", // responsive width
              textAlign: "center",
              borderRadius: 2,
              overflowWrap: "break-word",
            }}
          >
            <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" gutterBottom color="error" noWrap>
              Oops! Something went wrong
            </Typography>
            <Typography
              variant="body1"
              color="text.primary"
              mb={3}
              sx={{ wordBreak: "break-word" }}
            >
              We're sorry, but something unexpected happened. Please try
              refreshing the page or contact support if the problem persists.
            </Typography>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <Box
                sx={{
                  bgcolor: "grey.100",
                  p: 2,
                  borderRadius: 1,
                  mb: 3,
                  textAlign: "left",
                  maxHeight: 150,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Error Details (Development):
                </Typography>
                <Typography component="pre" sx={{ margin: 0 }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}

            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={this.handleReset}
                sx={{ minWidth: 120 }}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{ minWidth: 120 }}
              >
                Refresh Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
