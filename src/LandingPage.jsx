import { useState, useEffect, useRef } from "react";
import { waitlist } from "./lib/waitlist";
import { useCountUp } from "./hooks/useCountUp";
import { useVis } from "./hooks/useVis";
import WaitlistForm from "./components/WaitlistForm";

/* ═══════════════════════════════════════════════════════════
   ExFinAnalyze Landing Page — v2 Dark Green Redesign
   Matches Stitch mockups: hero, features, trust, pricing,
   waitlist, footer.
═══════════════════════════════════════════════════════════ */

const ANIM = `
  @media(max-width:768px){
    .lp-hero-grid{grid-template-columns:1fr!important}
    .lp-features-grid{grid-template-columns:1fr!important}
    .lp-stats-grid{grid-template-columns:1fr!important}
    .lp-pricing-grid{grid-template-columns:1fr!important}
    .lp-waitlist-grid{grid-template-columns:1fr!important}
    .lp-testimonials-grid{grid-template-columns:1fr!important}
    .lp-nav-links{display:none!important}
    .lp-hero-mock{display:none!important}
  }
  .lp-link:hover{color:#E8E4DC!important}
  .lp-feat-card{transition:transform .25s,box-shadow .25s,border-color .25s;}
  .lp-feat-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.5),0 0 24px rgba(0,201,122,.06)!important;border-color:rgba(0,201,122,.25)!important;}
  .lp-price-card{transition:transform .2s,box-shadow .2s;}
  .lp-price-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.5)!important;}
`;

const BG = "#09110D";
const SURF = "#0D1510";
const CARD = "#111914";
const BORDER = "#1C2620";
const BORDER2 = "#243028";
const GREEN = "#00C97A";
const GREEN_L = "#33E895";
const INK = "#E8E4DC";
const INK2 = "#A8A49C";
const INK3 = "#6B6760";

const TICKER_ITEMS = [
  "Autonomous portfolio optimization","Neural fraud detection in real-time","Predictive market analytics",
  "24/7 AI financial concierge","Green finance scoring & ESG tracking","Smart investment automation",
  "Instant risk assessment","Neural market sentiment analysis","AI-generated financial reports",
];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    title: "Autonomous Investing",
    body: "Self-optimizing portfolios driven by adaptive machine learning models for consistent, data-backed returns.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Neural Security",
    body: "Proactive, AI-powered threat detection and fraud prevention, safeguarding assets in real-time.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
    title: "Predictive Analytics",
    body: "Forecast market trends and financial outcomes with unparalleled accuracy using advanced predictive algorithms.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: "Smart Automation",
    body: "Streamline operations, reduce manual tasks, and execute complex financial strategies with intelligent workflows.",
  },
];

const PRICING = [
  {
    tier: "Starter",
    price: "$49",
    period: "/month",
    desc: "For individual investors exploring AI-assisted analysis.",
    features: ["Basic AI-Ranked Analysis","5 Portfolio Trackers","Limited Green Tech Reports","Standard Support","Data Export"],
    cta: "Get Started",
    hi: false,
    action: "waitlist",
  },
  {
    tier: "Professional",
    price: "$149",
    period: "/month",
    desc: "For active investors who need speed and accuracy.",
    features: ["Advanced AI & Predictions","Unlimited Portfolio Trackers","Exclusive Green Tech Reports","Priority 24/7 Support","API Access","Custom Alerts","Team Collaboration"],
    cta: "Upgrade Now",
    hi: true,
    action: "waitlist",
  },
  {
    tier: "Enterprise",
    price: "Contact Sales",
    period: "",
    desc: "For firms and institutions needing full-suite AI tools.",
    features: ["Full Suite AI Tools","Portfolio Account Manager","Bespoke Green-Tech Solutions","SLA Support","Green Economy Scoreboard","Custom Discount"],
    cta: "Contact us",
    hi: false,
    action: "contact",
  },
];

/* Hero dashboard mock */
function HeroDashboardMock() {
  const pts1 = "0,60 12,52 25,45 38,55 50,38 62,42 75,28 88,24 100,18";
  const pts2 = "0,68 15,70 30,60 45,65 60,50 75,48 90,38 100,32";
  return (
    <div style={{
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: `0 24px 64px rgba(0,0,0,.6), 0 0 40px rgba(0,201,122,.08)`,
      userSelect: "none",
    }}>
      {/* Topbar */}
      <div style={{ background: SURF, borderBottom: `1px solid ${BORDER}`, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 12, color: GREEN, fontWeight: 700 }}>ExFinAnalyze</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {["Dashboard","Portfolio","AI Insights"].map(t => (
            <span key={t} style={{ fontSize: 10, color: INK3, cursor: "pointer" }}>{t}</span>
          ))}
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#000" }}>A</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 110px", gap: 0, height: 260 }}>
        {/* Sidebar mini */}
        <div style={{ background: SURF, borderRight: `1px solid ${BORDER}`, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
          {["📊 Dashboard","📄 Documents","🤖 AI Analysis","📈 Reports","⚡ Incentives"].map((item, i) => (
            <div key={i} style={{
              padding: "6px 8px", borderRadius: 4, fontSize: 9, color: i === 0 ? GREEN : INK3,
              background: i === 0 ? `rgba(0,201,122,.1)` : "transparent",
              border: i === 0 ? `1px solid rgba(0,201,122,.15)` : "1px solid transparent",
            }}>{item}</div>
          ))}
        </div>

        {/* Center */}
        <div style={{ padding: "12px", overflow: "hidden" }}>
          <div style={{ fontSize: 9, color: INK3, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Portfolio Command Center</div>
          {/* Balance row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, background: "#141C17", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 8, color: INK3, marginBottom: 3 }}>Total Balance</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>$124,567</div>
              <div style={{ fontSize: 8, color: GREEN, marginTop: 2 }}>▲ +12.5%</div>
              <svg width="100%" height="24" viewBox={`0 0 100 24`} preserveAspectRatio="none" style={{ marginTop: 4 }}>
                <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GREEN} stopOpacity=".18"/><stop offset="100%" stopColor={GREEN} stopOpacity="0"/></linearGradient></defs>
                <polygon points={`0,24 ${pts1} 100,24`} fill="url(#hg)"/>
                <polyline points={pts1} fill="none" stroke={GREEN} strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ flex: 1, background: "#141C17", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 8, color: INK3, marginBottom: 5 }}>AI Assistant</div>
              {["Portfolio optimization ready","New stock picks available","Pattern detected"].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 5, marginBottom: 4, alignItems: "flex-start" }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: GREEN, flexShrink: 0, marginTop: 3 }}/>
                  <span style={{ fontSize: 7.5, color: INK2, lineHeight: 1.4 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart area */}
          <div style={{ background: "#141C17", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ fontSize: 8, color: INK3, marginBottom: 6 }}>Revenue & Growth Trajectory</div>
            <svg width="100%" height="50" viewBox="0 0 200 50" preserveAspectRatio="none">
              <defs>
                <linearGradient id="hg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GREEN} stopOpacity=".15"/><stop offset="100%" stopColor={GREEN} stopOpacity="0"/></linearGradient>
                <linearGradient id="hg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5C9BE0" stopOpacity=".1"/><stop offset="100%" stopColor="#5C9BE0" stopOpacity="0"/></linearGradient>
              </defs>
              <polygon points={`0,50 0,${pts2.split(" ")[0].split(",")[1]} ${pts2} 200,50`} fill="url(#hg2)"/>
              <polyline points={pts2} fill="none" stroke={GREEN} strokeWidth="1" strokeLinecap="round" transform="scale(2,1)"/>
              <polyline points="0,44 20,40 40,42 60,36 80,38 100,30 120,28 140,32 160,24 180,20 200,16" fill="none" stroke="#5C9BE0" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 2" opacity=".5"/>
            </svg>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ padding: "12px 8px", borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 8, color: INK3, fontWeight: 600, letterSpacing: "0.05em" }}>AI INSIGHTS</div>
          {[
            { label: "Buy Signal", color: GREEN },
            { label: "Risk Alert", color: "#E05C5C" },
            { label: "Opportunity", color: "#5C9BE0" },
          ].map((ins, i) => (
            <div key={i} style={{ background: "#141C17", border: `1px solid ${BORDER}`, borderRadius: 4, padding: "6px 7px" }}>
              <div style={{ fontSize: 7, color: ins.color, fontWeight: 600, marginBottom: 2 }}>{ins.label}</div>
              <div style={{ width: "100%", height: 3, background: BORDER, borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${[78, 45, 62][i]}%`, background: ins.color, borderRadius: 2, opacity: .7 }}/>
              </div>
            </div>
          ))}
          <div style={{ marginTop: "auto" }}>
            <div style={{ background: `rgba(0,201,122,.1)`, border: `1px solid rgba(0,201,122,.2)`, borderRadius: 4, padding: "5px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 7, color: GREEN, fontWeight: 700 }}>NEURAL AI</div>
              <div style={{ fontSize: 7, color: INK3 }}>Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [count, setCount] = useState(null);
  const wlRef = useRef(null);
  const [sRef, sVis] = useVis(0.3);
  const c70 = useCountUp(70, 1600, sVis);
  const c98 = useCountUp(98, 1800, sVis);
  const c40 = useCountUp(40, 1400, sVis);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    waitlist.getCount().then(setCount).catch(() => {});
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = () => wlRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div style={{ background: BG, minHeight: "100vh", overflowX: "hidden", fontFamily: "'DM Sans', sans-serif", color: INK }}>
      <style>{ANIM}</style>

      {/* TICKER */}
      <div style={{ background: "#0A130D", borderBottom: `1px solid ${BORDER}`, padding: "7px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", animation: "ticker 35s linear infinite", width: "200%", willChange: "transform" }}>
          {[0, 1].map(x => (
            <div key={x} style={{ display: "flex", whiteSpace: "nowrap", flex: "0 0 50%" }}>
              {TICKER_ITEMS.map((t, i) => (
                <span key={i} style={{ padding: "0 28px", color: INK3, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>
                  <span style={{ color: GREEN, marginRight: 14 }}>✦</span>{t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, transition: "all .3s",
        background: scrolled ? "rgba(9,17,13,.95)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${BORDER}` : "none",
        padding: "0 40px",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: GREEN }}>ExFinAnalyze</span>
          </div>
          {/* Links */}
          <div className="lp-nav-links" style={{ display: "flex", alignItems: "center", gap: 32, fontSize: 13.5, color: INK2 }}>
            {[["Features","#features"],["How it works","#how"],["Pricing","#pricing"]].map(([l, h]) => (
              <a key={l} href={h} className="lp-link" style={{ textDecoration: "none", color: "inherit", transition: "color .2s" }}>{l}</a>
            ))}
            <button onClick={scrollTo} style={{
              padding: "8px 22px", background: GREEN, color: "#000", border: "none",
              borderRadius: 6, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              fontSize: 13, cursor: "pointer", transition: "all .2s", letterSpacing: "-0.01em",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = GREEN_L; e.currentTarget.style.boxShadow = `0 0 16px rgba(0,201,122,.4)`; }}
              onMouseLeave={e => { e.currentTarget.style.background = GREEN; e.currentTarget.style.boxShadow = "none"; }}>
              Join Waitlist
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "80px 40px 60px", position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,201,122,.18) 0%, transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "-10%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,201,122,.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
        {/* Subtle grid */}
        <div style={{ position: "absolute", inset: 0, opacity: .025, backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,201,122,.8) 1px, transparent 0)`, backgroundSize: "36px 36px", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative" }}>
          <div className="lp-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", minHeight: 520 }}>
            {/* Left */}
            <div style={{ animation: "fadeUp .8s ease forwards" }}>
              {/* Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", background: `rgba(0,201,122,.08)`, borderRadius: 20, marginBottom: 28, border: `1px solid rgba(0,201,122,.2)` }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, animation: "pulse 1.6s ease infinite" }} />
                <span style={{ fontSize: 11, color: GREEN, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Early Access Open</span>
              </div>

              <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(36px,5vw,54px)", fontWeight: 500, lineHeight: 1.05, letterSpacing: "-0.03em", color: INK, marginBottom: 20 }}>
                The Future of Finance,<br />
                <em style={{ fontStyle: "italic", color: GREEN }}>Powered by Intelligence.</em>
              </h1>

              <p style={{ fontSize: 16, color: INK2, lineHeight: 1.7, maxWidth: 420, marginBottom: 36 }}>
                Harness the power of AI to grow, protect, and optimize your financial portfolio — with autonomous investing, neural security, and predictive analytics working for you around the clock.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={scrollTo} style={{
                  padding: "13px 28px", background: GREEN, color: "#000", border: "none",
                  borderRadius: 6, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                  fontSize: 14, cursor: "pointer", transition: "all .2s", letterSpacing: "-0.01em",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = GREEN_L; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 0 24px rgba(0,201,122,.35)`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = GREEN; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  → Join the Waitlist
                </button>
                <a href="#features" style={{
                  padding: "13px 28px", background: "transparent", color: INK2,
                  border: `1.5px solid ${BORDER2}`, borderRadius: 6, fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500, fontSize: 14, textDecoration: "none", display: "inline-flex",
                  alignItems: "center", transition: "all .2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(0,201,122,.4)`; e.currentTarget.style.color = INK; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER2; e.currentTarget.style.color = INK2; }}>
                  See the Platform
                </a>
              </div>

              {/* Social proof */}
              <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex" }}>
                  {["SC","MK","JP","LR"].map((ini, x) => (
                    <div key={x} style={{ width: 30, height: 30, borderRadius: "50%", border: `2px solid ${BG}`, background: ["#009E5F","#00C97A","#5C9BE0","#9B7FE8"][x], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white", marginLeft: x ? -8 : 0 }}>{ini}</div>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: INK2 }}>
                  <strong style={{ color: INK }}>{count !== null ? `${count} finance pro${count !== 1 ? "s" : ""}` : "Finance pros"}</strong> already waiting
                </div>
              </div>
            </div>

            {/* Right: Dashboard preview */}
            <div className="lp-hero-mock" style={{ animation: "fadeUp .8s .2s ease both", position: "relative" }}>
              <div style={{ position: "absolute", top: -20, right: -20, bottom: -20, left: 20, background: `rgba(0,201,122,.06)`, borderRadius: 14, transform: "rotate(2deg)" }} />
              <div style={{ position: "relative", animation: "float 7s ease-in-out 1s infinite" }}>
                <HeroDashboardMock />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={sRef} style={{ padding: "48px 40px", background: SURF, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div className="lp-stats-grid" style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
          {[
            [`${c70}%`, "of finance team time spent on data collection", "Reclaimed for strategy with ExFinAnalyze"],
            [`${c98}%`, "average extraction accuracy across document types", "With full source citations per field"],
            [`${c40}%`, "faster month-end close reported by AI-native teams", "From 5-day cycle to under 3"],
          ].map(([n, l, s], i) => (
            <div key={i} style={{ padding: "32px 40px", borderRight: i < 2 ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 48, color: GREEN, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 10 }}>{n}</div>
              <div style={{ fontSize: 14, color: INK, lineHeight: 1.5, marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 12, color: INK3, lineHeight: 1.4 }}>{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 60px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: GREEN, fontWeight: 600, marginBottom: 12 }}>Core Features</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(26px,4vw,40px)", fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, color: INK, margin: "0 0 14px" }}>
              ExFinAnalyze Core Features
            </h2>
            <p style={{ fontSize: 15, color: INK2, lineHeight: 1.6 }}>
              Empowering your financial future with next-generation artificial intelligence.
            </p>
          </div>

          <div className="lp-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20, maxWidth: 880, margin: "0 auto" }}>
            {FEATURES.map(({ icon, title, body }, i) => (
              <div key={i} className="lp-feat-card" style={{
                padding: 28, border: `1px solid ${BORDER}`, borderRadius: 10,
                background: CARD, cursor: "default",
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, background: `rgba(0,201,122,.08)`, border: `1px solid rgba(0,201,122,.15)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  {icon}
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 500, marginBottom: 10, color: INK }}>{title}</div>
                <div style={{ fontSize: 14, color: INK2, lineHeight: 1.65 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: "80px 40px", background: SURF, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 540, margin: "0 auto 52px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: GREEN, fontWeight: 600, marginBottom: 12 }}>How It Works</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, color: INK }}>
              AI-powered intelligence,<br /><em style={{ color: GREEN, fontStyle: "italic" }}>every step of the way.</em>
            </h2>
          </div>
          <div className="lp-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              ["01", "Upload & Connect", "Upload your financial documents or connect your accounts. ExFinAnalyze instantly processes and categorizes everything.", "📤"],
              ["02", "AI Analyzes", "Our neural models extract key metrics, detect risks, identify opportunities, and generate predictive insights in real time.", "🧠"],
              ["03", "Act with Confidence", "Receive actionable recommendations, automated reports, and portfolio optimizations — all backed by cutting-edge AI.", "⚡"],
            ].map(([num, title, body, emoji]) => (
              <div key={num} style={{ padding: 28, border: `1px solid ${BORDER}`, borderRadius: 10, background: CARD, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 14, right: 16, fontSize: 32, opacity: .12 }}>{emoji}</div>
                <div style={{ fontSize: 11, color: GREEN, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginBottom: 12, letterSpacing: "0.1em" }}>{num}</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 500, marginBottom: 10, color: INK }}>{title}</div>
                <div style={{ fontSize: 14, color: INK2, lineHeight: 1.65 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 24/7 AI CONCIERGE */}
      <section style={{ padding: "80px 40px", background: BG }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", background: `rgba(0,201,122,.08)`, borderRadius: 20, marginBottom: 18, border: `1px solid rgba(0,201,122,.2)` }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
              <span style={{ fontSize: 11, color: GREEN, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>ExFinAnalyze AI</span>
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,4vw,46px)", fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, color: INK, marginBottom: 12 }}>
              24/7 AI Concierge
            </h2>
            <p style={{ fontSize: 15, color: INK2, maxWidth: 480, margin: "0 auto" }}>
              Your personal AI financial analyst — always available, always accurate.
            </p>
          </div>

          {/* Chat demo */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 16px 56px rgba(0,0,0,.45)" }}>
            {/* Chat header */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `rgba(0,201,122,.15)`, border: `1px solid rgba(0,201,122,.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🤖</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: INK, fontFamily: "'DM Sans', sans-serif" }}>ExFinAnalyze AI</div>
                <div style={{ fontSize: 11, color: GREEN, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN, display: "inline-block", boxShadow: `0 0 4px ${GREEN}` }} /> Online
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16, minHeight: 260 }}>
              {/* AI opening */}
              <div style={{ display: "flex", gap: 10, maxWidth: "80%" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `rgba(0,201,122,.15)`, border: `1px solid rgba(0,201,122,.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>🤖</div>
                <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: "2px 12px 12px 12px", padding: "10px 14px" }}>
                  <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.6 }}>Hello! I'm your personal financial analyst. How can I assist you today?</p>
                </div>
              </div>
              {/* User message */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: `rgba(0,201,122,.12)`, border: `1px solid rgba(0,201,122,.25)`, borderRadius: "12px 2px 12px 12px", padding: "10px 14px", maxWidth: "72%" }}>
                  <p style={{ fontSize: 13, color: INK, margin: 0, lineHeight: 1.6 }}>Can you give me an update on my sustainable tech portfolio?</p>
                </div>
              </div>
              {/* AI response */}
              <div style={{ display: "flex", gap: 10, maxWidth: "85%" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `rgba(0,201,122,.15)`, border: `1px solid rgba(0,201,122,.25)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>🤖</div>
                <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: "2px 12px 12px 12px", padding: "10px 14px" }}>
                  <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.6 }}>Certainly! Based on real-time data, your green tech investments are performing strongly. Would you like a detailed breakdown or a market forecast?</p>
                </div>
              </div>
            </div>

            {/* Quick action chips */}
            <div style={{ padding: "0 20px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Analyze my portfolio", "Explain market trends", "Review tax optimization", "Suggest green investments"].map((q, i) => (
                <button key={i} style={{ padding: "6px 14px", background: "transparent", border: `1px solid ${BORDER2}`, borderRadius: 99, fontSize: 12, color: INK2, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(0,201,122,.4)`; e.currentTarget.style.color = GREEN; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER2; e.currentTarget.style.color = INK2; }}>
                  {q}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10 }}>
              <div style={{ flex: 1, padding: "10px 14px", background: SURF, border: `1px solid ${BORDER2}`, borderRadius: 8, fontSize: 13, color: INK3, fontFamily: "'DM Sans', sans-serif" }}>
                Ask me anything...
              </div>
              <button style={{ padding: "10px 18px", background: GREEN, color: "#000", border: "none", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = GREEN_L; e.currentTarget.style.boxShadow = `0 0 16px rgba(0,201,122,.35)`; }}
                onMouseLeave={e => { e.currentTarget.style.background = GREEN; e.currentTarget.style.boxShadow = "none"; }}>
                Send ↗
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & TESTIMONIALS */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: GREEN, fontWeight: 600, marginBottom: 12 }}>Trust & Testimonials</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 500, letterSpacing: "-0.025em", color: INK, margin: "0 0 36px" }}>
              ExFinAnalyze <em style={{ fontStyle: "italic", color: GREEN }}>Trust & Testimonials</em>
            </h2>
            {/* Partner logos */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36, flexWrap: "wrap", paddingBottom: 36, borderBottom: `1px solid ${BORDER}` }}>
              {[
                { name: "stripe",     style: { fontWeight: 700, letterSpacing: "-0.04em", fontSize: 18 } },
                { name: "aws",        style: { fontWeight: 800, letterSpacing: "0.08em",  fontSize: 14, textTransform: "uppercase" } },
                { name: "PLAID",      style: { fontWeight: 700, letterSpacing: "0.08em",  fontSize: 14 } },
                { name: "VISA",       style: { fontWeight: 900, letterSpacing: "0.05em",  fontSize: 18, fontStyle: "italic" } },
                { name: "mastercard", style: { fontWeight: 600, letterSpacing: "-0.01em", fontSize: 14 } },
                { name: "salesforce", style: { fontWeight: 700, letterSpacing: "-0.02em", fontSize: 14 } },
              ].map(({ name, style }) => (
                <span key={name} style={{ color: INK3, fontFamily: "'DM Sans', sans-serif", ...style, transition: "color .2s", cursor: "default" }}
                  onMouseEnter={e => (e.target.style.color = INK2)}
                  onMouseLeave={e => (e.target.style.color = INK3)}>{name}</span>
              ))}
            </div>
          </div>

          <div className="lp-testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {[
              ["The AI insights are unparalleled — ExFinAnalyze has investable portfolio positions and physical precision and investing data.", "Jane Doe", "CTO at FinCorp", "JD", "#009E5F"],
              ["The AI markets are investigated with respect to actual advanced portfolios and physical precision and investing data.", "Andahamrath", "Consult at FinCo", "AN", "#00C97A"],
              ["This analyzer most drive to profit at ExFinAnalyze. Java traversing complex objectives, workflows, and critical investment returns.", "Harry Doe", "CTO at FinCorp", "HD", "#5C9BE0"],
            ].map(([q, n, r, ini, bg], i) => (
              <div key={i} style={{ background: CARD, borderRadius: 10, padding: 26, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 36, color: GREEN, marginBottom: 12, lineHeight: 1, fontFamily: "'Fraunces', serif", opacity: .7 }}>"</div>
                <p style={{ fontSize: 13.5, color: INK2, lineHeight: 1.75, marginBottom: 22, fontFamily: "'Fraunces', serif", fontStyle: "italic" }}>{q}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#000", flexShrink: 0, boxShadow: `0 0 10px ${bg}40` }}>{ini}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{n}</div>
                    <div style={{ fontSize: 11.5, color: INK3 }}>{r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "96px 40px", background: SURF, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 540, margin: "0 auto 52px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: GREEN, fontWeight: 600, marginBottom: 12 }}>Pricing</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, color: INK }}>
              ExFinAnalyze Premium Pricing Plans
            </h2>
            <p style={{ marginTop: 14, fontSize: 14, color: INK2 }}>Unlock AI-powered fintech solutions for a sustainable future.</p>
          </div>

          <div className="lp-pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, maxWidth: 900, margin: "0 auto" }}>
            {PRICING.map((p, i) => (
              <div key={i} className="lp-price-card" style={{
                padding: 28, borderRadius: 10, position: "relative",
                background: p.hi ? `rgba(0,201,122,.06)` : CARD,
                border: p.hi ? `1.5px solid rgba(0,201,122,.3)` : `1px solid ${BORDER}`,
                boxShadow: p.hi ? `0 0 30px rgba(0,201,122,.08)` : "none",
              }}>
                {p.hi && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: GREEN, color: "#000", padding: "3px 14px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: p.hi ? GREEN : INK3, fontWeight: 600, marginBottom: 10 }}>{p.tier}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: p.price.startsWith("$") ? 38 : 22, fontWeight: 600, color: INK, letterSpacing: "-0.04em" }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: INK3 }}>{p.period}</span>
                </div>
                <p style={{ fontSize: 13, color: INK2, lineHeight: 1.5, marginBottom: 18, minHeight: 38 }}>{p.desc}</p>
                <div style={{ height: 1, background: BORDER, margin: "0 0 16px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", gap: 9, alignItems: "center" }}>
                      <span style={{ color: GREEN, fontSize: 11, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: INK2 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => p.action === "contact" ? (window.location.href = "mailto:hello@exfinanalyze.com") : scrollTo()}
                  style={{
                    width: "100%", padding: "11px", border: "none", borderRadius: 6,
                    background: p.hi ? GREEN : `rgba(0,201,122,.1)`,
                    color: p.hi ? "#000" : GREEN,
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
                    cursor: "pointer", transition: "all .2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = p.hi ? GREEN_L : `rgba(0,201,122,.18)`; if (p.hi) e.currentTarget.style.boxShadow = `0 0 16px rgba(0,201,122,.3)`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = p.hi ? GREEN : `rgba(0,201,122,.1)`; e.currentTarget.style.boxShadow = "none"; }}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Trust bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap", marginTop: 44 }}>
            {[["🔒","Secure Payments"],["🌱","SustainFinance"],["📊","Climate Solutions"],["🌍","EcoData"],["🛡️","SecureNet"]].map(([ic, name]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: INK3 }}>
                <span style={{ fontSize: 14 }}>{ic}</span>{name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" style={{ padding: "96px 40px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div className="lp-waitlist-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            {/* Left */}
            <div>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: GREEN, fontWeight: 600, marginBottom: 16 }}>Early Access</div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.05, color: INK, marginBottom: 20 }}>
                Be first.<br /><em style={{ color: GREEN, fontStyle: "italic" }}>Get more.</em>
              </h2>
              <p style={{ fontSize: 15, color: INK2, lineHeight: 1.7, marginBottom: 36 }}>
                ExFinAnalyze launches Q2 2026. Early access members get priority onboarding, permanent pricing discounts, and a direct line to shape the product.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {[
                  ["🏷", "40% off — forever", "Lock in the early access price before launch. The discount never expires."],
                  ["⚡", "Priority onboarding", "Skip the queue. Get a 1-on-1 setup session and your first document analyzed before anyone else."],
                  ["🎯", "Shape the product", "Your feedback directly influences what we build next. Early members have a seat at the table."],
                ].map(([ic, t, b], i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, background: `rgba(0,201,122,.08)`, border: `1px solid rgba(0,201,122,.15)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{ic}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: INK, marginBottom: 4 }}>{t}</div>
                      <div style={{ fontSize: 13, color: INK2, lineHeight: 1.5 }}>{b}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Right: form */}
            <div ref={wlRef}>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 36, boxShadow: `0 8px 48px rgba(0,0,0,.4), 0 0 24px rgba(0,201,122,.06)` }}>
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 500, marginBottom: 5, color: INK }}>Join the waitlist</div>
                  <div style={{ fontSize: 13, color: INK2, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, display: "inline-block" }} />Supabase
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
      <footer style={{ background: SURF, padding: "60px 40px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.5fr", gap: 40, paddingBottom: 48, borderBottom: `1px solid ${BORDER}`, marginBottom: 28 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, boxShadow: `0 0 6px ${GREEN}` }} />
                <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, color: GREEN }}>ExFinAnalyze</span>
              </div>
              <p style={{ fontSize: 13, color: INK3, lineHeight: 1.7, maxWidth: 240 }}>
                AI-powered financial intelligence for the next generation of investors and institutions.
              </p>
            </div>
            {/* Columns */}
            {[
              { heading: "Product",   links: ["Features","Pricing","API","Blog"] },
              { heading: "Solutions", links: ["SMB","Personal","Enterprise"] },
              { heading: "Company",   links: ["About Us","Careers","Contact"] },
              { heading: "Legal",     links: ["Terms","Privacy","Compliance"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <div style={{ fontSize: 10, fontWeight: 600, color: INK3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>{heading}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {links.map(l => (
                    <a key={l} href="#" className="lp-link" style={{ textDecoration: "none", fontSize: 13, color: INK3, transition: "color .15s" }}>{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Bottom */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: INK3 }}>© 2026 ExFinAnalyze · All rights reserved.</div>
            <div style={{ display: "flex", gap: 20, fontSize: 12, color: INK3 }}>
              {[["Privacy","#"],["Terms","#"],["Compliance","#"]].map(([l, h]) => (
                <a key={l} href={h} className="lp-link" style={{ textDecoration: "none", color: "inherit", transition: "color .15s" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
