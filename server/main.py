from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)

    # Add these settings
    app.config.update(
        MAX_CONTENT_LENGTH=16 * 1024 * 1024,  # 16MB max file size
        UPLOAD_FOLDER=os.getenv('UPLOAD_FOLDER', 'storage/backups'),
    )

    # Configure CORS to allow requests from any origin
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
        }
    })

    # Register blueprints
    from api.media.routes import media_bp
    app.register_blueprint(media_bp, url_prefix='/api/v1/media')

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    return app 