import { useState, useEffect, useCallback } from "react";
import API from "./api.js";

// ════════════════════════════════════════════════════════════
// ⚙️ KONFIGURASI ENVIRONMENT
// Untuk DEMO     → buat file admin/.env.demo  lalu: vite build --mode demo
// Untuk PRODUKSI → buat file admin/.env       lalu: vite build
//
// Isi admin/.env (production):
//   VITE_API_URL=https://api.jasadigital.com
//   VITE_DEMO_MODE=false
//
// Isi admin/.env.demo:
//   VITE_API_URL=https://api-demo.jasadigital.com
//   VITE_DEMO_MODE=true
// ════════════════════════════════════════════════════════════
const APP_CONFIG = {
  apiUrl:  import.meta.env.VITE_API_URL   ?? "http://localhost:3001",
  isDemo:  import.meta.env.VITE_DEMO_MODE === "true",
};

// ─── DEMO BANNER (Admin) ─────────────────────────────────────
const DemoBanner = () => {
  if (!APP_CONFIG.isDemo) return null;
  return (
    <div style={{
      background: "#92400e", color: "#fff",
      textAlign: "center", padding: "7px 16px",
      fontSize: 12, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      flexShrink: 0,
    }}>
      <span>⚠️ MODE DEMO — data direset otomatis setiap 24 jam. Jangan gunakan data pelanggan asli.</span>
    </div>
  );
};

// ── HELPERS ──────────────────────────────────────────────────
const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const statusColor = (s) => ({
  pending:      "bg-amber-100 text-amber-700 border border-amber-200",
  dikonfirmasi: "bg-sky-100 text-sky-700 border border-sky-200",
  diproses:     "bg-blue-100 text-blue-700 border border-blue-200",
  revisi:       "bg-orange-100 text-orange-700 border border-orange-200",
  selesai:      "bg-emerald-100 text-emerald-700 border border-emerald-200",
  dibatalkan:   "bg-red-100 text-red-600 border border-red-200",
}[s] || "bg-gray-100 text-gray-600");

// ── ICONS ────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const p = { strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    dashboard:  <><rect x="3" y="3" width="7" height="7" rx="1.5" {...p}/><rect x="14" y="3" width="7" height="7" rx="1.5" {...p}/><rect x="3" y="14" width="7" height="7" rx="1.5" {...p}/><rect x="14" y="14" width="7" height="7" rx="1.5" {...p}/></>,
    orders:     <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" {...p}/>,
    payment:    <><rect x="2" y="5" width="20" height="14" rx="2" {...p}/><path d="M2 10h20" {...p}/></>,
    services:   <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" {...p}/>,
    customers:  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" {...p}/>,
    report:     <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" {...p}/>,
    users:      <><circle cx="12" cy="8" r="4" {...p}/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" {...p}/></>,
    plus:       <path d="M12 5v14M5 12h14" {...p}/>,
    edit:       <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" {...p}/>,
    trash:      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" {...p}/>,
    close:      <path d="M6 18L18 6M6 6l12 12" {...p}/>,
    check:      <path d="M5 13l4 4L19 7" {...p}/>,
    eye:        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...p}/><circle cx="12" cy="12" r="3" {...p}/></>,
    search:     <><circle cx="11" cy="11" r="8" {...p}/><path d="M21 21l-4.35-4.35" {...p}/></>,
    menu:       <path d="M4 6h16M4 12h16M4 18h16" {...p}/>,
    money:      <><circle cx="12" cy="12" r="10" {...p}/><path d="M12 6v12M9 9h4.5a1.5 1.5 0 010 3H9v3h4.5a1.5 1.5 0 000-3" {...p}/></>,
    calendar:   <><rect x="3" y="4" width="18" height="18" rx="2" {...p}/><path d="M16 2v4M8 2v4M3 10h18" {...p}/></>,
    shield:     <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p}/>,
    refresh:    <><path d="M23 4v6h-6M1 20v-6h6" {...p}/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" {...p}/></>,
    toggle_on:  <><rect x="2" y="7" width="20" height="10" rx="5" {...p}/><circle cx="16" cy="12" r="3" fill="currentColor" strokeWidth="0"/></>,
    toggle_off: <><rect x="2" y="7" width="20" height="10" rx="5" {...p}/><circle cx="8" cy="12" r="3" fill="currentColor" strokeWidth="0"/></>,
    logout:     <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" {...p}/>,
  };
  return <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">{paths[name]}</svg>;
};

// ── UI ATOMS ─────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      {title && (
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <Icon name="close" size={16}/>
          </button>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Field = ({ label, children, req }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}{req && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

// PENTING: gunakan autoComplete="off" dan stopPropagation untuk mencegah browser autofill
const Input = ({ className = "", ...rest }) => (
  <input
    autoComplete="off"
    {...rest}
    className={"w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white " + className}
  />
);

const Select = ({ className = "", ...rest }) => (
  <select
    {...rest}
    className={"w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white " + className}
  />
);

const Textarea = ({ className = "", ...rest }) => (
  <textarea
    {...rest}
    rows={3}
    className={"w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white resize-none " + className}
  />
);

const Btn = ({ children, variant = "primary", className = "", ...rest }) => {
  const styles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white",
    danger:  "bg-red-500 hover:bg-red-600 text-white",
    ghost:   "bg-gray-100 hover:bg-gray-200 text-gray-700",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
  };
  return (
    <button
      {...rest}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Notif = ({ msg, type = "success", onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-semibold text-white ${type === "error" ? "bg-red-500" : "bg-gray-900"}`}>
        <Icon name={type === "error" ? "close" : "check"} size={16}/>{msg}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// SEMUA KOMPONEN HALAMAN DI LUAR AdminApp
// Ini kunci agar state form tidak hilang saat polling
// ════════════════════════════════════════════════════════════

// ── MODAL RESET PASSWORD (komponen mandiri) ──────────────────
// Komponen ini berdiri sendiri dengan state sendiri
// Tidak ada data dari luar yang bisa mencemari field password
function ModalResetPassword({ user, onClose, notify }) {
  const [pwd,  setPwd]  = useState("");
  const [pwd2, setPwd2] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleReset = async () => {
    if (pwd.length < 6)   return notify("Password minimal 6 karakter!", "error");
    if (pwd !== pwd2)     return notify("Konfirmasi password tidak cocok!", "error");
    setBusy(true);
    const res = await API.resetPassword(user.id, pwd);
    setBusy(false);
    if (res.ok) { notify("Password berhasil direset! ✅"); onClose(); }
    else notify(res.msg || "Gagal reset password.", "error");
  };

  return (
    <Modal title="Reset Password" onClose={onClose}>
      <div className="bg-violet-50 rounded-xl p-4 mb-5 flex items-center gap-3 border border-violet-100">
        <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {user.nama.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-gray-900">{user.nama}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${user.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"}`}>
            {user.role === "admin" ? "👑 Admin" : "👤 Pelanggan"}
          </span>
        </div>
      </div>
      <Field label="Password Baru" req>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            placeholder="Min. 6 karakter"
            autoComplete="new-password"
            className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon name="eye" size={16}/>
          </button>
        </div>
      </Field>
      <Field label="Konfirmasi Password" req>
        <input
          type={show ? "text" : "password"}
          value={pwd2}
          onChange={e => setPwd2(e.target.value)}
          placeholder="Ulangi password baru"
          autoComplete="new-password"
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white"
        />
        {pwd2 && pwd !== pwd2 && <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>}
        {pwd2 && pwd === pwd2 && pwd.length >= 6 && <p className="text-xs text-emerald-600 mt-1">✓ Password cocok</p>}
      </Field>
      <div className="flex gap-2 justify-end mt-2">
        <Btn variant="ghost" onClick={onClose}>Batal</Btn>
        <Btn variant="warning" onClick={handleReset} disabled={busy}>
          <Icon name="shield" size={16}/>{busy ? "Menyimpan..." : "Reset Password"}
        </Btn>
      </div>
    </Modal>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────
function PageDashboard({ orders, users, adminUser }) {
  const pelanggan = users.filter(u => u.role === "pelanggan");
  const totalPendapatan = orders.filter(o => o.status === "selesai").reduce((s, o) => s + Number(o.harga || 0), 0);
  const stats = [
    { label: "Total Pesanan",    value: orders.length,                                  icon: "orders",   bg: "bg-indigo-50",  tc: "text-indigo-600" },
    { label: "Diproses",         value: orders.filter(o => o.status === "diproses").length, icon: "calendar", bg: "bg-blue-50",    tc: "text-blue-600" },
    { label: "Selesai",          value: orders.filter(o => o.status === "selesai").length,  icon: "check",    bg: "bg-emerald-50", tc: "text-emerald-600" },
    { label: "Total Pendapatan", value: fmt(totalPendapatan),                             icon: "money",    bg: "bg-violet-50",  tc: "text-violet-600" },
  ];
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang, {adminUser.nama}! 👋</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <span className={s.tc}><Icon name={s.icon} size={20}/></span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Icon name="orders" size={18}/>Pesanan Terbaru</h2>
          {orders.slice(0, 5).map(p => (
            <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div>
                <div className="font-semibold text-sm text-gray-800">{p.nomor}</div>
                <div className="text-xs text-gray-500">{p.user_nama} · {p.jasa_nama}</div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(p.status)}`}>{p.status}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2"><Icon name="users" size={18}/>Pelanggan Terdaftar</h2>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">{pelanggan.length}</span>
          </div>
          {pelanggan.slice(0, 5).map(u => (
            <div key={u.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {u.nama.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-800 truncate">{u.nama}</div>
                <div className="text-xs text-gray-400 truncate">{u.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PESANAN ──────────────────────────────────────────────────
function PagePesanan({ orders, refresh, notify }) {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("Semua");
  const [editData, setEditData] = useState(null);

  const filtered = orders.filter(p => {
    const q = search.toLowerCase();
    return (!q || (p.nomor || "").toLowerCase().includes(q) || (p.user_nama || "").toLowerCase().includes(q) || (p.jasa_nama || "").toLowerCase().includes(q))
      && (filter === "Semua" || p.status === filter);
  });

  const handleSave = async () => {
    await API.updateOrder(editData.id, { status: editData.status, catatan: editData.catatan_admin || "" });
    await refresh();
    setEditData(null);
    notify("Pesanan diperbarui!");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Pesanan Jasa</h1><p className="text-gray-500 text-sm mt-1">{orders.length} total pesanan</p></div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon name="search" size={16}/></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pesanan..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"/>
        </div>
        <Select value={filter} onChange={e => setFilter(e.target.value)} className="w-44">
          {["Semua","pending","dikonfirmasi","diproses","revisi","selesai","dibatalkan"].map(s => <option key={s}>{s}</option>)}
        </Select>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">
            {["No. Pesanan","Pelanggan","Layanan","Harga","Tanggal","Status","Aksi"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Tidak ada pesanan</td></tr>
              : filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-indigo-600">{p.nomor}</td>
                  <td className="px-4 py-3"><div className="font-medium text-gray-800">{p.user_nama || "—"}</div><div className="text-xs text-gray-400">{p.user_email}</div></td>
                  <td className="px-4 py-3 text-gray-700">{p.jasa_nama || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-gray-700">{fmt(p.harga || 0)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{(p.tanggal_pesan || "").split("T")[0] || "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(p.status)}`}>{p.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditData({ ...p })} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500"><Icon name="edit" size={15}/></button>
                      <button onClick={async () => { await API.deleteOrder(p.id); await refresh(); notify("Dihapus!"); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Icon name="trash" size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {editData && (
        <Modal title="Edit Status Pesanan" onClose={() => setEditData(null)}>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="font-mono font-bold text-indigo-600">{editData.nomor}</div>
            <div className="text-sm text-gray-600">{editData.user_nama} · {editData.jasa_nama}</div>
          </div>
          <Field label="Status Pesanan">
            <Select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}>
              {["pending","dikonfirmasi","diproses","revisi","selesai","dibatalkan"].map(s => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Catatan Admin">
            <Textarea value={editData.catatan_admin || ""} onChange={e => setEditData({ ...editData, catatan_admin: e.target.value })} placeholder="Catatan untuk pelanggan..."/>
          </Field>
          <div className="flex gap-2 justify-end mt-2">
            <Btn variant="ghost" onClick={() => setEditData(null)}>Batal</Btn>
            <Btn onClick={handleSave}><Icon name="check" size={16}/>Simpan</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── PEMBAYARAN ───────────────────────────────────────────────
function PagePembayaran({ orders, refresh, notify }) {
  const totalPendapatan = orders.filter(o => o.status === "selesai").reduce((s, o) => s + Number(o.harga || 0), 0);
  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Manajemen Pembayaran</h1></div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending",          count: orders.filter(o => o.status === "pending").length,  color: "text-red-600",    bg: "bg-red-50" },
          { label: "Sedang Diproses",  count: orders.filter(o => o.status === "diproses").length, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Total Pendapatan", count: fmt(totalPendapatan),                                color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-5 border border-gray-100`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-sm text-gray-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">
            {["No. Pesanan","Pelanggan","Layanan","Harga","Tanggal","Status","Aksi"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {orders.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-semibold text-indigo-600">{p.nomor}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{p.user_nama || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{p.jasa_nama || "—"}</td>
                <td className="px-4 py-3 font-semibold">{fmt(p.harga || 0)}</td>
                <td className="px-4 py-3 text-gray-600">{(p.tanggal_pesan || "").split("T")[0] || "—"}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(p.status)}`}>{p.status}</span></td>
                <td className="px-4 py-3">
                  {p.status === "pending" && (
                    <Btn variant="success" className="py-1.5 px-3 text-xs" onClick={async () => { await API.updateOrder(p.id, { status: "diproses", catatan: "Pembayaran terverifikasi" }); await refresh(); notify("Diverifikasi!"); }}>
                      <Icon name="check" size={13}/>Proses
                    </Btn>
                  )}
                  {p.status === "selesai" && <span className="text-xs text-emerald-600 font-semibold">✓ Selesai</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── MANAJEMEN JASA ───────────────────────────────────────────
// State form ada di sini (di luar AdminApp), aman dari polling
function PageJasa({ services, refresh, notify }) {
  // form state lokal di komponen ini — aman karena komponen ini tidak di-remount
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [nama, setNama]           = useState("");
  const [cat, setCat]             = useState("");
  const [harga, setHarga]         = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [hari, setHari]           = useState("");
  const [icon, setIcon]           = useState("🌐");
  const [fitur, setFitur]         = useState("");

  const cats = [...new Set(services.map(s => s.cat).filter(Boolean))];

  const openTambah = () => {
    setEditId(null);
    setNama(""); setCat(cats[0] || ""); setHarga(""); setDeskripsi("");
    setHari(""); setIcon("🌐"); setFitur("");
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditId(s.id);
    setNama(s.name || "");
    setCat(s.cat || "");
    setHarga(String(s.price || ""));
    setDeskripsi(s.deskripsi || s.desc || "");
    setHari(String(s.days || ""));
    setIcon(s.icon || "🌐");
    setFitur((s.features || []).join("\n"));
    setShowModal(true);
  };

  const handleSimpan = async () => {
    if (!nama || !harga) return notify("Lengkapi nama dan harga!", "error");
    const katId = services.find(s => s.cat === cat)?.katId || 1;
    const data = { name: nama, katId, price: +harga, desc: deskripsi, daysMin: 1, daysMax: +hari || 7, features: fitur.split("\n").filter(Boolean) };
    if (editId) { await API.updateService(editId, { ...data, active: 1 }); notify("Jasa diperbarui!"); }
    else        { await API.addService(data); notify("Jasa ditambahkan!"); }
    setShowModal(false);
    await refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Manajemen Jasa</h1><p className="text-gray-500 text-sm mt-1">{services.length} layanan terdaftar</p></div>
        <Btn onClick={openTambah}><Icon name="plus" size={16}/>Tambah Jasa</Btn>
      </div>

      {cats.map(c => (
        <div key={c} className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
            {c.toLowerCase().includes("web") ? "🌐" : "🎨"} Jasa {c}
          </h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
            {services.filter(s => s.cat === c).map(s => (
              <div key={s.id} className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow ${s.active ? "border-gray-100" : "border-red-100 opacity-60"}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.toLowerCase().includes("web") ? "bg-indigo-50 text-indigo-600" : "bg-pink-50 text-pink-600"}`}>{c}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500"><Icon name="edit" size={14}/></button>
                    <button onClick={async () => { await API.deleteService(s.id); await refresh(); notify("Dihapus!"); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Icon name="trash" size={14}/></button>
                  </div>
                </div>
                <div className="text-2xl mb-2">{s.icon || "📦"}</div>
                <h3 className="font-bold text-gray-900 mb-1">{s.name}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{s.deskripsi || s.desc}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-indigo-600">{fmt(s.price)}</span>
                  <span className="text-xs text-gray-400">{s.days} hari</span>
                </div>
                {!s.active && <div className="mt-2 text-xs text-red-500 font-semibold">● Nonaktif</div>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {services.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">📦</div>
          <p className="font-semibold">Belum ada layanan. Klik Tambah Jasa!</p>
        </div>
      )}

      {showModal && (
        <Modal title={editId ? "Edit Jasa" : "Tambah Jasa Baru"} onClose={() => setShowModal(false)}>
          <Field label="Icon (emoji)" req>
            <input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🌐" autoComplete="off"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white"/>
          </Field>
          <Field label="Nama Jasa" req>
            <input value={nama} onChange={e => setNama(e.target.value)} placeholder="cth. Website Portofolio" autoComplete="off"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white"/>
          </Field>
          <Field label="Kategori">
            <select value={cat} onChange={e => setCat(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white">
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Harga (Rp)" req>
            <input type="number" value={harga} onChange={e => setHarga(e.target.value)} placeholder="500000" autoComplete="off"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white"/>
          </Field>
          <Field label="Estimasi Durasi (hari)">
            <input value={hari} onChange={e => setHari(e.target.value)} placeholder="7" autoComplete="off"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white"/>
          </Field>
          <Field label="Deskripsi">
            <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white resize-none"/>
          </Field>
          <Field label="Fitur (satu per baris)">
            <textarea value={fitur} onChange={e => setFitur(e.target.value)} rows={3} placeholder={"Revisi 3x\nFile SVG\nKonsultasi gratis"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white resize-none"/>
          </Field>
          <div className="flex gap-2 justify-end mt-2">
            <Btn variant="ghost" onClick={() => setShowModal(false)}>Batal</Btn>
            <Btn onClick={handleSimpan}><Icon name="check" size={16}/>Simpan</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── PELANGGAN ────────────────────────────────────────────────
function PagePelanggan({ users, refresh, notify }) {
  const [search, setSearch]         = useState("");
  const [userReset, setUserReset]   = useState(null);

  const pelanggan = users.filter(u => u.role === "pelanggan").filter(u =>
    !search || u.nama.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Data Pelanggan</h1><p className="text-gray-500 text-sm mt-1">{pelanggan.length} pelanggan</p></div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon name="search" size={16}/></span>
          {/* Gunakan input biasa dengan type="text" eksplisit */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email pelanggan..."
            autoComplete="off"
            name="search-pelanggan"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">
            {["#","Nama","Email","No. HP","Kota","Tgl Daftar","Status","Aksi"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {pelanggan.length === 0
              ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">Belum ada pelanggan</td></tr>
              : pelanggan.map((u, i) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.nama.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.hp || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{u.kota || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{(u.createdAt || "").split("T")[0] || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${u.aktif ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      {u.aktif ? "✓ Aktif" : "✗ Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={async () => { await API.toggleUser(u.id); await refresh(); notify("Status diperbarui!"); }}
                        title={u.aktif ? "Nonaktifkan" : "Aktifkan"}
                        className={`p-1.5 rounded-lg ${u.aktif ? "hover:bg-amber-50 text-amber-500" : "hover:bg-emerald-50 text-emerald-500"}`}>
                        <Icon name={u.aktif ? "toggle_on" : "toggle_off"} size={18}/>
                      </button>
                      <button onClick={() => setUserReset(u)} title="Reset Password"
                        className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-500">
                        <Icon name="shield" size={15}/>
                      </button>
                      <button onClick={async () => { if (!confirm("Hapus pelanggan ini?")) return; await API.deleteUser(u.id); await refresh(); notify("Dihapus!"); }}
                        title="Hapus" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                        <Icon name="trash" size={15}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Modal reset password muncul terpisah, state-nya bersih */}
      {userReset && (
        <ModalResetPassword
          key={userReset.id}
          user={userReset}
          onClose={() => setUserReset(null)}
          notify={notify}
        />
      )}
    </div>
  );
}

// ── USER MANAGEMENT ──────────────────────────────────────────
function PageUsers({ users, adminUser, refresh, notify }) {
  const [search, setSearch]         = useState("");
  const [tab, setTab]               = useState("semua");
  const [userReset, setUserReset]   = useState(null);
  const [showTambah, setShowTambah] = useState(false);

  // State form tambah admin — terpisah per field agar tidak ada autofill silang
  const [fNama, setFNama]   = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fPwd, setFPwd]     = useState("");
  const [fHp, setFHp]       = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy]       = useState(false);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (!q || u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (tab === "semua" || u.role === tab);
  });

  const openTambah = () => {
    setFNama(""); setFEmail(""); setFPwd(""); setFHp("");
    setShowPwd(false);
    setShowTambah(true);
  };

  const handleAddAdmin = async () => {
    if (!fNama || !fEmail || !fPwd) return notify("Lengkapi semua field!", "error");
    if (fPwd.length < 6)           return notify("Password minimal 6 karakter!", "error");
    setBusy(true);
    const res = await API.addAdmin({ nama: fNama, email: fEmail, password: fPwd, hp: fHp });
    setBusy(false);
    if (res.ok) { notify("Admin ditambahkan! ✅"); setShowTambah(false); await refresh(); }
    else notify(res.msg || "Gagal.", "error");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            {users.filter(u => u.role === "admin").length} admin · {users.filter(u => u.role === "pelanggan").length} pelanggan
          </p>
        </div>
        <Btn onClick={openTambah}><Icon name="plus" size={16}/>Tambah Admin</Btn>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-48 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon name="search" size={16}/></span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            autoComplete="off"
            name="search-users"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {[["semua","Semua"],["admin","👑 Admin"],["pelanggan","👤 Pelanggan"]].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === v ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">
            {["#","Nama","Email","No. HP","Role","Tgl Daftar","Status","Aksi"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">Tidak ada user</td></tr>
              : filtered.map((u, i) => (
                <tr key={u.id} className={`border-b border-gray-50 hover:bg-gray-50 ${u.role === "admin" ? "bg-violet-50/30" : ""}`}>
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${u.role === "admin" ? "bg-violet-500" : "bg-gradient-to-br from-indigo-400 to-indigo-600"}`}>
                        {u.nama.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.hp || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${u.role === "admin" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}>
                      {u.role === "admin" ? "👑 Admin" : "👤 Pelanggan"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{(u.createdAt || "").split("T")[0] || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${u.aktif ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      {u.aktif ? "✓ Aktif" : "✗ Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {u.id !== adminUser.id && (
                        <button onClick={async () => { await API.toggleUser(u.id); await refresh(); notify("Status diperbarui!"); }}
                          title={u.aktif ? "Nonaktifkan" : "Aktifkan"}
                          className={`p-1.5 rounded-lg ${u.aktif ? "hover:bg-amber-50 text-amber-500" : "hover:bg-emerald-50 text-emerald-500"}`}>
                          <Icon name={u.aktif ? "toggle_on" : "toggle_off"} size={18}/>
                        </button>
                      )}
                      <button onClick={() => setUserReset(u)} title="Reset Password"
                        className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-500">
                        <Icon name="shield" size={15}/>
                      </button>
                      {u.id !== adminUser.id && (
                        <button onClick={async () => { if (u.role === "admin" && !confirm("Hapus akun admin ini?")) return; await API.deleteUser(u.id); await refresh(); notify("Dihapus!"); }}
                          title="Hapus" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                          <Icon name="trash" size={15}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Modal tambah admin */}
      {showTambah && (
        <Modal title="Tambah Akun Admin" onClose={() => setShowTambah(false)}>
          <div className="bg-violet-50 rounded-xl p-3 mb-4 border border-violet-100 text-xs text-violet-700 font-semibold">
            👑 Akun admin memiliki akses penuh ke semua menu panel.
          </div>
          {/* Pakai field terpisah per useState — tidak ada object form yang bisa di-autofill browser */}
          <Field label="Nama Lengkap" req>
            <input value={fNama} onChange={e => setFNama(e.target.value)} placeholder="Nama Admin"
              autoComplete="off" name="admin-nama"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white"/>
          </Field>
          <Field label="Email" req>
            <input type="email" value={fEmail} onChange={e => setFEmail(e.target.value)} placeholder="admin@email.com"
              autoComplete="off" name="admin-email"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white"/>
          </Field>
          <Field label="No. HP">
            <input type="tel" value={fHp} onChange={e => setFHp(e.target.value)} placeholder="08xxxxxxxxxx"
              autoComplete="off" name="admin-hp"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white"/>
          </Field>
          <Field label="Password" req>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} value={fPwd} onChange={e => setFPwd(e.target.value)}
                placeholder="Min. 6 karakter" autoComplete="new-password" name="admin-password"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-white"/>
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon name="eye" size={16}/>
              </button>
            </div>
          </Field>
          <div className="flex gap-2 justify-end mt-2">
            <Btn variant="ghost" onClick={() => setShowTambah(false)}>Batal</Btn>
            <Btn onClick={handleAddAdmin} disabled={busy}>
              <Icon name="plus" size={16}/>{busy ? "Menyimpan..." : "Tambah Admin"}
            </Btn>
          </div>
        </Modal>
      )}

      {/* Modal reset password — key={id} memastikan state bersih setiap ganti user */}
      {userReset && (
        <ModalResetPassword
          key={userReset.id}
          user={userReset}
          onClose={() => setUserReset(null)}
          notify={notify}
        />
      )}
    </div>
  );
}

// ── LAPORAN ──────────────────────────────────────────────────
function PageLaporan({ orders }) {
  const [dari, setDari]     = useState("");
  const [sampai, setSampai] = useState("");
  const totalPendapatan = orders.filter(o => o.status === "selesai").reduce((s, o) => s + Number(o.harga || 0), 0);

  const filteredData = orders.filter(o => {
    if (!dari && !sampai) return true;
    const d = new Date(o.tanggal_pesan || o.created_at);
    if (dari && d < new Date(dari)) return false;
    if (sampai && d > new Date(sampai)) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Laporan</h1></div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5 flex gap-3 flex-wrap items-center">
        <div className="flex gap-2 ml-auto items-center flex-wrap">
          <Input type="date" value={dari} onChange={e => setDari(e.target.value)} className="w-36 py-2"/>
          <span className="text-xs text-gray-400">s/d</span>
          <Input type="date" value={sampai} onChange={e => setSampai(e.target.value)} className="w-36 py-2"/>
          {(dari || sampai) && <button onClick={() => { setDari(""); setSampai(""); }} className="text-xs text-red-500 font-semibold">Reset</button>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-indigo-50 rounded-2xl p-5"><div className="text-2xl font-bold text-indigo-700">{filteredData.length}</div><div className="text-sm text-gray-600">Total Pesanan</div></div>
        <div className="bg-emerald-50 rounded-2xl p-5"><div className="text-2xl font-bold text-emerald-700">{filteredData.filter(o => o.status === "selesai").length}</div><div className="text-sm text-gray-600">Selesai</div></div>
        <div className="bg-violet-50 rounded-2xl p-5"><div className="text-2xl font-bold text-violet-700">{fmt(totalPendapatan)}</div><div className="text-sm text-gray-600">Total Pendapatan</div></div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">
            {["No. Pesanan","Pelanggan","Layanan","Harga","Tanggal","Status"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filteredData.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-indigo-600 font-semibold">{p.nomor}</td>
                <td className="px-4 py-3 text-gray-800">{p.user_nama || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{p.jasa_nama || "—"}</td>
                <td className="px-4 py-3 font-semibold">{fmt(p.harga || 0)}</td>
                <td className="px-4 py-3 text-gray-500">{(p.tanggal_pesan || "").split("T")[0] || "—"}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor(p.status)}`}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ADMIN LOGIN
// ════════════════════════════════════════════════════════════
function AdminLogin({ onLogin }) {
  const [email, setEmail]   = useState("");
  const [pwd, setPwd]       = useState("");
  const [err, setErr]       = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow]     = useState(false);

  const handleSubmit = async () => {
    setErr("");
    if (!email || !pwd) return setErr("Email dan password wajib diisi.");
    setLoading(true);
    const res = await API.login(email, pwd);
    setLoading(false);
    if (!res.ok) return setErr(res.msg || "Login gagal.");
    if (res.user.role !== "admin") return setErr("Akun ini bukan admin.");
    onLogin(res.user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Icon name="shield" size={28}/>
          </div>
          <h1 className="text-2xl font-black text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">JasaDigital Studio</p>
        </div>
        {err && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-2xl mb-5">
            <Icon name="close" size={14}/>{err}
          </div>
        )}
        <Field label="Email Admin" req>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="admin@jasadigital.com"
            autoComplete="username"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-gray-50"/>
        </Field>
        <Field label="Password" req>
          <div className="relative">
            <input type={show ? "text" : "password"} value={pwd} onChange={e => setPwd(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm bg-gray-50"/>
            <button onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">{show ? "🙈" : "👁️"}</button>
          </div>
        </Field>
        <button onClick={handleSubmit} disabled={loading}
          className="w-full mt-2 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}>
          {loading ? "Memproses…" : <><Icon name="shield" size={16}/>Masuk sebagai Admin</>}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN ADMIN APP — hanya layout shell + data fetching
// Tidak ada komponen halaman yang didefinisikan di sini
// ════════════════════════════════════════════════════════════
export default function AdminApp() {
  const [adminUser, setAdminUser]       = useState(null);
  const [page, setPage]                 = useState("dashboard");
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [notification, setNotification] = useState(null);
  const [users,    setUsers]    = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [services, setServices] = useState([]);

  const refresh = useCallback(async () => {
    const [u, o, s] = await Promise.all([API.getUsers(), API.getOrders(), API.getAllServices()]);
    if (u.ok) setUsers(u.data);
    if (o.ok) setOrders(o.data);
    if (s.ok) setServices(s.data);
  }, []);

  useEffect(() => { if (adminUser) refresh(); }, [adminUser]);
  useEffect(() => { refresh(); }, [page]);

  // Polling setiap 10 detik — data diupdate tapi komponen halaman tidak di-remount
  useEffect(() => {
    const id = setInterval(refresh, 10000);
    return () => clearInterval(id);
  }, []);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const menuItems = [
    { id: "dashboard",  label: "Dashboard",       icon: "dashboard" },
    { id: "pesanan",    label: "Pesanan Jasa",     icon: "orders" },
    { id: "pembayaran", label: "Pembayaran",       icon: "payment" },
    { id: "jasa",       label: "Manajemen Jasa",   icon: "services" },
    { id: "pelanggan",  label: "Pelanggan",        icon: "customers" },
    { id: "users",      label: "User Management",  icon: "users" },
    { id: "laporan",    label: "Laporan",          icon: "report" },
  ];

  if (!adminUser) return <AdminLogin onLogin={u => { setAdminUser(u); refresh(); }}/>;

  // Props yang diteruskan ke setiap halaman
  const p = { orders, users, services, adminUser, refresh, notify };

  // Render semua halaman sekaligus tapi hanya tampilkan yang aktif
  // Ini mempertahankan state lokal tiap halaman meskipun polling berjalan
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Banner demo — hanya muncul saat VITE_DEMO_MODE=true */}
      <DemoBanner />

      <div className="flex flex-1 overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? "w-60" : "w-16"} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shadow-sm flex-shrink-0`}>
        <div className={`flex items-center gap-3 px-5 py-4 border-b border-gray-100 ${!sidebarOpen && "justify-center"}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xs">JD</span>
          </div>
          {sidebarOpen && <div><div className="font-bold text-gray-900 text-sm">JasaDigital</div><div className="text-xs text-gray-400">Admin Panel</div></div>}
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 py-2.5 my-0.5 transition-all text-sm font-medium
                ${!sidebarOpen ? "justify-center px-0" : "px-4 mx-2 rounded-xl"}
                ${page === item.id ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
              style={{ width: sidebarOpen ? "calc(100% - 16px)" : "100%", borderRadius: sidebarOpen ? "12px" : "0" }}>
              <span className={`flex-shrink-0 ${page === item.id ? "text-indigo-600" : "text-gray-400"}`}>
                <Icon name={item.icon} size={18}/>
              </span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className={`border-t border-gray-100 ${sidebarOpen ? "p-4" : "p-2"}`}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-2">
                <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold">
                  {adminUser.nama.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-700 truncate">{adminUser.nama}</div>
                  <div className="text-xs text-gray-400">Admin</div>
                </div>
              </div>
              <button onClick={() => setAdminUser(null)} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 border border-red-100">
                <Icon name="logout" size={16}/>Keluar
              </button>
            </>
          ) : (
            <button onClick={() => setAdminUser(null)} title="Keluar" className="w-full flex items-center justify-center p-2.5 rounded-xl text-red-400 hover:bg-red-50">
              <Icon name="logout" size={18}/>
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <Icon name="menu" size={20}/>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={refresh} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-indigo-500 transition-colors" title="Refresh data">
              <Icon name="refresh" size={18}/>
            </button>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/>Live Sync
            </div>
            <span className="text-sm font-semibold text-gray-700">{adminUser.nama}</span>
            <button onClick={() => setAdminUser(null)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 border border-red-100">
              <Icon name="logout" size={16}/><span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Render semua halaman, sembunyikan yang tidak aktif — state tetap terjaga */}
        <main className="flex-1 overflow-y-auto p-6">
          <div style={{ display: page === "dashboard"  ? "block" : "none" }}><PageDashboard  {...p}/></div>
          <div style={{ display: page === "pesanan"    ? "block" : "none" }}><PagePesanan    {...p}/></div>
          <div style={{ display: page === "pembayaran" ? "block" : "none" }}><PagePembayaran {...p}/></div>
          <div style={{ display: page === "jasa"       ? "block" : "none" }}><PageJasa       {...p}/></div>
          <div style={{ display: page === "pelanggan"  ? "block" : "none" }}><PagePelanggan  {...p}/></div>
          <div style={{ display: page === "users"      ? "block" : "none" }}><PageUsers      {...p}/></div>
          <div style={{ display: page === "laporan"    ? "block" : "none" }}><PageLaporan    {...p}/></div>
        </main>
      </div>

      {notification && <Notif msg={notification.msg} type={notification.type} onClose={() => setNotification(null)}/>}
      </div>
    </div>
  );
}