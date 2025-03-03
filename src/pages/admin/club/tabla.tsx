import { ClubDTO } from '@/api/clients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { rutasNavegacion } from '@/routes/rutas'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from '@tanstack/react-table'
import { MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type TablaProps = {
  data: ClubDTO[]
}

export default function Tabla({ data }: TablaProps) {
  const navigate = useNavigate()
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<ClubDTO>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => <span>{row.getValue('nombre')}</span>
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => (
        <Button
          variant='ghost'
          size='icon'
          onClick={() =>
            navigate(`${rutasNavegacion.detalleClub}/${row.original.id}`)
          }
        >
          <MoreVertical className='w-5 h-5' />
        </Button>
      )
    }
  ]

  // Inicializamos la tabla con react-table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
      sorting
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter
  })

  return (
    <div className='space-y-4'>
      <Input
        placeholder='Buscar club...'
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className='w-64'
      />

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className='cursor-pointer'
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getIsSorted() === 'asc'
                    ? ' 🔼'
                    : header.column.getIsSorted() === 'desc'
                      ? ' 🔽'
                      : ''}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='text-center py-4'>
                No se encontraron resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Controles de paginación */}
      <div className='flex justify-end items-center space-x-2'>
        <Button
          variant='outline'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <span>
          Página {table.getState().pagination.pageIndex + 1} de{' '}
          {table.getPageCount()}
        </span>
        <Button
          variant='outline'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
