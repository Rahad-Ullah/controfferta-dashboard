"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Package, ReceiptText } from "lucide-react";

export interface TransactionItem {
  id: string;
  txnId: string;
  date: string;
  dateTime: string;
  detailGroups: Array<{
    title: string;
    fields: Array<{ label: string; value: string }>;
  }>;
  buyerCompany: string;
  providerName: string;
  providerEmail: string;
  providerPhone: string;
  package: string;
  amount: number;
  status: "Pending" | "Completed" | "Failed" | "Cancelled";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const isStatus = label === "Status";
  const normalizedStatus = value.toLowerCase();
  const isSuccessful = normalizedStatus === "paid" || normalizedStatus === "completed";

  return (
    <div className="grid min-w-0 gap-1 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</dt>
      <dd className="min-w-0 wrap-break-word text-left text-sm font-semibold text-slate-700">
        {isStatus ? (
          <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${isSuccessful ? "bg-[#E6F8F2] text-[#00BC7D]" : normalizedStatus === "pending" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}>
            {value}
          </span>
        ) : value}
      </dd>
    </div>
  );
}

type TransactionViewDialogProps = {
  transaction: TransactionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function TransactionViewDialog({ transaction, open, onOpenChange }: TransactionViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl! sm:max-w-2xl! max-h-[90vh] gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 text-slate-900">
        <DialogHeader className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 pr-14 text-left">
          <DialogTitle className="flex items-center gap-2 text-xl text-[#0F172A]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F8F2] text-[#00BC7D]">
              <ReceiptText className="h-5 w-5" />
            </span>
            Transaction Details
          </DialogTitle>
          <DialogDescription className="mt-1">Review the purchase and payment information.</DialogDescription>
        </DialogHeader>
        {transaction && (
          <div className="max-h-[calc(90vh-120px)] overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {(transaction.detailGroups ?? []).map((group) => (
                <section key={group.title} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-2xs">
                  <div className="mb-1 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E6F8F2] text-[#00BC7D]">
                      {group.title === "Provider / Company" ? <Building2 className="h-4 w-4" /> : group.title === "Package" ? <Package className="h-4 w-4" /> : <ReceiptText className="h-4 w-4" />}
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{group.title}</h3>
                  </div>
                  <dl className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                    {group.fields.map((field) => (
                      <DetailRow key={`${group.title}-${field.label}`} label={field.label} value={field.value} />
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
