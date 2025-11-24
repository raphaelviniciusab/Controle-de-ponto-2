const { Parser } = require('json2csv');
const db = require('../db.js');

async function csvReport(req, res) {
  try {
    const { userId, startDate, endDate } = req.query || {};
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    let sql = 'SELECT id, timestamp, type FROM "TimeEntry" WHERE userId = ?';
    const params = [Number(userId)];
    if (startDate && endDate) {
      sql += ' AND timestamp BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      sql += ' AND timestamp >= ?';
      params.push(startDate);
    } else if (endDate) {
      sql += ' AND timestamp <= ?';
      params.push(endDate);
    }
    sql += ' ORDER BY timestamp ASC';

    const rows = db.all(sql, params);

    const fields = ['id', 'timestamp', 'type'];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { csvReport };
