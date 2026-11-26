"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  countryDialCodes,
  getMaxPhoneNumberDigits,
  type CountryDialCode,
} from "@/lib/country-dial-codes";

type CountryPhoneInputProps = {
  country: CountryDialCode;
  phoneNumber: string;
  error?: string;
  onCountryChange: (country: CountryDialCode) => void;
  onPhoneNumberChange: (phoneNumber: string) => void;
};

export function CountryPhoneInput({
  country,
  phoneNumber,
  error,
  onCountryChange,
  onPhoneNumberChange,
}: CountryPhoneInputProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const maxPhoneNumberDigits = getMaxPhoneNumberDigits(country);
  const query = search.trim().toLowerCase();
  const filteredCountries = countryDialCodes.filter(
    (option) =>
      !query ||
      option.name.toLowerCase().includes(query) ||
      option.iso.toLowerCase().includes(query) ||
      option.dialCode.includes(query),
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      if (!selectorRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
  }, [isOpen]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div ref={selectorRef} className="relative sm:w-64">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-2.5 text-sm text-[#0F172A] transition-all focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 ${
            error
              ? "border-rose-400 bg-rose-50/20"
              : "border-slate-200 bg-slate-50/70"
          }`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="text-base">{country.flag}</span>
            <span className="truncate">{country.name}</span>
            <span className="text-slate-500">{country.dialCode}</span>
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-full min-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search country or code"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-[#0F172A] outline-none focus:border-[#00BC7D] focus:ring-2 focus:ring-[#00BC7D]/20"
              />
            </div>
            <div className="max-h-64 overflow-y-auto" role="listbox">
              {filteredCountries.map((option) => (
                <button
                  key={`${option.iso}-${option.dialCode}`}
                  type="button"
                  role="option"
                  aria-selected={option.iso === country.iso}
                  onClick={() => {
                    onCountryChange(option);
                    setSearch("");
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-[#E6F8F2]"
                >
                  <span className="text-base">{option.flag}</span>
                  <span className="min-w-0 flex-1 truncate">{option.name}</span>
                  <span className="text-slate-500">{option.dialCode}</span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <p className="px-3 py-4 text-center text-sm text-slate-500">
                  No countries found
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <input
        type="tel"
        placeholder="e.g. 333 123 4567"
        value={phoneNumber}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={maxPhoneNumberDigits}
        onChange={(event) =>
          onPhoneNumberChange(
            event.target.value.replace(/\D/g, "").slice(0, maxPhoneNumberDigits),
          )
        }
        aria-invalid={Boolean(error)}
        className={`min-w-0 flex-1 rounded-2xl border px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
          error
            ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
            : "border-slate-200 bg-slate-50/70 focus:ring-2 focus:ring-[#00BC7D]/40"
        }`}
      />
    </div>
  );
}
