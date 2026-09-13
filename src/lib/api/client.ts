// lib/api/client.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Assuming you store your JWT in localStorage. 
// If using cookies, adjust this to retrieve the token accordingly.
function getAuthHeader(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    let errorCode;
    
    try {
      const errorJson = await response.json();
      if (errorJson?.message) {
        errorMessage = errorJson.message;
      } else if (errorJson?.error) {
        errorMessage = errorJson.error;
      }
      errorCode = errorJson?.code;
    } catch {
      // Body was not json, keep status text
    }

    const apiError = new ApiError(response.status, errorMessage, errorCode);

    // Global Error Interceptor Logic
    if (typeof window !== 'undefined') {
      switch (response.status) {
        case 401:
          console.warn('[API] 401 Unauthorized - Clearing session and redirecting to login');
          localStorage.removeItem('token');
          window.location.href = '/login?expired=true';
          break;
        case 403:
          console.warn('[API] 403 Forbidden - Redirecting to forbidden page');
          window.location.href = '/forbidden';
          break;
        case 409:
        case 422:
        case 500:
          console.warn(`[API] ${response.status} Error - Dispatching global toast event`, errorMessage);
          window.dispatchEvent(new CustomEvent('global-toast', {
            detail: { type: 'error', message: errorMessage, status: response.status }
          }));
          break;
        default:
          window.dispatchEvent(new CustomEvent('global-toast', {
            detail: { type: 'error', message: errorMessage, status: response.status }
          }));
          break;
      }
    }

    throw apiError;
  }
  return response.json();
}

export const apiClient = {
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options?.headers || {}),
      },
    });
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options?.headers || {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options?.headers || {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options?.headers || {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },
};
