import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import api from "./api";
import "./styles.css";

// Интерцептор для обновления токена
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken')?.replace(/^"|$/g, '');
            if (refreshToken) {
                try {
                    const response = await api.post('/api/auth/refresh', { refreshToken });
                    const newToken = response.data.token;
                    if (newToken) {
                        const cleanToken = String(newToken).replace(/["'\s]/g, '');
                        localStorage.setItem('token', cleanToken);
                        originalRequest.headers.Authorization = `Bearer ${cleanToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Failed to refresh token:', refreshError);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    router.push('/auth/login');
                }
            }
        }

        return Promise.reject(error);
    }
);

const app = createApp(App);

app.use(router);
app.mount("#app");