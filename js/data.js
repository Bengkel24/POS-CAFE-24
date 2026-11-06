/* =========================================================
   Kopi Senja — Data Menu & Konfigurasi
   Semua harga dalam Rupiah.
   ========================================================= */

// --- KONFIGURASI KAFE (bisa diedit via panel admin) ---
const CAFE_DEFAULT = {
  name: 'Kopi Senja',
  logo: '☕',
  tagline: 'coffee & kitchen',
  description: 'Kopi lokal, makanan rumahan, dan camilan manis.',
  address: 'Jl. Merdeka No. 24, Tolitoli',
  phone: '0852-1234-5678',
  receiptNoteProcessing: 'Pesananmu sedang kami siapkan. Tunjukkan struk ini di kasir.',
  receiptNoteReady: 'Pesananmu sudah siap. Tunjukkan struk ini di kasir untuk mengambil pesanan.'
};

let CAFE = JSON.parse(localStorage.getItem('cafe_config') || JSON.stringify(CAFE_DEFAULT));

// --- KATEGORI MENU ---
const CATEGORIES = [
  { id: 'Semua', label: 'Semua Menu', icon: '✦' },
  { id: 'Kopi', label: 'Kopi', icon: '☕' },
  { id: 'Non-Kopi', label: 'Non-Kopi', icon: '🥛' },
  { id: 'Makanan', label: 'Makanan', icon: '🍚' },
  { id: 'Camilan', label: 'Camilan & Manis', icon: '🍰' }
];

// --- DATA MENU ---
let MENU = [
  {
    id: 'kopi-susu-senja',
    name: 'Kopi Susu Senja',
    desc: 'Espresso double shot, susu segar, dan gula aren cair. Menu andalan kami.',
    price: 24000,
    cat: 'Kopi',
    emoji: '☕',
    tone: 1,
    popular: true,
    tag: 'Signature',
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80'
  },
  {
    id: 'espresso',
    name: 'Espresso',
    desc: 'Satu shot pekat dari biji Arabika Gayo.',
    price: 18000,
    cat: 'Kopi',
    emoji: '☕',
    tone: 3
  },
  {
    id: 'americano',
    name: 'Americano',
    desc: 'Espresso dengan air panas atau es.',
    price: 20000,
    cat: 'Kopi',
    emoji: '🧊',
    tone: 4
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    desc: 'Espresso, susu steamed, dan foam tebal.',
    price: 26000,
    cat: 'Kopi',
    emoji: '🥛',
    tone: 2
  },
  {
    id: 'caffe-latte',
    name: 'Caffè Latte',
    desc: 'Espresso dan susu creamy dengan latte art.',
    price: 27000,
    cat: 'Kopi',
    emoji: '🍶',
    tone: 5,
    popular: true
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew 12 Jam',
    desc: 'Rendah asam, segar, dan berkarakter.',
    price: 28000,
    cat: 'Kopi',
    emoji: '🧋',
    tone: 6,
    isNew: true
  },
  {
    id: 'mocha',
    name: 'Caffè Mocha',
    desc: 'Espresso, cokelat Belgia, susu, dan whipped cream.',
    price: 30000,
    cat: 'Kopi',
    emoji: '🍫',
    tone: 1
  },
  {
    id: 'kopi-tubruk',
    name: 'Kopi Tubruk',
    desc: 'Robusta Lampung digiling kasar, diseduh tubruk klasik.',
    price: 15000,
    cat: 'Kopi',
    emoji: '🫘',
    tone: 3
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    desc: 'Matcha Uji ceremonial grade dengan susu segar.',
    price: 29000,
    cat: 'Non-Kopi',
    emoji: '🍵',
    tone: 7,
    popular: true
  },
  {
    id: 'chocolate',
    name: 'Dark Chocolate',
    desc: 'Cokelat hitam 70% dilelehkan dengan susu.',
    price: 27000,
    cat: 'Non-Kopi',
    emoji: '🍫',
    tone: 5
  },
  {
    id: 'teh-tarik',
    name: 'Teh Tarik',
    desc: 'Teh hitam pekat dan susu kental, ditarik hingga berbusa.',
    price: 18000,
    cat: 'Non-Kopi',
    emoji: '🫖',
    tone: 2
  },
  {
    id: 'lemon-tea',
    name: 'Lemon Tea Segar',
    desc: 'Teh dingin dengan perasan lemon asli dan irisan mint.',
    price: 17000,
    cat: 'Non-Kopi',
    emoji: '🍋',
    tone: 8,
    isNew: true
  },
  {
    id: 'stroberi-smoothie',
    name: 'Stroberi Smoothie',
    desc: 'Stroberi segar, yogurt, dan madu.',
    price: 32000,
    cat: 'Non-Kopi',
    emoji: '🍓',
    tone: 9
  },
  {
    id: 'nasi-goreng-senja',
    name: 'Nasi Goreng Senja',
    desc: 'Nasi goreng kampung dengan ayam suwir, telur mata sapi, dan kerupuk.',
    price: 32000,
    cat: 'Makanan',
    emoji: '🍚',
    tone: 2,
    popular: true,
    tag: 'Favorit',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80'
  },
  {
    id: 'mie-goreng-jawa',
    name: 'Mie Goreng Jawa',
    desc: 'Mie kuning basah, bumbu bawang, kol, dan ayam.',
    price: 30000,
    cat: 'Makanan',
    emoji: '🍜',
    tone: 1
  },
  {
    id: 'ayam-geprek',
    name: 'Ayam Geprek Sambal Matah',
    desc: 'Ayam crispy digeprek sambal matah segar. Nasi putih dan lalapan.',
    price: 35000,
    cat: 'Makanan',
    emoji: '🍗',
    tone: 9,
    popular: true
  },
  {
    id: 'sandwich-ayam',
    name: 'Sandwich Ayam Panggang',
    desc: 'Roti sourdough, ayam panggang, selada, tomat, dan saus mustard madu.',
    price: 34000,
    cat: 'Makanan',
    emoji: '🥪',
    tone: 8
  },
  {
    id: 'croissant-butter',
    name: 'Croissant Butter',
    desc: 'Dipanggang setiap pagi dengan butter Prancis.',
    price: 23000,
    cat: 'Makanan',
    emoji: '🥐',
    tone: 4,
    isNew: true
  },
  {
    id: 'roti-bakar',
    name: 'Roti Bakar Srikaya',
    desc: 'Roti panggang, srikaya pandan buatan sendiri, dan butter asin.',
    price: 21000,
    cat: 'Makanan',
    emoji: '🍞',
    tone: 6
  },
  {
    id: 'kentang-goreng',
    name: 'Kentang Goreng Truffle',
    desc: 'Kentang goreng renyah dengan minyak truffle, parmesan, dan parsley.',
    price: 25000,
    cat: 'Camilan',
    emoji: '🍟',
    tone: 4,
    popular: true
  },
  {
    id: 'pisang-keju',
    name: 'Pisang Goreng Keju',
    desc: 'Pisang raja goreng crispy, keju cheddar parut, dan susu kental manis.',
    price: 22000,
    cat: 'Camilan',
    emoji: '🍌',
    tone: 2
  },
  {
    id: 'cheesecake',
    name: 'Cheesecake Slice',
    desc: 'New York cheesecake creamy dengan saus berry yang asam segar.',
    price: 33000,
    cat: 'Camilan',
    emoji: '🍰',
    tone: 9,
    popular: true
  },
  {
    id: 'brownies',
    name: 'Brownies Fudge',
    desc: 'Brownies cokelat pekat dengan taburan sea salt.',
    price: 26000,
    cat: 'Camilan',
    emoji: '🍫',
    tone: 5
  },
  {
    id: 'donat-gula',
    name: 'Donat Gula Halus',
    desc: 'Donat empuk tanpa lubang, digulingkan gula halus selagi hangat.',
    price: 15000,
    cat: 'Camilan',
    emoji: '🍩',
    tone: 8
  }
];

// Simpan menu ke localStorage untuk bisa diedit
if (localStorage.getItem('menu_data')) {
  try {
    const savedMenu = JSON.parse(localStorage.getItem('menu_data'));
    if (Array.isArray(savedMenu) && savedMenu.length > 0) {
      MENU = savedMenu;
    }
  } catch (e) {}
} else {
  localStorage.setItem('menu_data', JSON.stringify(MENU));
}

// Kode promo yang berlaku
const PROMOS = {
  SENJA10: { code: 'SENJA10', label: 'Diskon 10% (maks. Rp 20.000)', percent: 10, max: 20000, min: 0 },
  NGOPI25: { code: 'NGOPI25', label: 'Diskon 25% (maks. Rp 30.000)', percent: 25, max: 30000, min: 100000 }
};
