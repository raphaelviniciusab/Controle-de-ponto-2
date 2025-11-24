const db = require('../db.js');

const ALLOWED = ['IN', 'PAUSE', 'RESUME', 'RETURN', 'OUT'];

function getLastEntry(userId) {
  // use id ordering to reliably get the most recently inserted entry
  return db.get('SELECT id, timestamp, type FROM "TimeEntry" WHERE userId = ? ORDER BY id DESC LIMIT 1', [userId]);
}

async function createEntry(userId, type) {
  if (!ALLOWED.includes(type)) {
    const err = new Error('Invalid type');
    err.status = 400;
    throw err;
  }

  const last = getLastEntry(userId);

  // Business rules:
  // - IN: allowed if first record OR last.type === 'OUT'
  // - OUT: allowed only if last.type === 'IN' or 'RESUME'/'RETURN'
  // - PAUSE: allowed only if last.type === 'IN' or 'RESUME'/'RETURN'
  // - RESUME/RETURN: allowed only if last.type === 'PAUSE'

  if (type === 'IN') {
    if (last && last.type !== 'OUT') {
      const err = new Error('Cannot IN unless last entry was OUT or this is the first entry');
      err.status = 400;
      throw err;
    }
  }

  if (type === 'OUT') {
    if (!last || (last.type !== 'IN' && last.type !== 'RESUME' && last.type !== 'RETURN')) {
      const err = new Error('Cannot OUT unless last entry was IN, RESUME or RETURN');
      err.status = 400;
      throw err;
    }
  }

  if (type === 'PAUSE') {
    if (!last || (last.type !== 'IN' && last.type !== 'RESUME' && last.type !== 'RETURN')) {
      const err = new Error('Cannot PAUSE unless last entry was IN, RESUME or RETURN');
      err.status = 400;
      throw err;
    }
  }

  if (type === 'RESUME' || type === 'RETURN') {
    if (!last || last.type !== 'PAUSE') {
      const err = new Error('Cannot RESUME/RETURN unless last entry was PAUSE');
      err.status = 400;
      throw err;
    }
  }

  const timestamp = new Date().toISOString();
  const result = db.run('INSERT INTO "TimeEntry"(timestamp, type, userId) VALUES (?,?,?)', [timestamp, type, userId]);
  return { id: result.lastInsertRowid, timestamp, type, userId };
}

module.exports = { getLastEntry, createEntry };
