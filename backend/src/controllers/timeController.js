const timeService = require('../services/timeService');
const db = require('../db.js');

async function clockIn(req, res) {
  try {
    const { type } = req.body || {};
    const userId = req.user && req.user.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    
    if (!type) {
      return res.status(400).json({ error: 'Tipo de registro é obrigatório' });
    }
    
    const created = await timeService.createEntry(userId, type);
    return res.status(201).json({ 
      success: true, 
      data: created,
      message: 'Ponto registrado com sucesso'
    });
  } catch (err) {
    const status = err && err.status ? err.status : 500;
    return res.status(status).json({ 
      success: false,
      error: err.message || 'Erro no servidor' 
    });
  }
}

async function history(req, res) {
  try {
    const userId = req.user && req.user.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    
    const { startDate, endDate } = req.query || {};
    let sql = 'SELECT id, timestamp, type FROM "TimeEntry" WHERE userId = ?';
    const params = [userId];
    
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
    
    return res.json({ 
      success: true, 
      data: rows 
    });
  } catch (err) {
    console.error('History error:', err);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar histórico' 
    });
  }
}

module.exports = { clockIn, history };
