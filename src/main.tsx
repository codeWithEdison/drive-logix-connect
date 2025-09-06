import React from "react";
import { createRoot } from "react-dom/client";
import { ApiProvider } from "./lib/api/ApiProvider";
import { LanguageProvider } from "./lib/i18n/LanguageContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApiProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ApiProvider>
  </React.StrictMode>
);
