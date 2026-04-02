import { Card, CardContent } from '@/design-system/base-ui/card'
import {
  ALTURA_SLOT_BRACKET_BASE,
  PartidoCardBracket
} from '../generacion/eliminacion-directa/fixture-vista-previa'

export type PartidoColumna = {
  key: string | number
  rIdx: number
  partidos: { local: string | null; visitante: string | null }[]
}

export function Partidos({ columnas }: { columnas: PartidoColumna[] }) {
  return (
    <Card>
      <CardContent>
        <div className='flex gap-6'>
          {columnas.map((col) => {
            const alturaSlot = ALTURA_SLOT_BRACKET_BASE * Math.pow(2, col.rIdx)
            return (
              <div key={col.key} className='flex flex-col flex-1 min-w-[200px]'>
                {col.partidos.map((p, mIdx) => (
                  <div
                    key={mIdx}
                    className='flex items-center py-3'
                    style={{ height: alturaSlot }}
                  >
                    <PartidoCardBracket
                      local={p.local}
                      visitante={p.visitante}
                    />
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
