const { pool } = require('../config/database');

const allowedStatuses = ['ativo', 'inativo'];

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function validateCategoryData(data, isCreating = true) {
  const errors = [];

  if (isCreating || data.nome !== undefined) {
    const nome = typeof data.nome === 'string' ? data.nome.trim() : '';

    if (nome.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres.');
    }
  }

  if (data.status !== undefined && !allowedStatuses.includes(data.status)) {
    errors.push('Status deve ser ativo ou inativo.');
  }

  return errors;
}

async function findCategoryById(id) {
  const [categories] = await pool.execute(
    `SELECT id, nome, descricao, status, created_at, updated_at
     FROM categories
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return categories[0];
}

async function listCategories(req, res) {
  const { search, status } = req.query;
  const where = [];
  const values = [];

  if (search) {
    where.push('(nome LIKE ? OR descricao LIKE ?)');
    values.push(`%${search}%`, `%${search}%`);
  }

  if (status) {
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status deve ser ativo ou inativo.' });
    }

    where.push('status = ?');
    values.push(status);
  }

  const sql = `SELECT id, nome, descricao, status, created_at, updated_at
               FROM categories
               ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY nome ASC`;

  const [categories] = await pool.execute(sql, values);

  return res.json(categories);
}

async function getCategoryById(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de categoria inválido.' });
  }

  const category = await findCategoryById(id);

  if (!category) {
    return res.status(404).json({ message: 'Categoria não encontrada.' });
  }

  return res.json(category);
}

async function createCategory(req, res) {
  const errors = validateCategoryData(req.body, true);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  const nome = req.body.nome.trim();
  const descricao = req.body.descricao?.trim() || null;
  const status = req.body.status || 'ativo';

  const [result] = await pool.execute(
    `INSERT INTO categories (nome, descricao, status)
     VALUES (?, ?, ?)`,
    [nome, descricao, status]
  );

  const category = await findCategoryById(result.insertId);

  return res.status(201).json(category);
}

async function updateCategory(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de categoria inválido.' });
  }

  const category = await findCategoryById(id);

  if (!category) {
    return res.status(404).json({ message: 'Categoria não encontrada.' });
  }

  const errors = validateCategoryData(req.body, false);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  const fields = [];
  const values = [];

  if (req.body.nome !== undefined) {
    fields.push('nome = ?');
    values.push(req.body.nome.trim());
  }

  if (req.body.descricao !== undefined) {
    fields.push('descricao = ?');
    values.push(req.body.descricao?.trim() || null);
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
    `UPDATE categories
     SET ${fields.join(', ')}
     WHERE id = ?`,
    values
  );

  const updatedCategory = await findCategoryById(id);

  return res.json(updatedCategory);
}

async function deleteCategory(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de categoria inválido.' });
  }

  const category = await findCategoryById(id);

  if (!category) {
    return res.status(404).json({ message: 'Categoria não encontrada.' });
  }

  await pool.execute(
    `UPDATE categories
     SET status = 'inativo'
     WHERE id = ?`,
    [id]
  );

  return res.json({ message: 'Categoria inativada com sucesso.' });
}

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
