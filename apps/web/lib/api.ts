const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Fetch wrapper that automatically includes auth token and handles 401 redirects.
 * Use this for all authenticated API calls.
 */
export async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Handle expired/invalid token
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  return res;
}

/**
 * Helper to parse API response or throw user-friendly error.
 */
export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetchWithAuth(path, options);

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: { message: 'Network error' } }));
    throw new Error(data.error?.message || `Request failed (${res.status})`);
  }

  return res.json();
}
