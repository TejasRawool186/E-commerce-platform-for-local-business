// API utility functions for consistent error handling and authentication

const API_BASE_URL = '';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API call function with error handling
export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Specific API functions
export const api = {
  // Auth
  login: (credentials) => apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  register: (userData) => apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  // Products
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/products${queryString ? `?${queryString}` : ''}`);
  },

  getProduct: (id) => apiCall(`/api/products/${id}`),

  createProduct: (productData) => apiCall('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  }),

  updateProduct: (id, productData) => apiCall(`/api/seller/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  }),

  deleteProduct: (id) => apiCall(`/api/seller/products/${id}`, {
    method: 'DELETE'
  }),

  toggleProductStatus: (id) => apiCall(`/api/seller/products/${id}/toggle`, {
    method: 'PATCH'
  }),

  // Seller products
  getSellerProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/seller/products${queryString ? `?${queryString}` : ''}`);
  },

  // Orders
  placeOrder: (orderData) => apiCall('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),

  getRetailerOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/orders/retailer${queryString ? `?${queryString}` : ''}`);
  },

  getSellerOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/orders/seller${queryString ? `?${queryString}` : ''}`);
  },

  getOrderById: (id) => apiCall(`/api/orders/${id}`),

  updateOrderStatus: (id, status) => apiCall(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),

  downloadInvoice: (id) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/api/orders/${id}/invoice`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Stats
  getRetailerStats: () => apiCall('/api/retailer/stats'),
  getSellerStats: () => apiCall('/api/seller/stats'),
  getAdminStats: () => apiCall('/api/admin/stats'),

  // Admin
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/api/admin/users${queryString ? `?${queryString}` : ''}`);
  },

  updateUserStatus: (id, isActive) => apiCall(`/api/admin/users/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ isActive })
  }),

  deleteUser: (id) => apiCall(`/api/admin/users/${id}`, {
    method: 'DELETE'
  })
};

export default api;


