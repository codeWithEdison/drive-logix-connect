import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Modal, { ModalSize } from "@/components/modal/Modal";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import axiosInstance from "@/lib/api/axios";

interface CargoCategory {
  id: string;
  name: string;
  description: string | null;
  base_rate_multiplier: number;
  special_handling_required: boolean;
  is_active: boolean;
  cargo_count?: number;
}

export default function CargoCategoriesPage() {
  const [categories, setCategories] = useState<CargoCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CargoCategory | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    base_rate_multiplier: 1,
    special_handling_required: false,
    is_active: true,
  });

  const normalizeList = (payload: any): CargoCategory[] => {
    if (Array.isArray(payload)) return payload as CargoCategory[];
    if (Array.isArray(payload?.data)) return payload.data as CargoCategory[];
    if (Array.isArray(payload?.data?.data))
      return payload.data.data as CargoCategory[];
    return [];
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get("/operational/cargo-categories");
      setCategories(normalizeList(res.data));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      base_rate_multiplier: 1,
      special_handling_required: false,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEdit = (cat: CargoCategory) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      base_rate_multiplier: cat.base_rate_multiplier,
      special_handling_required: !!cat.special_handling_required,
      is_active: !!cat.is_active,
    });
    setShowModal(true);
  };

  const saveCategory = async () => {
    const payload = {
      name: form.name,
      description: form.description?.trim() || null,
      base_rate_multiplier: Number(form.base_rate_multiplier) || 1,
      special_handling_required: !!form.special_handling_required,
      is_active: !!form.is_active,
    };
    if (editing) {
      await axiosInstance.put(`/cargo-categories/${editing.id}`, payload);
    } else {
      await axiosInstance.post("/cargo-categories", payload);
    }
    setShowModal(false);
    await fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await axiosInstance.delete(`/cargo-categories/${id}`);
    await fetchCategories();
  };

  const toggleStatus = async (cat: CargoCategory) => {
    await axiosInstance.patch(`/cargo-categories/${cat.id}/toggle-status`);
    await fetchCategories();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Cargo Categories
          </h1>
          <p className="text-muted-foreground">
            Manage cargo types and multipliers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchCategories}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Base Multiplier</TableHead>
                  <TableHead>Special Handling</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Cargos</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8}>Loading...</TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>No categories found</TableCell>
                  </TableRow>
                ) : (
                  categories.map((c, idx) => (
                    <TableRow key={c.id} className="hover:bg-gray-50">
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.description || "-"}</TableCell>
                      <TableCell>{c.base_rate_multiplier}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.special_handling_required
                              ? "default"
                              : "secondary"
                          }
                        >
                          {c.special_handling_required ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <label
                          className="flex items-center cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={!!c.is_active}
                            onChange={() => toggleStatus(c)}
                          />
                          <div
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              c.is_active ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                c.is_active ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </div>
                        </label>
                      </TableCell>
                      <TableCell>{c.cargo_count ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(c)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteCategory(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Category" : "Create Category"}
        widthSizeClass={ModalSize.medium}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Category name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Base Rate Multiplier</Label>
              <Input
                type="number"
                step="0.01"
                value={form.base_rate_multiplier}
                onChange={(e) =>
                  setForm({
                    ...form,
                    base_rate_multiplier: parseFloat(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <Label>Special Handling Required</Label>
              </div>
              <Switch
                checked={form.special_handling_required}
                onCheckedChange={(v) =>
                  setForm({ ...form, special_handling_required: v })
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label>Active</Label>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v })}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={saveCategory}>
              {editing ? "Update" : "Create"}
            </Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
