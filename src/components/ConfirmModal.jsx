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
        position: "fixed", inset: 0, background: "rgba(0,0,0,.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, backdropFilter: "blur(6px)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#111914", borderRadius: 12, padding: "32px 28px",
          maxWidth: 400, width: "90%", boxShadow: "0 16px 56px rgba(0,0,0,.7)",
          border: "1px solid #1C2620",
          animation: "slideUp .2s ease forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 16 }}>
          {danger ? "⚠️" : "❓"}
        </div>
        <p style={{
          fontSize: 14.5, color: "#E8E4DC", textAlign: "center",
          lineHeight: 1.6, marginBottom: 24, fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "11px", background: "transparent",
              border: "1px solid #243028", borderRadius: 8,
              cursor: "pointer", fontSize: 13.5, fontWeight: 500,
              color: "#A8A49C", fontFamily: "'DM Sans', sans-serif",
              transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#161E18"; e.currentTarget.style.color = "#E8E4DC"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#A8A49C"; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "11px",
              background: danger ? "#E05C5C" : "#00C97A",
              color: danger ? "#fff" : "#000",
              border: "none", borderRadius: 8,
              cursor: "pointer", fontSize: 13.5, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
          >
            {danger ? "Delete" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
