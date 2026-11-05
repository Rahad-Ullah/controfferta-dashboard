"use client";

import {
  AppWindow,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hammer,
  Plus,
  Search,
  SquarePen,
  Sun,
  Trash2,
  Truck,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

interface BlogItem {
  id: string;
  category: string;
  iconType: "window" | "solar" | "construction" | "moving" | "energy";
  title: string;
  description: string;
  imageUrl?: string;
  date?: string;
}

const DEFAULT_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop";

const INITIAL_BLOGS: BlogItem[] = [
  {
    id: "1",
    category: "Windows & Doors",
    iconType: "window",
    title: "How to Choose the Right Professionals for Your Home Project",
    description:
      "Planning a renovation or home repair in Italy can feel overwhelming. Learn how to verify contractor certifications, compare itemized quotes, and protect",
    imageUrl: DEFAULT_BANNER_IMAGE,
  },
  {
    id: "2",
    category: "Solar Panels",
    iconType: "solar",
    title: "How to Choose the Right Professionals for Your Home Project",
    description:
      "Planning a renovation or home repair in Italy can feel overwhelming. Learn how to verify contractor certifications, compare itemized quotes, and protect",
    imageUrl: DEFAULT_BANNER_IMAGE,
  },
  {
    id: "3",
    category: "Construction",
    iconType: "construction",
    title: "How to Choose the Right Professionals for Your Home Project",
    description:
      "Planning a renovation or home repair in Italy can feel overwhelming. Learn how to verify contractor certifications, compare itemized quotes, and protect",
    imageUrl: DEFAULT_BANNER_IMAGE,
  },
  {
    id: "4",
    category: "Construction",
    iconType: "construction",
    title: "How to Choose the Right Professionals for Your Home Project",
    description:
      "Planning a renovation or home repair in Italy can feel overwhelming. Learn how to verify contractor certifications, compare itemized quotes, and protect",
    imageUrl: DEFAULT_BANNER_IMAGE,
  },
  {
    id: "5",
    category: "Solar Panels",
    iconType: "solar",
    title: "How to Choose the Right Professionals for Your Home Project",
    description:
      "Planning a renovation or home repair in Italy can feel overwhelming. Learn how to verify contractor certifications, compare itemized quotes, and protect",
    imageUrl: DEFAULT_BANNER_IMAGE,
  },
  {
    id: "6",
    category: "Construction",
    iconType: "construction",
    title: "How to Choose the Right Professionals for Your Home Project",
    description:
      "Planning a renovation or home repair in Italy can feel overwhelming. Learn how to verify contractor certifications, compare itemized quotes, and protect",
    imageUrl: DEFAULT_BANNER_IMAGE,
  },
  {
    id: "7",
    category: "Solar Panels",
    iconType: "solar",
    title: "How to Choose the Right Professionals for Your Home Project",
    description:
      "Planning a renovation or home repair in Italy can feel overwhelming. Learn how to verify contractor certifications, compare itemized quotes, and protect",
    imageUrl: DEFAULT_BANNER_IMAGE,
  },
  {
    id: "8",
    category: "Construction",
    iconType: "construction",
    title: "How to Choose the Right Professionals for Your Home Project",
    description:
      "Planning a renovation or home repair in Italy can feel overwhelming. Learn how to verify contractor certifications, compare itemized quotes, and protect",
    imageUrl: DEFAULT_BANNER_IMAGE,
  },
];

const CATEGORY_OPTIONS = [
  "Solar & Energy",
  "Windows & Doors",
  "Solar Panels",
  "Construction",
  "Moving",
  "Other",
];

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>(INITIAL_BLOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState("All Categories");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Modal states
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<BlogItem | null>(null);

  // Form states
  const [formCategory, setFormCategory] = useState("Solar & Energy");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formCategoryDropdownOpen, setFormCategoryDropdownOpen] = useState(false);

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    description?: string;
    category?: string;
    image?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered Blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategoryFilter === "All Categories"
          ? true
          : blog.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchQuery, selectedCategoryFilter]);

  // Handle Delete Confirmation
  const handleConfirmDeleteBlog = () => {
    if (!blogToDelete) return;
    setBlogs((prev) => prev.filter((b) => b.id !== blogToDelete.id));
    toast.success(`Blog "${blogToDelete.title}" deleted successfully`);
    setBlogToDelete(null);
  };

  // Open Add Form Modal
  const handleOpenAdd = () => {
    setEditingBlog(null);
    setFormCategory("Solar & Energy");
    setFormTitle("");
    setFormDescription("");
    setFormImage(null);
    setFormCategoryDropdownOpen(false);
    setFormErrors({});
    setIsBlogModalOpen(true);
  };

  // Open Edit Form Modal
  const handleOpenEdit = (blog: BlogItem) => {
    setEditingBlog(blog);
    setFormCategory(
      blog.category === "Solar Panels" ? "Solar & Energy" : blog.category
    );
    setFormTitle(blog.title);
    setFormDescription(blog.description);
    setFormImage(blog.imageUrl || DEFAULT_BANNER_IMAGE);
    setFormCategoryDropdownOpen(false);
    setFormErrors({});
    setIsBlogModalOpen(true);
  };

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5 MB");
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
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {
      title?: string;
      description?: string;
      category?: string;
      image?: string;
    } = {};

    if (!formTitle.trim()) {
      errors.title = "Blog title is required";
    }

    if (!formDescription.trim()) {
      errors.description = "Blog description is required";
    }

    if (!formCategory.trim()) {
      errors.category = "Please select a category";
    }

    if (!formImage && !editingBlog?.imageUrl) {
      errors.image = "Banner image is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const titleToUse = formTitle.trim();
    const descToUse = formDescription.trim();

    let iconType: BlogItem["iconType"] = editingBlog ? editingBlog.iconType : "solar";
    if (formCategory.toLowerCase().includes("window")) iconType = "window";
    else if (formCategory.toLowerCase().includes("construction"))
      iconType = "construction";
    else if (formCategory.toLowerCase().includes("mov")) iconType = "moving";
    else if (
      formCategory.toLowerCase().includes("solar") ||
      formCategory.toLowerCase().includes("energy")
    )
      iconType = "solar";

    if (editingBlog) {
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === editingBlog.id
            ? {
                ...b,
                category: formCategory,
                iconType,
                title: titleToUse,
                description: descToUse,
                imageUrl: formImage || b.imageUrl || DEFAULT_BANNER_IMAGE,
              }
            : b
        )
      );
      toast.success("Blog updated successfully");
    } else {
      const newBlog: BlogItem = {
        id: Date.now().toString(),
        category: formCategory,
        iconType,
        title: titleToUse,
        description: descToUse,
        imageUrl: formImage || DEFAULT_BANNER_IMAGE,
      };

      setBlogs((prev) => [newBlog, ...prev]);
      toast.success("Blog created successfully");
    }

    setFormErrors({});
    setIsBlogModalOpen(false);
  };

  // Helper to render category icon
  const renderCategoryIcon = (type: BlogItem["iconType"]) => {
    switch (type) {
      case "window":
        return <AppWindow className="w-4 h-4 text-slate-500 shrink-0" />;
      case "solar":
      case "energy":
        return <Sun className="w-4 h-4 text-slate-500 shrink-0" />;
      case "moving":
        return <Truck className="w-4 h-4 text-slate-500 shrink-0" />;
      case "construction":
      default:
        return <Hammer className="w-4 h-4 text-slate-500 shrink-0" />;
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
            {blogs.length} total blogs
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
          <div className="relative self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <span>{selectedCategoryFilter}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-lg py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                {[
                  "All Categories",
                  "Windows & Doors",
                  "Solar Panels",
                  "Construction",
                  "Moving",
                  "Solar & Energy",
                ].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryFilter(opt);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs sm:text-sm transition-colors cursor-pointer ${
                      selectedCategoryFilter === opt
                        ? "bg-[#E6F8F2] text-[#00BC7D] font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Table Container ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-3">CATEGORY</th>
                <th className="py-3.5 px-3">TITLE</th>
                <th className="py-3.5 px-3">DESCRIPTION</th>
                <th className="py-3.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400 text-sm">
                    No blogs found matching your search.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((blog, idx) => (
                  <tr
                    key={`${blog.id}-${idx}`}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* CATEGORY (Icon + Pill) */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {renderCategoryIcon(blog.iconType)}
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100/90 text-slate-700">
                          {blog.category}
                        </span>
                      </div>
                    </td>

                    {/* TITLE */}
                    <td className="py-4 px-3 text-slate-800 font-medium text-xs sm:text-sm max-w-xs">
                      {blog.title}
                    </td>

                    {/* DESCRIPTION */}
                    <td className="py-4 px-3 text-slate-500 text-xs sm:text-sm max-w-md line-clamp-2">
                      {blog.description}
                    </td>

                    {/* ACTION (Edit / Delete) */}
                    <td className="py-4 px-3 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(blog)}
                          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlogToDelete(blog)}
                          className="text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <span>Showing 1-8 of {blogs.length} blogs</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Blog Modal ── */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-bold text-[#0F172A]">
                {editingBlog ? "Edit Blog" : "Add New Blog"}
              </h2>
              <button
                type="button"
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
                            src={formImage}
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
                      {CATEGORY_OPTIONS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setFormCategory(cat);
                            setFormCategoryDropdownOpen(false);
                            if (formErrors.category) {
                              setFormErrors((prev) => ({ ...prev, category: undefined }));
                            }
                          }}
                          className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer ${
                            formCategory === cat
                              ? "bg-[#E6F8F2] text-[#00BC7D] font-semibold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {cat}
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
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsBlogModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
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
      {blogToDelete && (
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
                <span className="font-semibold text-[#0F172A]">&quot;{blogToDelete.title}&quot;</span>?
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
    </div>
  );
}
