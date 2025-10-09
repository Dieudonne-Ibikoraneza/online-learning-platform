// app/dashboard/page.tsx - Update the student dashboard section
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { StudentDashboard } from "@/components/student-dashboard";
import { InstructorDashboard } from "@/components/instructor-dashboard";
import { AdminDashboard } from "@/components/admin-dashboard";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {user.name}!
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium capitalize">
            {user.role}
          </div>
        </div>
      </div>

      {/* Role-specific dashboard components */}
      {user.role === "student" && <StudentDashboard />}
      {user.role === "instructor" && <InstructorDashboard />}
      {user.role === "admin" && <AdminDashboard />}
    </div>
  );
}
