# Tests E2E pendientes — Fixture

Análisis realizado el 2026-04-04. Los tests existentes están en `e2e/fixture.spec.ts`.

---

## Lo que ya está cubierto (no repetir)

**PanelTodosContraTodos**: lista de equipos, botón habilitado/deshabilitado, algoritmo
resaltado, generar vista previa, crear fixture (incluyendo verificación del body del POST),
cambio de primera fecha, drag-and-drop.

**FechasTodosContraTodos**: agregar/editar/eliminar fecha, agregar jornada via drag en el
modal, guardar con jornada nueva.

**Carga de resultados básica**: abrir modal, llenar y guardar (con verificación del body).

---

## Grupo A — FechasTodosContraTodos (carga de resultados, más profundidad)

Requiere escenario nuevo en el mock: `fixture_con_fechas_con_resultados`
(igual a `fixture_con_fechas` pero con `resultadoLocal: '2'` y `resultadoVisitante: '1'`
en el partido, y `resultadosVerificados: false`).

**Test 1 — Pre-llenado en modo edición**
Cuando la jornada ya tiene resultados del backend, los inputs del modal deben aparecer
pre-llenados. Abrir el modal con `fixture_con_fechas_con_resultados`, verificar que los
inputs ya muestran `'2'` y `'1'` sin que el usuario haya escrito nada.

**Test 2 — Toggle "Resultados Verificados"**
Abrir modal, activar el switch "Resultados Verificados", guardar, interceptar el POST a
`cargar-resultados/*` y verificar que el body tenga `resultadosVerificados: true`.

**Test 3 — Estado visual del botón de carga**
El botón tiene 3 estados visuales según `resultadosVerificados` y si hay resultados.
Con `fixture_con_fechas` (sin resultados): estado inicial.
Con `fixture_con_fechas_con_resultados` (resultados cargados, no verificados): estado 2.
Requiere escenario adicional `fixture_con_fechas_resultados_verificados` para estado 3.

**Test 4 — Una sola llamada a la API al guardar**
Este es el bug arreglado en la sesión anterior (el loop iteraba sobre todas las jornadas
de la fecha). Interceptar `cargar-resultados/*`, contar las llamadas, verificar que sea
exactamente 1 al guardar resultados de una jornada.

---

## Grupo B — PanelEliminacionDirecta (0 tests actualmente)

Requiere escenarios nuevos en el mock server. Usar URL distinta, por ejemplo:
`/torneos/detalle/1/fases/200/zonas/2/fixture`

Escenarios necesarios:
- `fixture_eliminacion_directa_sin_fechas`: torneo con fase `tipoDeFase: 2`, zona con
  4 equipos (Infantil A, Infantil B, Infantil C, Infantil D), sin fechas, con algoritmo
  vacío (no se usa para eliminación directa).
- Para el mock: el GET `/api/Torneo/1` debe devolver un torneo con una fase de id 200 y
  `tipoDeFase: 2`; el GET `/api/Zona/2/fechas` devuelve `[]`; la zona 2 tiene 4 equipos.

**Test 5 — Cantidad inválida de equipos**
Con 3 equipos en la zona, el botón "Generar vista previa" está deshabilitado y aparece
el mensaje "La cantidad de equipos tiene que ser 2, 4, 8 o 16".

**Test 6 — Cantidad válida habilita el botón**
Con 4 equipos (2^2), el botón "Generar vista previa" está habilitado.

**Test 7 — Vista previa del bracket**
Al clic en "Generar vista previa", aparecen columnas "Semifinal" y "Final".

**Test 8 — Crear la llave — endpoint correcto**
Al clic en "Crear el fixture", el POST va a `crear-fechas-eliminaciondirecta-masivamente`
(no a `crear-fechas-todoscontratodos-masivamente`).

**Test 9 — Crear la llave — body correcto**
Verificar que el body del POST tiene la estructura correcta:
- Primera ronda (Semifinal): jornadas de tipo `Normal` con los equipos en el orden elegido.
- Rondas posteriores (Final): jornadas de tipo `SinEquipos`.

**Test 10 — Drag reordena y afecta el bracket**
Reordenar equipos via drag (Infantil B antes que Infantil A), generar vista previa,
verificar que el bracket muestra Infantil B en la posición 1 de la Semifinal.

---

## Grupo C — FechasEliminacionDirecta (0 tests actualmente)

Requiere escenario `fixture_eliminacion_directa_con_fechas`:
- Torneo con fase `tipoDeFase: 2`.
- GET `/api/Zona/2/fechas` devuelve una llave de 4 equipos ya generada:
  - `instanciaId: 4` (Semifinal): 2 jornadas con equipos asignados y resultados vacíos.
  - `instanciaId: 2` (Final): 1 jornada de tipo `SinEquipos`.
- Necesita los endpoints de borrado masivo en el mock:
  `DELETE /api/Zona/*/fechas/borrar-fechas-eliminaciondirecta-masivamente`

**Test 11 — Muestra columnas por ronda**
Para una llave de 4 equipos, aparecen columnas "Semifinal" y "Final".

**Test 12 — Nombres de equipos en la primera ronda**
Los equipos de la Semifinal (Infantil A, Infantil B, etc.) se ven en la pantalla.

**Test 13 — Rondas futuras vacías**
Los partidos de la Final aparecen sin equipos asignados (slots vacíos / "—").

**Test 14 — Botón cargar resultados abre el modal**
El modal de resultados de la eliminación directa se abre con la lista de partidos
de esa ronda. Verificar título y lista de jornadas.

**Test 15 — Guardar resultados de ronda — body correcto**
Llenar resultados en el modal, guardar, interceptar POST a `cargar-resultados/{jornadaId}`,
verificar body: `jornadaId`, `resultadosVerificados: false`, `partidos` con resultados.

**Test 16 — Botón "Borrar llave de eliminación"**
El botón aparece en la botonera del header (icono de borrado). Al clic, aparece un modal
de confirmación con el texto "Se eliminarán fechas y partidos de todas las instancias
de esta llave." y el botón "Borrar llave".

**Test 17 — Confirmar borrar llave → DELETE masivo**
Al confirmar, se llama a `borrar-fechas-eliminaciondirecta-masivamente` y se muestra
el toast "Llave de eliminación borrada".

**Test 18 — Después de borrar la llave se vuelve al PanelEliminacionDirecta**
Luego del borrado (cambiar el escenario a `fixture_eliminacion_directa_sin_fechas`
antes del refetch), la pantalla vuelve a mostrar la lista de equipos y el botón
"Generar vista previa".

---

## Resumen de cambios necesarios en el mock server (`e2e/mock-server.cjs`)

| Escenario | Qué agrega |
|---|---|
| `fixture_con_fechas_con_resultados` | FECHA_ZONA_1 con resultados cargados en el partido (`resultadoLocal: '2'`, `resultadoVisitante: '1'`) |
| `fixture_con_fechas_resultados_verificados` | FECHA_ZONA_1 con `resultadosVerificados: true` |
| `fixture_eliminacion_directa_sin_fechas` | Torneo con fase `tipoDeFase: 2`, zona con 4 equipos, sin fechas |
| `fixture_eliminacion_directa_con_fechas` | Ídem pero con llave generada (Semifinal + Final) |

Para los escenarios de eliminación directa también hay que agregar:
- La fase con `tipoDeFase: 2` en los fixtures del torneo.
- El handler `DELETE /api/Zona/*/fechas/borrar-fechas-eliminaciondirecta-masivamente`.
- El handler `POST /api/Zona/*/fechas/crear-fechas-eliminaciondirecta-masivamente`.
