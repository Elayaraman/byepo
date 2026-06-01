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
      body: JSON.stringify({ name: 'Org1' }),
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
      body: JSON.stringify({ name: 'Org2' }),
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
      body: JSON.stringify({ name: 'Org3' }),
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'Forbidden: Super admin only');
  });

  test('POST / and GET / - creates organization and lists them', async () => {
    const orgName = `TestOrg_${Date.now()}`;

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

  test('GET /public/:name - returns organization by name', async () => {
    const orgName = `PublicOrg_${Date.now()}`;
    // Create it first
    await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: orgName }),
    });

    const res = await fetch(`${baseUrl}/public/${orgName}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.name, orgName);
    assert.ok(data.data.id);
  });

  test('GET /public/:name - returns 404 if organization name is invalid', async () => {
    const res = await fetch(`${baseUrl}/public/NonExistentOrgName`);
    assert.strictEqual(res.status, 404);
  });

  test('POST / - returns 400 if name is missing', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({}),
    });
    assert.strictEqual(res.status, 400);
  });

  test('POST / - returns 400 if name is not a single word', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: 'Invalid Space' }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'Organization name must be a single word (no spaces)');
  });

  test('PUT /:id - updates organization and handles validation/errors', async () => {
    const orgName = `UpdateOrg_${Date.now()}`;
    const createRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: orgName }),
    });
    const { data: created } = await createRes.json();

    // 400 invalid name (spaces)
    const badNameRes = await fetch(`${baseUrl}/${created.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: 'Invalid Space' }),
    });
    assert.strictEqual(badNameRes.status, 400);
    const badNameData = await badNameRes.json();
    assert.strictEqual(badNameData.error, 'Organization name must be a single word (no spaces)');

    // 400 missing name
    const badRes = await fetch(`${baseUrl}/${created.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({}),
    });
    assert.strictEqual(badRes.status, 400);

    // 404 not found
    const notFoundRes = await fetch(`${baseUrl}/999999`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: 'NewName' }),
    });
    assert.strictEqual(notFoundRes.status, 404);

    // 200 success
    const updatedName = `${orgName}_new`;
    const goodRes = await fetch(`${baseUrl}/${created.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: updatedName }),
    });
    assert.strictEqual(goodRes.status, 200);
    const goodData = await goodRes.json();
    assert.strictEqual(goodData.data.name, updatedName);
  });

  test('POST /:id/rotate-code - rotates invite code and handles 404', async () => {
    const orgName = `RotateOrg_${Date.now()}`;
    const createRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: orgName }),
    });
    const { data: created } = await createRes.json();

    // 404 not found
    const notFoundRes = await fetch(`${baseUrl}/999999/rotate-code`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    assert.strictEqual(notFoundRes.status, 404);

    // 200 success
    const res = await fetch(`${baseUrl}/${created.id}/rotate-code`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.notStrictEqual(data.data.inviteCode, created.inviteCode);
  });

  test('DELETE /:id - deletes organization successfully', async () => {
    const orgName = `DelOrg_${Date.now()}`;
    const createRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: orgName }),
    });
    const { data: created } = await createRes.json();

    const delRes = await fetch(`${baseUrl}/${created.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${superAdminToken}` }
    });
    assert.strictEqual(delRes.status, 200);
  });

  test('POST / - returns 400 organization name already exists (unique constraint)', async () => {
    const dupName = `DupOrg_${Date.now()}`;
    // First creation
    await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: dupName }),
    });
    // Second creation (duplicate)
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: dupName }),
    });
    assert.strictEqual(res.status, 400);
  });

  test('PUT /:id - returns 400 organization name already exists (unique constraint)', async () => {
    const name1 = `Org1_${Date.now()}`;
    const name2 = `Org2_${Date.now()}`;
    // Create org 1
    await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: name1 }),
    });
    // Create org 2
    const create2 = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: name2 }),
    });
    const { data: created2 } = await create2.json();

    // Update org 2 to have name 1 (duplicate)
    const res = await fetch(`${baseUrl}/${created2.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({ name: name1 }),
    });
    assert.strictEqual(res.status, 400);
  });

  test('GET / (Root) - returns Server is running', async () => {
    const rootUrl = new URL(baseUrl).origin;
    const res = await fetch(rootUrl);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.strictEqual(text, 'Server is running');
  });

  test('Internal Server Errors (500) on Org endpoints', async () => {
    const originalGet = db.get;
    const originalAll = db.all;
    const originalRun = db.run;

    try {
      db.get = () => { throw new Error("Mock database error"); };
      db.all = () => { throw new Error("Mock database error"); };
      db.run = () => { throw new Error("Mock database error"); };

      // public name endpoint error
      const publicRes = await fetch(`${baseUrl}/public/anyorg`);
      assert.strictEqual(publicRes.status, 500);

      // POST create org error
      const createRes = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({ name: 'ErrorOrg' }),
      });
      assert.strictEqual(createRes.status, 500);

      // GET list org error
      const listRes = await fetch(baseUrl, {
        headers: { 'Authorization': `Bearer ${superAdminToken}` },
      });
      assert.strictEqual(listRes.status, 500);

      // GET org error
      const getRes = await fetch(`${baseUrl}/123`, {
        headers: { 'Authorization': `Bearer ${superAdminToken}` },
      });
      assert.strictEqual(getRes.status, 500);

      // PUT org error
      const updateRes = await fetch(`${baseUrl}/123`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${superAdminToken}`,
        },
        body: JSON.stringify({ name: 'NewName' }),
      });
      assert.strictEqual(updateRes.status, 500);

      // DELETE org error
      const deleteRes = await fetch(`${baseUrl}/123`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${superAdminToken}` },
      });
      assert.strictEqual(deleteRes.status, 500);

      // rotate invite code error
      const rotateRes = await fetch(`${baseUrl}/123/rotate-code`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${superAdminToken}` },
      });
      assert.strictEqual(rotateRes.status, 500);

    } finally {
      db.get = originalGet;
      db.all = originalAll;
      db.run = originalRun;
    }
  });

});
