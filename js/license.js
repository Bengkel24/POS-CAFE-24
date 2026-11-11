/* =========================================================
   LISENSI & TRIAL — Kopi Senja POS
   ---------------------------------------------------------
   - Masa gratis 7 hari (bisa diubah di license-config.js)
   - Kode aktivasi bulanan / lifetime / owner
   - Verifikasi offline dengan ECDSA P-256 (Web Crypto)
   ========================================================= */
(function () {
  'use strict';

  const CONFIG = window.LICENSE_CONFIG || {};
  const TRIAL_DAYS = Math.max(1, Number(CONFIG.trialDays) || 7);
  const DAY_MS = 24 * 60 * 60 * 1000;
  const STORAGE_KEY = 'kopisenja.license.v1';
  const TRIAL_COOKIE = 'kopisenja_trial_start';
  const DB_NAME = 'kopisenja-license';
  const DB_STORE = 'meta';
  const CODE_PREFIX = 'KS1-';

  let state = null;
  let status = null;
  let appInfo = { name: 'Kopi Senja', logo: '☕' };
  let checkTimer = null;
  let initialized = false;

  const el = {};

  /* ------------------------------ helpers ------------------------------ */
  function now() {
    return Date.now();
  }

  function formatRupiah(value) {
    const n = Number(value) || 0;
    try {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(n);
    } catch (e) {
      return 'Rp ' + n.toLocaleString('id-ID');
    }
  }

  function formatDate(ts) {
    if (!ts) return '-';
    try {
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date(ts));
    } catch (e) {
      return new Date(ts).toLocaleDateString('id-ID');
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeParse(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return null;
    }
  }

  function randomId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    return Array.from(bytes)
      .map(function (b) {
        return b.toString(16).padStart(2, '0');
      })
      .join('');
  }

  function base64UrlToBytes(value) {
    let str = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function bytesToBase64Url(bytes) {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  /* ------------------------------ storage ------------------------------ */
  function readState() {
    const parsed = safeParse(localStorage.getItem(STORAGE_KEY) || '');
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  }

  function writeState(force) {
    try {
      const stored = readState() || {};
      const next = Object.assign({}, stored, state);

      if (!force) {
        /* Jangan hapus lisensi yang ditulis tab lain; pakai yang paling baru. */
        if (stored.license) {
          const storedAt = Number(stored.license.activatedAt) || 0;
          const memAt = state.license ? Number(state.license.activatedAt) || 0 : -1;
          if (!state.license || storedAt > memAt) {
            next.license = stored.license;
          }
        }
        if (stored.trialStart && (!next.trialStart || stored.trialStart < next.trialStart)) {
          next.trialStart = stored.trialStart;
        }
        next.lastSeen = Math.max(
          Number(stored.lastSeen) || 0,
          Number(state.lastSeen) || 0
        );
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {}
  }

  /* --------------------- cookie & IndexedDB trial mirror --------------------- */
  function setTrialCookie(ts) {
    try {
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie =
        TRIAL_COOKIE +
        '=' +
        encodeURIComponent(String(ts)) +
        '; max-age=' +
        maxAge +
        '; path=/; SameSite=Lax';
    } catch (e) {}
  }

  function getTrialCookie() {
    try {
      const match = document.cookie.match(new RegExp('(?:^|; )' + TRIAL_COOKIE + '=([^;]*)'));
      if (!match) return 0;
      const value = Number(decodeURIComponent(match[1]));
      return Number.isFinite(value) && value > 0 ? value : 0;
    } catch (e) {
      return 0;
    }
  }

  function openDb() {
    return new Promise(function (resolve) {
      if (!window.indexedDB) return resolve(null);
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = function () {
          const db = req.result;
          if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
        };
        req.onsuccess = function () {
          resolve(req.result);
        };
        req.onerror = function () {
          resolve(null);
        };
      } catch (e) {
        resolve(null);
      }
    });
  }

  async function idbGet(key) {
    const db = await openDb();
    if (!db) return 0;
    return new Promise(function (resolve) {
      try {
        const tx = db.transaction(DB_STORE, 'readonly');
        const req = tx.objectStore(DB_STORE).get(key);
        req.onsuccess = function () {
          const value = Number(req.result);
          resolve(Number.isFinite(value) && value > 0 ? value : 0);
        };
        req.onerror = function () {
          resolve(0);
        };
      } catch (e) {
        resolve(0);
      }
    });
  }

  async function idbSet(key, value) {
    const db = await openDb();
    if (!db) return;
    try {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(value, key);
    } catch (e) {}
  }

  async function resolveTrialStart(saved) {
    const candidates = [];
    if (saved && Number(saved.trialStart) > 0) candidates.push(Number(saved.trialStart));
    const cookie = getTrialCookie();
    if (cookie > 0) candidates.push(cookie);
    const idb = await idbGet('trialStart');
    if (idb > 0) candidates.push(idb);
    if (!candidates.length) return now();
    return Math.min.apply(null, candidates);
  }

  /* ------------------------------ license code ------------------------------ */
  function normalizeCode(code) {
    return String(code || '')
      .trim()
      .replace(/\s+/g, '');
  }

  function parseCode(code) {
    const normalized = normalizeCode(code);
    if (!normalized) throw new Error('Kode aktivasi kosong.');
    if (normalized.indexOf(CODE_PREFIX) !== 0) throw new Error('Format kode tidak dikenali.');
    const rest = normalized.slice(CODE_PREFIX.length);
    const dot = rest.indexOf('.');
    if (dot <= 0 || dot === rest.length - 1) throw new Error('Format kode tidak lengkap.');
    return {
      normalized: normalized,
      payloadB64: rest.slice(0, dot),
      signatureB64: rest.slice(dot + 1)
    };
  }

  async function verifyCode(code, activatedAt) {
    if (!window.crypto || !crypto.subtle) {
      throw new Error('Browser tidak mendukung verifikasi lisensi.');
    }
    if (!CONFIG.publicKeyJwk) {
      throw new Error('Kunci publik lisensi belum diatur.');
    }
    const parsed = parseCode(code);
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      CONFIG.publicKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );
    const signature = base64UrlToBytes(parsed.signatureB64);
    const data = new TextEncoder().encode(parsed.payloadB64);
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      signature,
      data
    );
    if (!valid) throw new Error('Kode aktivasi tidak valid.');

    const payloadText = new TextDecoder().decode(base64UrlToBytes(parsed.payloadB64));
    const payload = safeParse(payloadText);
    if (!payload || typeof payload !== 'object') throw new Error('Isi kode tidak valid.');
    if (payload.v !== 1) throw new Error('Versi kode tidak didukung.');
    if (['monthly', 'lifetime', 'owner'].indexOf(payload.plan) === -1) {
      throw new Error('Jenis lisensi tidak dikenali.');
    }
    if (payload.plan === 'monthly') {
      if (typeof payload.expiresAt !== 'number' || !Number.isFinite(payload.expiresAt)) {
        throw new Error('Kode langganan tidak memiliki tanggal berakhir.');
      }
    } else if (payload.expiresAt != null) {
      throw new Error('Kode lisensi permanen tidak boleh memiliki tanggal berakhir.');
    }
    if (payload.deviceId && state && payload.deviceId !== state.deviceId) {
      throw new Error('Kode ini terikat ke perangkat lain.');
    }
    return {
      code: parsed.normalized,
      payload: payload,
      activatedAt: Number(activatedAt) || now()
    };
  }

  /* ------------------------------ status ------------------------------ */
  function evaluateStatus() {
    if (!state) {
      return { active: false, kind: 'none', plan: 'none', expiresAt: null, daysLeft: 0 };
    }

    const current = now();
    const highWater = Math.max(current, Number(state.lastSeen) || 0);
    if (highWater > (Number(state.lastSeen) || 0)) {
      state.lastSeen = highWater;
      writeState();
    }
    const effectiveNow = highWater;

    const license = state.license;
    if (license && license.payload) {
      const p = license.payload;
      if (p.plan === 'owner') {
        return {
          active: true,
          kind: 'owner',
          plan: 'owner',
          expiresAt: null,
          daysLeft: null,
          license: license
        };
      }
      if (p.plan === 'lifetime') {
        return {
          active: true,
          kind: 'lifetime',
          plan: 'lifetime',
          expiresAt: null,
          daysLeft: null,
          license: license
        };
      }
      if (p.plan === 'monthly' && typeof p.expiresAt === 'number') {
        if (p.expiresAt > effectiveNow) {
          return {
            active: true,
            kind: 'monthly',
            plan: 'monthly',
            expiresAt: p.expiresAt,
            daysLeft: Math.max(1, Math.ceil((p.expiresAt - effectiveNow) / DAY_MS)),
            license: license
          };
        }
        return {
          active: false,
          kind: 'expired',
          plan: 'monthly',
          expiresAt: p.expiresAt,
          daysLeft: 0,
          license: license
        };
      }
      return { active: false, kind: 'invalid', plan: 'none', expiresAt: null, daysLeft: 0 };
    }

    const trialEnds = Number(state.trialStart) + TRIAL_DAYS * DAY_MS;
    if (effectiveNow < trialEnds) {
      return {
        active: true,
        kind: 'trial',
        plan: 'trial',
        expiresAt: trialEnds,
        daysLeft: Math.max(1, Math.ceil((trialEnds - effectiveNow) / DAY_MS))
      };
    }
    return {
      active: false,
      kind: 'trial-expired',
      plan: 'trial',
      expiresAt: trialEnds,
      daysLeft: 0
    };
  }

  function statusText(s) {
    if (!s) return '';
    if (s.kind === 'trial') return 'Masa gratis aktif — sisa ' + s.daysLeft + ' hari';
    if (s.kind === 'monthly') {
      return (
        'Langganan aktif — berakhir ' +
        formatDate(s.expiresAt) +
        ' (' +
        s.daysLeft +
        ' hari lagi)'
      );
    }
    if (s.kind === 'lifetime') return 'Lisensi lifetime aktif — tanpa batas waktu';
    if (s.kind === 'owner') return 'Mode owner aktif — bebas digunakan';
    if (s.kind === 'expired') return 'Langganan berakhir pada ' + formatDate(s.expiresAt);
    if (s.kind === 'trial-expired') return 'Masa gratis ' + TRIAL_DAYS + ' hari telah berakhir';
    return 'Lisensi belum aktif';
  }

  /* ------------------------------ UI ------------------------------ */
  function cacheElements() {
    el.screen = document.getElementById('licenseScreen');
    el.close = document.getElementById('licenseCloseBtn');
    el.status = document.getElementById('licenseStatus');
    el.statusText = document.getElementById('licenseStatusText');
    el.statusBadge = document.getElementById('licenseStatusBadge');
    el.sub = document.getElementById('licenseSub');
    el.title = document.getElementById('licenseTitle');
    el.logo = document.getElementById('licenseLogo');
    el.priceMonthly = document.getElementById('licensePriceMonthly');
    el.priceLifetime = document.getElementById('licensePriceLifetime');
    el.bankName = document.getElementById('licenseBankName');
    el.bankAccount = document.getElementById('licenseBankAccount');
    el.bankHolder = document.getElementById('licenseBankHolder');
    el.whatsapp = document.getElementById('licenseWhatsapp');
    el.contact = document.getElementById('licenseContact');
    el.qris = document.getElementById('licenseQris');
    el.qrisFallback = document.getElementById('licenseQrisFallback');
    el.input = document.getElementById('licenseCodeInput');
    el.activate = document.getElementById('licenseActivateBtn');
    el.message = document.getElementById('licenseMessage');
    el.device = document.getElementById('licenseDeviceId');
    el.copyDevice = document.getElementById('licenseCopyDevice');
    el.loginStatus = document.getElementById('loginLicenseStatus');
    el.loginBtn = document.getElementById('loginLicenseBtn');
    el.loginScreen = document.getElementById('loginScreen');
    el.adminStatus = document.getElementById('adminLicenseStatus');
    el.adminBtn = document.getElementById('adminLicenseBtn');
    el.top = document.querySelector('.pos-top');
    el.main = document.querySelector('.pos-main');
  }

  function fillStaticContent() {
    if (el.logo) el.logo.textContent = appInfo.logo || '☕';
    if (el.title) {
      el.title.innerHTML =
        'Aktifkan <em>' + escapeHtml(appInfo.name || 'Kopi Senja') + '</em>';
    }

    const prices = CONFIG.prices || {};
    if (el.priceMonthly) {
      el.priceMonthly.innerHTML = formatRupiah(prices.monthly) + ' <span>/ bulan</span>';
    }
    if (el.priceLifetime) {
      el.priceLifetime.textContent = formatRupiah(prices.lifetime);
    }

    const pay = CONFIG.payment || {};
    if (el.bankName) el.bankName.textContent = pay.bankName || '-';
    if (el.bankAccount) el.bankAccount.textContent = pay.bankAccount || '-';
    if (el.bankHolder) el.bankHolder.textContent = pay.bankHolder || '-';
    if (el.whatsapp) {
      const wa = pay.whatsapp || '-';
      const digits = String(pay.whatsapp || '').replace(/\D+/g, '');
      if (digits) {
        el.whatsapp.innerHTML =
          '<a href="https://wa.me/' +
          digits +
          '" target="_blank" rel="noopener">' +
          escapeHtml(wa) +
          '</a>';
      } else {
        el.whatsapp.textContent = wa;
      }
    }
    if (el.contact) {
      el.contact.textContent = pay.whatsapp || pay.email || '-';
    }
    if (el.qris) {
      el.qris.onerror = function () {
        this.style.display = 'none';
        if (el.qrisFallback) el.qrisFallback.hidden = false;
      };
      if (pay.qrisImage) {
        el.qris.src = pay.qrisImage;
        el.qris.hidden = false;
        if (el.qrisFallback) el.qrisFallback.hidden = true;
      } else {
        el.qris.hidden = true;
        if (el.qrisFallback) el.qrisFallback.hidden = false;
      }
    }
    if (el.device && state) el.device.textContent = state.deviceId;
  }

  function renderStatus() {
    status = evaluateStatus();
    const text = statusText(status);

    if (el.statusText) el.statusText.textContent = text;
    if (el.statusBadge) {
      el.statusBadge.textContent = status.active
        ? status.kind === 'trial'
          ? 'Trial'
          : status.kind === 'owner'
            ? 'Owner'
            : 'Aktif'
        : 'Tidak aktif';
      el.statusBadge.className =
        'license-badge' + (status.active ? ' is-active' : ' is-inactive');
    }
    if (el.status) el.status.classList.toggle('is-inactive', !status.active);
    if (el.sub) {
      el.sub.textContent = status.active
        ? 'Terima kasih sudah menggunakan ' + (appInfo.name || 'Kopi Senja') + '.'
        : 'Masa gratis sudah berakhir. Pilih paket di bawah untuk melanjutkan.';
    }
    if (el.loginStatus) el.loginStatus.textContent = text;
    if (el.adminStatus) el.adminStatus.textContent = text;

    const blocking = !status.active;
    if (el.screen) el.screen.classList.toggle('is-blocking', blocking);
    if (el.close) el.close.hidden = blocking;
    if (el.device && state) el.device.textContent = state.deviceId;

    /* Kunci interaksi layar di belakang saat lisensi tidak aktif. */
    if (blocking) {
      if (el.loginScreen) el.loginScreen.inert = true;
      if (el.top) el.top.inert = true;
      if (el.main) el.main.inert = true;
    } else {
      if (el.loginScreen) el.loginScreen.inert = false;
      const loginOpen = el.loginScreen && el.loginScreen.classList.contains('is-open');
      if (!loginOpen) {
        if (el.top) el.top.inert = false;
        if (el.main) el.main.inert = false;
      }
    }

    return status;
  }

  function show(options) {
    if (!el.screen) return;
    const blocking = options && options.blocking != null ? !!options.blocking : !status.active;
    el.screen.hidden = false;
    el.screen.classList.add('is-open');
    el.screen.classList.toggle('is-blocking', blocking);
    if (el.close) el.close.hidden = blocking;
    if (el.input) {
      el.input.value = '';
      setTimeout(function () {
        try {
          el.input.focus();
        } catch (e) {}
      }, 250);
    }
    if (el.message) {
      el.message.textContent = '';
      el.message.className = 'license-message';
    }
    if (el.screen.scrollTop != null) el.screen.scrollTop = 0;
    setTimeout(function () {
      if (el.screen && !el.screen.hidden) el.screen.scrollTop = 0;
    }, 120);
  }

  function hide() {
    if (!el.screen) return;
    el.screen.classList.remove('is-open');
    el.screen.hidden = true;
  }

  function showMessage(text, type) {
    if (!el.message) return;
    el.message.textContent = text;
    el.message.className =
      'license-message' +
      (type === 'error' ? ' is-error' : type === 'success' ? ' is-success' : '');
  }

  function dispatch(message, type) {
    try {
      window.dispatchEvent(
        new CustomEvent('kopisenja:license', {
          detail: { message: message || '', type: type || '', status: status }
        })
      );
    } catch (e) {}
  }

  async function activate(rawCode) {
    if (!state) return false;
    const code = normalizeCode(rawCode);
    if (!code) {
      showMessage('Masukkan kode aktivasi terlebih dahulu.', 'error');
      return false;
    }
    if (el.activate) {
      el.activate.disabled = true;
      el.activate.textContent = 'Memeriksa…';
    }
    try {
      const license = await verifyCode(code);
      const payload = license.payload;
      const effectiveNow = Math.max(now(), Number(state.lastSeen) || 0);
      if (payload.plan === 'monthly' && payload.expiresAt <= effectiveNow) {
        showMessage(
          'Kode valid, tetapi masa berlakunya sudah habis. Lisensi saat ini tidak diubah.',
          'error'
        );
        dispatch('Kode lisensi sudah kedaluwarsa.', 'error');
        return false;
      }
      state.license = license;
      state.lastSeen = now();
      writeState();
      const next = renderStatus();
      if (next.active) {
        showMessage('Kode berhasil diaktifkan. Selamat menggunakan!', 'success');
        dispatch('Lisensi berhasil diaktifkan.', 'success');
        setTimeout(function () {
          if (status && status.active) hide();
        }, 900);
      } else {
        showMessage('Kode valid, tetapi tidak dapat diaktifkan.', 'error');
        dispatch('Kode lisensi tidak dapat diaktifkan.', 'error');
      }
      return true;
    } catch (error) {
      const message =
        error && error.message ? error.message : 'Kode aktivasi tidak valid.';
      showMessage(message, 'error');
      dispatch(message, 'error');
      return false;
    } finally {
      if (el.activate) {
        el.activate.disabled = false;
        el.activate.textContent = 'Aktifkan';
      }
    }
  }

  function bindEvents() {
    if (el.activate) {
      el.activate.addEventListener('click', function () {
        activate(el.input ? el.input.value : '');
      });
    }
    if (el.input) {
      el.input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          activate(el.input.value);
        }
      });
    }
    if (el.close) {
      el.close.addEventListener('click', function () {
        if (status && status.active) hide();
      });
    }
    if (el.loginBtn) {
      el.loginBtn.addEventListener('click', function () {
        show();
      });
    }
    if (el.adminBtn) {
      el.adminBtn.addEventListener('click', function () {
        show();
      });
    }
    if (el.copyDevice) {
      el.copyDevice.addEventListener('click', async function () {
        const text = state ? state.deviceId : '';
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
          showMessage('Kode perangkat disalin.', 'success');
        } catch (e) {
          if (el.device) {
            const range = document.createRange();
            range.selectNodeContents(el.device);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            showMessage('Tekan Ctrl+C untuk menyalin kode perangkat.', '');
          }
        }
      });
    }

    /* Sinkronkan lisensi antar tab: tab lain bisa mengaktifkan lisensi. */
    window.addEventListener('storage', function (event) {
      if (event.key !== STORAGE_KEY) return;
      const stored = readState();
      if (!stored) return;

      let changed = false;
      if (stored.trialStart && (!state.trialStart || stored.trialStart < state.trialStart)) {
        state.trialStart = stored.trialStart;
        changed = true;
      }

      if (stored.license && stored.license.code) {
        if (!state.license || state.license.code !== stored.license.code) {
          verifyCode(stored.license.code, stored.license.activatedAt)
            .then(function (verified) {
              state.license = verified;
              const next = renderStatus();
              if (next.active) hide();
              else show({ blocking: true });
            })
            .catch(function () {});
          return;
        }
      }

      if (changed) {
        const next = renderStatus();
        if (next.active) hide();
        else show({ blocking: true });
      }
    });
  }

  function startTimer() {
    if (checkTimer) clearInterval(checkTimer);
    checkTimer = setInterval(function () {
      const previous = status;
      const next = renderStatus();
      if (previous && previous.active !== next.active) {
        if (next.active) {
          dispatch('Lisensi aktif.', 'success');
        } else {
          dispatch('Masa lisensi berakhir. Silakan perpanjang.', 'error');
          show({ blocking: true });
        }
      }
    }, 60000);
  }

  async function init(options) {
    if (initialized) {
      renderStatus();
      if (status && status.active) hide();
      else show({ blocking: true });
      return status;
    }
    initialized = true;
    appInfo = {
      name: (options && options.appName) || 'Kopi Senja',
      logo: (options && options.logo) || '☕'
    };

    state = readState() || {};
    state.trialStart = await resolveTrialStart(state);
    state.deviceId = state.deviceId || randomId();
    state.lastSeen = Number(state.lastSeen) || now();

    setTrialCookie(state.trialStart);
    idbSet('trialStart', state.trialStart);
    writeState();

    /* Verifikasi ulang kode yang tersimpan (deteksi manipulasi localStorage). */
    if (state.license && state.license.code) {
      let licenseValid = false;
      try {
        state.license = await verifyCode(state.license.code, state.license.activatedAt);
        licenseValid = true;
      } catch (e) {
        state.license = null;
      }
      writeState(!licenseValid);
    }

    cacheElements();
    fillStaticContent();
    bindEvents();
    const next = renderStatus();
    if (next.active) hide();
    else show({ blocking: true });
    startTimer();
    return next;
  }

  function open() {
    if (!el.screen) return;
    const next = renderStatus();
    show({ blocking: !next.active });
  }

  function getStatus() {
    if (!status) status = evaluateStatus();
    return status;
  }

  window.KopisenjaLicense = {
    init: init,
    open: open,
    getStatus: getStatus,
    activate: activate
  };
})();
