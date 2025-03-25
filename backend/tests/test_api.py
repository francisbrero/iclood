import os
import pytest
import tempfile
import shutil
from datetime import datetime, UTC
from app import create_app, db
from app.models import Backup, IgnoredFile

# Import fixtures directly since they're now the default ones
from conftest import app, client

@pytest.fixture
def runner(app):
    """CLI test runner"""
    return app.test_cli_runner()

def test_ping(client):
    """Test server ping endpoint"""
    response = client.get('/ping')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'success'
    assert json_data['message'] == 'iClood server is online'

@pytest.mark.db
def test_storage_status_empty(client):
    """Test storage status with no backups"""
    response = client.get('/storage/status')
    assert response.status_code == 200
    json_data = response.get_json()
    
    assert json_data['status'] == 'success'
    assert json_data['storage']['used_bytes'] >= 0
    assert json_data['storage']['total_bytes'] > 0
    assert json_data['storage']['free_bytes'] > 0
    assert json_data['backups']['total_count'] == 0
    assert json_data['backups']['photo_count'] == 0
    assert json_data['backups']['video_count'] == 0

@pytest.mark.db
def test_new_photos_empty(client):
    """Test new photos endpoint with no files"""
    response = client.post('/photos/new', json={
        'device_id': 'test_device',
        'files': []
    })
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'success'
    assert json_data['count'] == 0
    assert len(json_data['new_files']) == 0

@pytest.mark.db
def test_new_photos_with_files(client, app):
    """Test new photos endpoint with files"""
    # Add some backed up files to the database
    with app.app_context():
        backup = Backup(
            file_name='test.jpg',
            file_path='2024/03/test.jpg',
            original_path='/path/to/test.jpg',
            file_size=1024,
            file_type='photo',
            mime_type='image/jpeg',
            device_id='test_device',
            status='Completed'
        )
        db.session.add(backup)
        db.session.commit()
    
    # Test with mix of new and backed up files
    response = client.post('/photos/new', json={
        'device_id': 'test_device',
        'files': [
            {
                'id': '1',
                'path': '/path/to/test.jpg',
                'name': 'test.jpg',
                'size': 1024,
                'type': 'photo'
            },
            {
                'id': '2',
                'path': '/path/to/new.jpg',
                'name': 'new.jpg',
                'size': 1024,
                'type': 'photo'
            }
        ]
    })
    
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'success'
    assert json_data['count'] == 1  # Only the new file
    assert len(json_data['new_files']) == 1
    assert json_data['new_files'][0]['path'] == '/path/to/new.jpg'

@pytest.mark.db
def test_backup_history_empty(client):
    """Test backup history with no backups"""
    response = client.get('/backup/history')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'success'
    assert len(json_data['history']) == 0

@pytest.mark.db
def test_backup_history_with_backups(client, app):
    """Test backup history with some backups"""
    # Add some test backups
    with app.app_context():
        backups = [
            Backup(
                file_name=f'test{i}.jpg',
                file_path=f'2024/03/test{i}.jpg',
                original_path=f'/path/to/test{i}.jpg',
                file_size=1024,
                file_type='photo',
                mime_type='image/jpeg',
                device_id='test_device',
                status='Completed',
                timestamp=datetime.now(UTC)
            )
            for i in range(3)
        ]
        db.session.add_all(backups)
        db.session.commit()
    
    response = client.get('/backup/history')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'success'
    assert len(json_data['history']) == 3
    
    # Verify backup details
    first_backup = json_data['history'][0]
    assert 'id' in first_backup
    assert 'file_name' in first_backup
    assert 'file_type' in first_backup
    assert 'file_size' in first_backup
    assert 'device_id' in first_backup
    assert 'timestamp' in first_backup
    assert first_backup['status'] == 'Completed'

@pytest.mark.db
def test_ignore_files(client):
    """Test ignoring files"""
    response = client.post('/photos/ignore', json={
        'device_id': 'test_device',
        'files': [
            {
                'id': '1',
                'path': '/path/to/ignore.jpg',
                'name': 'ignore.jpg'
            }
        ]
    })
    
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'success'
    assert json_data['ignored_count'] == 1

@pytest.mark.db
def test_upload_photo(client, app):
    """Test photo upload"""
    # Create a temporary test file
    with tempfile.NamedTemporaryFile(suffix='.jpg') as tmp_file:
        tmp_file.write(b'test image content')
        tmp_file.seek(0)
        
        # Test file upload
        response = client.post(
            '/photos/upload',
            data={
                'file': (tmp_file, 'test.jpg'),
                'original_path': '/path/to/test.jpg',
                'file_type': 'photo',
                'device_id': 'test_device'
            },
            content_type='multipart/form-data'
        )
        
        assert response.status_code == 201
        json_data = response.get_json()
        assert json_data['status'] == 'success'
        assert 'backup' in json_data
        
        # Verify the backup was created in the database
        with app.app_context():
            backup = Backup.query.filter_by(file_name='test.jpg').first()
            assert backup is not None
            assert backup.status == 'Completed'
            assert backup.file_type == 'photo'
            assert backup.device_id == 'test_device'

def test_error_handling(client):
    """Test error handling for various scenarios"""
    # Test missing files in new photos request
    response = client.post('/photos/new', json={})
    assert response.status_code == 400
    
    # Test missing file in upload request
    response = client.post('/photos/upload')
    assert response.status_code == 400
    
    # Test empty file in ignore request
    response = client.post('/photos/ignore', json={
        'device_id': 'test_device',
        'files': []
    })
    assert response.status_code == 400

@pytest.mark.db
def test_storage_usage(client):
    """Test storage usage endpoint"""
    response = client.get('/storage/usage')
    assert response.status_code == 200
    json_data = response.get_json()
    
    assert json_data['status'] == 'success'
    assert 'used_bytes' in json_data
    assert 'total_bytes' in json_data
    assert 'available_bytes' in json_data
    assert json_data['total_bytes'] > 0
    assert json_data['available_bytes'] >= 0
    assert json_data['used_bytes'] >= 0
    assert json_data['total_bytes'] >= json_data['used_bytes']

@pytest.mark.db
def test_backup_state_persistence(client, app):
    """Test that backed up images are properly tracked in the database and not shown after reload"""
    # Create a temporary test file
    with tempfile.NamedTemporaryFile(suffix='.jpg') as tmp_file:
        tmp_file.write(b'test image content')
        tmp_file.seek(0)
        
        print("\nDebug: Starting file upload...")
        # First, simulate uploading a photo
        response = client.post(
            '/photos/upload',
            data={
                'file': (tmp_file, 'test.jpg'),
                'original_path': '/path/to/test.jpg',
                'file_type': 'photo',
                'device_id': 'test_device'
            },
            content_type='multipart/form-data'
        )
        
        print(f"Debug: Upload response status: {response.status_code}")
        print(f"Debug: Upload response data: {response.get_json()}")
        
        assert response.status_code == 201
        json_data = response.get_json()
        assert json_data['status'] == 'success'
        
        print("\nDebug: Checking if file is marked as backed up...")
        # Now check if the file is marked as backed up by sending it in the "new files" check
        response = client.post(
            '/photos/new',
            json={
                'device_id': 'test_device',
                'files': [{
                    'id': 'test_id',
                    'path': '/path/to/test.jpg',
                    'name': 'test.jpg',
                    'size': 100,
                    'type': 'photo',
                    'created': datetime.now(UTC).timestamp()
                }]
            }
        )
        
        print(f"Debug: New files check response status: {response.status_code}")
        print(f"Debug: New files check response data: {response.get_json()}")
        
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['status'] == 'success'
        # The file should not be in new_files since it's already backed up
        assert len(json_data['new_files']) == 0
        
        print("\nDebug: Verifying backup in database...")
        # Verify the backup exists in the database with Completed status
        with app.app_context():
            backup = Backup.query.filter_by(
                original_path='/path/to/test.jpg',
                device_id='test_device'
            ).first()
            print(f"Debug: Found backup in DB: {backup}")
            assert backup is not None
            assert backup.status == 'Completed'
            
            print("\nDebug: Checking storage status...")
            # Also verify through the storage status endpoint
            response = client.get('/storage/status')
            print(f"Debug: Storage status response status: {response.status_code}")
            print(f"Debug: Storage status response data: {response.get_json()}")
            
            assert response.status_code == 200
            json_data = response.get_json()
            assert json_data['status'] == 'success'
            assert json_data['backups']['total_count'] == 1
            assert json_data['backups']['photo_count'] == 1
            
        print("\nDebug: Test completed successfully")
