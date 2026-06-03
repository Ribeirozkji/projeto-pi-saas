function Card({ title, value, description, icon, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <strong className="mt-2 block text-2xl font-bold text-slate-900">{value}</strong>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {icon && (
          <div className="rounded-2xl bg-primary-50 p-3 text-xl text-primary-700">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;
