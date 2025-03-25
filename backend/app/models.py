from datetime import datetime, UTC
from . import db

class Backup(db.Model):
    """Model for tracking backed up files"""
    __tablename__ = 'backups'
    
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String, nullable=False)
    file_path = db.Column(db.String, nullable=False)
    original_path = db.Column(db.String, nullable=True)  # Original path on the iPhone
    file_size = db.Column(db.Integer, nullable=False)  # Size in bytes
    file_type = db.Column(db.String, nullable=False)  # 'photo' or 'video'
    mime_type = db.Column(db.String, nullable=True)
    device_id = db.Column(db.String, nullable=True)  # For multiple devices tracking
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(UTC))
    status = db.Column(db.String, nullable=False, default='Pending')  # 'Pending', 'Completed', 'Failed'
    
    def __repr__(self):
        return f'<Backup {self.file_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'mime_type': self.mime_type,
            'timestamp': self.timestamp.isoformat(),
            'status': self.status
        }

class IgnoredFile(db.Model):
    """Model for tracking files that the user has chosen to ignore"""
    __tablename__ = 'ignored_files'
    
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String, nullable=False)
    device_id = db.Column(db.String, nullable=True)
    original_path = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<IgnoredFile {self.file_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'file_name': self.file_name,
            'original_path': self.original_path,
            'timestamp': self.timestamp.isoformat()
        } 