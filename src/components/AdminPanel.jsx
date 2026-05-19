import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { waitlist } from "../lib/waitlist";
import ConfirmModal from "./ConfirmModal";

const SPIN = `@keyframes spin{to{transform:rotate(360deg)}}`;

export default function AdminPanel() {
  const [list, setList]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [session, setSession]     = useState(null);
  const [isAdmin, setIsAdmin]     = useState(false);
  const [authChecked, setChecked] = useState(false);
  const [confirmOpen, setConfirm] = useState(false);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [authErr, setAuthErr]   = useState("");
  const [signing, setSigning]   = useState(false);

  // Auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) setIsAdmin(s.user?.app_metadata?.role === "admin");
      setChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setIsAdmin(s ? s.user?.app_metadata?.role === "admin" : false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load data only once authenticated as admin
  useEffect(() => {
    if (!session || !isAdmin) return;
    setLoading(true);
    waitlist.getAll()
      .then(l => setList(Array.isArray(l) ? l : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, isAdmin]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (signing) return;
    setSigning(true);
    setAuthErr("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthErr(error.message);
    } catch {
      setAuthErr("An unexpected error occurred.");
    } finally {
      setSigning(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null); setIsAdmin(false); setList([]);
  };

  const exportCsv = () => {
    const sanitize = (val) => {
      const s = String(val || "");
      return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
    };
    const rows = [
      "Position,Name,Email,Role,Size,Company,Joined",
      ...list.map(r =>
        `${r.position},"${sanitize(r.name)}","${sanitize(r.email)}","${sanitize(r.role)}","${sanitize(r.size)}","${sanitize(r.company||"")}","${new Date(r.joined_at).toLocaleString()}"`
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "exfinanalyze-waitlist.csv"; a.click();
    URL.revokeObjectURL(url); // prevent memory leak
  };

  const handleClearAll = async () => {
    try {
      await waitlist.deleteAll();
      setList([]);
    } catch (e) {
      alert("Delete failed: " + e.message);
    } finally {
      setConfirm(false);
    }
  };

  const inputStyle = (hasErr = false) => ({
    width: "100%", padding: "13px 16px",
    border: `1.5px solid ${hasErr ? "#9A3B2A" : "#E0DAC8"}`,
    borderRadius: 4, fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: 14, outline: "none", marginBottom: 10,
  });

  if (!authChecked) return (
    <div style={{ minHeight: "100vh", background: "#F7F4ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{SPIN}</style>
      <div style={{ width: 24, height: 24, border: "2px solid #E0DAC8", borderTopColor: "#C8924A", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );

  if (!session) return (
    <div style={{ minHeight: "100vh", background: "#F7F4ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{SPIN}</style>
      <div style={{ background: "white", border: "1.5px solid #E0DAC8", borderRadius: 8, padding: 48, width: 380, boxShadow: "0 8px 48px rgba(22,20,15,.14)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, background: "#16140F", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: "#C8924A", fontSize: 16 }}>E</span>
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 17, color: "#16140F" }}>ExFinAnalyze</span>
        </div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 500, marginBottom: 6, color: "#16140F" }}>Admin Access</div>
        <div style={{ fontSize: 13, color: "#5A574E", marginBottom: 24 }}>Sign in with your admin credentials.</div>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} autoComplete="email"
            onChange={e => { setEmail(e.target.value); setAuthErr(""); }}
            style={inputStyle(!!authErr)} />
          <input type="password" placeholder="Password" value={password} autoComplete="current-password"
            onChange={e => { setPassword(e.target.value); setAuthErr(""); }}
            style={inputStyle(!!authErr)} />
          {authErr && <div style={{ fontSize: 12, color: "#9A3B2A", marginBottom: 8 }}>❌ {authErr}</div>}
          <button type="submit" disabled={signing} style={{ width: "100%", padding: "13px", background: "#16140F", color: "#F7F4ED", border: "none", borderRadius: 4, fontWeight: 600, fontSize: 14, cursor: signing ? "wait" : "pointer", opacity: signing ? .7 : 1 }}>
            {signing ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div style={{ fontSize: 11, color: "#B0ADA5", textAlign: "center", marginTop: 16 }}>Secured by Supabase Auth</div>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div style={{ minHeight: "100vh", background: "#F7F4ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", border: "1.5px solid #E0DAC8", borderRadius: 8, padding: 48, width: 380, boxShadow: "0 8px 48px rgba(22,20,15,.14)", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🚫</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 500, marginBottom: 8 }}>Access Denied</div>
        <div style={{ fontSize: 13, color: "#5A574E", marginBottom: 24 }}>
          Signed in as <strong>{session.user.email}</strong> — account does not have admin privileges.
        </div>
        <button onClick={handleLogout} style={{ padding: "10px 24px", background: "transparent", color: "#9A3B2A", border: "1.5px solid #9A3B2A", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F7F4ED", fontFamily: "'DM Sans', system-ui, sans-serif", padding: 40 }}>
      <style>{SPIN}</style>

      {confirmOpen && (
        <ConfirmModal
          message={`Delete all ${list.length} waitlist entries? This cannot be undone.`}
          danger
          onConfirm={handleClearAll}
          onCancel={() => setConfirm(false)}
        />
      )}

      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, color: "#16140F" }}>Waitlist Admin</div>
            <div style={{ color: "#5A574E", fontSize: 14, marginTop: 4 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "#C8924A", fontSize: 16 }}>{list.length}</span> signups · {session.user.email}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={exportCsv} style={{ padding: "10px 20px", background: "#16140F", color: "#F7F4ED", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>↓ Export CSV</button>
            <button onClick={() => setConfirm(true)} style={{ padding: "10px 20px", background: "transparent", color: "#9A3B2A", border: "1.5px solid #9A3B2A", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>Clear All</button>
            <button onClick={handleLogout} style={{ padding: "10px 20px", background: "transparent", color: "#5A574E", border: "1.5px solid #E0DAC8", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>Sign Out</button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#5A574E" }}>
            <div style={{ width: 24, height: 24, border: "2px solid #E0DAC8", borderTopColor: "#C8924A", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 12px" }} />
            Loading waitlist…
          </div>
        ) : list.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#5A574E" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            No signups yet.
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 8, border: "1px solid #E0DAC8", overflow: "hidden", boxShadow: "0 2px 24px rgba(22,20,15,.08)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F9F6F0" }}>
                  {["#","Name","Email","Role","Size","Company","Joined"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#5A574E", borderBottom: "1px solid #E0DAC8" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((r, i) => (
                  <tr key={r.id ?? i} style={{ borderBottom: "1px solid #F0EDE3" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FAFAF7")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 14px", color: "#B0ADA5", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>#{r.position}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 500 }}>{r.name}</td>
                    <td style={{ padding: "10px 14px", color: "#C8924A", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{r.email}</td>
                    <td style={{ padding: "10px 14px", color: "#5A574E" }}>{r.role}</td>
                    <td style={{ padding: "10px 14px", color: "#5A574E" }}>{r.size}</td>
                    <td style={{ padding: "10px 14px", color: "#5A574E" }}>{r.company || "—"}</td>
                    <td style={{ padding: "10px 14px", color: "#B0ADA5", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{new Date(r.joined_at).toLocaleDateString()}</td>
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
