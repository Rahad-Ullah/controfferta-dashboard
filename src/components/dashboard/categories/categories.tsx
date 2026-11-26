"use client";

import {
  AppWindow,
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
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";
import { apiKeys } from "@/lib/api/keys";
import { nextFetch } from "@/lib/api/fetcher";
import type { Category } from "@/types/category.interface";

type MediaUploadResponse = {
  images: string[];
};

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const categoriesQuery = new URLSearchParams({
    limit: "1000",
    ...(debouncedSearchQuery ? { searchTerm: debouncedSearchQuery } : {}),
  }).toString();
  const categoriesKey = apiKeys.categories(categoriesQuery);
  const { mutate } = useSWRConfig();
  const { data: categories = [], error, isLoading, isValidating } = useSWR<Category[]>(categoriesKey);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Add / Edit Category Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCreditCost, setFormCreditCost] = useState("");
  const [uploadedIconName, setUploadedIconName] = useState<string | null>(null);
  const [uploadedIconUrl, setUploadedIconUrl] = useState<string | null>(null);
  const [selectedIconFile, setSelectedIconFile] = useState<File | null>(null);
  const iconFileInputRef = useRef<HTMLInputElement>(null);

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    creditCost?: string;
  }>({});

  const { trigger: createCategory, isMutating: isCreating } = useSWRMutation(
    apiKeys.categoryCreate,
    (url: string, { arg }: { arg: Pick<Category, "name" | "description" | "creditCost"> & { iconUrl?: string } }) =>
      nextFetch<Category>({ url, method: "POST", payload: arg }),
  );
  const { trigger: updateCategory, isMutating: isUpdating } = useSWRMutation(
    editingCategory ? apiKeys.category(editingCategory._id) : null,
    (url: string, { arg }: { arg: Partial<Pick<Category, "name" | "description" | "creditCost">> & { iconUrl?: string } }) =>
      nextFetch<Category>({ url, method: "PATCH", payload: arg }),
  );
  const { trigger: deleteCategory, isMutating: isDeleting } = useSWRMutation(
    categoryToDelete ? apiKeys.category(categoryToDelete._id) : null,
    (url: string) => nextFetch<Category>({ url, method: "DELETE" }),
  );
  const { trigger: uploadIcon, isMutating: isUploading } = useSWRMutation(
    apiKeys.mediaUpload,
    (url: string, { arg }: { arg: FormData }) =>
      nextFetch<MediaUploadResponse>({ url, method: "POST", payload: arg }),
  );
  const isMutating = isCreating || isUpdating || isDeleting || isUploading;

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setMutationError(null);
    try {
      await deleteCategory(undefined, { throwOnError: true });
      await mutate(categoriesKey);
      toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
      setCategoryToDelete(null);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Unable to delete category");
    }
  };

  // Open Add Form
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName("");
    setFormDescription("");
    setFormCreditCost("");
    setUploadedIconName(null);
    setUploadedIconUrl(null);
    setSelectedIconFile(null);
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormDescription(category.description);
    setFormCreditCost(`${category.creditCost}`);
    setUploadedIconUrl(category.iconUrl || null);
    setSelectedIconFile(null);
    setUploadedIconName(
      category.iconUrl
        ? decodeURIComponent(category.iconUrl.split("/").pop() || "category_icon.png")
        : null,
    );
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Handle Submit Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {
      name?: string;
      description?: string;
      creditCost?: string;
    } = {};

    if (!formName.trim()) {
      errors.name = "Category name is required";
    }

    if (!formDescription.trim()) {
      errors.description = "Description is required";
    }

    const cleanCost = formCreditCost.trim();
    if (!/^\d+$/.test(cleanCost)) {
      errors.creditCost = "Credit cost must be a whole number of 0 or greater";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const numericCost = parseInt(cleanCost, 10);

    setMutationError(null);
    try {
      let iconUrl = uploadedIconUrl ?? "";

      if (selectedIconFile) {
        const formData = new FormData();
        formData.append("image", selectedIconFile);
        const uploadResponse = await uploadIcon(formData, { throwOnError: true });
        iconUrl = uploadResponse.images[0] ?? "";
      }

      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        creditCost: numericCost,
        iconUrl,
      };

      if (editingCategory) {
        await updateCategory(payload, { throwOnError: true });
        toast.success("Category updated successfully");
      } else {
        await createCategory(payload, { throwOnError: true });
        toast.success("Category added successfully");
      }
      await mutate(categoriesKey);
      setFormErrors({});
      setIsAddModalOpen(false);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Unable to save category");
    }
  };

  const handleIconFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedImageTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/heic",
      "image/heif",
    ]);

    if (!allowedImageTypes.has(file.type.toLowerCase())) {
      toast.error("Only PNG, JPG, JPEG, HEIC, and HEIF images are supported");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be 10 MB or less");
      event.target.value = "";
      return;
    }

    setSelectedIconFile(file);
    setUploadedIconName(file.name);
    setUploadedIconUrl(URL.createObjectURL(file));
  };

  // Helper to render icon for Category
  const renderCategoryIcon = (name: string, iconUrl: string) => {
    if (iconUrl) {
      return (
        <Image
          src={iconUrl}
          alt={`${name} icon`}
          width={48}
          height={48}
          unoptimized
          className="w-12 h-12 object-contain shrink-0"
        />
      );
    }

    const type = name.toLowerCase().includes("solar")
      ? "solar"
      : name.toLowerCase().includes("door") || name.toLowerCase().includes("window")
        ? "window"
        : name.toLowerCase().includes("mov")
          ? "moving"
          : "construction";
    switch (type) {
      case "window":
        return <AppWindow className="w-12 h-12 text-slate-500 shrink-0" />;
      case "solar":
        return <Sun className="w-12 h-12 text-slate-500 shrink-0" />;
      case "moving":
        return <Truck className="w-12 h-12 text-slate-500 shrink-0" />;
      case "construction":
      default:
        return <Hammer className="w-12 h-12 text-slate-500 shrink-0" />;
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: MAIN CATEGORIES VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-6 select-none font-sans">
      {/* ── Top Header & Add Category Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            {categories.length} total categories
          </p>
        </div>

        {/* Add New Category Button */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* ── Main White Container Card ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-2xs">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Failed to load categories: {error.message}
          </div>
        )}
        {mutationError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {mutationError}
          </div>
        )}
        {/* Search & All Categories Dropdown Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Pill Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-full text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all"
            />
          </div>

        </div>

        {/* ── Table Container ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-3">CATEGORY</th>
                <th className="py-3.5 px-3">DESCRIPTION</th>
                <th className="py-3.5 px-3">LEAD COUNT</th>
                <th className="py-3.5 px-3">CREDIT COST</th>
                <th className="py-3.5 px-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                    No categories found matching your search.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* CATEGORY (Icon + Pill) */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {renderCategoryIcon(cat.name, cat.iconUrl)}
                        <span className="text-sm font-medium text-slate-700">
                          {cat.name}
                        </span>
                      </div>
                    </td>

                    {/* DESCRIPTION */}
                    <td
                      className="py-4 px-3 text-slate-600 text-xs sm:text-sm max-w-[280px] truncate"
                      title={cat.description}
                    >
                      {cat.description}
                    </td>

                    {/* LEAD COUNT */}
                    <td className="py-4 px-3 text-slate-600 font-medium text-sm whitespace-nowrap">
                      {cat.totalLeads}
                    </td>

                    {/* CREDIT COST */}
                    <td className="py-4 px-3 text-slate-600 font-medium text-sm whitespace-nowrap">
                      {cat.creditCost}
                    </td>

                    {/* ACTION (Edit / Delete) */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(cat)}
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
          <span>
            Showing {categories.length} matching categories
            {isValidating && " · Syncing..."}
          </span>
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

      {/* ── Add / Edit Category Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-bold text-[#0F172A]">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Upload Icon Box */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Upload Icon
                  </label>
                  <div
                    onClick={() => iconFileInputRef.current?.click()}
                    className="border border-dashed border-slate-300 rounded-2xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <input
                      ref={iconFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/heic,image/heif"
                      onChange={handleIconFileChange}
                      className="hidden"
                    />
                    {uploadedIconName ? (
                      <div>
                        <div className="w-9 h-9 rounded-full bg-[#E6F8F2] text-[#00BC7D] flex items-center justify-center mx-auto mb-1.5">
                          {uploadedIconUrl ? (
                            <Image
                              src={uploadedIconUrl}
                              alt={`${formName || "Category"} icon preview`}
                              width={36}
                              height={36}
                              unoptimized
                              className="w-9 h-9 rounded-full object-contain"
                            />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </div>
                        <div className="text-xs font-semibold text-[#00705d]">
                          {uploadedIconName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Click to replace image
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                        <div className="text-xs font-medium text-slate-600">
                          Click to select or drop icon file
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          PNG, JPG, JPEG, HEIC, HEIF — Max 10 MB
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solar Panels"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                      formErrors.name
                        ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                        : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                      <span>•</span>
                      <span>{formErrors.name}</span>
                    </p>
                  )}
                </div>

                {/* Descriptions */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    placeholder="e.g. Residential and commercial solar systems, storage batteries, tax incentives."
                    value={formDescription}
                    onChange={(e) => {
                      setFormDescription(e.target.value);
                      if (formErrors.description) setFormErrors((prev) => ({ ...prev, description: undefined }));
                    }}
                    rows={3}
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

                {/* Credit Cost */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Credit Cost <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 15 Cr"
                    value={formCreditCost}
                    onChange={(e) => {
                      setFormCreditCost(e.target.value);
                      if (formErrors.creditCost) setFormErrors((prev) => ({ ...prev, creditCost: undefined }));
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                      formErrors.creditCost
                        ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                        : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                    }`}
                  />
                  {formErrors.creditCost && (
                    <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                      <span>•</span>
                      <span>{formErrors.creditCost}</span>
                    </p>
                  )}
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={isMutating}
                className="px-6 py-2.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                {isUploading
                  ? "Uploading..."
                  : isMutating
                    ? "Saving..."
                    : editingCategory
                      ? "Update Category"
                      : "Upload Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Delete Category</h3>
                  <p className="text-xs text-slate-400">Confirm category removal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3 text-sm">
              <p className="text-slate-600 text-sm leading-relaxed">
                Are you sure you want to delete the category{" "}
                <span className="font-semibold text-[#0F172A]">&quot;{categoryToDelete.name}&quot;</span>?
              </p>
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-800">
                This action cannot be undone. Leads currently assigned to this category will be preserved.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isMutating}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
              >
                {isMutating ? "Deleting..." : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
