# Socket notifications

Read this before adding a live notification connection. This app is the private dashboard at `https://admin.controfferta.it`. Paths below are relative to `src/`.

Socket.IO delivers a new notification. SWR holds the list, the unread count, and the read state. The socket is not a second cache. `/notifications` renders `lib/placeholders.ts` until the screen is wired.

## Where things live

| Piece | File |
|---|---|
| Socket origin | `NEXT_PUBLIC_SOCKET_URL`, returned as `socketUrl` from `envConfig` in `lib/env-config.ts` |
| Notification list key | `apiKeys.notifications` in `lib/api/keys.ts` |
| Connection | `components/notifications/socket-provider.tsx` |
| Screen | `components/notifications/`, rendered by `app/(main)/notifications/page.tsx` |
| Sidebar badge | `components/shared/sidebar.tsx`, from the same SWR query |

`app/(main)/layout.tsx` mounts `SocketProvider` inside the SWR defaults so a socket event can call `mutate`.

## Rules

- Connect with `socket.io-client` only from `SocketProvider`. Do not open a second socket in a page.
- Send the HttpOnly `auth_token` cookie with `withCredentials: true`. Do not read the token in client code, and do not pass it in `auth` or `localStorage`.
- On `notification`, call `mutate(apiKeys.notifications)` from `useSWRConfig`. Do not keep a notification array in the provider.
- Mark one as read, mark all as read, and delete go through `useSWRMutation` and `nextFetch`. See `docs/swr.md`.
- Do not add Redux, RTK Query, or a notification slice.
- Do not persist notifications in `localStorage` or `sessionStorage`.

## Connection

```tsx
"use client";

import { envConfig } from "@/lib/env-config";
import { apiKeys } from "@/lib/api/keys";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useSWRConfig } from "swr";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    const socket = io(envConfig().socketUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
    });

    const refresh = () => {
      void mutate(apiKeys.notifications);
    };

    socket.on("notification", refresh);
    socket.on("notification_count", refresh);

    return () => {
      socket.off("notification", refresh);
      socket.off("notification_count", refresh);
      socket.disconnect();
    };
  }, [mutate]);

  return children;
}
```

The list component stays a normal `useSWR(apiKeys.notifications)` reader. `isValidating` covers the refresh after a socket event. Keep showing the cached list while that request is in flight.

## Events

| Direction | Event | What the client does |
|---|---|---|
| Server → client | `notification` | `mutate(apiKeys.notifications)` |
| Server → client | `notification_count` | `mutate(apiKeys.notifications)` |
| Client → API | `PATCH` read, mark-all, delete | `useSWRMutation` on `apiKeys.notifications` |

Do not emit `remove_notification`, `get_notification_history`, or `test_notification`. History and read state belong to the HTTP API.

## What not to do

- Do not store the socket, the notification list, or the unread count in Redux.
- Do not point the socket at any origin other than `socketUrl` from `envConfig()` for `https://controfferta.it`.
- Do not add a test component that emits events from the dashboard.
- Do not mark a notification read only in component state. The write goes through SWR so the sidebar badge and the list stay on one cache.
