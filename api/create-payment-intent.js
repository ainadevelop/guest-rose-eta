const UNIT_PRICES = {
  '101': 8000,
  '102': 8000,
  '201': 12000,
  '202': 12000
};
const UNIT_MAX_GUESTS = {
  '101': 2,
  '102': 2,
  '201': 4,
  '202': 4
};
const { resolveStripeSecretKey } = require('./stripe-secret');
const DEBUG_VERSION = 'pm-fix-2026-04-20-4';
const INVENTORY_API_BASE = 'https://cam.ainadevelop.com';

function calculateAmount(unit, checkin, checkout, quantity) {
  const nightlyPrice = UNIT_PRICES[unit];
  if (!nightlyPrice) {
    throw new Error('unit が不正です');
  }

  const start = new Date(checkin);
  const end = new Date(checkout);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('日付が不正です');
  }

  const nights = Math.round((end - start) / 86400000);
  if (nights < 1) {
    throw new Error('チェックアウト日はチェックイン日より後にしてください');
  }

  const qty = Math.max(1, parseInt(String(quantity ?? 1), 10) || 1);
  return nightlyPrice * nights * qty;
}

function assertCheckinNotPast(checkin) {
  const checkinText = String(checkin || '').trim();
  if (!checkinText) {
    throw new Error('チェックイン日が未設定です');
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkinDate = new Date(`${checkinText}T00:00:00`);
  if (Number.isNaN(checkinDate.getTime())) {
    throw new Error('チェックイン日が不正です');
  }
  if (checkinDate < today) {
    throw new Error('チェックイン日は本日以降の日付を選択してください。');
  }
}

function guestCustomerEmail(email, phone, guest, lineUserId) {
  const e = String(email || '').trim().toLowerCase();
  if (e && e.includes('@')) {
    return e;
  }
  const digits = String(phone || '').replace(/\D/g, '').slice(-12) || '0';
  const slug = String(guest || 'guest')
    .replace(/[^\w\u3040-\u30ff\u4e00-\u9faf]/g, '_')
    .slice(0, 24) || 'guest';
  const lineTail = String(lineUserId || '')
    .replace(/[^\w-]/g, '')
    .slice(-24);
  const uniq = lineTail || 'noline';
  return `sentinel_guest_${digits}_${slug}_${uniq}@guest.sentinel.local`;
}

async function ensureStripeCustomer(stripe, { email, guest, phone, line_user_id }) {
  const customerEmail = guestCustomerEmail(email, phone, guest, line_user_id);
  const list = await stripe.customers.list({ email: customerEmail, limit: 1 });
  if (list.data.length) {
    return { id: list.data[0].id, email: customerEmail };
  }
  const c = await stripe.customers.create({
    email: customerEmail,
    name: String(guest || '').trim() || undefined,
    metadata: {
      source: 'sentinel_guest',
      phone: String(phone || '').trim()
    }
  });
  return { id: c.id, email: customerEmail };
}

function stripeCustomerId(customer) {
  if (!customer) {
    return '';
  }
  if (typeof customer === 'string') {
    return customer;
  }
  return String(customer.id || '');
}

function isReusablePaymentMethodError(err) {
  const msg = String(err && err.message ? err.message : '');
  const code = String(err && err.code ? err.code : '');
  return (
    /provided PaymentMethod|PaymentMethod was previously used|previously used|may not be used again|was detached|detached|cannot be used again/i.test(msg) ||
    /payment_method_(?:unactivated|unexpected_state|invalid|detached)/i.test(code)
  );
}

function reusablePaymentMethodMessage() {
  return 'このカード情報は再利用できません。お支払い方法のページに戻り、カードをもう一度入力してください。';
}

function soldOutMessage(unit) {
  return `${unit}号室は満室です。別のお部屋または日程を選択してください。`;
}

function overCapacityMessage(unit, maxGuests) {
  return `${unit}号室は${maxGuests}名様までです。人数を減らすか、別のお部屋を選択してください。`;
}

async function ensureUnitAvailable({ unit, checkin, checkout, quantity }) {
  const query = new URLSearchParams({ checkin, checkout });
  const response = await fetch(`${INVENTORY_API_BASE}/api/inventory?${query.toString()}`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error('在庫確認に失敗しました。時間をおいて再度お試しください。');
  }
  const data = await response.json();
  const units = Array.isArray(data && data.units) ? data.units : [];
  const current = units.find((entry) => String(entry && entry.unit) === String(unit));
  if (!current) {
    throw new Error('在庫確認に失敗しました。時間をおいて再度お試しください。');
  }
  const maxGuests = Math.max(1, Number(current.max_guests || UNIT_MAX_GUESTS[unit] || 1));
  if (Number(quantity || 1) > maxGuests) {
    const error = new Error(overCapacityMessage(unit, maxGuests));
    error.code = 'room_capacity_exceeded';
    error.statusCode = 409;
    error.detail = {
      error: 'room_capacity_exceeded',
      message: overCapacityMessage(unit, maxGuests),
      unit,
      quantity: Number(quantity || 1),
      max_guests: maxGuests
    };
    throw error;
  }
  if (current.sold_out || Number(current.available || 0) <= 0) {
    const error = new Error(soldOutMessage(unit));
    error.code = 'unit_sold_out';
    error.statusCode = 409;
    error.detail = {
      error: 'unit_sold_out',
      message: soldOutMessage(unit),
      unit,
      available: Number(current.available || 0)
    };
    throw error;
  }
  return current;
}

async function attachPaymentMethodToCustomer(stripe, pmId, customerId) {
  let pm;
  try {
    pm = await stripe.paymentMethods.retrieve(pmId);
  } catch (err) {
    if (isReusablePaymentMethodError(err) || err?.code === 'resource_missing') {
      throw new Error(
        'このカード情報は利用できません。お支払い方法のページに戻り、カードをもう一度入力してください。'
      );
    }
    throw err;
  }

  const attachedCustomerId = stripeCustomerId(pm.customer);
  if (attachedCustomerId === customerId) {
    return;
  }
  if (attachedCustomerId && attachedCustomerId !== customerId) {
    throw new Error('このカードは別の顧客に紐づいているため使えません。別のカードを入力してください。');
  }
  try {
    await stripe.paymentMethods.attach(pmId, { customer: customerId });
  } catch (err) {
    if (isReusablePaymentMethodError(err)) {
      throw new Error(reusablePaymentMethodMessage());
    }
    throw err;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', version: DEBUG_VERSION });
  }

  try {
    const secretResolved = resolveStripeSecretKey();
    if (!secretResolved.ok) {
      return res.status(secretResolved.status).json({
        error: secretResolved.error,
        version: DEBUG_VERSION
      });
    }
    const secretKey = secretResolved.key;

    const {
      guest,
      unit,
      checkin,
      checkin_time,
      checkout,
      checkout_time,
      phone,
      email,
      line_user_id,
      applicant,
      quantity,
      total,
      payment_method: paymentMethodFromBody,
      payment_method_id: paymentMethodIdAlias
    } = req.body || {};
    const paymentMethodId = String(
      paymentMethodFromBody || paymentMethodIdAlias || ''
    ).trim();
    const qty = Math.max(1, parseInt(String(quantity ?? 1), 10) || 1);
    const amount = calculateAmount(
      String(unit || '').trim(),
      String(checkin || '').trim(),
      String(checkout || '').trim(),
      qty
    );
    assertCheckinNotPast(checkin);
    const clientTotal = Number(total);
    if (Number.isFinite(clientTotal) && clientTotal > 0 && Math.round(clientTotal) !== Math.round(amount)) {
      return res.status(400).json({
        error: '表示金額とサーバー計算が一致しません。画面を更新してから再度お試しください。',
        version: DEBUG_VERSION
      });
    }
    await ensureUnitAvailable({
      unit: String(unit || '').trim(),
      checkin: String(checkin || '').trim(),
      checkout: String(checkout || '').trim(),
      quantity: qty
    });

    const stripe = require('stripe')(secretKey);

    const metadata = {
      guest,
      unit,
      checkin,
      checkin_time: String(checkin_time || '').trim() || '15:00',
      checkout,
      checkout_time: String(checkout_time || '').trim() || '10:00',
      phone,
      email: String(email || '').trim(),
      line_user_id: String(line_user_id || '').trim(),
      quantity: String(qty),
      applicant_last_name: String(applicant?.lastName || '').trim(),
      applicant_first_name: String(applicant?.firstName || '').trim()
    };

    const intentPayload = {
      amount: Math.round(amount),
      currency: 'jpy',
      payment_method_types: ['card'],
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic'
        }
      },
      metadata
    };

    let paymentMethodOnIntent = false;
    if (paymentMethodId.startsWith('pm_')) {
      const { id: customerId } = await ensureStripeCustomer(stripe, {
        email,
        guest,
        phone,
        line_user_id
      });
      await attachPaymentMethodToCustomer(stripe, paymentMethodId, customerId);
      intentPayload.customer = customerId;
      intentPayload.payment_method = paymentMethodId;
      paymentMethodOnIntent = true;
    }

    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create(intentPayload);
    } catch (err) {
      if (isReusablePaymentMethodError(err)) {
        return res.status(400).json({
          error: reusablePaymentMethodMessage(),
          version: DEBUG_VERSION
        });
      }
      throw err;
    }

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      paymentIntentId: paymentIntent.id,
      paymentMethodOnIntent,
      version: DEBUG_VERSION
    });
  } catch (err) {
    if (/invalid api key/i.test(String(err && err.message ? err.message : ''))) {
      return res.status(500).json({
        error:
          'Stripe がシークレットキーを拒否しました（Invalid API Key）。Vercel の STRIPE_SECRET_KEY がダッシュボードと一致するか、Production に誤ってテスト用キーが入っていないか確認してください。',
        version: DEBUG_VERSION
      });
    }
    const message = isReusablePaymentMethodError(err)
      ? reusablePaymentMethodMessage()
      : (err && err.message ? err.message : '決済開始に失敗しました');
    const status =
      err?.statusCode ||
      ((isReusablePaymentMethodError(err) || /不正|後にしてください|このカード|別の顧客|一致しません|再利用|入力してください|満室|在庫確認/.test(
        message
      )
        ? 400
        : 500));
    if (err?.code === 'unit_sold_out' || err?.code === 'room_capacity_exceeded') {
      return res.status(409).json({
        error: err.detail.error,
        message: err.detail.message,
        detail: err.detail,
        version: DEBUG_VERSION
      });
    }
    res.status(status).json({ error: message, version: DEBUG_VERSION });
  }
};
