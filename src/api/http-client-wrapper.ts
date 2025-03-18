import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export class HttpClientWrapper {
  private publicRoutes = ['/api/Auth/login', '/api/Publico']

  constructor() {}

  fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
    const token = useAuth.getState().token
    const isPublicRoute = this.isPublicRoute(url.toString())

    if (token && !isPublicRoute) {
      if (!init) {
        init = {}
      }
      if (!init.headers) {
        init.headers = {}
      }

      const headers =
        init.headers instanceof Headers
          ? Object.fromEntries(init.headers.entries())
          : (init.headers as Record<string, string>)

      init.headers = {
        ...headers,
        Authorization: `Bearer ${token}`
      }
    }

    return window.fetch(url, init).then(async (response) => {
      if (response.status === 401 && !isPublicRoute) {
        useAuth.getState().logout()
        toast.error('Token vencido')
        window.location.href = '/login'
        throw new Error('Token vencido')
      } else if (response.status === 403 && !isPublicRoute) {
        useAuth.getState().logout()
        toast.error('Usuario no tiene permisos')
        window.location.href = '/login'
        throw new Error('Usuario no tiene permisos')
      }
      return response
    })
  }

  private isPublicRoute(url: string): boolean {
    return this.publicRoutes.some((route) => url.includes(route))
  }
}
