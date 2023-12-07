export { getCookieAuthToken, getAuthCookies };

function parseCookie(cookie: string): { [key: string]: string } {
  return cookie
    .split(';')
    .map((c) => c.trim().split('='))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

function getCookie(cookies: string, name: string): string {
  const parsed = parseCookie(cookies);
  return parsed[name];
}

const getCookieAuthToken = (
  request: Request | Response,
  headerName = 'cookie',
  cookieName = 'next-auth.session-token'
): string | null => {
  const cookieHeader = request.headers.get(headerName);
  if (!cookieHeader) return null;
  const cookie = getCookie(cookieHeader, cookieName);
  return cookie;
};

interface NextAuthCookies {
  sessionToken: string | null;
  csrfToken: string | null;
  callbackUrl: string | null;
  pkceCodeVerifier: string | null;
}

const getAuthCookies = (
  cookieHeader: string,
  cookieNames = {
    sessionToken: 'next-auth.session-token',
    csrfToken: 'next-auth.csrf-token',
    callbackUrl: 'next-auth.callback-url',
    pkceCodeVerifier: 'next-auth.pkce.code_verifier',
  }
): NextAuthCookies => {
  const sessionToken = getCookie(cookieHeader, cookieNames.sessionToken);
  const csrfToken = getCookie(cookieHeader, cookieNames.csrfToken);
  const callbackUrl = getCookie(cookieHeader, cookieNames.callbackUrl);
  const pkceCodeVerifier = getCookie(cookieHeader, cookieNames.pkceCodeVerifier);
  return {
    sessionToken,
    csrfToken,
    callbackUrl,
    pkceCodeVerifier,
  };
};
