-- Script SQL inicial do sistema de controle de estoque e vendas
-- Banco: MySQL 8+
-- Objetivo: criar tabelas principais, relacionamentos, índices básicos e dados iniciais.

CREATE DATABASE IF NOT EXISTS estoque_vendas_saas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE estoque_vendas_saas;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  perfil ENUM('admin', 'operador') NOT NULL DEFAULT 'operador',
  status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_users_email (email),
  INDEX idx_users_status (status),
  INDEX idx_users_perfil (perfil)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NULL,
  status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_categories_nome (nome),
  INDEX idx_categories_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  cnpj_cpf VARCHAR(20) NULL,
  email VARCHAR(150) NULL,
  telefone VARCHAR(30) NULL,
  endereco VARCHAR(255) NULL,
  status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_suppliers_cnpj_cpf (cnpj_cpf),
  INDEX idx_suppliers_nome (nome),
  INDEX idx_suppliers_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(50) NOT NULL,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT NULL,
  category_id INT NULL,
  supplier_id INT NULL,
  preco_custo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estoque_atual INT NOT NULL DEFAULT 0,
  estoque_minimo INT NOT NULL DEFAULT 0,
  data_validade DATE NULL,
  status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_products_sku (sku),
  INDEX idx_products_nome (nome),
  INDEX idx_products_status (status),
  INDEX idx_products_category_id (category_id),
  INDEX idx_products_supplier_id (supplier_id),
  INDEX idx_products_data_validade (data_validade),
  INDEX idx_products_estoque_minimo (estoque_minimo),

  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_products_supplier
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT ck_products_preco_custo_nao_negativo
    CHECK (preco_custo >= 0),
  CONSTRAINT ck_products_preco_venda_nao_negativo
    CHECK (preco_venda >= 0),
  CONSTRAINT ck_products_preco_venda_maior_ou_igual_custo
    CHECK (preco_venda >= preco_custo),
  CONSTRAINT ck_products_estoque_atual_nao_negativo
    CHECK (estoque_atual >= 0),
  CONSTRAINT ck_products_estoque_minimo_nao_negativo
    CHECK (estoque_minimo >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  tipo ENUM('compra', 'devolucao', 'ajuste_positivo', 'venda', 'perda', 'ajuste_negativo') NOT NULL,
  quantidade INT NOT NULL,
  estoque_anterior INT NOT NULL,
  estoque_posterior INT NOT NULL,
  observacao VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_stock_movements_product_id (product_id),
  INDEX idx_stock_movements_user_id (user_id),
  INDEX idx_stock_movements_tipo (tipo),
  INDEX idx_stock_movements_created_at (created_at),

  CONSTRAINT fk_stock_movements_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_stock_movements_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_stock_movements_quantidade_positiva
    CHECK (quantidade > 0),
  CONSTRAINT ck_stock_movements_estoque_anterior_nao_negativo
    CHECK (estoque_anterior >= 0),
  CONSTRAINT ck_stock_movements_estoque_posterior_nao_negativo
    CHECK (estoque_posterior >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_venda VARCHAR(30) NOT NULL,
  user_id INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  desconto DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  forma_pagamento ENUM('dinheiro', 'pix', 'cartao_debito', 'cartao_credito') NOT NULL,
  status ENUM('finalizada', 'cancelada') NOT NULL DEFAULT 'finalizada',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_sales_numero_venda (numero_venda),
  INDEX idx_sales_user_id (user_id),
  INDEX idx_sales_status (status),
  INDEX idx_sales_forma_pagamento (forma_pagamento),
  INDEX idx_sales_created_at (created_at),

  CONSTRAINT fk_sales_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_sales_subtotal_nao_negativo
    CHECK (subtotal >= 0),
  CONSTRAINT ck_sales_desconto_nao_negativo
    CHECK (desconto >= 0),
  CONSTRAINT ck_sales_desconto_menor_ou_igual_subtotal
    CHECK (desconto <= subtotal),
  CONSTRAINT ck_sales_total_nao_negativo
    CHECK (total >= 0),
  CONSTRAINT ck_sales_total_calculado
    CHECK (total = subtotal - desconto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantidade INT NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  total_item DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_sale_items_sale_id (sale_id),
  INDEX idx_sale_items_product_id (product_id),

  CONSTRAINT fk_sale_items_sale
    FOREIGN KEY (sale_id) REFERENCES sales(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_sale_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT ck_sale_items_quantidade_positiva
    CHECK (quantidade > 0),
  CONSTRAINT ck_sale_items_preco_unitario_nao_negativo
    CHECK (preco_unitario >= 0),
  CONSTRAINT ck_sale_items_total_item_nao_negativo
    CHECK (total_item >= 0),
  CONSTRAINT ck_sale_items_total_calculado
    CHECK (total_item = quantidade * preco_unitario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dados iniciais
-- Login inicial sugerido para testes:
-- E-mail: admin@sistema.com
-- Senha: admin123
-- Observação: a senha abaixo está criptografada com bcrypt e deve ser trocada em ambiente real.

INSERT INTO users (id, nome, email, senha, perfil, status) VALUES
  (1, 'Administrador', 'admin@sistema.com', '$2a$10$V5u9v4NQrJyfZtDkRqK3HO73zgSwG98PfL3kqS76sOwJY90D3Hx9C.', 'admin', 'ativo'),
  (2, 'Operador de Caixa', 'operador@sistema.com', '$2a$10$V5u9v4NQrJyfZtDkRqK3HO73zgSwG98PfL3kqS76sOwJY90D3Hx9C.', 'operador', 'ativo');

INSERT INTO categories (id, nome, descricao, status) VALUES
  (1, 'Alimentos', 'Produtos alimentícios em geral.', 'ativo'),
  (2, 'Bebidas', 'Bebidas frias, quentes e produtos relacionados.', 'ativo'),
  (3, 'Higiene', 'Produtos de higiene pessoal.', 'ativo'),
  (4, 'Limpeza', 'Produtos de limpeza doméstica e comercial.', 'ativo'),
  (5, 'Eletrônicos', 'Produtos eletrônicos simples e acessórios.', 'ativo'),
  (6, 'Outros', 'Produtos que não se encaixam nas demais categorias.', 'ativo');

INSERT INTO suppliers (id, nome, cnpj_cpf, email, telefone, endereco, status) VALUES
  (1, 'Distribuidora Alfa Ltda', '12.345.678/0001-90', 'contato@alfa.com.br', '(11) 3000-1000', 'Rua das Flores, 100 - São Paulo/SP', 'ativo'),
  (2, 'Comercial Beta ME', '98.765.432/0001-10', 'vendas@beta.com.br', '(21) 3000-2000', 'Av. Brasil, 250 - Rio de Janeiro/RJ', 'ativo'),
  (3, 'Fornecedor Gama', '123.456.789-00', 'atendimento@gama.com.br', '(31) 3000-3000', 'Rua Central, 55 - Belo Horizonte/MG', 'ativo');

INSERT INTO products (
  id,
  sku,
  nome,
  descricao,
  category_id,
  supplier_id,
  preco_custo,
  preco_venda,
  estoque_atual,
  estoque_minimo,
  data_validade,
  status
) VALUES
  (1, 'ALM-001', 'Arroz Tipo 1 5kg', 'Pacote de arroz tipo 1 com 5kg.', 1, 1, 18.50, 24.90, 23, 5, '2026-12-31', 'ativo'),
  (2, 'ALM-002', 'Feijão Carioca 1kg', 'Pacote de feijão carioca com 1kg.', 1, 1, 6.80, 9.90, 8, 10, '2026-09-30', 'ativo'),
  (3, 'BEB-001', 'Água Mineral 500ml', 'Garrafa de água mineral sem gás.', 2, 2, 1.20, 2.50, 48, 20, '2026-10-15', 'ativo'),
  (4, 'HIG-001', 'Sabonete Neutro 90g', 'Sabonete neutro para uso diário.', 3, 3, 2.10, 4.50, 15, 8, NULL, 'ativo'),
  (5, 'LIM-001', 'Detergente 500ml', 'Detergente líquido neutro.', 4, 2, 1.70, 3.50, 5, 10, NULL, 'ativo'),
  (6, 'ELE-001', 'Cabo USB-C 1m', 'Cabo USB-C de 1 metro para carregamento.', 5, 3, 9.00, 19.90, 12, 5, NULL, 'ativo'),
  (7, 'OUT-001', 'Produto Inativo Exemplo', 'Produto usado para testar filtro de status.', 6, NULL, 5.00, 8.00, 0, 2, NULL, 'inativo');

INSERT INTO sales (id, numero_venda, user_id, subtotal, desconto, total, forma_pagamento, status, created_at) VALUES
  (1, 'V202606020001', 2, 52.30, 2.30, 50.00, 'pix', 'finalizada', '2026-06-02 09:30:00');

INSERT INTO sale_items (id, sale_id, product_id, quantidade, preco_unitario, total_item) VALUES
  (1, 1, 1, 2, 24.90, 49.80),
  (2, 1, 3, 1, 2.50, 2.50);

INSERT INTO stock_movements (
  product_id,
  user_id,
  tipo,
  quantidade,
  estoque_anterior,
  estoque_posterior,
  observacao,
  created_at
) VALUES
  (1, 1, 'compra', 25, 0, 25, 'Carga inicial de estoque.', '2026-06-01 08:00:00'),
  (2, 1, 'compra', 8, 0, 8, 'Carga inicial de estoque.', '2026-06-01 08:05:00'),
  (3, 1, 'compra', 49, 0, 49, 'Carga inicial de estoque.', '2026-06-01 08:10:00'),
  (4, 1, 'compra', 15, 0, 15, 'Carga inicial de estoque.', '2026-06-01 08:15:00'),
  (5, 1, 'compra', 5, 0, 5, 'Carga inicial de estoque.', '2026-06-01 08:20:00'),
  (6, 1, 'compra', 12, 0, 12, 'Carga inicial de estoque.', '2026-06-01 08:25:00'),
  (1, 2, 'venda', 2, 25, 23, 'Saída automática referente à venda V202606020001.', '2026-06-02 09:30:00'),
  (3, 2, 'venda', 1, 49, 48, 'Saída automática referente à venda V202606020001.', '2026-06-02 09:30:00');
