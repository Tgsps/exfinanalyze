import { useState, useRef } from "react";
import { waitlist } from "../lib/waitlist";

const ROLES = [
  "Junior Accountant","Senior Accountant","Financial Analyst",
  "Audit Team Member","Finance Manager / Controller","CFO / VP Finance","Other",
];
const SIZES = [
  "Solo / Freelance","2–10 employees","11–50 employees",
  "51–200 employees","200+ employees",
];

const VALID_NAME = /^[\p{L}\s\-'.]+$/u;

const FS = {
  width: "100%", padding: "11px 14px", border: "1px solid #243028",
  borderRadius: 6, fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: 13, background: "#0D1510", color: "#E8E4DC", outline: "none",
  transition: "border-color .15s, box-shadow .15s",
};

export default function WaitlistForm({ onSuccess }) {
  const [form,   setForm]   = useState({ name: "", email: "", role: "", company: "", size: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [err,    setErr]    = useState("");
  const submitCount = useRef(0);
  const lastWindow  = useRef(0);

  const validName  = form.name.trim().length >= 2 && VALID_NAME.test(form.name.trim());
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const canSubmit  = validName && validEmail && form.role && form.size;

  const field = (key, placeholder, type = "text") => (
    <input
      type={type} placeholder={placeholder} value={form[key]}
      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
      style={{ ...FS, "::placeholder": { color: "#6B6760" } }}
      onFocus={e => { e.target.style.borderColor = "#00C97A"; e.target.style.boxShadow = "0 0 0 3px rgba(0,201,122,.08)"; }}
      onBlur={e => { e.target.style.borderColor = "#243028"; e.target.style.boxShadow = "none"; }}
    />
  );

  const select = (key, placeholder, opts) => (
    <select
      value={form[key]}
      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
      style={{
        ...FS, appearance: "none", cursor: "pointer",
        color: form[key] ? "#E8E4DC" : "#6B6760",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B6760' stroke-width='1.5' stroke-linecap='round' fill='none'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 11px center",
        paddingRight: 30,
      }}
      onFocus={e => { e.target.style.borderColor = "#00C97A"; e.target.style.boxShadow = "0 0 0 3px rgba(0,201,122,.08)"; }}
      onBlur={e => { e.target.style.borderColor = "#243028"; e.target.style.boxShadow = "none"; }}
    >
      <option value="" disabled>{placeholder}</option>
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const submit = async () => {
    if (!canSubmit) {
      if (!validName && form.name.trim()) setErr("Please enter a valid full name.");
      else if (!validEmail && form.email.trim()) setErr("Please enter a valid email address.");
      else setErr("Please fill in all required fields.");
      return;
    }
    const now = Date.now();
    if (now - lastWindow.current >= 60_000) { submitCount.current = 0; lastWindow.current = now; }
    submitCount.current++;
    if (submitCount.current > 3) { setErr("Too many attempts. Please wait a minute."); return; }

    setErr(""); setStatus("loading");
    try {
      const entry = await waitlist.insert({
        name:    form.name.trim(),
        email:   form.email.trim().toLowerCase(),
        role:    form.role,
        company: form.company.trim() || null,
        size:    form.size,
      });
      setStatus("success");
      onSuccess?.(entry);
    } catch (e) {
      setErr(waitlist.isDuplicateError(e) ? "Something went wrong or this email is already registered." : "Something went wrong — please try again.");
      setStatus("idle");
    }
  };

  if (status === "success") return (
    <div style={{ textAlign: "center", padding: "40px 16px", animation: "slideUp .5s ease forwards" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,201,122,.1)", border: "2px solid rgba(0,201,122,.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>🎉</div>
      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 24, fontWeight: 500, marginBottom: 8, color: "#E8E4DC" }}>You're on the list!</div>
      <div style={{ fontSize: 13.5, color: "#A8A49C", lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
        We'll reach out with early access, exclusive pricing, and launch updates.
      </div>
      <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", background: "rgba(0,201,122,.08)", borderRadius: 20, fontSize: 12.5, color: "#00C97A", fontWeight: 600, border: "1px solid rgba(0,201,122,.2)" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00C97A", display: "inline-block", boxShadow: "0 0 6px #00C97A" }} />
        Confirmed ✓
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {field("name",  "Full name *")}
        {field("email", "Work email *", "email")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {select("role", "Your role *", ROLES)}
        {select("size", "Company size *", SIZES)}
      </div>
      {field("company", "Company name (optional)")}

      {err && (
        <div style={{ fontSize: 12.5, color: "#E05C5C", padding: "9px 12px", background: "rgba(224,92,92,.08)", borderRadius: 6, border: "1px solid rgba(224,92,92,.2)", animation: "slideUp .3s ease" }}>
          {err}
        </div>
      )}

      <button
        onClick={submit}
        disabled={status === "loading"}
        style={{
          padding: "13px 24px", background: "#00C97A", color: "#000",
          border: "none", borderRadius: 6, fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: 700, fontSize: 14,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          opacity: status === "loading" ? .75 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all .2s",
          marginTop: 2,
        }}
        onMouseEnter={e => { if (status !== "loading") { e.currentTarget.style.background = "#33E895"; e.currentTarget.style.boxShadow = "0 0 20px rgba(0,201,122,.35)"; }}}
        onMouseLeave={e => { if (status !== "loading") { e.currentTarget.style.background = "#00C97A"; e.currentTarget.style.boxShadow = "none"; }}}
      >
        {status === "loading" ? (
          <>
            <div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,.2)", borderTopColor: "#000", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
            Securing your spot…
          </>
        ) : "→  Join the Early Access Waitlist"}
      </button>

      <div style={{ fontSize: 11.5, color: "#6B6760", textAlign: "center" }}>
        No spam. Early members get 40% off at launch — forever.
      </div>
    </div>
  );
}
