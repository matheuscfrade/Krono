import { describe, expect, it } from 'vitest'
import {
  adicionarEvento,
  adicionarFeriadoManual,
  adicionarPeriodo,
  apagarEventoNoIntervalo,
  criarCalendario,
  diaContaComoLetivo,
  diaEhLetivo,
  pinturaDoDia,
  tiposDoDia,
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

describe('adicionarEvento', () => {
  it('tipo-recesso recusa: Recesso não é evento', () => {
    const r = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-recesso',
      descricao: 'Recesso escolar',
      inicio: '2026-06-15',
      fim: '2026-06-30',
    })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.erros[0]?.mensagem).toBe('Escolha o tipo do evento.')
  })

  it('evento em terça do período: fundo letivo e marca do evento', () => {
    const r = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-evento',
      descricao: 'Acolhimento',
      inicio: '2026-03-10',
      fim: '2026-03-10',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const p = pinturaDoDia(r.calendario, '2026-03-10')
    expect(p.fundo?.nome).toBe('Dia letivo — 1ª Etapa')
    expect(p.marcas.map((m) => `${m.tipo.nome} — ${m.evento.descricao}`)).toEqual([
      'Evento — Acolhimento',
    ])
  })

  it('evento no sábado vira dia letivo', () => {
    const r = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-evento',
      descricao: 'Sábado de acolhimento',
      inicio: '2026-03-07',
      fim: '2026-03-07',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(diaEhLetivo(r.calendario, '2026-03-07')).toBe(true)
    expect(diaContaComoLetivo(r.calendario, '2026-03-07')).toBe(true)
    const p = pinturaDoDia(r.calendario, '2026-03-07')
    expect(p.fundo?.nome).toBe('Dia letivo — 1ª Etapa')
    expect(p.marcas.map((m) => `${m.tipo.nome} — ${m.evento.descricao}`)).toEqual([
      'Evento — Sábado de acolhimento',
    ])
  })

  it('evento sexta a domingo: só o sábado vira aula extra', () => {
    const r = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-evento',
      descricao: 'Mostra',
      inicio: '2026-03-06',
      fim: '2026-03-08',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(diaEhLetivo(r.calendario, '2026-03-06')).toBe(true)
    expect(diaEhLetivo(r.calendario, '2026-03-07')).toBe(true)
    expect(diaEhLetivo(r.calendario, '2026-03-08')).toBe(false)
    expect(pinturaDoDia(r.calendario, '2026-03-08').fundo).toBeNull()
    expect(pinturaDoDia(r.calendario, '2026-03-08').marcas.map((m) => m.tipo.nome)).toEqual([
      'Evento',
    ])
  })

  it('férias no sábado não viram aula', () => {
    const r = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-ferias',
      descricao: 'Férias',
      inicio: '2026-02-07',
      fim: '2026-02-07',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(diaEhLetivo(r.calendario, '2026-02-07')).toBe(false)
  })

  it('férias cobrem o dia sem letivo', () => {
    const r = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-ferias',
      descricao: 'Férias docentes',
      inicio: '2026-07-01',
      fim: '2026-07-31',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const p = pinturaDoDia(r.calendario, '2026-07-01')
    expect(p.fundo).toBeNull()
    expect(p.marcas.map((m) => m.tipo.nome)).toEqual(['Férias'])
  })

  it('dois eventos do tipo Evento no mesmo dia letivo', () => {
    const um = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-evento',
      descricao: 'Acolhimento',
      inicio: '2026-03-10',
      fim: '2026-03-10',
    })
    expect(um.ok).toBe(true)
    if (!um.ok) return
    const dois = adicionarEvento(um.calendario, {
      tipoId: 'tipo-evento',
      descricao: 'Palestra',
      inicio: '2026-03-10',
      fim: '2026-03-10',
    })
    expect(dois.ok).toBe(true)
    if (!dois.ok) return
    const nomes = dois.calendario.eventos
      .filter((e) => e.inicio === '2026-03-10' && e.tipoId === 'tipo-evento')
      .map((e) => e.descricao)
    expect(nomes).toEqual(['Acolhimento', 'Palestra'])
    const p = pinturaDoDia(dois.calendario, '2026-03-10')
    expect(p.fundo?.nome).toBe('Dia letivo — 1ª Etapa')
    expect(p.marcas.map((m) => m.evento.descricao)).toEqual(['Acolhimento', 'Palestra'])
  })

  it('cinco eventos no mesmo dia: haMais e cinco marcas', () => {
    let cal = comEtapa()
    for (const nome of ['A', 'B', 'C', 'D', 'E']) {
      const r = adicionarEvento(cal, {
        tipoId: 'tipo-evento',
        descricao: nome,
        inicio: '2026-03-10',
        fim: '2026-03-10',
      })
      expect(r.ok).toBe(true)
      if (!r.ok) return
      cal = r.calendario
    }
    const p = pinturaDoDia(cal, '2026-03-10')
    expect(p.fundo?.nome).toBe('Dia letivo — 1ª Etapa')
    expect(p.marcas.map((m) => m.evento.descricao)).toEqual(['A', 'B', 'C', 'D', 'E'])
    expect(p.haMais).toBe(true)
  })

  it('fim vazio vira um dia; fim antes do início recusa', () => {
    const um = adicionarEvento(cal2026(), {
      tipoId: 'tipo-evento',
      descricao: 'Dia D',
      inicio: '2026-03-10',
      fim: '',
    })
    expect(um.ok).toBe(true)
    if (!um.ok) return
    expect(um.calendario.eventos.at(-1)?.fim).toBe('2026-03-10')
    const ruim = adicionarEvento(cal2026(), {
      tipoId: 'tipo-evento',
      descricao: 'X',
      inicio: '2026-03-10',
      fim: '2026-03-01',
    })
    expect(ruim.ok).toBe(false)
  })

  it('sábado letivo recusa dia que não é sábado', () => {
    const ter = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-sabado-letivo',
      descricao: 'Sábado letivo',
      inicio: '2026-03-10',
      fim: '2026-03-10',
    })
    expect(ter.ok).toBe(false)
    if (ter.ok) return
    expect(ter.erros[0]?.mensagem).toBe('Sábado letivo só pode cair em sábado.')
    const intervalo = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-sabado-letivo',
      descricao: 'Sábados da etapa',
      inicio: '2026-03-01',
      fim: '2026-03-15',
    })
    expect(intervalo.ok).toBe(false)
  })

  it('sábado letivo no intervalo pinta só os sábados', () => {
    const r = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-sabado-letivo',
      descricao: 'Sábados da etapa',
      inicio: '2026-03-07',
      fim: '2026-03-14',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const sab = pinturaDoDia(r.calendario, '2026-03-07')
    expect(sab.fundo?.nome).toBe('Dia letivo — 1ª Etapa')
    expect(sab.marcas.map((m) => m.tipo.nome)).toEqual(['Sábado letivo'])
    expect(pinturaDoDia(r.calendario, '2026-03-14').fundo?.nome).toBe('Dia letivo — 1ª Etapa')
    expect(pinturaDoDia(r.calendario, '2026-03-06').fundo?.nome).toBe('Dia letivo — 1ª Etapa')
    expect(pinturaDoDia(r.calendario, '2026-03-06').marcas).toEqual([])
    expect(pinturaDoDia(r.calendario, '2026-03-08').fundo).toBeNull()
  })

  it('sábado letivo some se o sábado é feriado', () => {
    const base = comEtapa()
    const fer = adicionarFeriadoManual(base, {
      descricao: 'Padroeira',
      inicio: '2026-03-07',
      tipo: 'feriado',
    })
    expect(fer.ok).toBe(true)
    if (!fer.ok) return
    const r = adicionarEvento(fer.calendario, {
      tipoId: 'tipo-sabado-letivo',
      descricao: 'Sábado letivo',
      inicio: '2026-03-07',
      fim: '2026-03-07',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const p = pinturaDoDia(r.calendario, '2026-03-07')
    expect(p.fundo?.nome).toBe('Feriado')
    expect(p.marcas.some((m) => m.tipo.id === 'tipo-sabado-letivo')).toBe(false)
    expect(tiposDoDia(r.calendario, '2026-03-07').some((t) => t.nome.startsWith('Dia letivo'))).toBe(
      false,
    )
  })
})

describe('apagarEventoNoIntervalo', () => {
  function recessoJunho() {
    const r = adicionarFeriadoManual(cal2026(), {
      descricao: 'Recesso escolar',
      inicio: '2026-06-15',
      fim: '2026-06-30',
      tipo: 'recesso',
    })
    if (!r.ok) throw new Error('recesso')
    return r.calendario
  }

  it('tira um dia do meio e parte o intervalo em dois', () => {
    const cal = recessoJunho()
    const ev = cal.eventos.find((e) => e.descricao === 'Recesso escolar')
    if (!ev) throw new Error('evento')
    const r = apagarEventoNoIntervalo(cal, ev.id, '2026-06-16', '2026-06-16')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const partes = r.calendario.eventos.filter((e) => e.descricao === 'Recesso escolar')
    expect(partes.map((e) => `${e.inicio}/${e.fim}`).sort()).toEqual([
      '2026-06-15/2026-06-15',
      '2026-06-17/2026-06-30',
    ])
    expect(pinturaDoDia(r.calendario, '2026-06-16').fundo).toBeNull()
    expect(pinturaDoDia(r.calendario, '2026-06-15').fundo?.id).toBe('tipo-recesso')
    expect(pinturaDoDia(r.calendario, '2026-06-17').fundo?.id).toBe('tipo-recesso')
  })

  it('tira o primeiro dia e encolhe o início', () => {
    const cal = recessoJunho()
    const ev = cal.eventos.find((e) => e.descricao === 'Recesso escolar')
    if (!ev) throw new Error('evento')
    const r = apagarEventoNoIntervalo(cal, ev.id, '2026-06-15', '2026-06-15')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const resto = r.calendario.eventos.find((e) => e.id === ev.id)
    expect(resto?.inicio).toBe('2026-06-16')
    expect(resto?.fim).toBe('2026-06-30')
  })

  it('tira o último dia e encolhe o fim', () => {
    const cal = recessoJunho()
    const ev = cal.eventos.find((e) => e.descricao === 'Recesso escolar')
    if (!ev) throw new Error('evento')
    const r = apagarEventoNoIntervalo(cal, ev.id, '2026-06-30', '2026-06-30')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const resto = r.calendario.eventos.find((e) => e.id === ev.id)
    expect(resto?.inicio).toBe('2026-06-15')
    expect(resto?.fim).toBe('2026-06-29')
  })

  it('intervalo de corte cobrindo o evento inteiro apaga o lançamento', () => {
    const cal = recessoJunho()
    const ev = cal.eventos.find((e) => e.descricao === 'Recesso escolar')
    if (!ev) throw new Error('evento')
    const r = apagarEventoNoIntervalo(cal, ev.id, '2026-06-01', '2026-06-30')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.calendario.eventos.some((e) => e.id === ev.id)).toBe(false)
  })
})
