import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { changePassword, deleteAccount } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../utils/errors';

export default function AccountPage() {
  // Change password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Delete account state
  const [deletePw, setDeletePw] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    try {
      await changePassword(currentPw, newPw, confirmNewPw);
      setPwSuccess('Password updated successfully.');
      setCurrentPw('');
      setNewPw('');
      setConfirmNewPw('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      setPwError(parseApiError(axiosErr?.response?.data));
    } finally {
      setPwLoading(false);
    }
  };

  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();
    if (deleteConfirm !== 'DELETE') {
      setDeleteError('Type DELETE in the confirmation field to proceed.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await deleteAccount(deletePw);
      await logout();
      navigate('/login', { state: { deleted: true } });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      setDeleteError(parseApiError(axiosErr?.response?.data));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Layout>
      <main className="page-container">
        <h1 className="page-title">Account</h1>

        <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

          {/* ── Change Password ── */}
          <section>
            <h2 style={{ marginBottom: '0.5rem' }}>Change Password</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted, #666)' }}>
              Choose a strong password you don't use anywhere else.
            </p>
            {pwError && <div className="alert alert-error">{pwError}</div>}
            {pwSuccess && <div className="alert alert-success">{pwSuccess}</div>}
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPw">Current Password</label>
                <input
                  id="currentPw"
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPw">New Password</label>
                <input
                  id="newPw"
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPw">Confirm New Password</label>
                <input
                  id="confirmNewPw"
                  type="password"
                  value={confirmNewPw}
                  onChange={(e) => setConfirmNewPw(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </section>

          {/* ── Delete Account ── */}
          <section>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--danger, #e53e3e)' }}>Delete Account</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted, #666)' }}>
              This permanently deletes your account and all your invoices. This cannot be undone.
            </p>
            {deleteError && <div className="alert alert-error">{deleteError}</div>}
            <form onSubmit={handleDelete}>
              <div className="form-group">
                <label htmlFor="deletePw">Current Password</label>
                <input
                  id="deletePw"
                  type="password"
                  value={deletePw}
                  onChange={(e) => setDeletePw(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deleteConfirm">Type DELETE to confirm</label>
                <input
                  id="deleteConfirm"
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  required
                />
              </div>
              <button type="submit" className="btn btn-danger" disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Delete My Account'}
              </button>
            </form>
          </section>

        </div>
      </main>
    </Layout>
  );
}
