"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "@/src/components/layout/PageWrapper";
import { api } from "@/src/lib/api";
import { Department, Priority } from "@/src/types";
import { Plus, Trash2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

interface LineItemForm {
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  specifications: string;
}

const emptyItem = (): LineItemForm => ({
  description: "",
  unit: "",
  quantity: 1,
  unit_price: 0,
  specifications: "",
});

export default function CreatePRPage() {
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [departmentId, setDeptId] = useState("");
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [dateNeeded, setDateNeeded] = useState("");
  const [remarks, setRemarks] = useState("");
  const [lineItems, setLineItems] = useState<LineItemForm[]>([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Department[]>("/departments")
      .then(setDepartments)
      .catch(console.error);
  }, []);

  const updateItem = (
    i: number,
    field: keyof LineItemForm,
    value: string | number,
  ) => {
    setLineItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const addItem = () => setLineItems((prev) => [...prev, emptyItem()]);
  const removeItem = (i: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, idx) => idx !== i));
  };

  const totalAmount = lineItems.reduce(
    (s, item) => s + item.quantity * item.unit_price,
    0,
  );

  const handleSubmit = async (e: React.FormEvent, submitAfter = false) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!purpose.trim()) {
      setError("Purpose is required.");
      return;
    }
    if (!departmentId) {
      setError("Department is required.");
      return;
    }
    if (lineItems.some((i) => !i.description.trim())) {
      setError("All items must have a description.");
      return;
    }

    setLoading(true);
    try {
      const pr = await api.post<{ id: number }>("/purchase-requests", {
        title,
        purpose,
        department_id: Number(departmentId),
        priority,
        date_needed: dateNeeded || null,
        remarks: remarks || null,
        line_items: lineItems.map((item) => ({
          description: item.description,
          unit: item.unit,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          specifications: item.specifications || null,
        })),
      });

      if (submitAfter) {
        await api.patch(`/purchase-requests/${pr.id}/submit`);
      }

      router.push("/purchase-requests");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create PR.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper title="New Purchase Request">
      <form
        onSubmit={(e) => handleSubmit(e, false)}
        className="flex flex-col gap-6 max-w-4xl"
      >
        {/* Back link */}
        <div className="flex items-center gap-3">
          <Link
            href="/purchase-requests"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-bisu-blue transition-colors"
          >
            <ArrowLeft size={15} /> Back to Purchase Requests
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ── Request Info ── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-bisu-blue text-base">
            Request Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title / Subject <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Office Supplies for Q2 2026"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                value={departmentId}
                onChange={(e) => setDeptId(e.target.value)}
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

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Priority
              </label>
              <select
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {(["LOW", "NORMAL", "HIGH", "URGENT"] as Priority[]).map(
                  (p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Date Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date Needed
              </label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                value={dateNeeded}
                onChange={(e) => setDateNeeded(e.target.value)}
              />
            </div>

            {/* Purpose */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Purpose / Justification <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Explain why this purchase is needed..."
                required
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Remarks
              </label>
              <textarea
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional remarks..."
              />
            </div>
          </div>
        </div>

        {/* ── Line Items ── */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-bisu-blue text-base">
              Items / Materials
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 text-sm text-bisu-blue hover:text-bisu-blue-dark font-semibold transition-colors"
            >
              <Plus size={15} /> Add Item
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {lineItems.map((item, i) => (
              <div
                key={i}
                className="relative bg-gray-50 rounded-xl border border-gray-200 p-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(i, "description", e.target.value)
                      }
                      placeholder="Item description"
                      required
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Unit
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                      value={item.unit}
                      onChange={(e) => updateItem(i, "unit", e.target.value)}
                      placeholder="pcs, kg, box"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(i, "quantity", Number(e.target.value))
                      }
                    />
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Unit Price (₱)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(i, "unit_price", Number(e.target.value))
                      }
                    />
                  </div>

                  {/* Subtotal */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Subtotal
                    </label>
                    <div className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm font-semibold text-bisu-blue bg-gray-100">
                      ₱
                      {(item.quantity * item.unit_price).toLocaleString(
                        "en-PH",
                        { minimumFractionDigits: 2 },
                      )}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Specifications
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bisu-blue/30 focus:border-bisu-blue transition-all"
                      value={item.specifications}
                      onChange={(e) =>
                        updateItem(i, "specifications", e.target.value)
                      }
                      placeholder="Optional specifications..."
                    />
                  </div>
                </div>

                {/* Remove button */}
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-end mt-2">
            <div className="bg-bisu-blue text-white rounded-xl px-6 py-3 text-right">
              <p className="text-xs text-white/70 font-medium mb-0.5">
                Total Amount
              </p>
              <p className="text-xl font-bold">
                ₱
                {totalAmount.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/purchase-requests"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
            className="inline-flex items-center gap-2 bg-bisu-blue hover:bg-bisu-blue-dark text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={15} />
            {loading ? "Submitting..." : "Save & Submit"}
          </button>
        </div>
      </form>
    </PageWrapper>
  );
}
