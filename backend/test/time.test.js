const request = require('supertest');
const app = require('../src/index');
const db = require('../src/db');
const bcrypt = require('bcryptjs');

describe('Time entry flow', () => {
  let cookie;
  beforeAll(async () => {
    const email = 'emp2@localhost';
    const existing = db.get('SELECT * FROM "User" WHERE email = ?', [email]);
    if (!existing) {
      const hash = await bcrypt.hash('secret', 10);
      db.createUser({ name: 'Emp2', email, password: hash, role: 'USER' });
    }

    const res = await request(app).post('/auth/login').send({ email: 'emp2@localhost', password: 'secret' });
    cookie = res.headers['set-cookie'];
  });

  it('can clock IN and OUT and retrieve history', async () => {
    const resIn = await request(app).post('/time/clock-in').set('Cookie', cookie).send({ type: 'IN' });
    expect(resIn.status).toBe(201);
    expect(resIn.body.type).toBe('IN');

    const resOut = await request(app).post('/time/clock-in').set('Cookie', cookie).send({ type: 'OUT' });
    expect(resOut.status).toBe(201);
    expect(resOut.body.type).toBe('OUT');

    const hist = await request(app).get('/time/history').set('Cookie', cookie);
    expect(hist.status).toBe(200);
    expect(Array.isArray(hist.body)).toBe(true);
    // at least two entries exist (IN and OUT)
    const types = hist.body.map(r => r.type);
    expect(types.slice(-2)).toEqual(['IN','OUT']);
  });
});
