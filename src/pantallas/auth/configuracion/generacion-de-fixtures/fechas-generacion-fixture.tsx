import { api } from '@/api/api'
import type {
  FixtureAlgoritmoFechaDTO,
  IFixtureAlgoritmoFechaDTO
} from '@/api/clients'
import { ApiException } from '@/api/clients'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/design-system/base-ui/table'
import { Boton } from '@/design-system/ykn-ui/boton'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { Input } from '@/design-system/ykn-ui/input'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import TablaLocalVisitante from './generacion-fixture-tabla-local-visitante'

function agruparPorFecha(
  fechas: FixtureAlgoritmoFechaDTO[] | undefined
): Map<number, FixtureAlgoritmoFechaDTO[]> {
  const mapa = new Map<number, FixtureAlgoritmoFechaDTO[]>()
  if (!fechas) return mapa
  for (const f of fechas) {
    const lista = mapa.get(f.fecha) ?? []
    lista.push(f)
    mapa.set(f.fecha, lista)
  }
  return mapa
}

function buildFechasEdicion(data: {
  cantidadDeEquipos: number
  fechas?: FixtureAlgoritmoFechaDTO[]
}): IFixtureAlgoritmoFechaDTO[] {
  const N = data.cantidadDeEquipos
  const numFechas = Math.max(0, N - 1)
  const filasPorFecha = N > 0 ? Math.floor(N / 2) : 0
  const fechasPorNumero = agruparPorFecha(data.fechas)
  const result: IFixtureAlgoritmoFechaDTO[] = []
  for (let numFecha = 1; numFecha <= numFechas; numFecha++) {
    const filas = fechasPorNumero.get(numFecha) ?? []
    for (let row = 0; row < filasPorFecha; row++) {
      const existente = filas[row]
      result.push(
        existente != null
          ? {
              id: existente.id,
              fecha: numFecha,
              equipoLocal: existente.equipoLocal,
              equipoVisitante: existente.equipoVisitante
            }
          : { fecha: numFecha, equipoLocal: 0, equipoVisitante: 0 }
      )
    }
  }
  return result
}

function getSlotIndex(
  numFecha: number,
  rowIndex: number,
  filasPorFecha: number
) {
  return (numFecha - 1) * filasPorFecha + rowIndex
}

export default function FechasGeneracionFixture() {
  const { id } = useParams<{ id: string }>()
  const idNum = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['fixtureAlgoritmo', idNum],
    queryFn: () => api.fixtureAlgoritmoGET(idNum),
    enabled: Number.isFinite(idNum)
  })

  const [fechasEdicion, setFechasEdicion] = useState<
    IFixtureAlgoritmoFechaDTO[]
  >([])

  useEffect(() => {
    if (data) setFechasEdicion(buildFechasEdicion(data))
  }, [data])

  const N = data?.cantidadDeEquipos ?? 0
  const numFechas = Math.max(0, N - 1)
  const filasPorFecha = N > 0 ? Math.floor(N / 2) : 0

  const setCelda = useCallback(
    (
      numFecha: number,
      rowIndex: number,
      campo: 'equipoLocal' | 'equipoVisitante',
      valor: number
    ) => {
      setFechasEdicion((prev) => {
        const idx = getSlotIndex(numFecha, rowIndex, filasPorFecha)
        const copia = [...prev]
        if (copia[idx] == null) return prev
        copia[idx] = { ...copia[idx]!, [campo]: valor }
        return copia
      })
    },
    [filasPorFecha]
  )

  const [guardando, setGuardando] = useState(false)
  const handleGuardar = useCallback(async () => {
    if (!data) return
    setGuardando(true)
    try {
      const body = {
        id: data.id,
        fixtureAlgoritmoId: data.fixtureAlgoritmoId,
        cantidadDeEquipos: data.cantidadDeEquipos,
        nombre: data.nombre,
        fechas: fechasEdicion
      }
      await api.fixtureAlgoritmoPUT(
        idNum,
        body as Parameters<typeof api.fixtureAlgoritmoPUT>[1]
      )
      await queryClient.invalidateQueries({
        queryKey: ['fixtureAlgoritmo', idNum]
      })
      toast.success('Se guardaron los cambios')
      navigate(-1)
    } catch (err) {
      let mensaje = 'Error al guardar.'
      if (ApiException.isApiException(err) && err.status === 400) {
        try {
          const body = JSON.parse(err.response) as {
            title?: string
            errors?: Record<string, string[]>
          }
          if (body?.title) mensaje = body.title
          else if (body?.errors && typeof body.errors === 'object') {
            const first = Object.entries(body.errors)[0]
            mensaje = first
              ? `${first[0]}: ${first[1]?.join?.(' ') ?? first[1]}`
              : err.response
          } else mensaje = err.response || mensaje
        } catch {
          mensaje = err.response || mensaje
        }
      } else if (err instanceof Error) mensaje = err.message
      toast.error(mensaje)
    } finally {
      setGuardando(false)
    }
  }, [data, idNum, fechasEdicion, queryClient, navigate])

  const contenido = isLoading ? (
    <p className='text-sm text-muted-foreground italic text-center py-4'>
      Cargando…
    </p>
  ) : !data ? (
    <p className='text-sm text-muted-foreground italic text-center py-4'>
      No se encontró el algoritmo.
    </p>
  ) : (
    <div className='space-y-4 py-6'>
      <TablaLocalVisitante fechas={fechasEdicion} cantidadDeEquipos={N} />

      <div className='flex justify-end'>
        <Boton
          onClick={handleGuardar}
          disabled={guardando}
          estaCargando={guardando}
        >
          Guardar
        </Boton>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        {Array.from({ length: numFechas }, (_, i) => i + 1).map((numFecha) => (
          <Card key={numFecha}>
            <CardHeader>
              <CardTitle>FECHA {numFecha}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LOCAL</TableHead>
                    <TableHead>VISITANTE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: filasPorFecha }, (_, rowIndex) => {
                    const slotIndex = getSlotIndex(
                      numFecha,
                      rowIndex,
                      filasPorFecha
                    )
                    const par = fechasEdicion[slotIndex]
                    const local = par?.equipoLocal ?? 0
                    const visitante = par?.equipoVisitante ?? 0
                    return (
                      <TableRow key={rowIndex}>
                        <TableCell>
                          <Input
                            type='number'
                            min={1}
                            max={N}
                            className='w-16 h-8 text-center'
                            value={local > 0 ? local : ''}
                            onChange={(e) => {
                              const v = e.target.value
                              const n =
                                v === ''
                                  ? 0
                                  : Math.max(1, Math.min(N, Number(v)))
                              setCelda(numFecha, rowIndex, 'equipoLocal', n)
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type='number'
                            min={1}
                            max={N}
                            className='w-16 h-8 text-center'
                            value={visitante > 0 ? visitante : ''}
                            onChange={(e) => {
                              const v = e.target.value
                              const n =
                                v === ''
                                  ? 0
                                  : Math.max(1, Math.min(N, Number(v)))
                              setCelda(numFecha, rowIndex, 'equipoVisitante', n)
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <FlujoHomeLayout
      titulo={`Generación de fixture · ${N} equipos - ${data?.nombre ?? ''}`}
      subtitulo={`Usá los números desde el 1 hasta el ${N} para indicar cómo se van a generar las fechas en zonas con este número de equipos.`}
      iconoTitulo='Fixture'
      pathBotonVolver={rutasNavegacion.generacionDeFixtures}
      contenidoEnCard={false}
      contenido={contenido}
      contenedorClassName='max-w-6xl'
    />
  )
}
