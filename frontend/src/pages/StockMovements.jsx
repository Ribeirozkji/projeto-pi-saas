import { useEffect, useState } from 'react';

import Alert from '../components/Alert.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Select from '../components/Select.jsx';
import Table from '../components/Table.jsx';
import Textarea from '../components/Textarea.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api.js';
import { formatDate, formatDateTime } from '../utils/formatters.js';

const movementTypes = [
  { value: 'compra', label: 'Compra', group: 'entrada' },
  { value: 'devolucao', label: 'Devolução', group: 'entrada' },
  { value: 'ajuste_positivo', label: 'Ajuste positivo', group: 'entrada' },
  { value: 'venda', label: 'Venda', group: 'saida' },
  { value: 'perda', label: 'Perda', group: 'saida' },
  { value: 'ajuste_negativo', label: 'Ajuste negativo', group: 'saida' }
];

const emptyForm = {
  product_id: '',
  tipo: 'compra',
  quantidade: '1',
  observacao: ''
};

function StockMovements() {
  const { user } = useAuth();
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [nearExpiration, setNearExpiration] = useState([]);
  const [filters, setFilters] = useState({ product_id: '', tipo: '', start_date: '', end_date: '' });
  const [formData, setFormData] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const canCreateMovement = ['admin', 'gerente', 'estoquista'].includes(user?.perfil);


  async function loadProducts() {
    const { data } = await api.get('/products?status=ativo');
    setProducts(data);
  }

  async function loadAlerts() {
    const [lowStockResponse, nearExpirationResponse] = await Promise.all([
      api.get('/stock/low-stock'),
      api.get('/stock/near-expiration?days=30')
    ]);

    setLowStock(lowStockResponse.data);
    setNearExpiration(nearExpirationResponse.data);
  }

  async function loadMovements() {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filters.product_id) params.append('product_id', filters.product_id);
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const { data } = await api.get(`/stock/movements?${params.toString()}`);
      setMovements(data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível carregar movimentações.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts().catch((apiError) => {
      setError(apiError.response?.data?.message || 'Não foi possível carregar produtos.');
    });
    loadAlerts().catch((apiError) => {
      setError(apiError.response?.data?.message || 'Não foi possível carregar alertas de estoque.');
    });
    loadMovements();
  }, []);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/stock/movements', {
        product_id: Number(formData.product_id),
        tipo: formData.tipo,
        quantidade: Number(formData.quantidade),
        observacao: formData.observacao
      });

      setMessage('Movimentação registrada com sucesso.');
      setFormData(emptyForm);
      setShowForm(false);
      await Promise.all([loadMovements(), loadProducts(), loadAlerts()]);
    } catch (apiError) {
      const errors = apiError.response?.data?.errors;
      setError(errors?.join(' ') || apiError.response?.data?.message || 'Não foi possível registrar a movimentação.');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'produto_nome', label: 'Produto' },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (row) => {
        const type = movementTypes.find((item) => item.value === row.tipo);
        return <Badge variant={type?.group === 'saida' ? 'perigo' : 'info'}>{type?.label || row.tipo}</Badge>;
      }
    },
    { key: 'quantidade', label: 'Qtd.' },
    { key: 'estoque_anterior', label: 'Antes' },
    { key: 'estoque_posterior', label: 'Depois' },
    { key: 'usuario_nome', label: 'Responsável' },
    { key: 'created_at', label: 'Data', render: (row) => formatDateTime(row.created_at) }
  ];

  const lowStockColumns = [
    { key: 'nome', label: 'Produto' },
    { key: 'estoque_atual', label: 'Atual' },
    { key: 'estoque_minimo', label: 'Mínimo' }
  ];

  const expirationColumns = [
    { key: 'nome', label: 'Produto' },
    { key: 'estoque_atual', label: 'Estoque' },
    { key: 'data_validade', label: 'Validade', render: (row) => formatDate(row.data_validade) }
  ];

  return (
    <div>
      <PageHeader
        title="Movimentações de estoque"
        subtitle="Registre entradas, saídas e acompanhe o histórico do estoque."
        action={<Button onClick={() => setShowForm(true)}>Nova movimentação</Button>}
      />

      <Alert message={message} type="success" />
      <Alert message={error} type="error" />

      <div className="mb-4 grid gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100 md:grid-cols-5">
        <Select name="product_id" value={filters.product_id} onChange={handleFilterChange}>
          <option value="">Todos os produtos</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.nome}</option>)}
        </Select>
        <Select name="tipo" value={filters.tipo} onChange={handleFilterChange}>
          <option value="">Todos os tipos</option>
          {movementTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </Select>
        <Input name="start_date" type="date" value={filters.start_date} onChange={handleFilterChange} />
        <Input name="end_date" type="date" value={filters.end_date} onChange={handleFilterChange} />
        <Button variant="secondary" onClick={loadMovements} disabled={loading}>Buscar</Button>
      </div>

      {showForm && canCreateMovement && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Nova movimentação</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Select label="Produto" name="product_id" value={formData.product_id} onChange={handleFormChange} required>
              <option value="">Selecione</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.nome} - estoque {product.estoque_atual}</option>
              ))}
            </Select>
            <Select label="Tipo" name="tipo" value={formData.tipo} onChange={handleFormChange} required>
              {movementTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </Select>
            <Input label="Quantidade" name="quantidade" type="number" min="1" value={formData.quantidade} onChange={handleFormChange} required />
            <div className="md:col-span-2 xl:col-span-4">
              <Textarea label="Observação" name="observacao" value={formData.observacao} onChange={handleFormChange} rows={3} />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrar movimentação'}</Button>
          </div>
        </form>
      )}

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <section>
          <h3 className="mb-3 text-lg font-bold text-slate-900">Estoque baixo</h3>
          <Table columns={lowStockColumns} data={lowStock.slice(0, 5)} emptyMessage="Nenhum produto abaixo do mínimo." />
        </section>
        <section>
          <h3 className="mb-3 text-lg font-bold text-slate-900">Próximos vencimentos</h3>
          <Table columns={expirationColumns} data={nearExpiration.slice(0, 5)} emptyMessage="Nenhum vencimento próximo." />
        </section>
      </div>

      <Table columns={columns} data={movements} emptyMessage={loading ? 'Carregando movimentações...' : 'Nenhuma movimentação encontrada.'} />
    </div>
  );
}

export default StockMovements;
