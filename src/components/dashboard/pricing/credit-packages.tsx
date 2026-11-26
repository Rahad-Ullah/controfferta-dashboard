"use client";

import { Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface PackageItem {
  id: string;
  credits: number;
  price: number;
  unitPrice: string;
  name: string;
  description: string;
  status: "Active" | "Disabled";
  soldCount: number;
  badge?: "Most popular" | "Recommended";
}

const INITIAL_PACKAGES: PackageItem[] = [
  {
    id: "1",
    credits: 50,
    price: 49,
    unitPrice: "€ 0.98/credit",
    name: "Starter",
    description: "Ideal for testing the platform",
    status: "Active",
    soldCount: 1254,
  },
  {
    id: "2",
    credits: 150,
    price: 129,
    unitPrice: "€ 0.86/credit",
    name: "Growth",
    description: "For teams with medium volume",
    status: "Active",
    soldCount: 1254,
    badge: "Most popular",
  },
  {
    id: "3",
    credits: 500,
    price: 349,
    unitPrice: "€ 0.70/credit",
    name: "Professional",
    description: "For growing companies",
    status: "Active",
    soldCount: 1254,
    badge: "Recommended",
  },
  {
    id: "4",
    credits: 1000,
    price: 599,
    unitPrice: "€ 0.60/credit",
    name: "Enterprise",
    description: "Maximum volume and savings",
    status: "Active",
    soldCount: 1254,
  },
];

export default function PricingPage() {
  const [packages, setPackages] = useState<PackageItem[]>(INITIAL_PACKAGES);

  // Modal states
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<PackageItem | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCreditCost, setFormCreditCost] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formBadge, setFormBadge] = useState<"Most popular" | "Recommended" | undefined>(undefined);

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    description?: string;
    creditCost?: string;
    price?: string;
  }>({});

  // Open Add Package Modal
  const handleOpenAdd = () => {
    setEditingPackage(null);
    setFormName("");
    setFormDescription("");
    setFormCreditCost("");
    setFormPrice("");
    setFormBadge(undefined);
    setFormErrors({});
    setIsPackageModalOpen(true);
  };

  // Open Edit Package Modal
  const handleOpenEdit = (pkg: PackageItem) => {
    setEditingPackage(pkg);
    setFormName(pkg.name);
    setFormDescription(pkg.description);
    setFormCreditCost(`${pkg.credits}`);
    setFormPrice(`${pkg.price}`);
    setFormBadge(pkg.badge);
    setFormErrors({});
    setIsPackageModalOpen(true);
  };

  // Toggle Status (Disable / Enable)
  const handleToggleStatus = (id: string) => {
    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === id) {
          const newStatus = pkg.status === "Active" ? "Disabled" : "Active";
          toast.success(
            `Package ${pkg.name} is now ${newStatus.toLowerCase()}`
          );
          return { ...pkg, status: newStatus };
        }
        return pkg;
      })
    );
  };

  // Confirm Delete Package
  const handleConfirmDelete = () => {
    if (!packageToDelete) return;
    setPackages((prev) => prev.filter((pkg) => pkg.id !== packageToDelete.id));
    toast.success(`Package "${packageToDelete.name}" deleted successfully`);
    setPackageToDelete(null);
  };

  // Handle Form Submit with Strict Inline Validation
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {
      name?: string;
      description?: string;
      creditCost?: string;
      price?: string;
    } = {};

    if (!formName.trim()) {
      errors.name = "Package name is required";
    }

    if (!formDescription.trim()) {
      errors.description = "Description is required";
    }

    const cleanCredits = formCreditCost.replace(/\D/g, "");
    if (!cleanCredits || parseInt(cleanCredits, 10) <= 0) {
      errors.creditCost = "Credit amount is required and must be at least 1 credit";
    }

    const cleanPrice = parseFloat(formPrice.replace(/[^0-9.]/g, ""));
    if (isNaN(cleanPrice) || cleanPrice <= 0) {
      errors.price = "Valid price in € is required (e.g. 49)";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const parsedCredits = parseInt(cleanCredits, 10);
    const parsedPrice = cleanPrice;
    const calculatedUnitPrice = `€ ${(parsedPrice / parsedCredits).toFixed(2)}/credit`;

    if (editingPackage) {
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === editingPackage.id
            ? {
                ...pkg,
                name: formName.trim(),
                description: formDescription.trim(),
                credits: parsedCredits,
                price: parsedPrice,
                unitPrice: calculatedUnitPrice,
                badge: formBadge,
              }
            : pkg
        )
      );
      toast.success("Package updated successfully");
    } else {
      const newPackage: PackageItem = {
        id: Date.now().toString(),
        name: formName.trim(),
        description: formDescription.trim(),
        credits: parsedCredits,
        price: parsedPrice,
        unitPrice: calculatedUnitPrice,
        status: "Active",
        soldCount: 0,
        badge: formBadge,
      };

      setPackages((prev) => [...prev, newPackage]);
      toast.success("Package created successfully");
    }

    setFormErrors({});
    setIsPackageModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12 select-none font-sans">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Credit Packages
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            {packages.length} total packages
          </p>
        </div>

        {/* + Add New Package Button */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Package</span>
        </button>
      </div>

      {/* ── Packages Grid ── */}
      <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:gap-6">
        {packages.map((pkg) => {
          const isMostPopular = pkg.badge === "Most popular";
          const isRecommended = pkg.badge === "Recommended";

          return (
            <div
              key={pkg.id}
              className="group relative flex min-w-0 flex-col justify-between rounded-2xl border-2 border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-[#00BC7D] hover:bg-emerald-50/20 hover:shadow-xs sm:p-5 xl:p-6"
            >
              {/* Badge: Most Popular or Recommended */}
              {isMostPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00BC7D] text-white text-[11px] font-semibold px-3 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
                  Most popular
                </div>
              )}
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[11px] font-semibold px-3 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
                  Recommended
                </div>
              )}

              {/* Top Details */}
              <div>
                {/* Credits Count */}
                <div>
                  <div
                    className="text-3xl font-extrabold tracking-tight text-[#0F172A] transition-colors group-hover:text-[#00BC7D] sm:text-4xl"
                  >
                    {pkg.credits}
                  </div>
                  <div className="text-xs text-slate-500 font-normal mt-0.5">
                    credits
                  </div>
                </div>

                {/* Price & Unit Rate */}
                <div className="mt-5">
                  <div className="text-xl font-bold text-[#0F172A]">
                    € {pkg.price}
                  </div>
                  <div className="text-xs text-slate-400 font-normal mt-0.5">
                    {pkg.unitPrice}
                  </div>
                </div>

                {/* Package Name & Description */}
                <div className="mt-5">
                  <div className="text-sm font-bold text-[#0F172A]">
                    {pkg.name}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed min-h-[32px]">
                    {pkg.description}
                  </p>
                </div>

                {/* Status & Sold */}
                <div className="mt-5">
                  <div
                    className={`text-xs font-semibold ${
                      pkg.status === "Active"
                        ? "text-[#0F172A]"
                        : "text-slate-400"
                    }`}
                  >
                    {pkg.status}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {pkg.soldCount} sold
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Edit, Disable & Delete */}
              <div className="mt-2 flex flex-wrap items-center gap-2 pt-5 sm:flex-nowrap sm:pt-6">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(pkg)}
                  className="flex-1 py-2 px-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-colors cursor-pointer text-center"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(pkg.id)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer text-center ${
                    pkg.status === "Active"
                      ? "border-rose-200 bg-rose-50/30 hover:bg-rose-50 text-rose-500"
                      : "border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 text-[#00BC7D]"
                  }`}
                >
                  {pkg.status === "Active" ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  onClick={() => setPackageToDelete(pkg)}
                  className="w-8 h-8 rounded-lg border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Delete package"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add / Edit Package Modal ── */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-bold text-[#0F172A]">
                {editingPackage ? "Edit Package" : "Add New Package"}
              </h2>
              <button
                type="button"
                onClick={() => setIsPackageModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                {/* Package Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Package Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Enterprise, Starter, Growth"
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
                    <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                      <span>•</span>
                      <span>{formErrors.name}</span>
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    placeholder="e.g. Maximum volume and savings for growing companies"
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
                    <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                      <span>•</span>
                      <span>{formErrors.description}</span>
                    </p>
                  )}
                </div>

                {/* Credit Cost & Price (2 Column Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Credit Cost <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500 Cr"
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
                      <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                        <span>•</span>
                        <span>{formErrors.creditCost}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Price (€) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 299"
                      value={formPrice}
                      onChange={(e) => {
                        setFormPrice(e.target.value);
                        if (formErrors.price) setFormErrors((prev) => ({ ...prev, price: undefined }));
                      }}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                        formErrors.price
                          ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                          : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                      }`}
                    />
                    {formErrors.price && (
                      <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                        <span>•</span>
                        <span>{formErrors.price}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Badge Tag Selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Badge Tag (Optional)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { label: "None", value: undefined },
                        { label: "Most popular", value: "Most popular" as const },
                        { label: "Recommended", value: "Recommended" as const },
                      ] as const
                    ).map((b) => {
                      const isSelected = formBadge === b.value;
                      return (
                        <button
                          key={b.label}
                          type="button"
                          onClick={() => setFormBadge(b.value)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#00BC7D] bg-emerald-50 text-[#00705d]"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsPackageModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#00BC7D] hover:bg-[#00a86b] text-white shadow-xs transition-colors cursor-pointer"
              >
                {editingPackage ? "Save Changes" : "Create Package"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {packageToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Delete Package</h3>
                  <p className="text-xs text-slate-400">Confirm package removal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPackageToDelete(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3 text-sm">
              <p className="text-slate-600 text-sm leading-relaxed">
                Are you sure you want to delete package{" "}
                <span className="font-semibold text-[#0F172A]">{packageToDelete.name}</span> ({packageToDelete.credits} credits - € {packageToDelete.price})?
              </p>
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-800">
                This package will be permanently removed from the credit packages list.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPackageToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
              >
                Delete Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
