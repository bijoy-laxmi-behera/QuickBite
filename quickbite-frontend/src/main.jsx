import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";  // ✅ ADD THIS
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>   {/* ✅ WRAP APP */}
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);