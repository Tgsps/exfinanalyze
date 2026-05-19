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

// Unicode-aware name validation (accepts Arabic, CJK, accented chars)
const VALID_NAME = /^[\p{L}\s\-'.]+$/u;

const FS = {
  width: "100%", padding: "13px 16px", border: "1.5px solid #E0DAC8",
  borderRadius: 4, fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: 14, background: "#fff", color: "#16140F", outline: "none",
  transition: "border-color .2s",
};

export default function WaitlistForm({ onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", role: "", company: "", size: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [err, setErr] = useState("");
  const submitCount = useRef(0);
  const lastWindow = useRef(0);

  const validName  = form.name.trim().length >= 2 && VALID_NAME.test(form.name.trim());
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const canSubmit  = validName && validEmail && form.role && form.size;

  const field = (key, placeholder, type = "text") => (
    <input
      type={type} placeholder={placeholder} value={form[key]}
      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
      style={FS}
      onFocus={e => (e.target.style.borderColor = "#C8924A")}
      onBlur={e => (e.target.style.borderColor = "#E0DAC8")}
    />
  );

  const select = (key, placeholder, opts) => (
    <select
      value={form[key]}
      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
      style={{ ...FS, appearance: "none", cursor: "pointer", color: form[key] ? "#16140F" : "#B0ADA5" }}
      onFocus={e => (e.target.style.borderColor = "#C8924A")}
      onBlur={e => (e.target.style.borderColor = "#E0DAC8")}
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

    // Client-side rate limit: max 3 per 60s window (server RLS is the real gate)
    const now = Date.now();
    if (now - lastWindow.current >= 60_000) {
      submitCount.current = 0;
      lastWindow.current = now;
    }
    submitCount.current++;
    if (submitCount.current > 3) {
      setErr("Too many attempts. Please wait a minute and try again.");
      return;
    }

    setErr("");
    setStatus("loading");
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
      if (waitlist.isDuplicateError(e)) {
        // Same message regardless — prevents enumeration
        setErr("Something went wrong or this email is already registered. Please try again.");
      } else {
        setErr("Something went wrong — please try again.");
      }
      setStatus("idle");
    }
  };

  if (status === "success") return (
    <div style={{ textAlign: "center", padding: "48px 24px", animation: "slideUp .5s ease forwards" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F5ECD8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>🎉</div>
      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, fontWeight: 500, marginBottom: 8, color: "#16140F" }}>You're on the list!</div>
      <div style={{ fontSize: 14, color: "#5A574E", lineHeight: 1.6, maxWidth: 360, margin: "0 auto" }}>
        We'll reach out with early access, exclusive pricing, and launch updates.
      </div>
      <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", background: "#F5ECD8", borderRadius: 20, fontSize: 13, color: "#C8924A", fontWeight: 600, border: "1px solid #E8C88A" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#27C93F", display: "inline-block" }} />Confirmed
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
        <div style={{ fontSize: 13, color: "#9A3B2A", padding: "10px 14px", background: "#FEF2EF", borderRadius: 4, border: "1px solid #F5C5BC", animation: "slideUp .3s ease" }}>
          {err}
        </div>
      )}

      <button
        onClick={submit}
        disabled={status === "loading"}
        style={{
          padding: "15px 24px", background: "#16140F", color: "#F7F4ED",
          border: "none", borderRadius: 4, fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: 600, fontSize: 15,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          opacity: status === "loading" ? .75 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "background .2s",
        }}
        onMouseEnter={e => { if (status !== "loading") e.currentTarget.style.background = "#C8924A"; }}
        onMouseLeave={e => { if (status !== "loading") e.currentTarget.style.background = "#16140F"; }}
      >
        {status === "loading" ? (
          <>
            <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
            Securing your spot…
          </>
        ) : "→  Join the Early Access Waitlist"}
      </button>

      <div style={{ fontSize: 12, color: "#B0ADA5", textAlign: "center" }}>
        No spam. Early members get 40% off at launch — forever.
      </div>
    </div>
  );
}
