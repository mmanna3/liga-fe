import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Boton } from '@/design-system/ykn-ui/boton'
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

interface DialogoBlanquearClaveUsuarioProps {
  usuarioId: number
  nombreUsuario: string
  trigger: React.ReactNode
}

export default function DialogoBlanquearClaveUsuario({
  usuarioId,
  nombreUsuario,
  trigger
}: DialogoBlanquearClaveUsuarioProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const mutation = useApiMutation({
    fn: async (id: number) => {
      await api.blanquearClave2(id)
    },
    antesDeMensajeExito: () => {
      setOpen(false)
      queryClient.invalidateQueries({
        queryKey: ['usuario', usuarioId.toString()]
      })
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
    mensajeDeExito: `La clave de '${nombreUsuario}' fue blanqueada`
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate(usuarioId)
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
            Al blanquear la clave, la próxima vez que el usuario intente iniciar
            sesión se le pedirá una nueva.
          </p>
          <DialogFooter>
            <Boton
              variant='outline'
              type='button'
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Boton>
            <Boton type='submit' estaCargando={mutation.isPending}>
              Blanquear clave
            </Boton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
