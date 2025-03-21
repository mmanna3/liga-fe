import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const from = location.state?.from?.pathname || '/admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(usuario, password)
      if (success) {
        navigate(from, { replace: true })
      } else {
        setError('Usuario o contraseña incorrectos')
      }
    } catch {
      setError('Error al intentar iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <Card className='w-[350px]'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center'>
            Iniciar Sesión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='usuario' className='text-sm font-medium'>
                Usuario
              </label>
              <Input
                id='usuario'
                type='text'
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className='space-y-2'>
              <label htmlFor='password' className='text-sm font-medium'>
                Contraseña
              </label>
              <Input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className='text-sm text-red-500 text-center'>{error}</div>
            )}
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='animate-spin' />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
