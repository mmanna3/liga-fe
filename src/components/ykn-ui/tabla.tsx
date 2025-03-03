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
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

type TablaProps<T> = {
  data: T[]
  columnas: ColumnDef<T>[]
  estaCargando: boolean
  hayError: boolean
}

export default function Tabla<T>({
  data,
  columnas,
  estaCargando,
  hayError
}: TablaProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns: columnas,
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
        placeholder='Buscar...'
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className='w-64'
      />

      {estaCargando ? (
        <p className='text-center text-gray-500'>Cargando datos...</p>
      ) : hayError ? (
        <p className='text-center text-red-500'>
          Ocurrió un error al cargar los datos.
        </p>
      ) : (
        <>
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columnas.length}
                    className='text-center py-4'
                  >
                    No se encontraron resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className='flex justify-between items-center mt-4'>
            <span className='text-xs text-gray-600'>
              Registros: {data.length}
            </span>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className='w-4 h-4' />
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
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
