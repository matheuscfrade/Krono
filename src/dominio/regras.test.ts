import { describe, expect, it } from 'vitest'
import {
  adicionarEvento,
  adicionarFeriadoManual,
  adicionarPeriodo,
  adicionarRegraUsuario,
  adicionarTipoDia,
  apagarTipoDia,
  criarCalendario,
  tipoPodeApagar,
  definirParametrosTipo,
  diaContaComoLetivo,
  diaEhLetivo,
  pinturaDoDia,
  regrasPadrao,
  tiposParaPrazo,
} from './calendario'
import { conflitosDoCalendario } from './conflitos'
import { lerRascunho, serializarCalendario } from './rascunho'

function cal2026() {
  const r = criarCalendario({ nome: 'Cursos Técnicos', instituicao: 'Escola', ano: 2026 })
  if (!r.ok) throw new Error('criar')
  return r.calendario
}

function comEtapa(fim = '2026-04-30') {
  const p = adicionarPeriodo(cal2026(), {
    nome: '1ª Etapa',
    inicio: '2026-02-02',
    fim,
  })
  if (!p.ok) throw new Error('periodo')
  return p.calendario
}

describe('regras parametrizáveis', () => {
  it('calendário novo nasce sem regras da pessoa', () => {
    expect(regrasPadrao().regrasUsuario).toEqual([])
    expect(cal2026().regras.regrasUsuario).toEqual([])
  })

  it('prazo lista só exames no padrão; outros tipos entram se ligar o interruptor', () => {
    const ids = tiposParaPrazo(cal2026()).map((t) => t.id)
    expect(ids).toEqual(['tipo-exames'])
    expect(ids).not.toContain('tipo-ferias')
    expect(ids).not.toContain('tipo-recuperacao')
    expect(ids).not.toContain('tipo-feriado')
    expect(ids).not.toContain('tipo-recesso')
    expect(ids).not.toContain('tipo-evento')
    expect(ids).not.toContain('tipo-reposicao')
    expect(ids).not.toContain('tipo-sabado-letivo')
    expect(ids).not.toContain('tipo-retirada-letivo')
    const criado = adicionarTipoDia(cal2026(), { nome: 'Matrícula', cor: '#38a169' })
    expect(criado.ok).toBe(true)
    if (!criado.ok) return
    expect(tiposParaPrazo(criado.calendario).some((t) => t.nome === 'Matrícula')).toBe(false)
    const tipoId = criado.calendario.tiposDia.find((t) => t.nome === 'Matrícula')?.id
    if (!tipoId) throw new Error('tipo')
    const comMatricula = definirParametrosTipo(criado.calendario, tipoId, { entraNoPrazo: true })
    expect(tiposParaPrazo(comMatricula).some((t) => t.nome === 'Matrícula')).toBe(true)
    expect(tiposParaPrazo(cal2026(), ['tipo-feriado']).some((t) => t.id === 'tipo-feriado')).toBe(true)
    const comFeriado = definirParametrosTipo(cal2026(), 'tipo-feriado', { entraNoPrazo: true })
    expect(tiposParaPrazo(comFeriado).some((t) => t.id === 'tipo-feriado')).toBe(true)
    const semExames = definirParametrosTipo(cal2026(), 'tipo-exames', { entraNoPrazo: false })
    expect(tiposParaPrazo(semExames).some((t) => t.id === 'tipo-exames')).toBe(false)
  })

  it('apaga tipo criado e recusa tipo padrão ou em uso', () => {
    const criado = adicionarTipoDia(cal2026(), { nome: 'Matrícula', cor: '#38a169' })
    expect(criado.ok).toBe(true)
    if (!criado.ok) return
    const tipoId = criado.calendario.tiposDia.find((t) => t.nome === 'Matrícula')?.id
    if (!tipoId) throw new Error('tipo')
    const padrao = apagarTipoDia(criado.calendario, 'tipo-feriado')
    expect(padrao.ok).toBe(false)
    expect(tipoPodeApagar(criado.calendario.tiposDia.find((t) => t.id === 'tipo-feriado')!)).toBe(
      false,
    )
    const limpo = apagarTipoDia(criado.calendario, tipoId)
    expect(limpo.ok).toBe(true)
    if (!limpo.ok) return
    expect(limpo.calendario.tiposDia.some((t) => t.id === tipoId)).toBe(false)
    const comEvento = adicionarEvento(criado.calendario, {
      tipoId,
      descricao: 'Matrícula',
      inicio: '2026-02-02',
      fim: '2026-02-02',
    })
    expect(comEvento.ok).toBe(true)
    if (!comEvento.ok) return
    const emUso = apagarTipoDia(comEvento.calendario, tipoId)
    expect(emUso.ok).toBe(false)
    if (!emUso.ok) expect(emUso.erros[0]?.mensagem).toContain('lançamento')
  })

  it('apaga Férias, Exames, Recuperação e Sábado letivo se não estiverem em uso', () => {
    const cal = cal2026()
    for (const id of ['tipo-ferias', 'tipo-exames', 'tipo-recuperacao', 'tipo-sabado-letivo']) {
      const tipo = cal.tiposDia.find((t) => t.id === id)
      expect(tipoPodeApagar(tipo!)).toBe(true)
      const r = apagarTipoDia(cal, id)
      expect(r.ok).toBe(true)
      if (!r.ok) return
      expect(r.calendario.tiposDia.some((t) => t.id === id)).toBe(false)
    }
    for (const id of ['tipo-feriado', 'tipo-recesso', 'tipo-reposicao', 'tipo-evento']) {
      expect(apagarTipoDia(cal, id).ok).toBe(false)
    }
    const comFerias = adicionarEvento(cal, {
      tipoId: 'tipo-ferias',
      descricao: 'Férias docentes',
      inicio: '2026-07-01',
      fim: '2026-07-15',
    })
    expect(comFerias.ok).toBe(true)
    if (!comFerias.ok) return
    expect(apagarTipoDia(comFerias.calendario, 'tipo-ferias').ok).toBe(false)
  })

  it('feriado tira a aula; evento na terça da etapa combina e mantém aula', () => {
    const etapa = comEtapa()
    expect(diaEhLetivo(etapa, '2026-03-10')).toBe(true)
    expect(diaContaComoLetivo(etapa, '2026-03-10')).toBe(true)
    const feriado = adicionarFeriadoManual(etapa, {
      descricao: 'Municipal',
      inicio: '2026-03-10',
      tipo: 'feriado',
    })
    expect(feriado.ok).toBe(true)
    if (!feriado.ok) return
    expect(diaEhLetivo(feriado.calendario, '2026-03-10')).toBe(false)
    expect(diaContaComoLetivo(feriado.calendario, '2026-03-10')).toBe(false)
    const evento = adicionarEvento(etapa, {
      tipoId: 'tipo-evento',
      descricao: 'Acolhimento',
      inicio: '2026-03-10',
      fim: '2026-03-10',
    })
    expect(evento.ok).toBe(true)
    if (!evento.ok) return
    expect(diaEhLetivo(evento.calendario, '2026-03-10')).toBe(true)
    expect(diaContaComoLetivo(evento.calendario, '2026-03-10')).toBe(true)
    const p = pinturaDoDia(evento.calendario, '2026-03-10')
    expect(p.fundo?.nome.startsWith('Dia letivo')).toBe(true)
    expect(p.marcas.some((m) => m.tipo.id === 'tipo-evento')).toBe(true)
  })

  it('recuperação que combina mantém aula na etapa e não inventa aula fora', () => {
    const base = adicionarPeriodo(cal2026(), {
      nome: '1ª Etapa',
      inicio: '2026-02-11',
      fim: '2026-05-10',
    })
    if (!base.ok) throw new Error('periodo')
    const naEtapa = adicionarEvento(base.calendario, {
      tipoId: 'tipo-recuperacao',
      descricao: 'Recuperação',
      inicio: '2026-05-08',
      fim: '2026-05-08',
    })
    expect(naEtapa.ok).toBe(true)
    if (!naEtapa.ok) return
    expect(diaEhLetivo(naEtapa.calendario, '2026-05-08')).toBe(false)
    const combina = definirParametrosTipo(naEtapa.calendario, 'tipo-recuperacao', {
      combinaComLetivo: true,
    })
    expect(diaEhLetivo(combina, '2026-05-08')).toBe(true)
    expect(diaContaComoLetivo(combina, '2026-05-08')).toBe(true)
    const p = pinturaDoDia(combina, '2026-05-08')
    expect(p.fundo?.nome.startsWith('Dia letivo')).toBe(true)
    expect(p.marcas.some((m) => m.tipo.id === 'tipo-recuperacao')).toBe(true)
    const fora = adicionarEvento(base.calendario, {
      tipoId: 'tipo-recuperacao',
      descricao: 'Recuperação',
      inicio: '2026-05-11',
      fim: '2026-05-11',
    })
    expect(fora.ok).toBe(true)
    if (!fora.ok) return
    const combinaFora = definirParametrosTipo(fora.calendario, 'tipo-recuperacao', {
      combinaComLetivo: true,
    })
    expect(diaEhLetivo(combinaFora, '2026-05-11')).toBe(false)
    expect(diaContaComoLetivo(combinaFora, '2026-05-11')).toBe(false)
  })

  it('prazo entre fim do período e exames', () => {
    const etapa = adicionarPeriodo(cal2026(), {
      nome: '3ª Etapa',
      inicio: '2026-09-01',
      fim: '2026-12-15',
    })
    if (!etapa.ok) throw new Error('periodo')
    const exames = adicionarEvento(etapa.calendario, {
      tipoId: 'tipo-exames',
      descricao: 'Exames finais',
      inicio: '2026-12-16',
      fim: '2026-12-16',
    })
    if (!exames.ok) throw new Error('exames')
    const comRegra = adicionarRegraUsuario(exames.calendario, {
      nome: 'Prazo até as provas',
      modelo: 'prazo',
      origem: 'fim-periodo',
      destinoTipoId: 'tipo-exames',
      minimoDias: 3,
    })
    expect(comRegra.ok).toBe(true)
    if (!comRegra.ok) return
    expect(conflitosDoCalendario(comRegra.calendario).some((c) => c.numero === 10 && c.mensagem.includes('pelo menos 3'))).toBe(
      true,
    )
    const ok = adicionarEvento(etapa.calendario, {
      tipoId: 'tipo-exames',
      descricao: 'Exames finais',
      inicio: '2026-12-18',
      fim: '2026-12-18',
    })
    if (!ok.ok) throw new Error('exames18')
    const comFolga = adicionarRegraUsuario(ok.calendario, {
      nome: 'Prazo até as provas',
      modelo: 'prazo',
      origem: 'fim-periodo',
      destinoTipoId: 'tipo-exames',
      minimoDias: 3,
    })
    expect(comFolga.ok).toBe(true)
    if (!comFolga.ok) return
    expect(conflitosDoCalendario(comFolga.calendario).some((c) => c.mensagem.includes('pelo menos 3'))).toBe(
      false,
    )
  })

  it('prazo de 2 dias úteis entre fim do período e exames (Art. 129 § 1º)', () => {
    const etapa = adicionarPeriodo(cal2026(), {
      nome: '3ª Etapa',
      inicio: '2026-09-01',
      fim: '2026-12-18',
    })
    if (!etapa.ok) throw new Error('periodo')
    const examesCedo = adicionarEvento(etapa.calendario, {
      tipoId: 'tipo-exames',
      descricao: 'Exames finais',
      inicio: '2026-12-21',
      fim: '2026-12-21',
    })
    if (!examesCedo.ok) throw new Error('exames21')
    const cedo = adicionarRegraUsuario(examesCedo.calendario, {
      nome: 'Prazo do exame final',
      modelo: 'prazo',
      origem: 'fim-periodo',
      destinoTipoId: 'tipo-exames',
      minimoDias: 2,
      unidade: 'uteis',
    })
    expect(cedo.ok).toBe(true)
    if (!cedo.ok) return
    expect(
      conflitosDoCalendario(cedo.calendario).some(
        (c) => c.numero === 10 && c.mensagem.includes('útil') && c.mensagem.includes('pelo menos 2'),
      ),
    ).toBe(true)
    const examesOk = adicionarEvento(etapa.calendario, {
      tipoId: 'tipo-exames',
      descricao: 'Exames finais',
      inicio: '2026-12-22',
      fim: '2026-12-22',
    })
    if (!examesOk.ok) throw new Error('exames22')
    const folga = adicionarRegraUsuario(examesOk.calendario, {
      nome: 'Prazo do exame final',
      modelo: 'prazo',
      origem: 'fim-periodo',
      destinoTipoId: 'tipo-exames',
      minimoDias: 2,
      unidade: 'uteis',
    })
    expect(folga.ok).toBe(true)
    if (!folga.ok) return
    expect(conflitosDoCalendario(folga.calendario).some((c) => c.mensagem.includes('pelo menos 2'))).toBe(
      false,
    )
  })

  it('precisa existir férias avisa e some quando lança', () => {
    const comRegra = adicionarRegraUsuario(comEtapa(), {
      nome: 'Férias docentes',
      modelo: 'presenca',
      tipoId: 'tipo-ferias',
    })
    expect(comRegra.ok).toBe(true)
    if (!comRegra.ok) return
    expect(conflitosDoCalendario(comRegra.calendario).some((c) => c.mensagem.includes('Férias docentes'))).toBe(
      true,
    )
    const ferias = adicionarEvento(comRegra.calendario, {
      tipoId: 'tipo-ferias',
      descricao: 'Férias',
      inicio: '2026-07-01',
      fim: '2026-07-31',
    })
    expect(ferias.ok).toBe(true)
    if (!ferias.ok) return
    expect(conflitosDoCalendario(ferias.calendario).some((c) => c.mensagem.includes('Férias docentes'))).toBe(
      false,
    )
  })
})

describe('migração do rascunho v1', () => {
  it('item de conferência ligado vira regra precisa existir; arquivo sai v2', () => {
    const r = criarCalendario({ nome: 'Cursos Técnicos', instituicao: 'Escola', ano: 2026 })
    if (!r.ok) throw new Error('criar')
    const v1 = {
      ...r.calendario,
      formato: 1,
      regras: {
        examesForaDaConta: true,
        mostrarTotais: true,
        avisoMinimo: true,
        itensConferencia: { exames: true, ferias: false },
        semanasTematicas: {},
      },
    }
    const aberto = lerRascunho(JSON.stringify(v1))
    expect(aberto.ok).toBe(true)
    if (!aberto.ok) return
    expect(aberto.calendario.formato).toBe(5)
    const exames = aberto.calendario.regras.regrasUsuario.find((regra) => regra.tipoId === 'tipo-exames')
    expect(exames?.modelo).toBe('presenca')
    expect(exames?.nome).toContain('Exames')
    expect(aberto.calendario.regras.regrasUsuario.some((regra) => regra.tipoId === 'tipo-ferias')).toBe(
      false,
    )
    const salvo = JSON.parse(serializarCalendario(aberto.calendario)) as { formato: number }
    expect(salvo.formato).toBe(5)
  })
})

describe('migração do rascunho v2', () => {
  it('prazo sem unidade vira dias corridos e o arquivo sai v3', () => {
    const r = criarCalendario({ nome: 'Cursos Técnicos', instituicao: 'Escola', ano: 2026 })
    if (!r.ok) throw new Error('criar')
    const v2 = {
      ...r.calendario,
      formato: 2,
      regras: {
        mostrarTotais: true,
        avisoMinimo: true,
        regrasUsuario: [
          {
            id: 'regra-prazo',
            nome: 'Prazo até as provas',
            ligada: true,
            modelo: 'prazo' as const,
            origem: 'fim-periodo',
            destinoTipoId: 'tipo-exames',
            minimoDias: 3,
            gravidade: 'aviso' as const,
          },
        ],
      },
    }
    const aberto = lerRascunho(JSON.stringify(v2))
    expect(aberto.ok).toBe(true)
    if (!aberto.ok) return
    expect(aberto.calendario.formato).toBe(5)
    expect(aberto.calendario.regras.regrasUsuario[0]?.unidade).toBe('corridos')
  })
})

describe('migração do rascunho v3', () => {
  it('tiraLetivo e viraAula viram combinaComLetivo e o arquivo sai v4', () => {
    const r = criarCalendario({ nome: 'Cursos Técnicos', instituicao: 'Escola', ano: 2026 })
    if (!r.ok) throw new Error('criar')
    const tipos = r.calendario.tiposDia.map((t) => {
      if (t.id === 'tipo-feriado') return { ...t, tiraLetivo: true, viraAula: false, contaNosTotais: false }
      if (t.id === 'tipo-evento') return { ...t, tiraLetivo: false, viraAula: false, contaNosTotais: true }
      if (t.id === 'tipo-recuperacao') return { ...t, tiraLetivo: true, viraAula: true, contaNosTotais: true }
      return t
    })
    const v3 = { ...r.calendario, formato: 3, tiposDia: tipos }
    const aberto = lerRascunho(JSON.stringify(v3))
    expect(aberto.ok).toBe(true)
    if (!aberto.ok) return
    expect(aberto.calendario.formato).toBe(5)
    const feriado = aberto.calendario.tiposDia.find((t) => t.id === 'tipo-feriado')
    const evento = aberto.calendario.tiposDia.find((t) => t.id === 'tipo-evento')
    const rec = aberto.calendario.tiposDia.find((t) => t.id === 'tipo-recuperacao')
    expect(feriado?.combinaComLetivo).toBe(false)
    expect(evento?.combinaComLetivo).toBe(true)
    expect(rec?.combinaComLetivo).toBe(true)
    expect(feriado && 'tiraLetivo' in feriado).toBe(false)
    expect(feriado && 'viraAula' in feriado).toBe(false)
    const salvo = JSON.parse(serializarCalendario(aberto.calendario)) as {
      formato: number
      tiposDia: { id: string; tiraLetivo?: boolean; viraAula?: boolean }[]
    }
    expect(salvo.formato).toBe(5)
    expect(salvo.tiposDia.some((t) => 'tiraLetivo' in t || 'viraAula' in t)).toBe(false)
  })
})

describe('migração do rascunho v4', () => {
  it('contaNosTotais some e o arquivo sai v5', () => {
    const r = criarCalendario({ nome: 'Cursos Técnicos', instituicao: 'Escola', ano: 2026 })
    if (!r.ok) throw new Error('criar')
    const tipos = r.calendario.tiposDia.map((t) =>
      t.id === 'tipo-recuperacao'
        ? { ...t, combinaComLetivo: true, contaNosTotais: false }
        : { ...t, contaNosTotais: true },
    )
    const v4 = { ...r.calendario, formato: 4, tiposDia: tipos }
    const aberto = lerRascunho(JSON.stringify(v4))
    expect(aberto.ok).toBe(true)
    if (!aberto.ok) return
    expect(aberto.calendario.formato).toBe(5)
    const rec = aberto.calendario.tiposDia.find((t) => t.id === 'tipo-recuperacao')
    expect(rec?.combinaComLetivo).toBe(true)
    expect(rec && 'contaNosTotais' in rec).toBe(false)
    const salvo = JSON.parse(serializarCalendario(aberto.calendario)) as {
      formato: number
      tiposDia: { contaNosTotais?: boolean }[]
    }
    expect(salvo.formato).toBe(5)
    expect(salvo.tiposDia.some((t) => 'contaNosTotais' in t)).toBe(false)
  })
})
