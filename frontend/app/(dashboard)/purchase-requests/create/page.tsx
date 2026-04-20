"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "../../../../src/components/layout/PageWrapper";
import { PRForm } from "../../../../src/components/pr/PRForm";
import { api } from "../../../../src/lib/api";
import { Department } from "../../../../src/types";

export default function CreatePRPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    api.get<Department[]>("/users").then(() => {});
    // Fetch departments from your departments endpoint (add a /departments route if needed)
    // Placeholder — populate from your actual departments API
    setDepartments([
      { id: 1, code: "COT", name: "College of Technology" },
      { id: 2, code: "ADMIN", name: "Administration Office" },
      { id: 3, code: "LIB", name: "Library" },
      { id: 4, code: "ACCT", name: "Accounting Office" },
      { id: 5, code: "REGISTRAR", name: "Registrar" },
    ]);
  }, []);

  const handleSubmit = async (
    data: Parameters<typeof PRForm>[0]["onSubmit"] extends (
      d: infer D,
    ) => unknown
      ? D
      : never,
  ) => {
    await api.post("/purchase-requests", data);
    router.push("/purchase-requests");
  };

  return (
    <PageWrapper title="New Purchase Request">
      <PRForm
        departments={departments}
        onSubmit={handleSubmit}
        submitLabel="Save Draft"
      />
    </PageWrapper>
  );
}
