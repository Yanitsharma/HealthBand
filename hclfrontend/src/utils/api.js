// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Token being used for API request:', token);
  
  if (!token || token === 'logged_in') {
    console.warn('⚠️ No valid token found for authenticated request');
  }
  
  return {
    'Content-Type': 'application/json',
    ...(token && token !== 'logged_in' ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  login: (credentials) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(res => res.json()),

  register: (userData) =>
    fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }).then(res => res.json()),

  getCurrentUser: () => apiRequest('/auth/me'),
};

// Dashboard APIs
export const dashboardAPI = {
  // Get complete dashboard data
  getDashboardData: () => apiRequest('/patient/dashboard'),

  // Update daily goals
  updateGoals: (goals) =>
    apiRequest('/patient/goals', {
      method: 'PUT',
      body: JSON.stringify(goals),
    }),

  // Update today's activity
  updateActivity: (activity) =>
    apiRequest('/patient/activity', {
      method: 'PUT',
      body: JSON.stringify(activity),
    }),

  // Reset daily activity
  resetDailyActivity: () =>
    apiRequest('/patient/reset-daily', {
      method: 'POST',
    }),
};

// Reminders APIs
export const remindersAPI = {
  // Get all reminders
  getReminders: (completed = null) => {
    const query = completed !== null ? `?completed=${completed}` : '';
    return apiRequest(`/patient/reminders${query}`);
  },

  // Add a new reminder
  addReminder: (reminder) =>
    apiRequest('/patient/reminders', {
      method: 'POST',
      body: JSON.stringify(reminder),
    }),

  // Update a reminder
  updateReminder: (id, updates) =>
    apiRequest(`/patient/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete a reminder
  deleteReminder: (id) =>
    apiRequest(`/patient/reminders/${id}`, {
      method: 'DELETE',
    }),

  // Mark reminder as complete
  markComplete: (id) =>
    apiRequest(`/patient/reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isCompleted: true }),
    }),
};

// Appointments APIs
export const appointmentsAPI = {
  // Get all doctors with optional filters
  getDoctors: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.specialty) queryParams.append('specialty', params.specialty);
    if (params.search) queryParams.append('search', params.search);
    if (params.available !== undefined) queryParams.append('available', params.available);
    
    const queryString = queryParams.toString();
    return apiRequest(`/appointments/doctors${queryString ? '?' + queryString : ''}`);
  },

  // Get doctor availability for a specific date
  getDoctorAvailability: (doctorId, date) =>
    apiRequest(`/appointments/doctors/${doctorId}/availability?date=${date}`),

  // Book a new appointment
  bookAppointment: (appointmentData) =>
    apiRequest('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),

  // Get all appointments for logged-in patient
  getMyAppointments: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    
    const queryString = queryParams.toString();
    return apiRequest(`/appointments/my-appointments${queryString ? '?' + queryString : ''}`);
  },

  // Get specific appointment details
  getAppointmentDetails: (appointmentId) =>
    apiRequest(`/appointments/${appointmentId}`),

  // Cancel an appointment
  cancelAppointment: (appointmentId, reason = '') =>
    apiRequest(`/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason: reason }),
    }),

  // Reschedule an appointment
  rescheduleAppointment: (appointmentId, newSchedule) =>
    apiRequest(`/appointments/${appointmentId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(newSchedule),
    }),
};

export default {
  authAPI,
  dashboardAPI,
  remindersAPI,
  appointmentsAPI,
};

