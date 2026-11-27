-- Dados de demonstração para o sistema de Controle de Estoque (MySQL).
-- Rode depois do ScriptBancoPweb.sql. Rodar duas vezes duplica os registros.
--
--   docker exec -i estoque-mysql mysql -uroot -proot --default-character-set=utf8mb4 sistema_estoque < DadosDemonstracao.sql

SET NAMES utf8mb4;
USE sistema_estoque;

INSERT INTO mercadoria (nome, preco) VALUES
  ('Arroz Branco 5kg', 27.90),
  ('Feijão Carioca 1kg', 8.49),
  ('Macarrão Espaguete 500g', 4.79),
  ('Óleo de Soja 900ml', 7.99),
  ('Açúcar Refinado 1kg', 4.59),
  ('Café Torrado e Moído 500g', 17.90),
  ('Leite Integral 1L', 5.29),
  ('Farinha de Trigo 1kg', 5.49),
  ('Sal Refinado 1kg', 2.99),
  ('Molho de Tomate 340g', 3.19),
  ('Biscoito Cream Cracker 400g', 6.49),
  ('Achocolatado em Pó 400g', 9.90),
  ('Sabão em Pó 1,6kg', 21.90),
  ('Detergente Líquido 500ml', 2.79),
  ('Papel Higiênico 12 rolos', 19.90),
  ('Creme Dental 90g', 4.99),
  ('Sabonete 85g', 2.49),
  ('Água Mineral 1,5L', 2.89),
  ('Refrigerante Cola 2L', 9.49),
  ('Suco de Laranja 1L', 8.99),
  ('Margarina 500g', 8.29),
  ('Queijo Muçarela 1kg', 44.90),
  ('Presunto Cozido 1kg', 32.90),
  ('Ovos Brancos dúzia', 11.90),
  ('Banana Prata kg', 6.99);

-- Estoques: cada linha liga uma mercadoria (pelo nome) a um local.
-- Comentário no fim da linha = situação que aparece na tela.
INSERT INTO estoque (quantidade, quant_min, quant_max, localizacao, id_merc)
SELECT d.quantidade, d.quant_min, d.quant_max, d.localizacao, m.id_merc
FROM (
            SELECT 'Arroz Branco 5kg' AS nome, 45 AS quantidade, 20 AS quant_min, 120 AS quant_max, 'Prateleira A1' AS localizacao -- faixa
  UNION ALL SELECT 'Arroz Branco 5kg', 8, 10, 40, 'Depósito D1'                    -- abaixo
  UNION ALL SELECT 'Feijão Carioca 1kg', 60, 30, 150, 'Prateleira A2'              -- faixa
  UNION ALL SELECT 'Macarrão Espaguete 500g', 12, 25, 100, 'Prateleira A3'         -- abaixo
  UNION ALL SELECT 'Óleo de Soja 900ml', 140, 20, 100, 'Prateleira B1'             -- acima
  UNION ALL SELECT 'Açúcar Refinado 1kg', 55, 20, 80, 'Prateleira B2'              -- faixa
  UNION ALL SELECT 'Café Torrado e Moído 500g', 4, 15, 60, 'Prateleira B3'         -- abaixo
  UNION ALL SELECT 'Café Torrado e Moído 500g', 30, 10, 50, 'Depósito D1'          -- faixa
  UNION ALL SELECT 'Leite Integral 1L', 96, 48, 240, 'Câmara Fria C1'              -- faixa
  UNION ALL SELECT 'Farinha de Trigo 1kg', 35, 15, 60, 'Prateleira A4'             -- faixa
  UNION ALL SELECT 'Sal Refinado 1kg', 0, 10, 40, 'Prateleira A4'                  -- abaixo (zerado)
  UNION ALL SELECT 'Molho de Tomate 340g', 75, 30, 120, 'Prateleira A5'            -- faixa
  UNION ALL SELECT 'Biscoito Cream Cracker 400g', 40, 20, 80, 'Prateleira C2'      -- faixa
  UNION ALL SELECT 'Achocolatado em Pó 400g', 18, 10, 50, 'Prateleira C2'          -- faixa
  UNION ALL SELECT 'Sabão em Pó 1,6kg', 22, 10, 40, 'Corredor Limpeza L1'          -- faixa
  UNION ALL SELECT 'Detergente Líquido 500ml', 130, 30, 100, 'Corredor Limpeza L1' -- acima
  UNION ALL SELECT 'Papel Higiênico 12 rolos', 9, 15, 60, 'Corredor Limpeza L2'    -- abaixo
  UNION ALL SELECT 'Creme Dental 90g', 50, 20, 100, 'Corredor Higiene H1'          -- faixa
  UNION ALL SELECT 'Sabonete 85g', 120, 40, 200, 'Corredor Higiene H1'             -- faixa
  UNION ALL SELECT 'Água Mineral 1,5L', 200, 60, 300, 'Depósito D2'                -- faixa
  UNION ALL SELECT 'Refrigerante Cola 2L', 70, 24, 96, 'Depósito D2'               -- faixa
  UNION ALL SELECT 'Suco de Laranja 1L', 6, 12, 48, 'Câmara Fria C1'               -- abaixo
  UNION ALL SELECT 'Margarina 500g', 25, 10, 40, 'Câmara Fria C2'                  -- faixa
  UNION ALL SELECT 'Queijo Muçarela 1kg', 15, 5, 12, 'Câmara Fria C2'              -- acima
  UNION ALL SELECT 'Presunto Cozido 1kg', 7, 4, 15, 'Câmara Fria C2'               -- faixa
  UNION ALL SELECT 'Ovos Brancos dúzia', 30, 20, 60, 'Prateleira C1'               -- faixa
  UNION ALL SELECT 'Banana Prata kg', 18, 10, 50, 'Hortifrúti F1'                  -- faixa
) AS d
JOIN mercadoria m ON m.nome = d.nome;
