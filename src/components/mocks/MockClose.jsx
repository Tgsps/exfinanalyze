const FM = "'JetBrains Mono', monospace";
const FD = "'Fraunces', Georgia, serif";
const FB = "'DM Sans', system-ui, sans-serif";

export default function MockClose() {
  const kpis = [["Tasks","47/52"],["Anomalies","3"],["Touchless","84%"],["Days Left","2.1"]];
  const rows = [
    ["4000 Revenue","$1,240k","$1,396k","+12.5%",false],
    ["6200 T&E","$18.4k","$31.2k","+69.6%",true],
    ["5100 COGS","$487k","$522k","+7.1%",false],
  ];

  return (
    <div style={{ background: "#fff", border: "1px solid #E0DAC8", borderRadius: 8, overflow: "hidden", fontFamily: FB, fontSize: 12, boxShadow: "0 8px 48px rgba(22,20,15,.14)" }}>
      <div style={{ background: "#16140F", padding: "9px 14px", display: "flex", alignItems: "center", gap: 7 }}>
        {["#FF5F57","#FFBD2E","#27C93F"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, textAlign: "center", color: "#6B6963", fontSize: 10, fontFamily: FM }}>Month-End Close — November 2026</div>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginBottom: 12 }}>
          {kpis.map(([l, v], i) => (
            <div key={i} style={{ background: "#F9F6F0", borderRadius: 4, padding: "7px 9px" }}>
              <div style={{ fontSize: 8, color: "#8B8983", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{l}</div>
              <div style={{ fontFamily: FM, fontWeight: 600, fontSize: 15, color: "#16140F" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: "#8B8983", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.1em" }}>Variance Analysis</div>
        {rows.map(([a, o, n, v, warn], i) => (
          <div key={i} style={{ display: "flex", gap: 6, padding: "4px 0", borderBottom: "1px solid #F0EDE3", alignItems: "center", background: warn ? "#FDF6E9" : "transparent" }}>
            <div style={{ flex: 1, fontSize: 11, fontWeight: 500 }}>{a}</div>
            <div style={{ fontFamily: FM, fontSize: 9, color: "#8B8983" }}>{o}</div>
            <div style={{ fontFamily: FM, fontSize: 10, fontWeight: 500 }}>{n}</div>
            <div style={{ fontFamily: FM, fontSize: 10, fontWeight: 600, color: warn ? "#9A3B2A" : "#2C5F42", width: 42, textAlign: "right" }}>{v}</div>
            {warn && <span style={{ fontSize: 9 }}>⚠</span>}
          </div>
        ))}
        <div style={{ marginTop: 10, padding: 9, background: "#F9F6F0", borderRadius: 4, borderLeft: "3px solid #C8924A" }}>
          <div style={{ fontSize: 8, color: "#C8924A", fontWeight: 600, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.1em" }}>✦ AI Narrative Draft</div>
          <div style={{ fontSize: 10, color: "#5A574E", lineHeight: 1.6, fontFamily: FD, fontStyle: "italic" }}>Revenue grew 12.5% driven by 3 late-Nov enterprise closes. T&E spike (+69.6%) is non-recurring — Q4 sales kickoff…</div>
        </div>
      </div>
    </div>
  );
}
