module.exports = async (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (_req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (_req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const publishableKey =
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    '';
  const liffId =
    process.env.LIFF_ID ||
    process.env.NEXT_PUBLIC_LIFF_ID ||
    '';
  const bookingUrl =
    process.env.BOOKING_URL ||
    process.env.NEXT_PUBLIC_BOOKING_URL ||
    'https://guest-rose-eta.vercel.app/';
  const apiBaseUrl =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'https://cam.ainadevelop.com';
  const dashboardUrl =
    process.env.DASHBOARD_URL ||
    process.env.NEXT_PUBLIC_DASHBOARD_URL ||
    'https://cam.ainadevelop.com/';
  const legacyMirrorOrigin =
    process.env.LEGACY_MIRROR_ORIGIN ||
    process.env.NEXT_PUBLIC_LEGACY_MIRROR_ORIGIN ||
    'https://ainadevelop.github.io/detector';
  const visaSecureUrl =
    process.env.VISA_SECURE_URL ||
    'https://www.visa.co.jp/run-your-business/small-business-tools/payment-technology/visa-secure.html';
  const lineChatUrl =
    process.env.LINE_GUEST_CHAT_URL ||
    process.env.NEXT_PUBLIC_LINE_GUEST_CHAT_URL ||
    'https://line.me/R/oaMessage/@768ckhvu';
  const lineAddUrl =
    process.env.GUEST_SHARE_LINE_ADD_URL ||
    process.env.NEXT_PUBLIC_GUEST_SHARE_LINE_ADD_URL ||
    'https://line.me/R/ti/p/@768ckhvu';

  if (!publishableKey) {
    return res.status(500).json({
      error: 'STRIPE_PUBLISHABLE_KEY が未設定です'
    });
  }

  res.status(200).json({
    publishableKey,
    liffId,
    bookingUrl,
    apiBaseUrl,
    dashboardUrl,
    legacyMirrorOrigin,
    liffOrigin: 'https://liff.line.me',
    visaSecureUrl,
    lineChatUrl,
    lineAddUrl
  });
};
