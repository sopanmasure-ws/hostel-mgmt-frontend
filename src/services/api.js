import { API_CONFIG } from '../constants';

const API_BASE_URL = API_CONFIG.BASE_URL;
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
const createRequestOptions = (method = 'POST', data) => ({
  method,
  headers: API_CONFIG.HEADERS,
  body: JSON.stringify(data),
});
export const authAPI = {
  register: async (userData) => {
    return await apiFetch('/auth/register', createRequestOptions('POST', userData));
  },

  login: async (credentials) => {
    return await apiFetch('/auth/login', createRequestOptions('POST', credentials));
  },

  getMe: async () => {
    return await apiFetch('/auth/me');
  },
};
export const hostelAPI = {
  getAllHostels: async () => {
    return await apiFetch('/hostels');
  },

  getHostelById: async (id) => {
    return await apiFetch(`/hostels/${id}`);
  },

  createHostel: async (hostelData) => {
    return await apiFetch('/hostels', createRequestOptions('POST', hostelData));
  },

  updateHostel: async (id, hostelData) => {
    return await apiFetch(`/hostels/${id}`, createRequestOptions('PUT', hostelData));
  },

  deleteHostel: async (id) => {
    return await apiFetch(`/hostels/${id}`, { method: 'DELETE' });
  },
};
export const applicationAPI = {
  submitApplication: async (applicationData) => {
    const response = await fetch(`${API_BASE_URL}/applications/`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await response.json();
  },

  getMyApplications: async (studentPNR) => {
    return await apiFetch(`/applications/${studentPNR}`);
  },

  getApplications: async () => {
    return await apiFetch('/applications');
  },

  getApplicationById: async (id) => {
    return await apiFetch(`/applications/${id}`);
  },

  updateApplication: async (id, data) => {
    return await apiFetch(`/applications/${id}`, createRequestOptions('PUT', data));
  },

  deleteApplication: async (id) => {
    return await apiFetch(`/applications/${id}`, { method: 'DELETE' });
  },

  getApplicationsByHostel: async (hostelId) => {
    return await apiFetch(`/applications/hostel/${hostelId}`);
  },

  getApplicationsByPNR: async (pnr) => {
    return await apiFetch(`/applications/${pnr}`);
  },
};
export const adminAuthAPI = {
  register: async (adminData) => {
    return await apiFetch('/admin/register', createRequestOptions('POST', adminData));
  },

  login: async (credentials) => {
    return await apiFetch('/admin/login', createRequestOptions('POST', credentials));
  },

  getMe: async () => {
    return await apiFetch('/admin/me');
  },
};

export const adminHostelAPI = {
  getAdminHostels: async (adminId) => {
    return await apiFetch(`/admin/${adminId}/hostels`);
  },

  getHostelById: async (hostelId) => {
    return await apiFetch(`/admin/hostels/${hostelId}`);
  },

  updateHostel: async (hostelId, hostelData) => {
    return await apiFetch(`/admin/hostels/${hostelId}`, createRequestOptions('PUT', hostelData));
  },
};

export const adminApplicationAPI = {
  getApplicationsByHostel: async (hostelId, status = null) => {
    const endpoint = status
      ? `/admin/hostels/${hostelId}/applications?status=${status}`
      : `/admin/hostels/${hostelId}/applications`;
    return await apiFetch(endpoint);
  },

  getApplicationsByStatus: async (hostelId,status = null) => {
    return await apiFetch(`/admin/hostels/${hostelId}/applications?status=${status}`);
  },

  changeApplicationStatus: async (applicationId, roomData, status) => {
    return await apiFetch(`/admin/applications/${applicationId}/${status}`, createRequestOptions('PUT', roomData));
  },
};

export const adminRoomAPI = {
  getInventory: async (hostelId, filters = {}) => {
    let endpoint = `/admin/hostels/${hostelId}/inventory`;
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.floor) params.append('floor', filters.floor);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return await apiFetch(endpoint);
  },

  getAvailableRooms: async (hostelId) => {
    return await apiFetch(`/admin/hostels/${hostelId}/inventory?status=empty`);
  },

  getRoomsByHostel: async (hostelId, filters = {}) => {
    let endpoint = `/admin/hostels/${hostelId}/rooms`;
    return await apiFetch(endpoint);
  },

  updateRoomStatus: async (roomId, statusData) => {
    return await apiFetch(`/admin/rooms/${roomId}/update-status`, createRequestOptions('PUT', statusData));
  },

  releaseRoom: async (roomId) => {
    return await apiFetch(`/admin/rooms/${roomId}/release`, createRequestOptions('PUT', {}));
  },
};

export default {
  authAPI,
  hostelAPI,
  applicationAPI,
  adminAuthAPI,
  adminHostelAPI,
  adminApplicationAPI,
  adminRoomAPI,
};
