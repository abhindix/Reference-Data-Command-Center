import React, { useState, useEffect, useMemo } from 'react';

interface Application {
  id: number;
  customer_id: string;
  customer_name: string;
  product_id: string;
  loan_amount: number;
  term_months: number;
  credit_score: number;
  annual_income: number;
  dti_ratio: number;
  down_payment_pct: number;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
}

type SortField = 'applied_at' | 'customer_name' | 'loan_amount' | 'credit_score' | 'status';

const ApplicationTracking: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sortField, setSortField] = useState<SortField>('applied_at');
  const [sortAsc, setSortAsc] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/applications`);
        if (!res.ok) throw new Error('Failed to fetch applications');
        const data: Application[] = await res.json();
        setApplications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [API_BASE]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((app) => app.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.customer_id.toLowerCase().includes(query) ||
          app.customer_name.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Handle dates
      if (sortField === 'applied_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [applications, statusFilter, searchQuery, sortField, sortAsc]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === 'pending').length,
      approved: applications.filter((a) => a.status === 'approved').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
      avgCreditScore: Math.round(
        applications.reduce((sum, a) => sum + a.credit_score, 0) / Math.max(applications.length, 1)
      ),
      totalLoanAmount: applications.reduce((sum, a) => sum + a.loan_amount, 0),
    };
  }, [applications]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  if (loading) return <div className="track-panel">Loading applications...</div>;
  if (error) return <div className="track-panel error">{error}</div>;

  return (
    <div className="track-panel">
      <h2>Application Tracking</h2>

      {/* Statistics Row */}
      <div className="track-stats">
        <div className="track-stat">
          <p className="label">Total Applications</p>
          <p className="value">{stats.total}</p>
        </div>
        <div className="track-stat">
          <p className="label">Pending</p>
          <p className="value" style={{ color: '#ea580c' }}>
            {stats.pending}
          </p>
        </div>
        <div className="track-stat">
          <p className="label">Approved</p>
          <p className="value" style={{ color: '#10b981' }}>
            {stats.approved}
          </p>
        </div>
        <div className="track-stat">
          <p className="label">Rejected</p>
          <p className="value" style={{ color: '#dc2626' }}>
            {stats.rejected}
          </p>
        </div>
        <div className="track-stat">
          <p className="label">Avg Credit Score</p>
          <p className="value">{stats.avgCreditScore}</p>
        </div>
        <div className="track-stat">
          <p className="label">Total Loan Amount</p>
          <p className="value">${(stats.totalLoanAmount / 1000000).toFixed(1)}M</p>
        </div>
      </div>

      {/* Filters */}
      <div className="track-filters">
        <input
          type="search"
          placeholder="Search by Customer ID or Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="track-search"
        />
        <div className="track-filter-buttons">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              type="button"
              className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="track-table-wrapper">
        <table className="track-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('applied_at')} className="sortable">
                Date Applied {sortField === 'applied_at' && (sortAsc ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleSort('customer_name')} className="sortable">
                Name {sortField === 'customer_name' && (sortAsc ? '↑' : '↓')}
              </th>
              <th>Customer ID</th>
              <th>Product</th>
              <th onClick={() => toggleSort('loan_amount')} className="sortable">
                Loan Amount {sortField === 'loan_amount' && (sortAsc ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleSort('credit_score')} className="sortable">
                Credit Score {sortField === 'credit_score' && (sortAsc ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleSort('status')} className="sortable">
                Status {sortField === 'status' && (sortAsc ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app) => (
              <tr key={app.id}>
                <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                <td className="app-name">{app.customer_name}</td>
                <td className="app-id">{app.customer_id}</td>
                <td className="app-product">{app.product_id}</td>
                <td>${app.loan_amount.toLocaleString()}</td>
                <td>{app.credit_score}</td>
                <td>
                  <span
                    className={`status-badge status-${app.status}`}
                  >
                    {app.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredApplications.length === 0 && (
          <div className="track-empty">No applications match your filters</div>
        )}
      </div>

      <div className="track-footer">
        Showing {filteredApplications.length} of {applications.length} applications
      </div>
    </div>
  );
};

export default ApplicationTracking;
