const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, isAdmin } = require("../middleware/auth");

// ── GET semua pesanan (admin) ────────────────────────────────
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, u.nama as user_nama, u.email as user_email, j.name as jasa_name, j.price as jasa_price, j.icon as jasa_icon
      FROM pesanan o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN jasa j ON o.jasa_id = j.id
      ORDER BY o.created_at DESC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengambil data pesanan." });
  }
});

// ── GET pesanan milik user yang login ────────────────────────
router.get("/my", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, j.name as jasa_name, j.price as jasa_price, j.icon as jasa_icon, j.cat as jasa_cat
      FROM pesanan o
      LEFT JOIN jasa j ON o.jasa_id = j.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [req.user.id]);
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengambil pesanan." });
  }
});

// ── BUAT pesanan baru ────────────────────────────────────────
router.post("/", verifyToken, async (req, res) => {
  const { jasaId, desc, ref, deadline } = req.body;
  if (!jasaId || !desc) return res.status(400).json({ ok: false, msg: "Layanan dan deskripsi wajib diisi." });

  try {
    // Generate nomor pesanan
    const [count] = await pool.query("SELECT COUNT(*) as total FROM pesanan");
    const nomor = "ORD-" + String(count[0].total + 1).padStart(3, "0");

    const [result] = await pool.query(
      "INSERT INTO pesanan (nomor, user_id, jasa_id, `desc`, ref, deadline, status, bayar, bukti, created_at) VALUES (?, ?, ?, ?, ?, ?, 'Pending', 'Belum Bayar', 0, NOW())",
      [nomor, req.user.id, jasaId, desc, ref || "", deadline || null]
    );

    res.json({ ok: true, msg: "Pesanan berhasil dibuat.", id: result.insertId, nomor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Gagal membuat pesanan." });
  }
});

// ── UPDATE status pesanan (admin) ────────────────────────────
router.patch("/:id", verifyToken, isAdmin, async (req, res) => {
  const { status, bayar } = req.body;
  try {
    await pool.query(
      "UPDATE pesanan SET status = ?, bayar = ? WHERE id = ?",
      [status, bayar, req.params.id]
    );
    res.json({ ok: true, msg: "Pesanan diperbarui." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal memperbarui pesanan." });
  }
});

// ── UPLOAD bukti bayar (user) ────────────────────────────────
router.patch("/:id/bukti", verifyToken, async (req, res) => {
  try {
    await pool.query(
      "UPDATE pesanan SET bukti = 1, bayar = 'Menunggu Verifikasi' WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ ok: true, msg: "Bukti pembayaran berhasil diupload." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal upload bukti." });
  }
});

// ── DELETE pesanan (admin) ───────────────────────────────────
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM pesanan WHERE id = ?", [req.params.id]);
    res.json({ ok: true, msg: "Pesanan berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal menghapus pesanan." });
  }
});

module.exports = router;
