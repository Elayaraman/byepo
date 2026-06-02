import express from 'express';
import { findOrgById, rotateOrgInviteCode } from '../dao/org.js';
import * as userRepo from '../dao/user.js';
import { hashPassword, generateToken, verifyPassword } from '../services/auth.js';
import { validate, BadRequestError, UnauthorizedError } from '../utils/errors.js';
import dotenv from 'dotenv';
import path from 'path';

// Load admin credentials from .env.admin if it exists
dotenv.config({ path: path.resolve(process.cwd(), '.env.admin') });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@byepo.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const router = express.Router();

router.post('/signup', async (req, res) => {
    validate(req.body, ['email', 'password', 'orgId', 'inviteCode'], 'Missing required fields');
    const { email, password, orgId, inviteCode } = req.body;

    const org = await findOrgById(orgId);
    if (!org || org.inviteCode !== inviteCode) throw new BadRequestError('Invalid invite code');

    const existing = await userRepo.findUserByEmail(email);
    if (existing) throw new BadRequestError('Email already registered');

    const user = await userRepo.createUser({
        org_id: org.id,
        email,
        passwordHash: hashPassword(password),
        role: 'org_admin'
    });

    await rotateOrgInviteCode(org.id);
    res.json({ success: true, token: generateToken(user), user });
});

router.post('/login', async (req, res) => {
    validate(req.body, ['email', 'password'], 'Email and password are required');
    const { email, password, orgId } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const user = { id: 1, email, role: 'super_admin', org_id: null };
        return res.json({ success: true, token: generateToken(user), user });
    }

    validate(req.body, ['orgId'], 'Organization ID is required for org admins');
    const orgAdmin = await userRepo.findOrgAdminByEmailAndOrgId(email, orgId);

    if (!orgAdmin || !verifyPassword(password, orgAdmin.password_hash)) {
        throw new UnauthorizedError('Invalid credentials');
    }

    const user = { id: orgAdmin.id, email: orgAdmin.email, role: orgAdmin.role, org_id: orgAdmin.org_id };
    res.json({ success: true, token: generateToken(user), user });
});

export default router;