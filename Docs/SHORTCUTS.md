# iClood Shortcuts Guide

## Overview

The iClood Shortcuts integration provides an easy way to automatically back up your photos to your local server when you connect to your home Wi-Fi network.

## Features

- Automatic backup on Wi-Fi connection
- Smart duplicate detection
- Progress notifications
- Album-based tracking
- Background operation

## Setup Instructions

### 1. Install the Shortcut

1. Open this link on your iPhone: [iClood Backup Shortcut](https://www.icloud.com/shortcuts/[shortcut_id])
2. Tap "Add Shortcut"
3. Allow requested permissions:
   - Photos access
   - Notifications
   - Network access

### 2. Configure the Shortcut

1. Open Shortcuts app
2. Find "iClood Backup"
3. Tap ⋯ (three dots)
4. Update the Dictionary action with your server's IP address
5. Tap Done

### 3. Set Up Automation

1. Go to Automation tab
2. Tap + to create new
3. Choose "When joining Wi-Fi"
4. Select your home network
5. Choose "iClood Backup" shortcut
6. Disable "Ask Before Running"

## How It Works

1. **Trigger**: Shortcut runs when connecting to specified Wi-Fi
2. **Photo Selection**: Finds photos not in "iClood Backup" album
3. **Upload**: Sends photos to your server
4. **Tracking**: Adds uploaded photos to album
5. **Notification**: Shows backup completion status

## Troubleshooting

### Common Issues

1. **Shortcut Won't Run**
   - Check Wi-Fi automation is enabled
   - Verify network permissions
   - Ensure Photos access is granted

2. **Upload Failures**
   - Verify server is running
   - Check server IP is correct
   - Confirm network connectivity

3. **Missing Photos**
   - Check album permissions
   - Verify photo library access
   - Clear "iClood Backup" album to force re-upload

### Testing

1. Manual Testing:
   ```bash
   # Test server connection
   curl -X GET http://[SERVER_IP]:5001/api/v1/shortcuts/status \
     -H "X-Device-ID: iPhone"
   ```

2. Shortcut Testing:
   - Run shortcut manually
   - Check web dashboard for status
   - Verify photos in backup album

## Advanced Usage

### Custom Triggers

Besides Wi-Fi connection, you can trigger the shortcut:
- At specific times
- When charging
- Manually via widget
- Through Share Sheet

### Customization

The shortcut can be modified to:
- Filter specific photos
- Change batch size
- Add custom notifications
- Modify album organization

## Security Considerations

- Shortcut runs only on trusted networks
- Server validates device identity
- Photos remain on local network
- No cloud services involved 