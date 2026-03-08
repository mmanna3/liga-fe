import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BotonVolver from '@/components/ykn-ui/boton-volver'

interface LayoutABMProps {
  /** Título del CardHeader (string) */
  titulo: string
  /** Contenido del CardContent */
  contenido: React.ReactNode
  /** Ruta del BotonVolver. Si no se provee, usa navigate(-1) */
  pathBotonVolver?: string
  /** Clases para el CardHeader (ej. flex flex-col items-center text-center) */
  headerClassName?: string
  /** Contenido opcional debajo del CardContent, dentro del Card (ej. botones de acción) */
  footer?: React.ReactNode
  /** Ancho máximo del contenedor: 'md' (448px) o 'lg' (512px). Por defecto 'lg' */
  maxWidth?: 'md' | 'lg'
}

export default function LayoutABM({
  titulo,
  contenido,
  pathBotonVolver,
  headerClassName,
  footer,
  maxWidth = 'lg'
}: LayoutABMProps) {
  const maxWidthClass = maxWidth === 'md' ? 'max-w-md' : 'max-w-lg'

  return (
    <div className={`${maxWidthClass} mx-auto px-4`}>
      <div className='mb-4'>
        <BotonVolver path={pathBotonVolver} />
      </div>
      <Card className='p-6 rounded-xl border bg-white shadow-md'>
        <CardHeader className={headerClassName}>
          <CardTitle className='text-3xl font-semibold text-gray-900'>
            {titulo}
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>{contenido}</CardContent>
        {footer}
      </Card>
    </div>
  )
}
