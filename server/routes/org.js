import express from 'express';
import * as orgRepo from '../dao/org.js';
import authMiddleware, { superAdminOnly } from '../middleware/auth.js';
import { validate, NotFoundError, BadRequestError } from '../utils/errors.js';
import { isValidOrgName } from '../../shared/validators.js';

const router = express.Router();

router.get('/public/:name', async (req, res) => {
    const org = await orgRepo.findOrgByName(req.params.name);
    if (!org) throw new NotFoundError('Org not found');
    res.json({ success: true, data: { id: org.id, name: org.name } });
});

router.use(authMiddleware, superAdminOnly);

router.post('/', async (req, res) => {
    validate(req.body, ['name'], 'Organization name is required');
    if (!isValidOrgName(req.body.name)) {
        throw new BadRequestError('Organization name must be a single word (no spaces)');
    }
    const org = await orgRepo.createOrg({ name: req.body.name });
    res.json({ success: true, data: org });
});

router.get('/', async (req, res) => {
    const orgs = await orgRepo.findAllOrgs();
    res.json({ success: true, data: orgs });
});

router.get('/:id', async (req, res) => {
    const org = await orgRepo.findOrgById(req.params.id);
    if (!org) throw new NotFoundError('Org not found');
    res.json({ success: true, data: org });
});

router.put('/:id', async (req, res) => {
    validate(req.body, ['name'], 'Organization name is required');
    if (!isValidOrgName(req.body.name)) {
        throw new BadRequestError('Organization name must be a single word (no spaces)');
    }
    const org = await orgRepo.updateOrg(req.params.id, { name: req.body.name });
    if (!org) throw new NotFoundError('Org not found');
    res.json({ success: true, data: org });
});

router.delete('/:id', async (req, res) => {
    await orgRepo.deleteOrg(req.params.id);
    res.json({ success: true });
});

router.post('/:id/rotate-code', async (req, res) => {
    const org = await orgRepo.rotateOrgInviteCode(req.params.id);
    if (!org) throw new NotFoundError('Org not found');
    res.json({ success: true, data: org });
});

export default router;