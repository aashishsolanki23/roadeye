# RoadEye Setup Guide

Complete setup instructions for the RoadEye mobile application.

## Quick Start

```bash
# Navigate to project directory
cd roadeye

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm start
```

## Detailed Setup Steps

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or higher)
  ```bash
  node --version
  ```

- **npm** or **yarn**
  ```bash
  npm --version
  ```

- **Expo CLI** (optional, but recommended)
  ```bash
  npm install -g expo-cli
  ```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native and Expo SDK
- Navigation libraries
- State management (Zustand)
- API client (Axios)
- Maps and location services
- Camera and notification modules

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
API_BASE_URL=https://api.rodeye.yourdomain.com
```

### 4. Platform-Specific Setup

#### iOS Setup (macOS only)

1. Install Xcode from the App Store
2. Install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```
3. Install iOS dependencies:
   ```bash
   cd ios
   pod install
   cd ..
   ```

#### Android Setup

1. Install Android Studio
2. Set up Android SDK and emulator
3. Add Android SDK to your PATH:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

### 5. Running the App

#### Start Development Server

```bash
npm start
```

Or with Expo CLI:

```bash
npx expo start
```

#### Run on iOS Simulator

```bash
npm run ios
```

Or press `i` in the Expo dev tools.

#### Run on Android Emulator

```bash
npm run android
```

Or press `a` in the Expo dev tools.

#### Run on Physical Device

1. Install **Expo Go** app from App Store or Google Play
2. Scan the QR code shown in terminal or browser
3. App will load on your device

### 6. API Backend Setup

The app requires a backend API. Ensure your backend implements these endpoints:

**Hazards API:**
- `GET /hazards?lat={lat}&lon={lon}&radius={radius}`
- `POST /hazards/report`
- `POST /hazards/detect`
- `GET /hazards/{id}`
- `POST /hazards/{id}/verify`
- `DELETE /hazards/{id}`

**Authentication API:**
- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/profile`
- `PUT /auth/profile`

### 7. Maps Configuration

For production builds, add Google Maps API keys to `app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY"
        }
      }
    }
  }
}
```

Get API keys from [Google Cloud Console](https://console.cloud.google.com/).

### 8. Push Notifications Setup

#### Firebase Cloud Messaging (Android)

1. Create a Firebase project
2. Add Android app to Firebase
3. Download `google-services.json`
4. Place in `android/app/` directory
5. Add Firebase configuration to `app.json`

#### Apple Push Notifications (iOS)

1. Create an Apple Developer account
2. Generate APNs certificate
3. Upload to Firebase or your notification service
4. Configure in `app.json`

### 9. Testing

The app includes the following test scenarios:

**Map Screen:**
- Location permission request
- Map rendering with user location
- Hazard markers display
- Auto-refresh functionality

**Detect Screen:**
- Camera permission request
- Live camera preview
- Photo capture
- ML detection simulation

**Alerts Screen:**
- Hazard list rendering
- Pull-to-refresh
- Hazard detail modal

**Profile Screen:**
- User information display
- Settings toggle
- Logout functionality

### 10. Building for Production

#### Using EAS Build (Recommended)

Install EAS CLI:
```bash
npm install -g eas-cli
```

Login to Expo:
```bash
eas login
```

Configure build:
```bash
eas build:configure
```

Build for Android:
```bash
eas build --platform android
```

Build for iOS:
```bash
eas build --platform ios
```

#### Classic Build

For Android APK:
```bash
expo build:android
```

For iOS IPA:
```bash
expo build:ios
```

## Troubleshooting

### Common Issues

#### 1. Metro Bundler Cache Issues

```bash
npx expo start -c
```

#### 2. Module Resolution Errors

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

#### 3. iOS Build Failures

```bash
cd ios
pod deintegrate
pod install
cd ..
```

#### 4. Android Build Failures

```bash
cd android
./gradlew clean
cd ..
```

#### 5. Permission Errors

Ensure permissions are properly configured in `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "RoadEye needs camera access...",
        "NSLocationWhenInUseUsageDescription": "RoadEye needs location..."
      }
    },
    "android": {
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

### Debug Mode

Enable debug mode for detailed logs:

```bash
npx expo start --dev-client
```

### Network Issues

If API calls fail:

1. Check API_BASE_URL in `.env`
2. Ensure backend is running
3. Check network connectivity
4. Verify CORS settings on backend

## Development Tips

### Hot Reload

Changes to code will automatically reload the app. To disable:

```bash
npx expo start --no-dev
```

### Debugging

Use React Native Debugger or Chrome DevTools:

1. Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
2. Select "Debug Remote JS"
3. Open Chrome DevTools at `http://localhost:19000/debugger-ui`

### Logging

Use console logs for debugging:

```typescript
console.log('Debug message');
console.error('Error message');
console.warn('Warning message');
```

## Project Structure Reference

```
roadeye/
├── src/
│   ├── api/              # API client and endpoints
│   ├── components/       # Reusable UI components
│   ├── screens/          # Main app screens
│   ├── store/            # State management
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, etc.
├── App.tsx               # Main entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── babel.config.js       # Babel configuration
```

## Next Steps

1. **Customize Branding**: Update colors, logo, and app name in `app.json`
2. **Add Analytics**: Integrate Firebase Analytics or similar
3. **Error Tracking**: Add Sentry or Bugsnag for crash reporting
4. **Testing**: Add unit tests with Jest and E2E tests with Detox
5. **CI/CD**: Set up automated builds with GitHub Actions or CircleCI

## Support

For issues:
- Check the [README.md](README.md)
- Review [Expo documentation](https://docs.expo.dev/)
- Open an issue on GitHub

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
