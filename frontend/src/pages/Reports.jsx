import { useEffect, useState } from 'react';

import Alert from '../components/Alert.jsx';
import Card from '../components/Card.jsx';
import Input from '../components/Input.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Select from '../components/Select.jsx';
import Table from '../components/Table.jsx';
import Button from '../components/Button.jsx';
import api from '../services/api.js';
import { formatCurrency, formatDate, formatDateTime, todayISO } from '../utils/formatters.js';

const movementTypes = [
  { value: 'compra', label: 'Compra' },
  { value: 'devolucao', label: 'Devolução' },
  { value: 'ajuste_positivo', label: 'Ajuste positivo' },
  { value: 'venda', label: 'Venda' },
  { value: 'perda', label: 'Perda' },
  { value: 'ajuste_negativo', label: 'Ajuste negativo' }
];

const paymentMethods = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'cartao_debito', label: 'Cartão de débito' },
  { value: 'cartao_credito', label: 'Cartão de crédito' }
];

function Reports() {
  const [activeReport, setActiveReport] = useState('stock');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockFilters, setStockFilters] = useState({ search: '', category_id: '', status: '', low_stock: '' });
  const [movementFilters, setMovementFilters] = useState({ product_id: '', tipo: '', start_date: '', end_date: '' });
  const [salesFilters, setSalesFilters] = useState({ status: 'finalizada', forma_pagamento: '', start_date: todayISO(), end_date: todayISO() });
  const [reportData, setReportData] = useState({ summary: {}, items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSupportData() {
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          api.get('/categories?status=ativo'),
          api.get('/products')
        ]);
        setCategories(categoriesResponse.data);
        setProducts(productsResponse.data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Não foi possível carregar filtros dos relatórios.');
      }
    }

    loadSupportData();
  }, []);

  useEffect(() => {
    loadReport();
  }, [activeReport]);

  function buildParams(filters) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.append(key, value);
      }
    });

    return params.toString();
  }

  async function loadReport() {
    setLoading(true);
    setError('');

    const filtersByReport = {
      stock: stockFilters,
      movements: movementFilters,
      sales: salesFilters
    };

    try {
      const params = buildParams(filtersByReport[activeReport]);
      const { data } = await api.get(`/reports/${activeReport}?${params}`);
      setReportData(data);
    } catch (apiError) {
      const errors = apiError.response?.data?.errors;
      setError(errors?.join(' ') || apiError.response?.data?.message || 'Não foi possível carregar o relatório.');
      setReportData({ summary: {}, items: [] });
    } finally {
      setLoading(false);
    }
  }

  function handleStockFilter(event) {
    const { name, value } = event.target;
    setStockFilters((current) => ({ ...current, [name]: value }));
  }

  function handleMovementFilter(event) {
    const { name, value } = event.target;
    setMovementFilters((current) => ({ ...current, [name]: value }));
  }

  function handleSalesFilter(event) {
    const { name, value } = event.target;
    setSalesFilters((current) => ({ ...current, [name]: value }));
  }

  const stockColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'nome', label: 'Produto' },
    { key: 'categoria_nome', label: 'Categoria', render: (row) => row.categoria_nome || '-' },
    { key: 'estoque_atual', label: 'Estoque' },
    { key: 'estoque_minimo', label: 'Mínimo' },
    { key: 'preco_venda', label: 'Preço venda', render: (row) => formatCurrency(row.preco_venda) },
    { key: 'valor_venda_total', label: 'Valor em estoque', render: (row) => formatCurrency(row.valor_venda_total) },
    { key: 'data_validade', label: 'Validade', render: (row) => formatDate(row.data_validade) },
    { key: 'status', label: 'Status' }
  ];

  const movementColumns = [
    { key: 'produto_nome', label: 'Produto' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'quantidade', label: 'Qtd.' },
    { key: 'estoque_anterior', label: 'Antes' },
    { key: 'estoque_posterior', label: 'Depois' },
    { key: 'usuario_nome', label: 'Responsável' },
    { key: 'created_at', label: 'Data', render: (row) => formatDateTime(row.created_at) }
  ];

  const salesColumns = [
    { key: 'numero_venda', label: 'Venda' },
    { key: 'usuario_nome', label: 'Operador' },
    { key: 'subtotal', label: 'Subtotal', render: (row) => formatCurrency(row.subtotal) },
    { key: 'desconto', label: 'Desconto', render: (row) => formatCurrency(row.desconto) },
    { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total) },
    { key: 'forma_pagamento', label: 'Pagamento' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Data', render: (row) => formatDateTime(row.created_at) }
  ];

  const tabs = [
    { key: 'stock', label: 'Estoque atual' },
    { key: 'movements', label: 'Movimentações' },
    { key: 'sales', label: 'Vendas por período' }
  ];

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Relatórios básicos de estoque, estoque baixo, movimentações e vendas por período."
      />

      <Alert message={error} type="error" />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeReport === tab.key ? 'primary' : 'secondary'}
            onClick={() => setActiveReport(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeReport === 'stock' && (
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Filtros do estoque</h3>
          <div className="grid gap-3 md:grid-cols-5">
            <Input name="search" value={stockFilters.search} onChange={handleStockFilter} placeholder="Buscar produto" />
            <Select name="category_id" value={stockFilters.category_id} onChange={handleStockFilter}>
              <option value="">Todas categorias</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}
            </Select>
            <Select name="status" value={stockFilters.status} onChange={handleStockFilter}>
              <option value="">Todos status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
            <Select name="low_stock" value={stockFilters.low_stock} onChange={handleStockFilter}>
              <option value="">Todos estoques</option>
              <option value="true">Apenas estoque baixo</option>
            </Select>
            <Button variant="secondary" onClick={loadReport} disabled={loading}>Gerar</Button>
          </div>
        </section>
      )}

      {activeReport === 'movements' && (
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Filtros de movimentações</h3>
          <div className="grid gap-3 md:grid-cols-5">
            <Select name="product_id" value={movementFilters.product_id} onChange={handleMovementFilter}>
              <option value="">Todos produtos</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.nome}</option>)}
            </Select>
            <Select name="tipo" value={movementFilters.tipo} onChange={handleMovementFilter}>
              <option value="">Todos tipos</option>
              {movementTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </Select>
            <Input name="start_date" type="date" value={movementFilters.start_date} onChange={handleMovementFilter} />
            <Input name="end_date" type="date" value={movementFilters.end_date} onChange={handleMovementFilter} />
            <Button variant="secondary" onClick={loadReport} disabled={loading}>Gerar</Button>
          </div>
        </section>
      )}

      {activeReport === 'sales' && (
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Filtros de vendas</h3>
          <div className="grid gap-3 md:grid-cols-5">
            <Select name="status" value={salesFilters.status} onChange={handleSalesFilter}>
              <option value="">Todos status</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </Select>
            <Select name="forma_pagamento" value={salesFilters.forma_pagamento} onChange={handleSalesFilter}>
              <option value="">Todos pagamentos</option>
              {paymentMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
            </Select>
            <Input name="start_date" type="date" value={salesFilters.start_date} onChange={handleSalesFilter} />
            <Input name="end_date" type="date" value={salesFilters.end_date} onChange={handleSalesFilter} />
            <Button variant="secondary" onClick={loadReport} disabled={loading}>Gerar</Button>
          </div>
        </section>
      )}

      {activeReport === 'stock' && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Card title="Produtos" value={reportData.summary.total_produtos || 0} description="Itens cadastrados" icon="📦" />
          <Card title="Unidades" value={reportData.summary.total_itens || 0} description="Estoque atual" icon="🏬" />
          <Card title="Estoque baixo" value={reportData.summary.produtos_estoque_baixo || 0} description="Abaixo do mínimo" icon="⚠️" />
          <Card title="Custo" value={formatCurrency(reportData.summary.valor_custo_total)} description="Valor de custo" icon="💸" />
          <Card title="Venda" value={formatCurrency(reportData.summary.valor_venda_total)} description="Valor potencial" icon="💰" />
        </div>
      )}

      {activeReport === 'movements' && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card title="Movimentações" value={reportData.summary.total_movimentacoes || 0} description="Registros no período" icon="🔁" />
          <Card title="Entradas" value={reportData.summary.total_entradas || 0} description="Unidades adicionadas" icon="⬆️" />
          <Card title="Saídas" value={reportData.summary.total_saidas || 0} description="Unidades baixadas" icon="⬇️" />
        </div>
      )}

      {activeReport === 'sales' && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Card title="Vendas" value={reportData.summary.total_vendas || 0} description="Registros no período" icon="🛒" />
          <Card title="Finalizadas" value={reportData.summary.vendas_finalizadas || 0} description="Com faturamento" icon="✅" />
          <Card title="Canceladas" value={reportData.summary.vendas_canceladas || 0} description="Sem faturamento" icon="🚫" />
          <Card title="Descontos" value={formatCurrency(reportData.summary.descontos)} description="Total concedido" icon="🏷️" />
          <Card title="Faturamento" value={formatCurrency(reportData.summary.faturamento)} description="Vendas finalizadas" icon="💰" />
        </div>
      )}

      <Table
        columns={activeReport === 'stock' ? stockColumns : activeReport === 'movements' ? movementColumns : salesColumns}
        data={reportData.items || []}
        emptyMessage={loading ? 'Carregando relatório...' : 'Nenhum registro encontrado para os filtros informados.'}
      />
    </div>
  );
}

export default Reports;
