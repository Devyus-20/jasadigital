// ============================================================
// api.js — Jembatan React ↔ Backend
// Copy file ini ke:
//   admin\src\api.js
//   user\src\api.js
// ============================================================

// URL backend otomatis dari .env — tidak perlu ubah manual
// Development  : buat .env berisi VITE_API_URL=http://localhost:3001
// Demo         : buat .env.demo berisi VITE_API_URL=https://api-demo.jasadigital.com
// Production   : buat .env berisi VITE_API_URL=https://api.jasadigital.com
const BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:3001") + "/api";

// ── Simpan & ambil token dari localStorage ────────────────────
export const getToken  = ()        => localStorage.getItem("jd_token");
export const setToken  = (token)   => localStorage.setItem("jd_token", token);
export const removeToken = ()      => localStorage.removeItem("jd_token");
export const getUser   = ()        => { try { return JSON.parse(localStorage.getItem("jd_user")); } catch { return null; } };
export const setUser   = (user)    => localStorage.setItem("jd_user", JSON.stringify(user));
export const removeUser = ()       => localStorage.removeItem("jd_user");

// ── Helper fetch dengan token otomatis ───────────────────────
const req = async (method, path, body = null) => {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  return data;
};

// ── AUTH ──────────────────────────────────────────────────────
export const API = {
  // Login
  async login(email, password) {
    const data = await req("POST", "/auth/login", { email, password });
    if (data.ok) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  },

  // Register
  async register(nama, email, password, hp) {
    const data = await req("POST", "/auth/register", { nama, email, password, hp });
    if (data.ok) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  },

  // Logout
  logout() {
    removeToken();
    removeUser();
  },

  // ── LAYANAN ────────────────────────────────────────────────
  async getServices()            { return req("GET",    "/services"); },
  async getAllServices()         { return req("GET",    "/services/all"); },
  async addService(data)         { return req("POST",   "/services", data); },
  async updateService(id, data)  { return req("PUT",    `/services/${id}`, data); },
  async deleteService(id)        { return req("DELETE", `/services/${id}`); },

  // ── PESANAN ────────────────────────────────────────────────
  async getOrders()              { return req("GET",    "/orders"); },
  async getMyOrders()            { return req("GET",    "/orders/my"); },
  async createOrder(data)        { return req("POST",   "/orders", data); },
  async updateOrder(id, data)    { return req("PATCH",  `/orders/${id}`, data); },
  async deleteOrder(id)          { return req("DELETE", `/orders/${id}`); },

  // ── USERS ──────────────────────────────────────────────────
  async getUsers()               { return req("GET",    "/users"); },
  async getUser(id)              { return req("GET",    `/users/${id}`); },
  async updateUser(id, data)     { return req("PUT",    `/users/${id}`, data); },
  async resetPassword(id, pass)  { return req("PATCH",  `/users/${id}/reset-password`, { password: pass }); },
  async addAdmin(data)           { return req("POST",   "/users/add-admin", data); },
  async toggleUser(id)           { return req("PATCH",  `/users/${id}/toggle`); },
  async deleteUser(id)           { return req("DELETE", `/users/${id}`); },
};

export default API;