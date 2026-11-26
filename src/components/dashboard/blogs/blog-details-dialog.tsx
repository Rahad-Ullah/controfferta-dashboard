"use client";

import Image from "next/image";
import { CalendarDays, FolderOpen, UserRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Blog } from "@/types/blog.interface";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export default function BlogDetailsDialog({ blog, open, onOpenChange }: { blog: Blog | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!blog) return null;
  const author = blog.author ? `${blog.author.firstName} ${blog.author.lastName}`.trim() : "—";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden bg-white p-0 sm:!max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-slate-200 bg-white px-6 py-5 pr-14 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
              {blog.category.name}
            </span>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${
              blog.status === "published"
                ? "border-emerald-100 bg-[#E6F8F2] text-[#00705d]"
                : blog.status === "hidden"
                  ? "border-slate-200 bg-slate-100 text-slate-500"
                  : "border-amber-100 bg-amber-50 text-amber-700"
            }`}>
              {blog.status}
            </span>
          </div>
          <DialogTitle className="mt-3 max-w-2xl text-2xl leading-tight text-[#0F172A]">{blog.title}</DialogTitle>
          <DialogDescription className="mt-1">Blog article details and publishing information</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-slate-50/60 p-6 text-sm">
          {blog.imageUrl ? (
            <div className="relative h-60 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
              <Image src={blog.imageUrl} alt="" fill unoptimized className="object-cover" />
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm font-medium text-slate-400">No banner image</div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailCard icon={<UserRound className="h-4 w-4" />} label="Author" value={author} />
            <DetailCard icon={<FolderOpen className="h-4 w-4" />} label="Category" value={blog.category.name} />
            <DetailCard icon={<CalendarDays className="h-4 w-4" />} label="Published / created" value={formatDate(blog.createdAt)} />
            <DetailCard icon={<CalendarDays className="h-4 w-4" />} label="Last updated" value={formatDate(blog.updatedAt)} />
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Summary</p>
            <p className="mt-2 leading-6 text-slate-700">{blog.description}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Article content</p>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{blog.bodyContent}</p>
          </section>

        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400"><span className="text-[#00BC7D]">{icon}</span><span className="text-xs">{label}</span></div>
      <p className="mt-2 font-semibold text-slate-700">{value}</p>
    </div>
  );
}
