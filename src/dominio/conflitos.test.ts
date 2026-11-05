import { describe, expect, it } from 'vitest'
import {
  adicionarEvento,
  adicionarPeriodo,
  criarCalendario,
  regrasPadrao,
} from './calendario'
import { conflitosDoCalendario } from './conflitos'

function calEtapa() {
  const r = criarCalendario({ nome: 'Cursos Técnicos', instituicao: 'IFMG', ano: 2026 })
  if (!r.ok) throw new Error('criar')
  const p = adicionarPeriodo(r.calendario, { nome: '1ª Etapa', inicio: '2026-02-02', fim: '2026-04-30' })
  if (!p.ok) throw new Error('periodo')
  return p.calendario
}

describe('conflitosDoCalendario', () => {
  it('aviso de evento em feriado e de total abaixo do mínimo', () => {
    const base = calEtapa()
    const ev = adicionarEvento(base, {
      tipoId: 'tipo-evento',
      descricao: 'Acolhimento',
      inicio: '2026-04-21',
      fim: '2026-04-21',
    })
    expect(ev.ok).toBe(true)
    if (!ev.ok) return
    const lista = conflitosDoCalendario(ev.calendario)
    expect(lista.some((c) => c.numero === 1 && c.iso === '2026-04-21')).toBe(true)
    expect(lista.some((c) => c.numero === 7)).toBe(true)
  })

  it('dois exclusivos no mesmo dia são erro', () => {
    const base = calEtapa()
    const a = adicionarEvento(base, {
      tipoId: 'tipo-evento',
      descricao: 'Prova A',
      inicio: '2026-03-10',
      fim: '2026-03-10',
    })
    if (!a.ok) throw new Error('a')
    const comExclusivo = {
      ...a.calendario,
      eventos: a.calendario.eventos.map((e) =>
        e.descricao === 'Prova A' ? { ...e, exclusivo: true } : e,
      ),
    }
    const b = adicionarEvento(comExclusivo, {
      tipoId: 'tipo-evento',
      descricao: 'Prova B',
      inicio: '2026-03-10',
      fim: '2026-03-10',
    })
    if (!b.ok) throw new Error('b')
    const comDois = {
      ...b.calendario,
      eventos: b.calendario.eventos.map((e) =>
        e.descricao === 'Prova B' ? { ...e, exclusivo: true } : e,
      ),
    }
    expect(conflitosDoCalendario(comDois).some((c) => c.numero === 2)).toBe(true)
  })

  it('evento no sábado não gera aviso de fim de semana sem sábado letivo', () => {
    const ev = adicionarEvento(calEtapa(), {
      tipoId: 'tipo-evento',
      descricao: 'Sábado de acolhimento',
      inicio: '2026-03-07',
      fim: '2026-03-07',
    })
    expect(ev.ok).toBe(true)
    if (!ev.ok) return
    expect(conflitosDoCalendario(ev.calendario).some((c) => c.numero === 9)).toBe(false)
  })

  it('períodos que se cruzam são erro no primeiro dia da sobreposição', () => {
    const base = calEtapa()
    const cal = {
      ...base,
      periodos: [
        ...base.periodos,
        {
          id: 'p-cruzado',
          nome: '2ª Etapa',
          inicio: '2026-04-01',
          fim: '2026-06-30',
          tipoLetivoId: 'tipo-letivo-cruzado',
        },
      ],
    }
    const cruzado = conflitosDoCalendario(cal).find((c) => c.numero === 3)
    expect(cruzado?.gravidade).toBe('erro')
    expect(cruzado?.iso).toBe('2026-04-01')
  })

  it('desligar aviso de mínimo some o conflito 7', () => {
    const cal = {
      ...calEtapa(),
      regras: { ...regrasPadrao(), avisoMinimo: false },
    }
    expect(conflitosDoCalendario(cal).some((c) => c.numero === 7 || c.numero === 12)).toBe(false)
  })
})
