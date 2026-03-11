import { api } from '@/api/api'
import { TorneoCategoriaDTO, TorneoDTO, TorneoFaseDTO } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { Boton } from '@/design-system/ykn-ui/boton'
import { Input } from '@/design-system/ykn-ui/input'
import LayoutSegundoNivel from '@/design-system/ykn-ui/layout-segundo-nivel'
import SelectorSimple, {
  type OpcionSelector
} from '@/design-system/ykn-ui/selector-simple'
import { rutasNavegacion } from '@/ruteo/rutas'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Categorias } from './crear-torneo/components/categorias'
import { DatosFaseLectura } from './crear-torneo/components/datos-fase-lectura'
import { SelectorAgrupador } from './crear-torneo/components/selector-agrupador'
import { TituloFase } from './crear-torneo/components/titulo-fase'
import type { Categoria } from './crear-torneo/tipos'

const OPCIONES_FORMATO: OpcionSelector[] = [
  { id: 'todos-contra-todos', titulo: 'Todos contra todos' },
  { id: 'eliminacion-directa', titulo: 'Eliminación directa' }
]

const OPCIONES_EXCLUYENTE: OpcionSelector[] = [
  {
    id: 'excluyente',
    titulo: 'Fase excluyente',
    descripcion:
      'Los equipos que juegan esta fase no pueden jugar otra fase excluyente.'
  },
  {
    id: 'no-excluyente',
    titulo: 'Fase no excluyente',
    descripcion: 'Cualquier equipo de la liga puede jugar esta fase.'
  }
]

function formatoIdAOpción(faseFormatoId?: number): string {
  if (faseFormatoId === 1) return 'todos-contra-todos'
  if (faseFormatoId === 2) return 'eliminacion-directa'
  return ''
}

function formatoNombreDesdeId(faseFormatoId?: number): string {
  if (faseFormatoId === 1) return 'Todos contra todos'
  if (faseFormatoId === 2) return 'Eliminación directa'
  return '—'
}

function categoriasDtoACategoria(dtos: TorneoCategoriaDTO[]): Categoria[] {
  return (dtos ?? []).map((c) => ({
    id: String(c.id ?? Date.now() + Math.random()),
    nombre: c.nombre ?? '',
    anioDesde: String(c.anioDesde ?? ''),
    anioHasta: String(c.anioHasta ?? '')
  }))
}

function categoriasACategoriaDto(cats: Categoria[]): TorneoCategoriaDTO[] {
  return cats
    .filter(
      (c) =>
        c.nombre.trim() !== '' &&
        c.anioDesde.trim() !== '' &&
        c.anioHasta.trim() !== ''
    )
    .map((c) => {
      const idNum = parseInt(c.id, 10)
      const esCategoriaExistente =
        !isNaN(idNum) && idNum > 0 && idNum < 1_000_000_000
      return new TorneoCategoriaDTO({
        ...(esCategoriaExistente && { id: idNum }),
        nombre: c.nombre.trim(),
        anioDesde: parseInt(c.anioDesde, 10),
        anioHasta: parseInt(c.anioHasta, 10)
      })
    })
}

export default function DetalleTorneo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const torneoId = Number(id)

  const {
    data: torneo,
    isLoading,
    isError,
    refetch
  } = useApiQuery({
    key: ['torneo', id],
    fn: async () => await api.torneoGET(torneoId)
  })

  const torneoFases = torneo?.fases ?? []

  const eliminarMutation = useApiMutation<void>({
    fn: async () => {
      await api.torneoDELETE(torneoId)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.torneos),
    mensajeDeExito: `El torneo "${torneo?.nombre ?? ''}" fue eliminado.`
  })

  const puedeEditarTorneo = torneo?.sePuedeEditar !== false

  const [nombre, setNombre] = useState('')
  const [temporada, setTemporada] = useState('')
  const [agrupadorId, setAgrupadorId] = useState<number | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [fasesEstado, setFasesEstado] = useState<
    Array<{
      id?: number
      numero: number
      nombre: string
      formato: string
      excluyente: string
      sePuedeEditar: boolean
    }>
  >([])

  useEffect(() => {
    if (torneo) {
      setNombre(torneo.nombre ?? '')
      setTemporada(String(torneo.anio ?? ''))
      setAgrupadorId(torneo.torneoAgrupadorId ?? null)
    }
  }, [torneo])

  useEffect(() => {
    if (torneo) {
      setCategorias(categoriasDtoACategoria(torneo.categorias ?? []))
    }
  }, [torneo])

  useEffect(() => {
    if (torneo) {
      setFasesEstado(
        (torneo.fases ?? []).map((f) => ({
          id: f.id,
          numero: f.numero ?? 0,
          nombre: f.nombre ?? '',
          formato: formatoIdAOpción(f.faseFormatoId),
          excluyente: f.esExcluyente ? 'excluyente' : 'no-excluyente',
          sePuedeEditar: f.sePuedeEditar !== false
        }))
      )
    }
  }, [torneo])

  const actualizarFase = (index: number, campo: string, valor: string) => {
    setFasesEstado((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [campo]: valor } : f))
    )
  }

  const agregarFase = () => {
    const maxNumero = Math.max(0, ...fasesEstado.map((f) => f.numero))
    setFasesEstado((prev) => [
      ...prev,
      {
        numero: maxNumero + 1,
        nombre: '',
        formato: '',
        excluyente: '',
        sePuedeEditar: true
      }
    ])
  }

  const guardarMutation = useApiMutation<void>({
    fn: async () => {
      if (!torneo) return
      const categoriasValidas = categoriasACategoriaDto(categorias)
      const fasesValidas = fasesEstado
        .filter((f) => f.nombre.trim() && f.formato && f.excluyente)
        .map((f) => ({
          id: f.id,
          numero: f.numero,
          nombre: f.nombre.trim(),
          faseFormatoId: f.formato === 'todos-contra-todos' ? 1 : 2,
          esExcluyente: f.excluyente === 'excluyente',
          estadoFaseId: 100,
          esVisibleEnApp: true
        }))

      const body = new TorneoDTO({
        id: torneo.id,
        nombre,
        anio: parseInt(temporada, 10),
        torneoAgrupadorId: agrupadorId ?? undefined,
        categorias: categoriasValidas.map(
          (c) => new TorneoCategoriaDTO({ ...c, torneoId: torneoId })
        ),
        fases: fasesValidas.map(
          (f) => new TorneoFaseDTO({ ...f, torneoId: torneoId })
        )
      })
      await api.torneoPUT(torneoId, body)
    },
    antesDeMensajeExito: () => refetch(),
    mensajeDeExito: 'Torneo actualizado correctamente'
  })

  if (isLoading) return <div>Cargando...</div>
  if (isError) return <div>Error al cargar el torneo</div>
  if (!torneo) return <div>No se encontró el torneo</div>

  const tieneFases = torneoFases.length > 0
  const puedeEliminar = !tieneFases

  return (
    <LayoutSegundoNivel
      titulo={`${torneo.nombre}`}
      pathBotonVolver={rutasNavegacion.torneos}
      maxWidth='2xl'
      botonera={{
        iconos: [
          {
            alApretar: () => eliminarMutation.mutate(undefined),
            tooltip: 'Eliminar',
            puedeEliminar,
            textoNoSePuedeEliminar:
              'Este torneo tiene fases. Para eliminar el torneo, eliminá primero las fases que tiene.',
            modalEliminacion: {
              titulo: 'Eliminar torneo',
              subtitulo: `¿Estás seguro de que querés eliminar el torneo "${torneo.nombre}"? Esta acción no se puede deshacer.`,
              estaCargando: eliminarMutation.isPending
            }
          }
        ]
      }}
      contenido={
        <form
          onSubmit={(e) => {
            e.preventDefault()
            guardarMutation.mutate(undefined)
          }}
          className='space-y-4'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {puedeEditarTorneo ? (
              <>
                <Input
                  tipo='text'
                  titulo='Nombre del torneo *'
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder='Ej: Torneo Anual 2026'
                />
                <Input
                  tipo='number'
                  titulo='Temporada/Año *'
                  value={temporada}
                  onChange={(e) => setTemporada(e.target.value)}
                  placeholder='2026'
                />
              </>
            ) : (
              <>
                <div>
                  <label className='text-sm font-semibold text-muted-foreground block mb-2'>
                    Nombre del torneo
                  </label>
                  <p className='font-medium'>{nombre || '—'}</p>
                </div>
                <div>
                  <label className='text-sm font-semibold text-muted-foreground block mb-2'>
                    Temporada/Año
                  </label>
                  <p className='font-medium'>{temporada || '—'}</p>
                </div>
              </>
            )}
          </div>

          {puedeEditarTorneo ? (
            <SelectorAgrupador valor={agrupadorId} alCambiar={setAgrupadorId} />
          ) : (
            <div>
              <label className='text-sm font-semibold text-muted-foreground block mb-2'>
                Agrupador
              </label>
              <p className='font-medium'>
                {torneo.torneoAgrupadorNombre ?? '—'}
              </p>
            </div>
          )}

          <Categorias
            valor={categorias}
            alCambiar={setCategorias}
            soloLectura={!puedeEditarTorneo}
          />

          {fasesEstado.map((fase, index) => {
            const faseOriginal = torneoFases[index]
            return (
              <div key={fase.id ?? index} className='space-y-4 pt-6 border-t'>
                <TituloFase
                  valor={fase.nombre}
                  alCambiar={(v) => actualizarFase(index, 'nombre', v)}
                  soloLectura={!fase.sePuedeEditar}
                />
                {fase.sePuedeEditar ? (
                  <>
                    <SelectorSimple
                      titulo='Formato'
                      opciones={OPCIONES_FORMATO}
                      valorActual={fase.formato}
                      alElegirOpcion={(v) =>
                        actualizarFase(index, 'formato', v)
                      }
                    />
                    <SelectorSimple
                      titulo='Excluyente'
                      opciones={OPCIONES_EXCLUYENTE}
                      valorActual={fase.excluyente}
                      alElegirOpcion={(v) =>
                        actualizarFase(index, 'excluyente', v)
                      }
                    />
                  </>
                ) : (
                  <DatosFaseLectura
                    formato={
                      faseOriginal?.faseFormatoNombre ??
                      formatoNombreDesdeId(faseOriginal?.faseFormatoId)
                    }
                    excluyente={
                      faseOriginal?.esExcluyente
                        ? 'Fase excluyente'
                        : 'Fase no excluyente'
                    }
                  />
                )}
              </div>
            )
          })}

          {puedeEditarTorneo && (
            <Boton
              type='button'
              variant='outline'
              size='sm'
              onClick={agregarFase}
              className='my-2'
            >
              <Plus className='w-3 h-3' />
              Agregar fase
            </Boton>
          )}

          {puedeEditarTorneo && (
            <div className='flex justify-end pt-4 border-t'>
              <Boton
                type='submit'
                className='h-11 w-40 text-sm'
                estaCargando={guardarMutation.isPending}
              >
                Guardar
              </Boton>
            </div>
          )}
        </form>
      }
    />
  )
}
