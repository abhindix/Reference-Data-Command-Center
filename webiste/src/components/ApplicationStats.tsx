import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

type AppStats = {
  total: number
  approved: number
  rejected: number
  pending: number
  approval_rate: number
  by_product: Record<string, { total: number; approved: number; rejected: number; pending: number }>
  avg_credit_by_status: Record<string, number>
}

type LoanFee = {
  fee_type: string
  fee_amount: number | null
  fee_percentage: number | null
}

const STATUS_COLORS = { approved: '#0f7f7f', rejected: '#ef4444', pending: '#ffb703' }
const PIE_COLORS = ['#0f7f7f', '#ffb703', '#8b5cf6', '#ef4444', '#10b981', '#f97316']

const pct = (v: number) => `${(v * 100).toFixed(1)}%`

export function ApplicationStats({ fees }: { fees: LoanFee[] }) {
  const [stats, setStats] = useState<AppStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/applications/stats`)
      .then((r) => r.json())
      .then((d: AppStats) => setStats(d))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  // ── Fee pie data ───────────────────────────────────────────────
  const feePieData = fees
    .filter((f) => f.fee_amount !== null || f.fee_percentage !== null)
    .map((f, i) => ({
      name: f.fee_type.replaceAll('_', ' '),
      value: f.fee_amount ?? (f.fee_percentage ?? 0) * 10_000,
      index: i,
    }))

  // ── By-product bar data ────────────────────────────────────────
  const productBarData = stats
    ? Object.entries(stats.by_product).map(([pid, v]) => ({
        name: pid,
        Approved: v.approved,
        Rejected: v.rejected,
        Pending: v.pending,
      }))
    : []

  // ── Avg credit radial data ─────────────────────────────────────
  const creditRadial = stats
    ? Object.entries(stats.avg_credit_by_status).map(([status, score]) => ({
        name: status,
        score,
        fill: STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? '#888',
      }))
    : []

  if (loading) return <p className="muted" style={{ padding: '1rem' }}>Loading analytics…</p>
  if (!stats) return <p className="muted" style={{ padding: '1rem' }}>Could not load analytics.</p>

  return (
    <div className="analytics-grid">
      {/* ── KPI row ── */}
      <section className="panel analytics-kpis">
        <div className="panel-head"><h2>Application Analytics</h2><p>{stats.total} total applications</p></div>
        <div className="akpi-row">
          <div className="akpi">
            <p className="label">Approval Rate</p>
            <p className="value agreen">{pct(stats.approval_rate)}</p>
          </div>
          <div className="akpi">
            <p className="label">Approved</p>
            <p className="value agreen">{stats.approved}</p>
          </div>
          <div className="akpi">
            <p className="label">Rejected</p>
            <p className="value ared">{stats.rejected}</p>
          </div>
          <div className="akpi">
            <p className="label">Pending</p>
            <p className="value ayellow">{stats.pending}</p>
          </div>
        </div>
      </section>

      {/* ── Applications by product ── */}
      <section className="panel">
        <div className="panel-head"><h2>Applications by Product</h2><p>Approved / Rejected / Pending</p></div>
        <div style={{ marginTop: '0.8rem' }}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productBarData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Approved" stackId="a" fill="#0f7f7f" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Rejected" stackId="a" fill="#ef4444" />
              <Bar dataKey="Pending" stackId="a" fill="#ffb703" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Avg credit score by status ── */}
      <section className="panel">
        <div className="panel-head"><h2>Avg Credit Score</h2><p>By application status</p></div>
        <div style={{ marginTop: '0.8rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ResponsiveContainer width="50%" height={200}>
            <RadialBarChart
              innerRadius="30%"
              outerRadius="90%"
              data={creditRadial}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar dataKey="score" background={{ fill: '#f3f0ea' }} label={{ position: 'insideStart', fill: '#fff', fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v}`, 'Avg Credit Score']} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="credit-legend">
            {creditRadial.map((d) => (
              <div key={d.name} className="credit-legend-row">
                <span className="credit-dot" style={{ background: d.fill }} />
                <span style={{ textTransform: 'capitalize' }}>{d.name}</span>
                <strong>{d.score}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fee breakdown pie ── */}
      {feePieData.length > 0 && (
        <section className="panel">
          <div className="panel-head"><h2>Fee Breakdown</h2><p>Selected product fees</p></div>
          <div style={{ marginTop: '0.8rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={feePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {feePieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [name, '']} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="fee-legend">
              {feePieData.map((entry) => (
                <li key={entry.name} className="fee-legend-row">
                  <span className="fee-dot" style={{ background: PIE_COLORS[entry.index % PIE_COLORS.length] }} />
                  <span>{entry.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
