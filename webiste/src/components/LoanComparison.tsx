import React, { useState, useEffect } from 'react'
import { exportElementToPDF } from '../utils/pdfExport';

interface LoanProduct {
  id: number;
  name: string;
  product_type: string;
  min_loan_amount: number;
  max_loan_amount: number;
  description: string;
}

interface LoanRate {
  id: number;
  product_id: number;
  rate_percentage: number;
  rate_type: string;
  effective_date: string;
}

interface LoanTerm {
  id: number;
  product_id: number;
  term_months: number;
}

interface LoanFee {
  id: number;
  product_id: number;
  fee_name: string;
  fee_type: string;
  fee_amount: number;
}

interface ComparisonProduct {
  product: LoanProduct;
  rate: LoanRate | null;
  terms: LoanTerm[];
  fees: LoanFee[];
}

const LoanComparison: React.FC = () => {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [rates, setRates] = useState<LoanRate[]>([]);
  const [terms, setTerms] = useState<LoanTerm[]>([]);
  const [fees, setFees] = useState<LoanFee[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');  const tableRef = React.useRef<HTMLDivElement>(null)
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, rateRes, termRes, feeRes] = await Promise.all([
          fetch(`${API_BASE}/loan-products`),
          fetch(`${API_BASE}/loan-rates`),
          fetch(`${API_BASE}/loan-terms`),
          fetch(`${API_BASE}/loan-fees`),
        ]);

        if (!prodRes.ok || !rateRes.ok || !termRes.ok || !feeRes.ok) {
          throw new Error('Failed to fetch comparison data');
        }

        const prods: LoanProduct[] = await prodRes.json();
        const rts: LoanRate[] = await rateRes.json();
        const trms: LoanTerm[] = await termRes.json();
        const fes: LoanFee[] = await feeRes.json();

        setProducts(prods);
        setRates(rts);
        setTerms(trms);
        setFees(fes);

        // Pre-select first 2 products
        if (prods.length >= 2) {
          setSelectedIds([prods[0].id, prods[1].id]);
        } else if (prods.length === 1) {
          setSelectedIds([prods[0].id]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE]);

  const toggleProduct = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const getComparisonData = (): ComparisonProduct[] => {
    return selectedIds
      .map((id) => {
        const product = products.find((p) => p.id === id);
        if (!product) return null;

        const rate = rates.find((r) => r.product_id === id);
        const productTerms = terms.filter((t) => t.product_id === id);
        const productFees = fees.filter((f) => f.product_id === id);

        return { product, rate, terms: productTerms, fees: productFees };
      })
      .filter(Boolean) as ComparisonProduct[];
  };

  const calculateMonthlyPayment = (
    loanAmount: number,
    annualRate: number,
    months: number
  ): number => {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return loanAmount / months;
    return (
      (loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, months))) /
      (Math.pow(1 + monthlyRate, months) - 1)
    );
  };

  const getTotalFees = (productFees: LoanFee[]): number => {
    return productFees.reduce((sum, f) => sum + (f.fee_amount || 0), 0);
  };

  const comparisonData = getComparisonData();

  if (loading) return <div className="comp-panel">Loading comparison data...</div>;
  if (error) return <div className="comp-panel error">{error}</div>;

  return (
    <div className="comp-panel">
      <h2>Loan Comparison Tool</h2>

      {/* Product Selection */}
      <div className="comp-selector">
        <h3>Select Products to Compare:</h3>
        <div className="comp-checkboxes">
          {products.map((product) => (
            <label key={product.id} className="comp-checkbox">
              <input
                type="checkbox"
                checked={selectedIds.includes(product.id)}
                onChange={() => toggleProduct(product.id)}
              />
              <span>{product.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {comparisonData.length > 0 && (
        <>
          <div className="comp-export-btn-wrapper">
            <button
              type="button"
              className="export-btn"
              onClick={() => {
                if (tableRef.current) {
                  exportElementToPDF(tableRef.current, {
                    filename: `loan-comparison-${new Date().toISOString().slice(0, 10)}.pdf`,
                    title: 'Loan Product Comparison',
                  });
                }
              }}
            >
              📥 Export Comparison as PDF
            </button>
          </div>
          <div className="comp-table-wrapper" ref={tableRef}>
          <table className="comp-table">
            <thead>
              <tr>
                <th>Metric</th>
                {comparisonData.map((item) => (
                  <th key={item.product.id}>{item.product.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Interest Rate */}
              <tr>
                <td className="metric-label">Interest Rate (APR)</td>
                {comparisonData.map((item) => (
                  <td key={item.product.id} className="metric-value">
                    {item.rate ? `${item.rate.rate_percentage.toFixed(2)}%` : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Loan Range */}
              <tr>
                <td className="metric-label">Loan Amount Range</td>
                {comparisonData.map((item) => (
                  <td key={item.product.id} className="metric-value">
                    ${(item.product.min_loan_amount / 1000).toFixed(0)}k -{' '}
                    ${(item.product.max_loan_amount / 1000).toFixed(0)}k
                  </td>
                ))}
              </tr>

              {/* Available Terms */}
              <tr>
                <td className="metric-label">Available Terms (months)</td>
                {comparisonData.map((item) => (
                  <td key={item.product.id} className="metric-value">
                    {item.terms.length > 0
                      ? item.terms.map((t) => t.term_months).join(', ')
                      : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Monthly Payment (for $300k, standard term) */}
              <tr>
                <td className="metric-label">
                  Monthly Payment
                  <span className="metric-note">($300k, standard term)</span>
                </td>
                {comparisonData.map((item) => {
                  const loanAmount = 300000;
                  const rate = item.rate?.rate_percentage || 0;
                  const defaultTerm = item.terms[0]?.term_months || 360;
                  const payment = calculateMonthlyPayment(
                    loanAmount,
                    rate,
                    defaultTerm
                  );
                  return (
                    <td key={item.product.id} className="metric-value">
                      ${payment.toFixed(2)}
                    </td>
                  );
                })}
              </tr>

              {/* Total Fees */}
              <tr>
                <td className="metric-label">Typical Fees</td>
                {comparisonData.map((item) => {
                  const totalFees = getTotalFees(item.fees);
                  return (
                    <td key={item.product.id} className="metric-value">
                      {item.fees.length > 0 ? `$${totalFees.toFixed(2)}` : 'None'}
                    </td>
                  );
                })}
              </tr>

              {/* Fee Breakdown */}
              {comparisonData.some((item) => item.fees.length > 0) && (
                <tr>
                  <td className="metric-label">Fee Breakdown</td>
                  {comparisonData.map((item) => (
                    <td key={item.product.id} className="metric-value fee-breakdown">
                      {item.fees.length > 0 ? (
                        <ul>
                          {item.fees.map((fee) => (
                            <li key={fee.id}>
                              {fee.fee_name}: ${fee.fee_amount.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        'No fees'
                      )}
                    </td>
                  ))}
                </tr>
              )}

              {/* Product Type */}
              <tr>
                <td className="metric-label">Product Type</td>
                {comparisonData.map((item) => (
                  <td key={item.product.id} className="metric-value">
                    <span className="product-type-badge">
                      {item.product.product_type}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        </>
      )}

      {selectedIds.length === 0 && (
        <div className="comp-empty">Select at least one product to compare</div>
      )}
    </div>
  );
};

export default LoanComparison;
