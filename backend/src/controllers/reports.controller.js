const { pool } = require('../config/database');

function isPositiveInteger(value) {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function validateDate(value, fieldLabel, errors) {
  if (value && Number.isNaN(Date.parse(value))) {
    errors.push(`${fieldLabel} inválida.`);
  }
}

async function stockReport(req, res) {
  const {
    search,
    category_id: categoryId,
    status,
    low_stock: lowStock
  } = req.query;

  const errors = [];
  const where = [];
  const values = [];

  if (search) {
    where.push('(p.sku LIKE ? OR p.nome LIKE ? OR p.descricao LIKE ?)');
    values.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (categoryId) {
    if (!isPositiveInteger(categoryId)) {
      errors.push('Categoria deve ser um ID válido.');
    } else {
      where.push('p.category_id = ?');
      values.push(Number(categoryId));
    }
  }

  if (status) {
    if (!['ativo', 'inativo'].includes(status)) {
      errors.push('Status deve ser ativo ou inativo.');
    } else {
      where.push('p.status = ?');
      values.push(status);
    }
  }

  if (lowStock === 'true') {
    where.push('p.estoque_atual <= p.estoque_minimo');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Filtros inválidos.', errors });
  }

  const [items] = await pool.execute(
    `SELECT
       p.id,
       p.sku,
       p.nome,
       c.nome AS categoria_nome,
       s.nome AS fornecedor_nome,
       p.preco_custo,
       p.preco_venda,
       p.estoque_atual,
       p.estoque_minimo,
       (p.estoque_atual * p.preco_custo) AS valor_custo_total,
       (p.estoque_atual * p.preco_venda) AS valor_venda_total,
       p.data_validade,
       p.status
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN suppliers s ON s.id = p.supplier_id
     ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY p.nome ASC`,
    values
  );

  const summary = items.reduce((acc, item) => ({
    total_produtos: acc.total_produtos + 1,
    total_itens: acc.total_itens + Number(item.estoque_atual || 0),
    produtos_estoque_baixo: acc.produtos_estoque_baixo + (Number(item.estoque_atual) <= Number(item.estoque_minimo) ? 1 : 0),
    valor_custo_total: acc.valor_custo_total + Number(item.valor_custo_total || 0),
    valor_venda_total: acc.valor_venda_total + Number(item.valor_venda_total || 0)
  }), {
    total_produtos: 0,
    total_itens: 0,
    produtos_estoque_baixo: 0,
    valor_custo_total: 0,
    valor_venda_total: 0
  });

  return res.json({ summary, items });
}

async function movementsReport(req, res) {
  const {
    product_id: productId,
    tipo,
    start_date: startDate,
    end_date: endDate
  } = req.query;

  const errors = [];
  const where = [];
  const values = [];

  if (productId) {
    if (!isPositiveInteger(productId)) {
      errors.push('Produto deve ser um ID válido.');
    } else {
      where.push('sm.product_id = ?');
      values.push(Number(productId));
    }
  }

  if (tipo) {
    const validTypes = ['compra', 'devolucao', 'ajuste_positivo', 'venda', 'perda', 'ajuste_negativo'];

    if (!validTypes.includes(tipo)) {
      errors.push('Tipo de movimentação inválido.');
    } else {
      where.push('sm.tipo = ?');
      values.push(tipo);
    }
  }

  validateDate(startDate, 'Data inicial', errors);
  validateDate(endDate, 'Data final', errors);

  if (startDate) {
    where.push('DATE(sm.created_at) >= ?');
    values.push(startDate);
  }

  if (endDate) {
    where.push('DATE(sm.created_at) <= ?');
    values.push(endDate);
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Filtros inválidos.', errors });
  }

  const [items] = await pool.execute(
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
     ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY sm.created_at DESC, sm.id DESC`,
    values
  );

  const entryTypes = ['compra', 'devolucao', 'ajuste_positivo'];
  const summary = items.reduce((acc, item) => {
    const isEntry = entryTypes.includes(item.tipo);

    return {
      total_movimentacoes: acc.total_movimentacoes + 1,
      total_entradas: acc.total_entradas + (isEntry ? Number(item.quantidade) : 0),
      total_saidas: acc.total_saidas + (!isEntry ? Number(item.quantidade) : 0)
    };
  }, {
    total_movimentacoes: 0,
    total_entradas: 0,
    total_saidas: 0
  });

  return res.json({ summary, items });
}

async function salesReport(req, res) {
  const {
    status,
    forma_pagamento: paymentMethod,
    start_date: startDate,
    end_date: endDate
  } = req.query;

  const errors = [];
  const where = [];
  const values = [];

  if (status) {
    if (!['finalizada', 'cancelada'].includes(status)) {
      errors.push('Status de venda inválido.');
    } else {
      where.push('s.status = ?');
      values.push(status);
    }
  }

  if (paymentMethod) {
    const paymentMethods = ['dinheiro', 'pix', 'cartao_debito', 'cartao_credito'];

    if (!paymentMethods.includes(paymentMethod)) {
      errors.push('Forma de pagamento inválida.');
    } else {
      where.push('s.forma_pagamento = ?');
      values.push(paymentMethod);
    }
  }

  validateDate(startDate, 'Data inicial', errors);
  validateDate(endDate, 'Data final', errors);

  if (startDate) {
    where.push('DATE(s.created_at) >= ?');
    values.push(startDate);
  }

  if (endDate) {
    where.push('DATE(s.created_at) <= ?');
    values.push(endDate);
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Filtros inválidos.', errors });
  }

  const [items] = await pool.execute(
    `SELECT
       s.id,
       s.numero_venda,
       u.nome AS usuario_nome,
       s.subtotal,
       s.desconto,
       s.total,
       s.forma_pagamento,
       s.status,
       s.created_at
     FROM sales s
     INNER JOIN users u ON u.id = s.user_id
     ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY s.created_at DESC, s.id DESC`,
    values
  );

  const summary = items.reduce((acc, sale) => ({
    total_vendas: acc.total_vendas + 1,
    vendas_finalizadas: acc.vendas_finalizadas + (sale.status === 'finalizada' ? 1 : 0),
    vendas_canceladas: acc.vendas_canceladas + (sale.status === 'cancelada' ? 1 : 0),
    subtotal: acc.subtotal + Number(sale.subtotal || 0),
    descontos: acc.descontos + Number(sale.desconto || 0),
    faturamento: acc.faturamento + (sale.status === 'finalizada' ? Number(sale.total || 0) : 0)
  }), {
    total_vendas: 0,
    vendas_finalizadas: 0,
    vendas_canceladas: 0,
    subtotal: 0,
    descontos: 0,
    faturamento: 0
  });

  return res.json({ summary, items });
}

module.exports = {
  stockReport,
  movementsReport,
  salesReport
};
