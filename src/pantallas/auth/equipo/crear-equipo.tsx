import { api } from '@/api/api'
import { EquipoDTO, ZonaResumenDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/ykn-ui/input'
import { ListaDesplegable } from '@/design-system/ykn-ui/lista-desplegable'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
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
            ? [
                new ZonaResumenDTO({
                  id: Number(zonaId),
                  anio: torneoSeleccionado?.anio ?? anioActual()
                })
              ]
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
          <Input
            titulo='Nombre'
            id='nombre'
            type='text'
            placeholder='Nombre'
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <ListaDesplegable
            titulo='Torneo (año actual)'
            opciones={[
              { value: '_none', label: 'Sin torneo / sin zona' },
              ...torneos.map((t) => ({
                value: String(t.id),
                label: `${t.nombre}${t.anio != null ? ` (${t.anio})` : ''}`
              }))
            ]}
            valor={torneoId || '_none'}
            alCambiar={(v) => {
              setTorneoId(v === '_none' ? '' : v)
              setFaseId('')
              setZonaId('')
            }}
            triggerClassName={!torneoId ? 'text-muted-foreground' : undefined}
          />

          <ListaDesplegable
            titulo='Fase'
            opciones={[
              { value: '_none', label: 'Sin zona' },
              ...fases.map((f) => ({
                value: String(f.id),
                label: f.nombre ?? ''
              }))
            ]}
            valor={faseId || '_none'}
            alCambiar={(v) => {
              setFaseId(v === '_none' ? '' : v)
              setZonaId('')
            }}
            deshabilitado={!torneoId || torneosCargando}
            triggerClassName={!faseId ? 'text-muted-foreground' : undefined}
          />

          <ListaDesplegable
            titulo='Zona'
            opciones={[
              { value: '_none', label: 'Sin asignar zona' },
              ...zonas.map((z) => ({
                value: String(z.id),
                label: z.nombre ?? 'Zona'
              }))
            ]}
            valor={zonaId || '_none'}
            alCambiar={(v) => setZonaId(v === '_none' ? '' : v)}
            deshabilitado={!faseId || zonasCargando}
            triggerClassName={!zonaId ? 'text-muted-foreground' : undefined}
          />

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
