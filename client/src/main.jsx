import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./styles/globals.css";

// Optional: React Router setup
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
