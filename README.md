# iClood

iClood is an open-source, privacy-first alternative to iCloud for automatic photo and video backup. It enables iPhone users to securely back up their media files to a locally hosted hard drive running on a Raspberry Pi within their home network.

## Features

- 🌐 Automatic Local Backup
- 🔒 100% Private - All data stays on your network
- ⚡ Smart & Efficient - Incremental backups
- 📱 iOS Shortcuts Integration
- 🎯 Web Dashboard for Monitoring
- 💾 Expandable Storage

## System Requirements

### Server (Raspberry Pi)
- Raspberry Pi 3 or newer
- Python 3.9+
- External hard drive
- Network connectivity

### iOS Device
- iOS 15.0 or later
- Shortcuts app installed
- Connected to the same network as the Raspberry Pi

## Local Development Setup

### 1. Server Setup

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
cd server
pip install -r requirements.txt

# Set up environment variables (optional)
cp .env.example .env  # Copy example env file
# Edit .env with your settings if needed

# Create required directories
mkdir -p storage/backups  # For storing uploaded files
chmod 755 storage/backups  # Set proper permissions

# Run with default settings (port 5001)
python server.py run

# Or specify a different port
python server.py run --host=localhost --port=5001
```

The server will be available at `http://localhost:5001`

### 2. iOS Shortcuts Setup

1. Create the Shortcut:
```
1. Open the Shortcuts App
Open the Shortcuts app on your iPhone.
Tap "+" to create a new shortcut.
Name it "iClood Backup".

2. Add Shortcut Actions

🔍 Action 1: Detect Wi-Fi Connection
Tap "Add Action".
Search for "Get Network Details" and select it.
Set it to "Current Network".

📷 Action 2: Select Photos for Backup
Tap "Add Action".
Search for "Select Photos" and add it.
Toggle "Select Multiple" to ON.

🔗 Action 3: Upload Photos to Flask Server
Tap "Add Action".
Search for "Repeat with Each" (for handling multiple photos).
Inside the repeat block:
Add "Get Contents of URL" action:
URL: http://192.168.1.100:5000/upload (replace with your Pi's IP)
Method: POST
Request Body: Form
Add a form field:
Key: file
Value: Repeat Item

Add "Show Result" to confirm the upload response.

✅ Action 4: Show Completion Notification
Add a "Show Notification" action after the loop.
Set the text to: "Backup completed successfully!"

3. Enable Automation
In the Shortcuts app, go to Automation → Create Personal Automation.
Choose Wi-Fi → Select your home network.
Add an action: Run Shortcut → Select "iClood Backup".
```

2. Configure the Shortcut:
- Open the Shortcuts app
- Find the iClood shortcut
- Tap ⋯ (three dots) to edit
- In the Dictionary action, update "server_url" with your Raspberry Pi's IP
- Set up automation triggers:
  - Go to Automation tab
  - Tap + to create new automation
  - Choose "When joining Wi-Fi"
  - Select your home network
  - Choose the iClood shortcut

3. Test the Shortcut:
- Take a new photo
- Run the shortcut manually first to verify it works
- Check the web dashboard to confirm the upload
- Then enable the Wi-Fi automation

Note: Replace [YOUR_SERVER_IP] with your Raspberry Pi's local IP address
(e.g., "http://192.168.1.100:5001")

### Required Permissions

The iOS shortcut requires these permissions:
- Photo Library: To access and backup photos
- Local Network: To communicate with your backup server

These permissions will be requested when you first run the shortcut.

### Development Tips

1. Testing the Shortcut:
```bash
# Test the API endpoint
curl -X POST http://localhost:5001/api/v1/media/upload \
  -F "file=@test.jpg" \
  -F "device_id=test"
```

2. Network Debugging:
- Use Charles Proxy or Proxyman to inspect API calls
- Check Shortcuts app's run history

3. Common Issues:
- If automation isn't triggering, check Wi-Fi settings
- For network errors, verify Raspberry Pi is on the same network
- Photo access issues: re-authorize the shortcut

### 3. Web Dashboard

The web dashboard is available at `http://localhost:5001/dashboard` after starting the server.

## Testing

### Server Tests

```bash
cd server

# Run all tests
pytest

# Run specific test categories
pytest tests/test_auth.py
pytest tests/test_backup.py
pytest tests/test_media.py
```

### iOS Tests

In Xcode:
1. Select the test navigator
2. Click the play button or use ⌘U to run tests

## API Documentation

### Authentication
```bash
# Register device
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test","device_name":"iPhone"}'

# Verify device
curl -X POST http://localhost:5000/api/v1/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test"}'
```

### Backup Operations
```bash
# Start backup
curl -X POST http://localhost:5000/api/v1/backup/start \
  -H "Content-Type: application/json" \
  -d '{"device_id":"test"}'

# Get backup status
curl http://localhost:5000/api/v1/backup/status/[session_id]
```

### Media Management
```bash
# List media
curl http://localhost:5000/api/v1/media/list?device_id=test

# Get specific media
curl http://localhost:5000/api/v1/media/[media_id]
```

## Project Structure

```
iclood/
├── shortcuts/              # iOS Shortcuts
│   ├── iClood.shortcut    # Shortcut file
│   └── README.md          # Shortcut documentation
├── server/                  # Python Flask Server
│   ├── api/                # API endpoints
│   ├── database/           # Database models
│   ├── web/                # Web dashboard
│   └── tests/              # Server tests
└── docs/                   # Documentation
```

## Common Issues & Solutions

### Server
1. **Database Errors**
   ```bash
   flask db stamp head  # Reset migrations
   flask db migrate    # Create new migration
   flask db upgrade   # Apply migration
   ```

2. **Permission Issues**
   ```bash
   # Fix storage permissions
   sudo chown -R pi:pi /path/to/storage
   sudo chmod -R 755 /path/to/storage
   ```

### iOS App
1. **Build Errors**
   - Clean build folder (⇧⌘K)
   - Clean build cache (⌥⌘K)
   - Delete derived data

2. **Network Errors**
   - Ensure correct server URL in `APIService.swift`
   - Check "Local Network" permissions
   - Verify server is accessible from device

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
