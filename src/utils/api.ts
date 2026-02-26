import { useAuthStore } from '@store/authStore';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (requiresAuth) {
    const token = useAuthStore.getState().token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: (credentials: { login: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      requiresAuth: false,
    }),

  register: (data: any) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: false,
    }),

  me: () => apiRequest('/auth/me'),
};

// Cards API
export const cardsAPI = {
  search: (params: any) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/cards/search?${query}`, { requiresAuth: false });
  },

  getById: (id: number) => apiRequest(`/cards/${id}`, { requiresAuth: false }),

  create: (data: any) =>
    apiRequest('/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => apiRequest('/inventory'),

  update: (id: number, data: any) =>
    apiRequest(`/inventory/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  create: (data: any) =>
    apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Orders API
export const ordersAPI = {
  getAll: (userId?: number) => {
    const query = userId ? `?user_id=${userId}` : '';
    return apiRequest(`/orders${query}`);
  },

  getById: (id: number) => apiRequest(`/orders/${id}`),

  create: (data: any) =>
    apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, data: any) =>
    apiRequest(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Wishlist API
export const wishlistAPI = {
  getAll: () => apiRequest('/wishlists'),

  add: (data: any) =>
    apiRequest('/wishlists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    apiRequest(`/wishlists/${id}`, {
      method: 'DELETE',
    }),
};
