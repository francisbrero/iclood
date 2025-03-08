import os
import shutil
import datetime
from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
from .models import Backup, IgnoredFile
from . import db

# Blueprint for main routes
main_bp = Blueprint('main', __name__)

@main_bp.route('/ping', methods=['GET'])
def ping():
    """Endpoint to check if the server is reachable"""
    return jsonify({
        'status': 'success',
        'message': 'iClood server is online'
    }), 200

# Blueprint for photo-related routes
photos_bp = Blueprint('photos', __name__, url_prefix='/photos')

@photos_bp.route('/new', methods=['POST'])
def get_new_photos():
    """Returns list of new photos/videos to back up"""
    data = request.json
    
    if not data or 'files' not in data:
        return jsonify({
            'status': 'error',
            'message': 'No file data provided'
        }), 400
    
    device_id = data.get('device_id', 'unknown')
    
    # Get list of files already backed up or ignored
    backed_up_files = db.session.query(Backup.original_path).filter_by(
        device_id=device_id,
        status='Completed'
    ).all()
    backed_up_paths = [file[0] for file in backed_up_files]
    
    ignored_files = db.session.query(IgnoredFile.original_path).filter_by(
        device_id=device_id
    ).all()
    ignored_paths = [file[0] for file in ignored_files]
    
    # Filter out files that have already been backed up or ignored
    new_files = [
        file for file in data['files']
        if file['path'] not in backed_up_paths and file['path'] not in ignored_paths
    ]
    
    return jsonify({
        'status': 'success',
        'new_files': new_files,
        'count': len(new_files)
    }), 200

@photos_bp.route('/upload', methods=['POST'])
def upload_photo():
    """Uploads selected files"""
    if 'file' not in request.files:
        return jsonify({
            'status': 'error',
            'message': 'No file part'
        }), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({
            'status': 'error',
            'message': 'No selected file'
        }), 400
    
    original_path = request.form.get('original_path', '')
    file_type = request.form.get('file_type', 'photo')
    device_id = request.form.get('device_id', 'unknown')
    
    # Ensure the filename is secure
    filename = secure_filename(file.filename)
    
    # Create year/month folder structure
    today = datetime.datetime.now()
    year_month = f"{today.year}/{today.month:02d}"
    folder_path = os.path.join(current_app.config['UPLOAD_FOLDER'], year_month)
    
    # Create directory if it doesn't exist
    os.makedirs(folder_path, exist_ok=True)
    
    # Full path to save the file
    file_path = os.path.join(folder_path, filename)
    relative_path = os.path.join(year_month, filename)
    
    try:
        # Check if a backup record already exists
        existing_backup = Backup.query.filter_by(
            original_path=original_path,
            device_id=device_id
        ).first()
        
        if existing_backup and existing_backup.status == 'Completed':
            return jsonify({
                'status': 'success',
                'message': 'File already backed up',
                'backup': existing_backup.to_dict()
            }), 200
        
        # Save the file
        file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Create or update backup record
        if existing_backup:
            existing_backup.file_path = relative_path
            existing_backup.file_size = file_size
            existing_backup.status = 'Completed'
            existing_backup.timestamp = datetime.datetime.utcnow()
            backup = existing_backup
        else:
            backup = Backup(
                file_name=filename,
                file_path=relative_path,
                original_path=original_path,
                file_size=file_size,
                file_type=file_type,
                mime_type=file.content_type,
                device_id=device_id,
                status='Completed'
            )
            db.session.add(backup)
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'File uploaded successfully',
            'backup': backup.to_dict()
        }), 201
        
    except Exception as e:
        # Log the failed backup
        if 'backup' in locals() and backup.id:
            backup.status = 'Failed'
            db.session.commit()
        
        return jsonify({
            'status': 'error',
            'message': f'Failed to upload file: {str(e)}'
        }), 500

@photos_bp.route('/ignore', methods=['POST'])
def ignore_file():
    """Mark files to be ignored for future backups"""
    data = request.json
    
    if not data or 'files' not in data or not data['files']:
        return jsonify({
            'status': 'error',
            'message': 'No files provided to ignore'
        }), 400
    
    device_id = data.get('device_id', 'unknown')
    
    try:
        ignored_count = 0
        for file_data in data['files']:
            # Check if already ignored
            existing = IgnoredFile.query.filter_by(
                original_path=file_data['path'],
                device_id=device_id
            ).first()
            
            if not existing:
                ignored_file = IgnoredFile(
                    file_name=os.path.basename(file_data['path']),
                    original_path=file_data['path'],
                    device_id=device_id
                )
                db.session.add(ignored_file)
                ignored_count += 1
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': f'{ignored_count} files marked as ignored',
            'ignored_count': ignored_count
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to ignore files: {str(e)}'
        }), 500

# Blueprint for storage related routes
storage_bp = Blueprint('storage', __name__, url_prefix='/storage')

@storage_bp.route('/status', methods=['GET'])
def get_storage_status():
    """Returns storage usage & available space"""
    upload_folder = current_app.config['UPLOAD_FOLDER']
    
    try:
        total, used, free = shutil.disk_usage(upload_folder)
        
        # Get total size of backed up files
        total_backed_up = db.session.query(db.func.sum(Backup.file_size)).filter_by(
            status='Completed'
        ).scalar() or 0
        
        # Get backup count by type
        photo_count = db.session.query(db.func.count(Backup.id)).filter_by(
            status='Completed',
            file_type='photo'
        ).scalar() or 0
        
        video_count = db.session.query(db.func.count(Backup.id)).filter_by(
            status='Completed',
            file_type='video'
        ).scalar() or 0
        
        # Get last backup timestamp
        last_backup = db.session.query(db.func.max(Backup.timestamp)).filter_by(
            status='Completed'
        ).scalar()
        
        return jsonify({
            'status': 'success',
            'storage': {
                'total_bytes': total,
                'used_bytes': used,
                'free_bytes': free,
                'total_human': format_size(total),
                'used_human': format_size(used),
                'free_human': format_size(free),
                'usage_percent': round((used / total) * 100, 2)
            },
            'backups': {
                'total_size_bytes': total_backed_up,
                'total_size_human': format_size(total_backed_up),
                'photo_count': photo_count,
                'video_count': video_count,
                'total_count': photo_count + video_count,
                'last_backup': last_backup.isoformat() if last_backup else None
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get storage status: {str(e)}'
        }), 500

# Blueprint for backup related routes
backup_bp = Blueprint('backup', __name__, url_prefix='/backup')

@backup_bp.route('/log', methods=['GET'])
def get_backup_logs():
    """Returns logs of backed up files"""
    limit = request.args.get('limit', 100, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    try:
        backups = Backup.query.order_by(Backup.timestamp.desc()).limit(limit).offset(offset).all()
        
        return jsonify({
            'status': 'success',
            'backups': [backup.to_dict() for backup in backups],
            'count': len(backups)
        }), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to get backup logs: {str(e)}'
        }), 500

# Helper function for formatting file sizes
def format_size(size_bytes):
    """Format bytes to human readable string"""
    if size_bytes == 0:
        return "0B"
    
    size_names = ("B", "KB", "MB", "GB", "TB", "PB")
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024
        i += 1
    
    return f"{size_bytes:.2f}{size_names[i]}" 