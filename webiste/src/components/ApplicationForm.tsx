import { useState } from 'react'
import { exportApplicationPDF } from '../utils/pdfExport'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

type SubmitResponse = {
  id: string
  customer_id: string
  status: string
  product_id: string
  loan_amount: number
  message: string
  applied_at: string
}

export function ApplicationForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [productId, setProductId] = useState('MORTGAGE_30')
  const [loanAmount, setLoanAmount] = useState(300000)
  const [termMonths, setTermMonths] = useState(360)
  const [creditScore, setCreditScore] = useState(700)
  const [annualIncome, setAnnualIncome] = useState(120000)
  const [dtiRatio, setDtiRatio] = useState(0.35)
  const [downPaymentPct, setDownPaymentPct] = useState(0.20)
  const [submitting, setSubmitting] = useState(false)
  const [response, setResponse] = useState<SubmitResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const PRODUCTS = [
    { id: 'MORTGAGE_30', label: '30-Year Fixed Mortgage', term: 360 },
    { id: 'MORTGAGE_15', label: '15-Year Fixed Mortgage', term: 180 },
    { id: 'AUTO_NEW', label: 'New Auto Loan', term: 72 },
    { id: 'AUTO_USED', label: 'Used Auto Loan', term: 72 },
    { id: 'PERSONAL', label: 'Personal Loan', term: 84 },
    { id: 'HELOC', label: 'Home Equity Line of Credit', term: 120 },
  ]

  const handleProductChange = (pid: string) => {
    setProductId(pid)
    const prod = PRODUCTS.find((p) => p.id === pid)
    if (prod) setTermMonths(prod.term)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Customer name is required')
      return
    }

    setSubmitting(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch(`${API_BASE}/applications/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          email: email || null,
          product_id: productId,
          loan_amount: loanAmount,
          term_months: termMonths,
          credit_score: creditScore,
          annual_income: annualIncome,
          dti_ratio: dtiRatio,
          down_payment_pct: downPaymentPct,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Submission failed')
      }

      const data: SubmitResponse = await res.json()
      setResponse(data)
      setName('')
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="panel app-form-panel">
      <div className="panel-head">
        <h2>Submit Application</h2>
        <p>Apply for a loan product now</p>
      </div>

      <form onSubmit={handleSubmit} className="app-form">
        <div className="form-section">
          <h3>Your Information</h3>

          <label className="form-field">
            <span>Full Name *</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
          </label>
        </div>

        <div className="form-section">
          <h3>Loan Details</h3>

          <label className="form-field">
            <span>Product</span>
            <select value={productId} onChange={(e) => handleProductChange(e.target.value)}>
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Loan Amount</span>
            <div className="range-display">
              <input
                type="range"
                min={1000}
                max={1000000}
                step={5000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
              />
              <strong>${loanAmount.toLocaleString()}</strong>
            </div>
          </label>

          <label className="form-field">
            <span>Term: {termMonths} months</span>
            <input type="hidden" value={termMonths} />
          </label>
        </div>

        <div className="form-section">
          <h3>Financial Profile</h3>

          <label className="form-field">
            <span>Credit Score</span>
            <div className="range-display">
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

          <label className="form-field">
            <span>Annual Income</span>
            <div className="range-display">
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

          <label className="form-field">
            <span>Debt-to-Income Ratio</span>
            <div className="range-display">
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

          <label className="form-field">
            <span>Down Payment</span>
            <div className="range-display">
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
        </div>

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Application'}
        </button>

        {error && <div className="form-error">{error}</div>}

        {response && (
          <div className="form-success">
            <h4>✓ Application Submitted</h4>
            <p>
              <strong>Customer ID:</strong> {response.customer_id}
            </p>
            <p>
              <strong>Status:</strong> {response.status}
            </p>
            <p>
              <strong>Product:</strong> {response.product_id}
            </p>
            <p>
              <strong>Loan Amount:</strong> ${response.loan_amount.toLocaleString()}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>{response.message}</p>
            <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.3rem' }}>
              Applied: {new Date(response.applied_at).toLocaleString()}
            </p>
            <button
              type="button"
              className="export-btn"
              onClick={() =>
                exportApplicationPDF({
                  customer_id: response.customer_id,
                  status: response.status,
                  product: response.product_id,
                  loan_amount: response.loan_amount,
                  applied_at: response.applied_at,
                })
              }
              style={{ marginTop: '0.75rem' }}
            >
              📥 Export as PDF
            </button>
          </div>
        )}
      </form>
    </section>
  )
}
