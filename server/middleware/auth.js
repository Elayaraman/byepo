import { verifyToken } from "../services/auth.js";
import { findOrgById } from "../dao/org.js";

export default async function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token' });
    }
    const user = verifyToken(token);
    if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }

    if (user.org_id) {
        const org = await findOrgById(user.org_id);
        if (!org) {
            return res.status(401).json({ success: false, error: 'Unauthorized: Organization has been deleted' });
        }
    }

    req.user = user;
    next();
}

export function superAdminOnly(req, res, next) {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Forbidden: Super admin only' });
    }
    next();
}

export function orgAdminOnly(req, res, next) {
    if (req.user.role !== 'org_admin') {
        return res.status(403).json({ success: false, error: 'Forbidden: Org admin only' });
    }
    next();
}