"use client";

import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/types/category.interface";
import type { Blog, BlogStatus } from "@/types/blog.interface";

export type BlogFormErrors = { title?: string; description?: string; category?: string; image?: string; bodyContent?: string };

type Props = {
  onOpenChange: (open: boolean) => void; editingBlog: Blog | null; categories: Category[];
  formCategoryId: string; formTitle: string; formDescription: string; formBodyContent: string; formImage: string | null;
  formErrors: BlogFormErrors; fileInputRef: React.RefObject<HTMLInputElement | null>; onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (category: Category) => void; onStatusChange?: (status: BlogStatus) => void; onTitleChange: (value: string) => void; onDescriptionChange: (value: string) => void; onBodyContentChange: (value: string) => void; onSubmit: (event: React.FormEvent) => void; isMutating: boolean; status?: BlogStatus;
};

export default function BlogForm({ onOpenChange, editingBlog, categories, formCategoryId, formTitle, formDescription, formBodyContent, formImage, formErrors, fileInputRef, onFileChange, onCategoryChange, onStatusChange, onTitleChange, onDescriptionChange, onBodyContentChange, onSubmit, isMutating, status }: Props) {
  return (
      <div className="space-y-6 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-2xs sm:p-8">
        <form id="blog-form" noValidate onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-2">
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/heic,image/heif" onChange={onFileChange} className="hidden" />
          <div className="space-y-5 xl:col-span-1">
            <div><Label htmlFor="blog-banner-image" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Banner Image</Label><Button id="blog-banner-image" type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="h-auto w-full cursor-pointer rounded-2xl border-dashed border-slate-300 bg-slate-50/70 p-3 text-center hover:border-slate-400 hover:bg-slate-50">{formImage ? <div className="relative h-64 w-full overflow-hidden rounded-xl"><Image src={formImage} alt="Preview" fill unoptimized className="object-cover" /></div> : <div className="flex min-h-64 w-full flex-col items-center justify-center text-xs text-slate-500"><Upload className="mx-auto mb-2 h-6 w-6" />Click to select an image</div>}</Button>{formErrors.image && <p className="mt-1 text-xs text-rose-500">{formErrors.image}</p>}</div>
            <div><Label htmlFor="blog-category" className="mb-1.5 block text-xs font-semibold text-slate-700">Category <span className="text-rose-500">*</span></Label><Select value={formCategoryId} onValueChange={(value) => { const category = categories.find((item) => item._id === value); if (category) onCategoryChange(category); }}><SelectTrigger id="blog-category" aria-invalid={Boolean(formErrors.category)} className="!h-11 w-full rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm"><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>)}</SelectContent></Select>{formErrors.category && <p className="mt-1 text-xs text-rose-500">{formErrors.category}</p>}</div>
            <Field label="Title" value={formTitle} onChange={onTitleChange} error={formErrors.title} placeholder="Blog title" />
            <TextAreaField label="Description" value={formDescription} onChange={onDescriptionChange} error={formErrors.description} placeholder="Short description" rows={5} />
          </div>
          <div className="xl:col-span-1"><TextAreaField label="Body Content" value={formBodyContent} onChange={onBodyContentChange} error={formErrors.bodyContent} placeholder="Full blog content" rows={20} /></div>
        </form>
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          {onStatusChange && status !== undefined ? <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span><div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Blog status"><StatusTab status="pending" selected={status === "pending"} onClick={onStatusChange}>Pending</StatusTab><StatusTab status="published" selected={status === "published"} onClick={onStatusChange}>Published</StatusTab><StatusTab status="hidden" selected={status === "hidden"} onClick={onStatusChange}>Hidden</StatusTab></div></div> : <span />}
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" form="blog-form" disabled={isMutating}>{isMutating ? "Saving..." : editingBlog ? "Save Changes" : "Create Blog"}</Button></div>
        </div>
      </div>
    );
}

function StatusTab({ status, selected, onClick, children }: { status: BlogStatus; selected: boolean; onClick: (status: BlogStatus) => void; children: React.ReactNode }) { return <Button type="button" variant="ghost" size="sm" aria-pressed={selected} onClick={() => onClick(status)} className={selected ? "bg-[#0F172A] text-white hover:bg-[#1E293B] hover:!text-white" : "text-slate-600 hover:bg-white hover:!text-slate-900"}>{children}</Button>; }

function Field({ label, value, onChange, error, placeholder }: { label: string; value: string; onChange: (value: string) => void; error?: string; placeholder: string }) { const id = `blog-${label.toLowerCase().replaceAll(" ", "-")}`; return <div><Label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">{label} <span className="text-rose-500">*</span></Label><Input id={id} required aria-invalid={Boolean(error)} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm" />{error && <p className="mt-1 text-xs text-rose-500">{error}</p>}</div>; }
function TextAreaField({ label, value, onChange, error, placeholder, rows }: { label: string; value: string; onChange: (value: string) => void; error?: string; placeholder: string; rows: number }) { const id = `blog-${label.toLowerCase().replaceAll(" ", "-")}`; return <div><Label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">{label} <span className="text-rose-500">*</span></Label><Textarea id={id} required aria-invalid={Boolean(error)} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} className="resize-none rounded-xl border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm" />{error && <p className="mt-1 text-xs text-rose-500">{error}</p>}</div>; }
