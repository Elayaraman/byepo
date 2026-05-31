import test from 'node:test';
import assert from 'node:assert';
import app from '../server.js';
import db from '../services/db.js';
import { generateToken } from '../services/auth.js';

let server;
let baseUrl;

test.before(async () => {
  // Wait for table to be created
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/_api/flag`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await db.close();
});

test.describe('Flag Routes', () => {
  const superAdminToken = generateToken({ id: 1, email: 'admin@byepo.com', role: 'super_admin', org_id: null });
  const orgAdminToken1 = generateToken({ id: 2, email: 'org@byepo.com', role: 'org_admin', org_id: 1 });
  const orgAdminToken2 = generateToken({ id: 3, email: 'org2@byepo.com', role: 'org_admin', org_id: 2 });
  
  let createdFlagId;

  test('POST / - returns 403 if user is not org_admin', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ name: 'feature_a', enabled: true }),
    });
    assert.strictEqual(res.status, 403);
  });

  test('POST / - creates a new flag for org_admin', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({ name: 'feature_a', enabled: true }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.name, 'feature_a');
    assert.strictEqual(data.data.enabled, true);
    createdFlagId = data.data.id;
  });

  test('GET / - returns list of flags for the organization', async () => {
    const res = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${orgAdminToken1}`
      }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length >= 1);
  });

  test('GET /check - returns flag status correctly for end user', async () => {
    const res = await fetch(`${baseUrl}/check?org_id=1&name=feature_a`, {
      method: 'GET'
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.enabled, true);
  });
});
