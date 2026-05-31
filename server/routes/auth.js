import express from 'express'
const router = express.Router()
import db from '../services/db.js';
    const user = { id: result.lastID, email, role: 'org_admin', org_id: org.id };
    const token = generateToken(user);
    res.json({ success: true, token, user });

})

router.post('/login',async (req, res) => {

    const { email, password, orgId } = req.body;

    if (email === 'admin@byepo.com' && password === 'admin123') {
        const user = { id: 1, email, role: 'super_admin', org_id: null };
        const token = generateToken(user);
        return res.json({ success: true, token, user });
    }

    const orgAdmin = await db.get(
        'SELECT * FROM users WHERE email = ? AND role = ? AND org_id = ?',
        [email, 'org_admin', orgId]
    );

    if (!orgAdmin || !verifyPassword(password, orgAdmin.password_hash)) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(orgAdmin);
    res.json({ success: true, token, user: { id: orgAdmin.id, email: orgAdmin.email, role: orgAdmin.role } });
})

export default router