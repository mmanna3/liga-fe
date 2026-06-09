import { type JornadaDTO, LocalVisitanteEnum, PartidoDTO } from '@/api/clients'
import { etiquetaInterzonal } from '../../tipos'

export type RequestCargarResultados = {
  jornadaId: number
  resultadosVerificados: boolean
  partidos: PartidoDTO[]
}

export function ordenarPartidosPorCategoria(
  partidos: PartidoDTO[]
): PartidoDTO[] {
  return [...partidos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
}

export function buildRequests(
  jornada: JornadaDTO,
  partidos: PartidoDTO[],
  valores: { local: string; visitante: string }[],
  resultadosVerificados: boolean
): RequestCargarResultados[] {
  if (jornada.id == null) return []
  return [
    {
      jornadaId: jornada.id,
      resultadosVerificados,
      partidos: buildPartidosDtoParaCargar(partidos, valores)
    }
  ]
}

export function etiquetasLocalVisitanteJornada(j: JornadaDTO): {
  local: string
  visitante: string
} {
  if (j.tipo === 'Normal') {
    return { local: j.local ?? '—', visitante: j.visitante ?? '—' }
  }
  if (j.tipo === 'Libre') {
    const esLocal = j.localOVisitante !== LocalVisitanteEnum._2
    return {
      local: esLocal ? (j.equipo ?? '—') : 'Libre',
      visitante: esLocal ? 'Libre' : (j.equipo ?? '—')
    }
  }
  const esLocal = j.localOVisitante !== LocalVisitanteEnum._2
  const inter = etiquetaInterzonal(j.numero)
  return {
    local: esLocal ? (j.equipo ?? '—') : inter,
    visitante: esLocal ? inter : (j.equipo ?? '—')
  }
}

function resultadoEfectivo(
  p: PartidoDTO,
  fila: { local: string; visitante: string } | undefined
): { local: string; visitante: string } {
  return {
    local: fila?.local ?? p.resultadoLocal ?? '',
    visitante: fila?.visitante ?? p.resultadoVisitante ?? ''
  }
}

/** Local y visitante no vacíos (tras trim): fila lista para persistir. */
export function filaResultadoCompleta(
  local: string,
  visitante: string
): boolean {
  return local.trim() !== '' && visitante.trim() !== ''
}

function habiaAlgoEnServidor(p: PartidoDTO): boolean {
  const sL = (p.resultadoLocal ?? '').trim()
  const sV = (p.resultadoVisitante ?? '').trim()
  return sL !== '' || sV !== ''
}

/** Algún campo con texto pero el par incompleto: no se puede enviar al backend. */
export function hayFilasConResultadoIncompleto(
  partidos: PartidoDTO[],
  valores: { local: string; visitante: string }[]
): boolean {
  for (let i = 0; i < partidos.length; i++) {
    const { local, visitante } = resultadoEfectivo(partidos[i]!, valores[i])
    const el = local.trim()
    const ev = visitante.trim()
    if (el === '' && ev === '') continue
    if (!filaResultadoCompleta(local, visitante)) return true
  }
  return false
}

/** Hay algo distinto que la API puede persistir (flag y/o partidos a actualizar o limpiar). */
export function hayCambiosParaGuardarResultados(
  jornada: JornadaDTO,
  valores: { local: string; visitante: string }[],
  resultadosVerificados: boolean
): boolean {
  if (jornada.id == null) return false
  if (resultadosVerificados !== (jornada.resultadosVerificados ?? false))
    return true
  const lista = ordenarPartidosPorCategoria(jornada.partidos ?? [])
  if (lista.length === 0) return false
  if (valores.length !== lista.length) return false
  return buildPartidosDtoParaCargar(lista, valores).length > 0
}

/**
 * Partidos a enviar en cargar-resultados: pares completos nuevos o existentes,
 * más filas vacías explícitas cuando había resultado en servidor (borrado).
 */
export function buildPartidosDtoParaCargar(
  partidos: PartidoDTO[],
  valores: { local: string; visitante: string }[]
): PartidoDTO[] {
  const out: PartidoDTO[] = []
  for (let i = 0; i < partidos.length; i++) {
    const p = partidos[i]!
    const { local, visitante } = resultadoEfectivo(p, valores[i])
    const el = local.trim()
    const ev = visitante.trim()

    if (filaResultadoCompleta(local, visitante)) {
      const dto = new PartidoDTO()
      dto.id = p.id
      dto.categoriaId = p.categoriaId
      dto.categoria = p.categoria
      dto.resultadoLocal = el
      dto.resultadoVisitante = ev
      out.push(dto)
      continue
    }

    if (el === '' && ev === '' && habiaAlgoEnServidor(p)) {
      const dto = new PartidoDTO()
      dto.id = p.id
      dto.categoriaId = p.categoriaId
      dto.categoria = p.categoria
      dto.resultadoLocal = ''
      dto.resultadoVisitante = ''
      out.push(dto)
    }
  }
  return out
}

export function buildPartidosDto(
  partidos: PartidoDTO[],
  valores: { local: string; visitante: string }[]
): PartidoDTO[] {
  return partidos.map((p, i) => {
    const { local, visitante } = resultadoEfectivo(p, valores[i])
    const dto = new PartidoDTO()
    dto.id = p.id
    dto.categoriaId = p.categoriaId
    dto.categoria = p.categoria
    dto.resultadoLocal = local
    dto.resultadoVisitante = visitante
    return dto
  })
}
