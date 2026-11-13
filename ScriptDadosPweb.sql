-- Carga de dados (seed) do banco sistema_estoque
-- Execute DEPOIS do ScriptBancoPweb.sql (que cria o banco e as tabelas).
--
--   mysql -u root -p < ScriptDadosPweb.sql
--
-- Os ids são gerados pelo AUTO_INCREMENT. Os estoques encontram a mercadoria
-- pelo nome, então o script não depende de ids fixos.
-- Rode apenas UMA vez: executar de novo duplica os registros.

USE sistema_estoque;

-- ---------------------------------------------------------------
-- Mercadorias
-- ---------------------------------------------------------------
INSERT INTO mercadoria (nome, preco) VALUES
    ('Arroz 5kg',                    25.90),
    ('Feijão Carioca 1kg',            8.49),
    ('Açúcar Refinado 1kg',           4.99),
    ('Óleo de Soja 900ml',            7.29),
    ('Café Torrado e Moído 500g',    18.90),
    ('Leite Integral 1L',             5.39),
    ('Macarrão Espaguete 500g',       4.59),
    ('Farinha de Trigo 1kg',          5.79),
    ('Sal Refinado 1kg',              2.99),
    ('Detergente Líquido 500ml',      2.79),
    ('Sabão em Pó 1kg',              12.90),
    ('Papel Higiênico 12 rolos',     19.90),
    ('Água Sanitária 2L',             6.49),
    ('Biscoito Recheado 140g',        3.49),
    ('Refrigerante Cola 2L',          9.99);

-- ---------------------------------------------------------------
-- Estoques (quantidade, quant_min, quant_max, localizacao, mercadoria)
-- Regras do banco: quantidade >= 0 e quant_max >= quant_min.
-- Há itens abaixo do mínimo, e mercadorias em mais de um local.
-- "Refrigerante Cola 2L" fica sem estoque de propósito: é possível
-- excluí-la pela API (DELETE /mercadorias/{id} retorna 204).
-- ---------------------------------------------------------------
INSERT INTO estoque (quantidade, quant_min, quant_max, localizacao, id_merc) VALUES
    ( 40, 10, 100, 'Prateleira A1',  (SELECT id_merc FROM mercadoria WHERE nome = 'Arroz 5kg' LIMIT 1)),
    ( 25, 10,  60, 'Depósito 1',     (SELECT id_merc FROM mercadoria WHERE nome = 'Arroz 5kg' LIMIT 1)),
    ( 80, 20, 150, 'Prateleira A2',  (SELECT id_merc FROM mercadoria WHERE nome = 'Feijão Carioca 1kg' LIMIT 1)),
    ( 12, 15,  90, 'Prateleira A3',  (SELECT id_merc FROM mercadoria WHERE nome = 'Açúcar Refinado 1kg' LIMIT 1)),
    ( 55, 20, 120, 'Prateleira B1',  (SELECT id_merc FROM mercadoria WHERE nome = 'Óleo de Soja 900ml' LIMIT 1)),
    ( 18, 10,  50, 'Prateleira B2',  (SELECT id_merc FROM mercadoria WHERE nome = 'Café Torrado e Moído 500g' LIMIT 1)),
    ( 30,  5,  40, 'Depósito 2',     (SELECT id_merc FROM mercadoria WHERE nome = 'Café Torrado e Moído 500g' LIMIT 1)),
    (120, 40, 240, 'Câmara Fria 1',  (SELECT id_merc FROM mercadoria WHERE nome = 'Leite Integral 1L' LIMIT 1)),
    ( 64, 20, 100, 'Prateleira C1',  (SELECT id_merc FROM mercadoria WHERE nome = 'Macarrão Espaguete 500g' LIMIT 1)),
    (  0, 10,  80, 'Prateleira C2',  (SELECT id_merc FROM mercadoria WHERE nome = 'Farinha de Trigo 1kg' LIMIT 1)),
    ( 90, 25, 150, 'Prateleira C3',  (SELECT id_merc FROM mercadoria WHERE nome = 'Sal Refinado 1kg' LIMIT 1)),
    ( 70, 20, 140, 'Prateleira D1',  (SELECT id_merc FROM mercadoria WHERE nome = 'Detergente Líquido 500ml' LIMIT 1)),
    ( 35, 10,  70, 'Prateleira D2',  (SELECT id_merc FROM mercadoria WHERE nome = 'Sabão em Pó 1kg' LIMIT 1)),
    (  8, 12,  60, 'Depósito 1',     (SELECT id_merc FROM mercadoria WHERE nome = 'Papel Higiênico 12 rolos' LIMIT 1)),
    ( 22,  8,  48, 'Prateleira D3',  (SELECT id_merc FROM mercadoria WHERE nome = 'Água Sanitária 2L' LIMIT 1)),
    (150, 50, 300, 'Prateleira E1',  (SELECT id_merc FROM mercadoria WHERE nome = 'Biscoito Recheado 140g' LIMIT 1));
