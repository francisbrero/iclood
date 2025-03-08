import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize database
db = SQLAlchemy()

def create_app(test_config=None):
    # Create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    
    # Enable CORS
    CORS(app)
    
    # Configure the app
    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app.config.from_mapping(
            SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
            SQLALCHEMY_DATABASE_URI=os.environ.get(
                'DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/iclood'
            ),
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            UPLOAD_FOLDER=os.environ.get('UPLOAD_FOLDER', '/mnt/external_drive/iclood_backups'),
            MAX_CONTENT_LENGTH=1000 * 1024 * 1024,  # 1000MB max-limit for uploads
        )
    else:
        # Load the test config if passed in
        app.config.from_mapping(test_config)

    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # Initialize app with database
    db.init_app(app)
    
    # Register blueprints
    from .routes import main_bp, photos_bp, storage_bp, backup_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(photos_bp)
    app.register_blueprint(storage_bp)
    app.register_blueprint(backup_bp)
    
    # Create tables in the database
    with app.app_context():
        db.create_all()
    
    return app 