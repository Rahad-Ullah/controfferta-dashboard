"use client";

import { Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";
import { apiKeys } from "@/lib/api/keys";
import { nextFetch } from "@/lib/api/fetcher";

interface PackageItem {
  _id: string;
  name: string;
  description: string;
  creditsAmount: number;
  price: number;
  unitPrice?: string;
  tag?: "popular" | "recommended" | null;
  status: "active" | "inactive";
  purchaseCount: number;
}

export default function CreditPackagesPage() {
  const { mutate } = useSWRConfig();
  const { data: packages = [], isLoading } = useSWR<PackageItem[]>(apiKeys.creditPackages(""));

  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<PackageItem | null>(null);
  const [packageToToggle, setPackageToToggle] = useState<PackageItem | null>(null);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCreditCost, setFormCreditCost] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formBadge, setFormBadge] = useState<"popular" | "recommended" | undefined>(undefined);

  const [formErrors, setFormErrors] = useState<{ name?: string; description?: string; creditCost?: string; price?: string }>({});

  const { trigger: createPackage, isMutating: isCreating } = useSWRMutation(
    apiKeys.creditPackageCreate,
    (url: string, { arg }: { arg: Record<string, unknown> }) => nextFetch({ url, method: "POST", payload: arg }),
  );
  const { trigger: updatePackage, isMutating: isUpdating } = useSWRMutation(
    editingPackage ? apiKeys.creditPackage(editingPackage._id) : null,
    (url: string, { arg }: { arg: Record<string, unknown> }) => nextFetch({ url, method: "PATCH", payload: arg }),
  );
  const { trigger: deletePackage, isMutating: isDeleting } = useSWRMutation(
    packageToDelete ? apiKeys.creditPackage(packageToDelete._id) : null,
    (url: string) => nextFetch({ url, method: "DELETE" }),
  );
  const { trigger: updatePackageStatus, isMutating: isUpdatingStatus } = useSWRMutation(
    apiKeys.creditPackages(),
    async (_key, { arg }: { arg: { id: string; status: PackageItem["status"] } }) =>
      nextFetch<PackageItem>({
        url: apiKeys.creditPackage(arg.id),
        method: "PATCH",
        payload: { status: arg.status },
      }),
    { populateCache: false, revalidate: false },
  );

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

  const handleOpenEdit = (pkg: PackageItem) => {
    setEditingPackage(pkg);
    setFormName(pkg.name);
    setFormDescription(pkg.description);
    setFormCreditCost(`${pkg.creditsAmount}`);
    setFormPrice(`${pkg.price}`);
    setFormBadge(pkg.tag === "popular" ? "popular" : pkg.tag === "recommended" ? "recommended" : undefined);
    setFormErrors({});
    setIsPackageModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!packageToDelete) return;
    try {
      await deletePackage(undefined, { throwOnError: true });
      await mutate(apiKeys.creditPackages(""));
      toast.success(`Package "${packageToDelete.name}" deleted successfully`);
      setPackageToDelete(null);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Unable to delete package");
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!packageToToggle) return;
    const nextStatus: PackageItem["status"] = packageToToggle.status === "active" ? "inactive" : "active";
    try {
      await updatePackageStatus({ id: packageToToggle._id, status: nextStatus }, { throwOnError: true });
      await mutate(apiKeys.creditPackages(""));
      toast.success(`Package ${nextStatus === "active" ? "enabled" : "disabled"} successfully`);
      setPackageToToggle(null);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Unable to update package status");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; description?: string; creditCost?: string; price?: string } = {};
    if (!formName.trim()) errors.name = "Package name is required";
    if (!formDescription.trim()) errors.description = "Description is required";
    const cleanCredits = formCreditCost.replace(/\D/g, "");
    if (!cleanCredits || parseInt(cleanCredits, 10) <= 0) errors.creditCost = "Credit amount is required and must be at least 1 credit";
    const cleanPrice = parseFloat(formPrice.replace(/[^0-9.]/g, ""));
    if (isNaN(cleanPrice) || cleanPrice <= 0) errors.price = "Valid price in € is required (e.g. 49)";
    if (Object.keys(errors).length > 0) { setFormErrors(errors); toast.error("Please fill in all required fields correctly"); return; }
    const parsedCredits = parseInt(cleanCredits, 10);
    const parsedPrice = cleanPrice;
    const payload = { name: formName.trim(), description: formDescription.trim(), creditsAmount: parsedCredits, price: parsedPrice, tag: formBadge ?? null };
    try {
      if (editingPackage) await updatePackage(payload, { throwOnError: true });
      else await createPackage(payload, { throwOnError: true });
      await mutate(apiKeys.creditPackages(""));
      toast.success(editingPackage ? "Package updated successfully" : "Package created successfully");
      setFormErrors({});
      setIsPackageModalOpen(false);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Unable to save package");
    }
  };

  return (
    <div className="space-y-8 pb-12 select-none font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">Credit Packages</h1>
          <p className="text-sm text-slate-500 font-normal mt-1">{packages.length} total packages{isLoading && " · Loading..."}</p>
        </div>
        <button type="button" onClick={handleOpenAdd} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto">
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Package</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:gap-6">
        {packages.map((pkg) => (
          <div key={pkg._id} className="group relative flex min-w-0 flex-col justify-between rounded-2xl border-2 border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-[#00BC7D] hover:bg-emerald-50/20 hover:shadow-xs sm:p-5 xl:p-6">
            {pkg.tag && (
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-[11px] font-semibold text-white shadow-2xs ${pkg.tag === "popular" ? "bg-[#00BC7D]" : "bg-[#0F172A]"}`}>
                {pkg.tag === "popular" ? "Most popular" : "Recommended"}
              </div>
            )}
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-[#0F172A] transition-colors group-hover:text-[#00BC7D] sm:text-4xl">{pkg.creditsAmount}</div>
              <div className="text-xs text-slate-500 font-normal mt-0.5">credits</div>
              <div className="mt-5"><div className="text-xl font-bold text-[#0F172A]">€ {pkg.price}</div></div>
              <div className="mt-5"><div className="text-sm font-bold text-[#0F172A]">{pkg.name}</div><p className="text-xs text-slate-400 mt-1 leading-relaxed min-h-[32px]">{pkg.description}</p></div>
              <div className="mt-5"><div className={`text-xs font-semibold ${pkg.status === "active" ? "text-[#0F172A]" : "text-slate-400"}`}>{pkg.status}</div><div className="text-xs text-slate-400 mt-0.5">{pkg.purchaseCount} sold</div></div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 pt-5 sm:flex-nowrap sm:pt-6">
              <button type="button" onClick={() => handleOpenEdit(pkg)} className="flex-1 py-2 px-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-colors cursor-pointer text-center">Edit</button>
              <button type="button" onClick={() => setPackageToToggle(pkg)} className={`flex-1 rounded-lg border px-3 py-2 text-center text-xs font-semibold transition-colors cursor-pointer ${pkg.status === "active" ? "border-rose-200 bg-rose-50/30 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-600" : "border-emerald-200 bg-emerald-50/30 text-[#00705d] hover:border-emerald-300 hover:bg-emerald-100"}`}>{pkg.status === "active" ? "Disable" : "Enable"}</button>
              <button type="button" onClick={() => setPackageToDelete(pkg)} className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-500 transition-colors hover:border-rose-300 hover:bg-rose-100 hover:text-rose-600" title="Delete package"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-bold text-[#0F172A]">{editingPackage ? "Edit Package" : "Add New Package"}</h2>
              <button type="button" onClick={() => setIsPackageModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer" title="Close"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                <div><label className="text-xs font-semibold text-slate-700 mb-1.5 block">Package Name <span className="text-rose-500">*</span></label><input type="text" placeholder="e.g. Enterprise" value={formName} onChange={(e) => { setFormName(e.target.value); if (formErrors.name) setFormErrors((p) => ({ ...p, name: undefined })); }} className="w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40" />{formErrors.name && <p className="text-xs text-rose-500 font-medium mt-1.5">{formErrors.name}</p>}</div>
                <div><label className="text-xs font-semibold text-slate-700 mb-1.5 block">Description <span className="text-rose-500">*</span></label><textarea placeholder="Description" value={formDescription} onChange={(e) => { setFormDescription(e.target.value); if (formErrors.description) setFormErrors((p) => ({ ...p, description: undefined })); }} rows={3} className="w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all resize-none bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40" />{formErrors.description && <p className="text-xs text-rose-500 font-medium mt-1.5">{formErrors.description}</p>}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-xs font-semibold text-slate-700 mb-1.5 block">Credit Cost <span className="text-rose-500">*</span></label><input type="text" placeholder="e.g. 500" value={formCreditCost} onChange={(e) => { setFormCreditCost(e.target.value.replace(/\D/g, "")); if (formErrors.creditCost) setFormErrors((p) => ({ ...p, creditCost: undefined })); }} inputMode="numeric" className="w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40" />{formErrors.creditCost && <p className="text-xs text-rose-500 font-medium mt-1.5">{formErrors.creditCost}</p>}</div>
                  <div><label className="text-xs font-semibold text-slate-700 mb-1.5 block">Price (€) <span className="text-rose-500">*</span></label><input type="text" placeholder="e.g. 299" value={formPrice} onChange={(e) => { setFormPrice(e.target.value.replace(/[^0-9.]/g, "")); if (formErrors.price) setFormErrors((p) => ({ ...p, price: undefined })); }} inputMode="decimal" className="w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40" />{formErrors.price && <p className="text-xs text-rose-500 font-medium mt-1.5">{formErrors.price}</p>}</div>
                </div>
                <div><label className="text-xs font-semibold text-slate-700 mb-1.5 block">Badge Tag (Optional)</label><div className="grid grid-cols-3 gap-2">{[{ label: "None", value: undefined }, { label: "Popular", value: "popular" as const }, { label: "Recommended", value: "recommended" as const }].map((b) => (<button key={b.label} type="button" onClick={() => setFormBadge(b.value)} className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${formBadge === b.value ? "border-[#00BC7D] bg-emerald-50 text-[#00705d]" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>{b.label}</button>))}</div></div>
              </form>
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
              <button type="button" onClick={() => setIsPackageModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">Cancel</button>
              <button type="button" onClick={handleFormSubmit} disabled={isCreating || isUpdating} className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#00BC7D] hover:bg-[#00a86b] text-white shadow-xs transition-colors cursor-pointer">{editingPackage ? "Save Changes" : "Create Package"}</button>
            </div>
          </div>
        </div>
      )}

      {packageToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div><h3 className="text-base font-bold text-[#0F172A]">Delete Package</h3><p className="text-xs text-slate-400">Confirm package removal</p></div>
              <button type="button" onClick={() => setPackageToDelete(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <p className="text-slate-600 text-sm leading-relaxed">Are you sure you want to delete package <span className="font-semibold text-[#0F172A]">{packageToDelete.name}</span>?</p>
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button type="button" onClick={() => setPackageToDelete(null)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">Cancel</button>
              <button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs">Delete Package</button>
            </div>
          </div>
        </div>
      )}

      {packageToToggle && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div><h3 className="text-base font-bold text-[#0F172A]">{packageToToggle.status === "active" ? "Disable Package" : "Enable Package"}</h3><p className="text-xs text-slate-400">Confirm status change</p></div>
              <button type="button" onClick={() => setPackageToToggle(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 text-sm leading-relaxed text-slate-600">Are you sure you want to {packageToToggle.status === "active" ? "disable" : "enable"} package <span className="font-semibold text-[#0F172A]">{packageToToggle.name}</span>?</div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button type="button" onClick={() => setPackageToToggle(null)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">Cancel</button>
              <button type="button" onClick={handleConfirmStatusChange} disabled={isUpdatingStatus} className={`cursor-pointer rounded-xl px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${packageToToggle.status === "active" ? "bg-rose-500 hover:bg-rose-600" : "bg-[#00BC7D] hover:bg-[#00a86b]"}`}>{packageToToggle.status === "active" ? "Disable Package" : "Enable Package"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
