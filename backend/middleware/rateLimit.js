import rateLimit from 'express-rate-limit';

export const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === 'production' ? 10 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many signup attempts. Please try again later.',
    },
});