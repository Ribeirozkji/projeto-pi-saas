const styles = {
  ativo: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  inativo: 'bg-slate-100 text-slate-600 ring-slate-200',
  alerta: 'bg-amber-50 text-amber-700 ring-amber-100',
  perigo: 'bg-red-50 text-red-700 ring-red-100',
  info: 'bg-primary-50 text-primary-700 ring-primary-100'
};

function Badge({ children, variant = 'info' }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[variant] || styles.info}`}>
      {children}
    </span>
  );
}

export default Badge;
