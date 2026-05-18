// Espera todo o HTML da página carregar antes de executar o código
document.addEventListener("DOMContentLoaded", () => {
    
    // Busca os elementos do HTML pelo ID
    const volumeSlider = document.getElementById('volume');
    const btnMenos = document.getElementById('btn-menos');
    const btnMais = document.getElementById('btn-mais');
    const toggleLeitura = document.getElementById('leitura-ativada');
    
    // Busca os dados do usuário salvos no localStorage
    const dadosMemoria = localStorage.getItem('usuarioLogado');

    // Variáveis que irão armazenar o ID do usuário e o token
    let usuarioIdLogado = null;
    let token = null;

    // Verifica se existem dados salvos no localStorage
    if (dadosMemoria) {

        // Converte a string JSON em objeto JavaScript
        const dadosParsed = JSON.parse(dadosMemoria);

        // Salva o ID do usuário logado
        usuarioIdLogado = dadosParsed.usuario.id;

        // Salva o token de autenticação
        token = dadosParsed.token;

    } else {

        // Caso não exista usuário logado, redireciona para a tela de login
        window.location.href = "../Login/Login.html";
    }

    // URL da API responsável pelas configurações
    const apiUrl = 'https://localhost:7006/api/Configuracao';
    
    // Função responsável por atualizar a cor visual do slider
    function atualizarCorSlider() {

        // Pega o valor atual do slider
        const valor = volumeSlider.value;

        // Cria um gradiente baseado na porcentagem do volume
        const cor = `linear-gradient(90deg, #2f7cf6 ${valor}%, #bebebe ${valor}%)`;

        // Aplica o gradiente no background do slider
        volumeSlider.style.background = cor;
    }

    // Sempre que o slider mudar, atualiza a cor
    volumeSlider.addEventListener('input', atualizarCorSlider);

    // Ao clicar no botão de diminuir volume, reduz 5 unidades
    btnMenos.addEventListener('click', () => {
        alterarVolume(-5);
    });

    // Ao clicar no botão de aumentar volume, adiciona 5 unidades
    btnMais.addEventListener('click', () => {
        alterarVolume(5);
    });

    // Função responsável por alterar o volume
    function alterarVolume(diferenca) {

        // Converte o valor atual do slider para número inteiro
        let valorAtual = parseInt(volumeSlider.value);

        // Soma ou subtrai a diferença recebida
        let novoValor = valorAtual + diferenca;

        // Verifica se o valor continua entre 0 e 100
        if (novoValor >= 0 && novoValor <= 100) {

            // Atualiza o valor do slider
            volumeSlider.value = novoValor;

            // Atualiza a aparência visual do slider
            atualizarCorSlider();

            // Salva as alterações no backend
            salvarConfiguracoesBackend();
        }
    }

    // Função responsável por carregar as configurações salvas no backend
    async function carregarConfiguracoes() {

        try {

            // Faz uma requisição GET para buscar as configurações do usuário
            const response = await fetch(`${apiUrl}/usuario/${usuarioIdLogado}`, {

                // Envia o token de autenticação no cabeçalho
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Verifica se a resposta foi bem-sucedida
            if (response.ok) {

                // Converte a resposta para JSON
                const config = await response.json();

                // Define se a leitura está ativada ou não
                toggleLeitura.checked = config.leituraAtiva;

                // Define o valor do volume
                volumeSlider.value = config.volume;

                // Atualiza a aparência do slider
                atualizarCorSlider();

                // Busca o radio button correspondente à velocidade salva
                const radioVelocidade = document.querySelector(
                    `input[name="velocidade"][value="${config.velocidadeLeitura.toFixed(1)}"]`
                );

                // Marca o radio button encontrado
                if (radioVelocidade) {
                    radioVelocidade.checked = true;
                }

                // Busca o radio button correspondente à voz salva
                const radioVoz = document.querySelector(
                    `input[name="voz"][value="${config.vozSintetica === 0 ? 'masculina' : 'feminina'}"]`
                );

                // Marca o radio button encontrado
                if (radioVoz) {
                    radioVoz.checked = true;
                }

                // Busca o radio button correspondente ao tema salvo
                const radioTema = document.querySelector(
                    `input[name="tema"][value="${config.modoExibicao.toLowerCase()}"]`
                );

                // Marca o radio button encontrado
                if (radioTema) {
                    radioTema.checked = true;
                }
            }

        } catch (error) {

            // Exibe erro caso a requisição falhe
            console.error("Erro ao carregar configurações:", error);
        }
    }

    // Função responsável por salvar as configurações no backend
    async function salvarConfiguracoesBackend() {

        // Busca a velocidade selecionada
        const velocidadeSelecionada = document.querySelector(
            'input[name="velocidade"]:checked'
        ).value;

        // Busca a voz selecionada
        const vozSelecionada = document.querySelector(
            'input[name="voz"]:checked'
        ).value;

        // Busca o tema selecionado
        const temaSelecionado = document.querySelector(
            'input[name="tema"]:checked'
        ).value;

        // Cria o objeto DTO que será enviado para a API
        const dto = {

            // Define se a leitura está ativa
            leituraAtiva: toggleLeitura.checked,

            // Converte a velocidade para decimal
            velocidadeLeitura: parseFloat(velocidadeSelecionada),

            // Define o tipo de voz:
            // 0 = masculina
            // 1 = feminina
            vozSintetica: vozSelecionada === "masculina" ? 0 : 1,

            // Converte o volume para inteiro
            volume: parseInt(volumeSlider.value),

            // Vibração está fixa como false
            vibracaoAtiva: false,

            // Ajusta o texto do tema para iniciar com letra maiúscula
            modoExibicao:
                temaSelecionado.charAt(0).toUpperCase() +
                temaSelecionado.slice(1),

            // Envia o ID do usuário logado
            usuarioId: usuarioIdLogado
        };

        try {

            // Faz uma requisição POST para salvar as configurações
            await fetch(apiUrl, {

                // Método da requisição
                method: 'POST',

                // Cabeçalhos da requisição
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },

                // Converte o DTO para JSON
                body: JSON.stringify(dto)
            });

            // Exibe mensagem de sucesso no console
            console.log("Configurações salvas no banco!");

        } catch (error) {

            // Exibe erro caso aconteça alguma falha
            console.error("Erro ao salvar:", error);
        }
    }

    // Busca todos os inputs que devem ser monitorados
    const inputsParaMonitorar = document.querySelectorAll(
        'input[type="checkbox"], input[type="radio"], input[type="range"]'
    );

    // Adiciona evento de mudança em cada input
    inputsParaMonitorar.forEach(input => {

        // Sempre que houver alteração, salva no backend
        input.addEventListener('change', salvarConfiguracoesBackend);
    });

    // Carrega as configurações salvas ao abrir a página
    carregarConfiguracoes();
});