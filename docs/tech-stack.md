# Tech stack

Controfferta Admin is a private, responsive administration dashboard for `https://admin.controfferta.it`. This repository currently focuses on the dashboard UI; backend integration is the next implementation phase.

## Stack

| Layer | Choice | Current use |
|---|---|---|
| Framework | Next.js 15 App Router | Routes and layouts live under `src/app/`. |
| UI runtime | React 19 | Client components are used for interactive screens. |
| Language | TypeScript 5 | Strict type checking is enabled. |
| Styling | Tailwind CSS 4 | Global design tokens and responsive utilities live in `src/app/globals.css`. |
| Font | Inter via `next/font/google` | Applied globally with `font-sans`. |
| Icons | Lucide React | Navigation and interface icons. |
| Primitives | Radix UI/shadcn-style components | Shared controls live in `src/components/ui/`. |
| Notifications | `react-hot-toast` and Sonner dependencies | Toast feedback and notification UI. |
| Animation | Framer Motion | Available for focused UI interactions. |
| Rich text | Tiptap and Jodit | Disclaimer/content editing. |
| Charts | Recharts | Available for dashboard visualizations. |
| Files/data tools | XLSX, jsPDF, jsPDF AutoTable | Lead import and document/export workflows. |
| Realtime client | Socket.IO client | Installed for the planned notification integration. |

## Application structure

```text
src/
├── app/
│   ├── layout.tsx                 # document shell, metadata, Inter, toaster
│   ├── globals.css                # Tailwind imports and design tokens
│   └── (dashboard)/               # admin route group; group name is not in URLs
│       ├── layout.tsx              # sidebar, header, content shell
│       ├── page.tsx                # dashboard overview at /
│       ├── users/page.tsx
│       ├── leads/page.tsx
│       ├── leads/import/page.tsx
│       ├── categories/page.tsx
│       ├── blogs/page.tsx
│       ├── pricing/page.tsx
│       ├── transactions/page.tsx
│       ├── notifications/page.tsx
│       ├── settings/page.tsx
│       ├── faqs/page.tsx
│       ├── services/page.tsx
│       └── disclaimer/...
├── components/
│   ├── dashboard/                 # screen-specific dashboard components
│   └── ui/                        # shared UI primitives
├── hooks/                         # reusable client hooks
└── lib/                           # shared non-React helpers and placeholders
```

Routes should remain thin. A route page renders a screen component from `src/components/dashboard/<route>/`; large feature UI should not be built directly inside `page.tsx`.

## Current data model

The current screens use local constants and `useState` for sample users, leads, categories, blogs, packages, transactions, notifications, profile data, and disclaimer content. This is intentional while the API is not connected.

The implemented/planned data layer is:

- SWR is configured globally for all future per-user client data.
- The shared fetcher is implemented in `src/lib/api/fetcher.ts`.
- Endpoint keys are registered in `src/lib/api/keys.ts`.
- `NEXT_PUBLIC_API_BASE_URL` is read through `envConfig()`.
- HttpOnly session cookies are planned; no token or API-result persistence is allowed in browser storage.

See [`docs/api-integration.md`](./api-integration.md) and [`docs/swr.md`](./swr.md) before wiring a screen.

## Responsive behavior

- Mobile widths use the sidebar as an off-canvas sheet.
- Tablet widths use the icon-collapsed sidebar.
- Laptop and desktop widths use the expanded sidebar by default.
- Dashboard cards and content grids use responsive Tailwind breakpoints.
- Dense tables use an internal horizontal scroll area on narrow screens.

## Assets and metadata

- Full sidebar logo: `public/images/logo.png`.
- Collapsed sidebar mark and favicon: `public/icons/apple-touch-icon.png`.
- Browser favicon: `src/app/favicon.ico`.
- The root layout sets the canonical admin origin, dynamic title template, private-dashboard `noindex` metadata, and Inter font loading.

## Development commands

```bash
npm run dev       # start the development server
npm run lint      # run ESLint
npm run build     # create a production build
npm run start     # serve the production build
```

The repository contains both `package-lock.json` and `yarn.lock`; use one package manager consistently for a given change and do not regenerate the other lockfile unnecessarily.

## Architectural constraints

- Keep all application source under `src/`.
- Use lowercase, hyphenated filenames except for Next reserved files.
- Keep the admin origin separate from the public Controfferta site.
- Do not add Redux, RTK Query, or another client cache.
- Do not store tokens, API results, or notifications in `localStorage`, `sessionStorage`, or non-HttpOnly cookies.
- Do not add a dependency when CSS or an existing primitive solves the problem.

## Routes

| URL | Who | Layout |
|---|---|---|
| `/`, `/users`, `/leads`, `/leads/import` | Admin | `src/app/(dashboard)` |
| `/categories`, `/blogs`, `/pricing`, `/transactions` | Admin | `src/app/(dashboard)` |
| `/notifications`, `/settings`, `/faqs`, `/services` | Admin | `src/app/(dashboard)` |
| `/disclaimer/*` | Admin content management | `src/app/(dashboard)` |

## Read next

| Question | Doc |
|---|---|
| Where does a file go? | `docs/project-structure.md` |
| How do we call the API? | `docs/swr.md` |
| Which backend route do we call? | `docs/api-integration.md` |
| What must stay fast and indexable? | `docs/performance-and-seo.md` |
