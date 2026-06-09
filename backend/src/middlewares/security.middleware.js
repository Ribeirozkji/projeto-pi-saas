const crypto = require('crypto');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'estoque_vendas_session';
const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_RATE_LIMIT_MAX = 100;

function getCookieOptions() {
  const secure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  const sameSite = process.env.COOKIE_SAME_SITE || 'Lax';

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge: Number(process.env.COOKIE_MAX_AGE_SECONDS || 24 * 60 * 60)
  };
}

function serializeCookie(name, value, options = {}) {
  const segments = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    segments.push(`Max-Age=${Number(options.maxAge)}`);
  }

  if (options.path) {
    segments.push(`Path=${options.path}`);
  }

  if (options.httpOnly) {
    segments.push('HttpOnly');
  }

  if (options.secure) {
    segments.push('Secure');
  }

  if (options.sameSite) {
    segments.push(`SameSite=${options.sameSite}`);
  }

  return segments.join('; ');
}

function parseCookies(req, res, next) {
  const header = req.headers.cookie;
  req.cookies = {};

  if (!header) {
    return next();
  }

  header.split(';').forEach((cookie) => {
    const separatorIndex = cookie.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = cookie.slice(0, separatorIndex).trim();
    const value = cookie.slice(separatorIndex + 1).trim();

    if (!key) {
      return;
    }

    try {
      req.cookies[key] = decodeURIComponent(value);
    } catch {
      req.cookies[key] = value;
    }
  });

  return next();
}

function setAuthCookie(res, token) {
  res.setHeader('Set-Cookie', serializeCookie(AUTH_COOKIE_NAME, token, getCookieOptions()));
}

function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', serializeCookie(AUTH_COOKIE_NAME, '', {
    ...getCookieOptions(),
    maxAge: 0
  }));
}

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return next();
}

function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();
  const configuredWindowMs = Number(windowMs) || DEFAULT_RATE_LIMIT_WINDOW_MS;
  const configuredMax = Number(max) || DEFAULT_RATE_LIMIT_MAX;

  return (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip || req.socket.remoteAddress || 'unknown'}:${req.body?.email || ''}`.toLowerCase();
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + configuredWindowMs });
      return next();
    }

    current.count += 1;

    if (current.count > configuredMax) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        message: message || 'Muitas tentativas. Aguarde antes de tentar novamente.'
      });
    }

    return next();
  };
}

function requireCookieCsrfHeader(req, res, next) {
  if (SAFE_METHODS.has(req.method) || !req.authenticatedByCookie) {
    return next();
  }

  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return res.status(403).json({ message: 'Cabeçalho de segurança ausente.' });
  }

  return next();
}

function requestId(req, res, next) {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  return next();
}

module.exports = {
  AUTH_COOKIE_NAME,
  clearAuthCookie,
  createRateLimiter,
  parseCookies,
  requestId,
  requireCookieCsrfHeader,
  securityHeaders,
  setAuthCookie
};
