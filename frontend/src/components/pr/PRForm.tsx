"use client";
import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { LineItem, Priority } from "../../types";

interface PRFormData {
  title: string;
  purpose: string;
  department_id: number;
  priority: Priority;
  date_needed: string;
  remarks: string;
  line_items: Omit<LineItem, "id" | "total_price">[];
}

interface PRFormProps {
  initialData?: Partial<PRFormData>;
  departments: { id: number; name: string }[];
  onSubmit: (data: PRFormData) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

const emptyItem = () => ({
  description: "",
  unit: "",
  quantity: 1,
  unit_price: 0,
  specifications: "",
});

export const PRForm = ({
  initialData,
  departments,
  onSubmit,
  loading,
  submitLabel = "Save Draft",
}: PRFormProps) => {
  const [form, setForm] = useState<PRFormData>({
    title: initialData?.title || "",
    purpose: initialData?.purpose || "",
    department_id: initialData?.department_id || 0,
    priority: initialData?.priority || "NORMAL",
    date_needed: initialData?.date_needed || "",
    remarks: initialData?.remarks || "",
    line_items: initialData?.line_items?.length
      ? initialData.line_items
      : [emptyItem()],
  });

  const [error, setError] = useState("");

  const updateItem = (i: number, field: string, value: string | number) => {
    setForm((prev) => {
      const items = [...prev.line_items];
      items[i] = { ...items[i], [field]: value };
      return { ...prev, line_items: items };
    });
  };

  const addItem = () =>
    setForm((prev) => ({
      ...prev,
      line_items: [...prev.line_items, emptyItem()],
    }));

  const removeItem = (i: number) => {
    if (form.line_items.length === 1) return;
    setForm((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, idx) => idx !== i),
    }));
  };

  const totalAmount = form.line_items.reduce(
    (s, i) => s + i.quantity * i.unit_price,
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.department_id) {
      setError("Please select a department.");
      return;
    }
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="card">
        <h3 className="font-semibold text-bisu-blue-DEFAULT mb-4">
          Request Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Title / Subject *</label>
            <input
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Office Supplies for Q2"
            />
          </div>
          <div>
            <label className="label">Department *</label>
            <select
              className="input-field"
              value={form.department_id}
              onChange={(e) =>
                setForm({ ...form, department_id: Number(e.target.value) })
              }
              required
            >
              <option value="">— Select Department —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select
              className="input-field"
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value as Priority })
              }
            >
              {["LOW", "NORMAL", "HIGH", "URGENT"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date Needed</label>
            <input
              type="date"
              className="input-field"
              value={form.date_needed}
              onChange={(e) =>
                setForm({ ...form, date_needed: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Purpose / Justification *</label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              required
              placeholder="Explain why this purchase is needed..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Remarks</label>
            <textarea
              className="input-field resize-none"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-bisu-blue-DEFAULT">
            Items / Materials
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 text-sm text-bisu-blue-light hover:text-bisu-blue-DEFAULT font-medium"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {form.line_items.map((item, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 relative"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="label">Description *</label>
                  <input
                    className="input-field"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(i, "description", e.target.value)
                    }
                    required
                    placeholder="Item description"
                  />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <input
                    className="input-field"
                    value={item.unit}
                    onChange={(e) => updateItem(i, "unit", e.target.value)}
                    placeholder="pcs, kg, box"
                  />
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <input
                    type="number"
                    className="input-field"
                    value={item.quantity}
                    min={1}
                    onChange={(e) =>
                      updateItem(i, "quantity", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <label className="label">Unit Price (₱)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={item.unit_price}
                    min={0}
                    step="0.01"
                    onChange={(e) =>
                      updateItem(i, "unit_price", Number(e.target.value))
                    }
                  />
                </div>
                <div>
                  <label className="label">Subtotal</label>
                  <div className="input-field bg-gray-100 text-gray-700 font-semibold">
                    ₱
                    {(item.quantity * item.unit_price).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
              {form.line_items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <div className="bg-bisu-blue-DEFAULT text-white rounded-lg px-5 py-2.5 font-semibold">
            Total: ₱
            {totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};
