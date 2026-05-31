# 📅 Meemo

> A personal calendar and life-tracking app built with React Native & Expo

Meemo is a beautifully crafted mobile app that helps you take control of your time. From calculating the exact number of days between two dates, to managing events, setting reminders, and writing journal entries — Meemo is your all-in-one personal time companion.

---

## ✨ Features

### 🗓️ Calendar
Interactive calendar view to navigate dates, visualize events, and get a clear overview of your schedule.

### ⏳ Timeline Calculator
Select a **start date** and an **end date**, and Meemo will instantly calculate:
- Total number of days between the two dates
- Useful for countdowns, project planning, anniversaries, and more

### 📌 Events
Create, manage, and track your personal or professional events with ease.

### 🔔 Reminders
Never miss an important moment. Set reminders tied to specific dates or events and receive local push notifications.

### 📓 Journal
Write daily journal entries to reflect on your day, capture thoughts, and track your personal growth over time.

### 📊 Contribution Graph
Visual activity graph that shows your journaling or event activity over time — inspired by GitHub's contribution heatmap.

### ⏱️ Countdown
Set countdowns to upcoming events, deadlines, or milestones and watch them tick in real time.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK 54) |
| Language | TypeScript |
| Styling | [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native) |
| Navigation | [React Navigation](https://reactnavigation.org/) (Native Stack) |
| Backend / Database | [Supabase](https://supabase.com/) (Auth + Database) |
| Local Storage | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) |
| Animations | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| Gestures | [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) |
| Maps | [React Native Maps](https://github.com/react-native-maps/react-native-maps) |
| Icons | [@expo/vector-icons](https://icons.expo.fyi/) |
| Notifications | [Expo Notifications](https://docs.expo.dev/push-notifications/overview/) |
| Date/Time Picker | [@react-native-community/datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker) |
| Bottom Sheet | [@gorhom/bottom-sheet](https://gorhom.dev/react-native-bottom-sheet/) |
| Gradients | [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) |

---

## 📁 Project Structure

```
Meemo/
├── src/
│   ├── assets/              # Images, fonts, and static files
│   ├── auth/                # Authentication screens and logic
│   ├── dashboard/
│   │   └── components/
│   │       ├── Calendar/        # Calendar component
│   │       ├── ContributionGraph/  # Activity heatmap
│   │       ├── Countdown/       # Countdown timer component
│   │       ├── Events/          # Events list and management
│   │       └── UI/              # Shared UI components
│   ├── constants/           # App-wide constants (colors, sizes, etc.)
│   ├── context/             # React Context providers (global state)
│   ├── hooks/               # Custom React hooks
│   ├── screens/             # App screens
│   ├── storage/             # Local storage helpers (AsyncStorage)
│   └── utils/               # Utility functions
├── types.ts                 # Global TypeScript types
├── App.tsx                  # Root component
├── app.json                 # Expo configuration
├── eas.json                 # EAS Build configuration
├── global.css               # Global styles (NativeWind)
├── tailwind.config.js       # Tailwind / NativeWind configuration
├── metro.config.js          # Metro bundler configuration
├── babel.config.js          # Babel configuration
├── tsconfig.json            # TypeScript configuration
└── .env.example             # Environment variable template
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your physical device (for development), **or** an Android/iOS simulator

```bash
npm install -g expo-cli
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/joshdev09/Meemo.git
cd Meemo
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file and fill in your own values:

```bash
cp .env.example .env
```

Open `.env` and configure the following:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> You can get these values from your [Supabase project dashboard](https://app.supabase.com/) under **Project Settings → API**.

4. **Start the development server**

```bash
npm start
```

---

## 📱 Running the App

| Command | Description |
|---|---|
| `npm start` | Start the Expo development server |
| `npm run android` | Run on Android device or emulator |
| `npm run ios` | Run on iOS simulator (macOS only) |
| `npm run web` | Run in the browser (Expo Web) |

### Running on a physical device
1. Install [Expo Go](https://expo.dev/client) on your Android or iOS device
2. Run `npm start`
3. Scan the QR code displayed in the terminal or browser

---

## ⚙️ Environment Variables

| Variable | Description | Required |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous public key | ✅ Yes |

> **Never commit your `.env` file.** It is already included in `.gitignore`.

---

## 🗄️ Supabase Setup

Meemo uses [Supabase](https://supabase.com/) as the backend for authentication and data storage.

1. Create a free account at [supabase.com](https://supabase.com/)
2. Create a new project
3. Go to **Project Settings → API** and copy your **Project URL** and **anon/public key**
4. Paste them into your `.env` file
5. Set up the required tables in your Supabase database (events, journals, reminders)

---

## 🏗️ Building for Production

Meemo uses [EAS Build](https://docs.expo.dev/build/introduction/) for production builds.

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

Configuration is defined in `eas.json`.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the existing code style and use TypeScript throughout.

---

## 📄 License

This project is private and not currently under an open-source license.

---

## 👤 Author

**joshdev09**
- GitHub: [@joshdev09](https://github.com/joshdev09)

---

> Built with ❤️ using React Native & Expo
