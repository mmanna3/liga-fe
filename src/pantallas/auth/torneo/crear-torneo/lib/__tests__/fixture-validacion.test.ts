import { describe, expect, it } from 'vitest'
import {
  calcularTotalFechas,
  calcularTotalFechasPorZonas,
  esPotenciaDe2,
  esConfiguracionValida,
  esValidoParaEliminacion,
  validarEmparejamientoInterzonal,
  validarZonas
} from '../fixture-validacion'
import type { EntradaDeZona } from '../fixture-tipos'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const zona = (
  id: string,
  cantEquipos: number,
  libres = 0,
  interzonales = 0
): EntradaDeZona => ({
  id,
  nombre: `Zona ${id}`,
  equipos: Array.from({ length: cantEquipos }, (_, i) => ({
    id: i + 1,
    nombre: `Equipo ${i + 1}`
  })),
  fechasLibres: libres,
  fechasInterzonales: interzonales
})

// ─── esPotenciaDe2 ───────────────────────────────────────────────────────────

describe('esPotenciaDe2', () => {
  it.each([
    [0, false],
    [1, false],
    [2, true],
    [3, false],
    [4, true],
    [6, false],
    [7, false],
    [8, true],
    [15, false],
    [16, true],
    [32, true],
    [64, true],
    [-4, false]
  ])('esPotenciaDe2(%i) === %s', (n, esperado) => {
    expect(esPotenciaDe2(n)).toBe(esperado)
  })
})

// ─── esConfiguracionValida ───────────────────────────────────────────────────

describe('esConfiguracionValida', () => {
  it('total par mínimo es válido', () => {
    expect(esConfiguracionValida(2, 0, 0)).toBe(true)
  })

  it('total impar es inválido', () => {
    expect(esConfiguracionValida(3, 0, 0)).toBe(false)
  })

  it('impar de equipos con 1 libre queda par → válido', () => {
    expect(esConfiguracionValida(3, 1, 0)).toBe(true)
  })

  it('par de equipos con 1 libre queda impar → inválido', () => {
    expect(esConfiguracionValida(4, 1, 0)).toBe(false)
  })

  it('equipos + libres + interzonales todos contribuyen al total', () => {
    expect(esConfiguracionValida(4, 1, 1)).toBe(true) // 4+1+1 = 6 (par)
    expect(esConfiguracionValida(4, 2, 1)).toBe(false) // 4+2+1 = 7 (impar)
  })

  it('total < 2 es inválido', () => {
    expect(esConfiguracionValida(1, 0, 0)).toBe(false)
    expect(esConfiguracionValida(0, 0, 0)).toBe(false)
  })

  it('16 equipos, sin extras → válido', () => {
    expect(esConfiguracionValida(16, 0, 0)).toBe(true)
  })

  it('17 equipos, 1 libre → válido', () => {
    expect(esConfiguracionValida(17, 1, 0)).toBe(true)
  })
})

// ─── esValidoParaEliminacion ─────────────────────────────────────────────────

describe('esValidoParaEliminacion', () => {
  it('4 equipos es válido', () => {
    expect(esValidoParaEliminacion(4, 0, 0)).toBe(true)
  })

  it('6 equipos no es potencia de 2', () => {
    expect(esValidoParaEliminacion(6, 0, 0)).toBe(false)
  })

  it('7 equipos + 1 libre = 8 → válido', () => {
    expect(esValidoParaEliminacion(7, 1, 0)).toBe(true)
  })

  it('5 equipos + 1 libre = 6 → inválido', () => {
    expect(esValidoParaEliminacion(5, 1, 0)).toBe(false)
  })

  it('8 equipos → válido', () => {
    expect(esValidoParaEliminacion(8, 0, 0)).toBe(true)
  })

  it('16 equipos → válido', () => {
    expect(esValidoParaEliminacion(16, 0, 0)).toBe(true)
  })

  it('3 equipos → inválido', () => {
    expect(esValidoParaEliminacion(3, 0, 0)).toBe(false)
  })

  it('6 equipos + 2 libres = 8 → válido', () => {
    expect(esValidoParaEliminacion(6, 2, 0)).toBe(true)
  })
})

// ─── validarZonas ────────────────────────────────────────────────────────────

describe('validarZonas / todos-contra-todos', () => {
  it('zona con cantidad par de equipos → válida', () => {
    const [v] = validarZonas([zona('A', 4)], 'todos-contra-todos')
    expect(v.esValida).toBe(true)
    expect(v.cantidadEquipos).toBe(4)
    expect(v.totalParticipantes).toBe(4)
  })

  it('zona con cantidad impar de equipos → inválida', () => {
    const [v] = validarZonas([zona('A', 3)], 'todos-contra-todos')
    expect(v.esValida).toBe(false)
  })

  it('cantidad impar + 1 libre → válida', () => {
    const [v] = validarZonas([zona('A', 3, 1)], 'todos-contra-todos')
    expect(v.esValida).toBe(true)
    expect(v.totalParticipantes).toBe(4)
  })

  it('múltiples zonas, solo una inválida', () => {
    const resultado = validarZonas(
      [zona('A', 4), zona('B', 3)],
      'todos-contra-todos'
    )
    expect(resultado[0].esValida).toBe(true)
    expect(resultado[1].esValida).toBe(false)
  })

  it('zona vacía (0 equipos) → inválida', () => {
    const [v] = validarZonas([zona('A', 0)], 'todos-contra-todos')
    expect(v.esValida).toBe(false)
  })
})

describe('validarZonas / eliminacion', () => {
  it('4 equipos → válida', () => {
    const [v] = validarZonas([zona('A', 4)], 'eliminacion')
    expect(v.esValida).toBe(true)
  })

  it('6 equipos → inválida', () => {
    const [v] = validarZonas([zona('A', 6)], 'eliminacion')
    expect(v.esValida).toBe(false)
  })

  it('6 equipos + 2 libres = 8 → válida', () => {
    const [v] = validarZonas([zona('A', 6, 2)], 'eliminacion')
    expect(v.esValida).toBe(true)
  })

  it('múltiples zonas con 8 y 4 equipos → ambas válidas', () => {
    const resultado = validarZonas([zona('A', 8), zona('B', 4)], 'eliminacion')
    expect(resultado.every((v) => v.esValida)).toBe(true)
  })
})

// ─── validarEmparejamientoInterzonal ─────────────────────────────────────────
// Regla: slots_i = equipos_i × fechasInterzonales_i
//   1. sum(slots) debe ser par
//   2. max(slots) ≤ sum(slots) / 2  (ninguna zona domina)

describe('validarEmparejamientoInterzonal', () => {
  // ── Casos base ──────────────────────────────────────────────────────────────

  it('0 zonas → válido', () => {
    expect(validarEmparejamientoInterzonal([]).esValido).toBe(true)
  })

  it('1 zona → siempre válido', () => {
    expect(validarEmparejamientoInterzonal([zona('A', 4, 0, 2)]).esValido).toBe(
      true
    )
  })

  it('todas las zonas con 0 interzonales → válido', () => {
    const r = validarEmparejamientoInterzonal([
      zona('A', 4, 0, 0),
      zona('B', 4, 0, 0)
    ])
    expect(r.esValido).toBe(true)
  })

  // ── Casos de éxito del enunciado ────────────────────────────────────────────

  it('CASO 1: 2 zonas × 8 eq × 1 int → slots [8,8] → válido', () => {
    // total=16, max=8 ≤ 8
    const r = validarEmparejamientoInterzonal([
      zona('A', 8, 0, 1),
      zona('B', 8, 0, 1)
    ])
    expect(r.esValido).toBe(true)
  })

  it('CASO 2: 2 zonas × 8 eq × 2 int → slots [16,16] → válido', () => {
    // total=32, max=16 ≤ 16
    const r = validarEmparejamientoInterzonal([
      zona('A', 8, 0, 2),
      zona('B', 8, 0, 2)
    ])
    expect(r.esValido).toBe(true)
  })

  it('CASO 3: 4 zonas × 8 eq × 1 int → slots [8,8,8,8] → válido', () => {
    // total=32, max=8 ≤ 24
    const r = validarEmparejamientoInterzonal([
      zona('A', 8, 0, 1),
      zona('B', 8, 0, 1),
      zona('C', 8, 0, 1),
      zona('D', 8, 0, 1)
    ])
    expect(r.esValido).toBe(true)
  })

  it('CASO 4: zona 4eq×2int y zona 8eq×1int → slots [8,8] → válido', () => {
    // total=16, max=8 ≤ 8
    const r = validarEmparejamientoInterzonal([
      zona('A', 4, 0, 2),
      zona('B', 8, 0, 1)
    ])
    expect(r.esValido).toBe(true)
  })

  it('CASO 5: zonas 4eq×1, 4eq×1, 8eq×1 → slots [4,4,8] → válido', () => {
    // total=16, max=8 ≤ 8
    const r = validarEmparejamientoInterzonal([
      zona('A', 4, 0, 1),
      zona('B', 4, 0, 1),
      zona('C', 8, 0, 1)
    ])
    expect(r.esValido).toBe(true)
  })

  it('3 zonas iguales con 1 interzonal → slots [4,4,4] → válido', () => {
    // total=12, max=4 ≤ 8
    const r = validarEmparejamientoInterzonal([
      zona('A', 4, 0, 1),
      zona('B', 4, 0, 1),
      zona('C', 4, 0, 1)
    ])
    expect(r.esValido).toBe(true)
  })

  // ── Casos de error: zona dominante ──────────────────────────────────────────

  it('zona con más slots que el resto combinado → inválido', () => {
    // slots [16, 4]: max=16 > resto=4
    const r = validarEmparejamientoInterzonal([
      zona('A', 8, 0, 2), // 8×2 = 16
      zona('B', 4, 0, 1) // 4×1 = 4
    ])
    expect(r.esValido).toBe(false)
    expect(r.mensaje).toMatch(/Zona A/)
  })

  it('zona con interzonales y otra con 0 → inválido', () => {
    // slots [8, 0]: max=8 > resto=0
    const r = validarEmparejamientoInterzonal([
      zona('A', 4, 0, 2), // 4×2 = 8
      zona('B', 4, 0, 0) // 0
    ])
    expect(r.esValido).toBe(false)
  })

  it('3 zonas donde una domina → inválido', () => {
    // slots [16, 2, 2]: max=16 > resto=4
    const r = validarEmparejamientoInterzonal([
      zona('A', 8, 0, 2), // 16
      zona('B', 2, 0, 1), // 2
      zona('C', 2, 0, 1) // 2
    ])
    expect(r.esValido).toBe(false)
  })

  // ── Casos de error: total impar ──────────────────────────────────────────────

  it('total de slots impar → inválido', () => {
    // slots [3, 2]: total=5 impar (3 equipos × 1 int, 2 equipos × 1 int)
    const r = validarEmparejamientoInterzonal([
      zona('A', 3, 0, 1), // 3×1 = 3
      zona('B', 2, 0, 1) // 2×1 = 2
    ])
    expect(r.esValido).toBe(false)
    expect(r.mensaje).toMatch(/par/)
  })

  it('slots [6, 3]: total=9 impar → inválido', () => {
    const r = validarEmparejamientoInterzonal([
      zona('A', 6, 0, 1), // 6
      zona('B', 3, 0, 1) // 3
    ])
    expect(r.esValido).toBe(false)
  })
})

// ─── calcularTotalFechas ─────────────────────────────────────────────────────

describe('calcularTotalFechas', () => {
  it('4 equipos, ida → 3 fechas', () => {
    expect(calcularTotalFechas(4, 0, 0, 'ida')).toBe(3)
  })

  it('4 equipos, ida y vuelta → 6 fechas', () => {
    expect(calcularTotalFechas(4, 0, 0, 'ida-y-vuelta')).toBe(6)
  })

  it('3 equipos + 1 libre = 4, ida → 3 fechas', () => {
    expect(calcularTotalFechas(3, 1, 0, 'ida')).toBe(3)
  })

  it('2 equipos, ida → 1 fecha', () => {
    expect(calcularTotalFechas(2, 0, 0, 'ida')).toBe(1)
  })

  it('total < 2 → 0 fechas', () => {
    expect(calcularTotalFechas(1, 0, 0, 'ida')).toBe(0)
    expect(calcularTotalFechas(0, 0, 0, 'ida')).toBe(0)
  })

  it('con interzonales cuenta igual', () => {
    // 4 equipos + 0 libres + 2 interzonales = 6 → T-1 = 5 fechas ida
    expect(calcularTotalFechas(4, 0, 2, 'ida')).toBe(5)
  })

  it('8 equipos, ida y vuelta → 14 fechas', () => {
    expect(calcularTotalFechas(8, 0, 0, 'ida-y-vuelta')).toBe(14)
  })
})

// ─── calcularTotalFechasPorZonas ─────────────────────────────────────────────

describe('calcularTotalFechasPorZonas', () => {
  it('0 zonas → 0', () => {
    expect(calcularTotalFechasPorZonas([], 'ida')).toBe(0)
  })

  it('1 zona de 4 equipos, ida → 3', () => {
    expect(calcularTotalFechasPorZonas([zona('A', 4)], 'ida')).toBe(3)
  })

  it('retorna el máximo entre zonas de distinto tamaño', () => {
    // Zona A: 4 equipos → 3 fechas; Zona B: 6 equipos → 5 fechas
    expect(
      calcularTotalFechasPorZonas([zona('A', 4), zona('B', 6)], 'ida')
    ).toBe(5)
  })

  it('ida-y-vuelta multiplica por 2', () => {
    expect(
      calcularTotalFechasPorZonas([zona('A', 4), zona('B', 6)], 'ida-y-vuelta')
    ).toBe(10)
  })
})
