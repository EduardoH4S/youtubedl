// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Configuração do particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {"value": 80, "density": {"enable": true, "value_area": 1000}},
                "color": {"value": "#ff0000"},
                "shape": {"type": "circle"},
                "opacity": {"value": 0.5, "random": true, "anim": {"enable": true, "speed": 1}},
                "size": {"value": 3, "random": true},
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ff0000",
                    "opacity": 0.2,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 2,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {"enable": true, "mode": "bubble"},
                    "onclick": {"enable": true, "mode": "push"},
                    "resize": true
                },
                "modes": {
                    "bubble": {"distance": 150, "size": 5, "duration": 2, "opacity": 0.8, "speed": 3},
                    "push": {"particles_nb": 4}
                }
            },
            "retina_detect": true
        });
    }
    // Elementos DOM
    const form = document.getElementById('downloadForm');
    const urlInput = document.getElementById('urlInput');
    const urlFeedback = document.getElementById('urlFeedback');
    const pasteButton = document.getElementById('pasteButton');
    const videoOption = document.getElementById('videoOption');
    const audioOption = document.getElementById('audioOption');
    const videoQualityOptions = document.getElementById('videoQualityOptions');
    const audioQualityOptions = document.getElementById('audioQualityOptions');
    const downloadButton = document.getElementById('downloadButton');
    const processingModal = document.getElementById('processingModal');
    const previewModal = document.getElementById('previewModal');
    const closePreviewModal = document.getElementById('closePreviewModal');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressSteps = document.getElementById('progressSteps');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    // Função para validar URL do YouTube
    function isValidYouTubeUrl(url) {
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
        return ytRegex.test(url);
    }
    
    // Funcionalidade de colar
    pasteButton.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            urlInput.value = text;
            validateInput();
        } catch (err) {
            console.error('Falha ao colar: ', err);
            urlFeedback.textContent = 'Não foi possível acessar a área de transferência';
            urlFeedback.classList.add('error');
        }
    });
    
    // Alternar entre opções de formato
    videoOption.addEventListener('click', function() {
        videoOption.classList.add('active');
        audioOption.classList.remove('active');
        videoQualityOptions.style.display = 'block';
        audioQualityOptions.style.display = 'none';
    });
    
    audioOption.addEventListener('click', function() {
        audioOption.classList.add('active');
        videoOption.classList.remove('active');
        audioQualityOptions.style.display = 'block';
        videoQualityOptions.style.display = 'none';
    });
    
    // Validação de entrada em tempo real
    urlInput.addEventListener('input', validateInput);
    
    function validateInput() {
        const url = urlInput.value.trim();
        if (url === '') {
            urlFeedback.textContent = '';
            urlFeedback.classList.remove('error');
            return;
        }
        
        if (isValidYouTubeUrl(url)) {
            urlFeedback.innerHTML = '<i class="fas fa-check-circle"></i> URL válida do YouTube';
            urlFeedback.classList.remove('error');
            // Extrair ID do vídeo
            const videoId = extractVideoId(url);
            if (videoId) {
                console.log(`Vídeo ID: ${videoId}`);
            }
        } else {
            urlFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> URL inválida, cole um link do YouTube';
            urlFeedback.classList.add('error');
        }
    }
    
    // Extrair ID do vídeo do YouTube
    function extractVideoId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : false;
    }
    
    // Configurar os seletores de qualidade
    setupQualitySelectors();
    
    function setupQualitySelectors() {
        // Para opções de qualidade de vídeo
        const videoQualityRadios = document.querySelectorAll('input[name="videoquality"]');
        const videoQualityLabels = document.querySelectorAll('#videoQualityOptions .quality-option');
        videoQualityRadios.forEach((radio, index) => {
            radio.addEventListener('change', () => {
                videoQualityLabels.forEach(label => label.classList.remove('active'));
                videoQualityLabels[index].classList.add('active');
            });
        });
        
        // Para opções de qualidade de áudio
        const audioQualityRadios = document.querySelectorAll('input[name="audioquality"]');
        const audioQualityLabels = document.querySelectorAll('#audioQualityOptions .quality-option');
        audioQualityRadios.forEach((radio, index) => {
            radio.addEventListener('change', () => {
                audioQualityLabels.forEach(label => label.classList.remove('active'));
                audioQualityLabels[index].classList.add('active');
            });
        });
    }
    
    // Fechar modal de visualização
    if (closePreviewModal) {
        closePreviewModal.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });
    }
    
    // Quando clicar fora do modal, fechar
    window.addEventListener('click', (event) => {
        if (event.target === previewModal) {
            previewModal.style.display = 'none';
        }
    });
    
    // Envio do formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const url = urlInput.value.trim();
        
        if (!isValidYouTubeUrl(url)) {
            urlFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> URL inválida, cole um link do YouTube';
            urlFeedback.classList.add('error');
            urlInput.focus();
            return;
        }
        
        // Extrair ID do vídeo para usar nas próximas etapas
        const videoId = extractVideoId(url);
        
        if (!videoId) {
            urlFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Não foi possível extrair o ID do vídeo';
            urlFeedback.classList.add('error');
            return;
        }
        
        // Atualizar etapas de progresso
        step1.classList.add('completed');
        step2.classList.add('active');
        
        // Mostrar modal de processamento
        processingModal.style.display = 'flex';
        
        // Simular processamento
        simulateProcessing(videoId);
    });
    
    // Simulação de processamento
    function simulateProcessing(videoId) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                // Após processamento completo
                setTimeout(() => {
                    processingModal.style.display = 'none';
                    // Atualizar etapas
                    step2.classList.remove('active');
                    step2.classList.add('completed');
                    step3.classList.add('active');
                    // Mostrar pré-visualização
                    showVideoPreview(videoId);
                }, 500);
            }
            // Atualizar barra de progresso
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }, 200);
    }
    
    // Mostrar pré-visualização do vídeo
    function showVideoPreview(videoId) {
        // Construir dados do vídeo a partir do ID
        const videoInfo = {
            title: "Vídeo do YouTube",
            thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
            duration: "Duração desconhecida",
            views: "Visualizações desconhecidas",
            channel: "Canal do YouTube",
            files: [
                { type: "video", name: "MP4 - Alta Qualidade", quality: "1080p", size: "~40 MB", icon: "fas fa-film" },
                { type: "video", name: "MP4 - Qualidade Média", quality: "720p", size: "~25 MB", icon: "fas fa-film" },
                { type: "video", name: "MP4 - Menor Tamanho", quality: "480p", size: "~15 MB", icon: "fas fa-film" },
                { type: "audio", name: "MP3 - Alta Qualidade", quality: "320 kbps", size: "~8 MB", icon: "fas fa-music" }
            ]
        };
        
        // Preencher informações do vídeo
        document.getElementById('videoTitle').textContent = videoInfo.title;
        document.getElementById('videoThumbnail').style.backgroundImage = `url(${videoInfo.thumbnail})`;
        document.getElementById('videoDuration').textContent = videoInfo.duration;
        document.getElementById('videoViews').textContent = videoInfo.views;
        document.getElementById('channelName').textContent = videoInfo.channel;
        
        // Preencher opções de download
        const downloadFilesContainer = document.getElementById('downloadFiles');
        downloadFilesContainer.innerHTML = '';
        
        videoInfo.files.forEach(file => {
            // Verificar se devemos mostrar apenas áudio ou vídeo
            const isVideoSelected = document.querySelector('input[name="option"]:checked').value === 'video';
            
            if ((isVideoSelected && file.type === 'video') || (!isVideoSelected && file.type === 'audio') ||
                (isVideoSelected && file.type === 'audio' && file.quality === '320 kbps')) {
                
                const fileElement = document.createElement('div');
                fileElement.className = 'download-file';
                fileElement.innerHTML = `
                    <div class="file-icon">
                        <i class="${file.icon}"></i>
                    </div>
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-meta">
                            <div class="quality-info">${file.quality}</div>
                            <div class="size-info">${file.size}</div>
                        </div>
                    </div>
                    <div class="download-now">
                        <i class="fas fa-download"></i>
                        <span>Download</span>
                    </div>
                `;
                
                // Adicionar evento para iniciar download
                fileElement.addEventListener('click', () => {
                    simulateDownload(file, videoId);
                });
                
                downloadFilesContainer.appendChild(fileElement);
            }
        });
        
        // Mostrar modal de pré-visualização
        previewModal.style.display = 'flex';
    }
    
    // Simular download do arquivo
    function simulateDownload(file, videoId) {
        // Em um aplicativo real, aqui seria redirecionado para o link de download
        console.log(`Baixando ${file.name} (${file.quality}) - ${file.size} do vídeo ${videoId}`);
        
        // Fechar o modal
        previewModal.style.display = 'none';
        
        // Criar notificação de sucesso
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Download iniciado! ${file.name}</span>
        `;
        document.body.appendChild(notification);
        
        // Remover notificação após alguns segundos
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    // Adicionar CSS para notificações
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease-out forwards;
        }
        .notification.success {
            background: linear-gradient(135deg, #2ecc71, #27ae60);
        }
        .notification.error {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
        }
        .notification.fade-out {
            animation: slideOut 0.5s ease-out forwards;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(notificationStyles);
    
    // Adicionar animação para quando a página for carregada
    document.body.classList.add('loaded');
});
