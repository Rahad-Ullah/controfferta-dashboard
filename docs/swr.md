# SWR data fetching

Read this before adding or changing API calls. This app is the private dashboard at `https://admin.controfferta.it`. Use SWR `2.5.1`. Paths below are relative to `src/`.

`components/swr-config.tsx` wraps the app from `app/layout.tsx`, and its `SWRConfig` uses `swrFetcher`. Until a screen's endpoint contract is confirmed, that screen keeps static sample data locally in its own component (per `AGENTS.md`). `lib/placeholders.ts` is the designated home for shared sample data once a screen is wired to the API; it is currently empty because no screen imports from it.

## Where things live

| Piece | File |
|---|---|
| Cache keys | `lib/api/keys.ts` |
| Universal fetch | `lib/api/fetcher.ts` (`nextFetch`, `swrFetcher`) |
| SWR defaults | `components/swr-config.tsx` |
| API origin | `NEXT_PUBLIC_API_BASE_URL`, returned as `apiBaseUrl` from `envConfig` in `lib/env-config.ts` |
| Static screen data | `lib/placeholders.ts` |
| Auth cookie | `lib/auth-cookie.ts`, added when login is connected |

## Rules

- Add every new endpoint path to `apiKeys` in `lib/api/keys.ts`. Do not write a raw path string inside a component.
- Pass that same `apiKeys` value to both `useSWR` and `useSWRMutation`. SWR then revalidates the client query after the write.
- Do not give `useSWR` its own fetcher. `SWRConfig` already uses `swrFetcher`, which is a GET through `nextFetch`.
- Every other call, including writes and server fetches, goes through `nextFetch`. Do not call `fetch` directly for this API.
- `nextFetch` always sends `credentials: "include"`. On the client, omit `token`. The `auth_token` cookie is `HttpOnly`, so client code cannot read it.
- On the server, pass `token` from `getAuthToken()` in `lib/auth-cookie.ts` when the upstream API expects `Authorization: Bearer`.
- Do not set `cache`, `next.revalidate`, or `next.tags` on these requests. Admin data changes per signed-in user. See `docs/performance-and-seo.md`.
- Do not store API results or the access token in `localStorage`.

## 1. Register the cache key

```ts
// lib/api/keys.ts
export const apiKeys = {
  users: "/users",
  leads: "/leads",
  lead: (id: string) => `/leads/${id}`,
} as const;
```

Dynamic paths are functions in the same object. Add a key when a screen is wired: transactions, credit packages, categories, notifications, profile, FAQ, and disclaimer follow the same shape.

## 2. Read with useSWR

The hook key is the path. `swrFetcher` calls `nextFetch({ url: key })`.

```tsx
"use client";

import useSWR from "swr";
import { apiKeys } from "@/lib/api/keys";

export interface User {
  id: number;
  name: string;
}

export function UsersList() {
  const { data: users, error, isLoading, isValidating } = useSWR<User[]>(apiKeys.users);

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Failed to load: {error.message}</div>;

  return (
    <ul>
      {isValidating && <small>Syncing...</small>}
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

`isLoading` is the first load with no cached data. `isValidating` is any in-flight request. Keep showing the cached list while `isValidating` is true.

## 3. Write with useSWRMutation

Use the same `apiKeys` value. The mutation fetcher receives that key as `url`, and `trigger(payload)` places the payload on `{ arg }`.

`populateCache: false` keeps a list cache from being replaced by a single created record. `revalidate: true` refetches every `useSWR(apiKeys.users)` after the write succeeds.

When a screen reads with query parameters (for example `apiKeys.users(query)` for paginated search), the mutation key is the bare collection key (`apiKeys.users()`). `revalidate: true` revalidates the base collection cache, but the screen should additionally call `mutate(readKey)` after the write to revalidate the specific paginated view that the user sees.

```tsx
"use client";

import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { apiKeys } from "@/lib/api/keys";
import { nextFetch } from "@/lib/api/fetcher";
import type { User } from "./users-list";

export function AddUserForm() {
  const [name, setName] = useState("");

  const { trigger, isMutating, error } = useSWRMutation(
    apiKeys.users,
    (url: string, { arg }: { arg: { name: string } }) =>
      nextFetch<User>({ url, method: "POST", payload: arg }),
    { revalidate: true, populateCache: false }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await trigger({ name }, { throwOnError: true });
      setName("");
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isMutating}
      />
      <button type="submit" disabled={isMutating || !name.trim()}>
        {isMutating ? "Adding..." : "Add User"}
      </button>
      {error && <p>{error.message}</p>}
    </form>
  );
}
```

`PATCH` and `DELETE` use the same shape. Change `method`. `isMutating` is the loading flag. Do not add a second `useState` for the request.

If one write must refresh a second query, call `mutate(apiKeys.other)` from `useSWRConfig` after `trigger` resolves.

## 4. nextFetch

```ts
await nextFetch<User[]>({
  url: apiKeys.users,
  method: "GET",
  token, // server only, from getAuthToken()
});

await nextFetch<User>({
  url: apiKeys.users,
  method: "POST",
  payload: { name: "Marco" },
});
```

`url` may be a path (`/users`) or an absolute URL. Paths are prefixed with `apiBaseUrl` from `envConfig()`. A non-OK response throws `ApiError` with `status` and `message`. A `204` returns `null`.

## What not to do

- Do not add another client cache, and do not fetch this API from `useEffect` plus `useState`. Do not add Redux or RTK Query.
- Do not put the access token in `localStorage`, `sessionStorage`, or `document.cookie`.
- Do not point new requests at any origin other than the Controfferta API for `https://controfferta.it`.
- Do not cache admin responses with `cache: "force-cache"` or `next.revalidate`.
