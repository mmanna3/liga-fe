import { BusquedaLogsDTO } from '@/api/clients'

interface Props {
  resultado: BusquedaLogsDTO
}

export default function ResultadosLogs({ resultado }: Props) {
  const hits = resultado.resultados ?? []

  return (
    <div className='flex flex-col gap-3'>
      {resultado.advertencias && resultado.advertencias.length > 0 && (
        <ul className='text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 space-y-1'>
          {resultado.advertencias.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      )}

      {resultado.truncado && (
        <p className='text-sm text-amber-800'>
          Se alcanzó el máximo de resultados ({resultado.maxResultados}). Refiná
          la búsqueda o reducí el rango de días.
        </p>
      )}

      {hits.length === 0 ? (
        <p className='text-sm text-muted-foreground'>
          No se encontraron líneas con &quot;{resultado.texto}&quot; en los
          últimos {resultado.dias} días.
        </p>
      ) : (
        <>
          <p className='text-sm text-muted-foreground'>
            {hits.length} resultado{hits.length === 1 ? '' : 's'}
          </p>
          <div className='max-h-[28rem] overflow-auto rounded-md border bg-muted/30'>
            <ul className='divide-y'>
              {hits.map((hit, i) => (
                <li key={`${hit.archivo}-${hit.linea}-${i}`} className='p-3'>
                  <div className='text-xs text-muted-foreground mb-1 flex flex-wrap gap-x-3 gap-y-0.5'>
                    {hit.fecha && <span>{formatearFecha(hit.fecha)}</span>}
                    <span>
                      {hit.archivo}
                      {hit.linea != null ? `:${hit.linea}` : ''}
                    </span>
                  </div>
                  <pre className='text-xs font-mono whitespace-pre-wrap break-all m-0'>
                    {hit.contenido}
                  </pre>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

function formatearFecha(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha
  if (Number.isNaN(d.getTime())) return String(fecha)
  return d.toLocaleString('es-AR')
}
