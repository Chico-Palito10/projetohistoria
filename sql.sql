-- Script SQL para configuração manual do banco de dados
-- (OPCIONAL - O sistema cria automaticamente, mas pode ser útil para troubleshooting)

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS historia_interativa
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar o banco
USE historia_interativa;

-- Criar tabela de alunos
CREATE TABLE IF NOT EXISTS alunos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  data_realizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_data (data_realizacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de respostas do quiz
CREATE TABLE IF NOT EXISTS respostas_quiz (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id INT NOT NULL,
  questao_numero INT NOT NULL,
  resposta_escolhida CHAR(1) NOT NULL,
  correta BOOLEAN NOT NULL,
  FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
  INDEX idx_aluno (aluno_id),
  INDEX idx_questao (questao_numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de feedback
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id INT NOT NULL,
  pergunta_numero INT NOT NULL,
  resposta INT NOT NULL,
  FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
  INDEX idx_aluno_feedback (aluno_id),
  INDEX idx_pergunta (pergunta_numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir dados de teste (opcional)
-- Descomente as linhas abaixo para adicionar dados de exemplo

/*
INSERT INTO alunos (nome) VALUES 
('João Silva'),
('Maria Santos'),
('Pedro Oliveira');

INSERT INTO respostas_quiz (aluno_id, questao_numero, resposta_escolhida, correta) VALUES
(1, 1, 'b', 1),
(1, 2, 'b', 1),
(1, 3, 'c', 1),
(1, 4, 'c', 1),
(1, 5, 'b', 1),
(2, 1, 'b', 1),
(2, 2, 'a', 0),
(2, 3, 'c', 1),
(2, 4, 'b', 0),
(2, 5, 'b', 1);

INSERT INTO feedback (aluno_id, pergunta_numero, resposta) VALUES
(1, 1, 1),
(1, 2, 1),
(1, 3, 1),
(1, 4, 1),
(1, 5, 1),
(2, 1, 2),
(2, 2, 1),
(2, 3, 1),
(2, 4, 1),
(2, 5, 2);
*/

-- Verificar criação das tabelas
SHOW TABLES;

-- Verificar estrutura das tabelas
DESCRIBE alunos;
DESCRIBE respostas_quiz;
DESCRIBE feedback;

-- Comandos úteis para gerenciamento

-- Ver todos os alunos
-- SELECT * FROM alunos;

-- Ver todas as respostas
-- SELECT a.nome, r.questao_numero, r.resposta_escolhida, r.correta
-- FROM alunos a
-- JOIN respostas_quiz r ON a.id = r.aluno_id;

-- Ver estatísticas gerais
-- SELECT 
--   COUNT(DISTINCT a.id) as total_alunos,
--   AVG(CASE WHEN r.correta = 1 THEN 100.0 ELSE 0 END) as media_acertos
-- FROM alunos a
-- JOIN respostas_quiz r ON a.id = r.aluno_id;

-- Limpar todas as tabelas (CUIDADO!)
-- TRUNCATE TABLE feedback;
-- TRUNCATE TABLE respostas_quiz;
-- TRUNCATE TABLE alunos;

-- Deletar o banco de dados (CUIDADO!)
-- DROP DATABASE historia_interativa;