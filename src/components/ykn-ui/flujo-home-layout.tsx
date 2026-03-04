import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FlujoHomeLayoutProps {
  titulo: React.ReactNode
  panelDerecho?: React.ReactNode
  contenido: React.ReactNode
}

export default function FlujoHomeLayout({
  titulo,
  panelDerecho,
  contenido
}: FlujoHomeLayoutProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>{titulo}</CardTitle>
        {panelDerecho}
      </CardHeader>
      <CardContent>{contenido}</CardContent>
    </Card>
  )
}
