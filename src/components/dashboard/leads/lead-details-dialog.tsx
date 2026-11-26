"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Lead, LeadStatus } from "@/types/lead.interface";

type LeadDetailsDialogProps = {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const statusLabels: Record<LeadStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  closed: "Closed",
};

const formatDate = (value: string) => new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric",
}).format(new Date(value));

function Detail({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-3 shadow-xs ${className}`}><span className="mb-1 block text-xs text-slate-400">{label}</span><span className="font-semibold text-slate-700">{children}</span></div>;
}

export default function LeadDetailsDialog({ lead, open, onOpenChange }: LeadDetailsDialogProps) {
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-slate-200 bg-white p-5 pr-14 text-left">
          <DialogTitle className="text-xl text-[#0F172A]">Lead Details</DialogTitle>
          <DialogDescription className="mt-1">Complete information for this lead.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-slate-50/60 p-5 text-sm sm:p-6">
          <section className="rounded-xl border border-[#00BC7D]/20 border-l-4 bg-[#E6F8F2]/60 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#00705d]">Lead</p>
            <p className="mt-1 text-xs font-semibold text-slate-400">#{lead.uid}</p>
            <h3 className="mt-1 break-words text-base font-bold text-[#0F172A]">{lead.title}</h3>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</p><p className="mt-2 whitespace-pre-wrap leading-6 text-slate-700">{lead.description}</p></section>
          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <Detail label="Category">{lead.category?.name ?? "—"}</Detail>
            <Detail label="Credit cost"><span className="text-[#9333EA]">{lead.category?.creditCost ?? 0} credits</span></Detail>
            <Detail label="Project address" className="sm:col-span-2"><span className="break-words">{lead.address}</span></Detail>
            <Detail label="Timeline">{lead.timeline}</Detail>
            <Detail label="Budget range">{lead.budgetRange.minimum} – {lead.budgetRange.maximum}</Detail>
            <Detail label="Status">{statusLabels[lead.status]}</Detail>
            <Detail label="Published">{formatDate(lead.createdAt)}</Detail>
          </div>
          <section>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Client details</p>
            <div className="mt-2 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <Detail label="Name">{lead.client?.name ?? "—"}</Detail>
              <Detail label="Email"><span className="break-all">{lead.client?.email ?? "—"}</span></Detail>
              <Detail label="Phone">{lead.client?.phone ? `${lead.client.phone.countryCode} ${lead.client.phone.number}` : "—"}</Detail>
              <Detail label="Client address"><span className="break-words">{lead.client?.address ?? "—"}</span></Detail>
            </div>
          </section>
          <p className="text-xs text-slate-400">Updated: {formatDate(lead.updatedAt)}</p>
        </div>
        <DialogFooter className="shrink-0 border-t border-slate-200 bg-white p-4"><Button type="button" onClick={() => onOpenChange(false)} className="rounded-xl px-5">Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
