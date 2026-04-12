import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://app-granjaelsol-backend.vercel.app/api'
});

export default api;
