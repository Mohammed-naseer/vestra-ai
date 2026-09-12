<div align="center">

# ✦ VESTA
### AI Wardrobe Stylist

**Haute Couture Meets Climate Intelligence**

*Your wardrobe. Your weather. Your style.*

An AI-powered personal stylist that creates complete, context-aware outfits from the clothes you already own.

<br/>

[![Live Demo](https://img.shields.io/badge/✦%20LIVE%20DEMO-Vercel-E6C280?style=for-the-badge&labelColor=090A0F)](https://vestra-ai-five.vercel.app/)
[![Backend](https://img.shields.io/badge/API-Render-E6C280?style=for-the-badge&labelColor=090A0F)](https://vestra-ai.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-Source-FFFFFF?style=for-the-badge&labelColor=090A0F)](https://github.com/Mohammed-naseer/vestra-ai)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)

</div>

---

## ✦ The Idea

> **What if your wardrobe already has the perfect outfit — you just haven't found the combination yet?**

Most fashion platforms focus on **what to buy next**.
**VESTA focuses on what you can wear right now.**

It combines your existing wardrobe with:

<div align="center">

**Live Weather** ✦ **Occasion** ✦ **Dress Code** ✦ **Personal Style** ✦ **Color Harmony**

</div>

to create complete outfits that are practical, explainable, and personalized.

---

## ✦ Why VESTA?

<table>
<tr>
<td width="50%" valign="top">

### 👕 Your Wardrobe Comes First
VESTA doesn't push you toward another purchase — it intelligently combines pieces you already own.

</td>
<td width="50%" valign="top">

### 🌦️ Weather-Aware Styling
A beautiful outfit isn't useful if it's wrong for the weather. VESTA reads live temperature, conditions, precipitation, wind, and climate suitability.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🎯 Context-Aware Recommendations
Tell VESTA where you're going, what you're doing, your dress code, style, color palette, and fit — and it adapts every recommendation.

</td>
<td width="50%" valign="top">

### 🧠 AI With Guardrails
A **dual-layer architecture**: a deterministic engine selects real outfits from your closet, and Groq AI only explains them — never invents clothes you don't own.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### ✈️ Beyond Daily Outfits
The **Trip Packer** turns an entire trip into a reusable capsule wardrobe — fewer pieces, more combinations.

</td>
<td width="50%" valign="top">

### 💎 Editorial-Grade Polish
A noir haute-couture UI — glassmorphism, gold accents, and micro-interactions that feel like a styling atelier, not a spreadsheet.

</td>
</tr>
</table>

---

## ✦ How VESTA Works

```
                          YOUR CONTEXT
                               │
                               ▼
                ┌───────────────────────────┐
                │  Location + Live Weather  │
                │  Occasion + Dress Code    │
                │  Style + Fit + Colors     │
                └─────────────┬─────────────┘
                               │
                               ▼
                ┌───────────────────────────┐
                │      YOUR WARDROBE        │
                │  Tops · Bottoms · Shoes   │
                │  Outerwear · Accessories  │
                └─────────────┬─────────────┘
                               │
                               ▼
                ┌───────────────────────────┐
                │   DETERMINISTIC ENGINE    │
                │   Compatibility Scoring   │
                │   Weather Fit             │
                │   Occasion Fit            │
                │   Dress Code Fit          │
                │   Color Harmony           │
                │   Style Preference        │
                └─────────────┬─────────────┘
                               │
                               ▼
                        TOP 3 OUTFITS
                               │
                               ▼
                ┌───────────────────────────┐
                │          GROQ AI          │
                │   Editorial Reasoning     │
                │   Styling Explanation     │
                │   Personal Stylist Tips   │
                └─────────────┬─────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │        VESTA        │
                    │   Score + Looks +   │
                    │   "Why this look?"  │
                    └──────────┬──────────┘
                               │
                               ▼
                     SAVE ✦ RATE ✦ LEARN
```

---

## ✦ Tech Stack

<div align="center">

| Layer | Technology |
|:---|:---|
| 🎨 **Frontend** | React 19 · TypeScript · Vite 8 · Tailwind CSS · Lucide Icons · Canvas Confetti |
| ⚙️ **Backend API** | Node.js · Express 5 · TypeScript (`tsx`) |
| 🗄️ **Database** | MongoDB Atlas · Mongoose 9 ODM |
| 🤖 **AI Stylist** | Groq SDK — `llama-3.3-70b-versatile` / `openai/gpt-oss-120b` |
| ⛅ **Weather** | Open-Meteo API (open-access hyper-local meteorological data) |
| 💾 **State & Storage** | React Context + LocalStorage dual-write synchronization |
| ☁️ **Deployment** | Vercel (Frontend) · Render (Backend) |

</div>

---

## ✦ Data Models (MongoDB)

All entities are keyed under the demo account (`userId: "demo-user"`) for zero-friction evaluation:

| # | Model | Description |
|:---:|:---|:---|
| 1 | **User** (`User.ts`) | Profile configurations — `clothingPreference`, `fit`, `style`, `colorPalette` |
| 2 | **WardrobeItem** (`WardrobeItem.ts`) | Clothes with category, fabric, color hex, warmth level (1–5), formality (1–5), and tags. Indexed on `{ userId, category }` and `{ userId, itemId }` |
| 3 | **SavedLook** (`SavedLook.ts`) | Outfits, item combinations, climate scores, editorial reasoning, and 1–5 star ratings |
| 4 | **StylePreference** (`StylePreference.ts`) | Explicit multi-select attributes for styles, colors, occasions, and dress codes |
| 5 | **Trip** (`Trip.ts`) | Travel capsule schedules, destination weather forecasts, and smart packing checklists |

---

## ✦ API Endpoints

### System & Health
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Reports service status and MongoDB state |

### Stylist AI
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/style` | Generates editorial fashion advice for candidate outfits via Groq AI |

### User & Preferences
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/user/:userId` | Retrieve user profile |
| `POST` | `/api/user` | Create/initialize user |
| `PUT` | `/api/user/:userId` | Update style profile |
| `GET` | `/api/style-profile/:userId` | Get explicit preferences |
| `PUT` | `/api/style-profile/:userId` | Update preferences |

### Digital Wardrobe
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/wardrobe/:userId` | Retrieve all wardrobe items |
| `POST` | `/api/wardrobe` | Add new clothing item |
| `PUT` | `/api/wardrobe/:itemId` | Modify item details |
| `DELETE` | `/api/wardrobe/:itemId` | Remove item from wardrobe |

### Lookbook & Saved Outfits
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/saved-looks/:userId` | Retrieve saved looks |
| `POST` | `/api/saved-looks` | Save outfit with rating & AI reasoning |
| `PUT` | `/api/saved-looks/:lookId` | Update outfit rating or metadata |
| `DELETE` | `/api/saved-looks/:lookId` | Delete saved look |

### Trip Capsule Packer
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/trips/:userId` | Fetch saved trip capsules |
| `POST` | `/api/trips` | Save new trip plan and packing checklist |

---

## ✦ Getting Started

### 1️⃣ Prerequisites
- Node.js **18+** installed
- A MongoDB connection string (local instance or MongoDB Atlas)

### 2️⃣ Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Server Port
PORT=3001

# Groq Cloud API Key
GROQ_API_KEY=your_groq_api_key_here

# MongoDB Connection String (Atlas or Local)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/vesta?retryWrites=true&w=majority
```

### 3️⃣ Install Dependencies
```bash
npm install
```

### 4️⃣ Seed the Database *(optional)*
Populate MongoDB with curated default wardrobe pieces, sample looks, and a demo trip:
```bash
npm run db:seed
```

### 5️⃣ Launch the Full-Stack Application
Runs both the Express API server (`:3001`) and Vite client (`:5173`) concurrently:
```bash
npm run dev
```

➡️ Visit **`http://localhost:5173`** in your browser, or try the [**live demo**](https://vestra-ai-five.vercel.app/).

---

## ✦ Verification & QA Checklist

- [x] **Live MongoDB Connection** — connected to MongoDB Atlas with automated reconnection handling
- [x] **Backend REST API** — all CRUD routes for Users, Wardrobes, Looks, Preferences, and Trips functional
- [x] **Data Persistence** — changes to Wardrobe, Ratings, and Saved Looks persist across page reloads and server restarts
- [x] **AI Generation** — Groq LLM integration delivers real-time stylist commentary with no latency bottlenecks
- [x] **Graceful Fallback** — LocalStorage activates automatically if the database or network drops, keeping the demo flawless
- [x] **Production Build** — passes `npm run build` with zero TypeScript or bundle warnings

---

<div align="center">

**Crafted with 🖤 and a keen eye for the forecast.**

[Live Demo](https://vestra-ai-five.vercel.app/) · [API Health](https://vestra-ai.onrender.com/api/health) · [Source Code](https://github.com/Mohammed-naseer/vestra-ai)

</div>
