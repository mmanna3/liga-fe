import { api } from '@/api/api'
import { ApiException, CambiarPasswordDTO } from '@/api/clients'
import { Input } from '@/design-system/base-ui/input'
import ModalConAccion from '@/design-system/ykn-ui/modal-con-accion'
import { Boton } from '@/design-system/ykn-ui/boton'
import { useAuth } from '@/logica-compartida/hooks/use-auth'
import { useState } from 'react'
import { toast } from 'sonner'

interface ModalCambiarPasswordProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ModalCambiarPassword({
  open,
  onOpenChange
}: ModalCambiarPasswordProps) {
  const { userName, setAuthFromToken } = useAuth()
  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNuevo, setPasswordNuevo] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const resetForm = () => {
    setPasswordActual('')
    setPasswordNuevo('')
    setConfirmarPassword('')
    setError('')
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!userName) {
      setError('No se pudo identificar al usuario')
      return
    }

    if (!passwordActual || !passwordNuevo || !confirmarPassword) {
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
          usuario: userName,
          passwordActual,
          passwordNuevo
        })
      )

      if (response.exito && response.token) {
        setAuthFromToken(response.token, userName)
        toast.success('Contraseña actualizada correctamente')
        handleOpenChange(false)
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

  return (
    <ModalConAccion
      titulo='Cambiar mi contraseña'
      open={open}
      onOpenChange={handleOpenChange}
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <label htmlFor='passwordActual' className='text-sm font-medium'>
            Contraseña actual
          </label>
          <Input
            id='passwordActual'
            type='password'
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            required
            disabled={isLoading}
            autoComplete='current-password'
          />
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
            autoComplete='new-password'
          />
        </div>
        <div className='space-y-2'>
          <label htmlFor='confirmarPassword' className='text-sm font-medium'>
            Confirmar contraseña
          </label>
          <Input
            id='confirmarPassword'
            type='password'
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete='new-password'
          />
        </div>
        {error && (
          <div className='text-sm text-red-500 text-center'>{error}</div>
        )}
        <Boton type='submit' className='w-full' estaCargando={isLoading}>
          Cambiar contraseña
        </Boton>
      </form>
    </ModalConAccion>
  )
}
