# ☕ Kopi Senja — Aplikasi Pemesanan Kafe

Aplikasi web untuk kafe yang menjual makanan dan minuman. Pelanggan bisa melihat menu,
memasukkan pesanan ke keranjang, memakai kode promo, membayar (tunai/QRIS/kartu), lalu
mendapatkan struk yang bisa dicetak. Riwayat pesanan tersimpan di perangkat.

Dibuat dengan **HTML, CSS, dan JavaScript murni** — tanpa framework, tanpa build step,
dan tanpa dependensi. Cukup buka `index.html` di browser.

---

## Fitur

- **24 menu** dalam 4 kategori: Kopi, Non-Kopi, Makanan, Camilan & Manis
- Pencarian, filter kategori, dan pengurutan (rekomendasi, harga, nama)
- Keranjang dengan jumlah, catatan per item, dan hitungan otomatis
- Pilihan **makan di tempat / dibawa pulang** beserta nomor meja
- **Kode promo**: `SENJA10` (diskon 10%, maks. Rp 20.000) dan
  `NGOPI25` (diskon 25%, min. belanja Rp 100.000, maks. Rp 30.000)
- Pajak PB1 10% dihitung otomatis
- Pembayaran tunai (dengan hitung kembalian), QRIS, atau kartu debit
- Struk digital + tombol **cetak struk** (layout khusus print)
- **Layout POS**: katalog menu di kiri, keranjang + panel kasir di kolom kanan
- **Login admin & kasir** dengan hak akses berbeda
- **Admin** bisa mencetak struk dan menghapus transaksi terakhir dari Dashboard;
  stok item otomatis dikembalikan saat transaksi dihapus
- Jam live dan tombol **layar penuh** di bilah atas
- Data keranjang, pesanan, dan preferensi disimpan di `localStorage`
- Tampilan responsif (desktop, tablet, ponsel) dan animasi yang halus
- Fokus keyboard, label ARIA, dan kontras warna yang sudah diperiksa

### Mode Kasir & Panel Kanan

Keranjang dan semua pengaturan ada di **kolom kanan** dengan tab:

| Tombol | Fungsi |
| --- | --- |
| 🧾 **Keranjang** | Pesanan aktif: tipe pesanan, nama/meja, item, catatan, promo, total, dan tombol bayar |
| 📊 **Dashboard** | Pendapatan hari ini, jumlah transaksi, item terjual, peringatan stok menipis, dan transaksi terakhir. Khusus admin: cetak struk & hapus transaksi (stok otomatis dikembalikan) |
| 🍽️ **Menu** *(admin)* | Tambah/edit/hapus menu, atur harga, kategori, emoji, URL gambar, stok, badge populer/baru |
| 📦 **Stok** *(admin)* | Atur stok tiap menu; stok 0 membuat menu tidak bisa dipesan, stok menipis ditandai |
| 💰 **Laporan** | Pendapatan, transaksi, item terjual, grafik 7 hari, metode pembayaran, menu terlaris, dan ekspor CSV |
| ⚙️ **Kafe** *(admin)* | Ubah nama kafe, logo (emoji), tagline, deskripsi, alamat, telepon, serta kelola akun & password — langsung berubah di header, struk, dan judul halaman |

Stok otomatis berkurang saat pesanan dibuat. Nama kafe dan daftar menu disimpan di
`localStorage` sehingga tetap ada setelah halaman dimuat ulang.

### Login & Hak Akses

Aplikasi memakai login dengan dua akun bawaan:

| Akun | Password | Akses |
| --- | --- | --- |
| `admin` | `admin123` | Semua tab: Keranjang, Dashboard, Menu, Stok, Laporan, Kafe |
| `kasir` | `kasir123` | Keranjang, Dashboard, Laporan |

- **Ubah password & tambah akun** lewat tab **⚙️ Kafe → Akun & Password** (khusus admin).
- Akun baru bisa diberi role **Admin** atau **Kasir**.
- Di **Dashboard**, hanya admin yang melihat tombol **cetak struk** dan **hapus transaksi**
  pada daftar transaksi terakhir. Menghapus transaksi juga mengembalikan stok item terkait.
- Akun yang sedang dipakai tidak bisa dihapus, dan minimal harus ada satu admin.
- Sesi login disimpan di `localStorage` (`kopisenja.session.v1`) sampai tombol **Keluar** ditekan.
- Data akun disimpan di `kopisenja.users.v1`.
- Login ini berjalan sepenuhnya di browser (tanpa server). Untuk keamanan produksi,
  gunakan autentikasi di backend.


---

## Cara menjalankan

### Cara paling mudah
Klik dua kali `index.html`. Aplikasi langsung berjalan di browser.

Saat pertama dibuka, akan muncul layar **login**. Masuk dengan akun `admin` atau `kasir`
(lihat bagian **Login & Hak Akses** di atas).

### Dengan server lokal (opsional)
Jika ingin membuka lewat `http://localhost`, jalankan server statis apa pun dari folder
ini, misalnya:

```bash
# Python
python -m http.server 8080

# Node.js (jika tersedia)
npx serve .
```

Lalu buka `http://localhost:8080`.

> Catatan: data pesanan disimpan di browser yang dipakai. Membuka di browser berbeda
> atau membersihkan data situs akan menghapus riwayat pesanan.

---

## Struktur file

```
kafe-senja/
├── index.html        Layout POS (katalog menu + kolom kanan: keranjang & panel kasir)
├── css/
│   └── style.css     Seluruh tampilan, animasi, responsif, dan gaya cetak
└── js/
    ├── data.js       Daftar menu, kategori, dan kode promo
    └── app.js        Logika keranjang, promo, checkout, struk, stok, dan laporan
```

---

## Kustomisasi

| Ingin mengubah | Lokasi |
| --- | --- |
| Nama kafe, logo, tagline, deskripsi, alamat, telepon, akun & password | Panel ⚙️ **Kafe** di aplikasi (disimpan di `cafe_config` dan `kopisenja.users.v1`) |
| Nama menu, harga, deskripsi, kategori, stok | Panel 🍽️ **Menu** / 📦 **Stok** di aplikasi (disimpan di `menu_data`) |
| Kode promo dan besar diskon | `js/data.js` — objek `PROMOS` |
| Tarif pajak | `js/app.js` — konstanta `TAX_RATE` |
| Warna dan font | `css/style.css` — variabel di `:root` |
| Menu populer / badge “Baru” | Panel 🍽️ **Menu** atau properti `popular`, `isNew`, `tag` di `js/data.js` |

Contoh menambah menu:

```js
{
  id: 'kopi-aren',
  name: 'Kopi Aren',
  desc: 'Espresso dengan gula aren dan susu segar.',
  price: 25000,
  cat: 'Kopi',
  emoji: '☕',
  tone: 1,
  popular: true
}
```

`tone` menentukan warna latar kartu (1–9, lihat `css/style.css`).

---

## Alur pemesanan

1. Pilih menu di katalog kiri → item langsung masuk ke tab **🧾 Keranjang** di kolom kanan.
2. Atur jumlah, catatan, tipe pesanan, nama, dan nomor meja di tab Keranjang.
3. (Opsional) masukkan kode promo.
4. Klik **Lanjut ke Pembayaran** → pilih metode bayar.
5. Untuk tunai, masukkan uang diterima (atau klik **Uang pas**).
6. **Konfirmasi & Buat Pesanan** → struk muncul dan bisa dicetak.
7. Transaksi terbaru langsung terlihat di tab **📊 Dashboard** dan **💰 Laporan**.

---

## Catatan teknis

- Tidak ada koneksi internet yang dibutuhkan. Font Google Fonts dimuat jika online,
  dengan fallback Georgia/system font jika offline.
- Ikon menu menggunakan emoji sehingga tidak perlu file gambar.
- Data disimpan dengan `localStorage` (kunci `kopisenja.cart.v1`,
  `kopisenja.orders.v1`, `kopisenja.prefs.v1`, `kopisenja.session.v1`,
  `kopisenja.users.v1`, `cafe_config`, dan `menu_data`).
- Layout cetak hanya menampilkan struk, bukan seluruh halaman.
