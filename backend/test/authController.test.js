const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const createAuthController = require('../src/controllers/authController');

describe('Auth controller', () => {
  it('returns a token cookie when credentials are correct', async () => {
    const plain = 'password123';
    const hashed = await bcrypt.hash(plain, 10);
    const mockRepo = {
      findUserByEmail: async (email) => ({ id: 1, email, password: hashed, role: 'user' }),
    };

    const { login } = createAuthController(mockRepo);
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.post('/auth/login', login);

    const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: plain });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 401 for incorrect credentials', async () => {
    const mockRepo = {
      findUserByEmail: async (email) => null,
    };

    const { login } = createAuthController(mockRepo);
    const app = express();
    app.use(express.json());
    app.post('/auth/login', login);

    const res = await request(app).post('/auth/login').send({ email: 'nope', password: 'x' });
    expect(res.status).toBe(401);
  });
});
