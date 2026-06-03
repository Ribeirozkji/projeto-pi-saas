# Sistema simples de controle de estoque e vendas

Aplicação web simples, funcional e organizada para controle de estoque e vendas, criada com **React + Vite** no frontend, **Node.js + Express** no backend e **MySQL** no banco de dados.

O projeto foi pensado para ser desenvolvido e apresentado por estudantes: ele evita arquitetura exagerada, microserviços, emissão fiscal real, NF-e/NFC-e e integrações com SEFAZ. O comprovante de venda é apenas uma visualização simples **sem valor fiscal**.


## Modo temporário sem autenticação

Nesta etapa, a autenticação foi desativada de propósito para facilitar os testes de estoque, vendas e relatórios.

- O frontend abre diretamente no dashboard.
- A rota `/login` redireciona para `/dashboard`.
- As rotas principais da API não exigem cabeçalho `Authorization`.
- Movimentações de estoque e vendas usam temporariamente o usuário padrão `id = 1`.
- Os arquivos de autenticação continuam no projeto para reintrodução futura, mas não bloqueiam o uso do sistema.

## Funcionalidades implementadas

- Autenticação temporariamente desativada para estabilizar o sistema.
- Acesso direto ao dashboard, sem login e sem token.
- Rotas principais públicas no frontend e backend.
- CRUD simples de usuários mantido para uso futuro, sem bloqueio por perfil neste momento.
- CRUD de produtos.
- CRUD de categorias.
- CRUD de fornecedores.
- Movimentações de estoque com entrada e saída.
- Bloqueio de saída maior que o estoque atual.
- Histórico de estoque com estoque anterior e posterior.
- Venda simples com carrinho.
- Desconto simples na venda.
- Baixa automática de estoque ao vender.
- Cancelamento de venda com estorno de estoque.
- Comprovante simples sem valor fiscal.
- Dashboard com indicadores básicos.
- Relatórios de estoque atual, estoque baixo, movimentações e vendas por período.

## Tecnologias

### Backend

- Node.js
- Express.js
- MySQL com `mysql2/promise`
- JWT e Bcrypt mantidos no projeto para reativação futura do login
- Dotenv
- Cors

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- React Hook Form disponível para evolução
- Recharts disponível para evolução

### Banco de dados

- MySQL 8+
- Script SQL em `database/schema.sql`

## Estrutura do projeto

```text
projeto-pi-saas/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       └── utils/
├── database/
│   └── schema.sql
├── docs/
│   └── arquitetura.md
└── frontend/
    ├── .env.example
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── components/
        ├── contexts/
        ├── pages/
        ├── routes/
        ├── services/
        └── utils/
```

## Pré-requisitos

Instale antes de rodar:

- Node.js 18 ou superior.
- npm.
- MySQL 8 ou superior.

## Como rodar o projeto

### 1. Clone o projeto

```bash
git clone <url-do-repositorio>
cd projeto-pi-saas
```

### 2. Configure o banco de dados

Entre no MySQL e execute o script:

```bash
mysql -u root -p < database/schema.sql
```

O script cria o banco `estoque_vendas_saas`, as tabelas principais e dados iniciais.

### 3. Configure o backend

```bash
cd backend
cp .env.example .env
npm install
```

Edite o arquivo `backend/.env` com os dados do seu MySQL:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=estoque_vendas_saas
DB_CONNECTION_LIMIT=10

JWT_SECRET=troque_esta_chave_por_uma_chave_grande_e_segura
JWT_EXPIRES_IN=1d
# JWT está mantido apenas para reativação futura do login.
```

Depois rode:

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000/api
```

Você também pode abrir a raiz do backend no navegador para conferir se o servidor está no ar:

```text
http://localhost:3000/
```

E a rota de saúde da API fica em:

```text
http://localhost:3000/api/health
```

### 4. Configure o frontend

Abra outro terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

O frontend ficará disponível em:

```text
http://localhost:5173
```

## Usuários iniciais

O banco ainda inclui usuários de teste porque as tabelas de vendas e movimentações usam `user_id`. Nesta versão temporária sem login, o backend usa o usuário de ID `1` automaticamente para registrar vendas e movimentações.


| Perfil | Email | Senha |
| --- | --- | --- |
| Admin | `admin@sistema.com` | `admin123` |
| Operador | `operador@sistema.com` | `admin123` |

> O login não é obrigatório nesta etapa. As credenciais ficam documentadas apenas para quando a autenticação for reativada.

## Scripts úteis

### Backend

```bash
cd backend
npm run dev      # roda com nodemon
npm start        # roda com node
npm run check    # valida sintaxe dos arquivos principais com node --check
```

### Frontend

```bash
cd frontend
npm run dev      # inicia o Vite
npm run build    # gera build de produção
npm run preview  # pré-visualiza o build
```

## Rotas principais da API

Todas as rotas abaixo usam prefixo `/api`.

### Autenticação

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/auth/login` | Login mantido no código para uso futuro, não obrigatório agora |
| GET | `/auth/me` | Retorna usuário local simulado nesta etapa sem autenticação |

### Usuários

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/users` | Lista usuários |
| POST | `/users` | Cria usuário |
| PUT | `/users/:id` | Atualiza usuário |
| DELETE | `/users/:id` | Inativa usuário |

### Produtos

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/products` | Lista produtos com filtros |
| GET | `/products/:id` | Busca produto por ID |
| POST | `/products` | Cria produto |
| PUT | `/products/:id` | Atualiza produto |
| DELETE | `/products/:id` | Inativa produto |

### Categorias

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/categories` | Lista categorias |
| GET | `/categories/:id` | Busca categoria por ID |
| POST | `/categories` | Cria categoria |
| PUT | `/categories/:id` | Atualiza categoria |
| DELETE | `/categories/:id` | Inativa categoria |

### Fornecedores

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/suppliers` | Lista fornecedores |
| GET | `/suppliers/:id` | Busca fornecedor por ID |
| POST | `/suppliers` | Cria fornecedor |
| PUT | `/suppliers/:id` | Atualiza fornecedor |
| DELETE | `/suppliers/:id` | Inativa fornecedor |

### Estoque

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/stock/movements` | Lista movimentações |
| POST | `/stock/movements` | Registra entrada ou saída manual |
| GET | `/stock/low-stock` | Lista produtos com estoque baixo |
| GET | `/stock/near-expiration` | Lista produtos próximos do vencimento |

### Vendas

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/sales` | Lista vendas |
| GET | `/sales/:id` | Busca venda com itens |
| POST | `/sales` | Finaliza venda e baixa estoque |
| POST | `/sales/:id/cancel` | Cancela venda e estorna estoque |

### Dashboard

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/dashboard` | Indicadores gerais, vendas recentes e movimentações do mês |

### Relatórios

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/reports/stock` | Relatório de estoque atual e estoque baixo |
| GET | `/reports/movements` | Relatório de movimentações |
| GET | `/reports/sales` | Relatório de vendas por período |

## Principais telas do frontend

| Rota | Tela |
| --- | --- |
| `/login` | Redireciona para o dashboard no modo sem autenticação |
| `/dashboard` | Dashboard |
| `/products` | Produtos |
| `/categories` | Categorias |
| `/suppliers` | Fornecedores |
| `/stock` | Movimentações de estoque |
| `/sales` | Vendas simples |
| `/sales/:id/receipt` | Comprovante sem valor fiscal |
| `/reports` | Relatórios básicos |
| `/users` | Usuários |

## Regras de negócio importantes

- SKU do produto deve ser único.
- Preço de venda não pode ser menor que preço de custo.
- Estoque atual e estoque mínimo não podem ser negativos.
- Entrada de estoque aumenta o saldo.
- Saída de estoque diminui o saldo.
- O sistema não permite saída maior que o estoque atual.
- Toda movimentação registra estoque anterior e estoque posterior.
- Venda finalizada baixa estoque automaticamente.
- Venda cancelada estorna o estoque.
- Comprovante de venda não tem valor fiscal.

## Observações para apresentação

Este projeto é adequado para apresentação acadêmica ou demonstração de sistema interno simples. Ele demonstra:

- CRUD.
- API REST.
- API REST pública temporariamente, com autenticação preparada para reativação futura.
- Relacionamento entre tabelas MySQL.
- Consumo de API no React.
- Componentização.
- Regras de negócio simples.
- Layout responsivo com Tailwind CSS.

## Limitações intencionais

O sistema não implementa:

- NF-e.
- NFC-e.
- Emissão fiscal real.
- Integração com SEFAZ.
- Regras tributárias complexas.
- Microserviços.
- Exportação PDF/Excel.

Essas limitações são intencionais para manter o projeto simples, didático e possível de manter por iniciantes.

## Solução de problemas

### Erro de conexão com MySQL

Confira se:

- O MySQL está rodando.
- O banco `estoque_vendas_saas` foi criado.
- As credenciais em `backend/.env` estão corretas.

### Erro de CORS

Confira se o `FRONTEND_URL` no `backend/.env` está igual à URL do Vite:

```env
FRONTEND_URL=http://localhost:5173
```

### Mensagem "Rota não encontrada"

Confira se você está acessando uma rota existente. A API usa o prefixo `/api`, por exemplo `http://localhost:3000/api/products`. A raiz `http://localhost:3000/` retorna uma mensagem simples de status do backend.

### Token inválido ou expirado

Faça logout e login novamente. Se necessário, limpe o `localStorage` do navegador.

### Dependências não instalam

Verifique sua conexão com a internet e o acesso ao registry do npm. Em redes corporativas ou ambientes restritos, pode ser necessário configurar proxy ou registry interno.
