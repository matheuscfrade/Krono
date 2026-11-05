import { describe, expect, it } from 'vitest'
import { ajudaPintura } from './ajudaPintura'
import {
  adicionarEvento,
  adicionarFeriadoManual,
  adicionarPeriodo,
  apagarEvento,
  aulasARepor,
  criarCalendario,
  excessoDiasLetivos,
  pinturaDoDia,
  retirarLetivo,
  totalDiasLetivos,
} from './calendario'
import { conflitosDoCalendario } from './conflitos'

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

describe('aulasARepor', () => {
  it('só aula perdida no período; 01/01 e recesso fora da etapa ficam de fora', () => {
    const cal = comEtapa()
    const lista = aulasARepor(cal)
    const datas = lista.map((a) => a.dataOriginal)
    expect(lista.find((a) => a.dataOriginal === '2026-04-03')?.descricao).toBe(
      'Sexta-feira Santa',
    )
    expect(lista.find((a) => a.dataOriginal === '2026-04-03')?.eventoId).toBeTruthy()
    expect(datas).not.toContain('2026-01-01')
    const comRecesso = adicionarFeriadoManual(cal, {
      descricao: 'Recesso escolar',
      inicio: '2026-06-15',
      fim: '2026-06-30',
      tipo: 'recesso',
    })
    if (!comRecesso.ok) throw new Error('recesso')
    const depois = aulasARepor(comRecesso.calendario).map((a) => a.dataOriginal)
    expect(depois).not.toContain('2026-06-16')
    expect(depois).not.toContain('2026-06-15')
  })

  it('recesso em intervalo entra cada dia útil do período', () => {
    const jun = adicionarPeriodo(comEtapa(), {
      nome: '2ª Etapa',
      inicio: '2026-06-01',
      fim: '2026-07-31',
    })
    if (!jun.ok) throw new Error('periodo')
    const comRecesso = adicionarFeriadoManual(jun.calendario, {
      descricao: 'Recesso escolar',
      inicio: '2026-06-15',
      fim: '2026-06-30',
      tipo: 'recesso',
    })
    if (!comRecesso.ok) throw new Error('recesso')
    const datas = aulasARepor(comRecesso.calendario).map((a) => a.dataOriginal)
    expect(datas).toContain('2026-06-15')
    expect(datas).not.toContain('2026-06-20')
    expect(datas).not.toContain('2026-06-21')
  })

  it('lista vazia se o total já passa do mínimo', () => {
    const cal = { ...comEtapa(), minimoDiasLetivos: 10 }
    expect(totalDiasLetivos(cal)).toBeGreaterThan(10)
    expect(aulasARepor(cal)).toEqual([])
  })

  it('sem período não pede reposição', () => {
    expect(aulasARepor(cal2026())).toEqual([])
  })

  it('sábado só entra com sábado letivo', () => {
    const fer = adicionarFeriadoManual(comEtapa(), {
      descricao: 'Feriado no sábado',
      inicio: '2026-04-04',
      fim: '2026-04-04',
      tipo: 'feriado',
    })
    if (!fer.ok) throw new Error('feriado')
    expect(aulasARepor(fer.calendario).some((a) => a.dataOriginal === '2026-04-04')).toBe(
      false,
    )
    const sab = adicionarEvento(fer.calendario, {
      tipoId: 'tipo-sabado-letivo',
      descricao: 'Sábado letivo',
      inicio: '2026-04-04',
      fim: '2026-04-04',
    })
    expect(sab.ok).toBe(true)
    if (!sab.ok) return
    expect(aulasARepor(sab.calendario).some((a) => a.dataOriginal === '2026-04-04')).toBe(
      true,
    )
  })

  it('evento no sábado também pede reposição se o feriado cair nesse dia', () => {
    const fer = adicionarFeriadoManual(comEtapa(), {
      descricao: 'Feriado no sábado',
      inicio: '2026-04-04',
      fim: '2026-04-04',
      tipo: 'feriado',
    })
    if (!fer.ok) throw new Error('feriado')
    const ev = adicionarEvento(fer.calendario, {
      tipoId: 'tipo-evento',
      descricao: 'Plantão pedagógico',
      inicio: '2026-04-04',
      fim: '2026-04-04',
    })
    expect(ev.ok).toBe(true)
    if (!ev.ok) return
    expect(aulasARepor(ev.calendario).some((a) => a.dataOriginal === '2026-04-04')).toBe(
      true,
    )
  })
})

describe('adicionarEvento reposição', () => {
  it('sábado 11/04 pinta etapa + marca e some da lista a repor', () => {
    const r = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-reposicao',
      descricao: '',
      inicio: '2026-04-11',
      fim: '2026-04-11',
      dataOriginal: '2026-04-03',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const p = pinturaDoDia(r.calendario, '2026-04-11')
    expect(p.fundo?.nome).toBe('Dia letivo — 1ª Etapa')
    expect(p.marcas.map((m) => m.tipo.nome)).toEqual(['Reposição'])
    expect(aulasARepor(r.calendario).some((a) => a.dataOriginal === '2026-04-03')).toBe(
      false,
    )
    expect(totalDiasLetivos(r.calendario)).toBeGreaterThan(totalDiasLetivos(comEtapa()))
    expect(r.avisos?.some((a) => a.mensagem.includes('já é aula'))).toBeFalsy()
    expect(conflitosDoCalendario(r.calendario).some((c) => c.numero === 5)).toBe(false)
  })

  it('sem original, domingo e feriado recusam', () => {
    const base = comEtapa()
    const sem = adicionarEvento(base, {
      tipoId: 'tipo-reposicao',
      descricao: 'Reposição',
      inicio: '2026-04-11',
      fim: '2026-04-11',
    })
    expect(sem.ok).toBe(false)
    if (!sem.ok) expect(sem.erros[0]?.mensagem).toBe('Informe a data da aula original.')

    const dom = adicionarEvento(base, {
      tipoId: 'tipo-reposicao',
      descricao: 'Reposição',
      inicio: '2026-04-12',
      fim: '2026-04-12',
      dataOriginal: '2026-04-03',
    })
    expect(dom.ok).toBe(false)
    if (!dom.ok) expect(dom.erros[0]?.mensagem).toBe('Reposição não pode cair no domingo.')

    const fer = adicionarEvento(base, {
      tipoId: 'tipo-reposicao',
      descricao: 'Reposição',
      inicio: '2026-04-21',
      fim: '2026-04-21',
      dataOriginal: '2026-04-03',
    })
    expect(fer.ok).toBe(false)
    if (!fer.ok) {
      expect(fer.erros[0]?.mensagem).toBe('Reposição não pode cair em feriado ou recesso.')
    }

    const rec = adicionarEvento(base, {
      tipoId: 'tipo-reposicao',
      descricao: 'Reposição',
      inicio: '2026-02-16',
      fim: '2026-02-16',
      dataOriginal: '2026-04-03',
    })
    expect(rec.ok).toBe(false)
    if (!rec.ok) {
      expect(rec.erros[0]?.mensagem).toBe('Reposição não pode cair em feriado ou recesso.')
    }
  })

  it('dia que já é letivo salva com aviso e não aumenta o total', () => {
    const base = comEtapa()
    const totalAntes = totalDiasLetivos(base)
    const r = adicionarEvento(base, {
      tipoId: 'tipo-reposicao',
      descricao: 'Reposição',
      inicio: '2026-04-14',
      fim: '2026-04-14',
      dataOriginal: '2026-04-03',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.avisos?.[0]?.mensagem).toContain('já é aula')
    expect(r.avisos?.[0]?.mensagem).toContain('não aumenta o total')
    expect(totalDiasLetivos(r.calendario)).toBe(totalAntes)
    expect(pinturaDoDia(r.calendario, '2026-04-14').fundo?.nome).toBe('Dia letivo — 1ª Etapa')
    expect(pinturaDoDia(r.calendario, '2026-04-14').marcas.map((m) => m.tipo.nome)).toEqual([
      'Reposição',
    ])
    const aviso = conflitosDoCalendario(r.calendario).find((c) => c.numero === 5)
    expect(aviso?.gravidade).toBe('aviso')
    expect(aviso?.iso).toBe('2026-04-14')
    expect(aviso?.mensagem).toContain('já é aula')
  })

  it('mesmo dia da semana fora do período salva com aviso e pinta letivo + marca', () => {
    const r = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-reposicao',
      descricao: 'Reposição',
      inicio: '2026-05-08',
      fim: '2026-05-08',
      dataOriginal: '2026-04-03',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.avisos?.[0]?.mensagem).toBe(
      'Esta reposição cai no mesmo dia da semana da aula original.',
    )
    const p = pinturaDoDia(r.calendario, '2026-05-08')
    expect(p.fundo?.nome).toBe('Dia letivo — 1ª Etapa')
    expect(p.marcas.map((m) => m.tipo.nome)).toEqual(['Reposição'])
  })

  it('segunda da mesma original ou do mesmo dia recusa', () => {
    const primeiro = adicionarEvento(comEtapa(), {
      tipoId: 'tipo-reposicao',
      descricao: 'Reposição',
      inicio: '2026-04-11',
      fim: '2026-04-11',
      dataOriginal: '2026-04-03',
    })
    expect(primeiro.ok).toBe(true)
    if (!primeiro.ok) return
    const mesmaOrig = adicionarEvento(primeiro.calendario, {
      tipoId: 'tipo-reposicao',
      descricao: 'Outra',
      inicio: '2026-04-18',
      fim: '2026-04-18',
      dataOriginal: '2026-04-03',
    })
    expect(mesmaOrig.ok).toBe(false)
    if (!mesmaOrig.ok) {
      expect(mesmaOrig.erros[0]?.mensagem).toContain('já foi reposta')
    }
    const mesmoDia = adicionarEvento(primeiro.calendario, {
      tipoId: 'tipo-reposicao',
      descricao: 'Outra',
      inicio: '2026-04-11',
      fim: '2026-04-11',
      dataOriginal: '2026-01-01',
    })
    expect(mesmoDia.ok).toBe(false)
    if (!mesmoDia.ok) {
      expect(mesmoDia.erros[0]?.mensagem).toContain('Já existe')
    }
  })
})

describe('ajudaPintura reposição', () => {
  it('fundo letivo e marca', () => {
    expect(ajudaPintura('tipo-reposicao')?.fundo).toBe('letivo')
    expect(ajudaPintura('tipo-reposicao')?.marca).toBe(true)
  })
})

describe('retirarLetivo', () => {
  it('tira o azul, reduz total e excesso', () => {
    const base = { ...comEtapa(), minimoDiasLetivos: 10 }
    const totalAntes = totalDiasLetivos(base)
    expect(excessoDiasLetivos(base)).toBeGreaterThan(0)
    const r = retirarLetivo(base, '2026-02-03')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const p = pinturaDoDia(r.calendario, '2026-02-03')
    expect(p.fundo).toBeNull()
    expect(p.marcas).toEqual([])
    expect(totalDiasLetivos(r.calendario)).toBe(totalAntes - 1)
    expect(excessoDiasLetivos(r.calendario)).toBe(excessoDiasLetivos(base) - 1)
  })

  it('feriado recusa; apagar a retirada devolve o azul', () => {
    const base = comEtapa()
    const fer = retirarLetivo(base, '2026-01-01')
    expect(fer.ok).toBe(false)
    if (!fer.ok) expect(fer.erros[0]?.mensagem).toBe('Este dia já não é letivo.')

    const r = retirarLetivo(base, '2026-02-03')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const ev = r.calendario.eventos.find((e) => e.tipoId === 'tipo-retirada-letivo')
    if (!ev) throw new Error('retirada')
    const devolta = apagarEvento(r.calendario, ev.id)
    expect(pinturaDoDia(devolta, '2026-02-03').fundo?.nome).toBe('Dia letivo — 1ª Etapa')
  })
})
