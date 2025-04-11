FROM python:3.10-slim

# Instalar ffmpeg
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Variáveis de ambiente
ENV PORT=8080

# Expor a porta
EXPOSE 8080

CMD gunicorn --bind 0.0.0.0:$PORT app:app
