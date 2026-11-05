"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../../../features/auth/authSlice";
import { saveRefreshToken, saveToken, saveUser } from "../../../../utils/storage";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const dispatch = useDispatch();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (email.trim().toLowerCase() === "admin@gmail.com" && password.trim() === "hello123") {
      setIsLoading(true);
      toast.success("User logged in successfully.");

      const mockPayload = {
        id: "admin-1",
        email: "admin@gmail.com",
        role: "super_admin",
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };
      const base64Payload = btoa(JSON.stringify(mockPayload)).replace(/=/g, "");
      const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${base64Payload}.mock_signature`;
      const refreshToken = "mock-refresh-token";
      const user = {
        id: "admin-1",
        email: "admin@gmail.com",
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
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FFFDF9] font-sans items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 sm:p-10 bg-[#FDFDFD] rounded-xl border border-black/5 shadow-xs flex flex-col items-center text-center"
        >
          {/* Logo */}
          <div className="mb-3">
            <Image
              src="/icons/logo.png"
              alt="Cloud Salon Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>

          {/* Title & Subtitle */}
          <h2 className="font-serif italic text-2xl sm:text-3xl font-medium text-[#1E1E1E] mb-1">
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal mb-6">
            Log in to your Cloud Salon Admin account.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
            {/* Email Field */}
            <div>
              <label className="text-xs font-semibold text-[#2B2927] mb-1.5 block">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={`w-full bg-[#F3F0EA] border ${errors.email
                  ? "border-gray-200 focus:ring-gray-200/50"
                  : "border-black/5 focus:ring-[#00BC7D]/50"
                  } rounded-lg h-11 px-4 text-sm text-[#1E1E1E] placeholder:text-neutral-500/70 focus:outline-none focus:ring-2 transition-all`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs font-semibold text-[#2B2927] mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="8+ characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  className={`w-full bg-[#F3F0EA] border ${errors.password
                    ? "border-gray-200 focus:ring-gray-200/50"
                    : "border-black/5 focus:ring-[#00BC7D]/50"
                    } rounded-lg h-11 px-4 pr-11 text-sm text-[#1E1E1E] placeholder:text-neutral-500/70 focus:outline-none focus:ring-2 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer  text-neutral-500 hover:text-neutral-800 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-1">
              <Link
                href="/auth/forgot-password"
                className="text-xs font-semibold text-[#00BC7D] hover:underline"
              >
                Forget Password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-sm font-medium transition-all shadow-2xs cursor-pointer flex items-center justify-center"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
