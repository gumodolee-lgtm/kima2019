'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  type PieLabelRenderProps,
} from 'recharts'

interface DailyView { day: string; views: number }
interface TopPage  { path: string; views: number }
interface DeviceStat { device_type: string; views: number }
interface CountryStat { country: string; views: number }

interface Props {
  daily: DailyView[]
  topPages: TopPage[]
  devices: DeviceStat[]
  countries: CountryStat[]
}

const COLORS = ['#1B3A6B', '#C8922A', '#2E7D32', '#6A1B9A', '#0277BD']

export function StatsCharts({ daily, topPages, devices, countries }: Props) {
  const deviceData = devices.map((d) => ({
    name: d.device_type === 'mobile' ? '모바일' : '데스크탑',
    value: Number(d.views),
  }))

  const dailyData = daily.map((d) => ({
    day: d.day.slice(5),  // MM-DD
    views: Number(d.views),
  }))

  return (
    <div className="space-y-8">
      {/* 일별 방문자 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">최근 7일 일별 방문</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip formatter={(v) => [`${v}회`, '방문']} />
            <Bar dataKey="views" fill="#1B3A6B" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 인기 페이지 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">인기 페이지 TOP 5 (30일)</h3>
          <div className="space-y-2">
            {topPages.length === 0 && (
              <p className="text-xs text-gray-400">데이터 없음</p>
            )}
            {topPages.map((p, i) => (
              <div key={p.path} className="flex items-center gap-3">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#1B3A6B] text-white text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 text-xs text-gray-700 truncate">{p.path}</span>
                <span className="text-xs font-semibold text-[#1B3A6B]">{Number(p.views).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 디바이스 비율 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">디바이스 비율 (30일)</h3>
          {deviceData.length === 0 ? (
            <p className="text-xs text-gray-400">데이터 없음</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }: PieLabelRenderProps) => `${name ?? ''} ${(((percent as number) ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {deviceData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 국가별 접속 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">국가별 접속 (30일)</h3>
        <div className="space-y-2">
          {countries.length === 0 && (
            <p className="text-xs text-gray-400">데이터 없음 (로컬 개발 환경에서는 Vercel 헤더가 없어 수집되지 않습니다)</p>
          )}
          {countries.map((c) => {
            const total = countries.reduce((s, x) => s + Number(x.views), 0)
            const pct = total > 0 ? Math.round((Number(c.views) / total) * 100) : 0
            return (
              <div key={c.country} className="flex items-center gap-3">
                <span className="w-8 text-xs font-medium text-gray-500 shrink-0">{c.country ?? '??'}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-[#C8922A] h-2 rounded-full"
                    style={{ '--bar-pct': `${pct}%`, width: 'var(--bar-pct)' } as React.CSSProperties}
                  />
                </div>
                <span className="text-xs text-gray-600 w-12 text-right">{Number(c.views).toLocaleString()}회</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
