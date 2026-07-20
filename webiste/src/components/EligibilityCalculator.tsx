import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

type EligibilityResult = {
  product_id: string
  name: string
  product_type: string
  eligible: boolean
  reasons: string[]
}

const TYPE_COLORS: Record<string, string> = {
  mortgage: '#0f7f7f',
  auto: '#ffb703',
  personal: '#8b5cf6',
  heloc: '#ef4444',
}

export function EligibilityCalculator() {
  const [creditScore, setCreditScore] = useState(700)
  const [annualIncome, setAnnualIncome] = useState(80000)
  const [dtiRatio, setDtiRatio] = useState(0.32)
  const [downPaymentPct, setDownPaymentPct] = useState(0.15)
  const [desiredAmount, setDesiredAmount] = useState(250000)
  const [results, setResults] = useState<EligibilityResult[] | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/applications/check-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credit_score: creditScore,
          annual_income: annualIncome,
          dti_ratio: dtiRatio,
          down_payment_pct: downPaymentPct,
          desired_amount: desiredAmount,
        }),
      })
      if (!res.ok) throw new Error('API error')
      setResults(await res.json())
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const eligible = results?.filter((r) => r.eligible) ?? []
  const ineligible = results?.filter((r) => !r.eligible) ?? []

  return (
    <section className="panel elig-panel">
      <div className="panel-head">
        <h2>Eligibility Calculator</h2>
        <p>Check which products a customer qualifies for</p>
      </div>

      <div className="elig-form">
        <label className="field">
          <span>Credit Score</span>
          <div className="range-row">
            <input
              type="range"
              min={300}
              max={850}
              value={creditScore}
              onChange={(e) => setCreditScore(Number(e.target.value))}
            />
            <strong>{creditScore}</strong>
          </div>
        </label>

        <label className="field">
          <span>Annual Income</span>
          <div className="range-row">
            <input
              type="range"
              min={20000}
              max={300000}
              step={5000}
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
            />
            <strong>${annualIncome.toLocaleString()}</strong>
          </div>
        </label>

        <label className="field">
          <span>Debt-to-Income Ratio</span>
          <div className="range-row">
            <input
              type="range"
              min={0.05}
              max={0.70}
              step={0.01}
              value={dtiRatio}
              onChange={(e) => setDtiRatio(Number(e.target.value))}
            />
            <strong>{(dtiRatio * 100).toFixed(0)}%</strong>
          </div>
        </label>

        <label className="field">
          <span>Down Payment</span>
          <div className="range-row">
            <input
              type="range"
              min={0}
              max={0.50}
              step={0.01}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
            />
            <strong>{(downPaymentPct * 100).toFixed(0)}%</strong>
          </div>
        </label>

        <label className="field">
          <span>Desired Loan Amount</span>
          <div className="range-row">
            <input
              type="range"
              min={1000}
              max={1000000}
              step={1000}
              value={desiredAmount}
              onChange={(e) => setDesiredAmount(Number(e.target.value))}
            />
            <strong>
              ${desiredAmount >= 1_000_000
                ? '1M'
                : desiredAmount >= 1_000
                ? `${(desiredAmount / 1000).toFixed(0)}k`
                : desiredAmount}
            </strong>
          </div>
        </label>

        <button type="button" className="check-btn" onClick={() => void handleCheck()} disabled={loading}>
          {loading ? 'Checking…' : 'Check Eligibility'}
        </button>
      </div>

      {results !== null && (
        <div className="elig-results">
          <div className="elig-summary">
            <span className="badge badge-green">{eligible.length} eligible</span>
            <span className="badge badge-red">{ineligible.length} not eligible</span>
          </div>

          <div className="elig-cards">
            {results.map((r) => (
              <div
                key={r.product_id}
                className={`elig-card ${r.eligible ? 'elig-ok' : 'elig-fail'}`}
                style={{ '--type-color': TYPE_COLORS[r.product_type] ?? '#888' } as React.CSSProperties}
              >
                <div className="elig-card-head">
                  <span className="elig-type-dot" />
                  <strong>{r.name}</strong>
                  <span className={`elig-badge ${r.eligible ? 'ok' : 'fail'}`}>
                    {r.eligible ? '✓ Eligible' : '✗ Ineligible'}
                  </span>
                </div>
                {r.reasons.length > 0 && (
                  <ul className="elig-reasons">
                    {r.reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
