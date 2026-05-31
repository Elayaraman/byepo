import db from './db.js';

export async function findUserByEmail(email) {
    return db.get('SELECT * FROM users WHERE email = ?', [email]);
}

export async function findOrgAdminByEmailAndOrgId(email, orgId) {
    return db.get(
        'SELECT * FROM users WHERE email = ? AND role = ? AND org_id = ?',
        [email, 'org_admin', orgId]
    );
}

export async function createUser({ org_id, email, passwordHash, role }) {
    const result = await db.run(
        'INSERT INTO users (org_id, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [org_id, email, passwordHash, role]
    );
    return { id: result.lastID, org_id, email, role };
}
