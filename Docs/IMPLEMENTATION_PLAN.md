# iClood Implementation Plan

## Overview

This document details the implementation plan for iClood, covering the iOS Shortcuts integration, Raspberry Pi server, web dashboard, API endpoints, and optional database integration.

## Project Structure

```
iclood/
├── shortcuts/              # iOS Shortcuts
│   ├── iClood.shortcut    # Shortcut file
│   └── README.md          # Shortcut documentation
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   └── routes.py    # Authentication endpoints
│   │   ├── backup/
│   │   │   └── routes.py    # Backup endpoints
│   │   └── media/
│   │       └── routes.py    # Media management endpoints
│   ├── core/                # Core business logic modules
│   ├── database/            # SQLAlchemy models for the database (optional)
│   ├── services/            # Business service modules
│   ├── utils/               # Utility functions
│   ├── web/                 # Web dashboard resources
│   │   ├── static/          # Static assets (CSS, JS, images)
│   │   └── templates/       # HTML templates
│   └── main.py              # Entry point for the Flask server
├── docs/
│   ├── CONTEXT.md
│   ├── SETUP.md
│   ├── API.md
│   └── IMPLEMENTATION_PLAN.md    // This file
├── scripts/
│   ├── install.sh           // Setup script for the server
│   └── backup.sh            // Backup automation script
└── storage/
    ├── backups/           // Media backups (organized by user/date)
    └── temp/              // Temporary storage
```

## Implementation Phases

### Phase 1: Repository Setup
- Create the folders and files as shown above.
- Populate the documentation files (`CONTEXT.md`, `SETUP.md`, `API.md`, `IMPLEMENTATION_PLAN.md`).

### Phase 2: iOS Shortcuts Integration
- **Technology:** iOS Shortcuts
- Create a shortcut to automate photo backups:
  - Detect Wi-Fi connection
  - Select photos for backup
  - Upload photos to the Flask server
  - Notify user upon completion

### Phase 3: Raspberry Pi Server Development
- **Language:** Python with Flask.
- Create the entry point (`server/main.py`) to initialize the Flask app.
- Develop API endpoints:
  - Authentication in `server/api/auth/routes.py`
  - Backup operations in `server/api/backup/routes.py`
  - Media management in `server/api/media/routes.py`
- Set up optional database integration using SQLAlchemy. Define models in `server/database/models.py`.

### Phase 4: Web Dashboard
- Build the web dashboard using Flask templates (in `server/web/templates/`) and static assets (in `server/web/static/`).

### Phase 5: Scripts & Utilities
- Create utility scripts (`scripts/install.sh` and `scripts/backup.sh`) to assist with installation and backup management.

### Phase 6: Documentation & Testing
- Update documentation in all files under the `docs/` folder.
- Create test suites in `server/tests/`.

## Light Version

For a "light" version without a database:
- Store files directly in the `storage/backups/` directory.
- Use file metadata for organization.
- Skip database setup and related API endpoints. 