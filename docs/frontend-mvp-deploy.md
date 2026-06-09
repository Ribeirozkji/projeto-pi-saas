# Deploy do frontend MVP

O frontend do MVP é uma aplicação React/Vite estática. O build de produção gera os arquivos em `frontend/dist`.

## Gerar build

```bash
cd frontend
npm run build
```

## Pré-visualizar localmente

```bash
cd frontend
npm run preview -- --host 0.0.0.0
```

## Publicar em hospedagem estática

Publique o conteúdo de `frontend/dist` em uma hospedagem estática, como Nginx, S3/CloudFront, Netlify, Vercel ou serviço equivalente.

Configure a variável de build:

```env
VITE_API_URL=https://api.seu-dominio.com/api
```

No backend de produção, configure:

```env
FRONTEND_URL=https://seu-dominio.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=Lax
```

## Observações do MVP

- O comprovante continua sem valor fiscal.
- O MVP exige API e banco MySQL disponíveis para login e dados reais.
- Usuários padrão ficam inativos por segurança; crie/ative usuários de forma controlada.
