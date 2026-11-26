"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Blog } from "@/types/blog.interface";

export default function BlogDeleteDialog({ blog, open, onOpenChange, onConfirm, isMutating }: { blog: Blog | null; open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; isMutating: boolean }) {
  if (!blog) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0 sm:!max-w-md">
        <DialogHeader className="border-b border-slate-100 bg-slate-50/70 p-5 pr-14 text-left">
          <DialogTitle className="flex items-center gap-3 text-[#0F172A]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-500"><Trash2 className="h-5 w-5" /></span>
            <span>Delete Blog</span>
          </DialogTitle>
          <DialogDescription className="pl-[52px]">Remove this article from the dashboard.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-5">
          <p className="text-sm leading-6 text-slate-600">Are you sure you want to delete <span className="font-semibold text-[#0F172A]">“{blog.title}”</span>?</p>
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs leading-5 text-amber-800"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>This action cannot be undone. The article will be permanently removed from the blog list.</span></div>
        </div>
        <DialogFooter className="border-t border-slate-100 bg-slate-50/70 p-4"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="button" variant="destructive" disabled={isMutating} onClick={onConfirm}>{isMutating ? "Deleting..." : "Delete Blog"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
