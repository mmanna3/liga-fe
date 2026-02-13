import { describe, expect, it } from 'vitest'
import { step1Schema } from './validation-schema'

describe('step1Schema - categorías', () => {
  const baseValidData = {
    name: 'Torneo Test',
    season: '2026',
    type: 'FUTSAL' as const,
    categories: [
      { id: '1', name: 'Sub 15', yearFrom: '2010', yearTo: '2011' },
      { id: '2', name: 'Mayores', yearFrom: '', yearTo: '' }
    ],
    format: 'ANUAL' as const
  }

  it('pasa con categorías que tienen nombre', async () => {
    const result = await step1Schema.parseAsync(baseValidData)
    expect(result.categories).toHaveLength(2)
    expect(result.categories[0].name).toBe('Sub 15')
    expect(result.categories[1].name).toBe('Mayores')
  })

  it('falla cuando una categoría tiene nombre vacío', async () => {
    const data = {
      ...baseValidData,
      categories: [
        { id: '1', name: 'Sub 15', yearFrom: '', yearTo: '' },
        { id: '2', name: '', yearFrom: '', yearTo: '' }
      ]
    }
    await expect(step1Schema.parseAsync(data)).rejects.toThrow()
  })

  it('falla cuando una categoría tiene solo espacios en el nombre', async () => {
    const data = {
      ...baseValidData,
      categories: [
        { id: '1', name: 'Sub 15', yearFrom: '', yearTo: '' },
        { id: '2', name: '   ', yearFrom: '', yearTo: '' }
      ]
    }
    await expect(step1Schema.parseAsync(data)).rejects.toThrow()
  })

  it('falla cuando no hay categorías', async () => {
    const data = {
      ...baseValidData,
      categories: []
    }
    await expect(step1Schema.parseAsync(data)).rejects.toThrow()
  })

  it('pasa con una sola categoría con nombre', async () => {
    const data = {
      ...baseValidData,
      categories: [
        { id: '1', name: 'Sub 15', yearFrom: '2010', yearTo: '2011' }
      ]
    }
    const result = await step1Schema.parseAsync(data)
    expect(result.categories).toHaveLength(1)
  })
})
