# CT Alter Ego Generator

Generate your Crypto Twitter alter ego with AI. Enter any Twitter/X username and get a personalized alter ego card.

## Features

- Auto-fetches Twitter profile bio and latest tweets
- Multi-layer Groq AI fallback system (3 models)
- Dark terminal-style card UI with typing animation
- Download as PNG
- Share directly on X
- Rate limiting and request caching
- Production-ready error handling

## Tech Stack

- **Frontend:** Next.js 16 + React 19
- **Backend:** Next.js API routes
- **AI:** Groq API (llama-3.3-70b, llama-3.1-8b)
- **Avatar:** unavatar.io
- **Styling:** Inline CSS (zero build dependencies)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── scrape/route.ts      # Twitter scraping API
│   │   └── generate/route.ts    # Groq AI generation API
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main page
│   └── globals.css              # Global styles
├── components/
│   ├── UsernameInput.tsx        # Input form
│   ├── AlterEgoCard.tsx         # Terminal-style result card
│   ├── ActionButtons.tsx        # Download/Share/Regenerate
│   └── LoadingState.tsx         # Loading animations
├── lib/
│   ├── groq.ts                  # Groq AI with fallback + timeout
│   └── keys.ts                  # API keys (gitignored)
└── types/
    └── index.ts                 # TypeScript types
```

## Production Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo on Vercel
3. Add environment variables in Vercel dashboard:
   - `GROQ_API_KEY_1` - Primary Groq API key
   - `GROQ_MODEL_1` - `llama-3.3-70b-versatile`
   - `GROQ_API_KEY_2` - Secondary Groq API key
   - `GROQ_MODEL_2` - `llama-3.1-8b-instant`
   - `GROQ_API_KEY_3` - Tertiary Groq API key
   - `GROQ_MODEL_3` - `llama-3.1-8b-instant`
4. Deploy

### Environment Variables

Copy `.env.example` to `.env.local` for local development.

## How It Works

1. User enters a Twitter username
2. Backend scrapes profile bio and tweets via meta tags
3. Data is sent to Groq API with a 3-layer fallback system
4. AI generates the alter ego (name, bio, personality, aura score, roast)
5. Result is displayed in a terminal-style card with typing animation
6. User can download as PNG or share on X

## AI Fallback System

If the primary model fails, it automatically tries the next layer:

- **Layer 1:** llama-3.3-70b-versatile (primary)
- **Layer 2:** llama-3.1-8b-instant (fallback)
- **Layer 3:** llama-3.1-8b-instant (last resort)

## Production Features

- **Rate limiting** - 10 requests/min for scraping, 5 requests/min for AI
- **Request caching** - Profile data cached for 5 minutes
- **Timeout handling** - 10s scrape timeout, 30s AI timeout
- **Input validation** - Username sanitization, length checks
- **Error handling** - Graceful fallbacks at every layer
- **Zero Tailwind** - No PostCSS build issues on any platform

## Build for Production

```bash
npm run build
npm start
```
