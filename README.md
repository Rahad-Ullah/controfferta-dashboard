# Controfferta Admin Dashboard

Private administration dashboard for Controfferta, served at **`https://admin.controfferta.it`**.

This is the admin tooling for the Controfferta platform — it is **not** the public site at `https://controfferta.it`. It lets admins manage users, leads, credit packages, transactions, blogs, FAQs, categories, disclaimers, notifications, and platform settings.

> ⚠️ This repository owns only the dashboard frontend. The Controfferta API lives in a separate repository (`controfferta-backend`) and must not be modified from here.

---

## Tech stack

| Category | Technologies |
|---|---|
| Framework | Next.js 15, React 19, TypeScript |
| UI | Tailwind CSS 4, Radix UI, Lucide React |
| Data & forms | SWR, React Hook Form, Zod |
| Content & charts | Tiptap, Recharts |
| Realtime | Socket.IO client |

---

## Project structure

Source lives under `src/`: routes in `app/`, UI in `components/`, and shared logic in `hooks/`, `lib/`, `schemas/`, `types/`, and `utils/`.

### Naming conventions

- Use lowercase, hyphenated file and folder names.
- Keep route pages thin; render screen components from `components/`.

---

## Routes

Route groups `(auth)` and `(dashboard)` are not part of the URL. The dashboard includes user, lead, blog, transaction, notification, settings, FAQ, category, credit package, and disclaimer screens. Every route is `noindex` / `nofollow`.

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

## API and security

- SWR is the only client cache. Register endpoints in `src/lib/api/keys.ts` and use `nextFetch` for requests.
- Use `envConfig()` for API and socket configuration; never hardcode hosts.
- Authentication uses the HttpOnly `auth_token` cookie with `credentials: "include"`.
- Never store tokens, API results, or notifications in `localStorage`, `sessionStorage`, or `document.cookie`.
- Screens without a confirmed endpoint should use placeholder data until the API contract is verified.

---

## Realtime notifications

Socket.IO support is prepared but remains dependent on the live backend. Follow `docs/socket-implementation.md` before connecting it.

---

## Documentation

Detailed conventions live in [`docs/`](docs/), including project structure, SWR, API integration, sockets, performance, SEO, and the current tech stack.

---

## SEO

This is a private dashboard. Keep `metadataBase` set to `https://admin.controfferta.it` and every route `noindex` / `nofollow`.

---

## Contributing

1. Create a branch from `main`.
2. Make the smallest change needed; leave unrelated screens, redirects, and dependencies alone.
3. Follow the `docs/` conventions and update the matching doc if a rule changes.
4. Run `npm run lint` and `npm run build` before opening a pull request.
5. Do not modify the Controfferta API repository from this one.

---

## Developer

Built with ❤️ by [**Rahad Ullah**](mailto:rahadullah10@gmail.com)

> "Taking complex ideas from zero to production—building scalable backends and intuitive interfaces that users love."

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Rahad-Ullah) [![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=react&logoColor=white)](https://rahad-ullah.vercel.app/)

---

### Happy Coding 🚀
