'use strict';

/**
 * Stripe のシークレットキーは process.env.STRIPE_SECRET_KEY のみから取得する。
 * 他の環境変数やコードへのハードコードは使わない。
 */
function normalizeStripeSecretKey(raw) {
  if (raw == null) return '';
  let v = String(raw).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

/**
 * @returns {{ ok: true, key: string } | { ok: false, status: number, error: string }}
 */
function resolveStripeSecretKey() {
  const key = normalizeStripeSecretKey(process.env.STRIPE_SECRET_KEY);
  if (!key) {
    return { ok: false, status: 500, error: 'STRIPE_SECRET_KEY が未設定です' };
  }
  if (process.env.VERCEL_ENV === 'production') {
    const isLiveSecret = key.startsWith('sk_live_') || key.startsWith('rk_live_');
    if (!isLiveSecret) {
      return {
        ok: false,
        status: 500,
        error:
          'Vercel Production では STRIPE_SECRET_KEY は本番用キー（sk_live_ または制限付き rk_live_ で始まる値）を設定してください。sk_test_ のままだと Invalid API Key になります。値の先頭末尾に空白や引用符が付いていないかも確認してください。'
      };
    }
  }
  return { ok: true, key };
}

module.exports = { resolveStripeSecretKey, normalizeStripeSecretKey };
