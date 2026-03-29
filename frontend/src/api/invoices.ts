import api from './axios';
import { Invoice, InvoiceFormData } from '../types';

export async function getInvoices(): Promise<Invoice[]> {
  const { data } = await api.get<Invoice[]>('/invoices/');
  return data;
}

export async function getInvoice(id: number): Promise<Invoice> {
  const { data } = await api.get<Invoice>(`/invoices/${id}/`);
  return data;
}

export async function createInvoice(payload: InvoiceFormData): Promise<Invoice> {
  const { data } = await api.post<Invoice>('/invoices/', payload);
  return data;
}

export async function updateInvoice(id: number, payload: InvoiceFormData): Promise<Invoice> {
  const { data } = await api.put<Invoice>(`/invoices/${id}/`, payload);
  return data;
}

export async function deleteInvoice(id: number): Promise<void> {
  await api.delete(`/invoices/${id}/`);
}
