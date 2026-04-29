window.onload = function() {
    const fotoInput = document.getElementById('fotoInput');
    const placeholder = document.getElementById('upload-placeholder');
    const imagemPreview = document.getElementById('imagemPreview');
    const cardUpload = document.getElementById('cardUpload');
    const descricaoTexto = document.getElementById('descricaoTexto');
    const btnProcessar = document.getElementById('btnProcessar');

    let arquivoImagem = null;

    // Função que processa e exibe a imagem no card
    function handleFiles(files) {
        const file = files[0];
        if (file && file.type.startsWith('image/')) {
            arquivoImagem = file;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                // 1. Esconde o texto e o botão de adicionar
                placeholder.style.display = 'none';
                
                // 2. Coloca a imagem no <img> e torna visível
                imagemPreview.src = e.target.result;
                imagemPreview.style.display = 'block';
                
                // 3. Remove a borda tracejada (opcional, para estética)
                cardUpload.style.borderStyle = 'solid';
            };
            reader.readAsDataURL(file);
            
            falar("Imagem carregada com sucesso. Clique em processar para ouvir a descrição.");
        }
    }

    // Evento de clique no botão "Adicionar"
    fotoInput.addEventListener('change', (e) => handleFiles(e.target.files));

    // Eventos de Arrastar e Soltar (Drag and Drop)
    cardUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        cardUpload.style.backgroundColor = "rgba(180, 210, 240, 1)";
    });

    cardUpload.addEventListener('dragleave', () => {
        cardUpload.style.backgroundColor = "rgba(204, 224, 245, 0.9)";
    });

    cardUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        cardUpload.style.backgroundColor = "rgba(204, 224, 245, 0.9)";
        handleFiles(e.dataTransfer.files);
    });

    // Evento do Botão Processar
    btnProcessar.addEventListener('click', async () => {
        if (!arquivoImagem) {
            falar("Por favor, selecione uma imagem antes de processar.");
            return;
        }

        descricaoTexto.innerText = "A Olhuz está analisando sua imagem... Por favor, aguarde.";
        falar("Analisando imagem.");

        const formData = new FormData();
        formData.append('arquivo', arquivoImagem);

        try {
            const response = await fetch('https://localhost:7006/api/IA/descrever', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                const resultado = data.descricao || "Não foi possível gerar uma descrição.";
                descricaoTexto.innerText = resultado;
                falar(resultado);
            } else {
                throw new Error();
            }
        } catch (error) {
            descricaoTexto.innerText = "Erro ao conectar com o servidor. Verifique se o backend está ativo.";
            falar("Erro de conexão.");
        }
    });
};

// Função de Acessibilidade (Voz)
function falar(texto) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
    }
}