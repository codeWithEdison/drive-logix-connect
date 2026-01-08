import React, { useEffect, useMemo, useState } from "react";
import ModernModel from "@/components/modal/ModernModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useBranches } from "@/lib/api/hooks/branchHooks";

type RowCell = { value: any; error: string | null };

export type DriverSyncRow = {
  full_name?: RowCell;
  email?: RowCell;
  phone?: RowCell;
  password?: RowCell;
  preferred_language?: RowCell;
  license_number?: RowCell;
  license_expiry?: RowCell;
  license_type?: RowCell;
  code_number?: RowCell;
  date_of_birth?: RowCell;
  emergency_contact?: RowCell;
  emergency_phone?: RowCell;
  blood_type?: RowCell;
  medical_certificate_expiry?: RowCell;
  branch_id?: RowCell;
  // Internal flags
  hasErrors?: boolean;
};

interface DriverSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: DriverSyncRow[];
  onSave: (selected: any[]) => Promise<void>;
  existingDrivers?: Array<{
    email?: string;
    phone?: string;
    license_number?: string;
    code_number?: string;
  }>;
}

// Columns shown in the grid
const HEADERS: Array<keyof DriverSyncRow> = [
  "full_name",
  "email",
  "phone",
  "password",
  "preferred_language",
  "license_number",
  "license_type",
  "code_number",
  "license_expiry",
  "date_of_birth",
  "emergency_contact",
  "emergency_phone",
  "blood_type",
  "medical_certificate_expiry",
  "branch_id",
];

const LICENSE_TYPES = ["A", "B", "C", "D", "E"];
const LANGUAGES = ["en", "rw", "fr"];
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function DriverSyncModal({
  isOpen,
  onClose,
  rows,
  onSave,
  existingDrivers = [],
}: DriverSyncModalProps) {
  const [data, setData] = useState<DriverSyncRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const { data: branchesResponse } = useBranches({ limit: 100 });
  const branches = branchesResponse?.branches || [];
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    // initialize with validation
    const normalized = validate(rows || []);
    setData(normalized);
    setSelected(new Set(normalized.map((_, i) => i))); // select all by default
  }, [rows]);

  const counts = useMemo(() => {
    const total = data.length;
    const errors = data.filter((r) => r.hasErrors).length;
    const valid = total - errors;
    
    // Count errors in SELECTED rows only
    const selectedRows = Array.from(selected.values())
      .map((i) => data[i])
      .filter(Boolean);
    const selectedErrors = selectedRows.filter((r) => r.hasErrors).length;
    const selectedValid = selectedRows.length - selectedErrors;
    
    return { 
      total, 
      valid, 
      errors,
      selectedTotal: selectedRows.length,
      selectedValid,
      selectedErrors,
    };
  }, [data, selected]);

  function parseDate(v: any): string | null {
    if (!v) return null;
    const str = String(v).trim();
    if (!str || str === "") return null;
    
    // Try to parse various date formats
    const date = new Date(str);
    if (isNaN(date.getTime())) return null;
    
    // Return in YYYY-MM-DD format
    return date.toISOString().split("T")[0];
  }

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validate(rowsIn: DriverSyncRow[]): DriverSyncRow[] {
    const emails = new Set<string>();
    const phones = new Set<string>();
    const licenseNumbers = new Set<string>();
    const codeNumbers = new Set<string>();

    // Build sets of existing values from database
    const existingEmails = new Set(
      existingDrivers.map((d) => d.email?.toLowerCase()).filter(Boolean)
    );
    const existingPhones = new Set(
      existingDrivers.map((d) => d.phone?.toLowerCase()).filter(Boolean)
    );
    const existingLicenseNumbers = new Set(
      existingDrivers.map((d) => d.license_number?.toLowerCase()).filter(Boolean)
    );
    const existingCodeNumbers = new Set(
      existingDrivers.map((d) => d.code_number?.toLowerCase()).filter(Boolean)
    );

    return rowsIn.map((r) => {
      const nr: DriverSyncRow = { ...r } as any;

      // Helper to set error
      const set = (key: keyof DriverSyncRow, val: any) => {
        const cell = (nr[key] as RowCell) || { value: "", error: null };
        cell.value = val;
        (nr as any)[key] = cell;
      };

      // Required: full_name
      const fullName = (nr.full_name?.value || "").toString().trim();
      if (!fullName || fullName.length < 2) {
        nr.full_name = {
          value: nr.full_name?.value,
          error: "Full name is required (min 2 characters)",
        };
      } else if (fullName.length > 100) {
        nr.full_name = {
          value: nr.full_name?.value,
          error: "Full name must be max 100 characters",
        };
      } else {
        nr.full_name = { value: fullName, error: null };
      }

      // Required: email
      const email = (nr.email?.value || "").toString().trim().toLowerCase();
      if (!email) {
        nr.email = {
          value: nr.email?.value,
          error: "Email is required",
        };
      } else if (!validateEmail(email)) {
        nr.email = {
          value: nr.email?.value,
          error: "Invalid email format",
        };
      } else if (existingEmails.has(email)) {
        nr.email = {
          value: nr.email?.value,
          error: "Email already exists",
        };
      } else {
        nr.email = { value: email, error: null };
      }

      // Optional: phone
      const phone = (nr.phone?.value || "").toString().trim();
      if (phone && phone.length > 0) {
        const phoneLower = phone.toLowerCase();
        if (existingPhones.has(phoneLower)) {
          nr.phone = {
            value: nr.phone?.value,
            error: "Phone number already exists",
          };
        } else {
          nr.phone = { value: phone, error: null };
        }
      } else {
        nr.phone = { value: "", error: null };
      }

      // Required: password
      const password = (nr.password?.value || "").toString().trim();
      if (!password || password.length < 8) {
        nr.password = {
          value: nr.password?.value,
          error: "Password is required (min 8 characters)",
        };
      } else {
        nr.password = { value: password, error: null };
      }

      // Optional: preferred_language
      const language = (nr.preferred_language?.value || "en").toString().trim();
      if (language && !LANGUAGES.includes(language)) {
        nr.preferred_language = {
          value: nr.preferred_language?.value,
          error: "Invalid language (must be en, rw, or fr)",
        };
      } else {
        nr.preferred_language = { value: language || "en", error: null };
      }

      // Required: license_number
      const licenseNumber = (nr.license_number?.value || "").toString().trim();
      if (!licenseNumber) {
        nr.license_number = {
          value: nr.license_number?.value,
          error: "License number is required",
        };
      } else if (licenseNumber.length > 50) {
        nr.license_number = {
          value: nr.license_number?.value,
          error: "License number must be max 50 characters",
        };
      } else if (existingLicenseNumbers.has(licenseNumber.toLowerCase())) {
        nr.license_number = {
          value: nr.license_number?.value,
          error: "License number already exists",
        };
      } else {
        nr.license_number = { value: licenseNumber, error: null };
      }

      // Required: license_type
      const licenseType = (nr.license_type?.value || "").toString().trim();
      if (!licenseType || !LICENSE_TYPES.includes(licenseType)) {
        nr.license_type = {
          value: nr.license_type?.value,
          error: "License type is required (A, B, C, D, or E)",
        };
      } else {
        nr.license_type = { value: licenseType, error: null };
      }

      // Optional: code_number
      const codeNumber = (nr.code_number?.value || "").toString().trim();
      if (codeNumber && codeNumber.length > 20) {
        nr.code_number = {
          value: nr.code_number?.value,
          error: "Code number must be max 20 characters",
        };
      } else if (codeNumber && existingCodeNumbers.has(codeNumber.toLowerCase())) {
        nr.code_number = {
          value: nr.code_number?.value,
          error: "Code number already exists",
        };
      } else {
        nr.code_number = { value: codeNumber || "", error: null };
      }

      // Optional: license_expiry (date)
      if (nr.license_expiry?.value) {
        const expiryDate = parseDate(nr.license_expiry.value);
        if (expiryDate) {
          nr.license_expiry = { value: expiryDate, error: null };
        } else {
          nr.license_expiry = {
            value: nr.license_expiry.value,
            error: "Invalid date format (use YYYY-MM-DD)",
          };
        }
      } else {
        nr.license_expiry = { value: "", error: null };
      }

      // Optional: date_of_birth (date)
      if (nr.date_of_birth?.value) {
        const dob = parseDate(nr.date_of_birth.value);
        if (dob) {
          nr.date_of_birth = { value: dob, error: null };
        } else {
          nr.date_of_birth = {
            value: nr.date_of_birth.value,
            error: "Invalid date format (use YYYY-MM-DD)",
          };
        }
      } else {
        nr.date_of_birth = { value: "", error: null };
      }

      // Optional: emergency_contact
      const emergencyContact = (nr.emergency_contact?.value || "").toString().trim();
      if (emergencyContact && emergencyContact.length > 100) {
        nr.emergency_contact = {
          value: nr.emergency_contact?.value,
          error: "Emergency contact must be max 100 characters",
        };
      } else {
        nr.emergency_contact = { value: emergencyContact || "", error: null };
      }

      // Optional: emergency_phone
      const emergencyPhone = (nr.emergency_phone?.value || "").toString().trim();
      if (emergencyPhone && emergencyPhone.length > 20) {
        nr.emergency_phone = {
          value: nr.emergency_phone?.value,
          error: "Emergency phone must be max 20 characters",
        };
      } else {
        nr.emergency_phone = { value: emergencyPhone || "", error: null };
      }

      // Optional: blood_type
      const bloodType = (nr.blood_type?.value || "").toString().trim();
      if (bloodType && !BLOOD_TYPES.includes(bloodType)) {
        nr.blood_type = {
          value: nr.blood_type?.value,
          error: "Invalid blood type",
        };
      } else {
        nr.blood_type = { value: bloodType || "", error: null };
      }

      // Optional: medical_certificate_expiry (date)
      if (nr.medical_certificate_expiry?.value) {
        const medExpiry = parseDate(nr.medical_certificate_expiry.value);
        if (medExpiry) {
          nr.medical_certificate_expiry = { value: medExpiry, error: null };
        } else {
          nr.medical_certificate_expiry = {
            value: nr.medical_certificate_expiry.value,
            error: "Invalid date format (use YYYY-MM-DD)",
          };
        }
      } else {
        nr.medical_certificate_expiry = { value: "", error: null };
      }

      // Optional: branch_id
      const branchId = (nr.branch_id?.value || "").toString().trim();
      if (branchId) {
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(branchId)) {
          nr.branch_id = {
            value: nr.branch_id?.value,
            error: "Invalid branch ID format",
          };
        } else {
          nr.branch_id = { value: branchId, error: null };
        }
      } else {
        nr.branch_id = { value: "", error: null };
      }

      // Uniqueness checks (intra-batch)
      const emailKey = email.toLowerCase();
      if (emailKey) {
        if (emails.has(emailKey)) {
          nr.email = {
            value: nr.email?.value,
            error: "Duplicate email in batch",
          };
        }
        emails.add(emailKey);
      }

      const phoneKey = phone.toLowerCase();
      if (phoneKey) {
        if (phones.has(phoneKey)) {
          nr.phone = {
            value: nr.phone?.value,
            error: "Duplicate phone in batch",
          };
        }
        phones.add(phoneKey);
      }

      const licenseKey = licenseNumber.toLowerCase();
      if (licenseKey) {
        if (licenseNumbers.has(licenseKey)) {
          nr.license_number = {
            value: nr.license_number?.value,
            error: "Duplicate license number in batch",
          };
        }
        licenseNumbers.add(licenseKey);
      }

      const codeKey = codeNumber.toLowerCase();
      if (codeKey) {
        if (codeNumbers.has(codeKey)) {
          nr.code_number = {
            value: nr.code_number?.value,
            error: "Duplicate code number in batch",
          };
        }
        codeNumbers.add(codeKey);
      }

      // Mark row errors
      const hasErrors = HEADERS.some((h) => (nr as any)[h]?.error);
      nr.hasErrors = hasErrors;
      return nr;
    });
  }

  function handleCellChange(
    idx: number,
    key: keyof DriverSyncRow,
    value: any
  ) {
    const next = [...data];
    const cell = ((next[idx] as any)[key] as RowCell) || {
      value: "",
      error: null,
    };
    (next[idx] as any)[key] = { ...cell, value };
    setData(validate(next));
  }

  async function handleSave() {
    setSaveError(null);
    const selectedRows = Array.from(selected.values())
      .map((i) => data[i])
      .filter(Boolean);
    
    // Validate: Check if any selected row has errors
    const rowsWithErrors = selectedRows.filter((r) => r.hasErrors);
    if (rowsWithErrors.length > 0) {
      setSaveError(
        `Cannot save: ${rowsWithErrors.length} selected row(s) have validation errors. Please fix errors before saving.`
      );
      return;
    }
    
    // Validate: Check if any selected row has cell-level errors
    const rowsWithCellErrors = selectedRows.filter((row) => {
      return HEADERS.some((header) => {
        const cell = (row as any)[header] as RowCell | undefined;
        return cell?.error !== null && cell?.error !== undefined;
      });
    });
    
    if (rowsWithCellErrors.length > 0) {
      setSaveError(
        `Cannot save: ${rowsWithCellErrors.length} selected row(s) have field errors. Please fix all errors before saving.`
      );
      return;
    }
    
    // Additional validation: Ensure all required fields are present
    const invalidRows = selectedRows.filter((row) => {
      const hasRequiredFields = 
        row.full_name?.value &&
        row.email?.value &&
        row.password?.value &&
        row.license_number?.value &&
        row.license_type?.value;
      return !hasRequiredFields;
    });
    
    if (invalidRows.length > 0) {
      setSaveError(
        `Cannot save: ${invalidRows.length} selected row(s) are missing required fields. Please fill in all required fields.`
      );
      return;
    }
    
    setIsSaving(true);
    try {
      // Map to API payload format
      const clean = (obj: Record<string, any>) => {
        const out: Record<string, any> = {};
        Object.entries(obj).forEach(([k, v]) => {
          if (v === undefined || v === null || v === "") return;
          out[k] = v;
        });
        return out;
      };
      const payload = selectedRows.map((r) =>
        clean({
          full_name: r.full_name?.value,
          email: r.email?.value,
          phone: r.phone?.value,
          password: r.password?.value,
          preferred_language: r.preferred_language?.value || "en",
          license_number: r.license_number?.value,
          license_type: r.license_type?.value,
          license_expiry: r.license_expiry?.value || "",
          code_number: r.code_number?.value || "",
          date_of_birth: r.date_of_birth?.value || "",
          emergency_contact: r.emergency_contact?.value || "",
          emergency_phone: r.emergency_phone?.value || "",
          blood_type: r.blood_type?.value || "",
          medical_certificate_expiry: r.medical_certificate_expiry?.value || "",
          branch_id: r.branch_id?.value || "",
        })
      );
      await onSave(payload);
    } catch (e: any) {
      setSaveError(e?.error?.message || e?.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  const allSelected = selected.size === data.length && data.length > 0;
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(data.map((_, i) => i)));
  };

  return (
    <ModernModel isOpen={isOpen} onClose={onClose} title="Bulk Driver Upload">
      <div className="flex flex-row items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-sm">
          <div>Total: {counts.total}</div>
          <div className="text-green-600">Valid: {counts.valid}</div>
          <div className="text-red-600">Errors: {counts.errors}</div>
          {selected.size > 0 && (
            <>
              <div className="text-blue-600">Selected: {counts.selectedTotal}</div>
              <div className="text-green-600">Selected Valid: {counts.selectedValid}</div>
              {counts.selectedErrors > 0 && (
                <div className="text-red-600 font-semibold">
                  Selected Errors: {counts.selectedErrors}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={toggleAll} disabled={!data.length}>
            {allSelected ? "Unselect All" : "Select All"}
          </Button>
          <Button
            variant={showDelete ? "destructive" : "outline"}
            onClick={() => setShowDelete((v) => !v)}
            disabled={!data.length}
          >
            {showDelete ? "Hide Delete" : "Delete Rows"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving || 
              !selected.size || 
              counts.selectedErrors > 0 ||
              counts.selectedValid === 0
            }
          >
            {isSaving ? "Saving..." : "Save Selected"}
          </Button>
        </div>
      </div>

      <div
        className="overflow-x-auto overflow-y-auto"
        style={{ maxHeight: 600 }}
      >
        <table className="min-w-max" style={{ width: "max-content" }}>
          <thead>
            <tr>
              <th className="px-2 py-2 text-left text-sm font-bold min-w-[64px] sticky top-0 bg-white z-10">
                Sel
              </th>
              {showDelete && (
                <th className="px-2 py-2 text-left text-sm font-bold min-w-[56px] sticky top-0 bg-white z-10"></th>
              )}
              {HEADERS.map((h) => (
                <th
                  key={h as string}
                  className="px-2 py-2 text-left text-sm font-bold min-w-[160px] sticky top-0 bg-white z-10"
                >
                  {(h as string).replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={row.hasErrors ? "bg-red-50" : ""}>
                <td className="px-2 py-1">
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={(e) => {
                      const ns = new Set(selected);
                      if (e.target.checked) ns.add(i);
                      else ns.delete(i);
                      setSelected(ns);
                    }}
                  />
                </td>
                {showDelete && (
                  <td className="px-2 py-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const next = data.filter((_, idx) => idx !== i);
                        const sel = new Set(
                          Array.from(selected.values())
                            .filter((idx) => idx !== i)
                            .map((idx) => (idx > i ? idx - 1 : idx))
                        );
                        setData(validate(next));
                        setSelected(sel);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                )}
                {HEADERS.map((key) => {
                  const cell = (row as any)[key] as RowCell | undefined;
                  const val = cell?.value ?? "";
                  const err = cell?.error;
                  const baseCls = `px-2 py-1 min-w-[160px]`;
                  
                  if (key === "license_type") {
                    return (
                      <td key={key as string} className={baseCls}>
                        <Select
                          value={val || ""}
                          onValueChange={(v) => handleCellChange(i, key, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {LICENSE_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {err && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                            <AlertTriangle className="w-3 h-3" /> {err}
                          </div>
                        )}
                      </td>
                    );
                  }
                  
                  if (key === "preferred_language") {
                    return (
                      <td key={key as string} className={baseCls}>
                        <Select
                          value={val || "en"}
                          onValueChange={(v) => handleCellChange(i, key, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map((l) => (
                              <SelectItem key={l} value={l}>
                                {l.toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {err && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                            <AlertTriangle className="w-3 h-3" /> {err}
                          </div>
                        )}
                      </td>
                    );
                  }
                  
                  if (key === "blood_type") {
                    return (
                      <td key={key as string} className={baseCls}>
                        <Select
                          value={val || ""}
                          onValueChange={(v) => handleCellChange(i, key, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOOD_TYPES.map((b) => (
                              <SelectItem key={b} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {err && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                            <AlertTriangle className="w-3 h-3" /> {err}
                          </div>
                        )}
                      </td>
                    );
                  }
                  
                  if (key === "branch_id") {
                    return (
                      <td key={key as string} className={baseCls}>
                        <Select
                          value={val || ""}
                          onValueChange={(v) => handleCellChange(i, key, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((b: any) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {err && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                            <AlertTriangle className="w-3 h-3" /> {err}
                          </div>
                        )}
                      </td>
                    );
                  }
                  
                  // Date fields
                  if (
                    key === "license_expiry" ||
                    key === "date_of_birth" ||
                    key === "medical_certificate_expiry"
                  ) {
                    return (
                      <td key={key as string} className={baseCls}>
                        <Input
                          type="date"
                          value={val}
                          onChange={(e) =>
                            handleCellChange(i, key, e.target.value)
                          }
                        />
                        {err && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                            <AlertTriangle className="w-3 h-3" /> {err}
                          </div>
                        )}
                      </td>
                    );
                  }
                  
                  // Password field (visible in validation table)
                  if (key === "password") {
                    return (
                      <td key={key as string} className={baseCls}>
                        <Input
                          type="text"
                          value={val}
                          onChange={(e) =>
                            handleCellChange(i, key, e.target.value)
                          }
                          placeholder="Enter password (min 8 chars)"
                        />
                        {err && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                            <AlertTriangle className="w-3 h-3" /> {err}
                          </div>
                        )}
                      </td>
                    );
                  }
                  
                  // Regular text input
                  return (
                    <td key={key as string} className={baseCls}>
                      <Input
                        value={val}
                        onChange={(e) =>
                          handleCellChange(i, key, e.target.value)
                        }
                      />
                      {err && (
                        <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                          <AlertTriangle className="w-3 h-3" /> {err}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {saveError && (
        <div className="text-center text-red-600 font-medium mt-3">
          {saveError}
        </div>
      )}
    </ModernModel>
  );
}

export default DriverSyncModal;

