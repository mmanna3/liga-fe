import { api } from '@/api/api'
import { LoginDTO } from '@/api/clients'
import { jwtDecode } from 'jwt-decode'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  userRole: string | null
  userName: string | null
  login: (usuario: string, password: string) => Promise<boolean>
  logout: () => void
  esAdmin: () => boolean
}

interface DecodedToken {
  role: string
  name?: string
  [key: string]: unknown
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      userRole: null,
      userName: null,
      login: async (usuario: string, password: string) => {
        try {
          const loginRequest = new LoginDTO({
            usuario,
            password
          })
          const response = await api.login(loginRequest)

          if (response.exito && response.token) {
            const decodedToken = jwtDecode<DecodedToken>(response.token)
            set({
              token: response.token,
              isAuthenticated: true,
              userRole: decodedToken.role,
              userName: decodedToken.name || usuario
            })
            return true
          }

          return false
        } catch (error) {
          console.error('Error en login:', error)
          return false
        }
      },
      logout: () => {
        set({
          token: null,
          isAuthenticated: false,
          userRole: null,
          userName: null
        })
      },
      esAdmin: () => {
        const { userRole } = get()
        return userRole === 'Administrador'
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)
