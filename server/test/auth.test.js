import test from 'node:test';
import assert from 'node:assert';
import app from '../server.js';
import db from '../services/db.js';

let server;
let baseUrl;
let orgId;
let inviteCode;
const uniquePrefix = Date.now().toString();
const orgName = `Auth Test Org ${uniquePrefix}`;
const testEmail = `test_${uniquePrefix}@byepo.com`;

test.before(async () => {
    // Wait for table to be created
    await new Promise(resolve => setTimeout(resolve, 500));

    await new Promise((resolve) => {
        server = app.listen(0, () => {
            const port = server.address().port;
            baseUrl = `http://localhost:${port}/_api`;
            resolve();
        });
    });

    // Create a mock organization for tests
    const res = await db.run("INSERT INTO org (name, inviteCode) VALUES (?, ?)", [orgName, 'AUTHINVITE']);
    orgId = res.lastID;
    inviteCode = 'AUTHINVITE';
});

test.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await db.close();
});

test.describe('Auth Routes', () => {

    test('POST /signup - fails with missing fields', async () => {
        const res = await fetch(`${baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail }),
        });
        assert.strictEqual(res.status, 400);
    });

    test('POST /signup - fails with invalid invite code', async () => {
        const res = await fetch(`${baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: 'pass', orgId, inviteCode: 'WRONGCODE' }),
        });
        assert.strictEqual(res.status, 400);
        const data = await res.json();
        assert.strictEqual(data.error, 'Invalid invite code');
    });

    test('POST /signup - succeeds with valid data', async () => {
        const res = await fetch(`${baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: 'pass', orgId, inviteCode }),
        });
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.strictEqual(data.success, true);
        assert.ok(data.token);
    });

    test('POST /signup - fails if email is already registered', async () => {
        const org = await db.get("SELECT inviteCode FROM org WHERE id = ?", [orgId]);
        const res = await fetch(`${baseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: 'pass2', orgId, inviteCode: org.inviteCode }),
        });
        assert.strictEqual(res.status, 400);
        const data = await res.json();
        assert.strictEqual(data.error, 'Email already registered');
    });

    test('POST /login - succeeds for super admin with valid credentials', async () => {
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@byepo.com', password: 'admin123' }),
        });
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.strictEqual(data.success, true);
        assert.strictEqual(data.user.role, 'super_admin');
    });

    test('POST /login - fails for org admin without orgId', async () => {
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: 'pass' }),
        });
        assert.strictEqual(res.status, 400);
    });

    test('POST /login - fails with invalid password for org admin', async () => {
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: 'wrongpassword', orgId }),
        });
        assert.strictEqual(res.status, 401);
    });

    test('POST /login - succeeds for org admin with valid credentials', async () => {
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password: 'pass', orgId }),
        });
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.strictEqual(data.success, true);
        assert.ok(data.token);
    });

    test('POST /login - fails with missing fields', async () => {
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail }),
        });
        assert.strictEqual(res.status, 400);
        const data = await res.json();
        assert.strictEqual(data.error, 'Email and password are required');
    });

    test('POST /signup - handles server error', async () => {
        const originalGet = db.get;
        db.get = () => { throw new Error("Mocked database error"); };
        try {
            const res = await fetch(`${baseUrl}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'err@byepo.com', password: 'pass', orgId, inviteCode }),
            });
            assert.strictEqual(res.status, 500);
        } finally {
            db.get = originalGet;
        }
    });

    test('POST /login - handles server error', async () => {
        const originalGet = db.get;
        db.get = () => { throw new Error("Mocked database error"); };
        try {
            const res = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: testEmail, password: 'pass', orgId }),
            });
            assert.strictEqual(res.status, 500);
        } finally {
            db.get = originalGet;
        }
    });

    test('Unit Test - validate utility handles null object and default message', async () => {
        const { validate, BadRequestError } = await import('../utils/errors.js');
        assert.throws(() => validate(null, ['field']), (err) => {
            return err instanceof BadRequestError && err.message === 'Request body/query is missing';
        });
        assert.throws(() => validate({}, ['field']), (err) => {
            return err instanceof BadRequestError && err.message === 'Missing required fields: field';
        });
    });

    test('Unit Test - shared validators work as expected', async () => {
        const { isValidOrgName, isValidFlagName, isCertainValue } = await import('../../shared/validators.js');
        
        // Org Name tests
        assert.strictEqual(isValidOrgName('MyOrg'), true);
        assert.strictEqual(isValidOrgName('My Org'), false);
        assert.strictEqual(isValidOrgName(''), false);
        assert.strictEqual(isValidOrgName(null), false);

        // Flag Name tests
        assert.strictEqual(isValidFlagName('my-flag_1'), true);
        assert.strictEqual(isValidFlagName('My-Flag'), false);
        assert.strictEqual(isValidFlagName('my flag'), false);
        assert.strictEqual(isValidFlagName(''), false);
        assert.strictEqual(isValidFlagName(null), false);

        // Certain value tests
        assert.strictEqual(isCertainValue('active', ['active', 'inactive']), true);
        assert.strictEqual(isCertainValue('pending', ['active', 'inactive']), false);
        assert.strictEqual(isCertainValue('yes', 'yes'), true);
        assert.strictEqual(isCertainValue('no', 'yes'), false);
    });

});
