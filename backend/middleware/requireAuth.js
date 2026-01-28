import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request
        req.user = payload;

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}