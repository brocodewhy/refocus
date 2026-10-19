export default function DashboardLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="space-y-3">
        <div className="dashboard-skeleton w-32" />
        <div className="dashboard-skeleton h-9 w-72 max-w-full" />
        <div className="dashboard-skeleton h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <div className="dashboard-skeleton min-h-64" />
        <div className="dashboard-skeleton min-h-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div className="dashboard-skeleton min-h-28" key={index} />)}
      </div>
      <span className="sr-only">Loading dashboard data</span>
    </div>
  );
}