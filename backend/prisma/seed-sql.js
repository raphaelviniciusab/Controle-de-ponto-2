const bcrypt = require('bcryptjs');
const db = require('../src/db');
(async () => {
  const email = 'admin@localhost';
  const existing = db.getUserByEmail(email);
  if (!existing) {
    const hash = await bcrypt.hash('senha123', 10);
    db.createUser({ name: 'Admin', email, password: hash, role: 'ADMIN' });
    console.log('Admin created');
  } else {
    console.log('Admin already exists');
  }
})();
