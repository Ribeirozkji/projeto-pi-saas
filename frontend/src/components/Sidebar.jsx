import { NavLink } from 'react-router-dom';

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/products', label: 'Produtos', icon: '📦' },
  { to: '/categories', label: 'Categorias', icon: '🏷️' },
  { to: '/suppliers', label: 'Fornecedores', icon: '🚚' },
  { to: '/stock', label: 'Estoque', icon: '🔁' },
  { to: '/sales', label: 'Vendas', icon: '🛒' },
  { to: '/reports', label: 'Relatórios', icon: '📈' },
  { to: '/users', label: 'Usuários', icon: '👥' }
];

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white px-4 py-5 lg:block">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-700 text-lg font-bold text-white">
          EV
        </div>
        <div>
          <strong className="block text-base font-bold text-slate-900">Estoque & Vendas</strong>
          <span className="text-xs font-medium text-slate-500">Gestão simples</span>
        </div>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              isActive
                ? 'bg-primary-50 text-primary-800'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
