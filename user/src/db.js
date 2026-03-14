// ============================================================
// db.js — Shared "Database" via localStorage
// Simpan file ini di: src/db.js
// Dipakai OLEH KEDUA aplikasi (admin & user)
// ============================================================

const KEYS = {
  USERS:   "jd_users",
  ORDERS:  "jd_orders",
  SERVICES:"jd_services",
};

// ── seed default data sekali saja ──────────────────────────
const DEFAULT_SERVICES = [
  { id:1, cat:"Website", name:"Website Company Profile", price:2500000, days:"7–14", icon:"🌐", desc:"Website profesional, responsif, dan modern untuk perusahaan Anda.", features:["Desain custom","5 halaman","Mobile responsif","SEO dasar","Form kontak"], active:true },
  { id:2, cat:"Website", name:"Website Toko Online",     price:5000000, days:"14–30",icon:"🛒", desc:"Platform e-commerce lengkap dengan keranjang, checkout, dan manajemen produk.", features:["Katalog produk","Keranjang & checkout","Dashboard penjual","Payment gateway","Notifikasi email"], active:true },
  { id:3, cat:"Website", name:"Website Landing Page",    price:1500000, days:"5–7",  icon:"🚀", desc:"Landing page konversi tinggi untuk kampanye produk atau layanan Anda.", features:["Desain eye-catching","Animasi modern","CTA optimal","Fast loading","Analytics"], active:true },
  { id:4, cat:"Desain",  name:"Desain Logo",             price:350000,  days:"3–5",  icon:"✏️", desc:"Logo profesional yang mencerminkan identitas dan nilai brand Anda.", features:["3 konsep awal","Revisi 3×","File AI/PNG/SVG","Panduan warna","Versi horizontal & square"], active:true },
  { id:5, cat:"Desain",  name:"Desain Poster",           price:150000,  days:"1–2",  icon:"🖼️", desc:"Poster promosi atau event dengan visual menarik dan siap cetak.", features:["Revisi 2×","File PNG/PDF","Ukuran kustom","Print-ready"], active:true },
  { id:6, cat:"Desain",  name:"Desain Banner",           price:100000,  days:"1",    icon:"📐", desc:"Banner web atau media sosial yang on-brand dan eye-catching.", features:["Revisi 1×","Format web & print","Berbagai ukuran"], active:true },
];

const DEFAULT_USERS = [
  { id:1, nama:"Super Admin", email:"admin@jasadigital.com", password:"admin123", hp:"081234567890", kota:"Jakarta", role:"admin", aktif:true, createdAt:"2025-01-01" },
];

const DEFAULT_ORDERS = [
  { id:"ORD-001", userId:2, jasaId:1, tgl:"2025-01-10", status:"Selesai",  bayar:"Lunas",      desc:"Company profile PT Maju Jaya",      bukti:true  },
  { id:"ORD-002", userId:2, jasaId:4, tgl:"2025-01-20", status:"Diproses", bayar:"Lunas",      desc:"Logo brand fashion lokal",           bukti:true  },
  { id:"ORD-003", userId:2, jasaId:3, tgl:"2025-02-01", status:"Pending",  bayar:"Belum Bayar",desc:"Landing page produk kecantikan",    bukti:false },
];

function init() {
  if (!localStorage.getItem(KEYS.USERS))    localStorage.setItem(KEYS.USERS,    JSON.stringify(DEFAULT_USERS));
  if (!localStorage.getItem(KEYS.SERVICES)) localStorage.setItem(KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
  if (!localStorage.getItem(KEYS.ORDERS))   localStorage.setItem(KEYS.ORDERS,   JSON.stringify(DEFAULT_ORDERS));
}

// ── USERS ───────────────────────────────────────────────────
function getUsers()  { return JSON.parse(localStorage.getItem(KEYS.USERS) || "[]"); }
function saveUsers(u){ localStorage.setItem(KEYS.USERS, JSON.stringify(u)); }

function registerUser(data) {
  const users = getUsers();
  if (users.find(u => u.email === data.email)) return { ok:false, msg:"Email sudah terdaftar." };
  const newUser = {
    id: Date.now(),
    nama: data.nama,
    email: data.email,
    password: data.password,
    hp: data.hp || "",
    kota: data.kota || "",
    role: "pelanggan",
    aktif: true,
    createdAt: new Date().toISOString().split("T")[0],
  };
  saveUsers([...users, newUser]);
  return { ok:true, user: newUser };
}

function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user)       return { ok:false, msg:"Email atau password salah." };
  if (!user.aktif) return { ok:false, msg:"Akun Anda dinonaktifkan. Hubungi admin." };
  return { ok:true, user };
}

function updateUser(id, data) {
  const users = getUsers();
  const updated = users.map(u => u.id === id ? { ...u, ...data } : u);
  saveUsers(updated);
}

function deleteUser(id) {
  saveUsers(getUsers().filter(u => u.id !== id));
}

function toggleUserStatus(id) {
  const users = getUsers();
  saveUsers(users.map(u => u.id === id ? { ...u, aktif: !u.aktif } : u));
}

// ── ORDERS ──────────────────────────────────────────────────
function getOrders()  { return JSON.parse(localStorage.getItem(KEYS.ORDERS) || "[]"); }
function saveOrders(o){ localStorage.setItem(KEYS.ORDERS, JSON.stringify(o)); }

function getUserOrders(userId) { return getOrders().filter(o => o.userId === userId); }

function addOrder(data) {
  const orders = getOrders();
  const id = "ORD-" + String(orders.length + 1).padStart(3,"0");
  const newOrder = { id, ...data, tgl: new Date().toISOString().split("T")[0], status:"Pending", bayar:"Belum Bayar", bukti:false };
  saveOrders([newOrder, ...orders]);
  return newOrder;
}

function updateOrder(id, data) {
  saveOrders(getOrders().map(o => o.id === id ? { ...o, ...data } : o));
}

function deleteOrder(id) {
  saveOrders(getOrders().filter(o => o.id !== id));
}

// ── SERVICES ────────────────────────────────────────────────
function getServices()  { return JSON.parse(localStorage.getItem(KEYS.SERVICES) || "[]"); }
function saveServices(s){ localStorage.setItem(KEYS.SERVICES, JSON.stringify(s)); }

function addService(data) {
  const services = getServices();
  const newS = { id: Date.now(), ...data, active:true };
  saveServices([...services, newS]);
  return newS;
}

function updateService(id, data) {
  saveServices(getServices().map(s => s.id === id ? { ...s, ...data } : s));
}

function deleteService(id) {
  saveServices(getServices().filter(s => s.id !== id));
}

export const DB = {
  init,
  // users
  getUsers, registerUser, loginUser, updateUser, deleteUser, toggleUserStatus,
  // orders
  getOrders, getUserOrders, addOrder, updateOrder, deleteOrder,
  // services
  getServices, addService, updateService, deleteService,
};
