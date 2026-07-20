import { useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { exportAmortizationPDF } from '../utils/pdfExport'

type Props = {
  defaultRate?: number
  defaultTerm?: number
}

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

export function AmortizationChart({ defaultRate = 0.065, defaultTerm = 360 }: Props) {
  const [principal, setPrincipal] = useState(300000)
  const [annualRate, setAnnualRate] = useState(defaultRate)
  const [termMonths, setTermMonths] = useState(defaultTerm)

  const { monthly, schedule, totalInterest, totalCost } = useMemo(() => {
    const r = annualRate / 12
    const n = termMonths
    if (r === 0) {
      const m = principal / n
      return {
        monthly: m,
        schedule: Array.from({ length: Math.ceil(n / 12) }, (_, yi) => ({
          year: yi + 1,
          principal: m * 12,
          interest: 0,
          balance: Math.max(0, principal - m * 12 * (yi + 1)),
        })),
        totalInterest: 0,
        totalCost: principal,
      }
    }

    const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    let balance = principal
    const yearly: { year: number; principal: number; interest: number; balance: number }[] = []
    let yearPrincipal = 0
    let yearInterest = 0

    for (let month = 1; month <= n; month++) {
      const interest = balance * r
      const princ = monthly - interest
      balance = Math.max(0, balance - princ)
      yearPrincipal += princ
      yearInterest += interest

      if (month % 12 === 0 || month === n) {
        yearly.push({
          year: Math.ceil(month / 12),
          principal: Math.round(yearPrincipal),
          interest: Math.round(yearInterest),
          balance: Math.round(balance),
        })
        yearPrincipal = 0
        yearInterest = 0
      }
    }

    const totalInterest = yearly.reduce((s, r) => s + r.interest, 0)
    return { monthly, schedule: yearly, totalInterest, totalCost: principal + totalInterest }
  }, [principal, annualRate, termMonths])

  return (
    <section className="panel amort-panel">
      <div className="panel-head">
        <div>
          <h2>Amortization Calculator</h2>
          <p>Principal vs. interest breakdown year-by-year</p>
        </div>
        <button
          type="button"
          className="export-btn"
          onClick={() => exportAmortizationPDF(schedule, principal, annualRate * 100, termMonths, monthly)}
          title="Download amortization schedule as PDF"
        >
          📥 Export PDF
        </button>
      </div>

      <div className="amort-controls">
        <label className="field">
          <span>Loan Amount</span>
          <div className="range-row">
            <input
              type="range"
              min={10000}
              max={1000000}
              step={5000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
            />
            <strong>{fmt(principal)}</strong>
          </div>
        </label>

        <label className="field">
          <span>Annual Rate</span>
          <div className="range-row">
            <input
              type="range"
              min={0.01}
              max={0.30}
              step={0.001}
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
            />
            <strong>{(annualRate * 100).toFixed(2)}%</strong>
          </div>
        </label>

        <label className="field">
          <span>Term</span>
          <div className="range-row">
            <select
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              aria-label="Select loan term"
            >
              <option value={60}>5 years (60 mo)</option>
              <option value={84}>7 years (84 mo)</option>
              <option value={120}>10 years (120 mo)</option>
              <option value={180}>15 years (180 mo)</option>
              <option value={240}>20 years (240 mo)</option>
              <option value={360}>30 years (360 mo)</option>
            </select>
          </div>
        </label>
      </div>

      <div className="amort-summary">
        <div className="amort-stat">
          <p className="label">Monthly Payment</p>
          <p className="value">{fmt(monthly)}</p>
        </div>
        <div className="amort-stat">
          <p className="label">Total Interest</p>
          <p className="value interest">{fmt(totalInterest)}</p>
        </div>
        <div className="amort-stat">
          <p className="label">Total Cost</p>
          <p className="value">{fmt(totalCost)}</p>
        </div>
        <div className="amort-stat">
          <p className="label">Interest Share</p>
          <p className="value interest">{((totalInterest / totalCost) * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="amort-chart">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={schedule} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPrincipal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f7f7f" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#0f7f7f" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="gradInterest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffb703" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#ffb703" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" />
            <XAxis dataKey="year" tickFormatter={(v: number) => `Yr ${v}`} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={60} />
            <Tooltip
              formatter={(value: number, name: string) => [fmt(value), name === 'principal' ? 'Principal' : 'Interest']}
              labelFormatter={(label: number) => `Year ${label}`}
            />
            <Legend formatter={(value: string) => (value === 'principal' ? 'Principal' : 'Interest')} />
            <Area type="monotone" dataKey="principal" stackId="1" stroke="#0f7f7f" fill="url(#gradPrincipal)" />
            <Area type="monotone" dataKey="interest" stackId="1" stroke="#ffb703" fill="url(#gradInterest)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
