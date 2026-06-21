import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust if backend runs on a different port
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
