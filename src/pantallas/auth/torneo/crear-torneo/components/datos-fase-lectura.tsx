import { ZonaDeFaseDTO } from '@/api/clients'
import { Label } from '@/design-system/base-ui/label'

interface DatosFaseLecturaProps {
  formato: string
  zonas: ZonaDeFaseDTO[]
}

export function DatosFaseLectura({ formato, zonas }: DatosFaseLecturaProps) {
  return (
    <div className='space-y-2'>
      {zonas != null && zonas.length > 0 && (
        <div>
          <Label className='text-muted-foreground text-sm'>Zonas</Label>
          <p className='font-medium'>
            {zonas.map((x, index) => (
              <span key={x.nombre}>
                <span>{x.nombre} </span>
                <span className='text-muted-foreground text-sm'>
                  (
                  {x.cantidadDeEquipos != 1
                    ? `${x.cantidadDeEquipos} equipos`
                    : '1 equipo'}
                  )
                </span>
                {index < zonas.length - 1 && <span>, </span>}
              </span>
            ))}
          </p>
        </div>
      )}
      <div>
        <Label className='text-muted-foreground text-sm'>Formato</Label>
        <p className='font-medium'>{formato || '—'}</p>
      </div>
    </div>
  )
}
