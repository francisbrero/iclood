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
1. Set up the backend on your Raspberry Pi
2. Install the frontend app on your iPhone
3. Configure the app with your server's IP address and port
4. Start backing up your photos and videos
