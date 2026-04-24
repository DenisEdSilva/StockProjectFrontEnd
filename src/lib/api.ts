import axios from 'axios';
import { parseCookies } from 'nookies';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
})

api.interceptors.request.use(config => {
    const cookies = parseCookies();
    const token = cookies['stockproject.token'];

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }

    return config;
});

api.interceptors.response.use(response => response, (error) => {
    if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/signin';
        }
    }
    return Promise.reject(error);    
}
)