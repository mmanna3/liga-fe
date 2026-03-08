import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import type { BotoneraProps } from '@/design-system/ykn-ui/botonera'
import Botonera from '@/design-system/ykn-ui/botonera'
import DetalleItem from '@/design-system/ykn-ui/detalle-item'
import Icono, { type NombreIcono } from '@/design-system/ykn-ui/icono'

export interface DetalleItemData {
  clave: string
  valor: string
}

interface CabeceraProps {
  titulo: React.ReactNode
  botonera?: BotoneraProps
  ocultarBotonVolver?: boolean
  detalleItems?: DetalleItemData[]
  /** Nombre del icono a mostrar (ej. 'Torneos'). Cabecera lo renderiza con Icono. */
  iconoTitulo?: NombreIcono
  /** Contenido personalizado (ej. imagen de escudo). Si se provee, tiene prioridad sobre iconoTitulo. */
  imagenTitulo?: React.ReactNode
  /** Ruta del BotonVolver (ej. /clubs). Si no se provee, usa navigate(-1) */
  pathBotonVolver?: string
}

export default function Cabecera({
  titulo,
  botonera,
  ocultarBotonVolver = false,
  detalleItems,
  iconoTitulo,
  imagenTitulo,
  pathBotonVolver
}: CabeceraProps) {
  const contenidoIcono =
    imagenTitulo ??
    (iconoTitulo && <Icono nombre={iconoTitulo} className='h-8 w-8' />)

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
            {contenidoIcono}
            <CardTitle className='text-3xl font-bold'>{titulo}</CardTitle>
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
