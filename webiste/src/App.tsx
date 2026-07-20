import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { EligibilityCalculator } from './components/EligibilityCalculator'
import { AmortizationChart } from './components/AmortizationChart'
import { ApplicationStats } from './components/ApplicationStats'
import { ApplicationForm } from './components/ApplicationForm'

type LoanProduct = {
  product_id: string
  name: string
  product_type: string
  term_months: number
  min_rate: number
  max_rate: number
  min_loan_amount: number
  max_loan_amount: number
  description: string
}

type LoanRate = {
  product_id: string
  current_rate: number
}

type LoanFee = {
  fee_type: string
  fee_amount: number | null
  fee_percentage: number | null
}

type LoanRequirement = {
  min_credit_score: number | null
  max_dti: number | null
  min_down_payment: number | null
}

type LoanTerm = {
  term_months: number
}

type LoanProductDetail = {
  product: LoanProduct
  rate: LoanRate | null
  available_terms: LoanTerm[]
  fees: LoanFee[]
  requirements: LoanRequirement | null
}

type AdminStats = {
  loan_products: number
  loan_rates: number
  loan_terms: number
  loan_fees: number
  loan_requirements: number
  total: number
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

const asPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return 'N/A'
  }
  return `${(value * 100).toFixed(2)}%`
}

const asCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function App() {
  const [products, setProducts] = useState<LoanProduct[]>([])
  const [rates, setRates] = useState<LoanRate[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [selectedDetail, setSelectedDetail] = useState<LoanProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminMessage, setAdminMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [termFilter, setTermFilter] = useState('all')
  const [maxRatePercent, setMaxRatePercent] = useState('all')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'eligibility' | 'amortization' | 'analytics' | 'apply'>('dashboard')

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [productsRes, statsRes, ratesRes] = await Promise.all([
        fetch(`${API_BASE}/loan-products`),
        fetch(`${API_BASE}/admin/stats`),
        fetch(`${API_BASE}/loan-rates`),
      ])

      if (!productsRes.ok || !statsRes.ok || !ratesRes.ok) {
        throw new Error('Could not load dashboard data from API.')
      }

      const productsData: LoanProduct[] = await productsRes.json()
      const statsData: { statistics: AdminStats } = await statsRes.json()
      const ratesData: LoanRate[] = await ratesRes.json()

      setProducts(productsData)
      setStats(statsData.statistics)
      setRates(ratesData)
      setSelectedProductId((previousId) => previousId || productsData[0]?.product_id || '')
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unexpected error loading dashboard.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDashboard()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadDashboard])

  const refreshReferenceData = async () => {
    try {
      setAdminLoading(true)
      setAdminMessage(null)

      const reloadRes = await fetch(`${API_BASE}/admin/load-loan-data`, {
        method: 'POST',
      })

      if (!reloadRes.ok) {
        throw new Error('Failed to reload reference data from admin endpoint.')
      }

      const reloadData: { message?: string } = await reloadRes.json()
      await loadDashboard()
      setAdminMessage(reloadData.message ?? 'Reference data reloaded successfully.')
    } catch (reloadError) {
      const message = reloadError instanceof Error ? reloadError.message : 'Admin action failed.'
      setAdminMessage(message)
    } finally {
      setAdminLoading(false)
    }
  }

  const productTypeOptions = useMemo(() => {
    return ['all', ...new Set(products.map((product) => product.product_type.toLowerCase()))]
  }, [products])

  const termOptions = useMemo(() => {
    const terms = [...new Set(products.map((product) => product.term_months))]
    terms.sort((a, b) => a - b)
    return terms
  }, [products])

  const ratesMap = useMemo(() => {
    return new Map(rates.map((rate) => [rate.product_id, rate.current_rate]))
  }, [rates])

  const filteredProducts = useMemo(() => {
    const ceiling = maxRatePercent === 'all' ? null : Number(maxRatePercent) / 100
    return products.filter((product) => {
      const query = searchQuery.trim().toLowerCase()
      const queryMatch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.product_id.toLowerCase().includes(query)

      const typeMatch = typeFilter === 'all' || product.product_type.toLowerCase() === typeFilter
      const termMatch = termFilter === 'all' || product.term_months === Number(termFilter)

      const currentRate = ratesMap.get(product.product_id)
      const rateMatch =
        ceiling === null || currentRate === undefined || currentRate <= ceiling

      return queryMatch && typeMatch && termMatch && rateMatch
    })
  }, [maxRatePercent, products, ratesMap, searchQuery, termFilter, typeFilter])

  const activeProductId = useMemo(() => {
    if (filteredProducts.length === 0) {
      return ''
    }

    if (filteredProducts.some((product) => product.product_id === selectedProductId)) {
      return selectedProductId
    }

    return filteredProducts[0].product_id
  }, [filteredProducts, selectedProductId])

  useEffect(() => {
    if (!activeProductId) {
      return
    }

    const loadDetails = async () => {
      try {
        setDetailLoading(true)

        const detailRes = await fetch(`${API_BASE}/loan-products/${activeProductId}`)
        if (!detailRes.ok) {
          throw new Error('Could not load selected loan details.')
        }

        const detailData: LoanProductDetail = await detailRes.json()
        setSelectedDetail(detailData)
      } catch {
        setSelectedDetail(null)
      } finally {
        setDetailLoading(false)
      }
    }

    void loadDetails()
  }, [activeProductId])

  const chartRows = useMemo(() => {
    const rows = filteredProducts
      .map((product) => ({
        name: product.name,
        productId: product.product_id,
        rate: ratesMap.get(product.product_id) ?? null,
      }))
      .filter((row) => row.rate !== null)

    const maxRate = rows.reduce((highest, row) => {
      return row.rate !== null && row.rate > highest ? row.rate : highest
    }, 0)

    return rows.map((row) => ({
      ...row,
      widthPct: maxRate > 0 && row.rate !== null ? (row.rate / maxRate) * 100 : 0,
    }))
  }, [filteredProducts, ratesMap])

  const exportCSV = useCallback(() => {
    const headers = ['product_id', 'name', 'type', 'term_months', 'min_rate_%', 'max_rate_%', 'min_amount', 'max_amount', 'current_rate_%']
    const rows = filteredProducts.map((p) => [
      p.product_id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.product_type,
      p.term_months,
      (p.min_rate * 100).toFixed(2),
      (p.max_rate * 100).toFixed(2),
      p.min_loan_amount,
      p.max_loan_amount,
      ratesMap.has(p.product_id) ? (((ratesMap.get(p.product_id) ?? 0) * 100).toFixed(2)) : '',
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `loan-products-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [filteredProducts, ratesMap])

  const mortgageCount = useMemo(
    () => products.filter((product) => product.product_type.toLowerCase() === 'mortgage').length,
    [products],
  )

  const autoCount = useMemo(
    () => products.filter((product) => product.product_type.toLowerCase() === 'auto').length,
    [products],
  )

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">Loan Reference Data Platform</p>
        <h1>Reference Data Command Center</h1>
        <p className="lead">
          Live dashboard for your FastAPI + PostgreSQL loan products, rates, terms, fees, and eligibility rules.
        </p>
      </header>

      {error && (
        <section className="alert" role="alert">
          <h2>API Connection Issue</h2>
          <p>{error}</p>
          <p>Make sure backend is running at http://localhost:8000.</p>
        </section>
      )}

      {/* ── Tab bar ── */}
      <nav className="tab-bar" aria-label="Main navigation">
        {(
          [
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'eligibility', label: 'Eligibility' },
            { key: 'amortization', label: 'Amortization' },
            { key: 'analytics', label: 'Analytics' },
            { key: 'apply', label: 'Apply Now' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-btn ${activeTab === tab.key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ══ DASHBOARD TAB ══════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <>
      <section className="kpis" aria-label="Overview statistics">
        <article className="kpi">
          <p className="label">Total Records</p>
          <p className="value">{stats?.total ?? '-'}</p>
        </article>
        <article className="kpi">
          <p className="label">Loan Products</p>
          <p className="value">{stats?.loan_products ?? '-'}</p>
        </article>
        <article className="kpi">
          <p className="label">Mortgage Products</p>
          <p className="value">{mortgageCount}</p>
        </article>
        <article className="kpi">
          <p className="label">Auto Products</p>
          <p className="value">{autoCount}</p>
        </article>
      </section>

      <section className="layout">
        <article className="panel list-panel">
          <div className="panel-head">
            <h2>Loan Catalog</h2>
            <div className="panel-head-right">
              <p className="count-label">{loading ? 'Loading...' : `${filteredProducts.length} shown`}</p>
              <button
                type="button"
                className="head-btn filter-toggle"
                onClick={() => setFilterDrawerOpen(true)}
                aria-label="Open filters"
              >
                ⚙ Filters
              </button>
              <button
                type="button"
                className="head-btn export-btn"
                onClick={exportCSV}
                disabled={filteredProducts.length === 0}
                aria-label="Export filtered list as CSV"
              >
                ↓ CSV
              </button>
            </div>
          </div>

          <div className="controls">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or ID"
              aria-label="Search loan products"
            />

            <div className="control-row">
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by product type">
                {productTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All types' : type}
                  </option>
                ))}
              </select>

              <select value={termFilter} onChange={(event) => setTermFilter(event.target.value)} aria-label="Filter by term months">
                <option value="all">All terms</option>
                {termOptions.map((term) => (
                  <option key={term} value={term}>
                    {term} months
                  </option>
                ))}
              </select>
            </div>

            <select
              value={maxRatePercent}
              onChange={(event) => setMaxRatePercent(event.target.value)}
              aria-label="Filter by maximum current rate"
            >
              <option value="all">All current rates</option>
              <option value="6">6% or below</option>
              <option value="8">8% or below</option>
              <option value="12">12% or below</option>
              <option value="20">20% or below</option>
            </select>

            <div className="admin-actions">
              <button type="button" onClick={() => void refreshReferenceData()} disabled={adminLoading}>
                {adminLoading ? 'Reloading...' : 'Reload Data'}
              </button>
              <button type="button" className="ghost" onClick={() => void loadDashboard()} disabled={loading}>
                Refresh View
              </button>
            </div>

            {adminMessage && <p className="admin-message">{adminMessage}</p>}
          </div>

          <div className="product-list" role="listbox" aria-label="Loan products">
            {filteredProducts.map((product) => (
              <button
                key={product.product_id}
                type="button"
                className={`product-chip ${activeProductId === product.product_id ? 'selected' : ''}`}
                onClick={() => setSelectedProductId(product.product_id)}
              >
                <span>{product.name}</span>
                <small>
                  {product.product_type.toUpperCase()} • {product.term_months} mo
                </small>
              </button>
            ))}

            {!loading && filteredProducts.length === 0 && <p className="muted">No products matched these filters.</p>}
          </div>
        </article>

        <article className="panel detail-panel">
          {detailLoading && <p className="muted">Loading product details...</p>}

          {!detailLoading && selectedDetail && (
            <>
              <div className="panel-head">
                <h2>{selectedDetail.product.name}</h2>
                <p>{selectedDetail.product.product_id}</p>
              </div>

              <p className="description">{selectedDetail.product.description}</p>

              <div className="detail-grid">
                <div>
                  <h3>Rate Band</h3>
                  <p>
                    {asPercent(selectedDetail.product.min_rate)} to {asPercent(selectedDetail.product.max_rate)}
                  </p>
                </div>
                <div>
                  <h3>Current Rate</h3>
                  <p>{asPercent(selectedDetail.rate?.current_rate)}</p>
                </div>
                <div>
                  <h3>Loan Amount</h3>
                  <p>
                    {asCurrency(selectedDetail.product.min_loan_amount)} to {asCurrency(selectedDetail.product.max_loan_amount)}
                  </p>
                </div>
                <div>
                  <h3>Min Credit Score</h3>
                  <p>{selectedDetail.requirements?.min_credit_score ?? 'N/A'}</p>
                </div>
              </div>

              <div className="subsection">
                <h3>Terms</h3>
                <div className="pill-row">
                  {selectedDetail.available_terms.map((term) => (
                    <span key={term.term_months} className="pill">
                      {term.term_months} months
                    </span>
                  ))}
                </div>
              </div>

              <div className="subsection">
                <h3>Fees</h3>
                <ul className="fees">
                  {selectedDetail.fees.map((fee) => (
                    <li key={fee.fee_type}>
                      <span>{fee.fee_type.replaceAll('_', ' ')}</span>
                      <strong>{fee.fee_amount ? asCurrency(fee.fee_amount) : asPercent(fee.fee_percentage)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {!detailLoading && !selectedDetail && <p className="muted">Select a product to view details.</p>}
        </article>
      </section>

      <section className="panel chart-panel">
        <div className="panel-head">
          <h2>Current Rate Comparison</h2>
          <p>Based on filtered results</p>
        </div>

        <div className="chart">
          {chartRows.map((row) => (
            <div key={row.productId} className="chart-row">
              <span className="chart-label">{row.productId}</span>
              <div className="bar-track" role="img" aria-label={`${row.productId} current rate ${asPercent(row.rate)}`}>
                <div className="bar-fill" style={{ width: `${row.widthPct}%` }}></div>
              </div>
              <strong className="chart-value">{asPercent(row.rate)}</strong>
            </div>
          ))}

          {chartRows.length === 0 && <p className="muted">No rate data available for current filter.</p>}
        </div>
      </section>
        </>
      )}

      {filterDrawerOpen && (
        <div className="drawer-backdrop" onClick={() => setFilterDrawerOpen(false)}>
          <div className="drawer" role="dialog" aria-modal="true" aria-label="Filter options" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h3>Filters</h3>
              <button type="button" className="drawer-close" onClick={() => setFilterDrawerOpen(false)} aria-label="Close filters">✕</button>
            </div>

            <div className="controls">
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name or ID"
                aria-label="Search loan products"
              />

              <div className="control-row">
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by product type">
                  {productTypeOptions.map((type) => (
                    <option key={type} value={type}>{type === 'all' ? 'All types' : type}</option>
                  ))}
                </select>

                <select value={termFilter} onChange={(event) => setTermFilter(event.target.value)} aria-label="Filter by term months">
                  <option value="all">All terms</option>
                  {termOptions.map((term) => (
                    <option key={term} value={term}>{term} months</option>
                  ))}
                </select>
              </div>

              <select
                value={maxRatePercent}
                onChange={(event) => setMaxRatePercent(event.target.value)}
                aria-label="Filter by maximum current rate"
              >
                <option value="all">All current rates</option>
                <option value="6">6% or below</option>
                <option value="8">8% or below</option>
                <option value="12">12% or below</option>
                <option value="20">20% or below</option>
              </select>
            </div>

            <button type="button" className="drawer-apply" onClick={() => setFilterDrawerOpen(false)}>
              Show {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* ══ ELIGIBILITY TAB ════════════════════════════════════════ */}
      {activeTab === 'eligibility' && <EligibilityCalculator />}

      {/* ══ AMORTIZATION TAB ═══════════════════════════════════════ */}
      {activeTab === 'amortization' && (
        <AmortizationChart
          defaultRate={selectedDetail?.rate?.current_rate ?? 0.065}
          defaultTerm={selectedDetail?.product.term_months ?? 360}
        />
      )}

      {/* ══ ANALYTICS TAB ══════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <ApplicationStats fees={selectedDetail?.fees ?? []} />
      )}

      {/* ══ APPLY NOW TAB ═════════════════════════════════════════ */}
      {activeTab === 'apply' && <ApplicationForm />}

      <footer className="footer">
        <p>API Base: {API_BASE}</p>
        <p>Built for your Loan Reference Data Platform stack.</p>
      </footer>
    </main>
  )
}

export default App
