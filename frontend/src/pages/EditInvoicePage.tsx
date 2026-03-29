import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import InvoiceForm from '../components/InvoiceForm';
import { getInvoice, updateInvoice } from '../api/invoices';
import { Invoice, InvoiceFormData } from '../types';

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getInvoice(Number(id))
      .then(setInvoice)
      .catch(() => setError('Failed to load invoice.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: InvoiceFormData) => {
    if (!id) return;
    await updateInvoice(Number(id), data);
    navigate('/invoices');
  };

  return (
    <Layout>
      <main className="page-container">
        <h1 className="page-title">Edit Invoice</h1>
        {loading && <p className="loading">Loading...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {invoice && (
          <InvoiceForm
            initialData={{
              client_name: invoice.client_name,
              invoice_number: invoice.invoice_number,
              line_items: invoice.line_items,
              due_date: invoice.due_date,
              status: invoice.status,
            }}
            onSubmit={handleSubmit}
            submitLabel="Update Invoice"
          />
        )}
      </main>
    </Layout>
  );
}
