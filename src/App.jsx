import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";
import AuthScreen from "./AuthScreen";

/* ═══════════════════════════════════════════════════════════════════
   EXFINANALYZE — Production SaaS Platform
   Auth: Supabase Auth (real backend)
   AI:   Gemini 1.5 Flash via VITE_GEMINI_API_KEY
   Docs: Supabase Storage + local fallback
   Design: Dark editorial-financial
═══════════════════════════════════════════════════════════════════ */

// ─── Gemini Service ───────────────────────────────────────────────
const gemini = {
  async analyze(prompt, fileData = null) {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error("VITE_GEMINI_API_KEY not configured");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const parts = [{ text: prompt }];
    if (fileData) parts.unshift({ inlineData: { mimeType: fileData.mimeType, data: fileData.data } });
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { maxOutputTokens: 2048 } }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || "Gemini API error");
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  },
};

// ─── Doc Store (Supabase-backed with localStorage fallback) ───────
const docStore = {
  key(userId) { return `exfin_docs_${userId}`; },
  get(userId) {
    try { return JSON.parse(localStorage.getItem(this.key(userId)) || "[]"); }
    catch { return []; }
  },
  save(userId, docs) { localStorage.setItem(this.key(userId), JSON.stringify(docs)); },
  add(userId, doc) {
    const docs = this.get(userId);
    this.save(userId, [doc, ...docs]);
    return doc;
  },
  update(userId, id, patch) {
    const docs = this.get(userId).map(d => d.id === id ? { ...d, ...patch } : d);
    this.save(userId, docs);
    return docs.find(d => d.id === id);
  },
  remove(userId, id) {
    this.save(userId, this.get(userId).filter(d => d.id !== id));
  },
};

// ─── CSS ──────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;1,300&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0C0E0D;--surf:#111412;--card:#161918;--card2:#1B1E1C;
  --border:#242826;--border2:#2E3330;
  --gold:#C8924A;--gold-l:#E2A85C;--gold-d:#A37038;
  --green:#4CAF7D;--red:#E05C5C;--blue:#5C9BE0;--purple:#9B7FE8;
  --ink:#E8E4DC;--ink2:#A8A49C;--ink3:#6B6760;
  --ff:'Fraunces',Georgia,serif;--fb:'DM Sans',sans-serif;--fm:'JetBrains Mono',monospace;
  --r:6px;--r2:10px;--shadow:0 4px 24px rgba(0,0,0,.45);
}
html,body,#root{height:100%;}
body{background:var(--bg);color:var(--ink);font-family:var(--fb);font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:var(--surf);}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px;}

/* Layout */
.app{display:flex;height:100vh;overflow:hidden;}
.sidebar{width:216px;min-width:216px;background:var(--surf);border-right:1px solid var(--border);display:flex;flex-direction:column;}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.topbar{height:54px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;gap:12px;background:var(--surf);flex-shrink:0;}
.content{flex:1;overflow-y:auto;padding:28px;}

/* Sidebar */
.logo{padding:18px 16px 14px;border-bottom:1px solid var(--border);}
.logo-mark{font-family:var(--ff);font-size:17px;font-weight:700;color:var(--gold);letter-spacing:-.3px;}
.logo-sub{font-size:9px;color:var(--ink3);letter-spacing:.9px;text-transform:uppercase;margin-top:1px;}
.nav{flex:1;padding:10px 8px;overflow-y:auto;}
.nav-section{font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:var(--ink3);padding:14px 10px 5px;font-weight:600;}
.nav-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:var(--r);cursor:pointer;color:var(--ink2);font-size:13px;font-weight:400;transition:all .13s;margin-bottom:1px;border:none;background:none;width:100%;text-align:left;font-family:var(--fb);}
.nav-item:hover{background:var(--card);color:var(--ink);}
.nav-item.active{background:var(--card2);color:var(--gold);font-weight:500;}
.nav-badge{margin-left:auto;background:var(--gold);color:#000;font-size:9px;font-weight:700;padding:1px 5px;border-radius:10px;}
.user-area{padding:10px;border-top:1px solid var(--border);}
.user-card{display:flex;align-items:center;gap:9px;padding:8px;border-radius:var(--r);cursor:pointer;transition:background .13s;}
.user-card:hover{background:var(--card);}
.avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--gold-d),var(--gold));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#000;flex-shrink:0;font-family:var(--fb);}
.avatar-lg{width:42px;height:42px;font-size:15px;}
.user-name{font-size:12.5px;font-weight:500;color:var(--ink);line-height:1.2;}
.user-role{font-size:10.5px;color:var(--ink3);}

/* Cards */
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:20px;}
.card-title{font-family:var(--ff);font-size:14.5px;font-weight:600;color:var(--ink);}
.card-sub{font-size:12px;color:var(--ink3);}

/* Grid */
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;}

/* Stats */
.stat-val{font-family:var(--ff);font-size:26px;font-weight:700;color:var(--ink);line-height:1;margin:10px 0 3px;}
.stat-label{font-size:11.5px;color:var(--ink3);}
.stat-change{font-size:11px;font-family:var(--fm);margin-top:5px;}
.stat-up{color:var(--green);}
.stat-down{color:var(--red);}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:var(--r);font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all .13s;font-family:var(--fb);white-space:nowrap;}
.btn-primary{background:var(--gold);color:#000;}
.btn-primary:hover{background:var(--gold-l);}
.btn-primary:disabled{opacity:.45;cursor:not-allowed;}
.btn-ghost{background:transparent;color:var(--ink2);border:1px solid var(--border2);}
.btn-ghost:hover{background:var(--card2);color:var(--ink);}
.btn-ghost:disabled{opacity:.45;cursor:not-allowed;}
.btn-danger{background:transparent;color:var(--red);border:1px solid rgba(224,92,92,.25);}
.btn-danger:hover{background:rgba(224,92,92,.08);}
.btn-sm{padding:5px 11px;font-size:12px;}
.btn-icon{padding:7px;width:32px;height:32px;justify-content:center;}

/* Inputs */
.input{background:var(--card2);border:1px solid var(--border2);border-radius:var(--r);padding:9px 12px;color:var(--ink);font-size:13px;font-family:var(--fb);outline:none;transition:border .13s;width:100%;}
.input:focus{border-color:var(--gold);}
.input::placeholder{color:var(--ink3);}
.input:disabled{opacity:.5;cursor:not-allowed;}
.input-label{font-size:11.5px;color:var(--ink2);margin-bottom:5px;font-weight:500;}
.input-group{margin-bottom:14px;}
.select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B6760' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;padding-right:28px;cursor:pointer;}

/* Table */
.table{width:100%;border-collapse:collapse;}
.table th{text-align:left;padding:9px 14px;font-size:10.5px;color:var(--ink3);font-weight:600;letter-spacing:.6px;text-transform:uppercase;border-bottom:1px solid var(--border);}
.table td{padding:11px 14px;font-size:13px;border-bottom:1px solid var(--border);color:var(--ink2);vertical-align:middle;}
.table tr:last-child td{border-bottom:none;}
.table tr:hover td{background:rgba(255,255,255,.018);}

/* Badges */
.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:100px;font-size:10.5px;font-weight:500;}
.badge-green{background:rgba(76,175,125,.14);color:var(--green);}
.badge-gold{background:rgba(200,146,74,.14);color:var(--gold);}
.badge-red{background:rgba(224,92,92,.14);color:var(--red);}
.badge-blue{background:rgba(92,155,224,.14);color:var(--blue);}
.badge-purple{background:rgba(155,127,232,.14);color:var(--purple);}
.badge-gray{background:rgba(168,164,156,.1);color:var(--ink3);}

/* Drop zone */
.drop-zone{border:2px dashed var(--border2);border-radius:var(--r2);padding:36px;text-align:center;cursor:pointer;transition:all .2s;}
.drop-zone:hover,.drop-zone.drag{border-color:var(--gold);background:rgba(200,146,74,.04);}

/* Progress */
.progress{height:3px;background:var(--border);border-radius:2px;overflow:hidden;}
.progress-bar{height:100%;background:var(--gold);border-radius:2px;transition:width .3s;}

/* AI */
.ai-output{background:var(--card2);border:1px solid var(--border2);border-radius:var(--r);padding:16px;font-size:12.5px;line-height:1.85;color:var(--ink2);white-space:pre-wrap;max-height:480px;overflow-y:auto;}
.ai-thinking{display:flex;align-items:center;gap:10px;color:var(--gold);font-size:13px;}
.dot-pulse{display:flex;gap:4px;}
.dot-pulse span{width:5px;height:5px;border-radius:50%;background:var(--gold);animation:pulse 1.2s ease-in-out infinite;}
.dot-pulse span:nth-child(2){animation-delay:.2s;}
.dot-pulse span:nth-child(3){animation-delay:.4s;}
@keyframes pulse{0%,80%,100%{opacity:.2;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}

/* Auth */
.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);background-image:radial-gradient(ellipse at 20% 50%,rgba(200,146,74,.06) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(76,175,125,.04) 0%,transparent 50%);}
.auth-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:38px;width:100%;max-width:400px;box-shadow:var(--shadow);}
.auth-logo{font-family:var(--ff);font-size:24px;font-weight:700;color:var(--gold);margin-bottom:5px;}
.auth-tagline{font-size:12.5px;color:var(--ink3);margin-bottom:28px;}
.auth-tabs{display:flex;background:var(--card2);border-radius:var(--r);padding:3px;margin-bottom:22px;}
.auth-tab{flex:1;padding:7px;border-radius:calc(var(--r) - 1px);text-align:center;font-size:13px;cursor:pointer;color:var(--ink3);transition:all .13s;border:none;background:none;font-family:var(--fb);}
.auth-tab.active{background:var(--card);color:var(--ink);font-weight:500;}
.auth-error{background:rgba(224,92,92,.1);border:1px solid rgba(224,92,92,.2);color:var(--red);padding:9px 12px;border-radius:var(--r);font-size:12px;margin-bottom:12px;}
.auth-success{background:rgba(76,175,125,.1);border:1px solid rgba(76,175,125,.2);color:var(--green);padding:9px 12px;border-radius:var(--r);font-size:12px;margin-bottom:12px;}
.auth-divider{text-align:center;color:var(--ink3);font-size:12px;margin:14px 0;position:relative;}
.auth-divider::before{content:'';position:absolute;top:50%;left:0;right:0;height:1px;background:var(--border);}
.auth-divider span{background:var(--card);padding:0 10px;position:relative;}

/* Page */
.page-header{margin-bottom:22px;}
.page-title{font-family:var(--ff);font-size:21px;font-weight:600;color:var(--ink);}
.page-sub{font-size:12.5px;color:var(--ink3);margin-top:2px;}
.divider{height:1px;background:var(--border);margin:18px 0;}
.empty-state{text-align:center;padding:56px 20px;color:var(--ink3);}
.empty-icon{font-size:36px;margin-bottom:10px;opacity:.4;}

/* Toast */
.toast-wrap{position:fixed;bottom:22px;right:22px;display:flex;flex-direction:column;gap:8px;z-index:9999;}
.toast{background:var(--card2);border:1px solid var(--border2);border-radius:var(--r);padding:11px 15px;font-size:13px;box-shadow:var(--shadow);display:flex;align-items:center;gap:9px;min-width:250px;animation:slideIn .2s ease;}
.toast-success{border-left:3px solid var(--green);}
.toast-error{border-left:3px solid var(--red);}
.toast-info{border-left:3px solid var(--gold);}
@keyframes slideIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}

/* Utils */
.flex{display:flex;}.items-center{align-items:center;}.justify-between{justify-content:space-between;}.flex-col{flex-direction:column;}
.gap-2{gap:8px;}.gap-3{gap:12px;}.gap-4{gap:16px;}
.mb-3{margin-bottom:12px;}.mb-4{margin-bottom:16px;}.mb-6{margin-bottom:24px;}.mt-3{margin-top:12px;}.mt-4{margin-top:16px;}
.text-gold{color:var(--gold);}.text-green{color:var(--green);}.text-red{color:var(--red);}
.text-muted{color:var(--ink3);font-size:12px;}
.mono{font-family:var(--fm);font-size:11.5px;}
.tag{display:inline-flex;align-items:center;padding:2px 8px;background:var(--card2);border:1px solid var(--border2);border-radius:100px;font-size:10.5px;color:var(--ink3);}
.spin{animation:spin 1s linear infinite;display:inline-block;}
@keyframes spin{to{transform:rotate(360deg)}}
.separator{height:1px;background:var(--border);margin:12px 0;}
`;

// ─── Icons ────────────────────────────────────────────────────────
const IC = ({ n, s = 16, c = "currentColor" }) => {
  const p = {
    dash: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    docs: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    upload: <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></>,
    ai: <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
    report: <><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    pdf: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    excel: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13l2 2 4-4" strokeWidth="1.5"/></>,
    contract: <><path d="M4 2h12l4 4v16H4V2z"/><path d="M14 2v4h4"/><path d="M8 10h8M8 14h8M8 18h4"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/></>,
    download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    refresh: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></>,
    users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {p[n]}
    </svg>
  );
};

// ─── Toast ────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);
  return { toasts, toast };
}
function Toasts({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === "success" && <IC n="check" s={13} c="var(--green)" />}
          {t.type === "error"   && <IC n="x"     s={13} c="var(--red)"   />}
          {t.type === "info"    && <IC n="bell"   s={13} c="var(--gold)"  />}
          <span style={{ color: "var(--ink)" }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────
function Dashboard({ user, docs, setPage }) {
  const name     = user?.user_metadata?.name || user?.email?.split("@")[0] || "there";
  const analyzed = docs.filter(d => d.status === "analyzed").length;
  const risks    = docs.filter(d => d.riskLevel === "high").length;
  const contracts= docs.filter(d => d.type === "contract").length;
  const typeC    = { pdf: "var(--red)", excel: "var(--green)", contract: "var(--blue)" };

  const stats = [
    { label: "Total Documents", val: docs.length, change: "All time", up: true, icon: "docs", color: "var(--gold)" },
    { label: "AI Analyzed", val: analyzed, change: docs.length ? `${Math.round(analyzed/docs.length*100)}% coverage` : "0%", up: true, icon: "ai", color: "var(--green)" },
    { label: "Contracts", val: contracts, change: "Tracked", up: true, icon: "contract", color: "var(--blue)" },
    { label: "Risk Flags", val: risks, change: risks > 0 ? "Review needed" : "All clear", up: risks === 0, icon: "alert", color: risks > 0 ? "var(--red)" : "var(--green)" },
  ];

  const features = [
    { icon: "ai",     label: "Shadow Reviewer",    desc: "ASC 842/606 real-time coaching for junior staff",  color: "var(--purple)" },
    { icon: "docs",   label: "Document Extraction", desc: "Template-free AI extraction from any format",      color: "var(--gold)"   },
    { icon: "report", label: "Narrative Generator", desc: "Auto-draft MD&A and flux commentary",              color: "var(--blue)"   },
    { icon: "alert",  label: "Anomaly Detection",   desc: "Flag unusual transactions and patterns proactively",color: "var(--red)"   },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Good morning, {name} 👋</div>
        <div className="page-sub">Your financial intelligence overview</div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="stat-label">{s.label}</div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IC n={s.icon} s={15} c={s.color} />
              </div>
            </div>
            <div className="stat-val">{s.val}</div>
            <div className={`stat-change ${s.up ? "stat-up" : "stat-down"}`}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Recent docs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="card-title">Recent Documents</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage("documents")}>View all</button>
          </div>
          {docs.length === 0 ? (
            <div className="empty-state" style={{ padding: "28px 0" }}>
              <div className="empty-icon">📄</div>
              <div style={{ fontSize: 13, color: "var(--ink2)", marginBottom: 6 }}>No documents yet</div>
              <button className="btn btn-primary btn-sm" onClick={() => setPage("documents")}><IC n="upload" s={12} /> Upload first file</button>
            </div>
          ) : docs.slice(0, 6).map(d => (
            <div key={d.id} className="flex items-center gap-3" style={{ padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 30, height: 30, borderRadius: 6, background: `${typeC[d.type]||"var(--gold)"}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IC n={d.type === "excel" ? "excel" : d.type === "contract" ? "contract" : "pdf"} s={13} c={typeC[d.type]||"var(--gold)"} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink3)" }}>{new Date(d.uploadedAt).toLocaleDateString()}</div>
              </div>
              <span className={`badge badge-${d.status === "analyzed" ? "green" : d.status === "error" ? "red" : "gold"}`}>{d.status}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="card">
          <div className="card-title mb-4">AI Capabilities</div>
          {features.map((f, i) => (
            <div key={i} className="flex gap-3" style={{ padding: "10px 0", borderBottom: i < features.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${f.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IC n={f.icon} s={15} c={f.color} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{f.label}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink3)", marginTop: 1 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Documents ────────────────────────────────────────────────────
function DocumentsPage({ user, docs, setDocs, toast, setPage, setSelectedDoc }) {
  const [drag, setDrag]     = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busy, setBusy]     = useState(false);
  const fileRef = useRef();
  const userId = user.id;

  const getType = name => name.match(/\.(xlsx|xls|csv)$/i) ? "excel" : name.match(/\.(doc|docx)$/i) ? "contract" : "pdf";

  const handleFiles = async (files) => {
    setBusy(true);
    for (const file of Array.from(files)) {
      if (file.size > 52_428_800) { toast(`${file.name} exceeds 50MB limit`, "error"); continue; }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const doc = { id, name: file.name, type: getType(file.name), size: file.size, status: "uploading", uploadedAt: new Date().toISOString(), analysis: null, riskLevel: null };
      docStore.add(userId, doc);
      setDocs(docStore.get(userId));
      try {
        await new Promise(r => setTimeout(r, 600)); // simulate upload
        const reader = new FileReader();
        const dataUrl = await new Promise((res, rej) => { reader.onload = e => res(e.target.result); reader.onerror = rej; reader.readAsDataURL(file); });
        const base64 = dataUrl.split(",")[1];
        docStore.update(userId, id, { status: "pending", fileData: { data: base64, mimeType: file.type || "application/pdf" } });
        setDocs(docStore.get(userId));
        toast(`${file.name} uploaded`, "success");
      } catch {
        docStore.update(userId, id, { status: "error" });
        setDocs(docStore.get(userId));
        toast(`Failed: ${file.name}`, "error");
      }
    }
    setBusy(false);
  };

  const del = id => { docStore.remove(userId, id); setDocs(docStore.get(userId)); toast("Deleted", "info"); };

  const openAI = doc => { setSelectedDoc(doc); setPage("analyze"); };

  const typeC = { pdf: "var(--red)", excel: "var(--green)", contract: "var(--blue)" };

  const filtered = docs
    .filter(d => filter === "all" || d.type === filter || d.status === filter)
    .filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between page-header">
        <div>
          <div className="page-title">Documents</div>
          <div className="page-sub">{docs.length} files · {docs.filter(d => d.status === "analyzed").length} analyzed</div>
        </div>
        <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={busy}>
          <IC n="upload" s={14} /> Upload Files
        </button>
        <input ref={fileRef} type="file" multiple accept=".pdf,.xlsx,.xls,.csv,.doc,.docx" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* Drop zone */}
      <div className={`drop-zone mb-6${drag ? " drag" : ""}`}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--card2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <IC n="upload" s={20} c="var(--gold)" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", marginBottom: 5 }}>
          {busy ? "Processing..." : "Drop files or click to upload"}
        </div>
        <div className="text-muted">PDF · Excel (.xlsx, .csv) · Word (.doc) — max 50MB each</div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4" style={{ flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <IC n="search" s={13} c="var(--ink3)" />
          </span>
          <input className="input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 30, width: 200 }} />
        </div>
        {["all", "pdf", "excel", "contract", "analyzed", "pending"].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`} onClick={() => setFilter(f)} style={{ textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <div style={{ color: "var(--ink2)", fontSize: 13 }}>No documents found</div>
          </div>
        ) : (
          <table className="table">
            <thead><tr>
              <th>Document</th><th>Type</th><th>Size</th><th>Uploaded</th><th>Status</th><th>Risk</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{ width: 28, height: 28, borderRadius: 5, background: `${typeC[d.type]||"var(--gold)"}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IC n={d.type === "excel" ? "excel" : d.type === "contract" ? "contract" : "pdf"} s={12} c={typeC[d.type]||"var(--gold)"} />
                      </div>
                      <span style={{ color: "var(--ink)", fontWeight: 500, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", fontSize: 13 }}>{d.name}</span>
                    </div>
                  </td>
                  <td><span className="tag" style={{ textTransform: "uppercase", fontSize: 9.5 }}>{d.type}</span></td>
                  <td className="mono">{d.size ? (d.size/1024).toFixed(0)+" KB" : "—"}</td>
                  <td style={{ fontSize: 12 }}>{new Date(d.uploadedAt).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${d.status==="analyzed"?"green":d.status==="error"?"red":d.status==="uploading"?"blue":"gold"}`}>
                    {d.status === "uploading" && <span className="spin">↻</span>} {d.status}
                  </span></td>
                  <td>{d.riskLevel ? <span className={`badge badge-${d.riskLevel==="high"?"red":d.riskLevel==="medium"?"gold":"green"}`}>{d.riskLevel}</span> : <span style={{ color: "var(--ink3)" }}>—</span>}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-sm btn-icon" title="Analyze" onClick={() => openAI(d)}><IC n="ai" s={13} /></button>
                      <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => del(d.id)}><IC n="trash" s={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── AI Analysis ──────────────────────────────────────────────────
function AnalyzePage({ user, docs, setDocs, toast, selectedDoc, setSelectedDoc }) {
  const [docId,    setDocId]    = useState(selectedDoc?.id || "");
  const [mode,     setMode]     = useState("extract");
  const [output,   setOutput]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [question, setQuestion] = useState("");

  useEffect(() => { if (selectedDoc) { setDocId(selectedDoc.id); setOutput(selectedDoc.analysis || ""); } }, [selectedDoc]);

  const currentDoc = docs.find(d => d.id === docId);

  const MODES = [
    { id: "extract",   label: "Extract Data",       icon: "docs",   color: "var(--gold)",   prompt: (n,t) => `You are an expert financial analyst. Analyze this ${t} document: "${n}".\n\nExtract ALL financial data:\n- Key figures (revenues, expenses, assets, liabilities)\n- Dates and periods\n- Parties involved\n- Payment terms and amounts\n- Critical clauses or conditions\n- Missing or anomalous items\n\nFormat with clear sections. End with: RISK ASSESSMENT: LOW / MEDIUM / HIGH and why.` },
    { id: "shadow",    label: "Shadow Review",       icon: "ai",     color: "var(--purple)", prompt: (n,t) => `You are an AI Shadow Reviewer — an expert accounting tutor reviewing "${n}" (${t}).\n\nProvide:\n1. ACCOUNTING TREATMENT (GAAP/IFRS)\n2. APPLICABLE ASC STANDARDS (842 leases, 606 revenue, etc.)\n3. COMMON JUNIOR MISTAKES to avoid\n4. STEP-BY-STEP accounting walkthrough\n5. AUDIT FOCUS AREAS\n6. EDUCATIONAL TIPS for junior staff\n\nWrite as a teaching document, not just a review.` },
    { id: "risk",      label: "Risk Analysis",       icon: "alert",  color: "var(--red)",    prompt: (n,t) => `Perform a comprehensive risk analysis of "${n}" (${t}).\n\nAnalyze:\n1. FINANCIAL RISKS — exposure, concentration\n2. COMPLIANCE RISKS — regulatory gaps\n3. CONTRACTUAL RISKS — unfavorable terms\n4. FRAUD INDICATORS — red flags\n\nFor each risk: Severity (CRITICAL/HIGH/MEDIUM/LOW) + Likelihood + Mitigation.\nEnd with: OVERALL RISK SCORE (1-10) + justification.` },
    { id: "summary",   label: "Executive Summary",   icon: "report", color: "var(--blue)",   prompt: (n,t) => `Create a concise executive summary of "${n}" (${t}) for a CFO.\n\n1. DOCUMENT OVERVIEW (2-3 sentences)\n2. KEY FINANCIAL HIGHLIGHTS (bullets with numbers)\n3. CRITICAL DATES & DEADLINES\n4. RISKS & CONCERNS\n5. RECOMMENDED ACTIONS\n\nBe direct and actionable.` },
    { id: "narrative", label: "MD&A Narrative",      icon: "report", color: "var(--green)",  prompt: (n,t) => `Generate a Management Discussion & Analysis (MD&A) narrative for "${n}" (${t}).\n\nInclude:\n1. RESULTS OF OPERATIONS — period analysis\n2. REVENUE DRIVERS\n3. COST ANALYSIS — key expense trends\n4. LIQUIDITY & CAPITAL\n5. FORWARD-LOOKING STATEMENTS\n\nWrite in professional MD&A style ready for regulatory filing.` },
  ];

  const run = async () => {
    if (!currentDoc) return;
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setOutput("⚠️ Gemini API key not configured.\n\nAdd VITE_GEMINI_API_KEY to Netlify → Site Settings → Environment Variables.");
      return;
    }
    setLoading(true); setOutput("");
    try {
      const m = MODES.find(x => x.id === mode);
      const result = await gemini.analyze(m.prompt(currentDoc.name, currentDoc.type), currentDoc.fileData);
      setOutput(result);
      const rl = result.match(/risk.*?:\s*(critical|high|medium|low)/i)?.[1]?.toLowerCase() || "medium";
      docStore.update(user.id, docId, { status: "analyzed", analysis: result, riskLevel: rl, analyzedAt: new Date().toISOString() });
      setDocs(docStore.get(user.id));
      toast("Analysis complete ✓", "success");
    } catch (e) {
      setOutput(`Error: ${e.message}`);
      toast("Analysis failed", "error");
    }
    setLoading(false);
  };

  const ask = async () => {
    if (!question.trim() || !currentDoc) return;
    setLoading(true);
    try {
      const prompt = `Document: "${currentDoc.name}"\nPrevious analysis:\n${output || "None"}\n\nUser question: ${question}\n\nAnswer specifically and accurately based on the document.`;
      const result = await gemini.analyze(prompt, currentDoc.fileData);
      setOutput(p => `${p}\n\n── Q: ${question} ──\n${result}`);
      setQuestion("");
    } catch { toast("Failed", "error"); }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">AI Analysis</div>
        <div className="page-sub">Gemini 1.5 Flash — free tier · no extra cost</div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-title mb-3">Select Document</div>
            <select className="input select" value={docId} onChange={e => { setDocId(e.target.value); setOutput(""); setSelectedDoc(null); }}>
              <option value="">— Choose a document —</option>
              {docs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {currentDoc && (
              <div className="flex gap-2 mt-3">
                <span className="tag" style={{ textTransform: "uppercase", fontSize: 9.5 }}>{currentDoc.type}</span>
                <span className={`badge badge-${currentDoc.status==="analyzed"?"green":"gold"}`}>{currentDoc.status}</span>
                {currentDoc.riskLevel && <span className={`badge badge-${currentDoc.riskLevel==="high"?"red":currentDoc.riskLevel==="medium"?"gold":"green"}`}>{currentDoc.riskLevel} risk</span>}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title mb-3">Analysis Mode</div>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: "var(--r)", border: `1px solid ${mode===m.id?"var(--gold)":"var(--border)"}`, background: mode===m.id?"rgba(200,146,74,.07)":"transparent", cursor: "pointer", width: "100%", marginBottom: 6, transition: "all .13s" }}>
                <IC n={m.icon} s={14} c={mode===m.id ? m.color : "var(--ink3)"} />
                <span style={{ fontSize: 12.5, color: mode===m.id ? "var(--gold)" : "var(--ink2)", fontWeight: mode===m.id?500:400, fontFamily:"var(--fb)" }}>{m.label}</span>
              </button>
            ))}
          </div>

          <button className="btn btn-primary" onClick={run} disabled={!docId||loading} style={{ justifyContent: "center", width: "100%", padding: "11px" }}>
            {loading ? <><span className="spin">↻</span> Analyzing...</> : <><IC n="ai" s={14} /> Run Analysis</>}
          </button>

          {output && !loading && (
            <div className="card">
              <div className="card-title mb-3" style={{ fontSize: 13 }}>Ask a Question</div>
              <input className="input" placeholder="e.g. What are the payment terms?" value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key==="Enter" && ask()} />
              <button className="btn btn-ghost btn-sm mt-3" onClick={ask} disabled={!question||loading}>
                <IC n="search" s={12} /> Ask Gemini
              </button>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="card" style={{ minHeight: 520 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="card-title">Output</div>
            {output && (
              <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(output); toast("Copied", "success"); }}>
                <IC n="copy" s={12} /> Copy
              </button>
            )}
          </div>
          {loading && <div className="ai-thinking mb-4"><div className="dot-pulse"><span/><span/><span/></div><span>Gemini is analyzing...</span></div>}
          {!output && !loading && (
            <div className="empty-state" style={{ padding: "56px 0" }}>
              <div className="empty-icon">🤖</div>
              <div style={{ color: "var(--ink2)", fontSize: 13 }}>Select a document and run analysis</div>
              <div className="text-muted mt-3">Gemini will extract, review, and explain your financial data</div>
            </div>
          )}
          {output && <div className="ai-output">{output}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────
function ReportsPage({ user, docs, toast }) {
  const [type,   setType]   = useState("monthly");
  const [output, setOutput] = useState("");
  const [busy,   setBusy]   = useState(false);
  const analyzed = docs.filter(d => d.status === "analyzed");

  const TYPES = [
    { id: "monthly", label: "Monthly Close Report",  desc: "Full summary for CFO review" },
    { id: "risk",    label: "Risk Assessment",        desc: "Risk matrix and mitigations" },
    { id: "audit",   label: "Audit Readiness",        desc: "Pre-audit checklist" },
  ];

  const generate = async () => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) { toast("Configure VITE_GEMINI_API_KEY first", "error"); return; }
    if (analyzed.length === 0) { toast("Analyze documents first", "error"); return; }
    setBusy(true); setOutput("");
    const ctx = analyzed.map(d => `• ${d.name} (${d.type}, ${d.riskLevel||"?"} risk):\n${(d.analysis||"").slice(0,600)}`).join("\n\n");
    const prompts = {
      monthly: `Generate a Monthly Financial Close Report from ${analyzed.length} analyzed documents:\n\n${ctx}\n\nStructure: Executive Summary → Key Metrics → Document Analysis → Risk Flags → Recommendations → Next Steps. Ready for CFO.`,
      risk:    `Generate a Risk Assessment Report from ${analyzed.length} documents:\n\n${ctx}\n\nInclude: Risk Matrix, Top Risks by severity, Mitigations, Action items with owners and deadlines.`,
      audit:   `Generate an Audit Readiness Report from ${analyzed.length} documents:\n\n${ctx}\n\nInclude: Documentation completeness checklist, Missing items, Compliance gaps, Pre-audit action plan.`,
    };
    try {
      const result = await gemini.analyze(prompts[type]);
      setOutput(result);
      toast("Report generated ✓", "success");
    } catch { toast("Generation failed", "error"); }
    setBusy(false);
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `ExFinAnalyze-${type}-${new Date().toISOString().slice(0,10)}.txt`;
    a.click(); URL.revokeObjectURL(url);
    toast("Downloaded", "success");
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Reports & Narratives</div>
        <div className="page-sub">AI-generated financial reports from your analyzed documents</div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-title mb-3">Report Type</div>
            {TYPES.map(r => (
              <button key={r.id} onClick={() => setType(r.id)}
                style={{ display: "flex", gap: 12, padding: "11px", borderRadius: "var(--r)", border: `1px solid ${type===r.id?"var(--gold)":"var(--border)"}`, background: type===r.id?"rgba(200,146,74,.07)":"transparent", cursor: "pointer", textAlign: "left", width: "100%", marginBottom: 8, transition: "all .13s" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: type===r.id?"var(--gold)":"var(--border2)", marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: type===r.id?"var(--gold)":"var(--ink)", fontFamily: "var(--fb)" }}>{r.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink3)", marginTop: 1 }}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="card">
            <div className="card-title mb-2">Data Sources</div>
            <div className="card-sub mb-3">{analyzed.length} / {docs.length} documents ready</div>
            <div className="progress mb-2"><div className="progress-bar" style={{ width: `${docs.length?analyzed.length/docs.length*100:0}%` }} /></div>
            <div className="text-muted">{docs.length-analyzed.length} pending analysis</div>
          </div>

          <button className="btn btn-primary" onClick={generate} disabled={busy||analyzed.length===0} style={{ justifyContent: "center", width: "100%", padding: "11px" }}>
            {busy ? <><span className="spin">↻</span> Generating...</> : <><IC n="report" s={14} /> Generate Report</>}
          </button>

          {output && <button className="btn btn-ghost" onClick={download} style={{ justifyContent: "center", width: "100%" }}><IC n="download" s={13} /> Download .txt</button>}
        </div>

        <div className="card" style={{ minHeight: 480 }}>
          <div className="card-title mb-4">Generated Report</div>
          {busy && <div className="ai-thinking mb-4"><div className="dot-pulse"><span/><span/><span/></div><span>Compiling report...</span></div>}
          {!output && !busy && (
            <div className="empty-state" style={{ padding: "56px 0" }}>
              <div className="empty-icon">📊</div>
              <div style={{ color: "var(--ink2)", fontSize: 13 }}>Select type and generate</div>
            </div>
          )}
          {output && <div className="ai-output">{output}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────
function SettingsPage({ user, toast }) {
  const meta = user?.user_metadata || {};
  const [form, setForm] = useState({ name: meta.name || "", role: meta.role || "analyst" });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    const { error } = await supabase.auth.updateUser({ data: { name: form.name, role: form.role } });
    if (error) { toast(error.message, "error"); return; }
    toast("Profile updated ✓", "success");
  };

  const clearDocs = () => {
    localStorage.removeItem(`exfin_docs_${user.id}`);
    toast("Documents cleared", "info");
    setTimeout(() => window.location.reload(), 800);
  };

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-sub">Manage your profile and configuration</div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-title mb-4">Profile</div>
            <div className="input-group">
              <div className="input-label">Full Name</div>
              <input className="input" value={form.name} onChange={set("name")} placeholder="Your name" />
            </div>
            <div className="input-group">
              <div className="input-label">Email</div>
              <input className="input" value={user.email} disabled />
            </div>
            <div className="input-group">
              <div className="input-label">Role</div>
              <select className="input select" value={form.role} onChange={set("role")}>
                <option value="analyst">Financial Analyst</option>
                <option value="accountant">Accountant</option>
                <option value="auditor">Auditor</option>
                <option value="manager">Finance Manager</option>
                <option value="cfo">CFO / Director</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={save}><IC n="check" s={13} /> Save Changes</button>
          </div>

          <div className="card" style={{ borderColor: "rgba(224,92,92,.2)" }}>
            <div className="card-title mb-2" style={{ color: "var(--red)" }}>Danger Zone</div>
            <div className="card-sub mb-4">Clear all locally stored documents</div>
            <button className="btn btn-danger" onClick={clearDocs}><IC n="trash" s={13} /> Clear All Documents</button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-title mb-3">AI Configuration</div>
            <div className="card-sub mb-3">Gemini API is loaded from environment variables</div>
            <div style={{ background: "var(--card2)", border: "1px solid var(--border2)", borderRadius: "var(--r)", padding: "12px 14px", fontFamily: "var(--fm)", fontSize: 12 }}>
              <span style={{ color: "var(--ink3)" }}>VITE_GEMINI_API_KEY</span><br />
              <span style={{ color: apiKey ? "var(--green)" : "var(--red)" }}>
                {apiKey ? "●●●●●●●●●●●● (configured ✓)" : "NOT SET — add in Netlify ⚠️"}
              </span>
            </div>
            {!apiKey && (
              <div style={{ fontSize: 12, color: "var(--ink3)", marginTop: 10, lineHeight: 1.7 }}>
                Go to <strong style={{ color: "var(--ink2)" }}>Netlify → Site Settings → Environment Variables</strong> and add:<br />
                <code style={{ background: "var(--card2)", padding: "1px 6px", borderRadius: 3, color: "var(--gold)" }}>VITE_GEMINI_API_KEY</code>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title mb-3">Account Info</div>
            {[
              { label: "User ID",      val: user.id.slice(0,16)+"..." },
              { label: "Email",        val: user.email },
              { label: "Role",         val: meta.role || "—" },
              { label: "Auth Provider",val: "Supabase" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--ink3)" }}>{item.label}</span>
                <span className="mono" style={{ color: "var(--ink2)", fontSize: 11 }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────
export default function App() {
  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState("dashboard");
  const [docs,        setDocs]        = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const { toasts, toast } = useToast();

  // Inject CSS
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load docs
  useEffect(() => {
    if (user) setDocs(docStore.get(user.id));
  }, [user]);

  const logout = async () => {
    await supabase.auth.signOut();
    setPage("dashboard");
    setDocs([]);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", color: "var(--ink3)", fontFamily: "var(--fb)" }}>
      <span className="spin" style={{ marginRight: 10, fontSize: 18 }}>↻</span> Loading...
    </div>
  );

  if (!user) return <><AuthScreen onLogin={u => { setUser(u); setDocs(docStore.get(u.id)); }} /><Toasts toasts={toasts} /></>;

  const meta     = user.user_metadata || {};
  const name     = meta.name || user.email?.split("@")[0] || "User";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
  const pending  = docs.filter(d => d.status === "pending").length;

  const NAV = [
    { id: "dashboard", label: "Dashboard",  icon: "dash"     },
    { id: "documents", label: "Documents",  icon: "docs",  badge: pending || null },
    { id: "analyze",   label: "AI Analysis",icon: "ai"       },
    { id: "reports",   label: "Reports",    icon: "report"   },
    { id: "settings",  label: "Settings",   icon: "settings" },
  ];

  return (
    <div className="app">
      {/* CSS custom props bootstrap */}
      <style>{`:root{--bg:#0C0E0D;}`}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">ExFinAnalyze</div>
          <div className="logo-sub">Financial Intelligence</div>
        </div>
        <nav className="nav">
          <div className="nav-section">Workspace</div>
          {NAV.map(item => (
            <button key={item.id} className={`nav-item${page===item.id?" active":""}`} onClick={() => setPage(item.id)}>
              <IC n={item.icon} s={14} />
              {item.label}
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="user-area">
          <div className="user-card" onClick={() => setPage("settings")}>
            <div className="avatar">{initials}</div>
            <div>
              <div className="user-name">{name}</div>
              <div className="user-role" style={{ textTransform: "capitalize" }}>{meta.role || "User"}</div>
            </div>
          </div>
          <button className="nav-item" style={{ marginTop: 4, color: "var(--ink3)" }} onClick={logout}>
            <IC n="logout" s={13} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div style={{ flex: 1, fontFamily: "var(--ff)", fontSize: 14, fontWeight: 600, color: "var(--ink)", textTransform: "capitalize" }}>{page}</div>
          <div className="flex items-center gap-3">
            {import.meta.env.VITE_GEMINI_API_KEY
              ? <span className="badge badge-green"><IC n="check" s={9} c="var(--green)" /> Gemini Active</span>
              : <span className="badge badge-red"><IC n="alert" s={9} c="var(--red)" /> API Key Missing</span>
            }
            <div className="avatar" style={{ width: 26, height: 26, fontSize: 10, cursor: "pointer" }} onClick={() => setPage("settings")}>{initials}</div>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          {page === "dashboard" && <Dashboard  user={user} docs={docs} setPage={setPage} />}
          {page === "documents" && <DocumentsPage user={user} docs={docs} setDocs={setDocs} toast={toast} setPage={setPage} setSelectedDoc={setSelectedDoc} />}
          {page === "analyze"   && <AnalyzePage   user={user} docs={docs} setDocs={setDocs} toast={toast} selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} />}
          {page === "reports"   && <ReportsPage   user={user} docs={docs} toast={toast} />}
          {page === "settings"  && <SettingsPage  user={user} toast={toast} />}
        </div>
      </main>

      <Toasts toasts={toasts} />
    </div>
  );
}
