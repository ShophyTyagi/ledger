import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency, CURRENCIES } from '../context/CurrencyContext';

export default function Topbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { currency, setCurrency } = useCurrency();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button onClick={toggleSidebar} className="btn-toggle-sidebar" aria-label="Toggle Sidebar">
          ☰
        </button>
      </div>
      <div className="topbar-right">
        <select
          className="currency-select"
          value={currency.code}
          onChange={(e) => {
            const found = CURRENCIES.find((c) => c.code === e.target.value);
            if (found) setCurrency(found);
          }}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} {c.code}
            </option>
          ))}
        </select>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </div>
    </header>
  );
}
