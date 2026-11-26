"use client";

import Image from "next/image";
import { ChevronDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Category } from "@/types/category.interface";
import type { Blog } from "@/types/blog.interface";

export type BlogFormErrors = { title?: string; description?: string; category?: string; image?: string; bodyContent?: string };

type Props = {
  open: boolean; onOpenChange: (open: boolean) => void; editingBlog: Blog | null; categories: Category[];
  formCategoryId: string; formTitle: string; formDescription: string; formBodyContent: string; formImage: string | null;
  formErrors: BlogFormErrors; fileInputRef: React.RefObject<HTMLInputElement | null>; onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (category: Category) => void; onTitleChange: (value: string) => void; onDescriptionChange: (value: string) => void; onBodyContentChange: (value: string) => void; onSubmit: (event: React.FormEvent) => void; isMutating: boolean;
  mode?: "dialog" | "page";
};

export default function BlogFormDialog({ open, onOpenChange, editingBlog, categories, formCategoryId, formTitle, formDescription, formBodyContent, formImage, formErrors, fileInputRef, onFileChange, onCategoryChange, onTitleChange, onDescriptionChange, onBodyContentChange, onSubmit, isMutating, mode }: Props) {
  const modeResolved = mode ?? "dialog";
  if (modeResolved === "page") {
    return (
      <div className="space-y-6 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xs sm:p-8">
        <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-2">
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/heic,image/heif" onChange={onFileChange} className="hidden" />
          <div className="space-y-5 xl:col-span-1">
            <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Banner Image</label><button type="button" onClick={() => fileInputRef.current?.click()} className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-3 text-center transition-colors hover:border-slate-400 hover:bg-slate-50">{formImage ? <div className="relative h-64 overflow-hidden rounded-xl"><Image src={formImage} alt="Preview" fill unoptimized className="object-cover" /></div> : <div className="flex min-h-64 flex-col items-center justify-center text-xs text-slate-500"><Upload className="mx-auto mb-2 h-6 w-6" />Click to select an image</div>}</button>{formErrors.image && <p className="mt-1 text-xs text-rose-500">{formErrors.image}</p>}</div>
            <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">Category <span className="text-rose-500">*</span></label><div className="relative"><select value={formCategoryId} onChange={(event) => { const category = categories.find((item) => item._id === event.target.value); if (category) onCategoryChange(category); }} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00BC7D]/40"><option value="">Select a category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /></div>{formErrors.category && <p className="mt-1 text-xs text-rose-500">{formErrors.category}</p>}</div>
            <Field label="Title" value={formTitle} onChange={onTitleChange} error={formErrors.title} placeholder="Blog title" />
            <TextAreaField label="Description" value={formDescription} onChange={onDescriptionChange} error={formErrors.description} placeholder="Short description" rows={5} />
          </div>
          <div className="xl:col-span-1"><TextAreaField label="Body Content" value={formBodyContent} onChange={onBodyContentChange} error={formErrors.bodyContent} placeholder="Full blog content" rows={20} /></div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-5 xl:col-span-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={isMutating} onClick={onSubmit}>{isMutating ? "Saving..." : editingBlog ? "Save Changes" : "Create Blog"}</Button></div>
        </form>
      </div>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden p-0">
        <DialogHeader className="border-b border-slate-100 bg-slate-50/60 p-5 pr-14 text-left"><DialogTitle>{editingBlog ? "Edit Blog" : "Add New Blog"}</DialogTitle><DialogDescription>Manage the blog article details and publishing image.</DialogDescription></DialogHeader>
        <form onSubmit={onSubmit} className="min-h-0 overflow-y-auto p-6"><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/heic,image/heif" onChange={onFileChange} className="hidden" />
          <div className="space-y-4">
            <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">Banner Image</label><button type="button" onClick={() => fileInputRef.current?.click()} className="w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center">{formImage ? <div className="relative h-36 overflow-hidden rounded-lg"><Image src={formImage} alt="Preview" fill unoptimized className="object-cover" /></div> : <div className="py-5 text-xs text-slate-500"><Upload className="mx-auto mb-2 h-5 w-5" />Click to select an image</div>}</button>{formErrors.image && <p className="mt-1 text-xs text-rose-500">{formErrors.image}</p>}</div>
            <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">Category <span className="text-rose-500">*</span></label><div className="relative"><select value={formCategoryId} onChange={(event) => { const category = categories.find((item) => item._id === event.target.value); if (category) onCategoryChange(category); }} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00BC7D]/40"><option value="">Select a category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /></div>{formErrors.category && <p className="mt-1 text-xs text-rose-500">{formErrors.category}</p>}</div>
            <Field label="Title" value={formTitle} onChange={onTitleChange} error={formErrors.title} placeholder="Blog title" />
            <TextAreaField label="Description" value={formDescription} onChange={onDescriptionChange} error={formErrors.description} placeholder="Short description" rows={3} />
            <TextAreaField label="Body Content" value={formBodyContent} onChange={onBodyContentChange} error={formErrors.bodyContent} placeholder="Full blog content" rows={7} />
          </div>
        </form>
        <DialogFooter className="border-t border-slate-100 bg-slate-50/60 p-4"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={isMutating} onClick={onSubmit}>{isMutating ? "Saving..." : editingBlog ? "Save Changes" : "Create Blog"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, error, placeholder }: { label: string; value: string; onChange: (value: string) => void; error?: string; placeholder: string }) { return <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">{label} <span className="text-rose-500">*</span></label><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00BC7D]/40" />{error && <p className="mt-1 text-xs text-rose-500">{error}</p>}</div>; }
function TextAreaField({ label, value, onChange, error, placeholder, rows }: { label: string; value: string; onChange: (value: string) => void; error?: string; placeholder: string; rows: number }) { return <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">{label} <span className="text-rose-500">*</span></label><textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00BC7D]/40" />{error && <p className="mt-1 text-xs text-rose-500">{error}</p>}</div>; }
