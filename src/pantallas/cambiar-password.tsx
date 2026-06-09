import { api } from '@/api/api'
import { ApiException, CambiarPasswordDTO } from '@/api/clients'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Input } from '@/design-system/base-ui/input'
import { Boton } from '@/design-system/ykn-ui/boton'
import { useAuth } from '@/logica-compartida/hooks/use-auth'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function CambiarPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setAuthFromToken } = useAuth()
  const usuarioInicial = (location.state as { usuario?: string })?.usuario ?? ''

  const [usuario] = useState(usuarioInicial)
  const [passwordNuevo, setPasswordNuevo] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!usuario) {
      navigate('/login', { replace: true })
    }
  }, [usuario, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!passwordNuevo || !confirmarPassword) {
      setError('Completá todos los campos')
      return
    }

    if (passwordNuevo !== confirmarPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.cambiarPassword(
        new CambiarPasswordDTO({
          usuario,
          passwordNuevo
        })
      )

      if (response.exito && response.token) {
        setAuthFromToken(response.token, usuario)
        navigate('/', { replace: true })
      } else {
        setError(response.error || 'No se pudo cambiar la contraseña')
      }
    } catch (err) {
      if (ApiException.isApiException(err) && err.response) {
        try {
          const body = JSON.parse(err.response) as { error?: string }
          setError(body.error || 'No se pudo cambiar la contraseña')
          return
        } catch {
          // fall through
        }
      }
      setError('Error al intentar cambiar la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  if (!usuario) return null

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <Card className='w-[350px]'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center'>
            Cambiar contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground text-center mb-1'>
            Tu contraseña fue blanqueada. Elegí una nueva para continuar.
          </p>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label htmlFor='usuario' className='text-sm font-medium'>
                Usuario
              </label>
              <Input id='usuario' type='text' value={usuario} disabled />
            </div>
            <div className='space-y-2'>
              <label htmlFor='passwordNuevo' className='text-sm font-medium'>
                Nueva contraseña
              </label>
              <Input
                id='passwordNuevo'
                type='password'
                value={passwordNuevo}
                onChange={(e) => setPasswordNuevo(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className='space-y-2'>
              <label
                htmlFor='confirmarPassword'
                className='text-sm font-medium'
              >
                Confirmar contraseña
              </label>
              <Input
                id='confirmarPassword'
                type='password'
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className='text-sm text-red-500 text-center'>{error}</div>
            )}
            <Boton
              type='submit'
              className='w-full py-7 text-base'
              estaCargando={isLoading}
            >
              Cambiar contraseña
            </Boton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
