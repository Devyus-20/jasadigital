-- ============================================================
-- JasaDigital Database Schema
-- Jalankan file ini di MySQL Workbench
-- ============================================================

CREATE DATABASE IF NOT EXISTS jasadigital_db;
USE jasadigital_db;

-- ── TABEL USERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nama       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  hp         VARCHAR(20)  DEFAULT '',
  kota       VARCHAR(100) DEFAULT '',
  role       ENUM('admin','pelanggan') DEFAULT 'pelanggan',
  aktif      TINYINT(1)   DEFAULT 1,
  created_at DATETIME     DEFAULT NOW()
);

-- ── TABEL JASA / LAYANAN ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS jasa (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  name     VARCHAR(150) NOT NULL,
  cat      VARCHAR(50)  DEFAULT 'Website',
  price    BIGINT       NOT NULL,
  days     VARCHAR(20)  DEFAULT '7',
  icon     VARCHAR(10)  DEFAULT '🌐',
  `desc`   TEXT,
  features JSON,
  active   TINYINT(1)   DEFAULT 1
);

-- ── TABEL PESANAN ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pesanan (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nomor      VARCHAR(20)  NOT NULL UNIQUE,
  user_id    INT          NOT NULL,
  jasa_id    INT          NOT NULL,
  `desc`     TEXT,
  ref        VARCHAR(255) DEFAULT '',
  deadline   DATE         DEFAULT NULL,
  status     ENUM('Pending','Diproses','Selesai','Dibatalkan') DEFAULT 'Pending',
  bayar      ENUM('Belum Bayar','Menunggu Verifikasi','Lunas') DEFAULT 'Belum Bayar',
  bukti      TINYINT(1)   DEFAULT 0,
  created_at DATETIME     DEFAULT NOW(),
  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (jasa_id)  REFERENCES jasa(id)  ON DELETE CASCADE
);

-- ── DATA AWAL: ADMIN ─────────────────────────────────────────
-- Password: admin123 (sudah di-hash dengan bcrypt)
INSERT INTO users (nama, email, password, hp, kota, role, aktif) VALUES
('Super Admin', 'admin@jasadigital.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '081234567890', 'Jakarta', 'admin', 1)
ON DUPLICATE KEY UPDATE id=id;

-- ── DATA AWAL: LAYANAN ───────────────────────────────────────
INSERT INTO jasa (name, cat, price, days, icon, `desc`, features) VALUES
('Website Company Profile', 'Website', 2500000, '7–14', '🌐', 'Website profesional, responsif, dan modern untuk perusahaan Anda.', '["Desain custom","5 halaman","Mobile responsif","SEO dasar","Form kontak"]'),
('Website Toko Online',     'Website', 5000000, '14–30','🛒', 'Platform e-commerce lengkap dengan keranjang, checkout, dan manajemen produk.', '["Katalog produk","Keranjang & checkout","Dashboard penjual","Payment gateway","Notif email"]'),
('Website Landing Page',    'Website', 1500000, '5–7',  '🚀', 'Landing page konversi tinggi untuk kampanye produk atau layanan Anda.', '["Desain eye-catching","Animasi modern","CTA optimal","Fast loading","Analytics"]'),
('Desain Logo',             'Desain',  350000,  '3–5',  '✏️', 'Logo profesional yang mencerminkan identitas dan nilai brand Anda.', '["3 konsep awal","Revisi 3×","File AI/PNG/SVG","Panduan warna","Versi horizontal & square"]'),
('Desain Poster',           'Desain',  150000,  '1–2',  '🖼️', 'Poster promosi atau event dengan visual menarik dan siap cetak.', '["Revisi 2×","File PNG/PDF","Ukuran kustom","Print-ready"]'),
('Desain Banner',           'Desain',  100000,  '1',    '📐', 'Banner web atau media sosial yang on-brand dan eye-catching.', '["Revisi 1×","Format web & print","Berbagai ukuran"]')
ON DUPLICATE KEY UPDATE id=id;

-- Selesai!
SELECT 'Database jasadigital_db berhasil dibuat!' as Status;
