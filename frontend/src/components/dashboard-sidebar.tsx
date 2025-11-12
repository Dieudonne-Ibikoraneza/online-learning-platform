// components/dashboard-sidebar.tsx - Update student nav items
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GalleryVerticalEnd,
  Home,
  Users,
  BarChart3,
  Settings,
  GraduationCap,
  Video,
  Heart,
  X,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

// Updated student navigation - removed "My Courses", added "Browse Courses"
const studentNavItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/courses", label: "Browse Courses", icon: Search }, // Changed from "My Courses" to "Browse Courses"
  { href: "/dashboard/enrolled", label: "Enrolled", icon: GraduationCap },
  { href: "/dashboard/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/progress", label: "Progress", icon: BarChart3 },
];

const instructorNavItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/courses", label: "My Courses", icon: GalleryVerticalEnd },
  { href: "/dashboard/create-course", label: "Create Course", icon: Video },
  { href: "/dashboard/students", label: "Students", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const adminNavItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/courses", label: "Courses", icon: GalleryVerticalEnd },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({
  isOpen = false,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems =
    user?.role === "admin"
      ? adminNavItems
      : user?.role === "instructor"
      ? instructorNavItems
      : studentNavItems;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto lg:fixed",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header Section - Fixed at top */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b">
            <div className="flex items-center">
              <GalleryVerticalEnd className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">Learn Hub.</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Section - Scrollable if needed */}
          <div className="flex-1 overflow-y-auto sidebar-nav-scroll">
            <nav className="flex flex-col px-6 py-4">
              <ul role="list" className="flex flex-col gap-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          // Close sidebar on mobile when a link is clicked
                          if (onClose) onClose();
                        }}
                        className={cn(
                          pathname === item.href
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent hover:text-accent-foreground",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Settings Section - Fixed at bottom */}
          <div className="shrink-0 border-t px-6 py-4">
            <Link
              href="/dashboard/settings"
              onClick={() => {
                if (onClose) onClose();
              }}
              className={cn(
                pathname === "/dashboard/settings"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground",
                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors"
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              Settings
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
