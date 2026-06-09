# Migrações do banco

Use o arquivo `database/schema.sql` apenas para criar uma base nova de desenvolvimento ou demonstração. Ele recria as tabelas e não deve ser executado sobre uma base com dados reais.

Para atualizar uma base existente, execute as migrações da pasta `database/migrations` em ordem.

## 001_auth_permissions_and_sale_cancellation.sql

Esta migração adiciona os perfis `gerente` e `estoquista`, além dos campos de auditoria mínima para cancelamento de vendas:

- `sales.cancel_reason`
- `sales.canceled_by`
- `sales.canceled_at`

Execute:

```bash
mysql -u root -p < database/migrations/001_auth_permissions_and_sale_cancellation.sql
```
