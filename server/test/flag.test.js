import test from 'node:test';
import assert from 'node:assert';
import app from '../server.js';
import db from '../services/db.js';
import { generateToken } from '../services/auth.js';

let server;
let baseUrl;
let orgId;
const orgName = 'TestOrg';

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

  // Insert mock organization so check works with org_name
  const res = await db.run("INSERT INTO org (name, inviteCode) VALUES (?, ?)", [orgName, 'TESTINVITE']);
  orgId = res.lastID;
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
  const flagName = 'feature_' + Date.now();

  test('POST / - returns 403 if user is not org_admin', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ name: flagName, enabled: true }),
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
      body: JSON.stringify({ name: flagName, enabled: true }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.name, flagName);
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
    const res = await fetch(`${baseUrl}/check?org_name=${orgName}&name=${flagName}`, {
      method: 'GET'
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.enabled, true);
  });

  test('GET /check - returns 400 if org_name or name missing', async () => {
    const res1 = await fetch(`${baseUrl}/check?name=flag`, { method: 'GET' });
    assert.strictEqual(res1.status, 400);

    const res2 = await fetch(`${baseUrl}/check?org_name=org`, { method: 'GET' });
    assert.strictEqual(res2.status, 400);
  });

  test('GET /check - returns 404 if org does not exist', async () => {
    const res = await fetch(`${baseUrl}/check?org_name=NonExistentOrgName&name=flag`, { method: 'GET' });
    assert.strictEqual(res.status, 404);
  });

  test('POST / - returns 400 if flag name is missing', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({}),
    });
    assert.strictEqual(res.status, 400);
  });

  test('POST / - returns 400 if flag name contains uppercase letters or spaces', async () => {
    const res1 = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({ name: 'UppercaseFlag' }),
    });
    assert.strictEqual(res1.status, 400);

    const res2 = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({ name: 'flag with spaces' }),
    });
    assert.strictEqual(res2.status, 400);

    const res3 = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({ name: 'ab' }),
    });
    assert.strictEqual(res3.status, 400);
    const data3 = await res3.json();
    assert.ok(data3.error.includes('at least 3 characters'));
  });

  test('GET /:id - returns flag by ID and handles 404', async () => {
    // 200 success
    const res = await fetch(`${baseUrl}/${createdFlagId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${orgAdminToken1}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.id, createdFlagId);

    // 404 not found
    const notFoundRes = await fetch(`${baseUrl}/999999`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${orgAdminToken1}` }
    });
    assert.strictEqual(notFoundRes.status, 404);
  });

  test('PUT /:id - updates flag and handles 404', async () => {
    // 400 validation error (uppercase)
    const badRes = await fetch(`${baseUrl}/${createdFlagId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({ name: 'UppercaseFlag' })
    });
    assert.strictEqual(badRes.status, 400);

    // 200 success
    const res = await fetch(`${baseUrl}/${createdFlagId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({ enabled: false })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.enabled, false);

    // 404 not found
    const notFoundRes = await fetch(`${baseUrl}/999999`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({ enabled: false })
    });
    assert.strictEqual(notFoundRes.status, 404);
  });

  test('DELETE /:id - deletes flag and handles 404', async () => {
    // 404 not found
    const notFoundRes = await fetch(`${baseUrl}/999999`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${orgAdminToken1}` }
    });
    assert.strictEqual(notFoundRes.status, 404);

    // 200 success
    const res = await fetch(`${baseUrl}/${createdFlagId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${orgAdminToken1}` }
    });
    assert.strictEqual(res.status, 200);
  });

  test('POST / - returns 400 flag name already exists (unique constraint)', async () => {
    const dupFlagName = `dupFlag_${Date.now()}`;
    // Create first flag
    await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({ name: dupFlagName, enabled: true }),
    });

    // Create second flag (duplicate)
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({ name: dupFlagName, enabled: true }),
    });
    assert.strictEqual(res.status, 400);
  });

  test('PUT /:id - returns 400 flag name already exists (unique constraint)', async () => {
    const f1Name = `f1_${Date.now()}`;
    const f2Name = `f2_${Date.now()}`;
    // Create flag 1
    await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({ name: f1Name, enabled: true }),
    });

    // Create flag 2
    const create2 = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({ name: f2Name, enabled: true }),
    });
    const { data: created2 } = await create2.json();

    // Update flag 2 to flag 1 (duplicate)
    const res = await fetch(`${baseUrl}/${created2.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orgAdminToken1}`
      },
      body: JSON.stringify({ name: f1Name }),
    });
    assert.strictEqual(res.status, 400);
  });

  test('Internal Server Errors (500) on Flag endpoints', async () => {
    const originalGet = db.get;
    const originalAll = db.all;
    const originalRun = db.run;

    try {
      db.get = () => { throw new Error("Mock database error"); };
      db.all = () => { throw new Error("Mock database error"); };
      db.run = () => { throw new Error("Mock database error"); };

      // check endpoint error
      const checkRes = await fetch(`${baseUrl}/check?org_name=${orgName}&name=feature_flag`);
      assert.strictEqual(checkRes.status, 500);

      // POST create flag error
      const createRes = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${orgAdminToken1}`
        },
        body: JSON.stringify({ name: 'error_flag' }),
      });
      assert.strictEqual(createRes.status, 500);

      // GET list flags error
      const listRes = await fetch(baseUrl, {
        headers: { 'Authorization': `Bearer ${orgAdminToken1}` }
      });
      assert.strictEqual(listRes.status, 500);

      // GET flag by ID error
      const getRes = await fetch(`${baseUrl}/123`, {
        headers: { 'Authorization': `Bearer ${orgAdminToken1}` }
      });
      assert.strictEqual(getRes.status, 500);

      // PUT update flag error
      const updateRes = await fetch(`${baseUrl}/123`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${orgAdminToken1}`
        },
        body: JSON.stringify({ name: 'new_name' }),
      });
      assert.strictEqual(updateRes.status, 500);

      // DELETE flag error
      const deleteRes = await fetch(`${baseUrl}/123`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${orgAdminToken1}` }
      });
      assert.strictEqual(deleteRes.status, 500);

    } finally {
      db.get = originalGet;
      db.all = originalAll;
      db.run = originalRun;
    }
  });

});
