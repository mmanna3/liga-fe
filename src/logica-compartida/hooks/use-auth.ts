import { api } from '@/api/api'
import { ApiException, LoginDTO, UsuarioAccesoModuloDTO } from '@/api/clients'
import {
  ModuloSistema,
  NivelAcceso,
  PermisoModulo,
  normalizarPermisos,
  permisosDesdeClaimJson,
  puedeEditarModulo,
  puedeEliminarEnModulo,
  tieneAccesoAModulo
} from '@/logica-compartida/permisos'
import { jwtDecode } from 'jwt-decode'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LoginResult = { exito: true } | { exito: false; error?: string }

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  userRole: string | null
  userName: string | null
  permisos: PermisoModulo[]
  login: (usuario: string, password: string) => Promise<LoginResult>
  setAuthFromToken: (
    token: string,
    userName: string,
    permisos?: UsuarioAccesoModuloDTO[]
  ) => void
  logout: () => void
  esAdmin: () => boolean
  esSuperAdministrador: () => boolean
  tieneAccesoModulo: (modulo: ModuloSistema) => boolean
  puedeEditar: (modulo: ModuloSistema) => boolean
  puedeEliminar: (modulo: ModuloSistema) => boolean
}

interface DecodedToken {
  role: string
  name?: string
  permisos?: string
  [key: string]: unknown
}

function extraerRol(decodedToken: DecodedToken): string | null {
  if (decodedToken.role) return decodedToken.role
  const roleClaim = Object.entries(decodedToken).find(([key]) =>
    key.toLowerCase().includes('role')
  )
  return roleClaim ? String(roleClaim[1]) : null
}

function extraerPermisosDelToken(
  decodedToken: DecodedToken,
  permisosLogin?: UsuarioAccesoModuloDTO[]
): PermisoModulo[] {
  if (permisosLogin?.length) return normalizarPermisos(permisosLogin)

  if (typeof decodedToken.permisos === 'string') {
    return permisosDesdeClaimJson(decodedToken.permisos)
  }

  const permisoClaim = Object.entries(decodedToken).find(
    ([key]) => key.toLowerCase() === 'permisos'
  )
  if (permisoClaim && typeof permisoClaim[1] === 'string') {
    return permisosDesdeClaimJson(permisoClaim[1])
  }

  return []
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
      permisos: [],
      setAuthFromToken: (
        token: string,
        userName: string,
        permisosLogin?: UsuarioAccesoModuloDTO[]
      ) => {
        const decodedToken = jwtDecode<DecodedToken>(token)
        const userRole = extraerRol(decodedToken)
        set({
          token,
          isAuthenticated: true,
          userRole,
          userName: decodedToken.name || userName,
          permisos: extraerPermisosDelToken(decodedToken, permisosLogin)
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
            get().setAuthFromToken(response.token, usuario, response.permisos)
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
          userName: null,
          permisos: []
        })
      },
      esAdmin: () => {
        const { userRole } = get()
        return userRole === 'Administrador' || userRole === 'SuperAdministrador'
      },
      esSuperAdministrador: () => get().userRole === 'SuperAdministrador',
      tieneAccesoModulo: (modulo: ModuloSistema) => {
        const { permisos, userRole } = get()
        return tieneAccesoAModulo(
          permisos,
          modulo,
          userRole === 'SuperAdministrador'
        )
      },
      puedeEditar: (modulo: ModuloSistema) => {
        const { permisos, userRole } = get()
        return puedeEditarModulo(
          permisos,
          modulo,
          userRole === 'SuperAdministrador'
        )
      },
      puedeEliminar: (modulo: ModuloSistema) => {
        const { permisos, userRole } = get()
        return puedeEliminarEnModulo(
          permisos,
          modulo,
          userRole === 'SuperAdministrador'
        )
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        userRole: state.userRole,
        userName: state.userName,
        permisos: state.permisos
      })
    }
  )
)

export { ModuloSistema, NivelAcceso }
