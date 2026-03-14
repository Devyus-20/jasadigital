import { useState, useEffect } from "react";
import API, { getUser, setUser as saveUser } from "./api.js";

// ════════════════════════════════════════════════════════════
// ⚙️ KONFIGURASI ENVIRONMENT
// Untuk DEMO    → buat file user/.env.demo  lalu build dengan: vite build --mode demo
// Untuk PRODUKSI → buat file user/.env      lalu build dengan: vite build
//
// Isi user/.env (production):
//   VITE_API_URL=https://api.jasadigital.com
//   VITE_DEMO_MODE=false
//
// Isi user/.env.demo:
//   VITE_API_URL=https://api-demo.jasadigital.com
//   VITE_DEMO_MODE=true
// ════════════════════════════════════════════════════════════
const APP_CONFIG = {
  apiUrl:  import.meta.env.VITE_API_URL   ?? "http://localhost:3001",
  isDemo:  import.meta.env.VITE_DEMO_MODE === "true",
};

// Ekspor API_BASE agar bisa dipakai fetch manual di dalam komponen
export const API_BASE = APP_CONFIG.apiUrl;

// ─── DEMO BANNER ─────────────────────────────────────────────
// Muncul otomatis saat VITE_DEMO_MODE=true, hilang di production
const DemoBanner = () => {
  if (!APP_CONFIG.isDemo) return null;
  return (
    <div style={{
      background: "#92400e", color: "#fff",
      textAlign: "center", padding: "9px 16px",
      fontSize: 13, fontWeight: 700,
      position: "sticky", top: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    }}>
      <span>⚠️</span>
      <span>Ini adalah versi <b>DEMO</b> — data direset otomatis setiap 24 jam.</span>
      <a href="https://jasadigital.com" target="_blank" rel="noopener noreferrer"
        style={{ color: "#fcd34d", fontWeight: 900, marginLeft: 4 }}>
        Gunakan versi asli →
      </a>
    </div>
  );
};

// ─── HELPERS ─────────────────────────────────────────────────
const fmt = n => "Rp " + Number(n).toLocaleString("id-ID");

// ─── GLOBAL STYLES ───────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Fraunces:wght@700;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; }
    .serif { font-family: 'Fraunces', serif; }
    @keyframes fadeUp   { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
    @keyframes scaleIn  { from { opacity:0; transform:scale(.96) } to { opacity:1; transform:scale(1) } }
    @keyframes slideDown{ from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }
    @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes spin     { to { transform:rotate(360deg) } }
    .anim-fadeUp   { animation: fadeUp   .45s ease both }
    .anim-fadeIn   { animation: fadeIn   .3s  ease both }
    .anim-scaleIn  { animation: scaleIn  .28s ease both }
    .anim-slideDown{ animation: slideDown .3s ease both }
    .d1 { animation-delay:.08s } .d2 { animation-delay:.16s } .d3 { animation-delay:.24s }
    ::-webkit-scrollbar { width:5px; height:5px }
    ::-webkit-scrollbar-track { background:#f1f5f9 }
    ::-webkit-scrollbar-thumb { background:#c7d2fe; border-radius:99px }
  `}</style>
);

// ─── ICON SVG ─────────────────────────────────────────────────
const Ic = ({ d, size = 20, cls = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: "inline-block", flexShrink: 0 }} className={cls}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const ICON = {
  eye:    ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 100 6 3 3 0 000-6z"],
  eyeOff: ["M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24", "M1 1l22 22"],
  mail:   ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  lock:   ["M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z", "M7 11V7a5 5 0 0110 0v4"],
  user:   ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 3a4 4 0 100 8 4 4 0 000-8z"],
  phone:  "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.99 1.18 2 2 0 013 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 8.06a16 16 0 006.03 6.03l1.42-1.42a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  check:  "M20 6L9 17l-5-5",
  x:      "M18 6L6 18M6 6l12 12",
  arrow:  ["M5 12h14", "M12 5l7 7-7 7"],
  arrowL: ["M19 12H5", "M12 19l-7-7 7-7"],
  home:   ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", "M9 22V12h6v10"],
  list:   ["M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2", "M9 5a2 2 0 002 2h2a2 2 0 002-2", "M9 12h6", "M9 16h4"],
  star:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  upload: ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  clock:  ["M12 22a10 10 0 100-20 10 10 0 000 20z", "M12 6v6l4 2"],
  logout: ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  menu:   ["M4 6h16", "M4 12h16", "M4 18h16"],
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  edit:   ["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7", "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"],
};

// ─── BADGE — pakai status DB langsung (lowercase) ─────────────
const Badge = ({ status }) => {
  const map = {
    pending:      { bg: "#fffbeb", color: "#b45309",  border: "#fcd34d", label: "Pending"        },
    dikonfirmasi: { bg: "#f5f3ff", color: "#6d28d9",  border: "#c4b5fd", label: "Dikonfirmasi"   },
    diproses:     { bg: "#eff6ff", color: "#1d4ed8",  border: "#93c5fd", label: "Diproses"       },
    revisi:       { bg: "#fff7ed", color: "#c2410c",  border: "#fed7aa", label: "Revisi"         },
    selesai:      { bg: "#ecfdf5", color: "#065f46",  border: "#6ee7b7", label: "Selesai"        },
    dibatalkan:   { bg: "#fff1f2", color: "#be123c",  border: "#fda4af", label: "Dibatalkan"     },
  };
  const s = map[status] || { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb", label: status };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, display: "inline-block", whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
};

const Toast = ({ msg, type = "success", onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, animation: "slideDown .3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,.2)", background: type === "error" ? "#dc2626" : "#111827", color: "#fff", fontSize: 14, fontWeight: 600 }}>
        <span style={{ width: 24, height: 24, borderRadius: "50%", background: type === "error" ? "#ef4444" : "#10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Ic d={type === "error" ? ICON.x : ICON.check} size={13} />
        </span>
        {msg}
      </div>
    </div>
  );
};

const Modal = ({ onClose, children }) => (
  <div onClick={e => e.target === e.currentTarget && onClose()}
    style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(15,15,30,.65)", backdropFilter: "blur(8px)", animation: "fadeIn .2s ease" }}>
    <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,.18)", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", animation: "scaleIn .25s ease" }}>
      {children}
    </div>
  </div>
);

const Label = ({ children, req }) => (
  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
    {children}{req && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
  </label>
);

const TextInput = ({ icon, error, ...p }) => {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {icon && <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focus ? "#6366f1" : "#9ca3af", display: "flex" }}><Ic d={icon} size={16} /></span>}
      <input {...p} onFocus={e => { setFocus(true); p.onFocus?.(e); }} onBlur={e => { setFocus(false); p.onBlur?.(e); }}
        style={{ width: "100%", padding: icon ? "12px 14px 12px 42px" : "12px 14px", borderRadius: 12, border: `2px solid ${error ? "#fca5a5" : focus ? "#6366f1" : "#e5e7eb"}`, fontSize: 14, background: focus ? "#fff" : "#f9fafb", outline: "none", transition: "all .2s", color: "#111827", boxShadow: focus ? "0 0 0 3px rgba(99,102,241,.12)" : "none", ...p.style }} />
    </div>
  );
};

const PwInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focus ? "#6366f1" : "#9ca3af", display: "flex" }}><Ic d={ICON.lock} size={16} /></span>
      <input type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder || "••••••••"}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ width: "100%", padding: "12px 44px 12px 42px", borderRadius: 12, border: `2px solid ${focus ? "#6366f1" : "#e5e7eb"}`, fontSize: 14, background: focus ? "#fff" : "#f9fafb", outline: "none", transition: "all .2s", boxShadow: focus ? "0 0 0 3px rgba(99,102,241,.12)" : "none" }} />
      <button type="button" onClick={() => setShow(!show)}
        style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 0 }}>
        <Ic d={show ? ICON.eyeOff : ICON.eye} size={16} />
      </button>
    </div>
  );
};

const BtnPrimary = ({ children, loading, full, onClick, disabled, style: sx }) => (
  <button onClick={onClick} disabled={loading || disabled}
    style={{ width: full ? "100%" : "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 24px", borderRadius: 14, border: "none", cursor: loading || disabled ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 14, color: "#fff", background: loading || disabled ? "#a5b4fc" : "linear-gradient(135deg,#4f46e5,#7c3aed)", transition: "all .2s", boxShadow: loading || disabled ? "none" : "0 4px 16px rgba(79,70,229,.35)", ...sx }}>
    {loading ? <><svg style={{ animation: "spin 1s linear infinite", width: 16, height: 16 }} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.4)" strokeWidth="3" /><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>Memproses…</> : children}
  </button>
);

const ErrorBox = ({ msg }) => msg ? (
  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff1f2", border: "1px solid #fca5a5", color: "#b91c1c", padding: "10px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 16, animation: "fadeIn .25s ease" }}>
    <Ic d={ICON.x} size={14} />{msg}
  </div>
) : null;

// ════════════════════════════════════════════════════════════
// 🔐 LOGIN
// ════════════════════════════════════════════════════════════
const LoginPage = ({ setPage, onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr("");
    if (!form.email || !form.password) return setErr("Email dan password wajib diisi.");
    setLoading(true);
    const res = await API.login(form.email, form.password);
    setLoading(false);
    if (!res.ok) return setErr(res.msg);
    onLogin(res.user);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <div style={{ width: "45%", minHeight: "100vh", background: "linear-gradient(150deg,#0f0c29,#302b63,#24243e)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 56px", position: "relative", overflow: "hidden" }} className="hide-mobile">
        <div style={{ position: "absolute", inset: 0, opacity: .18, backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,.18) 1px,transparent 0)", backgroundSize: "32px 32px" }} />
        <div style={{ position: "absolute", top: "20%", right: "-10%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(129,140,248,.25),transparent 70%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,.4)" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>JD</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>JasaDigital<span style={{ color: "#818cf8" }}>.</span></span>
          </div>
          <div className="anim-fadeUp">
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Selamat Datang Kembali</p>
            <h1 className="serif" style={{ fontSize: 52, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>Masuk ke<br />Akun Anda</h1>
            <p style={{ color: "rgba(255,255,255,.55)", fontSize: 17, lineHeight: 1.7, maxWidth: 320 }}>Kelola pesanan dan nikmati layanan digital terbaik untuk bisnis Anda.</p>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          {[["🌐", "Website profesional & responsif"], ["🎨", "Desain kreatif berkualitas tinggi"], ["⚡", "Pengerjaan cepat & memuaskan"]].map(([ic, tx], i) => (
            <div key={i} className={`anim-fadeUp d${i + 1}`} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 16, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{ic}</span>
              <span style={{ color: "rgba(255,255,255,.7)", fontSize: 14, fontWeight: 500 }}>{tx}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px", background: "#fff", position: "relative" }}>
        {/* Tombol Kembali ke Beranda */}
        <button onClick={() => setPage("home")}
          style={{ position: "absolute", top: 24, left: 24, display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#374151", transition: "all .2s", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.borderColor = "#d1d5db"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
          <Ic d={ICON.arrowL} size={15} /> Beranda
        </button>
        <div style={{ width: "100%", maxWidth: 400 }} className="anim-fadeUp">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 36 }} className="show-mobile">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>JD</span>
            </div>
            <span style={{ fontWeight: 900, fontSize: 18, color: "#111" }}>JasaDigital<span style={{ color: "#4f46e5" }}>.</span></span>
          </div>
          <h2 className="serif" style={{ fontSize: 36, fontWeight: 900, color: "#111827", marginBottom: 6 }}>Masuk</h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>
            Belum punya akun?{" "}
            <button onClick={() => setPage("register")} style={{ color: "#4f46e5", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>Daftar sekarang</button>
          </p>
          <ErrorBox msg={err} />
          <div style={{ marginBottom: 16 }}>
            <Label req>Email</Label>
            <TextInput icon={ICON.mail} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Label req>Password</Label>
              <button style={{ fontSize: 12, color: "#4f46e5", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Lupa password?</button>
            </div>
            <PwInput value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <BtnPrimary full loading={loading} onClick={submit}>Masuk ke Akun <Ic d={ICON.arrow} size={16} /></BtnPrimary>
          <div style={{ marginTop: 24, padding: "14px 16px", background: "#eef2ff", borderRadius: 14, border: "1px solid #c7d2fe" }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#4f46e5", marginBottom: 4 }}>💡 Akun Demo:</p>
            <p style={{ fontSize: 12, color: "#4338ca", fontFamily: "monospace" }}>admin@jasadigital.com · admin123</p>
            <p style={{ fontSize: 12, color: "#4338ca", fontFamily: "monospace" }}>budi@email.com · budi1234</p>
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 20 }}>
            Dengan masuk, Anda menyetujui <span style={{ color: "#4f46e5", cursor: "pointer" }}>Syarat & Ketentuan</span> kami.
          </p>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 📝 REGISTER
// ════════════════════════════════════════════════════════════
const RegisterPage = ({ setPage, onLogin }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nama: "", email: "", hp: "", password: "", konfirmasi: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const nextStep = () => {
    setErr("");
    if (!form.nama.trim()) return setErr("Nama lengkap wajib diisi.");
    if (!form.email.includes("@")) return setErr("Format email tidak valid.");
    setStep(2);
  };

  const submit = async () => {
    setErr("");
    if (form.password.length < 8) return setErr("Password minimal 8 karakter.");
    if (form.password !== form.konfirmasi) return setErr("Konfirmasi password tidak cocok.");
    setLoading(true);
    const res = await API.register(form.nama, form.email, form.password, form.hp);
    setLoading(false);
    if (!res.ok) return setErr(res.msg);
    onLogin(res.user);
  };

  const strength = (() => {
    const p = form.password; if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++; if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Lemah", "Sedang", "Kuat", "Sangat Kuat"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"][strength];

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <div style={{ width: "45%", minHeight: "100vh", background: "linear-gradient(150deg,#064e3b,#065f46,#047857)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 56px", position: "relative", overflow: "hidden" }} className="hide-mobile">
        <div style={{ position: "absolute", inset: 0, opacity: .15, backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,.2) 1px,transparent 0)", backgroundSize: "28px 28px" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 56 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,.2)" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>JD</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 22 }}>JasaDigital<span style={{ color: "#6ee7b7" }}>.</span></span>
          </div>
          <div className="anim-fadeUp">
            <p style={{ color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Bergabung Sekarang</p>
            <h1 className="serif" style={{ fontSize: 52, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>Buat Akun<br />Gratis Anda</h1>
            <p style={{ color: "rgba(255,255,255,.55)", fontSize: 17, lineHeight: 1.7, maxWidth: 320 }}>Daftarkan diri dan mulai perjalanan digital bersama kami.</p>
          </div>
        </div>
        <div style={{ position: "relative", background: "rgba(255,255,255,.08)", borderRadius: 20, padding: "24px", border: "1px solid rgba(255,255,255,.12)" }}>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Yang Anda Dapatkan</p>
          {[["⚡", "Konfirmasi pesanan dalam 24 jam"], ["🔒", "Data & transaksi 100% aman"], ["💬", "Support langsung via WhatsApp"], ["🎯", "Garansi revisi sesuai paket"]].map(([ic, tx], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{ic}</span>
              <span style={{ color: "rgba(255,255,255,.7)", fontSize: 14 }}>{tx}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px", background: "#fff", position: "relative" }}>
        {/* Tombol Kembali ke Beranda */}
        <button onClick={() => setPage("home")}
          style={{ position: "absolute", top: 24, left: 24, display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#374151", transition: "all .2s", boxShadow: "0 1px 4px rgba(0,0,0,.06)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.borderColor = "#d1d5db"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
          <Ic d={ICON.arrowL} size={15} /> Beranda
        </button>
        <div style={{ width: "100%", maxWidth: 400 }} className="anim-fadeUp">
          <h2 className="serif" style={{ fontSize: 36, fontWeight: 900, color: "#111827", marginBottom: 6 }}>Buat Akun</h2>
          <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
            Sudah punya akun?{" "}
            <button onClick={() => setPage("login")} style={{ color: "#4f46e5", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>Masuk di sini</button>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, border: `2px solid ${step >= s ? "#4f46e5" : "#e5e7eb"}`, background: step >= s ? "#4f46e5" : "#fff", color: step >= s ? "#fff" : "#9ca3af", transition: "all .25s" }}>
                  {step > s ? <Ic d={ICON.check} size={14} /> : s}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: step === s ? "#4f46e5" : "#9ca3af" }}>{s === 1 ? "Info Diri" : "Keamanan"}</span>
                {s < 2 && <div style={{ width: 40, height: 2, borderRadius: 99, background: step > 1 ? "#4f46e5" : "#e5e7eb", margin: "0 4px", transition: "background .25s" }} />}
              </div>
            ))}
          </div>
          <ErrorBox msg={err} />
          {step === 1 ? (
            <div key="step1" className="anim-fadeIn">
              <div style={{ marginBottom: 14 }}><Label req>Nama Lengkap</Label><TextInput icon={ICON.user} value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Nama Anda" /></div>
              <div style={{ marginBottom: 14 }}><Label req>Email</Label><TextInput icon={ICON.mail} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="nama@email.com" /></div>
              <div style={{ marginBottom: 24 }}><Label>No. WhatsApp</Label><TextInput icon={ICON.phone} type="tel" value={form.hp} onChange={e => setForm({ ...form, hp: e.target.value })} placeholder="08xxxxxxxxxx" /></div>
              <BtnPrimary full onClick={nextStep}>Lanjutkan <Ic d={ICON.arrow} size={16} /></BtnPrimary>
            </div>
          ) : (
            <div key="step2" className="anim-fadeIn">
              <div style={{ marginBottom: 14 }}>
                <Label req>Password</Label>
                <PwInput value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 5, borderRadius: 99, background: i <= strength ? strengthColor : "#e5e7eb", transition: "background .25s" }} />)}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: strengthColor }}>{strengthLabel}</span>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 8 }}>
                <Label req>Konfirmasi Password</Label>
                <PwInput value={form.konfirmasi} onChange={e => setForm({ ...form, konfirmasi: e.target.value })} placeholder="Ulangi password" />
                {form.konfirmasi && form.password !== form.konfirmasi && <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, marginTop: 4 }}>Password tidak cocok</p>}
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "16px 0 20px" }}>
                <input type="checkbox" defaultChecked style={{ marginTop: 2, accentColor: "#4f46e5", width: 15, height: 15 }} />
                <span style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>Saya menyetujui <span style={{ color: "#4f46e5", fontWeight: 700 }}>Syarat & Ketentuan</span> serta <span style={{ color: "#4f46e5", fontWeight: 700 }}>Kebijakan Privasi</span></span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setStep(1); setErr(""); }} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "2px solid #e5e7eb", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#374151" }}>← Kembali</button>
                <BtnPrimary onClick={submit} loading={loading} style={{ flex: 2 }}>Buat Akun ✓</BtnPrimary>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 🧭 NAVBAR
// ════════════════════════════════════════════════════════════
const Navbar = ({ user, page, setPage, onLogout }) => {
  const [mob, setMob] = useState(false);
  const links = user
    ? [{ id: "home", l: "Beranda" }, { id: "katalog", l: "Layanan" }, { id: "pesanan", l: "Pesanan Saya" }]
    : [{ id: "home", l: "Beranda" }, { id: "katalog", l: "Layanan" }];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(255,255,255,.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid #f1f5f9", boxShadow: "0 1px 12px rgba(0,0,0,.06)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(79,70,229,.3)" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>JD</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 18, color: "#111" }}>JasaDigital<span style={{ color: "#4f46e5" }}>.</span></span>
        </button>
        <nav style={{ display: "flex", gap: 32 }}>
          {links.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: page === n.id ? "#4f46e5" : "#4b5563", borderBottom: `2px solid ${page === n.id ? "#4f46e5" : "transparent"}`, paddingBottom: 2, transition: "all .2s" }}>{n.l}</button>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            <>
              <button onClick={() => setPage("profil")} style={{ display: "flex", alignItems: "center", gap: 10, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 20, padding: "6px 14px 6px 8px", cursor: "pointer" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 13 }}>{user.nama.charAt(0).toUpperCase()}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.nama}</span>
              </button>
              <button onClick={onLogout} style={{ padding: 8, borderRadius: 10, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }} title="Keluar"><Ic d={ICON.logout} size={18} /></button>
            </>
          ) : (
            <>
              <button onClick={() => setPage("login")} style={{ padding: "8px 18px", borderRadius: 10, background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#374151" }}>Masuk</button>
              <button onClick={() => setPage("register")} style={{ padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#fff", boxShadow: "0 2px 10px rgba(79,70,229,.3)" }}>Daftar Gratis</button>
            </>
          )}
          <button onClick={() => setMob(!mob)} style={{ display: "none", padding: 8, borderRadius: 10, background: "#f3f4f6", border: "none", cursor: "pointer" }} className="show-mobile">
            <Ic d={ICON.menu} size={20} />
          </button>
        </div>
      </div>
      {mob && (
        <div style={{ background: "#fff", borderTop: "1px solid #f1f5f9", padding: "12px 24px 16px" }} className="anim-slideDown">
          {links.map(n => (
            <button key={n.id} onClick={() => { setPage(n.id); setMob(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 0", background: "none", border: "none", borderBottom: "1px solid #f1f5f9", cursor: "pointer", fontWeight: 700, fontSize: 14, color: page === n.id ? "#4f46e5" : "#374151" }}>{n.l}</button>
          ))}
        </div>
      )}
    </header>
  );
};

// ════════════════════════════════════════════════════════════
// 🏠 HOME
// ════════════════════════════════════════════════════════════
const HomePage = ({ user, setPage, onOrder }) => {
  const [services, setServices] = useState([]);
  useEffect(() => { API.getServices().then(res => { if (res.ok) setServices(res.data.slice(0, 6)); }); }, []);
  return (
    <div>
      <section style={{ background: "linear-gradient(150deg,#0f0c29,#302b63,#24243e)", position: "relative", overflow: "hidden", padding: "96px 0 80px" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .18, backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,.15) 1px,transparent 0)", backgroundSize: "40px 40px" }} />
        <div style={{ position: "absolute", top: "-10%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(129,140,248,.15),transparent 65%)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative" }}>
          <div className="anim-fadeUp" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 99, padding: "8px 18px", color: "rgba(255,255,255,.75)", fontSize: 13, fontWeight: 600, marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", animation: "pulse 2s infinite" }} />50+ Proyek Selesai · Rating 5.0 ⭐
          </div>
          <h1 className="serif anim-fadeUp d1" style={{ fontSize: 68, fontWeight: 900, color: "#fff", lineHeight: 1.05, marginBottom: 24, maxWidth: 700 }}>
            Layanan Digital<br /><span style={{ background: "linear-gradient(135deg,#818cf8,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Berkualitas Tinggi</span>
          </h1>
          <p className="anim-fadeUp d2" style={{ color: "rgba(255,255,255,.6)", fontSize: 18, lineHeight: 1.8, maxWidth: 520, marginBottom: 40 }}>Website profesional & desain grafis yang membantu bisnis Anda tumbuh. Cepat, terjangkau, memuaskan.</p>
          <div className="anim-fadeUp d3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => setPage("katalog")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 32px", borderRadius: 16, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, color: "#fff", boxShadow: "0 8px 32px rgba(79,70,229,.4)" }}>Lihat Layanan <Ic d={ICON.arrow} size={17} /></button>
            {!user && <button onClick={() => setPage("register")} style={{ padding: "16px 32px", borderRadius: 16, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", cursor: "pointer", fontWeight: 700, fontSize: 15, color: "#fff" }}>Daftar Gratis →</button>}
          </div>
        </div>
      </section>
      <section style={{ background: "#fff", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {[["50+", "Proyek Selesai"], ["100%", "Kepuasan Klien"], ["24h", "Respon Admin"], ["3th+", "Pengalaman"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#4f46e5", marginBottom: 4 }}>{n}</div>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ color: "#4f46e5", fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>— Layanan Kami —</p>
          <h2 className="serif" style={{ fontSize: 40, fontWeight: 900, color: "#111827", marginBottom: 14 }}>Solusi Digital Terlengkap</h2>
          <p style={{ color: "#6b7280", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>Dari website company profile hingga desain kreatif, kami siap mewujudkan visi digital Anda.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
          {services.map(s => (
            <div key={s.id} style={{ background: "#fff", borderRadius: 24, border: "1px solid #e5e7eb", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,.05)", transition: "all .25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(79,70,229,.12)"; e.currentTarget.style.borderColor = "#c7d2fe"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.05)"; e.currentTarget.style.borderColor = "#e5e7eb"; }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>{s.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#111827", marginBottom: 8 }}>{s.name}</h3>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginBottom: 16 }}>{s.desc}</p>
              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#111827" }}>{fmt(s.price)}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><Ic d={ICON.clock} size={11} /> {s.days} hari</div>
                </div>
                <button onClick={() => { if (!user) setPage("login"); else onOrder(s); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#fff" }}>
                  Pesan <Ic d={ICON.arrow} size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 📋 KATALOG — FIX #2: filter tombol dibuat dinamis dari data API
// ════════════════════════════════════════════════════════════
const KatalogPage = ({ user, setPage, onOrder }) => {
  const [kat, setKat] = useState("Semua");
  const [q, setQ] = useState("");
  const [services, setServices] = useState([]);
  // FIX: kategori diambil dari data, bukan hardcode ["Semua","Website","Desain"]
  const [katList, setKatList] = useState(["Semua"]);

  useEffect(() => {
    API.getServices().then(res => {
      if (res.ok) {
        setServices(res.data);
        // Bangun daftar kategori unik dari data yang ada
        const unik = ["Semua", ...new Set(res.data.map(s => s.cat).filter(Boolean))];
        setKatList(unik);
      }
    });
  }, []);

  const filtered = services.filter(s =>
    (kat === "Semua" || s.cat === kat) &&
    (!q || s.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: "#4f46e5", fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Katalog</p>
        <h1 className="serif" style={{ fontSize: 40, fontWeight: 900, color: "#111827", marginBottom: 8 }}>Semua Layanan</h1>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 16, marginBottom: 28, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}><Ic d={ICON.list} size={16} /></span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari layanan…"
            style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: 12, border: "2px solid #e5e7eb", fontSize: 14, background: "#f9fafb", outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Render tombol filter dari katList yang dinamis */}
          {katList.map(k => (
            <button key={k} onClick={() => setKat(k)}
              style={{ padding: "10px 18px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: kat === k ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#f3f4f6", color: kat === k ? "#fff" : "#374151", boxShadow: kat === k ? "0 2px 8px rgba(79,70,229,.3)" : "none", transition: "all .2s" }}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, background: "#fff", borderRadius: 24, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p style={{ fontWeight: 700, color: "#6b7280" }}>Tidak ada layanan ditemukan.</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
        {filtered.map(s => (
          <div key={s.id} style={{ background: "#fff", borderRadius: 24, border: "1px solid #e5e7eb", padding: "28px", transition: "all .25s" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 36px rgba(79,70,229,.1)"; e.currentTarget.style.borderColor = "#c7d2fe"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "none"; }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>{s.icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 8 }}>{s.name}</h3>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginBottom: 16 }}>{s.desc}</p>
            <div style={{ marginBottom: 18 }}>
              {(s.features || []).map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic d={ICON.check} size={11} /></span>
                  <span style={{ fontSize: 13, color: "#374151" }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#111827" }}>{fmt(s.price)}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>⏱ {s.days} hari</div>
              </div>
              <button onClick={() => { if (!user) setPage("login"); else onOrder(s); }}
                style={{ padding: "12px 22px", borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                Pesan <Ic d={ICON.arrow} size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 📦 ORDER FLOW
// ════════════════════════════════════════════════════════════
const OrderFlow = ({ user, service, setPage, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ nama: user?.nama || "", email: user?.email || "", hp: user?.hp || "", desc: "", ref: "", deadline: "" });
  const [err, setErr] = useState("");
  const STEPS = ["Detail Layanan", "Informasi", "Konfirmasi"];
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      <button onClick={() => setPage("katalog")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontWeight: 600, fontSize: 14, marginBottom: 32 }}>
        <Ic d={ICON.arrowL} size={16} /> Kembali ke Katalog
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, border: `2px solid ${i <= step ? "#4f46e5" : "#e5e7eb"}`, background: i < step ? "#4f46e5" : i === step ? "#fff" : "#f9fafb", color: i < step ? "#fff" : i === step ? "#4f46e5" : "#9ca3af", boxShadow: i === step ? "0 0 0 4px rgba(79,70,229,.12)" : "none", transition: "all .25s" }}>
                    {i < step ? <Ic d={ICON.check} size={15} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, marginTop: 6, color: i === step ? "#4f46e5" : "#9ca3af" }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ width: 60, height: 2, background: i < step ? "#4f46e5" : "#e5e7eb", margin: "0 8px 20px", borderRadius: 99 }} />}
              </div>
            ))}
          </div>
          <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e5e7eb", padding: 32 }}>
            <ErrorBox msg={err} />
            {step === 0 && (
              <div className="anim-fadeIn">
                <h2 className="serif" style={{ fontSize: 26, fontWeight: 900, color: "#111827", marginBottom: 20 }}>Layanan Dipilih</h2>
                <div style={{ background: "#eef2ff", borderRadius: 20, border: "2px solid #c7d2fe", padding: 24, marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{service.icon}</div>
                    <div><h3 style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>{service.name}</h3><p style={{ fontSize: 13, color: "#6b7280" }}>{service.cat} · {service.days} hari</p></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {(service.features || []).map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "8px 12px", border: "1px solid #c7d2fe" }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic d={ICON.check} size={10} /></span>
                        <span style={{ fontSize: 12, color: "#374151" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <BtnPrimary full onClick={() => setStep(1)}>Lanjutkan Pemesanan <Ic d={ICON.arrow} size={16} /></BtnPrimary>
              </div>
            )}
            {step === 1 && (
              <div className="anim-fadeIn">
                <h2 className="serif" style={{ fontSize: 26, fontWeight: 900, color: "#111827", marginBottom: 20 }}>Informasi Pemesanan</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  {[["Nama Lengkap", "nama", "text", ICON.user, "Nama Anda", true], ["Email", "email", "email", ICON.mail, "nama@email.com", true], ["No. WhatsApp", "hp", "tel", ICON.phone, "08xxxxxxxxxx", false], ["Deadline", "deadline", "date", ICON.clock, "", false]].map(([l, k, t, ic, ph, req]) => (
                    <div key={k}><Label req={req}>{l}</Label><TextInput icon={ic} type={t} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={ph} /></div>
                  ))}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <Label req>Deskripsi Kebutuhan</Label>
                  <textarea value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} rows={4} placeholder="Jelaskan kebutuhan secara detail…"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "2px solid #e5e7eb", fontSize: 14, background: "#f9fafb", outline: "none", resize: "none", fontFamily: "inherit" }}
                    onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <Label>Link Referensi</Label>
                  <TextInput value={form.ref} onChange={e => setForm({ ...form, ref: e.target.value })} placeholder="https://contoh.com" />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(0)} style={{ flex: 1, padding: 13, borderRadius: 12, border: "2px solid #e5e7eb", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#374151" }}>← Kembali</button>
                  <BtnPrimary onClick={() => { if (!form.desc) return setErr("Deskripsi wajib diisi."); setErr(""); setStep(2); }} style={{ flex: 2 }}>Review Pesanan →</BtnPrimary>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="anim-fadeIn">
                <h2 className="serif" style={{ fontSize: 26, fontWeight: 900, color: "#111827", marginBottom: 20 }}>Konfirmasi Pesanan</h2>
                <div style={{ background: "#f9fafb", borderRadius: 16, padding: 20, marginBottom: 16 }}>
                  {[["Layanan", service.name], ["Harga", fmt(service.price)], ["Estimasi", service.days + " hari"], ["Nama", form.nama], ["Email", form.email], ["Kebutuhan", form.desc]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14 }}>
                      <span style={{ color: "#6b7280", fontWeight: 600, minWidth: 90 }}>{k}</span>
                      <span style={{ color: "#111827", fontWeight: 700, textAlign: "right", flex: 1 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fffbeb", borderRadius: 14, padding: "12px 16px", border: "1px solid #fcd34d", marginBottom: 20 }}>
                  <p style={{ fontSize: 12, color: "#92400e", fontWeight: 600, lineHeight: 1.7 }}>⚠️ Tim kami akan menghubungi Anda dalam <b>1×24 jam</b> untuk konfirmasi dan instruksi pembayaran.</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: 13, borderRadius: 12, border: "2px solid #e5e7eb", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#374151" }}>← Edit</button>
                  <BtnPrimary onClick={() => onSubmit({ jasaId: service.id, deskripsi: form.desc, ref: form.ref, deadline: form.deadline })} style={{ flex: 2 }}>
                    <Ic d={ICON.check} size={16} /> Kirim Pesanan
                  </BtnPrimary>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e5e7eb", padding: 24, position: "sticky", top: 88 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Ic d={ICON.shield} size={17} /> Ringkasan</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{service.icon}</div>
            <div><div style={{ fontWeight: 800, color: "#111827", fontSize: 14 }}>{service.name}</div><div style={{ fontSize: 12, color: "#9ca3af" }}>{service.cat}</div></div>
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", padding: "14px 0", marginBottom: 14 }}>
            {[["Harga", fmt(service.price)], ["Estimasi", service.days + " hari"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "#6b7280" }}>{k}</span><span style={{ fontWeight: 700, color: "#111827" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#4f46e5", marginBottom: 16 }}>{fmt(service.price)}</div>
          {[["🔒", "Transaksi aman"], ["🔄", "Garansi revisi"], ["💬", "Support WhatsApp"]].map(([ic, tx]) => (
            <div key={tx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{ic} {tx}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 📋 PESANAN
// ════════════════════════════════════════════════════════════
const PesananPage = ({ user, setPage }) => {
  const [orders, setOrders] = useState([]);
  const [detail, setDetail] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [editForm, setEditForm] = useState({ deskripsi: "", ref: "", deadline: "" });
  const [confirmBatal, setConfirmBatal] = useState(null);
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast2, setToast2] = useState(null);

  const notify2 = (msg, type = "success") => { setToast2({ msg, type }); setTimeout(() => setToast2(null), 3000); };
  const loadOrders = async () => { if (user) { const res = await API.getMyOrders(); if (res.ok) setOrders(res.data); } };
  useEffect(() => { loadOrders(); }, [user]);

  if (!user) return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
      <h2 className="serif" style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, color: "#111827" }}>Masuk untuk Melihat Pesanan</h2>
      <BtnPrimary onClick={() => setPage("login")} style={{ margin: "0 auto" }}>Masuk Sekarang</BtnPrimary>
    </div>
  );

  const filtered = orders.filter(o => !filter || o.status === filter);
  const openEdit = (o) => { setEditForm({ deskripsi: o.deskripsi || "", ref: o.ref || "", deadline: o.deadline || "" }); setEditOrder(o); };

  const handleSaveEdit = async () => {
    if (!editForm.deskripsi.trim()) return notify2("Deskripsi tidak boleh kosong.", "error");
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/api/orders/${editOrder.id}/edit`, { method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("jd_token")}` }, body: JSON.stringify({ deskripsi: editForm.deskripsi, ref: editForm.ref, deadline: editForm.deadline }) });
      const data = await r.json();
      if (data.ok) { setEditOrder(null); await loadOrders(); notify2("Pesanan berhasil diperbarui! ✅"); }
      else notify2(data.msg || "Gagal menyimpan.", "error");
    } catch { notify2("Gagal terhubung ke server.", "error"); }
    setSaving(false);
  };

  const handleBatal = async (id) => {
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/api/orders/${id}/batal`, { method: "PATCH", headers: { "Authorization": `Bearer ${localStorage.getItem("jd_token")}` } });
      const data = await r.json();
      setConfirmBatal(null);
      if (data.ok) { await loadOrders(); notify2("Pesanan berhasil dibatalkan."); }
      else notify2(data.msg || "Gagal membatalkan.", "error");
    } catch { notify2("Gagal terhubung ke server.", "error"); }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ color: "#4f46e5", fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Riwayat</p>
          <h1 className="serif" style={{ fontSize: 40, fontWeight: 900, color: "#111827" }}>Pesanan Saya</h1>
        </div>
        <button onClick={() => setPage("katalog")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 14, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#fff" }}>
          <Ic d={ICON.star} size={15} /> Pesan Baru
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          ["Total",   orders.length,                                         "#eef2ff", "#4f46e5"],
          ["Pending", orders.filter(o => o.status === "pending").length,     "#fffbeb", "#b45309"],
          ["Diproses",orders.filter(o => o.status === "diproses").length,    "#eff6ff", "#1d4ed8"],
          // FIX #3: lowercase "selesai" sesuai nilai dari DB
          ["Selesai", orders.filter(o => o.status === "selesai").length,     "#ecfdf5", "#065f46"],
        ].map(([l, c, bg, col]) => (
          <div key={l} style={{ background: bg, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: col }}>{c}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[["Semua", ""], ["Pending", "pending"], ["Diproses", "diproses"], ["Selesai", "selesai"], ["Dibatalkan", "dibatalkan"]].map(([label, val]) => (
          <button key={label} onClick={() => setFilter(val)}
            style={{ padding: "8px 18px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 13, background: filter === val ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "#fff", color: filter === val ? "#fff" : "#374151", border: filter === val ? "none" : "1px solid #e5e7eb", transition: "all .2s" }}>
            {label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "#fff", borderRadius: 24, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Belum Ada Pesanan</h3>
          <BtnPrimary onClick={() => setPage("katalog")} style={{ margin: "12px auto 0" }}>Pesan Sekarang</BtnPrimary>
        </div>
      ) : filtered.map(o => {
        const pct = { pending: 15, dikonfirmasi: 30, diproses: 55, revisi: 75, selesai: 100, dibatalkan: 0 }[o.status] || 15;
        const canEdit = o.status === "pending";
        const canCancel = o.status === "pending";
        return (
          <div key={o.id} style={{ background: "#fff", borderRadius: 24, border: `1px solid ${o.status === "dibatalkan" ? "#fecaca" : "#e5e7eb"}`, overflow: "hidden", marginBottom: 16, opacity: o.status === "dibatalkan" ? 0.75 : 1 }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.08)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
            <div style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: o.status === "dibatalkan" ? "#fee2e2" : "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                    {o.status === "dibatalkan" ? "❌" : (o.jasa_icon || "📦")}
                  </div>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#4f46e5", fontWeight: 700 }}>{o.nomor}</div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: "#111827" }}>{o.jasa_nama}</h3>
                    <div style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}><Ic d={ICON.clock} size={12} /> {o.tanggal_pesan?.split("T")[0] || o.created_at?.split("T")[0]}</div>
                  </div>
                </div>
                {/* FIX: Badge menerima status DB langsung */}
                <Badge status={o.status} />
              </div>
              {o.deskripsi && <div style={{ fontSize: 13, color: "#6b7280", background: "#f9fafb", borderRadius: 12, padding: "10px 14px", marginBottom: 14, border: "1px solid #f1f5f9" }}>{o.deskripsi}</div>}
              {o.catatan_admin && (
                <div style={{ background: "#fffbeb", borderRadius: 10, padding: "8px 14px", border: "1px solid #fcd34d", marginBottom: 14, fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: "#92400e" }}>📝 Admin: </span>
                  <span style={{ color: "#78350f" }}>{o.catatan_admin}</span>
                </div>
              )}
              {o.status !== "dibatalkan" && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
                    <span>Progress Pengerjaan</span><span style={{ fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 7, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#6366f1,#8b5cf6)", width: `${pct}%`, transition: "width 1s ease" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                    {["Pending", "Diproses", "Selesai"].map(s => (
                      <span key={s} style={{ fontSize: 11, fontWeight: 700, color: o.status === s.toLowerCase() ? "#4f46e5" : "#d1d5db" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid #f1f5f9", flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>{fmt(o.harga || 0)}</span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setDetail(o)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#374151" }}>
                    <Ic d={ICON.eye} size={14} /> Detail
                  </button>
                  {canEdit && <button onClick={() => openEdit(o)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1px solid #fcd34d", background: "#fffbeb", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#b45309" }}><Ic d={ICON.edit} size={14} /> Edit</button>}
                  {canCancel && <button onClick={() => setConfirmBatal(o)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1px solid #fca5a5", background: "#fff1f2", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#dc2626" }}><Ic d={ICON.x} size={14} /> Batalkan</button>}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {detail && (
        <Modal onClose={() => setDetail(null)}>
          <div style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 className="serif" style={{ fontSize: 22, fontWeight: 900, color: "#111827" }}>Detail Pesanan</h2>
              <button onClick={() => setDetail(null)} style={{ width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic d={ICON.x} size={16} /></button>
            </div>
            <div style={{ background: "#eef2ff", borderRadius: 14, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{detail.jasa_icon || "📦"}</span>
              <div><div style={{ fontWeight: 900, color: "#111827" }}>{detail.jasa_nama}</div><div style={{ fontFamily: "monospace", fontSize: 12, color: "#4f46e5", fontWeight: 700 }}>{detail.nomor}</div></div>
            </div>
            {[["Tanggal", detail.tanggal_pesan?.split("T")[0] || "-"], ["Harga", fmt(detail.harga || 0)], ["Deskripsi", detail.deskripsi], ["Referensi", detail.ref || "-"], ["Deadline", detail.deadline || "-"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f9fafb", fontSize: 14 }}>
                <span style={{ color: "#6b7280", fontWeight: 600, minWidth: 90 }}>{k}</span>
                <span style={{ color: "#111827", fontWeight: 700, textAlign: "right", flex: 1, wordBreak: "break-word" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: 14, alignItems: "center" }}>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>Status</span>
              <Badge status={detail.status} />
            </div>
            {detail.catatan_admin && (
              <div style={{ background: "#fffbeb", borderRadius: 12, padding: "12px 14px", border: "1px solid #fcd34d", marginTop: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>📝 Catatan Admin</p>
                <p style={{ fontSize: 13, color: "#78350f" }}>{detail.catatan_admin}</p>
              </div>
            )}
            <button onClick={() => setDetail(null)} style={{ width: "100%", marginTop: 20, padding: 14, borderRadius: 14, background: "#111827", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#fff" }}>Tutup</button>
          </div>
        </Modal>
      )}

      {editOrder && (
        <Modal onClose={() => setEditOrder(null)}>
          <div style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 className="serif" style={{ fontSize: 22, fontWeight: 900, color: "#111827" }}>Edit Pesanan</h2>
              <button onClick={() => setEditOrder(null)} style={{ width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic d={ICON.x} size={16} /></button>
            </div>
            <div style={{ background: "#fffbeb", borderRadius: 12, padding: "10px 14px", border: "1px solid #fcd34d", marginBottom: 20, fontSize: 12, color: "#92400e", fontWeight: 600 }}>⚠️ Edit hanya bisa dilakukan selama pesanan masih <b>Pending</b></div>
            <div style={{ marginBottom: 16 }}><Label req>Deskripsi Kebutuhan</Label><textarea value={editForm.deskripsi} onChange={e => setEditForm({ ...editForm, deskripsi: e.target.value })} rows={4} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "2px solid #e5e7eb", fontSize: 14, background: "#f9fafb", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = "#6366f1"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} /></div>
            <div style={{ marginBottom: 16 }}><Label>Link Referensi</Label><TextInput value={editForm.ref} onChange={e => setEditForm({ ...editForm, ref: e.target.value })} placeholder="https://contoh.com" /></div>
            <div style={{ marginBottom: 20 }}><Label>Deadline</Label><TextInput type="date" value={editForm.deadline} onChange={e => setEditForm({ ...editForm, deadline: e.target.value })} /></div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditOrder(null)} style={{ flex: 1, padding: 13, borderRadius: 12, border: "2px solid #e5e7eb", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#374151" }}>Batal</button>
              <BtnPrimary onClick={handleSaveEdit} loading={saving} style={{ flex: 2 }}><Ic d={ICON.check} size={16} /> Simpan Perubahan</BtnPrimary>
            </div>
          </div>
        </Modal>
      )}

      {confirmBatal && (
        <Modal onClose={() => setConfirmBatal(null)}>
          <div style={{ padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 900, color: "#111827", marginBottom: 8 }}>Batalkan Pesanan?</h2>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 6 }}>Pesanan <b style={{ color: "#4f46e5" }}>{confirmBatal.nomor}</b></p>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24, lineHeight: 1.7 }}>Pesanan yang sudah dibatalkan <b>tidak bisa dipulihkan</b>. Yakin ingin membatalkan?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmBatal(null)} style={{ flex: 1, padding: 13, borderRadius: 12, border: "2px solid #e5e7eb", background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#374151" }}>Tidak, Kembali</button>
              <button onClick={() => handleBatal(confirmBatal.id)} disabled={saving} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: saving ? "#fca5a5" : "linear-gradient(135deg,#dc2626,#b91c1c)", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", color: "#fff" }}>
                {saving ? "Memproses…" : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast2 && <Toast msg={toast2.msg} type={toast2.type} onDone={() => setToast2(null)} />}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 👤 PROFIL — FIX #3: hitungan selesai pakai lowercase "selesai"
// ════════════════════════════════════════════════════════════
const ProfilPage = ({ user, setPage, onLogout }) => {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ nama: user?.nama || "", email: user?.email || "", hp: user?.hp || "", kota: user?.kota || "" });
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast3, setToast3] = useState(null);
  const notify3 = (msg, type = "success") => { setToast3({ msg, type }); setTimeout(() => setToast3(null), 3000); };

  useEffect(() => { if (user) API.getMyOrders().then(res => { if (res.ok) setOrders(res.data); }); }, [user]);

  if (!user) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>👤</div>
      <BtnPrimary onClick={() => setPage("login")} style={{ margin: "0 auto" }}>Masuk</BtnPrimary>
    </div>
  );

  const handleSave = async () => {
    setSaving(true);
    const res = await API.updateUser(user.id, { nama: form.nama, hp: form.hp, kota: form.kota });
    setSaving(false);
    if (res.ok) { saveUser({ ...user, ...form }); setEdit(false); notify3("Profil berhasil disimpan! ✅"); }
    else notify3(res.msg || "Gagal menyimpan.", "error");
  };

  // FIX #3: bandingkan dengan lowercase "selesai" sesuai enum DB
  const totalPesanan   = orders.length;
  const aktifPesanan   = orders.filter(o => !["selesai", "dibatalkan"].includes(o.status)).length;
  const selesaiPesanan = orders.filter(o => o.status === "selesai").length;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: "#4f46e5", fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Akun Saya</p>
        <h1 className="serif" style={{ fontSize: 40, fontWeight: 900, color: "#111827" }}>Profil</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>
        <div>
          <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e5e7eb", padding: "28px 24px", textAlign: "center", marginBottom: 16 }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 30, fontWeight: 900, margin: "0 auto 14px", boxShadow: "0 4px 20px rgba(99,102,241,.35)" }}>
              {user.nama.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#111827", marginBottom: 4 }}>{user.nama}</h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>{user.email}</p>
            <span style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #6ee7b7", padding: "4px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>✓ Akun Aktif</span>
          </div>

          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5e7eb", padding: "18px 20px", marginBottom: 12 }}>
            {[
              ["Total",   totalPesanan,   "#4f46e5"],
              ["Aktif",   aktifPesanan,   "#b45309"],
              ["Selesai", selesaiPesanan, "#065f46"],
            ].map(([l, c, col]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{l} Pesanan</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: col }}>{c}</span>
              </div>
            ))}
          </div>

          <button onClick={onLogout} style={{ width: "100%", padding: "12px", borderRadius: 14, border: "2px solid #fca5a5", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.background = "#fff1f2"} onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
            <Ic d={ICON.logout} size={16} /> Keluar dari Akun
          </button>
        </div>

        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #e5e7eb", padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>Informasi Pribadi</h3>
            <button onClick={() => { setEdit(!edit); if (edit) setForm({ nama: user?.nama || "", email: user?.email || "", hp: user?.hp || "", kota: user?.kota || "" }); }}
              style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: edit ? "#fff1f2" : "#eef2ff", color: edit ? "#dc2626" : "#4f46e5" }}>
              {edit ? "Batal" : "Edit Profil"}
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[["Nama Lengkap", "nama"], ["Email", "email"], ["No. HP", "hp"], ["Kota", "kota"]].map(([l, k]) => (
              <div key={k}>
                <Label>{l}</Label>
                {edit && k !== "email"
                  ? <TextInput value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} placeholder={l} />
                  : <div style={{ padding: "11px 14px", borderRadius: 12, background: "#f9fafb", border: "1px solid #e5e7eb", fontSize: 14, fontWeight: 600, color: form[k] ? "#111827" : "#d1d5db" }}>{form[k] || "Belum diisi"}</div>
                }
              </div>
            ))}
          </div>
          {edit && (
            <div style={{ marginTop: 20 }}>
              <BtnPrimary onClick={handleSave} loading={saving}><Ic d={ICON.check} size={16} /> Simpan Perubahan</BtnPrimary>
            </div>
          )}
        </div>
      </div>
      {toast3 && <Toast msg={toast3.msg} type={toast3.type} onDone={() => setToast3(null)} />}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 🚀 MAIN APP
// FIX #1: Tidak auto-login — verifikasi token ke server dulu
// ════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage]                 = useState("home");
  // FIX #1: mulai null, bukan langsung getUser() dari localStorage
  const [user, setUser]                 = useState(null);
  const [authReady, setAuthReady]       = useState(false);
  const [orderService, setOrderService] = useState(null);
  const [toast, setToast]               = useState(null);

  // FIX #1: Verifikasi token ke server saat pertama kali load
  useEffect(() => {
    const stored = getUser();
    const token  = localStorage.getItem("jd_token");

    if (stored && token) {
      // Cek apakah token masih valid
      fetch(`${APP_CONFIG.apiUrl}/api/users/${stored.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.ok) {
            setUser(stored); // token valid, restore session
          } else {
            // Token tidak valid — bersihkan
            localStorage.removeItem("jd_token");
            localStorage.removeItem("jd_user");
          }
        })
        .catch(() => {
          // Server tidak bisa dijangkau — jangan auto-login
          localStorage.removeItem("jd_token");
          localStorage.removeItem("jd_user");
        })
        .finally(() => setAuthReady(true));
    } else {
      setAuthReady(true);
    }
  }, []);

  // Tampilkan loading kecil saat verifikasi
  if (!authReady) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <svg style={{ animation: "spin 1s linear infinite", width: 40, height: 40, color: "#4f46e5" }} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#e0e7ff" strokeWidth="3" />
        <path d="M12 2a10 10 0 0110 10" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );

  const notify = (msg, type = "success") => setToast({ msg, type });

  const handleLogin = (u) => { setUser(u); saveUser(u); setPage("home"); notify(`Selamat datang, ${u.nama}! 👋`); };
  const handleLogout = () => { API.logout(); setUser(null); setPage("home"); notify("Berhasil keluar."); };
  const handleOrder = (s) => { setOrderService(s); setPage("order"); };
  const handleSubmitOrder = async (data) => {
    const res = await API.createOrder(data);
    if (!res.ok) return notify(res.msg, "error");
    setPage("pesanan"); setOrderService(null);
    notify("Pesanan berhasil dikirim! 🎉 Tim kami segera menghubungi Anda.");
  };

  const noNav = ["login", "register"].includes(page);

  const renderPage = () => {
    switch (page) {
      case "login":    return <LoginPage    setPage={setPage} onLogin={handleLogin} />;
      case "register": return <RegisterPage setPage={setPage} onLogin={handleLogin} />;
      case "home":     return <HomePage     user={user} setPage={setPage} onOrder={handleOrder} />;
      case "katalog":  return <KatalogPage  user={user} setPage={setPage} onOrder={handleOrder} />;
      case "order":    return orderService ? <OrderFlow user={user} service={orderService} setPage={setPage} onSubmit={handleSubmitOrder} /> : null;
      case "pesanan":  return <PesananPage  user={user} setPage={setPage} />;
      case "profil":   return <ProfilPage   user={user} setPage={setPage} onLogout={handleLogout} />;
      default:         return <HomePage     user={user} setPage={setPage} onOrder={handleOrder} />;
    }
  };

  return (
    <>
      <GlobalStyle />
      <style>{`
        .hide-mobile {} .show-mobile { display: none !important; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      {/* Banner demo — hanya muncul saat VITE_DEMO_MODE=true */}
      <DemoBanner />
      {/* FIX #2 footer: flex column + min-height 100vh agar footer selalu di bawah */}
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
        {!noNav && <Navbar user={user} page={page} setPage={setPage} onLogout={handleLogout} />}
        <main style={{ flex: 1 }}>{renderPage()}</main>
        {!noNav && (
          <footer style={{ background: "#111827", padding: "32px 24px", textAlign: "center" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontWeight: 900, fontSize: 11 }}>JD</span>
                </div>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>JasaDigital<span style={{ color: "#818cf8" }}>.</span></span>
              </div>
              <p style={{ color: "#6b7280", fontSize: 13 }}>© 2025 JasaDigital. Semua hak dilindungi.</p>
            </div>
          </footer>
        )}
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}