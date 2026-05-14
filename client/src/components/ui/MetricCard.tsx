type MetricCardProps = {
  title: string
  value: string
  delta: string
}

export function MetricCard({ title, value, delta }: MetricCardProps) {
  return (
    <div className="glass-card rounded-3xl p-5 shadow-panel border border-slate-800">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{title}</p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{delta} vs last period</p>
    </div>
  )
}
