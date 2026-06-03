import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';

function ProductForm() {
  return (
    <div>
      <PageHeader title="Formulário de produto" subtitle="Base visual do cadastro de produtos." />
      <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="SKU" placeholder="Ex: ALM-001" />
          <Input label="Nome" placeholder="Nome do produto" />
          <Input label="Preço de custo" type="number" step="0.01" placeholder="0,00" />
          <Input label="Preço de venda" type="number" step="0.01" placeholder="0,00" />
          <Input label="Estoque atual" type="number" placeholder="0" />
          <Input label="Estoque mínimo" type="number" placeholder="0" />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary">Cancelar</Button>
          <Button>Salvar produto</Button>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
