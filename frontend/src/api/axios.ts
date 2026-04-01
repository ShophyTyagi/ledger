import axios, { InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Send the HttpOnly JWT cookies automatically on every request.
  // The Authorization header is no longer used — tokens never touch JS.
  withCredentials: true,
});

// ── Refresh lock ──────────────────────────────────────────────────────────────
// If multiple requests 401 at the same time, only one refresh is issued.
// The rest wait in a queue and retry once the single refresh resolves.

let isRefreshing = false;
let waitQueue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = [];

function drainQueue(error: unknown) {
  waitQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  waitQueue = [];
}

// ── 401 interceptor ───────────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Don't attempt a refresh for auth endpoints — there's nothing to refresh.
    if (original.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another request is already refreshing — wait for it, then retry.
      return new Promise<void>((resolve, reject) => {
        waitQueue.push({ resolve, reject });
      }).then(() => api(original)).catch(() => Promise.reject(error));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // The refresh cookie is sent automatically via withCredentials.
      await axios.post(
        `${BASE_URL}/auth/refresh/`,
        {},
        { withCredentials: true },
      );
      isRefreshing = false;
      drainQueue(null);
      return api(original);
    } catch (refreshError) {
      isRefreshing = false;
      drainQueue(refreshError);
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
      return Promise.reject(refreshError);
    }
  },
);

export default api;
