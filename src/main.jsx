import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// Lazy-load heavy pages — only bundled when navigated to
const App         = lazy(() => import("./App"));
const LandingPage = lazy(() => import("./LandingPage"));
const AdminPanel  = lazy(() => import("./components/AdminPanel"));
const Prototype   = lazy(() => import("./Prototype"));

function PageLoader() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#F7F4ED",
    }}>
      <div style={{
        width: 24, height: 24,
        border: "2px solid #E0DAC8", borderTopColor: "#C8924A",
        borderRadius: "50%",
        animation: "spin .7s linear infinite",
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"         element={<LandingPage />} />
            <Route path="/app"      element={<App />} />
            <Route path="/admin"    element={<AdminPanel />} />
            <Route path="/prototype" element={<Prototype />} />
            {/* Fallback: redirect unknown routes to landing */}
            <Route path="*"         element={<LandingPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
