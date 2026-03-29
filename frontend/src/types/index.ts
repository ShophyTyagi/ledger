export interface LineItem {
  description: string;
  amount: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid';

export interface Invoice {
  id: number;
  client_name: string;
  invoice_number: string;
  line_items: LineItem[];
  due_date: string;
  status: InvoiceStatus;
  created_at: string;
  total_amount: number;
}

export interface InvoiceFormData {
  client_name: string;
  invoice_number: string;
  line_items: LineItem[];
  due_date: string;
  status: InvoiceStatus;
}

export interface DashboardData {
  total_outstanding: number;
  total_paid: number;
  counts: {
    draft: number;
    sent: number;
    paid: number;
  };
  recent_invoices: Invoice[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
