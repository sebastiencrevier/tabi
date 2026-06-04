import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";

(window as Window & typeof globalThis & { __TABI_VERSION__: string }).__TABI_VERSION__ = "TS-1";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hide boot screen
const boot = document.getElementById("boot");
if (boot) boot.style.display = "none";
