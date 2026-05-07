window.SentinelGuestFlow = (() => {
  const STORAGE_KEYS = {
    params: 'sentinel_guest_params_v2',
    cart: 'sentinel_guest_cart_v2',
    applicant: 'sentinel_guest_applicant_v2',
    payment: 'sentinel_guest_payment_v2',
    complete: 'sentinel_guest_complete_v2',
    uiLang: 'sentinel_guest_lang',
    uiLangInit: 'sentinel_guest_lang_init_v2',
    uiLangSessionChosen: 'sentinel_guest_lang_session_chosen'
  };

  const UI_I18N = {
    ja: {
      guestUnset: 'ゲスト名未設定',
      footerFaq: 'よくある質問',
      footerTerms: '利用規約',
      footerPrivacy: 'プライバシーポリシー',
      footerContact: 'お問い合わせ',
      footerTokushoho: '特定商取引法に基づく表記',
      progress: [
        'Step1 顧客情報入力',
        'Step2 お支払い方法選択',
        'Step3 ご注文最終確認',
        'Step4 購入完了'
      ]
    },
    en: {
      guestUnset: 'Guest name not set',
      footerFaq: 'FAQ',
      footerTerms: 'Terms',
      footerPrivacy: 'Privacy',
      footerContact: 'Contact',
      footerTokushoho: 'Legal notice (Japan)',
      progress: [
        'Step 1 Your details',
        'Step 2 Payment',
        'Step 3 Confirm',
        'Step 4 Complete'
      ]
    }
  };

  const EN_TEXT_MAP = {
    'お部屋詳細 - HAVEN': 'Room Details - HAVEN',
    '予約内容確認 - HAVEN': 'Reservation Summary - HAVEN',
    'お支払い方法選択 - HAVEN': 'Payment Method - HAVEN',
    'ご注文最終確認 - HAVEN': 'Final Order Review - HAVEN',
    '購入完了 - HAVEN': 'Purchase Complete - HAVEN',
    'ご予約一覧 - HAVEN': 'My Reservations - HAVEN',
    '申込情報入力 - HAVEN': 'Applicant Information - HAVEN',
    'お支払い - HAVEN': 'Payment - HAVEN',
    '予約確認 - HAVEN': 'Reservation confirmation - HAVEN',
    '予約完了 - HAVEN': 'Reservation complete - HAVEN',
    'LINE起動中 - HAVEN': 'Opening LINE - HAVEN',
    'チェックイン処理中 - HAVEN': 'Processing check-in - HAVEN',
    'メニュー - HAVEN': 'Menu - HAVEN',
    'LINEダッシュボード - HAVEN': 'LINE dashboard - HAVEN',
    'ご予約詳細 - HAVEN': 'Reservation detail - HAVEN',
    '共有されたご予約 - HAVEN': 'Shared reservation - HAVEN',
    '施設案内 - HAVEN': 'Facility guide - HAVEN',
    'HAVEN 宿泊予約': 'HAVEN stay booking',
    'HAVEN GUEST RESERVATION': 'HAVEN guest reservation',
    '静かな滞在を、スマートに。': 'A quiet stay, made smart.',
    '予約から決済まで最短数分。': 'From booking to payment in minutes.',
    '宿泊プランのご案内': 'Stay Plan Overview',
    'お部屋選択からお支払いまで、かんたんなステップでご案内します。': 'From room selection to payment, complete your booking in simple steps.',
    '税込 / 1予約あたり': 'Tax included / per booking',
    '税込': 'Tax included',
    'チェックイン日・チェックアウト日を選択してください。': 'Please select check-in and check-out dates.',
    'チェックイン日': 'Check-in date',
    'チェックアウト日': 'Check-out date',
    'チェックイン時刻': 'Check-in time',
    'チェックアウト時刻': 'Check-out time',
    'この時間帯のみ入室用QRコードが有効です。': 'Entry QR is valid only during this time window.',
    'ご宿泊料金': 'Room rate',
    'ご宿泊人数を選択してください。': 'Please choose the number of guests.',
    '人数に合うお部屋だけ選択できます。': 'Only rooms matching your guest count can be selected.',
    '在庫確認中...': 'Checking availability...',
    'お部屋アメニティ': 'Room amenities',
    '選択中のお部屋設備': 'Amenities for selected room',
    '予約内容を確認する': 'Review reservation details',
    '購入前のご確認': 'Before you continue',
    '以下の規約に同意のうえ、予約手続きへ進んでください。': 'Please agree to the terms below before continuing.',
    '・予約は決済完了時点で成立します。': '- Reservation is confirmed when payment is completed.',
    '・購入後は注文番号をもとに確認を行います。': '- After purchase, use your order number for inquiries.',
    '・共有済みの宿泊QRは元の予約者側では利用できません。': '- Shared stay QR can no longer be used by the original booker.',
    '個人情報保護方針および利用規約に同意します。': 'I agree to the privacy policy and terms of use.',
    '閉じる': 'Close',
    '予約へ進む': 'Continue booking',
    '予約内容を追加しました': 'Reservation details added',
    '※事前予約は確定していません': '* Pre-reservation is not finalized yet',
    'お部屋': 'Room',
    'ご宿泊人数': 'Guests',
    '合計金額': 'Total',
    'お部屋選択へ戻る': 'Back to room selection',
    '小計': 'Subtotal',
    '合計': 'Total',
    'ご案内: 現在この予約フローでは追加割引はありません。': 'Note: No additional discounts are available in this booking flow.',
    'ご予約内容': 'Reservation details',
    '空室状況により、予約手続き中にご案内内容が変動する場合があります。': 'Details may change during checkout depending on room availability.',
    '割引コード': 'Discount code',
    '割引コードを入力': 'Enter discount code',
    '使う': 'Apply',
    'お支払い方法': 'Payment method',
    'カード支払い': 'Card payment',
    'Stripe Elements を利用した安全な決済です。': 'Secure payment powered by Stripe Elements.',
    'カード名義人': 'Cardholder name',
    'セキュリティコードとは？': 'What is the security code?',
    '案内を見る': 'Learn more',
    '別途払い': 'Pay later',
    '現在準備中です。': 'Currently unavailable.',
    'お請求先情報': 'Billing information',
    '登録済みの会員情報を利用する': 'Use registered member information',
    '携帯電話番号': 'Mobile phone',
    'メールアドレス': 'Email',
    '利用上の注意': 'Notes',
    'ご本人様名義のカードをご利用ください。': 'Please use a card under your own name.',
    '個人情報保護方針の内容に同意します': 'I agree to the privacy policy.',
    'カード情報を保存する': 'Save card details',
    '最終確認へ進む': 'Proceed to final review',
    'ご注文最終確認': 'Final order review',
    '割引前価格': 'Price before discount',
    '注文合計': 'Order total',
    'ご案内: ご購入後は注文番号で照会できます。': 'Note: After purchase, you can check details by order number.',
    'ご予約のお部屋': 'Reserved room',
    '予約内容へ戻る': 'Back to reservation summary',
    '申込者情報': 'Applicant information',
    '変更': 'Edit',
    'お支払いカード情報': 'Payment card information',
    '注文確定': 'Place order',
    'ご注文受付が完了しました': 'Your order has been completed',
    'この度はご注文ありがとうございました。確認メールを送信しましたので、ご確認ください。': 'Thank you for your order. A confirmation email has been sent.',
    '確認メールが無い場合はメールアドレスが間違っている可能性があります。その場合はお問い合わせ、またはご予約一覧から注文内容をご確認ください。': 'If you did not receive the confirmation email, your email address may be incorrect. Please contact support or check your reservation list.',
    '注文番号': 'Order number',
    '確認中...': 'Checking...',
    'ご利用の際は、ご予約一覧から入室用QRコードをスタッフにご提示ください。': 'When you arrive, please show the entry QR code from your reservation list.',
    'QR生成中...': 'Generating QR...',
    'ご予約一覧へ': 'Go to reservations',
    'トップへ戻る': 'Back to top',
    'ご予約一覧': 'My reservations',
    'ご予約詳細': 'Reservation details',
    '入室用QRコード': 'Entry QR code',
    '読み込み中...': 'Loading...',
    '廃棄禁止': 'Do not discard',
    'ご同行者への共有': 'Share with companion',
    '✉ メールで共有する': 'Share by email',
    'LINEで共有する': 'Share via LINE',
    '🔗 URLを共有する': 'Share URL',
    '戻る': 'Back',
    '共有先入力': 'Enter sharing destination',
    '閉じる': 'Close',
    '共有メールを送信': 'Send sharing email',
    'ご予約内容': 'Reservation details',
    'ご予約内容、ご利用条件、注意事項を確認できます。': 'Review reservation details, usage conditions, and notes.',
    '注意事項': 'Important notes',
    '共有済みの入室QRは元の予約者から利用できません。': 'A shared entry QR can no longer be used by the original reserver.',
    'キャンセルポリシー': 'Cancellation policy',
    'キャンセルは別途お問い合わせください。': 'For cancellation, please contact support separately.',
    '年絞り込み': 'Filter by year',
    'ご利用前': 'Upcoming',
    'ご利用後': 'Used',
    'すべて': 'All',
    '宿泊予約トップへ戻る': 'Back to booking top',
    'マイページへ戻る': 'Back to my page',
    '表示できるご予約情報がありません。': 'No reservations to display.',
    'お問い合わせ': 'Contact',
    'メニューに戻る': 'Back to menu',
    'お問い合わせの流れ': 'Contact flow',
    'お問い合わせテンプレート': 'Inquiry template',
    'よくある質問集': 'Frequently Asked Questions',
    '新規予約': 'New booking',
    'ゲストメニュー': 'Guest menu',
    '入室リンクを開く': 'Open entry link',
    '開く': 'Open',
    '特定商取引法に基づく表記': 'Specified Commercial Transactions Act disclosure'
  };

  const ROOM_CATALOG = {
    '101': { unit: '101', name: 'スタンダードルーム', price: 8000, area: '本館', maxGuests: 2, amenities: ['ドライヤー', '充電器', 'Wi-Fi', 'バスタオル', '歯ブラシ'] },
    '102': { unit: '102', name: 'スタンダードルーム', price: 8000, area: '本館', maxGuests: 2, amenities: ['ドライヤー', '充電器', 'Wi-Fi', 'バスタオル', '歯ブラシ'] },
    '201': { unit: '201', name: 'デラックスルーム', price: 12000, area: '高層階', maxGuests: 4, amenities: ['ドライヤー', '充電器', 'Wi-Fi', 'バスタオル', '歯ブラシ', '冷蔵庫', '電子レンジ'] },
    '202': { unit: '202', name: 'デラックスルーム', price: 12000, area: '高層階', maxGuests: 4, amenities: ['ドライヤー', '充電器', 'Wi-Fi', 'バスタオル', '歯ブラシ', '冷蔵庫', '電子レンジ'] }
  };

  const FALLBACK_EMAIL = 'guest@example.com';

  function parseSearch(search) {
    return Object.fromEntries(new URLSearchParams(search || window.location.search).entries());
  }

  function readJson(key, fallback) {
    try {
      const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (_error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    const raw = JSON.stringify(value);
    sessionStorage.setItem(key, raw);
    try {
      localStorage.setItem(key, raw);
    } catch (_error) {
      // Ignore quota errors for compatibility.
    }
    return value;
  }

  function sanitizeDigits(value) {
    return String(value || '')
      .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
      .replace(/\D/g, '');
  }

  function formatMoney(value) {
    return '¥' + Number(value || 0).toLocaleString('ja-JP');
  }

  function formatDateJP(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  }

  function nightsBetween(checkin, checkout) {
    if (!checkin || !checkout) return 0;
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diff = Math.round((end - start) / 86400000);
    return diff > 0 ? diff : 0;
  }

  function calculateStayTotal(unitPrice, checkin, checkout, quantity) {
    const nights = Math.max(1, nightsBetween(checkin, checkout) || 1);
    const qty = Math.max(1, Number(quantity || 1));
    return Math.round(Number(unitPrice || 0) * nights * qty);
  }

  function getSavedParams() {
    const fromSession = readJson(STORAGE_KEYS.params, null);
    if (fromSession && typeof fromSession === 'object') return fromSession;

    const legacyRaw = sessionStorage.getItem('sentinel_reservation_draft') || localStorage.getItem('sentinel_reservation_draft');
    if (!legacyRaw) return {};
    const legacyParams = Object.fromEntries(new URLSearchParams(legacyRaw).entries());
    return normalizeParams(legacyParams);
  }

  function normalizeParams(source = {}) {
    const params = { ...source };
    const unit = String(params.unit || '101').trim();
    const room = ROOM_CATALOG[unit] || ROOM_CATALOG['101'];
    const checkin = String(params.checkin || '').trim();
    const checkout = String(params.checkout || '').trim();
    const checkin_time = String(params.checkin_time || params.checkinTime || '15:00').trim() || '15:00';
    const checkout_time = String(params.checkout_time || params.checkoutTime || '10:00').trim() || '10:00';
    const quantity = Math.max(1, Number(params.quantity || 1));
    const total = calculateStayTotal(room.price, checkin, checkout, quantity);
    return {
      guest: String(params.guest || '').trim(),
      email: String(params.email || '').trim(),
      phone: sanitizeDigits(params.phone_digits || params.phone || ''),
      checkin,
      checkin_time,
      checkout,
      checkout_time,
      unit: room.unit,
      total,
      quantity,
      line_user_id: String(params.line_user_id || '').trim()
    };
  }

  function getParams() {
    const saved = getSavedParams();
    const query = parseSearch();
    const hasSavedDraft = Boolean(
      saved &&
      (saved.checkin || saved.checkout || saved.unit || saved.guest || saved.email || saved.phone)
    );
    const merged = normalizeParams(
      hasSavedDraft
        ? { ...query, ...saved }
        : { ...saved, ...query }
    );
    persistParams(merged);
    return merged;
  }

  function persistParams(params) {
    const normalized = normalizeParams(params);
    writeJson(STORAGE_KEYS.params, normalized);
    const query = new URLSearchParams({
      guest: normalized.guest,
      email: normalized.email,
      phone: normalized.phone,
      phone_digits: normalized.phone,
      checkin: normalized.checkin,
      checkin_time: normalized.checkin_time,
      checkout: normalized.checkout,
      checkout_time: normalized.checkout_time,
      unit: normalized.unit,
      total: String(normalized.total),
      quantity: String(normalized.quantity),
      line_user_id: normalized.line_user_id
    });
    sessionStorage.setItem('sentinel_reservation_draft', query.toString());
    try {
      localStorage.setItem('sentinel_reservation_draft', query.toString());
    } catch (_error) {
      // Ignore storage quota issues.
    }
    return normalized;
  }

  function getRoom(unit) {
    return ROOM_CATALOG[String(unit || '101').trim()] || ROOM_CATALOG['101'];
  }

  function buildCartItem(params = getParams(), quantityOverride) {
    const room = getRoom(params.unit);
    const quantity = Math.max(1, Number(quantityOverride || params.quantity || 1));
    const total = calculateStayTotal(room.price, params.checkin, params.checkout, quantity);
    return {
      id: `room-${room.unit}`,
      unit: room.unit,
      name: `${room.name}`,
      area: room.area,
      quantity,
      guest: params.guest,
      email: params.email || FALLBACK_EMAIL,
      phone: params.phone,
      checkin: params.checkin,
      checkin_time: params.checkin_time,
      checkout: params.checkout,
      checkout_time: params.checkout_time,
      total,
      unitPrice: Math.round(total / Math.max(1, quantity))
    };
  }

  function getCart() {
    const state = readJson(STORAGE_KEYS.cart, null);
    if (state && Array.isArray(state.items)) return state;
    return { items: [] };
  }

  function setCart(state) {
    return writeJson(STORAGE_KEYS.cart, state);
  }

  function cartCount() {
    return getCart().items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }

  function cartTotal() {
    return getCart().items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  }

  function addToCart(item) {
    const next = { items: [item] };
    setCart(next);
    persistParams({
      ...getParams(),
      quantity: item.quantity,
      total: item.total,
      unit: item.unit
    });
    return next;
  }

  function updateCartQuantity(quantity) {
    const cart = getCart();
    if (!cart.items.length) return cart;
    const item = cart.items[0];
    const nextQuantity = Math.max(1, Number(quantity || 1));
    const base = getParams();
    addToCart(buildCartItem({ ...base, unit: item.unit }, nextQuantity));
    return getCart();
  }

  function removeCartItem() {
    return setCart({ items: [] });
  }

  function getApplicant() {
    return readJson(STORAGE_KEYS.applicant, {});
  }

  function setApplicant(value) {
    return writeJson(STORAGE_KEYS.applicant, value);
  }

  function getPaymentDraft() {
    return readJson(STORAGE_KEYS.payment, {});
  }

  function setPaymentDraft(value) {
    return writeJson(STORAGE_KEYS.payment, value);
  }

  function getCompleteState() {
    return readJson(STORAGE_KEYS.complete, {});
  }

  function setCompleteState(value) {
    return writeJson(STORAGE_KEYS.complete, value);
  }

  function buildQuery(extra = {}) {
    const params = persistParams({ ...getParams(), ...extra });
    return new URLSearchParams({
      guest: params.guest,
      email: params.email,
      phone: params.phone,
      phone_digits: params.phone,
      checkin: params.checkin,
      checkin_time: params.checkin_time,
      checkout: params.checkout,
      checkout_time: params.checkout_time,
      unit: params.unit,
      total: String(params.total),
      quantity: String(params.quantity),
      line_user_id: params.line_user_id
    }).toString();
  }

  function buildUrl(path, extra = {}) {
    const query = new URLSearchParams(buildQuery(extra));
    Object.entries(extra || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || query.has(key)) return;
      query.set(key, String(value));
    });
    return `${path}?${query.toString()}`;
  }

  function getUiLang() {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.uiLang);
      if (v === 'en') return 'en';
      if (v === 'ja') return 'ja';
      return 'ja';
    } catch (_error) {
      return 'ja';
    }
  }

  function setUiLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEYS.uiLang, lang === 'en' ? 'en' : 'ja');
      sessionStorage.setItem(STORAGE_KEYS.uiLangSessionChosen, '1');
    } catch (_error) {
      // Ignore storage failures (private mode / quota).
    }
  }

  function uiStrings() {
    const lang = getUiLang();
    return UI_I18N[lang] || UI_I18N.ja;
  }

  function getOriginalTextStore() {
    if (typeof window === 'undefined') return null;
    if (!window.__sentinelOriginalTextStore) {
      window.__sentinelOriginalTextStore = { nodes: new WeakMap(), placeholders: new WeakMap() };
    }
    return window.__sentinelOriginalTextStore;
  }

  function applyPageTextLanguage(lang) {
    if (typeof document === 'undefined' || !document.body) return;
    const store = getOriginalTextStore();
    if (!store) return;
    const isEn = lang === 'en';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (!store.nodes.has(node)) store.nodes.set(node, node.nodeValue || '');
      const original = store.nodes.get(node) || '';
      if (isEn) {
        const trimmed = original.trim();
        const mapped = EN_TEXT_MAP[trimmed];
        if (mapped) node.nodeValue = original.replace(trimmed, mapped);
        else node.nodeValue = original;
      } else {
        node.nodeValue = original;
      }
      node = walker.nextNode();
    }

    document.querySelectorAll('[placeholder]').forEach((el) => {
      if (!store.placeholders.has(el)) store.placeholders.set(el, el.getAttribute('placeholder') || '');
      const original = store.placeholders.get(el) || '';
      if (!isEn) {
        el.setAttribute('placeholder', original);
        return;
      }
      const mapped = EN_TEXT_MAP[original.trim()];
      el.setAttribute('placeholder', mapped || original);
    });

    const title = document.title || '';
    if (!window.__sentinelOriginalTitle) window.__sentinelOriginalTitle = title;
    if (isEn) {
      const mappedTitle = EN_TEXT_MAP[window.__sentinelOriginalTitle] || window.__sentinelOriginalTitle;
      document.title = mappedTitle;
    } else {
      document.title = window.__sentinelOriginalTitle;
    }
  }

  function ensureUiLangDefaulted() {
    try {
      // Default to Japanese for each new session until user explicitly selects a language.
      if (sessionStorage.getItem(STORAGE_KEYS.uiLangSessionChosen) !== '1') {
        localStorage.setItem(STORAGE_KEYS.uiLang, 'ja');
      }
      // One-time migration key kept for compatibility with older builds.
      if (localStorage.getItem(STORAGE_KEYS.uiLangInit) !== '1') {
        localStorage.setItem(STORAGE_KEYS.uiLangInit, '1');
      }
      if (localStorage.getItem(STORAGE_KEYS.uiLang) === null) {
        localStorage.setItem(STORAGE_KEYS.uiLang, 'ja');
      }
    } catch (_error) {
      // Ignore.
    }
  }

  function detectProgressStep() {
    const slot = document.getElementById('progress-slot');
    if (!slot) return 0;
    const active = slot.querySelector('.progress-step.is-active');
    if (active) return Number(active.getAttribute('data-progress-step')) || 0;
    const steps = slot.querySelectorAll('.progress-step');
    if (!steps.length) return 0;
    const done = slot.querySelectorAll('.progress-step.is-done').length;
    if (done) return Math.min(done + 1, steps.length);
    return 1;
  }

  function refreshSharedUiAfterLangChange() {
    const lang = getUiLang();
    try {
      document.documentElement.lang = lang === 'en' ? 'en' : 'ja';
    } catch (_e) {
      // Ignore.
    }
    const footerEl = document.getElementById('footer-slot');
    if (footerEl) footerEl.innerHTML = renderFooter();
    const ps = document.getElementById('progress-slot');
    let step = 0;
    if (ps) {
      step = detectProgressStep();
      if (step > 0) ps.innerHTML = renderProgress(step);
    }
    hydrateChrome({ progressStep: step, title: document.title || '' });
    applyPageTextLanguage(lang);
  }

  function ensureLangSwitcher() {
    ensureUiLangDefaulted();
    document.querySelectorAll('.topbar-actions').forEach((bar) => {
      let wrap = bar.querySelector('[data-lang-switcher]');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.setAttribute('data-lang-switcher', '');
        wrap.className = 'lang-switcher';
        wrap.innerHTML = `
          <label class="visually-hidden" for="lang-select">Language</label>
          <select id="lang-select" class="select lang-select-top" aria-label="表示言語">
            <option value="ja">JP</option>
            <option value="en">EN</option>
          </select>
        `;
        const cartLink = bar.querySelector('a[href*="cart.html"]');
        if (cartLink) bar.insertBefore(wrap, cartLink);
        else bar.prepend(wrap);
        const sel = wrap.querySelector('#lang-select');
        if (sel) {
          sel.addEventListener('change', () => {
            setUiLang(sel.value);
            window.dispatchEvent(new CustomEvent('sentinel:langchange', { detail: { lang: getUiLang() } }));
          });
        }
      }
      const sel = wrap.querySelector('#lang-select');
      if (sel) sel.value = getUiLang();
    });
  }

  function hydrateChrome({ progressStep = 0, title = '' } = {}) {
    ensureLangSwitcher();
    document.querySelectorAll('[data-cart-count]').forEach((node) => {
      node.textContent = String(cartCount());
      node.classList.toggle('hidden', cartCount() <= 0);
    });

    const params = getParams();
    const guestBar = document.querySelector('[data-guest-strip]');
    if (guestBar) {
      const t = uiStrings();
      const guestName = params.guest || t.guestUnset;
      const guestEmail = params.email || getApplicant().email || FALLBACK_EMAIL;
      guestBar.innerHTML = `<strong>${guestName}</strong><div>${guestEmail}</div>`;
    }

    if (title) document.title = title;

    document.querySelectorAll('[data-progress-step]').forEach((node) => {
      const index = Number(node.getAttribute('data-progress-step'));
      node.classList.remove('is-active', 'is-done');
      if (progressStep > 0 && index < progressStep) node.classList.add('is-done');
      if (progressStep > 0 && index === progressStep) node.classList.add('is-active');
    });

    try {
      document.documentElement.lang = getUiLang() === 'en' ? 'en' : 'ja';
    } catch (_e) {
      // Ignore.
    }
    applyPageTextLanguage(getUiLang());
  }

  function renderFooter() {
    const t = uiStrings();
    return `
      <div class="footer-links">
        <a href="support.html">${t.footerFaq}</a>
        <a href="support.html#terms">${t.footerTerms}</a>
        <a href="support.html#privacy">${t.footerPrivacy}</a>
        <a href="support.html#contact">${t.footerContact}</a>
        <a href="/tokushoho.html">${t.footerTokushoho}</a>
      </div>
    `;
  }

  function renderProgress(step) {
    const labels = uiStrings().progress;
    return `
      <div class="progress">
        ${labels.map((label, index) => {
          const stepNo = index + 1;
          const icon = stepNo < step ? '🐾' : stepNo === step ? '🐾' : '👣';
          return `
            <div class="progress-step" data-progress-step="${stepNo}">
              <div class="progress-icon">${icon}</div>
              <span>${label}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function guestApiUrl(path) {
    const origin = window.location.hostname === 'ainadevelop.github.io'
      ? 'https://guest-rose-eta.vercel.app'
      : window.location.origin;
    return origin.replace(/\/+$/, '') + path;
  }

  if (typeof window !== 'undefined' && !window.__sentinelGuestLangBound) {
    window.__sentinelGuestLangBound = true;
    window.addEventListener('sentinel:langchange', () => {
      refreshSharedUiAfterLangChange();
    });
  }

  function getTicketFallbackList() {
    const complete = getCompleteState();
    if (!complete.booking_id) return [];
    return [{
      booking_id: complete.booking_id,
      product_name: buildCartItem().name,
      unit: getParams().unit,
      guest: getParams().guest,
      checkin: getParams().checkin,
      checkout: getParams().checkout,
      purchased_at: complete.completed_at || '',
      valid_until: getParams().checkout,
      status: 'unused',
      distributed: false,
      qr_url: complete.qr_url || '',
      total: getParams().total
    }];
  }

  return {
    STORAGE_KEYS,
    ROOM_CATALOG,
    FALLBACK_EMAIL,
    formatMoney,
    formatDateJP,
    nightsBetween,
    calculateStayTotal,
    getParams,
    persistParams,
    getRoom,
    buildCartItem,
    getCart,
    setCart,
    cartCount,
    cartTotal,
    addToCart,
    updateCartQuantity,
    removeCartItem,
    getApplicant,
    setApplicant,
    getPaymentDraft,
    setPaymentDraft,
    getCompleteState,
    setCompleteState,
    buildQuery,
    buildUrl,
    hydrateChrome,
    getUiLang,
    setUiLang,
    renderFooter,
    renderProgress,
    guestApiUrl,
    getTicketFallbackList,
    sanitizeDigits
  };
})();
