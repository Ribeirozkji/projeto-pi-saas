const { pool } = require('../config/database');

const allowedPaymentMethods = ['dinheiro', 'pix', 'cartao_debito', 'cartao_credito'];

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function toCents(value) {
  return Math.round(Number(value) * 100);
}

function centsToDecimal(cents) {
  return (cents / 100).toFixed(2);
}

function generateSaleNumber() {
  const now = new Date();
  const datePart = now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

  return `V${datePart}${randomPart}`;
}

function validateSaleData(data) {
  const errors = [];

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Informe ao menos um item para a venda.');
  }

  if (!allowedPaymentMethods.includes(data.forma_pagamento)) {
    errors.push('Forma de pagamento inválida.');
  }

  const desconto = Number(data.desconto || 0);

  if (!Number.isFinite(desconto) || desconto < 0) {
    errors.push('Desconto não pode ser negativo.');
  }

  if (Array.isArray(data.items)) {
    data.items.forEach((item, index) => {
      if (!isPositiveInteger(item.product_id)) {
        errors.push(`Produto inválido no item ${index + 1}.`);
      }

      if (!isPositiveInteger(item.quantidade)) {
        errors.push(`Quantidade inválida no item ${index + 1}.`);
      }
    });
  }

  return errors;
}

function validateCancelReason(reason) {
  const normalizedReason = typeof reason === 'string' ? reason.trim() : '';

  if (normalizedReason.length < 3) {
    return {
      error: 'Informe um motivo de cancelamento com pelo menos 3 caracteres.',
      reason: normalizedReason
    };
  }

  if (normalizedReason.length > 255) {
    return {
      error: 'Motivo de cancelamento deve ter no máximo 255 caracteres.',
      reason: normalizedReason
    };
  }

  return { reason: normalizedReason };
}

function normalizeItems(items) {
  const itemsByProduct = new Map();

  items.forEach((item) => {
    const productId = Number(item.product_id);
    const quantidade = Number(item.quantidade);
    const currentQuantity = itemsByProduct.get(productId) || 0;

    itemsByProduct.set(productId, currentQuantity + quantidade);
  });

  return Array.from(itemsByProduct.entries()).map(([productId, quantidade]) => ({
    product_id: productId,
    quantidade
  }));
}

async function getSaleDetails(saleId, executor = pool) {
  const [sales] = await executor.execute(
    `SELECT
       s.id,
       s.numero_venda,
       s.user_id,
       u.nome AS usuario_nome,
       s.subtotal,
       s.desconto,
       s.total,
       s.forma_pagamento,
       s.status,
       s.created_at,
       s.updated_at
     FROM sales s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.id = ?
     LIMIT 1`,
    [saleId]
  );

  if (sales.length === 0) {
    return null;
  }

  const [items] = await executor.execute(
    `SELECT
       si.id,
       si.sale_id,
       si.product_id,
       p.sku AS produto_sku,
       p.nome AS produto_nome,
       si.quantidade,
       si.preco_unitario,
       si.total_item,
       si.created_at
     FROM sale_items si
     INNER JOIN products p ON p.id = si.product_id
     WHERE si.sale_id = ?
     ORDER BY si.id ASC`,
    [saleId]
  );

  return {
    ...sales[0],
    items
  };
}

async function listSales(req, res) {
  const {
    status,
    start_date: startDate,
    end_date: endDate,
    forma_pagamento: paymentMethod
  } = req.query;

  const where = [];
  const values = [];

  if (status) {
    if (!['finalizada', 'cancelada'].includes(status)) {
      return res.status(400).json({ message: 'Status de venda inválido.' });
    }

    where.push('s.status = ?');
    values.push(status);
  }

  if (paymentMethod) {
    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Forma de pagamento inválida.' });
    }

    where.push('s.forma_pagamento = ?');
    values.push(paymentMethod);
  }

  if (startDate) {
    if (Number.isNaN(Date.parse(startDate))) {
      return res.status(400).json({ message: 'Data inicial inválida.' });
    }

    where.push('DATE(s.created_at) >= ?');
    values.push(startDate);
  }

  if (endDate) {
    if (Number.isNaN(Date.parse(endDate))) {
      return res.status(400).json({ message: 'Data final inválida.' });
    }

    where.push('DATE(s.created_at) <= ?');
    values.push(endDate);
  }

  const sql = `SELECT
                 s.id,
                 s.numero_venda,
                 s.user_id,
                 u.nome AS usuario_nome,
                 s.subtotal,
                 s.desconto,
                 s.total,
                 s.forma_pagamento,
                 s.status,
                 s.created_at,
                 s.updated_at
               FROM sales s
               INNER JOIN users u ON u.id = s.user_id
               ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY s.created_at DESC, s.id DESC`;

  const [sales] = await pool.execute(sql, values);

  return res.json(sales);
}

async function getSaleById(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de venda inválido.' });
  }

  const sale = await getSaleDetails(id);

  if (!sale) {
    return res.status(404).json({ message: 'Venda não encontrada.' });
  }

  return res.json(sale);
}

async function createSale(req, res) {
  const errors = validateSaleData(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos.', errors });
  }

  const items = normalizeItems(req.body.items);
  const descontoCents = toCents(req.body.desconto || 0);
  const currentUserId = req.user?.id || 1;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const productIds = items.map((item) => item.product_id);
    const placeholders = productIds.map(() => '?').join(', ');

    const [products] = await connection.execute(
      `SELECT id, sku, nome, preco_venda, estoque_atual, status
       FROM products
       WHERE id IN (${placeholders})
       FOR UPDATE`,
      productIds
    );

    if (products.length !== productIds.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Um ou mais produtos não foram encontrados.' });
    }

    const productsById = new Map(products.map((product) => [Number(product.id), product]));
    let subtotalCents = 0;
    const saleItems = [];

    for (const item of items) {
      const product = productsById.get(item.product_id);

      if (product.status !== 'ativo') {
        await connection.rollback();
        return res.status(400).json({ message: `Produto inativo: ${product.nome}.` });
      }

      if (Number(product.estoque_atual) <= 0) {
        await connection.rollback();
        return res.status(400).json({ message: `Produto sem estoque: ${product.nome}.` });
      }

      if (item.quantidade > Number(product.estoque_atual)) {
        await connection.rollback();
        return res.status(400).json({
          message: `Quantidade maior que o estoque disponível para o produto ${product.nome}.`,
          estoque_atual: Number(product.estoque_atual)
        });
      }

      const precoUnitarioCents = toCents(product.preco_venda);
      const totalItemCents = precoUnitarioCents * item.quantidade;
      subtotalCents += totalItemCents;

      saleItems.push({
        product,
        quantidade: item.quantidade,
        preco_unitario: centsToDecimal(precoUnitarioCents),
        total_item: centsToDecimal(totalItemCents)
      });
    }

    if (descontoCents > subtotalCents) {
      await connection.rollback();
      return res.status(400).json({ message: 'Desconto não pode ser maior que o subtotal.' });
    }

    const totalCents = subtotalCents - descontoCents;
    const numeroVenda = generateSaleNumber();

    const [saleResult] = await connection.execute(
      `INSERT INTO sales (numero_venda, user_id, subtotal, desconto, total, forma_pagamento, status)
       VALUES (?, ?, ?, ?, ?, ?, 'finalizada')`,
      [
        numeroVenda,
        currentUserId,
        centsToDecimal(subtotalCents),
        centsToDecimal(descontoCents),
        centsToDecimal(totalCents),
        req.body.forma_pagamento
      ]
    );

    for (const item of saleItems) {
      await connection.execute(
        `INSERT INTO sale_items (sale_id, product_id, quantidade, preco_unitario, total_item)
         VALUES (?, ?, ?, ?, ?)`,
        [
          saleResult.insertId,
          item.product.id,
          item.quantidade,
          item.preco_unitario,
          item.total_item
        ]
      );

      const estoqueAnterior = Number(item.product.estoque_atual);
      const estoquePosterior = estoqueAnterior - item.quantidade;

      await connection.execute(
        `UPDATE products
         SET estoque_atual = ?
         WHERE id = ?`,
        [estoquePosterior, item.product.id]
      );

      await connection.execute(
        `INSERT INTO stock_movements (
           product_id,
           user_id,
           tipo,
           quantidade,
           estoque_anterior,
           estoque_posterior,
           observacao
         ) VALUES (?, ?, 'venda', ?, ?, ?, ?)`,
        [
          item.product.id,
          currentUserId,
          item.quantidade,
          estoqueAnterior,
          estoquePosterior,
          `Saída automática referente à venda ${numeroVenda}.`
        ]
      );
    }

    const sale = await getSaleDetails(saleResult.insertId, connection);

    await connection.commit();

    return res.status(201).json(sale);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function cancelSale(req, res) {
  const { id } = req.params;
  const currentUserId = req.user?.id || 1;
  const { error: reasonError, reason: cancelReason } = validateCancelReason(
    req.body.motivo_cancelamento || req.body.cancel_reason
  );

  if (!isPositiveInteger(id)) {
    return res.status(400).json({ message: 'ID de venda inválido.' });
  }

  if (reasonError) {
    return res.status(400).json({ message: reasonError });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [sales] = await connection.execute(
      `SELECT id, numero_venda, status
       FROM sales
       WHERE id = ?
       LIMIT 1
       FOR UPDATE`,
      [id]
    );

    if (sales.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Venda não encontrada.' });
    }

    const sale = sales[0];

    if (sale.status === 'cancelada') {
      await connection.rollback();
      return res.status(400).json({ message: 'Venda já está cancelada.' });
    }

    const [items] = await connection.execute(
      `SELECT si.product_id, si.quantidade, p.nome AS produto_nome
       FROM sale_items si
       INNER JOIN products p ON p.id = si.product_id
       WHERE si.sale_id = ?`,
      [id]
    );

    for (const item of items) {
      const [products] = await connection.execute(
        `SELECT id, estoque_atual
         FROM products
         WHERE id = ?
         LIMIT 1
         FOR UPDATE`,
        [item.product_id]
      );

      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: `Produto da venda não encontrado: ${item.produto_nome}.` });
      }

      const product = products[0];
      const estoqueAnterior = Number(product.estoque_atual);
      const estoquePosterior = estoqueAnterior + Number(item.quantidade);

      await connection.execute(
        `UPDATE products
         SET estoque_atual = ?
         WHERE id = ?`,
        [estoquePosterior, item.product_id]
      );

      await connection.execute(
        `INSERT INTO stock_movements (
           product_id,
           user_id,
           tipo,
           quantidade,
           estoque_anterior,
           estoque_posterior,
           observacao
         ) VALUES (?, ?, 'devolucao', ?, ?, ?, ?)`,
        [
          item.product_id,
          currentUserId,
          item.quantidade,
          estoqueAnterior,
          estoquePosterior,
          `Estorno de estoque referente ao cancelamento da venda ${sale.numero_venda}.`
        ]
      );
    }

    try {
      await connection.execute(
        `UPDATE sales
         SET status = 'cancelada',
             cancel_reason = ?,
             canceled_by = ?,
             canceled_at = NOW()
         WHERE id = ?`,
        [cancelReason, currentUserId, id]
      );
    } catch (error) {
      if (error.code !== 'ER_BAD_FIELD_ERROR') {
        throw error;
      }

      await connection.execute(
        `UPDATE sales
         SET status = 'cancelada'
         WHERE id = ?`,
        [id]
      );
    }

    const canceledSale = await getSaleDetails(id, connection);

    await connection.commit();

    return res.json(canceledSale);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  listSales,
  getSaleById,
  createSale,
  cancelSale
};
