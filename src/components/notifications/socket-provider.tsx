"use client";

import { envConfig } from "@/lib/env-config";
import { useEffect, type ReactNode } from "react";
import { io } from "socket.io-client";
import { useSWRConfig } from "swr";

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    const { socketUrl } = envConfig();

    if (!socketUrl) {
      return;
    }

    const socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      withCredentials: true,
    });

    const refreshNotifications = () => {
      void mutate(
        (key: unknown) =>
          typeof key === "string" && key.startsWith("/notifications/me"),
      );
    };

    socket.on("notification", refreshNotifications);
    socket.on("notification_count", refreshNotifications);

    return () => {
      socket.off("notification", refreshNotifications);
      socket.off("notification_count", refreshNotifications);
      socket.disconnect();
    };
  }, [mutate]);

  return children;
}
