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

const emptyForm = {
  nome: '',
  cnpj_cpf: '',
  email: '',
  telefone: '',
  endereco: '',
  status: 'ativo'
};

function Suppliers() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [formData, setFormData] = useState(emptyForm);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const canManageSuppliers = ['admin', 'gerente'].includes(user?.perfil);
  const canDeleteSuppliers = user?.perfil === 'admin';

  async function loadSuppliers() {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const { data } = await api.get(`/suppliers?${params.toString()}`);
      setSuppliers(data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível carregar fornecedores.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuppliers();
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
    if (!canManageSuppliers) {
      setError('Seu perfil não pode cadastrar fornecedores.');
      return;
    }

    setEditingSupplier(null);
    setFormData(emptyForm);
    setShowForm(true);
    setMessage('');
    setError('');
  }

  function openEditForm(supplier) {
    if (!canManageSuppliers) {
      setError('Seu perfil não pode editar fornecedores.');
      return;
    }

    setEditingSupplier(supplier);
    setFormData({
      nome: supplier.nome || '',
      cnpj_cpf: supplier.cnpj_cpf || '',
      email: supplier.email || '',
      telefone: supplier.telefone || '',
      endereco: supplier.endereco || '',
      status: supplier.status || 'ativo'
    });
    setShowForm(true);
    setMessage('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, formData);
        setMessage('Fornecedor atualizado com sucesso.');
      } else {
        await api.post('/suppliers', formData);
        setMessage('Fornecedor cadastrado com sucesso.');
      }

      setShowForm(false);
      setEditingSupplier(null);
      setFormData(emptyForm);
      await loadSuppliers();
    } catch (apiError) {
      const errors = apiError.response?.data?.errors;
      setError(errors?.join(' ') || apiError.response?.data?.message || 'Não foi possível salvar o fornecedor.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(supplier) {
    if (!canDeleteSuppliers) {
      setError('Seu perfil não pode inativar fornecedores.');
      return;
    }

    const confirmed = window.confirm(`Deseja inativar o fornecedor ${supplier.nome}?`);
    if (!confirmed) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.delete(`/suppliers/${supplier.id}`);
      setMessage('Fornecedor inativado com sucesso.');
      await loadSuppliers();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível inativar o fornecedor.');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'cnpj_cpf', label: 'CNPJ/CPF', render: (row) => row.cnpj_cpf || '-' },
    { key: 'email', label: 'Email', render: (row) => row.email || '-' },
    { key: 'telefone', label: 'Telefone', render: (row) => row.telefone || '-' },
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
        title="Fornecedores"
        subtitle="Cadastro básico dos fornecedores vinculados aos produtos."
        action={canManageSuppliers ? <Button onClick={openCreateForm}>Novo fornecedor</Button> : null}
      />

      <Alert message={message} type="success" />
      <Alert message={error} type="error" />

      <div className="mb-4 grid gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100 md:grid-cols-[1fr_180px_auto]">
        <Input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Buscar por nome, documento, email ou telefone" />
        <Select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </Select>
        <Button variant="secondary" onClick={loadSuppliers} disabled={loading}>Buscar</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            {editingSupplier ? 'Editar fornecedor' : 'Novo fornecedor'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome" name="nome" value={formData.nome} onChange={handleFormChange} required />
            <Input label="CNPJ/CPF" name="cnpj_cpf" value={formData.cnpj_cpf} onChange={handleFormChange} />
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} />
            <Input label="Telefone" name="telefone" value={formData.telefone} onChange={handleFormChange} />
            <Select label="Status" name="status" value={formData.status} onChange={handleFormChange}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
            <div className="md:col-span-2">
              <Textarea label="Endereço" name="endereco" value={formData.endereco} onChange={handleFormChange} rows={3} />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar fornecedor'}</Button>
          </div>
        </form>
      )}

      <Table columns={columns} data={suppliers} emptyMessage={loading ? 'Carregando fornecedores...' : 'Nenhum fornecedor encontrado.'} />
    </div>
  );
}

export default Suppliers;
