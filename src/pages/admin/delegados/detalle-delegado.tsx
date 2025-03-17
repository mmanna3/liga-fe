import { api } from '@/api/api'
import { DelegadoDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Botonera from '@/components/ykn-ui/botonera'
import { rutasNavegacion } from '@/routes/rutas'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ComboboxClub } from './components/combobox-club'

export default function DetalleDelegado() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [clubId, setClubId] = useState<number | null>(null)

  const {
    isError,
    isLoading
  } = useApiQuery({
    key: ['delegado', id],
    fn: async () => {
      if (!id) return null
      const delegado = await api.delegadoGET(Number(id))
      if (delegado) {
        setUsuario(delegado.usuario || '')
        setNombre(delegado.nombre || '')
        setApellido(delegado.apellido || '')
        setClubId(delegado.clubId || null)
      }
      return delegado
    }
  })

  const mutation = useApiMutation({
    fn: async (delegadoActualizado: DelegadoDTO) => {
      if (!id) return
      await api.delegadoPUT(Number(id), delegadoActualizado)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.delegados),
    mensajeDeExito: `Delegado '${nombre}' actualizado correctamente`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!clubId) return
    mutation.mutate(
      new DelegadoDTO({
        id: Number(id),
        usuario,
        nombre,
        apellido,
        clubId
      })
    )
  }

  if (isError) {
    return (
      <Alert variant='destructive' className='mb-4'>
        <AlertTitle className='text-xl font-semibold'>Error</AlertTitle>
        <AlertDescription>
          No se pudieron recuperar los datos del delegado.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className='max-w-md mx-auto mt-10'>
        <Skeleton className='h-16 w-64' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
      </div>
    )
  }

  return (
    <Card className='max-w-md mx-auto mt-10 p-4'>
      <CardHeader>
        <CardTitle>Editar Delegado</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            type='text'
            placeholder='Usuario'
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
          <Input
            type='text'
            placeholder='Nombre'
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <Input
            type='text'
            placeholder='Apellido'
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
          <ComboboxClub
            value={clubId}
            onChange={setClubId}
            required
          />
          <Botonera>
            <BotonVolver texto='Cancelar' />
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </Botonera>
        </form>
      </CardContent>
    </Card>
  )
} 