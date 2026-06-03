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
- Exibir as páginas principais em modo público temporário, sem obrigar login.
- Consumir a API usando Axios.
- Exibir tabelas, formulários, cards, gráficos e mensagens de erro.
- Manter uma interface profissional, simples e responsiva.

### Backend

O backend será responsável por:

- Receber as requisições HTTP.
- Validar dados enviados pelo frontend.
- Manter autenticação preparada para reativação futura, sem bloquear as rotas principais nesta etapa.
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

- `auth.middleware.js`: mantido para reativação futura; não é usado nas rotas principais enquanto o modo sem autenticação está ativo.
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

Configuração central do Axios com a URL base da API. Nesta etapa, o cliente não envia token obrigatório.

### `src/contexts/AuthContext.jsx`

Contexto mantido como compatibilidade. Nesta etapa, retorna um usuário local fixo e não controla sessão real.

### `src/routes/`

Pasta responsável pelas rotas do frontend:

- `AppRoutes.jsx`: define as páginas da aplicação.
- `ProtectedRoute.jsx`: mantido como compatibilidade, mas libera o acesso enquanto o login está desativado.

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

- Login mantido apenas como arquivo de compatibilidade.
- Dashboard.
- Produtos.
- Categorias.
- Fornecedores.
- Movimentações de estoque.
- Vendas.
- Comprovante.
- Relatórios.
- Usuários.

## Fluxo básico da aplicação no modo sem autenticação

1. O usuário acessa o frontend.
2. O React Router abre o dashboard sem passar por tela de login.
3. As páginas chamam a API com Axios sem enviar token obrigatório.
4. O backend responde às rotas principais sem `authMiddleware` e sem bloqueio por perfil.
5. Quando uma venda ou movimentação precisa de `user_id`, o backend usa temporariamente o usuário padrão `id = 1`.

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

A base inicial do backend fica em `backend/` e já contém `package.json`, `.env.example`, configuração do Express, conexão com MySQL, middleware de erro e arquivos de autenticação mantidos para reativação futura.

## Autenticação e usuários

O backend mantém os arquivos de login com JWT para evolução futura, mas as rotas principais estão públicas temporariamente e o CRUD de usuários não exige perfil de administrador nesta etapa. As rotas iniciais são `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/users`, `POST /api/users`, `PUT /api/users/:id` e `DELETE /api/users/:id`.

## Produtos, categorias e fornecedores

O backend já possui CRUD completo de produtos, categorias e fornecedores com rotas públicas temporárias, validações básicas, filtros simples e consultas MySQL parametrizadas.

## Estoque e movimentações

O backend já possui registro e consulta de movimentações de estoque. Entradas aumentam estoque, saídas diminuem estoque, saídas maiores que o saldo atual são bloqueadas e cada histórico registra estoque anterior e posterior.

## Vendas simples

O backend já possui vendas simples com criação de venda, itens, cálculo de subtotal/desconto/total, baixa automática do estoque, registro de movimentação de saída e cancelamento com estorno do estoque.

## Frontend base

O frontend já possui base com Vite, React, Tailwind CSS, React Router, Axios, sidebar, navbar, componentes reutilizáveis e layout principal público temporário.

## Telas principais do frontend

As telas de dashboard, produtos, categorias, fornecedores e movimentações de estoque já possuem layout funcional, filtros, formulários e integração com as rotas existentes do backend.

## Vendas e comprovante no frontend

A tela de vendas já possui carrinho, busca de produto, quantidade, desconto, forma de pagamento, finalização integrada com o backend e comprovante simples sem valor fiscal para visualização e impressão.

## Relatórios básicos

O backend e o frontend já possuem relatórios básicos de estoque atual, produtos com estoque baixo, movimentações e vendas por período, com filtros simples e resumos em cards.

## Usuários no frontend e README

A tela de usuários já está integrada ao backend sem bloqueio por perfil nesta etapa, e o projeto possui README completo com instruções de instalação, configuração, rotas, telas e regras principais.

## Próxima etapa

A próxima etapa será realizar testes integrados em ambiente local com MySQL, backend e frontend rodando juntos.
