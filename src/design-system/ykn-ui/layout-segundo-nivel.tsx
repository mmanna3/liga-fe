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
import Icono, { type NombreIcono } from '@/design-system/ykn-ui/icono'
import { cn } from '@/logica-compartida/utils'

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
  /** Si false, el contenido no se envuelve en una Card (ej. cuando son varias cards separadas) */
  contenidoEnCard?: boolean
  /** Nombre del icono a la izquierda del título (ej. 'Torneos') */
  iconoTitulo?: NombreIcono
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
  subtitulo,
  contenidoEnCard = true,
  iconoTitulo
}: LayoutSegundoNivelProps) {
  const maxWidthClass = MAX_WIDTH_CLASSES[maxWidth] ?? 'max-w-lg'
  const mostrarHeaderEnCardPrincipal = !headerCard && titulo != null

  const headerCardContent = mostrarHeaderEnCardPrincipal && (
    <CardHeader
      className={cn(
        'px-2!',
        headerClassName ??
          (botonera ? 'flex flex-row items-start justify-between' : undefined)
      )}
    >
      <div className='flex items-center gap-2'>
        {iconoTitulo && (
          <Icono
            nombre={iconoTitulo}
            className='h-8 w-8 shrink-0 text-primary'
          />
        )}
        <div>
          <CardTitle className='text-3xl font-semibold text-gray-900'>
            {titulo}
          </CardTitle>
          {subtitulo && <CardDescription>{subtitulo}</CardDescription>}
        </div>
      </div>
      {botonera && <Botonera {...botonera} />}
    </CardHeader>
  )

  return (
    <div className={`${maxWidthClass} mx-auto px-2 space-y-4`}>
      <div className='mb-4'>
        <BotonVolver path={pathBotonVolver} />
      </div>
      {headerCard && (
        <Card className='px-4 py-6 rounded-xl border bg-white shadow-md'>
          {headerCard}
        </Card>
      )}
      {contenidoEnCard ? (
        <Card className='px-4 py-6 rounded-xl border bg-white shadow-md'>
          {headerCardContent}
          <CardContent
            className={cn(
              'px-0!',
              mostrarHeaderEnCardPrincipal ? 'pt-0' : undefined
            )}
          >
            {contenido}
          </CardContent>
          {footer}
        </Card>
      ) : (
        <>
          {headerCardContent && (
            <Card className='px-4 py-6 rounded-xl border bg-white shadow-md'>
              {headerCardContent}
            </Card>
          )}
          {contenido}
        </>
      )}
      {cardAdicional && (
        <Card className='px-4 py-6 rounded-xl border bg-white shadow-md'>
          <CardContent className='px-0!'>{cardAdicional}</CardContent>
        </Card>
      )}
    </div>
  )
}
