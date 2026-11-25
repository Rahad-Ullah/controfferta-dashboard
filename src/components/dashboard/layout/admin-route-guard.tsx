"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { clearCurrentUser, useCurrentUser } from "@/hooks/use-current-user";
import { nextFetch } from "@/lib/api/fetcher";
import { apiKeys } from "@/lib/api/keys";

export default function AdminRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, error, isLoading } = useCurrentUser();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  useEffect(() => {
    if (isLoading || !error) return;

    void nextFetch({ url: apiKeys.authLogout, method: "POST", payload: {} })
      .catch(() => undefined)
      .finally(() => {
        void clearCurrentUser();
        router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}&reason=session-expired`);
      });
  }, [error, isLoading, pathname, router]);

  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      router.replace("/login?reason=not-authorized");
    }
  }, [isAdmin, isLoading, router, user]);

  if (isLoading || error || !user || !isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#EDF0F3] text-[#00BC7D]">
        <Loader2 className="size-7 animate-spin" aria-label="Checking administrator access" />
      </div>
    );
  }

  return children;
}
