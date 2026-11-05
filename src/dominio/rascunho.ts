import {
  ITENS_CONFERENCIA_PADRAO,
  PALAVRA_ITEM_CONFERENCIA_V1,
  regrasPadrao,
  regrasDo,
  SEMANAS_TEMATICAS_PADRAO,
  TIPO_ITEM_CONFERENCIA_V1,
  type Calendario,
  type RegrasCalendario,
  type RegraUsuario,
  type TipoDia,
} from './calendario'
import { PONTOS_PADRAO } from './feriados'
import { FORMATO_RASCUNHO_ATUAL } from './formato'

function tipoParaArquivo(tipo: TipoDia): TipoDia {
  const copia = { ...tipo } as TipoDia & {
    tiraLetivo?: boolean
    viraAula?: boolean
    contaNosTotais?: boolean
  }
  delete copia.tiraLetivo
  delete copia.viraAula
  delete copia.contaNosTotais
  return copia
}

function migrarTipoDia(bruto: TipoDia): TipoDia {
  const t = bruto as TipoDia & {
    tiraLetivo?: boolean
    viraAula?: boolean
    contaNosTotais?: boolean
  }
  const tiraLetivo = t.tiraLetivo
  const viraAula = t.viraAula
  const resto = tipoParaArquivo(t)
  if (typeof resto.combinaComLetivo === 'boolean') return resto
  if (tiraLetivo === true && viraAula !== true) return { ...resto, combinaComLetivo: false }
  if (tiraLetivo === false || viraAula === true) return { ...resto, combinaComLetivo: true }
  return resto
}

export function serializarCalendario(calendario: Calendario): string {
  const limpo: Calendario = {
    ...calendario,
    formato: FORMATO_RASCUNHO_ATUAL,
    tiposDia: calendario.tiposDia.map(tipoParaArquivo),
  }
  return `${JSON.stringify(limpo, null, 2)}\n`
}

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

function regrasDoFormato1(
  brutoRegras: unknown,
  tiposDia: TipoDia[],
): { regras: RegrasCalendario; tiposDia: TipoDia[] } {
  const raw = ehObjeto(brutoRegras) ? brutoRegras : null
  const itens: Record<string, boolean> = {}
  for (const item of ITENS_CONFERENCIA_PADRAO) itens[item.id] = item.padrao
  if (raw && ehObjeto(raw.itensConferencia)) {
    for (const [id, ligado] of Object.entries(raw.itensConferencia)) {
      if (typeof ligado === 'boolean') itens[id] = ligado
    }
  }
  const semanas: Record<string, boolean> = {}
  for (const semana of SEMANAS_TEMATICAS_PADRAO) semanas[semana.id] = false
  if (raw && ehObjeto(raw.semanasTematicas)) {
    for (const [id, ligado] of Object.entries(raw.semanasTematicas)) {
      if (typeof ligado === 'boolean') semanas[id] = ligado
    }
  }
  const regrasUsuario: RegraUsuario[] = []
  for (const item of ITENS_CONFERENCIA_PADRAO) {
    if (!itens[item.id]) continue
    if (item.id === 'reposicao' || item.id === 'sabados') continue
    const tipoId = TIPO_ITEM_CONFERENCIA_V1[item.id]
    const palavra = PALAVRA_ITEM_CONFERENCIA_V1[item.id]
    regrasUsuario.push({
      id: `migrada-${item.id}`,
      nome: item.nome,
      ligada: true,
      modelo: 'presenca',
      gravidade: 'aviso',
      ...(tipoId ? { tipoId } : {}),
      ...(palavra ? { palavra } : {}),
    })
  }
  for (const semana of SEMANAS_TEMATICAS_PADRAO) {
    if (!semanas[semana.id]) continue
    regrasUsuario.push({
      id: `migrada-${semana.id}`,
      nome: semana.nome,
      ligada: true,
      modelo: 'presenca',
      gravidade: 'aviso',
      palavra: semana.nome,
    })
  }
  return {
    regras: {
      mostrarTotais: raw && typeof raw.mostrarTotais === 'boolean' ? raw.mostrarTotais : true,
      avisoMinimo: raw && typeof raw.avisoMinimo === 'boolean' ? raw.avisoMinimo : true,
      regrasUsuario,
    },
    tiposDia,
  }
}

export function lerRascunho(texto: string): { ok: true; calendario: Calendario } | { ok: false; mensagem: string } {
  let bruto: unknown
  try {
    bruto = JSON.parse(texto)
  } catch {
    return { ok: false, mensagem: 'Este arquivo não é um JSON válido.' }
  }
  if (!ehObjeto(bruto)) {
    return { ok: false, mensagem: 'Este rascunho não tem o formato do Krono.' }
  }
  const formato = bruto.formato
  if (typeof formato !== 'number' || formato < 1) {
    return { ok: false, mensagem: 'Este rascunho não tem número de versão.' }
  }
  if (formato > FORMATO_RASCUNHO_ATUAL) {
    return {
      ok: false,
      mensagem: 'Este rascunho é de uma versão mais nova do Krono. Atualize o aplicativo.',
    }
  }
  if (typeof bruto.nome !== 'string' || typeof bruto.instituicao !== 'string' || typeof bruto.ano !== 'number') {
    return { ok: false, mensagem: 'Faltam nome, instituição ou ano neste rascunho.' }
  }
  if (!Array.isArray(bruto.periodos) || !Array.isArray(bruto.tiposDia) || !Array.isArray(bruto.eventos)) {
    return { ok: false, mensagem: 'Este rascunho está incompleto.' }
  }
  const tiposLidos = bruto.tiposDia as TipoDia[]
  const migrado =
    formato === 1
      ? regrasDoFormato1(bruto.regras, tiposLidos)
      : {
          regras: ehObjeto(bruto.regras)
            ? regrasDo({ regras: bruto.regras as RegrasCalendario } as Calendario)
            : regrasPadrao(),
          tiposDia: tiposLidos,
        }
  const calendario: Calendario = {
    formato: FORMATO_RASCUNHO_ATUAL,
    nome: bruto.nome,
    instituicao: bruto.instituicao,
    ano: bruto.ano,
    periodos: bruto.periodos as Calendario['periodos'],
    tiposDia: migrado.tiposDia.map(migrarTipoDia),
    eventos: bruto.eventos as Calendario['eventos'],
    pontosFacultativos: (bruto.pontosFacultativos ?? PONTOS_PADRAO) as Calendario['pontosFacultativos'],
    chavesExcluidas: Array.isArray(bruto.chavesExcluidas) ? (bruto.chavesExcluidas as string[]) : [],
    minimoDiasLetivos: typeof bruto.minimoDiasLetivos === 'number' ? bruto.minimoDiasLetivos : 200,
    regras: {
      ...migrado.regras,
      regrasUsuario: migrado.regras.regrasUsuario.map((regra) =>
        regra.modelo === 'prazo' && !regra.unidade ? { ...regra, unidade: 'corridos' } : regra,
      ),
    },
  }
  return { ok: true, calendario }
}

export function nomeArquivoRascunho(calendario: Calendario): string {
  const limpo = calendario.nome.replace(/[<>:"/\\|?*]/g, '').trim() || 'calendario'
  return `krono-${limpo}-${calendario.ano}.json`
}
