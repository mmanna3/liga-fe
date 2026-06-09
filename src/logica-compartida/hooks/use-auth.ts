import { api } from '@/api/api'
import { ApiException, LoginDTO } from '@/api/clients'
import { jwtDecode } from 'jwt-decode'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LoginResult = { exito: true } | { exito: false; error?: string }

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  userRole: string | null
  userName: string | null
  login: (usuario: string, password: string) => Promise<LoginResult>
  setAuthFromToken: (token: string, userName: string) => void
  logout: () => void
  esAdmin: () => boolean
}

interface DecodedToken {
  role: string
  name?: string
  [key: string]: unknown
}

function extraerRol(decodedToken: DecodedToken): string | null {
  if (decodedToken.role) return decodedToken.role
  const roleClaim = Object.entries(decodedToken).find(([key]) =>
    key.toLowerCase().includes('role')
  )
  return roleClaim ? String(roleClaim[1]) : null
}

function extraerErrorLogin(error: unknown): string | undefined {
  if (ApiException.isApiException(error) && error.response) {
    try {
      const body = JSON.parse(error.response) as { error?: string }
      return body.error
    } catch {
      return undefined
    }
  }
  return undefined
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      userRole: null,
      userName: null,
      setAuthFromToken: (token: string, userName: string) => {
        const decodedToken = jwtDecode<DecodedToken>(token)
        set({
          token,
          isAuthenticated: true,
          userRole: extraerRol(decodedToken),
          userName: decodedToken.name || userName
        })
      },
      login: async (usuario: string, password: string) => {
        try {
          const loginRequest = new LoginDTO({
            usuario,
            password
          })
          const response = await api.login(loginRequest)

          if (response.exito && response.token) {
            get().setAuthFromToken(response.token, usuario)
            return { exito: true }
          }

          return { exito: false, error: response.error }
        } catch (error) {
          console.error('Error en login:', error)
          return { exito: false, error: extraerErrorLogin(error) }
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
        return userRole === 'Administrador' || userRole === 'SuperAdministrador'
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)
