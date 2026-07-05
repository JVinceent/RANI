# Rani — Natural Language Payment Interface for Stellar

Combined monorepo: `frontend/` (your finished React/Vite UI) + `backend/` (Express/TypeScript/Stellar API).

```
rani-app/
├── frontend/     — React + Vite UI (your original design, minimally wired to the real API)
├── backend/      — Express + Prisma + Stellar SDK (testnet)
└── package.json  — root scripts to run both together
```

## What's actually wired vs. still mocked

| Screen | Status |
|---|---|
| `AuthView` → Connect Freighter | **Live** — real Freighter connect + backend JWT auth |
| `ContactsView` → Add Contact | **Live** — saves to the real database |
| `ContactsView` → contact list display | Still static demo data (visual styling depends on fields the backend doesn't track yet — safe to leave until you're ready to swap it) |
| `ChatView` → send money flow | Still fully mocked (1900+ lines of animated states) — the API client (`frontend/src/lib/api.ts`) already has everything needed (`parseCommand`, `simulatePayment`, `buildTransaction`, `submitTransaction`); wiring this in is the natural next step |
| `HistoryView` | Still static — `getHistory()` is ready to call |

---

## Prerequisites

- Node.js 18+
- A local Postgres database (or a free one from [Neon](https://neon.tech) / [Supabase](https://supabase.com))
- [Freighter wallet extension](https://freighter.app) installed in your browser, with a **testnet** account created in it
- pnpm not required — this setup uses npm

---

## 1. Install everything

From the `rani-app/` root:

```bash
npm install -g concurrently   # or skip and use two terminals, see "Run separately" below
npm run install:all
```

## 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to your Postgres connection string, and set `JWT_SECRET` to any random string. The Stellar testnet values are already filled in.

Then create the database tables:

```bash
npm run prisma:migrate --prefix .
```
(or, from inside `backend/`: `npm run prisma:migrate`)

## 3. Configure the frontend

`frontend/.env.local` is already set to `VITE_API_URL=http://localhost:4000` — no changes needed unless you're running the backend on a different port.

## 4. Run both together

From the `rani-app/` root:

```bash
npm run dev
```

This starts:
- Backend on `http://localhost:4000`
- Frontend on `http://localhost:5173` (Vite's default — check your terminal output for the exact port)

### Run separately (if you'd rather use two terminals)

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## 5. Try it

1. Open the frontend URL in a browser that has the Freighter extension installed and a testnet account set up.
2. Click **Connect Freighter Wallet** — approve the connection in the Freighter popup.
3. The backend registers your wallet address, funds it via Friendbot if new, and returns a session token.
4. You'll land on the onboarding screen, then the main chat UI.
5. Go to **Contacts → Add Contact** and save a real Stellar testnet address (56 characters, starts with `G`) — this now actually persists to your database.

---

## Known gaps to close next

- **ChatView isn't wired yet.** It's the biggest, most animation-heavy file (1900+ lines) — wiring it in one blind pass risked breaking the demo visuals, so it was left as-is. The API functions it needs (`parseCommand`, `simulatePayment`, `buildTransaction`, `submitTransaction`) all exist in `frontend/src/lib/api.ts` and are tested against the backend's routes.
- **Contact list display** in `ContactsView` still shows hardcoded demo contacts (`CONTACTS` array) — the styling (avatar colors, tags, "last sent" text) depends on fields the backend doesn't track, so swapping to `getContacts()` needs a small schema/display decision first.
- **Trustline creation** for USDC isn't built — needed before any USDC-denominated send will work on a fresh testnet account.
- **Full auth** — the backend currently derives a placeholder email from the wallet address (`{pubkey}@rani.local`) instead of a real signup step. Fine for a hackathon demo, not for production.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Freighter not installed" toast | Extension missing, locked, or no testnet account created in it |
| Backend 500 on `/auth/connect-freighter` | `DATABASE_URL` wrong, or migrations not run |
| CORS error in browser console | Backend not running, or `VITE_API_URL` pointing at the wrong port |
| Friendbot funding fails | Testnet Friendbot is occasionally rate-limited/down — retry after a minute |
