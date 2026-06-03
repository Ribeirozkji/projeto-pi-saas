function Navbar() {
  const user = {
    nome: 'Usuário Local',
    perfil: 'Acesso livre'
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">Sistema web</p>
          <h1 className="text-lg font-bold text-slate-900">Controle de Estoque e Vendas</h1>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-800">{user.nome}</p>
          <p className="text-xs text-slate-500">{user.perfil}</p>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
