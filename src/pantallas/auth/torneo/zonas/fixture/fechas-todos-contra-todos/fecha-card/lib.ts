import { type JornadaDTO, LocalVisitanteEnum, PartidoDTO } from '@/api/clients'
import { etiquetaInterzonal } from '../../tipos'

export type RequestCargarResultados = {
  jornadaId: number
  resultadosVerificados: boolean
  partidos: PartidoDTO[]
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
      partidos: buildPartidosDto(partidos, valores)
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
    return { local: j.equipoLocal ?? '—', visitante: 'Libre' }
  }
  const esLocal = j.localOVisitante !== LocalVisitanteEnum._2
  const inter = etiquetaInterzonal(j.numero)
  return {
    local: esLocal ? (j.equipo ?? '—') : inter,
    visitante: esLocal ? inter : (j.equipo ?? '—')
  }
}

export function buildPartidosDto(
  partidos: PartidoDTO[],
  valores: { local: string; visitante: string }[]
): PartidoDTO[] {
  return partidos.map((p, i) => {
    const dto = new PartidoDTO()
    dto.id = p.id
    dto.categoriaId = p.categoriaId
    dto.categoria = p.categoria
    dto.resultadoLocal = valores[i]?.local ?? p.resultadoLocal ?? ''
    dto.resultadoVisitante = valores[i]?.visitante ?? p.resultadoVisitante ?? ''
    return dto
  })
}
