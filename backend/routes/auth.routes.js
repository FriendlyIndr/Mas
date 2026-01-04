import { Router } from "express";
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/signup', async (req, res) => {
    try {
        // Extract userName and password
        const { email, userName, password, confirmPassword } = req.body;

        // Confirm password verification
        if (password !== confirmPassword) {
            res.status(401).json({
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

        res.status(200).json({
            user: user,
            message: 'User successfully created'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: `Internal server error: ${error}`
        });
    }
});

export default router;