import os
import pytest
import tempfile
from app import create_app, db

@pytest.fixture
def client():
    # Create a temporary file to isolate the database for each test
    db_fd, db_path = tempfile.mkstemp()
    
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': f'sqlite:///{db_path}',
        'UPLOAD_FOLDER': tempfile.mkdtemp()
    })

    # Create the database and tables for testing
    with app.app_context():
        db.create_all()
    
    # Create test client
    with app.test_client() as client:
        yield client
    
    # Close and remove the temporary file
    os.close(db_fd)
    os.unlink(db_path)

def test_ping(client):
    """Test the ping endpoint to verify server is reachable"""
    response = client.get('/ping')
    assert response.status_code == 200
    assert response.json['status'] == 'success'
    assert 'iClood server is online' in response.json['message']

def test_storage_status(client):
    """Test storage status endpoint"""
    response = client.get('/storage/status')
    assert response.status_code == 200
    assert response.json['status'] == 'success'
    assert 'storage' in response.json
    assert 'backups' in response.json

def test_get_backup_logs_empty(client):
    """Test getting backup logs when there are none"""
    response = client.get('/backup/log')
    assert response.status_code == 200
    assert response.json['status'] == 'success'
    assert len(response.json['backups']) == 0
    assert response.json['count'] == 0 