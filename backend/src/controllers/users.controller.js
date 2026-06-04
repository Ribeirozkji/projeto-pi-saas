const bcrypt = require('bcrypt');

const { pool } = require('../config/database');

const allowedProfiles = ['admin', 'gerente', 'estoquista', 'operador'];
const allowedStatuses = ['ativo', 'inativo'];

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function validateUserData(data, isCreating = true) {
  const errors = [];

  if (isCreating || data.nome !== undefined) {
    const nome = typeof data.nome === 'string' ? data.nome.trim() : '';

    if (nome.length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres.');
    }
  }

  if (isCreating || data.email !== undefined) {
    const email = typeof data.email === 'string' ? data.email.trim() : '';

    if (!email || !validateEmail(email)) {
      errors.push('Email inválido.');
    }
  }

  if (isCreating || data.senha !== undefined) {
    if (!data.senha || data.senha.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres.');
    }
  }

  if (data.perfil !== undefined && !allowedProfiles.includes(data.perfil)) {
    errors.push('Perfil deve ser admin, gerente, estoquista ou operador.');
  }

  if (data.status !== undefined && !allowedStatuses.includes(data.status)) {
    errors.push('Status deve ser ativo ou inativo.');
  }

  return errors;
}

async function findUserById(id) {
  const [users] = await pool.execute(
    `SELECT id, nome, email, perfil, status, created_at, updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return users[0];
}

async function listUsers(req, res) {
  const [users] = await pool.execute(
    `SELECT id, nome, email, perfil, status, created_at, updated_at
     FROM users
     ORDER BY nome ASC`
  );

  return res.json(users);
}

async function createUser(req, res) {
  const errors = validateUserData(req.body, true);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  const nome = req.body.nome.trim();
  const email = req.body.email.trim().toLowerCase();
  const perfil = req.body.perfil || 'operador';
  const status = req.body.status || 'ativo';
  const hashedPassword = await bcrypt.hash(req.body.senha, 10);

  const [result] = await pool.execute(
    `INSERT INTO users (nome, email, senha, perfil, status)
     VALUES (?, ?, ?, ?, ?)`,
    [nome, email, hashedPassword, perfil, status]
  );

  const user = await findUserById(result.insertId);

  return res.status(201).json(user);
}

async function updateUser(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de usuário inválido.' });
  }

  const existingUser = await findUserById(id);

  if (!existingUser) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  const errors = validateUserData(req.body, false);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  const fields = [];
  const values = [];

  if (req.body.nome !== undefined) {
    fields.push('nome = ?');
    values.push(req.body.nome.trim());
  }

  if (req.body.email !== undefined) {
    fields.push('email = ?');
    values.push(req.body.email.trim().toLowerCase());
  }

  if (req.body.senha !== undefined) {
    fields.push('senha = ?');
    values.push(await bcrypt.hash(req.body.senha, 10));
  }

  if (req.body.perfil !== undefined) {
    fields.push('perfil = ?');
    values.push(req.body.perfil);
  }

  if (req.body.status !== undefined) {
    fields.push('status = ?');
    values.push(req.body.status);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Informe ao menos um campo para atualizar.' });
  }

  values.push(id);

  await pool.execute(
    `UPDATE users
     SET ${fields.join(', ')}
     WHERE id = ?`,
    values
  );

  const updatedUser = await findUserById(id);

  return res.json(updatedUser);
}

async function deleteUser(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de usuário inválido.' });
  }


  const existingUser = await findUserById(id);

  if (!existingUser) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  await pool.execute(
    `UPDATE users
     SET status = 'inativo'
     WHERE id = ?`,
    [id]
  );

  return res.json({ message: 'Usuário inativado com sucesso.' });
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser
};
