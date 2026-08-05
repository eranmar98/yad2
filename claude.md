# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

`yad2` — a "yad2 clone": a second-hand marketplace website. Monorepo with independent `client/` (React) and `server/` (Express/Mongoose) npm packages — not an npm workspace, each has its own `node_modules`/`package.json` and must be installed/run separately. There is also an empty `shared/` directory reserved for future code shared between client and server (unused so far).

## Server

### Commands

Run from `server/`:

```
npm install       # install deps
npm run dev        # tsx watch src/index.ts — runs the API with hot reload
```

There is no lint script and no real test script yet (`npm test` just exits with an error placeholder). There is no `tsconfig.json` in `server/` — TypeScript execution goes entirely through `tsx`.

Requires a `server/.env` with `MONGODB_CONNECTION` (MongoDB Atlas/SRV connection string) and `TOKEN_KEY` (JWT signing secret).

### Architecture

Layered, one folder per concern, wired together in `src/index.ts`:

```
routes/        →  controllers/       →  dataServices/         →  models/
(express.Router,  (static methods,      (Mongoose queries /       (Mongoose schema
 maps HTTP verb    thin: destructure     business logic,           + Document interface,
 + path to a       req, call a           returns plain data        e.g. IUser, IItem)
 controller        dataService,          or throws)
 method)           try/catch → JSON)
```

- **Entry point** (`src/index.ts`): loads env, forces DNS resolution to `8.8.8.8`/`1.1.1.1` (works around a Windows bug where Node's default resolver can't complete `mongodb+srv://` SRV lookups), mounts routers under `/api/<resource>`, then connects Mongoose before starting `app.listen`.
- **Auth model**: JWT-based. `User.generateAuthToken()` (in `models/user.ts`) signs a token with `TOKEN_KEY` and appends it to a `tokens` array on the user document, evicting the oldest token once more than 6 are stored (multi-device login support, capped). `middleware/auth.ts` validates the `Authorization: Bearer <token>` header against a user's stored `tokens` array (not just JWT signature validity — allows server-side token revocation) and attaches `req.user`/`req.token`. The `Request` type augmentation for `user`/`token` lives in `src/types/express.d.ts`.
- **Controllers** are always thin static-method classes — no controller instances, no logic beyond calling into a `dataServices` class and mapping errors to a 500 JSON response.
- Passwords are hashed with `bcryptjs`; `userSchema.methods.toJSON` strips `password` and `tokens` before any user document is serialized in a response.

### Current implementation status

Only **users** (`create-user`, `login`, `auto-login`) and **categories** (`create-category`) are implemented end-to-end (route → controller → dataService → model). **Items, favorites, and inquiries are scaffolded but empty** — `models/inquiry.ts`, `models/favoriteItem.ts`, `controllers/item.ts`, `controllers/inquiry.ts`, `controllers/favoriteItem.ts`, `routes/items.ts`, `routes/inquiries.ts`, `dataServices/itemServices.ts`, and `dataServices/favoriteItemServices.ts` are all empty files (only `models/item.ts` has a real schema). Treat these as not-yet-built rather than broken when asked to extend them.

The `auth` middleware exists but is not currently attached to any route.

**Known bug:** `src/index.ts` references `itemsRouter` on the `/api/items` mount but never imports it — this throws a `ReferenceError` at module load, so the server cannot start as-is. It also calls `app.use(cors())` twice. Fix before running `npm run dev` if you hit a startup crash.

<!-- Client section intentionally left for a future pass once that side stabilizes. -->
