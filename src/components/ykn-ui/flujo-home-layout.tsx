import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import type { BotoneraProps } from '@/components/ykn-ui/botonera'
import Botonera from '@/components/ykn-ui/botonera'
import DetalleItem from '@/components/ykn-ui/detalle-item'

export interface DetalleItemData {
  clave: string
  valor: string
}

interface FlujoHomeLayoutProps {
  /** Título principal (obligatorio) */
  titulo: React.ReactNode
  /** Props de Botonera: siempre a la derecha cuando se proporciona */
  botonera?: BotoneraProps
  /** Oculta el BotonVolver (ej. en listas) */
  ocultarBotonVolver?: boolean
  /** Items de detalle para la card del header */
  detalleItems?: DetalleItemData[]
  /** Icono o imagen al lado del título */
  iconoOImagen?: React.ReactNode
  /** Contenido principal */
  contenido: React.ReactNode
}

export default function FlujoHomeLayout({
  titulo,
  botonera,
  ocultarBotonVolver = false,
  detalleItems,
  iconoOImagen,
  contenido
}: FlujoHomeLayoutProps) {
  return (
    <div
      className={`max-w-4xl mx-auto px-4 ${ocultarBotonVolver ? 'pt-13' : '-pt-1'}`}
    >
      {!ocultarBotonVolver && (
        <div className='mb-4'>
          <BotonVolver className={botonera?.classNameBotonVolver} />
        </div>
      )}
      <Card className='mb-6 shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between pb-4'>
          <div className='flex items-center gap-4'>
            {iconoOImagen}
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

      <Card className='shadow-md'>
        <CardContent>{contenido}</CardContent>
      </Card>
    </div>
  )
}
