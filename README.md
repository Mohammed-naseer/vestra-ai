# VESTA — AI Wardrobe Stylist

> **Haute Couture Meets Climate Tech**  
> *"Your wardrobe. Your weather. Your style."*

VESTA is an intelligent personal stylist and digital wardrobe atelier built for modern luxury. It combines hyper-local real-time weather analytics, user-curated digital wardrobes, multi-dimensional styling rules, and state-of-the-art Generative AI (Groq LLaMA 3.3 / GPT-OSS) to craft personalized outfit recommendations for any destination, dress code, or occasion.

---

## Key Highlights

- **Dual-Layer Architecture**: High-speed deterministic recommendation engine for outfit matching paired with cloud Generative AI for editorial stylist reasoning.
- **Production MongoDB Atlas Database**: Clean Mongoose models with compound indexing for instant querying of wardrobes, saved looks, style preferences, user profiles, and multi-day travel capsules.
- **Zero-Downtime LocalStorage Fallback**: If MongoDB or network connectivity is unavailable, the application operates seamlessly on client storage with automated reconciliation.
- **Live Climate Intelligence**: Powered by Open-Meteo API for real-time temperature, condition, precipitation, and wind calculations without requiring API keys.
- **Luxury Haute Couture UI/UX**: Noir luxury aesthetic crafted with dark glassmorphism, gold accents, smooth micro-interactions, responsive capsule planners, and interactive wardrobe managers.

---

## System Architecture

```
User Context & Live Weather (Open-Meteo)
                  │
                  ▼
         Style Profile & Filters
(Occasion, Dress Code, Palette, Fit)
                  │
                  ▼
     Deterministic Outfit Engine
  (Compatibility Scoring: 0 - 100)
                  │
                  ▼
      Top 3 Candidate Outfits
                  │
                  ▼
        Express Backend Layer
                  │
                  ├──► Groq AI / LLaMA 3.3 (Stylist Explanations)
                  │
                  └──► MongoDB Atlas via Mongoose (Persistence)
                            │
                            └──► LocalStorage (Graceful Fallback)
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS, Lucide Icons, Canvas Confetti |
| **Backend API** | Node.js, Express 5, TypeScript (`tsx`) |
| **Database** | MongoDB Atlas, Mongoose 9 ODM |
| **AI Stylist** | Groq SDK (`llama-3.3-70b-versatile` / `openai/gpt-oss-120b`) |
| **Weather** | Open-Meteo API (Open-access hyper-local meteorological data) |
| **State & Storage** | React Context + LocalStorage Dual-Write Synchronization |

---

## Data Models (MongoDB)

All entities are keyed under the demo account (`userId: "demo-user"`) for zero-friction judge evaluation:

1. **User (`User.ts`)**: Profile configurations (`clothingPreference`, `fit`, `style`, `colorPalette`).
2. **WardrobeItem (`WardrobeItem.ts`)**: Clothes with category, fabric, color hex, warmth level (1–5), formality (1–5), and tags. Compound indexes: `{ userId: 1, category: 1 }` and `{ userId: 1, itemId: 1 }`.
3. **SavedLook (`SavedLook.ts`)**: Outfits, item combinations, climate scores, editorial reasoning, and 1–5 star user ratings.
4. **StylePreference (`StylePreference.ts`)**: Explicit multi-select attributes for styles, colors, occasions, and dress codes.
5. **Trip (`Trip.ts`)**: Travel capsule schedules, destination weather forecasts, and smart packing checklists.

---

## API Endpoints

### System & Health
- `GET /api/health` — Reports service status and MongoDB state (`{"status": "ok", "database": "connected"}`)

### Stylist AI
- `POST /api/style` — Generates editorial fashion advice for candidate outfits via Groq AI

### User & Preferences
- `GET /api/user/:userId` — Retrieve user profile
- `POST /api/user` — Create/initialize user
- `PUT /api/user/:userId` — Update style profile
- `GET /api/style-profile/:userId` — Get explicit preferences
- `PUT /api/style-profile/:userId` — Update preferences

### Digital Wardrobe
- `GET /api/wardrobe/:userId` — Retrieve all wardrobe items
- `POST /api/wardrobe` — Add new clothing item
- `PUT /api/wardrobe/:itemId` — Modify item details
- `DELETE /api/wardrobe/:itemId` — Remove item from wardrobe

### Lookbook & Saved Outfits
- `GET /api/saved-looks/:userId` — Retrieve saved looks
- `POST /api/saved-looks` — Save outfit with rating & AI reasoning
- `PUT /api/saved-looks/:lookId` — Update outfit rating or metadata
- `DELETE /api/saved-looks/:lookId` — Delete saved look

### Trip Capsule Packer
- `GET /api/trips/:userId` — Fetch saved trip capsules
- `POST /api/trips` — Save new trip plan and packing checklist

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB connection string (local instance or MongoDB Atlas)

### 2. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Server Port
PORT=3001

# Groq Cloud API Key
GROQ_API_KEY=your_groq_api_key_here

# MongoDB Connection String (Atlas or Local)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/vesta?retryWrites=true&w=majority
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed Database (Optional)
Populate your MongoDB database with curated default wardrobe pieces, sample looks, and a demo trip:
```bash
npm run db:seed
```

### 5. Launch Full-Stack Application
Runs both the Express API server (`:3001`) and Vite client (`:5173`) concurrently:
```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## Verification & QA Checklist

- [x] **Live MongoDB Connection**: Connected to MongoDB Atlas with automated reconnection handling.
- [x] **Backend REST API**: All CRUD routes for Users, Wardrobes, Looks, Preferences, and Trips functional.
- [x] **Data Persistence**: Changes in Wardrobe, Ratings, and Saved Looks persist across page reloads and server restarts.
- [x] **AI Generation**: Groq LLM integration delivers real-time stylist commentary without latency bottlenecks.
- [x] **Graceful Fallback**: LocalStorage activates automatically if the database or network drops, keeping the demo flawless.
- [x] **Production Build**: Passes `npm run build` with zero TypeScript or bundle warnings.
