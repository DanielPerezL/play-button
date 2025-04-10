from config import db
from models import Suggestion
from exceptions import BadRequestException, AppException


class SuggestionsService:

    @staticmethod
    def create_suggestion(song_name):
        try:
            if not song_name or not song_name.strip():
                raise BadRequestException()

            # Evitar duplicados
            existing = Suggestion.query.filter_by(song_name=song_name.strip()).first()
            if existing:
                return

            suggestion = Suggestion(song_name=song_name.strip())
            db.session.add(suggestion)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise AppException()
