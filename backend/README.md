# iClood Backend

The iClood backend is a Flask API designed to run on a Raspberry Pi. It handles photo and video uploads from the iPhone app and manages the storage and database.

## Features

- Receives and stores photos/videos from the iPhone app
- Organizes files by year/month
- Tracks which files have been backed up
- Provides storage usage information
- Manages ignored files

## Requirements

- Python 3.9 or later
- PostgreSQL database
- External hard drive for storage

## Installation

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and configure it:
   ```
   cp .env.example .env
   ```
5. Set up your PostgreSQL database and update the DATABASE_URL in `.env`
6. Mount your external drive and update the UPLOAD_FOLDER in `.env`

## Running the Server

For development:
```
python run.py
```

For production:
```
gunicorn run:app -b 0.0.0.0:8080
```

## API Endpoints

### Authentication
- No authentication required for local network use

### Ping
- `GET /ping`: Check if the server is online

### Photos
- `POST /photos/new`: Get list of new photos/videos to back up
- `POST /photos/upload`: Upload a photo/video file
- `POST /photos/ignore`: Ignore files for future backups

### Storage
- `GET /storage/status`: Get storage usage information

### Backup
- `GET /backup/log`: Get logs of backed up files

## Database Schema

### Backup Table
- id: Primary key
- file_name: Name of the file
- file_path: Path where the file is stored
- original_path: Original path on the iPhone
- file_size: Size in bytes
- file_type: 'photo' or 'video'
- mime_type: MIME type of the file
- device_id: Identifier for the device
- timestamp: When the file was backed up
- status: 'Pending', 'Completed', or 'Failed'

### IgnoredFile Table
- id: Primary key
- file_name: Name of the file
- original_path: Original path on the iPhone
- device_id: Identifier for the device
- timestamp: When the file was marked as ignored 