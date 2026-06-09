import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Input } from '@/design-system/base-ui/input'
import { Boton } from '@/design-system/ykn-ui/boton'
import { useAuth } from '@/logica-compartida/hooks/use-auth'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const MENSAJE_CAMBIO_OBLIGATORIO = 'El usuario debe cambiar la contraseña'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const resultado = await login(usuario, password)
      if (resultado.exito) {
        navigate(from, { replace: true })
      } else if (resultado.error === MENSAJE_CAMBIO_OBLIGATORIO) {
        navigate(rutasNavegacion.cambiarPassword, {
          replace: true,
          state: { usuario }
        })
      } else {
        setError(resultado.error || 'Usuario o contraseña incorrectos')
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
                data-testid='input-usuario'
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
                data-testid='input-password'
              />
            </div>
            {error && (
              <div className='text-sm text-red-500 text-center'>{error}</div>
            )}
            <Boton
              type='submit'
              className='w-full py-7 text-base'
              estaCargando={isLoading}
              data-testid='boton-ingresar'
            >
              Ingresar
            </Boton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
