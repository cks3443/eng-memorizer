# English Memorizer

A TypeScript/Next.js web application for memorizing English sentences with Korean translations.

## Features

- **Smart Study System**: Korean sentences are shown first, you type the English translation
- **Intelligent Recommendation**: Sentences are selected based on difficulty and recency
- **Keyboard Shortcuts**: 
  - `Ctrl + Enter`: Submit answer
  - `Ctrl + Space`: Show English sentence
  - `Ctrl + N`: Next sentence
  - `Ctrl + M`: Mark as memorized
- **CRUD Management**: Add, edit, and delete sentence pairs
- **Progress Tracking**: Statistics and achievements system
- **Memorization Tracking**: Mark sentences as memorized to reduce exposure

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Add Sentences**: Go to `/sentences` to add English-Korean sentence pairs
2. **Study**: Use the main page `/` to practice memorization
3. **Track Progress**: View statistics at `/stats`

## Database

The app uses SQLite for local storage. The database file (`memorizer.db`) will be created automatically when you first run the application.

## Tech Stack

- Next.js 14
- TypeScript
- SQLite
- Tailwind CSS
- React Hooks
