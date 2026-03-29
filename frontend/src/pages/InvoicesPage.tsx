import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getInvoices, deleteInvoice } from '../api/invoices';
import { Invoice } from '../types';
import { useCurrency } from '../context/CurrencyContext';

export default function InvoicesPage() {
  const { format } = useCurrency();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getInvoices()
      .then(setInvoices)
      .catch(() => setError('Failed to load invoices.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: number, invoiceNumber: string) => {
    if (!confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`)) return;
    try {
      await deleteInvoice(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch {
      alert('Failed to delete invoice.');
    }
  };

  return (
    <Layout>
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">Invoices</h1>
          <Link to="/invoices/new" className="btn btn-primary">+ New Invoice</Link>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`skeleton skeleton-text animate-fade-in stagger-${i}`} style={{ height: '72px' }}></div>
            ))}
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && invoices.length === 0 && (
          <div className="empty-state">
            <p>No invoices yet.</p>
            <Link to="/invoices/new" className="btn btn-primary">Create your first invoice</Link>
          </div>
        )}

        {invoices.length > 0 && (
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, idx) => (
                <tr key={inv.id} className="animate-fade-in" style={{ animationDelay: `${0.1 * idx}s`, opacity: 0 }}>
                  <td>{inv.invoice_number}</td>
                  <td>{inv.client_name}</td>
                  <td>{format(Number(inv.total_amount))}</td>
                  <td>
                    <span className={`badge badge-${inv.status}`}>{inv.status}</span>
                  </td>
                  <td>{inv.due_date}</td>
                  <td className="actions-cell">
                    <Link to={`/invoices/${inv.id}/edit`} className="btn btn-sm btn-secondary">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(inv.id, inv.invoice_number)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </Layout>
  );
}
