import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const getHealth = () => api.get('/health')
export const chatWithAI = (message: string) => api.post('/ai/chat', { message })
