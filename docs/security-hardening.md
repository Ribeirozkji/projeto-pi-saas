# Relatório de hardening de segurança

Este documento registra as mudanças aplicadas após a reanálise defensiva da aplicação. A revisão atual mantém o patch menor para reduzir risco de conflitos de merge: mudanças em controllers de negócio e documentação central foram minimizadas.

## Alterações realizadas e motivos

### 1. Sessão em cookie HttpOnly

- O login agora grava o JWT em cookie HttpOnly configurável por ambiente.
- O frontend deixou de persistir token em `localStorage`.
- Motivo: reduzir o impacto de XSS, pois JavaScript no navegador não consegue ler cookies HttpOnly.

Arquivos envolvidos:

- `backend/src/controllers/auth.controller.js`
- `backend/src/middlewares/security.middleware.js`
- `frontend/src/services/api.js`
- `frontend/src/contexts/AuthContext.jsx`

### 2. Rate limiting no login

- A rota `POST /api/auth/login` recebeu limite de tentativas por IP e email.
- Motivo: reduzir força bruta e credential stuffing.
- Configuração via `LOGIN_RATE_LIMIT_WINDOW_MS` e `LOGIN_RATE_LIMIT_MAX`.

Arquivos envolvidos:

- `backend/src/routes/auth.routes.js`
- `backend/src/middlewares/security.middleware.js`

### 3. Resposta uniforme para falha de autenticação

- Usuário inexistente, senha errada e usuário inativo agora retornam a mesma mensagem pública.
- Foi adicionada comparação com hash fictício para reduzir diferença de tempo em usuário inexistente.
- Motivo: reduzir enumeração de contas.

Arquivo envolvido:

- `backend/src/controllers/auth.controller.js`

### 4. Headers de segurança HTTP

- Foram adicionados headers defensivos como `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Resource-Policy` e HSTS em produção.
- Motivo: hardening contra clickjacking, MIME sniffing e vazamentos por referrer.

Arquivo envolvido:

- `backend/src/middlewares/security.middleware.js`

### 5. Proteção adicional para requisições com cookie

- Requisições autenticadas por cookie e com métodos mutáveis exigem `X-Requested-With: XMLHttpRequest`.
- O frontend envia esse cabeçalho automaticamente pelo Axios.
- Motivo: reduzir risco de CSRF em endpoints que usam cookie de sessão.

Arquivos envolvidos:

- `backend/src/middlewares/security.middleware.js`
- `frontend/src/services/api.js`

### 6. JWT com issuer e audience

- Tokens passaram a ser assinados e validados com `issuer` e `audience` configuráveis.
- Motivo: reduzir aceite acidental de tokens emitidos para outro contexto.

Arquivos envolvidos:

- `backend/src/utils/generateToken.js`
- `backend/src/middlewares/auth.middleware.js`

### 7. Remoção de fallback de auditoria para usuário 1

- Vendas, cancelamentos e movimentações não usam mais fallback para o usuário `1`.
- Motivo: impedir atribuição indevida de ações ao administrador inicial se uma rota futura esquecer autenticação.

Arquivos envolvidos:

- `backend/src/controllers/sales.controller.js`
- `backend/src/controllers/stock.controller.js`

### 8. Migração consolidada para usuários semeados

- A desativação de contas semeadas conhecidas foi consolidada na migração `002_fix_initial_user_passwords.sql`, evitando um arquivo SQL extra.
- Motivo: manter um fluxo de migração mais simples e impedir uso de credenciais padrão em bases antigas.

Arquivo envolvido:

- `database/migrations/002_fix_initial_user_passwords.sql`

## Observações operacionais

- Em produção, defina `COOKIE_SECURE=true` e use HTTPS.
- Use `JWT_SECRET` aleatório, longo e diferente por ambiente.
- Configure `FRONTEND_URL` exatamente com a origem pública do frontend.
- O endpoint de logout é `POST /api/auth/logout`.
- O rate limiter em memória é adequado para MVP; em múltiplas instâncias, substitua por Redis ou serviço equivalente.
