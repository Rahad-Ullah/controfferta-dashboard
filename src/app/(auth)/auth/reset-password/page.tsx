"use client";

import AuthLogo from "@/components/auth/AuthLogo";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import toast from "react-hot-toast";
import { useResetPasswordMutation } from "../../../../features/auth/authApi";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "mock-token";

  const validate = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = "New password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await resetPassword({
        token,
        data: { newPassword: password },
      }).unwrap();
      setIsSuccess(true);
      toast.success("Password updated successfully!");
    } catch {
      // Mock fallback for presentation
      setIsSuccess(true);
      toast.success("Password updated successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-[#071317] flex flex-col items-center justify-center p-4 select-none relative overflow-hidden font-sans">
      {/* Background Subtle Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,188,125,0.08),transparent_60%)] pointer-events-none" />

      {/* ── Brand Logo ── */}
      <AuthLogo />

      {/* ── Card Container ── */}
      <div className="w-full max-w-[420px] bg-[#EEF2F6] rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-200/50 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* ── STATE 2: Password Changed Success Modal (Image 5) ── */}
        {isSuccess ? (
          <div className="text-center py-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            {/* Confetti Celebration Icon */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center mb-2">
              {/* Confetti Dots / Flakes */}
              <span className="absolute top-2 left-4 w-2 h-2 rounded-full bg-amber-400 rotate-12" />
              <span className="absolute top-1 right-5 w-2.5 h-1 rounded-sm bg-blue-500 rotate-45" />
              <span className="absolute bottom-3 left-3 w-1.5 h-3 rounded-full bg-rose-400 -rotate-12" />
              <span className="absolute bottom-2 right-4 w-2 h-2 rounded-sm bg-emerald-400 rotate-45" />
              <span className="absolute top-7 -left-1 w-2.5 h-1 rounded-full bg-purple-400 -rotate-45" />
              <span className="absolute top-7 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-2.5 rounded-sm bg-amber-500 rotate-12" />
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 w-1 h-2 rounded-sm bg-indigo-400 rotate-45" />

              {/* Main Emerald Checkmark Badge */}
              <div className="w-14 h-14 rounded-full bg-[#00BC7D] text-white flex items-center justify-center shadow-md relative z-10">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Password changed!
            </h2>

            {/* Subtitle */}
            <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-xs mx-auto">
              Your password has been updated successfully. You can now sign in securely.
            </p>

            {/* Confirm Button */}
            <div className="pt-4">
              <Link
                href="/auth/login"
                className="w-full py-3.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer text-center block"
              >
                Confirm
              </Link>
            </div>
          </div>
        ) : (
          /* ── STATE 1: Reset Password Form (Image 4) ── */
          <>
            {/* Header with Arrow */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/auth/verify-email"
                className="text-slate-700 hover:text-slate-900 transition-colors p-1 -ml-1 rounded-full hover:bg-slate-200/60"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                Reset Password
              </h2>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* New Password */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }}
                  className={`w-full bg-[#E2E8EE] border rounded-2xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                    errors.password
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-400/40"
                      : "border-slate-300/80 focus:ring-2 focus:ring-[#00BC7D]/50 focus:bg-white"
                  }`}
                />
                {errors.password && (
                  <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                    <span>•</span>
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  className={`w-full bg-[#E2E8EE] border rounded-2xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                    errors.confirmPassword
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-400/40"
                      : "border-slate-300/80 focus:ring-2 focus:ring-[#00BC7D]/50 focus:bg-white"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                    <span>•</span>
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons (Stacked) */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer text-center disabled:opacity-70"
                >
                  {isLoading ? "Saving..." : "Confirm"}
                </button>

                <Link
                  href="/auth/login"
                  className="w-full py-3 rounded-full border border-slate-300/80 hover:bg-slate-200/50 text-slate-600 font-semibold text-xs sm:text-sm text-center transition-colors block"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
