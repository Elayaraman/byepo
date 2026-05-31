import db from './db.js';

export async function createOrg({ name, inviteCode }) {
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