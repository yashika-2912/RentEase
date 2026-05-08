import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const url = original?.url || '';
    const isAuthRequest =
      url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');

    if (error.response?.status === 401 && !original?._retry && !isAuthRequest) {
      original._retry = true;
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) return Promise.reject(error);
      try {
        if (!refreshing) {
          refreshing = axios.post('/api/auth/refresh', { refreshToken: refresh }).then((r) => r.data.accessToken);
        }
        const accessToken = await refreshing;
        refreshing = null;
        localStorage.setItem('accessToken', accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
