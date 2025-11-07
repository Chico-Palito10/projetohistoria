const mysql = require("mysql2");
const fs = require("fs");

// MUDANÇA: Buscando credenciais de Variáveis de Ambiente
// Use 'dotenv' se estiver rodando localmente.
const AIVEN_HOST = process.env.DB_HOST;
const AIVEN_PORT = process.env.DB_PORT;
const AIVEN_USER = process.env.DB_USER;
const AIVEN_PASSWORD = process.env.DB_PASSWORD; // A senha será carregada daqui
const AIVEN_DB = process.env.DB_NAME;
// O caminho do certificado CA também deve ser definido via variável de ambiente,
// ou o caminho estático (se preferir manter o arquivo local).
const CA_CERT_PATH = process.env.CA_CERT_PATH || "./ca_aiven.pem";

// Configuração do banco de dados (Pool de Conexões)
const pool = mysql.createPool({
  host: AIVEN_HOST,
  port: AIVEN_PORT,
  user: AIVEN_USER,
  password: AIVEN_PASSWORD,
  database: AIVEN_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // CONFIGURAÇÃO SSL OBRIGATÓRIA PELO AIVEN
  ssl: {
    ca: fs.readFileSync(CA_CERT_PATH), // Usa o arquivo CA
    rejectUnauthorized: true,
  },
});

// Criar banco de dados e tabelas se não existirem
const setupDatabase = async () => {
  const connection = mysql.createConnection({
    host: AIVEN_HOST,
    port: AIVEN_PORT,
    user: AIVEN_USER,
    password: AIVEN_PASSWORD,
    ssl: {
      ca: fs.readFileSync(CA_CERT_PATH),
      rejectUnauthorized: true,
    },
  });

  try {
    // Criar banco de dados
    await connection
      .promise()
      .query("CREATE DATABASE IF NOT EXISTS projetohistoria");
    console.log("✓ Banco de dados criado/verificado");

    await connection.promise().query("USE projetohistoria");

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

module.exports = { pool, setupDatabase };
