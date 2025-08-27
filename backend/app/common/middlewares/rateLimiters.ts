import rateLimit from "express-rate-limit";

/**
 * Rate limiter middleware for login endpoint.
 * Limits each IP to 5 login requests per 15 minutes to prevent brute force attacks.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    status: 429,
    error: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter middleware for registration endpoint.
 * Limits each IP to 3 account creations per hour to prevent abuse.
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    status: 429,
    error: "Too many accounts created from this IP, please try later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter middleware for refresh token endpoint.
 * Limits each IP to 10 token refresh requests per 15 minutes to avoid token abuse.
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    status: 429,
    error: "Too many token refresh attempts, please try later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter middleware for logout endpoint.
 * Limits each IP to 10 logout requests per 15 minutes.
 */
export const logoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: 429,
    error: "Too many logout requests, please try later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* The `resetPasswordLimiter` constant is defining a rate limiter middleware for the reset password
endpoint. It limits each IP address to 5 password reset attempts per 15 minutes to prevent abuse or
potential attacks. If the limit is exceeded, a status code of 429 (Too Many Requests) is returned
along with an error message "Too many password reset attempts, please try later." This middleware
includes standard headers in the response and does not include legacy headers. */
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5, // limit to 5 reset attempts per IP per windowMs
  message: {
    status: 429,
    error: "Too many password reset attempts, please try later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
