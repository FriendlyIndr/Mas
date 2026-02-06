import { email, z } from 'zod';

export const signupSchema = z.object({
    userName: z
        .string()
        .min(8, 'Username must be at least 8 characters')
        .max(50, 'Username must be at most 50 characters'),

    email: z.email('Invalid email format'),

    password: z
        .string()
        .min(8, 'Password must be at least 8 characters'),

    confirmPassword: z.string().min(1, 'Please re-enter the password'),
})
.refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});