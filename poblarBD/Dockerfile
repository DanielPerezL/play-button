# Usar una imagen base oficial de Python
FROM python:3.12-slim

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos locales al contenedor
COPY . /app

# Instalar FFmpeg desde los repositorios de Debian
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Instalar las dependencias de Python
RUN pip install -r requirements.txt

# Ejecutar el script cuando el contenedor se inicie
CMD ["python", "script.py"]
