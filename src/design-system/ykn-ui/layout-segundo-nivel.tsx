import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import type { BotoneraProps } from '@/design-system/ykn-ui/botonera'
import Botonera from '@/design-system/ykn-ui/botonera'

const MAX_WIDTH_CLASSES: Record<string, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl'
}

interface LayoutSegundoNivelProps {
  /** Título del CardHeader (string). Ignorado si headerCard está definido */
  titulo?: string
  /** Contenido del CardContent */
  contenido: React.ReactNode
  /** Ruta del BotonVolver. Si no se provee, usa navigate(-1) */
  pathBotonVolver?: string
  /** Card separada que se renderiza arriba de la card de contenido (ej. header con título y subtítulo) */
  headerCard?: React.ReactNode
  /** Card separada que se renderiza debajo de la card de contenido */
  cardAdicional?: React.ReactNode
  /** Clases para el CardHeader (ej. flex flex-col items-center text-center) */
  headerClassName?: string
  /** Contenido opcional debajo del CardContent, dentro del Card (ej. botones de acción) */
  footer?: React.ReactNode
  /** Botonera opcional (iconos Editar, Eliminar, etc.) a la derecha del título, como en FlujoHomeLayout */
  botonera?: BotoneraProps
  /** Ancho máximo del contenedor: 'md' (448px), 'lg' (512px), 'xl' (576px), '2xl' (672px). Por defecto 'lg' */
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  /** Texto opcional debajo del título */
  subtitulo?: string
}

export default function LayoutSegundoNivel({
  titulo,
  contenido,
  pathBotonVolver,
  headerCard,
  cardAdicional,
  headerClassName,
  footer,
  botonera,
  maxWidth = 'lg',
  subtitulo
}: LayoutSegundoNivelProps) {
  const maxWidthClass = MAX_WIDTH_CLASSES[maxWidth] ?? 'max-w-lg'
  const mostrarHeaderEnCardPrincipal = !headerCard && titulo != null

  return (
    <div className={`${maxWidthClass} mx-auto px-4 space-y-4`}>
      <div className='mb-4'>
        <BotonVolver path={pathBotonVolver} />
      </div>
      {headerCard && (
        <Card className='p-6 rounded-xl border bg-white shadow-md'>
          {headerCard}
        </Card>
      )}
      <Card className='p-6 rounded-xl border bg-white shadow-md'>
        {mostrarHeaderEnCardPrincipal && (
          <CardHeader
            className={
              headerClassName ??
              (botonera
                ? 'flex flex-row items-start justify-between'
                : undefined)
            }
          >
            <div>
              <CardTitle className='text-3xl font-semibold text-gray-900'>
                {titulo}
              </CardTitle>
              {subtitulo && <CardDescription>{subtitulo}</CardDescription>}
            </div>
            {botonera && <Botonera {...botonera} />}
          </CardHeader>
        )}
        <CardContent
          className={mostrarHeaderEnCardPrincipal ? 'pt-0' : undefined}
        >
          {contenido}
        </CardContent>
        {footer}
      </Card>
      {cardAdicional && (
        <Card className='p-6 rounded-xl border bg-white shadow-md'>
          <CardContent>{cardAdicional}</CardContent>
        </Card>
      )}
    </div>
  )
}
