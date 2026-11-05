"use client";

import {
  AppWindow,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Hammer,
  Plus,
  PlusCircle,
  Search,
  SquarePen,
  Sun,
  Trash2,
  Truck,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  leadCount: number;
  creditCost: number;
  iconType: "window" | "solar" | "construction" | "moving";
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: "1",
    name: "Windows & Doors",
    description: "PVC, aluminum, wood windows, security doors,",
    leadCount: 11,
    creditCost: 12,
    iconType: "window",
  },
  {
    id: "2",
    name: "Solar Panels",
    description: "Residential and commercial solar systems, storage",
    leadCount: 23,
    creditCost: 23,
    iconType: "solar",
  },
  {
    id: "3",
    name: "Construction",
    description: "Residential and commercial solar systems, storage",
    leadCount: 45,
    creditCost: 14,
    iconType: "construction",
  },
  {
    id: "4",
    name: "Windows & Doors",
    description: "Residential and commercial solar systems, storage",
    leadCount: 122,
    creditCost: 12,
    iconType: "window",
  },
  {
    id: "5",
    name: "Construction",
    description: "Residential and commercial solar systems, storage",
    leadCount: 67,
    creditCost: 14,
    iconType: "construction",
  },
  {
    id: "6",
    name: "Construction",
    description: "Residential and commercial solar systems, storage",
    leadCount: 77,
    creditCost: 12,
    iconType: "construction",
  },
  {
    id: "7",
    name: "Windows & Doors",
    description: "Residential and commercial solar systems, storage",
    leadCount: 33,
    creditCost: 12,
    iconType: "window",
  },
  {
    id: "8",
    name: "Construction",
    description: "Residential and commercial solar systems, storage",
    leadCount: 77,
    creditCost: 12,
    iconType: "construction",
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All Categories");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Add / Edit Category Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCreditCost, setFormCreditCost] = useState("");
  const [formQuestions, setFormQuestions] = useState<string[]>([""]);
  const [uploadedIconName, setUploadedIconName] = useState<string | null>(null);

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    creditCost?: string;
    questions?: string;
  }>({});

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === "All Categories"
          ? true
          : cat.name.toLowerCase() === selectedFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [categories, searchQuery, selectedFilter]);

  // Handle Delete Confirmation
  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
    toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
    setCategoryToDelete(null);
  };

  // Open Add Form
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName("");
    setFormDescription("");
    setFormCreditCost("");
    setFormQuestions([""]);
    setUploadedIconName(null);
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setFormName(category.name);
    setFormDescription(category.description);
    setFormCreditCost(`${category.creditCost} Cr`);
    setFormQuestions(["What service do you need?"]);
    setUploadedIconName("category_icon.svg");
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Handle Add Question input field
  const handleAddQuestionField = () => {
    setFormQuestions((prev) => [...prev, ""]);
  };

  const handleQuestionChange = (index: number, value: string) => {
    setFormQuestions((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
    if (formErrors.questions) {
      setFormErrors((prev) => ({ ...prev, questions: undefined }));
    }
  };

  // Handle Submit Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {
      name?: string;
      description?: string;
      creditCost?: string;
      questions?: string;
    } = {};

    if (!formName.trim()) {
      errors.name = "Category name is required";
    }

    if (!formDescription.trim()) {
      errors.description = "Description is required";
    }

    const cleanCost = formCreditCost.replace(/\D/g, "");
    if (!cleanCost || parseInt(cleanCost, 10) <= 0) {
      errors.creditCost = "Credit cost is required and must be at least 1 credit";
    }

    const hasValidQuestion = formQuestions.some((q) => q.trim().length > 0);
    if (!hasValidQuestion) {
      errors.questions = "At least one qualification question is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const numericCost = parseInt(cleanCost, 10);

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formName.trim(),
                description: formDescription.trim(),
                creditCost: numericCost,
              }
            : c
        )
      );
      toast.success("Category updated successfully");
    } else {
      const newCategory: CategoryItem = {
        id: Date.now().toString(),
        name: formName.trim(),
        description: formDescription.trim(),
        leadCount: 0,
        creditCost: numericCost,
        iconType: formName.toLowerCase().includes("solar")
          ? "solar"
          : formName.toLowerCase().includes("door") ||
            formName.toLowerCase().includes("window")
          ? "window"
          : formName.toLowerCase().includes("mov")
          ? "moving"
          : "construction",
      };

      setCategories((prev) => [newCategory, ...prev]);
      toast.success("Category added successfully");
    }

    setFormErrors({});
    setIsAddModalOpen(false);
  };

  // Helper to render icon for Category
  const renderCategoryIcon = (type: CategoryItem["iconType"]) => {
    switch (type) {
      case "window":
        return <AppWindow className="w-4 h-4 text-slate-500 shrink-0" />;
      case "solar":
        return <Sun className="w-4 h-4 text-slate-500 shrink-0" />;
      case "moving":
        return <Truck className="w-4 h-4 text-slate-500 shrink-0" />;
      case "construction":
      default:
        return <Hammer className="w-4 h-4 text-slate-500 shrink-0" />;
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
            12 total categories
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
        {/* Search & All Categories Dropdown Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
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

          {/* All Categories Dropdown Button */}
          <div className="relative self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs sm:text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <span>{selectedFilter}</span>
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
                ].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedFilter(opt);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs sm:text-sm transition-colors cursor-pointer ${
                      selectedFilter === opt
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
                <th className="py-3.5 px-3">DESCRIPTION</th>
                <th className="py-3.5 px-3">LEAD COUNT</th>
                <th className="py-3.5 px-3">CREDIT COST</th>
                <th className="py-3.5 px-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                    No categories found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, idx) => (
                  <tr
                    key={`${cat.id}-${idx}`}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* CATEGORY (Icon + Pill) */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {renderCategoryIcon(cat.iconType)}
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100/90 text-slate-700">
                          {cat.name}
                        </span>
                      </div>
                    </td>

                    {/* DESCRIPTION */}
                    <td className="py-4 px-3 text-slate-600 text-xs sm:text-sm max-w-sm">
                      {cat.description}
                    </td>

                    {/* LEAD COUNT */}
                    <td className="py-4 px-3 text-slate-600 font-medium text-sm whitespace-nowrap">
                      {cat.leadCount}
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
          <span>Showing 1-5 of 48 categories</span>
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
                    onClick={() =>
                      setUploadedIconName(
                        uploadedIconName ? null : "category_icon.svg"
                      )
                    }
                    className="border border-dashed border-slate-300 rounded-2xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {uploadedIconName ? (
                      <div>
                        <div className="w-9 h-9 rounded-full bg-[#E6F8F2] text-[#00BC7D] flex items-center justify-center mx-auto mb-1.5">
                          <Sun className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-semibold text-[#00705d]">
                          {uploadedIconName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Click to remove or replace
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                        <div className="text-xs font-medium text-slate-600">
                          Click to select or drop icon file
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          SVG, PNG — Max 5 MB
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
                    type="text"
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

                {/* Add Questions with Plus Icon */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Qualification Questions <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddQuestionField}
                      className="text-[#0F172A] hover:opacity-75 transition-opacity cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                      title="Add Question"
                    >
                      <PlusCircle className="w-4 h-4 fill-[#0F172A] text-white" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formQuestions.map((q, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder="What service do you need?"
                        value={q}
                        onChange={(e) => handleQuestionChange(idx, e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                          formErrors.questions
                            ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                            : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                        }`}
                      />
                    ))}
                  </div>
                  {formErrors.questions && (
                    <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                      <span>•</span>
                      <span>{formErrors.questions}</span>
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
                className="px-6 py-2.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                {editingCategory ? "Update Category" : "Upload Category"}
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
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
