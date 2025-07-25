import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext"; 
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <ThemeProvider>
    <AuthProvider>
      <NotificationProvider>
      <App />
      </NotificationProvider>
    </AuthProvider>
    </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
