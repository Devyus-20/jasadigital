const cron = require('node-cron');
const db   = require('./db');

async function resetDemoData() {
  console.log('[DEMO] Mereset database demo...');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Hapus semua data kecuali akun demo bawaan
    await conn.query(`DELETE FROM pesanan`);
    await conn.query(`DELETE FROM users WHERE email NOT IN (
      'admin@jasadigital.com', 'budi@email.com', 'siti@email.com'
    )`);

    // Seed ulang pesanan demo
    await conn.query(`
      INSERT INTO pesanan (nomor_pesanan, pelanggan_id, jasa_id, harga_saat_pesan,
        deskripsi_kebutuhan, status, tanggal_pesan)
      SELECT
        CONCAT('ORD-DEMO-', LPAD(seq, 4, '0')),
        (SELECT id FROM users WHERE email = 'budi@email.com'),
        1, 500000,
        'Ini pesanan demo otomatis',
        ELT(seq MOD 4 + 1, 'pending','diproses','selesai','dikonfirmasi'),
        NOW() - INTERVAL seq DAY
      FROM (SELECT 1 AS seq UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t
    `);

    await conn.commit();
    console.log('[DEMO] Reset selesai ✅');
  } catch (e) {
    await conn.rollback();
    console.error('[DEMO] Reset gagal:', e.message);
  } finally {
    conn.release();
  }
}

// Jalankan setiap hari jam 00:00
if (process.env.DEMO_MODE === 'true') {
  cron.schedule('0 0 * * *', resetDemoData);
  resetDemoData(); // langsung reset saat server start
}

module.exports = { resetDemoData };