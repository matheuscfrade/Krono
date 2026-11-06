import { describe, expect, it } from 'vitest'
import {
  adicionarPeriodo,
  adicionarTipoDia,
  apagarPeriodo,
  atualizarPeriodo,
  criarCalendario,
  definirParametrosTipo,
  isoDeDataBr,
  legenda,
  parametrosDoTipo,
  tipoDoDia,
  tipoMostraCombina,
  tiposCriadosOrdenados,
  tiposDiaOrdenados,
  tiposPadraoOrdenados,
} from './calendario'

function calendario2026() {
  const criado = criarCalendario({
    nome: 'Cursos Técnicos',
    instituicao: 'IFMG',
    ano: 2026,
  })
  if (!criado.ok) {
    throw new Error('falha ao criar calendário de teste')
  }
  return criado.calendario
}

describe('criarCalendario', () => {
  it('recusa nome vazio', () => {
    const r = criarCalendario({ nome: '  ', instituicao: 'IFMG', ano: 2026 })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.erros).toContainEqual({
        campo: 'nome',
        mensagem: 'Escreva o nome do calendário.',
      })
    }
  })

  it('recusa instituição vazia', () => {
    const r = criarCalendario({ nome: 'Técnicos', instituicao: '', ano: 2026 })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.erros).toContainEqual({
        campo: 'instituicao',
        mensagem: 'Escreva o nome da instituição.',
      })
    }
  })

  it('recusa ano fora da faixa', () => {
    const r = criarCalendario({ nome: 'Técnicos', instituicao: 'IFMG', ano: '18' })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.erros).toContainEqual({
        campo: 'ano',
        mensagem: 'Informe um ano com quatro números, entre 1900 e 2100.',
      })
    }
  })

  it('cria com tipos padrão e sem períodos', () => {
    const cal = calendario2026()
    expect(cal.nome).toBe('Cursos Técnicos')
    expect(cal.instituicao).toBe('IFMG')
    expect(cal.ano).toBe(2026)
    expect(cal.periodos).toEqual([])
    expect(cal.eventos.some((e) => e.chave === 'nacional:natal')).toBe(true)
    expect(cal.tiposDia.map((t) => t.nome)).toEqual([
      'Feriado',
      'Recesso',
      'Férias',
      'Exames finais',
      'Recuperação',
      'Reposição',
      'Sábado letivo',
      'Evento',
    ])
    expect(cal.tiposDia.some((t) => t.nome === 'Ponto facultativo')).toBe(false)
    expect(cal.tiposDia.find((t) => t.id === 'tipo-recesso')?.cor).toBe('#dd6b20')
  })
})

describe('adicionarPeriodo', () => {
  it('recusa nome vazio', () => {
    const r = adicionarPeriodo(calendario2026(), {
      nome: ' ',
      inicio: '2026-02-02',
      fim: '2026-04-30',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.erros).toContainEqual({
        campo: 'nome',
        mensagem: 'Escreva o nome do período.',
      })
    }
  })

  it('recusa data vazia', () => {
    const r = adicionarPeriodo(calendario2026(), {
      nome: '1ª Etapa',
      inicio: '',
      fim: '2026-04-30',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.erros).toContainEqual({
        campo: 'inicio',
        mensagem: 'Informe o início.',
      })
    }
  })

  it('recusa fim antes do início', () => {
    const r = adicionarPeriodo(calendario2026(), {
      nome: '1ª Etapa',
      inicio: '2026-04-30',
      fim: '2026-02-02',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.erros).toContainEqual({
        campo: 'fim',
        mensagem: 'A data final precisa ser no mesmo dia ou depois da inicial.',
      })
    }
  })

  it('recusa data fora do ano', () => {
    const r = adicionarPeriodo(calendario2026(), {
      nome: '1ª Etapa',
      inicio: '2027-01-01',
      fim: '2027-01-10',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.erros[0]?.mensagem).toBe('Use uma data de 2026.')
    }
  })

  it('recusa períodos cruzados', () => {
    const comEtapa = adicionarPeriodo(calendario2026(), {
      nome: '1ª Etapa',
      inicio: '2026-02-02',
      fim: '2026-04-30',
    })
    expect(comEtapa.ok).toBe(true)
    if (!comEtapa.ok) return
    const r = adicionarPeriodo(comEtapa.calendario, {
      nome: '2ª Etapa',
      inicio: '2026-02-02',
      fim: '2026-02-10',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.erros[0]?.mensagem).toBe(
        'Este período cruza com 1ª Etapa (02/02/2026 a 30/04/2026). Ajuste as datas.',
      )
    }
  })

  it('cria tipo Dia letivo — nome', () => {
    const r = adicionarPeriodo(calendario2026(), {
      nome: '1ª Etapa',
      inicio: '2026-02-02',
      fim: '2026-04-30',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.calendario.tiposDia.some((t) => t.nome === 'Dia letivo — 1ª Etapa')).toBe(
      true,
    )
  })
})

describe('tipoDoDia', () => {
  it('segunda-feira dentro do período é letivo; domingo e dia fora não são', () => {
    const r = adicionarPeriodo(calendario2026(), {
      nome: '1ª Etapa',
      inicio: '2026-02-02',
      fim: '2026-04-30',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const cal = r.calendario
    expect(tipoDoDia(cal, '2026-02-02')?.nome).toBe('Dia letivo — 1ª Etapa')
    expect(tipoDoDia(cal, '2026-02-01')).toBeNull()
    expect(tipoDoDia(cal, '2026-05-04')).toBeNull()
  })

  it('sábado dentro do período não é letivo nesta fase', () => {
    const r = adicionarPeriodo(calendario2026(), {
      nome: '1ª Etapa',
      inicio: '2026-02-02',
      fim: '2026-04-30',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(tipoDoDia(r.calendario, '2026-02-07')).toBeNull()
  })
})

describe('legenda e apagar', () => {
  it('sem período a legenda não lista dia letivo', () => {
    expect(legenda(calendario2026()).some((i) => i.nome.startsWith('Dia letivo'))).toBe(
      false,
    )
  })

  it('apagar período tira os dias letivos da legenda', () => {
    const r = adicionarPeriodo(calendario2026(), {
      nome: '1ª Etapa',
      inicio: '2026-02-02',
      fim: '2026-04-30',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(legenda(r.calendario).some((i) => i.nome === 'Dia letivo — 1ª Etapa')).toBe(
      true,
    )
    const sem = apagarPeriodo(r.calendario, r.calendario.periodos[0]!.id)
    expect(legenda(sem).some((i) => i.nome === 'Dia letivo — 1ª Etapa')).toBe(false)
    expect(sem.tiposDia.some((t) => t.nome === 'Dia letivo — 1ª Etapa')).toBe(false)
  })

  it('renomear período atualiza o nome do tipo letivo', () => {
    const r = adicionarPeriodo(calendario2026(), {
      nome: '1ª Etapa',
      inicio: '2026-02-02',
      fim: '2026-04-30',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const id = r.calendario.periodos[0]!.id
    const up = atualizarPeriodo(r.calendario, id, {
      nome: 'Módulo 1',
      inicio: '2026-02-02',
      fim: '2026-04-30',
    })
    expect(up.ok).toBe(true)
    if (!up.ok) return
    expect(up.calendario.periodos[0]!.nome).toBe('Módulo 1')
    expect(tipoDoDia(up.calendario, '2026-02-02')?.nome).toBe('Dia letivo — Módulo 1')
  })
})

describe('tiposDiaOrdenados', () => {
  it('ordena o padrão em pt-BR e deixa os criados depois, também alfabéticos', () => {
    expect(tiposPadraoOrdenados(calendario2026().tiposDia).map((t) => t.nome)).toEqual([
      'Evento',
      'Exames finais',
      'Feriado',
      'Férias',
      'Recesso',
      'Recuperação',
      'Reposição',
      'Sábado letivo',
    ])
    const plantao = adicionarTipoDia(calendario2026(), { nome: 'Plantão', cor: '#123456' })
    expect(plantao.ok).toBe(true)
    if (!plantao.ok) return
    const aula = adicionarTipoDia(plantao.calendario, { nome: 'Aula inaugural', cor: '#654321' })
    expect(aula.ok).toBe(true)
    if (!aula.ok) return
    const etapa = adicionarPeriodo(aula.calendario, {
      nome: '1ª Etapa',
      inicio: '2026-02-02',
      fim: '2026-04-30',
    })
    expect(etapa.ok).toBe(true)
    if (!etapa.ok) return
    expect(tiposCriadosOrdenados(etapa.calendario.tiposDia).map((t) => t.nome)).toEqual([
      'Aula inaugural',
      'Plantão',
    ])
    expect(tiposDiaOrdenados(etapa.calendario.tiposDia).map((t) => t.nome)).toEqual([
      'Dia letivo — 1ª Etapa',
      'Evento',
      'Exames finais',
      'Feriado',
      'Férias',
      'Recesso',
      'Recuperação',
      'Reposição',
      'Sábado letivo',
      'Aula inaugural',
      'Plantão',
    ])
  })
})

describe('tipoMostraCombina', () => {
  it('esconde o rádio em Feriado, Recesso e Férias', () => {
    const cal = calendario2026()
    for (const id of ['tipo-feriado', 'tipo-recesso', 'tipo-ferias']) {
      const tipo = cal.tiposDia.find((t) => t.id === id)
      expect(tipo).toBeDefined()
      if (!tipo) continue
      expect(tipoMostraCombina(tipo)).toBe(false)
      expect(parametrosDoTipo(tipo).combinaComLetivo).toBe(false)
    }
  })

  it('não deixa gravar combina em Férias', () => {
    const cal = definirParametrosTipo(calendario2026(), 'tipo-ferias', { combinaComLetivo: true })
    const ferias = cal.tiposDia.find((t) => t.id === 'tipo-ferias')
    expect(ferias).toBeDefined()
    if (!ferias) return
    expect(parametrosDoTipo(ferias).combinaComLetivo).toBe(false)
    expect(tipoMostraCombina(ferias)).toBe(false)
  })

  it('Evento e Recuperação continuam com o rádio', () => {
    const cal = calendario2026()
    const evento = cal.tiposDia.find((t) => t.id === 'tipo-evento')
    const recuperacao = cal.tiposDia.find((t) => t.id === 'tipo-recuperacao')
    expect(evento && tipoMostraCombina(evento)).toBe(true)
    expect(recuperacao && tipoMostraCombina(recuperacao)).toBe(true)
  })
})

describe('isoDeDataBr', () => {
  it('aceita DD/MM/AAAA e ISO', () => {
    expect(isoDeDataBr('02/02/2026')).toBe('2026-02-02')
    expect(isoDeDataBr('2/2/2026')).toBe('2026-02-02')
    expect(isoDeDataBr('2026-02-02')).toBe('2026-02-02')
  })

  it('recusa data inexistente ou texto solto', () => {
    expect(isoDeDataBr('31/02/2026')).toBeNull()
    expect(isoDeDataBr('02-02-2026')).toBeNull()
    expect(isoDeDataBr('')).toBeNull()
  })
})
