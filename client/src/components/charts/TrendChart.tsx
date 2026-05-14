import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type TrendChartProps = {
  data: Array<{ name: string; value: number }>
  title: string
  color: string
}

export function TrendChart({ data, title, color }: TrendChartProps) {
  return (
    <div className="glass-card rounded-3xl border border-slate-800 p-5 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <span className="text-xs uppercase tracking-[0.35em] text-slate-400">Live</span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.45} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: 16, borderColor: '#334155' }} />
            <Area type="monotone" dataKey="value" stroke={color} fill="url(#trendGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
