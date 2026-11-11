CREATE DATABASE sistema_estoque;

USE sistema_estoque;

CREATE TABLE mercadoria (
    id_merc INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL
);

CREATE TABLE estoque (
    id_estoque INT AUTO_INCREMENT PRIMARY KEY,
    quantidade INT NOT NULL,
    quant_min INT NOT NULL,
    quant_max INT NOT NULL,
    localizacao VARCHAR(100) NOT NULL,
    id_merc INT NOT NULL,

    FOREIGN KEY (id_merc)
        REFERENCES mercadoria(id_merc),

    CONSTRAINT chk_quantidade
        CHECK (quantidade >= 0),

    CONSTRAINT chk_limites
        CHECK (quant_min >= 0 AND quant_max >= quant_min)
);