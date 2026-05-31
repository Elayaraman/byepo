import { verifyToken } from "../services/auth.js";

export default function  authMiddleware(req, res, next) {
    console.log(req.headers.authorization);
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token' });
    }
    const user = verifyToken(token);
    if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
    req.user = user;
    next();
}
