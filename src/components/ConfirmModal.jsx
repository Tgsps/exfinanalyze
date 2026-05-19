import { useEffect } from "react";

export default function ConfirmModal({ message, onConfirm, onCancel, danger = false }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(22,20,15,.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#fff", borderRadius: 8, padding: "32px 28px",
          maxWidth: 400, width: "90%", boxShadow: "0 16px 56px rgba(22,20,15,.2)",
          border: "1px solid #E0DAC8",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 16 }}>
          {danger ? "⚠️" : "❓"}
        </div>
        <p style={{
          fontSize: 15, color: "#16140F", textAlign: "center",
          lineHeight: 1.6, marginBottom: 24, fontFamily: "system-ui, sans-serif",
        }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "11px", background: "transparent",
              border: "1.5px solid #E0DAC8", borderRadius: 4,
              cursor: "pointer", fontSize: 14, fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "11px",
              background: danger ? "#9A3B2A" : "#16140F",
              color: "#fff", border: "none", borderRadius: 4,
              cursor: "pointer", fontSize: 14, fontWeight: 600,
            }}
          >
            {danger ? "Delete" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
