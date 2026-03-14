import axios from 'axios';

const api = axios.create({
  baseURL: '' // Оставляем пустым, так как работает прокси в Vite
});

// Перехватчик: перед каждым запросом добавляем токен из localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    const cleanToken = token.replace(/"/g, '');
    // Шлем ТОЛЬКО токен, так как бэкенд Петрова не умеет отрезать "Bearer "
    config.headers.Authorization = cleanToken; 
  }
  return config;
});

export default api;
