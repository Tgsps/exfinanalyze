import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";
import AuthScreen from "./AuthScreen";

/* ═══════════════════════════════════════════════════════════════════
   EXFINANALYZE — Production SaaS Platform
   Auth: Supabase Auth (real backend)
   AI:   Gemini 2.0 Flash via VITE_GEMINI_API_KEY
   Docs: Supabase Storage + local fallback
   Design: Dark editorial-financial
═══════════════════════════════════════════════════════════════════ */

// ─── Excel to Text Parser (ExcelJS — no CDN, no supply-chain risk) ──
async function excelToText(base64Data) {
  try {
    const ExcelJS = (await import("exceljs")).default;
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(bytes.buffer);
    let text = "";
    workbook.eachSheet((sheet) => {
      text += `\n=== Sheet: ${sheet.name} ===\n`;
      sheet.eachRow((row) => {
        text += (row.values.slice(1).map(v => v ?? "")).join(",") + "\n";
      });
    });
    return text.slice(0, 30000);
  } catch {
    return "[Excel file — could not parse content]";
  }
}

// ─── Gemini Service ───────────────────────────────────────────────
// API key is kept server-side in the Supabase Edge Function.
// Client sends the user JWT; the function verifies auth before calling Gemini.
const SUPPORTED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif", "text/plain"];

const gemini = {
  async analyze(prompt, fileData = null) {
    const parts = [{ text: prompt }];

    if (fileData) {
      const mime = fileData.mimeType || "";
      const isExcel = mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv");
      const isWord  = mime.includes("wordprocessing") || mime.includes("msword");

      if (isExcel) {
        const csvText = await excelToText(fileData.data);
        parts[0] = { text: `${prompt}\n\nFile contents (Excel/CSV):\n${csvText}` };
      } else if (isWord) {
        parts[0] = { text: `${prompt}\n\n[Word document uploaded — analyze based on filename and context]` };
      } else if (SUPPORTED_MIME.includes(mime) || mime.startsWith("image/")) {
        parts.unshift({ inlineData: { mimeType: mime, data: fileData.data } });
      } else {
        parts[0] = { text: `${prompt}\n\n[File uploaded: ${mime}]` };
      }
    }

    const session = (await supabase.auth.getSession()).data.session;
    if (!session) throw new Error("Not authenticated");

    const res = await fetch("/.netlify/functions/ai-analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { maxOutputTokens: 2048 } }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error || "AI service error");
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
    folder: <><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></>,
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
  const name = user?.user_metadata?.name || user?.email?.split("@")[0] || "there";
  const balPts = [82,75,88,70,90,85,95,88,100,92,108,100,115,112,120,118,125].map((v,i,a) => `${(i/(a.length-1))*100},${100-v*0.7}`).join(" ");

  const txns = [
    { symbol:"AAPL",              action:"Buy",  amount:"-$5,000.00",  color:"var(--red)"   },
    { symbol:"SBUX",              action:"Buy",  amount:"-$1,250.00",  color:"var(--red)"   },
    { symbol:"Transfer to Savings",action:"",   amount:"-$1,000.00",  color:"var(--red)"   },
  ];
  const markets = [
    { name:"ETH/USD",  price:"$8,450.00",  change:"-1.8%",  up:false },
    { name:"SOL",      price:"4,980.50",   change:"+0.41%", up:true  },
    { name:"NASDAQ",   price:"17,230.00",  change:"+0.81%", up:true  },
  ];
  const aiInsights = [
    "Portfolio Optimization suggested for increased yield.",
    "New AI stock picks available based on predictive analytics.",
    "Unusual spending pattern detected in transaction history.",
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Portfolio Command Center</div>
        <div className="page-sub">{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
      </div>

      <div className="grid-2 mb-4">
        {/* Total Balance */}
        <div className="card">
          <div className="card-title mb-1">Total Balance</div>
          <div style={{fontFamily:"var(--fm)",fontSize:36,fontWeight:700,color:"var(--ink)",letterSpacing:"-0.03em",marginBottom:4}}>$124,567.89</div>
          <div style={{fontSize:12,color:"var(--green)",marginBottom:14}}>▲ +12.5% this month</div>
          <svg width="100%" height="56" viewBox="0 0 100 56" preserveAspectRatio="none">
            <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--green)" stopOpacity=".22"/>
                <stop offset="100%" stopColor="var(--green)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <polygon points={`0,56 ${balPts} 100,56`} fill="url(#balGrad)"/>
            <polyline points={balPts} fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* AI Assistant */}
        <div className="card">
          <div className="card-title mb-3">AI Assistant</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {aiInsights.map((ins,i) => (
              <div key={i} style={{display:"flex",gap:10,padding:"9px 11px",background:"var(--card2)",borderRadius:"var(--r)",border:"1px solid var(--border2)"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"var(--gold)",flexShrink:0,marginTop:5}}/>
                <span style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.5}}>{ins}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="card-title">Recent Transactions</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage("documents")}>View all</button>
          </div>
          {txns.map((t,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:i<txns.length-1?"1px solid var(--border)":"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:"var(--card2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"var(--ink2)",fontFamily:"var(--fm)",flexShrink:0}}>
                  {t.symbol.slice(0,2)}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--ink)"}}>{t.symbol}</div>
                  {t.action && <div style={{fontSize:11,color:"var(--ink3)"}}>{t.action}</div>}
                </div>
              </div>
              <span style={{fontSize:13,fontWeight:600,color:t.color,fontFamily:"var(--fm)"}}>{t.amount}</span>
            </div>
          ))}
        </div>

        {/* Market Overview */}
        <div className="card">
          <div className="card-title mb-3">Market Overview</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {markets.map((m,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:"var(--card2)",borderRadius:"var(--r)",border:"1px solid var(--border2)"}}>
                <span style={{fontSize:13,fontWeight:600,color:"var(--ink)",fontFamily:"var(--fb)"}}>{m.name}</span>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--ink)",fontFamily:"var(--fm)"}}>{m.price}</div>
                  <div style={{fontSize:11,color:m.up?"var(--green)":"var(--red)",fontFamily:"var(--fm)"}}>{m.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Market ───────────────────────────────────────────────────────
function MarketPage() {
  const candles = Array.from({length:30},(_,i) => {
    const base = 30000 + Math.sin(i*0.4)*5000 + i*200;
    const open  = base + (Math.random()-0.5)*2000;
    const close = base + (Math.random()-0.5)*2000;
    return { open, close, high:Math.max(open,close)+Math.random()*800, low:Math.min(open,close)-Math.random()*800 };
  });
  const minP = Math.min(...candles.map(c=>c.low));
  const maxP = Math.max(...candles.map(c=>c.high));
  const rng  = maxP - minP;
  const toY  = p => ((maxP-p)/rng)*130;
  const toX  = i => (i/(candles.length-1))*390;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Neural Market Analysis</div>
        <div className="page-sub">AI-powered trade signals and sentiment scoring</div>
      </div>

      {/* Ticker bar */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        {[{n:"BTC",p:"$19,496",c:"+2.14%",up:true},{n:"ETH",p:"$1,210.95",c:"-0.95%",up:false},{n:"S&P 500",p:"4,402.20",c:"+0.46%",up:true},{n:"NASDAQ",p:"12,890.40",c:"+0.71%",up:true}].map((t,i) => (
          <div key={i} style={{display:"flex",gap:8,alignItems:"center",padding:"5px 12px",background:"var(--card2)",borderRadius:"var(--r)",border:"1px solid var(--border2)"}}>
            <span style={{fontSize:11.5,fontWeight:700,color:"var(--ink)",fontFamily:"var(--fb)"}}>{t.n}</span>
            <span style={{fontSize:12,fontFamily:"var(--fm)",color:"var(--ink)"}}>{t.p}</span>
            <span style={{fontSize:11,color:t.up?"var(--green)":"var(--red)",fontFamily:"var(--fm)"}}>{t.c}</span>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Candlestick */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="card-title">BTC/USD Neural Analysis</div>
              <div style={{display:"flex",gap:6}}>
                {["1D","1W","1M","3M"].map(p => (
                  <button key={p} style={{padding:"4px 10px",borderRadius:"var(--r)",border:`1px solid ${p==="1M"?"var(--gold)":"var(--border)"}`,background:p==="1M"?"rgba(200,146,74,.1)":"transparent",color:p==="1M"?"var(--gold)":"var(--ink3)",fontSize:11,cursor:"pointer"}}>{p}</button>
                ))}
              </div>
            </div>
            <svg width="100%" height="140" viewBox="0 0 400 140" preserveAspectRatio="xMidYMid meet">
              {candles.map((c,i) => {
                const x = toX(i);
                const up = c.close >= c.open;
                const col = up ? "#4CAF7D" : "#E05C5C";
                const bTop = toY(Math.max(c.open,c.close));
                const bH   = Math.max(2, Math.abs(toY(c.open)-toY(c.close)));
                return (
                  <g key={i}>
                    <line x1={x} y1={toY(c.high)} x2={x} y2={toY(c.low)} stroke={col} strokeWidth="0.8" opacity=".7"/>
                    <rect x={x-4} y={bTop} width="8" height={bH} fill={col} opacity=".9" rx="0.5"/>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Sentiment gauge */}
          <div className="card" style={{textAlign:"center"}}>
            <div className="card-title mb-3">Neural Sentiment</div>
            <div style={{position:"relative",width:180,height:90,margin:"0 auto 12px"}}>
              <svg width="180" height="90" viewBox="0 0 180 90">
                <path d="M 14 88 A 76 76 0 0 1 166 88" fill="none" stroke="var(--border)" strokeWidth="14" strokeLinecap="round"/>
                <path d="M 14 88 A 76 76 0 0 1 166 88" fill="none" stroke="var(--green)" strokeWidth="14" strokeLinecap="round" strokeDasharray="238" strokeDashoffset="30"/>
                <text x="90" y="68" textAnchor="middle" fontFamily="var(--fm)" fontSize="24" fontWeight="700" fill="var(--green)">89.5</text>
                <text x="90" y="84" textAnchor="middle" fontFamily="var(--fb)" fontSize="9" fill="var(--ink3)">/100</text>
              </svg>
            </div>
            <div style={{fontSize:15,fontWeight:700,color:"var(--green)",letterSpacing:"0.06em",marginBottom:4}}>VERY BULLISH</div>
            <div style={{fontSize:12,color:"var(--ink3)"}}>AI Model Consensus: Positive Momentum</div>
          </div>
        </div>

        {/* AI Trade Recommendation */}
        <div className="card" style={{alignSelf:"start"}}>
          <div className="card-title mb-4">AI Trade Recommendation</div>
          <div style={{background:"rgba(76,175,125,.08)",border:"1px solid rgba(76,175,125,.2)",borderRadius:"var(--r)",padding:"12px",marginBottom:16,textAlign:"center"}}>
            <div style={{fontSize:10,color:"var(--green)",fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Signal</div>
            <div style={{fontSize:18,fontWeight:700,color:"var(--green)",fontFamily:"var(--fm)"}}>BUY BTC/USD</div>
          </div>
          {[
            {label:"Confidence Score",val:"87/100",   color:"var(--green)"},
            {label:"Entry Price",     val:"$30,450",  color:"var(--ink)"  },
            {label:"Target",          val:"$41,000",  color:"var(--green)"},
            {label:"Stop Loss",       val:"$27,500",  color:"var(--red)"  },
          ].map((r,i) => (
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<3?"1px solid var(--border)":"none"}}>
              <span style={{fontSize:12,color:"var(--ink3)"}}>{r.label}</span>
              <span style={{fontSize:12,fontWeight:600,color:r.color,fontFamily:"var(--fm)"}}>{r.val}</span>
            </div>
          ))}
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:16,padding:"10px"}}>
            Execute Trade ↓
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Security ─────────────────────────────────────────────────────
function SecurityPage({ toast }) {
  const [biometric, setBiometric] = useState(true);

  const sessions = [
    {device:"MacBook Pro",   location:"New York, USA",  time:"Today, 10:42 AM",      current:true  },
    {device:"iPhone 14 Pro", location:"London, UK",     time:"Yesterday, 3:15 PM",   current:false },
    {device:"Windows PC",    location:"Tokyo, Japan",   time:"2 days ago, 11:20 AM", current:false },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Security & Compliance</div>
        <div className="page-sub">Monitor access, detect threats, and manage compliance</div>
      </div>

      <div className="grid-2 mb-4">
        {/* Biometric toggle */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",fontFamily:"var(--fb)",marginBottom:4}}>Biometric Security</div>
              <div style={{fontSize:12,color:"var(--ink3)"}}>Enable fingerprint / Face ID authentication</div>
            </div>
            <div onClick={() => setBiometric(b => !b)}
              style={{width:46,height:26,borderRadius:13,background:biometric?"var(--green)":"var(--border2)",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"white",position:"absolute",top:3,left:biometric?23:3,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.35)"}}/>
            </div>
          </div>
        </div>

        {/* Neural Fraud Detection */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div style={{fontSize:14,fontWeight:600,color:"var(--ink)",fontFamily:"var(--fb)",marginBottom:4}}>Neural Fraud Detection</div>
              <div style={{fontSize:12,color:"var(--green)"}}>● Active & Monitoring</div>
            </div>
            <div style={{position:"relative",width:60,height:60,flexShrink:0}}>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(76,175,125,.15)" strokeWidth="2"/>
                <circle cx="30" cy="30" r="26" fill="none" stroke="var(--green)" strokeWidth="2" strokeDasharray="163" strokeDashoffset="40" strokeLinecap="round" style={{animation:"spin 3s linear infinite",transformOrigin:"30px 30px"}}/>
                <circle cx="30" cy="30" r="16" fill="none" stroke="rgba(76,175,125,.1)" strokeWidth="1.5"/>
                <circle cx="30" cy="30" r="4" fill="var(--green)" opacity=".8"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)"}}>
          <div className="card-title">Active Sessions</div>
        </div>
        <table className="table">
          <thead><tr><th>Device</th><th>Location</th><th>Time</th><th>Action</th></tr></thead>
          <tbody>
            {sessions.map((s,i) => (
              <tr key={i}>
                <td>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:13,color:"var(--ink)",fontWeight:500}}>{s.device}</span>
                    {s.current && <span className="badge badge-green" style={{fontSize:9}}>Current</span>}
                  </div>
                </td>
                <td style={{fontSize:12.5,color:"var(--ink2)"}}>{s.location}</td>
                <td style={{fontSize:12,color:"var(--ink3)"}}>{s.time}</td>
                <td>
                  {!s.current && (
                    <button className="btn btn-ghost btn-sm" style={{color:"var(--red)",borderColor:"rgba(224,92,92,.3)"}}
                      onClick={() => toast("Session revoked","success")}>Revoke</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sustainability ────────────────────────────────────────────────
function SustainabilityPage() {
  const score = 85;
  const circ  = 2 * Math.PI * 54;
  const off   = circ * (1 - score / 100);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Sustainability & Green Tech Impact</div>
        <div className="page-sub">Track your environmental impact and green investments</div>
      </div>

      {/* Green Finance Score */}
      <div className="card" style={{textAlign:"center",marginBottom:16}}>
        <div style={{position:"relative",width:180,height:180,margin:"0 auto 16px"}}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="54" fill="none" stroke="var(--border)" strokeWidth="12"/>
            <circle cx="90" cy="90" r="54" fill="none" stroke="var(--green)" strokeWidth="12"
              strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 90 90)"/>
            <text x="90" y="84" textAnchor="middle" fontFamily="var(--fm)" fontSize="34" fontWeight="700" fill="var(--green)">{score}</text>
            <text x="90" y="101" textAnchor="middle" fontFamily="var(--fb)" fontSize="11" fill="var(--ink3)">/100</text>
            <text x="90" y="116" textAnchor="middle" fontFamily="var(--fb)" fontSize="9" fill="var(--green)" letterSpacing="1.5">GREEN SCORE</text>
          </svg>
        </div>
        <div style={{fontSize:15,fontWeight:600,color:"var(--ink)",marginBottom:6}}>Excellent!</div>
        <div style={{fontSize:13,color:"var(--ink3)",maxWidth:320,margin:"0 auto"}}>
          Your investment supports sustainable and green money
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title mb-3">Carbon Offset</div>
          <div style={{fontFamily:"var(--fm)",fontSize:30,fontWeight:700,color:"var(--green)",marginBottom:4}}>1,500 kg</div>
          <div style={{fontSize:12,color:"var(--ink3)",marginBottom:14}}>CO₂ Offset this period</div>
          <div style={{height:7,background:"var(--border)",borderRadius:99,overflow:"hidden",marginBottom:6}}>
            <div style={{width:"68%",height:"100%",background:"var(--green)",borderRadius:99}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--ink3)"}}>
            <span>Total: 3,300 kg</span><span>Target: 5,000 kg</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title mb-3">Green Investment</div>
          <div style={{fontFamily:"var(--fm)",fontSize:30,fontWeight:700,color:"var(--green)",marginBottom:4}}>+12.4%</div>
          <div style={{fontSize:12,color:"var(--ink3)",marginBottom:14}}>Monthly performance</div>
          <svg width="100%" height="44" viewBox="0 0 100 44" preserveAspectRatio="none">
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--green)" stopOpacity=".2"/>
                <stop offset="100%" stopColor="var(--green)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <polygon points="0,44 0,38 15,30 30,34 45,20 60,24 75,12 90,9 100,5 100,44" fill="url(#greenGrad)"/>
            <polyline points="0,38 15,30 30,34 45,20 60,24 75,12 90,9 100,5" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────
function NotificationsPage() {
  const [filter, setFilter] = useState("all");

  const notifications = [
    {type:"ai",          icon:"ai",     title:"Portfolio Optimization Opportunity",          body:"Our algorithms detected a 14% potential growth in sustainable energy sectors. Review recommendations.", time:"3 hours ago"},
    {type:"security",    icon:"alert",  title:"Security Alert: New Device Login Detected",   body:"A new login from 'Unknown Device (Chrome on Windows)' was reported from Seattle, WA.",                time:"Yesterday at 4:45 PM"},
    {type:"transaction", icon:"chart",  title:"Transaction Update: Investment Deposited",    body:"$5,000.00 has been successfully deposited into your Green Future Fund.",                               time:"Dec 15, 2023"},
    {type:"ai",          icon:"ai",     title:"AI Insight: Market Trend Analysis",           body:"Significant movement in carbon credit markets. Consider adjusting your exposure.",                     time:"Dec 30, 2023"},
  ];

  const tabs = [
    {id:"all",          label:"Smart Filter"},
    {id:"ai",           label:"AI Insight"},
    {id:"security",     label:"Security Alert"},
    {id:"transaction",  label:"Transaction Update"},
  ];

  const iconColor = {ai:"var(--gold)",security:"var(--red)",transaction:"var(--green)"};
  const filtered  = filter === "all" ? notifications : notifications.filter(n => n.type === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Smart Notification Center</div>
        <div className="page-sub">AI-curated alerts and portfolio updates</div>
      </div>

      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            style={{padding:"7px 16px",borderRadius:99,border:`1px solid ${filter===t.id?"var(--gold)":"var(--border)"}`,background:filter===t.id?"rgba(200,146,74,.1)":"var(--surface)",color:filter===t.id?"var(--gold)":"var(--ink3)",fontSize:12.5,fontWeight:filter===t.id?600:400,cursor:"pointer",transition:"all .13s",fontFamily:"var(--fb)"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {filtered.map((n,i) => (
          <div key={i} className="card" style={{display:"flex",gap:14,padding:"16px 18px"}}>
            <div style={{width:40,height:40,borderRadius:10,background:`${iconColor[n.type]}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1px solid ${iconColor[n.type]}28`}}>
              <IC n={n.icon} s={17} c={iconColor[n.type]}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13.5,fontWeight:600,color:"var(--ink)",fontFamily:"var(--fb)",marginBottom:5}}>{n.title}</div>
              <div style={{fontSize:13,color:"var(--ink2)",lineHeight:1.6,marginBottom:8}}>{n.body}</div>
              <div style={{fontSize:11,color:"var(--ink3)"}}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Referral ─────────────────────────────────────────────────────
function ReferralPage({ user, toast }) {
  const link = `exfinanalyze.com/ref/${user?.email?.split("@")[0] || "user"}`;

  const leaderboard = [
    {name:"Alex Johnson", amount:"$2,100",rank:1},
    {name:"Sarah Chen",   amount:"$1,850",rank:2},
    {name:"Michael D.",   amount:"$1,400",rank:3},
    {name:"Bob Johnson",  amount:"$1,200",rank:4},
    {name:"William A.",   amount:"$1,100",rank:5},
    {name:"Sarah Chen II",amount:"$1,000",rank:6},
    {name:"Michael D. II",amount:"$800",  rank:7},
  ];

  const badges = [
    {icon:"⚡",label:"Early Adopter",   pts:"$0",   earned:true  },
    {icon:"📈",label:"Power Investor",  pts:"$10",  earned:true  },
    {icon:"🌱",label:"Growth Catalyst", pts:"$25",  earned:false },
    {icon:"🏆",label:"Community Builder",pts:"$50", earned:false },
    {icon:"👁",label:"Visionary",       pts:"$100", earned:false },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Referral & Rewards Hub</div>
        <div className="page-sub">Invite friends and earn rewards for every successful referral</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Invite & Earn */}
          <div className="card" style={{textAlign:"center",padding:"32px 28px"}}>
            <div style={{fontSize:24,fontWeight:700,fontFamily:"var(--fd)",color:"var(--ink)",marginBottom:8}}>Invite & Earn</div>
            <div style={{fontSize:13,color:"var(--ink3)",marginBottom:24,maxWidth:340,margin:"0 auto 24px"}}>
              Share your unique link and earn rewards for every successful referral
            </div>
            <div style={{display:"flex",gap:8,maxWidth:420,margin:"0 auto 12px"}}>
              <input readOnly value={link}
                style={{flex:1,padding:"9px 12px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:"var(--r)",color:"var(--ink2)",fontSize:12.5,fontFamily:"var(--fm)",outline:"none"}}/>
              <button className="btn btn-primary" style={{flexShrink:0}} onClick={() => {navigator.clipboard.writeText(link); toast("Link copied!","success");}}>Copy</button>
            </div>
            <button className="btn btn-ghost" onClick={() => toast("Shared!","success")}>Share on Social</button>
          </div>

          {/* Rewards Progress */}
          <div className="card">
            <div className="card-title mb-4">Rewards Progress</div>
            <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
              {badges.map((b,i) => (
                <div key={i} style={{flex:1,textAlign:"center"}}>
                  <div style={{width:52,height:52,borderRadius:"50%",background:b.earned?"rgba(200,146,74,.15)":"var(--card2)",border:`2px solid ${b.earned?"var(--gold)":"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 8px"}}>
                    {b.icon}
                  </div>
                  <div style={{fontSize:10,color:b.earned?"var(--gold)":"var(--ink3)",fontWeight:b.earned?600:400,lineHeight:1.3}}>{b.label}</div>
                  <div style={{fontSize:10,color:"var(--ink3)",fontFamily:"var(--fm)",marginTop:2}}>{b.pts}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <div className="card-title mb-4">Top Referrers</div>
          {leaderboard.map((l,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<leaderboard.length-1?"1px solid var(--border)":"none"}}>
              <div style={{width:22,fontSize:11,color:i<3?"var(--gold)":"var(--ink3)",fontWeight:700,fontFamily:"var(--fm)",textAlign:"center",flexShrink:0}}>#{l.rank}</div>
              <div style={{width:28,height:28,borderRadius:"50%",background:"var(--card2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"var(--ink2)",flexShrink:0}}>
                {l.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
              </div>
              <div style={{flex:1,fontSize:12.5,color:"var(--ink)",fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.name}</div>
              <div style={{fontSize:12.5,fontWeight:700,color:"var(--gold)",fontFamily:"var(--fm)",flexShrink:0}}>{l.amount}</div>
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
        {[
          { id: "all",      label: "All",      dot: "var(--ink3)"  },
          { id: "pdf",      label: "PDF",      dot: "var(--red)"   },
          { id: "excel",    label: "Excel",    dot: "var(--green)" },
          { id: "contract", label: "Contract", dot: "var(--blue)"  },
          { id: "analyzed", label: "Analyzed", dot: "var(--green)" },
          { id: "pending",  label: "Pending",  dot: "var(--gold)"  },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:99, fontSize:12, fontWeight:filter===f.id?600:400, cursor:"pointer", border:`1px solid ${filter===f.id?"var(--gold)":"var(--border)"}`, background:filter===f.id?"rgba(200,146,74,.1)":"var(--surface)", color:filter===f.id?"var(--gold)":"var(--ink3)", transition:"all .13s" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:f.dot, flexShrink:0, opacity:filter===f.id?1:.5 }} />
            {f.label}
          </button>
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

// ─── AI Analysis + Chat ───────────────────────────────────────────
function AnalyzePage({ user, docs, setDocs, toast, selectedDoc, setSelectedDoc }) {
  const [docId,   setDocId]   = useState(selectedDoc?.id || "");
  const [mode,    setMode]    = useState("extract");
  const [loading, setLoading] = useState(false);
  const [input,   setInput]   = useState("");
  // chat history: { role: "user"|"ai", text, ts, isAnalysis? }
  const [chat,    setChat]    = useState([]);
  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => { if (selectedDoc) { setDocId(selectedDoc.id); setChat([]); } }, [selectedDoc]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, loading]);

  const currentDoc = docs.find(d => d.id === docId);

  const MODES = [
    { id: "extract",   label: "Extract Data",     icon: "docs",   color: "var(--gold)",   prompt: (n,t) => `You are an expert financial analyst. Analyze this ${t} document: "${n}".\n\nExtract ALL financial data:\n- Key figures (revenues, expenses, assets, liabilities)\n- Dates and periods\n- Parties involved\n- Payment terms and amounts\n- Critical clauses\n- Missing or anomalous items\n\nFormat with clear sections. End with: RISK ASSESSMENT: LOW / MEDIUM / HIGH and why.` },
    { id: "shadow",    label: "Shadow Review",     icon: "ai",     color: "var(--purple)", prompt: (n,t) => `You are an AI Shadow Reviewer — an expert accounting tutor reviewing "${n}" (${t}).\n\n1. ACCOUNTING TREATMENT (GAAP/IFRS)\n2. APPLICABLE ASC STANDARDS (842, 606, etc.)\n3. COMMON JUNIOR MISTAKES\n4. STEP-BY-STEP walkthrough\n5. AUDIT FOCUS AREAS\n6. EDUCATIONAL TIPS\n\nWrite as a teaching document.` },
    { id: "risk",      label: "Risk Analysis",     icon: "alert",  color: "var(--red)",    prompt: (n,t) => `Perform a comprehensive risk analysis of "${n}" (${t}).\n\n1. FINANCIAL RISKS\n2. COMPLIANCE RISKS\n3. CONTRACTUAL RISKS\n4. FRAUD INDICATORS\n\nFor each: Severity (CRITICAL/HIGH/MEDIUM/LOW) + Likelihood + Mitigation.\nEnd with: OVERALL RISK SCORE (1-10).` },
    { id: "summary",   label: "Executive Summary", icon: "report", color: "var(--blue)",   prompt: (n,t) => `Create a concise executive summary of "${n}" (${t}) for a CFO.\n\n1. DOCUMENT OVERVIEW\n2. KEY FINANCIAL HIGHLIGHTS\n3. CRITICAL DATES\n4. RISKS & CONCERNS\n5. RECOMMENDED ACTIONS\n\nBe direct and actionable.` },
    { id: "narrative", label: "MD&A Narrative",    icon: "report", color: "var(--green)",  prompt: (n,t) => `Generate an MD&A narrative for "${n}" (${t}).\n\n1. RESULTS OF OPERATIONS\n2. REVENUE DRIVERS\n3. COST ANALYSIS\n4. LIQUIDITY & CAPITAL\n5. FORWARD-LOOKING STATEMENTS\n\nProfessional MD&A style, ready for regulatory filing.` },
  ];

  // Build conversation history for context-aware chat
  const buildHistory = () => chat.map(m => `${m.role === "user" ? "User" : "AI"}: ${m.text}`).join("\n\n");

  const addMsg = (role, text, isAnalysis = false) => {
    setChat(p => [...p, { role, text, ts: new Date(), isAnalysis }]);
  };

  const runAnalysis = async () => {
    if (!currentDoc) return;
    const m = MODES.find(x => x.id === mode);
    addMsg("user", `Run ${m.label}`, true);
    setLoading(true);
    try {
      const result = await gemini.analyze(m.prompt(currentDoc.name, currentDoc.type), currentDoc.fileData);
      addMsg("ai", result, true);
      const rl = result.match(/risk.*?:\s*(critical|high|medium|low)/i)?.[1]?.toLowerCase() || "medium";
      docStore.update(user.id, docId, { status: "analyzed", analysis: result, riskLevel: rl, analyzedAt: new Date().toISOString() });
      setDocs(docStore.get(user.id));
      toast("Analysis complete ✓", "success");
    } catch (e) {
      addMsg("ai", `⚠️ Error: ${e.message}`);
      toast("Analysis failed", "error");
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || !currentDoc || loading) return;
    setInput("");
    addMsg("user", q);
    setLoading(true);
    try {
      const history = buildHistory();
      const prompt = `You are a financial AI assistant analyzing the document "${currentDoc.name}".\n\nConversation so far:\n${history || "None"}\n\nUser: ${q}\n\nAnswer specifically based on the document content. Be concise and precise.`;
      const result = await gemini.analyze(prompt, currentDoc.fileData);
      addMsg("ai", result);
    } catch (e) {
      addMsg("ai", `⚠️ ${e.message}`);
      toast("Failed", "error");
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const clearChat = () => { setChat([]); toast("Chat cleared", "success"); };

  const copyAll = () => {
    const text = chat.map(m => `${m.role === "user" ? "You" : "AI"}: ${m.text}`).join("\n\n---\n\n");
    navigator.clipboard.writeText(text);
    toast("Copied ✓", "success");
  };

  // Render markdown-ish text
  const renderText = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ")) return <div key={i} style={{ fontFamily: "var(--fs)", fontWeight: 600, fontSize: 13.5, color: "var(--gold)", margin: "12px 0 4px" }}>{line.slice(3)}</div>;
      if (line.startsWith("# "))  return <div key={i} style={{ fontFamily: "var(--fs)", fontWeight: 700, fontSize: 15, color: "var(--ink)", margin: "14px 0 6px" }}>{line.slice(2)}</div>;
      if (line.match(/^\*\*(.+)\*\*$/)) return <div key={i} style={{ fontWeight: 600, color: "var(--ink)", fontSize: 12.5, marginTop: 8 }}>{line.replace(/\*\*/g,"")}</div>;
      if (line.startsWith("- ") || line.startsWith("* ")) return <div key={i} style={{ paddingLeft: 14, fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.7, position:"relative" }}><span style={{ position:"absolute", left:4, color:"var(--gold)" }}>·</span>{line.slice(2).replace(/\*\*/g,"")}</div>;
      if (line.match(/^\d+\./)) return <div key={i} style={{ paddingLeft: 14, fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.7 }}>{line.replace(/\*\*/g,"")}</div>;
      if (line === "") return <div key={i} style={{ height: 6 }} />;
      return <div key={i} style={{ fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.75 }}>{line.replace(/\*\*/g,"")}</div>;
    });
  };

  return (
    <div style={{ height: "calc(100vh - 60px)", display: "flex", flexDirection: "column", gap: 0 }}>
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div className="page-title">AI Analysis</div>
        <div className="page-sub">Gemini 2.5 Flash — document chat + analysis</div>
      </div>

      <div style={{ display: "flex", gap: 14, flex: 1, minHeight: 0 }}>

        {/* ── Left panel: controls ── */}
        <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Document selector */}
          <div className="card">
            <div className="card-title mb-2" style={{ fontSize: 11.5 }}>DOCUMENT</div>
            <select className="input select" value={docId} onChange={e => { setDocId(e.target.value); setChat([]); setSelectedDoc(null); }} style={{ fontSize: 12 }}>
              <option value="">— Choose a document —</option>
              {docs.map(d => <option key={d.id} value={d.id}>{d.name.length > 32 ? d.name.slice(0,30)+"…" : d.name}</option>)}
            </select>
            {currentDoc && (
              <div className="flex gap-2 mt-2" style={{ flexWrap: "wrap" }}>
                <span className="tag" style={{ textTransform: "uppercase", fontSize: 9 }}>{currentDoc.type}</span>
                <span className={`badge badge-${currentDoc.status==="analyzed"?"green":"gold"}`} style={{ fontSize: 9.5 }}>{currentDoc.status}</span>
                {currentDoc.riskLevel && <span className={`badge badge-${currentDoc.riskLevel==="high"?"red":currentDoc.riskLevel==="medium"?"gold":"green"}`} style={{ fontSize: 9.5 }}>{currentDoc.riskLevel} risk</span>}
              </div>
            )}
          </div>

          {/* Analysis modes */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-title mb-2" style={{ fontSize: 11.5 }}>ANALYSIS MODE</div>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: "var(--r)", border: `1px solid ${mode===m.id?"var(--gold)":"var(--border)"}`, background: mode===m.id?"rgba(200,146,74,.07)":"transparent", cursor: "pointer", width: "100%", marginBottom: 5, transition: "all .13s" }}>
                <IC n={m.icon} s={12} c={mode===m.id ? m.color : "var(--ink3)"} />
                <span style={{ fontSize: 12, color: mode===m.id?"var(--gold)":"var(--ink2)", fontWeight: mode===m.id?500:400, fontFamily:"var(--fb)" }}>{m.label}</span>
              </button>
            ))}
            <button className="btn btn-primary mt-2" onClick={runAnalysis} disabled={!docId||loading} style={{ justifyContent: "center", width: "100%", padding: "9px", fontSize: 12.5 }}>
              {loading ? <><span className="spin">↻</span> Analyzing…</> : <><IC n="ai" s={13} /> Run Analysis</>}
            </button>
          </div>
        </div>

        {/* ── Right panel: chat ── */}
        <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", minHeight: 0 }}>

          {/* Chat header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--fb)" }}>
                {currentDoc ? currentDoc.name.slice(0, 40) + (currentDoc.name.length > 40 ? "…" : "") : "No document selected"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {chat.length > 0 && <>
                <button className="btn btn-ghost btn-sm" onClick={copyAll}><IC n="copy" s={11} /> Copy all</button>
                <button className="btn btn-ghost btn-sm" onClick={clearChat} style={{ color: "var(--red)" }}><IC n="trash" s={11} /> Clear</button>
              </>}
            </div>
          </div>

          {/* Messages area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
            {chat.length === 0 && !loading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
                {/* Neural AI visual */}
                <div style={{ position: "relative", width: 80, height: 80 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                    <circle cx="40" cy="40" r="38" stroke="var(--border)" strokeWidth="1.5" />
                    <circle cx="40" cy="40" r="28" stroke="rgba(200,146,74,.25)" strokeWidth="1" strokeDasharray="4 4" />
                    {/* Nodes */}
                    {[[40,14],[66,30],[66,50],[40,66],[14,50],[14,30]].map(([cx,cy],i) => (
                      <circle key={i} cx={cx} cy={cy} r="4" fill="var(--surface)" stroke="rgba(200,146,74,.6)" strokeWidth="1.5" />
                    ))}
                    {/* Connections */}
                    {[[40,14,66,30],[66,30,66,50],[66,50,40,66],[40,66,14,50],[14,50,14,30],[14,30,40,14],[40,14,40,66],[66,30,14,50],[66,50,14,30]].map(([x1,y1,x2,y2],i) => (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(200,146,74,.12)" strokeWidth="1" />
                    ))}
                    {/* Center dot */}
                    <circle cx="40" cy="40" r="6" fill="rgba(200,146,74,.15)" stroke="var(--gold)" strokeWidth="1.5" />
                    <circle cx="40" cy="40" r="2.5" fill="var(--gold)" />
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, marginBottom: 4 }}>
                    {currentDoc ? "Ready to analyze" : "Select a document to start"}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink3)" }}>
                    {currentDoc ? "Run an analysis mode or ask a question below" : "Upload a document from the Documents page"}
                  </div>
                </div>
                {currentDoc && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                    {["What are the key financial figures?", "Identify any risks", "Summarize in 3 bullet points"].map(q => (
                      <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid var(--border)", background: "transparent", color: "var(--ink3)", fontSize: 11.5, cursor: "pointer", transition: "all .13s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor="var(--gold)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor="var(--border)"}
                      >{q}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {chat.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 3 }}>
                {/* Label */}
                <div style={{ fontSize: 10.5, color: "var(--ink3)", fontWeight: 600, letterSpacing: ".4px", paddingLeft: msg.role === "ai" ? 4 : 0, paddingRight: msg.role === "user" ? 4 : 0 }}>
                  {msg.role === "user" ? "YOU" : "EXFINANALYZE AI"}
                  {msg.isAnalysis && <span style={{ marginLeft: 5, color: "var(--gold)", fontSize: 10 }}>· ANALYSIS</span>}
                </div>
                {/* Bubble */}
                <div style={{
                  maxWidth: "88%",
                  padding: msg.role === "user" ? "9px 14px" : "13px 16px",
                  borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "4px 14px 14px 14px",
                  background: msg.role === "user" ? "rgba(200,146,74,.12)" : "var(--surface)",
                  border: `1px solid ${msg.role === "user" ? "rgba(200,146,74,.2)" : "var(--border)"}`,
                  fontSize: 12.5,
                  lineHeight: 1.7,
                  color: "var(--ink2)",
                }}>
                  {msg.role === "user"
                    ? <span style={{ color: "var(--ink)" }}>{msg.text}</span>
                    : <div>{renderText(msg.text)}</div>
                  }
                </div>
                <div style={{ fontSize: 10, color: "var(--ink3)", paddingLeft: 4, paddingRight: 4 }}>
                  {msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}

            {loading && chat.filter(m => m.isAnalysis).length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 20 }}>
                {/* Pulsing neural globe */}
                <div style={{ position: "relative", width: 96, height: 96 }}>
                  <div style={{ position: "absolute", inset: -12, borderRadius: "50%", background: "rgba(200,146,74,.06)", animation: "pulse 1.6s ease infinite" }} />
                  <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
                    <circle cx="48" cy="48" r="46" stroke="rgba(200,146,74,.15)" strokeWidth="1.5" />
                    <circle cx="48" cy="48" r="34" stroke="rgba(200,146,74,.25)" strokeWidth="1" strokeDasharray="3 3" />
                    {[[48,16],[80,35],[80,61],[48,80],[16,61],[16,35]].map(([cx,cy],i) => (
                      <circle key={i} cx={cx} cy={cy} r="4.5" fill="var(--surface)" stroke="rgba(200,146,74,.7)" strokeWidth="1.5" />
                    ))}
                    {[[48,16,80,35],[80,35,80,61],[80,61,48,80],[48,80,16,61],[16,61,16,35],[16,35,48,16],[48,16,48,80],[80,35,16,61],[80,61,16,35]].map(([x1,y1,x2,y2],i) => (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(200,146,74,.15)" strokeWidth="1" />
                    ))}
                    <circle cx="48" cy="48" r="8" fill="rgba(200,146,74,.2)" stroke="var(--gold)" strokeWidth="1.5" />
                    <circle cx="48" cy="48" r="3" fill="var(--gold)" />
                  </svg>
                </div>
                {/* Streaming log */}
                <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    `Analysis in progress for ${currentDoc?.name?.slice(0,28) || "document"}…`,
                    "Extracting key financial metrics…",
                    "Risk assessment underway…",
                    "Anomaly detection scanning…",
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "var(--card2)", borderRadius: "var(--r)", border: "1px solid var(--border2)", animation: `fadeUp .4s ${i * 0.18}s both` }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", flexShrink: 0, animation: "pulse 1.4s ease infinite" }} />
                      <span style={{ fontSize: 12, color: "var(--ink2)", fontFamily: "var(--fm)" }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {loading && chat.filter(m => m.isAnalysis).length > 0 && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ padding: "12px 16px", borderRadius: "4px 14px 14px 14px", background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="dot-pulse"><span/><span/><span/></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input bar */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexShrink: 0, background: "var(--bg)" }}>
            <input
              ref={inputRef}
              className="input"
              placeholder={currentDoc ? "Ask anything about this document…" : "Select a document first"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              disabled={!currentDoc || loading}
              style={{ flex: 1, fontSize: 13 }}
            />
            <button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={!input.trim() || !currentDoc || loading}
              style={{ padding: "0 16px", flexShrink: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────
function ReportsPage({ user, docs, toast }) {
  const [type,      setType]      = useState("monthly");
  const [output,    setOutput]    = useState("");
  const [busy,      setBusy]      = useState(false);
  const [pdfUrl,    setPdfUrl]    = useState(null);
  const [pdfName,   setPdfName]   = useState("");
  const [projectId, setProjectId] = useState("all");

  const projects  = projectStore.get(user.id);

  const selectedDocs = projectId === "all"
    ? docs
    : docs.filter(d => {
        const p = projects.find(x => x.id === projectId);
        return p?.docIds.includes(d.id);
      });
  const analyzed = selectedDocs.filter(d => d.status === "analyzed");

  const TYPES = [
    { id: "monthly", label: "Monthly Close Report",  desc: "AI-generated financial reports — calendar and comparative.", icon: "report", color: "#C8924A" },
    { id: "risk",    label: "Risk Assessment",        desc: "AI-generates financial reports — risk level, readiness.",    icon: "alert",  color: "#E05C5C" },
    { id: "audit",   label: "Audit Readiness",        desc: "AI-generates financial reports — audit readiness.",           icon: "docs",   color: "#4CAF7D" },
  ];

  const generate = async () => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) { toast("Configure VITE_GEMINI_API_KEY first", "error"); return; }
    if (analyzed.length === 0) { toast("Analyze documents first", "error"); return; }
    setBusy(true); setOutput(""); setPdfUrl(null);
    const ctx = analyzed.map(d => `• ${d.name} (${d.type}, ${d.riskLevel||"?"} risk):\n${(d.analysis||"").slice(0,600)}`).join("\n\n");
    const prompts = {
      monthly: `Generate a Monthly Financial Close Report from ${analyzed.length} analyzed documents:\n\n${ctx}\n\nStructure: Executive Summary → Key Metrics → Document Analysis → Risk Flags → Recommendations → Next Steps. Ready for CFO. Use clear headers and bullet points.`,
      risk:    `Generate a Risk Assessment Report from ${analyzed.length} documents:\n\n${ctx}\n\nInclude: Risk Matrix, Top Risks by severity (CRITICAL/HIGH/MEDIUM/LOW), Mitigations, Action items with owners and deadlines.`,
      audit:   `Generate an Audit Readiness Report from ${analyzed.length} documents:\n\n${ctx}\n\nInclude: Documentation completeness checklist, Missing items, Compliance gaps, Pre-audit action plan.`,
    };
    try {
      const result = await gemini.analyze(prompts[type]);
      setOutput(result);
      await buildPDF(result);
      toast("Report ready ✓", "success");
    } catch (e) { toast("Generation failed: " + e.message, "error"); }
    setBusy(false);
  };

  const buildPDF = async (text) => {
    const t = TYPES.find(x => x.id === type);
    const filename = `ExFinAnalyze-${type}-${new Date().toISOString().slice(0,10)}.pdf`;
    setPdfName(filename);

    // Parse text into sections
    const lines = text.split("\n").filter(l => l.trim());

    // Build HTML for PDF
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'DM Sans',Helvetica,Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:11pt;line-height:1.7;}
  .cover{background:linear-gradient(135deg,#0C0E0D 0%,#1a1f1c 100%);padding:60px 56px;min-height:220px;position:relative;}
  .cover::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#C8924A,#E2A85C,#C8924A);}
  .logo{font-family:'Fraunces',Georgia,serif;font-size:22pt;font-weight:700;color:#C8924A;letter-spacing:-.5px;margin-bottom:6px;}
  .logo-sub{font-size:9pt;color:#6B6760;letter-spacing:1px;text-transform:uppercase;margin-bottom:36px;}
  .report-title{font-family:'Fraunces',Georgia,serif;font-size:26pt;font-weight:700;color:#E8E4DC;line-height:1.2;margin-bottom:10px;}
  .report-meta{font-size:10pt;color:#A8A49C;}
  .body{padding:48px 56px;}
  h1{font-family:'Fraunces',Georgia,serif;font-size:16pt;font-weight:700;color:#0C0E0D;margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid #C8924A;}
  h2{font-family:'Fraunces',Georgia,serif;font-size:13pt;font-weight:600;color:#1a1a1a;margin:20px 0 8px;}
  h3{font-size:11pt;font-weight:600;color:#3a3a3a;margin:14px 0 6px;}
  p{margin-bottom:8px;color:#2a2a2a;}
  ul{margin:8px 0 12px 18px;}
  li{margin-bottom:4px;color:#2a2a2a;}
  .risk-critical{color:#C0392B;font-weight:600;}
  .risk-high{color:#E67E22;font-weight:600;}
  .risk-medium{color:#C8924A;font-weight:600;}
  .risk-low{color:#27AE60;font-weight:600;}
  .highlight{background:#FFF8F0;border-left:3px solid #C8924A;padding:10px 14px;margin:12px 0;border-radius:0 4px 4px 0;}
  .footer{margin-top:48px;padding-top:16px;border-top:1px solid #E0D8D0;display:flex;justify-content:space-between;font-size:9pt;color:#A8A49C;}
  .page-num{text-align:right;}
  table{width:100%;border-collapse:collapse;margin:12px 0;}
  th{background:#0C0E0D;color:#E8E4DC;padding:8px 12px;text-align:left;font-size:10pt;}
  td{padding:7px 12px;border-bottom:1px solid #E8E4DC;font-size:10pt;}
  tr:nth-child(even) td{background:#FAFAF9;}
</style>
</head>
<body>
<div class="cover">
  <div class="logo">ExFinAnalyze</div>
  <div class="logo-sub">Financial Intelligence Platform</div>
  <div class="report-title">${t.label}</div>
  <div class="report-meta">
    Generated: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})} &nbsp;·&nbsp;
    ${analyzed.length} document${analyzed.length>1?"s":""} analyzed &nbsp;·&nbsp;
    Prepared by AI
  </div>
</div>
<div class="body">
${lines.map(line => {
  const clean = line.replace(/\*\*/g,"").replace(/\*/g,"").trim();
  if (!clean) return "<br/>";
  if (line.match(/^# (?!#)/))   return `<h1>${clean.replace(/^#+\s*/,"")}</h1>`;
  if (line.match(/^## (?!#)/))  return `<h2>${clean.replace(/^#+\s*/,"")}</h2>`;
  if (line.match(/^### /))      return `<h3>${clean.replace(/^#+\s*/,"")}</h3>`;
  if (line.match(/^[-*•] /))    return `<ul><li>${clean.replace(/^[-*•]\s*/,"")}</li></ul>`;
  if (line.match(/^\d+\. /))    return `<ol><li>${clean.replace(/^\d+\.\s*/,"")}</li></ol>`;
  if (clean.length < 90 && clean.endsWith(":") && !clean.includes(".")) return `<h3>${clean}</h3>`;
  return `<p>${clean}</p>`;
}).join("\n")}
<div class="footer">
  <span>ExFinAnalyze · Confidential</span>
  <span>${new Date().getFullYear()}</span>
</div>
</div>
</body>
</html>`;

    // Create blob URL for preview iframe
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    setPdfUrl({ html: url, content: htmlContent, filename });
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;
    // Open print dialog in new window for PDF save
    const win = window.open("", "_blank");
    win.document.write(pdfUrl.content);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
    };
    toast("Print dialog opened — Save as PDF", "success");
  };

  const downloadWord = () => {
    if (!output) return;
    const t = TYPES.find(x => x.id === type);
    // Build simple Word-compatible HTML
    const wordHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head><meta charset='UTF-8'><title>${t.label}</title>
<style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.6;margin:2cm;}
h1{font-size:16pt;color:#C8924A;border-bottom:2px solid #C8924A;padding-bottom:4pt;}
h2{font-size:13pt;color:#1a1a1a;}p{margin:6pt 0;}</style></head>
<body>
<h1 style="font-size:20pt;color:#0C0E0D;">ExFinAnalyze — ${t.label}</h1>
<p style="color:#888;">Generated: ${new Date().toLocaleDateString()} · ${analyzed.length} documents</p><hr/>
${output.split("\n").map(l => {
  const c = l.replace(/\*\*/g,"").trim();
  if (!c) return "<br/>";
  if (l.startsWith("# ")) return `<h1>${c.replace(/^#+\s*/,"")}</h1>`;
  if (l.startsWith("## ")) return `<h2>${c.replace(/^#+\s*/,"")}</h2>`;
  if (l.match(/^[-*•]\s/)) return `<p>• ${c.replace(/^[-*•]\s*/,"")}</p>`;
  return `<p>${c}</p>`;
}).join("")}
</body></html>`;
    const blob = new Blob(["\ufeff", wordHtml], { type: "application/msword" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `ExFinAnalyze-${type}-${new Date().toISOString().slice(0,10)}.doc`;
    a.click(); URL.revokeObjectURL(url);
    toast("Word document downloaded ✓", "success");
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Reports & Narratives</div>
        <div className="page-sub">AI-generated financial reports — export as PDF or Word</div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Left: controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-title mb-3">Report Type</div>
            {TYPES.map(r => (
              <button key={r.id} onClick={() => { setType(r.id); setPdfUrl(null); setOutput(""); }}
                style={{ display: "flex", gap: 12, padding: "13px", borderRadius: "var(--r)", border: `1px solid ${type===r.id?r.color:"var(--border)"}`, background: type===r.id?`${r.color}0d`:"transparent", cursor: "pointer", textAlign: "left", width: "100%", marginBottom: 8, transition: "all .15s" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${r.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${r.color}30` }}>
                  <IC n={r.icon} s={15} c={r.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: type===r.id?r.color:"var(--ink)", fontFamily: "var(--fb)" }}>{r.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink3)", marginTop: 2, lineHeight: 1.4 }}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="card">
            <div className="card-title mb-2">Data Sources</div>
            <div className="input-group mt-2">
              <div className="input-label">Project Filter</div>
              <select className="input select" value={projectId} onChange={e => { setProjectId(e.target.value); setPdfUrl(null); setOutput(""); }}>
                <option value="all">All Documents ({docs.length})</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({docs.filter(d=>p.docIds.includes(d.id)).length} docs)</option>
                ))}
              </select>
            </div>
            <div className="card-sub mt-3 mb-2">{analyzed.length} analyzed · {selectedDocs.length - analyzed.length} pending</div>
            <div className="progress mb-2"><div className="progress-bar" style={{ width: `${selectedDocs.length?analyzed.length/selectedDocs.length*100:0}%` }} /></div>
          </div>

          <button className="btn btn-primary" onClick={generate} disabled={busy||analyzed.length===0} style={{ justifyContent: "center", width: "100%", padding: "11px" }}>
            {busy ? <><span className="spin">↻</span> Generating...</> : <><IC n="report" s={14} /> Generate Report</>}
          </button>

          {pdfUrl && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn btn-primary" onClick={downloadPDF} style={{ justifyContent: "center", width: "100%", background: "linear-gradient(135deg,#E05C5C,#c94444)" }}>
                <IC n="download" s={13} /> Save as PDF
              </button>
              <button className="btn btn-ghost" onClick={downloadWord} style={{ justifyContent: "center", width: "100%" }}>
                <IC n="docs" s={13} /> Download Word (.doc)
              </button>
            </div>
          )}
        </div>

        {/* Right: preview */}
        <div className="card" style={{ minHeight: 520, padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--fb)" }}>
              {pdfUrl ? pdfName : "Report Preview"}
            </div>
            {pdfUrl && (
              <div style={{ display: "flex", gap: 6 }}>
                <span className="badge badge-green" style={{ fontSize: 10 }}>✓ Ready</span>
                <button className="btn btn-ghost btn-sm" onClick={downloadPDF}><IC n="download" s={11} /> PDF</button>
                <button className="btn btn-ghost btn-sm" onClick={downloadWord}><IC n="docs" s={11} /> Word</button>
              </div>
            )}
          </div>

          {/* Preview area */}
          {busy && (
            <div className="empty-state" style={{ padding: "80px 0" }}>
              <div className="ai-thinking"><div className="dot-pulse"><span/><span/><span/></div><span>Compiling report…</span></div>
            </div>
          )}

          {!pdfUrl && !busy && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", minHeight:480, padding:"40px 32px", gap:24 }}>
              {/* Document mockup */}
              <div style={{ width:220, background:"var(--card2)", borderRadius:8, border:"1px solid var(--border)", overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,.18)" }}>
                <div style={{ height:32, background:TYPES.find(t=>t.id===type)?.color||"var(--gold)", display:"flex", alignItems:"center", padding:"0 14px", gap:8 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#0C0E0D", fontFamily:"var(--fb)", opacity:.85 }}>
                    ExFinAnalyze
                  </div>
                </div>
                <div style={{ padding:16 }}>
                  <div style={{ height:8, background:"var(--border)", borderRadius:4, marginBottom:8, width:"70%" }} />
                  <div style={{ height:6, background:"var(--border2)", borderRadius:4, marginBottom:6, width:"90%" }} />
                  <div style={{ height:6, background:"var(--border2)", borderRadius:4, marginBottom:6, width:"80%" }} />
                  <div style={{ height:6, background:"var(--border2)", borderRadius:4, marginBottom:14, width:"60%" }} />
                  <div style={{ height:1, background:"var(--border)", marginBottom:12 }} />
                  {[90,75,55,40].map((w,i) => (
                    <div key={i} style={{ display:"flex", gap:8, marginBottom:7, alignItems:"center" }}>
                      <div style={{ height:5, borderRadius:3, background:TYPES.find(t=>t.id===type)?.color||"var(--gold)", width:`${w}%`, opacity:.4+i*.1 }} />
                    </div>
                  ))}
                  <div style={{ height:1, background:"var(--border)", margin:"12px 0" }} />
                  <div style={{ height:5, background:"var(--border2)", borderRadius:4, width:"50%" }} />
                </div>
              </div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:13, color:"var(--ink)", fontWeight:600, marginBottom:4 }}>
                  {TYPES.find(t=>t.id===type)?.label}
                </div>
                <div style={{ fontSize:12, color:"var(--ink3)" }}>
                  {analyzed.length > 0 ? `${analyzed.length} document${analyzed.length>1?"s":""} ready · Click Generate` : "Analyze documents first to generate"}
                </div>
              </div>
            </div>
          )}

          {pdfUrl && !busy && (
            <iframe
              src={pdfUrl.html}
              style={{ width: "100%", height: 560, border: "none", background: "#fff" }}
              title="Report Preview"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Project Store ────────────────────────────────────────────────
const projectStore = {
  key(userId) { return `exfin_projects_${userId}`; },
  get(userId) {
    try { return JSON.parse(localStorage.getItem(this.key(userId)) || "[]"); }
    catch { return []; }
  },
  save(userId, projects) { localStorage.setItem(this.key(userId), JSON.stringify(projects)); },
  add(userId, project) {
    const list = this.get(userId);
    this.save(userId, [project, ...list]);
    return project;
  },
  update(userId, id, patch) {
    const list = this.get(userId).map(p => p.id === id ? { ...p, ...patch } : p);
    this.save(userId, list);
    return list.find(p => p.id === id);
  },
  remove(userId, id) {
    this.save(userId, this.get(userId).filter(p => p.id !== id));
  },
};

// ─── Projects Page ────────────────────────────────────────────────
function ProjectsPage({ user, docs, setDocs, toast, setPage, setSelectedDoc }) {
  const [projects,     setProjects]    = useState(() => projectStore.get(user.id));
  const [showNew,      setShowNew]     = useState(false);
  const [newName,      setNewName]     = useState("");
  const [newDesc,      setNewDesc]     = useState("");
  const [openProject,  setOpenProject] = useState(null);
  const [addingDocs,   setAddingDocs]  = useState(false);

  const refresh = () => setProjects(projectStore.get(user.id));

  const createProject = () => {
    if (!newName.trim()) return;
    const colors = ["#C8924A","#4CAF7D","#5C9BE0","#A06BB8","#E05C5C"];
    const p = {
      id: `proj-${Date.now()}`,
      name: newName.trim(),
      desc: newDesc.trim(),
      docIds: [],
      createdAt: new Date().toISOString(),
      color: colors[Math.floor(Math.random()*colors.length)],
    };
    projectStore.add(user.id, p);
    refresh();
    setNewName(""); setNewDesc(""); setShowNew(false);
    toast(`Project "${p.name}" created`, "success");
  };

  const deleteProject = (id) => {
    projectStore.remove(user.id, id);
    refresh();
    if (openProject?.id === id) setOpenProject(null);
    toast("Project deleted", "info");
  };

  const toggleDoc = (projectId, docId) => {
    const proj = projectStore.get(user.id).find(x => x.id === projectId);
    const docIds = proj.docIds.includes(docId)
      ? proj.docIds.filter(d => d !== docId)
      : [...proj.docIds, docId];
    projectStore.update(user.id, projectId, { docIds });
    refresh();
    setOpenProject(projectStore.get(user.id).find(x => x.id === projectId));
  };

  const projectDocs = (p) => docs.filter(d => p.docIds.includes(d.id));

  // ─── Project detail ───
  if (openProject) {
    const p = projectStore.get(user.id).find(x => x.id === openProject.id) || openProject;
    const pDocs = projectDocs(p);

    return (
      <div>
        <div className="page-header" style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => { setOpenProject(null); setAddingDocs(false); }}>← Back</button>
          <div>
            <div className="page-title" style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:10, height:10, borderRadius:"50%", background:p.color, display:"inline-block" }}/>
              {p.name}
            </div>
            {p.desc && <div className="page-sub">{p.desc}</div>}
          </div>
        </div>

        <div className="grid-2" style={{ alignItems:"start" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="card-title">Documents ({pDocs.length})</div>
                <button className="btn btn-primary btn-sm" onClick={() => setAddingDocs(!addingDocs)}>
                  {addingDocs ? "Done" : "+ Add Documents"}
                </button>
              </div>

              {addingDocs && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:11.5, color:"var(--ink3)", marginBottom:10 }}>Select documents to include:</div>
                  {docs.length === 0
                    ? <div style={{ fontSize:12, color:"var(--ink3)" }}>No documents — upload from Documents page first</div>
                    : docs.map(d => (
                      <div key={d.id} onClick={() => toggleDoc(p.id, d.id)}
                        style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:"var(--r)", border:`1px solid ${p.docIds.includes(d.id)?"var(--gold)":"var(--border)"}`, background:p.docIds.includes(d.id)?"rgba(200,146,74,.07)":"transparent", cursor:"pointer", marginBottom:6, transition:"all .13s" }}>
                        <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${p.docIds.includes(d.id)?"var(--gold)":"var(--border2)"}`, background:p.docIds.includes(d.id)?"var(--gold)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {p.docIds.includes(d.id) && <span style={{ fontSize:9, color:"#000", fontWeight:700 }}>✓</span>}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12.5, color:"var(--ink)", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                          <div style={{ fontSize:10.5, color:"var(--ink3)" }}>{d.type} · <span style={{ color:d.status==="analyzed"?"var(--green)":"var(--gold)" }}>{d.status}</span></div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}

              {!addingDocs && pDocs.length === 0 && (
                <div className="empty-state" style={{ padding:"28px 0" }}>
                  <div style={{ fontSize:26 }}>📁</div>
                  <div style={{ color:"var(--ink3)", fontSize:12, marginTop:8 }}>No documents in this project</div>
                  <button className="btn btn-ghost btn-sm mt-3" onClick={() => setAddingDocs(true)}>+ Add Documents</button>
                </div>
              )}

              {!addingDocs && pDocs.map(d => (
                <div key={d.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:"var(--r)", border:"1px solid var(--border)", marginBottom:6 }}>
                  <div style={{ width:28, height:28, borderRadius:5, background:"rgba(200,146,74,.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <IC n={d.type==="excel"?"excel":d.type==="contract"?"contract":"pdf"} s={12} c="var(--gold)" />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12.5, color:"var(--ink)", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                    <div style={{ fontSize:10.5, color:"var(--ink3)" }}>{d.type} · <span style={{ color:d.status==="analyzed"?"var(--green)":"var(--gold)" }}>{d.status}</span></div>
                  </div>
                  <div style={{ display:"flex", gap:5 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Analyze" onClick={() => { setSelectedDoc(d); setPage("analyze"); }}><IC n="ai" s={12} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" title="Remove" onClick={() => toggleDoc(p.id, d.id)} style={{ color:"var(--red)" }}><IC n="trash" s={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div className="card">
              <div className="card-title mb-3">Project Stats</div>
              {[
                { label:"Total Documents",  val:pDocs.length },
                { label:"Analyzed",         val:pDocs.filter(d=>d.status==="analyzed").length },
                { label:"Pending",          val:pDocs.filter(d=>d.status==="pending").length },
                { label:"High Risk Items",  val:pDocs.filter(d=>d.riskLevel==="high").length },
                { label:"Created",          val:new Date(p.createdAt).toLocaleDateString() },
              ].map((s,i) => (
                <div key={i} className="flex items-center justify-between" style={{ padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontSize:12, color:"var(--ink3)" }}>{s.label}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"var(--ink)", fontFamily:"var(--fm)" }}>{s.val}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => setPage("reports")} style={{ justifyContent:"center", width:"100%" }}>
              <IC n="report" s={13} /> Generate Report for This Project
            </button>
            <button className="btn btn-danger" onClick={() => deleteProject(p.id)} style={{ justifyContent:"center", width:"100%" }}>
              <IC n="trash" s={13} /> Delete Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Projects list ───
  return (
    <div>
      <div className="page-header" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div className="page-title">Projects</div>
          <div className="page-sub">Organize documents and generate targeted reports</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ New Project</button>
      </div>

      {showNew && (
        <div className="card mb-4" style={{ borderColor:"rgba(200,146,74,.3)", marginBottom:16 }}>
          <div className="card-title mb-3">New Project</div>
          <div className="input-group">
            <div className="input-label">Project Name *</div>
            <input className="input" placeholder="e.g. Bedroom Costs, Q3 Audit..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key==="Enter" && createProject()} autoFocus />
          </div>
          <div className="input-group">
            <div className="input-label">Description (optional)</div>
            <input className="input" placeholder="Brief description..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          </div>
          <div className="flex gap-2 mt-2">
            <button className="btn btn-primary" onClick={createProject} disabled={!newName.trim()}>Create Project</button>
            <button className="btn btn-ghost" onClick={() => { setShowNew(false); setNewName(""); setNewDesc(""); }}>Cancel</button>
          </div>
        </div>
      )}

      {projects.length === 0 && !showNew ? (
        <div className="card">
          <div className="empty-state" style={{ padding:"60px 0" }}>
            <div className="empty-icon">🗂️</div>
            <div style={{ color:"var(--ink2)", fontSize:14, fontWeight:500 }}>No projects yet</div>
            <div className="text-muted mt-2">Create a project to organize documents and generate targeted reports</div>
            <button className="btn btn-primary mt-4" onClick={() => setShowNew(true)}>+ Create First Project</button>
          </div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:14 }}>
          {projects.map(p => {
            const pDocs = projectDocs(p);
            const analyzed = pDocs.filter(d=>d.status==="analyzed").length;
            return (
              <div key={p.id} className="card" style={{ cursor:"pointer", transition:"all .15s" }}
                onClick={() => setOpenProject(p)}
                onMouseEnter={e => e.currentTarget.style.borderColor=p.color}
                onMouseLeave={e => e.currentTarget.style.borderColor="var(--border)"}
              >
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:`${p.color}20`, border:`1.5px solid ${p.color}40`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:18 }}>🗂️</span>
                  </div>
                  <span style={{ fontSize:10.5, color:"var(--ink3)" }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ fontFamily:"var(--fs)", fontSize:14, fontWeight:600, color:"var(--ink)", marginBottom:4 }}>{p.name}</div>
                {p.desc && <div style={{ fontSize:12, color:"var(--ink3)", marginBottom:12, lineHeight:1.5 }}>{p.desc}</div>}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span className="badge" style={{ background:`${p.color}15`, color:p.color, borderColor:`${p.color}30`, fontSize:10.5 }}>{pDocs.length} docs</span>
                  {analyzed > 0 && <span className="badge badge-green" style={{ fontSize:10.5 }}>{analyzed} analyzed</span>}
                  {pDocs.filter(d=>d.riskLevel==="high").length > 0 && <span className="badge badge-red" style={{ fontSize:10.5 }}>⚠ high risk</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
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

// ─── Incentive Calculator Page ───────────────────────────────────
const TIERS = [
  { achv: 95,  payout: 50  },
  { achv: 100, payout: 100 },
  { achv: 105, payout: 110 },
  { achv: 110, payout: 120 },
  { achv: 115, payout: 130 },
];

function calcIncentive({ salary, target, actual, months }) {
  const errs = [];
  if (!salary || salary <= 0)          errs.push("Basic salary must be > 0");
  if (!target || target <= 0)          errs.push("ROY target must be > 0");
  if (actual === undefined || actual < 0) errs.push("Actual revenue cannot be negative");
  if (!months || months < 1 || months > 7) errs.push("Months served must be 1–7");
  if (errs.length) return { valid: false, errs };

  const mo  = Math.floor(months);
  const achv = (actual / target) * 100;
  const base = salary * 0.20 * mo;

  if (mo < 3)   return { valid: true, qualified: false, reason: `Only ${mo} month${mo>1?"s":""} served — minimum 3 required`, achv, base, payout: 0, final: 0, mo };
  if (achv < 95) return { valid: true, qualified: false, reason: `Achievement ${achv.toFixed(1)}% is below 95% threshold`, achv, base, payout: 0, final: 0, mo };

  let payout;
  if (achv >= 115) {
    payout = 130;
  } else {
    const upper = TIERS.find(t => t.achv >= achv);
    const lower = [...TIERS].reverse().find(t => t.achv <= achv);
    payout = (upper && lower && upper !== lower)
      ? lower.payout + ((achv - lower.achv) / (upper.achv - lower.achv)) * (upper.payout - lower.payout)
      : (lower?.payout ?? 50);
  }

  return { valid: true, qualified: true, achv, payout, base, final: base * (payout / 100), mo };
}

const DEPTS = [
  { id: "sales", label: "Sales", sub: "Rooms Revenue",      icon: "dash"    },
  { id: "hc",    label: "Health Club", sub: "HC Revenue",   icon: "report"  },
  { id: "spa",   label: "SPA",   sub: "SPA Revenue",        icon: "star"    },
  { id: "ce",    label: "C&E",   sub: "C&E Revenue",        icon: "docs"    },
];

function IncentivePage() {
  const [deptId,  setDeptId]  = useState("sales");
  const [mode,    setMode]    = useState("single"); // single | all
  const [form,    setForm]    = useState({ salary: "", target: "", actual: "", months: "7" });
  const [allForms, setAllForms] = useState({ sales:{target:"",actual:""}, hc:{target:"",actual:""}, spa:{target:"",actual:""}, ce:{target:"",actual:""} });
  const [allSalary, setAllSalary] = useState("");
  const [allMonths, setAllMonths] = useState("7");
  const [result,  setResult]  = useState(null);
  const [allResults, setAllResults] = useState(null);

  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const setAF = (d, k) => e => setAllForms(p => ({ ...p, [d]: { ...p[d], [k]: e.target.value } }));
  const fmtN = n => isNaN(n) ? "—" : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtP = n => isNaN(n) ? "—" : n.toFixed(1) + "%";

  const tierColor = (a) => a >= 115 ? "var(--purple)" : a >= 110 ? "var(--blue)" : a >= 105 ? "var(--green)" : a >= 100 ? "var(--green)" : a >= 95 ? "var(--gold)" : "var(--red)";

  const runSingle = () => {
    const r = calcIncentive({ salary: +form.salary, target: +form.target, actual: +form.actual, months: +form.months });
    setResult(r);
  };

  const runAll = () => {
    const results = DEPTS.map(d => ({
      dept: d,
      r: calcIncentive({ salary: +allSalary, target: +allForms[d.id].target, actual: +allForms[d.id].actual, months: +allMonths }),
    }));
    setAllResults(results);
  };

  const dept = DEPTS.find(d => d.id === deptId);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Incentive Calculator</div>
        <div className="page-sub">Performance-based incentive payout for department heads</div>
      </div>

      {/* Mode toggle */}
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        <button className={`btn ${mode==="single"?"btn-primary":"btn-ghost"}`} onClick={() => { setMode("single"); setResult(null); }} style={{ fontSize:12.5 }}>Single Department</button>
        <button className={`btn ${mode==="all"?"btn-primary":"btn-ghost"}`} onClick={() => { setMode("all"); setAllResults(null); }} style={{ fontSize:12.5 }}>All Departments</button>
      </div>

      {mode === "single" && (
        <div>
          {/* Horizontal dept tabs */}
          <div style={{ display:"flex", gap:0, marginBottom:18, border:"1px solid var(--border)", borderRadius:"var(--r)", overflow:"hidden", width:"fit-content" }}>
            {DEPTS.map((d, i) => (
              <button key={d.id} onClick={() => { setDeptId(d.id); setResult(null); }}
                style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 20px", border:"none", borderRight:i<DEPTS.length-1?"1px solid var(--border)":"none", background:deptId===d.id?"rgba(200,146,74,.1)":"var(--surface)", color:deptId===d.id?"var(--gold)":"var(--ink3)", cursor:"pointer", fontFamily:"var(--fb)", fontSize:13, fontWeight:deptId===d.id?600:400, transition:"all .13s" }}>
                <IC n={d.icon} s={12} c={deptId===d.id?"var(--gold)":"var(--ink3)"} />
                {d.label}
              </button>
            ))}
          </div>

        <div className="grid-2" style={{ alignItems:"start" }}>
          {/* Left: inputs */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {/* Inputs */}
            <div className="card">
              <div className="card-title mb-3">Inputs</div>
              <div className="input-group">
                <div className="input-label">Basic Salary</div>
                <input className="input" type="number" placeholder="e.g. 5000" value={form.salary} onChange={setF("salary")} min="0" />
              </div>
              <div className="input-group">
                <div className="input-label">Months Served (1–7)</div>
                <input className="input" type="number" placeholder="7" value={form.months} onChange={setF("months")} min="1" max="7" />
              </div>
              <div className="input-group">
                <div className="input-label">{dept?.sub} — ROY Target</div>
                <input className="input" type="number" placeholder="e.g. 1,000,000" value={form.target} onChange={setF("target")} min="0" />
              </div>
              <div className="input-group">
                <div className="input-label">{dept?.sub} — Actual Achieved</div>
                <input className="input" type="number" placeholder="e.g. 1,050,000" value={form.actual} onChange={setF("actual")} min="0" />
              </div>
              <button className="btn btn-primary mt-2" onClick={runSingle} style={{ width:"100%", justifyContent:"center", padding:"10px" }}>
                <IC n="chart" s={13} /> Calculate Incentive
              </button>
            </div>
          </div>

          {/* Right: result */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {/* Result card */}
            <div className="card" style={{ borderColor: result ? (result.qualified ? "rgba(76,175,125,.3)" : "rgba(224,92,92,.2)") : "var(--border)" }}>
              <div className="card-title mb-3">Result</div>
              {!result && (
                <div className="empty-state" style={{ padding:"40px 0" }}>
                  <div style={{ fontSize:32 }}>🧮</div>
                  <div style={{ color:"var(--ink3)", fontSize:12.5, marginTop:8 }}>Enter values and calculate</div>
                </div>
              )}
              {result && !result.valid && (
                <div style={{ background:"rgba(224,92,92,.08)", border:"1px solid rgba(224,92,92,.2)", borderRadius:"var(--r)", padding:"12px 14px" }}>
                  <div style={{ fontSize:12.5, color:"var(--red)" }}>{result.errs.join(" · ")}</div>
                </div>
              )}
              {result && result.valid && (
                <>
                  {/* Status badge */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                    <span style={{ padding:"5px 12px", borderRadius:99, fontSize:12, fontWeight:600, background:result.qualified?"rgba(76,175,125,.12)":"rgba(224,92,92,.1)", color:result.qualified?"var(--green)":"var(--red)", border:`1px solid ${result.qualified?"rgba(76,175,125,.25)":"rgba(224,92,92,.2)"}` }}>
                      {result.qualified ? "✓ Qualified" : "✗ Not Qualified"}
                    </span>
                    <span style={{ fontSize:11.5, color:"var(--ink3)" }}>{result.mo} months served</span>
                  </div>

                  {!result.qualified && (
                    <div style={{ fontSize:12.5, color:"var(--ink3)", marginBottom:12, padding:"8px 12px", background:"var(--card2)", borderRadius:"var(--r)" }}>
                      {result.reason}
                    </div>
                  )}

                  {/* Metrics grid */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                    {[
                      { label:"Achievement %", val: fmtP(result.achv), color: result.qualified ? tierColor(result.achv) : "var(--red)" },
                      { label:"Payout Rate",   val: result.qualified ? fmtP(result.payout) : "0%", color: result.qualified ? "var(--blue)" : "var(--ink3)" },
                      { label:"Base Incentive", val: fmtN(result.base), color: "var(--ink)" },
                      { label:"Final Incentive", val: result.qualified ? fmtN(result.final) : "0.00", color: result.qualified ? "var(--green)" : "var(--ink3)" },
                    ].map((m, i) => (
                      <div key={i} style={{ background:"var(--card2)", borderRadius:"var(--r)", padding:"12px 14px", border:"1px solid var(--border2)" }}>
                        <div style={{ fontSize:11, color:"var(--ink3)", marginBottom:4 }}>{m.label}</div>
                        <div style={{ fontSize:18, fontWeight:600, color:m.color, fontFamily:"var(--fm)" }}>{m.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  {(() => {
                    const pct = Math.min(result.achv, 135);
                    const pctWidth = Math.max(0, ((pct - 90) / (135 - 90)) * 100);
                    return (
                      <div>
                        <div style={{ height:8, background:"var(--border)", borderRadius:99, overflow:"hidden", marginBottom:4 }}>
                          <div style={{ height:"100%", width:`${pctWidth}%`, background: tierColor(result.achv), borderRadius:99, transition:"width .4s ease" }} />
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--ink3)" }}>
                          <span>95%</span><span>100%</span><span>105%</span><span>110%</span><span>115%+</span>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Tier table — horizontal bars */}
            <div className="card">
              <div className="card-title mb-4">Achievement Tiers</div>
              {[
                { range:"Below 95%", payout:"0% — no incentive", min:0,   max:95,  c:"var(--red)",    barW:8  },
                { range:"95%",       payout:"50%",               min:95,  max:100, c:"var(--gold)",   barW:30 },
                { range:"100%",      payout:"100%",              min:100, max:105, c:"var(--green)",  barW:50 },
                { range:"105%",      payout:"110%",              min:105, max:110, c:"var(--blue)",   barW:65 },
                { range:"110%",      payout:"120%",              min:110, max:115, c:"var(--purple)", barW:80 },
                { range:"115%+",     payout:"130% (capped)",     min:115, max:999, c:"var(--gold)",   barW:100 },
              ].map((t, i) => {
                const active = result?.valid && result.achv >= t.min && result.achv < t.max;
                return (
                  <div key={i} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <span style={{ fontSize:12, color:active?"var(--gold)":"var(--ink2)", fontWeight:active?600:400 }}>{t.range}</span>
                      <span style={{ fontSize:11.5, color:active?"var(--gold)":"var(--ink3)", fontWeight:active?600:400, fontFamily:"var(--fm)" }}>{t.payout}</span>
                    </div>
                    <div style={{ height:7, background:"var(--border)", borderRadius:99, overflow:"hidden", position:"relative" }}>
                      <div style={{ height:"100%", width:`${t.barW}%`, background:t.c, borderRadius:99, opacity:active?1:.55, transition:"width .5s ease" }} />
                    </div>
                    {active && (
                      <div style={{ marginTop:4, fontSize:10.5, color:"var(--gold)", fontWeight:600 }}>
                        ✓ Current tier — {t.barW}% Achievement · {t.payout} Incentive
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ marginTop:14, padding:"10px 12px", background:"var(--card2)", borderRadius:"var(--r)", fontSize:11.5, color:"var(--ink3)", lineHeight:1.7 }}>
                Interpolation: linear between tiers · Pro-ration: min. 3 months to qualify
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* All departments mode */}
      {mode === "all" && (
        <div className="grid-2" style={{ alignItems:"start" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div className="card">
              <div className="card-title mb-3">Shared Inputs</div>
              <div className="input-group">
                <div className="input-label">Basic Salary</div>
                <input className="input" type="number" placeholder="e.g. 5000" value={allSalary} onChange={e => setAllSalary(e.target.value)} min="0" />
              </div>
              <div className="input-group">
                <div className="input-label">Months Served (1–7)</div>
                <input className="input" type="number" placeholder="7" value={allMonths} onChange={e => setAllMonths(e.target.value)} min="1" max="7" />
              </div>
            </div>

            {DEPTS.map(d => (
              <div key={d.id} className="card">
                <div className="flex items-center gap-2 mb-3">
                  <IC n={d.icon} s={13} c="var(--gold)" />
                  <div className="card-title">{d.label} — {d.sub}</div>
                </div>
                <div className="input-group">
                  <div className="input-label">ROY Target</div>
                  <input className="input" type="number" placeholder="Budget target" value={allForms[d.id].target} onChange={setAF(d.id, "target")} min="0" />
                </div>
                <div className="input-group">
                  <div className="input-label">Actual Achieved</div>
                  <input className="input" type="number" placeholder="Actual revenue" value={allForms[d.id].actual} onChange={setAF(d.id, "actual")} min="0" />
                </div>
              </div>
            ))}

            <button className="btn btn-primary" onClick={runAll} style={{ width:"100%", justifyContent:"center", padding:"11px" }}>
              <IC n="chart" s={13} /> Calculate All Departments
            </button>
          </div>

          {/* All results */}
          <div className="card" style={{ minHeight:400 }}>
            <div className="card-title mb-3">Results</div>
            {!allResults && (
              <div className="empty-state" style={{ padding:"48px 0" }}>
                <div style={{ fontSize:32 }}>📊</div>
                <div style={{ color:"var(--ink3)", fontSize:12.5, marginTop:8 }}>Fill inputs and calculate</div>
              </div>
            )}
            {allResults && (
              <>
                {allResults.map(({ dept: d, r }, i) => (
                  <div key={i} style={{ padding:"12px 14px", borderRadius:"var(--r)", border:`1px solid ${r.valid&&r.qualified?"rgba(76,175,125,.2)":"rgba(224,92,92,.15)"}`, background:r.valid&&r.qualified?"rgba(76,175,125,.04)":"rgba(224,92,92,.03)", marginBottom:8 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <IC n={d.icon} s={13} c="var(--gold)" />
                        <span style={{ fontWeight:500, fontSize:13, color:"var(--ink)", fontFamily:"var(--fb)" }}>{d.label}</span>
                        <span style={{ fontSize:11, color:"var(--ink3)" }}>{d.sub}</span>
                      </div>
                      <span style={{ fontSize:11.5, fontWeight:600, padding:"3px 10px", borderRadius:99, background:r.valid&&r.qualified?"rgba(76,175,125,.12)":"rgba(224,92,92,.1)", color:r.valid&&r.qualified?"var(--green)":"var(--red)" }}>
                        {r.valid ? (r.qualified ? "Qualified" : "Not qualified") : "Input error"}
                      </span>
                    </div>
                    {r.valid && (
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                        {[
                          { l:"Achievement", v: fmtP(r.achv),  c: r.qualified ? tierColor(r.achv) : "var(--red)" },
                          { l:"Payout %",    v: r.qualified ? fmtP(r.payout) : "0%", c:"var(--ink2)" },
                          { l:"Base",        v: fmtN(r.base),  c:"var(--ink2)" },
                          { l:"Final",       v: r.qualified ? fmtN(r.final) : "0.00", c: r.qualified ? "var(--green)" : "var(--ink3)" },
                        ].map((m, j) => (
                          <div key={j}>
                            <div style={{ fontSize:10.5, color:"var(--ink3)", marginBottom:2 }}>{m.l}</div>
                            <div style={{ fontSize:13.5, fontWeight:600, color:m.c, fontFamily:"var(--fm)" }}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!r.valid && <div style={{ fontSize:12, color:"var(--red)" }}>{r.errs?.join(" · ")}</div>}
                    {r.valid && !r.qualified && <div style={{ fontSize:11.5, color:"var(--ink3)", marginTop:6 }}>{r.reason}</div>}
                  </div>
                ))}
                {/* Total */}
                {(() => {
                  const q = allResults.filter(x => x.r.valid && x.r.qualified);
                  const total = q.reduce((s, x) => s + x.r.final, 0);
                  return (
                    <div style={{ borderTop:"1px solid var(--border)", paddingTop:12, display:"flex", justifyContent:"space-between", fontSize:13 }}>
                      <span style={{ color:"var(--ink3)" }}>{q.length} of {allResults.length} departments qualified</span>
                      <span style={{ fontWeight:600, color:"var(--green)", fontFamily:"var(--fm)" }}>Total: {fmtN(total)}</span>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      )}
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

  const projectCount = projectStore.get(user.id).length;
  const NAV_SECTIONS = [
    {
      heading: "Workspace",
      items: [
        { id: "dashboard", label: "Dashboard",   icon: "dash"                         },
        { id: "documents", label: "Documents",   icon: "docs",   badge: pending||null },
        { id: "projects",  label: "Projects",    icon: "folder", badge: projectCount||null },
        { id: "analyze",   label: "AI Analysis", icon: "ai"                           },
        { id: "reports",   label: "Reports",     icon: "report"                       },
        { id: "incentive", label: "Incentives",  icon: "chart"                        },
      ],
    },
    {
      heading: "Portfolio",
      items: [
        { id: "market",         label: "Market",        icon: "chart" },
        { id: "sustainability", label: "Sustainability", icon: "star"  },
        { id: "notifications",  label: "Notifications", icon: "bell"  },
        { id: "referrals",      label: "Referrals",     icon: "users" },
      ],
    },
    {
      heading: "Account",
      items: [
        { id: "security", label: "Security", icon: "lock"     },
        { id: "settings", label: "Settings", icon: "settings" },
      ],
    },
  ];
  const NAV = NAV_SECTIONS.flatMap(s => s.items);

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
          {NAV_SECTIONS.map(section => (
            <div key={section.heading}>
              <div className="nav-section">{section.heading}</div>
              {section.items.map(item => (
                <button key={item.id} className={`nav-item${page===item.id?" active":""}`} onClick={() => setPage(item.id)}>
                  <IC n={item.icon} s={14} />
                  {item.label}
                  {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
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
          {page === "dashboard"     && <Dashboard         user={user} docs={docs} setPage={setPage} />}
          {page === "documents"     && <DocumentsPage     user={user} docs={docs} setDocs={setDocs} toast={toast} setPage={setPage} setSelectedDoc={setSelectedDoc} />}
          {page === "analyze"       && <AnalyzePage       user={user} docs={docs} setDocs={setDocs} toast={toast} selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} />}
          {page === "projects"      && <ProjectsPage      user={user} docs={docs} setDocs={setDocs} toast={toast} setPage={setPage} setSelectedDoc={setSelectedDoc} />}
          {page === "reports"       && <ReportsPage       user={user} docs={docs} toast={toast} />}
          {page === "incentive"     && <IncentivePage />}
          {page === "market"        && <MarketPage />}
          {page === "security"      && <SecurityPage      toast={toast} />}
          {page === "sustainability" && <SustainabilityPage />}
          {page === "notifications" && <NotificationsPage />}
          {page === "referrals"     && <ReferralPage      user={user} toast={toast} />}
          {page === "settings"      && <SettingsPage      user={user} toast={toast} />}
        </div>
      </main>

      <Toasts toasts={toasts} />
    </div>
  );
}
