# Project structure

Read this before adding files. Client data fetching also follows `docs/swr.md`.

This app is the CONTROFFERTA.IT admin dashboard. Source lives under `src/`. Paths below are relative to `src/` unless they start with `docs/` or name a root tooling file.

## Naming

- File and folder names are lowercase with hyphens: `env-config.ts`, `users/user-table.tsx`.
- The exported React component is the only PascalCase name: file `sidebar.tsx`, function `Sidebar`.
- Next.js reserved files stay as they are: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
- Do not add new source files in the repository root. Root is for tooling: `package.json`, `next.config.ts`, `tsconfig.json`.

## Where code goes

| Path | Put it here |
|---|---|
| `app/` | Routes only. One `page.tsx` per URL. Layouts wrap a segment. |
| `app/api/` | Route handlers this Next app owns, such as auth cookie set and clear. |
| `components/ui/` | Shared primitives (button, input, dialog). |
| `components/layout/` | Admin chrome used on every dashboard screen. `sidebar.tsx` and `header.tsx` stay here because `app/(main)/layout.tsx` renders them on every route. |
| `components/<route>/` | Sections for one screen. The folder name matches the URL segment: `home/`, `users/`, `leads/`, `categories/`, `blogs/`, `pricing/`, `transactions/`, `notifications/`, `settings/`, `faqs/`, `disclaimer/`. |
| `components/swr-config.tsx` | Root SWR defaults. `app/layout.tsx` wraps every page with `SwrDefaults`. |
| `lib/` | Shared modules that are not React components. |
| `lib/api/keys.ts` | Every SWR cache key. |
| `lib/api/fetcher.ts` | `nextFetch` and `swrFetcher`. |
| `lib/env-config.ts` | `envConfig()`. Public and server env values. |
| `lib/auth-cookie.ts` | HttpOnly `auth_token` helpers. Server only. Add this when login is connected. |
| `lib/placeholders.ts` | Static screen data until a screen calls the API. |
| `utils/` | Small helpers that are not the API or auth layer. Prefer `lib/` for new shared modules. |
| `docs/` | Instructions for agents. Update the matching doc when a rule changes. |
| Shared types | Put a type next to the module that uses it. Add a root `types.ts` only when two features import the same type. |

## Routes

Route groups choose the layout. A group name in parentheses is not part of the URL. The root `app/layout.tsx` stays the document shell (`html`, `body`, providers). Do not pick a layout from `localStorage`.

| Group | Layout | Screens |
|---|---|---|
| `(main)` | `app/(main)/layout.tsx` | Admin shell: `/`, `/users`, `/leads`, `/leads/import`, `/categories`, `/blogs`, `/pricing`, `/transactions`, `/notifications`, `/settings`, `/faqs`, `/disclaimer/privacy_policy`, `/disclaimer/terms_of_service`, `/disclaimer/general` |

There is no auth group yet. When login is connected, add `app/(auth)/layout.tsx` for login and password recovery, and keep the session in an HttpOnly cookie.

- A new admin screen goes in `app/(main)/<segment>/page.tsx`.
- Do not invent a `pages/` directory.
- Keep route files thin. Render a component from `components/<route>/`. Do not build a large UI inside `page.tsx`.

## Adding a feature

1. Add the path to `lib/api/keys.ts`.
2. Read with `useSWR(apiKeys.someKey)` and write with `useSWRMutation(apiKeys.someKey, ...)`. See `docs/swr.md`.
3. Call the API only through `nextFetch`.
4. Put the screen component in `components/<route>/<name>.tsx` and export it as PascalCase.
5. Until the endpoint exists, read static data from `lib/placeholders.ts`.
6. Read configuration through `envConfig()` in `lib/env-config.ts`. Do not add another env module.
7. Do not put the access token in `localStorage`, `sessionStorage`, or `document.cookie`.

## What not to do

- Do not create `camelCase` or `PascalCase` file names.
- Do not add a second data cache. SWR is the client cache. Do not add Redux or RTK Query.
- Do not leave a new helper in the repository root.
- Do not put screen data inline in `page.tsx` once `lib/placeholders.ts` exists for that screen.
