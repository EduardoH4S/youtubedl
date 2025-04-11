from flask import Flask, render_template, request, send_file
from pytube import YouTube
import os

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        url = request.form['url']
        option = request.form['option']
        yt = YouTube(url)
        
        if option == 'video':
            stream = yt.streams.get_highest_resolution()
        else:
            stream = yt.streams.filter(only_audio=True).first()
        
        out_file = stream.download()
        
        return send_file(out_file, as_attachment=True)
        
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
