const request = require('supertest');
const app = require('../src/index');
const db = require('../src/db');
const bcrypt = require('bcryptjs');

describe('Users CRUD (admin only)', () => {
  let adminCookie;
  let userCookie;

  beforeAll(async () => {
    // ensure admin exists (seed-sql should have created it), but set known password
    const adminEmail = 'admin@localhost';
    const admin = db.get('SELECT * FROM "User" WHERE email = ?', [adminEmail]);
    if (!admin) {
      const hash = await bcrypt.hash('senha123', 10);
      db.createUser({ name: 'Admin', email: adminEmail, password: hash, role: 'ADMIN' });
    }

    // login admin to get cookie
    const res = await request(app).post('/auth/login').send({ email: 'admin@localhost', password: 'senha123' });
    adminCookie = res.headers['set-cookie'];
  });

  it('admin can list users', async () => {
    const res = await request(app).get('/users').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('non-admin cannot access users endpoints', async () => {
    // create non-admin user directly in DB
    const email = 'user1@localhost';
    const hash = await bcrypt.hash('userpass', 10);
    const existing = db.get('SELECT * FROM "User" WHERE email = ?', [email]);
    if (!existing) db.createUser({ name: 'User1', email, password: hash, role: 'USER' });

    // login non-admin
    const resLogin = await request(app).post('/auth/login').send({ email, password: 'userpass' });
    userCookie = resLogin.headers['set-cookie'];

    const res = await request(app).get('/users').set('Cookie', userCookie);
    expect(res.status).toBe(403);
  });
});
