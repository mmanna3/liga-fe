/**
 * @vitest-environment jsdom
 */
import { TooltipProvider } from '@/design-system/base-ui/tooltip'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ModalZonaLeyendas from './modal-zona-leyendas'

const leyendaGeneral = {
  id: 1,
  leyenda: 'Clasifican los primeros 2.',
  categoriaId: null,
  zonaId: 5,
  equipoId: null,
  equipo: null,
  quitaDePuntos: 0
}

const leyendaConEquipo = {
  id: 2,
  leyenda: 'Descuento por incomparecencia.',
  categoriaId: null,
  zonaId: 5,
  equipoId: 30,
  equipo: 'Equipo Alpha',
  quitaDePuntos: 3
}

const leyendasApi = vi.fn()
const zonasApi = vi.fn()
const leyendasPOST = vi.fn()
const leyendasPUT = vi.fn()
const leyendasDELETE = vi.fn()

vi.mock('@/api/api', () => ({
  api: {
    leyendasAll: (...args: unknown[]) => leyendasApi(...args),
    zonasGET: (...args: unknown[]) => zonasApi(...args),
    leyendasPOST: (...args: unknown[]) => leyendasPOST(...args),
    leyendasPUT: (...args: unknown[]) => leyendasPUT(...args),
    leyendasDELETE: (...args: unknown[]) => leyendasDELETE(...args)
  }
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: (opts: { queryKey: unknown[] }) => {
    if (opts.queryKey[0] === 'leyendas-zona') {
      return {
        data: [leyendaGeneral, leyendaConEquipo],
        isLoading: false,
        isError: false
      }
    }
    if (opts.queryKey[0] === 'zona-equipos-leyendas') {
      return {
        data: {
          equipos: [
            { id: 30, nombre: 'Equipo Alpha', club: 'Club A' },
            { id: 31, nombre: 'Equipo Beta', club: 'Club B' }
          ]
        },
        isLoading: false,
        isError: false
      }
    }
    return { data: undefined, isLoading: false, isError: false }
  },
  useQueryClient: () => ({ invalidateQueries: vi.fn() })
}))

// El mutate real ejecuta el fn (que llama a la api mockeada), a diferencia
// de un mock "tonto": así se puede distinguir crear (POST) de editar (PUT)
// por la llamada real a la api, no por instancia de mutation.
vi.mock('@/api/hooks/use-api-mutation', () => ({
  default: (opts: {
    fn: (arg: unknown) => Promise<unknown>
    antesDeMensajeExito?: () => void
  }) => ({
    mutate: (arg: unknown) => {
      void opts.fn(arg).then(() => opts.antesDeMensajeExito?.())
    },
    isPending: false,
    variables: undefined
  })
}))

function renderModal() {
  return render(
    <TooltipProvider>
      <ModalZonaLeyendas
        open
        onOpenChange={() => {}}
        faseId={10}
        zonaId={5}
        nombreTorneo='Torneo Test'
        nombreFase='Fase 1'
        tipoDeFase='Todos contra todos'
        nombreZona='Zona A'
        categorias={[]}
      />
    </TooltipProvider>
  )
}

describe('ModalZonaLeyendas — editar leyenda', () => {
  afterEach(() => {
    cleanup()
    leyendasPOST.mockReset()
    leyendasPUT.mockReset()
    leyendasDELETE.mockReset()
  })

  it('clickear "Editar leyenda" precarga el formulario y cambia el título/botón', () => {
    renderModal()

    const fila = screen
      .getByText('Descuento por incomparecencia.')
      .closest('li')!
    fireEvent.click(
      within(fila).getByRole('button', { name: 'Editar leyenda' })
    )

    expect(screen.getByText('Editar leyenda')).toBeTruthy()
    const textarea = screen.getByPlaceholderText(
      'Nueva Leyenda'
    ) as HTMLTextAreaElement
    expect(textarea.value).toBe('Descuento por incomparecencia.')
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy()
  })

  it('guardar en modo edición llama a leyendasPUT (no POST) con el id correcto', async () => {
    renderModal()

    const fila = screen
      .getByText('Descuento por incomparecencia.')
      .closest('li')!
    fireEvent.click(
      within(fila).getByRole('button', { name: 'Editar leyenda' })
    )

    const textarea = screen.getByPlaceholderText('Nueva Leyenda')
    fireEvent.change(textarea, { target: { value: 'Texto corregido.' } })

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(leyendasPUT).toHaveBeenCalledTimes(1)
    expect(leyendasPOST).not.toHaveBeenCalled()
    const [zonaIdArg, idArg, body] = leyendasPUT.mock.calls[0]
    expect(zonaIdArg).toBe(5)
    expect(idArg).toBe(2)
    expect(body).toMatchObject({
      id: 2,
      leyenda: 'Texto corregido.',
      equipoId: 30,
      quitaDePuntos: 3
    })
  })

  it('"Cancelar" sale del modo edición sin llamar a la api', () => {
    renderModal()

    const fila = screen.getByText('Clasifican los primeros 2.').closest('li')!
    fireEvent.click(
      within(fila).getByRole('button', { name: 'Editar leyenda' })
    )
    expect(screen.getByText('Editar leyenda')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByText('Nueva Leyenda')).toBeTruthy()
    const textarea = screen.getByPlaceholderText(
      'Nueva Leyenda'
    ) as HTMLTextAreaElement
    expect(textarea.value).toBe('')
    expect(leyendasPUT).not.toHaveBeenCalled()
    expect(leyendasPOST).not.toHaveBeenCalled()
  })

  it('guardar sin haber clickeado "Editar" sigue creando (POST)', () => {
    renderModal()

    fireEvent.change(screen.getByPlaceholderText('Nueva Leyenda'), {
      target: { value: 'Leyenda nueva.' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(leyendasPOST).toHaveBeenCalledTimes(1)
    expect(leyendasPUT).not.toHaveBeenCalled()
  })
})
