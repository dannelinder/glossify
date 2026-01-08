# Glossify - Language Learning App

A Progressive Web App (PWA) for learning languages through flashcards. Practice Swedish with English, German, or Spanish.

## Features

- 🎯 **Flashcard Practice** - Learn vocabulary with interactive flashcards
- 🔐 **User Authentication** - Secure login with Firebase Auth
- 💾 **Cloud Sync** - Your word lists sync across all devices
- ⚙️ **Customizable Settings**:
  - Language selection (English, German, Spanish)
  - Practice direction (Swedish→Target or Target→Swedish)
  - Sound effects toggle
  - Case sensitivity toggle
- 📱 **PWA Support** - Install on mobile/desktop for offline access
- 🎨 **Modern UI** - Clean, responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Firebase account

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=glossify-2863a.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=glossify-2863a
REACT_APP_FIREBASE_STORAGE_BUCKET=glossify-2863a.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here
```

4. Set up Firebase:
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Set up security rules (see below)

5. Start the development server:
```bash
npm start
```

### Building for Production

```bash
npm run build
```

The build folder will contain the optimized production build.

## PWA Installation

### Desktop (Chrome/Edge)
1. Visit the deployed app
2. Click the install icon in the address bar
3. Or use the "Installera" prompt that appears

### Mobile (iOS)
1. Open in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"

### Mobile (Android)
1. Open in Chrome
2. Tap the menu (⋮)
3. Tap "Install app" or "Add to Home Screen"

## Offline Support

The app uses a service worker to cache assets for offline use:
- Static assets are cached on first visit
- API calls use a network-first strategy with cache fallback
- The app will work offline after the first visit

## Database Schema

### Firestore Collections

**`wordLists` collection**
- Document ID: `{userId}_{listName}`
- Fields:
  - `name` - String (weeklyWords, allWords, verbs)
  - `content` - String (semicolon-separated word pairs)
  - `userId` - String (Firebase Auth user ID)
  - `updatedAt` - Timestamp

**`userSettings` collection**
- Document ID: `{userId}`
- Fields:
  - `targetLanguage` - String (en, de, es)
  - `direction` - String (sv-target, target-sv)
  - `soundEnabled` - Boolean
  - `caseSensitive` - Boolean
  - `volume` - Number
  - `updatedAt` - Timestamp

## Technologies

- **React 19** - UI framework
- **Firebase** - Backend (Auth + Firestore)
- **Service Workers** - Offline support
- **Web Audio API** - Sound effects
- **CSS3** - Animations and gradients

## License

MIT

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
