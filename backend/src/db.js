const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '..', 'dev.db'); // uses existing dev.db created by Prisma
const db = new Database(dbPath);

module.exports = {
  run: (sql, params = []) => db.prepare(sql).run(...params),
  get: (sql, params = []) => db.prepare(sql).get(...params),
  all: (sql, params = []) => db.prepare(sql).all(...params),
  // A linha abaixo é a correção principal
  getUserByEmail: (email) => db.prepare('SELECT * FROM "User" WHERE email = ?').get(email),
  createUser: (user) => db.prepare('INSERT INTO "User"(name,email,password,role) VALUES (?,?,?,?)').run(user.name, user.email, user.password, user.role)
};
