import { Router } from "express";
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import bcrypt from 'bcrypt';
import { signupSchema } from "../shared/schemas/signup.schema.js";
import { z } from 'zod';
import { signupLimiter } from "../middleware/rateLimit.js";
import jwt from 'jsonwebtoken';
import { loginSchema } from "../shared/schemas/login.schema.js";
import { requireAuth } from "../middleware/requireAuth.js";
import * as crypto from 'crypto';

const router = Router();

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

function hashToken(token) {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
}

router.post('/signup', signupLimiter, async (req, res) => {
    try {
        // Validate request body
        const parsed = signupSchema.safeParse(req.body);

        if (!parsed.success) {
            const errors = z.treeifyError(parsed.error);

            return res.status(400).json({
                errors
            })
        }

        // Extract email, userName and password
        const { email, userName, password } = parsed.data;

        // Unique email business logic
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            email: email,
            userName: userName,
            passwordHash: passwordHash,
        });

        // Generate tokens
        const userPayload = { userId: user.id, userName: user.userName };
        const accessToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        const refreshToken = crypto.randomBytes(64).toString('hex');

        // Store refresh token hash in DB
        const refreshTokenHash = hashToken(refreshToken);

        await RefreshToken.create({
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });

        res.cookie('auth_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/auth/refresh',
        });

        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                userName: user.userName,
            },
            message: 'User successfully created'
        });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Email already in use',
            });
        }

        console.error(error);
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        // Validate request body
        const parsed = loginSchema.safeParse(req.body);

        if (!parsed.success) {
            const errors = z.treeifyError(parsed.error);

            return res.status(400).json({
                errors
            });
        }

        // Extract email and password
        const { email, password } = parsed.data;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        if (!(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const userPayload = { userId: user.id, userName: user.userName };
        const accessToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        const refreshToken = crypto.randomBytes(64).toString('hex');

        // Store refresh token hash in DB
        const refreshTokenHash = hashToken(refreshToken);

        await RefreshToken.create({
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });

        res.cookie('auth_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/auth/refresh',
        });

        return res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Missing refresh token' });
        }

        // Hash refresh token
        const refreshTokenHash = hashToken(refreshToken);

        const refreshTokenRecord = await RefreshToken.findOne({
            where: {
                tokenHash: refreshTokenHash,
            }
        });

        if (!refreshTokenRecord) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        // Detect Reuse Attack
        if (refreshTokenRecord.revokedAt) {
            // Revoke all user sessions
            await RefreshToken.update(
                { revokedAt: new Date() },
                { where: { userId: refreshTokenRecord.userId } }
            );

            return res.status(401).json({ message: 'Refresh token reuse detected' });
        }

        if (refreshTokenRecord.expiresAt < new Date()) {
            return res.status(401).json({ message: 'Refresh token expired.' });
        }

        const user = await User.findByPk(refreshTokenRecord.userId);

        // Revoke old refresh token
        refreshTokenRecord.revokedAt = new Date();
        await refreshTokenRecord.save();

        // Issue new refresh token
        const newRefreshToken = crypto.randomBytes(64).toString('hex');
        const newHash = hashToken(newRefreshToken);

        await RefreshToken.create({
            userId: user.id,
            tokenHash: newHash,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });

        // Generate access token
        const userPayload = { userId: user.id, userName: user.userName };
        const accessToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('auth_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
        });

        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/auth/refresh',
        });

        return res.status(200).json({ message: 'Refresh token successsfully issued' });
    } catch (err) {
        console.error('Error while creating refresh token:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/me', requireAuth, async (req, res) => {
    try {
        // Find user
        const user = await User.findOne({
            where: {
                id: req.user.userId,
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            userName: user.userName,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching profile' });
    }
});

router.post('/logout', requireAuth, async (req, res) => {
    try {
        // Revoke refresh token
        res.clearCookie('auth_token');
        res.clearCookie('refresh_token', { path: '/auth/refresh' });

        await RefreshToken.update(
            { revokedAt: new Date() },
            { where: { userId: req.user.userId } }
        );

        return res.status(204);
    } catch (err) {
        console.log('Error logging out:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;