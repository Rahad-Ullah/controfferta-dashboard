# Agent guidelines

Read this before changing the repo. This app is the private Controfferta admin dashboard at `https://admin.controfferta.it`. It is not the public site at `https://controfferta.it`, and it is not The Cloud Salon.

Source lives under `src/`. Paths in the docs are relative to `src/` unless they start with `docs/` or name a root tooling file.

## Read the matching doc

| Before you… | Read |
|---|---|
| Add or move a file, route, or component | `docs/project-structure.md` |
| Change UI, metadata, images, or fonts | `docs/performance-and-seo.md` |
| Fetch or write API data | `docs/swr.md` |
| Add live notifications | `docs/socket-implementation.md` |

Follow those docs. Do not invent a second pattern beside them. If a file they name does not exist yet, create it when the task needs it, in the place that doc names.

## How to change the app

- Change only what the task needs. Leave unrelated screens, redirects, and dependencies alone.
- A new screen is a thin `app/(main)/<segment>/page.tsx` that renders `components/<segment>/<name>.tsx`.
- Folder names match the URL. Existing screens are plural where the product is a list: `/users`, `/leads`, `/blogs`, `/faqs`, `/transactions`.
- Layout chrome (sidebar, header) stays in `components/layout/`. Primitives stay in `components/ui/`.
- File names are lowercase with hyphens. The exported React component is the only PascalCase name.
- Until an endpoint exists, keep that screen on static sample data. Put new sample data in `lib/placeholders.ts`.
- When an endpoint exists, register it in `lib/api/keys.ts` and use SWR. See `docs/swr.md`.
- Configuration goes through `envConfig()` in `lib/env-config.ts`.
- If you change a rule, update the matching doc in `docs/` in the same change.

## Product rules

- The canonical origin is `https://admin.controfferta.it`. Every route stays out of search indexes.
- SWR is the only client cache. Do not add Redux or RTK Query.
- Do not put the access token, API results, or notifications in `localStorage`, `sessionStorage`, or `document.cookie`. The session cookie is HttpOnly.
- Do not point HTTP or socket clients at a host other than the Controfferta API from `envConfig()`.
- Do not add a library for something CSS or a small component can do.

## What not to do

- Do not copy a salon, marketplace, or public-site pattern into this dashboard.
- Do not build a large UI inside `page.tsx`.
- Do not create `camelCase` or `PascalCase` file names.
- Do not add source files in the repository root. Root is for tooling: `package.json`, `next.config.ts`, `tsconfig.json`, `AGENTS.md`.
- Do not expand a task into a rewrite of every screen.
