import express from 'express';
import * as flagRepo from '../services/flag.js';
import authMiddleware, { orgAdminOnly } from '../middleware/auth.js';

const router = express.Router();

// End-user endpoint to check if a flag is enabled.
// This does not require authentication, but requires org_id and name.
router.get('/check', async (req, res) => {
    const { org_id, name } = req.query;
    if (!org_id || !name) {
        return res.status(400).json({ success: false, error: 'org_id and name are required' });
    }
    const enabled = await flagRepo.checkFlag(Number(org_id), name);
    res.json({ success: true, enabled });
});

// Protect all following administrative routes with auth and orgAdmin role.
router.use(authMiddleware, orgAdminOnly);

router.post('/', async (req, res) => {
    try {
        const { name, enabled } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, error: 'Flag name is required' });
        }
        const org_id = req.user.org_id;
        const flag = await flagRepo.createFlag({ org_id, name, enabled });
        res.json({ success: true, data: flag });
    } catch (error) {
        if (error.message && error.message.includes('UNIQUE constraint failed: feature_flags.org_id, feature_flags.name')) {
            return res.status(400).json({ success: false, error: 'Feature flag name already exists for this organization' });
        }
        res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const org_id = req.user.org_id;
        const flags = await flagRepo.findFlagsByOrgId(org_id);
        res.json({ success: true, data: flags });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const org_id = req.user.org_id;
        const flag = await flagRepo.findFlagByIdAndOrgId(req.params.id, org_id);
        if (!flag) {
            return res.status(404).json({ success: false, error: 'Feature flag not found' });
        }
        res.json({ success: true, data: flag });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const org_id = req.user.org_id;
        const { name, enabled } = req.body;
        
        const existing = await flagRepo.findFlagByIdAndOrgId(req.params.id, org_id);
        if (!existing) {
            return res.status(404).json({ success: false, error: 'Feature flag not found' });
        }

        const flag = await flagRepo.updateFlag(req.params.id, org_id, { name: name || existing.name, enabled: enabled !== undefined ? enabled : existing.enabled });
        res.json({ success: true, data: flag });
    } catch (error) {
         if (error.message && error.message.includes('UNIQUE constraint failed: feature_flags.org_id, feature_flags.name')) {
            return res.status(400).json({ success: false, error: 'Feature flag name already exists for this organization' });
        }
        res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const org_id = req.user.org_id;
        const result = await flagRepo.deleteFlag(req.params.id, org_id);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Feature flag not found' });
        }
        res.json({ success: true, message: 'Feature flag deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
});

export default router;
