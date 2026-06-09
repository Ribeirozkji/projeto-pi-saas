const { pool } = require('../config/database');

const entryTypes = ['compra', 'devolucao', 'ajuste_positivo'];
const exitTypes = ['venda', 'perda', 'ajuste_negativo'];
const movementTypes = [...entryTypes, ...exitTypes];

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function validateMovementData(data) {
  const errors = [];

  if (!isPositiveInteger(data.product_id)) {
    errors.push('Produto deve ser um ID válido.');
  }

  if (!movementTypes.includes(data.tipo)) {
    errors.push('Tipo de movimentação inválido.');
  }

  if (!isPositiveInteger(data.quantidade)) {
    errors.push('Quantidade deve ser um número inteiro maior que zero.');
  }

  return errors;
}

function isExitMovement(tipo) {
  return exitTypes.includes(tipo);
}

async function listMovements(req, res) {
  const {
    product_id: productId,
    tipo,
    start_date: startDate,
    end_date: endDate
  } = req.query;

  const where = [];
  const values = [];

  if (productId) {
    if (!isPositiveInteger(productId)) {
      return res.status(400).json({ message: 'Produto deve ser um ID válido.' });
    }

    where.push('sm.product_id = ?');
    values.push(Number(productId));
  }

  if (tipo) {
    if (!movementTypes.includes(tipo)) {
      return res.status(400).json({ message: 'Tipo de movimentação inválido.' });
    }

    where.push('sm.tipo = ?');
    values.push(tipo);
  }

  if (startDate) {
    if (Number.isNaN(Date.parse(startDate))) {
      return res.status(400).json({ message: 'Data inicial inválida.' });
    }

    where.push('DATE(sm.created_at) >= ?');
    values.push(startDate);
  }

  if (endDate) {
    if (Number.isNaN(Date.parse(endDate))) {
      return res.status(400).json({ message: 'Data final inválida.' });
    }

    where.push('DATE(sm.created_at) <= ?');
    values.push(endDate);
  }

  const sql = `SELECT
                 sm.id,
                 sm.product_id,
                 p.sku AS produto_sku,
                 p.nome AS produto_nome,
                 sm.user_id,
                 u.nome AS usuario_nome,
                 sm.tipo,
                 sm.quantidade,
                 sm.estoque_anterior,
                 sm.estoque_posterior,
                 sm.observacao,
                 sm.created_at
               FROM stock_movements sm
               INNER JOIN products p ON p.id = sm.product_id
               INNER JOIN users u ON u.id = sm.user_id
               ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY sm.created_at DESC, sm.id DESC`;

  const [movements] = await pool.execute(sql, values);

  return res.json(movements);
}

async function createMovement(req, res) {
  const errors = validateMovementData(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  const productId = Number(req.body.product_id);
  const tipo = req.body.tipo;
  const quantidade = Number(req.body.quantidade);
  const observacao = req.body.observacao?.trim() || null;
  const currentUserId = req.user?.id || 1;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [products] = await connection.execute(
      `SELECT id, nome, estoque_atual
       FROM products
       WHERE id = ?
       LIMIT 1
       FOR UPDATE`,
      [productId]
    );

    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    const product = products[0];
    const estoqueAnterior = Number(product.estoque_atual);
    const estoquePosterior = isExitMovement(tipo)
      ? estoqueAnterior - quantidade
      : estoqueAnterior + quantidade;

    if (estoquePosterior < 0) {
      await connection.rollback();
      return res.status(400).json({
        message: 'Saída não permitida. Quantidade maior que o estoque atual.',
        estoque_atual: estoqueAnterior
      });
    }

    await connection.execute(
      `UPDATE products
       SET estoque_atual = ?
       WHERE id = ?`,
      [estoquePosterior, productId]
    );

    const [result] = await connection.execute(
      `INSERT INTO stock_movements (
         product_id,
         user_id,
         tipo,
         quantidade,
         estoque_anterior,
         estoque_posterior,
         observacao
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        currentUserId,
        tipo,
        quantidade,
        estoqueAnterior,
        estoquePosterior,
        observacao
      ]
    );

    const [movements] = await connection.execute(
      `SELECT
         sm.id,
         sm.product_id,
         p.sku AS produto_sku,
         p.nome AS produto_nome,
         sm.user_id,
         u.nome AS usuario_nome,
         sm.tipo,
         sm.quantidade,
         sm.estoque_anterior,
         sm.estoque_posterior,
         sm.observacao,
         sm.created_at
       FROM stock_movements sm
       INNER JOIN products p ON p.id = sm.product_id
       INNER JOIN users u ON u.id = sm.user_id
       WHERE sm.id = ?
       LIMIT 1`,
      [result.insertId]
    );


    await connection.commit();

    return res.status(201).json(movements[0]);
  } catch (error) {
    await connection.rollback();
    error.statusCode = error.statusCode || 500;
    error.message = error.message || 'Erro ao registrar movimentação de estoque.';
    throw error;
  } finally {
    connection.release();
  }
}

async function listLowStock(req, res) {
  const [products] = await pool.execute(
    `SELECT
       p.id,
       p.sku,
       p.nome,
       p.estoque_atual,
       p.estoque_minimo,
       p.status,
       c.nome AS categoria_nome,
       s.nome AS fornecedor_nome
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN suppliers s ON s.id = p.supplier_id
     WHERE p.status = 'ativo'
       AND p.estoque_atual <= p.estoque_minimo
     ORDER BY p.estoque_atual ASC, p.nome ASC`
  );

  return res.json(products);
}

async function listNearExpiration(req, res) {
  const days = Number.isInteger(Number(req.query.days)) && Number(req.query.days) > 0
    ? Number(req.query.days)
    : 30;

  const [products] = await pool.execute(
    `SELECT
       p.id,
       p.sku,
       p.nome,
       p.estoque_atual,
       p.data_validade,
       p.status,
       c.nome AS categoria_nome,
       s.nome AS fornecedor_nome
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN suppliers s ON s.id = p.supplier_id
     WHERE p.status = 'ativo'
       AND p.data_validade IS NOT NULL
       AND p.data_validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
     ORDER BY p.data_validade ASC, p.nome ASC`,
    [days]
  );

  return res.json(products);
}

module.exports = {
  listMovements,
  createMovement,
  listLowStock,
  listNearExpiration
};
