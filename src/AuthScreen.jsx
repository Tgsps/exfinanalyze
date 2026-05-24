import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ═══════════════════════════════════════════════════════════
   AUTH SCREEN v2 — Dark green redesign
   Matches Stitch mockup: circuit board left, form right
═══════════════════════════════════════════════════════════ */

const AUTH_CSS = `
.auth-root{min-height:100vh;display:flex;background:#09110D;font-family:'DM Sans',sans-serif;}
.auth-left{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;position:relative;overflow:hidden;background:#0A130D;}
.auth-right{width:500px;min-width:400px;display:flex;align-items:center;justify-content:center;padding:40px;background:#09110D;}

/* Card */
.ac{background:#111914;border:1px solid #1C2620;border-radius:16px;padding:42px;width:100%;max-width:400px;box-shadow:0 8px 48px rgba(0,0,0,.6);position:relative;overflow:hidden;}
.ac::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,201,122,.4),transparent);}
.ac::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,201,122,.1),transparent);}

/* Logo area */
.ac-logo{font-family:'Fraunces',Georgia,serif;font-size:15px;font-weight:700;color:#00C97A;letter-spacing:-.3px;margin-bottom:24px;display:flex;align-items:center;gap:7px;}
.ac-logo::before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:#00C97A;box-shadow:0 0 7px #00C97A;}
.ac-headline{font-family:'Fraunces',Georgia,serif;font-size:26px;font-weight:500;color:#E8E4DC;margin-bottom:6px;line-height:1.15;letter-spacing:-0.02em;}
.ac-tagline{font-size:13px;color:#6B6760;margin-bottom:28px;line-height:1.5;}

/* Tabs */
.ac-tabs{display:flex;background:#0D1510;border:1px solid #1C2620;border-radius:8px;padding:3px;margin-bottom:22px;gap:2px;}
.ac-tab{flex:1;padding:8px;border-radius:6px;text-align:center;font-size:13px;cursor:pointer;color:#6B6760;transition:all .2s;border:none;background:none;font-family:'DM Sans',sans-serif;font-weight:400;}
.ac-tab.on{background:#161E18;border:1px solid rgba(0,201,122,.15);color:#E8E4DC;font-weight:500;}

/* Form */
.ac-group{margin-bottom:14px;}
.ac-label{font-size:11.5px;color:#A8A49C;margin-bottom:5px;font-weight:500;display:block;}
.ac-input{background:#0D1510;border:1px solid #243028;border-radius:8px;padding:11px 13px;color:#E8E4DC;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:all .15s;width:100%;}
.ac-input:focus{border-color:#00C97A;box-shadow:0 0 0 3px rgba(0,201,122,.1);}
.ac-input::placeholder{color:#4A4840;}
.ac-input:disabled{opacity:.5;cursor:not-allowed;}
.ac-select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B6760' stroke-width='1.5' stroke-linecap='round' fill='none'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 11px center;padding-right:30px;cursor:pointer;}

/* Buttons */
.ac-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px;border-radius:8px;font-size:13.5px;font-weight:600;cursor:pointer;border:none;transition:all .2s;font-family:'DM Sans',sans-serif;letter-spacing:.1px;}
.ac-btn-primary{background:#00C97A;color:#000;}
.ac-btn-primary:hover{background:#33E895;box-shadow:0 0 20px rgba(0,201,122,.35);}
.ac-btn-primary:disabled{opacity:.5;cursor:not-allowed;box-shadow:none;}
.ac-btn-ghost{background:transparent;color:#A8A49C;border:1px solid #243028;margin-top:10px;}
.ac-btn-ghost:hover{background:#161E18;color:#E8E4DC;border-color:rgba(0,201,122,.2);}

/* Messages */
.ac-error{background:rgba(224,92,92,.08);border:1px solid rgba(224,92,92,.2);color:#E05C5C;padding:10px 13px;border-radius:8px;font-size:12.5px;margin-bottom:14px;display:flex;align-items:flex-start;gap:8px;line-height:1.5;}
.ac-info{background:rgba(0,201,122,.06);border:1px solid rgba(0,201,122,.15);color:#00C97A;padding:10px 13px;border-radius:8px;font-size:12.5px;margin-bottom:14px;}

/* Success state */
.ac-success{text-align:center;padding:10px 0;}
.ac-success-icon{width:64px;height:64px;border-radius:50%;background:rgba(0,201,122,.1);border:2px solid rgba(0,201,122,.25);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:popIn .4s cubic-bezier(.175,.885,.32,1.275);}
.ac-success-title{font-family:'Fraunces',serif;font-size:20px;font-weight:500;color:#E8E4DC;margin-bottom:8px;}
.ac-success-msg{font-size:13px;color:#A8A49C;line-height:1.7;margin-bottom:16px;}
.ac-success-email{display:inline-block;background:#0D1510;border:1px solid #243028;border-radius:6px;padding:6px 14px;font-size:13px;color:#00C97A;font-family:'JetBrains Mono',monospace;margin:4px 0 16px;}
.ac-steps{display:flex;flex-direction:column;gap:10px;text-align:left;background:#0D1510;border:1px solid #1C2620;border-radius:10px;padding:16px;margin-bottom:22px;}
.ac-step{display:flex;align-items:flex-start;gap:10px;font-size:12.5px;color:#A8A49C;line-height:1.5;}
.ac-step-num{width:20px;height:20px;border-radius:50%;background:rgba(0,201,122,.12);color:#00C97A;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px;}
.ac-resend{font-size:12px;color:#6B6760;text-align:center;}
.ac-resend button{background:none;border:none;color:#00C97A;cursor:pointer;font-size:12px;font-family:'DM Sans',sans-serif;text-decoration:underline;}
.ac-resend button:disabled{opacity:.5;cursor:not-allowed;}

/* Loading spinner */
.ac-spinner{width:16px;height:16px;border:2px solid rgba(0,0,0,.2);border-top-color:rgba(0,0,0,.8);border-radius:50%;animation:ac-spin .7s linear infinite;flex-shrink:0;}

/* Divider */
.ac-divider{display:flex;align-items:center;gap:10px;margin:16px 0;color:#4A4744;font-size:12px;}
.ac-divider::before,.ac-divider::after{content:'';flex:1;height:1px;background:#1C2620;}

@keyframes ac-spin{to{transform:rotate(360deg)}}
@keyframes popIn{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes fadeUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
.fade-up{animation:fadeUp .3s ease forwards;}

/* Responsive */
@media(max-width:768px){.auth-left{display:none!important}.auth-right{width:100%!important;}}
`;

/* ── Circuit Board SVG Visual ───────────────────────────────── */
function CircuitBoard() {
  const GREEN = "#00C97A";
  const BORDER = "#1C2620";
  const GLOW = "rgba(0,201,122,0.15)";

  // Generate random-ish circuit paths
  const horizontals = [
    { y: 60,  x1: 10,  x2: 90  },
    { y: 120, x1: 5,   x2: 45  },
    { y: 120, x1: 65,  x2: 95  },
    { y: 180, x1: 20,  x2: 80  },
    { y: 240, x1: 10,  x2: 60  },
    { y: 240, x1: 75,  x2: 95  },
    { y: 300, x1: 30,  x2: 90  },
    { y: 360, x1: 5,   x2: 55  },
    { y: 360, x1: 70,  x2: 95  },
    { y: 420, x1: 15,  x2: 85  },
    { y: 480, x1: 10,  x2: 50  },
    { y: 480, x1: 65,  x2: 90  },
  ];
  const verticals = [
    { x: 20,  y1: 60,  y2: 180 },
    { x: 50,  y1: 120, y2: 240 },
    { x: 80,  y1: 60,  y2: 120 },
    { x: 65,  y1: 240, y2: 360 },
    { x: 35,  y1: 300, y2: 420 },
    { x: 80,  y1: 300, y2: 480 },
    { x: 15,  y1: 360, y2: 480 },
    { x: 55,  y1: 420, y2: 540 },
  ];
  const nodes = [
    { cx: 20, cy: 60  }, { cx: 80, cy: 60  },
    { cx: 50, cy: 120 }, { cx: 20, cy: 180 },
    { cx: 80, cy: 180 }, { cx: 50, cy: 240 },
    { cx: 65, cy: 240 }, { cx: 35, cy: 300 },
    { cx: 80, cy: 300 }, { cx: 65, cy: 360 },
    { cx: 15, cy: 360 }, { cx: 35, cy: 420 },
    { cx: 80, cy: 420 }, { cx: 55, cy: 480 },
  ];
  const chips = [
    { x: 30, y: 130, w: 30, h: 20 },
    { x: 55, y: 250, w: 35, h: 25 },
    { x: 20, y: 380, w: 28, h: 18 },
    { x: 60, cy: 460, w: 30, h: 20 },
  ];

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 550" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, opacity: .55 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Background grid */}
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`g${i}`} x1={0} y1={i*55} x2={100} y2={i*55} stroke={BORDER} strokeWidth="0.3" opacity=".5"/>
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`gv${i}`} x1={i*10} y1={0} x2={i*10} y2={550} stroke={BORDER} strokeWidth="0.3" opacity=".5"/>
      ))}
      {/* Circuit traces */}
      {horizontals.map((h, i) => (
        <line key={`h${i}`} x1={h.x1} y1={h.y} x2={h.x2} y2={h.y} stroke={GREEN} strokeWidth="0.4" opacity=".6" filter="url(#glow)"/>
      ))}
      {verticals.map((v, i) => (
        <line key={`v${i}`} x1={v.x} y1={v.y1} x2={v.x} y2={v.y2} stroke={GREEN} strokeWidth="0.4" opacity=".6" filter="url(#glow)"/>
      ))}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={`n${i}`}>
          <circle cx={n.cx} cy={n.cy} r="1.8" fill="#09110D" stroke={GREEN} strokeWidth="0.6"/>
          <circle cx={n.cx} cy={n.cy} r="0.6" fill={GREEN}/>
        </g>
      ))}
      {/* Chips */}
      {chips.map((c, i) => (
        <g key={`c${i}`}>
          <rect x={c.x} y={c.y} width={c.w} height={c.h} fill="#0D1510" stroke={GREEN} strokeWidth="0.5" rx="0.8"/>
          {Array.from({ length: 4 }, (_, j) => (
            <line key={j} x1={c.x + (c.w / 5) * (j + 1)} y1={c.y} x2={c.x + (c.w / 5) * (j + 1)} y2={c.y - 3} stroke={GREEN} strokeWidth="0.3" opacity=".6"/>
          ))}
          {Array.from({ length: 3 }, (_, j) => (
            <line key={`b${j}`} x1={c.x + (c.w / 4) * (j + 1)} y1={c.y + c.h} x2={c.x + (c.w / 4) * (j + 1)} y2={c.y + c.h + 3} stroke={GREEN} strokeWidth="0.3" opacity=".6"/>
          ))}
          {/* Internal grid */}
          <line x1={c.x + 2} y1={c.y + c.h/2} x2={c.x + c.w - 2} y2={c.y + c.h/2} stroke={GREEN} strokeWidth="0.2" opacity=".4"/>
          <line x1={c.x + c.w/2} y1={c.y + 2} x2={c.x + c.w/2} y2={c.y + c.h - 2} stroke={GREEN} strokeWidth="0.2" opacity=".4"/>
        </g>
      ))}
      {/* Neural center */}
      <circle cx="50" cy="275" r="18" fill="none" stroke={GREEN} strokeWidth="0.5" opacity=".4"/>
      <circle cx="50" cy="275" r="12" fill="rgba(0,201,122,.04)" stroke={GREEN} strokeWidth="0.8" opacity=".6"/>
      <circle cx="50" cy="275" r="4" fill="rgba(0,201,122,.2)" stroke={GREEN} strokeWidth="0.8"/>
      <circle cx="50" cy="275" r="1.5" fill={GREEN}/>
      {/* Pulsing rings */}
      <circle cx="50" cy="275" r="22" fill="none" stroke={GREEN} strokeWidth="0.3" opacity=".2" strokeDasharray="3 4"/>
    </svg>
  );
}

/* ── Left branding panel ─────────────────────────────────────── */
function BrandPanel() {
  const GREEN = "#00C97A";
  const INK = "#E8E4DC";
  const INK2 = "#A8A49C";
  const INK3 = "#6B6760";

  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 440, width: "100%" }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: GREEN }}>ExFinAnalyze</span>
      </div>

      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,3.5vw,38px)", fontWeight: 500, color: INK, lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: 16 }}>
        The Future of<br />Finance Starts Here.
      </h2>
      <p style={{ fontSize: 14, color: INK2, lineHeight: 1.65, marginBottom: 36 }}>
        Join ExFinAnalyze and unlock next-generation financial intelligence powered by AI.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
        {[
          "AI-powered document extraction from PDF, Excel & contracts",
          "Shadow Reviewer — real-time ASC 842/606 coaching",
          "Auto-generated MD&A narratives and close reports",
          "Neural fraud detection across all transactions",
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: INK2 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(0,201,122,.1)", border: "1px solid rgba(0,201,122,.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <polyline points="2,6 5,9 10,3" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {f}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 28, paddingTop: 28, borderTop: "1px solid #1C2620" }}>
        {[["70%","Time saved on data prep"],["100%","Transaction coverage"],["< 2wk","Time to deploy"]].map(([val, label]) => (
          <div key={label}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: INK, letterSpacing: "-0.03em" }}>{val}</div>
            <div style={{ fontSize: 11.5, color: INK3, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Verify email state ──────────────────────────────────────── */
function VerifyEmailState({ email, onBackToLogin, onResend }) {
  const [resending, setResending] = useState(false);
  const [resent,    setResent]    = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleResend = async () => {
    setResending(true);
    await onResend();
    setResending(false);
    setResent(true);
    setCountdown(60);
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  return (
    <div className="ac-success fade-up">
      <div className="ac-success-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00C97A" strokeWidth="2" strokeLinecap="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <div className="ac-success-title">Check your inbox</div>
      <div className="ac-success-msg">We sent a verification link to:</div>
      <div className="ac-success-email">{email}</div>

      <div className="ac-steps">
        {["Open the email from ExFinAnalyze","Click the \"Verify Email\" button","You'll be redirected back here automatically"].map((step, i) => (
          <div key={i} className="ac-step">
            <div className="ac-step-num">{i + 1}</div>
            <span>{step}</span>
          </div>
        ))}
      </div>

      {resent && <div className="ac-info">✓ New verification email sent!</div>}

      <button className="ac-btn ac-btn-primary" onClick={onBackToLogin}>Back to Sign In</button>

      <div className="ac-resend" style={{ marginTop: 14 }}>
        Didn't receive it?{" "}
        <button onClick={handleResend} disabled={resending || countdown > 0}>
          {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend email"}
        </button>
      </div>

      <div style={{ marginTop: 16, padding: "10px 12px", background: "rgba(0,201,122,.04)", border: "1px solid rgba(0,201,122,.12)", borderRadius: 8 }}>
        <div style={{ fontSize: 11.5, color: "#A8A49C", lineHeight: 1.6 }}>
          💡 <strong style={{ color: "#00C97A" }}>Tip:</strong> Check your spam folder if you don't see it within 2 minutes.
        </div>
      </div>
    </div>
  );
}

/* ── Main Auth Screen ────────────────────────────────────────── */
export default function AuthScreen({ onLogin }) {
  const [tab,         setTab]         = useState("login");
  const [state,       setState]       = useState("idle");
  const [err,         setErr]         = useState("");
  const [form,        setForm]        = useState({ name: "", email: "", password: "", role: "analyst" });
  const [signedUp,    setSignedUp]    = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const isLoading = state === "loading";

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token") || hash.includes("type=signup")) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) onLogin(session.user);
      });
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user) onLogin(session.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async () => {
    setErr(""); setState("loading");
    try {
      if (tab === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
        onLogin(data.user);
      } else {
        if (!form.name.trim())         throw new Error("Please enter your full name");
        if (!form.email.trim())        throw new Error("Please enter your email");
        if (form.password.length < 6)  throw new Error("Password must be at least 6 characters");
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { name: form.name, role: form.role }, emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setSignupEmail(form.email);
          setSignedUp(true);
          setForm({ name: "", email: "", password: "", role: "analyst" });
          setState("idle");
          return;
        } else if (data.user && data.session) {
          onLogin(data.user);
          return;
        }
      }
      setState("idle");
    } catch (e) {
      setErr(e.message);
      setState("idle");
    }
  };

  const resendEmail = async () => {
    await supabase.auth.resend({ type: "signup", email: signupEmail });
  };

  const switchTab = (t) => { setTab(t); setErr(""); setState("idle"); setSignedUp(false); };

  return (
    <>
      <style>{AUTH_CSS}</style>
      <div className="auth-root">

        {/* Left: circuit board branding */}
        <div className="auth-left">
          <CircuitBoard />
          {/* Green radial glow */}
          <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,201,122,.12) 0%, transparent 65%)", pointerEvents: "none" }} />
          <BrandPanel />
        </div>

        {/* Right: form */}
        <div className="auth-right">
          <div className="ac">
            {signedUp ? (
              <VerifyEmailState
                email={signupEmail}
                onBackToLogin={() => { setSignedUp(false); setTab("login"); }}
                onResend={resendEmail}
              />
            ) : (
              <>
                <div className="ac-logo">ExFinAnalyze</div>

                <div className="ac-headline">
                  {tab === "signup" ? "Join the Future\nof Finance." : "Welcome back."}
                </div>
                <div className="ac-tagline">
                  {tab === "signup"
                    ? "Create your account and unlock next-generation financial intelligence."
                    : "Sign in to your ExFinAnalyze account."}
                </div>

                {/* Tabs */}
                <div className="ac-tabs">
                  <button className={`ac-tab${tab === "login"  ? " on" : ""}`} onClick={() => switchTab("login")}>Sign In</button>
                  <button className={`ac-tab${tab === "signup" ? " on" : ""}`} onClick={() => switchTab("signup")}>Sign Up</button>
                </div>

                {/* Error */}
                {err && (
                  <div className="ac-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {err}
                  </div>
                )}

                {/* Full Name (signup only) */}
                {tab === "signup" && (
                  <div className="ac-group fade-up">
                    <label className="ac-label">Full Name</label>
                    <input className="ac-input" placeholder="Jane Smith" value={form.name} onChange={set("name")} disabled={isLoading} />
                  </div>
                )}

                <div className="ac-group">
                  <label className="ac-label">Work Email</label>
                  <input className="ac-input" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} disabled={isLoading} onKeyDown={e => e.key === "Enter" && submit()} />
                </div>

                <div className="ac-group">
                  <label className="ac-label">Password</label>
                  <input className="ac-input" type="password" placeholder={tab === "signup" ? "Min. 6 characters" : "••••••••"} value={form.password} onChange={set("password")} disabled={isLoading} onKeyDown={e => e.key === "Enter" && submit()} />
                </div>

                {tab === "signup" && (
                  <div className="ac-group fade-up">
                    <label className="ac-label">Your Role</label>
                    <select className="ac-input ac-select" value={form.role} onChange={set("role")} disabled={isLoading}>
                      <option value="analyst">Financial Analyst</option>
                      <option value="accountant">Accountant</option>
                      <option value="auditor">Auditor</option>
                      <option value="manager">Finance Manager</option>
                      <option value="cfo">CFO / Director</option>
                    </select>
                  </div>
                )}

                {/* Submit */}
                <button className="ac-btn ac-btn-primary" onClick={submit} disabled={isLoading}>
                  {isLoading ? (
                    <><div className="ac-spinner" />{tab === "login" ? "Signing in..." : "Creating account..."}</>
                  ) : (
                    tab === "login" ? "Sign In" : "Create Account"
                  )}
                </button>

                {tab === "signup" && (
                  <div style={{ fontSize: 11.5, color: "#4A4744", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
                    By signing up, you agree to our Terms of Service.<br />
                    A verification email will be sent to confirm your account.
                  </div>
                )}

                {tab === "login" && (
                  <>
                    <div className="ac-divider">or</div>
                    <div style={{ fontSize: 12.5, color: "#6B6760", textAlign: "center" }}>
                      No account?{" "}
                      <button onClick={() => switchTab("signup")} style={{ background: "none", border: "none", color: "#00C97A", cursor: "pointer", fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
                        Sign up free →
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
