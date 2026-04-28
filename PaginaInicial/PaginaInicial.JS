// 1. GARANTIR QUE O SCRIPT SÓ RODA QUANDO A PÁGINA CARREGAR
window.onload = function() {
    console.log("Sistema Olhuz carregado e pronto!");

    // Seleciona o card principal (área onde o usuário arrasta a imagem)
    const cardPrincipal = document.querySelector('.card-principal');

    // Seleciona o input de upload tradicional (botão de escolher arquivo)
    const inputArquivo = document.getElementById('fotoInput');

    // Se não encontrar o card, para tudo (evita erro quebrando o resto)
    if (!cardPrincipal) {
        console.error("ERRO: O elemento .card-principal não foi encontrado!");
        return;
    }

    // 2. FUNÇÃO QUE ENVIA A IMAGEM PRO BACKEND
    async function enviarParaBackend(arquivo) {

        // Validação: só aceita imagem
        if (!arquivo || !arquivo.type.startsWith('image/')) {
            const msgAviso = "Por favor, envie apenas imagens!";
            alert(msgAviso);
            lerDescricao(msgAviso); // Também fala em voz alta
            return;
        }

        // Feedback imediato pro usuário (voz)
        lerDescricao("Imagem recebida. Aguarde a descrição.");

        // Cria um "pacote" pra enviar o arquivo
        const formData = new FormData();
        formData.append('arquivo', arquivo); // Nome precisa bater com o backend

        try {
            // Faz a requisição pro backend (teu controller)
            const response = await fetch('https://localhost:7006/api/IA/descrever', {
                method: 'POST',
                body: formData
            });

            // Converte resposta pra JSON
            const dados = await response.json();

            // Se deu certo (status 200)
            if (response.ok) {
                // Pega a descrição que veio do backend
                const textoFinal = dados.descricao || "Imagem processada, mas sem descrição disponível.";
                
                // Faz o sistema falar
                lerDescricao(textoFinal);
                
                // Log pra debug
                console.log("Descrição Gemini:", textoFinal);
            } else {
                // Se o backend respondeu erro (500, 404, etc)
                const msgErro = "O serviço está indisponível no momento. Tente novamente em instantes.";
                lerDescricao(msgErro);
                console.error("Erro Servidor:", dados);
            }

        } catch (erro) {
            // Erro de conexão (backend caiu, sem internet, etc)
            console.error(erro);
            const msgConexao = "Erro de conexão com o servidor.";
            lerDescricao(msgConexao);
        }
    }

    // 3. FUNÇÃO QUE BLOQUEIA O COMPORTAMENTO PADRÃO DO DRAG
    const travarEventos = (e) => {
        e.preventDefault(); // Impede o navegador de abrir o arquivo
        e.stopPropagation(); // Impede conflitos com outros elementos

        // Ajusta o cursor (mostra que pode soltar)
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
    };

    // Aplica a trava em todos eventos de drag
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        cardPrincipal.addEventListener(eventName, travarEventos, false);
        document.body.addEventListener(eventName, travarEventos, false);
    });

    // 4. FEEDBACK VISUAL (quando arrasta por cima)
    cardPrincipal.addEventListener('dragover', () => {
        cardPrincipal.classList.add('drag-over'); // ativa estilo visual
    });

    // Remove o efeito quando sai da área
    cardPrincipal.addEventListener('dragleave', () => {
        cardPrincipal.classList.remove('drag-over');
    });

    // 5. QUANDO SOLTA O ARQUIVO (DROP)
    cardPrincipal.addEventListener('drop', (e) => {
        cardPrincipal.classList.remove('drag-over'); // limpa efeito

        const arquivos = e.dataTransfer.files;

        // Se tiver arquivo
        if (arquivos.length > 0) {
            enviarParaBackend(arquivos[0]); // envia só o primeiro
        }
    });

    // 6. UPLOAD TRADICIONAL (INPUT FILE)
    inputArquivo.addEventListener('change', function() {

        if (this.files.length > 0) {
            enviarParaBackend(this.files[0]); // envia o arquivo selecionado
        }
    });
};

// FUNÇÃO DE LEITURA DE TEXTO (TEXT-TO-SPEECH)
function lerDescricao(texto) {

    // Verifica se o navegador suporta voz
    if ('speechSynthesis' in window) {

        // Cancela qualquer fala atual (evita sobreposição)
        window.speechSynthesis.cancel();

        // Cria a fala com o texto recebido
        const mensagem = new SpeechSynthesisUtterance(texto);
        
        // Configurações da voz
        mensagem.lang = 'pt-BR'; // português do Brasil
        mensagem.rate = 1.2;     // velocidade
        mensagem.pitch = 1.0;    // tom

        // Executa a fala
        window.speechSynthesis.speak(mensagem);

    } else {
        console.error("Este navegador não suporta leitura de voz.");
    }
}