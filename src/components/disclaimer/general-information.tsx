"use client";

import { Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

type GeneralTab = "About Us" | "How it Works" | "Contact";

interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
}

interface GeneralSection {
  id: string;
  sectionNumber: number;
  title: string;
  subtitle: string;
  features?: FeatureItem[];
}

// ── INITIAL DATA FOR "About Us" TAB ──
const INITIAL_ABOUT_SECTIONS: GeneralSection[] = [
  {
    id: "about-1",
    sectionNumber: 1,
    title: "About Us",
    subtitle:
      "CONTROFFERTA.IT is the Italian B2B marketplace for qualified lead generation. We connect businesses with customers...",
  },
  {
    id: "about-2",
    sectionNumber: 2,
    title: "Our Mission",
    subtitle:
      "We believe every business deserves to connect with customers who are genuinely interested in their services...",
    features: [
      {
        id: "af-1",
        title: "Qualified Leads",
        subtitle:
          "We believe every business deserves to connect with their services...",
      },
      {
        id: "af-2",
        title: "Verified Data",
        subtitle:
          "We believe every business deserves to connect with their services...",
      },
      {
        id: "af-3",
        title: "Verified Data",
        subtitle:
          "We believe every business deserves to connect with their services...",
      },
      {
        id: "af-4",
        title: "Verified Data",
        subtitle:
          "We believe every business deserves to connect with their services...",
      },
    ],
  },
  {
    id: "about-3",
    sectionNumber: 3,
    title: "Why lead quality matters",
    subtitle:
      "A poor lead is not just useless - it's a hidden cost in terms of time, resources, and missed opportunities.",
    features: [
      {
        id: "af-5",
        title: "Qualified Leads",
        subtitle:
          "We believe every business deserves to connect with their services...",
      },
      {
        id: "af-6",
        title: "Verified Data",
        subtitle:
          "We believe every business deserves to connect with their services...",
      },
      {
        id: "af-7",
        title: "Verified Data",
        subtitle:
          "We believe every business deserves to connect with their services...",
      },
    ],
  },
];

// ── INITIAL DATA FOR "How it Works" TAB ──
const INITIAL_HOW_SECTIONS: GeneralSection[] = [
  {
    id: "how-1",
    sectionNumber: 1,
    title: "How it works",
    subtitle:
      "A simple and transparent process for acquiring qualified customers.",
  },
  {
    id: "how-2",
    sectionNumber: 2,
    title: "Acquire new customers",
    subtitle: "Enter subtitle",
    features: [
      {
        id: "hf-1",
        title: "Browse requests",
        subtitle: "Explore customer requests filtered...",
      },
      {
        id: "hf-2",
        title: "Pay only for what...",
        subtitle: "Each lead has a transparent",
      },
      {
        id: "hf-3",
        title: "No wasted credits",
        subtitle: "If a lead turns out to be",
      },
      {
        id: "hf-4",
        title: "Free preview",
        subtitle: "If a lead turns out to be",
      },
      {
        id: "hf-5",
        title: "Pay only for what...",
        subtitle: "If a lead turns out to be",
      },
    ],
  },
  {
    id: "how-3",
    sectionNumber: 3,
    title: "Publish customer requests",
    subtitle: "Enter subtitle",
    features: [
      {
        id: "hf-6",
        title: "Free preview",
        subtitle: "Explore customer requests filtered...",
      },
      {
        id: "hf-7",
        title: "Pay only for what...",
        subtitle: "Each lead has a transparent",
      },
      {
        id: "hf-8",
        title: "No wasted credits",
        subtitle: "If a lead turns out to be",
      },
      {
        id: "hf-9",
        title: "Free preview",
        subtitle: "If a lead turns out to be",
      },
      {
        id: "hf-10",
        title: "Pay only for what...",
        subtitle: "If a lead turns out to be",
      },
    ],
  },
  {
    id: "how-4",
    sectionNumber: 4,
    title: "The credit system",
    subtitle:
      "Pay only for the leads you choose to unlock. No subscription, no risk.",
    features: [
      {
        id: "hf-11",
        title: "Free preview",
        subtitle: "Browse all leads at no cost. Evaluate freely before...",
      },
      {
        id: "hf-12",
        title: "Pay only for what...",
        subtitle: "Each lead has a transparent credit cost. You only...",
      },
      {
        id: "hf-13",
        title: "No wasted credits",
        subtitle: "If a lead turns out to be unreachable, we refund...",
      },
    ],
  },
];

// ── INITIAL DATA FOR "Contact" TAB ──
const INITIAL_CONTACT_SECTION: GeneralSection = {
  id: "contact-1",
  sectionNumber: 1,
  title: "Contact",
  subtitle: "We're here to help. Write to us or call us.",
};

const INITIAL_CONTACT_INFO = {
  email: "info@controofferta.it",
  phone: "+39 02 1234 5678",
  address: "Via Milano 42, 20121 Milano (MI)",
  hours: "Mon–Fri 9:00–18:00",
};

export default function PlatformGeneralInfoPage() {
  const [activeTab, setActiveTab] = useState<GeneralTab>("About Us");

  // State for sections per tab
  const [aboutSections, setAboutSections] = useState<GeneralSection[]>(
    INITIAL_ABOUT_SECTIONS
  );
  const [howSections, setHowSections] = useState<GeneralSection[]>(
    INITIAL_HOW_SECTIONS
  );
  const [contactSection, setContactSection] = useState<GeneralSection>(
    INITIAL_CONTACT_SECTION
  );
  const [contactInfo, setContactInfo] = useState(INITIAL_CONTACT_INFO);

  const updateCurrentSections = (
    updater: (prev: GeneralSection[]) => GeneralSection[]
  ) => {
    if (activeTab === "About Us") {
      setAboutSections(updater);
    } else if (activeTab === "How it Works") {
      setHowSections(updater);
    }
  };

  // Add a new section
  const handleAddSection = () => {
    updateCurrentSections((prev) => {
      const nextNumber = prev.length + 1;
      const newSection: GeneralSection = {
        id: `sec-${Date.now()}`,
        sectionNumber: nextNumber,
        title: `Section ${nextNumber}`,
        subtitle: "Enter section description or subtitle...",
        features: [],
      };
      return [...prev, newSection];
    });
    toast.success("New section added");
  };

  // Delete a section
  const handleDeleteSection = (id: string) => {
    updateCurrentSections((prev) => prev.filter((s) => s.id !== id));
    toast.success("Section removed");
  };

  // Update Section Title & Subtitle
  const handleUpdateTitle = (id: string, value: string) => {
    if (activeTab === "Contact") {
      setContactSection((prev) => ({ ...prev, title: value }));
      return;
    }
    updateCurrentSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: value } : s))
    );
  };

  const handleUpdateSubtitle = (id: string, value: string) => {
    if (activeTab === "Contact") {
      setContactSection((prev) => ({ ...prev, subtitle: value }));
      return;
    }
    updateCurrentSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, subtitle: value } : s))
    );
  };

  // Add Feature to a section
  const handleAddFeature = (sectionId: string) => {
    updateCurrentSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId) {
          const currentFeatures = s.features || [];
          const newFeature: FeatureItem = {
            id: `feat-${Date.now()}`,
            title: "New Feature",
            subtitle: "Enter feature details...",
          };
          return { ...s, features: [...currentFeatures, newFeature] };
        }
        return s;
      })
    );
    toast.success("Feature added");
  };

  // Remove Feature from a section
  const handleRemoveFeature = (sectionId: string, featureId: string) => {
    updateCurrentSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            features: (s.features || []).filter((f) => f.id !== featureId),
          };
        }
        return s;
      })
    );
    toast.success("Feature removed");
  };

  // Update a Feature inside a section
  const handleUpdateFeature = (
    sectionId: string,
    featureId: string,
    field: "title" | "subtitle",
    val: string
  ) => {
    updateCurrentSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            features: (s.features || []).map((f) =>
              f.id === featureId ? { ...f, [field]: val } : f
            ),
          };
        }
        return s;
      })
    );
  };

  // Save Section
  const handleSaveSection = (title: string) => {
    toast.success(`"${title}" saved successfully`);
  };

  // Save Contact Page
  const handleSaveContact = () => {
    toast.success("Contact information saved successfully");
  };

  // Render a standard section card
  const renderSectionCard = (sec: GeneralSection, isFullWidth = false) => {
    return (
      <div
        key={sec.id}
        className={`bg-[#F4F6F9] border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xs ${
          isFullWidth ? "w-full" : ""
        }`}
      >
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">
            Section {sec.sectionNumber}
          </span>
          <button
            type="button"
            onClick={() => handleDeleteSection(sec.id)}
            className="text-rose-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
            title="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
            Title
          </label>
          <input
            type="text"
            value={sec.title}
            onChange={(e) => handleUpdateTitle(sec.id, e.target.value)}
            className="w-full bg-[#EAEFF5]/80 border border-slate-200/90 rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
            Subtitle
          </label>
          <textarea
            value={sec.subtitle}
            onChange={(e) => handleUpdateSubtitle(sec.id, e.target.value)}
            rows={2}
            className="w-full bg-[#EAEFF5]/80 border border-slate-200/90 rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Features List */}
        {sec.features && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
              {sec.features.map((feat) => (
                <div
                  key={feat.id}
                  className="relative bg-[#E2E8F0]/50 border border-slate-300/60 rounded-xl p-3 space-y-2 group"
                >
                  {/* Red Circle Close Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(sec.id, feat.id)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer shadow-xs transition-colors"
                    title="Remove feature"
                  >
                    <X className="w-2.5 h-2.5 stroke-[3]" />
                  </button>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Title
                    </span>
                    <input
                      type="text"
                      value={feat.title}
                      onChange={(e) =>
                        handleUpdateFeature(
                          sec.id,
                          feat.id,
                          "title",
                          e.target.value
                        )
                      }
                      className="w-full bg-[#F8FAFC] border border-slate-300/70 rounded-lg px-2 py-1 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#00BC7D]"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Subtitle
                    </span>
                    <textarea
                      value={feat.subtitle}
                      onChange={(e) =>
                        handleUpdateFeature(
                          sec.id,
                          feat.id,
                          "subtitle",
                          e.target.value
                        )
                      }
                      rows={2}
                      className="w-full bg-[#F8FAFC] border border-slate-300/70 rounded-lg px-2 py-1 text-[11px] text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00BC7D] resize-none leading-tight"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* + Add Feature Button */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => handleAddFeature(sec.id)}
                className="px-4 py-1.5 rounded-full border border-[#00BC7D] text-[#00BC7D] hover:bg-emerald-50 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Feature</span>
              </button>
            </div>
          </div>
        )}

        {/* Section Bottom Save Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => handleSaveSection(sec.title)}
            className="w-full py-3.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer text-center"
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 pb-12 select-none font-sans">
      {/* ── Page Header Title ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          Platform General Information
        </h1>
      </div>

      {/* ── Tabs & + Add Section Button ── */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-px">
        <div className="flex items-center gap-8">
          {(["About Us", "How it Works", "Contact"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-semibold transition-all cursor-pointer border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#00BC7D] text-[#00BC7D]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* + Add Section Button (For About Us and How it Works) */}
        {activeTab !== "Contact" && (
          <button
            type="button"
            onClick={handleAddSection}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Section</span>
          </button>
        )}
      </div>

      {/* ── TAB 1: About Us ── */}
      {activeTab === "About Us" && (
        <div className="space-y-6">
          {/* Section 1 (Full width) */}
          {aboutSections[0] && renderSectionCard(aboutSections[0], true)}

          {/* Section 2 & 3 in a 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {aboutSections[1] && renderSectionCard(aboutSections[1])}
            {aboutSections[2] && renderSectionCard(aboutSections[2])}
          </div>

          {/* Any extra sections added dynamically */}
          {aboutSections.slice(3).map((sec) => renderSectionCard(sec, true))}
        </div>
      )}

      {/* ── TAB 2: How it Works ── */}
      {activeTab === "How it Works" && (
        <div className="space-y-6">
          {/* Section 1 (Full width) */}
          {howSections[0] && renderSectionCard(howSections[0], true)}

          {/* Section 2 & 3 in 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {howSections[1] && renderSectionCard(howSections[1])}
            {howSections[2] && renderSectionCard(howSections[2])}
          </div>

          {/* Section 4 (The credit system - Full width) */}
          {howSections[3] && renderSectionCard(howSections[3], true)}

          {/* Any extra sections added dynamically */}
          {howSections.slice(4).map((sec) => renderSectionCard(sec, true))}
        </div>
      )}

      {/* ── TAB 3: Contact ── */}
      {activeTab === "Contact" && (
        <div className="space-y-6">
          {/* Section 1 Card */}
          <div className="bg-[#F4F6F9] border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Section {contactSection.sectionNumber}
              </span>
              <button
                type="button"
                className="text-rose-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                title="Delete section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                Title
              </label>
              <input
                type="text"
                value={contactSection.title}
                onChange={(e) => handleUpdateTitle(contactSection.id, e.target.value)}
                className="w-full bg-[#EAEFF5]/80 border border-slate-200/90 rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                Subtitle
              </label>
              <textarea
                value={contactSection.subtitle}
                onChange={(e) =>
                  handleUpdateSubtitle(contactSection.id, e.target.value)
                }
                rows={2}
                className="w-full bg-[#EAEFF5]/80 border border-slate-200/90 rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-[#F4F6F9] border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xs">
            <div className="pb-3 border-b border-slate-200/70">
              <h3 className="text-xs font-semibold text-slate-700">
                Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full bg-[#EAEFF5]/80 border border-slate-200/90 rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Phone
                </label>
                <input
                  type="text"
                  value={contactInfo.phone}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full bg-[#EAEFF5]/80 border border-slate-200/90 rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Address
                </label>
                <input
                  type="text"
                  value={contactInfo.address}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="w-full bg-[#EAEFF5]/80 border border-slate-200/90 rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Hours
                </label>
                <input
                  type="text"
                  value={contactInfo.hours}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, hours: e.target.value }))
                  }
                  className="w-full bg-[#EAEFF5]/80 border border-slate-200/90 rounded-2xl px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Contact Bottom Save Button */}
          <button
            type="button"
            onClick={handleSaveContact}
            className="w-full py-3.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer text-center"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
