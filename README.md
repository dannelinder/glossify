# Glossify - Language Learning App

A Progressive Web App (PWA) for learning languages through flashcards. Practice Swedish with English, German, or Spanish.

## Features

- 🎯 **Flashcard Practice** - Learn vocabulary with interactive flashcards
- 🔐 **User Authentication** - Secure login with Supabase Auth
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
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase database by running these SQL scripts in order:
   - `supabase-auth-setup.sql` - Authentication tables and RLS
   - `supabase-settings-setup.sql` - User settings table
   - `supabase-direction-migration.sql` - Direction column
   - `supabase-case-sensitive-migration.sql` - Case sensitivity column

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

### `word_lists` table
- `id` - UUID primary key
- `user_id` - UUID foreign key to auth.users
- `name` - Text (weeklyWords, allWords, verbs)
- `words` - JSONB array of {sv, ty} objects
- `created_at`, `updated_at` - Timestamps

### `user_settings` table
- `user_id` - UUID primary key, foreign key to auth.users
- `target_language` - Text (en, de, es)
- `direction` - Text (sv-target, target-sv)
- `sound_enabled` - Boolean
- `case_sensitive` - Boolean
- `updated_at` - Timestamp

## Technologies

- **React 19** - UI framework
- **Supabase** - Backend (Auth + PostgreSQL)
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
