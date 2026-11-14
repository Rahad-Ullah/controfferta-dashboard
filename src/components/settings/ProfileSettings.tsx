"use client";

import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const STATIC_ROLE = "Admin";

export default function ProfileSettings() {
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "Marco",
    lastName: "Ferretti",
    email: "marco@ferretti.it",
    image: "",
    phone: {
      countryCode: "+39",
      number: "3331234567",
    },
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
    location: {
      type: "Point",
      coordinates: [0, 0] as [number, number],
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      phone: { ...prev.phone, [name]: value },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, image: String(reader.result || "") }));
      setIsUploading(false);
      toast.success("Profile image updated locally.");
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to read image.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile saved locally.");
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/5 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif italic font-normal text-[#1E1E1E]">
          Profile Information
        </h2>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F3F0EA] text-[#00BC7D] uppercase tracking-wider">
          {STATIC_ROLE}
        </span>
      </div>

      {/* Avatar & Info */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[#00BC7D] text-white font-serif italic text-3xl flex items-center justify-center shadow-xs shrink-0 overflow-hidden relative">
          {formData.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={formData.image}
              alt="Profile Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            formData.firstName ? formData.firstName.charAt(0).toUpperCase() : "U"
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="font-serif italic text-xl font-medium text-[#1E1E1E]">
            {formData.firstName} {formData.lastName}
          </h3>
          <p className="text-xs text-neutral-500">{formData.email}</p>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={handlePhotoClick}
            className="mt-1 text-[#1E1E1E] text-xs font-normal px-3.5 py-1.5 rounded-md border border-gray-200 transition-all shadow-2xs cursor-pointer hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading && <Loader2 className="w-3 h-3 animate-spin text-[#00BC7D]" />}
            {isUploading ? "Uploading..." : "Change photo"}
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSave} className="space-y-6 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="firstName" className="text-xs font-semibold text-[#2B2927] mb-1.5 block">
              First name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Type your first name"
              className="bg-[#FAF8F4] border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/50 w-full transition-all"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="text-xs font-semibold text-[#2B2927] mb-1.5 block">
              Last name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Type your last name"
              className="bg-[#FAF8F4] border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/50 w-full transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-xs font-semibold text-[#2B2927] mb-1.5 block">
              Email (Read Only)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="bg-neutral-100 border border-gray-200 rounded-lg px-4 py-3 text-sm text-neutral-500 w-full cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="number" className="text-xs font-semibold text-[#2B2927] mb-1.5 block">
              Phone Number
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                id="number"
                name="number"
                value={formData.phone.number}
                onChange={handlePhoneChange}
                placeholder="Type your phone number"
                className="bg-[#FAF8F4] border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#1E1E1E] focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/50 w-full transition-all"
              />
            </div>
          </div>

        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isUploading}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-all shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
