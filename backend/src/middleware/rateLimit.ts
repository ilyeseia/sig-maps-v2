import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: {
      message: 'Too many login attempts, please try again in 15 minutes',
    },
  },
});

export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    error: {
      message: 'Too many registration attempts from this IP, please try again in 1 hour',
    },
  },
});
