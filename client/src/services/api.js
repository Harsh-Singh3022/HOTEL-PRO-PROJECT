import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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
  updateRoomStatus: (id, status) => api.patch(`/rooms/${id}/status`, { status }),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

export const roomTypeService = {
  getRoomTypes: () => api.get('/room-types'),
  createRoomType: (data) => api.post('/room-types', data),
  updateRoomType: (id, data) => api.put(`/room-types/${id}`, data),
  deleteRoomType: (id) => api.delete(`/room-types/${id}`),
};

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getAllBookings: (params) => api.get('/bookings', { params }),
  getMyBookings: () => api.get('/bookings/my'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  modifyBooking: (id, data) => api.put(`/bookings/${id}`, data),
  cancelBooking: (id, data) => api.patch(`/bookings/${id}/cancel`, data),
  checkIn: (id) => api.patch(`/bookings/${id}/check-in`),
  checkOut: (id) => api.patch(`/bookings/${id}/check-out`),
  addCharge: (id, data) => api.post(`/bookings/${id}/charges`, data),
};

export const guestService = {
  getGuests: (params) => api.get('/guests', { params }),
  createGuest: (data) => api.post('/guests', data),
  getGuestById: (id) => api.get(`/guests/${id}`),
  updateGuest: (id, data) => api.put(`/guests/${id}`, data),
};

export const paymentService = {
  createPayment: (data) => api.post('/payments', data),
  getBookingPayments: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  processRefund: (id, data) => api.post(`/payments/${id}/refund`, data),
};

export const invoiceService = {
  getInvoice: (bookingId) => api.get(`/invoices/booking/${bookingId}`),
  generateInvoice: (bookingId) => api.post(`/invoices/booking/${bookingId}`),
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getOccupancyReport: () => api.get('/reports/occupancy'),
  getRevenueReport: () => api.get('/reports/revenue'),
  getBookingsReport: (params) => api.get('/reports/bookings', { params }),
};

export const userService = {
  getUsers: (params) => api.get('/users', { params }),
  createStaff: (data) => api.post('/users/staff', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const taskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
};

export default api;
