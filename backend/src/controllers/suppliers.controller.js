const { pool } = require('../config/database');

const allowedStatuses = ['ativo', 'inativo'];

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSupplierData(data, isCreating = true) {
  const errors = [];

  if (isCreating || data.nome !== undefined) {
    const nome = typeof data.nome === 'string' ? data.nome.trim() : '';

    if (nome.length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres.');
    }
  }

  if (data.email) {
    const email = typeof data.email === 'string' ? data.email.trim() : '';

    if (!validateEmail(email)) {
      errors.push('Email inválido.');
    }
  }

  if (data.status !== undefined && !allowedStatuses.includes(data.status)) {
    errors.push('Status deve ser ativo ou inativo.');
  }

  return errors;
}

async function findSupplierById(id) {
  const [suppliers] = await pool.execute(
    `SELECT id, nome, cnpj_cpf, email, telefone, endereco, status, created_at, updated_at
     FROM suppliers
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return suppliers[0];
}

async function listSuppliers(req, res) {
  const { search, status } = req.query;
  const where = [];
  const values = [];

  if (search) {
    where.push('(nome LIKE ? OR cnpj_cpf LIKE ? OR email LIKE ? OR telefone LIKE ?)');
    values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status) {
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status deve ser ativo ou inativo.' });
    }

    where.push('status = ?');
    values.push(status);
  }

  const sql = `SELECT id, nome, cnpj_cpf, email, telefone, endereco, status, created_at, updated_at
               FROM suppliers
               ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY nome ASC`;

  const [suppliers] = await pool.execute(sql, values);

  return res.json(suppliers);
}

async function getSupplierById(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de fornecedor inválido.' });
  }

  const supplier = await findSupplierById(id);

  if (!supplier) {
    return res.status(404).json({ message: 'Fornecedor não encontrado.' });
  }

  return res.json(supplier);
}

async function createSupplier(req, res) {
  const errors = validateSupplierData(req.body, true);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  const nome = req.body.nome.trim();
  const cnpjCpf = req.body.cnpj_cpf?.trim() || null;
  const email = req.body.email?.trim().toLowerCase() || null;
  const telefone = req.body.telefone?.trim() || null;
  const endereco = req.body.endereco?.trim() || null;
  const status = req.body.status || 'ativo';

  const [result] = await pool.execute(
    `INSERT INTO suppliers (nome, cnpj_cpf, email, telefone, endereco, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, cnpjCpf, email, telefone, endereco, status]
  );

  const supplier = await findSupplierById(result.insertId);

  return res.status(201).json(supplier);
}

async function updateSupplier(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de fornecedor inválido.' });
  }

  const supplier = await findSupplierById(id);

  if (!supplier) {
    return res.status(404).json({ message: 'Fornecedor não encontrado.' });
  }

  const errors = validateSupplierData(req.body, false);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  const fields = [];
  const values = [];

  if (req.body.nome !== undefined) {
    fields.push('nome = ?');
    values.push(req.body.nome.trim());
  }

  if (req.body.cnpj_cpf !== undefined) {
    fields.push('cnpj_cpf = ?');
    values.push(req.body.cnpj_cpf?.trim() || null);
  }

  if (req.body.email !== undefined) {
    fields.push('email = ?');
    values.push(req.body.email?.trim().toLowerCase() || null);
  }

  if (req.body.telefone !== undefined) {
    fields.push('telefone = ?');
    values.push(req.body.telefone?.trim() || null);
  }

  if (req.body.endereco !== undefined) {
    fields.push('endereco = ?');
    values.push(req.body.endereco?.trim() || null);
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
    `UPDATE suppliers
     SET ${fields.join(', ')}
     WHERE id = ?`,
    values
  );

  const updatedSupplier = await findSupplierById(id);

  return res.json(updatedSupplier);
}

async function deleteSupplier(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de fornecedor inválido.' });
  }

  const supplier = await findSupplierById(id);

  if (!supplier) {
    return res.status(404).json({ message: 'Fornecedor não encontrado.' });
  }

  await pool.execute(
    `UPDATE suppliers
     SET status = 'inativo'
     WHERE id = ?`,
    [id]
  );

  return res.json({ message: 'Fornecedor inativado com sucesso.' });
}

module.exports = {
  listSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
