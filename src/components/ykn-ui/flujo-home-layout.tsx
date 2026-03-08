import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import type { BotoneraProps } from '@/components/ykn-ui/botonera'
import Botonera from '@/components/ykn-ui/botonera'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import { cn } from '@/lib/utils'

export interface DetalleItemData {
  clave: string
  valor: string
}

interface FlujoHomeLayoutProps {
  /** Título principal (para listas; si hay botonera como header completo, se ignora) */
  titulo?: React.ReactNode
  /** Props de Botonera: a la derecha cuando hay titulo, o header completo cuando no hay titulo */
  botonera?: BotoneraProps
  /** Oculta el BotonVolver en la botonera (ej. en listas) */
  ocultarBotonVolver?: boolean
  /** Items de detalle para la card del header (ej. Club, Torneo, Código) */
  detalleItems?: DetalleItemData[]
  /** Icono o imagen al lado del título (ej. escudo del club) */
  iconoOImagen?: React.ReactNode
  /** Contenido principal */
  contenido: React.ReactNode
  className?: string
  headerClassName?: string
}

export default function FlujoHomeLayout({
  titulo,
  botonera,
  ocultarBotonVolver = false,
  detalleItems,
  iconoOImagen,
  contenido,
  className,
  headerClassName
}: FlujoHomeLayoutProps) {
  const tieneHeader = titulo ?? botonera

  return (
    <div
      className={cn(
        'max-w-4xl mx-auto px-4',
        ocultarBotonVolver ? 'mt-9' : '-mt-5',
        className
      )}
    >
      {!ocultarBotonVolver && (
        <div className='mb-1'>
          <BotonVolver />
        </div>
      )}
      {tieneHeader && (
        <Card className='mb-6 shadow-md'>
          <CardHeader
            className={cn(
              'pb-4',
              titulo && botonera
                ? 'flex flex-row items-center justify-between'
                : undefined,
              headerClassName
            )}
          >
            {titulo && botonera ? (
              <>
                <div className='flex items-center gap-4'>
                  {iconoOImagen}
                  <CardTitle>{titulo}</CardTitle>
                </div>
                <Botonera {...botonera} />
              </>
            ) : botonera ? (
              <Botonera {...botonera} />
            ) : (
              <div className='flex items-center gap-4'>
                {iconoOImagen}
                <CardTitle>{titulo}</CardTitle>
              </div>
            )}
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
      )}

      <Card className='shadow-md'>
        <CardContent>{contenido}</CardContent>
      </Card>
    </div>
  )
}
