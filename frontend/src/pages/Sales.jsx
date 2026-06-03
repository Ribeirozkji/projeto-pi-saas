import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Alert from '../components/Alert.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Select from '../components/Select.jsx';
import Table from '../components/Table.jsx';
import api from '../services/api.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';

const paymentMethods = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'cartao_debito', label: 'Cartão de débito' },
  { value: 'cartao_credito', label: 'Cartão de crédito' }
];

function Sales() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [discount, setDiscount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadSales() {
    try {
      const { data } = await api.get('/sales');
      setSales(data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível carregar as vendas.');
    }
  }

  async function loadProducts(productSearch = '') {
    try {
      const params = new URLSearchParams({ status: 'ativo' });
      if (productSearch) params.append('search', productSearch);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.filter((product) => Number(product.estoque_atual) > 0));
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível carregar produtos.');
    }
  }

  useEffect(() => {
    loadSales();
    loadProducts();
  }, []);

  async function handleSearchProducts(event) {
    event.preventDefault();
    await loadProducts(search);
  }

  function addToCart() {
    setMessage('');
    setError('');

    const product = products.find((item) => Number(item.id) === Number(selectedProductId));
    const parsedQuantity = Number(quantity);

    if (!product) {
      setError('Selecione um produto para adicionar ao carrinho.');
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError('Informe uma quantidade válida.');
      return;
    }

    const currentQuantity = cart.find((item) => item.id === product.id)?.quantidade || 0;
    const nextQuantity = currentQuantity + parsedQuantity;

    if (nextQuantity > Number(product.estoque_atual)) {
      setError(`Quantidade maior que o estoque disponível (${product.estoque_atual}).`);
      return;
    }

    setCart((current) => {
      const exists = current.some((item) => item.id === product.id);

      if (exists) {
        return current.map((item) => (
          item.id === product.id ? { ...item, quantidade: nextQuantity } : item
        ));
      }

      return [...current, { ...product, quantidade: parsedQuantity }];
    });

    setSelectedProductId('');
    setQuantity('1');
  }

  function updateCartQuantity(productId, nextQuantity) {
    const parsedQuantity = Number(nextQuantity);

    setCart((current) => current.map((item) => {
      if (item.id !== productId) return item;

      if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
        return item;
      }

      return {
        ...item,
        quantidade: Math.min(parsedQuantity, Number(item.estoque_atual))
      };
    }));
  }

  function removeFromCart(productId) {
    setCart((current) => current.filter((item) => item.id !== productId));
  }

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.preco_venda) * Number(item.quantidade), 0),
    [cart]
  );

  const numericDiscount = Number(discount || 0);
  const safeDiscount = Number.isFinite(numericDiscount) && numericDiscount > 0 ? numericDiscount : 0;
  const total = Math.max(subtotal - safeDiscount, 0);

  async function finalizeSale() {
    setLoading(true);
    setMessage('');
    setError('');

    if (cart.length === 0) {
      setError('Adicione pelo menos um produto ao carrinho.');
      setLoading(false);
      return;
    }

    if (safeDiscount > subtotal) {
      setError('O desconto não pode ser maior que o subtotal.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post('/sales', {
        items: cart.map((item) => ({
          product_id: item.id,
          quantidade: item.quantidade
        })),
        desconto: safeDiscount,
        forma_pagamento: paymentMethod
      });

      setMessage('Venda finalizada com sucesso.');
      setCart([]);
      setDiscount('0');
      await Promise.all([loadSales(), loadProducts(search)]);
      navigate(`/sales/${data.id}/receipt`);
    } catch (apiError) {
      const errors = apiError.response?.data?.errors;
      setError(errors?.join(' ') || apiError.response?.data?.message || 'Não foi possível finalizar a venda.');
    } finally {
      setLoading(false);
    }
  }

  async function cancelSale(sale) {
    const confirmed = window.confirm(`Deseja cancelar a venda ${sale.numero_venda} e estornar o estoque?`);
    if (!confirmed) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post(`/sales/${sale.id}/cancel`);
      setMessage('Venda cancelada e estoque estornado com sucesso.');
      await Promise.all([loadSales(), loadProducts(search)]);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível cancelar a venda.');
    } finally {
      setLoading(false);
    }
  }

  const cartColumns = [
    { key: 'nome', label: 'Produto' },
    { key: 'preco_venda', label: 'Preço', render: (row) => formatCurrency(row.preco_venda) },
    {
      key: 'quantidade',
      label: 'Qtd.',
      render: (row) => (
        <Input
          type="number"
          min="1"
          max={row.estoque_atual}
          value={row.quantidade}
          onChange={(event) => updateCartQuantity(row.id, event.target.value)}
          className="max-w-24 py-1.5"
        />
      )
    },
    { key: 'total', label: 'Total', render: (row) => formatCurrency(Number(row.preco_venda) * Number(row.quantidade)) },
    {
      key: 'actions',
      label: 'Ações',
      render: (row) => <Button variant="danger" className="px-3 py-1.5" onClick={() => removeFromCart(row.id)}>Remover</Button>
    }
  ];

  const salesColumns = [
    { key: 'numero_venda', label: 'Número' },
    { key: 'created_at', label: 'Data', render: (row) => formatDateTime(row.created_at) },
    { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total) },
    {
      key: 'forma_pagamento',
      label: 'Pagamento',
      render: (row) => paymentMethods.find((method) => method.value === row.forma_pagamento)?.label || row.forma_pagamento
    },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status === 'cancelada' ? 'perigo' : 'ativo'}>{row.status}</Badge> },
    {
      key: 'actions',
      label: 'Ações',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Link to={`/sales/${row.id}/receipt`}><Button variant="secondary" className="px-3 py-1.5">Comprovante</Button></Link>
          {row.status !== 'cancelada' && (
            <Button variant="danger" className="px-3 py-1.5" onClick={() => cancelSale(row)}>Cancelar</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Monte o carrinho, aplique desconto simples e finalize a venda."
      />

      <Alert message={message} type="success" />
      <Alert message={error} type="error" />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Nova venda</h3>

          <form onSubmit={handleSearchProducts} className="mb-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar produto por SKU ou nome" />
            <Button variant="secondary" type="submit">Buscar produto</Button>
          </form>

          <div className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
            <Select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}>
              <option value="">Selecione um produto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nome} - {formatCurrency(product.preco_venda)} - estoque {product.estoque_atual}
                </option>
              ))}
            </Select>
            <Input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
            <Button onClick={addToCart}>Adicionar</Button>
          </div>

          <div className="mt-5">
            <Table columns={cartColumns} data={cart} emptyMessage="Carrinho vazio." />
          </div>
        </section>

        <aside className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Resumo da venda</h3>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <strong className="text-slate-900">{formatCurrency(subtotal)}</strong>
            </div>

            <Input
              label="Desconto simples"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
            />

            <Select label="Forma de pagamento" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
              {paymentMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
            </Select>

            <div className="rounded-2xl bg-primary-50 p-4 text-primary-900">
              <span className="text-sm font-semibold">Total final</span>
              <strong className="mt-1 block text-3xl font-bold">{formatCurrency(total)}</strong>
            </div>

            <Button className="w-full" onClick={finalizeSale} disabled={loading || cart.length === 0}>
              {loading ? 'Finalizando...' : 'Finalizar venda'}
            </Button>
          </div>
        </aside>
      </div>

      <section className="mt-6">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Histórico de vendas</h3>
        <Table columns={salesColumns} data={sales} emptyMessage="Nenhuma venda registrada." />
      </section>
    </div>
  );
}

export default Sales;
