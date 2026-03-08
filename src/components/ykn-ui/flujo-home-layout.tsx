import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FlujoHomeLayoutProps {
  titulo: React.ReactNode
  panelDerecho?: React.ReactNode
  contenido: React.ReactNode
  className?: string
  headerClassName?: string
}

export default function FlujoHomeLayout({
  titulo,
  panelDerecho,
  contenido,
  className,
  headerClassName
}: FlujoHomeLayoutProps) {
  return (
    <Card className={className}>
      <CardHeader
        className={cn(
          'flex flex-row items-center justify-between',
          headerClassName
        )}
      >
        <CardTitle>{titulo}</CardTitle>
        {panelDerecho}
      </CardHeader>
      <CardContent>{contenido}</CardContent>
    </Card>
  )
}
