import express from 'express';
import * as orgRepo from '../services/org.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { name } = req.body;
  const org = await orgRepo.createOrg({ name });
  res.json({ success: true, data: org });
});

router.get('/', async (req, res) => {
  const orgs = await orgRepo.findAllOrgs();
  res.json({ success: true, data: orgs });
});

router.get('/:id', async (req, res) => {
  const org = await orgRepo.findOrgById(req.params.id);
  if (!org) {
    return res.status(404).json({ success: false, error: 'Org not found' });
  }
  res.json({ success: true, data: org });
});

export default router;