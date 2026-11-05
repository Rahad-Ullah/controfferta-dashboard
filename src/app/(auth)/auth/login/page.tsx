"use client";

import AuthLogo from "@/components/auth/AuthLogo";
import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../../features/auth/authSlice";
import { saveRefreshToken, saveToken, saveUser } from "../../../../utils/storage";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dispatch = useDispatch();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    // Mock Login acceptance or credentials
    if (
      (email.trim().toLowerCase() === "admin@gmail.com" && password.trim() === "hello123") ||
      email.trim().length > 0
    ) {
      toast.success("User logged in successfully.");

      const mockPayload = {
        id: "admin-1",
        email: email.trim(),
        role: "super_admin",
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };
      const base64Payload = btoa(JSON.stringify(mockPayload)).replace(/=/g, "");
      const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Payload}.mock_signature`;
      const refreshToken = "mock-refresh-token";
      const user = {
        id: "admin-1",
        email: email.trim(),
        name: "Admin",
        role: "super_admin",
      };

      dispatch(setCredentials({ token: accessToken, refreshToken, user }));
      saveToken(accessToken);
      saveRefreshToken(refreshToken);
      saveUser(user);

      if (typeof window !== "undefined") {
        localStorage.setItem("role", "super_admin");
        document.cookie = `salon-role=super_admin; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }

      window.location.href = "/";
    } else {
      setIsLoading(false);
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#071317] flex flex-col items-center justify-center p-4 select-none relative overflow-hidden font-sans">
      {/* Background Subtle Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,188,125,0.08),transparent_60%)] pointer-events-none" />

      {/* ── Brand Logo ── */}
      <AuthLogo />

      {/* ── Login Card ── */}
      <div className="w-full max-w-[420px] bg-[#EEF2F6] rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-200/50 space-y-6 relative z-10">
        {/* Title & Subtitle */}
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            Log in as Admin
          </h1>
          <p className="text-xs text-slate-500 font-normal">
            Enter your credentials.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={`w-full bg-[#E2E8EE] border rounded-2xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${errors.email
                  ? "border-rose-400 focus:ring-2 focus:ring-rose-400/40"
                  : "border-slate-300/80 focus:ring-2 focus:ring-[#00BC7D]/50 focus:bg-white"
                }`}
            />
            {errors.email && (
              <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                <span>•</span>
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-[#00BC7D] hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className={`w-full bg-[#E2E8EE] border rounded-2xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${errors.password
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

          {/* Log In Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer text-center disabled:opacity-70"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </div>
        </form>

        {/* Footer */}

      </div>
    </div>
  );
}
