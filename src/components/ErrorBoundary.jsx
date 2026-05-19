import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ExFinAnalyze] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#F7F4ED", fontFamily: "system-ui, sans-serif",
        padding: "40px",
      }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8, color: "#16140F" }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, color: "#5A574E", marginBottom: 24, lineHeight: 1.6 }}>
            An unexpected error occurred. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px", background: "#16140F", color: "#F7F4ED",
              border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14, fontWeight: 600,
            }}
          >
            Refresh page
          </button>
        </div>
      </div>
    );
  }
}
