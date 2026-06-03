const styles = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  error: 'bg-red-50 text-red-700 ring-red-100',
  warning: 'bg-amber-50 text-amber-700 ring-amber-100',
  info: 'bg-primary-50 text-primary-700 ring-primary-100'
};

function Alert({ message, type = 'info' }) {
  if (!message) return null;

  return (
    <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ring-1 ${styles[type] || styles.info}`}>
      {message}
    </div>
  );
}

export default Alert;
