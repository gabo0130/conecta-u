"use client";

import { ProtectedRoute } from "@/components/organisms/ProtectedRoute/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
