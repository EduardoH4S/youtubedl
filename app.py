from flask import Flask, render_template, request, send_file, jsonify, url_for
import yt_dlp
import os
import uuid
import tempfile
from pathlib import Path
import shutil
import time
import random

app = Flask(__name__)

# Configurações
TEMP_DIR = Path(tempfile.gettempdir()) / "ytdownloader"
TEMP_DIR.mkdir(exist_ok=True)
DOWNLOAD_DIR = Path("static") / "downloads"
DOWNLOAD_DIR.mkdir(exist_ok=True, parents=True)

# Dicionário para rastrear arquivos temporários e quando foram criados
temp_files = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/prepare-download', methods=['POST'])
def prepare_download():
    try:
        # Obter a URL do vídeo do formulário
        url = request.form.get('url')
        if not url:
            return jsonify({'error': 'URL não fornecida'}), 400

        # Determinar o tipo (vídeo ou áudio)
        option = request.form.get('option', 'video')
        
        # Obter a qualidade selecionada
        quality = None
        if option == 'video':
            quality = request.form.get('videoquality', 'highest')
        else:
            quality = request.form.get('audioquality', 'best')
            
        # Gerar um ID único para o arquivo
        file_id = str(uuid.uuid4())
        temp_path = TEMP_DIR / file_id
        
        # Configurar as opções do yt-dlp
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'format': get_format_string(option, quality),
            'outtmpl': str(temp_path) + '.%(ext)s',
        }
        
        # Se for audio, adicionar opção para converter para MP3
        if option == 'audio':
            ydl_opts.update({
                'extract_audio': True,
                'audio_format': 'mp3',
                'audio_quality': quality,
            })
        
        # Fazer o download do vídeo
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            
            # Determinar o caminho do arquivo baixado
            if option == 'audio':
                # Procurar o arquivo .mp3 criado
                mp3_files = list(TEMP_DIR.glob(f"{file_id}*.mp3"))
                if mp3_files:
                    file_path = str(mp3_files[0])
                else:
                    # Fallback se .mp3 não for encontrado
                    downloaded_files = list(TEMP_DIR.glob(f"{file_id}*"))
                    if not downloaded_files:
                        return jsonify({'error': 'Falha ao encontrar arquivo baixado'}), 500
                    file_path = str(downloaded_files[0])
            else:
                # Para vídeo, encontre o arquivo criado
                downloaded_files = list(TEMP_DIR.glob(f"{file_id}*"))
                if not downloaded_files:
                    return jsonify({'error': 'Falha ao encontrar arquivo baixado'}), 500
                file_path = str(downloaded_files[0])
                
            # Obter o título original do vídeo para usar como nome do arquivo
            video_title = info.get('title', 'video')
            # Sanitizar o título para nome de arquivo
            safe_title = "".join([c for c in video_title if c.isalpha() or c.isdigit() or c==' ']).rstrip()
            safe_title = safe_title.replace(' ', '_')
            
            # Determinar a extensão do arquivo
            ext = os.path.splitext(file_path)[1].lstrip('.')
            
            # Criar o nome do arquivo final
            if option == 'audio':
                filename = f"{safe_title}.mp3"
                mimetype = 'audio/mpeg'
            else:
                filename = f"{safe_title}.{ext}"
            
            # Mover para a pasta de downloads estáticos
            public_file_path = DOWNLOAD_DIR / filename
            shutil.copy2(file_path, public_file_path)
            
            # Remover o arquivo temporário
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                app.logger.error(f"Erro ao remover arquivo temporário: {e}")
            
            # Registrar no dicionário de arquivos temporários para limpeza futura
            temp_files[str(public_file_path)] = {
                'time': time.time(),
                'path': str(public_file_path)
            }
            
            # Retornar o caminho relativo para download
            download_url = url_for('download_file', filename=filename)
            return jsonify({
                'success': True, 
                'download_url': download_url,
                'filename': filename
            })
            
    except Exception as e:
        app.logger.error(f"Erro durante o preparo do download: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/download-file/<filename>')
def download_file(filename):
    """Serve o arquivo para download com o cabeçalho correto para mostrar a caixa de diálogo 'Salvar como'."""
    file_path = DOWNLOAD_DIR / filename
    
    if not file_path.exists():
        return jsonify({'error': 'Arquivo não encontrado'}), 404
    
    # Determinar o mimetype baseado na extensão
    _, ext = os.path.splitext(filename)
    ext = ext.lower().lstrip('.')
    
    if ext == 'mp4':
        mimetype = 'video/mp4'
    elif ext == 'webm':
        mimetype = 'video/webm'
    elif ext == 'mp3':
        mimetype = 'audio/mpeg'
    else:
        mimetype = 'application/octet-stream'
    
    return send_file(
        file_path, 
        mimetype=mimetype,
        as_attachment=True,  # Esta é a configuração crucial para abrir o diálogo "Salvar como"
        download_name=filename
    )

def get_format_string(option, quality):
    """Determina a string de formato com base na opção e qualidade sem necessidade de ffmpeg."""
    if option == 'video':
        if quality == 'highest':
            return 'best[ext=mp4]/best'  # Apenas formatos que não precisam ser mesclados
        elif quality == 'medium':
            return 'best[height<=720][ext=mp4]/best[height<=720]'
        elif quality == 'lowest':
            return 'best[height<=480][ext=mp4]/best[height<=480]'
    else:  # audio
        return 'bestaudio[ext=m4a]/bestaudio'
    
    return 'best'  # Padrão

@app.route('/video-info', methods=['GET'])
def video_info():
    video_id = request.args.get('id')
    if not video_id:
        return jsonify({'error': 'ID do vídeo não fornecido'}), 400
        
    try:
        # Obter informações do vídeo sem fazer download
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
            'extract_flat': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            
            # Extrair informações relevantes
            return jsonify({
                'title': info.get('title', ''),
                'channel': info.get('uploader', ''),
                'duration': info.get('duration', 0),
                'views': info.get('view_count', 0)
            })
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def cleanup_old_files():
    """Limpa arquivos temporários mais antigos que 30 minutos"""
    current_time = time.time()
    files_to_remove = []
    
    for path, info in temp_files.items():
        if current_time - info['time'] > 1800:  # 30 minutos
            try:
                os.remove(info['path'])
                files_to_remove.append(path)
            except Exception as e:
                app.logger.error(f"Erro ao limpar arquivo: {e}")
    
    for path in files_to_remove:
        temp_files.pop(path, None)

@app.before_request
def before_request():
    """Limpa arquivos antigos ocasionalmente"""
    if random.random() < 0.01:  # 1% de chance a cada requisição
        cleanup_old_files()

if __name__ == '__main__':
    app.run(debug=True)
