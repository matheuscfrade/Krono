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

  it('férias ignora permite combinar', () => {
    const a = ajudaPintura('tipo-ferias', { combinaComLetivo: true })
    expect(a?.fundo).toBeNull()
    expect(a?.marca).toBe(true)
    expect(a?.texto).toContain('deixa de ser')
  })

  it('evento que não combina perde o fundo letivo', () => {
    const a = ajudaPintura('tipo-evento', { combinaComLetivo: false })
    expect(a?.fundo).toBeNull()
    expect(a?.marca).toBe(true)
    expect(a?.texto).toContain('deixa de ser')
  })

  it('tipo criado acompanha o rádio de combinar', () => {
    const sim = ajudaPintura('tipo-criado-abc', { combinaComLetivo: true })
    expect(sim?.fundo).toBe('letivo')
    expect(sim?.marca).toBe(true)
    const nao = ajudaPintura('tipo-criado-abc', { combinaComLetivo: false })
    expect(nao?.fundo).toBeNull()
    expect(nao?.marca).toBe(true)
  })

  it('feriado continua pintando o fundo mesmo se combinar', () => {
    const a = ajudaPintura('tipo-feriado', { combinaComLetivo: true })
    expect(a?.fundo).toBe('feriado')
    expect(a?.marca).toBe(false)
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
