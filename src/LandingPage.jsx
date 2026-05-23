import { useState, useEffect, useRef } from "react";
import { waitlist } from "./lib/waitlist";
import { useCountUp } from "./hooks/useCountUp";
import { useVis } from "./hooks/useVis";
import WaitlistForm from "./components/WaitlistForm";
import MockExtract from "./components/mocks/MockExtract";
import MockShadow from "./components/mocks/MockShadow";
import MockClose from "./components/mocks/MockClose";

/* Responsive overrides — everything else lives in index.css */
const ANIM = `
  @media(max-width:768px){
    .hero-grid{grid-template-columns:1fr!important}
    .features-grid{grid-template-columns:1fr!important}
    .stats-grid{grid-template-columns:1fr!important}
    .pricing-grid{grid-template-columns:1fr!important}
    .waitlist-grid{grid-template-columns:1fr!important}
    .testimonials-grid{grid-template-columns:1fr!important}
    .nav-links{display:none!important}
    .hero-mock{display:none!important}
  }
`;

const TICKER_ITEMS = [
  "Extract PDFs in seconds","Flag contract risks automatically","Generate MD&A narratives",
  "Train junior staff in real-time","Detect anomalies before close","Zero manual data entry",
  "Source-backed every claim",
];

const FEATURES = [
  {
    tag:"01 — Extraction", tc:"var(--gold-p)", tt:"var(--gold)",
    title:"Template-free document intelligence",
    body:"Drop any PDF, contract, or Excel file. ExFinAnalyze reads it without templates — extracting every field with a confidence score and a citation to the exact page and clause it came from.",
    bullets:["Source-backed citations for every extracted field","Risk flags for pricing uplifts, liability gaps, and anomalies","Cross-reference POs, invoices, and bank statements automatically"],
    bc:"var(--gold)", Mock:MockExtract, flip:false,
  },
  {
    tag:"02 — Learning", tc:"#E8F0EB", tt:"var(--green)",
    title:"AI Shadow Reviewer — learn on real work",
    body:"Unlike any tool on the market, ExFinAnalyze works alongside junior employees — showing what the AI would have decided, and why. Every accounting standard decision explained in plain English.",
    bullets:["Parallel AI review with step-by-step reasoning","Instant ASC 842 / ASC 606 explanations on every decision","Flags when it disagrees — and teaches why"],
    bc:"var(--green)", Mock:MockShadow, flip:true,
  },
  {
    tag:"03 — Close", tc:"#EEF0F8", tt:"#3B4F8C",
    title:"Month-end close, without the crunch",
    body:"Real-time variance analysis, 100% transaction anomaly detection, and AI-generated MD&A narratives — all in one dashboard. Close faster with less stress, every single month.",
    bullets:["Scans every transaction, not just a sample","AI writes the management commentary first draft","Anomaly alerts before they become audit issues"],
    bc:"#3B4F8C", Mock:MockClose, flip:false,
  },
];

const PROBLEMS = [
  ["⏱","70% of time wasted","Analysts spend most of their day collecting and formatting data — not analyzing it."],
  ["📚","Junior staff left to guess","ASC 842 and ASC 606 are learned through mistakes. Managers don't have time to train everyone individually."],
  ["🗓","Month-end chaos, every time","Reconciling transactions, writing variance narratives, and chasing missing documents creates a crunch cycle every 30 days."],
];

const PRICING = [
  { tier:"Starter", price:"Free", period:"forever", desc:"For individual accountants exploring AI-assisted analysis.", features:["5 documents/month","Basic extraction","ASC 842 lease classifier","Email support"], cta:"Get started free", hi:false, action:"waitlist" },
  { tier:"Professional", price:"$49", period:"/month", desc:"For growing teams who need speed and accuracy at month-end.", features:["Unlimited documents","AI Shadow Reviewer","Month-end close dashboard","Priority support","Export to QuickBooks & Xero"], cta:"Join waitlist — 40% off", hi:true, action:"waitlist" },
  { tier:"Team", price:"Custom", period:"", desc:"For accounting firms and corporate finance departments.", features:["Everything in Professional","Multi-entity close management","SSO & audit trail","Dedicated onboarding","SLA + SOC 2 Type II"], cta:"Contact sales", hi:false, action:"contact" },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [count, setCount]       = useState(null);
  const wlRef = useRef(null);
  const [sRef, sVis] = useVis(0.3);
  const c70  = useCountUp(70,  1600, sVis);
  const c98  = useCountUp(98,  1800, sVis);
  const c40  = useCountUp(40,  1400, sVis);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    waitlist.getCount().then(setCount).catch(() => {});
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = () => wlRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  const PB = {
    padding: "14px 32px", background: "var(--ink)", color: "var(--cream)",
    border: "none", borderRadius: 4, fontFamily: "var(--fb)", fontWeight: 600,
    fontSize: 15, cursor: "pointer", letterSpacing: "-0.02em", transition: "background .2s",
  };

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh", overflowX: "hidden", fontFamily: "var(--fb)" }}>
      <style>{ANIM}</style>

      {/* TICKER */}
      <div style={{ background: "var(--ink)", padding: "7px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "ticker 30s linear infinite", width: "200%", willChange: "transform" }}>
          {[0,1].map(x => (
            <div key={x} style={{ display: "flex", whiteSpace: "nowrap", flex: "0 0 50%" }}>
              {TICKER_ITEMS.map((t, i) => (
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
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 32, fontSize: 14, color: "var(--ink-60)" }}>
            {[["Features","#features"],["How it works","#how"],["Pricing","#pricing"]].map(([l,h]) => (
              <a key={l} href={h} style={{ textDecoration: "none", color: "inherit", transition: "color .2s" }}
                onMouseEnter={e => (e.target.style.color = "var(--ink)")}
                onMouseLeave={e => (e.target.style.color = "var(--ink-60)")}>{l}</a>
            ))}
            <button onClick={scrollTo} style={{ padding: "8px 20px", background: "var(--ink)", color: "var(--cream)", border: "none", borderRadius: 4, fontFamily: "var(--fb)", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "background .2s" }}
              onMouseEnter={e => (e.target.style.background = "var(--gold)")}
              onMouseLeave={e => (e.target.style.background = "var(--ink)")}>
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
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", minHeight: 540 }}>
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
                <button onClick={scrollTo} style={PB}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--ink)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  → Join the waitlist
                </button>
                <a href="#features" style={{ padding: "14px 28px", background: "transparent", color: "var(--ink)", border: "1.5px solid var(--border)", borderRadius: 4, fontFamily: "var(--fb)", fontWeight: 500, fontSize: 15, textDecoration: "none", display: "inline-flex", alignItems: "center", transition: "border-color .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--ink)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                  See how it works
                </a>
              </div>
              <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex" }}>
                  {["SC","MK","JP","LR"].map((ini,x) => (
                    <div key={x} style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid var(--cream)", background: ["#C8924A","#2C5F42","#3B4F8C","#7A3D6B"][x], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", marginLeft: x ? -8 : 0 }}>{ini}</div>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-60)" }}>
                  <strong style={{ color: "var(--ink)" }}>{count !== null ? `${count} finance pro${count !== 1 ? "s" : ""}` : "Finance pros"}</strong> already waiting
                </div>
              </div>
            </div>
            <div className="hero-mock" style={{ animation: "fadeUp .8s .2s ease both", position: "relative" }}>
              <div style={{ position: "absolute", top: -16, right: -16, bottom: -16, left: 16, background: "var(--gold)", opacity: .1, borderRadius: 12, transform: "rotate(2deg)" }} />
              <div style={{ position: "relative", animation: "float 7s ease-in-out 1s infinite" }}><MockExtract /></div>
            </div>
          </div>
        </div>
        <div style={{ height: 80, background: "linear-gradient(to bottom,transparent,var(--cream))", marginTop: -80, position: "relative", zIndex: 2 }} />
      </section>

      {/* STATS */}
      <section ref={sRef} style={{ padding: "48px 40px", background: "var(--ink)" }}>
        <div className="stats-grid" style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
          {[
            [`${c70}%`,"of finance team time spent on data collection","Reclaimed for strategy with ExFinAnalyze"],
            [`${c98}%`,"average extraction accuracy across document types","With full source citations per field"],
            [`${c40}%`,"faster month-end close reported by AI-native teams","From 5-day cycle to under 3"],
          ].map(([n,l,s],i) => (
            <div key={i} style={{ padding: "40px 44px", borderRight: i<2 ? "1px solid #2A2820" : "none" }}>
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
            <h2 style={{ fontFamily: "var(--fd)", fontSize: 40, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--ink)" }}>Finance teams are buried<br /><em>in documents, not decisions.</em></h2>
          </div>
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {PROBLEMS.map(([ic,t,b],i) => (
              <div key={i} style={{ padding: 32, border: "1.5px solid var(--border)", borderRadius: 6, transition: "transform .25s,box-shadow .25s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--sl)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
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
            <h2 style={{ fontFamily: "var(--fd)", fontSize: 40, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--ink)" }}>Three tools.<br /><em>One workflow.</em></h2>
          </div>
          {FEATURES.map(({ tag, tc, tt, title, body, bullets, bc, Mock, flip }, i) => (
            <div key={i} className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center", marginBottom: i < 2 ? 100 : 0 }}>
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
              <div style={{ order: flip ? 1 : 2, animation: `float ${6+i}s ease-in-out ${i*0.4}s infinite` }}>
                <Mock />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "80px 40px", background: "var(--ink)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold)", fontWeight: 600, marginBottom: 12 }}>Early Testers</div>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", color: "#E8E6DF", margin: 0 }}>What reviewers are saying</h2>
          </div>
          <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              ["The Shadow Reviewer is unlike anything I've seen. My junior team is finally learning on the job instead of making the same mistakes twice.", "Marcus K.", "Controller, SaaS startup (Series B)", "MK", "#2C5F42"],
              ["Month-end used to take our team 6 days. The narrative generator alone saves us 4-5 hours every close cycle.", "Sarah L.", "Senior Accountant, Regional CPA Firm", "SL", "#9A3B2A"],
              ["We reviewed the lease extraction against our manual workpapers. 97% match on 80+ fields. The source citations made it immediately auditable.", "James P.", "Audit Manager, Mid-size Practice", "JP", "#3B4F8C"],
            ].map(([q, n, r, ini, bg], i) => (
              <div key={i} style={{ background: "#1F1F1D", borderRadius: 6, padding: 28, border: "1px solid #2A2820" }}>
                <div style={{ fontSize: 28, color: "var(--gold)", marginBottom: 14, lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 14, color: "#C8C5BE", lineHeight: 1.7, marginBottom: 22, fontFamily: "var(--fd)", fontStyle: "italic" }}>{q}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>{ini}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#E8E6DF" }}>{n}</div>
                    <div style={{ fontSize: 12, color: "#6B6963" }}>{r}</div>
                  </div>
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
            <h2 style={{ fontFamily: "var(--fd)", fontSize: 40, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--ink)" }}>Priced for the individual.<br /><em>Sold to the firm.</em></h2>
            <p style={{ marginTop: 14, fontSize: 14, color: "var(--ink-60)" }}>No seat minimums. No 6-month onboarding. Start in minutes.</p>
          </div>
          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, maxWidth: 900, margin: "0 auto" }}>
            {PRICING.map((p, i) => (
              <div key={i} style={{ padding: 28, border: p.hi ? "2px solid var(--ink)" : "1.5px solid var(--border)", borderRadius: 6, position: "relative", background: p.hi ? "var(--ink)" : "var(--white)", transition: "transform .2s,box-shadow .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--sl)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
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
                <button
                  onClick={() => p.action === "contact" ? (window.location.href = "mailto:hello@exfinanalyze.com") : scrollTo()}
                  style={{ width: "100%", padding: "12px", border: p.hi ? "none" : "1.5px solid var(--ink)", borderRadius: 4, background: p.hi ? "var(--gold)" : "transparent", color: "var(--ink)", fontFamily: "var(--fb)", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = p.hi ? "var(--gold-l)" : "var(--ink)"; if (!p.hi) e.currentTarget.style.color = "var(--cream)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = p.hi ? "var(--gold)" : "transparent"; if (!p.hi) e.currentTarget.style.color = "var(--ink)"; }}>
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
          <div className="waitlist-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold)", fontWeight: 600, marginBottom: 16 }}>Early Access</div>
              <h2 style={{ fontFamily: "var(--fd)", fontSize: 44, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.05, color: "var(--ink)", marginBottom: 20 }}>Be first.<br /><em>Get more.</em></h2>
              <p style={{ fontSize: 15, color: "var(--ink-60)", lineHeight: 1.7, marginBottom: 36 }}>ExFinAnalyze launches Q2 2026. Early access members get priority onboarding, permanent pricing discounts, and a direct line to shape the product.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {[["🏷","40% off — forever","Lock in the early access price before launch. The discount never expires."],["⚡","Priority onboarding","Skip the queue. Get a 1-on-1 setup session and your first document analyzed before anyone else."],["🎯","Shape the product","Your feedback directly influences what we build next. Early members have a seat at the table."]].map(([ic,t,b],i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, background: "var(--gold-p)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{ic}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 4 }}>{t}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-60)", lineHeight: 1.5 }}>{b}</div>
                    </div>
                  </div>
                ))}
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
                <WaitlistForm onSuccess={() => waitlist.getCount().then(setCount)} />
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
              {[["Privacy","mailto:privacy@exfinanalyze.com"],["Terms","mailto:legal@exfinanalyze.com"],["Security","mailto:security@exfinanalyze.com"],["Contact","mailto:hello@exfinanalyze.com"]].map(([l,h]) => (
                <a key={l} href={h} style={{ textDecoration: "none", color: "inherit", transition: "color .2s" }}
                  onMouseEnter={e => (e.target.style.color = "#E8E6DF")}
                  onMouseLeave={e => (e.target.style.color = "#6B6963")}>{l}</a>
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
