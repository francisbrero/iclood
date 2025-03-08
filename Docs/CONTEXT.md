# iClood Context

## Overview

iClood is designed to provide a local, privacy-focused alternative to cloud-based photo backup services. It leverages iOS Shortcuts for seamless integration with iPhones and a Raspberry Pi server for local storage and management.

## Key Features

- **Local Backup:** Photos are stored on a Raspberry Pi within your home network.
- **Privacy-First:** No data leaves your local network.
- **iOS Shortcuts Integration:** Automate backups using Apple's Shortcuts app.
- **Web Dashboard:** Monitor and manage backups via a web interface.
- **Optional Database:** Use SQLAlchemy for advanced media management.

## Use Cases

- **Home Users:** Keep personal photos secure and private.
- **Tech Enthusiasts:** Customize and extend the system with additional features.
- **Developers:** Use as a base for building custom backup solutions.

## Light Version

The light version of iClood skips the database setup, storing files directly in the `storage/backups/` directory. This simplifies the setup and reduces resource usage, making it ideal for users who don't need advanced media management features.

## User Experience (UX) Flow

### 1. Initial Setup

- **Goal:** Connect the user to local storage and configure backup preferences.
- **Steps:**
  1. Download and open the iClood app on the iPhone.
  2. The app scans for the Raspberry Pi running iClood on the local network.
     - If found, prompt the user to authenticate and pair.
     - If not, guide the user to manually enter the Raspberry Pi's IP address.
  3. Perform secure pairing using a QR code (displayed on the Pi's web dashboard) or manual authentication with a pairing code.
  4. Select backup preferences:
     - Frequency: Weekly (default), daily, or manual.
     - Photo selection: All photos or only new photos since the last backup.
     - Storage: Option to automatically delete local copies after backup.
  5. Completion: The app confirms that backups will start automatically when connected to the home Wi-Fi.

### 2. Automatic Backup Process

- **Goal:** Provide a seamless, non-intrusive backup experience.
- **Flow:**
  - The app detects the Raspberry Pi upon connecting to the home Wi-Fi.
  - If due, it starts transferring new or modified photos/videos.
  - A progress UI (status banner) informs the user of the ongoing backup.
  - System notifications indicate backup completion or issues.
  - Low battery (e.g., below 20%) delays the backup.

### 3. Viewing & Restoring Photos

- **Goal:** Enable easy browsing and restoration of backed-up media.
- **Flow:**
  - Users browse backed-up photos/videos via the app or web dashboard.
  - Options to search and filter by date, file type, or album.
  - Support for single or batch restore, with media preview before restoration.

### 4. Web Dashboard

- **Goal:** Provide an alternative interface for managing backups and storage.
- **Features:**
  - Accessible via http://iclood.local.
  - Manage backup history and storage space.
  - Manually browse, delete, or manage files.

### 5. Error Handling & Troubleshooting

- **Goal:** Offer clear solutions when issues arise.
- **Scenarios:**
  - **Pi Not Found:** Guide to check the connection or manually enter the IP.
  - **Storage Full:** Notify the user with cleanup options.
  - **Network Issues:** Automatically retry the backup when connection is restored.
  - **Backup Failure:** Display specific errors (e.g., permissions, low battery) and suggest fixes.

## Technical Architecture

1. **Mobile App (iPhone)**
   - **Tech:** Swift with SwiftUI
   - **Responsibilities:**
     - Detect home Wi-Fi and connect to the Raspberry Pi.
     - Authenticate users and initiate secure, incremental backups.
     - Provide UI for settings and restoration.

2. **Raspberry Pi File Server**
   - **Tech:** Python Flask
   - **Responsibilities:**
     - Host a secure API for photo/video uploads.
     - Store files on an external hard drive.
     - Manage authentication and token-based access.
     - Serve a lightweight web UI for monitoring and management.

3. **Web Dashboard**
   - **Tech:** Lightweight HTML + JavaScript
   - **Responsibilities:**
     - Display backup history and storage status.
     - Enable browsing and basic file management (e.g., delete, rename).

4. **Backup Process**
   - **Trigger:** Initiated when the iPhone app detects the home Wi-Fi.
   - **Protocol:** Secure HTTP API Flask with TLS/SSL.
   - **Type:** Incremental backup (only new/modified media).
   - **Security:** Data is encrypted in transit without encryption at rest.

## Target Audience

- **Privacy-Conscious Users:** Desire full control over their data without cloud dependencies.
- **Photography Enthusiasts:** Require reliable offline backups for large media libraries.
- **Tech-Savvy DIY Users:** Comfortable setting up and configuring a Raspberry Pi with local storage.

## Open-Source & Community-Driven

- **Fully Open-Source:** Built and maintained by the community.
- **No Subscriptions:** Free to use, modify, and contribute.
- **Extensible:** Customizable backup schedules, security settings, and UI features.

## Why iClood?

- **100% Local & Private:** Keeps your data within your home.
- **Free & Open-Source:** No recurring costs or hidden fees.
- **Fully Automated:** Set it up once, and backups run seamlessly in the background.
- **Expandable:** Easily add more storage by integrating additional hard drives.

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register      # Register new device
POST   /api/v1/auth/login         # Authenticate device
DELETE /api/v1/auth/logout        # Logout device
```

### Backup Operations
```
GET    /api/v1/backup/status          # Get backup status
POST   /api/v1/backup/start           # Start backup session
POST   /api/v1/backup/stop            # Stop current backup
GET    /api/v1/backup/history         # Get backup history
```

### Media Management
```
POST   /api/v1/media/upload           # Upload media file
GET    /api/v1/media/list             # List backed up media
GET    /api/v1/media/{id}             # Get specific media
DELETE /api/v1/media/{id}             # Delete media
POST   /api/v1/media/batch/restore    # Restore multiple files
```

### System Operations
```
GET    /api/v1/system/status          # Get system status
GET    /api/v1/system/storage         # Get storage info
POST   /api/v1/system/cleanup         # Trigger storage cleanup
```

### Response Format
```json
{
    "status": "success|error",
    "data": {},
    "message": "Operation successful",
    "timestamp": "2024-03-21T10:00:00Z"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    device_id VARCHAR(255) UNIQUE NOT NULL,
    device_name VARCHAR(255),
    last_backup TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Media Table 
```sql
CREATE TABLE media (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    file_size BIGINT NOT NULL,
    media_type VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL,
    backed_up_date TIMESTAMP NOT NULL,
    metadata JSONB,
    UNIQUE(user_id, file_hash)
);
```

### Backup Sessions Table
```sql
CREATE TABLE backup_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    files_processed INTEGER DEFAULT 0,
    total_size BIGINT DEFAULT 0,
    error_message TEXT
);
``` 