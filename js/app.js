/* =========================================================
   Kopi Senja — Aplikasi Kasir & Pemesanan
   ========================================================= */

(function () {
  'use strict';

  /* ------------------------------ KONFIGURASI ------------------------------ */
  const DEFAULT_RECEIPT_NOTE_PROCESSING =
    'Pesananmu sedang kami siapkan. Tunjukkan struk ini di kasir.';
  const DEFAULT_RECEIPT_NOTE_READY =
    'Pesananmu sudah siap. Tunjukkan struk ini di kasir untuk mengambil pesanan.';

  let CAFE = {
    name: 'Kopi Senja',
    logo: '☕',
    tagline: 'coffee & kitchen',
    description: 'Kopi lokal, makanan rumahan, dan camilan manis.',
    address: 'Jl. Merdeka No. 24, Tolitoli',
    phone: '0852-1234-5678',
    receiptNoteProcessing: DEFAULT_RECEIPT_NOTE_PROCESSING,
    receiptNoteReady: DEFAULT_RECEIPT_NOTE_READY
  };

  /* ------------------------------ AKUN & HAK AKSES ------------------------------ */
  const DEFAULT_USERS = {
    admin: { password: 'admin123', role: 'admin', label: 'Admin' },
    kasir: { password: 'kasir123', role: 'kasir', label: 'Kasir' }
  };

  const USERS_KEY = 'kopisenja.users.v1';
  const SESSION_KEY = 'kopisenja.session.v1';

  const ROLE_TABS = {
    admin: ['cart', 'dashboard', 'menu', 'stock', 'report', 'cafe'],
    kasir: ['cart', 'dashboard', 'report']
  };

  let USERS = loadUsers();
  let currentUser = null;

  const STORAGE = {
    cart: 'kopisenja.cart.v1',
    orders: 'kopisenja.orders.v1',
    prefs: 'kopisenja.prefs.v1'
  };

  const TAX_RATE = 0.1;
  const MAX_QTY = 99;

  const PAYMENT_LABEL = {
    tunai: 'Tunai',
    qris: 'QRIS',
    kartu: 'Kartu Debit'
  };

  const TYPE_LABEL = {
    dinein: 'Makan di tempat',
    takeaway: 'Dibawa pulang'
  };

  /* -------------------------------- STATE -------------------------------- */

  const state = {
    cart: {},
    orders: [],
    orderType: 'dinein',
    customer: '',
    table: '',
    promo: null,
    payment: 'tunai',
    cash: 0,
    filter: { q: '', cat: 'Semua', sort: 'populer' }
  };

  let lastFocused = null;
  let searchTimer = null;

  /* --------------------------------- DOM --------------------------------- */

  const $ = (id) => document.getElementById(id);

  const el = {
    header: $('siteHeader'),
    menuGrid: $('menuGrid'),
    menuEmpty: $('menuEmpty'),
    chips: $('categoryChips'),
    search: $('searchInput'),
    searchClear: $('searchClear'),
    sort: $('sortSelect'),
    resultCount: $('resultCount'),
    resetFilter: $('resetFilterBtn'),

    cartBadge: $('cartBadge'),
    cartTabCount: $('cartTabCount'),
    navOrderCount: $('navOrderCount'),
    ordersList: $('ordersList'),
    ordersEmpty: $('ordersEmpty'),

    overlay: $('overlay'),
    drawer: $('cartDrawer'),
    openCart: $('openCartBtn'),
    closeCart: $('closeCartBtn'),
    cartItems: $('cartItems'),
    cartEmpty: $('cartEmpty'),
    cartCountLabel: $('cartCountLabel'),
    typeBtns: Array.from(document.querySelectorAll('.type-btn')),
    detailsGrid: $('detailsGrid'),
    customer: $('customerName'),
    table: $('tableNumber'),
    tableField: $('tableField'),
    promoRow: $('promoRow'),
    promoInput: $('promoInput'),
    promoBtn: $('applyPromoBtn'),
    promoHint: $('promoHint'),

    sumSubtotal: $('sumSubtotal'),
    sumDiscount: $('sumDiscount'),
    sumTax: $('sumTax'),
    sumTotal: $('sumTotal'),
    discountRow: $('discountRow'),
    promoBadge: $('promoBadge'),
    checkoutBtn: $('checkoutBtn'),

    checkoutModal: $('checkoutModal'),
    closeCheckout: $('closeCheckoutBtn'),
    checkoutSummary: $('checkoutSummary'),
    checkoutSub: $('checkoutSub'),
    checkoutTotal: $('checkoutTotal'),
    payRadios: Array.from(document.querySelectorAll('input[name="payment"]')),
    cashPanel: $('cashPanel'),
    cashInput: $('cashInput'),
    cashChips: $('cashChips'),
    changeLine: $('changeLine'),
    checkoutWarning: $('checkoutWarning'),
    placeOrder: $('placeOrderBtn'),

    receiptModal: $('receiptModal'),
    receiptBody: $('receiptBody'),
    receiptPaper: $('receiptPaper'),
    receiptNote: $('receiptNote'),
    receiptCafeName: $('receiptCafeName'),
    receiptTagline: $('receiptTagline'),
    receiptLogo: $('receiptLogo'),
    printReceipt: $('printReceiptBtn'),
    doneReceipt: $('doneReceiptBtn'),

    mobileBar: $('mobileCartBar'),
    mcbCount: $('mcbCount'),
    mcbTotal: $('mcbTotal'),
    mcbOpen: $('mcbOpenBtn'),
    sideBackdrop: $('sideBackdrop'),

    toasts: $('toasts'),
    heroTakeaway: $('heroTakeawayBtn'),
    emptyCartBrowse: $('emptyCartBrowse'),
    year: $('year'),

    // Elements for cafe config
    cafeName: $('cafeName'),
    cafeLogo: $('cafeLogo'),
    tagline: $('tagline'),
    cafeDescription: $('cafeDescription'),
    cafeAddress: $('cafeAddress'),
    cafePhone: $('cafePhone'),
    receiptNoteProcessing: $('cafeReceiptNoteProcessing'),
    receiptNoteReady: $('cafeReceiptNoteReady'),
    saveConfigBtn: $('saveConfigBtn'),
    resetConfigBtn: $('resetConfigBtn'),
    cafeNameDisplay: $('cafeNameDisplay'),
    taglineDisplay: $('taglineDisplay'),
    brandLogo: $('brandLogo'),
    cafeNameDisplayFooter: $('cafeNameDisplayFooter'),
    taglineDisplayFooter: $('taglineDisplayFooter'),
    cafeNameCopyright: $('cafeNameCopyright'),
    receiptAddress: $('receiptAddress'),

    // Login & akun
    loginScreen: $('loginScreen'),
    loginForm: $('loginForm'),
    loginUsername: $('loginUsername'),
    loginPassword: $('loginPassword'),
    loginError: $('loginError'),
    loginBtn: $('loginBtn'),
    togglePassword: $('togglePassword'),
    loginCafeName: $('loginCafeName'),
    loginTagline: $('loginTagline'),
    loginLogo: $('loginLogo'),
    userName: $('userName'),
    userRole: $('userRole'),
    userAvatar: $('userAvatar'),
    logoutBtn: $('logoutBtn'),
    userList: $('userList'),
    saveUsersBtn: $('saveUsersBtn'),
    newUserName: $('newUserName'),
    newUserPass: $('newUserPass'),
    newUserRole: $('newUserRole'),
    addUserBtn: $('addUserBtn')
  };

  /* ------------------------------- HELPERS ------------------------------- */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function money(n) {
    return 'Rp ' + Math.round(Number(n) || 0).toLocaleString('id-ID');
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function readStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* penyimpanan tidak tersedia — aplikasi tetap berjalan */
    }
  }

  function persistMenu() {
    try {
      localStorage.setItem('menu_data', JSON.stringify(MENU));
    } catch (err) {
      /* penyimpanan tidak tersedia */
    }
  }

  function getAllLines() {
    const menuData = typeof MENU !== 'undefined' ? MENU : [];
    return Object.keys(state.cart)
      .map((id) => {
        const item = menuData.find((m) => m.id === id);
        if (!item) return null;
        return { ...item, qty: state.cart[id].qty, note: state.cart[id].note || '' };
      })
      .filter(Boolean);
  }

  function getPromo() {
    if (!state.promo) return null;
    const promo = PROMOS[state.promo];
    if (!promo) return null;
    return promo;
  }

  function calcTotals() {
    const lines = getAllLines();
    const count = lines.reduce((sum, l) => sum + l.qty, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

    const promo = getPromo();
    let discount = 0;
    let promoBlocked = false;

    if (promo) {
      if (subtotal < promo.min) {
        promoBlocked = true;
      } else {
        discount = Math.min(Math.round((subtotal * promo.percent) / 100), promo.max);
      }
    }

    const tax = Math.round((subtotal - discount) * TAX_RATE);
    const total = subtotal - discount + tax;

    return { lines, count, subtotal, discount, tax, total, promo, promoBlocked };
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return mins + ' menit lalu';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + ' jam lalu';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(iso));
  }

  function formatDateTime(iso) {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(iso));
  }

  function orderStage(order) {
    const mins = (Date.now() - new Date(order.at).getTime()) / 60000;
    if (mins < 2) return 1;
    if (mins < 6) return 2;
    return 3;
  }

  function statusInfo(stage, type) {
    if (stage === 1) return { label: 'Pesanan diterima', cls: 'status-diterima' };
    if (stage === 2) return { label: 'Sedang dibuat', cls: 'status-dibuat' };
    return {
      label: type === 'dinein' ? 'Siap diantar' : 'Siap diambil',
      cls: 'status-siap'
    };
  }

  function syncOrderTypeUI() {
    el.typeBtns.forEach((btn) => {
      const active = btn.dataset.type === state.orderType;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active);
    });
    const isDineIn = state.orderType === 'dinein';
    el.tableField.hidden = !isDineIn;
    el.detailsGrid.classList.toggle('is-single', !isDineIn);
  }

  /* ------------------------------- TOAST -------------------------------- */

  function toast(message, type) {
    const node = document.createElement('div');
    node.className = 'toast' + (type === 'error' ? ' toast-error' : '');
    node.setAttribute('role', 'status');
    node.innerHTML =
      '<span class="toast-icon" aria-hidden="true">' + (type === 'error' ? '!' : '✓') + '</span>' +
      '<span>' + esc(message) + '</span>';
    el.toasts.appendChild(node);

    setTimeout(() => {
      node.classList.add('leaving');
      setTimeout(() => node.remove(), 300);
    }, 2800);
  }

  /* ------------------------------ LAYER UI ------------------------------- */

  function anyLayerOpen() {
    return (
      el.checkoutModal.classList.contains('is-open') ||
      el.receiptModal.classList.contains('is-open')
    );
  }

  function syncScrollLock() {
    const locked = anyLayerOpen();
    document.body.classList.toggle('no-scroll', locked);
  }

  function syncDrawer() {
    const side = document.getElementById('adminPanel');
    if (!side) return;
    const backdrop = el.sideBackdrop;
    const isMobile = window.innerWidth <= 980;

    if (!isMobile) {
      side.classList.remove('is-open');
      side.removeAttribute('aria-hidden');
      side.inert = false;
      if (backdrop) backdrop.classList.remove('is-open');
      document.body.classList.remove('side-open');
      return;
    }

    const open = side.classList.contains('is-open');
    side.setAttribute('aria-hidden', open ? 'false' : 'true');
    side.inert = !open;
    if (backdrop) backdrop.classList.toggle('is-open', open);
    document.body.classList.toggle('side-open', open);
  }

  function openDrawer() {
    setAdminTab('cart');
    if (window.innerWidth > 980) return;

    const side = document.getElementById('adminPanel');
    if (!side) return;
    side.classList.add('is-open');
    syncDrawer();

    setTimeout(() => {
      const closeBtn = document.getElementById('closeCartBtn');
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    }, 60);
  }

  function closeDrawer() {
    const side = document.getElementById('adminPanel');
    if (!side) return;
    const wasOpen = side.classList.contains('is-open');
    side.classList.remove('is-open');
    syncDrawer();

    if (wasOpen && window.innerWidth <= 980) {
      const opener = document.getElementById('openCartBtn');
      if (opener) opener.focus({ preventScroll: true });
    }
  }

  window.addEventListener('resize', syncDrawer);

  function openModal(modal) {
    lastFocused = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    syncScrollLock();
    requestAnimationFrame(() => {
      const focusable = modal.querySelector('input, button, select, textarea, [href]');
      if (focusable) focusable.focus({ preventScroll: true });
    });
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    syncScrollLock();
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
    }
  }

  function focusableIn(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((node) => node.offsetParent !== null || node === document.activeElement);
  }

  function activeLayer() {
    if (el.receiptModal.classList.contains('is-open')) return el.receiptModal;
    if (el.checkoutModal.classList.contains('is-open')) return el.checkoutModal;
    return null;
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (el.receiptModal.classList.contains('is-open')) return closeModal(el.receiptModal);
      if (el.checkoutModal.classList.contains('is-open')) return closeModal(el.checkoutModal);
      if (document.body.classList.contains('side-open')) return closeDrawer();
    }

    if (event.key === 'Tab') {
      const layer = activeLayer();
      if (!layer) return;
      const nodes = focusableIn(layer);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* -------------------------------- MENU -------------------------------- */

  function renderChips() {
    el.chips.innerHTML = CATEGORIES.map((cat) => {
      const count =
        cat.id === 'Semua' ? (typeof MENU !== 'undefined' ? MENU : []).length : (typeof MENU !== 'undefined' ? MENU : []).filter((item) => item.cat === cat.id).length;
      return (
        '<button type="button" class="chip' + (state.filter.cat === cat.id ? ' is-active' : '') +
        '" role="tab" aria-selected="' + (state.filter.cat === cat.id) + '" data-cat="' + esc(cat.id) + '">' +
        '<span aria-hidden="true">' + cat.icon + '</span>' + esc(cat.label) +
        '<span class="chip-count">' + count + '</span></button>'
      );
    }).join('');
  }

  function getFilteredMenu() {
    const q = state.filter.q.trim().toLowerCase();
    let list = (typeof MENU !== 'undefined' ? MENU : []).slice();

    if (state.filter.cat !== 'Semua') {
      list = list.filter((item) => item.cat === state.filter.cat);
    }

    if (q) {
      list = list.filter((item) =>
        (item.name + ' ' + item.desc + ' ' + item.cat + ' ' + (item.tag || '')).toLowerCase().includes(q)
      );
    }

    switch (state.filter.sort) {
      case 'murah':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'mahal':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'nama':
        list.sort((a, b) => a.name.localeCompare(b.name, 'id'));
        break;
      default:
        list.sort((a, b) => Number(!!b.popular) - Number(!!a.popular));
    }

    return list;
  }

  function itemStock(item) {
    return typeof item.stock === 'number' ? item.stock : 20;
  }

  function controlHTML(item) {
    if (!item) return '';
    const qty = state.cart[item.id] ? state.cart[item.id].qty : 0;
    const stock = itemStock(item);

    if (stock <= 0) {
      return '<button type="button" class="add-btn is-out" disabled aria-label="' + esc(item.name) + ' habis">Habis</button>';
    }

    if (!qty) {
      return (
        '<button type="button" class="add-btn" data-action="add" data-id="' + esc(item.id) +
        '" aria-label="Tambah ' + esc(item.name) + ' ke keranjang">' +
        '<svg viewBox="0 0 20 20" width="15" height="15" fill="none" aria-hidden="true">' +
        '<path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>' +
        'Tambah</button>'
      );
    }

    return (
      '<div class="qty-stepper" role="group" aria-label="Jumlah ' + esc(item.name) + '">' +
      '<button type="button" data-action="dec" data-id="' + esc(item.id) + '" aria-label="Kurangi jumlah ' + esc(item.name) + '">−</button>' +
      '<span aria-live="polite">' + qty + '</span>' +
      '<button type="button" data-action="inc" data-id="' + esc(item.id) + '" aria-label="Tambah jumlah ' + esc(item.name) + '"' +
      (qty >= stock ? ' disabled' : '') + '>+</button>' +
      '</div>'
    );
  }

  function renderMenu() {
    const list = getFilteredMenu();

    el.menuGrid.innerHTML = list
      .map((item, index) => {
        const badge = item.tag
          ? '<span class="thumb-badge">' + esc(item.tag) + '</span>'
          : item.isNew
          ? '<span class="thumb-badge new">Baru</span>'
          : '';

        const imgHtml = item.imageUrl
          ? '<img src="' + esc(item.imageUrl) + '" alt="' + esc(item.name) + '" class="menu-img" onerror="this.style.display=\'none\';var e=this.nextElementSibling;if(e){e.style.display=\'grid\';}" />' +
            '<span class="card-emoji" aria-hidden="true" style="display:none">' + esc(item.emoji || '🍽️') + '</span>'
          : '<span class="card-emoji" aria-hidden="true">' + esc(item.emoji || '🍽️') + '</span>';

        const stock = itemStock(item);
        const stockPill =
          stock <= 0
            ? '<span class="pill is-out">Habis</span>'
            : stock <= 5
            ? '<span class="pill is-low">Sisa ' + stock + '</span>'
            : '<span class="pill">Stok ' + stock + '</span>';

        return (
          '<article class="menu-card" style="animation-delay:' + Math.min(index * 35, 280) + 'ms">' +
          '<div class="card-thumb" data-tone="' + item.tone + '">' +
          imgHtml +
          '<span class="thumb-cat">' + esc(item.cat) + '</span>' + badge +
          '</div>' +
          '<div class="card-body">' +
          '<h3 class="card-title">' + esc(item.name) + '</h3>' +
          '<p class="card-desc">' + esc(item.desc) + '</p>' +
          '<div class="card-stock">' + stockPill + '</div>' +
          '<div class="card-foot">' +
          '<p class="card-price">' + money(item.price) + '<small>per porsi</small></p>' +
          '<div class="card-action" data-action-slot="' + esc(item.id) + '">' + controlHTML(item) + '</div>' +
          '</div></div></article>'
        );
      })
      .join('');

    el.menuEmpty.hidden = list.length > 0;

    const total = (typeof MENU !== 'undefined' ? MENU : []).length;
    el.resultCount.innerHTML =
      list.length === total
        ? 'Menampilkan <strong>' + total + '</strong> menu pilihan'
        : 'Menampilkan <strong>' + list.length + '</strong> dari ' + total + ' menu' +
          (state.filter.cat !== 'Semua' ? ' · ' + esc(state.filter.cat) : '') +
          (state.filter.q ? ' · “' + esc(state.filter.q) + '”' : '');

    el.searchClear.hidden = !state.filter.q;
  }

  function syncMenuCards() {
    const menuData = typeof MENU !== 'undefined' ? MENU : [];
    document.querySelectorAll('[data-action-slot]').forEach((slot) => {
      const item = menuData.find((m) => m.id === slot.dataset.actionSlot);
      if (item) slot.innerHTML = controlHTML(item);
    });
  }

  /* -------------------------------- CART -------------------------------- */

  function saveCart() {
    writeStorage(STORAGE.cart, state.cart);
  }

  function savePrefs() {
    writeStorage(STORAGE.prefs, {
      orderType: state.orderType,
      customer: state.customer,
      table: state.table,
      promo: state.promo
    });
  }

  function setQty(id, nextQty, opts) {
    const options = opts || {};
    const menuData = typeof MENU !== 'undefined' ? MENU : [];
    const item = menuData.find((m) => m.id === id);
    if (!item) return;

    const stock = itemStock(item);
    if (stock <= 0) {
      toast('Stok ' + item.name + ' habis', 'error');
      return;
    }

    const requested = Math.round(nextQty);
    const qty = clamp(requested, 0, Math.min(MAX_QTY, stock));

    if (requested > stock) {
      toast('Stok ' + item.name + ' tinggal ' + stock, 'error');
    }

    if (qty <= 0) {
      delete state.cart[id];
    } else {
      state.cart[id] = {
        qty,
        note: state.cart[id] ? state.cart[id].note : ''
      };
      if (options.notify) {
        toast(item.name + ' ditambahkan ke keranjang');
      }
    }

    saveCart();
    refreshCartUI();
  }

  function changeQty(id, delta) {
    const current = state.cart[id] ? state.cart[id].qty : 0;
    setQty(id, current + delta, { notify: delta > 0 && current === 0 });
  }

  function refreshCartUI() {
    const totals = calcTotals();
    const promo = totals.promo;

    /* badge + header */
    el.cartBadge.textContent = totals.count;
    el.cartCountLabel.textContent = totals.count + ' item';
    if (el.cartTabCount) el.cartTabCount.textContent = totals.count;
    el.cartBadge.classList.remove('bump');
    if (totals.count > 0) {
      void el.cartBadge.offsetWidth;
      el.cartBadge.classList.add('bump');
    }
    el.checkoutBtn.disabled = totals.count === 0;

    /* menu controls */
    syncMenuCards();

    /* drawer items */
    if (totals.lines.length) {
      el.cartEmpty.hidden = true;
      el.cartItems.hidden = false;
      el.promoRow.hidden = false;
      el.cartItems.innerHTML = totals.lines
        .map(
          (line) =>
            '<div class="cart-item">' +
            '<div class="ci-thumb" data-tone="' + line.tone + '" aria-hidden="true">' + line.emoji + '</div>' +
            '<div class="ci-main">' +
            '<span class="ci-name">' + esc(line.name) + '</span>' +
            '<span class="ci-price">' + money(line.price) + ' × ' + line.qty +
            ' = <strong>' + money(line.price * line.qty) + '</strong></span>' +
            '<input class="ci-note" type="text" maxlength="80" data-note-for="' + esc(line.id) + '" ' +
            'placeholder="Catatan (cth. less sugar)" aria-label="Catatan untuk ' + esc(line.name) + '" ' +
            'value="' + esc(line.note) + '" />' +
            '</div>' +
            '<div class="ci-side">' +
            '<div class="qty-stepper">' +
            '<button type="button" data-action="dec" data-id="' + esc(line.id) + '" aria-label="Kurangi ' + esc(line.name) + '">−</button>' +
            '<span>' + line.qty + '</span>' +
            '<button type="button" data-action="inc" data-id="' + esc(line.id) + '" aria-label="Tambah ' + esc(line.name) + '">+</button>' +
            '</div>' +
            '<button type="button" class="ci-remove" data-action="remove" data-id="' + esc(line.id) + '">Hapus</button>' +
            '</div></div>'
        )
        .join('');
    } else {
      el.cartEmpty.hidden = false;
      el.cartItems.hidden = true;
      el.cartItems.innerHTML = '';
      el.promoRow.hidden = true;
    }

    /* promo */
    if (promo) {
      el.promoInput.value = promo.code;
      el.promoBtn.textContent = 'Batalkan';
      el.promoHint.textContent = totals.promoBlocked
        ? 'Minimal belanja ' + money(promo.min) + ' untuk memakai ' + promo.code + '.'
        : 'Promo aktif: ' + promo.label + '.';
      el.promoHint.className = 'promo-hint ' + (totals.promoBlocked ? 'is-error' : 'is-success');
    } else {
      el.promoBtn.textContent = 'Pakai';
      if (!el.promoInput.matches(':focus')) el.promoInput.value = '';
      el.promoHint.textContent = 'SENJA10 · diskon 10% untuk semua pesanan.';
      el.promoHint.className = 'promo-hint';
    }

    /* summary */
    el.sumSubtotal.textContent = money(totals.subtotal);
    el.sumTax.textContent = money(totals.tax);
    el.sumTotal.textContent = money(totals.total);
    el.sumDiscount.textContent = '− ' + money(totals.discount);
    el.discountRow.hidden = !promo || totals.discount <= 0;
    if (promo) el.promoBadge.textContent = promo.code;

    /* mobile bar */
    el.mcbCount.textContent = totals.count + ' item';
    el.mcbTotal.textContent = money(totals.total);
    el.mobileBar.hidden = totals.count === 0;
    document.body.classList.toggle('has-cart-bar', totals.count > 0);

    updateNavOrderCount();
  }

  function renderCart() {
    refreshCartUI();
  }

  /* ------------------------------- PROMO -------------------------------- */

  function applyPromo() {
    const raw = el.promoInput.value.trim().toUpperCase();

    if (state.promo && (!raw || raw === state.promo)) {
      state.promo = null;
      savePrefs();
      refreshCartUI();
      toast('Kode promo dibatalkan');
      return;
    }

    if (!raw) {
      el.promoHint.textContent = 'Masukkan kode promo terlebih dahulu.';
      el.promoHint.className = 'promo-hint is-error';
      el.promoInput.focus();
      return;
    }

    const promo = PROMOS[raw];
    if (!promo) {
      el.promoHint.textContent = 'Kode “' + raw + '” tidak dikenali. Coba SENJA10.';
      el.promoHint.className = 'promo-hint is-error';
      return;
    }

    const subtotal = calcTotals().subtotal;
    if (subtotal < promo.min) {
      el.promoHint.textContent =
        'Minimal belanja ' + money(promo.min) + ' untuk memakai ' + promo.code + '.';
      el.promoHint.className = 'promo-hint is-error';
      return;
    }

    state.promo = promo.code;
    savePrefs();
    el.promoInput.value = promo.code;
    refreshCartUI();
    toast('Promo ' + promo.code + ' berhasil dipakai');
  }

  /* ------------------------------ CHECKOUT ------------------------------- */

  function openCheckout() {
    const totals = calcTotals();
    if (!totals.count) {
      toast('Keranjang masih kosong', 'error');
      return;
    }

    state.payment = 'tunai';
    state.cash = 0;

    el.payRadios.forEach((radio) => {
      radio.checked = radio.value === 'tunai';
    });
    el.cashPanel.hidden = false;
    el.cashInput.value = '';
    el.checkoutWarning.hidden = true;

    el.checkoutSub.textContent =
      totals.count + ' item · ' + TYPE_LABEL[state.orderType] +
      (state.orderType === 'dinein' && state.table ? ' · Meja ' + state.table : '');

    el.checkoutSummary.innerHTML = totals.lines
      .map(
        (line) =>
          '<div class="cs-line"><span>' + line.qty + '× ' + esc(line.name) +
          (line.note ? '<br><small style="color:var(--ink-faint)">' + esc(line.note) + '</small>' : '') +
          '</span><span>' + money(line.price * line.qty) + '</span></div>'
      )
      .join('') +
      '<div class="cs-line"><span>Subtotal</span><span>' + money(totals.subtotal) + '</span></div>' +
      (totals.discount > 0
        ? '<div class="cs-line cs-discount"><span>Diskon ' + esc(totals.promo.code) + '</span><span>− ' + money(totals.discount) + '</span></div>'
        : '') +
      '<div class="cs-line"><span>Pajak PB1 (10%)</span><span>' + money(totals.tax) + '</span></div>' +
      '<div class="cs-line cs-total"><span>Total</span><span>' + money(totals.total) + '</span></div>';

    el.checkoutTotal.textContent = money(totals.total);

    closeDrawer();
    openModal(el.checkoutModal);
    updateCashUI();
  }

  function updateCashUI() {
    const totals = calcTotals();
    const cash = Number(el.cashInput.value) || 0;
    const diff = cash - totals.total;

    el.cashPanel.hidden = state.payment !== 'tunai';

    if (state.payment !== 'tunai') {
      el.changeLine.hidden = true;
      el.checkoutWarning.hidden = true;
      el.placeOrder.disabled = false;
      return;
    }

    el.changeLine.hidden = false;

    if (cash <= 0) {
      el.changeLine.classList.remove('is-short');
      el.changeLine.innerHTML = 'Kembalian <strong>Rp 0</strong>';
    } else if (diff < 0) {
      el.changeLine.classList.add('is-short');
      el.changeLine.innerHTML = 'Kurang <strong>' + money(Math.abs(diff)) + '</strong>';
    } else {
      el.changeLine.classList.remove('is-short');
      el.changeLine.innerHTML = 'Kembalian <strong>' + money(diff) + '</strong>';
    }

    const insufficient = cash < totals.total;
    el.placeOrder.disabled = insufficient;

    if (insufficient) {
      el.checkoutWarning.hidden = false;
      el.checkoutWarning.textContent =
        cash <= 0
          ? 'Masukkan jumlah uang tunai yang diterima, atau pilih metode pembayaran lain.'
          : 'Uang tunai kurang ' + money(totals.total - cash) + ' dari total pembayaran.';
    } else {
      el.checkoutWarning.hidden = true;
    }
  }

  /* ------------------------------- ORDERS -------------------------------- */

  function makeOrderCode() {
    const d = new Date();
    const stamp = String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate());
    const prefix = 'KS-' + stamp + '-';
    let max = 0;
    state.orders.forEach((order) => {
      if (order.code && order.code.indexOf(prefix) === 0) {
        const n = parseInt(order.code.slice(prefix.length), 10);
        if (!isNaN(n) && n > max) max = n;
      }
    });
    return prefix + String(max + 1).padStart(3, '0');
  }

  function placeOrder() {
    const totals = calcTotals();
    if (!totals.count) {
      toast('Keranjang masih kosong', 'error');
      return;
    }

    const cash = Number(el.cashInput.value) || 0;
    if (state.payment === 'tunai' && cash < totals.total) {
      updateCashUI();
      toast('Uang tunai belum cukup', 'error');
      return;
    }

    const order = {
      id: 'ord_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      code: makeOrderCode(),
      at: new Date().toISOString(),
      type: state.orderType,
      customer: state.customer.trim() || 'Tamu',
      table: state.orderType === 'dinein' ? state.table.trim() : '',
      items: totals.lines.map((line) => ({
        id: line.id,
        name: line.name,
        price: line.price,
        qty: line.qty,
        note: line.note,
        emoji: line.emoji,
        tone: line.tone
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      promo: totals.promo ? totals.promo.code : null,
      payment: state.payment,
      cash: state.payment === 'tunai' ? cash : 0,
      change: state.payment === 'tunai' ? cash - totals.total : 0
    };

    state.orders.unshift(order);
    state.orders = state.orders.slice(0, 500);
    writeStorage(STORAGE.orders, state.orders);

    /* kurangi stok menu yang terjual */
    const menuData = typeof MENU !== 'undefined' ? MENU : [];
    order.items.forEach((line) => {
      const menuItem = menuData.find((m) => m.id === line.id);
      if (menuItem) {
        const current = itemStock(menuItem);
        menuItem.stock = Math.max(0, current - line.qty);
      }
    });
    persistMenu();

    /* kosongkan keranjang */
    state.cart = {};
    state.promo = null;
    saveCart();
    savePrefs();
    el.promoInput.value = '';

    renderOrders();
    refreshCartUI();

    closeModal(el.checkoutModal);
    setTimeout(() => {
      openReceipt(order);
      toast('Pesanan ' + order.code + ' berhasil dibuat');
    }, 240);
  }

  function openReceipt(order) {
    const stage = orderStage(order);
    const status = statusInfo(stage, order.type);
    const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

    const metaRows = [
      ['No. pesanan', order.code],
      ['Waktu', formatDateTime(order.at)],
      ['Tipe', TYPE_LABEL[order.type]],
      order.type === 'dinein' && order.table ? ['Meja', order.table] : null,
      ['Nama', order.customer],
      ['Status', status.label]
    ].filter(Boolean);

    const itemRows = order.items
      .map(
        (item) =>
          '<div class="rm-item"><div class="rm-name">' + esc(item.name) +
          (item.note ? '<em>' + esc(item.note) + '</em>' : '') +
          '</div><div class="rm-qty">×' + item.qty + '</div>' +
          '<div class="rm-price">' + money(item.price * item.qty) + '</div></div>'
      )
      .join('');

    const payRows =
      '<div class="rm-row"><span>Metode</span><span>' + PAYMENT_LABEL[order.payment] + '</span></div>' +
      (order.payment === 'tunai'
        ? '<div class="rm-row"><span>Tunai</span><span>' + money(order.cash) + '</span></div>' +
          '<div class="rm-row"><span>Kembalian</span><span>' + money(order.change) + '</span></div>'
        : '');

    el.receiptBody.innerHTML =
      metaRows
        .map(
          ([label, value]) =>
            '<div class="rm-row"><span>' + esc(label) + '</span><b>' + esc(value) + '</b></div>'
        )
        .join('') +
      '<div class="rm-items">' + itemRows + '</div>' +
      '<div class="rm-row"><span>Subtotal (' + itemCount + ' item)</span><span>' + money(order.subtotal) + '</span></div>' +
      (order.discount > 0
        ? '<div class="rm-row"><span>Diskon' + (order.promo ? ' ' + esc(order.promo) : '') + '</span><span>− ' + money(order.discount) + '</span></div>'
        : '') +
      '<div class="rm-row"><span>Pajak PB1 (10%)</span><span>' + money(order.tax) + '</span></div>' +
      '<div class="rm-total"><span>TOTAL</span><span>' + money(order.total) + '</span></div>' +
      '<div class="rm-pay">' + payRows + '</div>';

    el.receiptPaper.scrollTop = 0;
    el.receiptNote.textContent =
      stage === 3
        ? CAFE.receiptNoteReady || DEFAULT_RECEIPT_NOTE_READY
        : CAFE.receiptNoteProcessing || DEFAULT_RECEIPT_NOTE_PROCESSING;
    openModal(el.receiptModal);
  }

  function renderOrders() {
    if (!el.ordersList || !el.ordersEmpty) return;
    if (!state.orders.length) {
      el.ordersList.innerHTML = '';
      el.ordersEmpty.hidden = false;
      updateNavOrderCount();
      return;
    }

    el.ordersEmpty.hidden = true;

    el.ordersList.innerHTML = state.orders
      .map((order) => {
        const stage = orderStage(order);
        const status = statusInfo(stage, order.type);
        const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

        const meta = [
          TYPE_LABEL[order.type],
          order.type === 'dinein' && order.table ? 'Meja ' + order.table : null,
          itemCount + ' item',
          PAYMENT_LABEL[order.payment],
          timeAgo(order.at)
        ]
          .filter(Boolean)
          .join(' · ');

        const items = order.items
          .map(
            (item) =>
              '<li><span><b>' + item.qty + '×</b>' + esc(item.name) +
              (item.note ? '<br><small>↳ ' + esc(item.note) + '</small>' : '') +
              '</span><span>' + money(item.price * item.qty) + '</span></li>'
          )
          .join('');

        const steps = [
          ['Pesanan diterima', 1],
          ['Sedang dibuat', 2],
          [order.type === 'dinein' ? 'Siap diantar' : 'Siap diambil', 3]
        ]
          .map(([label, step], index) => {
            const done = stage >= step ? ' is-done' : '';
            const line = index < 2 ? '<span class="op-line' + (stage > step ? ' is-done' : '') + '"></span>' : '';
            return (
              '<span class="op-step' + done + '"><i></i>' + label + '</span>' + line
            );
          })
          .join('');

        return (
          '<article class="order-card">' +
          '<div class="order-top">' +
          '<div><p class="order-code">' + esc(order.code) + '<span>' + formatDateTime(order.at) + '</span></p>' +
          '<p class="order-meta">' + esc(order.customer) + ' · ' + esc(meta) + '</p></div>' +
          '<span class="status-chip ' + status.cls + '">' + status.label + '</span>' +
          '</div>' +
          '<ul class="order-items">' + items + '</ul>' +
          '<div class="order-progress">' + steps + '</div>' +
          '<div class="order-foot">' +
          '<p class="order-total">Total dibayar<strong>' + money(order.total) + '</strong></p>' +
          '<div class="order-actions">' +
          '<button type="button" data-action="receipt" data-order="' + esc(order.id) + '">Lihat struk</button>' +
          '<button type="button" data-action="reorder" data-order="' + esc(order.id) + '">Pesan lagi</button>' +
          '</div></div></article>'
        );
      })
      .join('');

    updateNavOrderCount();
  }

  function updateNavOrderCount() {
    if (!el.navOrderCount) return;
    const count = state.orders.length;
    el.navOrderCount.textContent = count;
    el.navOrderCount.hidden = count === 0;
  }

  function reorder(orderId) {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;
    const menuData = typeof MENU !== 'undefined' ? MENU : [];

    let added = 0;
    order.items.forEach((item) => {
      const menuItem = menuData.find((m) => m.id === item.id);
      if (!menuItem) return;
      const existing = state.cart[item.id];
      const qty = clamp((existing ? existing.qty : 0) + item.qty, 1, MAX_QTY);
      state.cart[item.id] = { qty, note: existing ? existing.note : item.note || '' };
      added += 1;
    });

    if (!added) {
      toast('Menu pada pesanan ini sudah tidak tersedia', 'error');
      return;
    }

    saveCart();
    refreshCartUI();
    openDrawer();
    toast('Menu dari ' + order.code + ' ditambahkan kembali');
  }

  /* ------------------------------- EVENTS -------------------------------- */

  if (el.openCart) el.openCart.addEventListener('click', openDrawer);
  if (el.mcbOpen) el.mcbOpen.addEventListener('click', openDrawer);
  if (el.closeCart) el.closeCart.addEventListener('click', closeDrawer);
  if (el.overlay) el.overlay.addEventListener('click', closeDrawer);
  if (el.sideBackdrop) el.sideBackdrop.addEventListener('click', closeDrawer);
  if (el.emptyCartBrowse) el.emptyCartBrowse.addEventListener('click', (event) => {
    if (window.innerWidth <= 980) {
      event.preventDefault();
      closeDrawer();
      const menu = document.getElementById('menu');
      if (menu) menu.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  el.menuGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === 'add') setQty(id, 1, { notify: true });
    if (action === 'inc') changeQty(id, 1);
    if (action === 'dec') changeQty(id, -1);
  });

  el.cartItems.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === 'inc') changeQty(id, 1);
    if (action === 'dec') changeQty(id, -1);
    if (action === 'remove') {
      const item = (typeof MENU !== 'undefined' ? MENU : []).find((m) => m.id === id);
      delete state.cart[id];
      saveCart();
      refreshCartUI();
      toast((item ? item.name : 'Menu') + ' dihapus dari keranjang');
    }
  });

  el.cartItems.addEventListener('input', (event) => {
    const input = event.target.closest('[data-note-for]');
    if (!input) return;
    const id = input.dataset.noteFor;
    if (!state.cart[id]) return;
    state.cart[id].note = input.value.slice(0, 80);
    saveCart();
  });

  el.typeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.orderType = btn.dataset.type;
      syncOrderTypeUI();
      savePrefs();
    });
  });

  el.customer.addEventListener('input', () => {
    state.customer = el.customer.value.slice(0, 40);
    savePrefs();
  });

  el.table.addEventListener('input', () => {
    const cleaned = el.table.value.replace(/\D+/g, '').slice(0, 4);
    if (cleaned !== el.table.value) el.table.value = cleaned;
    state.table = cleaned;
    savePrefs();
  });

  el.promoBtn.addEventListener('click', applyPromo);
  el.promoInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyPromo();
    }
  });

  el.checkoutBtn.addEventListener('click', openCheckout);
  el.closeCheckout.addEventListener('click', () => closeModal(el.checkoutModal));
  el.checkoutModal.addEventListener('click', (event) => {
    if (event.target === el.checkoutModal) closeModal(el.checkoutModal);
  });

  el.payRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      state.payment = radio.value;
      updateCashUI();
    });
  });

  el.cashInput.addEventListener('input', updateCashUI);

  el.cashChips.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-cash]');
    if (!btn) return;
    const totals = calcTotals();
    const value = btn.dataset.cash === 'exact' ? totals.total : Number(btn.dataset.cash);
    el.cashInput.value = value > 0 ? String(value) : '';
    updateCashUI();
  });

  el.placeOrder.addEventListener('click', placeOrder);

  el.doneReceipt.addEventListener('click', () => {
    closeModal(el.receiptModal);
    if (window.innerWidth <= 980) closeDrawer();
    const target = document.getElementById('pesanan');
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 220);
    }
  });

  el.receiptModal.addEventListener('click', (event) => {
    if (event.target === el.receiptModal) closeModal(el.receiptModal);
  });

  el.printReceipt.addEventListener('click', () => {
    window.print();
  });

  if (el.ordersList) el.ordersList.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'reorder') reorder(btn.dataset.order);
    if (btn.dataset.action === 'receipt') {
      const order = state.orders.find((o) => o.id === btn.dataset.order);
      if (order) openReceipt(order);
    }
  });

  const dashboardRecentEl = document.getElementById('dashboardRecent');
  if (dashboardRecentEl) {
    dashboardRecentEl.addEventListener('click', (event) => {
      if (!currentUser || currentUser.role !== 'admin') return;

      const receiptBtn = event.target.closest('[data-receipt]');
      if (receiptBtn) {
        const order = state.orders.find((o) => o.id === receiptBtn.dataset.receipt);
        if (order) printOrderReceipt(order);
        return;
      }

      const deleteBtn = event.target.closest('[data-delete-order]');
      if (deleteBtn) deleteOrder(deleteBtn.dataset.deleteOrder);
    });
  }

  el.chips.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-cat]');
    if (!chip) return;
    state.filter.cat = chip.dataset.cat;
    renderChips();
    renderMenu();
  });

  el.search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.filter.q = el.search.value;
      renderMenu();
    }, 120);
  });

  el.searchClear.addEventListener('click', () => {
    el.search.value = '';
    state.filter.q = '';
    el.search.focus();
    renderMenu();
  });

  el.sort.addEventListener('change', () => {
    state.filter.sort = el.sort.value;
    renderMenu();
  });

  el.resetFilter.addEventListener('click', () => {
    state.filter = { q: '', cat: 'Semua', sort: 'populer' };
    el.search.value = '';
    el.sort.value = 'populer';
    renderChips();
    renderMenu();
  });

  if (el.heroTakeaway) el.heroTakeaway.addEventListener('click', () => {
    state.orderType = 'takeaway';
    syncOrderTypeUI();
    savePrefs();
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth', block: 'start' });
    toast('Mode dibawa pulang aktif — pilih menumu');
  });

  /* =========================================================
     PANEL KANAN — Keranjang · Dashboard · Menu · Stok · Laporan · Kafe
     ========================================================= */

  const adminPanel = document.getElementById('adminPanel');
  const adminPanelTitle = document.getElementById('adminPanelTitle');
  const adminTabs = Array.from(document.querySelectorAll('.admin-tab'));
  const adminSections = Array.from(document.querySelectorAll('.admin-section'));

  const ADMIN_TITLES = {
    cart: 'Keranjang',
    dashboard: 'Dashboard',
    menu: 'Pengaturan Menu',
    stock: 'Manajemen Stok',
    report: 'Laporan Keuangan',
    cafe: 'Pengaturan Kafe'
  };

  let activeAdminTab = 'cart';

  function openAdminPanel(tab) {
    setAdminTab(tab || activeAdminTab);
  }

  function setAdminTab(tab) {
    if (!currentUser) {
      tab = 'cart';
    } else {
      const allowed = ROLE_TABS[currentUser.role] || ROLE_TABS.kasir;
      if (allowed.indexOf(tab) === -1) tab = 'cart';
    }
    activeAdminTab = tab;
    if (adminPanelTitle) adminPanelTitle.textContent = ADMIN_TITLES[tab] || 'Panel';
    adminTabs.forEach((b) => b.classList.toggle('is-active', b.dataset.admin === tab));
    adminSections.forEach((s) => {
      s.hidden = s.dataset.section !== tab;
    });

    if (tab === 'cart') refreshCartUI();
    if (tab === 'dashboard') renderDashboard();
    if (tab === 'cafe') {
      fillCafeForm();
      renderUserAdmin();
    }
    if (tab === 'menu') renderMenuAdmin();
    if (tab === 'stock') renderStock();
    if (tab === 'report') renderReport();
  }

  adminTabs.forEach((btn) => {
    btn.addEventListener('click', () => setAdminTab(btn.dataset.admin));
  });

  /* --- Pengaturan Kafe --- */

  const saveConfigBtn = document.getElementById('saveConfigBtn');
  const resetConfigBtn = document.getElementById('resetConfigBtn');

  function fillCafeForm() {
    if (el.cafeName) el.cafeName.value = CAFE.name || '';
    if (el.cafeLogo) el.cafeLogo.value = CAFE.logo || '☕';
    if (el.tagline) el.tagline.value = CAFE.tagline || 'coffee & kitchen';
    if (el.cafeDescription) el.cafeDescription.value = CAFE.description || '';
    if (el.cafeAddress) el.cafeAddress.value = CAFE.address || '';
    if (el.cafePhone) el.cafePhone.value = CAFE.phone || '';
    if (el.receiptNoteProcessing) {
      el.receiptNoteProcessing.value =
        CAFE.receiptNoteProcessing || DEFAULT_RECEIPT_NOTE_PROCESSING;
    }
    if (el.receiptNoteReady) {
      el.receiptNoteReady.value = CAFE.receiptNoteReady || DEFAULT_RECEIPT_NOTE_READY;
    }
  }

  function applyBrand() {
    if (el.cafeNameDisplay) el.cafeNameDisplay.textContent = CAFE.name;
    if (el.taglineDisplay) el.taglineDisplay.textContent = CAFE.tagline;
    if (el.brandLogo) el.brandLogo.textContent = CAFE.logo || '☕';
    if (el.cafeNameDisplayFooter) el.cafeNameDisplayFooter.textContent = CAFE.name;
    if (el.taglineDisplayFooter) el.taglineDisplayFooter.textContent = CAFE.tagline;
    if (el.cafeNameCopyright) el.cafeNameCopyright.textContent = CAFE.name;
    if (el.receiptCafeName) el.receiptCafeName.textContent = CAFE.name.toUpperCase();
    if (el.receiptTagline) el.receiptTagline.textContent = CAFE.tagline;
    if (el.receiptLogo) el.receiptLogo.textContent = CAFE.logo || '☕';
    if (el.receiptAddress) {
      el.receiptAddress.textContent = [CAFE.address, CAFE.phone].filter(Boolean).join(' · ');
    }
    if (el.loginCafeName) el.loginCafeName.textContent = CAFE.name;
    if (el.loginTagline) el.loginTagline.textContent = CAFE.tagline;
    if (el.loginLogo) el.loginLogo.textContent = CAFE.logo || '☕';
    document.title = CAFE.name + ' — Kasir & Pemesanan';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', CAFE.description || CAFE.name);
  }

  function saveConfig() {
    CAFE.name = el.cafeName && el.cafeName.value.trim() ? el.cafeName.value.trim() : 'Kopi Senja';
    CAFE.logo = el.cafeLogo && el.cafeLogo.value.trim() ? el.cafeLogo.value.trim() : '☕';
    CAFE.tagline = el.tagline && el.tagline.value.trim() ? el.tagline.value.trim() : 'coffee & kitchen';
    CAFE.description = el.cafeDescription ? el.cafeDescription.value.trim() : '';
    CAFE.address = el.cafeAddress ? el.cafeAddress.value.trim() : '';
    CAFE.phone = el.cafePhone ? el.cafePhone.value.trim() : '';
    CAFE.receiptNoteProcessing =
      el.receiptNoteProcessing && el.receiptNoteProcessing.value.trim()
        ? el.receiptNoteProcessing.value.trim()
        : DEFAULT_RECEIPT_NOTE_PROCESSING;
    CAFE.receiptNoteReady =
      el.receiptNoteReady && el.receiptNoteReady.value.trim()
        ? el.receiptNoteReady.value.trim()
        : DEFAULT_RECEIPT_NOTE_READY;

    applyBrand();
    try {
      localStorage.setItem('cafe_config', JSON.stringify(CAFE));
    } catch (e) {}
    toast('Pengaturan kafe berhasil disimpan');
  }

  function resetConfig() {
    CAFE = {
      name: 'Kopi Senja',
      logo: '☕',
      tagline: 'coffee & kitchen',
      description: 'Kopi lokal, makanan rumahan, dan camilan manis.',
      address: 'Jl. Merdeka No. 24, Tolitoli',
      phone: '0852-1234-5678',
      receiptNoteProcessing: DEFAULT_RECEIPT_NOTE_PROCESSING,
      receiptNoteReady: DEFAULT_RECEIPT_NOTE_READY
    };
    fillCafeForm();
    applyBrand();
    try {
      localStorage.removeItem('cafe_config');
    } catch (e) {}
    toast('Reset ke pengaturan default');
  }

  if (saveConfigBtn) saveConfigBtn.addEventListener('click', saveConfig);
  if (resetConfigBtn) resetConfigBtn.addEventListener('click', resetConfig);

  /* --- Login & hak akses --- */

  function loadUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const clean = {};
          Object.keys(parsed).forEach((key) => {
            const user = parsed[key];
            if (
              user &&
              typeof user.password === 'string' &&
              (user.role === 'admin' || user.role === 'kasir')
            ) {
              clean[key] = {
                password: user.password,
                role: user.role,
                label: user.label || key
              };
            }
          });
          if (Object.keys(clean).length) return clean;
        }
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_USERS));
  }

  function persistUsers() {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(USERS));
    } catch (e) {}
  }

  function readSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      const user = session && USERS[session.username];
      if (user && user.role === session.role) return session;
    } catch (e) {}
    return null;
  }

  function saveSession(session) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {}
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  }

  function setAppInert(locked) {
    [document.querySelector('.pos-top'), document.querySelector('.pos-main')].forEach((node) => {
      if (node) node.inert = locked;
    });
  }

  function showLogin() {
    document.body.classList.add('is-locked');
    setAppInert(true);
    if (el.loginScreen) {
      el.loginScreen.classList.add('is-open');
      el.loginScreen.setAttribute('aria-hidden', 'false');
    }
    if (el.loginError) el.loginError.hidden = true;
    if (el.loginUsername && el.loginPassword) {
      el.loginUsername.value = '';
      el.loginPassword.value = '';
      setTimeout(() => el.loginUsername.focus(), 120);
    }
  }

  function hideLogin() {
    document.body.classList.remove('is-locked');
    setAppInert(false);
    if (el.loginScreen) {
      el.loginScreen.classList.remove('is-open');
      el.loginScreen.setAttribute('aria-hidden', 'true');
    }
  }

  function applyUser() {
    if (!currentUser) return;
    const user = USERS[currentUser.username];
    const label = user ? user.label : currentUser.role;
    if (el.userName) el.userName.textContent = label;
    if (el.userRole) el.userRole.textContent = currentUser.role === 'admin' ? 'Administrator' : 'Kasir';
    if (el.userAvatar) el.userAvatar.textContent = label.charAt(0).toUpperCase();

    const allowed = ROLE_TABS[currentUser.role] || ROLE_TABS.kasir;
    adminTabs.forEach((btn) => {
      btn.hidden = allowed.indexOf(btn.dataset.admin) === -1;
    });

    if (allowed.indexOf(activeAdminTab) === -1) setAdminTab('cart');
    syncDrawer();
  }

  function login(username, password) {
    const key = String(username || '').trim().toLowerCase();
    const user = USERS[key];
    if (!user || user.password !== password) return false;

    currentUser = { username: key, role: user.role, name: user.label, loginAt: Date.now() };
    saveSession(currentUser);
    hideLogin();
    applyUser();
    toast('Selamat datang, ' + user.label);
    return true;
  }

  function logout() {
    if (!currentUser) return;
    if (!window.confirm('Keluar dari akun ' + currentUser.name + '?')) return;
    currentUser = null;
    clearSession();
    window.location.reload();
  }

  if (el.loginForm) {
    el.loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (login(el.loginUsername.value, el.loginPassword.value)) {
        el.loginForm.reset();
        if (el.loginError) el.loginError.hidden = true;
        return;
      }
      if (el.loginError) {
        el.loginError.textContent = 'Username atau password salah. Coba lagi.';
        el.loginError.hidden = false;
      }
      el.loginForm.classList.remove('shake');
      void el.loginForm.offsetWidth;
      el.loginForm.classList.add('shake');
      el.loginPassword.value = '';
      el.loginPassword.focus();
    });
  }

  if (el.togglePassword) {
    el.togglePassword.addEventListener('click', () => {
      const show = el.loginPassword.type === 'password';
      el.loginPassword.type = show ? 'text' : 'password';
      el.togglePassword.textContent = show ? '🙈' : '👁';
      el.togglePassword.setAttribute(
        'aria-label',
        show ? 'Sembunyikan password' : 'Tampilkan password'
      );
    });
  }

  if (el.logoutBtn) el.logoutBtn.addEventListener('click', logout);

  /* --- Kelola akun (di Pengaturan Kafe) --- */

  function renderUserAdmin() {
    if (!el.userList) return;

    const usernames = Object.keys(USERS);
    const adminCount = usernames.filter((key) => USERS[key].role === 'admin').length;

    el.userList.innerHTML = usernames
      .map((username) => {
        const user = USERS[username];
        const isSelf = currentUser && currentUser.username === username;
        const canDelete =
          !isSelf && !(user.role === 'admin' && adminCount <= 1);

        return (
          '<div class="user-row" data-user="' + esc(username) + '">' +
            '<div class="user-row-head">' +
              '<span class="user-row-name">' + esc(username) +
                (isSelf ? ' <em>(kamu)</em>' : '') +
              '</span>' +
              '<span class="pill' + (user.role === 'admin' ? ' is-admin' : '') + '">' +
                (user.role === 'admin' ? 'Admin' : 'Kasir') +
              '</span>' +
              (canDelete
                ? '<button class="user-del" type="button" data-del="' + esc(username) +
                  '" title="Hapus akun ' + esc(username) + '" aria-label="Hapus akun ' +
                  esc(username) + '">✕</button>'
                : '') +
            '</div>' +
            '<div class="user-row-pass">' +
              '<input type="password" class="user-pass-input" data-user="' + esc(username) +
                '" value="' + esc(user.password) + '" maxlength="40" aria-label="Password ' +
                esc(username) + '" />' +
              '<button class="user-show" type="button" data-show="' + esc(username) +
                '" aria-label="Tampilkan password">👁</button>' +
            '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  function saveUserPasswords() {
    const inputs = Array.from(document.querySelectorAll('.user-pass-input'));
    if (!inputs.length) return;

    for (let i = 0; i < inputs.length; i += 1) {
      const username = inputs[i].dataset.user;
      if (!USERS[username]) continue;
      if (inputs[i].value.length < 4) {
        toast('Password ' + username + ' minimal 4 karakter', 'error');
        inputs[i].focus();
        return;
      }
    }

    inputs.forEach((input) => {
      const user = USERS[input.dataset.user];
      if (user) user.password = input.value;
    });

    persistUsers();
    toast('Password akun berhasil diperbarui');
  }

  function addUser() {
    const username = (el.newUserName ? el.newUserName.value : '').trim().toLowerCase();
    const password = el.newUserPass ? el.newUserPass.value : '';
    const role = el.newUserRole && el.newUserRole.value === 'admin' ? 'admin' : 'kasir';

    if (!/^[a-z0-9._-]{3,20}$/.test(username)) {
      toast('Username 3–20 karakter (huruf, angka, titik, garis bawah)', 'error');
      if (el.newUserName) el.newUserName.focus();
      return;
    }
    if (USERS[username]) {
      toast('Username "' + username + '" sudah dipakai', 'error');
      if (el.newUserName) el.newUserName.focus();
      return;
    }
    if (password.length < 4) {
      toast('Password minimal 4 karakter', 'error');
      if (el.newUserPass) el.newUserPass.focus();
      return;
    }

    USERS[username] = {
      password,
      role,
      label: username.charAt(0).toUpperCase() + username.slice(1)
    };
    persistUsers();
    renderUserAdmin();

    if (el.newUserName) el.newUserName.value = '';
    if (el.newUserPass) el.newUserPass.value = '';
    if (el.newUserRole) el.newUserRole.value = 'kasir';
    toast('Akun "' + username + '" berhasil ditambahkan');
  }

  function deleteUser(username) {
    const user = USERS[username];
    if (!user) return;

    if (currentUser && currentUser.username === username) {
      toast('Tidak bisa menghapus akun yang sedang dipakai', 'error');
      return;
    }

    const adminCount = Object.keys(USERS).filter((key) => USERS[key].role === 'admin').length;
    if (user.role === 'admin' && adminCount <= 1) {
      toast('Minimal harus ada satu akun admin', 'error');
      return;
    }

    if (!window.confirm('Hapus akun "' + username + '"?')) return;

    delete USERS[username];
    persistUsers();
    renderUserAdmin();
    toast('Akun "' + username + '" dihapus');
  }

  if (el.userList) {
    el.userList.addEventListener('click', (event) => {
      const showBtn = event.target.closest('[data-show]');
      if (showBtn) {
        const input = el.userList.querySelector(
          '.user-pass-input[data-user="' + showBtn.dataset.show + '"]'
        );
        if (input) {
          const show = input.type === 'password';
          input.type = show ? 'text' : 'password';
          showBtn.textContent = show ? '🙈' : '👁';
          showBtn.setAttribute(
            'aria-label',
            show ? 'Sembunyikan password' : 'Tampilkan password'
          );
        }
        return;
      }

      const delBtn = event.target.closest('[data-del]');
      if (delBtn) deleteUser(delBtn.dataset.del);
    });
  }

  if (el.saveUsersBtn) el.saveUsersBtn.addEventListener('click', saveUserPasswords);
  if (el.addUserBtn) el.addUserBtn.addEventListener('click', addUser);

  /* --- Dashboard --- */

  function statCard(label, value, accent) {
    return (
      '<div class="stat-card' + (accent ? ' is-accent' : '') + '">' +
      '<span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>'
    );
  }

  function printOrderReceipt(order) {
    if (!currentUser || currentUser.role !== 'admin') {
      toast('Hanya admin yang bisa mencetak dari dashboard', 'error');
      return;
    }
    openReceipt(order);
    window.print();
  }

  function deleteOrder(orderId) {
    if (!currentUser || currentUser.role !== 'admin') {
      toast('Hanya admin yang bisa menghapus transaksi', 'error');
      return;
    }

    const index = state.orders.findIndex((o) => o.id === orderId);
    if (index === -1) return;

    const order = state.orders[index];
    if (!window.confirm('Hapus transaksi ' + order.code + '? Stok item akan dikembalikan.')) {
      return;
    }

    state.orders.splice(index, 1);
    writeStorage(STORAGE.orders, state.orders);

    /* kembalikan stok item yang terjual */
    const menuData = typeof MENU !== 'undefined' ? MENU : [];
    (order.items || []).forEach((line) => {
      const menuItem = menuData.find((m) => m.id === line.id);
      if (menuItem) {
        const qty = Number(line.qty) || 0;
        menuItem.stock = itemStock(menuItem) + qty;
      }
    });
    persistMenu();

    renderDashboard();
    renderMenu();
    renderStock();
    renderOrders();
    updateNavOrderCount();
    toast('Transaksi ' + order.code + ' dihapus · stok dikembalikan');
  }

  function renderDashboard() {
    const statsEl = document.getElementById('dashboardStats');
    const lowEl = document.getElementById('dashboardLowStock');
    const recentEl = document.getElementById('dashboardRecent');
    if (!statsEl) return;

    const today = new Date().toDateString();
    const todayOrders = state.orders.filter((o) => new Date(o.at).toDateString() === today);
    const revenue = todayOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const itemsSold = todayOrders.reduce(
      (s, o) => s + o.items.reduce((a, it) => a + (Number(it.qty) || 0), 0),
      0
    );
    const menuData = typeof MENU !== 'undefined' ? MENU : [];
    const lowStock = menuData.filter((m) => itemStock(m) <= 5);

    statsEl.innerHTML =
      statCard('Pendapatan hari ini', money(revenue), true) +
      statCard('Transaksi hari ini', todayOrders.length) +
      statCard('Item terjual', itemsSold) +
      statCard('Stok menipis', lowStock.length);

    lowEl.innerHTML = lowStock.length
      ? lowStock
          .map((m) => {
            const s = itemStock(m);
            return (
              '<div class="low-stock-item"><strong>' + esc(m.name) + '</strong>' +
              (s <= 0
                ? '<span class="pill is-out">Habis</span>'
                : '<span class="pill is-low">Sisa ' + s + '</span>') +
              '</div>'
            );
          })
          .join('')
      : '<div class="empty-note">Semua stok aman 👍</div>';

    const recent = state.orders.slice(0, 5);
    const isAdmin = currentUser && currentUser.role === 'admin';
    recentEl.innerHTML = recent.length
      ? recent
          .map((o) => {
            const actions = isAdmin
              ? '<div class="recent-actions">' +
                  '<button type="button" class="recent-btn" data-receipt="' + esc(o.id) +
                    '" title="Cetak struk" aria-label="Cetak struk ' + esc(o.code) + '">🖨️</button>' +
                  '<button type="button" class="recent-btn is-danger" data-delete-order="' + esc(o.id) +
                    '" title="Hapus transaksi" aria-label="Hapus transaksi ' + esc(o.code) + '">🗑️</button>' +
                '</div>'
              : '';

            return (
              '<div class="recent-item">' +
                '<div class="recent-info">' +
                  '<strong>' + esc(o.code) + '</strong>' +
                  '<small>' + esc(o.customer) + ' · ' + esc(formatDateTime(o.at)) + '</small>' +
                '</div>' +
                '<div class="recent-side">' +
                  '<strong>' + money(o.total) + '</strong>' +
                  actions +
                '</div>' +
              '</div>'
            );
          })
          .join('')
      : '<div class="empty-note">Belum ada transaksi.</div>';
  }

  /* --- Manajemen Stok --- */

  function renderStock() {
    const stockList = document.getElementById('stockList');
    if (!stockList) return;

    const menuData = typeof MENU !== 'undefined' ? MENU : [];
    if (!menuData.length) {
      stockList.innerHTML = '<div class="empty-note">Belum ada menu.</div>';
      return;
    }

    stockList.innerHTML = menuData
      .map((item, idx) => {
        const stock = itemStock(item);
        const thumb = item.imageUrl
          ? '<img src="' + esc(item.imageUrl) + '" alt="" />'
          : esc(item.emoji || '🍽️');
        const status =
          stock <= 0
            ? '<span class="pill is-out">Habis</span>'
            : stock <= 5
            ? '<span class="pill is-low">Menipis</span>'
            : '';
        return (
          '<div class="stock-row">' +
          '<span class="stock-row-thumb">' + thumb + '</span>' +
          '<span class="stock-row-info"><strong>' + esc(item.name) + '</strong>' +
          '<small>' + esc(item.cat) + ' ' + status + '</small></span>' +
          '<input type="number" min="0" step="1" value="' + stock + '" data-stock-idx="' + idx +
          '" aria-label="Stok ' + esc(item.name) + '" />' +
          '</div>'
        );
      })
      .join('');

    stockList.querySelectorAll('[data-stock-idx]').forEach((input) => {
      input.addEventListener('change', () => {
        const idx = Number(input.dataset.stockIdx);
        const item = menuData[idx];
        if (!item) return;
        item.stock = Math.max(0, Math.round(Number(input.value) || 0));
        input.value = item.stock;
        persistMenu();
        renderMenu();
        renderStock();
        renderDashboard();
        toast('Stok ' + item.name + ' diperbarui');
      });
    });
  }

  const restockAllBtn = document.getElementById('stockRestockAllBtn');
  if (restockAllBtn) {
    restockAllBtn.addEventListener('click', () => {
      (typeof MENU !== 'undefined' ? MENU : []).forEach((m) => {
        m.stock = itemStock(m) + 10;
      });
      persistMenu();
      renderStock();
      renderMenu();
      renderDashboard();
      toast('Semua stok ditambah 10');
    });
  }

  /* --- Laporan Keuangan --- */

  function reportOrders() {
    const select = document.getElementById('reportPeriod');
    const period = select ? select.value : 'today';
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return state.orders.filter((o) => {
      if (period === 'all') return true;
      const d = new Date(o.at);
      if (period === 'today') return d.toDateString() === new Date().toDateString();
      const days = Number(period) || 7;
      const cutoff = new Date(now.getTime() - (days - 1) * 86400000);
      return d >= cutoff;
    });
  }

  function renderReport() {
    const statsEl = document.getElementById('reportStats');
    const dailyEl = document.getElementById('reportDaily');
    const payEl = document.getElementById('reportPayments');
    const topEl = document.getElementById('reportTopItems');
    if (!statsEl) return;

    const orders = reportOrders();
    const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const itemsSold = orders.reduce(
      (s, o) => s + o.items.reduce((a, it) => a + (Number(it.qty) || 0), 0),
      0
    );
    const avg = orders.length ? Math.round(revenue / orders.length) : 0;

    statsEl.innerHTML =
      statCard('Pendapatan', money(revenue), true) +
      statCard('Transaksi', orders.length) +
      statCard('Item terjual', itemsSold) +
      statCard('Rata-rata / transaksi', money(avg));

    /* pendapatan 7 hari terakhir */
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({
        key: d.toDateString(),
        label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        total: 0
      });
    }
    state.orders.forEach((o) => {
      const k = new Date(o.at).toDateString();
      const day = days.find((x) => x.key === k);
      if (day) day.total += Number(o.total) || 0;
    });
    const maxDay = Math.max(1, ...days.map((d) => d.total));
    dailyEl.innerHTML = days
      .map(
        (d) =>
          '<div class="report-bar-row"><span>' + esc(d.label) + '</span>' +
          '<span class="report-bar-track"><i class="report-bar-fill" style="width:' +
          Math.round((d.total / maxDay) * 100) + '%"></i></span>' +
          '<strong>' + (d.total ? money(d.total) : '—') + '</strong></div>'
      )
      .join('');

    /* metode pembayaran */
    const payTotals = {};
    orders.forEach((o) => {
      payTotals[o.payment] = (payTotals[o.payment] || 0) + (Number(o.total) || 0);
    });
    const payEntries = Object.keys(PAYMENT_LABEL)
      .map((k) => [k, payTotals[k] || 0])
      .filter(([, v]) => v > 0);
    payEl.innerHTML = payEntries.length
      ? payEntries
          .map(
            ([k, v]) =>
              '<div class="report-pay-item"><span>' + esc(PAYMENT_LABEL[k]) +
              '</span><strong>' + money(v) + '</strong></div>'
          )
          .join('')
      : '<div class="empty-note">Belum ada transaksi pada periode ini.</div>';

    /* menu terlaris */
    const itemTotals = {};
    orders.forEach((o) =>
      o.items.forEach((it) => {
        if (!itemTotals[it.name]) itemTotals[it.name] = { qty: 0, total: 0 };
        itemTotals[it.name].qty += Number(it.qty) || 0;
        itemTotals[it.name].total += (Number(it.price) || 0) * (Number(it.qty) || 0);
      })
    );
    const top = Object.keys(itemTotals)
      .map((name) => ({ name, qty: itemTotals[name].qty, total: itemTotals[name].total }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);
    topEl.innerHTML = top.length
      ? top
          .map(
            (t) =>
              '<div class="report-top-item"><span>' + esc(t.name) +
              ' <span class="pill">' + t.qty + '×</span></span>' +
              '<strong>' + money(t.total) + '</strong></div>'
          )
          .join('')
      : '<div class="empty-note">Belum ada item terjual.</div>';
  }

  const reportPeriodSelect = document.getElementById('reportPeriod');
  if (reportPeriodSelect) reportPeriodSelect.addEventListener('change', renderReport);

  const exportReportBtn = document.getElementById('exportReportBtn');
  if (exportReportBtn) {
    exportReportBtn.addEventListener('click', () => {
      const orders = reportOrders();
      if (!orders.length) {
        toast('Tidak ada data untuk diekspor', 'error');
        return;
      }
      const rows = [
        ['Kode', 'Waktu', 'Tipe', 'Pelanggan', 'Item', 'Subtotal', 'Diskon', 'Pajak', 'Total', 'Pembayaran']
      ];
      orders.forEach((o) => {
        rows.push([
          o.code,
          formatDateTime(o.at),
          TYPE_LABEL[o.type] || o.type,
          o.customer,
          o.items.map((it) => it.name + ' x' + it.qty).join('; '),
          o.subtotal,
          o.discount,
          o.tax,
          o.total,
          PAYMENT_LABEL[o.payment] || o.payment
        ]);
      });
      const csv = rows
        .map((r) => r.map((c) => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(','))
        .join('\r\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'laporan-kasir-' + new Date().toISOString().slice(0, 10) + '.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Laporan diekspor ke CSV');
    });
  }

  window.addEventListener('scroll', () => {
    el.header.classList.toggle('is-scrolled', window.scrollY > 8);
  }, { passive: true });

  /* --- Pengaturan Menu --- */
  const saveMenuBtn = document.getElementById('saveMenuBtn');
  const clearMenuBtn = document.getElementById('clearMenuBtn');
  const menuListAdmin = document.getElementById('menuListAdmin');

  function renderMenuAdmin() {
    if (!menuListAdmin) return;

    const menuData = typeof MENU !== 'undefined' ? MENU : [];
    if (!menuData.length) {
      menuListAdmin.innerHTML =
        '<div class="empty-note">Belum ada menu. Tambahkan menu pertama lewat form di atas.</div>';
      return;
    }

    menuListAdmin.innerHTML = menuData
      .map((item, idx) => {
        const stock = itemStock(item);
        const thumb = item.imageUrl
          ? '<img src="' + esc(item.imageUrl) + '" alt="' + esc(item.name) + '" class="menu-item-admin-img" />'
          : '<span class="menu-item-admin-img menu-item-admin-emoji">' + esc(item.emoji || '🍽️') + '</span>';

        return (
          '<div class="menu-item-admin">' + thumb +
          '<div class="menu-item-admin-info">' +
          '<h4>' + esc(item.name) + (item.popular ? ' 🔥' : '') + (item.isNew ? ' 🆕' : '') + '</h4>' +
          '<p>' + esc(item.desc) + '</p>' +
          '<div class="menu-item-admin-price">' + money(item.price) +
          ' <span class="pill' + (stock <= 0 ? ' is-out' : stock <= 5 ? ' is-low' : '') + '">Stok ' + stock + '</span>' +
          '</div></div>' +
          '<div class="menu-item-admin-actions">' +
          '<button type="button" data-edit="' + idx + '">Edit</button>' +
          '<button type="button" data-del="' + idx + '">Hapus</button>' +
          '</div></div>'
        );
      })
      .join('');

    menuListAdmin.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => editMenuItem(Number(btn.dataset.edit)));
    });
    menuListAdmin.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', () => deleteMenuItem(Number(btn.dataset.del)));
    });
  }

  function editMenuItem(idx) {
    const menuData = typeof MENU !== 'undefined' ? MENU : [];
    const item = menuData[idx];
    if (!item) return;

    setAdminTab('menu');
    document.getElementById('menuId').value = idx;
    document.getElementById('menuName').value = item.name;
    document.getElementById('menuDesc').value = item.desc;
    document.getElementById('menuPrice').value = item.price;
    document.getElementById('menuCat').value = item.cat;
    document.getElementById('menuEmoji').value = item.emoji || '';
    document.getElementById('menuStock').value = itemStock(item);
    document.getElementById('menuImage').value = item.imageUrl || '';
    document.getElementById('menuTag').value = item.tag || '';
    document.getElementById('menuPopular').checked = !!item.popular;
    document.getElementById('menuNew').checked = !!item.isNew;

    const form = document.querySelector('.menu-add-form');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function deleteMenuItem(idx) {
    const menuData = typeof MENU !== 'undefined' ? MENU : [];
    const item = menuData[idx];
    if (!item) return;
    if (!confirm('Hapus menu "' + item.name + '"?')) return;

    menuData.splice(idx, 1);
    persistMenu();
    renderMenuAdmin();
    renderMenu();
    renderChips();
    renderStock();
    renderDashboard();
    toast('Menu berhasil dihapus');
  }

  function clearMenuForm() {
    document.getElementById('menuId').value = '';
    document.getElementById('menuName').value = '';
    document.getElementById('menuDesc').value = '';
    document.getElementById('menuPrice').value = '';
    document.getElementById('menuEmoji').value = '';
    document.getElementById('menuStock').value = '';
    document.getElementById('menuImage').value = '';
    document.getElementById('menuTag').value = '';
    document.getElementById('menuPopular').checked = false;
    document.getElementById('menuNew').checked = false;
  }

  if (saveMenuBtn) {
    saveMenuBtn.addEventListener('click', () => {
      const idx = document.getElementById('menuId').value;
      const name = document.getElementById('menuName').value.trim();
      const price = Number(document.getElementById('menuPrice').value) || 0;

      if (!name) {
        toast('Nama menu wajib diisi', 'error');
        return;
      }
      if (price <= 0) {
        toast('Harga menu wajib diisi', 'error');
        return;
      }

      const menuData = typeof MENU !== 'undefined' ? MENU : [];
      const stockInput = document.getElementById('menuStock');
      const stock =
        stockInput && stockInput.value !== ''
          ? Math.max(0, Math.round(Number(stockInput.value) || 0))
          : 20;
      const editing = idx !== '' && menuData[Number(idx)];

      const item = {
        id: editing ? menuData[Number(idx)].id : 'menu-' + Date.now(),
        name,
        desc: document.getElementById('menuDesc').value.trim(),
        price,
        cat: document.getElementById('menuCat').value,
        emoji: document.getElementById('menuEmoji').value.trim() || '🍽️',
        tone: editing ? menuData[Number(idx)].tone || 1 : Math.floor(Math.random() * 10) + 1,
        popular: document.getElementById('menuPopular').checked,
        tag: document.getElementById('menuTag').value.trim() || undefined,
        isNew: document.getElementById('menuNew').checked,
        imageUrl: document.getElementById('menuImage').value.trim() || undefined,
        stock
      };

      if (editing) {
        menuData[Number(idx)] = item;
      } else {
        menuData.push(item);
      }

      persistMenu();
      renderMenuAdmin();
      renderMenu();
      renderChips();
      renderStock();
      renderDashboard();
      clearMenuForm();
      toast('Menu berhasil disimpan');
    });
  }

  if (clearMenuBtn) clearMenuBtn.addEventListener('click', clearMenuForm);

  /* ------------------------------- INIT ---------------------------------- */

  function loadState() {
    const menuData = typeof MENU !== 'undefined' ? MENU : [];
    const savedCart = readStorage(STORAGE.cart, {});
    if (savedCart && typeof savedCart === 'object') {
      Object.keys(savedCart).forEach((id) => {
        const entry = savedCart[id];
        const item = menuData.find((m) => m.id === id);
        const qty = Math.round(Number(entry && entry.qty));
        if (item && qty > 0) {
          state.cart[id] = { qty: clamp(qty, 1, MAX_QTY), note: String((entry.note || '')).slice(0, 80) };
        }
      });
    }

    const savedOrders = readStorage(STORAGE.orders, []);
    if (Array.isArray(savedOrders)) {
      state.orders = savedOrders.filter(
        (order) => order && order.id && Array.isArray(order.items) && order.total != null
      );
    }

    const prefs = readStorage(STORAGE.prefs, {});
    if (prefs && typeof prefs === 'object') {
      state.orderType = prefs.orderType === 'takeaway' ? 'takeaway' : 'dinein';
      state.customer = String(prefs.customer || '').slice(0, 40);
      state.table = String(prefs.table || '').replace(/\D+/g, '').slice(0, 4);
      state.promo = PROMOS[prefs.promo] ? prefs.promo : null;
    }
  }

  /* ------------------------------ PWA / INSTALASI ------------------------------ */
  function setupPWA() {
    const installBtn = document.getElementById('installAppBtn');
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (installBtn) {
      installBtn.hidden = standalone || location.protocol === 'file:';
    }

    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPrompt = event;
      if (installBtn) {
        installBtn.hidden = false;
        installBtn.dataset.installReady = 'true';
      }
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      if (installBtn) {
        installBtn.hidden = true;
        delete installBtn.dataset.installReady;
      }
      toast('Aplikasi berhasil dipasang');
    });

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          try {
            const choice = await deferredPrompt.userChoice;
            if (choice && choice.outcome === 'accepted') {
              toast('Aplikasi berhasil dipasang');
            }
          } catch (e) {}
          deferredPrompt = null;
          installBtn.hidden = true;
          delete installBtn.dataset.installReady;
          return;
        }

        if (
          window.navigator.standalone === true ||
          window.matchMedia('(display-mode: standalone)').matches
        ) {
          toast('Aplikasi sudah terpasang di perangkat ini');
          return;
        }

        if (location.protocol === 'file:') {
          toast('Buka lewat http/https (bukan file) untuk memasang aplikasi', 'error');
          return;
        }

        const ua = navigator.userAgent || '';
        const isIOS =
          /iphone|ipad|ipod/i.test(ua) ||
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        if (isIOS) {
          toast('Di iPhone/iPad: tombol Bagikan → "Tambahkan ke Layar Utama"');
        } else {
          toast('Buka menu browser → "Instal aplikasi" / "Tambahkan ke layar utama"');
        }
      });
    }

    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  function init() {
    // Muat konfigurasi kafe tersimpan
    try {
      const saved = localStorage.getItem('cafe_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        CAFE = {
          name: parsed.name || 'Kopi Senja',
          logo: parsed.logo || '☕',
          tagline: parsed.tagline || 'coffee & kitchen',
          description: parsed.description || '',
          address: parsed.address || 'Jl. Merdeka No. 24, Tolitoli',
          phone: parsed.phone || '0852-1234-5678',
          receiptNoteProcessing:
            parsed.receiptNoteProcessing || DEFAULT_RECEIPT_NOTE_PROCESSING,
          receiptNoteReady: parsed.receiptNoteReady || DEFAULT_RECEIPT_NOTE_READY
        };
      }
    } catch (e) {}

    // Pastikan setiap menu punya angka stok
    (typeof MENU !== 'undefined' ? MENU : []).forEach((m) => {
      if (typeof m.stock !== 'number' || isNaN(m.stock)) m.stock = 20;
    });

    loadState();

    el.customer.value = state.customer;
    el.table.value = state.table;
    syncOrderTypeUI();
    if (el.year) el.year.textContent = new Date().getFullYear();

    fillCafeForm();
    applyBrand();

    renderChips();
    renderMenu();
    renderOrders();
    refreshCartUI();
    renderDashboard();
    setAdminTab('cart');

    /* pulihkan sesi login */
    currentUser = readSession();
    if (currentUser) {
      hideLogin();
      applyUser();
    } else {
      showLogin();
    }

    /* jam & layar penuh */
    const clockEl = document.getElementById('clock');
    if (clockEl) {
      const tick = () => {
        const d = new Date();
        clockEl.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
      };
      tick();
      setInterval(tick, 30000);
    }

    const fullBtn = document.getElementById('btnFullscreen');
    if (fullBtn) {
      fullBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      });
    }

    setupPWA();

    el.header.classList.toggle('is-scrolled', window.scrollY > 8);

    /* segarkan status pesanan setiap 30 detik */
    setInterval(() => {
      if (state.orders.length && !anyLayerOpen()) {
        renderOrders();
        if (activeAdminTab === 'dashboard') renderDashboard();
      }
    }, 30000);
  }

  init();
})();
