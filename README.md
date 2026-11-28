# Controfferta Admin Dashboard

Private administration dashboard for Controffretta, served at **`https://admin.controfferta.it`**.

This is the admin tooling for the Controffretta platform — it is **not** the public site at `https://controfferta.it`. It lets admins manage users, leads, credit packages, transactions, blogs, FAQs, categories, disclaimers, notifications, and platform settings.

> ⚠️ This repository owns only the dashboard frontend. The Controffretta API lives in a separate repository (`controfferta-backend`) and must not be modified from here.

---

## Tech stack

| Layer | Choice | Role |
|---|---|---|
| Framework | Next.js 15 (App Router) | Routes, layouts, metadata under `src/app/` |
| UI runtime | React 19 | Interactive screens are client components |
| Language | TypeScript 5 | Strict type checking enabled |
| Styling | Tailwind CSS 4 | Design tokens in `src/app/globals.css` |
| Font | Inter via `next/font/google` | Global `font-sans`, `display: "swap"` |
| Icons | Lucide React | Navigation and interface icons |
| Primitives | Radix UI / shadcn-style | Shared controls in `src/components/ui/` |
| Data fetching | SWR 2.5.1 | Only client cache (no Redux / RTK Query) |
| HTTP wrapper | `nextFetch` (`src/lib/api/fetcher.ts`) | All API calls go through this; `fetch` is not called directly |
| Forms | React Hook Form + Zod | Form state and validation |
| Toasts | `react-hot-toast` | Feedback notifications |
| Dates | date-fns, react-day-picker | Date formatting and picking |
| Phone input | `react-phone-number-input` | International phone fields |
| Rich text | Tiptap | Disclaimer / content editing |
| Charts | Recharts | Dashboard visualizations |
| Files | XLSX, jsPDF, jsPDF-AutoTable | Lead import and document export |
| Drag & drop | @dnd-kit | Reorderable lists |
| Animations | Framer Motion | Focused UI interactions |
| Realtime | Socket.IO client | Planned live notification connection |

---

## Project structure

Source lives entirely under `src/`. Root is reserved for tooling (`package.json`, `next.config.ts`, `tsconfig.json`, `AGENTS.md`).

```
src/
├── app/
│   ├── layout.tsx              # document shell, metadata, Inter, Toaster, SWR defaults
│   ├── globals.css             # Tailwind imports and design tokens
│   ├── not-found.tsx
│   ├── favicon.ico
│   ├── (auth)/                 # auth route group (not part of the URL)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── verify-otp/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── password-changed/page.tsx
│   └── (dashboard)/            # admin route group (not part of the URL)
│       ├── layout.tsx          # sidebar, header, SocketProvider, route guard
│       ├── page.tsx            # dashboard overview (/)
│       ├── users/page.tsx
│       ├── leads/page.tsx
│       ├── leads/import/page.tsx
│       ├── categories/page.tsx
│       ├── blogs/page.tsx
│       ├── blogs/new/page.tsx
│       ├── credit-packages/page.tsx
│       ├── transactions/page.tsx
│       ├── notifications/page.tsx
│       ├── settings/page.tsx
│       ├── platform-settings/page.tsx
│       ├── faqs/page.tsx
│       ├── disclaimer/page.tsx
│       ├── disclaimer/general/page.tsx
│       └── disclaimer/[type]/page.tsx
├── components/
│   ├── ui/                     # shared primitives (button, input, dialog, table, …)
│   ├── layout/                 # admin chrome: sidebar.tsx, header.tsx
│   ├── dashboard/<route>/      # screen-specific components (users/, leads/, blogs/, …)
│   ├── notifications/          # socket-provider.tsx
│   └── swr-config.tsx          # root SWR defaults
├── hooks/                      # use-current-user, use-mobile, use-search-param
├── lib/
│   ├── api/
│   │   ├── keys.ts             # every SWR cache key
│   │   └── fetcher.ts          # nextFetch and swrFetcher
│   ├── env-config.ts           # envConfig() — NEXT_PUBLIC_API_BASE_URL / socketUrl
│   ├── utils.ts
│   └── placeholders.ts         # static sample data until a screen calls the API
├── schemas/                    # Zod validation schemas (e.g. change-password)
├── types/                      # TypeScript interfaces (user, lead, blog, …)
└── utils/                      # small helpers (datetime, safe-redirect, socket)
```

### Naming conventions

- Files and folders: lowercase with hyphens (`env-config.ts`, `users/user-table.tsx`).
- The exported React component is the only PascalCase name (file `sidebar.tsx` → `Sidebar`).
- Next.js reserved files keep their names: `page.tsx`, `layout.tsx`, `not-found.tsx`.
- Route pages stay thin — they render a component from `components/<route>/`. No large UI inside `page.tsx`.

---

## Routes

Route groups in parentheses are not part of the URL.

### Admin shell — `(dashboard)`

| URL | What it does |
|---|---|
| `/` | Dashboard overview |
| `/users` | User management — list, search, status filter, suspend/reactivate **(connected to API)** |
| `/leads` | Lead list |
| `/leads/import` | Lead import (XLSX) |
| `/categories` | Category management |
| `/blogs` | Blog list |
| `/blogs/new` | Create a blog post |
| `/credit-packages` | Credit package management |
| `/transactions` | Credit purchase / ledger transactions |
| `/notifications` | Notification list and unread count |
| `/settings` | User profile settings |
| `/platform-settings` | Platform-wide settings |
| `/faqs` | FAQ management |
| `/disclaimer` | Disclaimer / general information |
| `/disclaimer/general` | General disclaimer content |
| `/disclaimer/[type]` | Typed disclaimer content |

### Auth — `(auth)`

| URL | What it does |
|---|---|
| `/login` | Sign in |
| `/forgot-password` | Password reset request |
| `/verify-otp` | OTP verification |
| `/reset-password` | Set new password |
| `/password-changed` | Reset confirmation |

Every route is `noindex` / `nofollow`. The canonical origin is `https://admin.controfferta.it` and is set as `metadataBase` in the root layout.

---

## Getting started

### Prerequisites

- Node.js 20+
- A package manager (npm, yarn, pnpm, or bun). The repository contains both `package-lock.json` and `yarn.lock` — pick one and stay consistent; do not regenerate the other lockfile unnecessarily.

### Install

```bash
npm install
# or
yarn install
```

### Environment variables

Copy the example file and adjust for your environment:

```bash
cp .env.example .env
```

`.env.example`:

```env
# Controfferta API origin including the /api/v1 prefix.
NEXT_PUBLIC_API_BASE_URL=http://10.10.26.188:5013/api/v1

# Reserved for the future Socket.IO notification provider.
NEXT_PUBLIC_SOCKET_URL=http://10.10.26.188:5013
```

Read values through `envConfig()` in `src/lib/env-config.ts`. Components must never hardcode an API host.

### Run the dev server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000). The app auto-reloads as you edit files.

### Other scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Data layer (API integration)

The dashboard uses **SWR as its only client-side cache**. Do not add Redux, RTK Query, or a second fetch cache, and do not read the API from `useEffect` + `useState`.

### How a screen reads API data

1. Register the endpoint path in `src/lib/api/keys.ts` as an `apiKeys` entry (dynamic paths are functions).
2. Read with `useSWR(apiKeys.someKey)` — the global `SWRConfig` already uses `swrFetcher`, which is a GET through `nextFetch`.
3. Write with `useSWRMutation(apiKeys.someKey, …)` using the same cache key so SWR revalidates after the write.
4. Every request goes through `nextFetch` from `src/lib/api/fetcher.ts`. Do not call `fetch` directly.
5. `nextFetch` always sends `credentials: "include"` so the HttpOnly `auth_token` cookie is included. Client code never reads or stores the token.
6. Configuration is read through `envConfig()` in `src/lib/env-config.ts`.

Example cache keys (`src/lib/api/keys.ts`):

```ts
export const apiKeys = {
  users: (query = "") => `/users/all${query ? `?${query}` : ""}`,
  user: (id: string) => `/users/${id}`,
  userStatus: (id: string) => `/users/${id}/status`,
  leads: (query = "") => `/leads/all${query ? `?${query}` : ""}`,
  categories: (query = "") => `/categories${query ? `?${query}` : ""}`,
  blogs: (query = "") => `/blogs${query ? `?${query}` : ""}`,
  transactions: (query = "") => `/transactions/all${query ? `?${query}` : ""}`,
  notifications: (query = "") => `/notifications/me${query ? `?${query}` : ""}`,
  profile: "/profile",
  settings: "/settings",
  // …
} as const;
```

### Connection status

The shared SWR/API foundation is implemented (`swr-config.tsx`, `lib/api/`, `lib/env-config.ts`). The **Users screen is connected** to the admin API:

- `GET /users/all?page=&limit=&searchTerm=&status=` — server-side paginated list with search and status filters
- `PATCH /users/:id/status` — `{ status: "active" | "suspended" | "banned" }`

All other screens (leads, categories, blogs, credit packages, transactions, notifications, settings, disclaimer, faqs) run on **static sample data** locally in their components until their endpoint contracts are confirmed with the backend. Migrate one screen at a time; do not remove sample data until the API path is verified.

### Authentication

- Session is an HttpOnly `auth_token` cookie.
- Client requests include the cookie automatically via `credentials: "include"`.
- Do **not** put the access token, API results, or notifications in `localStorage`, `sessionStorage`, or `document.cookie`.
- Server-side requests may pass the token from `getAuthToken()` when the upstream API requires `Authorization: Bearer`.
- Do not add a login flow until the cookie contract is confirmed with the backend.

---

## Realtime notifications (planned)

Socket.IO delivery of new notifications is wired but not yet connected to a live backend:

- Connection origin: `NEXT_PUBLIC_SOCKET_URL` via `envConfig().socketUrl`
- Provider: `src/components/notifications/socket-provider.tsx` (`SocketProvider`)
- Only one socket is opened, inside `SocketProvider`. Do not open a second socket in a page.
- The socket sends `withCredentials: true` (HttpOnly cookie). Client code never reads the token.
- On a `notification` or `notification_count` event, call `mutate(apiKeys.notifications)` — SWR holds the list; the socket is not a second cache.

See `docs/socket-implementation.md` before connecting.

---

## Component guidelines

- A new admin screen: `app/(dashboard)/<segment>/page.tsx` renders `components/<segment>/<Name>.tsx`.
- Auth screens: `app/(auth)/<segment>/page.tsx`.
- Shared primitives: `components/ui/`.
- Admin chrome (sidebar, header): `components/layout/`.
- Static sample data for a screen not yet wired to the API belongs in the screen component; shared sample data goes in `lib/placeholders.ts`.
- When a rule changes, update the matching doc in `docs/` in the same change.

Documentation for contributors lives in `docs/`:

| Doc | Covers |
|---|---|
| `docs/project-structure.md` | Where files go, naming, routes |
| `docs/swr.md` | Data fetching, `nextFetch`, `apiKeys`, `useSWR` / `useSWRMutation` |
| `docs/api-integration.md` | API boundary, env, auth, screen-to-backend mapping |
| `docs/socket-implementation.md` | Live notification connection |
| `docs/performance-and-seo.md` | Metadata, `noindex`, performance rules |
| `docs/tech-stack.md` | Stack and current data-model status |

---

## Performance & SEO

- This is a private dashboard; every route stays out of search indexes (`robots: { index: false, follow: false }`).
- `metadataBase` is `https://admin.controfferta.it`. Do not point it at the public site.
- One `h1` per page, matching the screen; sections use `h2`/`h3` in order.
- Admin data changes per signed-in user, so it is never cached in the Next.js fetch cache — it stays on the client with SWR.
- Keep the UI light: add `"use client"` only where state/events/SWR are needed; do not add a library for something CSS or an existing primitive can do.

---

## Security rules

- The canonical origin is `https://admin.controfferta.it`. Every route stays out of search indexes.
- SWR is the only client cache. Do not add Redux or RTK Query.
- Do not put the access token, API results, or notifications in `localStorage`, `sessionStorage`, or `document.cookie`. The session cookie is HttpOnly.
- Do not point HTTP or socket clients at a host other than the Controfferta API from `envConfig()`.
- Do not add a library for something CSS or a small component can do.

---

## Contributing

1. Create a branch from `main`.
2. Make the smallest change needed; leave unrelated screens, redirects, and dependencies alone.
3. Follow the `docs/` conventions and update the matching doc if a rule changes.
4. Run `npm run lint` and `npm run build` before opening a pull request.
5. Do not modify the Controfferta API repository from this one.

---

## Developer

Built with love by **Rahad Ullah**.

- <a href="mailto:rahadullah10@gmail.com" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:8px 16px;margin-top:6px;background:#0F172A;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid #334155;transition:background 0.2s;">Email rahadullah10@gmail.com</a>
- <a href="https://rahad-ullah.vercel.app" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:8px 16px;margin-top:6px;background:#0F172A;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;border:1px solid #334155;transition:background 0.2s;">Visit Portfolio</a>


---

## License

Private — Controfferta admin dashboard.
