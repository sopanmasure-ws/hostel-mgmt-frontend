const API_BASE_URL = 'https://hostel-mgmt-backend-0icp.onrender.com/api';

// Helper function to make API calls
const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return await response.json();
};

// Auth APIs
export const authAPI = {
  register: async (userData) => {
    const response = await apiFetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response;
  },

  login: async (credentials) => {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response;
  },

  getMe: async () => {
    return await apiFetch('/auth/me');
  },
};

// Hostel APIs
export const hostelAPI = {
  getAllHostels: async () => {
    return await apiFetch('/hostels');
  },

  getHostelById: async (id) => {
    return await apiFetch(`/hostels/${id}`);
  },

  createHostel: async (hostelData) => {
    return await apiFetch('/hostels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hostelData),
    });
  },

  updateHostel: async (id, hostelData) => {
    return await apiFetch(`/hostels/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hostelData),
    });
  },

  deleteHostel: async (id) => {
    return await apiFetch(`/hostels/${id}`, {
      method: 'DELETE',
    });
  },
};

// Application APIs
export const applicationAPI = {
  submitApplication: async (formData) => {
    // formData should be FormData object for multipart/form-data
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/applications/`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await response.json();
  },

  getMyApplications: async () => {
    return await apiFetch('/applications/my-applications');
  },

  getApplications: async () => {
    return await apiFetch('/applications');
  },

  getApplicationById: async (id) => {
    return await apiFetch(`/applications/${id}`);
  },

  updateApplication: async (id, data) => {
    return await apiFetch(`/applications/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  deleteApplication: async (id) => {
    return await apiFetch(`/applications/${id}`, {
      method: 'DELETE',
    });
  },

  getApplicationsByHostel: async (hostelId) => {
    return await apiFetch(`/applications/hostel/${hostelId}`);
  },

  getApplicationsByPNR: async (pnr) => {
    return await apiFetch(`/applications/${pnr}`);
  },
};

export default {
  authAPI,
  hostelAPI,
  applicationAPI,
};
