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
- **Catatan struk bisa diedit** dari tab ⚙️ Kafe — teks untuk status "diproses" dan
  "siap diambil" dapat disesuaikan
- **Layout POS**: katalog menu di kiri, keranjang + panel kasir di kolom kanan
- **Login admin & kasir** dengan hak akses berbeda
- **Admin** bisa mencetak struk dan menghapus transaksi terakhir dari Dashboard;
  stok item otomatis dikembalikan saat transaksi dihapus
- Jam live dan tombol **layar penuh** di bilah atas
- Data keranjang, pesanan, dan preferensi disimpan di `localStorage`
- **Responsif**: di laptop keranjang & panel kasir tampil di kolom kanan; di HP/tablet
  sempit panel itu menjadi **drawer** yang dibuka lewat ikon 🛒 atau bilah
  **Lihat Keranjang** di bawah layar
- **Bisa dipasang (PWA)**: tombol pasang di bilah atas, ikon aplikasi, dan cache offline
  setelah kunjungan pertama
- **Lisensi aplikasi**: masa gratis 7 hari, langganan bulanan, atau beli lifetime;
  kode aktivasi diverifikasi offline dengan tanda tangan digital (ECDSA P-256)
- Animasi yang halus, fokus keyboard, label ARIA, dan kontras warna yang sudah diperiksa

### Mode Kasir & Panel Kanan

Keranjang dan semua pengaturan ada di **kolom kanan** dengan tab:

Di layar HP/tablet sempit (≤ 980px), kolom kanan berubah menjadi **drawer** yang
dibuka lewat ikon 🛒 di bilah atas atau tombol **Lihat Keranjang** di bawah layar.
Tab panel bisa digeser ke samping, dan drawer ditutup lewat tombol ✕, ketuk area
gelap di luar panel, atau tombol Escape.

| Tombol | Fungsi |
| --- | --- |
| 🧾 **Keranjang** | Pesanan aktif: tipe pesanan, nama/meja, item, catatan, promo, total, dan tombol bayar |
| 📊 **Dashboard** | Pendapatan hari ini, jumlah transaksi, item terjual, peringatan stok menipis, dan transaksi terakhir. Khusus admin: cetak struk & hapus transaksi (stok otomatis dikembalikan) |
| 🍽️ **Menu** *(admin)* | Tambah/edit/hapus menu, atur harga, kategori, emoji, URL gambar, stok, badge populer/baru |
| 📦 **Stok** *(admin)* | Atur stok tiap menu; stok 0 membuat menu tidak bisa dipesan, stok menipis ditandai |
| 💰 **Laporan** | Pendapatan, transaksi, item terjual, grafik 7 hari, metode pembayaran, menu terlaris, dan ekspor CSV |
| ⚙️ **Kafe** *(admin)* | Ubah nama kafe, logo (emoji), tagline, deskripsi, alamat, telepon, **catatan struk**, serta kelola akun & password — langsung berubah di header, struk, dan judul halaman |

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

### Mengakses dari HP

Tampilan sudah menyesuaikan sendiri: di HP panel keranjang menjadi drawer, di laptop
tetap dua kolom. Agar bisa dibuka dari HP, aplikasi perlu diakses lewat alamat jaringan,
bukan `localhost` di HP.

Pilihan termudah:

1. **Hosting statis** — unggah folder ini ke Netlify Drop, GitHub Pages, Vercel, atau
   hosting statis lain, lalu buka URL-nya di HP dan laptop.
2. **Server di laptop + Wi-Fi yang sama** — jalankan server dari folder ini dengan
   alamat `0.0.0.0`, misalnya:
   ```bash
   python -m http.server 8080 --bind 0.0.0.0
   ```
   Cari IP laptop dengan `ipconfig` (mis. `192.168.1.10`), lalu buka
   `http://192.168.1.10:8080` di browser HP.
3. Di HP, gunakan menu browser **Tambahkan ke layar utama** agar tampil seperti aplikasi.

> **Penting:** data disimpan di `localStorage` masing-masing browser/perangkat.
> Transaksi di HP dan laptop **tidak otomatis tersinkron**. Untuk berbagi data antar
> perangkat diperlukan backend/database (mis. Firebase, Supabase, atau API sendiri).

### Pasang sebagai aplikasi (PWA)

Aplikasi ini sudah dilengkapi **manifest** dan **service worker**, jadi bisa dipasang
seperti aplikasi biasa di HP maupun laptop.

> Pemasangan hanya bisa dilakukan jika aplikasi dibuka lewat **http/https** (hosting
> atau server lokal). Membuka `index.html` langsung lewat `file://` tetap bisa dipakai,
> tetapi tombol pasang tidak muncul.

**Android (Chrome/Edge)**
- Ketuk tombol **⬇ Pasang aplikasi** di bilah atas, **atau**
- buka menu **⋮ → Instal aplikasi / Tambahkan ke layar utama**.

**iPhone / iPad (Safari)**
- Ketuk tombol **Bagikan** (kotak dengan panah ke atas), lalu pilih
  **Tambahkan ke Layar Utama**.
- Tombol pasang di bilah atas juga menampilkan petunjuk ini.

**Laptop (Chrome/Edge)**
- Klik ikon **instal** di kanan address bar, **atau**
- menu **⋮ → Instal Kopi Senja**, **atau** tombol **⬇ Pasang aplikasi** di bilah atas.

Setelah dipasang, aplikasi terbuka di jendela sendiri tanpa address bar. Kunjungan
pertama menyimpan app shell ke cache; setelah itu aplikasi bisa dibuka kembali meskipun
sedang offline (data transaksi tetap tersimpan lokal di perangkat).

---

## Lisensi & Pembayaran

Aplikasi ini punya sistem lisensi sederhana yang berjalan **offline**:

| Status | Akses |
| --- | --- |
| **Masa gratis (trial)** | 7 hari sejak aplikasi pertama dibuka di perangkat |
| **Bulanan** | Aktif sampai tanggal yang ditentukan (biasanya 30 hari) |
| **Lifetime** | Aktif selamanya, tanpa biaya bulanan |
| **Owner** | Khusus pemilik aplikasi, bebas digunakan tanpa batas |

### Mengatur harga & data pembayaran

Edit file **`js/license-config.js`**:

```js
window.LICENSE_CONFIG = {
  trialDays: 7,
  prices: {
    monthly: 50000,    // ganti sesuai harga Anda
    lifetime: 500000   // ganti sesuai harga Anda
  },
  payment: {
    bankName: 'BCA',
    bankAccount: '1234567890',
    bankHolder: 'Nama Pemilik',
    qrisImage: 'icons/qris-placeholder.svg',
    whatsapp: '62812xxxxxxx',
    email: 'owner@example.com'
  }
};
```

- **Harga** tampil otomatis di layar lisensi.
- **Rekening & WhatsApp** tampil di bagian pembayaran.
- **QRIS**: ganti `qrisImage` dengan file gambar QRIS Anda (mis. `icons/qris.png`),
  lalu letakkan file itu di folder `icons/`. Gambar placeholder hanya contoh.
- Jangan mengubah `publicKeyJwk` kecuali Anda membuat pasangan kunci baru.

### Alur pembayaran & aktivasi

1. Pengguna memasang aplikasi dan mendapat masa gratis **7 hari**.
2. Setelah masa gratis berakhir (atau kapan saja), pengguna membuka layar
   **Lisensi & pembayaran** dari layar login atau tab **⚙️ Kafe**.
3. Pengguna transfer sesuai paket ke rekening/QRIS yang tertera, lalu mengirim bukti
   pembayaran ke WhatsApp owner.
4. Owner membuat **kode aktivasi** dengan alat di folder
   **`POS CAFE 24 - Owner/license-generator.html`**, lalu mengirim kode itu ke pengguna.
5. Pengguna menempelkan kode di layar lisensi → klik **Aktifkan**.
6. Aplikasi memverifikasi tanda tangan kode secara offline. Jika valid, lisensi aktif.

Kode aktivasi berbentuk:

```
KS1-<payload-base64url>.<signature-base64url>
```

Kode ditandatangani dengan **kunci privat** owner (ECDSA P-256). Aplikasi hanya
menyimpan **kunci publik**, sehingga pengguna tidak bisa membuat kode sendiri.

### Membuat kode aktivasi (owner)

1. Buka **`POS CAFE 24 - Owner/license-generator.html`** di Chrome/Edge.
   File ini boleh dibuka langsung lewat `file://` — tidak perlu server.
2. Pilih jenis lisensi:
   - **Bulanan** → pilih tanggal berakhir.
   - **Lifetime** → tanpa tanggal berakhir.
   - **Owner** → khusus Anda, tanpa batas.
3. (Opsional) tempel **kode perangkat** pengguna agar kode hanya berlaku di perangkat
   itu. Kode perangkat terlihat di layar lisensi pengguna.
4. (Opsional) isi catatan, mis. nama kedai/bulan.
5. Klik **Buat Kode Aktivasi** → **Salin Kode** → kirim ke pengguna.

> ⚠️ **Penting:** file generator berisi **kunci privat**. Jangan unggah folder
> **`POS CAFE 24 - Owner`** ke hosting, jangan kirim ke pengguna, dan jangan simpan
> di folder aplikasi yang dibagikan. Simpan hanya di komputer owner.
>
> Jika kunci privat bocor, orang lain bisa membuat kode aktivasi sendiri. Jika itu
> terjadi, buat pasangan kunci baru dan ganti `publicKeyJwk` di
> `js/license-config.js` serta kunci privat di generator.

### Kode owner untuk diri sendiri

Buat kode dengan jenis **Owner**, lalu aktifkan di perangkat Anda. Kode owner tidak
punya tanggal berakhir, jadi Anda bisa memakai aplikasi ini tanpa berlangganan.
Simpan kode owner di tempat aman dan jangan dibagikan.

### Batasan keamanan (penting)

Karena aplikasi ini **100% berjalan di browser tanpa server**:

- Kode aktivasi tidak bisa dipalsukan tanpa kunci privat, tetapi orang yang sangat
  teknis tetap bisa mengubah JavaScript di perangkatnya untuk melewati pengecekan.
- Masa gratis bisa ter-reset jika pengguna menghapus data situs/aplikasi. Untuk
  pencegahan yang lebih kuat, diperlukan **server lisensi** (backend) yang mengecek
  status langganan.
- Kode yang tidak diikat ke perangkat bisa dibagikan. Gunakan kolom **kode perangkat**
  di generator jika ingin membatasi satu kode untuk satu perangkat.
- Verifikasi lisensi memerlukan browser modern dengan **Web Crypto** dan konteks aman
  (`https://`, `http://localhost`, atau `file://` di Chrome/Edge).

Untuk usaha kecil, sistem ini cukup untuk mengelola akses dan pembayaran secara manual.
Jika nanti ingin otomatis (cek pembayaran, langganan berulang, multi-perangkat),
diperlukan backend/database.

---

## Struktur file

```
POS CAFE 24/
├── index.html            Layout POS (katalog menu + kolom kanan: keranjang & panel kasir)
├── manifest.webmanifest  Identitas aplikasi untuk pemasangan PWA
├── sw.js                 Service worker: cache app shell agar bisa dibuka offline
├── css/
│   └── style.css         Seluruh tampilan, animasi, responsif, dan gaya cetak
├── js/
│   ├── data.js           Daftar menu, kategori, dan kode promo
│   ├── license-config.js Harga, data pembayaran, dan kunci publik lisensi
│   ├── license.js        Logika trial, verifikasi kode, dan layar lisensi
│   └── app.js            Logika keranjang, promo, checkout, struk, stok, dan laporan
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-512.png
    ├── apple-touch-icon.png
    └── qris-placeholder.svg  Gambar contoh QRIS (ganti dengan QRIS Anda)

POS CAFE 24 - Owner/        ← JANGAN diunggah ke hosting
└── license-generator.html  Alat owner untuk membuat kode aktivasi (berisi kunci privat)
```

> Folder **`POS CAFE 24 - Owner`** sengaja dipisahkan dari folder aplikasi agar tidak
> ikut terunggah saat Anda membagikan aplikasi. Simpan folder itu hanya di komputer owner.

---

## Kustomisasi

| Ingin mengubah | Lokasi |
| --- | --- |
| Nama kafe, logo, tagline, deskripsi, alamat, telepon, **catatan struk**, akun & password | Panel ⚙️ **Kafe** di aplikasi (disimpan di `cafe_config` dan `kopisenja.users.v1`) |
| Nama menu, harga, deskripsi, kategori, stok | Panel 🍽️ **Menu** / 📦 **Stok** di aplikasi (disimpan di `menu_data`) |
| Kode promo dan besar diskon | `js/data.js` — objek `PROMOS` |
| Harga lisensi, masa gratis, rekening/QRIS/WhatsApp | `js/license-config.js` |
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

1. Pilih menu di katalog → item langsung masuk ke tab **🧾 Keranjang**. Di HP, buka
   keranjang lewat ikon 🛒 atau bilah **Lihat Keranjang** di bawah layar.
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
  `kopisenja.users.v1`, `kopisenja.license.v1`, `cafe_config`, dan `menu_data`).
- Status lisensi/trial disimpan di `kopisenja.license.v1`; tanggal mulai trial juga
  dicadangkan di cookie `kopisenja_trial_start` dan IndexedDB `kopisenja-license`
  agar tidak mudah ter-reset hanya dengan menghapus `localStorage`.
- Layout cetak hanya menampilkan struk, bukan seluruh halaman. Struk dioptimalkan
  untuk kertas thermal **58mm** (area cetak ±48mm): lebar halaman, ukuran font,
  dan pemenggalan teks sudah disesuaikan. Di HP, buka struk lalu tekan
  **Cetak Struk** dan pilih printer thermal 58mm di dialog cetak.
- Tinggi halaman cetak dihitung otomatis oleh `app.js` sebelum `window.print()`
  (style `#receiptPageSize`), jadi struk panjang tidak terpotong dan tidak
  menyisakan kertas kosong berlebihan. `@page` di `css/style.css` hanya menjadi
  fallback **58mm × 200mm** karena Chrome tidak mendukung `size: 58mm auto`.
- Jika dialog cetak masih menampilkan ukuran Letter/A4, pilih paper size
  **58mm** (atau roll paper) milik printer thermal; ukuran halaman dari browser
  hanyalah petunjuk, ukuran fisik tetap ditentukan driver printer.
- Untuk printer 80mm, ubah `@page`, `RECEIPT_PAGE_WIDTH_MM` di `js/app.js`, dan
  lebar `.receipt-paper` di bagian `PRINT — STRUK 58mm` pada `css/style.css`.
- Breakpoint responsif: ≤980px panel kanan menjadi drawer, ≤640px katalog satu kolom,
  ≤420px bilah atas dipadatkan (tombol layar penuh disembunyikan di layar sangat kecil).
