import { describe, expect, it } from 'vitest'
import { FORMATO_RASCUNHO_ATUAL } from './formato'

describe('formato do rascunho', () => {
  it('versão atual do formato é 5', () => {
    expect(FORMATO_RASCUNHO_ATUAL).toBe(5)
  })
})
