const mysql = require("mysql2"); // MANTIDO

// VARIÁVEIS DE AMBIENTE NECESSÁRIAS (INCREMENTO 1)
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT;
const CA_CERT_PATH = process.env.CA_CERT_PATH;

// Configuração do banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: DB_USER, // USANDO VAR. AMBIENTE
  password: DB_PASSWORD, // USANDO VAR. AMBIENTE
  database: "projetohistoria",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // INCREMENTO 2: Porta e SSL para Aiven
  port: DB_PORT,
  ssl: {
    ca: process.env.CA_CERT_PATH,
    rejectUnauthorized: true,
  },
});

// Criar banco de dados e tabelas se não existirem
const setupDatabase = async () => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
  });

  try {
    // Criar banco de dados
    await connection
      .promise()
      .query("CREATE DATABASE IF NOT EXISTS sql10805361");
    console.log("✓ Banco de dados criado/verificado");

    await connection.promise().query("USE sql10805361");

    // Criar tabela de alunos
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS alunos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        data_realizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de respostas do quiz
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS respostas_quiz (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aluno_id INT NOT NULL,
        questao_numero INT NOT NULL,
        resposta_escolhida CHAR(1) NOT NULL,
        correta BOOLEAN NOT NULL,
        FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
      )
    `);

    // Criar tabela de feedback
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aluno_id INT NOT NULL,
        pergunta_numero INT NOT NULL,
        resposta INT NOT NULL,
        FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
      )
    `);

    console.log("✓ Tabelas criadas/verificadas");
  } catch (error) {
    console.error("Erro ao configurar banco de dados:", error);
    throw error;
  } finally {
    connection.end();
  }
};

const promisePool = pool.promise();

module.exports = { pool: promisePool, setupDatabase };
