import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Button } from '@/design-system/base-ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/design-system/base-ui/dialog'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

interface DialogoBlanquearClaveDelegadoProps {
  delegadoId: number
  nombreUsuario: string
  trigger: React.ReactNode
}

export default function DialogoBlanquearClaveDelegado({
  delegadoId,
  nombreUsuario,
  trigger
}: DialogoBlanquearClaveDelegadoProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useApiMutation({
    fn: async (id: number) => {
      await api.blanquearClave(id)
    },
    antesDeMensajeExito: () => {
      setOpen(false)
      queryClient.invalidateQueries({
        queryKey: ['delegado', delegadoId.toString()]
      })
    },
    mensajeDeExito: `La clave de '${nombreUsuario}' fue blanqueada`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate(delegadoId)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Blanquear clave</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <p className='text-muted-foreground text-sm'>
            Al blanquear la clave, la próxima vez que el delegado intente
            iniciar sesión en la APP se le pedirá una nueva.
          </p>
          <DialogFooter>
            <Button
              variant='outline'
              type='button'
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending ? 'Blanqueando...' : 'Blanquear clave'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
