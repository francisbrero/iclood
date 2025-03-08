from flask import Blueprint, request, jsonify, send_file, current_app
import os
from werkzeug.utils import secure_filename

media_bp = Blueprint('media', __name__)

# Define the directory to store uploaded files
UPLOAD_DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../storage/backups')

# Ensure the directory exists
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@media_bp.route('/upload', methods=['POST'])
def upload_media():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_DIRECTORY, filename)
            file.save(file_path)
            return jsonify({'message': f'File {filename} uploaded successfully'}), 200
    except Exception as e:
        current_app.logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': 'Upload failed', 'details': str(e)}), 500

@media_bp.route('/list', methods=['GET'])
def list_media():
    """List all files in the backup directory."""
    files = os.listdir(UPLOAD_DIRECTORY)
    return jsonify({'files': files}), 200

@media_bp.route('/download/<filename>', methods=['GET'])
def download_media(filename):
    """Download a specific file."""
    file_path = os.path.join(UPLOAD_DIRECTORY, secure_filename(filename))
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return jsonify({'error': 'File not found'}), 404 