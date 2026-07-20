import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const InterestRateHistory: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['MORTGAGE_30', 'AUTO_NEW']);

  // Generate historical data (mock)
  const historicalData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return months.map((month, idx) => {
      const baseRate = 6.5;
      const cycle = Math.sin(idx / 12 * Math.PI * 2) * 0.5;
      const trend = idx * 0.02;

      return {
        month,
        MORTGAGE_30: parseFloat((baseRate + cycle + trend).toFixed(2)),
        MORTGAGE_15: parseFloat((baseRate + 0.2 + cycle + trend).toFixed(2)),
        AUTO_NEW: parseFloat((5.2 + cycle + trend - 0.3).toFixed(2)),
        AUTO_USED: parseFloat((6.8 + cycle + trend - 0.2).toFixed(2)),
        PERSONAL: parseFloat((9.5 + cycle + trend - 0.4).toFixed(2)),
        HELOC: parseFloat((7.8 + cycle + trend - 0.1).toFixed(2)),
      };
    });
  }, []);

  const allProducts = ['MORTGAGE_30', 'MORTGAGE_15', 'AUTO_NEW', 'AUTO_USED', 'PERSONAL', 'HELOC'];
  const productNames: Record<string, string> = {
    MORTGAGE_30: '30-Yr Mortgage',
    MORTGAGE_15: '15-Yr Mortgage',
    AUTO_NEW: 'New Auto',
    AUTO_USED: 'Used Auto',
    PERSONAL: 'Personal',
    HELOC: 'HELOC',
  };

  const colors = {
    MORTGAGE_30: '#0f7f7f',
    MORTGAGE_15: '#06b6d4',
    AUTO_NEW: '#ffb703',
    AUTO_USED: '#fb923c',
    PERSONAL: '#8b5cf6',
    HELOC: '#ec4899',
  };

  const toggleProduct = (product: string) => {
    setSelectedProducts((prev) =>
      prev.includes(product)
        ? prev.filter((p) => p !== product)
        : [...prev, product]
    );
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const result: Record<string, { current: number; min: number; max: number; change: number }> = {};

    selectedProducts.forEach((product) => {
      const rates = historicalData.map((d) => d[product as keyof typeof d] as number);
      const current = rates[rates.length - 1];
      const previous = rates[0];
      const min = Math.min(...rates);
      const max = Math.max(...rates);
      const change = current - previous;

      result[product] = { current, min, max, change };
    });

    return result;
  }, [selectedProducts, historicalData]);

  return (
    <section className="panel rate-history-panel">
      <div className="panel-head">
        <div>
          <h2>Interest Rate History</h2>
          <p>12-month trends and forecasts</p>
        </div>
      </div>

      {/* Product Selection */}
      <div className="rate-selector">
        <h3>Track Products:</h3>
        <div className="rate-checkboxes">
          {allProducts.map((product) => (
            <label key={product} className="rate-checkbox">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product)}
                onChange={() => toggleProduct(product)}
              />
              <span
                style={{
                  color: colors[product as keyof typeof colors],
                  fontWeight: '600',
                }}
              >
                {productNames[product]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Statistics */}
      {selectedProducts.length > 0 && (
        <div className="rate-stats">
          {selectedProducts.map((product) => {
            const stat = stats[product];
            return (
              <div key={product} className="rate-stat">
                <p className="label">{productNames[product]}</p>
                <p className="current" style={{ color: colors[product as keyof typeof colors] }}>
                  {stat.current.toFixed(2)}%
                </p>
                <p className="detail">
                  Range: {stat.min.toFixed(2)}% - {stat.max.toFixed(2)}%
                </p>
                <p className={`change ${stat.change >= 0 ? 'up' : 'down'}`}>
                  {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change).toFixed(2)}%
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart */}
      {selectedProducts.length > 0 && (
        <div className="rate-chart">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicalData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <defs>
                {selectedProducts.map((product) => (
                  <linearGradient
                    key={`grad-${product}`}
                    id={`grad-${product}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={colors[product as keyof typeof colors]}
                      stopOpacity={0.7}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors[product as keyof typeof colors]}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fontSize: 11 }}
                width={50}
              />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(2)}%`}
                contentStyle={{
                  background: '#fff',
                  border: `1px solid var(--line)`,
                  borderRadius: '8px',
                }}
              />
              <Legend
                formatter={(value: string) => productNames[value] || value}
                wrapperStyle={{ paddingTop: '1rem' }}
              />
              {selectedProducts.map((product) => (
                <Line
                  key={product}
                  type="monotone"
                  dataKey={product}
                  stroke={colors[product as keyof typeof colors]}
                  strokeWidth={2.5}
                  dot={{ fill: colors[product as keyof typeof colors], r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedProducts.length === 0 && (
        <div className="rate-empty">Select at least one product to view trends</div>
      )}

      {/* Footer Note */}
      <p className="rate-note">
        📊 <strong>Note:</strong> Historical data shown for demonstration purposes.
        Actual rates vary by lender and market conditions.
      </p>
    </section>
  );
};

export default InterestRateHistory;
