import { describe, expect, it } from 'vitest'
import { ajudaPintura, TEXTO_AJUDA_PERIODO } from './ajudaPintura'
import { corLetivoAmostra, criarCalendario } from './calendario'

function cal2026() {
  const r = criarCalendario({
    nome: 'Cursos Técnicos',
    instituicao: 'IFMG',
    ano: 2026,
  })
  if (!r.ok) throw new Error('criar')
  return r.calendario
}

describe('ajudaPintura', () => {
  it('feriado pinta fundo e não ganha marca', () => {
    const a = ajudaPintura('tipo-feriado')
    expect(a?.fundo).toBe('feriado')
    expect(a?.marca).toBe(false)
    expect(a?.texto).toContain('fundo')
    expect(a?.texto).toContain('letivo')
  })

  it('recesso pinta fundo e não ganha marca', () => {
    const a = ajudaPintura('tipo-recesso')
    expect(a?.fundo).toBe('recesso')
    expect(a?.marca).toBe(false)
  })

  it('evento pinta letivo e marca', () => {
    const a = ajudaPintura('tipo-evento')
    expect(a?.fundo).toBe('letivo')
    expect(a?.marca).toBe(true)
    expect(a?.texto.toLowerCase()).toContain('sábado')
  })

  it('férias: sem fundo, com marca', () => {
    const a = ajudaPintura('tipo-ferias')
    expect(a?.fundo).toBeNull()
    expect(a?.marca).toBe(true)
    expect(a?.texto).toContain('quadradinho')
  })

  it('sábado letivo: fundo letivo, marca, só sábado', () => {
    const a = ajudaPintura('tipo-sabado-letivo')
    expect(a?.fundo).toBe('letivo')
    expect(a?.marca).toBe(true)
    expect(a?.texto.toLowerCase()).toContain('sábado')
  })

  it('tipo desconhecido: sem ajuda', () => {
    expect(ajudaPintura('tipo-retirada-letivo')).toBeNull()
    expect(ajudaPintura('tipo-ponto-facultativo')).toBeNull()
  })
})

describe('texto e cor do período', () => {
  it('explica segunda a sexta', () => {
    expect(TEXTO_AJUDA_PERIODO).toContain('segunda a sexta')
  })

  it('calendário novo usa a primeira cor letivo', () => {
    expect(corLetivoAmostra(cal2026())).toBe('#2b6cb0')
  })
})
