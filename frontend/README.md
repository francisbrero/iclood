# iClood Frontend

The iClood frontend is a React Native (Expo) app for iOS devices. It allows users to back up their photos and videos to a local server running on their home network.

## Features

- Connect to a local server on your home Wi-Fi network
- View and select photos/videos to back up
- Track backup progress
- Monitor storage usage
- Configure backup settings

## Requirements

- Node.js 14 or later
- Expo CLI
- iOS device or simulator

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Scan the QR code with the Expo Go app on your iOS device, or press 'i' to open in an iOS simulator.

## Project Structure

- `/assets`: Images, fonts, and other static assets
- `/src/components`: Reusable UI components
- `/src/screens`: App screens
- `/src/context`: React Context providers
- `/src/utils`: Utility functions
- `/src/services`: API services

## Configuration

The app connects to a Flask backend running on a Raspberry Pi. You'll need to configure the server IP address and port in the app settings.

## Development

This project uses:
- TypeScript for type safety
- NativeWind (Tailwind CSS for React Native) for styling
- React Navigation for navigation
- Expo for development and building

## Building for Production

To create a production build:

```
expo build:ios
```

Follow the Expo documentation for detailed instructions on building and distributing the app. 