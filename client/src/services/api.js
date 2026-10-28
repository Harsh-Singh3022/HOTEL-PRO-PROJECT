import axios from 'axios';

// Dynamically resolve API URL with support for Vercel environment variables & browser overrides
const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('hotelpro_api_url') || window.localStorage.getItem('VITE_API_URL');
    if (stored) return stored.replace(/\/+$/, '');
  }
  return 'http://localhost:5000/api/v1';
};

export const API_BASE_URL = resolveBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hotelpro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid looping if already on login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('hotelpro_token');
        localStorage.removeItem('hotelpro_user');
      }
    }
    return Promise.reject(error.response?.data || { message: error.message });
  }
);

// API methods
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const roomService = {
  getRooms: (params) => api.get('/rooms', { params }),
  getAvailableRooms: (params) => api.get('/rooms/available', { params }),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

export const roomTypeService = {
  getRoomTypes: () => api.get('/room-types'),
  getRoomTypeById: (id) => api.get(`/room-types/${id}`),
  createRoomType: (data) => api.post('/room-types', data),
  updateRoomType: (id, data) => api.put(`/room-types/${id}`, data),
  deleteRoomType: (id) => api.delete(`/room-types/${id}`),
};

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getAllBookings: (params) => api.get('/bookings', { params }),
  checkIn: (id, data) => api.post(`/bookings/${id}/check-in`, data),
  checkOut: (id, data) => api.post(`/bookings/${id}/check-out`, data),
  cancelBooking: (id, data) => api.post(`/bookings/${id}/cancel`, data),
  addCharge: (id, data) => api.post(`/bookings/${id}/add-charge`, data),
};

export const guestService = {
  getGuests: (params) => api.get('/guests', { params }),
  getGuestById: (id) => api.get(`/guests/${id}`),
  updateGuest: (id, data) => api.put(`/guests/${id}`, data),
};

export const paymentService = {
  createPayment: (data) => api.post('/payments', data),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  getBookingPayments: (bookingId) => api.get(`/payments/booking/${bookingId}`),
};

export const invoiceService = {
  getBookingInvoice: (bookingId) => api.get(`/invoices/booking/${bookingId}`),
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getRevenueReport: (params) => api.get('/reports/revenue', { params }),
  getOccupancyReport: (params) => api.get('/reports/occupancy', { params }),
};

export const taskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  updateTaskStatus: (id, data) => api.put(`/tasks/${id}/status`, data),
};

export const userService = {
  getStaff: () => api.get('/users/staff'),
  updateUserRole: (id, data) => api.put(`/users/${id}/role`, data),
  toggleUserStatus: (id) => api.put(`/users/${id}/toggle-status`),
};

export default api;
