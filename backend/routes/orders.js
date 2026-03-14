const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, isAdmin } = require("../middleware/auth");

// GET semua pesanan (admin)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.nomor_pesanan AS nomor, p.status, p.harga_saat_pesan AS harga,
             p.deskripsi_kebutuhan AS deskripsi, p.link_referensi AS ref,
             p.deadline_pelanggan AS deadline, p.catatan_admin,
             p.tanggal_pesan, p.created_at,
             u.id AS userId, u.nama AS user_nama, u.email AS user_email,
             j.id AS jasaId, j.nama AS jasa_nama
      FROM pesanan p
      LEFT JOIN users u ON p.pelanggan_id = u.id
      LEFT JOIN jasa j ON p.jasa_id = j.id
      ORDER BY p.created_at DESC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Gagal mengambil data pesanan." });
  }
});

// GET pesanan milik user yang login
router.get("/my", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.nomor_pesanan AS nomor, p.status, p.harga_saat_pesan AS harga,
             p.deskripsi_kebutuhan AS deskripsi, p.link_referensi AS ref,
             p.deadline_pelanggan AS deadline, p.tanggal_pesan, p.created_at,
             j.id AS jasaId, j.nama AS jasa_nama, j.harga AS jasa_harga,
             k.icon AS jasa_icon, k.nama AS jasa_cat
      FROM pesanan p
      LEFT JOIN jasa j ON p.jasa_id = j.id
      LEFT JOIN kategori_jasa k ON j.kategori_id = k.id
      WHERE p.pelanggan_id = ?
      ORDER BY p.created_at DESC
    `, [req.user.id]);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Gagal mengambil pesanan." });
  }
});

// BUAT pesanan baru
router.post("/", verifyToken, async (req, res) => {
  const { jasaId, deskripsi, ref, deadline } = req.body;
  if (!jasaId || !deskripsi) return res.status(400).json({ ok: false, msg: "Layanan dan deskripsi wajib diisi." });
  try {
    // Ambil harga jasa
    const [jasaRows] = await pool.query("SELECT harga FROM jasa WHERE id=?", [jasaId]);
    if (jasaRows.length === 0) return res.status(404).json({ ok: false, msg: "Layanan tidak ditemukan." });
    const harga = jasaRows[0].harga;

    // Generate nomor pesanan
    const [count] = await pool.query("SELECT COUNT(*) AS total FROM pesanan");
    const nomor = "ORD-" + String(count[0].total + 1).padStart(3, "0");

    const [result] = await pool.query(
      `INSERT INTO pesanan (nomor_pesanan, pelanggan_id, jasa_id, harga_saat_pesan, deskripsi_kebutuhan, link_referensi, deadline_pelanggan, status, tanggal_pesan, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW(), NOW())`,
      [nomor, req.user.id, jasaId, harga, deskripsi, ref||"", deadline||null]
    );
    res.json({ ok: true, msg: "Pesanan berhasil dibuat.", id: result.insertId, nomor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Gagal membuat pesanan." });
  }
});

// UPDATE status pesanan (admin)
router.patch("/:id", verifyToken, isAdmin, async (req, res) => {
  const { status, catatan } = req.body;
  try {
    await pool.query(
      "UPDATE pesanan SET status=?, catatan_admin=?, updated_at=NOW() WHERE id=?",
      [status, catatan||"", req.params.id]
    );
    res.json({ ok: true, msg: "Pesanan diperbarui." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal memperbarui pesanan." });
  }
});

// EDIT pesanan oleh user (hanya saat status pending)
router.patch("/:id/edit", verifyToken, async (req, res) => {
  const { deskripsi, ref, deadline } = req.body;
  if (!deskripsi || !deskripsi.trim()) return res.status(400).json({ ok: false, msg: "Deskripsi wajib diisi." });
  try {
    // Pastikan pesanan milik user & masih pending
    const [rows] = await pool.query("SELECT * FROM pesanan WHERE id=? AND pelanggan_id=?", [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ ok: false, msg: "Pesanan tidak ditemukan." });
    if (rows[0].status !== "pending") return res.status(403).json({ ok: false, msg: "Pesanan tidak bisa diedit, status sudah bukan pending." });
    await pool.query(
      "UPDATE pesanan SET deskripsi_kebutuhan=?, link_referensi=?, deadline_pelanggan=?, updated_at=NOW() WHERE id=?",
      [deskripsi, ref||"", deadline||null, req.params.id]
    );
    res.json({ ok: true, msg: "Pesanan berhasil diperbarui." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Gagal memperbarui pesanan." });
  }
});

// BATALKAN pesanan oleh user (hanya saat status pending)
router.patch("/:id/batal", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM pesanan WHERE id=? AND pelanggan_id=?", [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ ok: false, msg: "Pesanan tidak ditemukan." });
    if (rows[0].status !== "pending") return res.status(403).json({ ok: false, msg: "Pesanan tidak bisa dibatalkan, status sudah bukan pending." });
    await pool.query(
      "UPDATE pesanan SET status='dibatalkan', catatan_admin='Dibatalkan oleh pelanggan', updated_at=NOW() WHERE id=?",
      [req.params.id]
    );
    res.json({ ok: true, msg: "Pesanan berhasil dibatalkan." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Gagal membatalkan pesanan." });
  }
});

// DELETE pesanan (admin)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM pesanan WHERE id=?", [req.params.id]);
    res.json({ ok: true, msg: "Pesanan berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal menghapus pesanan." });
  }
});

module.exports = router;