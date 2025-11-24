const timeService = require('../src/services/timeService');
const db = require('../src/db');
const bcrypt = require('bcryptjs');

describe('timeService business rules', () => {
  let userId;
  beforeAll(async () => {
    const email = 'tsuser@localhost';
    const existing = db.get('SELECT * FROM "User" WHERE email = ?', [email]);
    if (!existing) {
      const hash = await bcrypt.hash('pw', 10);
      db.createUser({ name: 'TSUser', email, password: hash, role: 'USER' });
      const u = db.get('SELECT * FROM "User" WHERE email = ?', [email]);
      userId = u.id;
    } else {
      userId = existing.id;
    }
    // clear time entries for this user
    db.run('DELETE FROM "TimeEntry" WHERE userId = ?', [userId]);
  });

  test('cannot OUT when there is no previous IN/RESUME', async () => {
    await expect(timeService.createEntry(userId, 'OUT')).rejects.toMatchObject({ message: expect.stringContaining('Cannot OUT') });
  });

  test('first IN is allowed', async () => {
    const res = await timeService.createEntry(userId, 'IN');
    expect(res.type).toBe('IN');
  });

  test('cannot IN twice in a row', async () => {
    await expect(timeService.createEntry(userId, 'IN')).rejects.toMatchObject({ message: expect.stringContaining('Cannot IN') });
  });

  test('can PAUSE after IN, can RESUME after PAUSE, can OUT after RESUME', async () => {
    const pause = await timeService.createEntry(userId, 'PAUSE');
    expect(pause.type).toBe('PAUSE');
    const resume = await timeService.createEntry(userId, 'RESUME');
    expect(resume.type).toBe('RESUME');
    const out = await timeService.createEntry(userId, 'OUT');
    expect(out.type).toBe('OUT');
  });
});
