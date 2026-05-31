import express from 'express';
import * as orgRepo from '../services/org.js';
import authMiddleware, { superAdminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/public/:name', async (req, res) => {
    try {
        const org = await orgRepo.findOrgByName(req.params.name);
        if (!org) {
            return res.status(404).json({ success: false, error: 'Org not found' });
        }
        res.json({ success: true, data: { name: org.name } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

router.use(authMiddleware, superAdminOnly)

router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, error: 'Organization name is required' });
        }
        const org = await orgRepo.createOrg({ name });
        res.json({ success: true, data: org });
    } catch (error) {
        if (error.message && error.message.includes('UNIQUE constraint failed: org.name')) {
            return res.status(400).json({ success: false, error: 'Organization name already exists' });
        }
        res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const orgs = await orgRepo.findAllOrgs();
        res.json({ success: true, data: orgs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const org = await orgRepo.findOrgById(req.params.id);
        if (!org) {
            return res.status(404).json({ success: false, error: 'Org not found' });
        }
        res.json({ success: true, data: org });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

export default router;