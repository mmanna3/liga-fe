import { api } from '@/api/api'
import { EquipoDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import { ContenedorCargandoYError } from '@/components/cargando-y-error-contenedor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Botonera from '@/components/ykn-ui/botonera'
import { rutasNavegacion } from '@/routes/rutas'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function CrearEquipo() {
  const navigate = useNavigate()
  const { clubid } = useParams<{ clubid: string }>()
  const [nombre, setNombre] = useState<string>('')
  const [torneoId, setTorneoId] = useState<string>('')

  const {
    data: torneos,
    isLoading: isLoadingTorneos,
    isError: isErrorTorneos
  } = useQuery({
    queryKey: ['torneos'],
    queryFn: async () => {
      const response = await api.torneoAll()
      return response
    }
  })

  const mutation = useApiMutation({
    fn: async (nuevoEquipo: EquipoDTO) => {
      await api.equipoPOST(nuevoEquipo)
    },
    antesDeMensajeExito: () =>
      navigate(`${rutasNavegacion.detalleClub}/${clubid}`),
    mensajeDeExito: `Equipo '${nombre}' creado correctamente`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate(
      new EquipoDTO({
        nombre,
        clubId: Number(clubid),
        torneoId: Number(torneoId)
      })
    )
  }

  return (
    <ContenedorCargandoYError
      estaCargando={isLoadingTorneos}
      hayError={isErrorTorneos}
    >
      <Card className='max-w-md mx-auto mt-10 p-4'>
        <CardHeader>
          <CardTitle>Crear Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='nombre'>Nombre</Label>
              <Input
                id='nombre'
                type='text'
                placeholder='Nombre'
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='torneo'>Torneo</Label>
              <select
                id='torneo'
                value={torneoId}
                onChange={(e) => setTorneoId(e.target.value)}
                required
                className={cn(
                  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  !torneoId && 'text-muted-foreground'
                )}
              >
                <option value='' disabled>
                  Seleccionar torneo
                </option>
                {torneos?.map((torneo) => (
                  <option key={torneo.id} value={torneo.id!.toString()}>
                    {torneo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <Botonera>
              <BotonVolver texto='Cancelar' />
              <Button type='submit' disabled={mutation.isPending}>
                {mutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </Botonera>
          </form>
        </CardContent>
      </Card>
    </ContenedorCargandoYError>
  )
}
