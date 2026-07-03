-- ========================================================
-- ARQUIVO: gestordeinventario.sql
-- DESCRIÇÃO: Script SQL para criação e reset do banco de dados do AssetPulse.
-- Este script define a estrutura das tabelas (users, computers, softwares, licenses)
-- e seus relacionamentos, garantindo um ambiente de banco de dados limpo e funcional.
-- ========================================================
-- ========================================================
-- SCRIPT MASTER (RESET TOTAL) - ASSETPULSE
-- ========================================================

-- 1. A BORRACHA MÁGICA: Apaga o banco velho (com os dados de teste) se ele existir
DROP DATABASE IF EXISTS gestordeinventario;

-- 2. Cria o banco de dados principal novinho em folha
CREATE DATABASE gestordeinventario;
USE gestordeinventario;

-- ========================================================
-- TABELA DE USUÁRIOS (LOGIN E CADASTRO)
-- ========================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,           
    nome VARCHAR(100) NOT NULL,                  
    email VARCHAR(100) UNIQUE NOT NULL,          
    senha VARCHAR(255) NOT NULL,                 
    tipo_conta ENUM('pessoal', 'empresarial') DEFAULT 'pessoal', 
    documento VARCHAR(20),                       
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

-- ========================================================
-- TABELA DE COMPUTADORES (ATIVOS FÍSICOS)
-- ========================================================
CREATE TABLE computers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,                  
    codigo_ativo VARCHAR(50) UNIQUE,             
    usuario_responsavel VARCHAR(100),            
    departamento VARCHAR(100),                   
    status ENUM('ativo', 'manutencao', 'descartado') DEFAULT 'ativo', 
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================================
-- TABELA DE SOFTWARES (CATÁLOGO)
-- ========================================================
CREATE TABLE softwares (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,                  
    fornecedor VARCHAR(100),                     
    versao VARCHAR(50),                          
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- TABELA DE LICENÇAS (CHAVES DE ATIVAÇÃO)
-- ========================================================
CREATE TABLE licenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    software_id INT NOT NULL,                    
    chave_licenca VARCHAR(255),                  
    data_compra DATE,                            
    data_expiracao DATE NOT NULL,                
    quantidade INT DEFAULT 1,                    
    status ENUM('ativa', 'expirada', 'cancelada') DEFAULT 'ativa', 
    data_cancelamento DATE,                      
    usuario_id INT,
    
    FOREIGN KEY (software_id) REFERENCES softwares(id),
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);