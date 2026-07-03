export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Application shell is ready. Business logic will be added here.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {['Overview', 'Analytics', 'Settings'].map((section) => (
          <div key={section} className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h2 className="font-medium">{section}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Placeholder module</p>
          </div>
        ))}
      </div>
    </div>
  );
}
