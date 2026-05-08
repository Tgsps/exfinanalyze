import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

/* ── Supabase helpers ── */
const sb = {
  /** Public: insert a new waitlist entry (uses anon role) */
  async insert(row) {
    const { data, error } = await supabase
      .from("waitlist")
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  /** Public: check if an email already exists */
  async emailExists(email) {
    const { data } = await supabase
      .from("waitlist")
      .select("id")
      .ilike("email", email)
      .limit(1);
    return Array.isArray(data) && data.length > 0;
  },
  /** Admin-only: fetch all entries (requires authenticated admin session) */
  async getAll() {
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("joined_at", { ascending: true });
    if (error) throw error;
    return data || [];
  },
  /** Admin-only: delete all entries (requires authenticated admin session) */
  async deleteAll() {
    const { error } = await supabase
      .from("waitlist")
      .delete()
      .gte("id", 0);
    if (error) throw error;
  },
  /** Public: get waitlist count via secure RPC (no PII exposed) */
  async getCount() {
    const { data, error } = await supabase.rpc("get_waitlist_count");
    if (error) throw error;
    return data || 0;
  },
};

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,600&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  :root{
    --cream:#F7F4ED;--ink:#16140F;--ink-60:#5A574E;--ink-30:#B0ADA5;
    --gold:#C8924A;--gold-l:#E8C88A;--gold-p:#F5ECD8;
    --white:#FFFFFF;--warn:#9A3B2A;--green:#2C5F42;--border:#E0DAC8;
    --s:0 2px 24px rgba(22,20,15,.08);--sl:0 8px 48px rgba(22,20,15,.14);
    --fd:'Fraunces',Georgia,serif;--fb:'DM Sans',system-ui,sans-serif;--fm:'JetBrains Mono',monospace;
  }
  .wrap{max-width:1160px;margin:0 auto;padding:0 32px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:var(--cream)}
  ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
`;

function useCountUp(t, dur = 1800, go = false) { const [v, sv] = useState(0); useEffect(() => { if (!go) return; let r, t0; const s = ts => { if (!t0) t0 = ts; const p = Math.min((ts - t0) / dur, 1); sv(Math.floor(p * t)); if (p < 1) r = requestAnimationFrame(s) }; r = requestAnimationFrame(s); return () => cancelAnimationFrame(r) }, [go, t, dur]); return v }
function useVis(th = 0.2) { const ref = useRef(null); const [v, sv] = useState(false); useEffect(() => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sv(true); o.disconnect() } }, { threshold: th }); if (ref.current) o.observe(ref.current); return () => o.disconnect() }, [th]); return [ref, v] }

/* ── MOCKS ── */
function MockExtract() {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", fontFamily: "var(--fb)", fontSize: 12, boxShadow: "var(--sl)" }}>
      <div style={{ background: "#16140F", padding: "9px 14px", display: "flex", alignItems: "center", gap: 7 }}>
        {["#FF5F57", "#FFBD2E", "#27C93F"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, textAlign: "center", color: "#6B6963", fontSize: 10, fontFamily: "var(--fm)" }}>ExFinAnalyze — Document Extraction</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ padding: 14, background: "#F9F6F0", borderRight: "1px solid var(--border)" }}>
          <div style={{ fontSize: 9, color: "#8B8983", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Source PDF</div>
          <div style={{ background: "white", border: "1px solid var(--border)", padding: 10, borderRadius: 4 }}>
            {[["60%", 10, 1], ["45%", 7, .3], ["70%", 7, .2]].map(([w, h, o], i) => <div key={i} style={{ height: h, background: "#16140F", width: w, borderRadius: 2, marginBottom: 5, opacity: o }} />)}
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                <div style={{ height: 5, background: i === 2 ? "#C8924A" : "#E0DAC8", width: "40%", borderRadius: 2, opacity: i === 2 ? 1 : .7 }} />
                <div style={{ height: 5, background: i === 2 ? "#C8924A" : "#E0DAC8", width: "28%", borderRadius: 2, opacity: i === 2 ? 1 : .7 }} />
              </div>
            ))}
            <div style={{ marginTop: 8, padding: 6, background: "#FFF8EE", border: "1px solid #E8C88A", borderRadius: 3 }}>
              <div style={{ height: 4, background: "#C8924A", width: "80%", borderRadius: 2, marginBottom: 3 }} /><div style={{ height: 4, background: "#E0DAC8", width: "60%", borderRadius: 2 }} />
            </div>
          </div>
        </div>
        <div style={{ padding: 14 }}>
          <div style={{ fontSize: 9, color: "#8B8983", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Extracted Fields</div>
          {[{ l: "Vendor", v: "Acme Corp", c: 99 }, { l: "Amount", v: "$42,800", c: 100, m: true }, { l: "Due Date", v: "2026-12-01", c: 100, m: true }, { l: "PO Match", v: "✓ Confirmed", c: 99, ok: true }, { l: "Uplift", v: "7.5% p.a.", c: 95, w: true }].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 0", borderBottom: "1px solid #F0EDE3" }}>
              <div style={{ width: 50, fontSize: 9, color: "#8B8983", textTransform: "uppercase", letterSpacing: "0.07em", flexShrink: 0 }}>{f.l}</div>
              <div style={{ flex: 1, fontSize: 11, fontWeight: 500, fontFamily: f.m ? "var(--fm)" : "inherit", color: f.w ? "#9A3B2A" : f.ok ? "#2C5F42" : "#16140F" }}>{f.v}</div>
              <div style={{ fontSize: 9, fontFamily: "var(--fm)", padding: "1px 4px", borderRadius: 2, background: f.c >= 99 ? "#E8F0EB" : f.w ? "#FDF6E9" : "#F5F2EA", color: f.c >= 99 ? "#2C5F42" : f.w ? "#9A3B2A" : "#5A574E" }}>{f.c}%</div>
              {f.w && <span style={{ fontSize: 9 }}>⚠</span>}
            </div>
          ))}
          <div style={{ marginTop: 8, padding: 6, background: "#F9F6F0", borderRadius: 4, fontSize: 10, color: "#5A574E" }}><span style={{ color: "#C8924A", fontWeight: 600 }}>2 risks flagged</span> — review before approval</div>
        </div>
      </div>
    </div>
  );
}

function MockShadow() {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", fontFamily: "var(--fb)", fontSize: 12, boxShadow: "var(--sl)" }}>
      <div style={{ background: "#16140F", padding: "9px 14px", display: "flex", alignItems: "center", gap: 7 }}>
        {["#FF5F57", "#FFBD2E", "#27C93F"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, textAlign: "center", color: "#6B6963", fontSize: 10, fontFamily: "var(--fm)" }}>AI Shadow Reviewer — Lease Classification</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ padding: 14, borderRight: "1px solid var(--border)" }}>
          <div style={{ fontSize: 9, color: "#8B8983", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your classification</div>
          <div style={{ padding: 10, border: "2px solid #16140F", borderRadius: 4, marginBottom: 8, background: "#16140F", color: "white" }}>
            <div style={{ fontFamily: "var(--fd)", fontWeight: 500, fontSize: 14 }}>Operating Lease</div>
            <div style={{ fontSize: 10, color: "#A8A6A0", marginTop: 2 }}>None of the 5 criteria met</div>
          </div>
          <div style={{ padding: 7, background: "#E8F0EB", borderRadius: 4, fontSize: 10, color: "#2C5F42", display: "flex", gap: 5, alignItems: "center" }}>✓ Correct!</div>
        </div>
        <div style={{ padding: 14, background: "#16140F" }}>
          <div style={{ fontSize: 9, color: "#8B8983", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>AI reasoning</div>
          {[["Transfer of ownership", "No"], ["Term ≥ 75% useful life", "60%"], ["PV ≥ 90% fair value", "87.8%"]].map(([t, v], i) => (
            <div key={i} style={{ display: "flex", gap: 7, marginBottom: 6, alignItems: "center" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#2A2820", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 7, color: "#6B6963" }}>✗</span></div>
              <div style={{ flex: 1, fontSize: 10, color: "#A8A6A0" }}>{t}</div>
              <div style={{ fontSize: 9, fontFamily: "var(--fm)", color: "#E8E6DF" }}>{v}</div>
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

function MockClose() {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", fontFamily: "var(--fb)", fontSize: 12, boxShadow: "var(--sl)" }}>
      <div style={{ background: "#16140F", padding: "9px 14px", display: "flex", alignItems: "center", gap: 7 }}>
        {["#FF5F57", "#FFBD2E", "#27C93F"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, textAlign: "center", color: "#6B6963", fontSize: 10, fontFamily: "var(--fm)" }}>Month-End Close — November 2026</div>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginBottom: 12 }}>
          {[["Tasks", "47/52"], ["Anomalies", "3"], ["Touchless", "84%"], ["Days Left", "2.1"]].map(([l, v], i) => (
            <div key={i} style={{ background: "#F9F6F0", borderRadius: 4, padding: "7px 9px" }}>
              <div style={{ fontSize: 8, color: "#8B8983", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{l}</div>
              <div style={{ fontFamily: "var(--fm)", fontWeight: 600, fontSize: 15, color: "#16140F" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9, color: "#8B8983", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.1em" }}>Variance Analysis</div>
        {[["4000 Revenue", "$1,240k", "$1,396k", "+12.5%", false], ["6200 T&E", "$18.4k", "$31.2k", "+69.6%", true], ["5100 COGS", "$487k", "$522k", "+7.1%", false]].map(([a, o, n, v, w], i) => (
          <div key={i} style={{ display: "flex", gap: 6, padding: "4px 0", borderBottom: "1px solid #F0EDE3", alignItems: "center", background: w ? "#FDF6E9" : "transparent" }}>
            <div style={{ flex: 1, fontSize: 11, fontWeight: 500 }}>{a}</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: 9, color: "#8B8983" }}>{o}</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: 10, fontWeight: 500 }}>{n}</div>
            <div style={{ fontFamily: "var(--fm)", fontSize: 10, fontWeight: 600, color: w ? "#9A3B2A" : "#2C5F42", width: 42, textAlign: "right" }}>{v}</div>
            {w && <span style={{ fontSize: 9 }}>⚠</span>}
          </div>
        ))}
        <div style={{ marginTop: 10, padding: 9, background: "#F9F6F0", borderRadius: 4, borderLeft: "3px solid #C8924A" }}>
          <div style={{ fontSize: 8, color: "#C8924A", fontWeight: 600, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.1em" }}>✦ AI Narrative Draft</div>
          <div style={{ fontSize: 10, color: "#5A574E", lineHeight: 1.6, fontFamily: "var(--fd)", fontStyle: "italic" }}>Revenue grew 12.5% driven by 3 late-Nov enterprise closes. T&E spike (+69.6%) is non-recurring — Q4 sales kickoff…</div>
        </div>
      </div>
    </div>
  );
}

/* ── WAITLIST FORM ── */
function WaitlistForm({ onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", role: "", company: "", size: "" });
  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");
  const submitCount = useRef(0);
  const lastSubmit = useRef(0);
  const ROLES = ["Junior Accountant", "Senior Accountant", "Financial Analyst", "Audit Team Member", "Finance Manager / Controller", "CFO / VP Finance", "Other"];
  const SIZES = ["Solo / Freelance", "2–10 employees", "11–50 employees", "51–200 employees", "200+ employees"];

  // Rate limiting — max 3 attempts per session
  const validName = form.name.trim().length >= 2 && /^[a-zA-Z\s\-'.]+$/.test(form.name.trim());
  const valid = validName && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.role && form.size;
  const fs = { width: "100%", padding: "13px 16px", border: "1.5px solid var(--border)", borderRadius: 4, fontFamily: "var(--fb)", fontSize: 14, background: "var(--white)", color: "var(--ink)", outline: "none", transition: "border-color .2s" };
  const inp = (f, ph, type = "text") => <input type={type} placeholder={ph} value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} style={fs} onFocus={e => e.target.style.borderColor = "#C8924A"} onBlur={e => e.target.style.borderColor = "var(--border)"} />;
  const sel = (f, ph, opts) => <select value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} style={{ ...fs, appearance: "none", cursor: "pointer", color: form[f] ? "var(--ink)" : "#B0ADA5" }} onFocus={e => e.target.style.borderColor = "#C8924A"} onBlur={e => e.target.style.borderColor = "var(--border)"}><option value="" disabled>{ph}</option>{opts.map(o => <option key={o} value={o}>{o}</option>)}</select>;

  const submit = async () => {
    if (!valid) {
      if (!validName && form.name.trim()) setErr("Please enter a valid name (letters only).");
      else setErr("Please fill in all required fields.");
      return;
    }
    // Rate limiting: max 3 submissions per 60s
    const now = Date.now();
    if (now - lastSubmit.current < 60000) submitCount.current++;
    else submitCount.current = 1;
    lastSubmit.current = now;
    if (submitCount.current > 3) { setErr("Too many attempts. Please wait a minute and try again."); return; }

    setErr(""); setStatus("loading");
    try {
      const exists = await sb.emailExists(form.email);
      if (exists) { setErr("You're already on the list! We'll be in touch soon 🎉"); setStatus("idle"); return; }
      const entry = await sb.insert({ name: form.name.trim(), email: form.email.trim().toLowerCase(), role: form.role, company: form.company.trim() || null, size: form.size });
      setStatus("success"); onSuccess && onSuccess(entry);
    } catch (e) { console.error(e); setErr("Something went wrong — please try again."); setStatus("idle"); }
  };

  if (status === "success") return (
    <div style={{ textAlign: "center", padding: "48px 24px", animation: "slideUp .5s ease forwards" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gold-p)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>🎉</div>
      <div style={{ fontFamily: "var(--fd)", fontSize: 26, fontWeight: 500, marginBottom: 8, color: "var(--ink)" }}>You're on the list!</div>
      <div style={{ fontSize: 14, color: "var(--ink-60)", lineHeight: 1.6, maxWidth: 360, margin: "0 auto" }}>We'll reach out to <strong style={{ color: "var(--ink)" }}>{form.email}</strong> with early access, exclusive pricing, and launch updates.</div>
      <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", background: "var(--gold-p)", borderRadius: 20, fontSize: 13, color: "var(--gold)", fontWeight: 600, border: "1px solid var(--gold-l)" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#27C93F", display: "inline-block" }} />Confirmed
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{inp("name", "Full name *")}{inp("email", "Work email *", "email")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{sel("role", "Your role *", ROLES)}{sel("size", "Company size *", SIZES)}</div>
      {inp("company", "Company name (optional)")}
      {err && <div style={{ fontSize: 13, color: "var(--warn)", padding: "10px 14px", background: "#FEF2EF", borderRadius: 4, border: "1px solid #F5C5BC", animation: "slideUp .3s ease" }}>{err}</div>}
      <button onClick={submit} disabled={status === "loading"} style={{ padding: "15px 24px", background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 4, fontFamily: "var(--fb)", fontWeight: 600, fontSize: 15, cursor: status === "loading" ? "not-allowed" : "pointer", opacity: status === "loading" ? .75 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "background .2s" }}
        onMouseEnter={e => { if (status !== "loading") e.target.style.background = "#C8924A" }}
        onMouseLeave={e => { if (status !== "loading") e.target.style.background = "var(--ink)" }}>
        {status === "loading" ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin .7s linear infinite" }} />Securing your spot…</> : "→  Join the Early Access Waitlist"}
      </button>
      <div style={{ fontSize: 12, color: "var(--ink-30)", textAlign: "center" }}>No spam. Early members get 40% off at launch — forever.</div>
    </div>
  );
}

/* ── ADMIN PANEL (Supabase Auth) ── */
function AdminPanel() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  /* Auth login form state */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  /* Listen for auth state changes */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        const role = s.user?.app_metadata?.role;
        setIsAdmin(role === "admin");
      }
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        const role = s.user?.app_metadata?.role;
        setIsAdmin(role === "admin");
      } else {
        setIsAdmin(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  /* Load data once authenticated as admin */
  useEffect(() => {
    if (session && isAdmin) {
      setLoading(true);
      sb.getAll()
        .then(l => { setList(Array.isArray(l) ? l : []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [session, isAdmin]);

  /* Sign in handler */
  const handleLogin = async (e) => {
    e?.preventDefault();
    if (signingIn) return;
    setSigningIn(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    } catch (err) {
      setAuthError("An unexpected error occurred.");
    } finally {
      setSigningIn(false);
    }
  };

  /* Sign out handler */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
    setList([]);
  };

  /* Waiting for auth check */
  if (!authChecked) return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "var(--fb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{FONTS}</style>
      <div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );

  /* Not authenticated — show Supabase Auth login form */
  if (!session) return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "var(--fb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{FONTS}</style>
      <div style={{ background: "white", border: "1.5px solid var(--border)", borderRadius: 8, padding: 48, width: 380, boxShadow: "var(--sl)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>
            <span style={{ fontFamily: "var(--fd)", fontWeight: 700, color: "var(--gold)", fontSize: 16 }}>E</span>
          </div>
          <span style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 17, color: "var(--ink)" }}>ExFinAnalyze</span>
        </div>
        <div style={{ fontFamily: "var(--fd)", fontSize: 24, fontWeight: 500, marginBottom: 6, color: "var(--ink)" }}>Admin Access</div>
        <div style={{ fontSize: 13, color: "var(--ink-60)", marginBottom: 24 }}>Sign in with your admin credentials.</div>
        <form onSubmit={handleLogin}>
          <input
            type="email" placeholder="Email" value={email} autoComplete="email"
            onChange={e => { setEmail(e.target.value); setAuthError(""); }}
            style={{ width: "100%", padding: "13px 16px", border: `1.5px solid ${authError ? "var(--warn)" : "var(--border)"}`, borderRadius: 4, fontFamily: "var(--fb)", fontSize: 14, outline: "none", marginBottom: 10 }}
          />
          <input
            type="password" placeholder="Password" value={password} autoComplete="current-password"
            onChange={e => { setPassword(e.target.value); setAuthError(""); }}
            style={{ width: "100%", padding: "13px 16px", border: `1.5px solid ${authError ? "var(--warn)" : "var(--border)"}`, borderRadius: 4, fontFamily: "var(--fb)", fontSize: 14, outline: "none", marginBottom: 8 }}
          />
          {authError && <div style={{ fontSize: 12, color: "var(--warn)", marginBottom: 8 }}>❌ {authError}</div>}
          <button type="submit" disabled={signingIn} style={{ width: "100%", padding: "13px", background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 4, fontFamily: "var(--fb)", fontWeight: 600, fontSize: 14, cursor: signingIn ? "wait" : "pointer", opacity: signingIn ? 0.7 : 1 }}>
            {signingIn ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div style={{ fontSize: 11, color: "var(--ink-30)", textAlign: "center", marginTop: 16 }}>Secured by Supabase Auth</div>
      </div>
    </div>
  );

  /* Authenticated but NOT admin role */
  if (!isAdmin) return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "var(--fb)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{FONTS}</style>
      <div style={{ background: "white", border: "1.5px solid var(--border)", borderRadius: 8, padding: 48, width: 380, boxShadow: "var(--sl)", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🚫</div>
        <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 500, marginBottom: 8, color: "var(--ink)" }}>Access Denied</div>
        <div style={{ fontSize: 13, color: "var(--ink-60)", marginBottom: 24 }}>
          Signed in as <strong>{session.user.email}</strong>, but this account does not have admin privileges.
        </div>
        <button onClick={handleLogout} style={{ padding: "10px 24px", background: "transparent", color: "var(--warn)", border: "1.5px solid var(--warn)", borderRadius: 4, cursor: "pointer", fontSize: 13, fontFamily: "var(--fb)" }}>
          Sign Out
        </button>
      </div>
    </div>
  );

  /* ── Authenticated Admin Dashboard ── */
  const exportCsv = () => {
    const sanitize = (val) => {
      const s = String(val || "");
      if (/^[=+\-@\t\r]/.test(s)) return "'" + s;
      return s;
    };
    const rows = ["Position,Name,Email,Role,Size,Company,Joined", ...list.map(r => `${r.position},"${sanitize(r.name)}","${sanitize(r.email)}","${sanitize(r.role)}","${sanitize(r.size)}","${sanitize(r.company || "")}","${new Date(r.joined_at).toLocaleString()}"`)];
    const b = new Blob([rows.join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "exfinanalyze-waitlist.csv"; a.click();
  };
  const clearAll = async () => { if (!confirm(`Delete all ${list.length} entries? This cannot be undone.`)) return; await sb.deleteAll(); setList([]); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "var(--fb)", padding: 40 }}>
      <style>{FONTS}</style>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>
                <span style={{ fontFamily: "var(--fd)", fontWeight: 700, color: "var(--gold)", fontSize: 14 }}>E</span>
              </div>
              <span style={{ fontFamily: "var(--fd)", fontSize: 17, fontWeight: 500, color: "var(--ink)" }}>ExFinAnalyze</span>
            </div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 28, fontWeight: 500, color: "var(--ink)" }}>Waitlist Admin</div>
            <div style={{ color: "var(--ink-60)", fontSize: 14, marginTop: 4, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#27C93F", display: "inline-block" }} />
                <span style={{ fontFamily: "var(--fm)", fontSize: 11 }}>{session.user.email}</span>
              </span>
              · <span style={{ fontFamily: "var(--fm)", fontWeight: 600, color: "var(--gold)", fontSize: 16 }}>{list.length}</span> signups
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={exportCsv} style={{ padding: "10px 20px", background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontFamily: "var(--fb)", fontWeight: 600 }}>↓ Export CSV</button>
            <button onClick={clearAll} style={{ padding: "10px 20px", background: "transparent", color: "var(--warn)", border: "1.5px solid var(--warn)", borderRadius: 4, cursor: "pointer", fontSize: 13, fontFamily: "var(--fb)" }}>Clear All</button>
            <button onClick={handleLogout} style={{ padding: "10px 20px", background: "transparent", color: "var(--ink-60)", border: "1.5px solid var(--border)", borderRadius: 4, cursor: "pointer", fontSize: 13, fontFamily: "var(--fb)" }}>Sign Out</button>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "var(--ink-60)" }}>
            <div style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 12px" }} />Loading waitlist…
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "var(--ink-60)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>No signups yet. Share the landing page to start collecting leads.
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--s)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F9F6F0" }}>
                  {["#", "Name", "Email", "Role", "Size", "Company", "Joined"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-60)", borderBottom: "1px solid var(--border)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F0EDE3", transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = "#FAFAF7"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "10px 14px", color: "var(--ink-30)", fontFamily: "var(--fm)", fontSize: 11 }}>#{r.position}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 500, color: "var(--ink)" }}>{r.name}</td>
                    <td style={{ padding: "10px 14px", color: "var(--gold)", fontFamily: "var(--fm)", fontSize: 12 }}>{r.email}</td>
                    <td style={{ padding: "10px 14px", color: "var(--ink-60)" }}>{r.role}</td>
                    <td style={{ padding: "10px 14px", color: "var(--ink-60)" }}>{r.size}</td>
                    <td style={{ padding: "10px 14px", color: "var(--ink-60)" }}>{r.company || "—"}</td>
                    <td style={{ padding: "10px 14px", color: "var(--ink-30)", fontFamily: "var(--fm)", fontSize: 11 }}>{new Date(r.joined_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MAIN ── */
export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [count, setCount] = useState(null);
  const wlRef = useRef(null);
  const [sRef, sVis] = useVis(0.3);
  const c70 = useCountUp(70, 1600, sVis), c98 = useCountUp(98, 1800, sVis), c40 = useCountUp(40, 1400, sVis);

  useEffect(() => {
    if (window.location.hash === "#admin") { setIsAdmin(true); return; }
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    sb.getCount().then(setCount).catch(() => { });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (isAdmin) return <AdminPanel />;
  const scrollTo = () => wlRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  const PB = { padding: "14px 32px", background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 4, fontFamily: "var(--fb)", fontWeight: 600, fontSize: 15, cursor: "pointer", letterSpacing: "-0.02em", transition: "background .2s" };

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", overflowX: "hidden", fontFamily: "var(--fb)" }}>
      <style>{FONTS}</style>

      {/* TICKER */}
      <div style={{ background: "var(--ink)", padding: "7px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "ticker 30s linear infinite", width: "200%", willChange: "transform" }}>
          {[0, 1].map(x => (
            <div key={x} style={{ display: "flex", whiteSpace: "nowrap", flex: "0 0 50%" }}>
              {["Extract PDFs in seconds", "Flag contract risks automatically", "Generate MD&A narratives", "Train junior staff in real-time", "Detect anomalies before close", "Zero manual data entry", "Source-backed every claim"].map((t, i) => (
                <span key={i} style={{ padding: "0 28px", color: "#C8C5BE", fontSize: 11, fontFamily: "var(--fm)", letterSpacing: "0.04em" }}>
                  <span style={{ color: "var(--gold)", marginRight: 14 }}>✦</span>{t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, transition: "all .3s", background: scrolled ? "rgba(247,244,237,.95)" : "transparent", backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: scrolled ? "1px solid var(--border)" : "none", padding: "0 40px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>
              <span style={{ fontFamily: "var(--fd)", fontWeight: 700, color: "var(--gold)", fontSize: 16 }}>E</span>
            </div>
            <span style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 17, letterSpacing: "-0.02em", color: "var(--ink)" }}>ExFinAnalyze</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32, fontSize: 14, color: "var(--ink-60)" }}>
            {[["Features", "#features"], ["How it works", "#how"], ["Pricing", "#pricing"]].map(([l, h]) => (
              <a key={l} href={h} style={{ textDecoration: "none", color: "inherit", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = "var(--ink)"} onMouseLeave={e => e.target.style.color = "var(--ink-60)"}>{l}</a>
            ))}
            <button onClick={scrollTo} style={{ padding: "8px 20px", background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 4, fontFamily: "var(--fb)", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "background .2s" }}
              onMouseEnter={e => e.target.style.background = "var(--gold)"} onMouseLeave={e => e.target.style.background = "var(--ink)"}>
              Join Waitlist
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "80px 40px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .03, backgroundImage: "radial-gradient(circle at 1px 1px,var(--ink) 1px,transparent 0)", backgroundSize: "32px 32px" }} />
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 640, height: 640, borderRadius: "50%", background: "var(--gold)", opacity: .05, filter: "blur(80px)" }} />
        <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", minHeight: 540 }}>
            <div style={{ animation: "fadeUp .8s ease forwards" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", background: "var(--gold-p)", borderRadius: 20, marginBottom: 28, border: "1px solid var(--gold-l)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", animation: "pulse 1.6s ease infinite" }} />
                <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Early Access Open</span>
              </div>
              <h1 style={{ fontFamily: "var(--fd)", fontSize: 54, fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.03em", color: "var(--ink)", marginBottom: 20 }}>
                From document<br />to decision,<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>in minutes.</em>
              </h1>
              <p style={{ fontSize: 16, color: "var(--ink-60)", lineHeight: 1.7, maxWidth: 420, marginBottom: 36 }}>
                ExFinAnalyze extracts, analyzes and validates financial documents with AI — then coaches your junior team through every decision. Built for accountants, not engineers.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={scrollTo} style={PB} onMouseEnter={e => { e.target.style.background = "var(--gold)"; e.target.style.transform = "translateY(-2px)" }} onMouseLeave={e => { e.target.style.background = "var(--ink)"; e.target.style.transform = "translateY(0)" }}>→ Join the waitlist</button>
                <a href="#features" style={{ padding: "14px 28px", background: "transparent", color: "var(--ink)", border: "1.5px solid var(--border)", borderRadius: 4, fontFamily: "var(--fb)", fontWeight: 500, fontSize: 15, textDecoration: "none", display: "inline-flex", alignItems: "center", transition: "border-color .2s" }} onMouseEnter={e => e.target.style.borderColor = "var(--ink)"} onMouseLeave={e => e.target.style.borderColor = "var(--border)"}>See how it works</a>
              </div>
              <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex" }}>
                  {["SC", "MK", "JP", "LR"].map((ini, x) => (
                    <div key={x} style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid var(--cream)", background: ["#C8924A", "#2C5F42", "#3B4F8C", "#7A3D6B"][x], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", marginLeft: x ? -8 : 0 }}>{ini}</div>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-60)" }}>
                  <strong style={{ color: "var(--ink)" }}>{count !== null ? `${count} finance pro${count !== 1 ? "s" : ""}` : "Finance pros"}</strong> already waiting
                </div>
              </div>
            </div>
            <div style={{ animation: "fadeUp .8s .2s ease both", position: "relative" }}>
              <div style={{ position: "absolute", top: -16, right: -16, bottom: -16, left: 16, background: "var(--gold)", opacity: .1, borderRadius: 12, transform: "rotate(2deg)" }} />
              <div style={{ position: "relative", animation: "float 7s ease-in-out 1s infinite" }}><MockExtract /></div>
            </div>
          </div>
        </div>
        <div style={{ height: 80, background: "linear-gradient(to bottom,transparent,var(--cream))", marginTop: -80, position: "relative", zIndex: 2 }} />
      </section>

      {/* STATS */}
      <section ref={sRef} style={{ padding: "48px 40px", background: "var(--ink)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
          {[[`${c70}%`, "of finance team time spent on data collection", "Reclaimed for strategy with ExFinAnalyze"], [`${c98}%`, "average extraction accuracy across document types", "With full source citations per field"], [`${c40}%`, "faster month-end close reported by AI-native teams", "From 5-day cycle to under 3"]].map(([n, l, s], i) => (
            <div key={i} style={{ padding: "40px 44px", borderRight: i < 2 ? "1px solid #2A2820" : "none" }}>
              <div style={{ fontFamily: "var(--fd)", fontWeight: 500, fontSize: 52, color: "var(--gold)", letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 10 }}>{n}</div>
              <div style={{ fontSize: 14, color: "#E8E6DF", lineHeight: 1.5, marginBottom: 5 }}>{l}</div>
              <div style={{ fontSize: 12, color: "#6B6963", lineHeight: 1.4 }}>{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section id="how" style={{ padding: "96px 40px", background: "var(--white)" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 60px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold)", fontWeight: 600, marginBottom: 12 }}>The Problem</div>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: 40, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--ink)" }}>Finance teams are buried<br /><em style={{ fontStyle: "italic" }}>in documents, not decisions.</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {[["⏱", "70% of time wasted", "Analysts spend most of their day collecting and formatting data — not analyzing it. Manual review of PDFs and spreadsheets is the norm."], ["📚", "Junior staff left to guess", "Complex accounting standards like ASC 842 and ASC 606 are learned through mistakes. Managers don't have time to train everyone individually."], ["🗓", "Month-end chaos, every time", "Reconciling transactions, writing variance narratives, and chasing missing documents creates a crunch cycle that repeats every 30 days."]].map(([ic, t, b], i) => (
              <div key={i} style={{ padding: 32, border: "1.5px solid var(--border)", borderRadius: 6, transition: "transform .25s,box-shadow .25s", cursor: "default" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--sl)" }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{ic}</div>
                <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 500, marginBottom: 10, color: "var(--ink)" }}>{t}</div>
                <div style={{ fontSize: 14, color: "var(--ink-60)", lineHeight: 1.65 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "96px 40px" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", maxWidth: 540, margin: "0 auto 72px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold)", fontWeight: 600, marginBottom: 12 }}>Core Features</div>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: 40, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--ink)" }}>Three tools.<br /><em style={{ fontStyle: "italic" }}>One workflow.</em></h2>
          </div>
          {[
            { tag: "01 — Extraction", tc: "var(--gold-p)", tt: "var(--gold)", title: "Template-free document intelligence", body: "Drop any PDF, contract, or Excel file. ExFinAnalyze reads it without templates — extracting every field with a confidence score and a citation to the exact page and clause it came from.", bullets: ["Source-backed citations for every extracted field", "Risk flags for pricing uplifts, liability gaps, and anomalies", "Cross-reference POs, invoices, and bank statements automatically"], bc: "var(--gold)", M: MockExtract, flip: false },
            { tag: "02 — Learning", tc: "#E8F0EB", tt: "var(--green)", title: "AI Shadow Reviewer — learn on real work", body: "Unlike any tool on the market, ExFinAnalyze works alongside junior employees — showing what the AI would have decided, and why. Every accounting standard decision explained in plain English.", bullets: ["Parallel AI review with step-by-step reasoning", "Instant ASC 842 / ASC 606 explanations on every decision", "Flags when it disagrees — and teaches why"], bc: "var(--green)", M: MockShadow, flip: true },
            { tag: "03 — Close", tc: "#EEF0F8", tt: "#3B4F8C", title: "Month-end close, without the crunch", body: "Real-time variance analysis, 100% transaction anomaly detection, and AI-generated MD&A narratives — all in one dashboard. Close faster with less stress, every single month.", bullets: ["Scans every transaction, not just a sample", "AI writes the management commentary first draft", "Anomaly alerts before they become audit issues"], bc: "#3B4F8C", M: MockClose, flip: false },
          ].map(({ tag, tc, tt, title, body, bullets, bc, M, flip }, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center", marginBottom: i < 2 ? 100 : 0 }}>
              <div style={{ order: flip ? 2 : 1 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", background: tc, borderRadius: 20, marginBottom: 20, fontSize: 12, color: tt, fontWeight: 600 }}>{tag}</div>
                <h3 style={{ fontFamily: "var(--fd)", fontSize: 30, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.15, color: "var(--ink)", marginBottom: 16 }}>{title}</h3>
                <p style={{ fontSize: 15, color: "var(--ink-60)", lineHeight: 1.7, marginBottom: 24 }}>{body}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {bullets.map((b, j) => (
                    <div key={j} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: tc, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 9, color: bc, fontWeight: 700 }}>✓</span>
                      </div>
                      <span style={{ fontSize: 14, color: "var(--ink-60)", lineHeight: 1.5 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ order: flip ? 1 : 2, animation: `float ${6 + i}s ease-in-out ${i * 0.4}s infinite` }}><M /></div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "80px 40px", background: "var(--ink)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold)", fontWeight: 600, marginBottom: 12 }}>Early Testers</div>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", color: "#E8E6DF" }}>What reviewers are saying</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[["The Shadow Reviewer is unlike anything I've seen. My junior team is finally learning on the job instead of making the same mistakes twice.", "Marcus K.", "Controller, SaaS startup (Series B)", "MK", "#2C5F42"], ["Month-end used to take our team 6 days. The narrative generator alone saves us 4-5 hours every close cycle.", "Sarah L.", "Senior Accountant, Regional CPA Firm", "SL", "#9A3B2A"], ["We reviewed the lease extraction against our manual workpapers. 97% match on 80+ fields. The source citations made it immediately auditable.", "James P.", "Audit Manager, Mid-size Practice", "JP", "#3B4F8C"]].map(([q, n, r, ini, bg], i) => (
              <div key={i} style={{ background: "#1F1F1D", borderRadius: 6, padding: 28, border: "1px solid #2A2820" }}>
                <div style={{ fontSize: 28, color: "var(--gold)", marginBottom: 14, lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 14, color: "#C8C5BE", lineHeight: 1.7, marginBottom: 22, fontFamily: "var(--fd)", fontStyle: "italic" }}>{q}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>{ini}</div>
                  <div><div style={{ fontSize: 13, fontWeight: 600, color: "#E8E6DF" }}>{n}</div><div style={{ fontSize: 12, color: "#6B6963" }}>{r}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "96px 40px", background: "var(--white)" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", maxWidth: 540, margin: "0 auto 52px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold)", fontWeight: 600, marginBottom: 12 }}>Pricing</div>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: 40, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--ink)" }}>Priced for the individual.<br /><em style={{ fontStyle: "italic" }}>Sold to the firm.</em></h2>
            <p style={{ marginTop: 14, fontSize: 14, color: "var(--ink-60)" }}>No seat minimums. No 6-month onboarding. Start in minutes.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, maxWidth: 900, margin: "0 auto" }}>
            {[
              { tier: "Starter", price: "Free", period: "forever", desc: "For individual accountants exploring AI-assisted analysis.", features: ["5 documents/month", "Basic extraction", "ASC 842 lease classifier", "Email support"], cta: "Get started free", hi: false, action: "waitlist" },
              { tier: "Professional", price: "$49", period: "/month", desc: "For growing teams who need speed and accuracy at month-end.", features: ["Unlimited documents", "AI Shadow Reviewer", "Month-end close dashboard", "Priority support", "Export to QuickBooks & Xero"], cta: "Join waitlist — 40% off", hi: true, action: "waitlist" },
              { tier: "Team", price: "Custom", period: "", desc: "For accounting firms and corporate finance departments.", features: ["Everything in Professional", "Multi-entity close management", "SSO & audit trail", "Dedicated onboarding", "SLA + SOC 2 Type II"], cta: "Contact sales", hi: false, action: "contact" },
            ].map((p, i) => (
              <div key={i} style={{ padding: 28, border: p.hi ? "2px solid var(--ink)" : "1.5px solid var(--border)", borderRadius: 6, position: "relative", background: p.hi ? "var(--ink)" : "var(--white)", transition: "transform .2s,box-shadow .2s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--sl)" }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}>
                {p.hi && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--gold)", color: "var(--ink)", padding: "3px 14px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>EARLY ACCESS DEAL</div>}
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: p.hi ? "var(--gold-l)" : "var(--ink-30)", fontWeight: 600, marginBottom: 10 }}>{p.tier}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--fd)", fontSize: 40, fontWeight: 600, color: p.hi ? "var(--cream)" : "var(--ink)", letterSpacing: "-0.04em" }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: p.hi ? "#8B8983" : "var(--ink-60)" }}>{p.period}</span>
                </div>
                <p style={{ fontSize: 13, color: p.hi ? "#8B8983" : "var(--ink-60)", lineHeight: 1.5, marginBottom: 18, minHeight: 38 }}>{p.desc}</p>
                <div style={{ height: 1, background: p.hi ? "#2A2820" : "var(--border)", margin: "0 0 16px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 9, alignItems: "center" }}>
                      <span style={{ color: p.hi ? "var(--gold)" : "var(--green)", fontSize: 11 }}>✓</span>
                      <span style={{ fontSize: 13, color: p.hi ? "#C8C5BE" : "var(--ink-60)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => p.action === "contact" ? window.location.href = "mailto:hello@exfinanalyze.com" : scrollTo()} style={{ width: "100%", padding: "12px", border: p.hi ? "none" : "1.5px solid var(--ink)", borderRadius: 4, background: p.hi ? "var(--gold)" : "transparent", color: "var(--ink)", fontFamily: "var(--fb)", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => { e.currentTarget.style.background = p.hi ? "var(--gold-l)" : "var(--ink)"; if (!p.hi) e.currentTarget.style.color = "var(--cream)" }} onMouseLeave={e => { e.currentTarget.style.background = p.hi ? "var(--gold)" : "transparent"; if (!p.hi) e.currentTarget.style.color = "var(--ink)" }}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" style={{ padding: "96px 40px", background: "var(--cream)" }}>
        <div className="wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold)", fontWeight: 600, marginBottom: 16 }}>Early Access</div>
              <h2 style={{ fontFamily: "var(--fd)", fontSize: 44, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.05, color: "var(--ink)", marginBottom: 20 }}>Be first.<br /><em style={{ fontStyle: "italic" }}>Get more.</em></h2>
              <p style={{ fontSize: 15, color: "var(--ink-60)", lineHeight: 1.7, marginBottom: 36 }}>ExFinAnalyze launches Q2 2026. Early access members get priority onboarding, permanent pricing discounts, and a direct line to shape the product.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {[["🏷", "40% off — forever", "Lock in the early access price before launch. The discount never expires."], ["⚡", "Priority onboarding", "Skip the queue. Get a 1-on-1 setup session and your first document analyzed before anyone else."], ["🎯", "Shape the product", "Your feedback directly influences what we build next. Early members have a seat at the table."]].map(([ic, t, b], i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, background: "var(--gold-p)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{ic}</div>
                    <div><div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 4 }}>{t}</div><div style={{ fontSize: 13, color: "var(--ink-60)", lineHeight: 1.5 }}>{b}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 36, padding: 18, background: "var(--white)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: "var(--ink-60)", marginBottom: 6, fontWeight: 600 }}>🔒 Admin panel</div>
                <div style={{ fontSize: 13, color: "var(--ink-60)", lineHeight: 1.5 }}>
                  View all signups and export CSV at{" "}
                  <code style={{ fontFamily: "var(--fm)", fontSize: 12, background: "var(--gold-p)", padding: "2px 7px", borderRadius: 3, color: "var(--gold)" }}>#admin</code>
                  {" "}— powered by Supabase Postgres.
                </div>
              </div>
            </div>
            <div ref={wlRef}>
              <div style={{ background: "var(--white)", border: "1.5px solid var(--border)", borderRadius: 8, padding: 36, boxShadow: "var(--sl)" }}>
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 500, marginBottom: 5, color: "var(--ink)" }}>Join the waitlist</div>
                  <div style={{ fontSize: 13, color: "var(--ink-60)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#27C93F", display: "inline-block" }} />Supabase
                    </span>
                    · {count !== null ? `${count} already signed up` : "Secure · Instant"}
                  </div>
                </div>
                <WaitlistForm onSuccess={() => sb.getCount().then(setCount)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--ink)", padding: "48px 40px 28px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 28, borderBottom: "1px solid #2A2820", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 26, height: 26, background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>
                <span style={{ fontFamily: "var(--fd)", fontWeight: 700, color: "var(--ink)", fontSize: 13 }}>E</span>
              </div>
              <span style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 15, color: "#E8E6DF" }}>ExFinAnalyze</span>
            </div>
            <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#6B6963" }}>
              {[["Privacy", "mailto:privacy@exfinanalyze.com"], ["Terms", "mailto:legal@exfinanalyze.com"], ["Security", "mailto:security@exfinanalyze.com"], ["Contact", "mailto:hello@exfinanalyze.com"]].map(([l, h]) => (
                <a key={l} href={h} style={{ textDecoration: "none", color: "inherit", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = "#E8E6DF"} onMouseLeave={e => e.target.style.color = "#6B6963"}>{l}</a>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#4A4840" }}>© 2026 ExFinAnalyze. All rights reserved.</div>
            <div style={{ fontSize: 11, color: "#4A4840", fontFamily: "var(--fm)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#27C93F", display: "inline-block" }} />
              Waitlist powered by Supabase Postgres
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}