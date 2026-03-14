const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, isAdmin } = require("../middleware/auth");

// ── GET semua user (admin only) ──────────────────────────────
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, email, hp, kota, role, aktif, created_at as createdAt FROM users ORDER BY created_at DESC"
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengambil data user." });
  }
});

// ── GET user by ID ───────────────────────────────────────────
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nama, email, hp, kota, role, aktif, created_at as createdAt FROM users WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ ok: false, msg: "User tidak ditemukan." });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengambil data user." });
  }
});

// ── UPDATE user ──────────────────────────────────────────────
router.put("/:id", verifyToken, async (req, res) => {
  const { nama, hp, kota } = req.body;
  try {
    await pool.query(
      "UPDATE users SET nama = ?, hp = ?, kota = ? WHERE id = ?",
      [nama, hp, kota, req.params.id]
    );
    res.json({ ok: true, msg: "Profil berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal memperbarui user." });
  }
});

// ── TOGGLE status aktif (admin only) ────────────────────────
router.patch("/:id/toggle", verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query("UPDATE users SET aktif = NOT aktif WHERE id = ?", [req.params.id]);
    res.json({ ok: true, msg: "Status user diperbarui." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengubah status user." });
  }
});

// ── DELETE user (admin only) ─────────────────────────────────
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ ok: true, msg: "User berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal menghapus user." });
  }
});

module.exports = router;
