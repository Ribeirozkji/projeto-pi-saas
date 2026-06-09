USE estoque_vendas_saas;

-- Mantém o hash conhecido apenas para compatibilidade de bases antigas,
-- mas desativa as contas semeadas para impedir uso de credenciais padrão.
UPDATE users
SET senha = '$2b$10$3jWm9tsstbmBUF1bO4P5h.lYdgPolII0bCDjiEURWFZFGss1WNRhe',
    status = 'inativo'
WHERE email IN ('admin@sistema.com', 'operador@sistema.com');
