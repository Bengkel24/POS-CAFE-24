/* =========================================================
   KONFIGURASI LISENSI & PEMBAYARAN — Kopi Senja POS
   ---------------------------------------------------------
   Edit bagian prices dan payment sesuai harga & rekening Anda.
   Jangan mengubah publicKeyJwk kecuali Anda membuat pasangan
   kunci baru (lihat folder "POS CAFE 24 - Owner").
   ========================================================= */

window.LICENSE_CONFIG = {
  /* Lama masa gratis untuk pengguna baru (hari). */
  trialDays: 7,

  /* Harga dalam Rupiah. */
  prices: {
    monthly: 15000,
    lifetime: 300000
  },

  /* Data pembayaran yang tampil di layar lisensi. */
  payment: {
    bankName: 'Dana',
    bankAccount: '085151014370',
    bankHolder: 'Bengkel24 Toliz',
    qrisImage: 'icons/qris-placeholder.svg',
    whatsapp: '0851 5101 4370',
    email: 'yuliusbengkel24@gmail.com'
  },

  /* Kunci publik untuk memverifikasi kode aktivasi.
     Kunci privat ada di owner-tools/license-generator.html. */
  publicKeyJwk: {
    crv: 'P-256',
    ext: true,
    key_ops: ['verify'],
    kty: 'EC',
    x: 'JkdTgEmvqtHOHQNVQCpL6S9cmtvyFdmXF21aWABr-DA',
    y: 'wrPQ3MDJ5NkKnGSoUIL0zDI5dXox-M_rsY9NpS3WTig'
  }
};
