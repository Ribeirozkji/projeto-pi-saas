import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import Alert from '../components/Alert.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  if (!loading && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível entrar no sistema.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Acesso seguro</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Estoque & Vendas</h1>
          <p className="mt-2 text-sm text-slate-500">Entre para acessar dashboard, estoque, vendas e relatórios.</p>
        </div>

        <Alert message={error} type="error" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <Input
            label="Senha"
            name="senha"
            type="password"
            value={formData.senha}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </section>
    </main>
  );
}

export default Login;
