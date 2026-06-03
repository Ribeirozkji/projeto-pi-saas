import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Alert from '../components/Alert.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import PageHeader from '../components/PageHeader.jsx';
import api from '../services/api.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';

const paymentLabels = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartao_debito: 'Cartão de débito',
  cartao_credito: 'Cartão de crédito'
};

function SaleReceipt() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSale() {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get(`/sales/${id}`);
        setSale(data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Não foi possível carregar o comprovante.');
      } finally {
        setLoading(false);
      }
    }

    loadSale();
  }, [id]);

  return (
    <div>
      <div className="print:hidden">
        <PageHeader
          title="Comprovante de venda"
          subtitle="Visualização simples para impressão, sem valor fiscal."
          action={(
            <div className="flex gap-2">
              <Link to="/sales"><Button variant="secondary">Voltar</Button></Link>
              <Button onClick={() => window.print()} disabled={!sale}>Imprimir</Button>
            </div>
          )}
        />
      </div>

      <Alert message={error} type="error" />

      {loading && (
        <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-soft ring-1 ring-slate-100">
          Carregando comprovante...
        </div>
      )}

      {sale && (
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 font-mono text-sm shadow-soft ring-1 ring-slate-100 print:max-w-full print:rounded-none print:p-0 print:shadow-none print:ring-0">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900">Estoque & Vendas</h3>
            <p className="mt-1 text-slate-500">Sistema simples de controle de estoque</p>
            <p className="mt-2 font-bold uppercase text-red-600">Comprovante sem valor fiscal</p>
          </div>

          <div className="my-6 border-y border-dashed border-slate-300 py-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <p><strong>Venda:</strong> {sale.numero_venda}</p>
              <p><strong>Status:</strong> <Badge variant={sale.status === 'cancelada' ? 'perigo' : 'ativo'}>{sale.status}</Badge></p>
              <p><strong>Data:</strong> {formatDateTime(sale.created_at)}</p>
              <p><strong>Operador:</strong> {sale.usuario_nome}</p>
              <p><strong>Pagamento:</strong> {paymentLabels[sale.forma_pagamento] || sale.forma_pagamento}</p>
            </div>
          </div>

          <div className="space-y-3">
            {sale.items.map((item) => (
              <div key={item.id} className="border-b border-dashed border-slate-200 pb-3">
                <div className="flex justify-between gap-4">
                  <strong className="text-slate-900">{item.produto_nome}</strong>
                  <span>{formatCurrency(item.total_item)}</span>
                </div>
                <div className="mt-1 flex justify-between text-slate-500">
                  <span>SKU: {item.produto_sku}</span>
                  <span>{item.quantidade} x {formatCurrency(item.preco_unitario)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 text-right">
            <p><span className="text-slate-500">Subtotal:</span> <strong>{formatCurrency(sale.subtotal)}</strong></p>
            <p><span className="text-slate-500">Desconto:</span> <strong>{formatCurrency(sale.desconto)}</strong></p>
            <p className="text-xl"><span className="text-slate-500">Total:</span> <strong>{formatCurrency(sale.total)}</strong></p>
          </div>

          <div className="mt-8 text-center text-xs uppercase tracking-wide text-slate-500">
            Obrigado pela preferência • Comprovante sem valor fiscal
          </div>
        </div>
      )}
    </div>
  );
}

export default SaleReceipt;
