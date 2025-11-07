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

const promisePool = pool.promise();
