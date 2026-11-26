"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";
import BlogForm from "@/components/dashboard/blogs/blog-form";
import { Button } from "@/components/ui/button";
import { nextFetch } from "@/lib/api/fetcher";
import { apiKeys } from "@/lib/api/keys";
import type { Category } from "@/types/category.interface";
import type { Blog } from "@/types/blog.interface";

export default function BlogNew() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { data: categories = [] } = useSWR<Category[]>(
    apiKeys.categories(
      new URLSearchParams({ limit: "1000", sort: "name" }).toString(),
    ),
  );

  const [formCategoryId, setFormCategoryId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBodyContent, setFormBodyContent] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    description?: string;
    category?: string;
    image?: string;
    bodyContent?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!formCategoryId && categories[0]) setFormCategoryId(categories[0]._id);
  }, [categories, formCategoryId]);

  const { trigger: createBlog, isMutating: isCreating } = useSWRMutation(
    apiKeys.blogCreate,
    (url: string, { arg }: { arg: Record<string, string> }) =>
      nextFetch<Blog>({ url, method: "POST", payload: arg }),
  );
  const { trigger: uploadImage, isMutating: isUploading } = useSWRMutation(
    apiKeys.mediaUpload,
    (url: string, { arg }: { arg: FormData }) =>
      nextFetch<{ images: string[] }>({ url, method: "POST", payload: arg }),
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be 10 MB or less");
      return;
    }
    setFormImage(URL.createObjectURL(file));
    if (formErrors.image)
      setFormErrors((previous) => ({ ...previous, image: undefined }));
  };

  const handleCategoryChange = (category: Category) => {
    setFormCategoryId(category._id);
    if (formErrors.category)
      setFormErrors((previous) => ({ ...previous, category: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors: {
      title?: string;
      description?: string;
      category?: string;
      image?: string;
      bodyContent?: string;
    } = {};
    if (!formTitle.trim()) errors.title = "Blog title is required";
    if (!formDescription.trim())
      errors.description = "Blog description is required";
    if (!/^[0-9a-fA-F]{24}$/.test(formCategoryId)) errors.category = "Please select a valid category";
    if (!formBodyContent.trim())
      errors.bodyContent = "Blog content is required";

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields correctly");
      return;
    }

    try {
      let imageUrl = "";
      const selectedFile = fileInputRef.current?.files?.[0];
      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append("image", selectedFile);
        const response = await uploadImage(uploadForm, { throwOnError: true });
        imageUrl = response.images[0] ?? imageUrl;
      }

      await createBlog(
        {
          category: formCategoryId,
          title: formTitle.trim(),
          description: formDescription.trim(),
          bodyContent: formBodyContent.trim(),
          imageUrl,
        },
        { throwOnError: true },
      );
      await mutate(apiKeys.blogs(""));
      toast.success("Blog created successfully");
      router.push("/blogs");
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Unable to create blog",
      );
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
          className="-ml-2 h-8 px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700!"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blogs
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
            Add New Blog
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create a new blog article and publishing image.
          </p>
        </div>
      </div>
      <BlogForm
        onOpenChange={(open) => {
          if (!open) router.push("/blogs");
        }}
        editingBlog={null}
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
        onTitleChange={setFormTitle}
        onDescriptionChange={setFormDescription}
        onBodyContentChange={setFormBodyContent}
        onSubmit={handleSubmit}
        isMutating={isCreating || isUploading}
      />
    </div>
  );
}
