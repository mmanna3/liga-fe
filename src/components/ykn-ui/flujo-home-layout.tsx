import { Card, CardContent } from '@/components/ui/card'
import Cabecera from '@/components/ykn-ui/cabecera'
import type { DetalleItemData } from '@/components/ykn-ui/cabecera'
import type { BotoneraProps } from '@/components/ykn-ui/botonera'

export type { DetalleItemData }

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
  iconoTitulo?: React.ReactNode
  /** Contenido principal */
  contenido: React.ReactNode
}

export default function FlujoHomeLayout({
  titulo,
  botonera,
  ocultarBotonVolver = false,
  detalleItems,
  iconoTitulo,
  contenido
}: FlujoHomeLayoutProps) {
  return (
    <div
      className={`max-w-4xl mx-auto px-4 ${ocultarBotonVolver ? 'pt-13' : '-pt-1'}`}
    >
      <Cabecera
        titulo={titulo}
        botonera={botonera}
        ocultarBotonVolver={ocultarBotonVolver}
        detalleItems={detalleItems}
        iconoTitulo={iconoTitulo}
      />

      <Card className='shadow-md'>
        <CardContent>{contenido}</CardContent>
      </Card>
    </div>
  )
}
