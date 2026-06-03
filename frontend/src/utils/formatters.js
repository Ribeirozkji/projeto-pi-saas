export function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

export function formatDate(value) {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('pt-BR');
}

export function formatDateTime(value) {
  if (!value) return '-';

  return new Date(value).toLocaleString('pt-BR');
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
