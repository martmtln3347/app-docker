import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

// No-op middleware used during tests to avoid interfering with automated requests
const noop = (req, res, next) => next();

// Limiter for login attempts: stricter to mitigate brute-force on authentication
export const loginLimiter = isTest
  ? noop
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 login requests per windowMs
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      handler: (req, res) => {
        res.status(429).json({ error: "Too many login attempts. Please try again later." });
      }
    });

// Limiter for registration: slightly more permissive but still rate-limited
export const registerLimiter = isTest
  ? noop
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // limit each IP to 10 registration requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({ error: "Too many accounts created from this IP, please try again later." });
      }
    });

// Optionally export a general limiter for other sensitive endpoints
export const generalLimiter = isTest
  ? noop
  : rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 60, // 60 requests per minute
      standardHeaders: true,
      legacyHeaders: false
    });
