from flask import  request, jsonify, send_file, make_response
from config import app
from models import  Mp3
from services import SongsService
from exceptions import NotFoundException, UnauthorizedException
import tempfile
import base64
from exceptions import MP3RecoveryException
from models import Song
from flask_jwt_extended import (
                                jwt_required, 
                                get_jwt, 
                                )
from utils import get_user_from_token, is_admin

@app.route('/api/songs', methods=['POST'])
@jwt_required()
def create_song():
    client = get_user_from_token(get_jwt())

    if not is_admin(client):
        raise UnauthorizedException()

    # Verificar si 'mp3' está en los archivos y 'name' en el formulario
    if 'mp3' not in request.files or 'name' not in request.form:
        return jsonify({"error": "Falta archivo MP3 o nombre"}), 400
    
    mp3_file = request.files['mp3']
    name = request.form['name']
    
    id = SongsService.add_song(name, mp3_file)    
    response = make_response()
    response.status_code = 201

    base_url = request.host_url.rstrip('/')
    response.headers["Location"] = f"{base_url}/api/songs/{id}"
    return response

@app.route('/uploads/mp3_files/<filename>', methods=['GET'])
@jwt_required()
def get_mp3(filename):
    mp3_record = Mp3.query.filter_by(filename=filename).first()
    if not mp3_record:
        raise NotFoundException()

    try:
        mp3_data = base64.b64decode(mp3_record.base64_data)
        with tempfile.NamedTemporaryFile(delete=True, suffix=".mp3") as temp_file:
            temp_file.write(mp3_data)
            temp_file.flush()  # Asegura que los datos se escriban completamente
            return send_file(temp_file.name, mimetype="audio/mpeg")        
    except Exception:
        raise MP3RecoveryException()

@app.route('/api/songs', methods=['GET'])
@jwt_required()
def get_all_songs():
    offset = request.args.get('offset', 0, type=int)
    limit = request.args.get('limit', 20, type=int)
    name = request.args.get('name', None, type=str)

    return jsonify(
        SongsService.get_all(offset, limit, name)
    ), 200
    

@app.route('/api/songs/<int:song_id>', methods=['GET'])
@jwt_required()
def get_song_by_id(song_id):
    return jsonify(
        SongsService.get_song_details(song_id)
    ), 200

@app.route('/api/songs/<int:song_id>', methods=['DELETE'])
@jwt_required()
def delete_song(song_id):
    client = get_user_from_token(get_jwt())
    if not is_admin(client):
        raise UnauthorizedException()
        
    SongsService.delete_song(song_id)
    return '', 204