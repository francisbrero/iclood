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

#### Local Development (Mac)
1. Clone the repository and navigate to the backend directory
   ```bash
   git clone https://github.com/yourusername/iclood.git
   cd iclood/backend
   ```

2. Create and activate a virtual environment
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Install and set up PostgreSQL
   ```bash
   # Install PostgreSQL
   brew install postgresql@14

   # Remove existing data directory (if any) and initialize fresh
   rm -rf /usr/local/var/postgresql@14
   initdb /usr/local/var/postgresql@14

   # Start PostgreSQL service
   brew services start postgresql@14

   # Create database and user
   createdb iclood
   psql iclood -c "CREATE USER iclooduser WITH PASSWORD 'iclood123';"
   psql iclood -c "GRANT ALL PRIVILEGES ON DATABASE iclood TO iclooduser;"
   ```

5. Create local storage directory and copy the environment file
   ```bash
   # Create local storage directory
   mkdir -p ~/iclood_backups

   # Copy the example environment file
   cp .env.example .env
   ```
   Make sure your `.env` file has these configurations:
   ```
   # Database URL
   DATABASE_URL=postgresql://iclooduser:iclood123@localhost:5432/iclood
   
   # Local storage path (for development)
   UPLOAD_FOLDER=~/iclood_backups
   
   # Other settings
   SECRET_KEY=your_secret_key_here
   FLASK_APP=run.py
   FLASK_ENV=development
   MAX_FILE_SIZE=1000
   ```

6. Configure macOS Firewall
   The Flask server needs to be accessible from other devices on your network:
   1. Go to System Settings -> Network -> Firewall
   2. Click "Options..." or "Firewall Options..."
   3. Either:
      - Temporarily disable the firewall for development, OR
      - Add Python/Flask to the allowed apps list

7. Run the Flask application
   ```bash
   python run.py
   ```
   The server will be accessible at `http://<your-ip>:8080`

#### Production Setup (Raspberry Pi)
1. Set up Python and PostgreSQL on your Raspberry Pi
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv postgresql postgresql-contrib
   ```

2. Follow steps 1-3 from the Local Development section

3. Create a PostgreSQL database
   ```bash
   sudo -u postgres psql
   postgres=# CREATE DATABASE iclood;
   postgres=# CREATE USER iclooduser WITH PASSWORD 'yourpassword';
   postgres=# GRANT ALL PRIVILEGES ON DATABASE iclood TO iclooduser;
   postgres=# \q
   ```

4. Copy and configure the environment file
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and storage path
   ```

5. Run the Flask application
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
   - Tap "Configure Server" and enter your server's IP address
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
- If you can't connect to the server, make sure your iPhone and development machine are on the same Wi-Fi network
- Check that the Flask server is running and accessible from other devices on your network
- For macOS development: You may need to allow incoming connections through your firewall:
  1. Go to System Settings -> Network -> Firewall
  2. Click "Options..." or "Firewall Options..."
  3. Either temporarily disable the firewall or add Python/Flask to the allowed apps
- For production: verify that your Raspberry Pi's firewall allows connections on the port you're using (default: 8080)

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.