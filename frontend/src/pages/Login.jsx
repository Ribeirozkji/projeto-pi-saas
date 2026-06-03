import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: 'admin@sistema.com', senha: 'admin123' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.senha);
      navigate(from, { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Não foi possível fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <section className="hidden flex-1 bg-primary-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-bold text-primary-800">
            EV
          </div>
          <h1 className="max-w-xl text-4xl font-bold leading-tight">
            Controle de estoque e vendas simples, organizado e profissional.
          </h1>
          <p className="mt-4 max-w-lg text-primary-100">
            Gerencie produtos, fornecedores, movimentações e vendas em uma interface limpa para uso diário.
          </p>
        </div>
        <p className="text-sm text-primary-100">Comprovantes simples, sem valor fiscal.</p>
      </section>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-soft ring-1 ring-slate-100">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Acesso ao sistema</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Entrar</h2>
            <p className="mt-2 text-sm text-slate-500">Use seu email e senha cadastrados pelo administrador.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Senha"
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar no sistema'}
          </Button>
        </form>
      </main>
    </div>
  );
}

export default Login;
