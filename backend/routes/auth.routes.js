import { Router } from "express";
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/signup', async (req, res) => {
    try {
        // Extract userName and password
        const { email, userName, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailPattern.test(email)) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        // Minimum password length
        if (password && password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Confirm password verification
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: 'Confirm password does not match the password entered'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            email: email,
            userName: userName,
            passwordHash: passwordHash,
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
        console.error(error);
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
});

export default router;