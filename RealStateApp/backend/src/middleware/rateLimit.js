// Tiny in-memory rate limiter (no new dependencies).
// Protects sensitive auth endpoints against brute-force attempts.
// NOTE: per-process memory only — for multi-instance production use,
// replace with a shared store (e.g. Redis).
const attempts = new Map();

const rateLimit = ({ windowMs, max }) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    let entry = attempts.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      attempts.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      return res.status(429).json({
        message: 'Too many requests. Please try again later.'
      });
    }

    next();
  };
};

// 50 auth attempts per IP per 15 minutes.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });

module.exports = { rateLimit, authLimiter };
