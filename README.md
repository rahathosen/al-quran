# Al-Quran AI

![Al-Quran AI](https://al-quran-ai.vercel.app/og-images/quran-og.svg)

A modern, feature-rich Quran application with AI-powered search, audio recitations, and beautiful UI for an enhanced Quran reading experience.

## 🌟 Features

### Core Features

- **Complete Quran Text**: Full Arabic text with multiple translations
- **Audio Recitations**: Listen to beautiful recitations by renowned reciters
- **AI-Powered Search**: Find verses by meaning, theme, or content using advanced AI
- **Responsive Design**: Beautiful interface that works on all devices

### Reading Experience

- **Multiple View Modes**: Default, Compact, and Arabic-only views
- **Theme Options**: Light, Dark, and Sepia themes for comfortable reading
- **Font Settings**: Adjustable font size and Quran script styles
- **Verse Metadata**: Detailed information about each verse (Juz, Page, etc.)

### Navigation & Organization

- **Surah List**: Easy navigation through all 114 surahs
- **Bookmarking**: Save favorite verses and surahs for quick access
- **Recently Read**: Track and return to recently read surahs
- **Verse Navigation**: Jump to specific verses or pages

### Social & Sharing

- **Social Sharing**: Share verses or surahs on Facebook, Twitter, or via link
- **Canvas Feature**: Create beautiful images with Quranic verses for sharing
- **Copy Functionality**: Easily copy verses with proper formatting

### Audio Features

- **Verse-by-Verse Audio**: Listen to individual verses
- **Full Surah Playback**: Listen to entire surahs with playback controls
- **Multiple Reciters**: Choose from different recitation styles
- **Audio Controls**: Play, pause, skip, and adjust volume

### Additional Tools

- **Prayer Times Widget**: View prayer times for your location
- **Keyboard Shortcuts**: Navigate efficiently using keyboard
- **Detailed Metadata**: Information about Juz, Hizb, Manzil, Ruku, and Sajda

## 📱 Screenshots

![Home Screen](https://placeholder.com/home-screen.png)
![Surah View](https://placeholder.com/surah-view.png)
![Dark Mode](https://placeholder.com/dark-mode.png)
![Canvas Feature](https://placeholder.com/canvas-feature.png)

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn


### Default Endpoint: Al-Quran Cloud

- **Base URL**: `https://api.alquran.cloud/v1`
- **Documentation**: [https://alquran.cloud/api](https://alquran.cloud/api)
- **Features**: Free, CORS-enabled, supports multiple reciters and translations.


### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/rahathosen/al-quran-ai.git
   cd al-quran-ai
   ```

2. Create Environment Variables
   ```bash
   NEXT_PUBLIC_APP_URL="https://al-quran-ai.vercel.app"
   LLM_BASE_URL="https://api.openai.com/v1"          # Example: OpenAI-compatible endpoint
   LLM_MODEL_NAME="gpt-4"                           # Example: model name
   LLM_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" # Your API key
   ```

3. Install Dependencies
   ```bash
   npm install
   ```

4. Run the Development Server
   ```bash
   npm run dev
   ```
