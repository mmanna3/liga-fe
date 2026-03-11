import { Card, CardContent } from '@/design-system/base-ui/card'
import type { BotoneraProps } from '@/design-system/ykn-ui/botonera'
import type { DetalleItemData } from '@/design-system/ykn-ui/cabecera'
import Cabecera from '@/design-system/ykn-ui/cabecera'
import type { NombreIcono } from '@/design-system/ykn-ui/icono'

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
  /** Nombre del icono al lado del título (ej. 'Torneos'). Cabecera lo renderiza. */
  iconoTitulo?: NombreIcono
  /** Contenido personalizado (ej. imagen de escudo). Prioridad sobre iconoTitulo. */
  imagenTitulo?: React.ReactNode
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
  imagenTitulo,
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
        imagenTitulo={imagenTitulo}
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
