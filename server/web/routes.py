from flask import Blueprint, render_template, jsonify
from database.models import User, BackupSession, Media
import os
import psutil

dashboard = Blueprint('dashboard', __name__)

@dashboard.route('/')
def index():
    return render_template('dashboard/index.html')

@dashboard.route('/devices')
def devices():
    devices = User.query.all()
    return render_template('dashboard/devices.html', devices=devices)

@dashboard.route('/storage')
def storage():
    return render_template('dashboard/storage.html')

@dashboard.route('/api/v1/system/status')
def system_status():
    disk = psutil.disk_usage(os.getenv('UPLOAD_FOLDER', 'storage/backups'))
    active_devices = User.query.filter(User.last_backup != None).count()
    
    return jsonify({
        "status": "success",
        "data": {
            "status": "Operational",
            "active_devices": active_devices,
            "storage": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent
            }
        }
    })

@dashboard.route('/api/v1/backup/recent')
def recent_backups():
    backups = BackupSession.query.order_by(
        BackupSession.start_time.desc()
    ).limit(10).all()
    
    return jsonify({
        "status": "success",
        "data": {
            "backups": [{
                "id": b.id,
                "device_name": b.user.device_name,
                "status": b.status,
                "files_processed": b.files_processed,
                "total_size": b.total_size,
                "start_time": b.start_time.isoformat(),
                "end_time": b.end_time.isoformat() if b.end_time else None
            } for b in backups]
        }
    }) 