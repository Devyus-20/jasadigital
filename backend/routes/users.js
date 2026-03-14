const express  = require("express");
const router   = express.Router();
const pool     = require("../db");
const bcrypt   = require("bcryptjs");
const { verifyToken, isAdmin } = require("../middleware/auth");

// GET semua user (admin)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, email, no_hp AS hp, kota, role, is_aktif AS aktif, created_at AS createdAt FROM users ORDER BY created_at DESC"
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengambil data user." });
  }
});

// GET user by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, email, no_hp AS hp, kota, role, is_aktif AS aktif, created_at AS createdAt FROM users WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ ok: false, msg: "User tidak ditemukan." });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengambil data user." });
  }
});

// UPDATE profil user
router.put("/:id", verifyToken, async (req, res) => {
  const { nama, hp, kota } = req.body;
  try {
    await pool.query(
      "UPDATE users SET nama=?, no_hp=?, kota=?, updated_at=NOW() WHERE id=?",
      [nama, hp, kota, req.params.id]
    );
    res.json({ ok: true, msg: "Profil berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal memperbarui user." });
  }
});

// RESET PASSWORD user (admin)
router.patch("/:id/reset-password", verifyToken, isAdmin, async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6)
    return res.status(400).json({ ok: false, msg: "Password minimal 6 karakter." });
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password=?, updated_at=NOW() WHERE id=?", [hash, req.params.id]);
    res.json({ ok: true, msg: "Password berhasil direset." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mereset password." });
  }
});

// TAMBAH ADMIN baru (admin)
router.post("/add-admin", verifyToken, isAdmin, async (req, res) => {
  const { nama, email, password, hp } = req.body;
  if (!nama || !email || !password)
    return res.status(400).json({ ok: false, msg: "Nama, email, dan password wajib diisi." });
  if (password.length < 6)
    return res.status(400).json({ ok: false, msg: "Password minimal 6 karakter." });
  try {
    const [exist] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (exist.length > 0) return res.status(409).json({ ok: false, msg: "Email sudah terdaftar." });
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (nama, email, password, no_hp, role, is_aktif, created_at, updated_at) VALUES (?,?,?,?,'admin',1,NOW(),NOW())",
      [nama, email, hash, hp||""]
    );
    res.json({ ok: true, msg: "Akun admin berhasil ditambahkan." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Gagal menambahkan admin." });
  }
});

// TOGGLE status aktif (admin)
router.patch("/:id/toggle", verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE users SET is_aktif = NOT is_aktif, updated_at=NOW() WHERE id=?", [req.params.id]);
    res.json({ ok: true, msg: "Status user diperbarui." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengubah status user." });
  }
});

// DELETE user (admin)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=?", [req.params.id]);
    res.json({ ok: true, msg: "User berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal menghapus user." });
  }
});

module.exports = router;


// GET semua user (admin)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, email, no_hp AS hp, kota, role, is_aktif AS aktif, created_at AS createdAt FROM users ORDER BY created_at DESC"
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengambil data user." });
  }
});

// GET user by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, email, no_hp AS hp, kota, role, is_aktif AS aktif, created_at AS createdAt FROM users WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ ok: false, msg: "User tidak ditemukan." });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengambil data user." });
  }
});

// UPDATE profil user
router.put("/:id", verifyToken, async (req, res) => {
  const { nama, hp, kota } = req.body;
  try {
    await pool.query(
      "UPDATE users SET nama=?, no_hp=?, kota=?, updated_at=NOW() WHERE id=?",
      [nama, hp, kota, req.params.id]
    );
    res.json({ ok: true, msg: "Profil berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal memperbarui user." });
  }
});

// TOGGLE status aktif (admin)
router.patch("/:id/toggle", verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE users SET is_aktif = NOT is_aktif, updated_at=NOW() WHERE id=?", [req.params.id]);
    res.json({ ok: true, msg: "Status user diperbarui." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengubah status user." });
  }
});

// DELETE user (admin)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=?", [req.params.id]);
    res.json({ ok: true, msg: "User berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal menghapus user." });
  }
});

module.exports = router;