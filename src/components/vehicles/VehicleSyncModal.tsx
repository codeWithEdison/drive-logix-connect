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
import { VehicleStatus, VehicleType, FuelType } from "@/types/shared";
import { useBranches } from "@/lib/api/hooks/branchHooks";

type RowCell = { value: any; error: string | null };

export type VehicleSyncRow = {
  // Display/edit cells
  device_imei?: RowCell;
  plate_number?: RowCell;
  vehicle_type?: RowCell;
  make?: RowCell;
  model?: RowCell;
  driver_name?: RowCell;
  driver_phone?: RowCell;
  sim_number?: RowCell;
  device_model?: RowCell;
  device_name?: RowCell;
  device_activation_time?: RowCell; // ISO date
  device_expiration?: RowCell; // ISO date
  branch_id?: RowCell;
  status?: RowCell;
  gps_provider?: RowCell; // forced to jimi when IMEI present
  // Additional vehicle details
  capacity_kg?: RowCell;
  capacity_volume?: RowCell;
  fuel_type?: RowCell;
  year?: RowCell;
  color?: RowCell;
  // Internal flags
  hasErrors?: boolean;
  __ref__?: any; // original jimiDevice reference (optional)
};

interface VehicleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: VehicleSyncRow[];
  onSave: (selected: any[]) => Promise<void>;
}

// Columns shown in the grid (hide non-editable JIMI fields)
const HEADERS: Array<keyof VehicleSyncRow> = [
  "device_imei",
  "plate_number",
  "vehicle_type",
  "make",
  "model",
  "year",
  "color",
  "driver_name",
  "driver_phone",
  "sim_number",
  "device_model",
  "device_name",
  "capacity_kg",
  "capacity_volume",
  "fuel_type",
  "branch_id",
];

export function VehicleSyncModal({
  isOpen,
  onClose,
  rows,
  onSave,
}: VehicleSyncModalProps) {
  const [data, setData] = useState<VehicleSyncRow[]>([]);
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
    return { total, valid, errors };
  }, [data]);

  function parseISO(v: any): string | null {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  function validate(rowsIn: VehicleSyncRow[]): VehicleSyncRow[] {
    const imeis = new Set<string>();
    const plates = new Set<string>();
    return rowsIn.map((r) => {
      const nr: VehicleSyncRow = { ...r } as any;

      // Helper to set error
      const set = (key: keyof VehicleSyncRow, val: any) => {
        const cell = (nr[key] as RowCell) || { value: "", error: null };
        cell.value = val;
        (nr as any)[key] = cell;
      };

      // Coerce provider
      if ((nr.device_imei?.value || "").toString().trim()) {
        set("gps_provider", "jimi");
      }

      // Required: plate number
      const hasPlate = !!(
        nr.plate_number?.value && `${nr.plate_number.value}`.trim()
      );
      if (!hasPlate) {
        nr.plate_number = {
          value: nr.plate_number?.value,
          error: "Plate number is required",
        };
      } else if (nr.plate_number) {
        nr.plate_number.error = null;
      }

      // Enums
      const typeVals = Object.values(VehicleType);
      if (nr.vehicle_type?.value && !typeVals.includes(nr.vehicle_type.value)) {
        nr.vehicle_type = {
          value: nr.vehicle_type.value,
          error: "Invalid type",
        };
      } else if (nr.vehicle_type) {
        nr.vehicle_type.error = null;
      }
      const statusVals = Object.values(VehicleStatus);
      if (nr.status?.value && !statusVals.includes(nr.status.value)) {
        nr.status = { value: nr.status.value, error: "Invalid status" };
      } else if (nr.status) {
        nr.status.error = null;
      }
      const fuelVals = Object.values(FuelType);
      if (nr.fuel_type?.value && !fuelVals.includes(nr.fuel_type.value)) {
        nr.fuel_type = { value: nr.fuel_type.value, error: "Invalid fuel" };
      } else if (nr.fuel_type) {
        nr.fuel_type.error = null;
      }

      // Numbers
      const toNum = (v: any) =>
        v === null || v === undefined || v === "" ? null : Number(v);
      if (nr.capacity_kg) {
        const n = toNum(nr.capacity_kg.value);
        // Required and must be a valid number
        if (n === null || isNaN(n)) {
          nr.capacity_kg.error = "Capacity kg is required";
        } else {
          nr.capacity_kg.error = null;
        }
      }
      if (nr.capacity_volume) {
        const n = toNum(nr.capacity_volume.value);
        nr.capacity_volume.error =
          n === null || !isNaN(n) ? null : "Invalid number";
      }
      if (nr.year) {
        const n = toNum(nr.year.value);
        nr.year.error =
          n === null || (!isNaN(n) && n > 1900 && n < 2100)
            ? null
            : "Invalid year";
      }

      // Dates
      if (nr.device_activation_time) {
        const iso = parseISO(nr.device_activation_time.value);
        nr.device_activation_time.error = iso ? null : "Invalid date";
        if (iso) nr.device_activation_time.value = iso;
      }
      if (nr.device_expiration) {
        const iso = parseISO(nr.device_expiration.value);
        nr.device_expiration.error = iso ? null : "Invalid date";
        if (iso) nr.device_expiration.value = iso;
      }

      // Uniqueness (intra-batch)
      const imeiKey = (nr.device_imei?.value || "").toString().trim();
      if (imeiKey) {
        if (imeis.has(imeiKey))
          nr.device_imei = {
            value: nr.device_imei?.value,
            error: "Duplicate IMEI",
          };
        imeis.add(imeiKey);
      }
      const plateKey = (nr.plate_number?.value || "")
        .toString()
        .trim()
        .toLowerCase();
      if (plateKey) {
        if (plates.has(plateKey))
          nr.plate_number = {
            value: nr.plate_number?.value,
            error: "Duplicate plate",
          };
        plates.add(plateKey);
      }

      // Provider lock
      if (nr.gps_provider) {
        nr.gps_provider.error = null;
      }

      // Mark row errors
      const hasErrors = HEADERS.some((h) => (nr as any)[h]?.error);
      nr.hasErrors = hasErrors;
      return nr;
    });
  }

  function handleCellChange(
    idx: number,
    key: keyof VehicleSyncRow,
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
    if (selectedRows.some((r) => r.hasErrors)) {
      setSaveError("Fix errors in selected rows");
      return;
    }
    setIsSaving(true);
    try {
      // Map to API payload (backend expects `type` not `vehicle_type`).
      // Prune empty strings/nulls and coerce numeric fields.
      const toNum = (v: any) =>
        v === null || v === undefined || v === "" ? undefined : Number(v);
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
          device_imei: r.device_imei?.value,
          plate_number: r.plate_number?.value,
          type: r.vehicle_type?.value,
          make: r.make?.value,
          model: r.model?.value,
          year: toNum(r.year?.value),
          color: r.color?.value,
          capacity_kg: toNum(r.capacity_kg?.value),
          capacity_volume: toNum(r.capacity_volume?.value),
          fuel_type: r.fuel_type?.value,
          gps_provider: r.device_imei?.value ? "jimi" : r.gps_provider?.value,
          status: r.status?.value,
          sim_number: r.sim_number?.value,
          device_model: r.device_model?.value,
          device_name: r.device_name?.value,
          device_activation_time: r.device_activation_time?.value,
          device_expiration: r.device_expiration?.value,
          driver_name: r.driver_name?.value,
          driver_phone: r.driver_phone?.value,
          branch_id: r.branch_id?.value,
        })
      );
      await onSave(payload);
    } catch (e: any) {
      setSaveError(e?.message || "Failed to save");
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
    <ModernModel isOpen={isOpen} onClose={onClose} title="Vehicle Sync (JIMI)">
      <div className="flex flex-row items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-sm">
          <div>Total: {counts.total}</div>
          <div className="text-green-600">Valid: {counts.valid}</div>
          <div className="text-red-600">Errors: {counts.errors}</div>
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
            disabled={isSaving || !selected.size || counts.errors > 0}
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
                  if (key === "vehicle_type") {
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
                            {Object.values(VehicleType).map((t) => (
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
                  if (key === "fuel_type") {
                    return (
                      <td key={key as string} className={baseCls}>
                        <Select
                          value={val || ""}
                          onValueChange={(v) => handleCellChange(i, key, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(FuelType).map((f) => (
                              <SelectItem key={f} value={f}>
                                {f}
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
                  if (key === "status") {
                    return (
                      <td key={key as string} className={baseCls}>
                        <Select
                          value={val || ""}
                          onValueChange={(v) => handleCellChange(i, key, v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(VehicleStatus).map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
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
                  const isReadonly =
                    key === "gps_provider" && (row.device_imei?.value || "");
                  return (
                    <td key={key as string} className={baseCls}>
                      <Input
                        value={val}
                        onChange={(e) =>
                          handleCellChange(i, key, e.target.value)
                        }
                        disabled={!!isReadonly}
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

export default VehicleSyncModal;
