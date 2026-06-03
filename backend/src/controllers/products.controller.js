const { pool } = require('../config/database');

const allowedStatuses = ['ativo', 'inativo'];

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function parseNullablePositiveId(value, fieldName, errors) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (!isPositiveInteger(value)) {
    errors.push(`${fieldName} deve ser um ID válido.`);
    return null;
  }

  return Number(value);
}

function parseNonNegativeNumber(value, fieldName, errors) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    errors.push(`${fieldName} não pode ser negativo.`);
    return 0;
  }

  return numberValue;
}

function parseNonNegativeInteger(value, fieldName, errors) {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    errors.push(`${fieldName} deve ser um número inteiro maior ou igual a zero.`);
    return 0;
  }

  return numberValue;
}

function validateProductData(data, isCreating = true, existingProduct = null) {
  const errors = [];

  if (isCreating || data.sku !== undefined) {
    const sku = typeof data.sku === 'string' ? data.sku.trim() : '';

    if (!sku) {
      errors.push('SKU é obrigatório.');
    }
  }

  if (isCreating || data.nome !== undefined) {
    const nome = typeof data.nome === 'string' ? data.nome.trim() : '';

    if (nome.length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres.');
    }
  }


  let precoCusto = existingProduct ? Number(existingProduct.preco_custo) : 0;
  let precoVenda = existingProduct ? Number(existingProduct.preco_venda) : 0;

  if (isCreating || data.preco_custo !== undefined) {
    precoCusto = parseNonNegativeNumber(data.preco_custo, 'Preço de custo', errors);
  }

  if (isCreating || data.preco_venda !== undefined) {
    precoVenda = parseNonNegativeNumber(data.preco_venda, 'Preço de venda', errors);
  }

  if (precoVenda < precoCusto) {
    errors.push('Preço de venda não pode ser menor que o preço de custo.');
  }

  if (isCreating || data.estoque_atual !== undefined) {
    parseNonNegativeInteger(data.estoque_atual, 'Estoque atual', errors);
  }

  if (isCreating || data.estoque_minimo !== undefined) {
    parseNonNegativeInteger(data.estoque_minimo, 'Estoque mínimo', errors);
  }

  if (data.status !== undefined && !allowedStatuses.includes(data.status)) {
    errors.push('Status deve ser ativo ou inativo.');
  }

  if (data.data_validade && Number.isNaN(Date.parse(data.data_validade))) {
    errors.push('Data de validade inválida.');
  }

  return errors;
}

async function findProductById(id) {
  const [products] = await pool.execute(
    `SELECT
       p.id,
       p.sku,
       p.nome,
       p.descricao,
       p.category_id,
       c.nome AS categoria_nome,
       p.supplier_id,
       s.nome AS fornecedor_nome,
       p.preco_custo,
       p.preco_venda,
       p.estoque_atual,
       p.estoque_minimo,
       p.data_validade,
       p.status,
       p.created_at,
       p.updated_at
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN suppliers s ON s.id = p.supplier_id
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );

  return products[0];
}

async function ensureRelatedRecordsExist(categoryId, supplierId) {
  const errors = [];

  if (categoryId) {
    const [categories] = await pool.execute(
      `SELECT id
       FROM categories
       WHERE id = ?
       LIMIT 1`,
      [categoryId]
    );

    if (categories.length === 0) {
      errors.push('Categoria não encontrada.');
    }
  }

  if (supplierId) {
    const [suppliers] = await pool.execute(
      `SELECT id
       FROM suppliers
       WHERE id = ?
       LIMIT 1`,
      [supplierId]
    );

    if (suppliers.length === 0) {
      errors.push('Fornecedor não encontrado.');
    }
  }

  return errors;
}

async function listProducts(req, res) {
  const {
    search,
    status,
    category_id: categoryId,
    supplier_id: supplierId,
    low_stock: lowStock,
    near_expiration: nearExpiration,
    expiration_days: expirationDays
  } = req.query;

  const where = [];
  const values = [];

  if (search) {
    where.push('(p.sku LIKE ? OR p.nome LIKE ? OR p.descricao LIKE ?)');
    values.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status) {
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status deve ser ativo ou inativo.' });
    }

    where.push('p.status = ?');
    values.push(status);
  }

  if (categoryId) {
    if (!isPositiveInteger(categoryId)) {
      return res.status(400).json({ message: 'Categoria deve ser um ID válido.' });
    }

    where.push('p.category_id = ?');
    values.push(Number(categoryId));
  }

  if (supplierId) {
    if (!isPositiveInteger(supplierId)) {
      return res.status(400).json({ message: 'Fornecedor deve ser um ID válido.' });
    }

    where.push('p.supplier_id = ?');
    values.push(Number(supplierId));
  }

  if (lowStock === 'true') {
    where.push('p.estoque_atual <= p.estoque_minimo');
  }

  if (nearExpiration === 'true') {
    const days = Number.isInteger(Number(expirationDays)) && Number(expirationDays) > 0
      ? Number(expirationDays)
      : 30;

    where.push('p.data_validade IS NOT NULL AND p.data_validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)');
    values.push(days);
  }

  const sql = `SELECT
                 p.id,
                 p.sku,
                 p.nome,
                 p.descricao,
                 p.category_id,
                 c.nome AS categoria_nome,
                 p.supplier_id,
                 s.nome AS fornecedor_nome,
                 p.preco_custo,
                 p.preco_venda,
                 p.estoque_atual,
                 p.estoque_minimo,
                 p.data_validade,
                 p.status,
                 p.created_at,
                 p.updated_at
               FROM products p
               LEFT JOIN categories c ON c.id = p.category_id
               LEFT JOIN suppliers s ON s.id = p.supplier_id
               ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY p.nome ASC`;

  const [products] = await pool.execute(sql, values);

  return res.json(products);
}

async function getProductById(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de produto inválido.' });
  }

  const product = await findProductById(id);

  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado.' });
  }

  return res.json(product);
}

async function createProduct(req, res) {
  const errors = validateProductData(req.body, true);

  const categoryId = parseNullablePositiveId(req.body.category_id, 'Categoria', errors);
  const supplierId = parseNullablePositiveId(req.body.supplier_id, 'Fornecedor', errors);

  if (errors.length === 0) {
    errors.push(...await ensureRelatedRecordsExist(categoryId, supplierId));
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  const sku = req.body.sku.trim();
  const nome = req.body.nome.trim();
  const descricao = req.body.descricao?.trim() || null;
  const precoCusto = Number(req.body.preco_custo);
  const precoVenda = Number(req.body.preco_venda);
  const estoqueAtual = Number(req.body.estoque_atual);
  const estoqueMinimo = Number(req.body.estoque_minimo);
  const dataValidade = req.body.data_validade || null;
  const status = req.body.status || 'ativo';

  const [result] = await pool.execute(
    `INSERT INTO products (
       sku,
       nome,
       descricao,
       category_id,
       supplier_id,
       preco_custo,
       preco_venda,
       estoque_atual,
       estoque_minimo,
       data_validade,
       status
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sku,
      nome,
      descricao,
      categoryId,
      supplierId,
      precoCusto,
      precoVenda,
      estoqueAtual,
      estoqueMinimo,
      dataValidade,
      status
    ]
  );

  const product = await findProductById(result.insertId);

  return res.status(201).json(product);
}

async function updateProduct(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de produto inválido.' });
  }

  const product = await findProductById(id);

  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado.' });
  }

  const errors = validateProductData(req.body, false, product);
  const categoryId = req.body.category_id !== undefined
    ? parseNullablePositiveId(req.body.category_id, 'Categoria', errors)
    : product.category_id;
  const supplierId = req.body.supplier_id !== undefined
    ? parseNullablePositiveId(req.body.supplier_id, 'Fornecedor', errors)
    : product.supplier_id;

  if (errors.length === 0) {
    errors.push(...await ensureRelatedRecordsExist(categoryId, supplierId));
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  const fields = [];
  const values = [];

  if (req.body.sku !== undefined) {
    fields.push('sku = ?');
    values.push(req.body.sku.trim());
  }

  if (req.body.nome !== undefined) {
    fields.push('nome = ?');
    values.push(req.body.nome.trim());
  }

  if (req.body.descricao !== undefined) {
    fields.push('descricao = ?');
    values.push(req.body.descricao?.trim() || null);
  }

  if (req.body.category_id !== undefined) {
    fields.push('category_id = ?');
    values.push(categoryId);
  }

  if (req.body.supplier_id !== undefined) {
    fields.push('supplier_id = ?');
    values.push(supplierId);
  }

  if (req.body.preco_custo !== undefined) {
    fields.push('preco_custo = ?');
    values.push(Number(req.body.preco_custo));
  }

  if (req.body.preco_venda !== undefined) {
    fields.push('preco_venda = ?');
    values.push(Number(req.body.preco_venda));
  }

  if (req.body.estoque_atual !== undefined) {
    fields.push('estoque_atual = ?');
    values.push(Number(req.body.estoque_atual));
  }

  if (req.body.estoque_minimo !== undefined) {
    fields.push('estoque_minimo = ?');
    values.push(Number(req.body.estoque_minimo));
  }

  if (req.body.data_validade !== undefined) {
    fields.push('data_validade = ?');
    values.push(req.body.data_validade || null);
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
    `UPDATE products
     SET ${fields.join(', ')}
     WHERE id = ?`,
    values
  );

  const updatedProduct = await findProductById(id);

  return res.json(updatedProduct);
}

async function deleteProduct(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de produto inválido.' });
  }

  const product = await findProductById(id);

  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado.' });
  }

  await pool.execute(
    `UPDATE products
     SET status = 'inativo'
     WHERE id = ?`,
    [id]
  );

  return res.json({ message: 'Produto inativado com sucesso.' });
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
