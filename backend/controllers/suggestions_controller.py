from flask import request
from flask_jwt_extended import jwt_required
from config import app
from services import SuggestionsService
from exceptions import BadRequestException


@app.route('/api/suggestions', methods=['POST'])
@jwt_required()
def create_suggestion():
    data = request.get_json()
    
    song_name = data.get('song_name') if data else None
    if not song_name:
        raise BadRequestException()

    SuggestionsService.create_suggestion(song_name)
    return '', 201
