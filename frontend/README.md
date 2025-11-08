# RoadEye - Road Hazard Detection Mobile App

A React Native (Expo) mobile application for real-time road hazard detection and alert system that helps drivers identify potholes, debris, and other road hazards using camera input and crowd-sourced data.

## Features

- 🗺️ **Live Map View** - Real-time map displaying nearby hazards with custom markers
- 📸 **Camera Detection** - ML-powered hazard detection using device camera
- 🔔 **Alert System** - Push notifications for nearby hazards
- 👤 **User Profile** - Track your contributions and manage settings
- 🌙 **Dark Theme** - Modern, eye-friendly dark interface
- 💾 **Offline Cache** - Cached hazard data for offline viewing

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation (Bottom Tabs)
- **State Management**: Zustand
- **Maps**: React Native Maps
- **API Client**: Axios
- **Icons**: @expo/vector-icons (MaterialCommunityIcons)
- **Animations**: Lottie React Native

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

## Installation

1. **Clone the repository**
   ```bash
   cd roadeye
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API base URL:
   ```
   API_BASE_URL=https://api.rodeye.yourdomain.com
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

5. **Run on device/emulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Project Structure

```
roadeye/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Map view with hazard markers
│   │   ├── DetectScreen.tsx      # Camera detection interface
│   │   ├── AlertsScreen.tsx      # List of nearby hazards
│   │   └── ProfileScreen.tsx     # User profile and settings
│   ├── components/
│   │   ├── HazardMarker.tsx      # Map marker component
│   │   ├── HazardCard.tsx        # Hazard list item card
│   │   └── BottomNav.tsx         # Bottom navigation tabs
│   ├── store/
│   │   ├── useUserStore.ts       # User state management
│   │   └── useHazardStore.ts     # Hazard data management
│   ├── api/
│   │   ├── client.ts             # Axios configuration
│   │   ├── hazards.ts            # Hazard API endpoints
│   │   └── auth.ts               # Authentication endpoints
│   └── utils/
│       ├── permissions.ts        # Permission handlers
│       └── formatters.ts         # Utility functions
├── App.tsx                       # Main app entry point
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

## API Integration

The app expects the following API endpoints:

### Hazards
- `GET /hazards?lat={lat}&lon={lon}&radius={radius}` - Fetch nearby hazards
- `POST /hazards/report` - Report a new hazard
- `POST /hazards/detect` - ML detection endpoint
- `GET /hazards/{id}` - Get hazard details
- `POST /hazards/{id}/verify` - Verify a hazard
- `DELETE /hazards/{id}` - Delete a hazard

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

## Permissions

The app requires the following permissions:

- **Camera** - For hazard detection
- **Location** - For showing nearby hazards
- **Notifications** - For hazard alerts

Permissions are requested at runtime when needed.

## Configuration

### Maps API Key

For production builds, you'll need to add Google Maps API keys:

**iOS** (`app.json`):
```json
{
  "ios": {
    "config": {
      "googleMapsApiKey": "YOUR_IOS_API_KEY"
    }
  }
}
```

**Android** (`app.json`):
```json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_ANDROID_API_KEY"
      }
    }
  }
}
```

### Push Notifications

For push notifications, configure Firebase Cloud Messaging (FCM) for Android and Apple Push Notification service (APNs) for iOS.

## Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## Features in Detail

### Home Screen
- Interactive map centered on user location
- Custom hazard markers with severity colors
- Auto-refresh every 30 seconds
- Manual refresh button
- Center on user location button

### Detect Screen
- Live camera preview
- ML-powered hazard detection
- Capture and analyze photos
- Report detected hazards
- Visual feedback with overlays

### Alerts Screen
- List of nearby hazards sorted by distance
- Pull-to-refresh functionality
- Detailed hazard modal with mini-map
- Distance and timestamp information
- Verification status

### Profile Screen
- User information display
- Contribution statistics
- Notification settings toggle
- App information and version
- Logout functionality

## State Management

The app uses Zustand for state management with two main stores:

- **useUserStore** - User authentication, preferences, and session
- **useHazardStore** - Hazard data, detection state, and caching

## Styling

The app uses a dark theme with the following color palette:

- Background: `#1a1a2e`
- Card Background: `#1f2937`
- Border: `#374151`
- Primary: `#4a90e2`
- Text: `#f9fafb`
- Secondary Text: `#9ca3af`

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start -c
   ```

2. **Module not found errors**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   ```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@roadeye.com

---

Made with ❤️ for safer roads
