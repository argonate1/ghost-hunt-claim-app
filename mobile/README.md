# Ghostcoin Hunt - Mobile App

A React Native mobile app built with Expo for the Ghostcoin Hunt ecosystem. Users can hunt for ghost drops, scan QR codes, claim rewards, and manage their accounts.

## Features

- 🔐 **Authentication**: Email/password authentication with Supabase
- 📱 **QR Scanner**: Camera-based QR code scanning for claiming ghost drops
- 🗺️ **Interactive Map**: Real-time map showing ghost drop locations
- 👻 **Ghost Feed**: Browse available ghost drops and their rewards
- 🏆 **Claims Tracking**: View and track your claimed drops
- 💼 **Wallet Integration**: Connect crypto wallets for GHOX token rewards
- ⚙️ **Settings**: Manage profile and wallet settings
- 👑 **Admin Panel**: Admin functionality for managing drops and claims

## Tech Stack

- **React Native** with **Expo SDK 50**
- **TypeScript** for type safety
- **Supabase** for backend services (auth, database, real-time)
- **React Navigation** for navigation
- **Expo Camera** for QR code scanning
- **React Native Maps** for map functionality
- **Linear Gradient** for beautiful UI effects
- **Toast Messages** for user feedback

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your phone (for development)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   The app is pre-configured to use the same Supabase instance as the web version:
   - Supabase URL: `https://zopvzedfnshapdnhsrsk.supabase.co`
   - All authentication and data sync with the web app

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator
   - Or press `a` for Android emulator

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React contexts (Auth, Wallet)
│   ├── navigation/          # Navigation configuration
│   ├── screens/             # App screens
│   │   ├── LandingScreen.tsx      # Welcome/auth screen
│   │   ├── DashboardScreen.tsx    # Ghost drops feed
│   │   ├── ScannerScreen.tsx      # QR code scanner
│   │   ├── MapScreen.tsx          # Interactive map
│   │   ├── ClaimsScreen.tsx       # User claims
│   │   ├── SettingsScreen.tsx     # User settings
│   │   └── AdminScreen.tsx        # Admin panel
│   ├── theme/               # Colors and styles
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── config/              # Configuration files
├── assets/                  # Images, fonts, etc.
├── App.tsx                  # Root component
├── app.json                 # Expo configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## Key Features Explained

### Authentication System
- Email/password authentication via Supabase
- Secure token storage using Expo SecureStore
- Auto-refresh tokens for seamless experience

### QR Code Scanning
- Camera permissions handling
- Real-time QR code detection
- Validation against Supabase drops database
- Claim processing with duplicate protection

### Ghost Drops System
- Real-time feed of available drops
- Expiration date handling
- GHOX token requirements
- Prize information display

### Map Integration
- Interactive map with drop locations
- Custom markers for ghost drops
- Location-based filtering

### Wallet Integration
- Crypto wallet connection simulation
- GHOX token balance display
- Address management

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web (limited functionality)

### Building for Production

1. **Configure EAS Build**
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. **Build for Android**
   ```bash
   eas build --platform android
   ```

3. **Build for iOS**
   ```bash
   eas build --platform ios
   ```

### Permissions

The app requires the following permissions:
- **Camera**: For QR code scanning
- **Location**: For map functionality (optional)

## Database Schema

The app uses the same Supabase database as the web version with these main tables:

- `profiles` - User profiles and wallet addresses
- `drops` - Ghost drops with location and reward data
- `claims` - User claims with status tracking
- `user_roles` - Role-based access control

## API Integration

All API calls are made through Supabase client:
- Real-time subscriptions for live updates
- Row Level Security (RLS) for data protection
- Automatic authentication token handling

## Styling

The app uses a custom design system with:
- Dark theme with neon purple/green accents
- Consistent spacing and typography
- Gradient backgrounds and glow effects
- Responsive design for all screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both iOS and Android
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS simulator not opening**
   ```bash
   npx expo install --fix
   ```

3. **Android emulator issues**
   - Ensure Android Studio is properly installed
   - Check that virtualization is enabled

4. **Camera not working**
   - Ensure physical device is used (camera doesn't work in simulators)
   - Check camera permissions are granted

### Getting Help

- Check the [Expo documentation](https://docs.expo.dev/)
- Review [React Navigation docs](https://reactnavigation.org/)
- Check [Supabase documentation](https://supabase.com/docs)

## License

This project is part of the Ghostcoin Hunt ecosystem. See the main repository for license information.

## Contact

For questions or support, please reach out through the main repository or create an issue. 