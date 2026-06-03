import { useEffect, useState } from 'react';

import Alert from '../components/Alert.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Select from '../components/Select.jsx';
import Table from '../components/Table.jsx';
import api from '../services/api.js';

const emptyForm = {
  nome: '',
  email: '',
  senha: '',
  perfil: 'operador',
  status: 'ativo'
};

function Users() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');


  async function loadUsers() {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível carregar usuários.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function openCreateForm() {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowForm(true);
    setMessage('');
    setError('');
  }

  function openEditForm(selectedUser) {
    setEditingUser(selectedUser);
    setFormData({
      nome: selectedUser.nome || '',
      email: selectedUser.email || '',
      senha: '',
      perfil: selectedUser.perfil || 'operador',
      status: selectedUser.status || 'ativo'
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

    const payload = { ...formData };

    if (editingUser && !payload.senha) {
      delete payload.senha;
    }

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        setMessage('Usuário atualizado com sucesso.');
      } else {
        await api.post('/users', payload);
        setMessage('Usuário cadastrado com sucesso.');
      }

      setShowForm(false);
      setEditingUser(null);
      setFormData(emptyForm);
      await loadUsers();
    } catch (apiError) {
      const errors = apiError.response?.data?.errors;
      setError(errors?.join(' ') || apiError.response?.data?.message || 'Não foi possível salvar usuário.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(selectedUser) {
    const confirmed = window.confirm(`Deseja inativar o usuário ${selectedUser.nome}?`);
    if (!confirmed) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.delete(`/users/${selectedUser.id}`);
      setMessage('Usuário inativado com sucesso.');
      await loadUsers();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível inativar o usuário.');
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'perfil', label: 'Perfil', render: (row) => <Badge variant="info">{row.perfil}</Badge> },
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
        title="Usuários"
        subtitle="Cadastro simples de administradores e operadores."
        action={<Button onClick={openCreateForm}>Novo usuário</Button>}
      />

      <Alert message={message} type="success" />
      <Alert message={error} type="error" />

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            {editingUser ? 'Editar usuário' : 'Novo usuário'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome" name="nome" value={formData.nome} onChange={handleFormChange} required />
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleFormChange} required />
            <Input
              label={editingUser ? 'Nova senha (opcional)' : 'Senha'}
              name="senha"
              type="password"
              value={formData.senha}
              onChange={handleFormChange}
              required={!editingUser}
            />
            <Select label="Perfil" name="perfil" value={formData.perfil} onChange={handleFormChange}>
              <option value="admin">Admin</option>
              <option value="operador">Operador</option>
            </Select>
            <Select label="Status" name="status" value={formData.status} onChange={handleFormChange}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar usuário'}</Button>
          </div>
        </form>
      )}

      <Table columns={columns} data={users} emptyMessage={loading ? 'Carregando usuários...' : 'Nenhum usuário encontrado.'} />
    </div>
  );
}

export default Users;
