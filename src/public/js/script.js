// Estado global
let alunoId = null;
let quizRespondido = false;
let secaoAtual = "intro";
const ordemSecoes = [
  "intro",
  "cadastro",
  "fase-1",
  "fase-2",
  "fase-3",
  "fase-4",
  "fase-5",
  "quiz",
  "resultado",
  "feedback",
  "final",
];

// Carregar imagens automaticamente
async function carregarImagens() {
  try {
    const response = await fetch("/api/images");
    const images = await response.json();

    const historiaImagens = document.querySelectorAll(".historia-imagem");
    let imageIndex = 0;

    historiaImagens.forEach((elemento) => {
      if (images[imageIndex]) {
        elemento.style.backgroundImage = `url('/public/images/${images[imageIndex]}')`;
        elemento.style.backgroundSize = "cover";
        elemento.style.backgroundPosition = "center";
        imageIndex = (imageIndex + 1) % images.length;
      }
    });
  } catch (error) {
    console.error("Erro ao carregar imagens:", error);
  }
}

// Remover overlay inicial
window.addEventListener("load", () => {
  setTimeout(() => {
    const overlay = document.querySelector(".overlay");
    if (overlay) {
      overlay.style.opacity = "0";
      setTimeout(() => overlay.remove(), 2000);
    }
  }, 500);

  // Carregar imagens
  carregarImagens();

  // Mostrar a intro
  mostrarSecao("intro");

  // Adicionar listener de scroll
  adicionarScrollListener();
});

// Adicionar listener de scroll para detectar mudanças de seção
function adicionarScrollListener() {
  const container = document.querySelector(".container");
  const secoes = document.querySelectorAll(".section");

  let observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: [0, 0.25, 0.5, 0.75, 1], // Múltiplos pontos para seções grandes
  };

  let observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const secaoId = entry.target.id;

        // Se for o quiz, feedback ou resultado, usa threshold menor (25%)
        const secoesGrandes = ["quiz", "feedback", "resultado"];
        const thresholdMinimo = secoesGrandes.includes(secaoId) ? 0.25 : 0.5;

        if (
          secaoId &&
          secaoAtual !== secaoId &&
          entry.intersectionRatio >= thresholdMinimo
        ) {
          secaoAtual = secaoId;
          mostrarSecao(secaoId, false); // false = não fazer scroll
        }
      }
    });
  }, observerOptions);

  secoes.forEach((secao) => {
    observer.observe(secao);
  });

  // Adicionar navegação por teclado (setas)
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      proximaSecao();
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      secaoAnterior();
    }
  });
}

// Navegar para próxima seção
function proximaSecao() {
  const indexAtual = ordemSecoes.indexOf(secaoAtual);
  if (indexAtual < ordemSecoes.length - 1) {
    const proximaSecaoId = ordemSecoes[indexAtual + 1];
    scrollParaProximo(proximaSecaoId);
  }
}

// Navegar para seção anterior
function secaoAnterior() {
  const indexAtual = ordemSecoes.indexOf(secaoAtual);
  if (indexAtual > 0) {
    const secaoAnteriorId = ordemSecoes[indexAtual - 1];
    scrollParaProximo(secaoAnteriorId);
  }
}

// Função para scroll suave para próxima seção
function scrollParaProximo(secaoId) {
  mostrarSecao(secaoId, true);
}

// Mostrar seção específica
function mostrarSecao(secaoId, deveScrollar = true) {
  const secoes = document.querySelectorAll(".section");
  secoes.forEach((s) => s.classList.remove("active"));

  const secao = document.getElementById(secaoId);
  if (secao) {
    secao.classList.add("active");

    if (deveScrollar) {
      secao.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    secaoAtual = secaoId;
  }
}

// Handle cadastro
document.addEventListener("DOMContentLoaded", () => {
  const formNome = document.getElementById("form-nome");
  if (formNome) {
    formNome.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nome = document.getElementById("nome-aluno").value.trim();

      if (!nome) {
        alert("Por favor, digite seu nome!");
        return;
      }

      try {
        const response = await fetch("/api/aluno", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome }),
        });

        const data = await response.json();

        if (data.success) {
          alunoId = data.alunoId;
          console.log("Aluno cadastrado com ID:", alunoId);
          scrollParaProximo("fase-1");
        } else {
          alert("Erro ao cadastrar. Tente novamente.");
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar com o servidor.");
      }
    });
  }

  // Form do quiz
  const formQuiz = document.getElementById("form-quiz");
  if (formQuiz) {
    formQuiz.addEventListener("submit", handleQuiz);
  }

  // Form de feedback
  const formFeedback = document.getElementById("form-feedback");
  if (formFeedback) {
    formFeedback.addEventListener("submit", handleFeedback);
  }
});

// Função para virar a chave
function virarChave(botao) {
  const faseContent = botao.closest(".fase-content");
  const historiaWrapper = faseContent.querySelector(".historia-wrapper");
  const versaoAtiva = historiaWrapper.querySelector(".versao-ativa");
  const versaoOculta = historiaWrapper.querySelector(".versao-oculta");

  // Toggle classes
  versaoAtiva.classList.remove("versao-ativa");
  versaoAtiva.classList.add("versao-oculta");

  versaoOculta.classList.remove("versao-oculta");
  versaoOculta.classList.add("versao-ativa");

  // Mudar texto do botão
  if (botao.textContent.includes("Virar a Chave")) {
    botao.textContent = "🔄 Ver Versão Original";
  } else {
    botao.textContent = "🔄 Virar a Chave";
  }
}

// Handle quiz
async function handleQuiz(e) {
  e.preventDefault();

  if (!alunoId) {
    alert(
      "Erro: Por favor, verifique se você registrou o seu nome, caso contrário recarregue a página."
    );
    return;
  }

  const formData = new FormData(e.target);
  const respostas = [];

  for (let i = 1; i <= 5; i++) {
    const resposta = formData.get(`q${i}`);
    if (resposta) {
      respostas.push({
        questao: i,
        resposta: resposta,
      });
    }
  }

  if (respostas.length !== 5) {
    alert("Por favor, responda todas as questões!");
    return;
  }

  try {
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alunoId, respostas }),
    });

    const data = await response.json();

    if (data.success) {
      quizRespondido = true;
      mostrarResultado(data);
      scrollParaProximo("resultado");
    } else {
      alert("Erro ao salvar respostas. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao conectar com o servidor.");
  }
}

// Mostrar resultado do quiz
function mostrarResultado(data) {
  const container = document.getElementById("resultado-conteudo");

  let mensagem = "";
  if (data.porcentagem >= 80) {
    mensagem = "Excelente! Você demonstrou grande compreensão!";
  } else if (data.porcentagem >= 60) {
    mensagem = "Muito bom! Você está no caminho certo!";
  } else if (data.porcentagem >= 40) {
    mensagem = "Bom trabalho! Continue estudando!";
  } else {
    mensagem = "Não desanime! A história tem muitas facetas para explorar!";
  }

  let html = `
    <div class="resultado-stats">
      ${data.acertos} / ${data.total}
    </div>
    <p style="font-size: 1.5rem; color: var(--secondary-color); margin-bottom: 1rem;">
      Você acertou ${data.porcentagem}% das questões!
    </p>
    <p style="font-size: 1.2rem; color: var(--accent-color); margin-bottom: 2rem;">
      ${mensagem}
    </p>
    <div class="resultado-detalhes">
      <h3 style="color: var(--accent-color); margin-bottom: 1rem;">Detalhes das Respostas:</h3>
  `;

  data.resultados.forEach((r) => {
    const classe = r.correta ? "correto" : "incorreto";
    const icone = r.correta ? "✅" : "❌";
    html += `
      <div class="resultado-item ${classe}">
        ${icone} <strong>Questão ${r.questao}:</strong> 
        Você respondeu <strong>${r.resposta.toUpperCase()}</strong>
        ${
          !r.correta
            ? ` (Resposta correta: <strong>${r.gabarito.toUpperCase()}</strong>)`
            : ""
        }
      </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;
}

// Handle feedback
async function handleFeedback(e) {
  e.preventDefault();

  if (!alunoId) {
    alert(
      "Erro: ID do aluno não encontrado. Verifique se você registrou seu nome, caso contrário recarregue a página!"
    );
    return;
  }

  if (!quizRespondido) {
    alert(
      "Atenção: Você precisa responder ao questionário (quiz) antes de enviar o feedback! Por favor, volte à seção do quiz e responda todas as questões."
    );
    return;
  }

  const formData = new FormData(e.target);
  const respostas = [];

  for (let i = 1; i <= 5; i++) {
    const resposta = formData.get(`f${i}`);
    if (resposta) {
      respostas.push({
        pergunta: i,
        resposta: parseInt(resposta),
      });
    }
  }

  if (respostas.length !== 5) {
    alert("Por favor, responda todas as perguntas do feedback!");
    return;
  }

  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alunoId, respostas }),
    });

    const data = await response.json();

    if (data.success) {
      scrollParaProximo("final");
    } else {
      alert("Erro ao salvar feedback. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao conectar com o servidor.");
  }
}
