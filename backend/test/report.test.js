const request = require('supertest');
const app = require('../src/index');
const db = require('../src/db');
const bcrypt = require('bcryptjs');

describe('Reports CSV', () => {
  let adminCookie;
  let userId;

  beforeAll(async () => {
    // ensure admin exists
    const adminEmail = 'admin@localhost';
    const admin = await db.get('SELECT * FROM "User" WHERE email = ?', [adminEmail]);
    
    if (!admin) {
      const hash = await bcrypt.hash('senha123', 10);
      await db.createUser({ name: 'Admin', email: adminEmail, password: hash, role: 'ADMIN' });
    }

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@localhost', password: 'senha123' });
    
    adminCookie = res.headers['set-cookie'];

    // ensure a target user exists with some entries
    const email = 'reportuser@localhost';
    const existing = await db.get('SELECT * FROM "User" WHERE email = ?', [email]);
    
    if (!existing) {
      const hash = await bcrypt.hash('pw', 10);
      await db.createUser({ name: 'ReportUser', email, password: hash, role: 'USER' });
    }

    const user = await db.get('SELECT * FROM "User" WHERE email = ?', [email]);
    userId = user.id;

    // cleanup & insert entries
    await db.run('DELETE FROM "TimeEntry" WHERE userId = ?', [userId]);
    await db.run('INSERT INTO "TimeEntry"(timestamp,type,userId) VALUES (?,?,?)', 
      ['2025-01-01T08:00:00.000Z', 'IN', userId]);
    await db.run('INSERT INTO "TimeEntry"(timestamp,type,userId) VALUES (?,?,?)', 
      ['2025-01-01T12:00:00.000Z', 'OUT', userId]);
  });

  it('returns CSV for given user and date range', async () => {
    const res = await request(app)
      .get('/reports/csv')
      .query({ 
        userId, 
        startDate: '2025-01-01T00:00:00.000Z', 
        endDate: '2025-01-02T00:00:00.000Z' 
      })
      .set('Cookie', adminCookie)
      .expect(200)
      .expect('Content-Type', /text\/csv/)
      .expect('Content-Disposition', /attachment; filename="report.csv"/);

    // basic CSV validation: header and two rows
    const text = res.text;
    const lines = text.trim().split('\n');
    const header = lines[0] || '';
    
    expect(header).toMatch(/id/);
    expect(header).toMatch(/timestamp/);
    expect(header).toMatch(/type/);
    expect(lines.length).toBeGreaterThanOrEqual(3); // header + 2 data rows
  });
});