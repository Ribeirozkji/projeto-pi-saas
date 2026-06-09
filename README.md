<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
- CRUD de produtos.
- CRUD de categorias.
- CRUD de fornecedores.
- Movimentações de estoque com entrada e saída.
- Bloqueio de saída maior que o estoque atual.
<<<<<<< HEAD
- Histórico de estoque com estoque anterior e posterior.
- Venda simples com carrinho.
- Desconto simples na venda.
- Baixa automática de estoque ao vender.
- Cancelamento de venda com estorno de estoque.
- Comprovante simples sem valor fiscal.
- Dashboard com indicadores básicos.
- Relatórios de estoque atual, estoque baixo, movimentações e vendas por período.
=======
- Histórico de estoque com saldo anterior e saldo posterior.
- Venda com carrinho.
- Desconto simples na venda.
- Baixa automática de estoque ao finalizar venda.
- Cancelamento de venda com estorno de estoque.
- Motivo obrigatório no cancelamento.
- Comprovante simples sem valor fiscal.
- Dashboard com indicadores básicos.
- Relatórios de estoque, movimentações e vendas por período.
>>>>>>> origin/main

## Tecnologias

### Backend

- Node.js
- Express.js
- MySQL com `mysql2/promise`
<<<<<<< HEAD
- JWT e Bcrypt mantidos no projeto para reativação futura do login
- Dotenv
- Cors
=======
- JWT
- Bcrypt
- Dotenv
- CORS
>>>>>>> origin/main

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Tailwind CSS
<<<<<<< HEAD
- React Hook Form disponível para evolução
- Recharts disponível para evolução
=======
- Recharts
>>>>>>> origin/main

### Banco de dados

- MySQL 8+
<<<<<<< HEAD
- Script SQL em `database/schema.sql`

## Estrutura do projeto
=======
- Schema inicial em `database/schema.sql`
- Migrações em `database/migrations`

## Estrutura
>>>>>>> origin/main

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
<<<<<<< HEAD
│   └── schema.sql
├── docs/
│   └── arquitetura.md
=======
│   ├── schema.sql
│   └── migrations/
├── docs/
│   ├── arquitetura.md
│   └── migracoes.md
>>>>>>> origin/main
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

<<<<<<< HEAD
Instale antes de rodar:

=======
>>>>>>> origin/main
- Node.js 18 ou superior.
- npm.
- MySQL 8 ou superior.

<<<<<<< HEAD
## Como rodar o projeto

### 1. Clone o projeto

```bash
git clone <url-do-repositorio>
cd projeto-pi-saas
=======
## Como rodar

### 1. Instale as dependências

```bash
cd backend
npm install

cd ../frontend
npm install
>>>>>>> origin/main
```

### 2. Configure o banco de dados

<<<<<<< HEAD
Entre no MySQL e execute o script:
=======
Para uma base nova de desenvolvimento ou demonstração:
>>>>>>> origin/main

```bash
mysql -u root -p < database/schema.sql
```

O script cria o banco `estoque_vendas_saas`, as tabelas principais e dados iniciais.

<<<<<<< HEAD
### 3. Configure o backend

```bash
cd backend
cp .env.example .env
npm install
```

Edite o arquivo `backend/.env` com os dados do seu MySQL:
=======
> Atenção: `database/schema.sql` recria tabelas. Não execute esse arquivo em uma base com dados reais.

Para atualizar uma base já existente, use as migrações:

```bash
mysql -u root -p < database/migrations/001_auth_permissions_and_sale_cancellation.sql
```

Mais detalhes estão em `docs/migracoes.md`.

### 3. Configure o backend

Crie o arquivo `backend/.env` com base em `backend/.env.example`:
>>>>>>> origin/main

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
<<<<<<< HEAD
# JWT está mantido apenas para reativação futura do login.
=======
>>>>>>> origin/main
```

Depois rode:

```bash
<<<<<<< HEAD
=======
cd backend
>>>>>>> origin/main
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000/api
```

<<<<<<< HEAD
Você também pode abrir a raiz do backend no navegador para conferir se o servidor está no ar:

```text
http://localhost:3000/
```

E a rota de saúde da API fica em:
=======
Rota de saúde:
>>>>>>> origin/main

```text
http://localhost:3000/api/health
```

### 4. Configure o frontend

<<<<<<< HEAD
Abra outro terminal:

```bash
cd frontend
cp .env.example .env
npm install
=======
Crie o arquivo `frontend/.env` com base em `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

Depois rode:

```bash
cd frontend
>>>>>>> origin/main
npm run dev
```

O frontend ficará disponível em:

```text
http://localhost:5173
```

## Usuários iniciais

<<<<<<< HEAD
O banco ainda inclui usuários de teste porque as tabelas de vendas e movimentações usam `user_id`. Nesta versão temporária sem login, o backend usa o usuário de ID `1` automaticamente para registrar vendas e movimentações.

=======
O schema inicial cria usuários de teste:
>>>>>>> origin/main

| Perfil | Email | Senha |
| --- | --- | --- |
| Admin | `admin@sistema.com` | `admin123` |
| Operador | `operador@sistema.com` | `admin123` |

<<<<<<< HEAD
> O login não é obrigatório nesta etapa. As credenciais ficam documentadas apenas para quando a autenticação for reativada.
=======
Use o usuário admin para cadastrar novos usuários e atribuir os perfis necessários.
>>>>>>> origin/main

## Scripts úteis

### Backend

```bash
cd backend
<<<<<<< HEAD
npm run dev      # roda com nodemon
npm start        # roda com node
npm run check    # valida sintaxe dos arquivos principais com node --check
=======
npm run dev
npm start
npm run check
>>>>>>> origin/main
```

### Frontend

```bash
cd frontend
<<<<<<< HEAD
npm run dev      # inicia o Vite
npm run build    # gera build de produção
npm run preview  # pré-visualiza o build
=======
npm run dev
npm run build
npm run preview
>>>>>>> origin/main
```

## Rotas principais da API

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main

- SKU do produto deve ser único.
- Preço de venda não pode ser menor que preço de custo.
- Estoque atual e estoque mínimo não podem ser negativos.
- Entrada de estoque aumenta o saldo.
- Saída de estoque diminui o saldo.
- O sistema não permite saída maior que o estoque atual.
- Toda movimentação registra estoque anterior e estoque posterior.
- Venda finalizada baixa estoque automaticamente.
- Venda cancelada estorna o estoque.
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main

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

<<<<<<< HEAD
### Mensagem "Rota não encontrada"

Confira se você está acessando uma rota existente. A API usa o prefixo `/api`, por exemplo `http://localhost:3000/api/products`. A raiz `http://localhost:3000/` retorna uma mensagem simples de status do backend.

### Token inválido ou expirado

Faça logout e login novamente. Se necessário, limpe o `localStorage` do navegador.

### Dependências não instalam

Verifique sua conexão com a internet e o acesso ao registry do npm. Em redes corporativas ou ambientes restritos, pode ser necessário configurar proxy ou registry interno.
=======
### Token inválido ou expirado

Faça logout e login novamente. Se necessário, limpe o token salvo no navegador.

### Acesso negado

Verifique se o usuário tem o perfil necessário para a rota ou tela acessada.
>>>>>>> origin/main
