import { Skeleton } from "@/components/ui/skeleton"

/*
 * Dashboard Loading State
 * Shown by Next.js while the dashboard page Server Component is streaming.
 * Mirrors the real layout: sidebar + main content grid.
 */
export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar skeleton */}
      <div className="hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center border-b px-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="ml-3 h-5 w-24" />
        </div>
        <div className="flex-1 space-y-2 p-3">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
        <div className="border-t p-3">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      {/* Main content skeleton */}
      <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Score cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <Skeleton className="h-6 w-36" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 space-y-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-2 w-full rounded-full" />
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
