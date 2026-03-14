const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, isAdmin } = require("../middleware/auth");

// ── GET semua layanan ────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM jasa WHERE active = 1 ORDER BY id ASC");
    const data = rows.map(r => ({ ...r, features: JSON.parse(r.features || "[]") }));
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengambil data layanan." });
  }
});

// ── GET semua layanan termasuk nonaktif (admin) ──────────────
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM jasa ORDER BY id ASC");
    const data = rows.map(r => ({ ...r, features: JSON.parse(r.features || "[]") }));
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengambil data layanan." });
  }
});

// ── TAMBAH layanan (admin only) ──────────────────────────────
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { name, cat, price, days, icon, desc, features } = req.body;
  if (!name || !price) return res.status(400).json({ ok: false, msg: "Nama dan harga wajib diisi." });
  try {
    const [result] = await pool.query(
      "INSERT INTO jasa (name, cat, price, days, icon, `desc`, features, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
      [name, cat, price, days, icon, desc, JSON.stringify(features || [])]
    );
    res.json({ ok: true, msg: "Layanan berhasil ditambahkan.", id: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal menambahkan layanan." });
  }
});

// ── UPDATE layanan (admin only) ──────────────────────────────
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  const { name, cat, price, days, icon, desc, features, active } = req.body;
  try {
    await pool.query(
      "UPDATE jasa SET name=?, cat=?, price=?, days=?, icon=?, `desc`=?, features=?, active=? WHERE id=?",
      [name, cat, price, days, icon, desc, JSON.stringify(features || []), active, req.params.id]
    );
    res.json({ ok: true, msg: "Layanan berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal memperbarui layanan." });
  }
});

// ── DELETE layanan (admin only) ──────────────────────────────
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM jasa WHERE id = ?", [req.params.id]);
    res.json({ ok: true, msg: "Layanan berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal menghapus layanan." });
  }
});

module.exports = router;
