import { api } from '@/api/api'
import { EquipoDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import { Boton } from '@/design-system/ykn-ui/boton'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Input } from '@/design-system/base-ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/design-system/base-ui/select'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function EditarEquipo() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [nombre, setNombre] = useState<string>('')
  const [torneoId, setTorneoId] = useState<string>('')
  const [clubId, setClubId] = useState<number | null>(null)

  const {
    data: equipo,
    isLoading: isLoadingEquipo,
    isError: isErrorEquipo
  } = useApiQuery<EquipoDTO>({
    key: ['equipo', id],
    fn: async () => await api.equipoGET(Number(id))
  })

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

  useEffect(() => {
    if (equipo && torneos) {
      setNombre(equipo.nombre || '')
      const torneoIdString = equipo.torneoId?.toString() || ''
      setTorneoId(torneoIdString)
      setClubId(equipo.clubId || null)
    }
  }, [equipo, torneos])

  const mutation = useApiMutation({
    fn: async (equipoActualizado: EquipoDTO) => {
      await api.equipoPUT(Number(id), equipoActualizado)
    },
    antesDeMensajeExito: () => {
      navigate(`${rutasNavegacion.equipos}`)
    },
    mensajeDeExito: `Equipo '${nombre}' actualizado correctamente`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const torneoIdNum = torneoId ? Number(torneoId) : NaN
    if (!torneoId || isNaN(torneoIdNum) || clubId == null) return
    mutation.mutate(
      new EquipoDTO({
        id: Number(id),
        nombre,
        clubId,
        torneoId: torneoIdNum
      })
    )
  }

  const isLoading = isLoadingEquipo || isLoadingTorneos || mutation.isPending
  const isError = isErrorEquipo || isErrorTorneos

  return (
    <div>
      <div className='mb-4'>
        <BotonVolver />
      </div>
      <ContenedorCargandoYError estaCargando={isLoading} hayError={isError}>
        <Card className='max-w-md mx-auto'>
          <CardHeader>
            <CardTitle>Editar Equipo</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <label htmlFor='nombre' className='block text-sm font-medium'>
                  Nombre del equipo
                </label>
                <Input
                  id='nombre'
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder='Nombre del equipo'
                  required
                />
              </div>
              <div className='space-y-2'>
                <label htmlFor='torneo' className='block text-sm font-medium'>
                  Torneo
                </label>
                <Select
                  key={`torneo-select-${torneoId}`}
                  value={torneoId || undefined}
                  onValueChange={(value) => {
                    setTorneoId(value)
                  }}
                >
                  <SelectTrigger id='torneo'>
                    <SelectValue placeholder='Selecciona un torneo' />
                  </SelectTrigger>
                  <SelectContent>
                    {torneos?.map((torneo) => (
                      <SelectItem
                        key={torneo.id}
                        value={torneo.id?.toString() || ''}
                      >
                        {torneo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className='flex justify-between'>
              <Boton type='submit'>Guardar</Boton>
            </CardFooter>
          </form>
        </Card>
      </ContenedorCargandoYError>
    </div>
  )
}
