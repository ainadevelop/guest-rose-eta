window.SentinelGuestLiff = (() => {
  let sdkPromise = null;

  function loadSdk() {
    if (window.liff) {
      return Promise.resolve(window.liff);
    }
    if (sdkPromise) {
      return sdkPromise;
    }

    sdkPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-sentinel-liff-sdk="1"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.liff), { once: true });
        existing.addEventListener('error', () => reject(new Error('LIFF SDK load failed')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
      script.async = true;
      script.charset = 'utf-8';
      script.dataset.sentinelLiffSdk = '1';
      script.onload = () => {
        if (window.liff) {
          resolve(window.liff);
          return;
        }
        reject(new Error('LIFF SDK is unavailable'));
      };
      script.onerror = () => reject(new Error('LIFF SDK load failed'));
      document.head.appendChild(script);
    }).catch((error) => {
      sdkPromise = null;
      throw error;
    });

    return sdkPromise;
  }

  async function init(config = {}) {
    const result = {
      available: false,
      sdkLoaded: false,
      initialized: false,
      loggedIn: false,
      inClient: false,
      profile: null,
      userId: '',
      displayName: '',
      reason: ''
    };
    const liffId = String(config.liffId || '').trim();

    if (!liffId) {
      result.reason = 'missing_liff_id';
      return result;
    }

    try {
      await loadSdk();
      result.sdkLoaded = true;
    } catch (_error) {
      result.reason = 'sdk_load_failed';
      return result;
    }

    if (!window.liff) {
      result.reason = 'sdk_unavailable';
      return result;
    }

    result.available = true;

    try {
      await window.liff.init({
        liffId,
        withLoginOnExternalBrowser: false
      });
      result.initialized = true;
      result.inClient = typeof window.liff.isInClient === 'function' ? window.liff.isInClient() : false;
      result.loggedIn = typeof window.liff.isLoggedIn === 'function' ? window.liff.isLoggedIn() : result.inClient;

      if (result.loggedIn && typeof window.liff.getProfile === 'function') {
        result.profile = await window.liff.getProfile();
        result.userId = result.profile?.userId || '';
        result.displayName = result.profile?.displayName || '';
      }
    } catch (_error) {
      result.reason = 'init_failed';
    }

    return result;
  }

  function canUseShareTargetPicker() {
    return Boolean(
      window.liff &&
      typeof window.liff.isApiAvailable === 'function' &&
      window.liff.isApiAvailable('shareTargetPicker')
    );
  }

  return {
    init,
    loadSdk,
    canUseShareTargetPicker
  };
})();
