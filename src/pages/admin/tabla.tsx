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
import { MoreVertical } from 'lucide-react'

type TablaProps = {
  data: { id: string | number; nombre: string }[]
  isLoading: boolean
}

export default function Tabla({ data, isLoading }: TablaProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead className='w-12' />
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
                </TableCell>
                <TableCell className='text-right'>
                  <Skeleton className='h-4 w-8' />
                </TableCell>
              </TableRow>
            ))
          : data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.nombre}</TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <MoreVertical className='w-5 h-5' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={() => alert(`Detalle de ${item.nombre}`)}
                      >
                        Detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => alert(`Equipos de ${item.nombre}`)}
                      >
                        Equipos
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  )
}
