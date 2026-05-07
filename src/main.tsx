// src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "./App";
import "./index.css";
import { ScrollToTop } from "./components/ScrollToTop";
import ScrollToTopButton from "./components/shared/ScrollToTopButton";
import AppErrorBoundary from "./components/AppErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <ScrollToTopButton />
        <ScrollToTop />
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
);
