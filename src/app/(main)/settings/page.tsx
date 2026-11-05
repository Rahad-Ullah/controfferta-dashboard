"use client";

import { Check, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

const AVAILABLE_CATEGORIES = [
  "Windows & Doors",
  "Construction",
  "Renovation",
  "Air Conditioning",
  "Moving",
  "Solar Panels",
];

export default function SettingsPage() {
  // ── Profile form state ──
  const [firstName, setFirstName] = useState("Marco");
  const [lastName, setLastName] = useState("Ferretti");
  const [company, setCompany] = useState("Ferretti Serramenti Srl");
  const [email, setEmail] = useState("marco@ferretti.it");
  const [phone, setPhone] = useState("+39 333 123 4567");

  // Selected categories of interest
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Windows & Doors",
    "Construction",
  ]);

  // Profile validation errors
  const [profileErrors, setProfileErrors] = useState<{
    firstName?: string;
    lastName?: string;
    company?: string;
    email?: string;
    phone?: string;
    categories?: string;
  }>({});

  // ── Security form state ──
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Security validation errors
  const [securityErrors, setSecurityErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Toggle category of interest
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
      if (next.length > 0 && profileErrors.categories) {
        setProfileErrors((pe) => ({ ...pe, categories: undefined }));
      }
      return next;
    });
  };

  // ── Handle Save Profile Changes ──
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: typeof profileErrors = {};

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!company.trim()) {
      errors.company = "Company name is required";
    }

    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (phone.replace(/\D/g, "").length < 6) {
      errors.phone = "Please enter a valid phone number";
    }

    if (selectedCategories.length === 0) {
      errors.categories = "Please select at least one category of interest";
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      toast.error("Please fill in all required profile fields correctly");
      return;
    }

    setProfileErrors({});
    toast.success("Profile saved successfully");
  };

  // ── Handle Update Password (Security) ──
  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: typeof securityErrors = {};

    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setSecurityErrors(errors);
      toast.error("Please check the password fields");
      return;
    }

    setSecurityErrors({});
    toast.success("Password updated successfully");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6 pb-12 select-none font-sans">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          Profile & Settings
        </h1>
      </div>

      {/* ── Main Two-Column Layout with 2 Separate Forms & Buttons ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* ── Section 1: Profile Card (Takes 3 of 5 cols) ── */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/70 shadow-2xs">
          <form onSubmit={handleProfileSubmit} className="space-y-5" noValidate>
            {/* First Name & Last Name (2-Col Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marco"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (profileErrors.firstName) {
                      setProfileErrors((prev) => ({ ...prev, firstName: undefined }));
                    }
                  }}
                  className={`w-full border rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                    profileErrors.firstName
                      ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                      : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                  }`}
                />
                {profileErrors.firstName && (
                  <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                    <span>•</span>
                    <span>{profileErrors.firstName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ferretti"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (profileErrors.lastName) {
                      setProfileErrors((prev) => ({ ...prev, lastName: undefined }));
                    }
                  }}
                  className={`w-full border rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                    profileErrors.lastName
                      ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                      : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                  }`}
                />
                {profileErrors.lastName && (
                  <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                    <span>•</span>
                    <span>{profileErrors.lastName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Company <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ferretti Serramenti Srl"
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  if (profileErrors.company) {
                    setProfileErrors((prev) => ({ ...prev, company: undefined }));
                  }
                }}
                className={`w-full border rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                  profileErrors.company
                    ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                    : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                }`}
              />
              {profileErrors.company && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                  <span>•</span>
                  <span>{profileErrors.company}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. marco@ferretti.it"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (profileErrors.email) {
                    setProfileErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                className={`w-full border rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                  profileErrors.email
                    ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                    : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                }`}
              />
              {profileErrors.email && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                  <span>•</span>
                  <span>{profileErrors.email}</span>
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. +39 333 123 4567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (profileErrors.phone) {
                    setProfileErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                }}
                className={`w-full border rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                  profileErrors.phone
                    ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                    : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                }`}
              />
              {profileErrors.phone && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                  <span>•</span>
                  <span>{profileErrors.phone}</span>
                </p>
              )}
            </div>

            {/* Categories of interest */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-700 mb-3 block">
                Categories of interest <span className="text-rose-500">*</span>
              </label>

              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_CATEGORIES.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                        isChecked
                          ? "border-[#00BC7D] bg-emerald-50/40 text-slate-800"
                          : "border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-[#00BC7D] text-white"
                            : "border border-slate-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
              {profileErrors.categories && (
                <p className="text-xs text-rose-500 font-medium mt-2 flex items-center gap-1">
                  <span>•</span>
                  <span>{profileErrors.categories}</span>
                </p>
              )}
            </div>

            {/* Profile Section Submit Button */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer text-center"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* ── Section 2: Security Card (Takes 2 of 5 cols) ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/70 shadow-2xs">
          <form onSubmit={handleSecuritySubmit} className="space-y-5" noValidate>
            <h2 className="font-bold text-sm sm:text-base text-[#0F172A]">
              Security
            </h2>

            {/* New Password */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (securityErrors.newPassword) {
                      setSecurityErrors((prev) => ({
                        ...prev,
                        newPassword: undefined,
                      }));
                    }
                  }}
                  className={`w-full border rounded-2xl pl-4 pr-11 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                    securityErrors.newPassword
                      ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                      : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {securityErrors.newPassword && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                  <span>•</span>
                  <span>{securityErrors.newPassword}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (securityErrors.confirmPassword) {
                      setSecurityErrors((prev) => ({
                        ...prev,
                        confirmPassword: undefined,
                      }));
                    }
                  }}
                  className={`w-full border rounded-2xl pl-4 pr-11 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                    securityErrors.confirmPassword
                      ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                      : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {securityErrors.confirmPassword && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                  <span>•</span>
                  <span>{securityErrors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Security Section Submit Button */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer text-center"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
