"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";
import { apiKeys } from "@/lib/api/keys";
import { nextFetch } from "@/lib/api/fetcher";
import type { Blog, BlogStatus } from "@/types/blog.interface";
import type { Category } from "@/types/category.interface";
import BlogForm from "@/components/dashboard/blogs/blog-form";
import { Button } from "@/components/ui/button";

const DEFAULT_BANNER_IMAGE = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop";

export default function BlogEdit() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");
  const { mutate } = useSWRConfig();

  const { data: blog, error: blogError, isLoading: isBlogLoading } = useSWR<Blog>(id ? apiKeys.blog(id) : null);
  const { data: categories = [] } = useSWR<Category[]>(apiKeys.categories(new URLSearchParams({ limit: "1000", sort: "name" }).toString()));

  const [formCategoryId, setFormCategoryId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBodyContent, setFormBodyContent] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState<BlogStatus>("pending");
  const [formErrors, setFormErrors] = useState<{ title?: string; description?: string; category?: string; image?: string; bodyContent?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (blog) {
      setFormCategoryId(blog.category?._id ?? "");
      setFormTitle(blog.title ?? "");
      setFormDescription(blog.description ?? "");
      setFormBodyContent(blog.bodyContent ?? "");
      setFormImage(blog.imageUrl || DEFAULT_BANNER_IMAGE);
      setFormStatus(blog.status ?? "pending");
    }
  }, [blog]);

  const { trigger: updateBlog, isMutating: isUpdating } = useSWRMutation(
    id ? apiKeys.blog(id) : null,
    (url: string, { arg }: { arg: Record<string, string> }) => nextFetch<Blog>({ url, method: "PATCH", payload: arg }),
  );
  const { trigger: updateBlogStatus, isMutating: isUpdatingStatus } = useSWRMutation(
    id ? apiKeys.blogStatus(id) : null,
    (url: string, { arg }: { arg: { status: BlogStatus } }) => nextFetch<Blog>({ url, method: "PATCH", payload: arg }),
  );
  const { trigger: uploadImage, isMutating: isUploading } = useSWRMutation(
    apiKeys.mediaUpload,
    (url: string, { arg }: { arg: FormData }) => nextFetch<{ images: string[] }>({ url, method: "POST", payload: arg }),
  );
  const isMutating = isUpdating || isUpdatingStatus || isUploading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { toast.error("Image size must be 10 MB or less"); return; }
      setFormImage(URL.createObjectURL(file));
    }
  };

  const handleCategoryChange = (category: Category) => {
    setFormCategoryId(category._id);
    if (formErrors.category) setFormErrors((p) => ({ ...p, category: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { title?: string; description?: string; category?: string; image?: string; bodyContent?: string } = {};
    if (!formTitle.trim()) errors.title = "Blog title is required";
    if (!formDescription.trim()) errors.description = "Blog description is required";
    if (!/^[0-9a-fA-F]{24}$/.test(formCategoryId)) errors.category = "Please select a valid category";
    if (!formBodyContent.trim()) errors.bodyContent = "Blog content is required";
    if (Object.keys(errors).length) { setFormErrors(errors); toast.error("Please fill in all required fields correctly"); return; }
    try {
      let imageUrl = blog?.imageUrl ?? "";
      const selectedFile = fileInputRef.current?.files?.[0];
      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append("image", selectedFile);
        const response = await uploadImage(uploadForm, { throwOnError: true });
        imageUrl = response.images[0] ?? imageUrl;
      }
      const payload = { category: formCategoryId, title: formTitle.trim(), description: formDescription.trim(), bodyContent: formBodyContent.trim(), imageUrl };
      await updateBlog(payload, { throwOnError: true });
      if (formStatus !== blog?.status) {
        await updateBlogStatus({ status: formStatus }, { throwOnError: true });
      }
      await mutate(apiKeys.blogs(""));
      toast.success("Blog updated successfully");
      router.push("/blogs");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Unable to save blog");
    }
  };

  return (
    <div className="space-y-6 pb-6 font-sans">
      <div className="space-y-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/blogs")}
          className="-ml-2 h-8 px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:!text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blogs
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">Edit Blog</h1>
          <p className="mt-1 text-sm text-slate-500">Update blog details and publishing image.</p>
        </div>
      </div>
      {isBlogLoading ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-8 text-sm text-slate-500 shadow-2xs">
          Loading blog details...
        </div>
      ) : blogError || !blog ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 shadow-2xs">
          <h2 className="text-base font-semibold text-rose-800">Unable to load this blog</h2>
          <p className="mt-1 text-sm text-rose-700">{blogError instanceof Error ? blogError.message : "The blog may have been removed or the URL is invalid."}</p>
          <Button type="button" variant="outline" onClick={() => router.push("/blogs")} className="mt-4 border-rose-200 bg-white text-rose-700 hover:bg-rose-100 hover:!text-rose-800">
            Back to blogs
          </Button>
        </div>
      ) : (
        <BlogForm
          onOpenChange={(open) => { if (!open) router.push("/blogs"); }}
          editingBlog={blog}
          categories={categories}
          formCategoryId={formCategoryId}
          formTitle={formTitle}
          formDescription={formDescription}
          formBodyContent={formBodyContent}
          formImage={formImage}
          formErrors={formErrors}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          onCategoryChange={handleCategoryChange}
          onStatusChange={setFormStatus}
          onTitleChange={setFormTitle}
          onDescriptionChange={setFormDescription}
          onBodyContentChange={setFormBodyContent}
          onSubmit={handleSubmit}
          isMutating={isMutating}
          status={formStatus}
        />
      )}
    </div>
  );
}
