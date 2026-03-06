import axios from 'axios'
import { ENV } from '../app/env'

export const api = axios.create({
  baseURL: ENV.API_BASE_URL
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      // hard logout; refresh-token can be added later
      localStorage.removeItem('accessToken')
      localStorage.removeItem('activeInstituteId')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)
