export { redirectToHttps, isAssetURL, isAPiURL, isJsonURL, isSSR, shouldTrustHost };

const redirectToHttps = (url: URL) =>
  url.protocol === 'http:' &&
  url.hostname !== '127.0.0.1' &&
  url.hostname !== 'localhost' &&
  !url.hostname.startsWith('192.168.1');

const isAssetURL = (url: URL) => url.pathname.startsWith('/assets/');

const isAPiURL = (url: URL) => url.pathname.startsWith('/api/') || url.pathname.startsWith('/docs');

const isJsonURL = (url: URL) => url.pathname.endsWith('.json');

const isSSR = (url: URL, ssrPaths: string[]) => {
  // url.pathname.replace(/\/$/, "");
  return ssrPaths.includes(url.pathname.split('/').at(1) || '') || url.pathname === '/';
};

function shouldTrustHost() {
  return !!(
    process.env.AUTH_TRUST_HOST ??
    process.env.VERCEL ??
    process.env.NODE_ENV === 'development'
  );
}
