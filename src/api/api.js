import axios from 'axios';

const api = axios.create({
  baseURL: 'https://app-granjaelsol-backend.vercel.app/api'
});

export default api;
