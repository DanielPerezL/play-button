from config import app, db, SECRET_KEY
from controllers import (
    auth_controller,
    playlist_controller,
    songs_controller,
    suggestions_controller,
    user_controller,
)
from sqlalchemy.exc import SQLAlchemyError
from models import User
import os
from exceptions import AppException
from flask import request, jsonify


with app.app_context():
    db.create_all()
    admin = User.query.filter_by(nickname=os.environ['ADMIN_USER']).first()
    if admin is not None and not admin.check_password(os.environ['ADMIN_PASSWORD']):
        admin.set_password(os.environ['ADMIN_PASSWORD'])
        try:
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
    elif admin is None:
        new_admin = User(nickname = os.environ['ADMIN_USER'],
                    password = os.environ['ADMIN_PASSWORD']
                    )
        try:
            db.session.add(new_admin)
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()

@app.errorhandler(AppException)
def handle_app_exception(error):
    response = jsonify(error.to_dict())
    response.status = error.status_code
    return response

@app.before_request
def cors_headers():
    if request.method != "OPTIONS":
        return
    response = app.make_response("")
    response.status_code = 204
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Ejecutar la creación de las tablas dentro del contexto de la aplicación
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
