import { DashboardFooter } from "@/components/dashboard/dashboard-footer"

/*
 * Dashboard Layout
 * Wraps every /dashboard/** page.
 * Adding DashboardFooter here means Rohan Bondre's name, GitHub and LinkedIn
 * appear at the bottom of every dashboard page automatically.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {children}
      <DashboardFooter />
    </div>
  )
}
