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

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error('Backend server is offline or unreachable (port 5000). Please ensure backend server is running.');
  }

  let data: any = {};
  try {
    data = await response.json();
  } catch (e) {
    // Non-JSON response fallback
  }

  if (!response.ok) {
    const errorMsg = data.error || data.message || `API Error (${response.status}: ${response.statusText || 'Server Error'})`;
    throw new Error(errorMsg);
  }

  return data as T;
}
