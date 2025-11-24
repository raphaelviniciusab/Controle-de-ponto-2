const db = require('../db.js');
const bcrypt = require('bcrypt');

async function listUsers(req, res) {
  try {
    const users = db.all('SELECT id, name, email, role FROM "User"');
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('List users error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro ao listar usuários' 
    });
  }
}

async function getUser(req, res) {
  try {
    const { id } = req.params;
    const user = db.get('SELECT id, name, email, role, cpf, cargo, horarioPadrao FROM "User" WHERE id = ?', [id]);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      });
    }
    
    return res.json({ success: true, data: user });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar usuário' 
    });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, cpf, cargo, horarioPadrao, role = 'USER' } = req.body;
    
    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nome, email e senha são obrigatórios' 
      });
    }
    
    // Verificar se email já existe
    const existing = db.get('SELECT id FROM "User" WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email já cadastrado' 
      });
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Inserir usuário
    const result = db.run(
      'INSERT INTO "User" (name, email, password, cpf, cargo, horarioPadrao, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, cpf || null, cargo || null, horarioPadrao || null, role]
    );
    
    return res.status(201).json({ 
      success: true, 
      data: { 
        id: result.lastInsertRowid, 
        name, 
        email, 
        role 
      },
      message: 'Funcionário cadastrado com sucesso'
    });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro ao criar usuário' 
    });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, cpf, cargo, horarioPadrao, role, status } = req.body;
    
    // Verificar se usuário existe
    const user = db.get('SELECT id FROM "User" WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      });
    }
    
    // Construir query dinâmica
    const updates = [];
    const params = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (cpf !== undefined) {
      updates.push('cpf = ?');
      params.push(cpf);
    }
    if (cargo !== undefined) {
      updates.push('cargo = ?');
      params.push(cargo);
    }
    if (horarioPadrao !== undefined) {
      updates.push('horarioPadrao = ?');
      params.push(horarioPadrao);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nenhum campo para atualizar' 
      });
    }
    
    params.push(id);
    const query = `UPDATE "User" SET ${updates.join(', ')} WHERE id = ?`;
    
    db.run(query, params);
    
    return res.json({ 
      success: true, 
      message: 'Usuário atualizado com sucesso' 
    });
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro ao atualizar usuário' 
    });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    // Verificar se usuário existe
    const user = db.get('SELECT id FROM "User" WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      });
    }
    
    // Soft delete - apenas desativa o usuário
    db.run('UPDATE "User" SET status = ? WHERE id = ?', ['INATIVO', id]);
    
    return res.json({ 
      success: true, 
      message: 'Usuário desativado com sucesso' 
    });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro ao desativar usuário' 
    });
  }
}

module.exports = { 
  listUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser 
};
