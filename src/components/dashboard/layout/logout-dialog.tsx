"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clearCurrentUser } from "@/hooks/use-current-user";
import { nextFetch } from "@/lib/api/fetcher";
import { apiKeys } from "@/lib/api/keys";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await nextFetch({ url: apiKeys.authLogout, method: "POST", payload: {} });
    } catch {
      // Continue to login even if the API is unavailable.
    } finally {
      await clearCurrentUser();
      onOpenChange(false);
      router.replace("/login");
    }
  };

  return (
    <Dialog open={open} onOpenChange={isLoggingOut ? undefined : onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-slate-200 bg-white text-slate-900 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-900">
            <span className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-600">
              <LogOut className="size-4" />
            </span>
            Log out?
          </DialogTitle>
          <DialogDescription className="pt-1 text-slate-500">
            Are you sure you want to log out of the admin dashboard?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoggingOut}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
