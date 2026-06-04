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

const emptyForm = { nome: '', descricao: '', status: 'ativo' };

function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [formData, setFormData] = useState(emptyForm);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const canManageCategories = ['admin', 'gerente'].includes(user?.perfil);
  const canDeleteCategories = user?.perfil === 'admin';

  async function loadCategories() {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const { data } = await api.get(`/categories?${params.toString()}`);
      setCategories(data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível carregar categorias.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
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
    if (!canManageCategories) {
      setError('Seu perfil não pode cadastrar categorias.');
      return;
    }

    setEditingCategory(null);
    setFormData(emptyForm);
    setShowForm(true);
    setMessage('');
    setError('');
  }

  function openEditForm(category) {
    if (!canManageCategories) {
      setError('Seu perfil não pode editar categorias.');
      return;
    }

    setEditingCategory(category);
    setFormData({
      nome: category.nome || '',
      descricao: category.descricao || '',
      status: category.status || 'ativo'
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

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        setMessage('Categoria atualizada com sucesso.');
      } else {
        await api.post('/categories', formData);
        setMessage('Categoria cadastrada com sucesso.');
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData(emptyForm);
      await loadCategories();
    } catch (apiError) {
      const errors = apiError.response?.data?.errors;
      setError(errors?.join(' ') || apiError.response?.data?.message || 'Não foi possível salvar a categoria.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(category) {
    if (!canDeleteCategories) {
      setError('Seu perfil não pode inativar categorias.');
      return;
    }

    const confirmed = window.confirm(`Deseja inativar a categoria ${category.nome}?`);
    if (!confirmed) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.delete(`/categories/${category.id}`);
      setMessage('Categoria inativada com sucesso.');
      await loadCategories();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível inativar a categoria.');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'descricao', label: 'Descrição', render: (row) => row.descricao || '-' },
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
        title="Categorias"
        subtitle="Organize os produtos por grupos simples."
        action={canManageCategories ? <Button onClick={openCreateForm}>Nova categoria</Button> : null}
      />

      <Alert message={message} type="success" />
      <Alert message={error} type="error" />

      <div className="mb-4 grid gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100 md:grid-cols-[1fr_180px_auto]">
        <Input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Buscar por nome ou descrição" />
        <Select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </Select>
        <Button variant="secondary" onClick={loadCategories} disabled={loading}>Buscar</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            {editingCategory ? 'Editar categoria' : 'Nova categoria'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome" name="nome" value={formData.nome} onChange={handleFormChange} required />
            <Select label="Status" name="status" value={formData.status} onChange={handleFormChange}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
            <div className="md:col-span-2">
              <Textarea label="Descrição" name="descricao" value={formData.descricao} onChange={handleFormChange} rows={3} />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar categoria'}</Button>
          </div>
        </form>
      )}

      <Table columns={columns} data={categories} emptyMessage={loading ? 'Carregando categorias...' : 'Nenhuma categoria encontrada.'} />
    </div>
  );
}

export default Categories;
