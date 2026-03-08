import { Card, CardContent } from '@/ui/base-ui/card'
import Cabecera from '@/ui/ykn-ui/cabecera'
import type { DetalleItemData } from '@/ui/ykn-ui/cabecera'
import type { BotoneraProps } from '@/ui/ykn-ui/botonera'

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
  /** Ruta del BotonVolver (ej. /clubs). Si no se provee, usa navigate(-1) */
  pathBotonVolver?: string
  /** Contenido principal */
  contenido: React.ReactNode
  /** Si false, el contenido no se envuelve en una Card (ej. cuando es un grid de cards) */
  contenidoEnCard?: boolean
  /** Clases del contenedor (reemplaza max-w-4xl por defecto). Ej: max-w-6xl */
  contenedorClassName?: string
}

export default function FlujoHomeLayout({
  titulo,
  botonera,
  ocultarBotonVolver = false,
  detalleItems,
  iconoTitulo,
  pathBotonVolver,
  contenido,
  contenidoEnCard = true,
  contenedorClassName
}: FlujoHomeLayoutProps) {
  return (
    <div
      className={`${contenedorClassName ?? 'max-w-4xl'} mx-auto px-4 ${ocultarBotonVolver ? 'pt-13' : '-pt-1'}`}
    >
      <Cabecera
        titulo={titulo}
        botonera={botonera}
        ocultarBotonVolver={ocultarBotonVolver}
        detalleItems={detalleItems}
        iconoTitulo={iconoTitulo}
        pathBotonVolver={pathBotonVolver}
      />

      {contenidoEnCard ? (
        <Card className='shadow-md'>
          <CardContent>{contenido}</CardContent>
        </Card>
      ) : (
        contenido
      )}
    </div>
  )
}
