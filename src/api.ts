import axios from 'axios';

const api = axios.create({
  baseURL: '' // Оставляем пустым, так как работает прокси в Vite
});

// Перехватчик: перед каждым запросом добавляем токен из localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Проверяем, что токен существует и это не пустая строка
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Если токена нет, лучше вообще не слать заголовок Authorization
    delete config.headers.Authorization;
  }
  return config;
});

export default api;
