# iClood

A local-only iCloud alternative for photo and video backups, designed for personal use between devices on a home Wi-Fi network.

## Overview
**iClood** automatically backs up media from an iPhone to a Raspberry Pi via a Flask backend when connected to the home Wi-Fi network.

## Tech Stack
- **iPhone App**: Expo (React Native) with Tailwind for styling
- **Backend**: Python (Flask API) running on a Raspberry Pi
- **Database**: PostgreSQL (for tracking backups)
- **Storage**: External HDD connected to the Raspberry Pi

## Project Structure
- `/backend`: Flask API for handling media uploads and storage management
- `/frontend`: React Native app for iOS devices

## Setup Instructions

### Backend Setup
1. Set up Python and PostgreSQL on your Raspberry Pi
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv postgresql postgresql-contrib
   ```

2. Clone the repository and navigate to the backend directory
   ```bash
   git clone https://github.com/yourusername/iclood.git
   cd iclood/backend
   ```

3. Create and activate a virtual environment
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

5. Create a PostgreSQL database
   ```bash
   sudo -u postgres psql
   postgres=# CREATE DATABASE iclood;
   postgres=# CREATE USER iclooduser WITH PASSWORD 'yourpassword';
   postgres=# GRANT ALL PRIVILEGES ON DATABASE iclood TO iclooduser;
   postgres=# \q
   ```

6. Copy the example environment file and update it with your database credentials
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and storage path
   ```

7. Run the Flask application
   ```bash
   python run.py
   ```

### Frontend Setup with Expo

1. Install Node.js and npm (if not already installed)
   ```bash
   # On macOS with Homebrew
   brew install node
   
   # On Windows
   # Download from https://nodejs.org/
   ```

2. Install Expo CLI globally
   ```bash
   npm install -g expo-cli
   ```

3. Navigate to the frontend directory and install dependencies
   ```bash
   cd iclood/frontend
   npm install
   ```

4. Start the Expo development server
   ```bash
   npm start
   # or
   expo start
   ```

5. Run on iOS
   - Install the Expo Go app on your iPhone from the App Store
   - Scan the QR code displayed in the terminal with your iPhone camera
   - Make sure your iPhone is on the same Wi-Fi network as your development machine

6. Configure the app
   - Once the app is running, go to the Settings tab
   - Tap "Configure Server" and enter the IP address of your Raspberry Pi
   - The default port is 8080 unless you changed it in your backend configuration

## Development

### Running Tests
```bash
# Backend tests
cd backend
source venv/bin/activate
python -m pytest tests/

# Frontend tests (if implemented)
cd frontend
npm test
```

### Building for Production
For deploying the frontend as a standalone app:
```bash
cd frontend
expo build:ios
# Follow the prompts to build your app
```

## Troubleshooting
- If you can't connect to the server, make sure your iPhone and Raspberry Pi are on the same Wi-Fi network
- Check that the Flask server is running and accessible from other devices on your network
- Verify that your Raspberry Pi's firewall allows connections on the port you're using (default: 8080)

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
