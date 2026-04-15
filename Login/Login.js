document.addEventListener("DOMContentLoaded", () => {

  const btnEntrar = document.getElementById("btnEntrar");
  const olhos = document.querySelectorAll(".olho");

  // 👁️ OLHO FUNCIONANDO
  olhos.forEach(olho => {
    olho.addEventListener("click", () => {
      const input = document.getElementById(olho.dataset.target);
      const mostrando = input.type === "text";

      input.type = mostrando ? "password" : "text";
      olho.classList.toggle("bi-eye-fill", mostrando);
      olho.classList.toggle("bi-eye-slash-fill", !mostrando);
    });
  });

  // 🔐 LOGIN
  btnEntrar.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const senha = document.getElementById("loginSenha").value;

    if (!email || !senha) {
      alerta("Preencha email e senha", "aviso");
      return;
    }

    try {
      const resposta = await fetch("https://localhost:7006/api/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Email: email,
          Senha: senha
        })
      });

      if (!resposta.ok) {
        alerta("Email ou senha inválidos ❌", "erro");
        return;
      }

      const dados = await resposta.json();
      localStorage.setItem("usuarioLogado", JSON.stringify(dados));

      alerta("Login realizado com sucesso 🎉", "sucesso");

      setTimeout(() => {
        window.location.href = "../PaginaInicial/PaginaInicial.html";
      }, 1200);

    } catch (erro) {
      console.error(erro);
      alerta("Servidor offline 🚨", "erro");
    }
  });

});