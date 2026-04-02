import useApiQuery from '@/api/hooks/use-api-query'
import { HttpClientWrapper } from '@/api/http-client-wrapper'
import {
  FechaEliminacionDirectaDTO,
  LocalVisitanteEnum,
  type JornadaDTO
} from '@/api/clients'
import { addWeeks, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { NOMBRES_INSTANCIA_BRACKET } from '../generacion/eliminacion-directa/fixture-vista-previa'
import { Partidos } from './partidos'

const http = new HttpClientWrapper()

async function fetchFechasEliminacionDirecta(
  zonaId: number
): Promise<FechaEliminacionDirectaDTO[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const url = `${baseUrl}/api/Zona/${zonaId}/fechas`
  const res = await http.fetch(url, { headers: { Accept: 'text/plain' } })
  if (!res.ok) {
    throw new Error(`No se pudieron cargar las fechas (${res.status})`)
  }
  const text = await res.text()
  const data = text === '' ? null : JSON.parse(text)
  if (!Array.isArray(data)) return []
  return data.map((item) => FechaEliminacionDirectaDTO.fromJS(item))
}

/** Cantidad de equipos de la primera ronda (n = 2^k). */
function inferirNEquiposBracket(
  fechas: FechaEliminacionDirectaDTO[]
): number | null {
  const ids = fechas.map((f) => f.instanciaId ?? 0)
  const porMax = Math.max(0, ...ids)
  const primera = [...fechas].sort(
    (a, b) => (b.instanciaId ?? 0) - (a.instanciaId ?? 0)
  )[0]
  const porJornadas = (primera?.jornadas?.length ?? 0) * 2

  const esNValido = (n: number) => n >= 2 && Number.isInteger(Math.log2(n))

  if (porMax > 0 && esNValido(porMax)) return porMax
  if (porJornadas > 0 && esNValido(porJornadas)) return porJornadas
  return null
}

function tituloColumna(
  equiposEnRonda: number,
  fecha: FechaEliminacionDirectaDTO | undefined,
  rIdx: number
): string {
  if (fecha?.instanciaNombre?.trim()) return fecha.instanciaNombre.trim()
  if (NOMBRES_INSTANCIA_BRACKET[equiposEnRonda]) {
    return NOMBRES_INSTANCIA_BRACKET[equiposEnRonda]
  }
  return `Ronda ${rIdx + 1}`
}

function partidoDesdeJornada(j: JornadaDTO): {
  local: string | null
  visitante: string | null
} {
  if (j.tipo === 'Normal') {
    return { local: j.local ?? null, visitante: j.visitante ?? null }
  }
  if (j.tipo === 'Libre') {
    return { local: j.equipoLocal ?? null, visitante: 'Libre' }
  }
  const esLocal = j.localOVisitante !== LocalVisitanteEnum._2
  return esLocal
    ? { local: j.equipo ?? null, visitante: 'Interzonal' }
    : { local: 'Interzonal', visitante: j.equipo ?? null }
}

export function FechasEliminacionDirecta({ zonaId }: { zonaId: number }) {
  const { data: fechas = [], isPending } = useApiQuery({
    key: ['fechasEliminacionDirecta', zonaId],
    fn: () => fetchFechasEliminacionDirecta(zonaId),
    activado: Number.isFinite(zonaId)
  })

  const nEquipos = inferirNEquiposBracket(fechas)
  const fechasPorInstanciaId = new Map<number, FechaEliminacionDirectaDTO>()
  for (const f of fechas) {
    if (f.instanciaId != null) {
      fechasPorInstanciaId.set(f.instanciaId, f)
    }
  }

  if (isPending) {
    return (
      <p className='text-muted-foreground py-4'>Cargando fechas del fixture…</p>
    )
  }

  if (fechas.length === 0) {
    return (
      <p className='text-muted-foreground py-4'>
        No hay fechas cargadas para esta zona.
      </p>
    )
  }

  if (nEquipos == null) {
    return (
      <p className='text-muted-foreground py-4'>
        No se pudo armar la llave: revisá que la primera instancia tenga un
        tamaño válido (potencia de 2).
      </p>
    )
  }

  const totalRondas = Math.log2(nEquipos)

  const fechaPrimeraRonda = fechasPorInstanciaId.get(nEquipos)
  const primeraFechaBase =
    fechaPrimeraRonda?.dia ??
    [...fechas]
      .map((f) => f.dia)
      .filter((d): d is Date => d != null)
      .sort((a, b) => a.getTime() - b.getTime())[0]

  const columnas = Array.from({ length: totalRondas }, (_, rIdx) => {
    const equiposEnRonda = nEquipos / Math.pow(2, rIdx)
    const instanciaId = equiposEnRonda
    const cantidadPartidos = equiposEnRonda / 2
    const fecha = fechasPorInstanciaId.get(instanciaId)
    const titulo = tituloColumna(equiposEnRonda, fecha, rIdx)
    const diaMostrado =
      fecha?.dia != null
        ? fecha.dia
        : primeraFechaBase != null
          ? addWeeks(primeraFechaBase, rIdx)
          : undefined

    const partidos: { local: string | null; visitante: string | null }[] = []
    for (let i = 0; i < cantidadPartidos; i++) {
      const j = fecha?.jornadas?.[i]
      partidos.push(
        j != null ? partidoDesdeJornada(j) : { local: null, visitante: null }
      )
    }

    return {
      rIdx,
      instanciaId,
      key: fecha?.id ?? `ronda-${instanciaId}`,
      titulo,
      diaMostrado,
      partidos
    }
  })

  return (
    <div>
      <div className='flex gap-6 mb-2'>
        {columnas.map((col) => (
          <div key={col.key} className='flex-1 min-w-[200px] text-center'>
            <h4 className='text-sm font-semibold'>{col.titulo}</h4>
            <p className='text-xs text-muted-foreground'>
              {col.diaMostrado != null
                ? format(col.diaMostrado, "EEEE d 'de' MMMM", { locale: es })
                : '—'}
            </p>
          </div>
        ))}
      </div>

      <Partidos columnas={columnas} />
    </div>
  )
}
