import { describe, expect, it } from 'vitest'
import {
  adicionarFeriadoManual,
  adicionarPeriodo,
  apagarEvento,
  criarCalendario,
  definirPontoFacultativo,
  editarEvento,
  pinturaDoDia,
  tipoDoDia,
  trocarAno,
} from './calendario'
import { pascoa, previsualizarFeriados, somarDias } from './feriados'

function cal(ano: number) {
  const r = criarCalendario({
    nome: 'Cursos Técnicos',
    instituicao: 'IFMG',
    ano,
  })
  if (!r.ok) throw new Error('falha ao criar')
  return r.calendario
}

function isoEvento(calendario: ReturnType<typeof cal>, chave: string) {
  return calendario.eventos.find((e) => e.chave === chave)?.inicio
}

describe('Páscoa', () => {
  it('2025, 2026 e 2027', () => {
    expect(pascoa(2025)).toBe('2025-04-20')
    expect(pascoa(2026)).toBe('2026-04-05')
    expect(pascoa(2027)).toBe('2027-03-28')
  })

  it('derivados 2025–2027', () => {
    expect(somarDias(pascoa(2025), -48)).toBe('2025-03-03')
    expect(somarDias(pascoa(2025), -47)).toBe('2025-03-04')
    expect(somarDias(pascoa(2025), -2)).toBe('2025-04-18')
    expect(somarDias(pascoa(2025), 60)).toBe('2025-06-19')
    expect(somarDias(pascoa(2026), -48)).toBe('2026-02-16')
    expect(somarDias(pascoa(2026), -47)).toBe('2026-02-17')
    expect(somarDias(pascoa(2026), -2)).toBe('2026-04-03')
    expect(somarDias(pascoa(2026), 60)).toBe('2026-06-04')
    expect(somarDias(pascoa(2027), -48)).toBe('2027-02-08')
    expect(somarDias(pascoa(2027), -47)).toBe('2027-02-09')
    expect(somarDias(pascoa(2027), -2)).toBe('2027-03-26')
    expect(somarDias(pascoa(2027), 60)).toBe('2027-05-27')
  })
})

describe('lista automática', () => {
  it('2026 traz nacionais, sexta-santa e recessos automáticos', () => {
    const c = cal(2026)
    expect(isoEvento(c, 'nacional:natal')).toBe('2026-12-25')
    expect(isoEvento(c, 'nacional:consciencia-negra')).toBe('2026-11-20')
    expect(isoEvento(c, 'movel:sexta-santa')).toBe('2026-04-03')
    expect(isoEvento(c, 'facultativo:carnaval-segunda')).toBe('2026-02-16')
    expect(isoEvento(c, 'facultativo:carnaval-terca')).toBe('2026-02-17')
    expect(isoEvento(c, 'facultativo:cinzas')).toBe('2026-02-18')
    expect(isoEvento(c, 'facultativo:corpus-christi')).toBe('2026-06-04')
    const cinzas = c.eventos.find((e) => e.chave === 'facultativo:cinzas')
    expect(cinzas?.descricao).toBe('Quarta-feira de Cinzas')
    expect(cinzas?.tipoId).toBe('tipo-recesso')
    expect(c.eventos.find((e) => e.chave === 'facultativo:carnaval-segunda')?.tipoId).toBe(
      'tipo-recesso',
    )
  })

  it('2023 não tem Consciência Negra; 2024 tem', () => {
    expect(isoEvento(cal(2023), 'nacional:consciencia-negra')).toBeUndefined()
    expect(isoEvento(cal(2024), 'nacional:consciencia-negra')).toBe('2024-11-20')
  })

  it('prévia do ano 2026 inclui Natal e Carnaval', () => {
    const previa = previsualizarFeriados(2026, {
      carnaval: true,
      cinzas: true,
      corpusChristi: true,
    })
    expect(previa.some((p) => p.descricao === 'Natal' && p.inicio === '2026-12-25')).toBe(
      true,
    )
    expect(previa.some((p) => p.chave === 'facultativo:carnaval-segunda')).toBe(true)
  })
})

describe('interruptores e pintura', () => {
  it('desligar Carnaval tira 16 e 17/02/2026', () => {
    const c = definirPontoFacultativo(cal(2026), 'carnaval', false)
    expect(isoEvento(c, 'facultativo:carnaval-segunda')).toBeUndefined()
    expect(isoEvento(c, 'facultativo:carnaval-terca')).toBeUndefined()
    expect(isoEvento(c, 'facultativo:cinzas')).toBe('2026-02-18')
  })

  it('feriado vence dia letivo; sábado de feriado pinta', () => {
    const base = cal(2026)
    const comPeriodo = adicionarPeriodo(base, {
      nome: '1ª Etapa',
      inicio: '2026-02-02',
      fim: '2026-04-30',
    })
    if (!comPeriodo.ok) throw new Error('período')
    expect(tipoDoDia(comPeriodo.calendario, '2026-02-16')?.nome).toBe('Recesso')
    expect(tipoDoDia(comPeriodo.calendario, '2026-02-02')?.nome).toBe(
      'Dia letivo — 1ª Etapa',
    )
    expect(tipoDoDia(cal(2026), '2026-01-01')?.nome).toBe('Feriado')
  })
})

describe('editar, apagar e trocar ano', () => {
  it('manter alterações: Natal apagado não volta em 2027', () => {
    const natal = cal(2026).eventos.find((e) => e.chave === 'nacional:natal')
    if (!natal) throw new Error('natal')
    const sem = apagarEvento(cal(2026), natal.id)
    const r = trocarAno(sem, 2027, 'manter')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(isoEvento(r.calendario, 'nacional:natal')).toBeUndefined()
    expect(r.calendario.ano).toBe(2027)
  })

  it('voltar ao padrão: Natal volta em 2027', () => {
    const natal = cal(2026).eventos.find((e) => e.chave === 'nacional:natal')
    if (!natal) throw new Error('natal')
    const sem = apagarEvento(cal(2026), natal.id)
    const r = trocarAno(sem, 2027, 'padrao')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(isoEvento(r.calendario, 'nacional:natal')).toBe('2027-12-25')
  })

  it('recesso manual 15/06–30/06 pinta fundo inclusive sábado', () => {
    const add = adicionarFeriadoManual(cal(2026), {
      descricao: 'Recesso escolar',
      inicio: '2026-06-15',
      fim: '2026-06-30',
      tipo: 'recesso',
    })
    expect(add.ok).toBe(true)
    if (!add.ok) return
    expect(pinturaDoDia(add.calendario, '2026-06-16').fundo?.nome).toBe('Recesso')
    expect(pinturaDoDia(add.calendario, '2026-06-20').fundo?.nome).toBe('Recesso')
    expect(pinturaDoDia(add.calendario, '2026-06-16').marcas).toEqual([])
  })

  it('dois recessos que se cruzam recusam', () => {
    const primeiro = adicionarFeriadoManual(cal(2026), {
      descricao: 'Recesso 1',
      inicio: '2026-06-15',
      fim: '2026-06-30',
      tipo: 'recesso',
    })
    expect(primeiro.ok).toBe(true)
    if (!primeiro.ok) return
    const segundo = adicionarFeriadoManual(primeiro.calendario, {
      descricao: 'Recesso 2',
      inicio: '2026-06-20',
      fim: '2026-07-05',
      tipo: 'recesso',
    })
    expect(segundo.ok).toBe(false)
    if (segundo.ok) return
    expect(segundo.erros[0]?.mensagem).toContain('Recesso 1')
  })

  it('feriado manual em intervalo pinta os dias', () => {
    const add = adicionarFeriadoManual(cal(2026), {
      descricao: 'Festa municipal',
      inicio: '2026-08-10',
      fim: '2026-08-12',
      tipo: 'feriado',
    })
    expect(add.ok).toBe(true)
    if (!add.ok) return
    expect(pinturaDoDia(add.calendario, '2026-08-10').fundo?.nome).toBe('Feriado')
    expect(pinturaDoDia(add.calendario, '2026-08-11').fundo?.nome).toBe('Feriado')
    expect(pinturaDoDia(add.calendario, '2026-08-12').fundo?.nome).toBe('Feriado')
  })

  it('manual acompanha dia e mês', () => {
    const add = adicionarFeriadoManual(cal(2026), {
      descricao: 'Padroeira',
      inicio: '2026-08-15',
      tipo: 'feriado',
    })
    expect(add.ok).toBe(true)
    if (!add.ok) return
    const r = trocarAno(add.calendario, 2027, 'manter')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const padroeira = r.calendario.eventos.find((e) => e.descricao === 'Padroeira')
    expect(padroeira?.inicio).toBe('2027-08-15')
    expect(padroeira?.origem).toBe('manual')
  })

  it('editar só o nome do Natal e manter: nome vai para 2027-12-25', () => {
    const natal = cal(2026).eventos.find((e) => e.chave === 'nacional:natal')
    if (!natal) throw new Error('natal')
    const edit = editarEvento(cal(2026), natal.id, {
      descricao: 'Natal (recesso)',
      inicio: natal.inicio,
    })
    expect(edit.ok).toBe(true)
    if (!edit.ok) return
    const r = trocarAno(edit.calendario, 2027, 'manter')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const ev = r.calendario.eventos.find((e) => e.chave === 'nacional:natal')
    expect(ev?.inicio).toBe('2027-12-25')
    expect(ev?.descricao).toBe('Natal (recesso)')
  })
})
