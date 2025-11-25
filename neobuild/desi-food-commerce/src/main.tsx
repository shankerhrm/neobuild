import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import "./index.css"
import ErrorBoundary from "./components/ErrorBoundary.tsx"
import { AuthProvider } from "./context/AuthContext.tsx"
import { CartProvider } from "./context/CartContext.tsx"

// Ensure the router is properly configured
const AppWithProviders = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Root element not found")
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>
)