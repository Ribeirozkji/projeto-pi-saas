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
import { formatCurrency, formatDate } from '../utils/formatters.js';

const emptyForm = {
  sku: '',
  nome: '',
  descricao: '',
  category_id: '',
  supplier_id: '',
  preco_custo: '',
  preco_venda: '',
  estoque_atual: '0',
  estoque_minimo: '0',
  data_validade: '',
  status: 'ativo'
};

function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [formData, setFormData] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const canManageProducts = ['admin', 'gerente'].includes(user?.perfil);
  const canDeleteProducts = user?.perfil === 'admin';

  async function loadSupportData() {
    const [categoriesResponse, suppliersResponse] = await Promise.all([
      api.get('/categories?status=ativo'),
      api.get('/suppliers?status=ativo')
    ]);

    setCategories(categoriesResponse.data);
    setSuppliers(suppliersResponse.data);
  }

  async function loadProducts() {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível carregar produtos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSupportData().catch((apiError) => {
      setError(apiError.response?.data?.message || 'Não foi possível carregar categorias e fornecedores.');
    });
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters.status]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function openCreateForm() {
    if (!canManageProducts) {
      setError('Seu perfil não pode cadastrar produtos.');
      return;
    }

    setEditingProduct(null);
    setFormData(emptyForm);
    setShowForm(true);
    setMessage('');
    setError('');
  }

  function openEditForm(product) {
    if (!canManageProducts) {
      setError('Seu perfil não pode editar produtos.');
      return;
    }

    setEditingProduct(product);
    setFormData({
      sku: product.sku || '',
      nome: product.nome || '',
      descricao: product.descricao || '',
      category_id: product.category_id || '',
      supplier_id: product.supplier_id || '',
      preco_custo: product.preco_custo || '',
      preco_venda: product.preco_venda || '',
      estoque_atual: product.estoque_atual ?? '0',
      estoque_minimo: product.estoque_minimo ?? '0',
      data_validade: product.data_validade ? String(product.data_validade).slice(0, 10) : '',
      status: product.status || 'ativo'
    });
    setShowForm(true);
    setMessage('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const payload = {
      ...formData,
      category_id: formData.category_id || null,
      supplier_id: formData.supplier_id || null,
      preco_custo: Number(formData.preco_custo),
      preco_venda: Number(formData.preco_venda),
      estoque_atual: Number(formData.estoque_atual),
      estoque_minimo: Number(formData.estoque_minimo),
      data_validade: formData.data_validade || null
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        setMessage('Produto atualizado com sucesso.');
      } else {
        await api.post('/products', payload);
        setMessage('Produto cadastrado com sucesso.');
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData(emptyForm);
      await loadProducts();
    } catch (apiError) {
      const errors = apiError.response?.data?.errors;
      setError(errors?.join(' ') || apiError.response?.data?.message || 'Não foi possível salvar o produto.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(product) {
    if (!canDeleteProducts) {
      setError('Seu perfil não pode inativar produtos.');
      return;
    }

    const confirmed = window.confirm(`Deseja inativar o produto ${product.nome}?`);
    if (!confirmed) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.delete(`/products/${product.id}`);
      setMessage('Produto inativado com sucesso.');
      await loadProducts();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível inativar o produto.');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'sku', label: 'SKU' },
    { key: 'nome', label: 'Produto' },
    { key: 'categoria_nome', label: 'Categoria', render: (row) => row.categoria_nome || '-' },
    { key: 'preco_venda', label: 'Venda', render: (row) => formatCurrency(row.preco_venda) },
    {
      key: 'estoque_atual',
      label: 'Estoque',
      render: (row) => (
        <span className={Number(row.estoque_atual) <= Number(row.estoque_minimo) ? 'font-bold text-amber-700' : ''}>
          {row.estoque_atual}
        </span>
      )
    },
    { key: 'data_validade', label: 'Validade', render: (row) => formatDate(row.data_validade) },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={row.status}>{row.status}</Badge> },
    {
      key: 'actions',
      label: 'Ações',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" className="px-3 py-1.5" onClick={() => openEditForm(row)}>Editar</Button>
          <Button variant="danger" className="px-3 py-1.5" onClick={() => handleDelete(row)}>Inativar</Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle="Cadastro, consulta, filtros e controle básico dos produtos."
        action={canManageProducts ? <Button onClick={openCreateForm}>Novo produto</Button> : null}
      />

      <Alert message={message} type="success" />
      <Alert message={error} type="error" />

      <div className="mb-4 grid gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100 md:grid-cols-[1fr_180px_auto]">
        <Input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Buscar por SKU, nome ou descrição" />
        <Select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </Select>
        <Button variant="secondary" onClick={loadProducts} disabled={loading}>Buscar</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            {editingProduct ? 'Editar produto' : 'Novo produto'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Input label="SKU" name="sku" value={formData.sku} onChange={handleFormChange} required />
            <Input label="Nome" name="nome" value={formData.nome} onChange={handleFormChange} required />
            <Select label="Categoria" name="category_id" value={formData.category_id} onChange={handleFormChange}>
              <option value="">Sem categoria</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.nome}</option>)}
            </Select>
            <Select label="Fornecedor" name="supplier_id" value={formData.supplier_id} onChange={handleFormChange}>
              <option value="">Sem fornecedor</option>
              {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.nome}</option>)}
            </Select>
            <Input label="Preço de custo" name="preco_custo" type="number" min="0" step="0.01" value={formData.preco_custo} onChange={handleFormChange} required />
            <Input label="Preço de venda" name="preco_venda" type="number" min="0" step="0.01" value={formData.preco_venda} onChange={handleFormChange} required />
            <Input label="Estoque atual" name="estoque_atual" type="number" min="0" value={formData.estoque_atual} onChange={handleFormChange} required />
            <Input label="Estoque mínimo" name="estoque_minimo" type="number" min="0" value={formData.estoque_minimo} onChange={handleFormChange} required />
            <Input label="Data de validade" name="data_validade" type="date" value={formData.data_validade} onChange={handleFormChange} />
            <Select label="Status" name="status" value={formData.status} onChange={handleFormChange}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
            <div className="md:col-span-2 xl:col-span-3">
              <Textarea label="Descrição" name="descricao" value={formData.descricao} onChange={handleFormChange} rows={3} />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar produto'}</Button>
          </div>
        </form>
      )}

      <Table columns={columns} data={products} emptyMessage={loading ? 'Carregando produtos...' : 'Nenhum produto encontrado.'} />
    </div>
  );
}

export default Products;
