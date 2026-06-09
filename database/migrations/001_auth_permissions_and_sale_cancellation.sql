USE estoque_vendas_saas;

ALTER TABLE users
  MODIFY perfil ENUM('admin', 'gerente', 'estoquista', 'operador') NOT NULL DEFAULT 'operador';

ALTER TABLE sales
  ADD COLUMN cancel_reason VARCHAR(255) NULL AFTER status,
  ADD COLUMN canceled_by INT NULL AFTER cancel_reason,
  ADD COLUMN canceled_at TIMESTAMP NULL AFTER canceled_by;

ALTER TABLE sales
  ADD INDEX idx_sales_canceled_by (canceled_by);

ALTER TABLE sales
  ADD CONSTRAINT fk_sales_canceled_by
    FOREIGN KEY (canceled_by) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
