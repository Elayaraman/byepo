import db from './db.js';

export async function createFlag({ org_id, name, enabled = false }) {
    const result = await db.run(
        'INSERT INTO feature_flags (org_id, name, enabled) VALUES (?, ?, ?)',
        [org_id, name, enabled ? 1 : 0]
    );
    return { id: result.lastID, org_id, name, enabled };
}

export async function findFlagsByOrgId(org_id) {
    const flags = await db.all('SELECT * FROM feature_flags WHERE org_id = ?', [org_id]);
    return flags.map(flag => ({
        ...flag,
        enabled: Boolean(flag.enabled)
    }));
}

export async function findFlagByIdAndOrgId(id, org_id) {
    const flag = await db.get('SELECT * FROM feature_flags WHERE id = ? AND org_id = ?', [id, org_id]);
    if (flag) {
        flag.enabled = Boolean(flag.enabled);
    }
    return flag;
}

export async function updateFlag(id, org_id, { name, enabled }) {
    await db.run(
        'UPDATE feature_flags SET name = ?, enabled = ? WHERE id = ? AND org_id = ?',
        [name, enabled ? 1 : 0, id, org_id]
    );
    return findFlagByIdAndOrgId(id, org_id);
}

export async function deleteFlag(id, org_id) {
    return db.run('DELETE FROM feature_flags WHERE id = ? AND org_id = ?', [id, org_id]);
}

export async function checkFlag(org_id, name) {
    const flag = await db.get('SELECT enabled FROM feature_flags WHERE org_id = ? AND name = ?', [org_id, name]);
    return flag ? Boolean(flag.enabled) : false;
}
