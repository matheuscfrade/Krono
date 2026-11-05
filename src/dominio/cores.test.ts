import { describe, expect, it } from 'vitest'
import {
  adicionarFeriadoManual,
  adicionarPeriodo,
  criarCalendario,
  definirCorTipo,
  pinturaDoDia,
  tipoDoDia,
  tiposDoDia,
  voltarCorSugerida,
} from './calendario'

function cal2026() {
  const r = criarCalendario({
    nome: 'Cursos Técnicos',
    instituicao: 'IFMG',
    ano: 2026,
  })
  if (!r.ok) throw new Error('criar')
  return r.calendario
}

function comEtapa() {
  const r = adicionarPeriodo(cal2026(), {
    nome: '1ª Etapa',
    inicio: '2026-02-02',
    fim: '2026-04-30',
  })
  if (!r.ok) throw new Error('periodo')
  return r.calendario
}

describe('pinturaDoDia', () => {
  it('16/02/2026 com etapa: fundo Recesso, sem letivo', () => {
    const cal = comEtapa()
    const p = pinturaDoDia(cal, '2026-02-16')
    expect(p.fundo?.nome).toBe('Recesso')
    expect(p.fundo?.cor).toBe('#dd6b20')
    expect(p.marcas).toEqual([])
    expect(p.haMais).toBe(false)
    expect(tipoDoDia(cal, '2026-02-16')?.nome).toBe('Recesso')
    expect(tiposDoDia(cal, '2026-02-16').some((t) => t.nome.startsWith('Dia letivo'))).toBe(
      false,
    )
  })

  it('02/02 fundo letivo; 01/01 fundo feriado; 01/02 domingo vazio', () => {
    const cal = comEtapa()
    expect(pinturaDoDia(cal, '2026-02-02').fundo?.nome).toBe('Dia letivo — 1ª Etapa')
    expect(pinturaDoDia(cal, '2026-02-02').marcas).toEqual([])
    expect(pinturaDoDia(cal, '2026-01-01').fundo?.nome).toBe('Feriado')
    expect(pinturaDoDia(cal, '2026-02-01').fundo).toBeNull()
  })

  it('Natal numa sexta com período em dezembro é só feriado', () => {
    const r = adicionarPeriodo(cal2026(), {
      nome: '3ª Etapa',
      inicio: '2026-12-01',
      fim: '2026-12-31',
    })
    if (!r.ok) throw new Error('periodo')
    const p = pinturaDoDia(r.calendario, '2026-12-25')
    expect(p.fundo?.nome).toBe('Feriado')
    expect(p.marcas).toEqual([])
  })

  it('feriado no Carnaval: fundo Feriado, marca Recesso', () => {
    const base = comEtapa()
    const add = adicionarFeriadoManual(base, {
      descricao: 'Padroeira',
      inicio: '2026-02-16',
      tipo: 'feriado',
    })
    expect(add.ok).toBe(true)
    if (!add.ok) return
    const nomes = tiposDoDia(add.calendario, '2026-02-16').map((t) => t.nome)
    expect(nomes[0]).toBe('Feriado')
    expect(nomes[1]).toBe('Recesso')
    expect(nomes.some((n) => n.startsWith('Dia letivo'))).toBe(false)
    const p = pinturaDoDia(add.calendario, '2026-02-16')
    expect(p.fundo?.nome).toBe('Feriado')
    expect(p.marcas.map((m) => m.tipo.nome)).toEqual(['Recesso'])
    expect(p.haMais).toBe(false)
  })
})

describe('cores', () => {
  it('5º período gera cor fora das quatro azuis fixas', () => {
    const azuis = new Set(['#2b6cb0', '#2c5282', '#3182ce', '#2a4365'])
    let cal = cal2026()
    for (let i = 1; i <= 5; i += 1) {
      const mes = String(i).padStart(2, '0')
      const r = adicionarPeriodo(cal, {
        nome: `P${i}`,
        inicio: `2026-${mes}-10`,
        fim: `2026-${mes}-12`,
      })
      if (!r.ok) throw new Error(r.erros[0]?.mensagem)
      cal = r.calendario
    }
    const quinto = cal.tiposDia.find((t) => t.nome === 'Dia letivo — P5')
    expect(quinto).toBeTruthy()
    expect(azuis.has(quinto!.cor)).toBe(false)
  })

  it('trocar e voltar cor do feriado', () => {
    const trocado = definirCorTipo(cal2026(), 'tipo-feriado', '#112233')
    expect(trocado.ok).toBe(true)
    if (!trocado.ok) return
    expect(trocado.calendario.tiposDia.find((t) => t.id === 'tipo-feriado')?.cor).toBe(
      '#112233',
    )
    const devolta = voltarCorSugerida(trocado.calendario, 'tipo-feriado')
    expect(devolta.tiposDia.find((t) => t.id === 'tipo-feriado')?.cor).toBe('#c53030')
  })
})
