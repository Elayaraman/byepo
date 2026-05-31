import test from 'node:test';
import assert from 'node:assert';
import app from '../server.js';
import db from '../services/db.js';
import { generateToken } from '../services/auth.js';

let server;
let baseUrl;

test.before(async () => {
  // Start server on a dynamic random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/_api/org`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await db.close();
});

test.describe('Organization Routes', () => {
  const superAdminToken = generateToken({ id: 1, email: 'admin@byepo.com', role: 'super_admin' });
  const orgAdminToken = generateToken({ id: 2, email: 'org@byepo.com', role: 'org_admin' });
  const invalidToken = 'invalid.jwt.token';

  test('POST / - returns 401 if authorization header is missing', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Org 1' }),
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'Unauthorized: No token');
  });

  test('POST / - returns 401 if authorization token is invalid', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${invalidToken}`,
      },
      body: JSON.stringify({ name: 'Org 2' }),
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'Unauthorized: Invalid token');
  });

  test('POST / - returns 403 if user is not super_admin', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken}`,
      },
      body: JSON.stringify({ name: 'Org 3' }),
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'Forbidden: Super admin only');
  });

  test('POST / and GET / - creates organization and lists them', async () => {
    const orgName = `Test Org ${Date.now()}`;
    
    // Create Organization
    const createRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: orgName }),
    });
    assert.strictEqual(createRes.status, 200);
    const createResult = await createRes.json();
    assert.strictEqual(createResult.success, true);
    assert.strictEqual(createResult.data.name, orgName);
    assert.ok(createResult.data.id);
    assert.ok(createResult.data.inviteCode);

    const createdId = createResult.data.id;

    // Get all organizations
    const listRes = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
      },
    });
    assert.strictEqual(listRes.status, 200);
    const listResult = await listRes.json();
    assert.strictEqual(listResult.success, true);
    assert.ok(Array.isArray(listResult.data));
    const found = listResult.data.find(org => org.id === createdId);
    assert.ok(found);
    assert.strictEqual(found.name, orgName);

    // Get organization by ID
    const getRes = await fetch(`${baseUrl}/${createdId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
      },
    });
    assert.strictEqual(getRes.status, 200);
    const getResult = await getRes.json();
    assert.strictEqual(getResult.success, true);
    assert.strictEqual(getResult.data.id, createdId);
    assert.strictEqual(getResult.data.name, orgName);
  });

  test('GET /:id - returns 404 if organization does not exist', async () => {
    const res = await fetch(`${baseUrl}/999999`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
      },
    });
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'Org not found');
  });
});
