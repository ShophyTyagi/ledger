import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceFormData, LineItem, InvoiceStatus } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { parseApiError } from '../utils/errors';

interface InvoiceFormProps {
  initialData?: InvoiceFormData;
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  submitLabel: string;
}

const emptyItem = (): LineItem => ({ description: '', amount: 0 });

export default function InvoiceForm({ initialData, onSubmit, submitLabel }: InvoiceFormProps) {
  const navigate = useNavigate();
  const { currency, format } = useCurrency();
  const [clientName, setClientName] = useState(initialData?.client_name ?? '');
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoice_number ?? '');
  const [dueDate, setDueDate] = useState(initialData?.due_date ?? '');
  const [status, setStatus] = useState<InvoiceStatus>(initialData?.status ?? 'draft');
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.line_items && initialData.line_items.length > 0
      ? initialData.line_items
      : [emptyItem()]
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: field === 'amount' ? Number(value) : value,
      };
      return next;
    });
  };

  const addItem = () => setLineItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !invoiceNumber.trim() || !dueDate) {
      setError('Please fill in all required fields.');
      return;
    }
    if (lineItems.length === 0) {
      setError('At least one line item is required.');
      return;
    }
    for (const item of lineItems) {
      if (!item.description.trim()) {
        setError('All line items must have a description.');
        return;
      }
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit({
        client_name: clientName,
        invoice_number: invoiceNumber,
        line_items: lineItems,
        due_date: dueDate,
        status,
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: unknown } };
      setError(parseApiError(axiosErr?.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="invoice-form">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label>Client Name *</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Acme Corp"
          />
        </div>
        <div className="form-group">
          <label>Invoice Number *</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="INV-001"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Due Date *</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)}>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="line-items-section">
        <h3>Line Items</h3>
        <div className="line-items-header">
          <span>Description</span>
          <span>Amount ({currency.symbol})</span>
          <span></span>
        </div>
        {lineItems.map((item, i) => (
          <div key={i} className="line-item-row">
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(i, 'description', e.target.value)}
              placeholder="Service or product description"
            />
            <input
              type="number"
              value={item.amount === 0 ? '' : item.amount}
              onChange={(e) => updateItem(i, 'amount', e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="btn-remove"
              disabled={lineItems.length === 1}
              title="Remove item"
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="btn-add-item">
          + Add Line Item
        </button>
        <div className="invoice-total">
          Total: <strong>{format(total)}</strong>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
