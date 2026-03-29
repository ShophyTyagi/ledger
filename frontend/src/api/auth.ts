import axios from 'axios';
import { AuthTokens } from '../types';

export async function login(username: string, password: string): Promise<AuthTokens> {
  const { data } = await axios.post<AuthTokens>(
    'http://localhost:8000/api/auth/login/',
    { username, password }
  );
  return data;
}
