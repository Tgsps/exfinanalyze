const FM = "'JetBrains Mono', monospace";
const FD = "'Fraunces', Georgia, serif";
const FB = "'DM Sans', system-ui, sans-serif";

export default function MockShadow() {
  const criteria = [
    ["Transfer of ownership", "No"],
    ["Term ≥ 75% useful life", "60%"],
    ["PV ≥ 90% fair value", "87.8%"],
  ];

  return (
    <div style={{ background: "#fff", border: "1px solid #E0DAC8", borderRadius: 8, overflow: "hidden", fontFamily: FB, fontSize: 12, boxShadow: "0 8px 48px rgba(22,20,15,.14)" }}>
      <div style={{ background: "#16140F", padding: "9px 14px", display: "flex", alignItems: "center", gap: 7 }}>
        {["#FF5F57","#FFBD2E","#27C93F"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, textAlign: "center", color: "#6B6963", fontSize: 10, fontFamily: FM }}>AI Shadow Reviewer — Lease Classification</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ padding: 14, borderRight: "1px solid #E0DAC8" }}>
          <div style={{ fontSize: 9, color: "#8B8983", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your classification</div>
          <div style={{ padding: 10, border: "2px solid #16140F", borderRadius: 4, marginBottom: 8, background: "#16140F", color: "white" }}>
            <div style={{ fontFamily: FD, fontWeight: 500, fontSize: 14 }}>Operating Lease</div>
            <div style={{ fontSize: 10, color: "#A8A6A0", marginTop: 2 }}>None of the 5 criteria met</div>
          </div>
          <div style={{ padding: 7, background: "#E8F0EB", borderRadius: 4, fontSize: 10, color: "#2C5F42", display: "flex", gap: 5, alignItems: "center" }}>✓ Correct!</div>
        </div>
        <div style={{ padding: 14, background: "#16140F" }}>
          <div style={{ fontSize: 9, color: "#8B8983", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>AI reasoning</div>
          {criteria.map(([t, v], i) => (
            <div key={i} style={{ display: "flex", gap: 7, marginBottom: 6, alignItems: "center" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#2A2820", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 7, color: "#6B6963" }}>✗</span>
              </div>
              <div style={{ flex: 1, fontSize: 10, color: "#A8A6A0" }}>{t}</div>
              <div style={{ fontSize: 9, fontFamily: FM, color: "#E8E6DF" }}>{v}</div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: 7, background: "#1F1F1D", borderLeft: "2px solid #C8924A", borderRadius: "0 4px 4px 0", fontSize: 9, color: "#A8A6A0", lineHeight: 1.5 }}>
            <span style={{ color: "#C8924A", fontWeight: 600 }}>ASC 842: </span>All 5 tests fail → Operating Lease.
          </div>
        </div>
      </div>
    </div>
  );
}
