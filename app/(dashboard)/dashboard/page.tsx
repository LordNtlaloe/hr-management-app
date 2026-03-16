"use client"

import AdminDashboard from "@/components/admin-dashboard"
import DashboardSkeleton from "@/components/dashboard-skeleton"
import EmployeeDashboard from "@/components/employee-dashboard"
import HRDashboard from "@/components/hr-dashboard"
import SectionHeadDashboard from "@/components/section-head"
import { useSession } from "@/lib/auth-client"
import { useEffect, useState } from "react"



export default function DashboardPage() {
  const { data: session, isPending } = useSession()

  if (isPending) return <DashboardSkeleton />

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to access the dashboard.</p>
      </div>
    )
  }

  const role = session.user.role

  switch (role) {
    case "ADMIN":
      return <AdminDashboard user={session.user} />
    case "HR_OFFICER":
      return <HRDashboard user={session.user} />
    case "SECTION_HEAD":
    case "HEAD_OF_DEPARTMENT":
      return <SectionHeadDashboard user={session.user} />
    case "EMPLOYEE":
    default:
      return <EmployeeDashboard user={session.user} />
  }
}