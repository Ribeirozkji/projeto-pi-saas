# Checklist para transformar o MVP em produto comercial

## Segurança

- [ ] HTTPS obrigatório em todos os ambientes públicos.
- [ ] `COOKIE_SECURE=true` em produção.
- [ ] Segredos gerenciados por cofre de segredos, não por arquivos versionados.
- [ ] Rotação de `JWT_SECRET` e estratégia de invalidação de sessões.
- [ ] MFA para administradores e gerentes.
- [ ] Política de senha forte e bloqueio adaptativo por risco.
- [ ] Logs de auditoria para criação/edição/inativação de produtos, usuários, fornecedores, vendas e estoque.
- [ ] Monitoramento de eventos suspeitos de autenticação.
- [ ] Teste de invasão antes de produção.
- [ ] Revisão LGPD para dados pessoais de usuários, fornecedores e clientes futuros.

## Produto e negócio

- [ ] Multiempresa/multitenant com isolamento forte de dados.
- [ ] Gestão de planos, assinaturas e cobrança recorrente.
- [ ] Tela de configurações da empresa, logo, documento e endereço.
- [ ] Controle de caixa: abertura, fechamento, sangria e suprimento.
- [ ] Relatórios exportáveis em PDF/CSV/XLSX.
- [ ] Permissões configuráveis além dos perfis fixos.
- [ ] Trilhas de onboarding e dados de demonstração seguros.
- [ ] Termos de uso, política de privacidade e contrato de serviço.

## Fiscal e compliance

- [ ] Definir se o produto emitirá NF-e/NFC-e ou apenas comprovante interno.
- [ ] Se emitir documentos fiscais, integrar com SEFAZ e provedores homologados.
- [ ] Separar ambiente de homologação e produção fiscal.
- [ ] Armazenar XML/PDF fiscal conforme exigências legais.

## Engenharia

- [ ] Testes automatizados unitários, integração e e2e.
- [ ] Pipeline CI/CD com lint, build, testes e análise de segurança.
- [ ] Backups automáticos, restauração testada e política de retenção.
- [ ] Observabilidade: logs estruturados, métricas e tracing.
- [ ] Migrações versionadas com rollback planejado.
- [ ] Ambientes separados: desenvolvimento, staging e produção.
- [ ] CDN e cache adequado para o frontend.
- [ ] Política de atualização de dependências.

## Operação e suporte

- [ ] Painel administrativo interno para suporte.
- [ ] Processo de atendimento e SLA.
- [ ] Monitoramento de disponibilidade.
- [ ] Alertas para falhas de pagamento, queda de API e lentidão do banco.
- [ ] Documentação para implantação, operação e recuperação de desastre.
