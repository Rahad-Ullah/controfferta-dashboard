"use client";

import TipTapEditor from "@/components/dashboard/disclaimer/rich-text-editor";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import GeneralInformation from "@/components/dashboard/disclaimer/general-information";

const DEFAULT_CONTENT = `<p>Lorem ipsum dolor sit amet consectetur. Fringilla a cras vitae orci. Egestas duis id nisl sed ante congue scelerisque. Eleifend facilisis aliquet tempus morbi leo sagittis. Pellentesque odio amet turpis habitant. Imperdiet tincidunt nisl consectetur hendrerit accumsan vehicula imperdiet mattis. Neque a vitae diam pharetra duis habitasse convallis luctus pulvinar. Pharetra nunc morbi elementum nisl magnis convallis arcu enim tortor. Cursus a sed tortor enim mi imperdiet massa donec mauris. Sem morbi morbi posuere faucibus. Cras risus ultrices duis pharetra sit porttitor elementum sagittis elementum. Ut vitae blandit pulvinar fermentum in id sed. At pellentesque non semper eget egestas vulputate id volutpat quis. Dolor etiam sodales at elementum mattis nibh quam placerat ut. Suspendisse est adipiscing proin et. Leo nisi bibendum donec ac non eget euismod suscipit. At ultricies nullam ipsum tellus. Non dictum orci at tortor convallis tortor suspendisse. Ac duis senectus arcu nullam in suspendisse vitae. Tellus interdum enim lorem vel morbi lectus.</p><p><br></p><p>Lorem ipsum dolor sit amet consectetur. Fringilla a cras vitae orci. Egestas duis id nisl sed ante congue scelerisque. Eleifend facilisis aliquet tempus morbi leo sagittis. Pellentesque odio amet turpis habitant. Imperdiet tincidunt nisl consectetur hendrerit accumsan vehicula imperdiet mattis. Neque a vitae diam pharetra duis habitasse convallis luctus pulvinar. Pharetra nunc morbi elementum nisl magnis convallis arcu enim tortor. Cursus a sed tortor enim mi imperdiet massa donec mauris. Sem morbi morbi posuere faucibus. Cras risus ultrices duis pharetra sit porttitor elementum sagittis elementum. Ut vitae blandit pulvinar fermentum in id sed. At pellentesque non semper eget egestas vulputate id volutpat quis. Dolor etiam sodales at elementum mattis nibh quam placerat ut. Suspendisse est adipiscing proin et. Leo nisi bibendum donec ac non eget euismod suscipit. At ultricies nullam ipsum tellus. Non dictum orci at tortor convallis tortor suspendisse. Ac duis senectus arcu nullam in suspendisse vitae. Tellus interdum enim lorem vel morbi lectus.</p>`;

export default function DisclaimerTypePage() {
  const params = useParams();
  const type = (params?.type as string) || "privacy_policy";

  // Determine Title based on URL slug
  const title = useMemo(() => {
    if (type === "privacy_policy" || type === "privacy") {
      return "Privacy Policy";
    }
    if (type === "terms_of_service" || type === "terms") {
      return "Terms & Condition";
    }
    if (type === "general") {
      return "General Information";
    }
    // Format other slugs nicely (e.g. "cancellation_policy" -> "Cancellation Policy")
    return type
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [type]);

  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [resetTrigger, setResetTrigger] = useState(false);

  // If general information, render the dedicated structured Platform General Info view
  if (type === "general") {
    return <GeneralInformation />;
  }

  const handleUpdate = () => {
    toast.success(`${title} updated successfully`);
  };

  const handleCancel = () => {
    setContent(DEFAULT_CONTENT);
    setResetTrigger((prev) => !prev);
    toast("Changes discarded", { icon: "ℹ️" });
  };

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

        {/* Quick Header Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className="px-6 py-2 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            Update
          </button>
        </div>
      </div>

      {/* ── Full Width & Height White Card Text Editor Box ── */}
      <div className="w-full flex-1 flex flex-col bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/70 shadow-2xs min-h-[580px]">
        <div className="flex-1 flex flex-col w-full h-full min-h-0">
          <TipTapEditor
            content={content}
            onChange={setContent}
            resetTrigger={resetTrigger}
            className="flex-1 flex flex-col w-full h-full"
            minHeight="460px"
            maxHeight="none"
          />
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
            className="px-8 py-2.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
          >
            Update {title}
          </button>
        </div>
      </div>
    </div>
  );
}
