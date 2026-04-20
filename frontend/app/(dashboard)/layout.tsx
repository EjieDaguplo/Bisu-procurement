"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../src/components/layout/Sidebar";
import { Navbar } from "../../src/components/layout/Navbar";
import { isLoggedIn } from "../../src/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) router.replace("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen bg-bisu-offwhite">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
