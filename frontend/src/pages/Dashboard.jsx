import { useEffect, useMemo, useState } from 'react';

import Alert from '../components/Alert.jsx';
import Badge from '../components/Badge.jsx';
import Card from '../components/Card.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Table from '../components/Table.jsx';
import api from '../services/api.js';
import { formatCurrency, formatDate, todayISO } from '../utils/formatters.js';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [nearExpiration, setNearExpiration] = useState([]);
  const [salesToday, setSalesToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const today = todayISO();
        const [productsResponse, lowStockResponse, nearExpirationResponse, salesResponse] = await Promise.all([
          api.get('/products'),
          api.get('/stock/low-stock'),
          api.get('/stock/near-expiration?days=30'),
          api.get(`/sales?start_date=${today}&end_date=${today}&status=finalizada`)
        ]);

        setProducts(productsResponse.data);
        setLowStock(lowStockResponse.data);
        setNearExpiration(nearExpirationResponse.data);
        setSalesToday(salesResponse.data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Não foi possível carregar os indicadores do dashboard.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const totalItems = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.estoque_atual || 0), 0),
    [products]
  );

  const dailyRevenue = useMemo(
    () => salesToday.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
    [salesToday]
  );

  const lowStockColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'nome', label: 'Produto' },
    { key: 'estoque_atual', label: 'Atual' },
    { key: 'estoque_minimo', label: 'Mínimo' },
    { key: 'status', label: 'Status', render: () => <Badge variant="alerta">Baixo</Badge> }
  ];

  const expirationColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'nome', label: 'Produto' },
    { key: 'estoque_atual', label: 'Estoque' },
    { key: 'data_validade', label: 'Validade', render: (row) => formatDate(row.data_validade) },
    { key: 'status', label: 'Status', render: () => <Badge variant="perigo">Atenção</Badge> }
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do estoque, vencimentos e vendas do dia."
      />

      <Alert message={error} type="error" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card title="Produtos" value={loading ? '...' : products.length} description="Total cadastrado" icon="📦" />
        <Card title="Itens em estoque" value={loading ? '...' : totalItems} description="Quantidade disponível" icon="🏬" />
        <Card title="Estoque baixo" value={loading ? '...' : lowStock.length} description="Produtos abaixo do mínimo" icon="⚠️" />
        <Card title="Vendas do dia" value={loading ? '...' : salesToday.length} description="Vendas finalizadas hoje" icon="🛒" />
        <Card title="Faturamento" value={loading ? '...' : formatCurrency(dailyRevenue)} description="Total do dia" icon="💰" />
        <Card title="Vencimentos" value={loading ? '...' : nearExpiration.length} description="Próximos 30 dias" icon="📅" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section>
          <h3 className="mb-3 text-lg font-bold text-slate-900">Produtos com estoque baixo</h3>
          <Table columns={lowStockColumns} data={lowStock.slice(0, 6)} emptyMessage="Nenhum produto abaixo do mínimo." />
        </section>
        <section>
          <h3 className="mb-3 text-lg font-bold text-slate-900">Produtos próximos do vencimento</h3>
          <Table columns={expirationColumns} data={nearExpiration.slice(0, 6)} emptyMessage="Nenhum produto próximo do vencimento." />
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
