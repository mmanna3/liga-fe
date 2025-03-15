import { useAuth } from '@/hooks/useAuth';

export class HttpClientWrapper {
  constructor() {}

  fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
    const token = useAuth.getState().token;
    
    if (token) {
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
} 