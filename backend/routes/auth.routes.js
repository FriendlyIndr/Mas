import { Router } from "express";
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { signupSchema } from "../../shared/schemas/signup.schema.js";
import { z } from 'zod';

const router = Router();

router.post('/signup', async (req, res) => {
    try {
        // Validate request body
        const parsed = signupSchema.safeParse(req.body);

        if (!parsed.success) {
            const errors = z.treeifyError(parsed.error);

            return res.status(400).json({
                errors
            })
        }

        // Extract userName and password
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

export default router;