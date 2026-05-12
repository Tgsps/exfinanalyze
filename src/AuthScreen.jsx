import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ═══════════════════════════════════════════════════════
   AUTH SCREEN — Production-ready with full UX polish
   - Sign In / Sign Up with smooth transitions
   - Email verification success state
   - Loading animations
   - Clear error messaging
═══════════════════════════════════════════════════════ */

const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

.auth-root{min-height:100vh;display:flex;background:#0C0E0D;font-family:'DM Sans',sans-serif;}
.auth-left{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;position:relative;overflow:hidden;}
.auth-left::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 30% 40%,rgba(200,146,74,.1) 0%,transparent 55%),radial-gradient(ellipse at 70% 70%,rgba(76,175,125,.06) 0%,transparent 50%);}
.auth-right{width:480px;display:flex;align-items:center;justify-content:center;padding:40px;border-left:1px solid #242826;}

/* Card */
.ac{background:#161918;border:1px solid #242826;border-radius:16px;padding:40px;width:100%;max-width:400px;box-shadow:0 8px 40px rgba(0,0,0,.5);position:relative;overflow:hidden;}
.ac::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(200,146,74,.4),transparent);}

/* Logo area */
.ac-logo{font-family:'Fraunces',Georgia,serif;font-size:26px;font-weight:700;color:#C8924A;letter-spacing:-.5px;margin-bottom:4px;}
.ac-tagline{font-size:12.5px;color:#6B6760;margin-bottom:30px;line-height:1.5;}

/* Tabs */
.ac-tabs{display:flex;background:#1B1E1C;border-radius:8px;padding:3px;margin-bottom:24px;gap:3px;}
.ac-tab{flex:1;padding:8px;border-radius:6px;text-align:center;font-size:13px;cursor:pointer;color:#6B6760;transition:all .2s;border:none;background:none;font-family:'DM Sans',sans-serif;font-weight:400;}
.ac-tab.on{background:#242826;color:#E8E4DC;font-weight:500;box-shadow:0 1px 3px rgba(0,0,0,.3);}

/* Form */
.ac-group{margin-bottom:14px;}
.ac-label{font-size:11.5px;color:#A8A49C;margin-bottom:5px;font-weight:500;display:block;}
.ac-input{background:#1B1E1C;border:1px solid #2E3330;border-radius:6px;padding:10px 13px;color:#E8E4DC;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:all .15s;width:100%;}
.ac-input:focus{border-color:#C8924A;box-shadow:0 0 0 3px rgba(200,146,74,.1);}
.ac-input::placeholder{color:#4A4744;}
.ac-input:disabled{opacity:.5;cursor:not-allowed;}
.ac-select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B6760' stroke-width='1.5' stroke-linecap='round' fill='none'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 11px center;padding-right:30px;cursor:pointer;}

/* Buttons */
.ac-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:11px;border-radius:8px;font-size:13.5px;font-weight:600;cursor:pointer;border:none;transition:all .2s;font-family:'DM Sans',sans-serif;letter-spacing:.1px;}
.ac-btn-primary{background:linear-gradient(135deg,#C8924A,#E2A85C);color:#000;}
.ac-btn-primary:hover{background:linear-gradient(135deg,#D9A05A,#F0B668);transform:translateY(-1px);box-shadow:0 4px 16px rgba(200,146,74,.3);}
.ac-btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;}
.ac-btn-ghost{background:transparent;color:#A8A49C;border:1px solid #2E3330;margin-top:10px;}
.ac-btn-ghost:hover{background:#1B1E1C;color:#E8E4DC;}

/* Messages */
.ac-error{background:rgba(224,92,92,.1);border:1px solid rgba(224,92,92,.25);color:#E05C5C;padding:10px 13px;border-radius:8px;font-size:12.5px;margin-bottom:14px;display:flex;align-items:flex-start;gap:8px;line-height:1.5;}
.ac-info{background:rgba(92,155,224,.1);border:1px solid rgba(92,155,224,.2);color:#5C9BE0;padding:10px 13px;border-radius:8px;font-size:12.5px;margin-bottom:14px;}

/* Success state */
.ac-success{text-align:center;padding:10px 0;}
.ac-success-icon{width:64px;height:64px;border-radius:50%;background:rgba(76,175,125,.15);border:2px solid rgba(76,175,125,.3);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:popIn .4s cubic-bezier(.175,.885,.32,1.275);}
.ac-success-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:#E8E4DC;margin-bottom:8px;}
.ac-success-msg{font-size:13px;color:#A8A49C;line-height:1.7;margin-bottom:24px;}
.ac-success-email{display:inline-block;background:#1B1E1C;border:1px solid #2E3330;border-radius:6px;padding:6px 14px;font-size:13px;color:#C8924A;font-family:'JetBrains Mono',monospace;margin:4px 0 16px;}
.ac-steps{display:flex;flex-direction:column;gap:10px;text-align:left;background:#111412;border:1px solid #242826;border-radius:10px;padding:16px;margin-bottom:24px;}
.ac-step{display:flex;align-items:flex-start;gap:10px;font-size:12.5px;color:#A8A49C;line-height:1.5;}
.ac-step-num{width:20px;height:20px;border-radius:50%;background:rgba(200,146,74,.15);color:#C8924A;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px;}
.ac-resend{font-size:12px;color:#6B6760;text-align:center;}
.ac-resend button{background:none;border:none;color:#C8924A;cursor:pointer;font-size:12px;font-family:'DM Sans',sans-serif;text-decoration:underline;}
.ac-resend button:disabled{opacity:.5;cursor:not-allowed;}

/* Loading spinner */
.ac-spinner{width:16px;height:16px;border:2px solid rgba(0,0,0,.3);border-top-color:#000;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0;}
.ac-spinner-gold{border-color:rgba(200,146,74,.2);border-top-color:#C8924A;}

/* Left side branding */
.brand-hero{position:relative;z-index:1;max-width:480px;}
.brand-logo{font-family:'Fraunces',Georgia,serif;font-size:36px;font-weight:700;color:#C8924A;margin-bottom:12px;letter-spacing:-.5px;}
.brand-tagline{font-size:18px;color:#E8E4DC;font-family:'Fraunces',serif;font-weight:300;font-style:italic;margin-bottom:32px;line-height:1.4;}
.brand-features{display:flex;flex-direction:column;gap:14px;}
.brand-feat{display:flex;align-items:center;gap:12px;font-size:14px;color:#A8A49C;}
.brand-feat-dot{width:6px;height:6px;border-radius:50%;background:#C8924A;flex-shrink:0;}
.brand-stats{display:flex;gap:32px;margin-top:40px;padding-top:32px;border-top:1px solid #242826;}
.brand-stat-val{font-family:'Fraunces',serif;font-size:28px;font-weight:700;color:#E8E4DC;}
.brand-stat-label{font-size:12px;color:#6B6760;margin-top:2px;}

/* Divider */
.ac-divider{display:flex;align-items:center;gap:10px;margin:16px 0;color:#4A4744;font-size:12px;}
.ac-divider::before,.ac-divider::after{content:'';flex:1;height:1px;background:#242826;}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes popIn{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes fadeUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
.fade-up{animation:fadeUp .3s ease forwards;}
`;

// ─── Left branding panel ──────────────────────────────────────────
function BrandPanel() {
  const feats = [
    "AI-powered document extraction from PDF, Excel & contracts",
    "Shadow Reviewer — real-time ASC 842/606 coaching for junior staff",
    "Auto-generated MD&A narratives and close reports",
    "Anomaly detection across 100% of transactions",
    "Audit-ready source citations on every AI insight",
  ];
  return (
    <div className="brand-hero">
      <div className="brand-logo">ExFinAnalyze</div>
      <div className="brand-tagline">Financial intelligence,<br />built for the modern team.</div>
      <div className="brand-features">
        {feats.map((f, i) => (
          <div key={i} className="brand-feat">
            <div className="brand-feat-dot" />
            {f}
          </div>
        ))}
      </div>
      <div className="brand-stats">
        {[
          { val: "70%", label: "Time saved on data prep" },
          { val: "100%", label: "Transaction coverage" },
          { val: "< 2wk", label: "Time to deploy" },
        ].map((s, i) => (
          <div key={i}>
            <div className="brand-stat-val">{s.val}</div>
            <div className="brand-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Success state after signup ───────────────────────────────────
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
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="2" strokeLinecap="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <div className="ac-success-title">Check your inbox</div>
      <div className="ac-success-msg">
        We sent a verification link to:
      </div>
      <div className="ac-success-email">{email}</div>

      <div className="ac-steps">
        {[
          "Open the email from ExFinAnalyze",
          "Click the \"Verify Email\" button",
          "You'll be redirected back here automatically",
        ].map((step, i) => (
          <div key={i} className="ac-step">
            <div className="ac-step-num">{i + 1}</div>
            <span>{step}</span>
          </div>
        ))}
      </div>

      {resent && (
        <div className="ac-info" style={{ marginBottom: 14 }}>
          ✓ New verification email sent!
        </div>
      )}

      <button className="ac-btn ac-btn-primary" onClick={onBackToLogin}>
        Back to Sign In
      </button>

      <div className="ac-resend" style={{ marginTop: 14 }}>
        Didn't receive it?{" "}
        <button onClick={handleResend} disabled={resending || countdown > 0}>
          {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend email"}
        </button>
      </div>

      <div style={{ marginTop: 16, padding: "10px 12px", background: "rgba(200,146,74,.06)", border: "1px solid rgba(200,146,74,.15)", borderRadius: 8 }}>
        <div style={{ fontSize: 11.5, color: "#A8A49C", lineHeight: 1.6 }}>
          💡 <strong style={{ color: "#C8924A" }}>Tip:</strong> Check your spam folder if you don't see it within 2 minutes. Mark it as "Not Spam" to avoid future issues.
        </div>
      </div>
    </div>
  );
}

// ─── Main Auth Screen ─────────────────────────────────────────────
export default function AuthScreen({ onLogin }) {
  const [tab,      setTab]      = useState("login");
  const [state,    setState]    = useState("idle"); // idle | loading | success | error
  const [err,      setErr]      = useState("");
  const [form,     setForm]     = useState({ name: "", email: "", password: "", role: "analyst" });
  const [signedUp, setSignedUp] = useState(false); // show verify state
  const [signupEmail, setSignupEmail] = useState("");

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const isLoading = state === "loading";

  // Check if user landed from email verification link
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token") || hash.includes("type=signup")) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) onLogin(session.user);
      });
    }
    // Also listen for auth changes (magic link / email confirm)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session?.user) {
        onLogin(session.user);
      }
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
        if (!form.name.trim()) throw new Error("Please enter your full name");
        if (!form.email.trim()) throw new Error("Please enter your email");
        if (form.password.length < 6) throw new Error("Password must be at least 6 characters");

        const redirectUrl = `${window.location.origin}/`;

        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { name: form.name, role: form.role },
            emailRedirectTo: redirectUrl,
          },
        });

        if (error) throw error;

        if (data.user && !data.session) {
          // Email confirmation required
          setSignupEmail(form.email);
          setSignedUp(true);
          setForm({ name: "", email: "", password: "", role: "analyst" });
          setState("idle");
          return;
        } else if (data.user && data.session) {
          // Email confirmation disabled — direct login
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

  const switchTab = (t) => {
    setTab(t); setErr(""); setState("idle"); setSignedUp(false);
  };

  return (
    <>
      <style>{AUTH_CSS}</style>
      <div className="auth-root">
        {/* Left branding — hidden on mobile */}
        <div className="auth-left" style={{ display: "none" }}>
          <BrandPanel />
        </div>

        {/* Right form panel */}
        <div className="auth-right" style={{ width: "100%", maxWidth: 520 }}>
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
                <div className="ac-tagline">AI-powered financial intelligence platform</div>

                <div className="ac-tabs">
                  <button className={`ac-tab${tab === "login"  ? " on" : ""}`} onClick={() => switchTab("login")}>Sign In</button>
                  <button className={`ac-tab${tab === "signup" ? " on" : ""}`} onClick={() => switchTab("signup")}>Sign Up</button>
                </div>

                {err && (
                  <div className="ac-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {err}
                  </div>
                )}

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

                <button className="ac-btn ac-btn-primary" onClick={submit} disabled={isLoading}>
                  {isLoading ? (
                    <><div className="ac-spinner" />{tab === "login" ? "Signing in..." : "Creating account..."}</>
                  ) : (
                    tab === "login" ? "Sign In" : "Create Account →"
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
                      <button onClick={() => switchTab("signup")} style={{ background: "none", border: "none", color: "#C8924A", cursor: "pointer", fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
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
