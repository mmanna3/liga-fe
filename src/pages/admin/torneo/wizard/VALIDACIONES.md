# Validaciones del Wizard de Torneo

## Resumen
Se han implementado validaciones completas usando **Zod** + **react-hook-form** para asegurar que cada paso del wizard esté correctamente completado antes de avanzar.

## Validaciones por Paso

### ✅ Paso 1: Información
**Campos requeridos:**
- ✓ Nombre del torneo (mínimo 1 carácter)
- ✓ Temporada/Año (mínimo 4 caracteres)
- ✓ Tipo de torneo (debe seleccionarse uno)
- ✓ Al menos 1 categoría
- ✓ Todas las categorías deben tener nombre
- ✓ Formato del torneo (debe seleccionarse uno)

**Indicadores visuales:**
- Borde rojo en inputs con error
- Mensajes de error debajo de cada campo
- Los botones de selección no muestran error pero sí lo validan

---

### ✅ Paso 2: Fases
**Campos requeridos:**
- ✓ Debe haber al menos 1 fase configurada

**Notas:**
- Las fases se inicializan automáticamente según el formato seleccionado
- Este paso raramente falla porque siempre hay al menos una fase

---

### ✅ Paso 3: Equipos
**Campos requeridos:**
- ✓ Mínimo 2 equipos
- ✓ Cantidad de equipos seleccionados debe coincidir con `teamCount`

**Indicadores visuales:**
- Barra de progreso cambia de color:
  - Amarillo cuando está incompleto
  - Azul (primary) cuando está completo
- Mensaje de error en banner rojo si no coincide la cantidad
- Contador visual: "Seleccionados: X / Y"

---

### ✅ Paso 4: Zonas
**Campos requeridos:**
- ✓ Todos los equipos deben estar asignados a una zona

**Validación:**
- Se cuenta el total de equipos en todas las zonas
- Debe coincidir con el total de `selectedTeams`

**Indicadores visuales:**
- Banner de error si hay equipos sin asignar
- La sección "Equipos sin asignar" ya indicaba visualmente este problema

---

### ✅ Paso 5: Fixture
**Campos requeridos:**
- ✓ El fixture debe estar generado (`fixtureGenerated === true`)

**Indicadores visuales:**
- Banner de error si no se ha generado el fixture
- El botón "Generar fixture" es prominente

---

### ✅ Paso 6: Resumen
**Sin validaciones adicionales**
- Solo selección de estado (borrador/publicado)
- Este paso es informativo y de confirmación

---

## Funcionamiento

### Validación al Avanzar
Cuando el usuario hace clic en "Siguiente":
1. Se ejecuta `validateCurrentStep()`
2. Se valida el schema de Zod correspondiente al paso actual
3. Si hay errores:
   - Se muestra un toast con el primer error encontrado
   - NO se avanza al siguiente paso
4. Si no hay errores:
   - Se ejecuta la navegación normal

### Validación en Tiempo Real
- react-hook-form está configurado con `mode: 'onChange'`
- Los errores se muestran mientras el usuario completa el formulario
- Los campos muestran borde rojo cuando tienen errores
- Los mensajes de error aparecen debajo de cada campo

### Navegación con Validación
- Los usuarios NO pueden saltar pasos hacia adelante sin completar el actual
- Los usuarios SÍ pueden volver hacia atrás sin validación
- El StepIndicator muestra con un check (✓) los pasos completados

## Schema de Validación

Archivo: `src/pages/admin/torneo/wizard/validation-schema.ts`

```typescript
// Schemas individuales por paso
- step1Schema: Información básica
- step2Schema: Fases
- step3Schema: Equipos (con refine)
- step4Schema: Zonas (con refine)
- step5Schema: Fixture generado
- step6Schema: Estado final

// Schema completo
tournamentWizardSchema: Validación completa del formulario
```

## Ventajas del Sistema

1. **Validación progresiva**: No se puede avanzar con datos incompletos
2. **Feedback inmediato**: Errores visibles en tiempo real
3. **UX mejorada**: Indicadores visuales claros (colores, iconos, mensajes)
4. **Type-safe**: Zod asegura tipos consistentes
5. **Escalable**: Fácil agregar más validaciones
6. **Centralizado**: Todas las reglas en un solo archivo

## Próximas Mejoras Posibles

- [ ] Validaciones cruzadas más complejas (ej: fechas del torneo)
- [ ] Validación de equipos duplicados
- [ ] Validaciones asíncronas (ej: verificar que el nombre no exista)
- [ ] Resumen de errores acumulados en el StepIndicator
- [ ] Guardar progreso automáticamente (draft)
