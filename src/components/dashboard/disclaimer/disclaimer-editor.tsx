"use client";

import TipTapEditor from "@/components/dashboard/disclaimer/rich-text-editor";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import GeneralInformation from "@/components/dashboard/disclaimer/general-information";
import { apiKeys } from "@/lib/api/keys";
import { nextFetch } from "@/lib/api/fetcher";

interface Disclaimer {
  type: string;
  content: string;
}

export default function DisclaimerTypePage() {
  const params = useParams();
  const type = (params?.type as string) || "privacy_policy";
  const disclaimerType =
    type === "privacy"
      ? "privacy_policy"
      : type === "terms"
        ? "terms_of_service"
        : type;

  // Determine Title based on URL slug
  const title = useMemo(() => {
    if (type === "privacy_policy" || type === "privacy") {
      return "Privacy Policy";
    }
    if (type === "terms_of_service" || type === "terms") {
      return "Terms & Condition";
    }
    if (type === "general") {
      return "Platform Settings";
    }
    // Format other slugs nicely (e.g. "cancellation_policy" -> "Cancellation Policy")
    return type
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [type]);

  const [content, setContent] = useState("");
  const [resetTrigger, setResetTrigger] = useState(false);
  const disclaimerKey =
    type === "general" ? null : apiKeys.disclaimer(disclaimerType);
  const { data: disclaimer, error, isLoading } = useSWR<Disclaimer>(
    disclaimerKey,
  );
  const { trigger: updateDisclaimer, isMutating: isSaving } = useSWRMutation(
    apiKeys.disclaimers,
    (url: string, { arg }: { arg: Disclaimer }) =>
      nextFetch<Disclaimer>({ url, method: "POST", payload: arg }),
    { revalidate: true },
  );

  useEffect(() => {
    setContent(disclaimer?.content ?? "");
    setResetTrigger((previous) => !previous);
  }, [disclaimer?.content, disclaimerType]);

  // If general information, render the dedicated structured Platform General Info view
  if (type === "general") {
    return <GeneralInformation />;
  }

  const handleUpdate = () => {
    void (async () => {
      try {
        await updateDisclaimer(
          { type: disclaimerType, content: content.trim() },
          { throwOnError: true },
        );
        toast.success(`${title} updated successfully`);
      } catch (updateError) {
        toast.error(
          updateError instanceof Error
            ? updateError.message
            : `Unable to update ${title}`,
        );
      }
    })();
  };

  const handleCancel = () => {
    setContent(disclaimer?.content ?? "");
    setResetTrigger((prev) => !prev);
    toast("Changes discarded", { icon: "ℹ️" });
  };

  const isNotFound = error && error.status === 404;

  return (
    <div className="w-full flex-1 flex flex-col space-y-6 pb-8 select-none font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-1">
            Manage legal disclosures, policies, and terms for your platform
          </p>
        </div>

      </div>

      {/* ── Full Width & Height White Card Text Editor Box ── */}
      <div className="w-full flex-1 flex flex-col bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/70 shadow-2xs min-h-[580px]">
        <div className="flex-1 flex flex-col w-full h-full min-h-0">
          {isLoading ? (
            <div className="flex min-h-[460px] flex-1 items-center justify-center text-sm text-slate-400">
              Loading {title}...
            </div>
          ) : error && !isNotFound ? (
            <div className="flex min-h-[460px] flex-1 items-center justify-center text-sm text-rose-500">
              Unable to load {title}. Please try again.
            </div>
          ) : (
            <TipTapEditor
              content={content}
              onChange={setContent}
              resetTrigger={resetTrigger}
              className="flex-1 flex flex-col w-full h-full"
              minHeight="460px"
              maxHeight="none"
            />
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-8 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={isSaving || isLoading || Boolean(error && !isNotFound)}
            className="px-8 py-2.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : `Update ${title}`}
          </button>
        </div>
      </div>
    </div>
  );
}
