window.SentinelGuestConfig = (() => {
  const defaults = {
    bookingOrigin: 'https://guest-rose-eta.vercel.app',
    apiBaseUrl: 'https://cam.ainadevelop.com',
    dashboardUrl: 'https://cam.ainadevelop.com/',
    legacyMirrorOrigin: 'https://ainadevelop.github.io/detector',
    liffOrigin: 'https://liff.line.me',
    liffId: '2009557557-OUfe7i8a',
    lineChatUrl: 'https://line.me/R/oaMessage/@768ckhvu',
    lineAddUrl: 'https://line.me/R/ti/p/@768ckhvu',
  };

  function trimOrigin(value, fallback) {
    const text = String(value || '').trim();
    return (text || fallback).replace(/\/+$/, '');
  }

  function mergeConfig(value) {
    const bookingOrigin = trimOrigin(value.bookingUrl || value.bookingOrigin, defaults.bookingOrigin);
    return {
      ...value,
      bookingOrigin,
      apiBaseUrl: trimOrigin(value.apiBaseUrl, defaults.apiBaseUrl),
      dashboardUrl: String(value.dashboardUrl || defaults.dashboardUrl),
      legacyMirrorOrigin: trimOrigin(value.legacyMirrorOrigin, defaults.legacyMirrorOrigin),
      liffOrigin: trimOrigin(value.liffOrigin, defaults.liffOrigin),
      publishableKey: String(value.publishableKey || ''),
      liffId: String(value.liffId || ''),
      visaSecureUrl: String(value.visaSecureUrl || ''),
      lineChatUrl: String(value.lineChatUrl || defaults.lineChatUrl),
      lineAddUrl: String(value.lineAddUrl || defaults.lineAddUrl),
    };
  }

  async function load() {
    const isGitHub = window.location.hostname === 'ainadevelop.github.io';
    const origin = window.location.origin.replace(/\/+$/, '');
    const cam = trimOrigin(defaults.apiBaseUrl, defaults.apiBaseUrl);
    const bases = isGitHub ? [trimOrigin(defaults.bookingOrigin, defaults.bookingOrigin)] : [origin, cam];
    for (let i = 0; i < bases.length; i += 1) {
      const base = bases[i];
      try {
        const res = await fetch(`${base}/api/config`, { cache: 'no-store' });
        if (!res.ok) continue;
        const data = await res.json();
        if (data && data.error && !data.publishableKey) continue;
        return mergeConfig(data || {});
      } catch (_e) {
        /* try next base */
      }
    }
    return mergeConfig(defaults);
  }

  return { defaults: mergeConfig(defaults), load };
})();
