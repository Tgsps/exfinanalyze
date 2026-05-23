import { useState, useEffect, useRef } from "react";
import { waitlist } from "./lib/waitlist";
import { useCountUp } from "./hooks/useCountUp";
import { useVis } from "./hooks/useVis";
import WaitlistForm from "./components/WaitlistForm";
import MockExtract from "./components/mocks/MockExtract";

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
  "Autonomous portfolio optimization","Neural fraud detection in real-time","Predictive market analytics",
  "24/7 AI financial concierge","Green finance scoring & ESG tracking","Smart investment automation",
  "Instant risk assessment",
];

const FEATURES = [
  {
    emoji: "📈",
    title: "Autonomous Investing",
    body: "Self-optimizing portfolios driven by adaptive machine learning models for consistent, data-backed returns.",
  },
  {
    emoji: "🛡️",
    title: "Neural Security",
    body: "Proactive, AI-powered threat detection and fraud prevention, safeguarding assets in real-time.",
  },
  {
    emoji: "🔮",
    title: "Predictive Analytics",
    body: "Forecast market trends and financial outcomes with unparalleled accuracy using advanced predictive algorithms.",
  },
  {
    emoji: "⚡",
    title: "Smart Automation",
    body: "Streamline operations, reduce manual tasks, and execute complex financial strategies with intelligent workflows.",
  },
];

const PROBLEMS = [
  ["⏱","70% of time wasted","Analysts spend most of their day collecting and formatting data — not analyzing it."],
  ["📚","Junior staff left to guess","ASC 842 and ASC 606 are learned through mistakes. Managers don't have time to train everyone individually."],
  ["🗓","Month-end chaos, every time","Reconciling transactions, writing variance narratives, and chasing missing documents creates a crunch cycle every 30 days."],
];

const PRICING = [
  { tier:"Starter", price:"$49", period:"/month", desc:"For individual investors exploring AI-assisted analysis.", features:["AI Asset Analysis","5 Portfolio Trackers","Limited Green Tech Reports","Standard Support"], cta:"Get Started", hi:false, action:"waitlist" },
  { tier:"Professional", price:"$149", period:"/month", desc:"For active investors who need speed and accuracy.", features:["Advanced AI Predictions","Unlimited Portfolio Trackers","Exclusive Green Tech Reports","Priority 24/7 Support","API Access","Custom Alerts","Team Collaboration"], cta:"Upgrade Now", hi:true, action:"waitlist" },
  { tier:"Enterprise", price:"Contact Sales", period:"", desc:"For firms and institutions needing full-suite AI tools.", features:["Full Suite AI Tools","Portfolio Account Manager","Bespoke Green-Tech Solutions","SLA Support","Green Economy Scoreboard","Custom Discount"], cta:"Contact us", hi:false, action:"contact" },
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
                The Future of Finance,<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Powered by Intelligence.</em>
              </h1>
              <p style={{ fontSize: 16, color: "var(--ink-60)", lineHeight: 1.7, maxWidth: 420, marginBottom: 36 }}>
                Harness the power of AI to grow, protect, and optimize your financial portfolio — with autonomous investing, neural security, and predictive analytics working for you around the clock.
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
                  See the Platform
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
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 60px" }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold)", fontWeight: 600, marginBottom: 12 }}>Core Features</div>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: 40, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--ink)" }}>Empowering your financial future<br /><em>with next-generation AI.</em></h2>
          </div>
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24, maxWidth: 860, margin: "0 auto" }}>
            {FEATURES.map(({ emoji, title, body }, i) => (
              <div key={i} style={{ padding: 32, border: "1.5px solid var(--border)", borderRadius: 6, background: "var(--white)", transition: "transform .25s,box-shadow .25s", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--sl)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{emoji}</div>
                <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 500, marginBottom: 10, color: "var(--ink)" }}>{title}</div>
                <div style={{ fontSize: 14, color: "var(--ink-60)", lineHeight: 1.65 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST & TESTIMONIALS */}
      <section style={{ padding: "80px 40px", background: "var(--ink)" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--gold)", fontWeight: 600, marginBottom: 12 }}>Trust & Testimonials</div>
            <h2 style={{ fontFamily: "var(--fd)", fontSize: 36, fontWeight: 500, letterSpacing: "-0.025em", color: "#E8E6DF", margin: "0 0 40px" }}>
              ExFinAnalyze <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Trust & Testimonials</em>
            </h2>
            {/* Partner logos */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 36, flexWrap: "wrap", paddingBottom: 40, borderBottom: "1px solid #2A2820" }}>
              {[
                { name: "stripe",      style: { fontWeight: 700, letterSpacing: "-0.04em", fontSize: 18 } },
                { name: "aws",         style: { fontWeight: 800, letterSpacing: "0.04em",  fontSize: 15, textTransform: "uppercase" } },
                { name: "PLAID",       style: { fontWeight: 700, letterSpacing: "0.08em",  fontSize: 14 } },
                { name: "VISA",        style: { fontWeight: 900, letterSpacing: "0.05em",  fontSize: 18, fontStyle: "italic" } },
                { name: "mastercard",  style: { fontWeight: 600, letterSpacing: "-0.01em", fontSize: 14 } },
                { name: "salesforce",  style: { fontWeight: 700, letterSpacing: "-0.02em", fontSize: 14 } },
              ].map(({ name, style }) => (
                <span key={name} style={{ color: "#4A4840", fontFamily: "var(--fb)", ...style }}>{name}</span>
              ))}
            </div>
          </div>
          <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              ["The autonomous portfolio optimization is remarkable. The AI models adapt to market shifts in real-time, delivering data-backed returns we couldn't achieve manually.", "Jane Doe", "CTO at FinCorp", "JD", "#2C5F42"],
              ["The neural fraud detection alone pays for itself. ExFinAnalyze caught suspicious transactions our compliance team missed — real-time protection at scale.", "Andahamrath", "Investment Analyst at FinCo", "AN", "#C8924A"],
              ["Predictive analytics that actually work. ExFinAnalyze identified a carbon credit opportunity three weeks before the broader market moved. Consistent, intelligent, reliable.", "Harry Doe", "CEO at FinCorp", "HD", "#3B4F8C"],
            ].map(([q, n, r, ini, bg], i) => (
              <div key={i} style={{ background: "#1A1916", borderRadius: 8, padding: 28, border: "1px solid #2A2820" }}>
                <div style={{ fontSize: 32, color: "var(--gold)", marginBottom: 12, lineHeight: 1, fontFamily: "var(--fd)" }}>"</div>
                <p style={{ fontSize: 14, color: "#C8C5BE", lineHeight: 1.75, marginBottom: 24, fontFamily: "var(--fd)", fontStyle: "italic" }}>{q}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>{ini}</div>
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
            <p style={{ marginTop: 14, fontSize: 14, color: "var(--ink-60)" }}>Unlock AI-powered fintech solutions. No contracts, cancel anytime.</p>
          </div>
          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, maxWidth: 900, margin: "0 auto" }}>
            {PRICING.map((p, i) => (
              <div key={i} style={{ padding: 28, border: p.hi ? "2px solid var(--ink)" : "1.5px solid var(--border)", borderRadius: 6, position: "relative", background: p.hi ? "var(--ink)" : "var(--white)", transition: "transform .2s,box-shadow .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--sl)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                {p.hi && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--gold)", color: "var(--ink)", padding: "3px 14px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>MOST POPULAR</div>}
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: p.hi ? "var(--gold-l)" : "var(--ink-30)", fontWeight: 600, marginBottom: 10 }}>{p.tier}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--fd)", fontSize: p.price.startsWith("$") ? 40 : 24, fontWeight: 600, color: p.hi ? "var(--cream)" : "var(--ink)", letterSpacing: "-0.04em" }}>{p.price}</span>
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
      <footer style={{ background: "var(--ink)", padding: "60px 40px 28px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          {/* Top: brand + columns */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 40, paddingBottom: 48, borderBottom: "1px solid #2A2820", marginBottom: 28 }}>
            {/* Brand column */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>
                  <span style={{ fontFamily: "var(--fd)", fontWeight: 700, color: "var(--ink)", fontSize: 14 }}>E</span>
                </div>
                <span style={{ fontFamily: "var(--fd)", fontWeight: 600, fontSize: 16, color: "#E8E6DF" }}>ExFinAnalyze</span>
              </div>
              <p style={{ fontSize: 13, color: "#6B6963", lineHeight: 1.7, maxWidth: 240 }}>
                AI-powered financial intelligence for the next generation of investors and institutions.
              </p>
              {/* Newsletter */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#6B6963", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Newsletter</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    style={{ flex: 1, padding: "8px 12px", background: "#1A1916", border: "1px solid #2A2820", borderRadius: 4, color: "#E8E6DF", fontSize: 12, outline: "none", fontFamily: "var(--fb)" }}
                  />
                  <button style={{ padding: "8px 14px", background: "var(--gold)", border: "none", borderRadius: 4, color: "var(--ink)", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "var(--fb)", whiteSpace: "nowrap" }}>
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
            {/* Link columns */}
            {[
              { heading: "Product",   links: ["Features","Pricing","API","Changelog"] },
              { heading: "Solutions", links: ["Personal","Invest","Enterprise","Institutions"] },
              { heading: "Company",   links: ["About Us","Careers","Blog","Contact"] },
              { heading: "Legal",     links: ["Privacy","Terms","Compliance","Security"] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#6B6963", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>{heading}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {links.map(l => (
                    <a key={l} href="#" style={{ textDecoration: "none", fontSize: 13, color: "#4A4840", transition: "color .15s" }}
                      onMouseEnter={e => (e.target.style.color = "#C8C5BE")}
                      onMouseLeave={e => (e.target.style.color = "#4A4840")}>{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Bottom bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#4A4840" }}>© 2026 ExFinAnalyze. All rights reserved.</div>
            <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#4A4840" }}>
              {[["Privacy","#"],["Terms","#"],["Compliance","#"]].map(([l,h]) => (
                <a key={l} href={h} style={{ textDecoration: "none", color: "inherit" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
