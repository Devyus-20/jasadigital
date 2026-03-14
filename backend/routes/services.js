const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const { verifyToken, isAdmin } = require("../middleware/auth");

// GET semua layanan aktif (publik)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT j.id, j.nama AS name, k.id AS katId, k.nama AS cat, k.icon AS icon,
             j.harga AS price, j.harga_diskon AS priceDiskon,
             CONCAT(j.estimasi_hari_min, '-', j.estimasi_hari_max) AS days,
             j.deskripsi AS deskripsi, j.fitur AS features, j.is_aktif AS active
      FROM jasa j
      LEFT JOIN kategori_jasa k ON j.kategori_id = k.id
      WHERE j.is_aktif = 1
      ORDER BY j.id ASC
    `);
    const data = rows.map(r => ({
      ...r,
      features: (() => { try { return JSON.parse(r.features || "[]"); } catch(e) { return []; } })()
    }));
    res.json({ ok: true, data });
  } catch (err) {
    console.error("Services error:", err.message);
    res.status(500).json({ ok: false, msg: "Gagal mengambil data layanan.", error: err.message });
  }
});

// GET semua layanan termasuk nonaktif (admin)
router.get("/all", verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT j.id, j.nama AS name, k.id AS katId, k.nama AS cat, k.icon AS icon,
             j.harga AS price, j.harga_diskon AS priceDiskon,
             CONCAT(j.estimasi_hari_min, '-', j.estimasi_hari_max) AS days,
             j.deskripsi AS deskripsi, j.fitur AS features, j.is_aktif AS active
      FROM jasa j
      LEFT JOIN kategori_jasa k ON j.kategori_id = k.id
      ORDER BY j.id ASC
    `);
    const data = rows.map(r => ({
      ...r,
      features: (() => { try { return JSON.parse(r.features || "[]"); } catch(e) { return []; } })()
    }));
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal mengambil data layanan." });
  }
});

// TAMBAH layanan (admin)
router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { name, katId, price, priceDiskon, daysMin, daysMax, desc, features } = req.body;
  if (!name || !price) return res.status(400).json({ ok: false, msg: "Nama dan harga wajib diisi." });
  try {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const [result] = await pool.query(
      `INSERT INTO jasa (kategori_id, nama, slug, deskripsi, harga, harga_diskon, estimasi_hari_min, estimasi_hari_max, fitur, is_aktif, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [katId||1, name, slug, desc||"", price, priceDiskon||null, daysMin||1, daysMax||7, JSON.stringify(features||[])]
    );
    res.json({ ok: true, msg: "Layanan berhasil ditambahkan.", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Gagal menambahkan layanan." });
  }
});

// UPDATE layanan (admin)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  const { name, price, priceDiskon, daysMin, daysMax, desc, features, active } = req.body;
  try {
    await pool.query(
      `UPDATE jasa SET nama=?, harga=?, harga_diskon=?, estimasi_hari_min=?, estimasi_hari_max=?, deskripsi=?, fitur=?, is_aktif=?, updated_at=NOW() WHERE id=?`,
      [name, price, priceDiskon||null, daysMin||1, daysMax||7, desc||"", JSON.stringify(features||[]), active?1:0, req.params.id]
    );
    res.json({ ok: true, msg: "Layanan berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal memperbarui layanan." });
  }
});

// DELETE layanan (admin)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM jasa WHERE id = ?", [req.params.id]);
    res.json({ ok: true, msg: "Layanan berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ ok: false, msg: "Gagal menghapus layanan." });
  }
});

module.exports = router;