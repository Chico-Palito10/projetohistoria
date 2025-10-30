const express = require("express");
const { pool } = require("../config/database");
const router = express.Router();

// Gabarito do quiz
const GABARITO = {
  1: "b",
  2: "b",
  3: "c",
  4: "c",
  5: "b",
};

// Criar novo aluno
router.post("/aluno", async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const [result] = await pool.query("INSERT INTO alunos (nome) VALUES (?)", [
      nome.trim(),
    ]);

    res.json({
      success: true,
      alunoId: result.insertId,
      message: "Aluno cadastrado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao criar aluno:", error);
    res.status(500).json({ error: "Erro ao cadastrar aluno" });
  }
});

// Salvar respostas do quiz
router.post("/quiz", async (req, res) => {
  try {
    const { alunoId, respostas } = req.body;

    if (!alunoId || !respostas || !Array.isArray(respostas)) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    let acertos = 0;
    const resultados = [];

    for (const resposta of respostas) {
      const correta = GABARITO[resposta.questao] === resposta.resposta;
      if (correta) acertos++;

      await pool.query(
        "INSERT INTO respostas_quiz (aluno_id, questao_numero, resposta_escolhida, correta) VALUES (?, ?, ?, ?)",
        [alunoId, resposta.questao, resposta.resposta, correta]
      );

      resultados.push({
        questao: resposta.questao,
        resposta: resposta.resposta,
        correta: correta,
        gabarito: GABARITO[resposta.questao],
      });
    }

    const porcentagem = Math.round(
      (acertos / Object.keys(GABARITO).length) * 100
    );

    res.json({
      success: true,
      acertos,
      total: Object.keys(GABARITO).length,
      porcentagem,
      resultados,
    });
  } catch (error) {
    console.error("Erro ao salvar quiz:", error);
    res.status(500).json({ error: "Erro ao salvar respostas do quiz" });
  }
});

// Salvar feedback
router.post("/feedback", async (req, res) => {
  try {
    const { alunoId, respostas } = req.body;

    if (!alunoId || !respostas || !Array.isArray(respostas)) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    for (const resposta of respostas) {
      await pool.query(
        "INSERT INTO feedback (aluno_id, pergunta_numero, resposta) VALUES (?, ?, ?)",
        [alunoId, resposta.pergunta, resposta.resposta]
      );
    }

    res.json({
      success: true,
      message: "Feedback salvo com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao salvar feedback:", error);
    res.status(500).json({ error: "Erro ao salvar feedback" });
  }
});

// Obter dados do relatório
router.get("/relatorio", async (req, res) => {
  try {
    // Total de participantes
    const [totalParticipantes] = await pool.query(
      "SELECT COUNT(*) as total FROM alunos"
    );

    // Desempenho geral
    const [desempenho] = await pool.query(`
      SELECT 
        a.nome,
        a.data_realizacao,
        COUNT(CASE WHEN r.correta = 1 THEN 1 END) as acertos,
        COUNT(*) as total_questoes,
        ROUND((COUNT(CASE WHEN r.correta = 1 THEN 1 END) / COUNT(*)) * 100, 2) as porcentagem
      FROM alunos a
      LEFT JOIN respostas_quiz r ON a.id = r.aluno_id
      GROUP BY a.id
      ORDER BY a.data_realizacao DESC
    `);

    // Análise por questão
    const [analiseQuestoes] = await pool.query(`
      SELECT 
        questao_numero,
        COUNT(*) as total_respostas,
        COUNT(CASE WHEN correta = 1 THEN 1 END) as acertos,
        ROUND((COUNT(CASE WHEN correta = 1 THEN 1 END) / COUNT(*)) * 100, 2) as taxa_acerto
      FROM respostas_quiz
      GROUP BY questao_numero
      ORDER BY questao_numero
    `);

    // Feedback consolidado
    const [feedbackData] = await pool.query(`
      SELECT 
        pergunta_numero,
        resposta,
        COUNT(*) as quantidade
      FROM feedback
      GROUP BY pergunta_numero, resposta
      ORDER BY pergunta_numero, resposta
    `);

    res.json({
      success: true,
      totalParticipantes: totalParticipantes[0].total,
      desempenho,
      analiseQuestoes,
      feedback: feedbackData,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    res.status(500).json({ error: "Erro ao gerar relatório" });
  }
});

module.exports = router;
