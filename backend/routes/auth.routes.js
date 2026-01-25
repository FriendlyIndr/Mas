import { Router } from "express";
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { signupSchema } from "../../shared/schemas/signup.schema.js";
import { z } from 'zod';
import { signupLimiter } from "../middleware/rateLimit.js";
import jwt from 'jsonwebtoken';
import { loginSchema } from "../../shared/schemas/login.schema.js";

const router = Router();

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

        // Generate token
        const userPayload = { userId: user.id, userName: user.userName };
        const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 1 hour
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
        const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000,
        });

        return res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;