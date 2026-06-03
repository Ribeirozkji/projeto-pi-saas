const { pool } = require('../config/database');

async function getDashboard(req, res) {
  const today = new Date().toISOString().slice(0, 10);

  const [productSummary] = await pool.execute(
    `SELECT
       COUNT(*) AS total_produtos,
       COALESCE(SUM(estoque_atual), 0) AS total_itens_estoque,
       COALESCE(SUM(CASE WHEN estoque_atual <= estoque_minimo THEN 1 ELSE 0 END), 0) AS produtos_estoque_baixo,
       COALESCE(SUM(
         CASE
           WHEN data_validade IS NOT NULL
            AND data_validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
           THEN 1
           ELSE 0
         END
       ), 0) AS produtos_proximos_vencimento
     FROM products`
  );

  const [salesSummary] = await pool.execute(
    `SELECT
       COUNT(*) AS vendas_do_dia,
       COALESCE(SUM(total), 0) AS faturamento_do_dia
     FROM sales
     WHERE status = 'finalizada'
       AND DATE(created_at) = ?`,
    [today]
  );

  const [dailySales] = await pool.execute(
    `SELECT
       DATE(created_at) AS data,
       COUNT(*) AS quantidade_vendas,
       COALESCE(SUM(total), 0) AS total_vendido
     FROM sales
     WHERE status = 'finalizada'
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY DATE(created_at)
     ORDER BY DATE(created_at) ASC`
  );

  const [topProducts] = await pool.execute(
    `SELECT
       p.id,
       p.sku,
       p.nome,
       COALESCE(SUM(si.quantidade), 0) AS quantidade_vendida,
       COALESCE(SUM(si.total_item), 0) AS total_vendido
     FROM sale_items si
     INNER JOIN sales s ON s.id = si.sale_id
     INNER JOIN products p ON p.id = si.product_id
     WHERE s.status = 'finalizada'
     GROUP BY p.id, p.sku, p.nome
     ORDER BY quantidade_vendida DESC, total_vendido DESC
     LIMIT 5`
  );

  const [monthlyMovements] = await pool.execute(
    `SELECT
       tipo,
       COALESCE(SUM(quantidade), 0) AS quantidade
     FROM stock_movements
     WHERE created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
     GROUP BY tipo
     ORDER BY tipo ASC`
  );

  return res.json({
    resumo: {
      ...productSummary[0],
      ...salesSummary[0]
    },
    vendas_por_dia: dailySales,
    produtos_mais_vendidos: topProducts,
    movimentacoes_mes: monthlyMovements
  });
}

module.exports = {
  getDashboard
};
