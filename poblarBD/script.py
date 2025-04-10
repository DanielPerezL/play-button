import os
import json
import yt_dlp
import requests
import subprocess
from dotenv import load_dotenv

# Cargar variables del archivo .env
load_dotenv()

# Configuraciones
API_URL = 'http://192.168.18.59:5000/api/songs' #'https://master-stinkbug-slowly.ngrok-free.app/api/songs'
UPLOAD_FOLDER = './downloads'  # Carpeta donde se guardan los MP3 descargados
SONGS_JSON = 'songs.json'  # Archivo JSON con los enlaces de YouTube
SECRET_KEY = os.getenv('SECRET_KEY')

# Asegurar que la carpeta de descargas existe
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Función para descargar el audio de YouTube
def download_youtube_audio(url, output_folder):
    """Descarga el audio en el mejor formato disponible."""
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(output_folder, '%(id)s.%(ext)s'),
        'quiet': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            file_ext = info_dict['ext']  # Extensión real del archivo descargado
            file_path = os.path.join(output_folder, f"{info_dict['id']}.{file_ext}")
            return file_path, info_dict.get('title', 'Unknown Song')
    except Exception as e:
        print(f"\n❌ Error al descargar {url}: {e}")
        return None, None

# Función para convertir a MP3 usando FFmpeg
def convert_to_mp3(input_file):
    """Convierte un archivo de audio a formato MP3."""
    output_file = os.path.splitext(input_file)[0] + ".mp3"

    try:
        subprocess.run(
            ["ffmpeg", "-i", input_file, "-vn", "-ar", "44100", "-ac", "2", "-b:a", "96k", output_file],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )
        os.remove(input_file)  # Eliminar archivo original (.webm, .m4a, etc.)
        return output_file
    except subprocess.CalledProcessError as e:
        return None

# Función para hacer el POST a la API y subir el MP3
def upload_song(mp3_file_path, song_name):
    """Sube un archivo MP3 a la API."""
    headers = {
        "Authorization": f"Bearer {SECRET_KEY}"
    }

    try:
        with open(mp3_file_path, 'rb') as mp3_file:
            response = requests.post(API_URL, files={'mp3': mp3_file}, data={'name': song_name}, headers=headers)

        if response.status_code == 201:
            print(f"\n✅ Subida exitosa: {song_name}")
        else:
            print(f"\n❌ Error en la subida: {response.json().get('error', 'Error desconocido')}")
    except Exception as e:
        print(f"\n❌ Error al hacer el POST: {e}")

# Función principal para procesar el archivo JSON y subir las canciones
def process_songs():
    """Lee el archivo JSON, descarga y sube las canciones."""
    if not os.path.exists(SONGS_JSON):
        print(f"\n❌ No se encontró el archivo {SONGS_JSON}")
        return

    with open(SONGS_JSON, 'r') as file:
        try:
            songs_data = json.load(file)
        except json.JSONDecodeError:
            print(f"\n❌ Error al leer el JSON: Formato inválido")
            return

    for url in songs_data.get('songs', []):
        print(f"🎵 Procesando: {url}...")
        file_path, song_name = download_youtube_audio(url, UPLOAD_FOLDER)

        if file_path and song_name:
            # Convertir a MP3 si no es MP3
            if not file_path.endswith('.mp3'):
                file_path = convert_to_mp3(file_path)

            if file_path:
                upload_song(file_path, song_name)
                os.remove(file_path)  # Eliminar el MP3 después de subirlo

# Ejecutar el script
if __name__ == '__main__':
    process_songs()
