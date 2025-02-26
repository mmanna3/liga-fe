import { EquipoDTO } from '@/api/clients'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { rutasNavegacion } from '@/routes/rutas'
import { MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type TablaProps = {
  data: EquipoDTO[]
  isLoading: boolean
  isError: boolean
}

export default function Tabla({ data, isLoading, isError }: TablaProps) {
  const navigate = useNavigate()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Club</TableHead>
          <TableHead className='w-12' />
        </TableRow>
      </TableHeader>
      <TableBody>
        {isError ? (
          <TableRow>
            <TableCell colSpan={2}>
              <Alert variant='destructive' className='mb-4'>
                <AlertTitle className='text-xl font-semibold'>Error</AlertTitle>
                <AlertDescription>
                  No se pudieron recuperar los datos de la tabla.
                </AlertDescription>
              </Alert>
            </TableCell>
          </TableRow>
        ) : isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className='h-4 w-32' />
              </TableCell>
              <TableCell className='text-right'>
                <Skeleton className='h-4 w-8' />
              </TableCell>
            </TableRow>
          ))
        ) : (
          data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.nombre}</TableCell>
              <TableCell>{item.clubId}</TableCell>
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon'>
                      <MoreVertical className='w-5 h-5' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`${rutasNavegacion.detalleEquipo}/${item.id}`)
                      }
                    >
                      Detalle
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
