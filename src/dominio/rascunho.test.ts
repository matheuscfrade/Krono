import { describe, expect, it } from 'vitest'
import { criarCalendario } from './calendario'
import { FORMATO_RASCUNHO_ATUAL } from './formato'
import { lerRascunho, serializarCalendario } from './rascunho'

describe('rascunho', () => {
  it('serializa e abre de volta', () => {
    const r = criarCalendario({ nome: 'Cursos Técnicos', instituicao: 'IFMG', ano: 2026 })
    if (!r.ok) throw new Error('criar')
    const texto = serializarCalendario(r.calendario)
    const aberto = lerRascunho(texto)
    expect(aberto.ok).toBe(true)
    if (!aberto.ok) return
    expect(aberto.calendario.nome).toBe('Cursos Técnicos')
    expect(aberto.calendario.formato).toBe(FORMATO_RASCUNHO_ATUAL)
    expect(aberto.calendario.regras.regrasUsuario).toEqual([])
  })

  it('abre json antigo sem regras e preenche o padrão', () => {
    const r = criarCalendario({ nome: 'Cursos Técnicos', instituicao: 'IFMG', ano: 2026 })
    if (!r.ok) throw new Error('criar')
    const antigo = { ...r.calendario, regras: undefined, formato: 1 }
    const aberto = lerRascunho(JSON.stringify(antigo))
    expect(aberto.ok).toBe(true)
    if (!aberto.ok) return
    expect(aberto.calendario.regras.mostrarTotais).toBe(true)
    expect(aberto.calendario.regras.regrasUsuario.some((regra) => regra.tipoId === 'tipo-ferias')).toBe(
      true,
    )
  })

  it('recusa json inválido', () => {
    expect(lerRascunho('não é json').ok).toBe(false)
  })

  it('abre de volta o aceite de evento em feriado', () => {
    const r = criarCalendario({ nome: 'Cursos Técnicos', instituicao: 'IFMG', ano: 2026 })
    if (!r.ok) throw new Error('criar')
    const comAceite = {
      ...r.calendario,
      eventos: [
        ...r.calendario.eventos,
        {
          id: 'evento-desfile',
          tipoId: 'tipo-evento',
          inicio: '2026-06-06',
          fim: '2026-06-06',
          descricao: 'Desfile da cidade',
          origem: 'manual' as const,
          aceitosEmFeriado: ['2026-06-06'],
        },
      ],
    }
    const aberto = lerRascunho(serializarCalendario(comAceite))
    expect(aberto.ok).toBe(true)
    if (!aberto.ok) return
    expect(aberto.calendario.eventos.find((e) => e.id === 'evento-desfile')?.aceitosEmFeriado).toEqual(
      ['2026-06-06'],
    )
  })
})
