const { resolveStripeSecretKey } = require('./stripe-secret');

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function toSummary(intent) {
  const metadata = intent.metadata || {};
  return {
    id: intent.id,
    status: intent.status,
    metadata,
    amount: intent.amount,
    currency: intent.currency
  };
}

function matchesPhone(metadata, phoneDigits) {
  if (!phoneDigits) return false;
  const candidates = [
    metadata.phone,
    metadata.phone_normalized,
    metadata.phone_digits,
    metadata.phone_display
  ];
  return candidates.some((value) => normalizePhone(value) === phoneDigits);
}

async function findIntentByMetadata(stripe, filters) {
  let startingAfter = undefined;

  for (let page = 0; page < 10; page += 1) {
    const list = await stripe.paymentIntents.list({
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {})
    });

    const match = list.data.find((intent) => {
      if (intent.status !== 'succeeded') return false;
      const metadata = intent.metadata || {};

      if (filters.lineUserId && metadata.line_user_id === filters.lineUserId) {
        return true;
      }

      if (filters.phoneDigits && matchesPhone(metadata, filters.phoneDigits)) {
        return true;
      }

      return false;
    });

    if (match) {
      return match;
    }

    if (!list.has_more || !list.data.length) {
      break;
    }
    startingAfter = list.data[list.data.length - 1].id;
  }

  return null;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const secretResolved = resolveStripeSecretKey();
    if (!secretResolved.ok) {
      return res.status(secretResolved.status).json({ error: secretResolved.error });
    }
    const secretKey = secretResolved.key;

    const paymentIntentId = String(req.query.payment_intent || '').trim();

    // Security: phone / line_user_id による検索は情報漏洩リスクがあるため無効化。
    // complete.html からは payment_intent のみで呼ばれる。
    if (!paymentIntentId) {
      return res.status(400).json({
        error: 'payment_intent が必要です'
      });
    }

    if (!paymentIntentId.startsWith('pi_')) {
      return res.status(400).json({ error: 'payment_intent が不正です' });
    }

    const stripe = require('stripe')(secretKey);
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return res.status(200).json(toSummary(intent));
  } catch (error) {
    if (/invalid api key/i.test(String(error && error.message ? error.message : ''))) {
      return res.status(500).json({
        error:
          'Stripe がシークレットキーを拒否しました（Invalid API Key）。Vercel の STRIPE_SECRET_KEY を確認してください。'
      });
    }
    return res.status(500).json({ error: error.message || 'failed_to_check_payment' });
  }
};
