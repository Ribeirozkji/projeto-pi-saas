# Sistema de controle de estoque e vendas

Aplicação web para controle simples de estoque e vendas, construída com **React + Vite** no frontend, **Node.js + Express** no backend e **MySQL** no banco de dados.

O sistema cobre cadastro de produtos, categorias, fornecedores, movimentações de estoque, vendas, comprovante sem valor fiscal, dashboard e relatórios básicos. A autenticação voltou a ser obrigatória e as ações críticas agora respeitam permissões por perfil.

> Este projeto não emite NF-e, NFC-e ou qualquer documento fiscal. O comprovante gerado é apenas um comprovante interno, sem valor fiscal.

## Estado atual

- Login com email e senha.
- Autenticação JWT.
- Rotas principais protegidas no backend.
- Rotas protegidas no frontend com `ProtectedRoute`.
- Token enviado automaticamente pelo Axios.
- Navbar com usuário autenticado e botão de sair.
- Sidebar filtrada conforme o perfil do usuário.
- Registro do usuário real em vendas e movimentações de estoque.
- Cancelamento de venda com motivo obrigatório.
- Auditoria básica de cancelamento: motivo, usuário responsável e data.
- Perfis de acesso: `admin`, `gerente`, `estoquista`, `operador`.

## Permissões

| Funcionalidade | Admin | Gerente | Estoquista | Operador |
| --- | --- | --- | --- | --- |
| Dashboard | Sim | Sim | Sim | Sim |
| Listar produtos | Sim | Sim | Sim | Sim |
| Criar/editar produtos | Sim | Sim | Não | Não |
| Inativar produtos | Sim | Não | Não | Não |
| Categorias e fornecedores | Sim | Sim | Consulta | Consulta |
| Movimentação manual de estoque | Sim | Sim | Sim | Não |
| Realizar venda | Sim | Sim | Não | Sim |
| Cancelar venda | Sim | Sim | Não | Não |
| Relatórios | Sim | Sim | Não | Não |
| Gerenciar usuários | Sim | Não | Não | Não |

## Funcionalidades

- Login e validação de sessão.
- CRUD de usuários para administradores.
- CRUD de produtos.
- CRUD de categorias.
- CRUD de fornecedores.
- Movimentações de estoque com entrada e saída.
- Bloqueio de saída maior que o estoque atual.
- Histórico de estoque com saldo anterior e saldo posterior.
- Venda com carrinho.
- Desconto simples na venda.
- Baixa automática de estoque ao finalizar venda.
- Cancelamento de venda com estorno de estoque.
- Motivo obrigatório no cancelamento.
- Comprovante simples sem valor fiscal.
- Dashboard com indicadores básicos.
- Relatórios de estoque, movimentações e vendas por período.

## Tecnologias

### Backend

- Node.js
- Express.js
- MySQL com `mysql2/promise`
- JWT
- Bcrypt
- Dotenv
- CORS

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Recharts

### Banco de dados

- MySQL 8+
- Schema inicial em `database/schema.sql`
- Migrações em `database/migrations`

## Estrutura

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
│   ├── schema.sql
│   └── migrations/
├── docs/
│   ├── arquitetura.md
│   └── migracoes.md
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

- Node.js 18 ou superior.
- npm.
- MySQL 8 ou superior.

## Como rodar

### 1. Instale as dependências

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure o banco de dados

Para uma base nova de desenvolvimento ou demonstração:

```bash
mysql -u root -p < database/schema.sql
```

O script cria o banco `estoque_vendas_saas`, as tabelas principais e dados iniciais.

> Atenção: `database/schema.sql` recria tabelas. Não execute esse arquivo em uma base com dados reais.

Para atualizar uma base já existente, use as migrações:

```bash
mysql -u root -p < database/migrations/001_auth_permissions_and_sale_cancellation.sql
```

Mais detalhes estão em `docs/migracoes.md`.

### 3. Configure o backend

Crie o arquivo `backend/.env` com base em `backend/.env.example`:

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
```

Depois rode:

```bash
cd backend
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000/api
```

Rota de saúde:

```text
http://localhost:3000/api/health
```

### 4. Configure o frontend

Crie o arquivo `frontend/.env` com base em `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

Depois rode:

```bash
cd frontend
npm run dev
```

O frontend ficará disponível em:

```text
http://localhost:5173
```

## Usuários iniciais

O schema inicial cria usuários de teste:

| Perfil | Email | Senha |
| --- | --- | --- |
| Admin | `admin@sistema.com` | `admin123` |
| Operador | `operador@sistema.com` | `admin123` |

Use o usuário admin para cadastrar novos usuários e atribuir os perfis necessários.

## Scripts úteis

### Backend

```bash
cd backend
npm run dev
npm start
npm run check
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run preview
```

## Rotas principais da API

Todas as rotas usam o prefixo `/api`.

### Autenticação

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/login` | Público | Realiza login e retorna JWT |
| GET | `/auth/me` | Autenticado | Retorna o usuário autenticado |

### Usuários

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/users` | Admin | Lista usuários |
| POST | `/users` | Admin | Cria usuário |
| PUT | `/users/:id` | Admin | Atualiza usuário |
| DELETE | `/users/:id` | Admin | Inativa usuário |

### Produtos

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/products` | Autenticado | Lista produtos com filtros |
| GET | `/products/:id` | Autenticado | Busca produto por ID |
| POST | `/products` | Admin/Gerente | Cria produto |
| PUT | `/products/:id` | Admin/Gerente | Atualiza produto |
| DELETE | `/products/:id` | Admin | Inativa produto |

### Categorias

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/categories` | Autenticado | Lista categorias |
| GET | `/categories/:id` | Autenticado | Busca categoria por ID |
| POST | `/categories` | Admin/Gerente | Cria categoria |
| PUT | `/categories/:id` | Admin/Gerente | Atualiza categoria |
| DELETE | `/categories/:id` | Admin | Inativa categoria |

### Fornecedores

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/suppliers` | Autenticado | Lista fornecedores |
| GET | `/suppliers/:id` | Autenticado | Busca fornecedor por ID |
| POST | `/suppliers` | Admin/Gerente | Cria fornecedor |
| PUT | `/suppliers/:id` | Admin/Gerente | Atualiza fornecedor |
| DELETE | `/suppliers/:id` | Admin | Inativa fornecedor |

### Estoque

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/stock/movements` | Autenticado | Lista movimentações |
| POST | `/stock/movements` | Admin/Gerente/Estoquista | Registra movimentação manual |
| GET | `/stock/low-stock` | Autenticado | Lista produtos com estoque baixo |
| GET | `/stock/near-expiration` | Autenticado | Lista produtos próximos do vencimento |

### Vendas

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/sales` | Autenticado | Lista vendas |
| GET | `/sales/:id` | Autenticado | Busca venda com itens |
| POST | `/sales` | Admin/Gerente/Operador | Finaliza venda e baixa estoque |
| POST | `/sales/:id/cancel` | Admin/Gerente | Cancela venda, exige motivo e estorna estoque |

### Dashboard

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/dashboard` | Autenticado | Indicadores gerais |

### Relatórios

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/reports/stock` | Admin/Gerente | Relatório de estoque |
| GET | `/reports/movements` | Admin/Gerente | Relatório de movimentações |
| GET | `/reports/sales` | Admin/Gerente | Relatório de vendas |

## Telas do frontend

| Rota | Tela |
| --- | --- |
| `/login` | Login |
| `/dashboard` | Dashboard |
| `/products` | Produtos |
| `/products/new` | Novo produto |
| `/products/:id/edit` | Editar produto |
| `/categories` | Categorias |
| `/suppliers` | Fornecedores |
| `/stock` | Movimentações de estoque |
| `/sales` | Vendas |
| `/sales/:id/receipt` | Comprovante sem valor fiscal |
| `/reports` | Relatórios |
| `/users` | Usuários |

## Regras de negócio

- SKU do produto deve ser único.
- Preço de venda não pode ser menor que preço de custo.
- Estoque atual e estoque mínimo não podem ser negativos.
- Entrada de estoque aumenta o saldo.
- Saída de estoque diminui o saldo.
- O sistema não permite saída maior que o estoque atual.
- Toda movimentação registra estoque anterior e estoque posterior.
- Venda finalizada baixa estoque automaticamente.
- Venda cancelada estorna o estoque.
- Cancelamento de venda exige motivo.
- Comprovante de venda não tem valor fiscal.

## Validação local

Comandos usados para validar o estado atual:

```bash
cd backend
npm run check

cd ../frontend
npm run build
```

## Limitações atuais

O sistema ainda não implementa:

- Emissão fiscal real.
- NF-e ou NFC-e.
- Integração com SEFAZ.
- Controle de caixa.
- Exportação PDF/Excel dos relatórios.
- Testes automatizados de API e frontend.
- Multiempresa/tenant para SaaS completo.
- Backup/restore automatizado.

## Próximas melhorias recomendadas

- Controle de caixa com abertura, fechamento, sangria e suprimento.
- Testes automatizados para venda, cancelamento, estoque e permissões.
- Auditoria mais ampla para alterações de produtos, usuários e estoque.
- Exportação de relatórios.
- Configurações da empresa, como nome, documento, endereço e logo.
- Deploy com HTTPS, CORS restrito e variáveis seguras.

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

### Token inválido ou expirado

Faça logout e login novamente. Se necessário, limpe o token salvo no navegador.

### Acesso negado

Verifique se o usuário tem o perfil necessário para a rota ou tela acessada.
