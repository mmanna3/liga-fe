import { Card, CardContent, CardHeader, CardTitle } from '@/ui/base-ui/card'
import BotonVolver from '@/ui/ykn-ui/boton-volver'
import type { BotoneraProps } from '@/ui/ykn-ui/botonera'
import Botonera from '@/ui/ykn-ui/botonera'
import DetalleItem from '@/ui/ykn-ui/detalle-item'

export interface DetalleItemData {
  clave: string
  valor: string
}

interface CabeceraProps {
  titulo: React.ReactNode
  botonera?: BotoneraProps
  ocultarBotonVolver?: boolean
  detalleItems?: DetalleItemData[]
  iconoTitulo?: React.ReactNode
  /** Ruta del BotonVolver (ej. /clubs). Si no se provee, usa navigate(-1) */
  pathBotonVolver?: string
}

export default function Cabecera({
  titulo,
  botonera,
  ocultarBotonVolver = false,
  detalleItems,
  iconoTitulo,
  pathBotonVolver
}: CabeceraProps) {
  return (
    <>
      {!ocultarBotonVolver && (
        <div className='mb-4'>
          <BotonVolver
            path={pathBotonVolver}
            className={botonera?.classNameBotonVolver}
          />
        </div>
      )}
      <Card className='mb-6 shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between pb-4'>
          <div className='flex items-center gap-4'>
            {iconoTitulo}
            <CardTitle className='text-3xl font-bold text-primary'>
              {titulo}
            </CardTitle>
          </div>
          {botonera && <Botonera {...botonera} />}
        </CardHeader>
        {detalleItems && detalleItems.length > 0 && (
          <CardContent className='pt-0'>
            <div className='space-y-2'>
              {detalleItems.map((item, i) => (
                <DetalleItem key={i} clave={item.clave} valor={item.valor} />
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </>
  )
}
