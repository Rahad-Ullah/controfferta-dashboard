"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";
import { apiKeys } from "@/lib/api/keys";
import { nextFetch } from "@/lib/api/fetcher";
import type { Category } from "@/types/category.interface";
import type { Blog, BlogListResponse } from "@/types/blog.interface";
import { SearchableSelect, type SearchableSelectOption } from "@/components/ui/searchable-select";
import BlogDeleteDialog from "@/components/dashboard/blogs/blog-delete-dialog";
import BlogDetailsDialog from "@/components/dashboard/blogs/blog-details-dialog";
import BlogFormDialog from "@/components/dashboard/blogs/blog-form-dialog";
import { Button } from "@/components/ui/button";

type BlogItem = Blog;

const DEFAULT_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop";

export default function BlogPage() {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<BlogItem | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBodyContent, setFormBodyContent] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formCategoryDropdownOpen, setFormCategoryDropdownOpen] = useState(false);

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    description?: string;
    category?: string;
    image?: string;
    bodyContent?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoriesKey = apiKeys.categories(new URLSearchParams({ limit: "1000", sort: "name" }).toString());
  const { data: categories = [] } = useSWR<Category[]>(categoriesKey);
  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: "8", sort: "-createdAt" });
    if (debouncedSearch) params.set("searchTerm", debouncedSearch);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    return params.toString();
  }, [categoryFilter, debouncedSearch, page]);
  const blogsKey = apiKeys.blogs(query);
  const { data, error, isLoading, isValidating } = useSWR<BlogListResponse>(
    blogsKey,
    (url: string) => nextFetch<BlogListResponse>({ url, preservePagination: true }),
  );
  const blogs = data?.data ?? [];
  const pagination = data?.pagination;
  const categoryOptions: SearchableSelectOption[] = [
    { value: "all", label: "All categories" },
    ...categories.map((category) => ({ value: category._id, label: category.name })),
  ];

  const { trigger: createBlog, isMutating: isCreating } = useSWRMutation(
    apiKeys.blogCreate,
    (url: string, { arg }: { arg: Record<string, string> }) => nextFetch<Blog>({ url, method: "POST", payload: arg }),
  );
  const { trigger: updateBlog, isMutating: isUpdating } = useSWRMutation(
    editingBlog ? apiKeys.blog(editingBlog._id) : null,
    (url: string, { arg }: { arg: Record<string, string> }) => nextFetch<Blog>({ url, method: "PATCH", payload: arg }),
  );
  const { trigger: deleteBlog, isMutating: isDeleting } = useSWRMutation(
    blogToDelete ? apiKeys.blog(blogToDelete._id) : null,
    (url: string) => nextFetch<Blog>({ url, method: "DELETE" }),
  );
  const { trigger: uploadImage, isMutating: isUploading } = useSWRMutation(
    apiKeys.mediaUpload,
    (url: string, { arg }: { arg: FormData }) => nextFetch<{ images: string[] }>({ url, method: "POST", payload: arg }),
  );
  const isMutating = isCreating || isUpdating || isDeleting || isUploading;

  React.useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedSearch(searchQuery.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  // Handle Delete Confirmation
  const handleConfirmDeleteBlog = async () => {
    if (!blogToDelete) return;
    try {
      await deleteBlog(undefined, { throwOnError: true });
      await mutate(blogsKey);
      toast.success(`Blog "${blogToDelete.title}" deleted successfully`);
      setBlogToDelete(null);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Unable to delete blog");
    }
  };

  // Open Add Form Modal
  const handleOpenAdd = () => {
    setEditingBlog(null);
    setFormCategory("");
    setFormCategoryId(categories[0]?._id ?? "");
    setFormTitle("");
    setFormDescription("");
    setFormBodyContent("");
    setFormImage(null);
    setFormCategoryDropdownOpen(false);
    setFormErrors({});
    setIsBlogModalOpen(true);
  };

  const handleCategoryChange = (category: Category) => {
    setFormCategory(category.name);
    setFormCategoryId(category._id);
    if (formErrors.category) setFormErrors((prev) => ({ ...prev, category: undefined }));
  };

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size must be 10 MB or less");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setFormImage(previewUrl);
      if (formErrors.image) {
        setFormErrors((prev) => ({ ...prev, image: undefined }));
      }
      toast.success("Image selected");
    }
  };

  // Handle Form Submission (Add or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {
      title?: string;
      description?: string;
      category?: string;
      image?: string;
      bodyContent?: string;
    } = {};

    if (!formTitle.trim()) {
      errors.title = "Blog title is required";
    }

    if (!formDescription.trim()) {
      errors.description = "Blog description is required";
    }

    if (!formCategoryId) {
      errors.category = "Please select a category";
    }
    if (!formBodyContent.trim()) {
      errors.bodyContent = "Blog content is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields correctly");
      return;
    }

    try {
      let imageUrl = editingBlog?.imageUrl ?? "";
      const selectedFile = fileInputRef.current?.files?.[0];
      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append("image", selectedFile);
        const response = await uploadImage(uploadForm, { throwOnError: true });
        imageUrl = response.images[0] ?? imageUrl;
      }
      const payload = {
        category: formCategoryId,
        title: formTitle.trim(),
        description: formDescription.trim(),
        bodyContent: formBodyContent.trim(),
        imageUrl,
      };
      if (editingBlog) await updateBlog(payload, { throwOnError: true });
      else await createBlog(payload, { throwOnError: true });
      await mutate(blogsKey);
      toast.success(editingBlog ? "Blog updated successfully" : "Blog created successfully");
      setFormErrors({});
      setIsBlogModalOpen(false);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Unable to save blog");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: MAIN BLOG MANAGEMENT TABLE (Screenshot 1)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-6 select-none font-sans">
      {/* ── Top Header & Add Blog Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Blog Management
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            {pagination?.total ?? 0} total blogs
          </p>
        </div>

        {/* + Add New Blog Button */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Blog</span>
        </button>
      </div>

      {/* ── Main White Container Card ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-2xs">
        {error && <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Failed to load blogs: {error.message}</p>}
        {/* Search & All Categories Dropdown Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Pill Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-full text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all"
            />
          </div>

          {/* All Categories Dropdown Button */}
          <SearchableSelect
            value={categoryFilter}
            options={categoryOptions}
            onValueChange={(value) => { setCategoryFilter(value); setPage(1); }}
            searchPlaceholder="Search categories..."
            className="sm:w-52"
          />
        </div>

        {/* ── Table Container ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-3">BLOG</th>
                <th className="py-3.5 px-3">AUTHOR</th>
                <th className="py-3.5 px-3">CATEGORY</th>
                <th className="py-3.5 px-3">STATUS</th>
                <th className="py-3.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400 text-sm">Loading blogs...</td></tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                    No blogs found matching your search.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr
                    key={blog._id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* BLOG IMAGE + TITLE */}
                    <td className="py-4 px-3 min-w-[280px]">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {blog.imageUrl ? (
                            <Image src={blog.imageUrl} alt="" fill unoptimized className="object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] font-medium text-slate-400">No image</div>
                          )}
                        </div>
                        <span className="line-clamp-2 max-w-[260px] text-xs font-semibold text-slate-800 sm:text-sm">
                          {blog.title}
                        </span>
                      </div>
                    </td>

                    {/* AUTHOR */}
                    <td className="whitespace-nowrap px-3 py-4 text-xs text-slate-600 sm:text-sm">
                      {blog.author
                        ? `${blog.author.firstName} ${blog.author.lastName}`.trim()
                        : "—"}
                    </td>

                    {/* CATEGORY */}
                    <td className="whitespace-nowrap px-3 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100/90 px-3 py-1 text-xs font-medium text-slate-700">
                        {blog.category.name}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="whitespace-nowrap px-3 py-4">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                        blog.status === "published"
                          ? "border-emerald-100 bg-[#E6F8F2] text-[#00BC7D]"
                          : blog.status === "hidden"
                            ? "border-slate-200 bg-slate-100 text-slate-500"
                            : "border-amber-100 bg-amber-50 text-amber-600"
                      }`}>
                        {blog.status}
                      </span>
                    </td>

                    {/* ACTION (Edit / Delete) */}
                    <td className="py-4 px-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          onClick={() => setSelectedBlog(blog)}
                          variant="ghost"
                          size="sm"
                          className="h-auto rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:!text-slate-600"
                          title="View"
                        >
                          <span>View</span>
                        </Button>
                        <Button
                          type="button"
                          onClick={() => router.push(`/blogs/${blog._id}/edit`)}
                          variant="ghost"
                          size="sm"
                          className="h-auto rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:!text-slate-600"
                          title="Edit"
                        >
                          <span>Edit</span>
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setBlogToDelete(blog)}
                          variant="ghost"
                          size="sm"
                          className="h-auto rounded-full border border-rose-100 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-100 hover:!text-rose-500"
                          title="Delete"
                        >
                          <span>Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer / Pagination ── */}
        <div className="pt-6 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {blogs.length ? (page - 1) * (pagination?.limit ?? 8) + 1 : 0}-{(page - 1) * (pagination?.limit ?? 8) + blogs.length} of {pagination?.total ?? 0} blogs{isValidating && " · Syncing..."}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => current - 1)}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!pagination || page >= pagination.totalPage || isLoading}
              onClick={() => setPage((current) => current + 1)}
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legacy inline modal retained temporarily for compatibility; extracted dialog is rendered below. */}
      {false && isBlogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-bold text-[#0F172A]">
                {editingBlog ? "Edit Blog" : "Add New Blog"}
              </h2>
              <button
                type="button"
                disabled={isMutating}
                onClick={() => setIsBlogModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Upload Image Dropzone */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Upload Banner Image <span className="text-rose-500">*</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-2xl p-4 text-center transition-colors cursor-pointer group ${
                      formErrors.image
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-slate-300 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    {formImage ? (
                      <div className="space-y-2">
                        <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-xs">
                          <Image
                            src={formImage || DEFAULT_BANNER_IMAGE}
                            alt="Preview"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100 duration-150">
                            <span className="text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full">
                              Click to change image
                            </span>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-[#00BC7D]">
                          Image selected (Click to change)
                        </div>
                      </div>
                    ) : (
                      <div className="py-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-slate-200/70 flex items-center justify-center mx-auto mb-2 transition-colors">
                          <Upload className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                        </div>
                        <div className="text-xs font-medium text-slate-700">
                          Click to select or drop image here
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          PNG, JPG, WebP — Max 5 MB
                        </div>
                      </div>
                    )}
                  </div>
                  {formErrors.image && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                      <span>•</span>
                      <span>{formErrors.image}</span>
                    </p>
                  )}
                </div>

                {/* Select Category */}
                <div className="relative">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setFormCategoryDropdownOpen(!formCategoryDropdownOpen);
                      if (formErrors.category) {
                        setFormErrors((prev) => ({ ...prev, category: undefined }));
                      }
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#0F172A] flex items-center justify-between text-left focus:outline-none transition-all cursor-pointer ${
                      formErrors.category
                        ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                        : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                    }`}
                  >
                    <span className="font-medium">{formCategory}</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {formCategoryDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                      {categories.map((cat) => (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => {
                            setFormCategory(cat.name);
                            setFormCategoryId(cat._id);
                            setFormCategoryDropdownOpen(false);
                            if (formErrors.category) {
                              setFormErrors((prev) => ({ ...prev, category: undefined }));
                            }
                          }}
                          className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer ${
                            formCategoryId === cat._id
                              ? "bg-[#E6F8F2] text-[#00BC7D] font-semibold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                            {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {formErrors.category && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                      <span>•</span>
                      <span>{formErrors.category}</span>
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. How to Choose the Right Solar Panels"
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      if (formErrors.title) {
                        setFormErrors((prev) => ({ ...prev, title: undefined }));
                      }
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                      formErrors.title
                        ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                        : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                    }`}
                  />
                  {formErrors.title && (
                    <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                      <span>•</span>
                      <span>{formErrors.title}</span>
                    </p>
                  )}
                </div>

                {/* Descriptions */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    placeholder="Provide a detailed overview of the blog article..."
                    value={formDescription}
                    onChange={(e) => {
                      setFormDescription(e.target.value);
                      if (formErrors.description) {
                        setFormErrors((prev) => ({ ...prev, description: undefined }));
                      }
                    }}
                    rows={4}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all resize-none ${
                      formErrors.description
                        ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                        : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                    }`}
                  />
                  {formErrors.description && (
                    <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                      <span>•</span>
                      <span>{formErrors.description}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Body Content <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    placeholder="Write the full blog content..."
                    value={formBodyContent}
                    onChange={(e) => setFormBodyContent(e.target.value)}
                    rows={7}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all resize-none bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                  />
                  {formErrors.bodyContent && <p className="text-xs text-rose-500 font-medium mt-1">{formErrors.bodyContent}</p>}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                disabled={isMutating}
                onClick={() => setIsBlogModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isMutating}
                onClick={handleFormSubmit}
                className="px-6 py-2.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                {editingBlog ? "Save Changes" : "Upload Blog"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {false && blogToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Delete Blog</h3>
                  <p className="text-xs text-slate-400">Confirm blog deletion</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBlogToDelete(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3 text-sm">
              <p className="text-slate-600 text-sm leading-relaxed">
                Are you sure you want to delete the blog{" "}
                <span className="font-semibold text-[#0F172A]">&quot;{blogToDelete?.title}&quot;</span>?
              </p>
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-800">
                This action cannot be undone. The article will be permanently removed.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBlogToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBlog}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
              >
                Delete Blog
              </button>
            </div>
          </div>
        </div>
      )}

      <BlogFormDialog
        open={isBlogModalOpen}
        onOpenChange={setIsBlogModalOpen}
        editingBlog={editingBlog}
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
        onSubmit={handleFormSubmit}
        isMutating={isMutating}
      />
      <BlogDetailsDialog blog={selectedBlog} open={Boolean(selectedBlog)} onOpenChange={(open) => !open && setSelectedBlog(null)} />
      <BlogDeleteDialog blog={blogToDelete} open={Boolean(blogToDelete)} onOpenChange={(open) => !open && setBlogToDelete(null)} onConfirm={handleConfirmDeleteBlog} isMutating={isDeleting} />
    </div>
  );
}
