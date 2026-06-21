# Frontend

React + Vite app for the Triad adaptive learning platform.

**Runs on http://localhost:5173**

---

## Setup

```bash
cd frontend
npm install
npm run dev
```

The backend must be running on :3000 for API features to work (AI tutor, speech, quiz saving). The app works standalone with mock data if the backend is offline.

---

## Pages and flows

### Student flow
```
Landing → Assessment (diagnostic quiz)
       → StudentHome (course list)
       → CourseDetail (topics + scores + performance history)
       → Lesson (text / audio / visual content)
       → Quiz (MCQ + voice answers)
       → QuizResult
```

Each course detail page has an **AI tutor chatbot** (floating button, bottom-right) powered by GPT-4o mini that answers questions about the course topics.

### Teacher flow
```
Landing → TeacherCatalog (course grid + search + create course)
       → TeacherDashboard (KPIs, charts, who needs help, upload modal)
       → StudentDetail (per-student breakdown)
```

---

## Key files

| File | What it does |
|---|---|
| `src/constants/tokens.js` | All colors and fonts — edit here to retheme the whole app |
| `src/constants/data.js` | Mock courses, topics, students, questions |
| `src/components/TriMark.jsx` | Logo component used in TopBar and Landing |
| `src/lib/speech.js` | TTS narration + voice transcription (proxies to `/api/speech/*`) |
| `vite.config.js` | Proxies `/api/*` requests to `localhost:3000` |

---

## Color palette

All colors come from the Cal Hacks logo — three overlapping circles:

| Token | Hex | Used for |
|---|---|---|
| `C.brand` | `#D96840` | Primary buttons, links, active states |
| `C.brandSoft` | `#F5A87A` | Peach backgrounds, badges (= logo peach circle) |
| `C.audio` | `#3898B8` | Audio mode elements |
| `C.audioSoft` | `#90D2E6` | Audio backgrounds (= logo sky-blue circle) |
| `C.visual` | `#4AADA0` | Visual mode elements |
| `C.visualSoft` | `#EEEA9C` | Visual backgrounds (= logo yellow circle) |
| `C.ink` | `#2A1E14` | Body text (warm near-black) |
| `C.paper` | `#FFFDF5` | Page background (warm cream) |

---

## Adding the logo to a new component

```jsx
import { TriMark } from "../components/TriMark";

<TriMark s={40} />  // s = pixel size
```

`mix-blend-mode: multiply` makes the white background transparent on any light surface.

---

## Environment variables

The frontend has no `.env` file — it uses the Vite proxy to talk to the backend. The only optional override is:

```
VITE_API_URL=https://your-deployed-backend.com
```

Set this in a `.env` file at `frontend/` root when deploying to production so API calls go to the right server instead of the proxy.
