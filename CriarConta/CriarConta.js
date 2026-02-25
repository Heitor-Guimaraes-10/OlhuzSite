// =============================
// ELEMENTOS
// =============================
const senhaInput = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");
const erroSenha = document.getElementById("erroSenha");
const forcaSenha = document.getElementById("forcaSenha");
const dicasSenha = document.getElementById("dicasSenha");
const barra = document.getElementById("barraForca");
const btn = document.getElementById("btnCriarConta");
const olhos = document.querySelectorAll(".olho");
const cpfInput = document.getElementById("cpf");
const form = document.querySelector("form");

// =============================
// FORÇA DA SENHA
// =============================
function analisarSenha(valor) {
  let pontos = 0;
  let faltando = [];

  if (valor.length >= 8) pontos++; else faltando.push("8 caracteres");
  if (/[a-z]/.test(valor)) pontos++; else faltando.push("minúscula");
  if (/[A-Z]/.test(valor)) pontos++; else faltando.push("maiúscula");
  if (/\d/.test(valor)) pontos++; else faltando.push("número");
  if (/[^A-Za-z0-9]/.test(valor)) pontos++; else faltando.push("especial");

  atualizarUI(pontos, faltando);
  return pontos;
}

function atualizarUI(pontos, faltando) {
  const porcentagem = (pontos / 5) * 100;
  barra.style.width = porcentagem + "%";

  if (pontos <= 2) {
    barra.style.background = "#ff4d4d";
    forcaSenha.textContent = "Senha fraca";
  } else if (pontos <= 4) {
    barra.style.background = "#f39c12";
    forcaSenha.textContent = "Senha média";
  } else {
    barra.style.background = "#2ecc71";
    forcaSenha.textContent = "Senha forte";
  }

  dicasSenha.textContent =
    faltando.length > 0
      ? "Adicione: " + faltando.join(", ")
      : "Senha muito forte 🔐";
}

// =============================
// VALIDAÇÃO
// =============================
function validar() {
  const pontos = analisarSenha(senhaInput.value);

  if (!confirmarSenha.value) {
    btn.disabled = true;
    erroSenha.textContent = "";
    return;
  }

  if (senhaInput.value !== confirmarSenha.value) {
    erroSenha.textContent = "As senhas não coincidem";
    btn.disabled = true;
  } else if (pontos < 4) {
    erroSenha.textContent = "Senha fraca";
    btn.disabled = true;
  } else {
    erroSenha.textContent = "";
    btn.disabled = false;
  }
}

senhaInput.addEventListener("input", validar);
confirmarSenha.addEventListener("input", validar);

// =============================
// OLHO SENHA
// =============================
olhos.forEach(olho => {
  olho.addEventListener("click", () => {
    const input = document.getElementById(olho.dataset.target);
    const mostrando = input.type === "text";

    input.type = mostrando ? "password" : "text";
    olho.classList.toggle("bi-eye-fill", mostrando);
    olho.classList.toggle("bi-eye-slash-fill", !mostrando);
  });
});

// =============================
// MÁSCARA CPF
// =============================
if (cpfInput) {
  cpfInput.addEventListener("input", () => {
    let valor = cpfInput.value.replace(/\D/g, "").slice(0, 11);
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    cpfInput.value = valor;
  });
}

// =============================
// ENVIO PARA API
// =============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    Nome: document.getElementById("nome").value.trim(),
    Email: document.getElementById("email").value.trim(),
    Senha: senhaInput.value,
    CPF: cpfInput.value.replace(/\D/g, "")
  };

  try {
    const resposta = await fetch("https://localhost:7249/Usuarios/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    if (resposta.ok) {
      alert("Conta criada com sucesso! 🎉");

      // opcional: redireciona pro login
      window.location.href = "../Login/Login.html";

    } else {
      const erro = await resposta.text();
      alert("Erro: " + erro);
    }

  } catch (err) {
    console.error(err);
    alert("Servidor offline 🚨");
  }
});

btn.disabled = true;