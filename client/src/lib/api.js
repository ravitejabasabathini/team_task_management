import axios from 'axios'

/** Full API prefix including `/api`, e.g. http://localhost:5000/api */
function resolveApiBaseUrl() {
  const explicit = import.meta.env.VITE_API_BASE_URL
  if (explicit) return String(explicit).replace(/\/$/, '')

  const host = import.meta.env.VITE_API_URL
  if (host) return `${String(host).replace(/\/$/, '')}/api`

  return 'http://localhost:5000/api'
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const path = window.location.pathname
      if (!path.startsWith('/login') && !path.startsWith('/signup')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(err)
  }
)

export default api
