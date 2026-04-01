import axios from 'axios';
import api from './axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

/** POST registration details; returns on success or throws on validation error. */
export async function register(username: string, password: string, confirmPassword: string): Promise<void> {
  await axios.post(
    `${BASE_URL}/auth/register/`,
    { username, password, confirm_password: confirmPassword },
  );
}

/** POST credentials; the server sets HttpOnly JWT cookies on success. */
export async function login(username: string, password: string): Promise<void> {
  await axios.post(
    `${BASE_URL}/auth/login/`,
    { username, password },
    { withCredentials: true },
  );
}

/**
 * Ask the server to blacklist the refresh cookie and clear both cookies.
 * Uses the shared `api` instance so the access cookie is sent automatically.
 */
export async function logoutApi(): Promise<void> {
  await api.post('/auth/logout/');
}

/**
 * Verify that the stored access cookie is still valid.
 * Throws if the user is not authenticated (401).
 */
export async function verifyAuth(): Promise<void> {
  await api.get('/auth/verify/');
}

/** Change the authenticated user's password. */
export async function changePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<void> {
  await api.post('/auth/account/password/', {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_new_password: confirmNewPassword,
  });
}

/** Permanently delete the authenticated user's account and all their data. */
export async function deleteAccount(password: string): Promise<void> {
  await api.post('/auth/account/delete/', { password });
}
