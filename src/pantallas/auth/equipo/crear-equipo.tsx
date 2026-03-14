import { api } from '@/api/api'
import { EquipoDTO, ZonaDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/design-system/base-ui/select'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import { cn } from '@/logica-compartida/utils'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const anioActual = () => new Date().getFullYear()

export default function CrearEquipo() {
  const navigate = useNavigate()
  const { clubid } = useParams<{ clubid: string }>()
  const [nombre, setNombre] = useState<string>('')
  const [torneoId, setTorneoId] = useState<string>('')
  const [faseId, setFaseId] = useState<string>('')
  const [zonaId, setZonaId] = useState<string>('')

  const { data: torneos = [], isLoading: torneosCargando } = useApiQuery({
    key: ['torneosFiltrar', anioActual()],
    fn: () => api.torneosFiltrar(anioActual(), undefined)
  })

  const torneoSeleccionado = useMemo(
    () => torneos.find((t) => String(t.id) === torneoId),
    [torneos, torneoId]
  )

  const fases = useMemo(
    () => torneoSeleccionado?.fases ?? [],
    [torneoSeleccionado]
  )

  const faseSeleccionada = useMemo(
    () => fases.find((f) => String(f.id) === faseId),
    [fases, faseId]
  )

  const { data: zonas = [], isLoading: zonasCargando } = useApiQuery({
    key: ['zonasAll', faseSeleccionada?.id],
    fn: () => api.zonasAll(faseSeleccionada!.id!),
    activado: !!faseSeleccionada?.id
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
        zonas:
          torneoId && faseId && zonaId
            ? [new ZonaDTO({ id: Number(zonaId) })]
            : undefined
      })
    )
  }

  const hayZonaCompleta = !!(torneoId && faseId && zonaId)

  return (
    <LayoutSegundoNivel
      titulo='Crear Equipo'
      contenido={
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
            <Label>Torneo (año actual)</Label>
            <Select
              value={torneoId || '_none'}
              onValueChange={(v) => {
                setTorneoId(v === '_none' ? '' : v)
                setFaseId('')
                setZonaId('')
              }}
            >
              <SelectTrigger
                className={cn(!torneoId && 'text-muted-foreground')}
              >
                <SelectValue placeholder='Seleccionar torneo' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='_none'>Sin torneo / sin zona</SelectItem>
                {torneos.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.nombre} {t.anio != null ? `(${t.anio})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Fase</Label>
            <Select
              value={faseId || '_none'}
              onValueChange={(v) => {
                setFaseId(v === '_none' ? '' : v)
                setZonaId('')
              }}
              disabled={!torneoId || torneosCargando}
            >
              <SelectTrigger
                className={cn(
                  !faseId && 'text-muted-foreground',
                  !torneoId && 'opacity-60'
                )}
              >
                <SelectValue placeholder='Seleccionar fase' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='_none'>Sin zona</SelectItem>
                {fases.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    {f.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Zona</Label>
            <Select
              value={zonaId || '_none'}
              onValueChange={(v) => setZonaId(v === '_none' ? '' : v)}
              disabled={!faseId || zonasCargando}
            >
              <SelectTrigger
                className={cn(
                  !zonaId && 'text-muted-foreground',
                  !faseId && 'opacity-60'
                )}
              >
                <SelectValue placeholder='Seleccionar zona' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='_none'>Sin asignar zona</SelectItem>
                {zonas.map((z) => (
                  <SelectItem key={z.id} value={String(z.id)}>
                    {z.nombre ?? 'Zona'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hayZonaCompleta && (
            <p className='text-sm text-muted-foreground'>
              El equipo se creará asignado a la zona seleccionada.
            </p>
          )}

          <ContenedorBotones>
            <Boton type='submit' estaCargando={mutation.isPending}>
              Guardar
            </Boton>
          </ContenedorBotones>
        </form>
      }
      maxWidth='md'
    />
  )
}
