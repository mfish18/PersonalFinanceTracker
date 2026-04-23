import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/index'

interface User {
  id: number
  display_name: string
  email: string
  currency: string
  date_format: string
}

interface AuthResponse {
  token: string
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') ?? 'null'))

  const isAuthenticated = computed(() => !!token.value)

  async function register(displayName: string, email: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      display_name: displayName,
      email,
      password,
    })
    setAuth(data)
  }

  async function login(email: string, password: string) {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    setAuth(data)
  }

  function setAuth(data: AuthResponse) {
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isAuthenticated, register, login, logout }
})