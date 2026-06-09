import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext.jsx';
import Button from './Button.jsx';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Sistema web</p>
          <h1 className="text-lg font-bold text-slate-900">Controle de Estoque e Vendas</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.nome}</p>
            <p className="text-xs capitalize text-slate-500">{user?.perfil}</p>
          </div>
          <Button variant="secondary" className="px-3 py-1.5" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
