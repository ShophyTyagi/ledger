import { createContext, useContext, useState, ReactNode } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

const NO_DECIMALS = ['JPY', 'KRW'];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency_code');
    return CURRENCIES.find((c) => c.code === saved) ?? CURRENCIES[0];
  });

  const setCurrency = (c: Currency) => {
    localStorage.setItem('currency_code', c.code);
    setCurrencyState(c);
  };

  const format = (amount: number) =>
    new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: NO_DECIMALS.includes(currency.code) ? 0 : 2,
    }).format(amount);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
