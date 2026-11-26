"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Lead } from "@/types/lead.interface";

type LeadConfirmDialogProps = {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isMutating: boolean;
};

export function LeadDeleteDialog({ lead, open, onOpenChange, onConfirm, isMutating }: LeadConfirmDialogProps) {
  return <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-rose-500" />Delete Lead</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete #{lead?.uid}? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel><AlertDialogAction disabled={isMutating} onClick={onConfirm} className="bg-rose-500 hover:bg-rose-600">{isMutating ? "Deleting..." : "Delete Lead"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}

export function LeadRejectDialog({ lead, open, onOpenChange, onConfirm, isMutating }: LeadConfirmDialogProps) {
  return <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-rose-500" />Reject Lead</AlertDialogTitle><AlertDialogDescription>Are you sure you want to reject #{lead?.uid}? This lead will be marked as rejected.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel><AlertDialogAction disabled={isMutating} onClick={onConfirm} className="bg-rose-500 hover:bg-rose-600">{isMutating ? "Rejecting..." : "Reject Lead"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
