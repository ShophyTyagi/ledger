import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  const location = useLocation();

  return (
    <aside className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <Link to="/dashboard">Ledger</Link>
      </div>
      <div className="sidebar-links">
        <Link
          to="/dashboard"
          className={location.pathname === '/dashboard' ? 'active' : ''}
        >
          Dashboard
        </Link>
        <Link
          to="/invoices"
          className={location.pathname.startsWith('/invoices') ? 'active' : ''}
        >
          Invoices
        </Link>
        <Link
          to="/account"
          className={location.pathname === '/account' ? 'active' : ''}
        >
          Account
        </Link>
      </div>
    </aside>
  );
}
