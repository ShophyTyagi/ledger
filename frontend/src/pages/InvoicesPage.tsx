import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getInvoices, deleteInvoice } from '../api/invoices';
import { Invoice, InvoiceStatus } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface Filters {
  invoiceNumber: string;
  client: string;
  status: '' | InvoiceStatus;
  dueDate: string;
}

const EMPTY_FILTERS: Filters = { invoiceNumber: '', client: '', status: '', dueDate: '' };

export default function InvoicesPage() {
  const { format } = useCurrency();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const load = () => {
    setLoading(true);
    getInvoices()
      .then(setInvoices)
      .catch(() => setError('Failed to load invoices.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (filters.invoiceNumber && !inv.invoice_number.toLowerCase().includes(filters.invoiceNumber.toLowerCase())) return false;
      if (filters.client && !inv.client_name.toLowerCase().includes(filters.client.toLowerCase())) return false;
      if (filters.status && inv.status !== filters.status) return false;
      if (filters.dueDate && inv.due_date !== filters.dueDate) return false;
      return true;
    });
  }, [invoices, filters]);

  const isFiltering = Object.values(filters).some(Boolean);

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

        <div className="filter-bar">
          <input
            className="filter-input"
            type="text"
            placeholder="Invoice #"
            value={filters.invoiceNumber}
            onChange={(e) => setFilters((f) => ({ ...f, invoiceNumber: e.target.value }))}
          />
          <input
            className="filter-input"
            type="text"
            placeholder="Client"
            value={filters.client}
            onChange={(e) => setFilters((f) => ({ ...f, client: e.target.value }))}
          />
          <select
            className="filter-input"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as Filters['status'] }))}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
          </select>
          <input
            className="filter-input"
            type="date"
            value={filters.dueDate}
            onChange={(e) => setFilters((f) => ({ ...f, dueDate: e.target.value }))}
          />
          {isFiltering && (
            <button className="btn btn-secondary btn-sm" onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear
            </button>
          )}
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`skeleton skeleton-text animate-fade-in stagger-${i}`} style={{ height: '72px' }}></div>
            ))}
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            {isFiltering ? (
              <p>No invoices match your filters.</p>
            ) : (
              <>
                <p>No invoices yet.</p>
                <Link to="/invoices/new" className="btn btn-primary">Create your first invoice</Link>
              </>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <>
            {isFiltering && (
              <p className="filter-count">{filtered.length} of {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
            )}
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
                {filtered.map((inv, idx) => (
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
          </>
        )}
      </main>
    </Layout>
  );
}
