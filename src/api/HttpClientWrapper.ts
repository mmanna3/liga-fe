import { useAuth } from '@/hooks/useAuth';

export class HttpClientWrapper {
  // Rutas que no requieren token
  private publicRoutes = [
    '/api/Auth/login',
    '/api/Publico'
  ];

  constructor() {}

  fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
    const token = useAuth.getState().token;
    
    // Verificar si la URL es una ruta pública
    const isPublicRoute = this.isPublicRoute(url.toString());
    
    if (token && !isPublicRoute) {
      if (!init) {
        init = {};
      }
      if (!init.headers) {
        init.headers = {};
      }
      
      // Convertir headers a un objeto plano si es Headers
      const headers = init.headers instanceof Headers 
        ? Object.fromEntries(init.headers.entries()) 
        : (init.headers as Record<string, string>);
      
      init.headers = {
        ...headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    return window.fetch(url, init);
  }

  private isPublicRoute(url: string): boolean {
    return this.publicRoutes.some(route => url.includes(route));
  }
} 