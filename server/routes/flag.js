import express from 'express';
import * as flagRepo from '../dao/flag.js';
import authMiddleware, { orgAdminOnly } from '../middleware/auth.js';
import * as orgRepo from '../dao/org.js';
import { validate, NotFoundError, BadRequestError } from '../utils/errors.js';
import { isValidFlagName } from '../../shared/validators.js';

const router = express.Router();

router.get('/check', async (req, res) => {
    validate(req.query, ['org_name', 'name'], 'org_name and name are required');
    const { org_name, name } = req.query;

    const org = await orgRepo.findOrgByName(org_name);
    if (!org) throw new NotFoundError('Org not found');

    const enabled = await flagRepo.checkFlag(org.id, name);
    res.json({ success: true, enabled });
});

router.use(authMiddleware, orgAdminOnly);

router.post('/', async (req, res) => {
    validate(req.body, ['name'], 'Flag name is required');
    const { name, enabled } = req.body;
    if (!isValidFlagName(name)) {
        throw new BadRequestError('Feature flag name must contain only lowercase letters, numbers, underscores, or hyphens, and be at least 3 characters long');
    }

    const flag = await flagRepo.createFlag({ org_id: req.user.org_id, name, enabled });
    res.json({ success: true, data: flag });
});

router.get('/', async (req, res) => {
    const flags = await flagRepo.findFlagsByOrgId(req.user.org_id);
    res.json({ success: true, data: flags });
});

router.get('/:id', async (req, res) => {
    const flag = await flagRepo.findFlagByIdAndOrgId(req.params.id, req.user.org_id);
    if (!flag) throw new NotFoundError('Feature flag not found');
    res.json({ success: true, data: flag });
});

router.put('/:id', async (req, res) => {
    const { name, enabled } = req.body;
    const org_id = req.user.org_id;

    if (name && !isValidFlagName(name)) {
        throw new BadRequestError('Feature flag name must contain only lowercase letters, numbers, underscores, or hyphens, and be at least 3 characters long');
    }

    const existing = await flagRepo.findFlagByIdAndOrgId(req.params.id, org_id);
    if (!existing) throw new NotFoundError('Feature flag not found');

    const flag = await flagRepo.updateFlag(req.params.id, org_id, {
        name: name || existing.name,
        enabled: enabled !== undefined ? enabled : existing.enabled
    });
    res.json({ success: true, data: flag });
});

router.delete('/:id', async (req, res) => {
    const result = await flagRepo.deleteFlag(req.params.id, req.user.org_id);
    if (result.changes === 0) throw new NotFoundError('Feature flag not found');
    res.json({ success: true, message: 'Feature flag deleted successfully' });
});

export default router;
