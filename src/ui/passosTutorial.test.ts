import { describe, expect, it } from 'vitest'
import { PASSOS_TUTORIAL } from './passosTutorial'

describe('passos do tutorial', () => {
  it('cobre preenchimento, clique, arraste e configuração', () => {
    expect(PASSOS_TUTORIAL).toHaveLength(6)
    const junto = PASSOS_TUTORIAL.map((p) => `${p.titulo} ${p.texto}`).join('\n')
    expect(junto).toMatch(/período/i)
    expect(junto).toMatch(/clique no dia/i)
    expect(junto).toMatch(/arrast/i)
    expect(junto).toMatch(/regras/i)
    expect(junto).toMatch(/rascunho/i)
    for (const passo of PASSOS_TUTORIAL) {
      expect(passo.titulo.length).toBeGreaterThan(0)
      expect(passo.texto.length).toBeGreaterThan(20)
    }
  })
})
