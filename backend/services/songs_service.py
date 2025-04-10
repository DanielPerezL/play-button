from flask import  request
from config import app, db
from models import Song, Mp3
from sqlalchemy.sql import func
import os
import base64
from exceptions import BadRequestException, ConflictException, AppException, NotFoundException
from utils import has_more_results


class SongsService():
    def __allowed_file(filename):
        """Verifica si el archivo tiene una extensión válida (MP3)."""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

    @staticmethod
    def add_song(name, mp3_file):
        try:
            # Verificar si 'mp3' está en los archivos y 'name' en el formulario
            if 'mp3' not in request.files or 'name' not in request.form:
                raise BadRequestException()
            
            mp3_file = request.files['mp3']
            name = request.form['name']
            
            # Verificar si el archivo tiene una extensión permitida
            if not SongsService.__allowed_file(mp3_file.filename):
                raise BadRequestException()
            
            # Verificar si el archivo tiene contenido (tamaño > 0)
            mp3_file.seek(0, os.SEEK_END)  # Mover al final del archivo para obtener su tamaño
            file_size = mp3_file.tell()
            mp3_file.seek(0)  # Volver al inicio del archivo
            
            if file_size == 0:
                raise BadRequestException()
            
            # Verificar si ya existe una canción con ese nombre
            if Song.query.filter_by(name=name).first():
                raise ConflictException()
            
            # Crear la canción y guardarla en la base de datos
            new_song = Song(name=name)
            db.session.add(new_song)
            db.session.commit()
            
            # Generar el nombre del archivo basado en el ID
            filename = f"{new_song.id}.mp3"
            
            # Guardar el MP3 en base64 en la base de datos si está habilitado
            try:
                mp3_file.seek(0)  # Asegurar que estamos al inicio del archivo
                mp3_data = mp3_file.read()
                encoded_mp3 = base64.b64encode(mp3_data).decode('utf-8')

                mp3_record = Mp3(filename=filename, base64_data=encoded_mp3)
                db.session.add(mp3_record)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                raise AppException()            
            db.session.commit()
            return new_song.id
            
        except Exception as e:
            db.session.rollback()  # Revertir cualquier cambio en caso de error
            raise AppException()
    
    @staticmethod
    def get_all(offset=0, limit=20, name=None):
        try:
            query = Song.query
            # Filtrado por nombre si se proporciona
            if name:
                query = query.filter(Song.name.ilike(f"%{name}%"))

            # Ordenar aleatoriamente y aplicar offset/limit
            songs = query.order_by(Song.id.asc()).offset(offset).limit(limit).all()
            return {
                "songs": [song.to_simple_dto() for song in songs],
                "has_more": has_more_results(query, offset, limit)
            }
        except Exception as e:
            raise AppException()

    
    @staticmethod
    def get_song_details(song_id):
        try:
            song = Song.query.get(song_id)
            if not song:
                raise NotFoundException()
            return song.to_details_dto()
        except Exception as e:
            raise AppException()
    
    @staticmethod
    def delete_song(song_id):
        try:
            # Buscar la canción en la base de datos
            song = Song.query.get(song_id)
            if not song:
                return

            # Eliminar la canción de la base de datos
            filename = f"{song.id}.mp3"
            db.session.delete(song)

            mp3_record = Mp3.query.filter_by(filename=filename).first()
            if mp3_record:
                db.session.delete(mp3_record)

            db.session.commit()
        except Exception as e:
            db.session.rollback()  # Revertir cualquier cambio en caso de error
            raise AppException()
