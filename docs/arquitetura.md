# Arquitetura simples do projeto

Este projeto será uma aplicação web simples de controle de estoque e vendas, construída em etapas com **React.js**, **Node.js + Express** e **MySQL**.

A ideia principal é manter uma arquitetura clara para um estudante entender, sem microserviços, sem emissão fiscal real e sem padrões avançados desnecessários.

## Visão geral

A aplicação será dividida em três partes principais:

1. **Frontend**: interface web usada pelo usuário.
2. **Backend**: API REST responsável pelas regras de negócio.
3. **Banco de dados**: MySQL, responsável por armazenar usuários, produtos, estoque, vendas e relatórios básicos.

```text
Usuário
  ↓
Frontend React
  ↓ HTTP/JSON
Backend Express
  ↓ SQL parametrizado
Banco MySQL
```

## Responsabilidade de cada camada

### Frontend

O frontend será responsável por:

- Mostrar as telas do sistema.
- Fazer login e logout.
- Proteger páginas que exigem autenticação.
- Consumir a API usando Axios.
- Exibir tabelas, formulários, cards, gráficos e mensagens de erro.
- Manter uma interface profissional, simples e responsiva.

### Backend

O backend será responsável por:

- Receber as requisições HTTP.
- Validar dados enviados pelo frontend.
- Autenticar usuários com JWT.
- Criptografar senhas com bcrypt.
- Executar regras simples de negócio.
- Consultar e alterar dados no MySQL usando queries parametrizadas.
- Retornar respostas claras para o frontend.

### Banco de dados

O banco de dados será responsável por armazenar:

- Usuários.
- Categorias.
- Fornecedores.
- Produtos.
- Movimentações de estoque.
- Vendas.
- Itens das vendas.
- Configurações simples da empresa, se necessário.

## Estrutura de pastas

```text
projeto-pi-saas/
├── database/
│   └── schema.sql
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       │   └── database.js
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   └── error.middleware.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── users.routes.js
│       │   ├── products.routes.js
│       │   ├── categories.routes.js
│       │   ├── suppliers.routes.js
│       │   ├── stock.routes.js
│       │   ├── sales.routes.js
│       │   ├── dashboard.routes.js
│       │   └── reports.routes.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   ├── users.controller.js
│       │   ├── products.controller.js
│       │   ├── categories.controller.js
│       │   ├── suppliers.controller.js
│       │   ├── stock.controller.js
│       │   ├── sales.controller.js
│       │   ├── dashboard.controller.js
│       │   └── reports.controller.js
│       └── utils/
│           ├── generateToken.js
│           └── asyncHandler.js
│
├── frontend/
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── services/
│       │   └── api.js
│       ├── contexts/
│       │   └── AuthContext.jsx
│       ├── routes/
│       │   ├── AppRoutes.jsx
│       │   └── ProtectedRoute.jsx
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   ├── Navbar.jsx
│       │   ├── Card.jsx
│       │   ├── Table.jsx
│       │   ├── Button.jsx
│       │   ├── Input.jsx
│       │   └── Badge.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── Products.jsx
│           ├── ProductForm.jsx
│           ├── Categories.jsx
│           ├── Suppliers.jsx
│           ├── StockMovements.jsx
│           ├── Sales.jsx
│           ├── SaleReceipt.jsx
│           ├── Reports.jsx
│           └── Users.jsx
│
└── docs/
    └── arquitetura.md
```

## Organização do backend

### `src/server.js`

Arquivo que iniciará o servidor Express e definirá a porta da aplicação.

### `src/app.js`

Arquivo que configurará o Express, middlewares globais, CORS, JSON e rotas da API.

### `src/config/database.js`

Arquivo de conexão com o MySQL.

### `src/middlewares/`

Pasta para middlewares reaproveitáveis:

- `auth.middleware.js`: valida o token JWT e identifica o usuário logado.
- `error.middleware.js`: centraliza o tratamento básico de erros.

### `src/routes/`

Pasta para as rotas da API. Cada módulo terá seu próprio arquivo de rotas.

Exemplo de responsabilidade:

- `products.routes.js`: define rotas como `GET /api/products` e `POST /api/products`.
- `sales.routes.js`: define rotas como `POST /api/sales` e `POST /api/sales/:id/cancel`.

### `src/controllers/`

Pasta para os controllers. Cada controller receberá a requisição, chamará o banco de dados e retornará a resposta.

Para manter o projeto simples, os controllers poderão acessar o banco diretamente usando queries parametrizadas.

### `src/utils/`

Pasta para funções auxiliares pequenas:

- `generateToken.js`: gera o JWT do usuário.
- `asyncHandler.js`: evita repetição de tratamento de erro em controllers assíncronos.

## Organização do frontend

### `src/main.jsx`

Arquivo inicial do React, responsável por renderizar a aplicação.

### `src/App.jsx`

Componente principal da aplicação.

### `src/services/api.js`

Configuração central do Axios, incluindo URL base da API e envio automático do token JWT.

### `src/contexts/AuthContext.jsx`

Contexto de autenticação para armazenar usuário logado, token, login e logout.

### `src/routes/`

Pasta responsável pelas rotas do frontend:

- `AppRoutes.jsx`: define as páginas da aplicação.
- `ProtectedRoute.jsx`: bloqueia acesso de usuários não autenticados.

### `src/components/`

Componentes reutilizáveis da interface:

- Sidebar.
- Navbar.
- Cards.
- Tabelas.
- Botões.
- Inputs.
- Badges.

### `src/pages/`

Telas principais do sistema:

- Login.
- Dashboard.
- Produtos.
- Categorias.
- Fornecedores.
- Movimentações de estoque.
- Vendas.
- Comprovante.
- Relatórios.
- Usuários.

## Fluxo básico da aplicação

1. O usuário acessa o frontend.
2. O usuário informa email e senha na tela de login.
3. O frontend envia os dados para `POST /api/auth/login`.
4. O backend valida o usuário no MySQL.
5. Se estiver correto, o backend retorna um token JWT.
6. O frontend salva o token e libera as rotas protegidas.
7. As próximas requisições enviam o token no cabeçalho.
8. O backend valida o token antes de permitir acesso aos dados.

## Regras para manter o projeto simples

- Não usar microserviços.
- Não criar camadas demais.
- Não implementar emissão fiscal real.
- Não integrar com SEFAZ.
- Não usar regras tributárias complexas.
- Não apagar movimentações de estoque.
- Usar queries parametrizadas para evitar SQL Injection.
- Criar telas completas, mas objetivas.
- Priorizar código legível para estudantes.

## Banco de dados inicial

O script inicial do banco ficará em `database/schema.sql`. Ele criará as tabelas principais, chaves estrangeiras, índices básicos e dados de teste para começar o desenvolvimento.


## Backend base

A base inicial do backend fica em `backend/` e já contém `package.json`, `.env.example`, configuração do Express, conexão com MySQL e middlewares básicos de autenticação/autorização e erro.


## Autenticação e usuários

O backend já possui login com JWT, rota para consultar o usuário autenticado e CRUD simples de usuários administradores. As rotas iniciais são `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/users`, `POST /api/users`, `PUT /api/users/:id` e `DELETE /api/users/:id`.

## Próxima etapa

A próxima etapa será implementar produtos, categorias e fornecedores no backend.


