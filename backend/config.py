import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from sqlalchemy.exc import OperationalError


# Inicializar Flask, SQLAlchemy y JWT
app = Flask(__name__)
CORS(app, 
     supports_credentials=True, 
     resources={r"/*": {"origins": "*"}},  # Permite acceso desde cualquier dominio
     expose_headers="*",  # Permite que el cliente acceda a cualquier cabecera de la respuesta
     allow_headers="*",  # Permite que el cliente envíe cualquier cabecera en la petición
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])  # Todos los métodos permitidos


SECRET_KEY = os.environ.get('SECRET_KEY', '')
app.config['ALLOWED_EXTENSIONS'] = {'mp3'}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqlconnector://{os.environ['DATABASE_USER']}:{os.environ['DATABASE_PASSWORD']}@{os.environ['DATABASE_HOST']}/{os.environ['DATABASE_NAME']}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ['JWT_SECRET_KEY'] 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=90)
app.config['JWT_ACCESS_COOKIE_PATH'] = '/api/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/api/auth/refresh'
app.config['JWT_COOKIE_SECURE'] = True
app.config['JWT_CSRF_METHODS'] = ["POST", "PUT", "PATCH", "DELETE"]
app.config['JWT_COOKIE_CSRF_PROTECT'] = True 

db = SQLAlchemy(app)
jwt = JWTManager(app)

URL = os.environ['LOCALTUNNEL_URL']
NICKNAME_MAX_LENGTH = 20

# Manejo de errores de base de datos
@app.errorhandler(OperationalError)
def handle_db_error():
    return jsonify({"msg": "Database connection error"}), 500