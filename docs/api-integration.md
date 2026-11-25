# API integration

This is the API integration guide for the private Controfferta admin dashboard at `https://admin.controfferta.it`.

## Current status

The dashboard is currently a UI prototype. Screens use local constants and component state; the API client, SWR provider, cache-key registry, environment module, authentication cookie helpers, and socket provider are not implemented yet.

When a screen is connected, migrate one screen at a time. Keep all screens that are not connected on their existing sample data.

## API boundary

The API is maintained in a separate repository. Website work must not modify that repository.

| Item | Value |
|---|---|
| Backend repository | `C:\Users\Rahad-Ullah\projects\controfferta-backend` |
| Branch | `main` |
| Development API | `http://10.10.26.188:5013` |
| API prefix | `/api/v1` |
| Development Swagger | `http://10.10.26.188:5013/api-docs` |
| OpenAPI document | `http://10.10.26.188:5013/api-docs/v1.json` |

The frontend must read the API origin from `NEXT_PUBLIC_API_BASE_URL` through `envConfig()`. Components must never hardcode an API host.

## Required frontend structure

The API layer follows this structure when it is added:

| Responsibility | File |
|---|---|
| Environment values | `src/lib/env-config.ts` |
| Endpoint/cache keys | `src/lib/api/keys.ts` |
| HTTP wrapper | `src/lib/api/fetcher.ts` |
| SWR defaults | `src/components/swr-config.tsx` |
| Server cookie helpers | `src/lib/auth-cookie.ts` |
| Temporary data | `src/lib/placeholders.ts` |

Use SWR as the only client-side cache. Do not introduce Redux, RTK Query, a second fetch cache, or `useEffect` plus `useState` for API reads.

## Integration workflow

1. Confirm the backend route and response shape before changing the screen.
2. Add the endpoint path to `apiKeys` in `src/lib/api/keys.ts`.
3. Implement reads with `useSWR(apiKeys.someKey)`.
4. Implement writes with `useSWRMutation` using the same cache key.
5. Route every request through `nextFetch`; do not call `fetch` directly from a component.
6. Keep loading, validating, empty, and error states visible in the screen.
7. Revalidate the relevant SWR key after a successful write.
8. Remove screen-local sample data only after the API path is verified.

Example cache keys:

```ts
export const apiKeys = {
  users: "/users",
  user: (id: string) => `/users/${id}`,
  leads: "/leads",
  lead: (id: string) => `/leads/${id}`,
  notifications: "/notifications",
} as const;
```

## Authentication and security

- The session must use an HttpOnly `auth_token` cookie.
- Client requests send `credentials: "include"`.
- Client code must not read or persist access tokens.
- Do not use `localStorage`, `sessionStorage`, or `document.cookie` for tokens, API results, or notifications.
- Server-side requests may pass the token from `getAuthToken()` when the upstream API requires a bearer header.
- Do not add a login flow to the dashboard until the cookie contract is confirmed with the backend.

## Backend investigation order

When the backend repository is available for read-only inspection, use this order:

1. `src/routes/index.ts` for the module prefix.
2. The module route file for the HTTP method, path, auth middleware, and validation schema.
3. The module validation file for body and query requirements.
4. The controller for the response status, message, and data shape.
5. The module documentation file when the route files are insufficient.

If the API does not return a field required by the UI, stop and report the gap. Do not modify the backend from this repository.

## Response handling

The expected success envelope is:

```ts
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
  };
};
```

Expected error statuses are 400 for validation, 401 for a missing or invalid session, and 403 for insufficient permissions. The shared fetcher should convert non-OK responses into a typed error for the screen to render.

## Screen mapping

| Dashboard screen | Likely backend area |
|---|---|
| Users | `user` |
| Leads and lead import | `lead` |
| Categories | `category` |
| Credit packages | `creditPackage` |
| Transactions | `creditPurchase` and `creditLedger` |
| Notifications | `notification` |
| Profile/settings | `user` and `auth` |
| Blogs | `blog` |
| FAQs | `faq` |
| Disclaimers/general information | platform content/configuration |
| Services and bookings | service/booking modules, after backend confirmation |

These mappings are starting points, not contracts. Confirm each route in the backend before implementing it.

## Live notifications

When notifications are connected, use one Socket.IO connection in a provider under `src/components/dashboard/notifications/`. Socket events should trigger `mutate(apiKeys.notifications)`; the socket must not maintain a second notification cache. See `docs/socket-implementation.md`.
