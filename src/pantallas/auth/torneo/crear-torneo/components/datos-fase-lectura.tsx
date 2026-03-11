import { Label } from '@/design-system/base-ui/label'

interface DatosFaseLecturaProps {
  formato: string
  excluyente: string
}

export function DatosFaseLectura({
  formato,
  excluyente
}: DatosFaseLecturaProps) {
  return (
    <div className='space-y-2'>
      <div>
        <Label className='text-muted-foreground text-sm'>Formato</Label>
        <p className='font-medium'>{formato || '—'}</p>
      </div>
      <div>
        <Label className='text-muted-foreground text-sm'>Excluyente</Label>
        <p className='font-medium'>{excluyente || '—'}</p>
      </div>
    </div>
  )
}
