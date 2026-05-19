const FM = "'JetBrains Mono', monospace";
const FD = "'Fraunces', Georgia, serif";
const FB = "'DM Sans', system-ui, sans-serif";

export default function MockExtract() {
  const fields = [
    { l: "Vendor",   v: "Acme Corp",    c: 99 },
    { l: "Amount",   v: "$42,800",      c: 100, mono: true },
    { l: "Due Date", v: "2026-12-01",   c: 100, mono: true },
    { l: "PO Match", v: "✓ Confirmed",  c: 99,  ok: true },
    { l: "Uplift",   v: "7.5% p.a.",    c: 95,  warn: true },
  ];

  return (
    <div style={{ background: "#fff", border: "1px solid #E0DAC8", borderRadius: 8, overflow: "hidden", fontFamily: FB, fontSize: 12, boxShadow: "0 8px 48px rgba(22,20,15,.14)" }}>
      <div style={{ background: "#16140F", padding: "9px 14px", display: "flex", alignItems: "center", gap: 7 }}>
        {["#FF5F57","#FFBD2E","#27C93F"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, textAlign: "center", color: "#6B6963", fontSize: 10, fontFamily: FM }}>ExFinAnalyze — Document Extraction</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ padding: 14, background: "#F9F6F0", borderRight: "1px solid #E0DAC8" }}>
          <div style={{ fontSize: 9, color: "#8B8983", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Source PDF</div>
          <div style={{ background: "white", border: "1px solid #E0DAC8", padding: 10, borderRadius: 4 }}>
            {[["60%",10,1],["45%",7,.3],["70%",7,.2]].map(([w,h,o],i) => <div key={i} style={{ height: h, background: "#16140F", width: w, borderRadius: 2, marginBottom: 5, opacity: o }} />)}
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                <div style={{ height: 5, background: i===2 ? "#C8924A" : "#E0DAC8", width: "40%", borderRadius: 2, opacity: i===2 ? 1 : .7 }} />
                <div style={{ height: 5, background: i===2 ? "#C8924A" : "#E0DAC8", width: "28%", borderRadius: 2, opacity: i===2 ? 1 : .7 }} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ fontSize: 9, color: "#8B8983", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Extracted Fields</div>
          {fields.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 0", borderBottom: "1px solid #F0EDE3" }}>
              <div style={{ width: 50, fontSize: 9, color: "#8B8983", textTransform: "uppercase", letterSpacing: "0.07em", flexShrink: 0 }}>{f.l}</div>
              <div style={{ flex: 1, fontSize: 11, fontWeight: 500, fontFamily: f.mono ? FM : "inherit", color: f.warn ? "#9A3B2A" : f.ok ? "#2C5F42" : "#16140F" }}>{f.v}</div>
              <div style={{ fontSize: 9, fontFamily: FM, padding: "1px 4px", borderRadius: 2, background: f.c>=99 ? "#E8F0EB" : f.warn ? "#FDF6E9" : "#F5F2EA", color: f.c>=99 ? "#2C5F42" : f.warn ? "#9A3B2A" : "#5A574E" }}>{f.c}%</div>
              {f.warn && <span style={{ fontSize: 9 }}>⚠</span>}
            </div>
          ))}
          <div style={{ marginTop: 8, padding: 6, background: "#F9F6F0", borderRadius: 4, fontSize: 10, color: "#5A574E" }}><span style={{ color: "#C8924A", fontWeight: 600 }}>2 risks flagged</span> — review before approval</div>
        </div>
      </div>
    </div>
  );
}
