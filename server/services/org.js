import db from './db.js';

function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createOrg({ name }) {
  const inviteCode = generateInviteCode();
  const result = await db.run(
    'INSERT INTO org (name, inviteCode) VALUES (?, ?)',
    [name, inviteCode]
  );
  return { id: result.lastID, name, inviteCode };
}

export async function findOrgById(id) {
  return db.get('SELECT * FROM org WHERE id = ?', [id]);
}

export async function findAllOrgs() {
  return db.all('SELECT * FROM org');
}

export async function updateOrg(id, { name }) {
  await db.run('UPDATE org SET name = ? WHERE id = ?', [name, id]);
  return findOrgById(id);
}

export async function deleteOrg(id) {
  return db.run('DELETE FROM org WHERE id = ?', [id]);
}