"use client";

import { Link2, MapPin, Phone, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { apiKeys } from "@/lib/api/keys";
import { nextFetch } from "@/lib/api/fetcher";

type Settings = {
  welcomeCreditAmount?: number;
  contactInfo?: {
    email?: string;
    phone?: string;
    whatsApp?: string;
    address?: Record<string, string>;
    location?: { coordinates?: [number, number] };
  };
  socialLinks?: Record<string, string>;
};

type FormState = {
  welcomeCreditAmount: string;
  email: string;
  phone: string;
  whatsApp: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  [key: string]: string;
};

const socialFields = ["facebook", "instagram", "twitter", "linkedin", "youtube", "tiktok", "discord", "telegram"] as const;
const emptyForm: FormState = {
  welcomeCreditAmount: "0", email: "", phone: "", whatsApp: "",
  line1: "", line2: "", city: "", state: "", postalCode: "", country: "",
  facebook: "", instagram: "", twitter: "", linkedin: "", youtube: "",
  tiktok: "", discord: "", telegram: "",
};

function toForm(data?: Settings | null): FormState {
  const contact = data?.contactInfo;
  const address = contact?.address ?? {};
  return {
    ...emptyForm,
    welcomeCreditAmount: String(data?.welcomeCreditAmount ?? 0),
    email: contact?.email ?? "", phone: sanitizePhone(contact?.phone ?? ""), whatsApp: sanitizePhone(contact?.whatsApp ?? ""),
    line1: address.line1 ?? "", line2: address.line2 ?? "", city: address.city ?? "",
    state: address.state ?? "", postalCode: address.postalCode ?? "", country: address.country ?? "",
    ...Object.fromEntries(socialFields.map((key) => [key, data?.socialLinks?.[key] ?? ""])),
  };
}

function validatePhone(value: string) {
  if (!value.trim()) return "";
  if (!/^\+?[0-9\s().-]+$/.test(value)) return "Use only digits, spaces, +, -, or parentheses";
  const digitCount = value.replace(/\D/g, "").length;
  if (digitCount < 7 || digitCount > 15) return "Phone number must contain 7–15 digits";
  return "";
}

function sanitizePhone(value: string) {
  const allowed = value.replace(/[^0-9\s().+-]/g, "");
  if (allowed.startsWith("+")) {
    return `+${allowed.slice(1).replace(/\+/g, "")}`;
  }
  return allowed.replace(/\+/g, "");
}

function Field({ label, value, onChange, type = "text", placeholder, error }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      <input type={type} value={value} placeholder={placeholder} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border bg-slate-50/70 px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition focus:bg-white focus:ring-2 ${error ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-[#00BC7D] focus:ring-[#00BC7D]/20"}`} />
      {error && <span className="mt-1 block text-[11px] font-medium text-rose-600">{error}</span>}
    </label>
  );
}

function Card({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-6">
      <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F2] text-[#00BC7D]">{icon}</div>
        <div><h2 className="text-base font-bold text-[#0F172A]">{title}</h2><p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p></div>
      </div>
      {children}
    </section>
  );
}

export default function PlatformGeneralInfoPage() {
  const { data, error, isLoading } = useSWR<Settings | null>(apiKeys.settings);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [phoneErrors, setPhoneErrors] = useState<{ phone?: string; whatsApp?: string }>({});
  const [loaded, setLoaded] = useState(false);
  const { trigger, isMutating } = useSWRMutation(apiKeys.settings, (url: string, { arg }: { arg: Record<string, unknown> }) =>
    nextFetch<Settings>({ url, method: "POST", payload: arg }), { revalidate: true });

  useEffect(() => {
    if (!loaded && data !== undefined) { setForm(toForm(data)); setLoaded(true); }
  }, [data, loaded]);

  const update = (key: string, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "phone" || key === "whatsApp") {
      setPhoneErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const updatePhone = (key: "phone" | "whatsApp", value: string) => {
    update(key, sanitizePhone(value));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const credits = Number(form.welcomeCreditAmount);
    if (!Number.isInteger(credits) || credits < 0) return toast.error("Welcome credits must be a whole number of 0 or more");
    const nextPhoneErrors = { phone: validatePhone(form.phone), whatsApp: validatePhone(form.whatsApp) };
    setPhoneErrors(nextPhoneErrors);
    if (nextPhoneErrors.phone || nextPhoneErrors.whatsApp) {
      toast.error("Please enter valid phone numbers");
      return;
    }
    try {
      await trigger({
        welcomeCreditAmount: credits,
        contactInfo: {
          email: form.email, phone: form.phone, whatsApp: form.whatsApp,
          address: { line1: form.line1, line2: form.line2, city: form.city, state: form.state, postalCode: form.postalCode, country: form.country },
        },
        socialLinks: Object.fromEntries(socialFields.map((key) => [key, form[key]])),
      }, { throwOnError: true });
      toast.success("Platform settings saved");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save settings");
    }
  };

  if (isLoading) return <div className="rounded-2xl border border-slate-200/70 bg-white p-8 text-sm text-slate-500">Loading platform settings...</div>;
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">Unable to load platform settings. Please refresh and try again.</div>;

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#00BC7D]">Configuration</p><h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">Platform Settings</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">Manage the contact details, welcome credits, location, and social channels shown across the platform.</p></div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Card icon={<Sparkles className="h-4 w-4" />} title="Welcome credits" description="Set the number of credits new users receive when they join.">
          <div className="max-w-sm"><Field label="Welcome credit amount" type="number" value={form.welcomeCreditAmount} onChange={(value) => update("welcomeCreditAmount", value)} placeholder="0" /><p className="mt-1.5 text-[11px] text-slate-400">Use a whole number. Negative values are not accepted.</p></div>
        </Card>
        <Card icon={<Phone className="h-4 w-4" />} title="Contact information" description="Keep the platform’s primary support channels up to date.">
          <div className="grid gap-4 sm:grid-cols-3"><Field label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} placeholder="support@example.com" /><Field label="Phone" value={form.phone} onChange={(value) => updatePhone("phone", value)} placeholder="+39 ..." error={phoneErrors.phone} /><Field label="WhatsApp" value={form.whatsApp} onChange={(value) => updatePhone("whatsApp", value)} placeholder="+39 ..." error={phoneErrors.whatsApp} /></div>
        </Card>
        <Card icon={<MapPin className="h-4 w-4" />} title="Business address" description="Add the address used for platform contact information.">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Address line 1" value={form.line1} onChange={(value) => update("line1", value)} /><Field label="Address line 2" value={form.line2} onChange={(value) => update("line2", value)} /><Field label="City" value={form.city} onChange={(value) => update("city", value)} /><Field label="State / region" value={form.state} onChange={(value) => update("state", value)} /><Field label="Postal code" value={form.postalCode} onChange={(value) => update("postalCode", value)} /><Field label="Country" value={form.country} onChange={(value) => update("country", value)} /></div>
        </Card>
        <Card icon={<Link2 className="h-4 w-4" />} title="Social links" description="Optional URLs for the platform’s social profiles. Leave a field empty if it does not apply.">
          <div className="grid gap-4 sm:grid-cols-2">{socialFields.map((key) => <Field key={key} label={key === "twitter" ? "X / Twitter" : key[0].toUpperCase() + key.slice(1)} type="url" value={form[key]} onChange={(value) => update(key, value)} placeholder="https://" />)}</div>
        </Card>
        <div className="flex justify-end border-t border-slate-200/80 pt-5"><button type="submit" disabled={isMutating} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00BC7D] px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#00a86b] disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{isMutating ? "Saving..." : "Save platform settings"}</button></div>
      </form>
    </div>
  );
}

