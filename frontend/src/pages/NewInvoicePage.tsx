import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import InvoiceForm from '../components/InvoiceForm';
import { createInvoice } from '../api/invoices';
import { InvoiceFormData } from '../types';

export default function NewInvoicePage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: InvoiceFormData) => {
    await createInvoice(data);
    navigate('/invoices');
  };

  return (
    <Layout>
      <main className="page-container">
        <h1 className="page-title">New Invoice</h1>
        <InvoiceForm onSubmit={handleSubmit} submitLabel="Create Invoice" />
      </main>
    </Layout>
  );
}
