"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useId, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

type ImportStep = 1 | 2 | 3 | 4 | 5;

interface ParsedFile {
  file: File;
  name: string;
  sizeFormatted: string;
  rowCount: number;
  headers: string[];
  records: Record<string, string>[];
}

interface TargetField {
  id: string;
  label: string;
  required: boolean;
  hint: string;
}

const TARGET_FIELDS: TargetField[] = [
  { id: "full_name", label: "Customer name", required: true, hint: "Full name of the contact" },
  { id: "phone_number", label: "Phone", required: true, hint: "Primary phone or mobile" },
  { id: "email_address", label: "Email", required: false, hint: "Contact email address" },
  { id: "city", label: "City", required: false, hint: "City or municipality" },
  { id: "service_type", label: "Service requested", required: false, hint: "Requested service or trade" },
];

interface ValidatedRow {
  name: string;
  phone: string;
  city: string;
  service: string;
  status: "ok" | "error" | "duplicate";
  errorReason?: string;
}

const CATEGORY_OPTIONS = [
  "Windows & Doors",
  "Solar Panels",
  "Construction",
  "Moving",
  "Air Conditioning",
  "Various",
];

export default function LeadImportPage() {
  const router = useRouter();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stepper state
  const [currentStep, setCurrentStep] = useState<ImportStep>(1);

  // Step 1: File state
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Step 2: Mapping state (targetFieldId -> sourceColumnName)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({
    full_name: "full_name",
    phone_number: "phone_number",
    email_address: "email_address",
    city: "city",
    service_type: "service_type",
  });
  const [mappingError, setMappingError] = useState<string | null>(null);

  // Step 4: Configuration & Preview state
  const [defaultCategory, setDefaultCategory] = useState<string>("Various");
  const [defaultCreditCost, setDefaultCreditCost] = useState<number>(15);
  const [creditCostError, setCreditCostError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format bytes to KB/MB
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 1: PARSE FILE FROM LOCAL SYSTEM
  // ─────────────────────────────────────────────────────────────
  const processLocalFile = async (file: File) => {
    setFileError(null);

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError("File size exceeds 10 MB limit. Please select a smaller file.");
      toast.error("File exceeds 10 MB limit");
      return;
    }

    // Validate extension
    const nameLower = file.name.toLowerCase();
    const isCsv = nameLower.endsWith(".csv") || file.type.includes("csv");
    const isXlsx = nameLower.endsWith(".xlsx") || nameLower.endsWith(".xls");

    if (!isCsv && !isXlsx) {
      setFileError("Please upload a valid CSV or Excel file (.csv, .xlsx, .xls).");
      toast.error("Invalid file format. CSV or Excel required.");
      return;
    }

    setIsParsing(true);

    try {
      if (isCsv) {
        // Parse CSV with standard FileReader
        const text = await file.text();
        const lines = text
          .split(/\r\n|\n|\r/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length < 2) {
          throw new Error("CSV file must contain at least a header and 1 data row.");
        }

        // Detect delimiter (comma, semicolon, or tab)
        const firstLine = lines[0];
        let delimiter = ",";
        if (firstLine.includes(";") && firstLine.split(";").length > firstLine.split(",").length) {
          delimiter = ";";
        } else if (firstLine.includes("\t") && firstLine.split("\t").length > firstLine.split(",").length) {
          delimiter = "\t";
        }

        const headers = firstLine
          .split(delimiter)
          .map((h) => h.replace(/^["']|["']$/g, "").trim());

        const records: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(delimiter)
            .map((v) => v.replace(/^["']|["']$/g, "").trim());
          const record: Record<string, string> = {};
          headers.forEach((h, idx) => {
            record[h] = values[idx] || "";
          });
          records.push(record);
        }

        applyParsedFile(file, headers, records);
      } else {
        // Parse XLSX / XLS with xlsx library
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new Error("Excel file contains no sheets.");
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: unknown[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonData || jsonData.length < 2) {
          throw new Error("Excel sheet must contain at least a header and 1 data row.");
        }

        const rawHeaders = (jsonData[0] as unknown[]) || [];
        const headers = rawHeaders.map((h, idx) => (h ? String(h).trim() : `column_${idx + 1}`));

        const records: Record<string, string>[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = (jsonData[i] as unknown[]) || [];
          if (!row || row.length === 0 || row.every((c) => c === undefined || c === null || c === "")) {
            continue;
          }
          const record: Record<string, string> = {};
          headers.forEach((h, idx) => {
            record[h] = row[idx] !== undefined && row[idx] !== null ? String(row[idx]).trim() : "";
          });
          records.push(record);
        }

        applyParsedFile(file, headers, records);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse file.";
      setFileError(msg);
      toast.error(msg);
    } finally {
      setIsParsing(false);
    }
  };

  // Helper to set parsed file & auto-map fields
  const applyParsedFile = (
    file: File,
    headers: string[],
    records: Record<string, string>[]
  ) => {
    if (records.length === 0) {
      setFileError("The uploaded file does not contain any data rows.");
      toast.error("No data rows found in file");
      return;
    }

    const parsed: ParsedFile = {
      file,
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      rowCount: records.length,
      headers,
      records,
    };

    setParsedFile(parsed);
    setFileError(null);

    // Auto-detect mappings based on header names
    const newMapping: Record<string, string> = {};
    TARGET_FIELDS.forEach((target) => {
      const matched = headers.find((h) => {
        const lowerH = h.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (target.id === "full_name") {
          return lowerH.includes("name") || lowerH.includes("nome") || lowerH.includes("customer");
        }
        if (target.id === "phone_number") {
          return lowerH.includes("phone") || lowerH.includes("tel") || lowerH.includes("mobile") || lowerH.includes("cell");
        }
        if (target.id === "email_address") {
          return lowerH.includes("email") || lowerH.includes("mail");
        }
        if (target.id === "city") {
          return lowerH.includes("city") || lowerH.includes("citta") || lowerH.includes("town");
        }
        if (target.id === "service_type") {
          return lowerH.includes("service") || lowerH.includes("servizio") || lowerH.includes("category") || lowerH.includes("type");
        }
        return false;
      });

      newMapping[target.id] = matched || headers[0] || "";
    });

    setFieldMapping(newMapping);
    toast.success(`${file.name} uploaded successfully (${records.length} rows)`);
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processLocalFile(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processLocalFile(files[0]);
    }
  };

  // Reset file selection
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setParsedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 2: FIELD MAPPING VALIDATION
  // ─────────────────────────────────────────────────────────────
  const validateAndProceedToStep3 = () => {
    setMappingError(null);

    // Validate that required fields are mapped
    const missingRequired = TARGET_FIELDS.filter(
      (f) => f.required && (!fieldMapping[f.id] || fieldMapping[f.id] === "__none__")
    );

    if (missingRequired.length > 0) {
      const names = missingRequired.map((f) => f.label).join(" and ");
      setMappingError(`Please map the required field(s): ${names}.`);
      toast.error(`Required: ${names}`);
      return;
    }

    setCurrentStep(3);
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 3: DYNAMIC ROW VALIDATION
  // ─────────────────────────────────────────────────────────────
  const validationResults = useMemo(() => {
    if (!parsedFile || parsedFile.records.length === 0) {
      return {
        rows: [] as ValidatedRow[],
        validCount: 0,
        errorCount: 0,
        duplicateCount: 0,
      };
    }

    const nameCol = fieldMapping.full_name;
    const phoneCol = fieldMapping.phone_number;
    const emailCol = fieldMapping.email_address;
    const cityCol = fieldMapping.city;
    const serviceCol = fieldMapping.service_type;

    const seenPhones = new Set<string>();
    const seenEmails = new Set<string>();

    const rows: ValidatedRow[] = [];
    let validCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;

    parsedFile.records.forEach((r, idx) => {
      const name = (r[nameCol] || "").trim();
      const phone = (r[phoneCol] || "").trim();
      const email = emailCol ? (r[emailCol] || "").trim() : "";
      const city = cityCol ? (r[cityCol] || "").trim() || "N/A" : "N/A";
      const service = serviceCol ? (r[serviceCol] || "").trim() || "General" : "General";

      let status: "ok" | "error" | "duplicate" = "ok";
      let errorReason: string | undefined;

      // Validate name
      if (!name) {
        status = "error";
        errorReason = "Missing customer name";
      }

      // Validate phone: must contain digits, at least 6 digits
      const phoneDigits = phone.replace(/\D/g, "");
      if (status === "ok") {
        if (!phone || phoneDigits.length < 6 || phone.toLowerCase().includes("invalid")) {
          status = "error";
          errorReason = "Invalid phone number format";
        }
      }

      // Check duplicates
      if (status === "ok") {
        if (phoneDigits && seenPhones.has(phoneDigits)) {
          status = "duplicate";
          errorReason = "Duplicate phone number in file";
        } else if (email && seenEmails.has(email.toLowerCase())) {
          status = "duplicate";
          errorReason = "Duplicate email address in file";
        }
      }

      if (status === "ok") {
        validCount++;
        if (phoneDigits) seenPhones.add(phoneDigits);
        if (email) seenEmails.add(email.toLowerCase());
      } else if (status === "duplicate") {
        duplicateCount++;
      } else {
        errorCount++;
      }

      // Collect sample for validation view (max 20 rows preview)
      if (idx < 20) {
        rows.push({
          name: name || "(Empty Name)",
          phone: phone || "No Phone",
          city,
          service,
          status,
          errorReason,
        });
      }
    });

    return {
      rows,
      validCount,
      errorCount,
      duplicateCount,
    };
  }, [parsedFile, fieldMapping]);

  // Proceed from Step 3 to Step 4
  const proceedToStep4 = () => {
    if (validationResults.validCount === 0) {
      toast.error("There are no valid rows to import. Please check your mapping or file.");
      return;
    }
    setCurrentStep(4);
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 4: PREVIEW & IMPORT SUBMISSION
  // ─────────────────────────────────────────────────────────────
  const handleFinalImport = () => {
    setCreditCostError(null);

    if (isNaN(defaultCreditCost) || defaultCreditCost < 1) {
      setCreditCostError("Credit cost must be at least 1 credit.");
      toast.error("Credit cost must be 1 or higher");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(5);
      toast.success(`${validationResults.validCount} leads successfully imported!`);
    }, 900);
  };

  return (
    <div className="space-y-6 pb-12 select-none font-sans max-w-4xl mx-auto w-full">
      {/* ── Top Breadcrumbs / Back button ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/lead"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lead Management</span>
        </Link>
        <span className="text-xs text-slate-400 font-medium">
          Step {currentStep} of 5
        </span>
      </div>

      {/* ── Stepper Navigation Header ── */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 py-4 text-xs font-medium">
        {[
          { num: 1, label: "Upload" },
          { num: 2, label: "Mapping" },
          { num: 3, label: "Validation" },
          { num: 4, label: "Preview" },
          { num: 5, label: "Import" },
        ].map((s, idx) => {
          const isCompleted = currentStep > s.num;
          const isActive = currentStep === s.num;

          return (
            <div key={s.num} className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCompleted
                      ? "bg-[#00BC7D] text-white"
                      : isActive
                      ? "bg-[#0F172A] text-white ring-4 ring-slate-100"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : s.num}
                </div>
                <span
                  className={`hidden sm:inline-block ${
                    isActive
                      ? "text-[#0F172A] font-bold"
                      : isCompleted
                      ? "text-slate-700 font-medium"
                      : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < 4 && (
                <div
                  className={`h-[2px] w-6 sm:w-10 transition-colors ${
                    currentStep > s.num ? "bg-[#00BC7D]" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: UPLOAD (Dynamic Local File Upload & Drag-and-Drop)
          ───────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/70 shadow-2xs">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Upload the file</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select or drop a CSV or Excel spreadsheet from your local computer.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#00BC7D]" />
              <span>Auto-detect headers</span>
            </div>
          </div>

          {/* Hidden native local file input */}
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Upload Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl p-10 sm:p-14 text-center transition-all cursor-pointer border-2 border-dashed relative ${
              isDragging
                ? "border-[#00BC7D] bg-emerald-50/40 scale-[1.01]"
                : parsedFile
                ? "border-[#00BC7D] bg-[#F4FBF8]"
                : "border-slate-300 bg-white hover:bg-slate-50/60 hover:border-slate-400"
            }`}
          >
            {isParsing ? (
              <div className="py-6 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#00BC7D] mb-3" />
                <span className="text-sm font-semibold text-slate-700">Reading and parsing file...</span>
                <span className="text-xs text-slate-400 mt-1">Detecting columns and rows</span>
              </div>
            ) : parsedFile ? (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#E6F8F2] text-[#00BC7D] flex items-center justify-center mx-auto shadow-xs">
                  {parsedFile.name.endsWith(".xlsx") || parsedFile.name.endsWith(".xls") ? (
                    <FileSpreadsheet className="w-7 h-7 stroke-[2.2]" />
                  ) : (
                    <FileText className="w-7 h-7 stroke-[2.2]" />
                  )}
                </div>

                <div>
                  <div className="font-bold text-base sm:text-lg text-[#0F172A] break-all">
                    {parsedFile.name}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 font-semibold text-slate-700">
                      {parsedFile.rowCount.toLocaleString()} rows
                    </span>
                    <span>•</span>
                    <span>{parsedFile.sizeFormatted}</span>
                    <span>•</span>
                    <span className="text-[#00BC7D] font-semibold">
                      {parsedFile.headers.length} columns detected
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    Change file
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-semibold text-base text-slate-800">
                    Click to browse or drag file here
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Supports CSV or Excel files (.csv, .xlsx, .xls) — up to 10 MB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose local file</span>
                </button>
              </div>
            )}
          </div>

          {/* Validation error message */}
          {fileError && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Step 1 Actions */}
          <div className="pt-8 border-t border-slate-100 mt-8 flex items-center justify-between gap-4">
            <Link
              href="/lead"
              className="flex-1 max-w-[180px] py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-colors cursor-pointer text-center"
            >
              Cancel
            </Link>
            <button
              type="button"
              disabled={!parsedFile || isParsing}
              onClick={() => setCurrentStep(2)}
              className="flex-1 max-w-[220px] py-3 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center ml-auto"
            >
              Next: Map Fields →
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 2: FIELD MAPPING (Dynamic Column Matcher & Required Validation)
          ───────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/70 shadow-2xs">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Field mapping</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Map the columns from &quot;{parsedFile?.name}&quot; to the platform lead fields.
            </p>
          </div>

          {/* Validation error message */}
          {mappingError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{mappingError}</span>
            </div>
          )}

          {/* Mapping Table */}
          <div className="space-y-3.5">
            {TARGET_FIELDS.map((field) => {
              const currentSelected = fieldMapping[field.id] || "";
              const isMapped = Boolean(currentSelected && currentSelected !== "__none__");

              return (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80"
                >
                  <div className="w-full sm:w-56 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#0F172A]">
                        {field.label}
                      </span>
                      {field.required ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                          Required
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200/70 text-slate-500">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{field.hint}</p>
                  </div>

                  <span className="hidden sm:inline-block text-slate-400 font-bold">→</span>

                  {/* Dropdown with all parsed headers */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className="relative w-full">
                      <select
                        aria-label={`Select column for ${field.label}`}
                        value={currentSelected}
                        onChange={(e) => {
                          setFieldMapping((prev) => ({
                            ...prev,
                            [field.id]: e.target.value,
                          }));
                          setMappingError(null);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all appearance-none cursor-pointer pr-10"
                      >
                        <option value="__none__">-- Do not import / Skip --</option>
                        {parsedFile?.headers.map((h) => (
                          <option key={h} value={h}>
                            Column: {h}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="w-6 shrink-0 flex items-center justify-center">
                      {isMapped ? (
                        <Check className="w-4 h-4 text-[#00BC7D] stroke-[3]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 2 Actions */}
          <div className="pt-8 border-t border-slate-100 mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex-1 max-w-[180px] py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-colors cursor-pointer text-center"
            >
              Back
            </button>
            <button
              type="button"
              onClick={validateAndProceedToStep3}
              className="flex-1 max-w-[220px] py-3 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer text-center ml-auto"
            >
              Next: Validate Data →
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 3: DATA VALIDATION (Dynamic Row Inspection)
          ───────────────────────────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/70 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Data validation</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Automated check of {parsedFile?.rowCount || 0} records using your mapped fields.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Showing preview of top {validationResults.rows.length} rows
            </span>
          </div>

          {/* Validation Metric Stats Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-[#E6F8F2] border border-emerald-200/70 rounded-2xl p-4 sm:p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#00BC7D]">
                {validationResults.validCount}
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-1">✓ Valid leads</div>
            </div>
            <div className="bg-rose-50 border border-rose-200/70 rounded-2xl p-4 sm:p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-rose-500">
                {validationResults.errorCount}
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-1">✕ Errors</div>
            </div>
            <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 sm:p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-amber-700">
                {validationResults.duplicateCount}
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-1">! Duplicates</div>
            </div>
          </div>

          {/* Validation Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4 text-right">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validationResults.rows.map((row, i) => (
                  <tr
                    key={i}
                    className={
                      row.status === "error"
                        ? "bg-rose-50/40"
                        : row.status === "duplicate"
                        ? "bg-amber-50/30"
                        : "hover:bg-slate-50/50"
                    }
                  >
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {row.name}
                    </td>
                    <td
                      className={`py-3 px-4 whitespace-nowrap font-mono text-xs ${
                        row.status === "error" ? "font-bold text-rose-600" : "text-slate-600"
                      }`}
                    >
                      {row.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{row.city}</td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{row.service}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {row.status === "ok" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#E6F8F2] text-[#00BC7D] border border-emerald-100">
                          ✓ Ok
                        </span>
                      ) : row.status === "duplicate" ? (
                        <span
                          title={row.errorReason}
                          className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 cursor-help"
                        >
                          ! Duplicate
                        </span>
                      ) : (
                        <span
                          title={row.errorReason}
                          className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-500 border border-rose-100 cursor-help"
                        >
                          ✕ Error
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notice if errors found */}
          {validationResults.errorCount > 0 && (
            <p className="text-[11px] text-slate-400 mt-2.5 italic">
              * Note: Rows with errors will be skipped automatically during the final import.
            </p>
          )}

          {/* Step 3 Actions */}
          <div className="pt-8 border-t border-slate-100 mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex-1 max-w-[180px] py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-colors cursor-pointer text-center"
            >
              Back
            </button>
            <button
              type="button"
              onClick={proceedToStep4}
              className="flex-1 max-w-[220px] py-3 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer text-center ml-auto"
            >
              Next: Preview & Settings →
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 4: PREVIEW & CONFIGURATION
          ───────────────────────────────────────────────────────────── */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/70 shadow-2xs">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Import Preview & Settings</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure default settings and review before finalizing the import.
            </p>
          </div>

          {/* Config form */}
          <div className="space-y-4 mb-6">
            <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Default Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Default Category selector */}
                <div>
                  <label htmlFor="default-category-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Default Category
                  </label>
                  <div className="relative">
                    <select
                      id="default-category-select"
                      value={defaultCategory}
                      onChange={(e) => setDefaultCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00BC7D]/40 transition-all appearance-none cursor-pointer pr-10"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Default Credit Cost input with validation */}
                <div>
                  <label htmlFor="credit-cost-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Default Credit Cost (per lead)
                  </label>
                  <div className="relative">
                    <input
                      id="credit-cost-input"
                      type="number"
                      min="1"
                      max="500"
                      value={defaultCreditCost}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setDefaultCreditCost(isNaN(val) ? 0 : val);
                        setCreditCostError(null);
                      }}
                      className={`w-full bg-white border rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none transition-all ${
                        creditCostError
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-400/40"
                          : "border-slate-200 focus:ring-2 focus:ring-[#00BC7D]/40"
                      }`}
                    />
                    <span className="text-xs text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 font-medium pointer-events-none">
                      credits
                    </span>
                  </div>
                  {creditCostError && (
                    <p className="text-[11px] text-rose-500 mt-1">{creditCostError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-slate-100/70 rounded-2xl p-5 border border-slate-200/70 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Source file</span>
                <span className="font-semibold text-[#0F172A]">{parsedFile?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Valid leads ready to import</span>
                <span className="font-bold text-[#00BC7D] text-base">
                  {validationResults.validCount} leads
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Selected default category</span>
                <span className="font-bold text-[#0F172A]">{defaultCategory}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Credit value</span>
                <span className="font-bold text-[#9333EA] text-base">
                  {defaultCreditCost} credits each
                </span>
              </div>
            </div>
          </div>

          {/* Step 4 Actions */}
          <div className="pt-8 border-t border-slate-100 mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setCurrentStep(3)}
              className="flex-1 max-w-[180px] py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-colors cursor-pointer text-center disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalImport}
              className="flex-1 max-w-[220px] py-3 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer text-center ml-auto flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Importing...</span>
                </>
              ) : (
                <span>Import Now →</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 5: COMPLETED
          ───────────────────────────────────────────────────────────── */}
      {currentStep === 5 && (
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200/70 shadow-2xs text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-[#E6F8F2] text-[#00BC7D] flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Check className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">
              Import completed successfully!
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
              Your leads from <strong className="text-slate-700">{parsedFile?.name}</strong> have been processed and added to the platform.
            </p>

            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8 flex-wrap">
              <div className="bg-[#E6F8F2] border border-emerald-200/70 p-5 rounded-2xl w-32 text-center shadow-2xs">
                <div className="text-3xl font-bold text-[#00BC7D]">
                  {validationResults.validCount}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-1.5">Imported</div>
              </div>
              <div className="bg-rose-50 border border-rose-200/70 p-5 rounded-2xl w-32 text-center shadow-2xs">
                <div className="text-3xl font-bold text-rose-500">
                  {validationResults.errorCount}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-1.5">Failed</div>
              </div>
              <div className="bg-amber-50/60 border border-amber-200/70 p-5 rounded-2xl w-32 text-center shadow-2xs">
                <div className="text-3xl font-bold text-amber-700">
                  {validationResults.duplicateCount}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-1.5">Duplicates</div>
              </div>
            </div>

            <div className="w-full border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => router.push("/lead")}
                className="w-full sm:w-auto px-10 py-3.5 rounded-full bg-[#00BC7D] hover:bg-[#00a86b] text-white font-semibold text-sm transition-all shadow-sm cursor-pointer"
              >
                Go to Leads →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
