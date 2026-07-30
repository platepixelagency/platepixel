const API_BASE_URL = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('platepixel_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('platepixel_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('platepixel_token');
};

export async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API Request failed');
  }

  return data as T;
}
