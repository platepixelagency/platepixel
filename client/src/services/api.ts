const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || '/api').replace(/\/$/, '');

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

  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${formattedEndpoint}`;

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error('Backend server is offline or unreachable. Please ensure backend server is running.');
  }

  let data: any = {};
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }
  } else {
    try {
      const text = await response.text();
      data = { message: text.trim() };
    } catch (e) {
      data = {};
    }
  }

  if (!response.ok) {
    const errorMsg = data.error || data.message || `API Error (${response.status}: ${response.statusText || 'Server Error'})`;
    throw new Error(errorMsg);
  }

  return data as T;
}
