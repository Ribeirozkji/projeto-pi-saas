USE estoque_vendas_saas;

UPDATE users
SET senha = '$2b$10$3jWm9tsstbmBUF1bO4P5h.lYdgPolII0bCDjiEURWFZFGss1WNRhe',
    status = 'ativo'
WHERE email IN ('admin@sistema.com', 'operador@sistema.com');
