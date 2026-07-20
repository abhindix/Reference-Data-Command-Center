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

const AdminDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  // Get pending applications only
  const pendingApps = useMemo(
    () => applications.filter((app) => app.status === 'pending').reverse(),
    [applications]
  );

  // Statistics
  const stats = useMemo(() => {
    return {
      pending: applications.filter((a) => a.status === 'pending').length,
      approved: applications.filter((a) => a.status === 'approved').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    };
  }, [applications]);

  const handleApprove = async () => {
    if (!selectedApp) return;
    await updateStatus(selectedApp.id, 'approved');
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    await updateStatus(selectedApp.id, 'rejected');
  };

  const updateStatus = async (appId: number, newStatus: 'approved' | 'rejected') => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_BASE}/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      const updatedApp = await res.json();

      // Update local state
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? updatedApp : app))
      );

      // Update selected app
      if (selectedApp?.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="admin-panel">Loading applications...</div>;
  if (error) return <div className="admin-panel error">{error}</div>;

  return (
    <div className="admin-panel">
      <h2>Admin Dashboard</h2>
      <p className="admin-subtitle">Review and manage pending loan applications</p>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat">
          <p className="label">Pending Review</p>
          <p className="value" style={{ color: '#ea580c' }}>
            {stats.pending}
          </p>
        </div>
        <div className="admin-stat">
          <p className="label">Approved</p>
          <p className="value" style={{ color: '#10b981' }}>
            {stats.approved}
          </p>
        </div>
        <div className="admin-stat">
          <p className="label">Rejected</p>
          <p className="value" style={{ color: '#dc2626' }}>
            {stats.rejected}
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="admin-grid">
        {/* Pending List */}
        <div className="admin-list">
          <h3>Pending Applications</h3>
          <div className="admin-list-items">
            {pendingApps.length === 0 ? (
              <p className="admin-empty">No pending applications</p>
            ) : (
              pendingApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  className={`admin-list-item ${selectedApp?.id === app.id ? 'active' : ''}`}
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="item-header">
                    <p className="item-name">{app.customer_name}</p>
                    <p className="item-id">{app.customer_id}</p>
                  </div>
                  <p className="item-details">
                    {app.product_id} • ${app.loan_amount.toLocaleString()}
                  </p>
                  <p className="item-date">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedApp && selectedApp.status === 'pending' && (
          <div className="admin-detail">
            <h3>Application Details</h3>

            <div className="detail-section">
              <h4>Customer Information</h4>
              <div className="detail-row">
                <span className="label">Name</span>
                <span className="value">{selectedApp.customer_name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Customer ID</span>
                <span className="value">{selectedApp.customer_id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Applied</span>
                <span className="value">
                  {new Date(selectedApp.applied_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Loan Details</h4>
              <div className="detail-row">
                <span className="label">Product</span>
                <span className="value">{selectedApp.product_id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Amount</span>
                <span className="value">
                  ${selectedApp.loan_amount.toLocaleString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Term</span>
                <span className="value">{selectedApp.term_months} months</span>
              </div>
              <div className="detail-row">
                <span className="label">Down Payment</span>
                <span className="value">
                  {(selectedApp.down_payment_pct * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h4>Financial Profile</h4>
              <div className="detail-row">
                <span className="label">Credit Score</span>
                <span className="value">{selectedApp.credit_score}</span>
              </div>
              <div className="detail-row">
                <span className="label">Annual Income</span>
                <span className="value">
                  ${selectedApp.annual_income.toLocaleString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">DTI Ratio</span>
                <span className="value">
                  {(selectedApp.dti_ratio * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="admin-actions">
              <button
                type="button"
                className="action-btn approve"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                ✓ Approve Application
              </button>
              <button
                type="button"
                className="action-btn reject"
                onClick={handleReject}
                disabled={actionLoading}
              >
                ✕ Reject Application
              </button>
            </div>

            {actionLoading && <p className="action-loading">Updating...</p>}
          </div>
        )}

        {selectedApp && selectedApp.status !== 'pending' && (
          <div className="admin-detail">
            <h3>Application Details</h3>
            <div className="detail-status">
              <p>This application has already been processed.</p>
              <p className="status-badge">
                Status: <strong>{selectedApp.status.toUpperCase()}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
