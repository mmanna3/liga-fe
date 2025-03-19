import { api } from '@/api/api'
import { EquipoDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { ContenedorCargandoYError } from '@/components/cargando-y-error-contenedor'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import { rutasNavegacion } from '@/routes/rutas'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function EditarEquipo() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [nombre, setNombre] = useState<string>('')
  const [torneoId, setTorneoId] = useState<string>('')
  const [clubId, setClubId] = useState<number | null>(null)

  // Cargar datos actuales del equipo
  const {
    data: equipo,
    isLoading: isLoadingEquipo,
    isError: isErrorEquipo
  } = useApiQuery<EquipoDTO>({
    key: ['equipo', id],
    fn: async () => await api.equipoGET(Number(id))
  })

  // Cargar torneos disponibles
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

  // Inicializar el formulario con los datos actuales
  useEffect(() => {
    if (equipo) {
      setNombre(equipo.nombre || '')
      setTorneoId(equipo.torneoId?.toString() || '')
      setClubId(equipo.clubId || null)
    }
  }, [equipo])

  // Configurar la mutación para actualizar el equipo
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

    // Validar campos
    if (!nombre || !torneoId) {
      return
    }

    // Actualizar el equipo
    mutation.mutate(
      new EquipoDTO({
        id: Number(id),
        nombre,
        clubId: clubId || undefined,
        torneoId: Number(torneoId)
      })
    )
  }

  const isLoading = isLoadingEquipo || isLoadingTorneos || mutation.isPending
  const isError = isErrorEquipo || isErrorTorneos

  return (
    <div>
      <BotonVolver texto='Volver' />
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
                  value={torneoId}
                  onValueChange={(value) => setTorneoId(value)}
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
              <Button type='submit'>Guardar</Button>
            </CardFooter>
          </form>
        </Card>
      </ContenedorCargandoYError>
    </div>
  )
}
