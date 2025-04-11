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
    if (pasteButton) {
        pasteButton.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                urlInput.value = text;
                validateInput();
            } catch (err) {
                console.error('Falha ao colar: ', err);
                if (urlFeedback) {
                    urlFeedback.textContent = 'Não foi possível acessar a área de transferência';
                    urlFeedback.classList.add('error');
                }
            }
        });
    }
    
    // Alternar entre opções de formato
    if (videoOption && audioOption) {
        videoOption.addEventListener('click', function() {
            videoOption.classList.add('active');
            audioOption.classList.remove('active');
            if (videoQualityOptions && audioQualityOptions) {
                videoQualityOptions.style.display = 'block';
                audioQualityOptions.style.display = 'none';
            }
        });
        
        audioOption.addEventListener('click', function() {
            audioOption.classList.add('active');
            videoOption.classList.remove('active');
            if (videoQualityOptions && audioQualityOptions) {
                audioQualityOptions.style.display = 'block';
                videoQualityOptions.style.display = 'none';
            }
        });
    }
    
    // Validação de entrada em tempo real
    if (urlInput && urlFeedback) {
        urlInput.addEventListener('input', validateInput);
    }
    
    function validateInput() {
        if (!urlInput || !urlFeedback) return;
        
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
        
        if (videoQualityRadios.length > 0 && videoQualityLabels.length > 0) {
            videoQualityRadios.forEach((radio, index) => {
                if (index < videoQualityLabels.length) {
                    radio.addEventListener('change', () => {
                        videoQualityLabels.forEach(label => label.classList.remove('active'));
                        videoQualityLabels[index].classList.add('active');
                    });
                }
            });
        }
        
        // Para opções de qualidade de áudio
        const audioQualityRadios = document.querySelectorAll('input[name="audioquality"]');
        const audioQualityLabels = document.querySelectorAll('#audioQualityOptions .quality-option');
        
        if (audioQualityRadios.length > 0 && audioQualityLabels.length > 0) {
            audioQualityRadios.forEach((radio, index) => {
                if (index < audioQualityLabels.length) {
                    radio.addEventListener('change', () => {
                        audioQualityLabels.forEach(label => label.classList.remove('active'));
                        audioQualityLabels[index].classList.add('active');
                    });
                }
            });
        }
    }
    
    // Fechar modal de visualização
    if (closePreviewModal && previewModal) {
        closePreviewModal.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });
        
        // Quando clicar fora do modal, fechar
        window.addEventListener('click', (event) => {
            if (event.target === previewModal) {
                previewModal.style.display = 'none';
            }
        });
    }
    
    // Função principal de submissão de formulário
    function submitDownloadForm() {
        if (!form) return false;
        
        const formData = new FormData(form);
        
        // Validar URL antes de prosseguir
        if (urlInput) {
            const url = urlInput.value.trim();
            if (!isValidYouTubeUrl(url)) {
                if (urlFeedback) {
                    urlFeedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> URL inválida, cole um link do YouTube';
                    urlFeedback.classList.add('error');
                }
                urlInput.focus();
                return false;
            }
        }
        
        // Mostrar modal de processamento
        if (processingModal) {
            processingModal.style.display = 'block';
        }
        
        // Atualizar UI para mostrar progresso
        if (progressFill && progressText) {
            progressFill.style.width = '10%';
            progressText.innerText = 'Preparando download...';
        }
        
        // Atualizar etapas
        if (step1) step1.classList.add('active');
        
        // Enviar requisição para o servidor
        fetch('/prepare-download', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            // Verificar o tipo de conteúdo da resposta
            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                // Se não for uma resposta OK, rejeitar com o status
                return response.text().then(text => {
                    throw new Error(`Status: ${response.status}, Resposta: ${text.substring(0, 100)}...`);
                });
            }
            
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            } else {
                throw new Error("Resposta inesperada do servidor, formato inválido");
            }
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Atualizar UI para mostrar conclusão
            if (progressFill && progressText) {
                progressFill.style.width = '80%';
                progressText.innerText = 'Download pronto!';
            }
            
            // Atualizar etapas
            if (step2) step2.classList.add('active');
            if (step3) step3.classList.add('active');
            
            // Mostrar notificação de sucesso
            showNotification(`Seu download está pronto: ${data.filename}`, 'success');
            
            // Iniciar o download redirecionando para a URL
            setTimeout(() => {
                window.location.href = data.download_url;
                
                // Limpar UI após download
                setTimeout(() => {
                    if (processingModal) processingModal.style.display = 'none';
                    if (progressFill) progressFill.style.width = '0%';
                    
                    // Restaurar etapas
                    if (step1) step1.classList.remove('active');
                    if (step2) step2.classList.remove('active');
                    if (step3) step3.classList.remove('active');
                }, 2000);
            }, 1000);
        })
        .catch(error => {
            console.error('Erro no download:', error);
            
            // Mostrar notificação de erro
            showNotification(`Erro: ${error.message}`, 'error');
            
            // Atualizar UI para mostrar erro
            if (progressText) progressText.innerText = 'Erro no download';
            if (progressFill) {
                progressFill.style.width = '100%';
                progressFill.style.backgroundColor = '#e74c3c';
            }
            
            // Limpar UI após erro
            setTimeout(() => {
                if (processingModal) processingModal.style.display = 'none';
                if (progressFill) {
                    progressFill.style.width = '0%';
                    progressFill.style.backgroundColor = '#3498db';
                }
                
                // Restaurar etapas
                if (step1) step1.classList.remove('active');
                if (step2) step2.classList.remove('active');
                if (step3) step3.classList.remove('active');
            }, 3000);
        });
        
        // Prevenir envio padrão do formulário
        return false;
    }
    
    // Configurar manipulador de eventos do formulário
    if (form) {
        form.onsubmit = function(e) {
            e.preventDefault();
            return submitDownloadForm();
        };
    }
    
    // Função para mostrar notificações
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 5000);
    }
    
    // Simulação de processamento (para demonstração)
    function simulateProcessing(videoId) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                // Após processamento completo
                setTimeout(() => {
                    if (processingModal) processingModal.style.display = 'none';
                    // Atualizar etapas
                    if (step2) {
                        step2.classList.remove('active');
                        step2.classList.add('completed');
                    }
                    if (step3) step3.classList.add('active');
                    // Mostrar pré-visualização
                    showVideoPreview(videoId);
                }, 500);
            }
            // Atualizar barra de progresso
            if (progressFill) progressFill.style.width = `${progress}%`;
            if (progressText) progressText.textContent = `${Math.round(progress)}%`;
        }, 200);
    }
    
    // Mostrar pré-visualização do vídeo (para demonstração)
    function showVideoPreview(videoId) {
        if (!previewModal) return;
        
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
        
        // Preencher informações do vídeo se os elementos existirem
        const videoTitle = document.getElementById('videoTitle');
        const videoThumbnail = document.getElementById('videoThumbnail');
        const videoDuration = document.getElementById('videoDuration');
        const videoViews = document.getElementById('videoViews');
        const channelName = document.getElementById('channelName');
        
        if (videoTitle) videoTitle.textContent = videoInfo.title;
        if (videoThumbnail) videoThumbnail.style.backgroundImage = `url(${videoInfo.thumbnail})`;
        if (videoDuration) videoDuration.textContent = videoInfo.duration;
        if (videoViews) videoViews.textContent = videoInfo.views;
        if (channelName) channelName.textContent = videoInfo.channel;
        
        // Preencher opções de download
        const downloadFilesContainer = document.getElementById('downloadFiles');
        if (downloadFilesContainer) {
            downloadFilesContainer.innerHTML = '';
            
            const optionSelected = document.querySelector('input[name="option"]:checked');
            const isVideoSelected = optionSelected ? optionSelected.value === 'video' : true;
            
            videoInfo.files.forEach(file => {
                // Verificar se devemos mostrar apenas áudio ou vídeo
                if ((isVideoSelected && file.type === 'video') || 
                    (!isVideoSelected && file.type === 'audio') ||
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
        }
        
        // Mostrar modal de pré-visualização
        previewModal.style.display = 'flex';
    }
    
    // Simular download do arquivo (para demonstração)
    function simulateDownload(file, videoId) {
        // Em um aplicativo real, aqui seria redirecionado para o link de download
        console.log(`Baixando ${file.name} (${file.quality}) - ${file.size} do vídeo ${videoId}`);
        
        // Fechar o modal
        if (previewModal) previewModal.style.display = 'none';
        
        // Mostrar notificação de sucesso
        showNotification(`Download iniciado! ${file.name}`, 'success');
    }
    
    // Adicionar CSS para notificações se ainda não existir
    if (!document.getElementById('notificationStyles')) {
        const notificationStyles = document.createElement('style');
        notificationStyles.id = 'notificationStyles';
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
            .notification.info {
                background: linear-gradient(135deg, #3498db, #2980b9);
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
    }
    
    // Adicionar classe para indicar que a página foi carregada
    document.body.classList.add('loaded');
});
