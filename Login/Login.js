// =============================
// ALERTA CUSTOMIZADO
// =============================
function alerta(msg, tipo = "info") {
  const cores = {
    sucesso: "#2ecc71",
    erro: "#ff4d4d",
    aviso: "#f39c12",
    info: "#00c2ff"
  };

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  const box = document.createElement("div");
  box.style.background = "#1f1f2e";
  box.style.color = "white";
  box.style.padding = "25px 35px";
  box.style.borderRadius = "14px";
  box.style.boxShadow = "0 15px 40px rgba(0,0,0,.5)";
  box.style.textAlign = "center";
  box.style.fontFamily = "Arial";
  box.style.minWidth = "280px";

  box.innerHTML = `
    <p style="margin-bottom:20px; font-size:15px;">${msg}</p>
    <button style="
      background:${cores[tipo]};
      border:none;
      color:white;
      padding:8px 20px;
      border-radius:6px;
      cursor:pointer;
      font-weight:bold;
    ">OK</button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  box.querySelector("button").onclick = () => overlay.remove();
}

// =============================
// LOGIN
// =============================
document.addEventListener("DOMContentLoaded", () => {

  const btnEntrar = document.getElementById("btnEntrar");

  btnEntrar.addEventListener("click", async () => {

    const email = document.getElementById("loginEmail").value.trim();
    const senha = document.getElementById("loginSenha").value;

    // ⚠️ Campos vazios
    if (!email || !senha) {
      alerta("Preencha email e senha", "aviso");
      return;
    }

    try {
      const resposta = await fetch("https://localhost:7249/Usuarios/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Email: email,
          Senha: senha
        })
      });

      // ❌ Login inválido
      if (!resposta.ok) {
        alerta("Email ou senha inválidos ❌", "erro");
        return;
      }

      // ✅ Login sucesso
      const dados = await resposta.json();
      console.log("LOGIN OK:", dados);

      // salva sessão (simples por enquanto)
      localStorage.setItem("usuarioLogado", JSON.stringify(dados));

      alerta("Login realizado com sucesso 🎉", "sucesso");

      setTimeout(() => {
        window.location.href = "../Inicial/Index.html";
      }, 1200);

    } catch (erro) {
      console.error(erro);
      alerta("Servidor offline 🚨", "erro");
    }

  });

});