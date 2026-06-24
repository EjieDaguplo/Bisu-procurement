"use client";
import React, { useState, useEffect } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) router.replace("/login");
  }, [router]);

  return (
    //Page locked to viewport height, only inner content scrolls
    <div className="flex h-screen overflow-hidden bg-bisu-offwhite">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar — fixed at top of this column, hamburger lives here now */}
        <Navbar onMenuClick={() => setMobileOpen((prev) => !prev)} />

        {/* Only this scrolls */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
