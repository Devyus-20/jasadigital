/**
 * RESET PASSWORD ADMIN - JasaDigital
 * 
 * Cara pakai:
 * 1. Taruh file ini di folder: C:\Users\MSI\Documents\jasadigital\backend\
 * 2. Buka terminal di folder backend
 * 3. Jalankan: node reset-admin-password.js
 * 4. Script akan otomatis update password di database
 */

require('dotenv').config();
const bcrypt   = require('bcryptjs');
const mysql    = require('mysql2/promise');

async function resetAdmin() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'jasadigital_db',
  });

  // ── Konfigurasi akun admin ──────────────────────────────────
  const EMAIL    = 'admin@jasadigital.com';  // ← ganti jika perlu
  const PASSWORD = 'admin123';               // ← ganti jika perlu
  const NAMA     = 'Super Admin';
  // ────────────────────────────────────────────────────────────

  const hash = await bcrypt.hash(PASSWORD, 10);

  // Cek apakah user admin sudah ada
  const [rows] = await conn.execute('SELECT id, email FROM users WHERE email = ?', [EMAIL]);

  if (rows.length > 0) {
    // Update password
    await conn.execute(
      "UPDATE users SET password = ?, role = 'admin', is_aktif = 1, nama = ? WHERE email = ?",
      [hash, NAMA, EMAIL]
    );
    console.log('✅ Password admin berhasil direset!');
    console.log('   Email   :', EMAIL);
    console.log('   Password:', PASSWORD);
  } else {
    // Buat akun admin baru
    await conn.execute(
      `INSERT INTO users (nama, email, password, role, is_aktif, created_at, updated_at)
       VALUES (?, ?, ?, 'admin', 1, NOW(), NOW())`,
      [NAMA, EMAIL, hash]
    );
    console.log('✅ Akun admin baru berhasil dibuat!');
    console.log('   Email   :', EMAIL);
    console.log('   Password:', PASSWORD);
  }

  // Tampilkan semua akun admin yang ada
  const [admins] = await conn.execute("SELECT id, nama, email, role, is_aktif FROM users WHERE role = 'admin'");
  console.log('\n📋 Daftar akun admin di database:');
  console.table(admins);

  await conn.end();
}

resetAdmin().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
