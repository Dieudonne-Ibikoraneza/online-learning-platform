"use client";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import React from "react";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useDashboard();

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {/* Add proper margin-left to account for fixed sidebar width */}
      <div className="flex flex-1 flex-col lg:ml-64">
        <DashboardHeader onMenuClick={toggleSidebar} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
