const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const pool    = require("../db");

// REGISTER
router.post("/register", async (req, res) => {
  const { nama, email, password, hp } = req.body;
  if (!nama || !email || !password)
    return res.status(400).json({ ok: false, msg: "Nama, email, dan password wajib diisi." });
  try {
    const [existing] = await pool.query("SELECT id FROM users WHERE email=?", [email]);
    if (existing.length > 0)
      return res.status(400).json({ ok: false, msg: "Email sudah terdaftar." });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (nama, email, password, no_hp, role, is_aktif, created_at, updated_at) VALUES (?,?,?,?,'pelanggan',1,NOW(),NOW())",
      [nama, email, hashed, hp||""]
    );
    const newUser = { id: result.insertId, nama, email, hp: hp||"", role: "pelanggan", aktif: true };
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ ok: true, user: newUser, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ ok: false, msg: "Terjadi kesalahan server." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ ok: false, msg: "Email dan password wajib diisi." });
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
    if (rows.length === 0)
      return res.status(401).json({ ok: false, msg: "Email atau password salah." });

    const user = rows[0];
    if (!user.is_aktif)
      return res.status(403).json({ ok: false, msg: "Akun Anda dinonaktifkan." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ ok: false, msg: "Email atau password salah." });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      ok: true, token,
      user: {
        id: user.id, nama: user.nama, email: user.email,
        hp: user.no_hp, kota: user.kota, role: user.role,
        aktif: user.is_aktif, createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ ok: false, msg: "Terjadi kesalahan server." });
  }
});

module.exports = router;
