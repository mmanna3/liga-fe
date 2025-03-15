import { api } from '@/api/api'
import { LoginDTO } from '@/api/clients'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  login: (usuario: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      login: async (usuario: string, password: string) => {
        try {
          const loginRequest = new LoginDTO({
            usuario,
            password
          })
          const response = await api.login(loginRequest)

          if (response.exito) {
            set({ token: response.token, isAuthenticated: true })
            return true
          }

          return false
        } catch (error) {
          console.error('Error en login:', error)
          return false
        }
      },
      logout: () => {
        set({ token: null, isAuthenticated: false })
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)
