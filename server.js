const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { setupDatabase } = require("./src/config/database");
const quizRoutes = require("./src/routes/quiz");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "src/public")));
app.use("/public", express.static(path.join(__dirname, "public")));

// Rota para listar imagens
app.get("/api/images", (req, res) => {
  const imagesDir = path.join(__dirname, "public", "images");

  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error("Erro ao ler diretório de imagens:", err);
      return res.status(500).json({ error: "Erro ao ler diretório" });
    }

    // Filtrar apenas arquivos de imagem
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file)
    );

    res.json(imageFiles);
  });
});

// Rotas da API
app.use("/api", quizRoutes);

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src/public/index.html"));
});

// Inicializar servidor
const startServer = async () => {
  try {
    await setupDatabase();
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   🎓 DESVENDANDO O PASSADO                 ║
║   Servidor rodando em:                     ║
║   http://localhost:${PORT}                    ║
╚════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  }
};

startServer();
