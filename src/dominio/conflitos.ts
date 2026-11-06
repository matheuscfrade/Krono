import {
  ANCORA_FIM_PERIODO,
  ANCORA_INICIO_PERIODO,
  cadaIsoDoAno,
  diaDaSemanaUtc,
  diaEhLetivo,
  diasDoPrazo,
  ehAncoraPeriodo,
  eventoCobreIso,
  eventoTornaSabadoLetivo,
  formatarDataBr,
  regrasDo,
  rotuloUnidadePrazo,
  TIPO_EVENTO,
  TIPO_REPOSICAO,
  tiposDoDia,
  totalDiasLetivos,
  type Calendario,
  type Evento,
  type Periodo,
  type RegraUsuario,
  type UnidadePrazo,
} from './calendario'
import { TIPO_FERIADO, TIPO_RECESSO } from './feriados'

export type GravidadeConflito = 'erro' | 'aviso'

export type Conflito = {
  id: string
  numero: number
  gravidade: GravidadeConflito
  iso?: string
  mensagem: string
  comoResolver: string
  eventoId?: string
  podeAceitar?: boolean
}

const TIPO_FERIAS = 'tipo-ferias'

function eventosNoDia(calendario: Calendario, iso: string): Evento[] {
  return calendario.eventos.filter((e) => eventoCobreIso(e, iso))
}

function presentePorTipo(calendario: Calendario, tipoId: string): boolean {
  return calendario.eventos.some((e) => e.tipoId === tipoId)
}

function presentePorPalavra(calendario: Calendario, palavra: string): boolean {
  const alvo = palavra.toLowerCase()
  return calendario.eventos.some((e) => e.descricao.toLowerCase().includes(alvo))
}

function nomeDoTipo(calendario: Calendario, tipoId: string): string {
  return calendario.tiposDia.find((t) => t.id === tipoId)?.nome ?? tipoId
}

function isoDaAncoraPeriodo(periodo: Periodo, ancora: string): string {
  return ancora === ANCORA_INICIO_PERIODO ? periodo.inicio : periodo.fim
}

function rotuloAncoraPeriodo(periodo: Periodo, ancora: string): string {
  return ancora === ANCORA_INICIO_PERIODO ? `início de ${periodo.nome}` : `fim de ${periodo.nome}`
}

function origensDaRegra(calendario: Calendario, regra: RegraUsuario): { rotulo: string; iso: string }[] {
  const origem = regra.origem || ANCORA_FIM_PERIODO
  if (ehAncoraPeriodo(origem)) {
    return calendario.periodos.map((p) => ({
      rotulo: rotuloAncoraPeriodo(p, origem),
      iso: isoDaAncoraPeriodo(p, origem),
    }))
  }
  return calendario.eventos
    .filter((e) => e.tipoId === origem)
    .map((e) => ({ rotulo: e.descricao, iso: e.fim }))
}

function destinoApos(
  calendario: Calendario,
  destinoId: string,
  aPartirDe: string,
): { rotulo: string; iso: string } | undefined {
  if (ehAncoraPeriodo(destinoId)) {
    return calendario.periodos
      .map((p) => ({
        rotulo: rotuloAncoraPeriodo(p, destinoId),
        iso: isoDaAncoraPeriodo(p, destinoId),
      }))
      .filter((d) => d.iso >= aPartirDe)
      .sort((a, b) => a.iso.localeCompare(b.iso))[0]
  }
  const evento = calendario.eventos
    .filter((e) => e.tipoId === destinoId && e.inicio >= aPartirDe)
    .sort((a, b) => a.inicio.localeCompare(b.inicio))[0]
  if (!evento) return undefined
  return { rotulo: nomeDoTipo(calendario, evento.tipoId), iso: evento.inicio }
}

function destinoPresenteNoAno(calendario: Calendario, destinoId: string): boolean {
  if (ehAncoraPeriodo(destinoId)) return calendario.periodos.length > 0
  return presentePorTipo(calendario, destinoId)
}

export function conflitosDoCalendario(calendario: Calendario): Conflito[] {
  const lista: Conflito[] = []
  const regras = regrasDo(calendario)
  const dias = cadaIsoDoAno(calendario.ano)

  for (const iso of dias) {
    const noDia = eventosNoDia(calendario, iso)
    const temBloqueio = noDia.some(
      (e) =>
        e.tipoId === TIPO_FERIADO || e.tipoId === TIPO_RECESSO || e.tipoId === TIPO_FERIAS,
    )
    if (temBloqueio) {
      for (const ev of noDia) {
        if (ev.tipoId !== TIPO_EVENTO) continue
        if (ev.aceitosEmFeriado?.includes(iso)) continue
        lista.push({
          id: `1-${ev.id}-${iso}`,
          numero: 1,
          gravidade: 'aviso',
          iso,
          eventoId: ev.id,
          podeAceitar: true,
          mensagem: `${ev.descricao} cai em ${formatarDataBr(iso)}, que é feriado, recesso ou férias.`,
          comoResolver: 'Mova o evento para um dia de aula, apague o lançamento, ou mantenha neste dia se o evento acontece no feriado.',
        })
      }
    }

    const exclusivos = noDia.filter((e) => e.exclusivo)
    if (exclusivos.length >= 2) {
      lista.push({
        id: `2-${iso}`,
        numero: 2,
        gravidade: 'erro',
        iso,
        mensagem: `Dois lançamentos exclusivos no mesmo dia (${formatarDataBr(iso)}).`,
        comoResolver: 'Deixe só um neste dia, ou desmarque a opção exclusivo.',
      })
    }

    for (const ev of noDia) {
      if (ev.tipoId !== TIPO_REPOSICAO) continue
      if (diaEhLetivo(calendario, iso, ev.id)) {
        lista.push({
          id: `5-${ev.id}`,
          numero: 5,
          gravidade: 'aviso',
          iso,
          mensagem:
            'Este dia já é aula. A reposição marca o calendário e não aumenta o total de dias letivos. Para somar um dia, reponha num sábado ou em outro dia que ainda não seja letivo.',
          comoResolver: 'Mantenha a marcação, ou apague e lance a reposição num dia que ainda não é aula.',
        })
      }
      if (!ev.dataOriginal) continue
      const novo = diaDaSemanaUtc(ev.inicio)
      const original = diaDaSemanaUtc(ev.dataOriginal)
      if (novo !== null && novo === original) {
        lista.push({
          id: `6-${ev.id}`,
          numero: 6,
          gravidade: 'aviso',
          iso,
          mensagem: `A reposição de ${formatarDataBr(ev.dataOriginal)} cai no mesmo dia da semana.`,
          comoResolver: 'Prefira outro dia da semana, se a instituição pedir equilíbrio.',
        })
      }
    }

    const wd = diaDaSemanaUtc(iso)
    if (
      (wd === 0 || wd === 6) &&
      diaEhLetivo(calendario, iso) &&
      !noDia.some((e) => eventoTornaSabadoLetivo(e, calendario) || e.tipoId === TIPO_REPOSICAO)
    ) {
      lista.push({
        id: `9-${iso}`,
        numero: 9,
        gravidade: 'aviso',
        iso,
        mensagem: `${formatarDataBr(iso)} é fim de semana marcado como letivo, sem evento nem sábado letivo.`,
        comoResolver: 'Lance um evento neste sábado ou tire a aula deste dia.',
      })
    }
  }

  for (const a of calendario.periodos) {
    for (const b of calendario.periodos) {
      if (a.id >= b.id) continue
      if (a.inicio <= b.fim && b.inicio <= a.fim) {
        const inicioSobreposto = a.inicio > b.inicio ? a.inicio : b.inicio
        lista.push({
          id: `3-${a.id}-${b.id}`,
          numero: 3,
          gravidade: 'erro',
          iso: inicioSobreposto,
          mensagem: `${a.nome} cruza com ${b.nome}.`,
          comoResolver: 'Ajuste o início ou o fim de um dos períodos.',
        })
      }
    }
  }

  const lacunas = dias.filter((iso) => {
    const wd = diaDaSemanaUtc(iso)
    if (wd === null || wd === 0 || wd === 6) return false
    const noPeriodo = calendario.periodos.some((p) => p.inicio <= iso && iso <= p.fim)
    return !noPeriodo && tiposDoDia(calendario, iso).length === 0
  })
  if (lacunas.length > 0) {
    lista.push({
      id: '4-lacuna',
      numero: 4,
      gravidade: 'aviso',
      mensagem: `Há ${lacunas.length} dias úteis no ano sem período (ex.: ${formatarDataBr(lacunas[0]!)}).`,
      comoResolver: 'Inclua esses dias num período, se deveriam ter aula.',
    })
  }

  for (const ev of calendario.eventos) {
    if (ev.inicio.slice(0, 4) !== String(calendario.ano) || ev.fim.slice(0, 4) !== String(calendario.ano)) {
      lista.push({
        id: `8-${ev.id}`,
        numero: 8,
        gravidade: 'erro',
        iso: ev.inicio,
        mensagem: `${ev.descricao} está fora do ano ${calendario.ano}.`,
        comoResolver: 'Use só datas deste ano, ou troque o ano do calendário.',
      })
    }
  }

  const total = totalDiasLetivos(calendario)
  const minimo = calendario.minimoDiasLetivos ?? 200
  if (regras.avisoMinimo && total < minimo) {
    lista.push({
      id: '7-abaixo',
      numero: 7,
      gravidade: 'aviso',
      mensagem: `O ano tem ${total} dias letivos, abaixo do mínimo de ${minimo}.`,
      comoResolver: 'Lance reposição ou sábado letivo, ou altere o mínimo nas regras.',
    })
  }
  if (regras.avisoMinimo && total > minimo) {
    lista.push({
      id: '12-acima',
      numero: 12,
      gravidade: 'aviso',
      mensagem: `O ano tem ${total} dias letivos, acima do mínimo de ${minimo}.`,
      comoResolver: 'Encurte um período ou lance férias/recesso, se quiser chegar ao mínimo.',
    })
  }

  for (const regra of regras.regrasUsuario) {
    if (!regra.ligada) continue
    if (regra.modelo === 'presenca') {
      const temTipo = regra.tipoId ? presentePorTipo(calendario, regra.tipoId) : false
      const temPalavra = regra.palavra ? presentePorPalavra(calendario, regra.palavra) : false
      if (temTipo || temPalavra) continue
      lista.push({
        id: `10-${regra.id}`,
        numero: 10,
        gravidade: regra.gravidade,
        mensagem: `Este calendário não tem ${regra.nome}.`,
        comoResolver: 'Lance o evento, ou apague esta regra.',
      })
      continue
    }
    const destinoId = regra.destinoTipoId
    const minimo = regra.minimoDias
    if (!destinoId || minimo === undefined) continue
    if (!destinoPresenteNoAno(calendario, destinoId)) continue
    const unidade: UnidadePrazo = regra.unidade ?? 'corridos'
    for (const origem of origensDaRegra(calendario, regra)) {
      const destino = destinoApos(calendario, destinoId, origem.iso)
      if (!destino) continue
      const n = diasDoPrazo(calendario, origem.iso, destino.iso, unidade)
      if (n >= minimo) continue
      lista.push({
        id: `10-${regra.id}-${origem.rotulo}-${origem.iso}`,
        numero: 10,
        gravidade: regra.gravidade,
        iso: destino.iso,
        mensagem: `Entre ${origem.rotulo} (${formatarDataBr(origem.iso)}) e ${destino.rotulo} (${formatarDataBr(destino.iso)}) há ${n} ${rotuloUnidadePrazo(n, unidade)}. A regra pede pelo menos ${minimo}.`,
        comoResolver: 'Afaste as datas ou altere o mínimo da regra.',
      })
    }
  }

  lista.sort((a, b) => a.numero - b.numero || (a.iso ?? '').localeCompare(b.iso ?? ''))
  return lista
}

export function conflitosDoDia(calendario: Calendario, iso: string): Conflito[] {
  return conflitosDoCalendario(calendario).filter((c) => c.iso === iso)
}

export function aceitarAvisoEventoNoDia(
  calendario: Calendario,
  eventoId: string,
  iso: string,
): Calendario {
  return {
    ...calendario,
    eventos: calendario.eventos.map((ev) => {
      if (ev.id !== eventoId) return ev
      if (!eventoCobreIso(ev, iso)) return ev
      if (ev.aceitosEmFeriado?.includes(iso)) return ev
      const aceitos = [...(ev.aceitosEmFeriado ?? []), iso].sort()
      return { ...ev, aceitosEmFeriado: aceitos }
    }),
  }
}
