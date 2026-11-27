"use client";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  HelpCircle,
  Plus,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { apiKeys } from "@/lib/api/keys";
import { nextFetch } from "@/lib/api/fetcher";

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
}

export default function FaqPage() {
  // Modal states
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [viewingFaq, setViewingFaq] = useState<FaqItem | null>(null);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FaqItem | null>(null);

  // Form states
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");

  // Validation errors
  const [formErrors, setFormErrors] = useState<{
    question?: string;
    answer?: string;
  }>({});

  const { data: faqs = [], isLoading, error } = useSWR<FaqItem[]>(apiKeys.faqs);
  const { trigger: createFaq, isMutating: isCreating } = useSWRMutation(
    apiKeys.faqCreate,
    (url: string, { arg }: { arg: Pick<FaqItem, "question" | "answer"> }) =>
      nextFetch<FaqItem>({ url, method: "POST", payload: arg }),
    { revalidate: true },
  );
  const { trigger: updateFaq, isMutating: isUpdating } = useSWRMutation(
    editingFaq ? apiKeys.faq(editingFaq._id) : null,
    (url: string, { arg }: { arg: Pick<FaqItem, "question" | "answer"> }) =>
      nextFetch<FaqItem>({ url, method: "PATCH", payload: arg }),
    { revalidate: true },
  );
  const { trigger: deleteFaq, isMutating: isDeleting } = useSWRMutation(
    faqToDelete ? apiKeys.faq(faqToDelete._id) : null,
    (url: string) => nextFetch<null>({ url, method: "DELETE" }),
    { revalidate: true },
  );
  const isSaving = isCreating || isUpdating;

  // Open Add FAQ Modal
  const handleOpenAdd = () => {
    setEditingFaq(null);
    setFormQuestion("");
    setFormAnswer("");
    setFormErrors({});
    setIsFaqModalOpen(true);
  };

  // Open Edit FAQ Modal
  const handleOpenEdit = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormErrors({});
    setIsFaqModalOpen(true);
  };

  // Confirm Delete FAQ
  const handleConfirmDelete = () => {
    if (!faqToDelete) return;
    void (async () => {
      try {
        await deleteFaq(undefined, { throwOnError: true });
        toast.success("FAQ deleted successfully");
        setFaqToDelete(null);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to delete FAQ",
        );
      }
    })();
  };

  // Handle Form Submit with Inline Validation
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: {
      question?: string;
      answer?: string;
    } = {};

    if (!formQuestion.trim()) {
      errors.question = "Question is required";
    }

    if (!formAnswer.trim()) {
      errors.answer = "Answer is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill in all required fields");
      return;
    }

    void (async () => {
      try {
        const payload = {
          question: formQuestion.trim(),
          answer: formAnswer.trim(),
        };

        if (editingFaq) {
          await updateFaq(payload, { throwOnError: true });
          toast.success("FAQ updated successfully");
        } else {
          await createFaq(payload, { throwOnError: true });
          toast.success("FAQ created successfully");
        }

        setFormErrors({});
        setIsFaqModalOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to save FAQ",
        );
      }
    })();
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
      <div className="space-y-6 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-2xs sm:p-6">
        {/* ── FAQ Table Container ── */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="w-[8%] py-3.5 px-3">#</th>
                <th className="w-[55%] py-3.5 px-3">QUESTION</th>
                <th className="w-[20%] py-3.5 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    Loading FAQs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-12 text-center text-rose-500 text-sm"
                  >
                    Unable to load FAQs. Please try again.
                  </td>
                </tr>
              ) : faqs.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-12 text-center text-slate-400 text-sm"
                  >
                    <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No FAQs available yet.
                  </td>
                </tr>
              ) : (
                faqs.map((faq, idx) => (
                  <tr
                    key={faq._id}
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

                    {/* Actions (Edit / Delete) */}
                    <td className="py-4 px-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingFaq(faq)}
                          className="p-1.5 text-slate-400 hover:text-[#00BC7D] transition-colors cursor-pointer rounded-lg hover:bg-[#E6F8F2]"
                          title="View FAQ answer"
                          aria-label="View FAQ answer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
            Showing 1-{Math.min(faqs.length, 10)} of {faqs.length} FAQs
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

      {/* ── View FAQ Modal ── */}
      {viewingFaq && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#00BC7D]">
                  FAQ answer
                </p>
                <h2 className="mt-1 text-lg font-bold leading-snug text-[#0F172A]">
                  {viewingFaq.question}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingFaq(null)}
                className="w-8 h-8 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
                aria-label="Close FAQ answer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-sm leading-7 text-slate-600">
                {viewingFaq.answer}
              </p>
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingFaq(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
              <form
                onSubmit={handleFormSubmit}
                className="space-y-4"
                noValidate
              >
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
                        setFormErrors((prev) => ({
                          ...prev,
                          question: undefined,
                        }));
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
                        setFormErrors((prev) => ({
                          ...prev,
                          answer: undefined,
                        }));
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
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#00BC7D] hover:bg-[#00a86b] text-white shadow-xs transition-colors cursor-pointer"
              >
                {isSaving
                  ? "Saving..."
                  : editingFaq
                    ? "Save Changes"
                    : "Create FAQ"}
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
                  <h3 className="text-base font-bold text-[#0F172A]">
                    Delete FAQ
                  </h3>
                  <p className="text-xs text-slate-400">
                    Confirm question deletion
                  </p>
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
                This action cannot be undone. The question and answer will be
                permanently removed.
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
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-xs"
              >
                {isDeleting ? "Deleting..." : "Delete FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
