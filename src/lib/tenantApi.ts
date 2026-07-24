import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

// Create axios instance for tenant API calls
export const tenantApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
tenantApi.interceptors.request.use(
  (config) => {
    // Get token from localStorage first (most reliable), then try Zustand store
    let token = null
    
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token')
      
      // If no token in localStorage, try Zustand store as fallback
      if (!token) {
        try {
          const authStore = useAuthStore.getState()
          token = authStore.token
        } catch (error) {
          console.error('Could not access Zustand store:', error)
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Always include credentials for cookie-based auth as fallback
    config.withCredentials = true
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
tenantApi.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Only redirect if we're in the browser and not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        // Clear tokens from both store and localStorage
        try {
          const authStore = useAuthStore.getState()
          authStore.logout()
        } catch (storeError) {
          console.error('Could not access auth store for logout:', storeError)
        }

        localStorage.removeItem('token')
      }
    }
    
    return Promise.reject(error)
  }
)

export default tenantApi