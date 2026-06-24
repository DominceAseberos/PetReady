import rateLimit from 'express-rate-limit';

/** General API rate limit: 100 requests per minute per IP. */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests — please wait a moment' } },
});

/** Auth rate limit: 5 attempts per minute per IP. */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many login attempts — try again in a minute' } },
});
