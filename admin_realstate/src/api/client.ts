import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle common response structure
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

// Real API calls
export const api = {
  // Auth
  login: (email: string, password: string) => 
    apiClient.post('/auth/login', { email, password }).then(res => res.data),

  register: (data: {name: string; email: string; password: string; role: string;}) =>
    apiClient.post('/auth/register', data).then(res => res.data),

  getMe: () => 
    apiClient.get('/auth/me').then(res => res.data),

  // Houses
  getHouses: async (params?: { isActive?: boolean; limit?: number }) => {
    const response = await apiClient.get('/houses', { params });
    // Handle both response structures (with data wrapper and without)
    const housesData = response.data.data?.houses || response.data.data || response.data;
    return Array.isArray(housesData) ? housesData : [];
  },
  
  getHouse: async (id: string) => {
    const response = await apiClient.get(`/houses/${id}`);
    return response.data.data || response.data;
  },
  
  createHouse: async (data: FormData) => {
    const response = await apiClient.post('/houses', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data || response.data;
  },
  
  updateHouse: async (id: string, data: FormData) => {
    const response = await apiClient.put(`/houses/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data || response.data;
  },
    
  deleteHouse: (id: string) =>
    apiClient.delete(`/houses/${id}`).then(res => res.data),
    
  // Rooms
  getRoomsByHouse: async (houseId: string) => {
    const response = await apiClient.get(`/rooms/house/${houseId}`);
    return response.data.data || response.data;
  },
  
  getRoom: async (id: string) => {
    const response = await apiClient.get(`/rooms/${id}`);
    return response.data.data || response.data;
  },
  
  createRoom: (data: any) => 
    apiClient.post('/rooms', data).then(res => res.data),
  
  updateRoom: (id: string, data: any) => 
    apiClient.put(`/rooms/${id}`, data).then(res => res.data),
  
  deleteRoom: (id: string) => 
    apiClient.delete(`/rooms/${id}`).then(res => res.data),

  // Contact
  // Contact
  submitContact: async (data: any) => {
    const response = await apiClient.post('/contact', data);
    return response.data.data || response.data;
  },
  // Contact APIs
  getSubmissions: async (params?: { status?: string; limit?: number }) => {
    try {
      const response = await apiClient.get('/contact', { params });
  
      return response?.data?.data || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },
  
  updateSubmissionStatus: async (
    id: string,
    status: string,
    replyMessage?: string
  ) => {
    try {
      const response = await apiClient.put(`/contact/${id}/status`, {
        status,
        replyMessage,
      });
  
      return response?.data?.data || response?.data || null;
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw error;
    }
  },
  
  deleteSubmission: async (id: string) => {
    try {
      const response = await apiClient.delete(`/contact/${id}`);
  
      return response?.data || null;
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  },
  
  // Web Settings APIs
  getWebSettings: async () => {
    try {
      const token = localStorage.getItem('admin_token');
  
      const response = await apiClient.get('/web-settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response?.data?.data || response?.data || {};
    } catch (error) {
      console.error('Error fetching web settings:', error);
      return {};
    }
  },
  
  updateWebSettings: async (data: any) => {
    try {
      const token = localStorage.getItem('admin_token');
  
      const response = await apiClient.put('/web-settings', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response?.data?.data || response?.data || null;
    } catch (error) {
      console.error('Error updating web settings:', error);
      throw error;
    }
  },
  // Upload
  uploadPanorama: (file: File) => {
    const formData = new FormData();
    formData.append('panorama', file);
    return apiClient.post('/upload/panorama', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  uploadGallery: (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('gallery', file));
    return apiClient.post('/upload/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  uploadVideo: (file: File) => {
    const formData = new FormData();
    formData.append('video', file);
    return apiClient.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  deleteFile: (type: string, filename: string) => 
    apiClient.delete(`/upload/${type}/${filename}`).then(res => res.data),

  // Stats
  getStats: () => 
    apiClient.get('/stats').then(res => res.data),
};

// Create default admin user (run once)
export const createDefaultAdmin = async () => {
  try {
    await api.login('admin@vrtx.com', 'admin123');
  } catch (error) {
    console.log('Default admin not found. Please create via MongoDB Compass or setup script.');
  }
};