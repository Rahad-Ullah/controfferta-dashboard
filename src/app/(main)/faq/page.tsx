"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Plus,
  Search,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_CATEGORIES = [
  "All Categories",
  "Credits & Pricing",
  "Leads",
  "Support & Refunds",
  "Account & Settings",
];

const INITIAL_FAQS: FaqItem[] = [
  {
    id: "1",
    question: "How do credits work when unlocking a lead?",
    answer:
      "Each lead requires a specific credit cost based on the estimated project value and category. Once unlocked, all client contact details and project specifications are immediately accessible.",
    category: "Credits & Pricing",
  },
  {
    id: "2",
    question: "How are incoming leads verified and qualified?",
    answer:
      "Every lead goes through automated phone number verification and multi-step qualification questions to ensure genuine homeowner interest before appearing in the marketplace.",
    category: "Leads",
  },
  {
    id: "3",
    question: "Can I request a credit refund for invalid contact numbers?",
    answer:
      "Yes. If a contact phone number is permanently unreachable or invalid, you can report the lead within 48 hours directly from your dashboard to receive a full credit reimbursement.",
    category: "Support & Refunds",
  },
  {
    id: "4",
    question: "Do purchased credits have an expiration date?",
    answer:
      "No, credits purchased through any package remain valid indefinitely as long as your contractor account is in good standing and not deactivated.",
    category: "Credits & Pricing",
  },
  {
    id: "5",
    question: "How can I set up instant alerts for new leads in my region?",
    answer:
      "You can configure instant SMS and email notifications in your profile settings. You will be alerted the second a high-matching lead in your selected trades becomes available.",
    category: "Account & Settings",
  },
  {
    id: "6",
    question: "What categories and trades are supported on the platform?",
    answer:
      "We support Windows & Doors, Solar Panels & Photovoltaics, General Construction & Renovations, Air Conditioning & HVAC, and Professional Moving services across Italy.",
    category: "Leads",
  },
];

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>(INITIAL_FAQS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Modal states
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FaqItem | null>(null);

  // Form states
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formCategory, setFormCategory] = useState("Credits & Pricing");
  const [formCategoryDropdownOpen, setFormCategoryDropdownOpen] = useState(false);

  // Validation errors
  const [formErrors, setFormErrors] = useState<{
    question?: string;
    answer?: string;
    category?: string;
  }>({});

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Categories"
          ? true
          : faq.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchQuery, selectedCategory]);

  // Open Add FAQ Modal
  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormQuestion("");
    setFormAnswer("");
    setFormCategory("Credits & Pricing");
    setFormCategoryDropdownOpen(false);
    setFormErrors({});
    setIsFaqModalOpen(true);
  };

  // Open Edit FAQ Modal
  const handleOpenEdit = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategory(faq.category);
    setFormCategoryDropdownOpen(false);
    setFormErrors({});
    setIsFaqModalOpen(true);
  };

  // Confirm Delete FAQ
  const handleConfirmDelete = () => {
    if (!faqToDelete) return;
    setFaqs((prev) => prev.filter((item) => item.id !== faqToDelete.id));
    toast.success("FAQ deleted successfully");
    setFaqToDelete(null);
  };

  // Handle Form Submit with Inline Validation
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {
      question?: string;
      answer?: string;
      category?: string;
    } = {};

    if (!formQuestion.trim()) {
      errors.question = "Question is required";
    }

    if (!formAnswer.trim()) {
      errors.answer = "Answer is required";
    }

    if (!formCategory.trim()) {
      errors.category = "Please select a category";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingFaq) {
      setFaqs((prev) =>
        prev.map((item) =>
          item.id === editingFaq.id
            ? {
                ...item,
                question: formQuestion.trim(),
                answer: formAnswer.trim(),
                category: formCategory.trim(),
              }
            : item
        )
      );
      toast.success("FAQ updated successfully");
    } else {
      const newFaq: FaqItem = {
        id: Date.now().toString(),
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        category: formCategory.trim(),
      };
      setFaqs((prev) => [newFaq, ...prev]);
      toast.success("FAQ created successfully");
    }

    setFormErrors({});
    setIsFaqModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 select-none font-sans">
      {/* ── Top Header & Add FAQ Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            {faqs.length} total questions and answers
          </p>
        </div>

        {/* Add New FAQ Button (Top Right) */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New FAQ</span>
        </button>
      </div>

      {/* ── Main White Card ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-2xs space-y-6">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Pill Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search questions or answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-full text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <span>{selectedCategory}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-lg py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                {FAQ_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#E6F8F2] text-[#00BC7D] font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── FAQ Table Container ── */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="w-[6%] py-3.5 px-3">#</th>
                <th className="w-[32%] py-3.5 px-3">QUESTION</th>
                <th className="w-[38%] py-3.5 px-3">ANSWER</th>
                <th className="w-[14%] py-3.5 px-3">CATEGORY</th>
                <th className="w-[10%] py-3.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No FAQs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredFaqs.map((faq, idx) => (
                  <tr
                    key={faq.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Index */}
                    <td className="py-4 px-3 text-xs font-semibold text-slate-400">
                      #{idx + 1}
                    </td>

                    {/* Question */}
                    <td className="py-4 px-3">
                      <div className="font-semibold text-[#0F172A] text-sm leading-snug line-clamp-2">
                        {faq.question}
                      </div>
                    </td>

                    {/* Answer */}
                    <td className="py-4 px-3">
                      <p
                        className="text-slate-500 text-xs line-clamp-2 leading-relaxed"
                        title={faq.answer}
                      >
                        {faq.answer}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E6F8F2] text-[#00BC7D]">
                        {faq.category}
                      </span>
                    </td>

                    {/* Actions (Edit / Delete) */}
                    <td className="py-4 px-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(faq)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-lg hover:bg-slate-100"
                          title="Edit FAQ"
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFaqToDelete(faq)}
                          className="p-1.5 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer / Pagination ── */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing 1-{Math.min(filteredFaqs.length, 10)} of {filteredFaqs.length} FAQs
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit FAQ Modal ── */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-bold text-[#0F172A]">
                {editingFaq ? "Edit FAQ" : "Add New FAQ"}
              </h2>
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                {/* Category Selection */}
                <div className="relative">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormCategoryDropdownOpen(!formCategoryDropdownOpen)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#0F172A] flex items-center justify-between text-left focus:outline-none transition-all cursor-pointer ${
                      formErrors.category
                        ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                        : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                    }`}
                  >
                    <span className="font-medium">{formCategory}</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {formCategoryDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                      {FAQ_CATEGORIES.filter((c) => c !== "All Categories").map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setFormCategory(cat);
                            setFormCategoryDropdownOpen(false);
                            if (formErrors.category) {
                              setFormErrors((prev) => ({ ...prev, category: undefined }));
                            }
                          }}
                          className={`w-full text-left px-4 py-2 text-xs transition-colors cursor-pointer ${
                            formCategory === cat
                              ? "bg-[#E6F8F2] text-[#00BC7D] font-semibold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                  {formErrors.category && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                      <span>•</span>
                      <span>{formErrors.category}</span>
                    </p>
                  )}
                </div>

                {/* Question */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Question <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. How do credits work when unlocking a lead?"
                    value={formQuestion}
                    onChange={(e) => {
                      setFormQuestion(e.target.value);
                      if (formErrors.question) {
                        setFormErrors((prev) => ({ ...prev, question: undefined }));
                      }
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all ${
                      formErrors.question
                        ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                        : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                    }`}
                  />
                  {formErrors.question && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                      <span>•</span>
                      <span>{formErrors.question}</span>
                    </p>
                  )}
                </div>

                {/* Answer */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Answer <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    placeholder="Provide a comprehensive and clear explanation..."
                    value={formAnswer}
                    onChange={(e) => {
                      setFormAnswer(e.target.value);
                      if (formErrors.answer) {
                        setFormErrors((prev) => ({ ...prev, answer: undefined }));
                      }
                    }}
                    rows={4}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none transition-all resize-none ${
                      formErrors.answer
                        ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-400/40"
                        : "bg-slate-50/70 border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                    }`}
                  />
                  {formErrors.answer && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                      <span>•</span>
                      <span>{formErrors.answer}</span>
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#00BC7D] hover:bg-[#00a86b] text-white shadow-xs transition-colors cursor-pointer"
              >
                {editingFaq ? "Save Changes" : "Create FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {faqToDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Delete FAQ</h3>
                  <p className="text-xs text-slate-400">Confirm question deletion</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFaqToDelete(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3 text-sm">
              <p className="text-slate-600 text-sm leading-relaxed">
                Are you sure you want to delete this FAQ:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#0F172A]">
                &ldquo;{faqToDelete.question}&rdquo;
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-800">
                This action cannot be undone. The question and answer will be permanently removed.
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setFaqToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
              >
                Delete FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
