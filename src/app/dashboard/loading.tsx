export default function DashboardLoading() {
  return (
    <div className="grid gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03]"
        />
      ))}
    </div>
  );
}
