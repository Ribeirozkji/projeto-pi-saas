const variants = {
  primary: 'bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-200',
  secondary: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 focus:ring-slate-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200'
};

function Button({ children, className = '', variant = 'primary', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
