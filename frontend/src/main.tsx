import "./index.css";
import React, { useMemo, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, CssBaseline } from "@mui/material";
import getTheme from "./themes";
import { BrowserRouter } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store, RootState } from "./store/store";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Root() {
  const mode = useSelector((state: RootState) => state.theme.mode);

  // Detect system preference for sync with 'system' mode
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (mode === "system") {
      root.classList.add(systemPrefersDark ? "dark" : "light");
    } else {
      root.classList.add(mode);
    }
  }, [mode, systemPrefersDark]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={mode === "light" ? "light" : "dark"}
        />
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <Root />
  </Provider>
);
