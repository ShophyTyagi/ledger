import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getDashboard } from '../api/dashboard';
import { DashboardData } from '../types';
import { useCurrency } from '../context/CurrencyContext';

export default function DashboardPage() {
  const { format } = useCurrency();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <main className="page-container">
        <h1 className="page-title">Dashboard</h1>

        {loading && (
          <div className="stats-grid">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`skeleton skeleton-card animate-fade-in stagger-${i}`}></div>
            ))}
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        {data && (
          <>
            <div className="stats-grid">
              <div className="stat-card stat-card--highlight animate-fade-in stagger-1">
                <div className="stat-label">Outstanding</div>
                <div className="stat-value">{format(Number(data.total_outstanding))}</div>
              </div>
              <div className="stat-card animate-fade-in stagger-2">
                <div className="stat-label">Total Paid</div>
                <div className="stat-value">{format(Number(data.total_paid))}</div>
              </div>
              <div className="stat-card animate-fade-in stagger-3">
                <div className="stat-label">Draft</div>
                <div className="stat-value">{data.counts.draft}</div>
              </div>
              <div className="stat-card animate-fade-in stagger-4">
                <div className="stat-label">Sent</div>
                <div className="stat-value">{data.counts.sent}</div>
              </div>
              <div className="stat-card animate-fade-in stagger-5">
                <div className="stat-label">Paid</div>
                <div className="stat-value">{data.counts.paid}</div>
              </div>
            </div>

            <div className="recent-invoices">
              <div className="section-header">
                <h2>Recent Invoices</h2>
                <Link to="/invoices" className="link">View all →</Link>
              </div>

              {data.recent_invoices.length === 0 ? (
                <div className="empty-state">
                  <p>No invoices yet.</p>
                  <Link to="/invoices/new" className="btn btn-primary">Create your first invoice</Link>
                </div>
              ) : (
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Client</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_invoices.map((inv, idx) => (
                      <tr key={inv.id} className="animate-fade-in" style={{ animationDelay: `${0.1 * idx}s`, opacity: 0 }}>
                        <td>
                          <Link to={`/invoices/${inv.id}/edit`}>{inv.invoice_number}</Link>
                        </td>
                        <td>{inv.client_name}</td>
                        <td>{format(Number(inv.total_amount))}</td>
                        <td>
                          <span className={`badge badge-${inv.status}`}>{inv.status}</span>
                        </td>
                        <td>{inv.due_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </Layout>
  );
}
