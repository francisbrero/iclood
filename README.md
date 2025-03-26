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
   git clone https://github.com/francisbrero/iclood.git
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
   # Run on default port 8080
   python run.py

   # Or specify a custom port
   python run.py -p 8081
   ```
   The server will be accessible at `http://<your-ip>:8080` (or your specified port)

#### Production Setup (Raspberry Pi)

Start by following the instructions in the [RASPI.md](RASPI.md) file.

1. Set up Python and PostgreSQL on your Raspberry Pi
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv postgresql postgresql-contrib
   ```

2. Follow steps 1-3 from the Local Development section

3. Create a PostgreSQL database

Give read & execute permissions to 'others' for the directory path
   ```bash
   sudo chmod o+rx /home/admin
   sudo chmod o+rx /home/admin/iclood
   sudo chmod o+rx /home/admin/iclood/backend
   ```

Create the database and user
   ```bash
   sudo -u postgres psql
   ```

   ```sql 
   CREATE DATABASE iclood;
   CREATE USER iclooduser WITH PASSWORD 'iclood123';
   GRANT ALL PRIVILEGES ON DATABASE iclood TO iclooduser;
   
   ```

```sql
-- Connect to the iclood database
\c iclood

-- Grant privileges
GRANT ALL ON SCHEMA public TO iclooduser;
GRANT ALL ON ALL TABLES IN SCHEMA public TO iclooduser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO iclooduser;
```

Exit using `\q`

4. Copy and configure the environment file
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and storage path
   ```

5. Run the Flask application
   ```bash
   python run.py -p 8081
   ```
Note: if you use a different port, you will need to add a forward rule on the router.

### Frontend Setup with Expo

1. Install Node.js and npm (if not already installed)
   ```bash
   # On macOS with Homebrew
   brew install node
   
   # On linux (raspberry pi)
   sudo apt install nodejs npm
   ```

2. Navigate to the frontend directory and install dependencies
   ```bash
   cd iclood/frontend
   npm install
   ```

Note: if npm fails to install, try using yarn instead.

3. Start the Expo development server
   ```bash
   npx expo start
   ```

   If you want to run the app on a different device, you can use the tunnel feature.
   ```bash
   npx expo start --tunnel
   ```

4. Run on iOS
   - Install the Expo Go app on your iPhone from the App Store
   - Scan the QR code displayed in the terminal with your iPhone camera
   - Make sure your iPhone is on the same Wi-Fi network as your development machine

5. Configure the app
   - Once the app is running, go to the Settings tab
   - Tap "Configure Server" and enter your server's IP address:
     - For same network: use local IP (e.g., `192.168.1.100`)
     - For different network: use your public IP and set up port forwarding:
       1. Find your public IP at https://whatismyip.com
       2. Set up port forwarding on your router for port 8080 (or your custom port)
       3. Use `http://your.public.ip:8080`
       4. Consider using a dynamic DNS service if your public IP changes frequently
   - The default port is 8080 unless you changed it in your backend configuration
   - Test the connection by tapping "Test Connection" in the app

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

## Building for Production

Currently not available because of the cost of the Apple Developer account ($99/year).
Thank you Tim Cook!